// Crons de la operativa del taller. Se activan con CRON_ENABLED=true.
import cron from 'node-cron';
import { sendText } from './whatsapp.js';
import { renderTemplate } from './templates.js';
import {
    listCitasProximas, updateCita,
    listMantenimientosDue, updateMantenimiento,
    listPrestamosVencidos, updatePrestamo, getSiteSettingSafe,
} from './strapi.js';

const attrs = x => x?.attributes || x || {};
const tel = c => (attrs(c).telefono || '').replace(/[^\d]/g, '');
const TIPO_TPL = {
    'Aceite y filtros': 'mantenimiento_aceite',
    'ITV': 'mantenimiento_itv',
    'Frenos': 'mantenimiento_frenos',
    'Correa distribución': 'mantenimiento_correa',
};

async function confirmacionCitas() {
    const citas = await listCitasProximas();
    for (const cita of citas) {
        const a = attrs(cita);
        const cli = attrs(a.cliente);
        if (!tel(cli)) continue;
        const dt = new Date(a.fecha_hora);
        const msg = await renderTemplate('cita_confirmacion_24h', {
            cliente: cli.nombre || 'cliente',
            fecha: dt.toLocaleDateString('es-ES'),
            hora: dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        });
        if (!msg) continue;
        try {
            await sendText(tel(cli), msg);
            await updateCita(cita.documentId || cita.id, { notas: `${a.notas || ''}\n[wa-24h ${new Date().toISOString()}]`.trim() });
        } catch (e) { console.error('[cron citas]', e.message); }
    }
    if (citas.length) console.log(`[cron citas] ${citas.length} confirmaciones procesadas`);
}

async function avisosMantenimiento() {
    const items = await listMantenimientosDue();
    for (const m of items) {
        const a = attrs(m);
        const cli = attrs(a.cliente);
        if (!tel(cli)) continue;
        // Anti-spam: no repetir aviso en 7 días
        if (a.ultimo_aviso_at && Date.now() - new Date(a.ultimo_aviso_at).getTime() < 7 * 86400_000) continue;
        const msg = await renderTemplate(TIPO_TPL[a.tipo] || 'mantenimiento_aceite', {
            cliente: cli.nombre || 'cliente',
            matricula: a.matricula || '',
            km: a.proximo_en_km || '',
            fecha: a.proximo_en_fecha || '',
            tipo: a.tipo || '',
        });
        if (!msg) continue;
        try {
            await sendText(tel(cli), msg);
            await updateMantenimiento(m.documentId || m.id, { estado: 'Aviso enviado', ultimo_aviso_at: new Date().toISOString() });
        } catch (e) { console.error('[cron mantenimientos]', e.message); }
    }
    if (items.length) console.log(`[cron mantenimientos] ${items.length} avisos procesados`);
}

async function cortesiaVencidos() {
    const prestamos = await listPrestamosVencidos();
    for (const p of prestamos) {
        const a = attrs(p);
        const cli = attrs(a.cliente);
        const veh = attrs(a.vehiculo);
        const msg = await renderTemplate('cortesia_vencido', {
            cliente: cli.nombre || 'cliente',
            matricula: veh.matricula || '',
            fecha: a.fecha_devolucion_esperada ? new Date(a.fecha_devolucion_esperada).toLocaleDateString('es-ES') : '',
        });
        try {
            if (msg && tel(cli)) await sendText(tel(cli), msg);
            await updatePrestamo(p.documentId || p.id, { estado: 'Vencido' });
        } catch (e) { console.error('[cron cortesia]', e.message); }
    }
    if (prestamos.length) console.log(`[cron cortesia] ${prestamos.length} préstamos vencidos marcados`);
}

export function startCrons() {
    if (process.env.CRON_ENABLED !== 'true') {
        console.log('ℹ️  Crons desactivados (CRON_ENABLED != true)');
        return;
    }
    cron.schedule('0 9,17 * * *', confirmacionCitas, { timezone: 'Europe/Madrid' });
    cron.schedule('0 8 * * *', avisosMantenimiento, { timezone: 'Europe/Madrid' });
    cron.schedule('0 10 * * *', cortesiaVencidos, { timezone: 'Europe/Madrid' });
    console.log('⏰ Crons activos: citas 9h/17h · mantenimientos 8h · cortesía 10h (Europe/Madrid)');
}
