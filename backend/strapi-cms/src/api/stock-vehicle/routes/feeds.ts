// Rutas adicionales para exportar el stock a portales externos.
// Se combinan con la ruta core (CRUD estándar) — Strapi las une automáticamente.

export default {
  routes: [
    {
      method: 'GET',
      path: '/stock-vehicles/feed/cochesnet.xml',
      handler: 'stock-vehicle.feedCochesnet',
      config: {
        auth: false, // público — coches.net descarga el feed sin credenciales
      },
    },
    {
      method: 'GET',
      path: '/stock-vehicles/feed/wallapop.json',
      handler: 'stock-vehicle.feedWallapop',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/stock-vehicles/feed/generic.csv',
      handler: 'stock-vehicle.feedCsv',
      config: {
        auth: false,
      },
    },
  ],
};
