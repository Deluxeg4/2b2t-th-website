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

const collectStatus = async (env) => {
  let minecraft = { configured: true, up: false, latencyMs: null, players: null };
  try {
    const started = Date.now();
    const response = await fetch('https://api.mcsrvstat.us/3/2b2t-th.org', { signal: AbortSignal.timeout(8000) });
    const data = await response.json();
    minecraft = { configured: true, up: Boolean(data.online), latencyMs: Date.now() - started, players: data.online ? Number(data.players?.online || 0) : 0, maxPlayers: data.players?.max || null, version: data.version || null };
  } catch {}

  const services = {
    minecraft,
    queue: env.QUEUE_HEALTH_URL ? await checkUrl(env.QUEUE_HEALTH_URL) : { configured: true, up: minecraft.up, latencyMs: minecraft.latencyMs, derived: true },
    website: await checkUrl(env.WEBSITE_HEALTH_URL || 'https://2b2t-th.org/'),
    shop: await checkUrl(env.SHOP_HEALTH_URL),
  };
  const now = new Date().toISOString();
  const result = { checkedAt: now, services: {}, metrics: [], hasHistory: Boolean(env.STATUS_KV) };
  for (const [id, service] of Object.entries(services)) {
    const history = await readHistory(env, id);
    const uptime = history.length ? Number(((history.filter((item) => item.up).length / history.length) * 100).toFixed(2)) : null;
    result.services[id] = { ...service, uptime, history: history.slice(-90) };
    if (env.STATUS_KV && service.up !== null) await saveHistory(env, id, { ts: now, up: service.up });
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
