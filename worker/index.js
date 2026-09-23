const json = (data, init = {}) => new Response(JSON.stringify(data), {
  ...init,
  headers: { 'content-type': 'application/json; charset=utf-8', ...(init.headers || {}) },
});

const checkUrl = async (url, timeoutMs = 8000) => {
  if (!url) return { configured: false, up: null, latencyMs: null };
  const started = Date.now();
  try {
    const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(timeoutMs) });
    return { configured: true, up: response.ok, latencyMs: Date.now() - started, httpStatus: response.status };
  } catch {
    return { configured: true, up: false, latencyMs: Date.now() - started, httpStatus: null };
  }
};

const readHistory = async (env, id) => {
  if (!env.STATUS_KV) return [];
  return (await env.STATUS_KV.get(`history:${id}`, 'json')) || [];
};

const saveHistory = async (env, id, sample) => {
  if (!env.STATUS_KV) return;
  const history = await readHistory(env, id);
  history.push(sample);
  await env.STATUS_KV.put(`history:${id}`, JSON.stringify(history.slice(-25920)));
};

const checkMinecraftProvider = async (url, source, parse) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!response.ok) throw new Error(`${source} returned ${response.status}`);
  const data = await response.json();
  const status = parse(data);
  if (typeof status.up !== 'boolean') throw new Error(`${source} returned no status`);
  return { ...status, source };
};

const readQueueCount = (data) => {
  const sample = data.players?.list || [];
  for (const player of sample) {
    const name = typeof player === 'string' ? player : player.name_clean || player.name_raw || player.name || '';
    const match = name.replace(/§[0-9a-fk-or]/gi, '').match(/^Queue:\s*(\d+)$/i);
    if (match) return Number(match[1]);
  }
  return null;
};

const checkMinecraft = async () => {
  const started = Date.now();
  const results = await Promise.allSettled([
    checkMinecraftProvider(
      'https://api.mcstatus.io/v2/status/java/2b2t-th.org',
      'mcstatus.io',
      (data) => ({
        up: data.online,
        players: data.online ? Number(data.players?.online || 0) : 0,
        queuePlayers: data.online ? readQueueCount(data) : null,
        version: data.version?.name_clean || null,
      }),
    ),
    checkMinecraftProvider(
      'https://api.mcsrvstat.us/3/2b2t-th.org',
      'mcsrvstat.us',
      (data) => ({
        up: data.online,
        players: data.online ? Number(data.players?.online || 0) : 0,
        queuePlayers: data.online ? readQueueCount(data) : null,
        version: data.version || null,
      }),
    ),
  ]);
  const checks = results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
  if (!checks.length) {
    return { configured: true, up: null, latencyMs: null, players: null, source: null };
  }

  const selected = checks.find((check) => check.up) || checks[0];
  return {
    configured: true,
    ...selected,
    latencyMs: Date.now() - started,
  };
};

const collectStatus = async (env) => {
  const minecraft = await checkMinecraft();

  const services = {
    minecraft,
    queue: env.QUEUE_HEALTH_URL ? await checkUrl(env.QUEUE_HEALTH_URL) : { configured: true, up: minecraft.up, players: minecraft.queuePlayers, latencyMs: minecraft.latencyMs, source: minecraft.source, derived: true },
    website: await checkUrl(env.WEBSITE_HEALTH_URL || 'https://2b2t-th.org/'),
    shop: await checkUrl(env.SHOP_HEALTH_URL),
  };
  const now = new Date().toISOString();
  const result = { checkedAt: now, services: {}, metrics: [], hasHistory: Boolean(env.STATUS_KV) };
  for (const [id, service] of Object.entries(services)) {
    const storedHistory = await readHistory(env, id);
    // Older Minecraft entries were recorded as offline when the provider request threw.
    // Keep the KV data, but only show samples collected by the reliable multi-provider check.
    const history = id === 'minecraft' || id === 'queue'
      ? storedHistory.filter((item) => item.source)
      : storedHistory;
    const uptime = history.length ? Number(((history.filter((item) => item.up).length / history.length) * 100).toFixed(2)) : null;
    result.services[id] = { ...service, uptime, history: history.slice(-90) };
    if (env.STATUS_KV && service.up !== null) {
      await saveHistory(env, id, { ts: now, up: service.up, source: service.source || null });
    }
  }
  const metrics = await readHistory(env, 'metrics');
  if (minecraft.players !== null) {
    const nextMetrics = [...metrics, { ts: now, players: minecraft.players }].slice(-25920);
    if (env.STATUS_KV) await env.STATUS_KV.put('history:metrics', JSON.stringify(nextMetrics));
    result.metrics = nextMetrics.slice(-90);
  } else {
    result.metrics = metrics.slice(-90);
  }
  return result;
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    const shouldRedirectToRoot =
      host !== "2b2t-th.org" && host !== "www.2b2t-th.org" && host !== "status.2b2t-th.org" && host.endsWith(".2b2t-th.org");

    if (shouldRedirectToRoot) {
      url.hostname = "2b2t-th.org";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === '/api/status') {
      const status = await collectStatus(env);
      return json(status, { headers: { 'cache-control': 'no-store', 'access-control-allow-origin': '*' } });
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(_controller, env) {
    await collectStatus(env);
  },
};
