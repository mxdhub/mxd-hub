// mxd-hub.worker.js — v0.1 stub
// Endpoints:
//   GET  /ops/health                (public)
//   GET  /crawler/shopee/top        (require X-Key; stub data)
//   GET  /crawler/lazada/top        (require X-Key; stub data)
//
// ENV (Settings → Variables):
//   ALLOW_ORIGIN   e.g. https://mxdhub.github.io
//   CORS_MAX_AGE   e.g. 86400
//   X_KEY          e.g. mxd-2025-super (Secret)

export default {
  async fetch(req, env, ctx) {
    try {
      // Preflight
      if (req.method === "OPTIONS") return handleOptions(req, env);

      const url = new URL(req.url);
      const path = url.pathname;

      // Routes
      if (path === "/ops/health") {
        const body = json({ ok: true, time: new Date().toISOString(), service: "mxd-hub.worker@v0.1" });
        return withCORS(body, req, env);
      }

      if (path === "/crawler/shopee/top" || path === "/crawler/lazada/top") {
        const auth = checkKey(req, env);
        if (auth) return withCORS(auth, req, env);

        // Return STUB payload (no scraping here)
        const qp = Object.fromEntries(url.searchParams.entries());
        const items = makeStubItems(path.includes("shopee") ? "shopee" : "lazada", qp);

        const body = json({
          ok: true,
          source: "stub",
          market: path.includes("shopee") ? "shopee" : "lazada",
          params: qp,
          items,
        });
        return withCORS(body, req, env);
      }

      // 404
      return withCORS(json({ ok: false, error: "Not Found", path }), req, env, 404);
    } catch (err) {
      return withCORS(json({ ok: false, error: String(err) }), req, env, 500);
    }
  },
};

// ---------------- helpers ----------------

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-powered-by": "mxd-hub.worker@v0.1",
      ...headers,
    },
  });
}

function withCORS(resp, req, env, statusOverride) {
  const h = new Headers(resp.headers);
  const allow = (env.ALLOW_ORIGIN || "*").trim();
  const origin = req.headers.get("Origin");

  // Allow specific origin or wildcard
  h.set("access-control-allow-origin", allow === "*" ? "*" : (origin || allow));
  h.set("access-control-allow-credentials", "true");
  h.set("vary", allow === "*" ? "origin" : "origin");

  return new Response(resp.body, {
    status: statusOverride ?? resp.status,
    headers: h,
  });
}

function handleOptions(req, env) {
  const h = new Headers();
  const allow = (env.ALLOW_ORIGIN || "*").trim();
  const origin = req.headers.get("Origin");

  h.set("access-control-allow-origin", allow === "*" ? "*" : (origin || allow));
  h.set("access-control-allow-methods", "GET,HEAD,POST,OPTIONS");
  h.set("access-control-allow-headers", "*,x-key,content-type");
  h.set("access-control-max-age", String(env.CORS_MAX_AGE || 86400));
  h.set("vary", allow === "*" ? "origin" : "origin");

  return new Response(null, { status: 204, headers: h });
}

function checkKey(req, env) {
  const want = env.X_KEY;
  if (!want) return null; // no key required if not configured
  const got = req.headers.get("x-key");
  if (got && got === want) return null;
  return json({ ok: false, error: "Unauthorized (missing or invalid X-Key)" }, 401);
}

function makeStubItems(market, qp) {
  // Minimal stub data for UI wiring
  const now = new Date().toISOString();
  const base = market === "shopee" ? "SP" : "LZ";
  return [
    {
      id: base + "-001",
      name: "Máy cắt gạch 110mm MXD",
      price_vnd: 499000,
      origin_url: "https://example.com/product/1",
      image_url: "https://mxdhub.github.io/mxd-hub/assets/img/products/may-cat-gach-110mm-mxd.webp",
      brand: "MXD",
      updated_at: now,
    },
    {
      id: base + "-002",
      name: "Keo dán gạch chống thấm 20kg",
      price_vnd: 189000,
      origin_url: "https://example.com/product/2",
      image_url: "https://mxdhub.github.io/mxd-hub/assets/img/products/keo-dan-gach-chong-tham-kg20.webp",
      brand: "ProSeal",
      updated_at: now,
    },
  ];
}
