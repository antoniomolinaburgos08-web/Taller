#!/usr/bin/env bash
# ============================================================
# Restaurar el stack desde un backup.
# Uso: bash deploy/scripts/restore.sh <fecha-YYYYMMDD-HHMM>
#
# Ejemplo: bash deploy/scripts/restore.sh 20260706-0300
#
# Los archivos deben estar en $BACKUP_DIR (por defecto /var/backups/taller).
# ============================================================
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: $0 <YYYYMMDD-HHMM>" >&2
  exit 1
fi

DATE="$1"
HERE="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_DIR="$(cd "$HERE/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/taller}"

STRAPI_FILE="$BACKUP_DIR/strapi-$DATE.sql.gz"
CHAT_FILE="$BACKUP_DIR/chatwoot-$DATE.sql.gz"
UPLOADS_FILE="$BACKUP_DIR/strapi-uploads-$DATE.tar.gz"

for f in "$STRAPI_FILE" "$CHAT_FILE" "$UPLOADS_FILE"; do
  [ -f "$f" ] || { echo "Falta el archivo: $f" >&2; exit 1; }
done

cd "$DEPLOY_DIR"
set -a; source .env; set +a

read -r -p "⚠️  Esto sobrescribirá las bases de datos actuales. ¿Continuar? (escribe SI): " ok
[ "$ok" = "SI" ] || { echo "Cancelado."; exit 1; }

echo "Restaurando base de datos de Strapi..."
gunzip -c "$STRAPI_FILE" | docker compose exec -T strapi-db \
  psql -U "$STRAPI_DB_USER" -d "$STRAPI_DB_NAME"

echo "Restaurando base de datos de Chatwoot..."
gunzip -c "$CHAT_FILE" | docker compose exec -T chatwoot-db \
  psql -U "$CHATWOOT_DB_USER" -d "$CHATWOOT_DB_NAME"

echo "Restaurando uploads de Strapi..."
docker run --rm \
  -v taller_strapi_uploads:/data \
  -v "$BACKUP_DIR:/backup:ro" \
  alpine:3 sh -c "cd /data && tar xzf /backup/strapi-uploads-$DATE.tar.gz"

docker compose restart strapi chatwoot-web chatwoot-worker
echo "✅ Restauración completada."
