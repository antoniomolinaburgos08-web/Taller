// Cliente de WhatsApp Cloud API (Meta Graph). Si faltan credenciales, todo es no-op con warning.
import fetch from 'node-fetch';

const GRAPH = 'https://graph.facebook.com/v21.0';
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;

export const whatsappReady = () => Boolean(PHONE_ID && TOKEN);

export async function sendText(to, body) {
    if (!whatsappReady()) {
        console.warn('[whatsapp] sin credenciales — mensaje omitido:', String(body).slice(0, 60));
        return { skipped: true };
    }
    const num = String(to).replace(/[^\d]/g, '');
    const r = await fetch(`${GRAPH}/${PHONE_ID}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: num, type: 'text', text: { body } }),
    });
    if (!r.ok) throw new Error(`WhatsApp ${r.status}: ${await r.text()}`);
    return await r.json();
}
