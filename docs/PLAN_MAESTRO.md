# Plan Maestro — Roadmap completo del CRM

Documento vivo con la consolidación de los 3 planes producidos por los agentes de arquitectura, más la caja interna legal y el bot inteligente. Cada fase se puede fusionar por separado; el orden refleja **valor entregado por semana**, no dependencias técnicas.

---

## Fase 6 · Operativa completa del taller (2 semanas)

**Objetivo**: que el CRM sirva para el día a día de un taller sin depender del papel.

### 6.1 · Content types nuevos en Strapi

- **`trabajador`** — mecánicos y personal (nombre, rol, foto, teléfono, salario/hora, PIN de fichaje 4 dígitos, color para tarjetas Kanban).
- **`fichaje`** — entrada/salida con timestamp, duración calculada, opcionalmente ligado a una OR.
- **`pieza-usada`** — piezas por OR con proveedor, coste unitario, PVP, gasto asociado.
- **`mantenimiento`** — preventivo por vehículo (aceite, correa, ITV, frenos), km/fecha próximos.
- **`prestamo-cortesia`** — préstamo con km/combustible salida y entrada, fotos, daños reportados, firma cliente.
- **`whatsapp-template`** — plantillas editables (or_entregado_review, cita_confirmacion_24h, mantenimiento_*, cortesia_vencido).

### 6.2 · Extensiones

**`orden-reparacion`** amplía a **8 estados** en flujo real: Pendiente → Diagnóstico → En Reparación → Esperando Piezas → Control Calidad → Terminado → **Entregado** → Facturado.
Nuevos campos: `anomalias` (JSON de rayaduras/faros/etc.), `tramites_pendientes` (ITV, informe pericial, seguro), `fotos_entrada/salida`, `coste_piezas`, `coste_mano_obra`, `requiere_paso_taller_antes_venta`, `trabajadores` (M2M), `piezas_usadas` (1toN), `review_whatsapp_enviado`.

**`vehiculo-sustitucion`** con `cliente_actual`, `fecha_devolucion_esperada`, `historial_prestamos`, `estado_carroceria`, `ubicacion_gps` opcional.

### 6.3 · Automation-worker · 3 crons automáticos

- **09:00 y 17:00 diarios** → confirmación de cita 24h antes (`cita_confirmacion_24h`).
- **08:00 diario** → avisos de mantenimiento cuando toca (con anti-spam de 7 días).
- **10:00 diario** → alerta de coche cortesía vencido → WhatsApp cliente + Telegram taller.

### 6.4 · Cliente WhatsApp Cloud API + webhook Chatwoot

- `whatsapp.js` con `sendText` y `sendTemplate` usando la Graph API de Meta.
- Webhook `/webhooks/chatwoot` capta respuestas SÍ/NO del cliente y actualiza la cita.
- Firma HMAC `CHATWOOT_WEBHOOK_SECRET`.

### 6.5 · Frontend CRM

- **Vista Kanban** con drag & drop (Sortable.js, 12 KB). 8 columnas por estado, avatares de mecánicos asignados, tiempo en estado.
- **Sección Trabajadores**: cards con estadísticas (horas, OR cerradas, €/h) y botones editar/desactivar.
- **Sección Mantenimientos**: timeline por vehículo con badges y botón "Ejecutar ahora" o "Postponer 30 días".
- **Sección Coches de cortesía**: split view flota / préstamos activos con temporizador. Modal de devolución con firma en canvas.
- **Kiosco de fichaje** independiente (`crm/kiosco.html`): tablet en el taller, PIN pad, botones grandes ENTRADA/SALIDA.
- Extensión del modal de orden con selector múltiple de trabajadores, sub-tabla de piezas usadas, anomalías, trámites y toggle "requiere paso taller".
- 3 nuevas stat cards en el dashboard.

### 6.6 · Migración

- El estado actual `"En Taller"` → `"En Reparacion"`. Script de migración SQL sencillo.

---

## Fase 6b · Caja interna (0.5 semanas — va con Fase 6)

**Módulo legal y aparte de Gastos.** No mezcla con facturación oficial.

### 6b.1 · Nuevo content type `movimiento-caja-interna`

```
fecha, concepto, tipo (ingreso/gasto/traspaso), importe,
categoria (adelanto socio, préstamo, propina, gasto personal, retirada, otro),
metodo (efectivo/transferencia/otro), contraparte, notas,
adjunto (media), cuenta (relación Cuenta)
```

### 6b.2 · Acceso restringido

Solo visible en el sidebar del CRM si el rol del usuario es **owner** de la cuenta.
Endpoints protegidos por policy: `is-owner`.
Backup separado a otra ruta de Drive.

### 6b.3 · Dashboard analítico

Balance de caja interna, resumen por categoría, no aparece en KPIs generales del negocio.

---

## Fase 7 · Multi-tenant (2 semanas)

**Objetivo**: preparar el CRM para varios talleres (autónomos y SLs).

### 7.1 · Nuevo content type `cuenta`

Campos principales: `nombre_comercial`, `razon_social`, `cif_nif`, `regimen_fiscal` (autónomo/SL/SLU/SA/coop), `regimen_iva`, `epigrafe_iae`, dirección fiscal, `logo`, `color_marca`, `subdominio` (uid), `dominio_custom`, `plan`, `estado`, `trial_hasta`, `stripe_customer_id`, `propietario` (usuario), `miembros` (M2M usuarios), `config_json` (absorbe `site-setting`).

### 7.2 · 12 content types se vinculan a `Cuenta`

`cliente`, `orden-reparacion`, `cita`, `gasto`, `stock-vehicle`, `publicacion-social`, `vehiculo-sustitucion`, `contact-submission`, `dealer-profile`, `review`, `service`, `collaborator`. Todos con relación `manyToOne` **requerida**.

### 7.3 · Middleware global `tenant-scope`

Un solo middleware en `src/middlewares/tenant-scope.ts`:
1. Resuelve `activeCuentaId` del header `X-Cuenta-Id` o del JWT.
2. Comprueba pertenencia (403 si no es miembro).
3. Inyecta `filters[cuenta][id][$eq]` en lecturas.
4. Fuerza `body.data.cuenta = activeCuentaId` en escrituras.
5. En PUT/DELETE verifica que el registro pertenece a la cuenta activa.

### 7.4 · 4 roles

- **owner** — CRUD total, único que ve caja interna, invita miembros, cambia plan.
- **mecanico** — órdenes, citas, cortesía. Sin dinero, sin caja B.
- **recepcion** — clientes, agenda, órdenes (crear/leer).
- **gestor_contable** — CRUD gastos + facturas, R en OR. Sin PII de clientes.

### 7.5 · Selector de cuenta en login

Frontend guarda `crm_active_cuenta` en localStorage. Todas las llamadas envían `X-Cuenta-Id`.
Modal de selector si el usuario pertenece a varias cuentas (asesorías).

### 7.6 · Migración de datos existentes

Script en `database/migrations/2026.07.10.multi-tenant.ts`:
1. Crear cuenta canónica "El Taller de Migue".
2. Asignar propietario `taller@migue.com`.
3. Backfill masivo: todos los registros existentes → cuenta canónica.
4. Verificación de `COUNT(NULL) = 0`.
5. Solo entonces se cambia la relación a `required: true`.

### 7.7 · Índices DB obligatorios

`CREATE INDEX idx_<tabla>_cuenta_id ON <tabla>(cuenta_id)` para las 12 tablas + índices compuestos `(cuenta_id, fecha)` y `(cuenta_id, estado)`.

### 7.8 · Suscripciones SaaS (dimensionado, no implementado)

Content type `plan-suscripcion`. Integración Stripe con webhook. Suspensión automática si falla el pago.

### 7.9 · Riesgos identificados

1. Endpoints custom (ocr, telegram, publish, sync) pueden saltarse el aislamiento — auditar cada release.
2. Sin índices manuales, el CRM se ralentiza en 12-18 meses.
3. Multi-cuenta añade complejidad; se compensa con `audit-log` (fase 2).

---

## Fase 8 · VeriFactu — facturación conforme AEAT (3-4 semanas)

**Objetivo**: facturas legales que cumplen la Ley Antifraude española.

### 8.1 · Fechas de obligatoriedad

| Sujeto | Fecha obligatoria |
|---|---|
| Fabricantes de software | 29-jul-2025 (ya) |
| SL / SA / SLU / cooperativa | 1-ene-2027 |
| Autónomos / IRPF | 1-jul-2027 |

### 8.2 · 5 content types nuevos

- **`serie-facturacion`** — prefijo, ejercicio, contador correlativo. Constraint único (prefijo, ejercicio).
- **`configuracion-fiscal`** (singleType por cuenta) — datos fiscales del emisor, régimen IVA, certificado `.pfx` cifrado, entorno AEAT.
- **`factura`** — colección principal con lineas + desglose IVA como componentes. Campos VeriFactu: `huella_hash`, `huella_anterior`, `qr_url`, `qr_svg`, `verifactu_csv`, `verifactu_estado`.
- **`factura-recibida`** — libro registro de recibidas.
- **`verifactu-evento`** — auditoría técnica inmutable de cada llamada SOAP.

### 8.3 · Motor de huella SHA-256 encadenada

Orden fijo de campos: `IDEmisorFactura&NumSerieFactura&FechaExpedicionFactura&TipoFactura&CuotaTotal&ImporteTotal&Huella&FechaHoraHusoGenRegistro`. UTF-8 → SHA-256 → hex mayúsculas 64 chars.

**Cola FIFO** en Postgres con `SELECT ... FOR UPDATE SKIP LOCKED` para serialización (no se puede calcular 2 facturas en paralelo).

### 8.4 · QR y URL AEAT

URL: `https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ValidarQR?nif=X&numserie=Y&fecha=DD-MM-YYYY&importe=Z`.
Librería `qrcode` (npm, MIT). SVG serializado y guardado en `qr_svg` para no depender de red en PDF.
Impresión: 30-40 mm, corrección M, cabecera + texto "VERI\*FACTU".

### 8.5 · Cliente SOAP con mTLS

Endpoints AEAT (`prewww1.aeat.es` sandbox / `www1.agenciatributaria.gob.es` producción).
Autenticación con certificado `.pfx` de titular o representante.
Reintentos backoff exponencial (30s, 5min, 30min, 2h, 12h). Máx 5 intentos.
Librerías: XML builder manual + `undici` con mTLS + `node-forge` para leer `.pfx`.

### 8.6 · Tipos de factura

- **F1** — factura normal.
- **F2** — simplificada (ticket, ≤400€ / ≤3000€ IVA incl.).
- **F3** — completa que sustituye simplificadas.
- **R1-R5** — rectificativas (R4 la más común). Con `tipo_rectificativa` S (sustitución) o I (diferencias).

### 8.7 · Inmutabilidad

Lifecycle hook `beforeUpdate` que bloquea cualquier cambio en facturas ya emitidas salvo transiciones controladas (`pagado`, `fecha_pago`, `verifactu_estado`). Errores → obligan a emitir R4.

### 8.8 · UI en admin.html

- Modal de factura rediseñado con **4 tabs**: generales, destinatario, conceptos (con IVA por línea), cobro.
- Selector de serie con preview del próximo número.
- Autocomplete de destinatario.
- Botón "Insertar desde OR" si viene de `convertirAFactura`.
- Listado con filtros de serie/periodo/estado/tipo y badges de estado VeriFactu.
- PDF regenerado en backend (`pdfkit` o Playwright) con QR + CSV + huella al pie.
- Exportación libro registro CSV/XLSX/XML SII/Facturae.

### 8.9 · Ley Antifraude adicional

Cubre 6 principios: integridad, conservación 4 años, accesibilidad, legibilidad, trazabilidad, inalterabilidad.
Content type `evento-sif` para registro de arranques/paradas/exportaciones/imports.
Declaración responsable del fabricante en documentación comercial.

### 8.10 · Alternativa SaaS

En vez de DIY, integrar con **Verifacti API** (~15-30€/mes por emisor) o similar. Recomendado como fallback si el taller no tiene certificado propio.

---

## Fase 3 · Bot inteligente (2 semanas) — al final, cuando el CRM esté sólido

- El bot de Telegram existente pasa a hacer:
  - Detectar matrículas en fotos y taparlas con logo (YOLO o Claude Vision + Sharp overlay).
  - Quitar fondo (`rembg`, U²-Net, sin GPU) y sustituir por corporativo.
  - Marca de agua en vídeos (FFmpeg).
  - OCR de ficha técnica, permiso circulación y facturas del coche (histórico, NO gasto).
  - Detección de anomalías con Claude Vision → decide "requiere paso por taller antes de venta".
  - Genera pack de publicaciones adaptado a WhatsApp Estado / Instagram / Wallapop / coches.net / AutoScout24.
- **Brand Kit** en el CRM: logo, fondos corporativos, colores, tipografía y plantillas por plataforma.

---

## Fase 4 · Programador y previsualizador de publicaciones (1 semana)

- Vista previa realista por plataforma.
- Calendario con envío programado.
- Historial de qué se publicó y cuándo.

---

## Fase 5 · Contratos de compraventa PDF (1 semana)

- **4 plantillas**: particular, empresa, coche a cambio + saldo, con financiación externa.
- Rellenado automático desde datos del coche + cliente del CRM.
- Cláusulas de garantía editables.
- Descarga PDF + copia a Google Drive del cliente (Workspace).
- **Firma manual escaneada** por ahora. DocuSeal (open source) queda para más adelante si se pide.

---

## Fase 9 · Manual del CRM en PDF (0.5 semanas — al final)

Documento vivo con capturas reales de cada sección. Se actualiza al terminar cada fase.

---

## Orden recomendado y por qué

1. **Fase 6 + 6b** (operativa taller + caja interna): **impacto diario** para Migue. Cero dependencias legales.
2. **Fase 7** (multi-tenant): necesario **antes de vender a otros talleres**. Sin urgencia si Migue es el único usuario.
3. **Fase 8** (VeriFactu): urgente si vas a vender el software (obligación de fabricante desde 2025). Para Migue autónomo, urgencia real desde 1-jul-2027.
4. **Fase 5** (contratos), **Fase 4** (programador), **Fase 3** (bot inteligente): mejoras que multiplican productividad, sin bloqueo legal.
5. **Fase 9** (manual): al final, cuando ya no cambien más las UIs.

## Estimación total

**~12-13 semanas de dev senior** para el paquete completo. Cada fase entrega valor por separado y se puede pausar entre ellas sin dejar el CRM roto.
