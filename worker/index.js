const json = (data, init = {}) => new Response(JSON.stringify(data), {
  ...init,
  headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) },
});

const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_SAMPLES = 90 * 24 * 12; // Five-minute samples for 90 days.

const readHistory = async (env, key) => {
  if (!env.STATUS_KV) return [];
  return (await env.STATUS_KV.get(`history:${key}`, 'json')) || [];
};

const checkUrl = async (url, timeoutMs = 8000) => {
  if (!url) return { configured: false, up: null, responseTimeMs: null };
  const started = Date.now();
  try {
    const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(timeoutMs) });
    return { configured: true, up: response.ok, responseTimeMs: Date.now() - started, httpStatus: response.status };
  } catch {
    return { configured: true, up: false, responseTimeMs: Date.now() - started, httpStatus: null };
  }
};

const queueCountFromPlayers = (players = []) => {
  for (const player of players) {
    const name = typeof player === 'string' ? player : player.name_clean || player.name_raw || player.name || '';
    const match = name.replace(/§[0-9a-fk-or]/gi, '').match(/^Queue:\s*(\d+)$/i);
    if (match) return Number(match[1]);
  }
  return null;
};

const checkMinecraftProvider = async (url, source, parse) => {
  const started = Date.now();
  const response = await fetch(url, { signal: AbortSignal.timeout(7000) });
  if (!response.ok) throw new Error(`${source} returned ${response.status}`);
  const data = await response.json();
  const status = parse(data);
  if (typeof status.up !== 'boolean') throw new Error(`${source} returned no status`);
  return { ...status, source, responseTimeMs: Date.now() - started };
};

const checkMinecraft = async () => {
  const results = await Promise.allSettled([
    checkMinecraftProvider('https://api.mcstatus.io/v2/status/java/2b2t-th.org', 'mcstatus.io', (data) => ({
      up: data.online,
      players: data.online ? Number(data.players?.online || 0) : 0,
      maxPlayers: data.players?.max == null ? null : Number(data.players.max),
      queuePlayers: data.online ? queueCountFromPlayers(data.players?.list) : null,
      version: data.version?.name_clean || null,
    })),
    checkMinecraftProvider('https://api.mcsrvstat.us/3/2b2t-th.org', 'mcsrvstat.us', (data) => ({
      up: data.online,
      players: data.online ? Number(data.players?.online || 0) : 0,
      maxPlayers: data.players?.max == null ? null : Number(data.players.max),
      queuePlayers: data.online ? queueCountFromPlayers(data.players?.list) : null,
      version: data.version || null,
    })),
  ]);
  const checks = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
  if (!checks.length) return { configured: true, up: null, players: null, maxPlayers: null, queuePlayers: null, responseTimeMs: null };
  return checks.find((check) => check.up) || checks[0];
};

const toStatus = (service) => {
  if (service.configured === false) return 'not_configured';
  if (service.up === null || service.up === undefined) return 'degraded';
  return service.up ? 'operational' : 'outage';
};

const makeServices = async (env, minecraft) => {
  const [queueCheck, website, shop] = await Promise.all([
    env.QUEUE_HEALTH_URL ? checkUrl(env.QUEUE_HEALTH_URL) : Promise.resolve(null),
    checkUrl(env.WEBSITE_HEALTH_URL || 'https://2b2t-th.org/'),
    checkUrl(env.SHOP_HEALTH_URL),
  ]);
  const mainServer = { configured: true, up: minecraft.up, responseTimeMs: minecraft.responseTimeMs };
  const queue = queueCheck || { configured: true, up: minecraft.up, responseTimeMs: minecraft.responseTimeMs, derived: true };
  const minecraftGroup = { configured: true, up: mainServer.up === false || queue.up === false ? false : (mainServer.up && queue.up ? true : null) };
  return [
    { id: 'minecraft', name: 'Minecraft', ...minecraftGroup },
    { id: 'queue', name: 'Queue', ...queue, players: minecraft.queuePlayers },
    { id: 'main-server', name: 'Main server', ...mainServer },
    { id: 'website', name: 'Website', ...website },
    { id: 'shop', name: 'Shop', ...shop },
  ].map((service) => ({ ...service, status: toStatus(service) }));
};

const currentStatus = async (env) => {
  const minecraft = await checkMinecraft();
  const services = await makeServices(env, minecraft);
  const checkedAt = new Date().toISOString();
  const activeServices = services.filter((service) => service.status !== 'not_configured');
  const overallStatus = activeServices.some((service) => service.status === 'outage')
    ? 'outage'
    : activeServices.some((service) => service.status === 'degraded') ? 'degraded' : 'operational';
  return {
    overallStatus,
    services,
    playerCount: { online: minecraft.players, max: minecraft.maxPlayers },
    checkedAt,
    responseTimeMs: minecraft.responseTimeMs,
  };
};

const trimSamples = (samples, now = Date.now()) => samples
  .filter((sample) => Date.parse(sample.ts || sample.timestamp) >= now - RETENTION_MS)
  .slice(-MAX_SAMPLES);

const serviceHistoryKey = (serviceId) => serviceId === 'main-server' ? 'minecraft' : serviceId === 'minecraft' ? 'minecraft-group' : serviceId;

const recordIncidents = async (env, services, timestamp) => {
  if (!env.STATUS_KV) return;
  const incidents = await readHistory(env, 'incidents');
  for (const service of services.filter((item) => item.id !== 'minecraft' && item.configured !== false && item.status !== 'degraded')) {
    const active = incidents.find((item) => item.serviceId === service.id && !item.resolved);
    if (service.status === 'outage' && !active) {
      incidents.push({ serviceId: service.id, title: `${service.name} is experiencing an outage`, body: `${service.name} was reported unavailable by the status monitor.`, date: timestamp, resolved: false });
    } else if (service.status === 'operational' && active) {
      active.resolved = true;
      active.resolvedAt = timestamp;
      active.body = `${service.name} has recovered.`;
    }
  }
  await env.STATUS_KV.put('history:incidents', JSON.stringify(incidents.filter((item) => Date.parse(item.date) >= Date.now() - RETENTION_MS).slice(-500)));
};

const persistStatus = async (env, status) => {
  if (!env.STATUS_KV) return;
  const timestamp = status.checkedAt;
  await Promise.all(status.services.map(async (service) => {
    if (service.configured === false) return;
    const history = trimSamples(await readHistory(env, serviceHistoryKey(service.id)));
    history.push({ ts: timestamp, status: service.status, up: service.up });
    await env.STATUS_KV.put(`history:${serviceHistoryKey(service.id)}`, JSON.stringify(history.slice(-MAX_SAMPLES)));
  }));
  const metrics = trimSamples(await readHistory(env, 'metrics'));
  metrics.push({
    ts: timestamp,
    players: status.playerCount.online,
    maxPlayers: status.playerCount.max,
    responseTimeMs: status.responseTimeMs,
  });
  await env.STATUS_KV.put('history:metrics', JSON.stringify(metrics.slice(-MAX_SAMPLES)));
  await recordIncidents(env, status.services, timestamp);
  await env.STATUS_KV.put('status:latest', JSON.stringify(status));
};

const dailyServiceHistory = (samples, now) => {
  const byDay = new Map();
  for (const sample of samples) {
    const timestamp = sample.ts || sample.timestamp;
    const day = timestamp.slice(0, 10);
    const current = byDay.get(day) || { timestamp: `${day}T00:00:00.000Z`, status: 'operational' };
    const sampleStatus = sample.status || (sample.up === true ? 'operational' : sample.up === false ? 'outage' : 'degraded');
    if (sampleStatus === 'outage' || current.status === 'outage') current.status = 'outage';
    else if (sampleStatus === 'degraded' || current.status === 'degraded') current.status = 'degraded';
    byDay.set(day, current);
  }
  return Array.from({ length: 90 }, (_, index) => {
    const day = new Date(now - (89 - index) * 86400000).toISOString().slice(0, 10);
    return byDay.get(day) || { timestamp: `${day}T00:00:00.000Z`, status: 'unknown' };
  });
};

const toDashboardPayload = async (env, status) => {
  const now = Date.now();
  const services = await Promise.all(status.services.map(async (service) => {
    const samples = trimSamples(await readHistory(env, serviceHistoryKey(service.id)), now);
    const uptimePercent = samples.length
      ? Number(((samples.filter((item) => item.status === 'operational' || item.up === true).length / samples.length) * 100).toFixed(2))
      : null;
    return { name: service.name, status: service.status, uptimePercent, history: dailyServiceHistory(samples, now) };
  }));
  const samples = trimSamples(await readHistory(env, 'metrics'), now);
  const metrics = samples.map((item) => ({ timestamp: item.ts || item.timestamp, value: item.responseTimeMs })).filter((item) => typeof item.value === 'number');
  const playerMetrics = samples.map((item) => ({ timestamp: item.ts || item.timestamp, value: item.players })).filter((item) => typeof item.value === 'number');
  const incidents = (await readHistory(env, 'incidents')).filter((item) => Date.parse(item.date) >= now - RETENTION_MS);
  return {
    overallStatus: status.overallStatus,
    services,
    playerCount: status.playerCount,
    metrics: { responseTimeMs: metrics, playersOnline: playerMetrics },
    incidents,
    lastCheckedAt: status.checkedAt,
    hasHistory: Boolean(env.STATUS_KV),
  };
};

const toLegacyDashboardPayload = async (env, status) => {
  const serviceById = Object.fromEntries(status.services.map((service) => [service.id, service]));
  const now = Date.now();
  const legacyService = async (serviceId, historyId = serviceId, extra = {}) => {
    const service = serviceById[serviceId];
    const history = trimSamples(await readHistory(env, historyId), now).slice(-90);
    const uptime = history.length
      ? Number(((history.filter((sample) => sample.up === true).length / history.length) * 100).toFixed(2))
      : null;
    return {
      configured: service?.configured !== false,
      up: service?.up ?? null,
      uptime,
      latencyMs: service?.responseTimeMs ?? null,
      history,
      ...extra,
    };
  };
  const [minecraft, queue, website, shop] = await Promise.all([
    legacyService('main-server', 'minecraft', {
      players: status.playerCount.online,
      queuePlayers: serviceById.queue?.players ?? null,
    }),
    legacyService('queue'),
    legacyService('website'),
    legacyService('shop'),
  ]);
  const metrics = trimSamples(await readHistory(env, 'metrics'), now)
    .filter((sample) => typeof sample.players === 'number')
    .slice(-90)
    .map((sample) => ({ ts: sample.ts || sample.timestamp, players: sample.players }));

  return {
    checkedAt: status.checkedAt,
    hasHistory: Boolean(env.STATUS_KV),
    services: { minecraft, queue, website, shop },
    metrics,
  };
};

const collectStatus = async (env, persist = false) => {
  const status = await currentStatus(env);
  if (persist) await persistStatus(env, status);
  return status;
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    const shouldRedirectToRoot =
      host !== '2b2t-th.org' && host !== 'www.2b2t-th.org' && host !== 'status.2b2t-th.org' && host.endsWith('.2b2t-th.org');

    if (shouldRedirectToRoot) {
      url.hostname = '2b2t-th.org';
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/api/status') {
      try {
        const status = await collectStatus(env);
        const origin = request.headers.get('origin') || request.headers.get('referer') || '';
        let originHost = '';
        try { originHost = new URL(origin).hostname.toLowerCase(); } catch {}
        const isLegacyMainPage = originHost === '2b2t-th.org' || originHost === 'www.2b2t-th.org';
        const payload = isLegacyMainPage
          ? await toLegacyDashboardPayload(env, status)
          : await toDashboardPayload(env, status);
        return json(payload, { headers: { 'cache-control': 'no-store', 'access-control-allow-origin': '*', vary: 'Origin' } });
      } catch {
        return json({ error: 'Status source unavailable' }, { status: 502, headers: { 'cache-control': 'no-store' } });
      }
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(_controller, env) {
    await collectStatus(env, true);
  },
};
