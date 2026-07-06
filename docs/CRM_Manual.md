
### 🔐 Credenciales de Acceso Oficiales

Entrégale estos datos al dueño del taller (Migue) para que pueda acceder por primera vez a su panel privado. Por seguridad, el sistema le pedirá que confirme estos datos al entrar la primera vez.

* **URL del Panel CRM:** `https://taller-migue-crm-production.up.railway.app/admin`
* **Email de Usuario:** `(email del administrador)`
* **Contraseña Temporal:** `(entregada por canal privado)`

*(Nota: En el primer acceso a la URL anterior, la pantalla le dirá "Welcome! Create your first administrator". Debe introducir exactamente ese Email y esa Contraseña para registrarse como el dueño absoluto del sistema).*

---

---
title: "Manual del Ecosistema Digital - El Taller de Migue"
author: "Sistema Automatizado CRM"
date: "2026"
---

<div align="center">
  <h1>El Taller de Migue</h1>
  <h2>Ecosistema Digital y Sistema de Gestión (CRM)</h2>
</div>

<br><br>

### 1. Enlaces y Accesos de Producción

A continuación se detallan los accesos a la nueva infraestructura digital del taller:

* **Página Web Pública (Escaparate para clientes):**
  [https://frontend-one-theta-88.vercel.app](https://frontend-one-theta-88.vercel.app)
  *(Optimizada para SEO, multidispositivo y con carga ultrarrápida en servidores de Vercel).*

* **Panel de Gestión CRM (Uso exclusivo del taller):**
  *(Se generará automáticamente tras la vinculación en Railway, accesible vía `https://tu-dominio-backend.up.railway.app/admin`)*.


### 🔐 Credenciales de Acceso Oficiales

Entrégale estos datos al dueño del taller (Migue) para que pueda acceder por primera vez a su panel privado. Por seguridad, el sistema le pedirá que confirme estos datos al entrar la primera vez.

* **URL del Panel CRM:** `https://taller-migue-crm-production.up.railway.app/admin`
* **Email de Usuario:** `(email del administrador)`
* **Contraseña Temporal:** `(entregada por canal privado)`

*(Nota: En el primer acceso a la URL anterior, la pantalla le dirá "Welcome! Create your first administrator". Debe introducir exactamente ese Email y esa Contraseña para registrarse como el dueño absoluto del sistema).*

---

### 2. ¿Qué hace tu nuevo CRM (Sistema de Gestión)?

Hemos sustituido el papel y las hojas de cálculo por un sistema centralizado, seguro y escalable diseñado específicamente para el sector de la automoción. Desde este panel privado, podrás gestionar el 100% del negocio:

#### 🧑‍🔧 1. Fichas de Clientes y Flota
* **Base de datos unificada:** Guarda los nombres, teléfonos, emails y direcciones de todos tus clientes.
* **Control de Matrículas:** Cada cliente puede tener asociados múltiples vehículos. Cuando te llamen, sabrás exactamente qué coche tienen y cuál es su historial.
* **Cumplimiento Legal (RGPD):** Casilla de verificación para registrar si el cliente ha firmado el consentimiento de uso de datos, protegiéndote de multas.

#### 📋 2. Órdenes de Reparación (El corazón del taller)
* **Trazabilidad total:** Crea una "Orden de Reparación" cada vez que entra un coche.
* **Estados en tiempo real:** Clasifica las averías en: *Pendiente, En Taller, Esperando Piezas, Terminado* o *Facturado*.
* **Histórico Médico del Coche:** Registra los kilómetros de entrada, los síntomas que describe el cliente y los trabajos técnicos que finalmente realizasteis. Nunca más olvidarás qué aceite se le puso el año pasado.

#### 🚗 3. Gestión de Vehículos de Sustitución (Coches de Cortesía)
* **Control de Flota:** Controla cuántos coches de cortesía tienes disponibles.
* **Préstamos:** Registra a qué cliente le has cedido el vehículo de sustitución y en qué fecha debe devolverlo.
* **Notas de daños:** Apunta rasguños o golpes previos para evitar malentendidos cuando devuelvan el coche.

#### 📅 4. Calendario y Citas
* **Agenda Inteligente:** Programa citas clasificadas por colores (Taller, Revisión, Venta de Vehículos).
* **Estados:** Marca si la cita está *Programada, Confirmada, Completada* o *Cancelada*.

#### 🏷️ 5. Sincronización Directa con la Página Web
* Todo lo que modifiques en el CRM **se reflejará en la web al instante**. Si añades un nuevo coche de segunda mano en el panel de control, aparecerá automáticamente en la sección "Coches de Ocasión" de la página web sin necesidad de tocar nada de código informático.

---

### 3. Pasos para activar el CRM en la Nube (Railway)

1. Entra a tu cuenta de **Railway.app** (donde ya tienes tu GitHub conectado).
2. Haz clic en **"New Project" -> "Deploy from GitHub repo"** y selecciona el repositorio de tu taller.
3. Haz clic en **"Create" -> "Database" -> "PostgreSQL"**.
4. Haz clic en la caja de tu repositorio, ve a la pestaña **Variables** y añade:
   * `DATABASE_CLIENT` = `postgres`
   * `NODE_ENV` = `production`
   * `APP_KEYS` = `clave1,clave2`
   * `API_TOKEN_SALT` = `secreto`
   * `ADMIN_JWT_SECRET` = `secreto`
   * `TRANSFER_TOKEN_SALT` = `secreto`
   * `JWT_SECRET` = `secreto`
5. En la pestaña **Settings**, busca *Root Directory* y escribe `/backend/strapi-cms`.

¡Listo! Tu taller está completamente digitalizado y preparado para crecer.
