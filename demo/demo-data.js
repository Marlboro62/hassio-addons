/*
 * Démo MyElectricalData new : données fictives.
 * Tout est calculé dans le navigateur à partir de la date du jour, de façon
 * reproductible : un même jour donne toujours les mêmes valeurs.
 */
(() => {
  "use strict";
  const { route, ok } = window.__DEMO__;

  /* --------------------------------------------------------- outils */
  const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rand = (key) => { let t = (hash(String(key)) + 0x6d2b79f5) | 0; t = Math.imul(t ^ (t >>> 15), 1 | t); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseDay = (s) => { const [y, m, d] = String(s).slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const eachDay = (start, endExcl, fn) => { const out = []; for (let d = new Date(start); d < endExcl; d = addDays(d, 1)) out.push(fn(new Date(d))); return out; };
  const nowIso = () => new Date().toISOString();
  const err = (code, message, status = 400) => ({ status, body: { success: false, error: { code, message }, timestamp: nowIso() } });

  const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
  const YESTERDAY = addDays(TODAY, -1);
  const OLDEST = addDays(TODAY, -3 * 365);
  const DETAIL_OLDEST = addDays(TODAY, -2 * 365);

  /* ----------------------------------------------------------- PDL */
  const UP = "12345678901234";
  const PDL = {
    id: "demo-pdl-0001", usage_point_id: UP, name: "Maison (démo)", created_at: "2025-11-02T10:12:00Z",
    display_order: 0, subscribed_power: 6, offpeak_hours: ["22:00-06:00"], pricing_option: "TEMPO",
    has_consumption: true, has_production: false, is_active: true,
    oldest_available_data_date: ymd(OLDEST), activation_date: "2016-04-18", selected_offer_id: "demo-edf-tempo-6",
    linked_production_pdl_id: "demo-pdl-0002",
  };
  const UP_PROD = "98765432109876";
  const PDL_PROD = {
    id: "demo-pdl-0002", usage_point_id: UP_PROD, name: "Panneaux solaires (démo)", created_at: "2025-11-02T10:14:00Z",
    display_order: 1, subscribed_power: 3, offpeak_hours: [], pricing_option: "BASE",
    has_consumption: false, has_production: true, is_active: true,
    oldest_available_data_date: ymd(OLDEST), activation_date: "2021-06-02",
  };
  const PDLS = [PDL, PDL_PROD];
  const pdlById = (id) => PDLS.find((p) => p.id === id || p.usage_point_id === id) || PDL;

  /* --------------------------------------------------------- Tempo */
  // Saison du 1er septembre au 31 août : 22 jours rouges (semaine, novembre-mars), 43 blancs (hors dimanche, octobre-mai).
  const seasonCache = {};
  function seasonColors(startYear) {
    if (seasonCache[startYear]) return seasonCache[startYear];
    const start = new Date(startYear, 8, 1), end = new Date(startYear + 1, 8, 1);
    const days = eachDay(start, end, (d) => d);
    const pick = (cands, n, weight, tag) => cands
      .map((d) => ({ d, k: -Math.log(rand(`${tag}${ymd(d)}`) || 1e-9) / weight(d) }))
      .sort((a, b) => a.k - b.k).slice(0, n).map((x) => ymd(x.d));
    const winter = (d) => { const m = d.getMonth(); return 1 + 4 * Math.max(0, Math.cos(((m - 0.5) / 12) * 2 * Math.PI)); };
    const red = new Set(pick(days.filter((d) => [10, 11, 0, 1, 2].includes(d.getMonth()) && d.getDay() >= 1 && d.getDay() <= 5), 22, winter, "r"));
    const white = new Set(pick(days.filter((d) => [9, 10, 11, 0, 1, 2, 3, 4].includes(d.getMonth()) && d.getDay() !== 0 && !red.has(ymd(d))), 43, winter, "w"));
    const map = {};
    for (const d of days) { const k = ymd(d); map[k] = red.has(k) ? "RED" : white.has(k) ? "WHITE" : "BLUE"; }
    return (seasonCache[startYear] = map);
  }
  const seasonOf = (d) => (d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1);
  const tempoColor = (d) => seasonColors(seasonOf(d))[ymd(d)];
  const TEMPO_LAST = addDays(TODAY, 1); // couleur de demain déjà publiée

  /* ------------------------------------------------- consommation */
  function dailyKwh(d) {
    const doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
    let v = 10.5 * (1 + 0.6 * Math.cos((2 * Math.PI * (doy - 18)) / 365));
    if (d.getDay() === 0 || d.getDay() === 6) v *= 1.1;
    const c = tempoColor(d);
    if (c === "RED") v *= 0.72; else if (c === "WHITE") v *= 0.93;
    return v * (0.86 + 0.28 * rand(`c${ymd(d)}`));
  }
  // Répartition de la journée par demi-heure (cumulus en heures creuses, pics du matin et du soir)
  const PROFILE = Array.from({ length: 48 }, (_, i) => {
    const h = i / 2;
    if (h >= 23 || h < 1.5) return 2.6;
    if (h < 6.5) return 0.45;
    if (h < 8.5) return 1.6;
    if (h < 12) return 0.8;
    if (h < 14) return 1.25;
    if (h < 18) return 0.75;
    if (h < 22) return 1.9;
    return 1.0;
  });
  function slotsWh(d) {
    const total = dailyKwh(d) * 1000;
    const w = PROFILE.map((p, i) => p * (0.8 + 0.4 * rand(`s${ymd(d)}${i}`)));
    const sum = w.reduce((a, b) => a + b, 0);
    return w.map((x) => (total * x) / sum);
  }
  const clampRange = (q, oldest) => {
    let s = q.start ? parseDay(q.start) : addDays(TODAY, -7);
    let e = q.end ? parseDay(q.end) : TODAY;
    if (s < oldest) s = oldest;
    if (e > TODAY) e = TODAY; // Enedis publie jusqu'à la veille
    return [s, e];
  };
  const measure = (q, points, grandeurPhysique, unite, pas, metier = "CONS", up = UP) => ({
    idPrm: up, periode: { dateDebut: q.start, dateFin: q.end },
    ...(pas ? { pas } : {}),
    grandeur: [{ grandeurMetier: metier, grandeurPhysique, unite, points, calendrier: [] }],
    _from_local_cache: true,
  });

  route("GET", /^enedis\/consumption\/daily\/(\d+)$/, ({ query, params }) => {
    if (params[0] !== UP) return ok(measure(query, [], "EA", "Wh", "P1D", "CONS", params[0]));
    const [s, e] = clampRange(query, OLDEST);
    const points = eachDay(s, e, (d) => ({ v: String(Math.round(dailyKwh(d) * 1000)), d: ymd(d) }));
    return ok(measure(query, points, "EA", "Wh", "P1D"));
  });
  const detail = ({ query, params }) => {
    if (params[0] !== UP) return ok(measure(query, [], "PA", "W", undefined, "CONS", params[0]));
    const [s, e] = clampRange(query, DETAIL_OLDEST);
    const points = [];
    eachDay(s, e, (d) => slotsWh(d).forEach((wh, i) => points.push({
      v: String(Math.round(wh * 2)), d: `${ymd(d)} ${pad(Math.floor(i / 2))}:${i % 2 ? "30" : "00"}:00`, p: "PT30M",
    })));
    return ok(measure(query, points, "PA", "W"));
  };
  route("GET", /^enedis\/consumption\/detail\/(?:batch\/)?(\d+)$/, detail);
  const power = ({ query, params }) => {
    if (params[0] !== UP) return ok(measure(query, [], "PMA", "VA", "P1D", "CONS", params[0]));
    const [s, e] = clampRange(query, OLDEST);
    const points = eachDay(s, e, (d) => {
      const slots = slotsWh(d);
      let i = slots.indexOf(Math.max(...slots));
      const va = Math.min(PDL.subscribed_power * 1000 * 0.97, slots[i] * 2 * (1.6 + 0.9 * rand(`p${ymd(d)}`)));
      const min = Math.floor(rand(`m${ymd(d)}`) * 30);
      return { v: String(Math.round(va)), d: `${ymd(d)} ${pad(Math.floor(i / 2))}:${pad((i % 2) * 30 + min)}:00` };
    });
    return ok(measure(query, points, "PMA", "VA", "P1D"));
  };
  route("GET", /^enedis\/power\/(\d+)$/, power);
  route("GET", /^enedis\/consumption\/max_power\/(\d+)$/, power);
  // Production solaire : 3 kWc, journées plus ou moins ensoleillées
  const solarKwh = (d) => {
    const doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
    const sunHours = 2.85 + 1.75 * Math.cos((2 * Math.PI * (doy - 172)) / 365);
    return 3 * sunHours * (0.3 + 0.75 * rand(`sun${ymd(d)}`));
  };
  const solarSlotsWh = (d) => {
    const doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
    const half = 4.6 + 2.6 * Math.cos((2 * Math.PI * (doy - 172)) / 365); // demi-durée du jour en heures
    const w = Array.from({ length: 48 }, (_, i) => { const x = (i / 2 + 0.25 - 13.5) / half; return Math.abs(x) < 1 ? Math.cos((x * Math.PI) / 2) ** 1.6 * (0.85 + 0.3 * rand(`ss${ymd(d)}${i}`)) : 0; });
    const sum = w.reduce((a, b) => a + b, 0) || 1, total = solarKwh(d) * 1000;
    return w.map((x) => (total * x) / sum);
  };
  route("GET", /^enedis\/production\/daily\/(\d+)$/, ({ query, params }) => {
    if (params[0] !== UP_PROD) return ok(measure(query, [], "EA", "Wh", "P1D", "PROD", params[0]));
    const [s, e] = clampRange(query, OLDEST);
    return ok(measure(query, eachDay(s, e, (d) => ({ v: String(Math.round(solarKwh(d) * 1000)), d: ymd(d) })), "EA", "Wh", "P1D", "PROD", UP_PROD));
  });
  route("GET", /^enedis\/production\/detail\/(?:batch\/)?(\d+)$/, ({ query, params }) => {
    if (params[0] !== UP_PROD) return ok(measure(query, [], "PA", "W", undefined, "PROD", params[0]));
    const [s, e] = clampRange(query, DETAIL_OLDEST);
    const points = [];
    eachDay(s, e, (d) => solarSlotsWh(d).forEach((wh, i) => points.push({
      v: String(Math.round(wh * 2)), d: `${ymd(d)} ${pad(Math.floor(i / 2))}:${i % 2 ? "30" : "00"}:00`, p: "PT30M" })));
    return ok(measure(query, points, "PA", "W", undefined, "PROD", UP_PROD));
  });
  route("GET", /^enedis\/contract\/\d+$/, () => ok({
    situation_contrat: [{ contract_type: "CARD-S", contract_start: "2016-04-18", segment: "C5", distribution_tariff: "BTINFCUST",
      subscribed_power: { value: String(PDL.subscribed_power), unit: "kVA" } }],
    synthese_contrat: { consumption_last_activation_date: PDL.activation_date, services_level: "2" },
    comptage: { relais: { plageHeuresCreuses: "HC (22H00-6H00)" } },
  }));
  route("GET", /^enedis\/address\/\d+$/, () => ok({ address: { number_street_name: "1 rue de la Démo", postal_code_city: "00000 Démoville", insee_code: "00000" } }));
  route("GET", /^enedis\/(customer|contact)\/\d+$/, () => ok([{ person: { title: "", firstname: "Utilisateur", lastname: "Démo" }, contact_data: { phone: null, email: null } }]));
  route("DELETE", /^enedis\/cache\/\d+$/, () => ok({ success: true, deleted_keys: 0, message: "Rien à vider dans la démo" }));

  /* ------------------------------------------------ compte et PDL */
  const USER = { id: "demo-user", email: "local@localhost", client_id: "cli_demo", is_active: true,
    created_at: "2025-11-02T10:10:00Z", is_admin: false, email_verified: true, pdl_count: 1,
    usage_stats: { cached_requests: 21, cached_limit: 1000, no_cache_requests: 3, no_cache_limit: 50 } };
  route("GET", /^accounts\/me$/, () => ok(USER));
  route("POST", /^accounts\/auto-login$/, () => ok(USER));
  route("GET", /^accounts\/usage-stats$/, () => ok(USER.usage_stats));
  route("GET", /^pdl$/, () => ok(PDLS));
  route("GET", /^pdl\/([^/]+)$/, ({ params }) => ok(pdlById(params[0])));
  route("PATCH", /^pdl\/reorder$/, () => ok({ message: "Ordre enregistré" }));
  route("PATCH", /^pdl\/([^/]+)\/(contract|name|type|active|pricing-option|selected-offer|link-production)$/, ({ body, params }) => {
    const PDL = pdlById(params[0]);
    if (body) {
      if ("linked_production_pdl_id" in body) PDL.linked_production_pdl_id = body.linked_production_pdl_id;
      if ("name" in body) PDL.name = body.name;
      if ("subscribed_power" in body) PDL.subscribed_power = Number(body.subscribed_power);
      if ("offpeak_hours" in body) PDL.offpeak_hours = body.offpeak_hours;
      if ("pricing_option" in body) PDL.pricing_option = body.pricing_option;
      if ("selected_offer_id" in body) PDL.selected_offer_id = body.selected_offer_id;
      if ("is_active" in body) PDL.is_active = body.is_active;
      if ("has_consumption" in body) { PDL.has_consumption = body.has_consumption; PDL.has_production = body.has_production; }
    }
    return ok(PDL);
  });
  route("POST", /^pdl\/([^/]+)\/fetch-contract$/, ({ params }) => ok(pdlById(params[0])));

  /* ---------------------------------------------- synchronisation */
  const lastSync = () => { const d = new Date(); d.setMinutes(d.getMinutes() < 30 ? 0 : 30, 0, 0); return d.toISOString(); };
  const started = (message = "Synchronisation lancée (simulée dans la démo)") => ok({ status: "started", message });
  route("POST", /^sync\/(trigger(\/\d+)?|pdl-list|energy-offers|ecowatt|tempo|consumption-france|generation-forecast)$/, () => started());
  route("POST", /^sync\/(ecowatt|tempo|consumption-france|generation-forecast)\/now$/, () => ok({ created: 0, updated: 3, errors: [] }));
  route("POST", /^sync\/energy-offers\/now$/, () => ok({ success: true, data: { providers: { created: 0, updated: 0, unchanged: 2, errors: [] }, offers: { created: 0, updated: 0, unchanged: 3, deactivated: 0, errors: [] } }, message: "Offres à jour" }));
  const syncStatus = (up = UP) => ({ usage_point_id: up, sync_types: Object.fromEntries(
    (up === UP ? ["consumption_daily", "consumption_detail", "max_power"] : ["production_daily", "production_detail"]).map((t) => [t, {
      status: "success", last_sync_at: lastSync(), next_sync_at: null,
      oldest_data_date: ymd(t.endsWith("detail") ? DETAIL_OLDEST : OLDEST), newest_data_date: ymd(YESTERDAY),
      total_records: t.endsWith("detail") ? 730 * 48 : 1095, error_message: null }])) });
  route("GET", /^sync\/status$/, () => ok({ pdls: [syncStatus(UP), syncStatus(UP_PROD)], count: 2 }));
  route("GET", /^sync\/status\/(\d+)$/, ({ params }) => ok(syncStatus(params[0])));
  route("GET", /^sync\/(tempo|ecowatt|consumption-france|generation-forecast|zen-flex)\/status$/, ({ params }) =>
    ok({ last_sync_at: lastSync(), record_count: { tempo: 3961, ecowatt: 1090, "consumption-france": 2880, "generation-forecast": 1440, "zen-flex": 120 }[params[0]] }));

  /* ---------------------------------------------------- Tempo API */
  const tempoDay = (d) => ({ date: ymd(d), color: tempoColor(d), updated_at: nowIso(), rte_updated_date: nowIso() });
  route("GET", /^tempo\/days$/, ({ query }) => {
    const s = query.start_date ? parseDay(query.start_date) : new Date(2015, 8, 1);
    let e = query.end_date ? addDays(parseDay(query.end_date), 1) : addDays(TEMPO_LAST, 1);
    if (e > addDays(TEMPO_LAST, 1)) e = addDays(TEMPO_LAST, 1);
    return ok(eachDay(s, e, tempoDay).reverse());
  });
  route("GET", /^tempo$/, ({ query }) => ok(eachDay(addDays(TODAY, -30), addDays(TEMPO_LAST, 1), tempoDay)));
  route("GET", /^tempo\/today$/, () => ok(tempoDay(TODAY)));
  route("GET", /^tempo\/week$/, () => ok(eachDay(addDays(TODAY, -5), addDays(TEMPO_LAST, 1), tempoDay)));
  function seasonStats() {
    const sy = seasonOf(TODAY), map = seasonColors(sy);
    const used = { BLUE: 0, WHITE: 0, RED: 0 };
    for (const [k, c] of Object.entries(map)) if (parseDay(k) <= TEMPO_LAST) used[c]++;
    const total = Object.keys(map).length;
    return { season: `${sy}-${sy + 1}`, s: {
      blue_used: used.BLUE, blue_remaining: total - 65 - used.BLUE, white_used: used.WHITE, white_remaining: 43 - used.WHITE,
      red_used: used.RED, red_remaining: 22 - used.RED } };
  }
  route("GET", /^tempo\/forecast$/, ({ query }) => {
    const n = Math.min(Number(query.days) || 8, 10);
    const { season, s } = seasonStats();
    const forecasts = Array.from({ length: n }, (_, i) => {
      const d = addDays(TODAY, i + 2);
      const c = tempoColor(d);
      const base = { BLUE: [0.82, 0.15, 0.03], WHITE: [0.3, 0.58, 0.12], RED: [0.1, 0.3, 0.6] }[c];
      const fade = Math.min(0.35, i * 0.05);
      const pb = base[0] * (1 - fade) + fade / 3, pw = base[1] * (1 - fade) + fade / 3, pr = 1 - pb - pw;
      const probs = { BLUE: pb, WHITE: pw, RED: pr };
      const most = Object.entries(probs).sort((a, b) => b[1] - a[1])[0][0];
      const winter = [10, 11, 0, 1, 2].includes(d.getMonth());
      return {
        date: ymd(d), day_in_season: Math.round((d - new Date(seasonOf(d), 8, 1)) / 864e5) + 1,
        probability_blue: Math.round(pb * 100), probability_white: Math.round(pw * 100), probability_red: Math.round(pr * 100),
        most_likely: most, confidence: i < 2 ? "high" : i < 5 ? "medium" : "low",
        threshold_white_red: 1.2, threshold_red: 2.1, normalized_consumption: null, forecast_type: "statistical",
        factors: { is_winter: winter, is_weekend: d.getDay() === 0 || d.getDay() === 6,
          days_remaining_in_season: Math.round((new Date(seasonOf(d) + 1, 7, 31) - d) / 864e5),
          blue_remaining: s.blue_remaining, white_remaining: s.white_remaining, red_remaining: s.red_remaining, has_rte_data: false },
      };
    });
    return ok({ season, season_stats: s, forecasts, algorithm_info: {
      description: "Prévision statistique (démo)", params_blanc_rouge: { A: 4, B: 0.015, C: -0.0026 }, params_rouge: { A: 3.15, B: 0.01, C: -0.0026 },
      formula_blanc_rouge: "A - B × jour - C × stock", formula_rouge: "A - B × jour - C × stock" } });
  });

  /* ------------------------------------------------------ EcoWatt */
  const ecoSignal = (d, i) => {
    const level = rand(`e${ymd(d)}`) < 0.08 && [11, 0, 1].includes(d.getMonth()) ? 2 : 1;
    const values = Array.from({ length: 24 }, (_, h) => (level === 2 && (h >= 8 && h <= 12 || h >= 18 && h <= 20) ? 2 : h >= 2 && h <= 5 ? 0 : 1));
    return { id: 1000 + i, periode: `${ymd(d)}T00:00:00+02:00`, dvalue: level,
      message: level === 2 ? "Système électrique tendu. Les écogestes sont les bienvenus." : "Pas d'alerte.",
      values, hdebut: 0, hfin: 23, generation_datetime: nowIso() };
  };
  route("GET", /^ecowatt\/forecast$/, ({ query }) => ok(Array.from({ length: Math.min(Number(query.days) || 4, 4) }, (_, i) => ecoSignal(addDays(TODAY, i), i))));
  route("GET", /^ecowatt\/current$/, () => ok(ecoSignal(TODAY, 0)));
  route("GET", /^ecowatt\/history$/, ({ query }) => ok(eachDay(parseDay(query.start_date), addDays(parseDay(query.end_date), 1), (d) => ecoSignal(d, 0))));
  route("GET", /^ecowatt\/statistics$/, ({ query }) => {
    const y = Number(query.year) || TODAY.getFullYear();
    const days = eachDay(new Date(y, 0, 1), y === TODAY.getFullYear() ? addDays(TODAY, 1) : new Date(y + 1, 0, 1), (d) => ecoSignal(d, 0).dvalue);
    const g = days.filter((v) => v === 1).length, o = days.filter((v) => v === 2).length, r = days.filter((v) => v === 3).length;
    const pct = (n) => Math.round((n / days.length) * 1000) / 10;
    return ok({ year: y, total_days: days.length, green_days: g, orange_days: o, red_days: r, percentage_green: pct(g), percentage_orange: pct(o), percentage_red: pct(r) });
  });
  route("GET", /^ecowatt\/refresh\/status$/, () => ok({ can_refresh: false, last_refresh: lastSync(), time_remaining_seconds: 3600, message: "Mise à jour automatique (démo)" }));

  /* ------------------------------------------------------- France */
  const franceMW = (t) => {
    const h = t.getHours() + t.getMinutes() / 60;
    const doy = Math.floor((t - new Date(t.getFullYear(), 0, 0)) / 864e5);
    const season = 1 + 0.25 * Math.cos((2 * Math.PI * (doy - 18)) / 365);
    const shape = 0.82 + 0.1 * Math.exp(-((h - 9.5) ** 2) / 6) + 0.12 * Math.exp(-((h - 19.5) ** 2) / 4) - 0.08 * Math.exp(-((h - 4) ** 2) / 5);
    return Math.round(50000 * season * shape * (t.getDay() === 0 ? 0.9 : 1));
  };
  function franceSeries(type, from, to, stepMin) {
    const out = [];
    for (let t = new Date(from); t < to; t = new Date(t.getTime() + stepMin * 6e4)) {
      const e = new Date(t.getTime() + stepMin * 6e4);
      const noise = type === "REALISED" ? 1 + (rand(`f${t.getTime()}`) - 0.5) * 0.02 : type === "ID" ? 1.01 : 0.985;
      out.push({ start_date: t.toISOString(), end_date: e.toISOString(), value: Math.round(franceMW(t) * noise), updated_date: nowIso() });
    }
    return out;
  }
  const now15 = () => { const d = new Date(); d.setMinutes(Math.floor(d.getMinutes() / 15) * 15, 0, 0); return d; };
  route("GET", /^consumption-france$/, ({ query }) => {
    const from = query.start_date ? new Date(query.start_date) : addDays(TODAY, -1);
    const to = query.end_date ? new Date(query.end_date) : addDays(TODAY, 2);
    const types = query.type ? [query.type] : ["REALISED", "ID", "D-1"];
    const short_term = types.map((type) => ({ type, values: type === "REALISED"
      ? franceSeries(type, from, now15() < to ? now15() : to, 15)
      : type === "D-1" ? franceSeries(type, addDays(TODAY, 1) > from ? addDays(TODAY, 1) : from, to, 15)
      : franceSeries(type, TODAY > from ? TODAY : from, addDays(TODAY, 1) < to ? addDays(TODAY, 1) : to, 15) }));
    return ok({ short_term, period: { start: from.toISOString(), end: to.toISOString() } });
  });
  route("GET", /^consumption-france\/current$/, () => {
    const t = new Date(now15().getTime() - 15 * 6e4);
    return ok({ start_date: t.toISOString(), end_date: now15().toISOString(), value: franceMW(t), unit: "MW", updated_date: nowIso() });
  });
  route("GET", /^consumption-france\/forecast$/, ({ query }) => {
    const to = addDays(TODAY, (Number(query.days) || 2) + 1);
    return ok({ short_term: [{ type: "D-1", values: franceSeries("D-1", addDays(TODAY, 1), to, 15) }], period: { start: TODAY.toISOString(), end: to.toISOString() } });
  });
  const solarMW = (t) => { const h = t.getHours() + t.getMinutes() / 60; const sun = Math.max(0, Math.sin(((h - 7) / 12) * Math.PI)); return Math.round(14000 * sun * (0.55 + 0.45 * rand(`sol${ymd(t)}`))); };
  const windMW = (t) => Math.round(4000 + 9000 * (0.5 + 0.5 * Math.sin(t.getTime() / 864e5 * 1.7 + rand(`w${ymd(t)}`))) * (0.85 + 0.15 * Math.sin(t.getHours() / 3)));
  const genValues = (fn, from, to) => { const out = []; for (let t = new Date(from); t < to; t = new Date(t.getTime() + 36e5)) out.push({ start_date: t.toISOString(), end_date: new Date(t.getTime() + 36e5).toISOString(), value: fn(t), updated_date: nowIso() }); return out; };
  route("GET", /^generation-forecast\/mix$/, () => {
    const from = TODAY, to = addDays(TODAY, 3); const mix = [];
    for (let t = new Date(from); t < to; t = new Date(t.getTime() + 36e5)) { const s = solarMW(t), w = windMW(t); mix.push({ start_date: t.toISOString(), solar: s, wind: w, total_renewable: s + w }); }
    return ok({ forecast_type: "D-1", mix, period: { start: from.toISOString(), end: to.toISOString() } });
  });
  route("GET", /^generation-forecast\/(solar|wind)$/, ({ params, query }) => {
    const to = addDays(TODAY, Number(query.days) || 3);
    return ok({ production_type: params[0].toUpperCase(), forecasts: [{ forecast_type: "D-1", values: genValues(params[0] === "solar" ? solarMW : windMW, TODAY, to) }], period: { start: TODAY.toISOString(), end: to.toISOString() } });
  });
  route("GET", /^generation-forecast$/, () => {
    const to = addDays(TODAY, 3);
    return ok({ forecasts: [
      { production_type: "SOLAR", forecast_type: "D-1", values: genValues(solarMW, TODAY, to) },
      { production_type: "WIND", forecast_type: "D-1", values: genValues(windMW, TODAY, to) }], period: { start: TODAY.toISOString(), end: to.toISOString() } });
  });

  /* ------------------------------------------------------- Offres */
  const PROVIDERS = [
    { id: "demo-edf", name: "EDF", website: "https://particulier.edf.fr", active_offers_count: 1, is_active: true, last_update: "2026-02-06T00:00:00Z" },
    { id: "demo-fournisseur", name: "Fournisseur Démo", website: null, active_offers_count: 2, is_active: true, last_update: "2026-02-06T00:00:00Z" },
  ];
  const OFFERS = [
    { id: "demo-edf-tempo-6", provider_id: "demo-edf", name: "Tempo", offer_type: "TEMPO", power_kva: 6, subscription_price: 15.8,
      tempo_blue_hc: 0.1356, tempo_blue_hp: 0.1654, tempo_white_hc: 0.1536, tempo_white_hp: 0.1921, tempo_red_hc: 0.1615, tempo_red_hp: 0.7295,
      hc_schedules: { "1": "22:00-06:00" }, price_updated_at: "2026-02-06T00:00:00Z", valid_from: "2026-02-01T00:00:00Z", is_active: true },
    { id: "demo-base-6", provider_id: "demo-fournisseur", name: "Base (exemple)", offer_type: "BASE", power_kva: 6, subscription_price: 15.2,
      base_price: 0.1950, price_updated_at: "2026-02-06T00:00:00Z", valid_from: "2026-02-01T00:00:00Z", is_active: true },
    { id: "demo-hchp-6", provider_id: "demo-fournisseur", name: "Heures creuses (exemple)", offer_type: "HC_HP", power_kva: 6, subscription_price: 15.6,
      hc_price: 0.1580, hp_price: 0.2100, hc_schedules: { "1": "22:00-06:00" }, price_updated_at: "2026-02-06T00:00:00Z", valid_from: "2026-02-01T00:00:00Z", is_active: true },
  ];
  route("GET", /^energy\/providers$/, () => ok(PROVIDERS));
  route("GET", /^energy\/offers$/, ({ query }) => ok(query.provider_id ? OFFERS.filter((o) => o.provider_id === query.provider_id) : OFFERS));
  route("GET", /^energy\/offer-types$/, () => ok([
    { code: "BASE", name: "Base", description: "Prix unique", icon: "zap", color: "#3B82F6", required_price_fields: ["base_price"], optional_price_fields: [], display_order: 1 },
    { code: "HC_HP", name: "Heures creuses", description: "Heures pleines / heures creuses", icon: "clock", color: "#8B5CF6", required_price_fields: ["hc_price", "hp_price"], optional_price_fields: [], display_order: 2 },
    { code: "TEMPO", name: "Tempo", description: "Jours bleus, blancs et rouges", icon: "palette", color: "#EF4444",
      required_price_fields: ["tempo_blue_hc", "tempo_blue_hp", "tempo_white_hc", "tempo_white_hp", "tempo_red_hc", "tempo_red_hp"], optional_price_fields: [], display_order: 3 },
  ]));

  /* ------------------------------------------------------ Exports */
  const isHc = (i) => i >= 44 || i < 12; // 22h-6h
  const hpHc = (from, to) => {
    let hp = 0, hc = 0;
    eachDay(from, to, (d) => slotsWh(d).forEach((wh, i) => { if (isHc(i)) hc += wh; else hp += wh; }));
    return { hp: Math.round(hp / 10) / 100, hc: Math.round(hc / 10) / 100 };
  };
  const sumKwh = (fn, days) => Math.round(eachDay(addDays(TODAY, -days), TODAY, fn).reduce((a, b) => a + b, 0) * 100) / 100;
  const ago = (min) => new Date(Date.now() - min * 6e4).toISOString();
  const soon = (min) => new Date(Date.now() + min * 6e4).toISOString();
  const CONFIGS = [
    { id: "demo-export-ha", name: "Home Assistant", export_type: "home_assistant",
      config: { mqtt_broker: "core-mosquitto", mqtt_port: 1883, mqtt_username: "mqtt", mqtt_password: "********", mqtt_use_tls: false,
        entity_prefix: "myelectricaldata", discovery_prefix: "homeassistant", ha_url: "http://homeassistant:8123", ha_token: "********",
        statistic_id_prefix: "myelectricaldata", sync_delay_ms: 500, chunk_size: 2000, incremental_import: true,
        mqtt_enabled: true, energy_enabled: true, energy_interval_minutes: 15 },
      usage_point_ids: null, is_enabled: true, export_consumption: true, export_production: true, export_detailed: true,
      export_interval_minutes: 15, next_export_at: soon(9), last_export_at: ago(6), last_export_status: "success", last_export_error: null, export_count: 412 },
    { id: "demo-export-mqtt", name: "MQTT", export_type: "mqtt",
      config: { broker: "core-mosquitto", port: 1883, username: "mqtt", password: "********", use_tls: false, topic_prefix: "myelectricaldata", qos: 1, retain: true },
      usage_point_ids: null, is_enabled: true, export_consumption: true, export_production: true, export_detailed: false,
      export_interval_minutes: 30, next_export_at: soon(21), last_export_at: ago(9), last_export_status: "success", last_export_error: null, export_count: 203 },
    { id: "demo-export-vm", name: "VictoriaMetrics", export_type: "victoriametrics",
      config: { url: "http://victoriametrics:8428", database: "myelectricaldata", username: "", password: "" },
      usage_point_ids: null, is_enabled: true, export_consumption: true, export_production: true, export_detailed: true,
      export_interval_minutes: 60, next_export_at: soon(41), last_export_at: ago(19), last_export_status: "success", last_export_error: null, export_count: 97 },
  ];
  const cfgById = (id) => CONFIGS.find((c) => c.id === id);
  route("GET", /^export\/configs$/, () => ok({ configs: CONFIGS, count: CONFIGS.length }));
  route("GET", /^export\/configs\/([^/]+)$/, ({ params }) => cfgById(params[0]) ? ok(cfgById(params[0])) : err("NOT_FOUND", "Configuration introuvable", 404));
  route("POST", /^export\/configs$/, ({ body }) => {
    const c = { id: `demo-export-${Date.now()}`, is_enabled: true, export_consumption: true, export_production: true, export_detailed: false,
      export_count: 0, last_export_at: null, last_export_status: null, ...body };
    CONFIGS.push(c);
    return ok({ id: c.id, name: c.name, export_type: c.export_type, is_enabled: c.is_enabled, message: "Configuration enregistrée (démo)" });
  });
  route("PUT", /^export\/configs\/([^/]+)$/, ({ params, body }) => {
    const c = cfgById(params[0]);
    if (c && body) Object.assign(c, body, body.config ? { config: { ...c.config, ...body.config } } : {});
    return ok({ id: params[0], name: c?.name, export_type: c?.export_type, is_enabled: c?.is_enabled, message: "Configuration enregistrée (démo)" });
  });
  route("DELETE", /^export\/configs\/([^/]+)$/, ({ params }) => {
    const i = CONFIGS.findIndex((c) => c.id === params[0]); if (i >= 0) CONFIGS.splice(i, 1);
    return ok({ message: "Configuration supprimée (démo)" });
  });
  route("POST", /^export\/configs\/([^/]+)\/test$/, ({ params }) => ok({ success: true,
    message: { home_assistant: "Connexion au broker MQTT et à Home Assistant réussie (simulée)", mqtt: "Connexion au broker réussie (simulée)", victoriametrics: "Connexion à VictoriaMetrics réussie (simulée)" }[cfgById(params[0])?.export_type] || "Connexion réussie (simulée)" }));
  route("POST", /^export\/configs\/([^/]+)\/run$/, ({ params }) => {
    const c = cfgById(params[0]); if (c) { c.last_export_at = new Date().toISOString(); c.export_count++; }
    return ok({ message: "Export lancé (simulé)", status: "started" });
  });

  function haStates() {
    const P = "myelectricaldata", st = [];
    const add = (entity, state, pdl = null, category = "tempo") => st.push({ category, pdl, msg_type: "state", entity: `${P}_${entity}`, state });
    const { s } = seasonStats();
    const price = OFFERS[0];
    add("tempo_today", tempoColor(TODAY)); add("tempo_tomorrow", tempoColor(TEMPO_LAST)); add("tempo_info", "ok");
    add("tempo_days_blue", s.blue_remaining); add("tempo_days_white", s.white_remaining); add("tempo_days_red", s.red_remaining);
    for (const c of ["blue", "white", "red"]) for (const h of ["hc", "hp"]) add(`tempo_price_${c}_${h}`, price[`tempo_${c}_${h}`]);
    add("zen_flex_today", "Normal", null, "zen_flex"); add("zen_flex_tomorrow", "Normal", null, "zen_flex");
    [0, 1, 2].forEach((j) => add(`ecowatt_j${j}`, ecoSignal(addDays(TODAY, j), j).dvalue, null, "ecowatt"));
    const L = `linky_${UP}_consumption`;
    add(L, Math.round(dailyKwh(YESTERDAY) * 100) / 100, UP, "consumption");
    for (const n of [7, 14, 30]) add(`${L}_last${n}day`, sumKwh(dailyKwh, n), UP, "consumption");
    const monday = addDays(TODAY, -((TODAY.getDay() + 6) % 7));
    const periods = { yesterday: [YESTERDAY, TODAY], this_week: [monday, TODAY], this_month: [new Date(TODAY.getFullYear(), TODAY.getMonth(), 1), TODAY], this_year: [new Date(TODAY.getFullYear(), 0, 1), TODAY] };
    for (const [k, [a, b]] of Object.entries(periods)) { const r = hpHc(a, b); add(`${L}_${k}_hp`, r.hp, UP, "consumption"); add(`${L}_${k}_hc`, r.hc, UP, "consumption"); }
    const LP = `linky_${UP_PROD}_production`;
    add(LP, Math.round(solarKwh(YESTERDAY) * 100) / 100, UP_PROD, "production");
    for (const n of [7, 14, 30]) add(`${LP}_last${n}day`, sumKwh(solarKwh, n), UP_PROD, "production");
    return st;
  }
  route("GET", /^export\/configs\/([^/]+)\/metrics$/, ({ params }) => {
    const c = cfgById(params[0]); const t = c?.export_type;
    if (t === "home_assistant") return ok({ success: true, message: "États lus sur le broker (démo)", metrics: haStates(), errors: [], broker: "core-mosquitto:1883", entity_prefix: "myelectricaldata" });
    if (t === "mqtt") {
      const metrics = haStates().map((m) => ({ category: m.category, pdl: m.pdl, topic: `myelectricaldata/${m.entity.replace("myelectricaldata_", "").replace(/_/g, "/")}`, value: m.state, retained: true }));
      return ok({ success: true, message: "Messages lus sur le broker (démo)", metrics, errors: [], broker: "core-mosquitto:1883", topic_prefix: "myelectricaldata" });
    }
    const metrics = eachDay(addDays(TODAY, -7), TODAY, (d) => ({ category: "consumption", pdl: UP, name: "myelectricaldata_consumption_daily_wh",
      value: Math.round(dailyKwh(d) * 1000), timestamp: `${ymd(d)}T00:00:00+02:00`, tags: { usage_point_id: UP, granularity: "daily" } })).reverse();
    return ok({ success: true, message: "Dernières séries écrites (démo)", metrics, errors: [], url: "http://victoriametrics:8428", database: "myelectricaldata" });
  });
  route("GET", /^export\/configs\/([^/]+)\/ha-statistics$/, () => {
    const ids = ["blue_hc", "blue_hp", "white_hc", "white_hp", "red_hc", "red_hp"].flatMap((k) => [`myelectricaldata:consumption_${UP}_${k}`, `myelectricaldata:cost_${UP}_${k}`]).concat([`myelectricaldata:production_${UP_PROD}`]);
    return ok({ success: true, message: `${ids.length} statistiques trouvées`, statistic_ids: ids, details: ids.map((id) => ({ statistic_id: id, source: "myelectricaldata", unit_of_measurement: id.includes(":cost_") ? "EUR" : "kWh" })) });
  });
  route("POST", /^export\/configs\/([^/]+)\/ha-statistics\/clear$/, () => ok({ success: true, message: "Statistiques supprimées (démo)", cleared_count: 13 }));
  route("POST", /^export\/configs\/([^/]+)\/ha-statistics\/import$/, () => ok({ success: true, message: "Import terminé (démo)", consumption: 48, cost: 48, production: 24, errors: [] }));

  // Progression en direct (EventSource) des boutons « Exécuter » et « Importer »
  window.__DEMO__.sse = (url) => {
    const p = url.pathname;
    if (/ha-statistics\/import\/stream$/.test(p)) {
      const steps = ["Lecture des statistiques existantes", "Calcul de la consommation par couleur Tempo", "Calcul des coûts", "Envoi à Home Assistant"];
      return [...steps.map((m, i) => ["progress", { step: i + 1, total_steps: steps.length, percent: Math.round(((i + 1) / steps.length) * 100), message: m, consumption: i * 12, cost: i * 12, production: i * 6 }]),
        ["complete", { success: true, message: "Import terminé (démo)", consumption: 48, cost: 48, production: 24, errors: [] }]];
    }
    const steps = ["Consommation", "Production", "Tempo", "EcoWatt", "Carte Linky"];
    const ev = [];
    steps.forEach((m, i) => ev.push(["progress", { step: i + 1, total_steps: steps.length, percent: Math.round(((i + 1) / steps.length) * 100), message: `Export : ${m}`, status: "running",
      consumption: i >= 0 ? 9 : 0, production: i >= 1 ? 4 : 0, tempo: i >= 2 ? 12 : 0, ecowatt: i >= 3 ? 3 : 0, linky_card: i >= 4 ? 1 : 0 }]));
    const isHa = /demo-export-ha/.test(p);
    if (isHa) ["Lecture des statistiques", "Calcul", "Envoi"].forEach((m, i) => ev.push(["energy_dashboard_progress", { step: i + 1, total_steps: 3, percent: Math.round(((i + 1) / 3) * 100), message: `Energy Dashboard : ${m}`, ed_consumption: 0, ed_cost: 0, ed_production: 0 }]));
    ev.push(["complete", { success: true, message: "Export terminé (démo)", consumption: 9, production: 4, tempo: 12, ecowatt: 3, linky_card: 1,
      ...(isHa ? { energy_dashboard: { success: true, consumption: 0, cost: 0, production: 0 } } : {}), errors: null }]);
    return ev;
  };

  window.__DEMO__.data = { PDL, PDL_PROD, OFFERS, CONFIGS, tempoColor, dailyKwh, solarKwh, ymd };
})();
