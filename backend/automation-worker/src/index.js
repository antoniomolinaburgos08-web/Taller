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
import { createGasto } from './strapi.js';

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

// -------- Publicar en portales (stub: Wallapop no tiene API pública) --------
app.post('/publish/:portal', async (req, res) => {
    const { portal } = req.params;
    // Para Wallapop, Milanuncios y demás: genera el pack y lo envía al Telegram del dueño
    if (portal === 'wallapop' || portal === 'milanuncios') {
        return res.json({
            ok: true,
            note: `${portal} no permite publicación automática. El pack se enviará por Telegram al móvil del dueño para publicar en 1 tap.`,
        });
    }
    res.status(400).json({ error: `Portal ${portal} no soportado` });
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
    if (bot) {
        bot.start()
            .catch(err => console.error('Bot start error:', err));
        console.log('🤖 Bot de Telegram activo');
    } else {
        console.log('ℹ️  Bot de Telegram inactivo (falta TELEGRAM_BOT_TOKEN)');
    }
});
