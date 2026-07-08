# El Taller de Migue — CRM para talleres mecánicos

## Reglas de trabajo (ahorro de tokens — OBLIGATORIAS)

- **No releas archivos** ya leídos en la sesión; el harness rastrea su estado.
- **Agrupa operaciones**: un solo comando Bash con heredocs para crear varios archivos; validaciones juntas al final.
- **Parcheos quirúrgicos**: para archivos grandes (ej. `crm/admin.html`, ~2900 líneas) usa scripts Python con reemplazos exactos y `assert`, nunca lecturas completas. Localiza anclas con `grep -n` antes.
- **Trunca salidas**: `| tail -N` / `head -N` en todo comando con salida larga.
- **Verificación mínima suficiente**: `node --check` para JS, `json.load` para schemas, un solo test Playwright por ronda.
- **Prosa mínima** entre herramientas; resumen solo al final.
- Los `.html` tienen espacios finales de línea: normaliza con `rstrip` antes de hacer reemplazos exactos.

## Mapa del proyecto

```
web-publica/index.html      Web pública (GitHub Pages / VPS) — carga stock desde Strapi con fallback local
crm/admin.html              CRM completo en un solo HTML (login Strapi users-permissions, JWT en localStorage)
crm/kiosco.html             Kiosco de fichaje por PIN para tablet
backend/strapi-cms/         Strapi v5.48.1 · content types en src/api/*/content-types/*/schema.json
backend/automation-worker/  Node.js ESM :4000 — bot Telegram, OCR Claude Vision, WhatsApp Cloud API, 3 crons
backend/chatwoot/           Chat omnicanal (docker)
deploy/                     Producción VPS: docker-compose + Caddy (HTTPS auto) + scripts setup/backup/restore
docs/PLAN_MAESTRO.md        Roadmap de fases pendientes (multi-tenant, VeriFactu, contratos, bot inteligente)
docs/INTEGRACIONES.md       Qué funciona ya y qué necesita credenciales
```

## Datos críticos de Strapi v5 (fuente de bugs pasados)

- Respuestas **planas** (sin `attributes`); IDs = `documentId` (string). En el CRM se normaliza a `{id, attributes}` con `normalizeEntity()`.
- POST/PUT necesitan `?status=published` o crean borradores invisibles.
- El body **rechaza campos fuera del schema** (`publishedAt`, `cliente_nombre`) con 400.
- En `onclick`/`onchange` del CRM los IDs van **entre comillas**: `updateORStatus('${o.id}')`.
- Estados de OR (8): Pendiente, Diagnostico, En Taller, Esperando Piezas, Control Calidad, Terminado, Entregado, Facturado. El array `OR_ESTADOS` vive en admin.html.

## Comandos

- Dev local: `docker compose up -d` (web :8085, crm :8086, Strapi :1337, Chatwoot :3000)
- Validar JS embebido de un HTML: extraer `<script>` con regex y `node --check` (reemplazar `tailwind.config` por `var _t`)
- Test navegador: Playwright con `executablePath: '/opt/pw-browsers/chromium'`, servidor `python3 -m http.server`
- Push: la rama de trabajo actual es `claude/crm-web-polish-d93ugk`

## Reglas del proyecto

- **Nunca** subir `.env` reales, contraseñas ni tokens (usa `.env.example`).
- Facturas del histórico de un coche ≠ gastos del taller (colecciones distintas).
- Caja interna = analítica interna legal; separada de la contabilidad fiscal; nada de funciones de ocultación.
- Textos de cara al usuario en castellano.
- El aviso del stop-hook sobre firmas "Unverified" es un falso positivo del entorno (no hay ssh-keygen); los commits van firmados por el servicio del entorno.
