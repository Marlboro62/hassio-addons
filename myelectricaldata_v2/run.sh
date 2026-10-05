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
log "Démarrage de PostgreSQL..."
runuser -u postgres -- "$PG_BIN/pg_ctl" -D "$PGDATA" -l /data/pglog/postgres.log \
  -o "-c listen_addresses=127.0.0.1" -w start

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
  printf 'window.__ENV__ = {\n  VITE_API_BASE_URL: "/api",\n  VITE_BACKEND_URL: "/api",\n  VITE_SERVER_MODE: "false",\n  VITE_DEFAULT_MQTT_BROKER: "core-mosquitto",\n  VITE_DEFAULT_MQTT_PORT: "1883",\n  VITE_DEFAULT_TOPIC_PREFIX: "myelectricaldata",\n  VITE_DEFAULT_ENTITY_PREFIX: "myelectricaldata",\n  VITE_DEFAULT_DISCOVERY_PREFIX: "homeassistant",\n  VITE_DEFAULT_HA_URL: "http://homeassistant:8123",\n  VITE_DEFAULT_VM_URL: "",\n};\n'
  if [ -n "$PRESET" ]; then
    printf '(function(){var k="date-preferences-storage",m="med-addon-periode",v="%s-%d-%d",s=JSON.stringify({state:{preset:"%s",customDate:{day:%d,month:%d}},version:0});function a(){try{if(localStorage.getItem(m)!==v||!localStorage.getItem(k)){localStorage.setItem(k,s);localStorage.setItem(m,v);return true}}catch(e){}return false}a();window.addEventListener("load",function(){[1000,3000].forEach(function(t){setTimeout(function(){try{if(a()&&!sessionStorage.getItem("med-addon-reload")){sessionStorage.setItem("med-addon-reload","1");location.reload()}}catch(e){}},t)})})})();\n' "$PRESET" "$JOUR" "$MOIS" "$PRESET" "$JOUR" "$MOIS"
  fi
} > /var/www/med/env.js
log "Période d'analyse : ${PERIODE}$( [ "$PRESET" = custom ] && echo " (à partir du ${JOUR}/${MOIS})" )"

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
