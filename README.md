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

The Compose file publishes the static site on port `80` of the Docker host. The VPS Nginx can terminate HTTPS and proxy to the web machine's address over WireGuard.

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

The localized status page is available at `/th/status` and `/en/status`. `GET /api/status` checks Minecraft with mcstatus.io and mcsrvstat.us, derives the queue count from the server response, and checks the website and optional shop health URLs. It returns current service status, player count, response-time and player metrics, uptime history, and incidents detected from status changes.

`wrangler.jsonc` binds the existing `STATUS_KV` namespace and schedules a check once per hour to keep history writes within the Workers KV free write allowance. Browser requests fetch current health but do not create extra history samples. Player metrics and incident history continue to use their existing KV keys. Versioned service-history keys keep the new Main server and Queue checks separate from older samples; service uptime is displayed by day for the last seven days.

Configure these optional Worker variables in Cloudflare's Worker settings:

- `QUEUE_HEALTH_URL`: a health endpoint for Queue. If omitted, Queue status is derived from the Minecraft server check and queue count.
- `WEBSITE_HEALTH_URL`: a health endpoint for this website. It defaults to `https://2b2t-th.org/`.
- `SHOP_HEALTH_URL`: a health endpoint for Shop. When omitted, Shop is returned as `not_configured` and shown that way in the UI.

The `STATUS_KV` binding must point to the existing namespace in the account used for deployment. Build the frontend assets and deploy the Worker with:

```bash
npm run build
npx wrangler deploy
```

### Velocity backend status

The VelocityServerStatus plugin checks the Velocity `main` and `login` backends, then pushes `{ main, queue }` to `POST /api/velocity-status`. The website labels the Velocity `login` backend as Queue and shows the player count from `main`. The plugin may push every five seconds, while the Worker stores at most one snapshot every two minutes to stay within the Workers KV free write allowance. Snapshots older than three minutes are ignored. The endpoint requires a Cloudflare Worker secret named `VELOCITY_STATUS_TOKEN`:

```bash
npx wrangler secret put VELOCITY_STATUS_TOKEN
```

Set the same token in Velocity's `plugins/velocityserverstatus/config.yml` under `push.bearer-token`, and set `push.endpoint` to `https://status.2b2t-th.org/api/velocity-status`. Keep that token private. Once the Worker and Velocity plugin are deployed, the status page shows Main server and Queue status, plus the player count on Main server. Player count history continues to use scheduled cron samples.

The status source API returns service health only; the homepage's player count remains a separate Minecraft query and is not used to infer the official status-page health.
