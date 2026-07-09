# Almacenamiento ("el drive donde se guarda todo")

Tres piezas, todas **open-source**. Elige segun para que:

| Necesidad | Solucion | Por que |
|---|---|---|
| "Drive" para el dueno (ver/subir carpetas, fotos, docs) | **Nextcloud** | UI tipo Google Drive, apps movil/escritorio, compartir enlaces. |
| Guardar las **fotos del stock de Strapi** de forma persistente | **MinIO (S3)** | Rapido, no se pierde al recrear el contenedor, CDN-friendly. |
| Prefieres Google Drive (15 GB gratis) | **Google Drive** | Ya lo usas; el worker sube via cuenta de servicio (plantilla en `storage/drive.js`). |

## 1) Nextcloud como drive del taller
```bash
cd deploy
docker compose -f docker-compose.yml -f storage/docker-compose.nextcloud.yml up -d
```
Rellena en `.env`: `NEXTCLOUD_DB_ROOT_PASSWORD`, `NEXTCLOUD_DB_PASSWORD`,
`NEXTCLOUD_ADMIN_USER`, `NEXTCLOUD_ADMIN_PASSWORD`, `DOMAIN_DRIVE`.

El automation-worker sube ficheros por WebDAV (`storage/nextcloud.js`). En su
`.env`: `STORAGE_BACKEND=nextcloud`, `NEXTCLOUD_URL`, `NEXTCLOUD_USER`,
`NEXTCLOUD_PASSWORD` (usa una **contrasena de aplicacion** de Nextcloud, no la real).

## 2) MinIO como provider de subida de Strapi
```bash
docker compose -f docker-compose.yml -f storage/docker-compose.minio.yml up -d
```
En el contenedor de Strapi instala el provider y configura
`config/plugins.js` (o `.ts`):
```js
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          endpoint: env('MINIO_ENDPOINT'),        // http://minio:9000
          region: 'us-east-1',
          forcePathStyle: true,
          credentials: {
            accessKeyId: env('MINIO_ROOT_USER'),
            secretAccessKey: env('MINIO_ROOT_PASSWORD'),
          },
        },
        params: { Bucket: env('MINIO_BUCKET', 'taller') },
      },
    },
  },
});
```
Crea el bucket `taller` desde la consola de MinIO (:9001) y ponlo publico de lectura.

## 3) Google Drive (opcional)
Configura `GOOGLE_SERVICE_ACCOUNT_JSON` y `GOOGLE_DRIVE_FOLDER_ID`, pon
`STORAGE_BACKEND=drive` e implementa `storage/drive.js` con `googleapis`.
