# Static Deploy

This app is a static Vite frontend and can be deployed behind nginx without any frontend secrets.

## Local development

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

The output is written to `dist/`.

## Deploy with Docker

The Compose file is configured for the production WireGuard backend: it publishes the static site only on `10.10.0.2:80`. The VPS Nginx should terminate HTTPS and proxy to `http://10.10.0.2:80` over WireGuard.

```bash
docker compose up -d --build
```

To start it automatically after `wg0` and Docker are ready, install the systemd unit on the web machine (`10.10.0.2`), not on the VPS:

```bash
sudo install -m 0644 2b2t-th-website.service /etc/systemd/system/2b2t-th-website.service
sudo systemctl daemon-reload
sudo systemctl enable --now 2b2t-th-website.service
```

Stop it with `sudo systemctl stop 2b2t-th-website.service`. The unit file and Compose project use `/root/2b2t-th-website`; update both paths if the workspace is installed elsewhere.

## Deploy without Docker

1. Run `npm run build`.
2. Copy the contents of `dist/` to your nginx web root, for example `/usr/share/nginx/html`.
3. Use the nginx config in [`nginx.conf`](./nginx.conf).
4. Reload nginx.

No `.env` file or API key is required for this build.

## Cloudflare status monitoring

The status page is available at `/th/status` and `/en/status`. The Worker now exposes `GET /api/status` and checks the live Minecraft server through mcsrvstat.us. It also stores check results in Cloudflare KV when the KV binding is connected, so the uptime bars and player graph become real history instead of mock data.

One-time Cloudflare setup:

```bash
npx wrangler kv namespace create STATUS_KV
```

Copy the returned namespace `id` into `wrangler.jsonc` at `kv_namespaces[0].id`, then deploy:

```bash
npx wrangler deploy
```

The Worker cron runs every five minutes and writes service history. Optional health checks can be configured in Cloudflare Worker settings as `QUEUE_HEALTH_URL`, `WEBSITE_HEALTH_URL`, and `SHOP_HEALTH_URL`. If `SHOP_HEALTH_URL` is not set, the shop is shown as “Not configured” instead of reporting fake uptime. The `status.2b2t-th.org` hostname is already exempted from the redirect rule, so it can be connected to the same Worker route.
