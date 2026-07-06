# Guía de despliegue en VPS (Google Cloud, Hetzner, DigitalOcean…)

Todo el stack —web pública, CRM, Strapi y Chatwoot— corre en un solo servidor con Docker y HTTPS automático. Esta guía sirve tal cual para **Google Cloud Compute Engine**, **Hetzner Cloud**, **DigitalOcean**, **Contabo** o cualquier VPS con Ubuntu.

## 1. Qué necesitas

- **Un VPS con Ubuntu 24.04 LTS** (mínimo 2 vCPU y 4 GB de RAM; recomendado 4 vCPU y 8 GB si esperas mucho tráfico).
- **Un dominio**, por ejemplo `eltallerdemigue.es`.
- **Acceso SSH al servidor** con un usuario que no sea `root`.

## 2. Crear el VPS en Google Cloud (opcional, mismo procedimiento para otros)

1. En Google Cloud entra en **Compute Engine → VM instances → Create Instance**.
2. Elige:
   - **Machine type**: `e2-standard-2` (2 vCPU, 8 GB RAM) — suficiente para empezar.
   - **Boot disk**: Ubuntu 24.04 LTS, 40 GB SSD (`pd-balanced`).
   - **Firewall**: marca **"Allow HTTP traffic"** y **"Allow HTTPS traffic"**.
   - **Network → External IP**: cámbialo a **"Static"** para reservar una IP fija.
3. Anota la IP externa.
4. Conéctate por SSH desde la propia consola de Google Cloud o desde tu terminal.

## 3. Apuntar el dominio al VPS

En el panel de tu registrador de dominios (donde compraste `eltallerdemigue.es`) crea tres registros **A** apuntando a la IP del VPS:

| Host                              | Tipo | Valor              |
|-----------------------------------|------|--------------------|
| `@` (o `eltallerdemigue.es`)      | A    | IP del VPS         |
| `www`                             | A    | IP del VPS         |
| `cms`                             | A    | IP del VPS         |
| `chat`                            | A    | IP del VPS         |

Espera 5–15 minutos a que se propaguen. Puedes comprobarlo con `dig eltallerdemigue.es +short` desde el VPS.

## 4. Bootstrap del servidor

Ya conectado por SSH:

```bash
# 1. Instalar git y clonar el repo
sudo apt-get update && sudo apt-get install -y git
git clone https://github.com/antoniomolinaburgos08-web/Taller.git ~/taller
cd ~/taller

# 2. Ejecutar el script de bootstrap (instala Docker, firewall, fail2ban, swap)
bash deploy/scripts/setup-vps.sh

# 3. Cerrar sesión SSH y volver a entrar para que Docker funcione sin sudo
exit
```

Vuelve a conectarte por SSH.

## 5. Configurar los secretos

```bash
cd ~/taller/deploy

# Plantilla principal
cp .env.example .env

# Genera todas las contraseñas necesarias de una vez:
cat <<EOF > /tmp/keys.txt
STRAPI_DB_PASSWORD=$(openssl rand -base64 24)
CHATWOOT_DB_PASSWORD=$(openssl rand -base64 24)
CHATWOOT_REDIS_PASSWORD=$(openssl rand -base64 24)
STRAPI_API_TOKEN_SALT=$(openssl rand -base64 24)
STRAPI_ADMIN_JWT_SECRET=$(openssl rand -base64 24)
STRAPI_TRANSFER_TOKEN_SALT=$(openssl rand -base64 24)
STRAPI_JWT_SECRET=$(openssl rand -base64 24)
STRAPI_ENCRYPTION_KEY=$(openssl rand -base64 24)
STRAPI_APP_KEYS=$(openssl rand -base64 24),$(openssl rand -base64 24),$(openssl rand -base64 24),$(openssl rand -base64 24)
CHATWOOT_SECRET_KEY_BASE=$(openssl rand -hex 64)
EOF

cat /tmp/keys.txt   # copia esos valores a .env sustituyendo los placeholder
nano .env           # rellena también DOMAIN_WEB, DOMAIN_CMS, DOMAIN_CHAT y ACME_EMAIL
```

Y para Chatwoot (envío de correos):

```bash
cp chatwoot.env.example chatwoot.env
nano chatwoot.env   # rellena SMTP_ADDRESS, SMTP_USER_NAME, SMTP_PASSWORD…
```

> 💡 Para Gmail/Workspace hay que usar **contraseñas de aplicación** (Cuenta Google → Seguridad → Contraseñas de aplicación).

## 6. Arrancar todo

```bash
cd ~/taller/deploy
docker compose pull
docker compose build strapi
docker compose up -d
```

Comprueba que están todos arriba:

```bash
docker compose ps
```

La primera vez, Caddy tarda 1–2 minutos en pedir los certificados a Let's Encrypt. Cuando termine:

- Web pública → `https://eltallerdemigue.es`
- CRM → `https://eltallerdemigue.es/admin.html`
- Strapi → `https://cms.eltallerdemigue.es/admin`
- Chatwoot → `https://chat.eltallerdemigue.es`

## 7. Configuración inicial de cada servicio

### Strapi (primera vez)

1. Entra en `https://cms.eltallerdemigue.es/admin`.
2. Crea el usuario administrador (el que usarán Migue y su equipo).
3. En **Settings → Users & Permissions Plugin → Roles → Public** habilita **find** y **findOne** para las colecciones que la web pública debe poder leer sin login: `stock-vehicle`, `service`, `review`, `site-setting`, `brand`, `collaborator`.
4. En **Public** habilita también **create** para `contact-submission` (para que el formulario de contacto funcione).
5. Guarda.

### Chatwoot

1. Entra en `https://chat.eltallerdemigue.es`.
2. Crea la cuenta de superadministrador.
3. **Settings → Inboxes → Add Inbox → Website**, apunta al dominio de la web y copia el **Website Token**.
4. En el CRM (`admin.html` → sección "Chat y Canales"), pega la URL de Chatwoot y el token, marca "Activar" y guarda.

### Frontend

El frontend es estático y Caddy lo sirve directamente. Cuando hagas `git pull` en el VPS, los cambios se reflejan al instante (no hay que reiniciar nada).

## 8. Backups automáticos

Los backups diarios se activan con una línea de cron:

```bash
(crontab -l 2>/dev/null; echo "0 3 * * * $HOME/taller/deploy/scripts/backup.sh >> /var/log/taller-backup.log 2>&1") | crontab -
sudo touch /var/log/taller-backup.log && sudo chown "$USER" /var/log/taller-backup.log
```

Los backups se guardan en `/var/backups/taller/` (bases de datos + uploads de Strapi comprimidos), y se conservan los últimos **14 días** por defecto. Para restaurar uno:

```bash
bash ~/taller/deploy/scripts/restore.sh 20260706-0300
```

### Copiar los backups fuera del VPS (recomendado)

Si el VPS se cae, los backups locales no valen. Súbelos a **Google Cloud Storage** o similar:

```bash
# Crea un bucket privado en GCS y añade esta línea al cron después del backup:
gsutil rsync -d /var/backups/taller gs://taller-migue-backups
```

## 9. Actualizar la aplicación

Para desplegar cambios nuevos:

```bash
cd ~/taller
git pull
cd deploy
docker compose build strapi      # solo si tocaste Strapi
docker compose up -d             # recrea contenedores con los cambios
```

## 10. Coste orientativo

| Proveedor              | Máquina                            | Precio/mes |
|------------------------|------------------------------------|-----------|
| **Google Cloud**       | e2-standard-2 + 40 GB SSD          | ~50 €     |
| **Hetzner Cloud**      | CPX21 (3 vCPU, 4 GB, 80 GB)        | **~6 €**  |
| **DigitalOcean**       | 4 GB / 2 vCPU / 80 GB              | ~24 €     |
| **Contabo**            | VPS S 4 vCPU / 8 GB                | ~5 €      |

Para este proyecto **Hetzner o Contabo son la opción sensata**. Google Cloud es cómodo pero cuesta ~10 veces más y no aporta ventajas para esta carga.

## 11. Checklist final

- [ ] DNS de los 3 subdominios apuntando al VPS
- [ ] `.env` rellenado y **no** subido a git
- [ ] `chatwoot.env` rellenado con SMTP funcional
- [ ] Certificados HTTPS emitidos (comprueba con el candado en el navegador)
- [ ] Strapi con administrador creado y permisos públicos de solo lectura activados
- [ ] Chatwoot con canal Web configurado y token pegado en el CRM
- [ ] Cron de backups activo
- [ ] (Opcional) Sincronización de backups fuera del VPS
- [ ] (Opcional) Google Analytics ID configurado en `frontend/index.html`

## 12. Problemas comunes

**Caddy no consigue el certificado** → Revisa que el DNS ya propagó (`dig`), que el puerto 443 está abierto en el firewall del proveedor cloud (no solo en UFW), y mira los logs con `docker compose logs caddy`.

**Strapi tarda mucho en arrancar** → Normal en la primera arrancada (compila el admin panel). 2–3 minutos.

**Chatwoot no envía correos** → SMTP mal configurado en `chatwoot.env`. Prueba desde el propio contenedor: `docker compose exec chatwoot-web rails runner "ApplicationMailer.mail(to: 'tu@email', from: 'chat@dominio', subject: 'test', body: 'ok').deliver_now"`.

**Se ha olvidado la contraseña de administrador de Strapi** → `docker compose exec strapi npx strapi admin:reset-user-password --email tu@email --password NuevaClave123`.
