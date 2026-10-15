#!/bin/bash
# Import de l'historique de l'add-on MyElectricalData v1 (cache.db) avec l'outil officiel
# scripts/import_v1.py (MyElectricalData 2.7.0 et suivantes).
#
# Lancé en arrière-plan par run.sh une fois le backend démarré : l'outil n'importe que les PDL
# déjà connus de la version new, il faut donc attendre que le backend les ait récupérés.
# Aucune donnée existante n'est écrasée ; l'import peut être relancé sans risque.
#
# Utilisation : import_v1.sh <cache.db> <true|false : simulation>
# Variables attendues : PG_BIN, DB_NAME, DATABASE_URL (exportées par run.sh)
set -uo pipefail

SRC="${1:?chemin de cache.db manquant}"
DRY_RUN="${2:-false}"
WAIT_MAX="${IMPORT_V1_WAIT_MAX:-180}"   # nombre d'attentes de 10 s (30 min)
TOOL=/app/scripts/import_v1.py

log() { echo "[import-v1] $*"; }
pg() { runuser -u postgres -- "$PG_BIN/psql" -tA -d "$DB_NAME" -c "$1" 2>/dev/null; }

if [ ! -f "$TOOL" ]; then
  log "Outil d'import absent de cette version de MyElectricalData : import ignoré"
  exit 0
fi
if [ ! -f "$SRC" ]; then
  log "Fichier introuvable : $SRC (import ignoré)"
  exit 0
fi

# --- Attendre les PDL de la version new (migrations appliquées et PDL récupérés) ---
n=0
for i in $(seq 1 "$WAIT_MAX"); do
  n=$(pg "SELECT count(*) FROM pdls" || true)
  [[ "$n" =~ ^[0-9]+$ ]] || n=0
  [ "$n" -gt 0 ] && break
  [ "$i" -eq 1 ] && log "En attente des PDL de la version new avant l'import..."
  sleep 10
done
if [ "$n" -eq 0 ]; then
  log "Aucun PDL dans la version new après $((WAIT_MAX * 10 / 60)) min : import non lancé."
  log "Vérifiez la synchronisation (page Tableau de bord), puis redémarrez l'add-on."
  exit 0
fi
# Laisser le temps aux autres PDL du compte d'être enregistrés
sleep "${IMPORT_V1_SETTLE:-30}"
log "$(pg "SELECT count(*) FROM pdls") PDL présent(s) dans la version new"

# --- Copie de travail : la base v1 n'est jamais modifiée, et la copie (qui contient les anciens
#     tokens v1) est supprimée à la fin ---
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT
cp "$SRC" "$WORK/cache.db"
for ext in -wal -shm; do [ -f "$SRC$ext" ] && cp "$SRC$ext" "$WORK/cache.db$ext"; done
log "Lecture de $SRC"

# --- Révision Alembic : certaines installations v1 (images non publiées sur GitHub, ex. via
#     l'add-on d'alexbelgium) ont une révision inconnue de l'outil, avec des tables de données
#     identiques. Si toutes les colonnes lues par l'outil sont présentes, la COPIE est alignée
#     sur la révision attendue ; sinon l'outil refusera la base avec son propre message. ---
python - "$WORK/cache.db" /app/src/services/import_v1.py <<'PY' || exit 1
import re, sqlite3, sys
db, tool = sys.argv[1:]
m = re.search(r'V1_ALEMBIC_HEAD\s*=\s*"(\w+)"', open(tool, encoding="utf-8").read())
if not m:
    sys.exit(0)
head = m.group(1)
c = sqlite3.connect(db)
try:
    rev = c.execute("SELECT version_num FROM alembic_version").fetchone()
except sqlite3.Error:
    sys.exit(0)  # pas une base v1 : l'outil le dira
rev = rev[0] if rev else None
if rev == head:
    sys.exit(0)
needed = {
    "usage_points": {"usage_point_id"},
    "consumption_daily": {"usage_point_id", "date", "value", "blacklist", "fail_count"},
    "production_daily": {"usage_point_id", "date", "value", "blacklist", "fail_count"},
    "consumption_detail": {"usage_point_id", "date", "value", "interval"},
    "production_detail": {"usage_point_id", "date", "value", "interval"},
    "consumption_daily_max_power": {"usage_point_id", "date", "event_date", "value", "blacklist", "fail_count"},
}
missing = []
for table, cols in needed.items():
    have = {r[1] for r in c.execute(f"PRAGMA table_info({table})")}
    missing += [f"{table}.{col}" for col in sorted(cols - have)]
if missing:
    print(f"[import-v1] Révision v1 {rev} inconnue et colonnes absentes : {', '.join(missing)}")
    sys.exit(0)  # l'outil refusera la base avec son propre message
c.execute("UPDATE alembic_version SET version_num = ?", (head,))
c.commit()
print(f"[import-v1] Révision v1 {rev} inconnue de l'outil, mais tables de données identiques : "
      f"copie de travail alignée sur {head} (le fichier d'origine n'est pas modifié)")
PY

ARGS=("$WORK/cache.db")
if [ "$DRY_RUN" = "true" ]; then
  ARGS+=(--dry-run)
  log "Mode simulation : rien ne sera écrit"
else
  log "Sauvegarde de la base new dans /data/backup-avant-import-v1.sql"
  if ! runuser -u postgres -- "$PG_BIN/pg_dump" "$DB_NAME" > /data/backup-avant-import-v1.sql; then
    log "Sauvegarde impossible : import annulé, aucune donnée n'a été modifiée"
    exit 1
  fi
fi

(cd /app && python "$TOOL" "${ARGS[@]}") 2>&1 | sed -u 's/^/[import-v1] /'
rc=${PIPESTATUS[0]}

if [ "$rc" -ne 0 ]; then
  log "Import en échec (code $rc) : voir les lignes ci-dessus. Les données déjà présentes ne sont pas touchées."
elif [ "$DRY_RUN" = "true" ]; then
  log "Simulation terminée : désactivez « Simulation de l'import » et redémarrez l'add-on pour importer réellement."
else
  log "Import terminé. Vous pouvez désactiver l'option « Importer l'historique de la v1 »."
fi
exit "$rc"
