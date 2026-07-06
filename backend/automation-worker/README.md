# Automation Worker

Servicio auxiliar de El Taller de Migue. Escucha en el puerto 4000 y expone:

| Endpoint | Función |
|---|---|
| `GET /health` | Diagnóstico rápido (qué integraciones están activas) |
| `POST /ocr/factura` | Sube una foto de factura → devuelve JSON con datos extraídos por Claude Vision |
| `POST /telegram/send-publication` | Envía imagen + texto al Telegram del dueño para subir a WhatsApp Estado |
| `POST /sync/whatsapp-catalog` | Sincroniza el stock con Meta Business Catalog |

Además arranca un **bot de Telegram** que acepta fotos de facturas y las sube al CRM automáticamente.

## Uso local

```bash
cp .env.example .env   # rellena tus claves
npm install
npm run dev
```

## En producción (VPS)

Añádelo al `docker-compose.yml` de `deploy/`:

```yaml
  automation:
    build: ../backend/automation-worker
    restart: unless-stopped
    env_file: [../backend/automation-worker/.env]
    depends_on: [strapi]
    networks: [taller]
```

Y en el `Caddyfile` publica `automation.eltallerdemigue.es` apuntando a `automation:4000`.

## Cuánto cuesta

- Anthropic (Claude Haiku): ~0,001-0,003 € por factura procesada.
- Telegram Bot: gratis.
- Meta Business API: gratis para catálogos; el precio empieza al usar mensajería.
