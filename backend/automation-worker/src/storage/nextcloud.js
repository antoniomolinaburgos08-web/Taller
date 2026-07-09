// Subida de ficheros a Nextcloud (el "drive" open-source) por WebDAV.
import fetch from 'node-fetch';

const URL = (process.env.NEXTCLOUD_URL || '').replace(/\/$/, '');
const USER = process.env.NEXTCLOUD_USER || '';
const PASS = process.env.NEXTCLOUD_PASSWORD || '';

export const nextcloudReady = () => Boolean(URL && USER && PASS);
const auth = () => 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');
const enc = seg => seg.split('/').map(encodeURIComponent).join('/');

// remotePath ej: "Taller/coche-1234/foto.jpg". Crea carpetas intermedias.
export async function subirANextcloud(remotePath, buffer, { contentType = 'application/octet-stream' } = {}) {
  if (!nextcloudReady()) throw new Error('Nextcloud no configurado (NEXTCLOUD_URL/USER/PASSWORD)');
  const base = `${URL}/remote.php/dav/files/${encodeURIComponent(USER)}`;
  const parts = remotePath.split('/').slice(0, -1);
  let acc = '';
  for (const p of parts) {
    acc += '/' + encodeURIComponent(p);
    await fetch(`${base}${acc}`, { method: 'MKCOL', headers: { Authorization: auth() } }).catch(() => {});
  }
  const dest = `${base}/${enc(remotePath)}`;
  const r = await fetch(dest, { method: 'PUT', headers: { Authorization: auth(), 'Content-Type': contentType }, body: buffer });
  if (!r.ok && r.status !== 204) throw new Error(`Nextcloud PUT ${r.status}: ${await r.text()}`);
  return { ok: true, backend: 'nextcloud', path: remotePath };
}
