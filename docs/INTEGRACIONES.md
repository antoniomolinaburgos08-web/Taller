# Integraciones y automatizaciones del CRM

Esta guía explica **qué queda funcional** en el CRM y **qué necesita credenciales externas** para activarse.

## Resumen honesto

| Función | Estado | Qué necesita para funcionar de verdad |
|---|---|---|
| **Borrar / editar coches, órdenes, clientes, citas** | ✅ Funcional | Nada más — funciona contra Strapi v5 |
| **Vehículos por cliente** | ✅ Funcional | Nada — se guarda en el campo JSON `vehiculos_propiedad` |
| **Gastos manuales** | ✅ Funcional | Nada — nuevo content type `gasto` en Strapi |
| **Gastos por foto (OCR con IA)** | ⚙️ Listo, requiere API key | Clave de Anthropic en Ajustes + `automation-worker` desplegado |
| **Publicaciones para redes (imagen + texto)** | ✅ Funcional | Nada — genera PNG con Canvas en el propio navegador |
| **Enviar publicación al móvil (Telegram)** | ⚙️ Listo, requiere token | Bot de @BotFather + `automation-worker` desplegado |
| **Feed XML para coches.net** | ✅ Funcional | Migue debe darse de alta como profesional en coches.net y darles la URL del feed |
| **Feed JSON / CSV para Wallapop, Milanuncios, Excel** | ✅ Funcional | Nada — se descarga directamente desde el CRM |
| **Sincronización WhatsApp Business Catalog** | ⚙️ Listo, requiere Meta | Cuenta WhatsApp Business API con BSP + token en Ajustes |
| **Google Analytics 4 / GTM / FB Pixel en la web** | ✅ Funcional | Solo pegar los IDs en Ajustes del CRM |

## Qué es realista y qué no

- **coches.net**: sí es automatizable con el feed XML **solo si Migue tiene contrato profesional** (~200-800 €/mes). Sin ese contrato, el portal no acepta el feed.
- **Wallapop**: **no tiene API pública** para publicar. El CRM genera un pack de foto + texto y lo manda al móvil por Telegram para subirlo en 1 tap. Cualquier "integración directa" es marketing engañoso.
- **WhatsApp Estados**: Meta **no permite publicarlos por API**. Solo se pueden subir manualmente desde el móvil. El generador de imágenes + envío por Telegram cubre este flujo.
- **WhatsApp Catálogo (productos)**: sí se sincroniza por API si tienes una cuenta WhatsApp Business API aprobada por Meta.
- **OCR de facturas con IA**: coste ~0,001-0,003 € por factura procesada con Claude Haiku. Muy fiable en facturas legibles.

## Cómo activar cada integración

### 1. Google Analytics 4 (10 minutos)

1. Crea propiedad en https://analytics.google.com (recibirás un ID `G-XXXXXXXXXX`).
2. CRM → **Ajustes e Integraciones** → pega el ID en "Google Analytics 4" → Guardar.
3. La web pública lo cargará automáticamente en la siguiente visita.

Igual para **Google Tag Manager** (`GTM-XXXXXX`) y **Facebook Pixel** (ID numérico).

### 2. Feed XML para coches.net (24-48 h)

1. Migue se registra en https://profesionales.coches.net y contrata un plan.
2. Comercial de coches.net pide una URL de feed XML. Le das:
   ```
   https://cms.eltallerdemigue.es/api/stock-vehicles/feed/cochesnet.xml
   ```
3. Coches.net sincronizará tu stock cada 24 h automáticamente.
4. En el CRM → **Ajustes** → activa "Feed público coches.net" y pega el ID de dealer que te dan.

### 3. Feed para Wallapop / Milanuncios

- Descarga el CSV genérico desde **Portales de Venta → Wallapop → Descargar CSV** y súbelo a la plataforma que aceptan archivos (Wallapop no; Milanuncios profesional sí).
- Alternativa útil: pulsa "Enviar pack al móvil" → tu Telegram recibe imagen + texto para publicar en 1 tap.

### 4. Bot de Telegram (5 minutos)

1. En Telegram, busca **@BotFather** → `/newbot` → sigue las instrucciones. Guarda el token (`1234567890:ABC...`).
2. Habla con tu bot y envíale `/start`. Verás tu Chat ID en la respuesta.
3. CRM → **Ajustes** → pega token y Chat ID → Guardar.
4. Despliega el `automation-worker` (ver más abajo).

A partir de aquí:
- Envías al bot una foto de una factura → aparece en Gastos automáticamente.
- Pulsas "Enviar al móvil" en publicaciones → recibes imagen + texto para subir a WhatsApp Estados.

### 5. OCR de facturas con Claude (5 minutos)

1. Crea clave en https://console.anthropic.com → API Keys.
2. CRM → **Ajustes** → pega la clave en "API Key IA" → Guardar.
3. Despliega el `automation-worker`.

Ahora en **Gastos** puedes usar el botón "Factura por foto (OCR)".

### 6. WhatsApp Business Catálogo (1-3 semanas por la aprobación de Meta)

Requiere:
- Cuenta **Meta Business Manager** con verificación empresarial.
- **WhatsApp Business API** a través de un **BSP** (Twilio, 360dialog, WATI, etc.), coste 30-100 €/mes.
- **Business Account ID**, **Catalog ID** y **Access Token permanente** (Meta Graph API).

Cuando los tengas: CRM → **Ajustes** → pega los tres valores → activa la casilla → Guardar. Luego **Portales de Venta → WhatsApp Catálogo → Sincronizar catálogo ahora**.

## Cómo desplegar el `automation-worker`

Ya está incluido en `deploy/docker-compose.yml` de producción. Solo hay que rellenar sus secretos:

```bash
cd ~/taller/deploy
cp automation.env.example automation.env
nano automation.env    # rellena STRAPI_TOKEN, ANTHROPIC_API_KEY, TELEGRAM_BOT_TOKEN…
docker compose up -d automation
```

Comprueba que está vivo:

```bash
curl https://automation.eltallerdemigue.es/health
```

Devuelve qué integraciones están activas:

```json
{
  "ok": true,
  "integrations": {
    "anthropic_ocr": true,
    "telegram_bot": true,
    "telegram_owner": true,
    "whatsapp_catalog": false,
    "strapi": true
  }
}
```
