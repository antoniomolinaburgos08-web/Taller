import { encrypt, decrypt, cryptoReady } from './crypto.js';
import { buildFeed } from './feed.js';
import { publicarConNavegador } from './navegador.js';

// Capacidades de cada portal.
export const PORTALES = {
  'coches.net':     { modo: 'feed',      auto: true,  nota: 'Stock por feed XML (area de profesionales). Da de alta el feed en su panel.' },
  'coches.com':     { modo: 'feed',      auto: true,  nota: 'Stock por feed XML.' },
  'autoscout24':    { modo: 'feed',      auto: true,  nota: 'Feed para concesionarios (AutoScout24 Dealer / DMS).' },
  'wallapop':       { modo: 'navegador', auto: false, nota: 'Sin API publica. Navegador (Playwright) o publicacion asistida por Telegram.' },
  'milanuncios':    { modo: 'navegador', auto: false, nota: 'Sin API publica. Igual que Wallapop.' },
  'fb-marketplace': { modo: 'navegador', auto: false, nota: 'Sin API de listados. Graph API solo para Shops/Catalogo de empresa.' },
};

export function portalInfo(portal) {
  return PORTALES[portal] || null;
}

// Genera el feed de un portal a partir de la lista de vehiculos del stock.
export function feedFor(portal, vehiculos) {
  return buildFeed(vehiculos, { portal });
}

// Publica un vehiculo en un portal segun su modo.
export async function publicar(portal, vehiculo, creds) {
  const info = PORTALES[portal];
  if (!info) return { ok: false, error: `Portal ${portal} no soportado` };
  if (info.modo === 'feed') {
    return { ok: true, modo: 'feed', nota: `${portal} se actualiza por feed. El vehiculo aparecera en el proximo import.` };
  }
  return publicarConNavegador(portal, vehiculo, creds);
}

export { encrypt, decrypt, cryptoReady };
