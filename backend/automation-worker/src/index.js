// ============================================================
// Automation Worker - Servidor HTTP + Bot de Telegram
// ============================================================
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { extractInvoice } from './ocr.js';
import { bot, sendPublicationToOwner } from './telegram.js';
import { syncCatalog } from './whatsapp-catalog.js';
import { createGasto, getOR, updateOR, getSiteSettingSafe, findTrabajadorByPin, findFichajeAbierto, crearFichaje, cerrarFichaje, updateCita, crearCredencialPortal, listCredencialesPortal, listPublicVehicles } from './strapi.js';
import { sendText, whatsappReady } from './whatsapp.js';
import { renderTemplate } from './templates.js';
import { startCrons } from './cron.js';
import { PORTALES, portalInfo, feedFor, publicar, encrypt, cryptoReady } from './portales/index.js';
import { storageBackend, storageReady } from './storage/index.js';
import crypto from 'node:crypto';

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, cb) => (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin))
        ? cb(null, true)
        : cb(new Error(`CORS: origen no permitido (${origin})`)),
}));
app.use(express.json({ limit: '5mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// -------- Diagnóstico --------
app.get('/health', (req, res) => {
    res.json({
        ok: true,
        integrations: {
            anthropic_ocr: !!process.env.ANTHROPIC_API_KEY,
            telegram_bot: !!process.env.TELEGRAM_BOT_TOKEN,
            telegram_owner: !!process.env.TELEGRAM_OWNER_CHAT_ID,
            whatsapp_catalog: !!(process.env.META_ACCESS_TOKEN && process.env.META_CATALOG_ID),
            strapi: !!process.env.STRAPI_URL,
            portales_crypto: cryptoReady(),
            storage: storageReady() ? storageBackend() : false,
        },
    });
});

// -------- OCR de facturas --------
app.post('/ocr/factura', upload.single('factura'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Falta el archivo "factura"' });
        const data = await extractInvoice(req.file.buffer, req.file.mimetype || 'image/jpeg');
        res.json(data);
    } catch (err) {
        console.error('OCR error:', err);
        res.status(500).json({ error: err.message });
    }
});

// -------- Alta directa de gasto (desde el CRM tras editar OCR) --------
app.post('/gastos', async (req, res) => {
    try {
        const saved = await createGasto(req.body);
        res.json(saved);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// -------- Enviar publicación al móvil vía Telegram --------
app.post('/telegram/send-publication', upload.single('imagen'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Falta la imagen' });
        await sendPublicationToOwner(req.file.buffer, req.body.texto || '');
        res.json({ ok: true });
    } catch (err) {
        console.error('Telegram error:', err);
        res.status(500).json({ error: err.message });
    }
});

// -------- Portales de venta: capacidades --------
app.get('/portales', (req, res) => {
    res.json({ portales: PORTALES, crypto: cryptoReady() });
});

// -------- Portales: guardar credenciales (cifra la contraseña en el worker) --------
app.post('/portales/credenciales', async (req, res) => {
    try {
        const { portal, usuario, password, modo, notas } = req.body || {};
        if (!portal || !usuario || !password) {
            return res.status(400).json({ error: 'Faltan portal, usuario o password' });
        }
        if (!portalInfo(portal)) return res.status(400).json({ error: `Portal ${portal} no soportado` });
        if (!cryptoReady()) return res.status(503).json({ error: 'Falta PORTAL_CRYPTO_KEY en el worker' });
        const saved = await crearCredencialPortal({
            portal,
            usuario,
            secreto_cifrado: encrypt(password),
            modo: modo || portalInfo(portal).modo,
            activo: true,
            notas: notas || '',
        });
        // Nunca devolvemos la contraseña ni el secreto.
        res.json({ ok: true, id: saved?.documentId || saved?.id, portal, usuario });
    } catch (err) { console.error('credenciales:', err); res.status(500).json({ error: err.message }); }
});

// -------- Portales: feed XML de stock (coches.net / AutoScout24 / coches.com) --------
app.get('/portales/feed/:portal.xml', async (req, res) => {
    try {
        const portal = req.params.portal;
        if (!portalInfo(portal)) return res.status(404).send(`Portal ${portal} no soportado`);
        const vehiculos = await listPublicVehicles();
        res.set('Content-Type', 'application/xml; charset=utf-8');
        res.send(feedFor(portal, vehiculos));
    } catch (err) { console.error('feed:', err); res.status(500).json({ error: err.message }); }
});

// -------- Portales: publicar un vehículo (feed / navegador / Telegram) --------
app.post('/publish/:portal', async (req, res) => {
    try {
        const { portal } = req.params;
        if (!portalInfo(portal)) return res.status(400).json({ error: `Portal ${portal} no soportado` });
        const result = await publicar(portal, req.body?.vehiculo || req.body || {}, req.body?.creds);
        res.json(result);
    } catch (err) { console.error('publish:', err); res.status(500).json({ error: err.message }); }
});

// -------- WhatsApp: OR entregada (agradecimiento + reseña) --------
app.post('/whatsapp/or-entregada', async (req, res) => {
    try {
        const id = req.body.documentId || req.body.orId || req.body.id;
        if (!id) return res.status(400).json({ error: 'Falta documentId' });
        const or = await getOR(id);
        const a = or?.attributes || or || {};
        const cli = a.cliente?.attributes || a.cliente || {};
        const telefono = (cli.telefono || '').replace(/[^\d]/g, '');
        if (!telefono) return res.status(202).json({ skipped: 'cliente sin teléfono' });
        const settings = await getSiteSettingSafe();
        const msg = await renderTemplate('or_entregado_review', {
            cliente: cli.nombre || 'cliente',
            matricula: a.matricula || '',
            trabajos: (a.trabajos_realizados || a.sintomas || 'reparación').toString().replace(/<[^>]+>/g, '').slice(0, 200),
            review_url: settings.googleReviewUrl || 'https://www.google.com/maps/search/?api=1&query=El+Taller+de+Migue+Benifla',
        });
        if (!msg) return res.status(202).json({ skipped: 'plantilla inactiva' });
        const sent = await sendText(telefono, msg);
        if (!sent.skipped) await updateOR(id, { review_whatsapp_enviado: true });
        res.json({ ok: true, skipped: sent.skipped || false });
    } catch (err) { console.error('or-entregada:', err); res.status(500).json({ error: err.message }); }
});

// -------- WhatsApp genérico (desde el CRM) --------
app.post('/whatsapp/send', async (req, res) => {
    try {
        const { to, templateKey, variables, texto } = req.body;
        if (!to) return res.status(400).json({ error: 'Falta destinatario' });
        const body = texto || await renderTemplate(templateKey, variables || {});
        if (!body) return res.status(400).json({ error: 'Sin contenido' });
        res.json(await sendText(to, body));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// -------- Webhook Chatwoot: respuestas SÍ/NO de confirmación de cita --------
app.post('/webhooks/chatwoot', async (req, res) => {
    try {
        const secret = process.env.CHATWOOT_WEBHOOK_SECRET;
        if (secret) {
            const sig = req.headers['x-chatwoot-signature'] || '';
            const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex');
            if (sig !== expected) return res.status(401).json({ error: 'firma inválida' });
        }
        const ev = req.body;
        if (ev.message_type !== 'incoming') return res.json({ ignored: true });
        const texto = (ev.content || '').trim().toLowerCase();
        const phone = (ev.sender?.phone_number || '').replace(/[^\d]/g, '');
        if (!phone || !['si', 'sí', 'no'].includes(texto)) return res.json({ ignored: true });
        const { default: fetchMod } = await import('node-fetch');
        const base = process.env.STRAPI_URL || 'http://strapi:1337';
        const h = { 'Content-Type': 'application/json' };
        if (process.env.STRAPI_TOKEN) h.Authorization = `Bearer ${process.env.STRAPI_TOKEN}`;
        const r = await fetchMod(`${base}/api/citas?populate=cliente&filters[estado][$eq]=Programada&filters[cliente][telefono][$contains]=${phone.slice(-9)}&sort[0]=fecha_hora:asc`, { headers: h });
        const citas = r.ok ? (await r.json()).data || [] : [];
        if (!citas.length) return res.json({ ignored: 'sin cita pendiente' });
        const cita = citas[0];
        await updateCita(cita.documentId || cita.id, { estado: texto === 'no' ? 'Cancelada' : 'Confirmada' });
        res.json({ ok: true, cita: cita.documentId, estado: texto === 'no' ? 'Cancelada' : 'Confirmada' });
    } catch (err) { console.error('chatwoot webhook:', err); res.status(500).json({ error: err.message }); }
});

// -------- Fichajes (kiosco del taller, autenticación por PIN) --------
app.post('/fichajes/entrada', async (req, res) => {
    try {
        const t = await findTrabajadorByPin(String(req.body.pin || ''));
        if (!t) return res.status(404).json({ error: 'PIN no reconocido' });
        const abierto = await findFichajeAbierto(t.documentId || t.id);
        if (abierto) return res.status(409).json({ error: 'Ya hay un fichaje abierto', nombre: t.nombre });
        await crearFichaje({ trabajador: t.documentId || t.id, entrada: new Date().toISOString(), origen: 'Kiosco taller' });
        res.json({ ok: true, nombre: t.nombre, accion: 'entrada' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/fichajes/salida', async (req, res) => {
    try {
        const t = await findTrabajadorByPin(String(req.body.pin || ''));
        if (!t) return res.status(404).json({ error: 'PIN no reconocido' });
        const abierto = await findFichajeAbierto(t.documentId || t.id);
        if (!abierto) return res.status(409).json({ error: 'No hay fichaje abierto', nombre: t.nombre });
        const a = abierto.attributes || abierto;
        const salida = new Date();
        const dur = Math.max(0, Math.floor((salida.getTime() - new Date(a.entrada).getTime()) / 60000));
        await cerrarFichaje(abierto.documentId || abierto.id, { salida: salida.toISOString(), duracion_min: dur });
        res.json({ ok: true, nombre: t.nombre, accion: 'salida', minutos: dur });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// -------- Sincronizar catálogo de WhatsApp --------
app.post('/sync/whatsapp-catalog', async (req, res) => {
    try {
        const result = await syncCatalog();
        res.json(result);
    } catch (err) {
        console.error('WA catalog sync error:', err);
        res.status(500).json({ error: err.message });
    }
});

// -------- Arranque --------
app.listen(PORT, () => {
    console.log(`🚀 Automation worker escuchando en :${PORT}`);
    startCrons();
    if (bot) {
        bot.start()
            .catch(err => console.error('Bot start error:', err));
        console.log('🤖 Bot de Telegram activo');
    } else {
        console.log('ℹ️  Bot de Telegram inactivo (falta TELEGRAM_BOT_TOKEN)');
    }
});
