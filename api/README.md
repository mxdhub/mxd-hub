# MXD Hub — API (Cloudflare Worker) Stub

Endpoints (v0.1):
- `GET /ops/health` — public health check
- `GET /crawler/shopee/top` — requires `X-Key` (stub data)
- `GET /crawler/lazada/top` — requires `X-Key` (stub data)

## Deploy (Cloudflare Workers)
1. Cloudflare Dashboard → **Workers & Pages** → **Create Worker**.
2. Quick Edit → **paste** nội dung `api/mxd-hub.worker.js`.
3. Settings → Variables:
   - `ALLOW_ORIGIN` = `https://mxdhub.github.io`
   - `CORS_MAX_AGE` = `86400`
   - `X_KEY` = `mxd-2025-super` *(Secret)* (tự đặt)
4. **Deploy** → Copy URL Worker (vd: `https://mxd-hub-api.<subdomain>.workers.dev`).

## Gọi thử
```bash
curl -s https://<YOUR_WORKER_URL>/ops/health
curl -s -H "x-key: mxd-2025-super" "https://<YOUR_WORKER_URL>/crawler/shopee/top?mode=keyword&q=may%20cat&limit=5"
