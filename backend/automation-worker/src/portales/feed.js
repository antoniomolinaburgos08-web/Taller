// Genera un feed XML de stock. Los portales de profesionales (coches.net,
// AutoScout24, coches.com) importan el stock por un feed que ellos leen
// periodicamente: es la via oficial y estable (no depende de contrasenas).
function esc(s) {
  return String(s ?? '').replace(/[<>&'"]/g, c => (
    { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]
  ));
}

export function buildFeed(vehiculos, { portal = 'generic' } = {}) {
  const items = (vehiculos || []).map(v => {
    const a = v.attributes || v;
    const fotos = (a.fotos?.data || a.fotos || [])
      .map(f => (f.attributes?.url || f.url))
      .filter(Boolean)
      .map(u => `      <foto>${esc(u)}</foto>`).join('\n');
    return `  <vehiculo>
    <id>${esc(a.documentId || v.id || a.id)}</id>
    <marca>${esc(a.marca)}</marca>
    <modelo>${esc(a.modelo)}</modelo>
    <version>${esc(a.version)}</version>
    <anio>${esc(a.anio ?? a.ano ?? a.year)}</anio>
    <km>${esc(a.kilometros ?? a.km)}</km>
    <combustible>${esc(a.combustible)}</combustible>
    <cambio>${esc(a.cambio)}</cambio>
    <precio>${esc(a.precio)}</precio>
    <matricula>${esc(a.matricula)}</matricula>
    <descripcion>${esc(a.descripcion)}</descripcion>
    <fotos>
${fotos}
    </fotos>
  </vehiculo>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<stock portal="${esc(portal)}" generado="${new Date().toISOString()}">
${items}
</stock>`;
}
