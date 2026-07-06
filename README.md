# El Taller de Migue — Web + CRM

Ecosistema digital completo de **El Taller de Migue** (Beniflà, Valencia): página web pública, panel CRM de gestión diaria y backend de datos.

## Estructura del proyecto

```
├── web-publica/            # Web pública (GitHub Pages · Cloudflare Pages · o VPS)
│   ├── index.html          # Landing (servicios, stock, contacto)
│   ├── manifest.json       # Manifest PWA
│   ├── sw.js               # Service Worker
│   ├── sitemap.xml         # Mapa del sitio para Google
│   ├── robots.txt          # Reglas de indexación
│   ├── CNAME               # Dominio personalizado para GitHub Pages
│   └── assets/cars/        # Fotos de vehículos en stock
├── crm/                    # Panel interno (privado, NUNCA en GitHub Pages)
│   ├── admin.html          # CRM completo
│   ├── manifest-admin.json # Manifest PWA del CRM
│   └── sw.js               # Service Worker
├── backend/
│   ├── strapi-cms/         # Strapi v5 (base de datos central)
│   ├── automation-worker/  # Node.js: bot Telegram + OCR facturas + sync WhatsApp Catalog
│   └── chatwoot/           # Chat omnicanal (WhatsApp, web, redes)
├── docs/                   # Manuales, análisis y guías de despliegue
├── scripts/seed-stock.js   # Utilidad para cargar vehículos de ejemplo en Strapi
├── docker-compose.yml      # Entorno local completo (web + Strapi + Chatwoot)
└── deploy/                 # Stack de PRODUCCIÓN para VPS (Google Cloud, Hetzner…)
    ├── docker-compose.yml  # Stack con HTTPS automático (Caddy + Let's Encrypt)
    ├── Caddyfile           # Reverse proxy: web + CMS + chat en 3 subdominios
    ├── .env.example        # Plantilla con TODAS las variables necesarias
    ├── chatwoot.env.example# Plantilla para SMTP y opciones de Chatwoot
    └── scripts/            # setup-vps.sh · backup.sh · restore.sh
```

## Arquitectura

1. **Web pública** (`frontend/index.html`): estática y rápida, carga el stock de vehículos, servicios y reseñas desde Strapi. Si el backend no responde, muestra un inventario de respaldo local para que la web nunca se vea vacía.
2. **CRM** (`frontend/admin.html`): panel interno con login (usuarios de Strapi). Gestiona facturación PDF, órdenes de reparación, citas, garaje con avisos de ITV/aceite por WhatsApp, clientes, stock y mensajes de la web. Si no hay conexión, guarda en el navegador (modo offline).
3. **Strapi CMS** (`backend/strapi-cms`): la base de datos real (clientes, órdenes, citas, vehículos, mensajes, gastos, publicaciones y configuración del sitio).
4. **Automation Worker** (`backend/automation-worker`): servicio Node.js con bot de Telegram (fotos de facturas → OCR con Claude Vision → alta automática en gastos), envío de publicaciones al móvil y sincronización con WhatsApp Business Catalog.
5. **Chatwoot** (`backend/chatwoot`): bandeja de entrada unificada para el chat de la web, WhatsApp, Instagram y Facebook.

## Funcionalidades clave del CRM

- 📊 **Panel general** con facturación, órdenes activas, citas de hoy y stock.
- 🧾 **Facturación PDF** con IVA y numeración automática.
- 💸 **Gastos e inversiones** — subes una foto de la factura del proveedor y el OCR con IA rellena los campos (fecha, importe, proveedor, categoría).
- 🚗 **Stock de coches** con feed XML/JSON/CSV público para coches.net, Wallapop, Milanuncios y widgets externos.
- 🔧 **Órdenes de reparación** con estados en tiempo real y facturación en un clic.
- 📅 **Citas y agenda** con recordatorios por WhatsApp.
- 👥 **Clientes** con lista de vehículos propios y consentimiento RGPD.
- 📣 **Publicaciones sociales** — genera imagen + texto para WhatsApp Estados, Instagram, Wallapop y coches.net. Descarga PNG o envío al móvil por Telegram.
- 🌐 **Portales de venta** — sincronización con coches.net (feed XML profesional), Wallapop (pack al móvil) y WhatsApp Catálogo (Meta Business API).
- ⚙️ **Ajustes e integraciones** — configura GA4, GTM, Facebook Pixel, bot de Telegram, clave de IA, tokens de Meta.
- 💬 **Chat multicanal** integrado con Chatwoot (widget web + WhatsApp + IG + FB).

Ver [`docs/INTEGRACIONES.md`](docs/INTEGRACIONES.md) para el detalle de qué queda funcional al 100% y qué necesita credenciales externas.

## Desarrollo local

```bash
# Levantar todo con Docker (web en :8085, Strapi en :1337, Chatwoot en :3000)
docker compose up -d

# O solo el frontend (cualquier servidor estático)
cd frontend && python3 -m http.server 5500
```

Para Strapi sin Docker:

```bash
cd backend/strapi-cms
cp .env.example .env   # y rellena los secretos
npm install
npm run develop
```

## Despliegue

### Opción A · VPS propio (Google Cloud, Hetzner, DigitalOcean…) — recomendado

Un solo servidor con Docker sirve toda la web, el CRM, Strapi y Chatwoot con HTTPS automático (Let's Encrypt vía Caddy). Guía completa paso a paso:

📘 [`docs/DESPLIEGUE_VPS.md`](docs/DESPLIEGUE_VPS.md)

Resumen en 3 comandos, sobre un Ubuntu recién instalado:

```bash
git clone <este-repo> ~/taller && cd ~/taller
bash deploy/scripts/setup-vps.sh          # Docker + firewall + fail2ban + swap
cd deploy && cp .env.example .env         # rellenar secretos y dominios
docker compose up -d                      # arranca todo
```

### Opción B · Web pública gratis en GitHub Pages + CRM en VPS

- La carpeta `web-publica/` se publica automáticamente en **GitHub Pages** en cada push a `main` (workflow ya configurado en `.github/workflows/deploy-pages.yml`).
- El **CRM** (carpeta `crm/`) queda solo en el VPS bajo `crm.tudominio.es` — nunca es accesible desde una URL pública.

Configuración (una vez): GitHub → repo → Settings → Pages → Source **GitHub Actions** → Custom domain `eltallerdemigue.es`.

### Opción C · Servicios gestionados (Vercel + Railway)

- **Frontend → Vercel**: proyecto estático con *Root Directory* = `web-publica`.
- **Backend → Railway**: servicio con *Root Directory* = `backend/strapi-cms` + PostgreSQL. Configura las variables de `.env.example` y `FRONTEND_URL` con el dominio de Vercel (CORS).

Guía paso a paso en [`docs/INSTRUCCIONES_DESPLIEGUE.md`](docs/INSTRUCCIONES_DESPLIEGUE.md).

## Seguridad

- Los archivos `.env` con secretos **no se suben a Git** (ver `.gitignore`). Usa `.env.example` como plantilla.
- Las credenciales de acceso al CRM se entregan por canal privado; en `docs/` solo hay marcadores de posición.
- El panel `admin.html` no está enlazado desde la web pública y requiere usuario y contraseña de Strapi.
