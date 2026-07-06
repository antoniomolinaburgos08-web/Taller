// Cliente ligero de Strapi (usa el token de API definido en STRAPI_TOKEN)
import fetch from 'node-fetch';

const BASE = process.env.STRAPI_URL || 'http://strapi:1337';
const TOKEN = process.env.STRAPI_TOKEN;

function headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
    return h;
}

export async function getSiteSetting() {
    const r = await fetch(`${BASE}/api/site-setting`, { headers: headers() });
    if (!r.ok) throw new Error(`Strapi site-setting ${r.status}`);
    const j = await r.json();
    return j.data?.attributes || j.data || {};
}

export async function listPublicVehicles() {
    const r = await fetch(`${BASE}/api/stock-vehicles?populate=*&pagination[pageSize]=100`, { headers: headers() });
    if (!r.ok) throw new Error(`Strapi stock ${r.status}`);
    const j = await r.json();
    return j.data || [];
}

export async function createGasto(data) {
    const r = await fetch(`${BASE}/api/gastos?status=published`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ data }),
    });
    if (!r.ok) throw new Error(`Strapi createGasto ${r.status}: ${await r.text()}`);
    return (await r.json()).data;
}
