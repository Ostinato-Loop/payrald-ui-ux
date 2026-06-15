/**
 * Cloudflare Pages Function — API proxy
 *
 * Frontend: payrald.rald.cloud  (CF Pages)
 * API:      pay.rald.cloud/v1/* (payrald-api CF Worker)
 *
 * All /api/* requests from the SPA are forwarded to pay.rald.cloud/v1/*.
 * Local dev uses Vite's proxy (vite.config.ts) — this file runs only on CF Pages.
 */

const API_ORIGIN = "https://pay.rald.cloud";

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  // /api/wallet  → /v1/wallet
  // /api/v1/...  → /v1/...  (strip extra /api prefix)
  const upstream = `${API_ORIGIN}${url.pathname.replace(/^\/api/, "/v1")}${url.search}`;

  const req = new Request(upstream, {
    method:   context.request.method,
    headers:  context.request.headers,
    body:     ["GET", "HEAD"].includes(context.request.method)
                ? undefined
                : context.request.body,
    redirect: "follow",
  });

  const resp    = await fetch(req);
  const headers = new Headers(resp.headers);
  headers.set("X-Proxied-By", "payrald-pages");

  return new Response(resp.body, {
    status:     resp.status,
    statusText: resp.statusText,
    headers,
  });
};
