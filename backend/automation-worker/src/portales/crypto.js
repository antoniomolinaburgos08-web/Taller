// Cifrado simétrico de contraseñas de portales (AES-256-GCM).
// La clave vive SOLO en el worker (PORTAL_CRYPTO_KEY = 64 hex / 32 bytes).
// Genera una con:  openssl rand -hex 32
import crypto from 'node:crypto';

const KEY_HEX = process.env.PORTAL_CRYPTO_KEY || '';
export const cryptoReady = () => /^[0-9a-fA-F]{64}$/.test(KEY_HEX);

function key() {
  if (!cryptoReady()) {
    throw new Error('PORTAL_CRYPTO_KEY invalida. Debe ser 64 hex (32 bytes). Genera: openssl rand -hex 32');
  }
  return Buffer.from(KEY_HEX, 'hex');
}

export function encrypt(plain) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(String(plain), 'utf8'), c.final()]);
  const tag = c.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join(':');
}

export function decrypt(blob) {
  const [ivB, tagB, dataB] = String(blob).split(':');
  const d = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(ivB, 'base64'));
  d.setAuthTag(Buffer.from(tagB, 'base64'));
  return Buffer.concat([d.update(Buffer.from(dataB, 'base64')), d.final()]).toString('utf8');
}
