// Sincroniza el stock del taller con el catálogo de WhatsApp Business (Meta Graph API).
// Requiere META_ACCESS_TOKEN y META_CATALOG_ID en el entorno.
import fetch from 'node-fetch';
import { listPublicVehicles } from './strapi.js';

const GRAPH = 'https://graph.facebook.com/v21.0';

export async function syncCatalog() {
    const token = process.env.META_ACCESS_TOKEN;
    const catalogId = process.env.META_CATALOG_ID;
    if (!token || !catalogId) throw new Error('META_ACCESS_TOKEN y META_CATALOG_ID son obligatorios');

    const vehicles = await listPublicVehicles();

    const requests = vehicles.map(v => {
        const a = v.attributes || v;
        return {
            method: 'CREATE',
            retailer_id: String(v.documentId || v.id),
            data: {
                name: a.title || 'Vehículo',
                description: (a.description || a.features || '').substring(0, 5000),
                availability: (a.condition || '').toLowerCase() === 'vendido' ? 'out of stock' : 'in stock',
                condition: 'used',
                price: Math.round(Number(a.price || 0) * 100), // Meta espera céntimos
                currency: 'EUR',
                image_url: a.image_url || (a.gallery?.[0]?.url ?? ''),
                brand: 'El Taller de Migue',
                url: `https://eltallerdemigue.es/#stock`,
            },
        };
    });

    const r = await fetch(`${GRAPH}/${catalogId}/items_batch?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
    });
    if (!r.ok) throw new Error(`Meta sync ${r.status}: ${await r.text()}`);
    return { count: vehicles.length, result: await r.json() };
}
