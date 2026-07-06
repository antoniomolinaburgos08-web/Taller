# Instrucciones de Despliegue para El Taller de Migue

Este documento explica cómo desplegar el frontend en **Vercel** y el backend en **Railway**.

## 1. Despliegue del Frontend (Vercel)

El frontend de tu aplicación (carpeta `frontend/`) está diseñado para ser alojado de manera estática y rápida en Vercel.

### Pasos:
1. **Sube el código a GitHub:** Asegúrate de que tu carpeta `El_Taller_de_Migue_Final` esté subida a un repositorio de GitHub.
2. **Inicia sesión en Vercel:** Entra a [vercel.com](https://vercel.com) e inicia sesión con GitHub.
3. **Añadir Nuevo Proyecto:** Haz clic en "Add New..." y luego en "Project".
4. **Importar Repositorio:** Selecciona el repositorio donde subiste el código.
5. **Configuración del Proyecto:**
   - **Framework Preset:** Selecciona `Other` (ya que es HTML/JS puro).
   - **Root Directory:** Haz clic en "Edit" y selecciona la carpeta `frontend`.
   - **Environment Variables:** Añade las variables de entorno que tienes en `frontend/.env.local` (por ejemplo, URLs de API).
6. **Deploy:** Haz clic en el botón "Deploy". Vercel compilará (si es necesario) y te dará una URL pública como `https://tu-proyecto.vercel.app`.

---

## 2. Despliegue del Backend (Railway)

El backend utiliza Strapi v5 (o tu tecnología configurada en la carpeta `backend/`) y base de datos, lo cual es ideal para Railway.

### Pasos:
1. **Inicia sesión en Railway:** Entra a [railway.app](https://railway.app) e inicia sesión con GitHub.
2. **Crear Nuevo Proyecto:** Haz clic en "New Project" -> "Deploy from GitHub repo".
3. **Seleccionar Repositorio:** Elige el mismo repositorio de GitHub.
4. **Configuración de Variables de Entorno:**
   - Ve a la pestaña **Variables** en el panel de Railway de tu servicio.
   - Añade todas las variables que tienes en el archivo `.env` del directorio `backend` (como contraseñas de base de datos, tokens JWT, puerto, etc.).
   - Si usas PostgreSQL o MySQL, Railway te permite crear un servicio de base de datos con 1 clic ("New" -> "Database" -> "PostgreSQL"). Asegúrate de conectar las variables de la base de datos a tu backend.
5. **Comando de Inicio (Start Command):**
   - Asegúrate de que el **Root Directory** del servicio apunte a la carpeta `backend` o despliega solo el backend si lo separas en un repo distinto (recomendado).
   - El comando de inicio suele ser `npm run start` o `yarn start`.
6. **Generar Dominio:** Ve a la pestaña **Settings** -> **Networking** y haz clic en "Generate Domain" para que tu backend tenga una URL pública (ej. `https://tu-backend.up.railway.app`).

---

## 3. Conexión entre Frontend y Backend

Una vez que tengas ambos servicios desplegados:

1. **Apunta el Frontend al Backend:**
   - Ve a las opciones de **Environment Variables** en Vercel.
   - Asegúrate de que cualquier variable que defina la URL del backend (ej. `STRAPI_URL`, `API_URL` o dentro de `config.js`/`inject_auth.js` en tu frontend) apunte a la nueva URL de Railway (ej. `https://tu-backend.up.railway.app`).
2. **Apunta el Backend al Frontend (CORS):**
   - En Railway, añade o actualiza la variable de entorno de CORS en el backend (ej. `CORS_ORIGIN` o configuración en `middlewares.js`) para permitir peticiones desde tu nueva URL de Vercel (`https://tu-proyecto.vercel.app`).
3. **Re-desplegar:** Si hiciste cambios en las variables de entorno, haz un re-deploy en Vercel y en Railway para que tomen los nuevos valores.

¡Tu "nuevo sitio pulido" ahora estará en línea y conectado!
