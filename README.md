# El Taller de Migue — Web + CRM

Ecosistema digital completo de **El Taller de Migue** (Beniflà, Valencia): página web pública, panel CRM de gestión diaria y backend de datos.

## Estructura del proyecto

```
├── frontend/               # Web estática (Vercel)
│   ├── index.html          # Web pública (servicios, stock, contacto)
│   ├── admin.html          # CRM / Dashboard interno (facturas, órdenes, citas, clientes)
│   ├── sw.js               # Service Worker (PWA)
│   ├── manifest.json       # Manifest PWA de la web pública
│   ├── manifest-admin.json # Manifest PWA del CRM
│   └── assets/cars/        # Fotos de vehículos en stock
├── backend/
│   ├── strapi-cms/         # Strapi v5 (base de datos central, desplegado en Railway)
│   └── chatwoot/           # Chat omnicanal (WhatsApp, web, redes)
├── docs/                   # Manuales, análisis y guía de despliegue
├── scripts/seed-stock.js   # Utilidad para cargar vehículos de ejemplo en Strapi
└── docker-compose.yml      # Entorno local completo (web + Strapi + Chatwoot)
```

## Arquitectura

1. **Web pública** (`frontend/index.html`): estática y rápida, carga el stock de vehículos, servicios y reseñas desde Strapi. Si el backend no responde, muestra un inventario de respaldo local para que la web nunca se vea vacía.
2. **CRM** (`frontend/admin.html`): panel interno con login (usuarios de Strapi). Gestiona facturación PDF, órdenes de reparación, citas, garaje con avisos de ITV/aceite por WhatsApp, clientes, stock y mensajes de la web. Si no hay conexión, guarda en el navegador (modo offline).
3. **Strapi CMS** (`backend/strapi-cms`): la base de datos real (clientes, órdenes, citas, vehículos, mensajes, configuración del sitio).
4. **Chatwoot** (`backend/chatwoot`): bandeja de entrada unificada para el chat de la web, WhatsApp, Instagram y Facebook.

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

- **Frontend → Vercel**: proyecto estático con *Root Directory* = `frontend`.
- **Backend → Railway**: servicio con *Root Directory* = `backend/strapi-cms` + PostgreSQL. Configura las variables de `.env.example` y `FRONTEND_URL` con el dominio de Vercel (CORS).

Guía paso a paso en [`docs/INSTRUCCIONES_DESPLIEGUE.md`](docs/INSTRUCCIONES_DESPLIEGUE.md).

## Seguridad

- Los archivos `.env` con secretos **no se suben a Git** (ver `.gitignore`). Usa `.env.example` como plantilla.
- Las credenciales de acceso al CRM se entregan por canal privado; en `docs/` solo hay marcadores de posición.
- El panel `admin.html` no está enlazado desde la web pública y requiere usuario y contraseña de Strapi.
