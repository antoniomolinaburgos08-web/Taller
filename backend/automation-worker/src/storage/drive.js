// Subida a Google Drive (opcion propietaria pero con 15 GB gratis).
// Requiere una cuenta de servicio (GOOGLE_SERVICE_ACCOUNT_JSON) y la carpeta
// destino (GOOGLE_DRIVE_FOLDER_ID) compartida con esa cuenta de servicio.
export const driveReady = () =>
  Boolean(process.env.GOOGLE_DRIVE_FOLDER_ID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

export async function subirADrive(remotePath, buffer, opts = {}) {
  // Plantilla: implementar con `googleapis`.
  //   const { google } = await import('googleapis');
  //   const auth = new google.auth.GoogleAuth({ credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON), scopes: ['https://www.googleapis.com/auth/drive.file'] });
  //   const drive = google.drive({ version: 'v3', auth });
  //   await drive.files.create({ requestBody: { name, parents: [FOLDER] }, media: { body: stream } });
  return {
    ok: false,
    pendiente: true,
    backend: 'drive',
    mensaje: 'Google Drive: configura GOOGLE_SERVICE_ACCOUNT_JSON y GOOGLE_DRIVE_FOLDER_ID e implementa la subida (googleapis).',
  };
}
