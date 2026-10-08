#!/bin/bash
# Import de l'historique de consommation de l'add-on MyElectricalData v1 (cache.db SQLite)
# dans la base PostgreSQL de la version new. N'écrase jamais une donnée existante.
set -euo pipefail

SRC="${1:?chemin de cache.db manquant}"
log() { echo "[import-v1] $*"; }

if [ ! -f "$SRC" ]; then
  log "Fichier introuvable : $SRC (import ignoré)"
  exit 0
fi

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
chmod 755 "$WORK"
cp "$SRC" "$WORK/v1.db"
log "Lecture de $SRC"

python3 - "$WORK/v1.db" "$WORK/v1.csv" <<'PY'
import csv, sqlite3, sys
db, out = sys.argv[1], sys.argv[2]
c = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
check = c.execute("PRAGMA integrity_check").fetchone()[0]
if check != "ok":
    sys.exit(f"[import-v1] Base v1 invalide ({check}), import annulé")
n = {"daily": 0, "detailed": 0}
with open(out, "w", newline="") as f:
    w = csv.writer(f)
    for pdl, d, v in c.execute("SELECT usage_point_id, date, value FROM consumption_daily WHERE blacklist = 0"):
        w.writerow([pdl, d[:10], "daily", "", v]); n["daily"] += 1
    for pdl, d, v in c.execute("SELECT usage_point_id, date, value FROM consumption_detail WHERE blacklist = 0"):
        w.writerow([pdl, d[:10], "detailed", d[11:16], v]); n["detailed"] += 1
print(f"[import-v1] Lu dans la v1 : {n['daily']} jours, {n['detailed']} mesures détaillées")
try:
    prod = c.execute("SELECT (SELECT count(*) FROM production_daily) + (SELECT count(*) FROM production_detail)").fetchone()[0]
    if prod:
        print(f"[import-v1] {prod} mesures de production présentes dans la v1, non importées (pas encore prises en charge)")
except sqlite3.Error:
    pass
PY
chmod 644 "$WORK/v1.csv"

log "Sauvegarde de la base new dans /data/backup-avant-import-v1.sql"
runuser -u postgres -- "$PG_BIN/pg_dump" "$DB_NAME" > /data/backup-avant-import-v1.sql

runuser -u postgres -- "$PG_BIN/psql" -v ON_ERROR_STOP=1 -q -d "$DB_NAME" <<SQL
BEGIN;
CREATE TEMP TABLE v1_import (usage_point_id varchar(14), date date, granularity text, interval_start varchar(5), value integer);
\copy v1_import FROM '$WORK/v1.csv' WITH (FORMAT csv)
CREATE TEMP VIEW v1_match AS
  SELECT i.*, c.value AS new_value FROM v1_import i
  LEFT JOIN consumption_data c ON c.usage_point_id = i.usage_point_id AND c.date = i.date
   AND c.granularity::text = i.granularity
   AND (i.granularity = 'daily' OR c.interval_start = i.interval_start);
\echo '[import-v1] Bilan par type :'
SELECT granularity, count(new_value) AS deja_present, count(*) FILTER (WHERE new_value <> value) AS ecarts, count(*) FILTER (WHERE new_value IS NULL) AS ajoutes FROM v1_match GROUP BY 1 ORDER BY 1;
INSERT INTO consumption_data (id, usage_point_id, date, granularity, interval_start, value, source, created_at, updated_at)
  SELECT DISTINCT ON (usage_point_id, date, granularity, interval_start)
         gen_random_uuid()::text, usage_point_id, date, granularity::datagranularity, interval_start, value, 'myelectricaldata', now(), now()
  FROM v1_match WHERE new_value IS NULL;
COMMIT;
SQL
log "Import terminé. Vous pouvez désactiver l'option import_v1."
