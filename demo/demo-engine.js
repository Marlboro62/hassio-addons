/*
 * Démo MyElectricalData new : couche de simulation.
 * Chargée avant l'application, elle répond aux appels /api/ avec des données fictives.
 * Aucune donnée ne quitte le navigateur.
 */
(() => {
  "use strict";
  const LOG = (window.__MOCK_LOG__ = []);
  const ROUTES = [];
  const route = (method, pattern, handler) => ROUTES.push({ method, pattern, handler });
  window.__DEMO__ = { route, ok: (d) => ok(d) };

  const ok = (data) => ({ status: 200, body: { success: true, data, timestamp: new Date().toISOString() } });

  /* ----------------------------------------------------------- moteur */
  function handle(method, url, body) {
    const u = new URL(url, location.href);
    const m = /\/api\/?(.*)$/.exec(u.pathname);
    const path = m ? m[1].replace(/\/$/, "") : "";
    const query = Object.fromEntries(u.searchParams);
    let json = null;
    try { json = body ? JSON.parse(body) : null; } catch (e) { json = null; }
    for (const r of ROUTES) {
      if (r.method !== method) continue;
      const mm = r.pattern.exec(path);
      if (mm) {
        LOG.push(`OK  ${method} ${path}${u.search}`);
        try { return r.handler({ params: mm.slice(1), query, body: json, path }); }
        catch (e) { console.error("[démo]", path, e); return { status: 500, body: { success: false, error: { code: "DEMO", message: String(e) } } }; }
      }
    }
    LOG.push(`--- ${method} ${path}${u.search}`);
    if (method !== "GET") return ok({ message: "Action simulée dans la démo" });
    return { status: 404, body: { success: false, error: { code: "DEMO_NOT_FOUND", message: "Non disponible dans la démo" }, timestamp: new Date().toISOString() } };
  }
  window.__DEMO__.handle = handle;

  const isApi = (url) => /\/api(\/|$)/.test(new URL(url, location.href).pathname);

  /* XMLHttpRequest (axios) */
  const RealXHR = window.XMLHttpRequest;
  class DemoXHR extends EventTarget {
    constructor() {
      super();
      this.readyState = 0; this.status = 0; this.statusText = ""; this.response = ""; this.responseText = "";
      this.responseType = ""; this.responseURL = ""; this.timeout = 0; this.withCredentials = false;
      this.upload = new EventTarget(); this._headers = {}; this._real = null;
    }
    open(method, url, ...rest) {
      this._method = String(method).toUpperCase(); this._url = url;
      if (!isApi(url)) {
        const real = (this._real = new RealXHR());
        const sync = () => {
          for (const k of ["readyState", "status", "statusText", "response", "responseURL"]) {
            try { this[k] = real[k]; } catch (e) { /* ignoré */ }
          }
          try { this.responseText = real.responseText; } catch (e) { /* binaire */ }
        };
        for (const ev of ["readystatechange", "load", "error", "abort", "timeout", "loadend", "progress"]) {
          real.addEventListener(ev, () => { sync(); this._fire(ev); });
        }
        real.open(method, url, ...rest);
      }
      this.readyState = 1;
    }
    _fire(type) {
      const fn = this["on" + type];
      if (typeof fn === "function") fn.call(this, new Event(type));
      this.dispatchEvent(new Event(type));
    }
    setRequestHeader(k, v) { if (this._real) this._real.setRequestHeader(k, v); else this._headers[k] = v; }
    getAllResponseHeaders() { return this._real ? this._real.getAllResponseHeaders() : "content-type: application/json\r\n"; }
    getResponseHeader(k) { return this._real ? this._real.getResponseHeader(k) : (String(k).toLowerCase() === "content-type" ? "application/json" : null); }
    overrideMimeType(t) { if (this._real) this._real.overrideMimeType(t); }
    abort() { if (this._real) this._real.abort(); }
    send(body) {
      if (this._real) {
        this._real.responseType = this.responseType; this._real.timeout = this.timeout;
        this._real.withCredentials = this.withCredentials; return this._real.send(body);
      }
      const res = handle(this._method, this._url, body);
      setTimeout(() => {
        const text = JSON.stringify(res.body);
        this.readyState = 4; this.status = res.status; this.statusText = res.status === 200 ? "OK" : "Error";
        this.responseURL = new URL(this._url, location.href).href;
        this.responseText = text;
        this.response = this.responseType === "json" ? res.body : text;
        this._fire("readystatechange"); this._fire("load"); this._fire("loadend");
      }, 60 + Math.random() * 120);
    }
  }
  window.XMLHttpRequest = DemoXHR;

  /* fetch */
  const realFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!isApi(url)) return realFetch(input, init);
    const method = String(init.method || (input && input.method) || "GET").toUpperCase();
    const res = handle(method, url, init.body);
    return new Promise((r) => setTimeout(() => r(new Response(JSON.stringify(res.body), {
      status: res.status, headers: { "Content-Type": "application/json" } })), 80));
  };

  /* Bandeau « démo » et première récupération automatique des données */
  function demoUi() {
    const bar = document.createElement("a");
    bar.href = "https://github.com/Marlboro62/hassio-addons";
    bar.target = "_blank"; bar.rel = "noopener";
    bar.textContent = "Démo · données fictives — installer l'add-on";
    bar.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:2147483000;padding:7px 12px;border-radius:999px;"
      + "background:#1d93e3;color:#fff;font:600 12px/1.3 system-ui,sans-serif;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.25)";
    document.body.appendChild(bar);
    let done = false;
    try { done = localStorage.getItem("med-demo-fetched") === "1"; } catch (e) { done = false; }
    if (done) return;
    const t0 = Date.now();
    const tick = setInterval(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => /Récupérer/.test(b.textContent || "") && !b.disabled);
      if (btn) {
        clearInterval(tick);
        setTimeout(() => btn.click(), 400);
        try { localStorage.setItem("med-demo-fetched", "1"); } catch (e) { /* stockage indisponible */ }
      } else if (Date.now() - t0 > 15000) clearInterval(tick);
    }, 300);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demoUi); else demoUi();

  /* EventSource (progression des exports) */
  window.__DEMO__.sse = null;
  window.EventSource = class DemoEventSource extends EventTarget {
    constructor(url) {
      super(); this.url = url; this.readyState = 0; this.onerror = null; this.onmessage = null;
      const u = new URL(url, location.href);
      LOG.push(`SSE ${u.pathname}`);
      const script = window.__DEMO__.sse ? window.__DEMO__.sse(u) : [];
      this.readyState = 1;
      let t = 200;
      for (const [event, data] of script) {
        setTimeout(() => {
          if (this.readyState === 2) return;
          const ev = new MessageEvent(event, { data: JSON.stringify(data) });
          this.dispatchEvent(ev);
        }, (t += 450));
      }
    }
    close() { this.readyState = 2; }
  };
})();
