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

// ---------- Helpers Fase 6 (operativa taller) ----------
async function sget(path) {
    const r = await fetch(`${BASE}${path}`, { headers: headers() });
    if (!r.ok) throw new Error(`Strapi GET ${path} ${r.status}`);
    return (await r.json()).data ?? [];
}
async function supd(uid, documentId, data, published = true) {
    const q = published ? '?status=published' : '';
    const r = await fetch(`${BASE}/api/${uid}/${documentId}${q}`, {
        method: 'PUT', headers: headers(), body: JSON.stringify({ data }),
    });
    if (!r.ok) throw new Error(`Strapi PUT ${uid}/${documentId} ${r.status}`);
    return (await r.json()).data;
}
async function screate(uid, data, published = false) {
    const q = published ? '?status=published' : '';
    const r = await fetch(`${BASE}/api/${uid}${q}`, {
        method: 'POST', headers: headers(), body: JSON.stringify({ data }),
    });
    if (!r.ok) throw new Error(`Strapi POST ${uid} ${r.status}: ${await r.text()}`);
    return (await r.json()).data;
}

export const getOR = id => sget(`/api/orden-reparacions/${id}?populate=cliente`);
export const updateOR = (id, data) => supd('orden-reparacions', id, data);
export const listTemplates = () => sget('/api/whatsapp-templates?pagination[pageSize]=50');
export const updateCita = (id, data) => supd('citas', id, data);
export const updateMantenimiento = (id, data) => supd('mantenimientos', id, data);
export const updatePrestamo = (id, data) => supd('prestamo-cortesias', id, data, false);
export const crearFichaje = data => screate('fichajes', data);
export const cerrarFichaje = (id, data) => supd('fichajes', id, data, false);

export async function listCitasProximas(hoursFrom = 23, hoursTo = 25) {
    const from = new Date(Date.now() + hoursFrom * 3600_000).toISOString();
    const to = new Date(Date.now() + hoursTo * 3600_000).toISOString();
    return sget(`/api/citas?populate=cliente&filters[estado][$eq]=Programada&filters[fecha_hora][$gte]=${from}&filters[fecha_hora][$lte]=${to}`);
}
export async function listMantenimientosDue(diasVentana = 30) {
    const limite = new Date(Date.now() + diasVentana * 86400_000).toISOString().split('T')[0];
    return sget(`/api/mantenimientos?populate=cliente&filters[estado][$eq]=Programado&filters[proximo_en_fecha][$lte]=${limite}`);
}
export async function listPrestamosVencidos() {
    const now = new Date().toISOString();
    return sget(`/api/prestamo-cortesias?populate[cliente]=true&populate[vehiculo]=true&filters[estado][$eq]=Activo&filters[fecha_devolucion_esperada][$lt]=${now}`);
}
export async function findTrabajadorByPin(pin) {
    const list = await sget(`/api/trabajadores?filters[pin_fichaje][$eq]=${encodeURIComponent(pin)}&filters[activo][$eq]=true`);
    return list[0] || null;
}
export async function findFichajeAbierto(trabajadorDocId) {
    const list = await sget(`/api/fichajes?filters[trabajador][documentId][$eq]=${trabajadorDocId}&filters[salida][$null]=true&sort[0]=entrada:desc`);
    return list[0] || null;
}
export const getSiteSettingSafe = () => getSiteSetting().catch(() => ({}));
