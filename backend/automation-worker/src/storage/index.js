// Almacen de ficheros configurable: STORAGE_BACKEND = nextcloud | drive
import { subirANextcloud, nextcloudReady } from './nextcloud.js';
import { subirADrive, driveReady } from './drive.js';

const BACKEND = (process.env.STORAGE_BACKEND || 'nextcloud').toLowerCase();
export const storageBackend = () => BACKEND;
export const storageReady = () => (BACKEND === 'drive' ? driveReady() : nextcloudReady());

export async function guardarArchivo(remotePath, buffer, opts) {
  if (BACKEND === 'drive') return subirADrive(remotePath, buffer, opts);
  return subirANextcloud(remotePath, buffer, opts);
}
