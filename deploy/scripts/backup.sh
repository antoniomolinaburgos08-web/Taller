#!/usr/bin/env bash
# ============================================================
# Backup diario del stack (bases de datos + uploads de Strapi).
# Programación recomendada en cron (todos los días a las 03:00):
#   0 3 * * *  /ruta/al/repo/deploy/scripts/backup.sh >> /var/log/taller-backup.log 2>&1
# ============================================================
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_DIR="$(cd "$HERE/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/taller}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
DATE=$(date +%Y%m%d-%H%M)

mkdir -p "$BACKUP_DIR"
cd "$DEPLOY_DIR"

# Cargar variables (contraseñas de las BD)
set -a
# shellcheck disable=SC1091
source .env
set +a

echo "[$(date -Is)] Iniciando backup en $BACKUP_DIR"

# Strapi
docker compose exec -T strapi-db \
  pg_dump -U "$STRAPI_DB_USER" "$STRAPI_DB_NAME" | gzip > "$BACKUP_DIR/strapi-$DATE.sql.gz"
echo "  · strapi-$DATE.sql.gz ($(du -h "$BACKUP_DIR/strapi-$DATE.sql.gz" | cut -f1))"

# Chatwoot
docker compose exec -T chatwoot-db \
  pg_dump -U "$CHATWOOT_DB_USER" "$CHATWOOT_DB_NAME" | gzip > "$BACKUP_DIR/chatwoot-$DATE.sql.gz"
echo "  · chatwoot-$DATE.sql.gz ($(du -h "$BACKUP_DIR/chatwoot-$DATE.sql.gz" | cut -f1))"

# Uploads de Strapi (imágenes de coches, logos)
docker run --rm \
  -v taller_strapi_uploads:/data:ro \
  -v "$BACKUP_DIR:/backup" \
  alpine:3 tar czf "/backup/strapi-uploads-$DATE.tar.gz" -C /data .
echo "  · strapi-uploads-$DATE.tar.gz ($(du -h "$BACKUP_DIR/strapi-uploads-$DATE.tar.gz" | cut -f1))"

# Rotación: eliminar backups más antiguos que RETENTION_DAYS
find "$BACKUP_DIR" -type f -mtime "+$RETENTION_DAYS" -delete
echo "[$(date -Is)] Backup terminado. Conservados últimos $RETENTION_DAYS días."
