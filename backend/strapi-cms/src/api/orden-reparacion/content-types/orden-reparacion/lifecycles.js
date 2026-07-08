// Al pasar una OR a "Entregado", avisa al automation-worker para que envíe
// el WhatsApp de agradecimiento + petición de reseña en Google.
// El worker es quien marca review_whatsapp_enviado=true al confirmar el envío.

const AUTOMATION_URL = process.env.AUTOMATION_URL || 'http://automation:4000';

module.exports = {
    async afterUpdate(event) {
        const { result } = event;
        if (!result) return;
        if (result.estado === 'Entregado' && result.review_whatsapp_enviado !== true) {
            try {
                await fetch(`${AUTOMATION_URL}/whatsapp/or-entregada`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documentId: result.documentId, id: result.id }),
                });
            } catch (err) {
                strapi.log.warn(`No se pudo notificar la entrega de la OR ${result.documentId}: ${err.message}`);
            }
        }
    },
};
