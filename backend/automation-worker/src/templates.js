// Carga plantillas de WhatsApp desde Strapi y renderiza variables {{x}}. Caché 5 min.
import { listTemplates } from './strapi.js';

let cache = null, cacheAt = 0;

export async function renderTemplate(clave, vars = {}) {
    if (!cache || Date.now() - cacheAt > 5 * 60_000) {
        cache = await listTemplates().catch(() => []);
        cacheAt = Date.now();
    }
    const t = cache.find(x => (x.clave || x.attributes?.clave) === clave);
    const cuerpo = t ? (t.cuerpo || t.attributes?.cuerpo) : null;
    const activa = t ? (t.activa ?? t.attributes?.activa ?? true) : false;
    if (!cuerpo || !activa) return null;
    return cuerpo.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
}
