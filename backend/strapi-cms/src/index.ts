export default {
  register({ strapi }: { strapi: any }) {},

  async bootstrap({ strapi }: { strapi: any }) {
    async function configureAuthAndPermissions() {
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'public' } });
      const authRole = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type: 'authenticated' } });
      
      if (!publicRole || !authRole) return;

      const uids = [
        'api::service.service', 'api::review.review', 'api::brand.brand',
        'api::collaborator.collaborator', 'api::site-setting.site-setting',
        'api::stock-vehicle.stock-vehicle', 'api::contact-submission.contact-submission',
        'api::cita.cita', 'api::cliente.cliente', 'api::orden-reparacion.orden-reparacion',
      ];

      // Public: SOLO Lectura (find, findOne) para que la web funcione
      for (const uid of uids) {
        for (const action of ['find', 'findOne']) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: { action: `${uid}.${action}`, role: publicRole.id },
          }).catch(() => {});
        }
      }

      // Public: Formulario de contacto puede crear (para que los clientes escriban)
      await strapi.db.query('plugin::users-permissions.permission').create({
        data: { action: `api::contact-submission.contact-submission.create`, role: publicRole.id },
      }).catch(() => {});

      // Auth: TODO el acceso (Lectura y Escritura) para el CRM
      for (const uid of uids) {
        for (const action of ['find', 'findOne', 'create', 'update', 'delete']) {
          await strapi.db.query('plugin::users-permissions.permission').create({
            data: { action: `${uid}.${action}`, role: authRole.id },
          }).catch(() => {});
        }
      }

      // Crear Usuario por defecto para el CRM (si no existe)
      const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { email: 'taller@migue.com' } });
      if (!existingUser) {
        // En Strapi v5, la encriptación la maneja el servicio de user
        await strapi.plugin('users-permissions').service('user').add({
          username: 'Migue Taller',
          email: 'taller@migue.com',
          password: 'MigueTaller2026*',
          provider: 'local',
          confirmed: true,
          blocked: false,
          role: authRole.id
        }).catch(console.error);
      }
    }
    await configureAuthAndPermissions();

    const hasServices = await strapi.entityService.count('api::service.service').catch(() => 0);
    if (hasServices > 0) return;

    await strapi.entityService.create('api::site-setting.site-setting', {
      data: {
        siteName: 'El Taller de Migue',
        tagline: 'Tu mecánico de confianza en Benifla',
        address: 'Moli Nou 8, 46722 Benifla, Valencia',
        phone: '625 78 64 38',
        email: 'info@eltallerdemigue.es',
        whatsapp: '34625786438',
        schedule: { 'Lun-Vie': '9:00-13:30 / 15:00-19:00', Sáb: '9:00-13:00', Dom: 'Cerrado' },
        googleMapsUrl: 'https://maps.google.com/?q=Moli+Nou+8+Benifla',
        seoDescription: 'Taller mecánico en Benifla, Valencia. Reparación de coches y autocaravanas. Más de 15 años de experiencia.',
        seoKeywords: 'taller mecánico Benifla, taller Valencia, reparación coches, autocaravanas, pre-ITV',
        publishedAt: new Date(),
      },
    });

    const services = [
      { title: 'Mecánica General', description: 'Reparación y mantenimiento de todo tipo de vehículos. Diagnóstico preciso y reparaciones garantizadas.', icon: 'fa-solid fa-wrench', order: 1, featured: true },
      { title: 'Diagnosis Electrónica', description: 'Equipos de última generación para detectar y solucionar cualquier avería electrónica de tu vehículo.', icon: 'fa-solid fa-microchip', order: 2, featured: true },
      { title: 'Cambio de Aceite', description: 'Aceites de primeras marcas para el cuidado óptimo de tu motor. Cambio rápido y profesional.', icon: 'fa-solid fa-oil-can', order: 3, featured: false },
      { title: 'Frenos', description: 'Revisión y sustitución de pastillas, discos y líquido de frenos. Tu seguridad es lo primero.', icon: 'fa-solid fa-brake-warning', order: 4, featured: true },
      { title: 'Climatización', description: 'Carga de gas, reparación y mantenimiento del aire acondicionado de tu vehículo.', icon: 'fa-solid fa-snowflake', order: 5, featured: false },
      { title: 'Pre-ITV', description: 'Revisión completa de tu vehículo antes de pasar la ITV. Te ayudamos a pasar a la primera.', icon: 'fa-solid fa-clipboard-check', order: 6, featured: true },
    ];
    for (const s of services) {
      await strapi.entityService.create('api::service.service', { data: { ...s, publishedAt: new Date() } });
    }

    const reviews = [
      { name: 'Carlos García', rating: 5, text: 'Excelente trato y profesionalidad. Me solucionaron el problema del coche rápidamente y a buen precio. Muy recomendable.', date: '2024-12-15', featured: true },
      { name: 'María López', rating: 5, text: 'El mejor taller de la zona. Siempre confío en Migue para el mantenimiento de mi coche. Trato cercano y trabajo impecable.', date: '2024-11-20', featured: true },
      { name: 'Javier Martínez', rating: 5, text: 'Me hicieron la pre-ITV y pasé a la primera. Muy contento con el servicio. Volveré sin duda.', date: '2024-10-05', featured: true },
      { name: 'Ana Belén Ruiz', rating: 4, text: 'Muy profesionales y rápidos. Me cambiaron los frenos en tiempo récord. Precios ajustados.', date: '2024-09-18', featured: false },
      { name: 'Pedro Sánchez', rating: 5, text: 'De toda la vida. Conozco a Migue desde que abrió el taller y siempre ha sido honesto y eficiente. Un 10.', date: '2024-08-30', featured: true },
    ];
    for (const r of reviews) {
      await strapi.entityService.create('api::review.review', { data: { ...r, publishedAt: new Date() } });
    }

    const brands = [
      { name: 'Bosch', website: 'https://www.bosch.com', order: 1 },
      { name: 'Continental', website: 'https://www.continental.com', order: 2 },
      { name: 'Castrol', website: 'https://www.castrol.com', order: 3 },
      { name: 'Varta', website: 'https://www.varta.com', order: 4 },
      { name: 'Brembo', website: 'https://www.brembo.com', order: 5 },
      { name: 'Osram', website: 'https://www.osram.com', order: 6 },
      { name: 'Mann-Filter', website: 'https://www.mann-filter.com', order: 7 },
      { name: 'Sachs', website: 'https://aftermarket.zf.com', order: 8 },
      { name: 'Michelin', website: 'https://www.michelin.com', order: 9 },
      { name: 'Bridgestone', website: 'https://www.bridgestone.com', order: 10 },
      { name: 'Pirelli', website: 'https://www.pirelli.com', order: 11 },
      { name: 'Goodyear', website: 'https://www.goodyear.com', order: 12 },
      { name: 'NGK', website: 'https://www.ngk.com', order: 13 },
      { name: 'TRW', website: 'https://www.trw.com', order: 14 },
      { name: 'Denso', website: 'https://www.denso.com', order: 15 },
      { name: 'Valeo', website: 'https://www.valeo.com', order: 16 },
    ];
    for (const b of brands) {
      await strapi.entityService.create('api::brand.brand', { data: { ...b, publishedAt: new Date() } });
    }

    const collaborators = [
      { name: 'TT Camper', website: 'https://ttcamper.com', description: 'Especialistas en autocaravanas y vehículos recreativos', order: 1 },
      { name: 'Booking Caravaning', website: 'https://bookingcaravaning.com', description: 'Plataforma de alquiler de autocaravanas', order: 2 },
    ];
    for (const c of collaborators) {
      await strapi.entityService.create('api::collaborator.collaborator', { data: { ...c, publishedAt: new Date() } });
    }

    const hasVehicles = await strapi.entityService.count('api::stock-vehicle.stock-vehicle').catch(() => 0);
    if (hasVehicles === 0) {
      const fallbackVehiclesData = [
          { title: 'Volkswagen Polo 1.0 TSI DSG', motor: '1.0 TSI · Automático DSG 7 vel. · 2026', price: 'Consultar', kilometers: 'Revisado', year: '2026', fuel_type: 'Gasolina', transmission: 'Automático', power: 'TSI', exterior_color: 'Blanco', doors: 5, body_type: 'coche', badge: 'RECIÉN LLEGADO', badgeColor: 'bg-green-600', description: 'Volkswagen Polo con motor 1.0 TSI turbo gasolina y cambio automático DSG de 7 velocidades. Equipado con faros LED, llantas bitono, pantalla táctil multimedia y asistentes de conducción. Revisado completamente por nosotros.', features: 'Cambio automático DSG,Faros LED,Llantas bitono,Pantalla táctil,Asistentes conducción', image_url: 'assets/cars/real_1.png' },
          { title: 'Iveco Daily 35', motor: 'Caja Paquetera · Doble Hoja', price: 'Consultar', kilometers: 'Revisado', year: '2026', fuel_type: 'Diésel', transmission: 'Manual', power: 'Turbodiésel', exterior_color: 'Blanco', doors: 3, body_type: 'furgoneta', badge: 'IDEAL REPARTO', badgeColor: 'bg-orange-500', description: 'Furgón Iveco Daily 35 con caja paquetera de gran capacidad y puerta trasera de doble hoja. Perfecto para trabajos de reparto y paquetería. Motor muy fiable.', features: 'Caja paquetera,Doble hoja trasera,Gran capacidad,Motor fiable', image_url: 'assets/cars/real_5.png' },
          { title: 'Mercedes-Benz Clase C AMG Line', motor: 'Diésel · 2015 · 131.809 km', price: 'Consultar', kilometers: '131809', year: '2015', fuel_type: 'Diésel', transmission: 'Automático', power: 'Consultar', exterior_color: 'Gris Oscuro', doors: 5, body_type: 'coche', badge: 'PREMIUM', badgeColor: 'bg-accent', description: 'Mercedes Clase C con paquete deportivo AMG Line. Equipamiento premium: Faros LED High Performance, sistema de navegación, asientos deportivos en cuero/alcantara y sensores de aparcamiento.', features: 'AMG Line,Faros LED,Navegador,Asientos deportivos,Cuero/Alcantara,Sensores de aparcamiento', image_url: 'assets/cars/real_4.png' },
          { title: 'Audi Q5 35 TDI S tronic (ECO)', motor: 'Mild Hybrid · S tronic · 2023', price: 'Consultar', kilometers: 'Semi-nuevo', year: '2023', fuel_type: 'Diésel (ECO)', transmission: 'Automático', power: '35 TDI', exterior_color: 'Gris', doors: 5, body_type: 'suv', badge: 'ETIQUETA ECO', badgeColor: 'bg-green-600', description: 'Espectacular Audi Q5 35 TDI (Junio 2023). Etiqueta ECO (Mild Hybrid). Faros Matrix LED, Audi Virtual Cockpit, MMI Navegación Plus, maletero eléctrico, cámara trasera y control de crucero adaptativo.', features: 'Etiqueta ECO,S tronic,Matrix LED,Virtual Cockpit,Navegación Plus,Maletero eléctrico,Cámara trasera,Crucero adaptativo', image_url: 'assets/cars/real_3.png' },
          { title: 'Volkswagen Golf GTI', motor: '2.0 TSI · Azul Eléctrico', price: 'Consultar', kilometers: 'Revisado', year: 'Consultar', fuel_type: 'Gasolina', transmission: 'Manual', power: '2.0 TSI', exterior_color: 'Azul Eléctrico', doors: 5, body_type: 'coche', badge: 'DEPORTIVO', badgeColor: 'bg-red-600', description: 'Volkswagen Golf GTI 2.0 TSI. Color Azul Eléctrico, llantas deportivas GTI, faros de xenón direccionales, tapicería mítica a cuadros Interlagos y volante multifunción en cuero.', features: 'Llantas GTI,Xenón direccional,Tapicería Interlagos,Volante de cuero multifunción', image_url: 'assets/cars/real_2.png' },
          { title: 'Volkswagen Golf TSI', motor: 'TSI Gasolina · A estrenar', price: 'Consultar', kilometers: '0', year: '2025', fuel_type: 'Gasolina', transmission: 'Manual', power: 'TSI', exterior_color: 'Plata Metálico', doors: 5, body_type: 'coche', badge: 'A ESTRENAR', badgeColor: 'bg-accent', description: 'Volkswagen Golf TSI prácticamente a estrenar (menos de un año). Color gris plata metálico. Vehículo totalmente garantizado y revisado en nuestras instalaciones.', features: 'Prácticamente nuevo,Garantía oficial,Revisado', image_url: 'assets/cars/real_1.png' },
          { title: 'Mini Cooper R50', motor: '1.6 Gasolina · Bajo consumo', price: 'Consultar', kilometers: 'Revisado', year: 'Consultar', fuel_type: 'Gasolina', transmission: 'Manual', power: '1.6', exterior_color: 'Consultar', doors: 3, body_type: 'coche', badge: 'OCASIÓN', badgeColor: 'bg-orange-500', description: 'Mini Cooper R50 con motor 1.6 gasolina. Bajo consumo, ideal para la ciudad. Totalmente revisado y con garantía directa desde nuestro taller.', features: 'Bajo consumo,Ideal ciudad,Garantía del taller', image_url: 'assets/cars/real_2.png' }
      ];
      for (const v of fallbackVehiclesData) {
        await strapi.entityService.create('api::stock-vehicle.stock-vehicle', { data: { ...v, publishedAt: new Date() } });
      }
    }
  },
};
