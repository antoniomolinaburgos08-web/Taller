---
title: "Análisis Completo del Sistema CRM - El Taller de Migue"
author: "Sistema Automatizado CRM"
date: "2026"
---

# 🚀 Análisis y Funcionalidades del CRM (El Taller de Migue)

El nuevo ecosistema digital del Taller de Migue está estructurado en una arquitectura moderna que separa la web pública (Front-end) del panel de gestión interno (CRM / Back-end). Esto garantiza velocidad, seguridad y una escalabilidad profesional.

## 🛠 Arquitectura del Sistema

El sistema cuenta con tres pilares fundamentales:
1. **Página Web Pública:** Construida para cargar extremadamente rápido, alojada en Vercel, y preparada para SEO (optimización en Google).
2. **Strapi CMS (Base de datos central):** Actúa como el cerebro del taller. Toda la información real se almacena de forma segura aquí.
3. **Dashboard / Interfaz de Administración:** Un panel visual creado específicamente para el uso diario en recepción y taller (alta de clientes, presupuestos, vehículos).

---

## 📊 Funcionalidades del CRM

### 1. Fichas de Clientes y Flota (Base de Datos Unificada)
* **Gestión de Clientes:** Registro de nombres, apellidos, teléfonos (con integración WhatsApp), emails y domicilios.
* **Control de Flota:** Un cliente puede tener registrados múltiples vehículos (Coches, Furgonetas, Autocaravanas) con su marca, modelo, matrícula y número de bastidor.
* **Cumplimiento Legal (RGPD):** Casilla de verificación para constatar que el cliente ha aceptado la política de tratamiento de datos.

### 2. Órdenes de Reparación (El Corazón del Taller)
* **Trazabilidad Total:** Registro completo de los trabajos a realizar en cada vehículo que entra por la puerta.
* **Estados en Tiempo Real:** Las órdenes se clasifican visualmente en: *Pendiente, En Taller, Esperando Piezas, Terminado* o *Facturado*.
* **Histórico Médico:** Registro de kilómetros exactos a la entrada, descripción de la avería por el cliente y trabajos ejecutados por el mecánico. 

### 3. Calendario, Citas y Notificaciones (WhatsApp)
* **Agenda Inteligente:** Módulo para programar revisiones, ITV o mantenimientos periódicos.
* **Alertas Automatizadas:** Capacidad de enviar notificaciones y recordatorios automáticos directamente por WhatsApp a los clientes cuando su coche está listo o le toca revisión (Aceite, Filtros, ITV).
* **Integración Omnicanal (Chatwoot):** Gestión de mensajes entrantes desde WhatsApp, Facebook, Instagram y el widget de la web en una misma bandeja de entrada.

### 4. Generador de Presupuestos
* **Creación de Presupuestos In-Situ:** Capacidad de preparar presupuestos detallando piezas y mano de obra, calculando los impuestos automáticamente.
* **Envío Directo:** Función de enviar el presupuesto al cliente por correo electrónico o WhatsApp de manera instantánea en formato profesional.

### 5. Stock de Vehículos (Sincronización Web)
* **Gestión de Inventario de Ocasión:** Subida de vehículos para venta (marca, modelo, kilómetros, características, precios y fotos).
* **Escaparate en Tiempo Real:** Al añadir o modificar un coche desde el panel de control (ej. marcar como "Vendido"), los cambios se aplican de forma inmediata en la web pública de clientes sin necesitar tocar el código.

### 6. Vehículos de Sustitución (Coches de Cortesía)
* **Control de Préstamos:** Registro de a qué cliente y en qué fecha se le ha dejado un coche de cortesía.
* **Supervisión de Daños:** Anotaciones de estado (golpes, rasguños) a la entrega y recogida del vehículo prestado.

---

## 🔐 Accesos y Seguridad

Para proteger la integridad del taller, los accesos al administrador no son públicos ni visibles en la página web:

* **URL del Panel Base de Datos (Strapi):** [https://taller-migue-crm-production.up.railway.app/admin](https://taller-migue-crm-production.up.railway.app/admin)
* **Dashboard Frontal:** [https://frontend-one-theta-88.vercel.app/admin.html](https://frontend-one-theta-88.vercel.app/admin.html)
* **Usuario (Dueño):** `(email del administrador)`
* **Contraseña Temporal:** `(entregada por canal privado)`

*(Recomendación: Cambiar la contraseña temporal en el primer inicio de sesión).*
