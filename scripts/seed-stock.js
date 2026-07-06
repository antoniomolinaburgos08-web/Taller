/**
 * Carga los vehículos de ejemplo en el Strapi del taller.
 *
 * Uso:
 *   STRAPI_URL=https://tu-strapi.up.railway.app \
 *   STRAPI_EMAIL=tu@email.com \
 *   STRAPI_PASSWORD=tu-contraseña \
 *   node scripts/seed-stock.js
 */

const API_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const EMAIL = process.env.STRAPI_EMAIL;
const PASSWORD = process.env.STRAPI_PASSWORD;

if (!EMAIL || !PASSWORD) {
    console.error('Faltan credenciales: define STRAPI_EMAIL y STRAPI_PASSWORD como variables de entorno.');
    process.exit(1);
}

const vehicles = [
    { title: 'Volkswagen Polo 1.0 TSI DSG', price: 18500, kilometers: 0, year: 2026, fuel_type: 'Gasolina', transmission: 'Automático', engine_size: '1.0 TSI', exterior_color: 'Blanco', doors: 5, body_type: 'coche', condition: 'RECIÉN LLEGADO', features: 'Cambio automático DSG,Faros LED,Llantas bitono,Pantalla táctil,Asistentes conducción', image_url: 'assets/cars/real_1.png' },
    { title: 'Iveco Daily 35', price: 22000, kilometers: 1000, year: 2026, fuel_type: 'Diésel', transmission: 'Manual', engine_size: 'Turbodiésel', exterior_color: 'Blanco', doors: 3, body_type: 'furgoneta', condition: 'IDEAL REPARTO', features: 'Caja paquetera,Doble hoja trasera,Gran capacidad,Motor fiable', image_url: 'assets/cars/real_5.png' },
    { title: 'Mercedes-Benz Clase C AMG Line', price: 15900, kilometers: 131809, year: 2015, fuel_type: 'Diésel', transmission: 'Automático', engine_size: '2.2 CDI', exterior_color: 'Gris Oscuro', doors: 5, body_type: 'coche', condition: 'PREMIUM', features: 'AMG Line,Faros LED,Navegador,Asientos deportivos,Cuero/Alcantara,Sensores de aparcamiento', image_url: 'assets/cars/real_4.png' },
    { title: 'Audi Q5 35 TDI S tronic (ECO)', price: 42000, kilometers: 15000, year: 2023, fuel_type: 'Diésel', transmission: 'Automático', engine_size: '35 TDI', exterior_color: 'Gris', doors: 5, body_type: 'suv', condition: 'ETIQUETA ECO', features: 'Etiqueta ECO,S tronic,Matrix LED,Virtual Cockpit,Navegación Plus,Maletero eléctrico,Cámara trasera,Crucero adaptativo', image_url: 'assets/cars/real_3.png' },
    { title: 'Volkswagen Golf GTI', price: 29900, kilometers: 80000, year: 2018, fuel_type: 'Gasolina', transmission: 'Manual', engine_size: '2.0 TSI', exterior_color: 'Azul Eléctrico', doors: 5, body_type: 'coche', condition: 'DEPORTIVO', features: 'Llantas GTI,Xenón direccional,Tapicería Interlagos,Volante de cuero multifunción', image_url: 'assets/cars/real_2.png' },
    { title: 'Volkswagen Golf TSI', price: 24500, kilometers: 0, year: 2025, fuel_type: 'Gasolina', transmission: 'Manual', engine_size: 'TSI', exterior_color: 'Plata Metálico', doors: 5, body_type: 'coche', condition: 'A ESTRENAR', features: 'Prácticamente nuevo,Garantía oficial,Revisado', image_url: 'assets/cars/real_1.png' },
    { title: 'Mini Cooper R50', price: 6500, kilometers: 120000, year: 2005, fuel_type: 'Gasolina', transmission: 'Manual', engine_size: '1.6', exterior_color: 'Rojo', doors: 3, body_type: 'coche', condition: 'OCASIÓN', features: 'Bajo consumo,Ideal ciudad,Garantía del taller', image_url: 'assets/cars/real_2.png' }
];

async function run() {
    console.log(`Autenticando en ${API_URL} ...`);
    const authRes = await fetch(`${API_URL}/api/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: EMAIL, password: PASSWORD })
    });
    const auth = await authRes.json();
    if (!auth.jwt) {
        console.error('Error de autenticación:', JSON.stringify(auth));
        process.exit(1);
    }

    for (const v of vehicles) {
        const res = await fetch(`${API_URL}/api/stock-vehicles?status=published`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${auth.jwt}`
            },
            body: JSON.stringify({ data: v })
        });
        if (res.ok) {
            console.log(`✔ Creado: ${v.title}`);
        } else {
            console.error(`✘ Error creando ${v.title}:`, await res.text());
        }
    }
    console.log('Hecho.');
}

run().catch(err => { console.error(err); process.exit(1); });
