# Cloudflare, portales de venta y almacenamiento

Guía de las piezas nuevas: publicar la web en **Cloudflare Pages**, exponer el
backend con un **túnel**, conectar los **portales de venta** por usuario/contraseña
y guardar todo en un **drive** open-source.

---

## 1. Web en Cloudflare Pages

La web pública (`web-publica/`) es estática, así que va gratis en Cloudflare Pages.

**Opción A — conectar el repo (más simple, sin secretos):**
1. Cloudflare Dashboard → *Workers & Pages* → *Create* → *Pages* → *Connect to Git*.
2. Elige el repo, rama `main`, carpeta raíz `web-publica`, sin build command.
3. Cada push a `main` despliega solo. Añade tu dominio en *Custom domains*.

**Opción B — desde GitHub Actions (ya preparada):**
- Workflow `.github/workflows/deploy-cloudflare.yml`.
- Añade en el repo los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`.
- Se despliega en cada push que toque `web-publica/`.

Cabeceras y redirecciones: `web-publica/_headers` y `web-publica/_redirects`.

> Puedes mantener **GitHub Pages y Cloudflare Pages a la vez**; son independientes.
> Para SEO elige **un** dominio canónico (con o sin `www`) y redirige el otro.

---

## 2. Túnel para el backend

El backend (Strapi + automation-worker + Chatwoot) necesita salir a Internet.
Todo en `deploy/tunnel/` (con comparativa y plantillas). Resumen:

- **Cloudflare Tunnel** ⭐ (recomendado): gratis, sin abrir puertos ni IP pública.
  Token en `.env` (`CLOUDFLARE_TUNNEL_TOKEN`) y arrancar con el compose extra.
- **frp** / **rathole** / **Pangolin**: self-hosted, necesitan un VPS público barato.
- **Tailscale Funnel**: gratis y rápido para pruebas.

Ver `deploy/tunnel/README.md` para el paso a paso de cada uno.

---

## 3. Portales de venta (coches.net, Wallapop, AutoScout24, FB Marketplace)

### Cómo funciona de verdad cada portal
- **coches.net, coches.com, AutoScout24** → publican por **feed XML** de stock
  (la vía oficial de profesionales; no depende de la contraseña y no se rompe).
  El worker sirve el feed en `GET /portales/feed/<portal>.xml`. Das de alta esa
  URL en el panel de profesional del portal y ellos importan tu stock solo.
- **Wallapop, Milanuncios, FB Marketplace** → **no tienen API pública** de
  publicación. Opciones: automatización con navegador (Playwright, plantilla en
  `portales/navegador.js`) o **publicación asistida por Telegram** (el worker
  manda el pack listo al móvil y publicas en 1 toque).

### Guardar el usuario y la contraseña (de forma segura)
- Content type nuevo en Strapi: **`credencial-portal`** (portal, usuario,
  `secreto_cifrado`, modo, activo).
- La contraseña **nunca se guarda en claro**: el worker la cifra con
  **AES-256-GCM** (`PORTAL_CRYPTO_KEY`) antes de guardarla. El campo del secreto
  es `private` en Strapi (no sale por la API).
- Endpoint: `POST /portales/credenciales` `{ portal, usuario, password }`.

> ⚠️ Automatizar el login de Wallapop/FB con usuario y contraseña puede chocar
> con sus Términos de Servicio y romperse ante captcha/2FA. Úsalo solo con
> cuentas propias. Para coches.net/AutoScout24, el **feed** es la vía correcta.

---

## 4. Almacenamiento ("el drive donde se guarda todo")

Todo en `deploy/storage/` (ver su README):
- **Nextcloud** → tu "Google Drive" open-source (fotos, docs, facturas escaneadas).
- **MinIO (S3)** → provider de subida de Strapi para que las fotos del stock
  no se pierdan y sirvan rápido.
- **Google Drive** → opcional (15 GB gratis), plantilla en `storage/drive.js`.

El worker sube ficheros con `guardarArchivo(ruta, buffer)` según
`STORAGE_BACKEND` (nextcloud | drive).

---

## 5. Caja interna — qué es y qué NO es

El módulo **Caja Interna** (`movimiento-caja-interna`) es **analítica interna
legal**: adelantos de socio, préstamos entre socios, retiradas personales,
reintegros, propinas y balance. Sirve para que el dueño sepa su flujo de caja
real. Está **separada** de la vista de contabilidad fiscal para no mezclar
conceptos, pero **no la sustituye**.

**Lo que este proyecto NO hace (y no hará):** registrar reparaciones "en B",
ocultar ingresos, o llevar ventas fuera del registro trimestral para no
declararlas. Eso es facturación en negro y es ilegal (evasión de IVA e
IRPF/Sociedades, sanciones de la AEAT y posible delito fiscal). No se
implementan funciones de ocultación.

**Alternativa legal para lo que suele buscarse con eso:** toda venta/reparación
se factura, pero puedes minimizar impuestos de forma legal — deducir gastos y
piezas, amortizaciones, provisiones, régimen y epígrafes correctos, etc. Para
eso está la contabilidad fiscal + el checklist de cuentas. Si quieres, preparo
un panel de **optimización fiscal legal** (gastos deducibles, previsión de IVA
e IRPF, alertas de trimestre).
