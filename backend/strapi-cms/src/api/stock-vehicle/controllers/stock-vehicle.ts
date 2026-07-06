import { factories } from '@strapi/strapi';

const escapeXml = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const escapeCsv = (v: unknown): string => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const getPublicVehicles = async (strapi: any) =>
  await strapi.documents('api::stock-vehicle.stock-vehicle').findMany({
    status: 'published',
    populate: { gallery: true },
    filters: { condition: { $notIn: ['Vendido', 'Archivado'] } },
  });

const galleryUrls = (v: any, host: string): string[] => {
  const arr = Array.isArray(v.gallery) ? v.gallery : v.gallery ? [v.gallery] : [];
  const urls = arr
    .map((img: any) => img?.url || '')
    .filter(Boolean)
    .map((u: string) => (u.startsWith('http') ? u : `${host}${u}`));
  if (urls.length === 0 && v.image_url) urls.push(v.image_url);
  return urls;
};

export default factories.createCoreController(
  'api::stock-vehicle.stock-vehicle' as any,
  ({ strapi }) => ({
    // -------- Feed XML compatible con coches.net (formato estándar de portales) --------
    async feedCochesnet(ctx) {
      const settings: any = await strapi.documents('api::site-setting.site-setting').findFirst({});
      const dealerId = settings?.cochesnetDealerId || '';
      const host = `${ctx.request.protocol}://${ctx.request.host}`;
      const vehicles = await getPublicVehicles(strapi);

      const items = vehicles
        .map((v: any) => {
          const images = galleryUrls(v, host)
            .map((u, i) => `      <picture position="${i + 1}"><url>${escapeXml(u)}</url></picture>`)
            .join('\n');
          return `  <vehicle>
    <reference>${escapeXml(v.documentId || v.id)}</reference>
    <title>${escapeXml(v.title)}</title>
    <price currency="EUR">${escapeXml(v.price ?? 0)}</price>
    <year>${escapeXml(v.year ?? '')}</year>
    <kilometers>${escapeXml(v.kilometers ?? 0)}</kilometers>
    <fuel>${escapeXml(v.fuel_type ?? '')}</fuel>
    <transmission>${escapeXml(v.transmission ?? '')}</transmission>
    <body_type>${escapeXml(v.body_type ?? '')}</body_type>
    <color>${escapeXml(v.exterior_color ?? '')}</color>
    <engine_size>${escapeXml(v.engine_size ?? '')}</engine_size>
    <doors>${escapeXml(v.doors ?? '')}</doors>
    <condition>${escapeXml(v.condition ?? 'Disponible')}</condition>
    <description><![CDATA[${v.description || v.features || ''}]]></description>
    <pictures>
${images}
    </pictures>
  </vehicle>`;
        })
        .join('\n');

      ctx.set('Content-Type', 'application/xml; charset=utf-8');
      ctx.body = `<?xml version="1.0" encoding="UTF-8"?>
<vehicles dealer="${escapeXml(dealerId)}" generated="${new Date().toISOString()}">
${items}
</vehicles>`;
    },

    // -------- Feed JSON para importar a Wallapop / mostrar en widgets externos --------
    async feedWallapop(ctx) {
      const host = `${ctx.request.protocol}://${ctx.request.host}`;
      const vehicles = await getPublicVehicles(strapi);
      ctx.set('Content-Type', 'application/json; charset=utf-8');
      ctx.body = {
        generated_at: new Date().toISOString(),
        count: vehicles.length,
        items: vehicles.map((v: any) => ({
          id: v.documentId || v.id,
          title: v.title,
          price: v.price,
          currency: 'EUR',
          description: v.description || v.features || '',
          year: v.year,
          kilometers: v.kilometers,
          fuel: v.fuel_type,
          transmission: v.transmission,
          body_type: v.body_type,
          color: v.exterior_color,
          images: galleryUrls(v, host),
          condition: v.condition || 'Disponible',
        })),
      };
    },

    // -------- CSV genérico (Milanuncios, Autocasion, Excel…) --------
    async feedCsv(ctx) {
      const host = `${ctx.request.protocol}://${ctx.request.host}`;
      const vehicles = await getPublicVehicles(strapi);
      const header = [
        'referencia', 'titulo', 'precio_eur', 'anio', 'kilometros',
        'combustible', 'cambio', 'carroceria', 'color', 'motor',
        'puertas', 'condicion', 'descripcion', 'foto_principal',
      ].join(',');
      const rows = vehicles.map((v: any) => {
        const imgs = galleryUrls(v, host);
        return [
          v.documentId || v.id,
          v.title,
          v.price ?? '',
          v.year ?? '',
          v.kilometers ?? '',
          v.fuel_type ?? '',
          v.transmission ?? '',
          v.body_type ?? '',
          v.exterior_color ?? '',
          v.engine_size ?? '',
          v.doors ?? '',
          v.condition ?? '',
          (v.description || v.features || '').substring(0, 500),
          imgs[0] || '',
        ].map(escapeCsv).join(',');
      });
      ctx.set('Content-Type', 'text/csv; charset=utf-8');
      ctx.set('Content-Disposition', 'attachment; filename="stock-taller-migue.csv"');
      ctx.body = [header, ...rows].join('\n');
    },
  }),
);
