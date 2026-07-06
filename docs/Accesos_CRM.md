# 🚀 Accesos Internos y Credenciales - El Taller de Migue

Este documento contiene los enlaces directos y las credenciales de acceso para la gestión interna de tu negocio. **Mantenlo en un lugar seguro.**

---

## 🔗 1. Enlaces y Credenciales

### A. Panel Central CMS (Strapi)
Aquí es donde se almacena toda tu base de datos: vehículos, clientes, configuración de la web (como teléfonos, horarios) y servicios. 

* **URL de Acceso (Producción):** [https://taller-migue-crm-production.up.railway.app/admin](https://taller-migue-crm-production.up.railway.app/admin)
* **Email / Usuario:** `(email del administrador)`
* **Contraseña:** `(entregada por canal privado)`
*(Si es la primera vez que accedes, la pantalla indicará "Welcome! Create your first administrator". Introduce los mismos datos para registrarte como el dueño absoluto).*

### B. Dashboard de Gestión (Interfaz Rápida)
Esta es una pantalla de uso diario más visual y rápida, pensada para poder dar de alta clientes o vehículos rápidamente y enviar recordatorios de WhatsApp.

* **URL de Acceso:** [https://frontend-one-theta-88.vercel.app/admin.html](https://frontend-one-theta-88.vercel.app/admin.html)
*(Nota: Si lo utilizas en local, la URL será `http://localhost:5500/frontend/admin.html` o la que corresponda a tu servidor local).*

---

## 🛠 2. ¿Qué es el CRM y para qué sirve?

El **CRM (Customer Relationship Management)** es tu centro de operaciones digital. Es el "cerebro" detrás de la página web de *El Taller de Migue*. 

### ¿Qué puedes hacer desde el Panel Central CMS (Strapi)?
1. **Gestionar Vehículos en Venta:** Todo coche o autocaravana que añadas desde el panel, aparecerá automáticamente y al instante en la web pública para tus clientes. Si marcas un coche como "Vendido", cambiará su etiqueta visualmente en la web de inmediato.
2. **Base de Datos de Clientes:** Guarda todos los datos de tus clientes (nombre, teléfono, email y coche) para no perder el rastro de ninguna reparación.
3. **Modificar Información de la Web:** Puedes cambiar el teléfono de WhatsApp, horarios o añadir nuevos servicios sin necesidad de saber programar.
4. **Opiniones y Contactos:** Todas las solicitudes que te envían los clientes a través del formulario de la web se guardarán de forma organizada.

### ¿Por qué lo hemos separado de la web principal?
Hemos eliminado los accesos directos al panel (como el modal o los botones al final de la página web) para **proteger la seguridad de tu negocio**. 
Ningún cliente ni visitante externo a la web debe saber que existe un panel de control ni intentar acceder a él. Es una herramienta **exclusivamente interna** para ti y tu equipo de mecánicos o administración.
