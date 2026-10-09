#!/bin/bash
set -euo pipefail

OPTIONS=/data/options.json
PGDATA=/data/postgres
PG_BIN=$(ls -d /usr/lib/postgresql/*/bin | sort -V | tail -1)
DB_NAME=myelectricaldata_client
DB_USER=myelectricaldata

log() { echo "[addon] $*"; }
gen() { head -c "$1" /dev/urandom | od -An -tx1 | tr -d ' \n'; }
log "Version amont MyElectricalData : ${MED_VERSION:-inconnue}"

# --- Options de l'add-on ---
export MED_CLIENT_ID=$(jq -r '.med_client_id // ""' "$OPTIONS")
export MED_CLIENT_SECRET=$(jq -r '.med_client_secret // ""' "$OPTIONS")
export MED_API_URL=$(jq -r '.med_api_url // "https://www.v2.myelectricaldata.fr/api"' "$OPTIONS")
export DEBUG=$(jq -r '.debug // false' "$OPTIONS")
GRAFANA_PASS=$(jq -r '.grafana_password // ""' "$OPTIONS")
if [ -z "$MED_CLIENT_ID" ] || [ -z "$MED_CLIENT_SECRET" ]; then
  log "ERREUR : renseignez med_client_id et med_client_secret dans la configuration."
  exit 1
fi

# --- Secrets persistants dans /data ---
[ -s /data/secret_key ] || gen 32 > /data/secret_key
[ -s /data/pg_password ] || gen 24 > /data/pg_password
chmod 600 /data/secret_key /data/pg_password
export SECRET_KEY=$(cat /data/secret_key)
PGPASS=$(cat /data/pg_password)

# --- PostgreSQL ---
mkdir -p /run/postgresql "$PGDATA" /data/pglog
chown postgres:postgres /run/postgresql "$PGDATA" /data/pglog
chmod 700 "$PGDATA"
if [ ! -s "$PGDATA/PG_VERSION" ]; then
  log "Initialisation de PostgreSQL..."
  runuser -u postgres -- "$PG_BIN/initdb" -D "$PGDATA" -U postgres -E UTF8 \
    --auth-local=trust --auth-host=scram-sha-256
fi

# --- Accès Grafana optionnel (rôle grafana_ro en lecture seule) ---
PG_LISTEN="127.0.0.1"
HBA="$PGDATA/pg_hba.conf"
sed -i '/# med-grafana$/d' "$HBA"
if [ -n "$GRAFANA_PASS" ]; then
  echo "host $DB_NAME grafana_ro 0.0.0.0/0 scram-sha-256 # med-grafana" >> "$HBA"
  PG_LISTEN="0.0.0.0"
fi

log "Démarrage de PostgreSQL..."
runuser -u postgres -- "$PG_BIN/pg_ctl" -D "$PGDATA" -l /data/pglog/postgres.log \
  -o "-c listen_addresses=$PG_LISTEN" -w start

pg() { runuser -u postgres -- "$PG_BIN/psql" -v ON_ERROR_STOP=1 -tA "$@"; }
if [ "$(pg -c "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'")" = "1" ]; then
  pg -c "ALTER ROLE $DB_USER PASSWORD '$PGPASS'" >/dev/null
else
  pg -c "CREATE ROLE $DB_USER LOGIN PASSWORD '$PGPASS'" >/dev/null
fi
if [ "$(pg -c "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")" != "1" ]; then
  pg -c "CREATE DATABASE $DB_NAME OWNER $DB_USER" >/dev/null
fi
export DATABASE_URL="postgresql+asyncpg://$DB_USER:$PGPASS@127.0.0.1:5432/$DB_NAME"

# --- Import optionnel de l'historique de la v1 ---
if [ "$(jq -r '.import_v1 // false' "$OPTIONS")" = "true" ]; then
  log "Import des données MyElectricalData v1 demandé"
  (cd /app && alembic upgrade head) || true
  PG_BIN="$PG_BIN" DB_NAME="$DB_NAME" /import_v1.sh "$(jq -r '.import_v1_path // "/homeassistant/myelectricaldata/cache.db"' "$OPTIONS")" \
    || log "Import v1 en échec : démarrage normal, aucune donnée n'a été modifiée"
fi

# --- Droits du rôle Grafana (après l'import, pour que les tables existent) ---
if [ -n "$GRAFANA_PASS" ]; then
  pg -d "$DB_NAME" -v pw="$GRAFANA_PASS" >/dev/null <<'SQL'
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'grafana_ro') THEN
    CREATE ROLE grafana_ro;
  END IF;
END $$;
ALTER ROLE grafana_ro WITH LOGIN PASSWORD :'pw';
GRANT CONNECT ON DATABASE myelectricaldata_client TO grafana_ro;
GRANT USAGE ON SCHEMA public TO grafana_ro;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['consumption_data','tempo_days','max_power_data',
    'energy_offers','energy_providers','ecowatt','consumption_france',
    'generation_forecast','production_data'] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('GRANT SELECT ON public.%I TO grafana_ro', t);
    END IF;
  END LOOP;
END $$;
SQL
  log "Accès Grafana activé : rôle grafana_ro (lecture seule), port 5432"
else
  pg -c "DO \$\$ BEGIN IF EXISTS (SELECT FROM pg_roles WHERE rolname='grafana_ro') THEN ALTER ROLE grafana_ro NOLOGIN; END IF; END \$\$;" >/dev/null
fi

# --- Interface : env.js et période d'analyse optionnelle ---
PERIODE=$(jq -r '.periode_analyse // "defaut"' "$OPTIONS")
DEBUT=$(jq -r '.periode_debut // "1/9"' "$OPTIONS")
case "$PERIODE" in
  tempo) PRESET=tempo ;;
  glissante) PRESET=rolling ;;
  calendaire) PRESET=calendar ;;
  personnalisee) PRESET=custom ;;
  *) PRESET="" ;;
esac
JOUR=$(( 10#${DEBUT%%/*} )); MOIS=$(( 10#${DEBUT##*/} ))
{
  printf 'window.__ENV__ = {\n  VITE_API_BASE_URL: "/api",\n  VITE_BACKEND_URL: "/api",\n  VITE_SERVER_MODE: "false",\n  VITE_BASE_PATH: "",\n  VITE_DEFAULT_MQTT_BROKER: "core-mosquitto",\n  VITE_DEFAULT_MQTT_PORT: "1883",\n  VITE_DEFAULT_TOPIC_PREFIX: "myelectricaldata",\n  VITE_DEFAULT_ENTITY_PREFIX: "myelectricaldata",\n  VITE_DEFAULT_DISCOVERY_PREFIX: "homeassistant",\n  VITE_DEFAULT_HA_URL: "http://homeassistant:8123",\n  VITE_DEFAULT_VM_URL: "",\n};\n'
  if [ -n "$PRESET" ]; then
    printf '(function(){var k="date-preferences-storage",m="med-addon-periode",v="%s-%d-%d",s=JSON.stringify({state:{preset:"%s",customDate:{day:%d,month:%d}},version:0});function a(){try{if(localStorage.getItem(m)!==v||!localStorage.getItem(k)){localStorage.setItem(k,s);localStorage.setItem(m,v);return true}}catch(e){}return false}a();window.addEventListener("load",function(){[1000,3000].forEach(function(t){setTimeout(function(){try{if(a()&&!sessionStorage.getItem("med-addon-reload")){sessionStorage.setItem("med-addon-reload","1");location.reload()}}catch(e){}},t)})})})();\n' "$PRESET" "$JOUR" "$MOIS" "$PRESET" "$JOUR" "$MOIS"
  fi
} > /var/www/med/env.js
cat >> /var/www/med/env.js <<'JS'
(function(){var CL="https://github.com/Marlboro62/hassio-addons/blob/master/myelectricaldata_new/CHANGELOG.md",el=null;function draw(d){if(!d||!d.version)return;if(!el){el=document.createElement("a");el.id="med-addon-version";el.target="_blank";el.rel="noopener";el.href=CL;el.style.cssText="position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;font:12px/1.4 system-ui,sans-serif;text-decoration:none;color:#e5e7eb;background:rgba(17,24,39,.85);box-shadow:0 2px 8px rgba(0,0,0,.3)";document.body.appendChild(el)}var n=d.behind||(d.update?1:0),up=n>0,c=n>=2?"#ef4444":up?"#f59e0b":"#22c55e";el.style.border="1px solid "+c;el.title=up?"Mettez à jour l'add-on depuis Home Assistant (Paramètres > Applications)":"Journal des modifications";el.innerHTML='<span style="width:8px;height:8px;border-radius:50%;background:'+c+'"></span>'+(n>=2?"Add-on "+d.version+" · <b>"+n+" versions de retard</b> (dernière : "+d.latest+")":up?"Add-on "+d.version+" · mise à jour disponible : <b>"+d.latest+"</b>":"Add-on "+d.version+" · à jour")}function load(){fetch("/addon-version.json",{cache:"no-store"}).then(function(r){return r.ok?r.json():null}).then(draw).catch(function(){})}function start(){load();setInterval(load,36e5)}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start()})();
JS
log "Période d'analyse : ${PERIODE}$( [ "$PRESET" = custom ] && echo " (à partir du ${JOUR}/${MOIS})" )"

# --- Version de l'add-on pour l'interface (badge, via l'API du Supervisor) ---
addon_version() {
  [ -n "${SUPERVISOR_TOKEN:-}" ] || return 0
  python3 - <<'PY' || true
import json, os, urllib.request
req = urllib.request.Request("http://supervisor/addons/self/info",
                             headers={"Authorization": "Bearer " + os.environ["SUPERVISOR_TOKEN"]})
try:
    d = json.load(urllib.request.urlopen(req, timeout=10))["data"]
except Exception:
    raise SystemExit(0)
behind = 0
if d.get("update_available"):
    behind = 1
    try:
        req = urllib.request.Request("http://supervisor/addons/self/changelog",
                                     headers={"Authorization": "Bearer " + os.environ["SUPERVISOR_TOKEN"]})
        txt = urllib.request.urlopen(req, timeout=10).read().decode("utf-8", "replace")
        vers = [l[3:].split()[0] for l in txt.splitlines() if l.startswith("## ") and l[3:].strip()]
        if d.get("version") in vers:
            behind = max(1, vers.index(d.get("version")))
    except Exception:
        pass
out = {"version": d.get("version"), "latest": d.get("version_latest"),
       "update": bool(d.get("update_available")), "behind": behind,
       "upstream": os.environ.get("MED_VERSION", "")}
tmp = "/var/www/med/addon-version.json.tmp"
with open(tmp, "w") as f:
    json.dump(out, f)
os.replace(tmp, "/var/www/med/addon-version.json")
PY
}
( while true; do addon_version; sleep 3600; done ) &

# --- nginx (interface web sur 8100) ---
log "Démarrage de nginx..."
nginx

# --- Arrêt propre ---
stop_all() {
  log "Arrêt en cours..."
  if [ -n "${BACKEND_PID:-}" ]; then kill -TERM "$BACKEND_PID" 2>/dev/null || true; wait "$BACKEND_PID" 2>/dev/null || true; fi
  nginx -s quit 2>/dev/null || true
  runuser -u postgres -- "$PG_BIN/pg_ctl" -D "$PGDATA" -m fast -w stop || true
  exit "${1:-0}"
}
trap 'stop_all 0' TERM INT

# --- Backend officiel (migrations + uvicorn) ---
log "Démarrage du backend..."
cd /app
/app/entrypoint.sh &
BACKEND_PID=$!
set +e
wait "$BACKEND_PID"
RC=$?
log "Backend arrêté (code $RC)"
stop_all "$RC"
