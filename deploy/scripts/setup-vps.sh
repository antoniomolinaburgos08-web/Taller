#!/usr/bin/env bash
# ============================================================
# Bootstrap del VPS para El Taller de Migue
# ------------------------------------------------------------
# Probado en Ubuntu 22.04 y 24.04 LTS.
# Deja el servidor listo con: Docker + firewall + fail2ban + swap.
#
# Uso (ejecútalo como usuario NORMAL con sudo, no como root):
#   curl -fsSL https://raw.githubusercontent.com/<repo>/main/deploy/scripts/setup-vps.sh | bash
# o bien tras clonar el repo:
#   bash deploy/scripts/setup-vps.sh
# ============================================================
set -euo pipefail

log() { printf '\n\033[1;34m▶ %s\033[0m\n' "$*"; }

if [ "$EUID" -eq 0 ]; then
  echo "Ejecuta este script como usuario NORMAL con sudo, no como root." >&2
  exit 1
fi

log "1/6 · Actualizando el sistema"
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get -y upgrade
sudo apt-get -y install ca-certificates curl gnupg lsb-release ufw fail2ban unattended-upgrades

log "2/6 · Instalando Docker Engine + Compose"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
fi
sudo usermod -aG docker "$USER"

log "3/6 · Configurando firewall UFW (SSH, HTTP, HTTPS)"
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp
sudo ufw --force enable

log "4/6 · Activando fail2ban (protección SSH)"
sudo systemctl enable --now fail2ban

log "5/6 · Habilitando actualizaciones de seguridad automáticas"
echo 'APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";' | sudo tee /etc/apt/apt.conf.d/20auto-upgrades >/dev/null

log "6/6 · Creando 2 GB de swap si el VPS no tiene"
if ! swapon --show | grep -q .; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

cat <<'EOF'

============================================================
✅ VPS listo.

Siguiente:
  1. Cierra la sesión SSH y vuelve a entrar (para que se aplique el grupo docker).
  2. cd al repositorio → cd deploy
  3. Copia las plantillas y rellena tus valores:
        cp .env.example .env && nano .env
        cp chatwoot.env.example chatwoot.env && nano chatwoot.env
  4. Arranca todo:
        docker compose up -d
  5. Programa los backups en cron (una vez):
        (crontab -l 2>/dev/null; echo "0 3 * * * $(pwd)/scripts/backup.sh >> /var/log/taller-backup.log 2>&1") | crontab -

Guía completa: docs/DESPLIEGUE_VPS.md
============================================================
EOF
