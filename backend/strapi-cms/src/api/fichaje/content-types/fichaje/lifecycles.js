module.exports = {
    async beforeUpdate(event) {
        const { data, where } = event.params;
        if (data.salida) {
            const current = await strapi.entityService.findOne('api::fichaje.fichaje', where.id, {});
            const entrada = data.entrada || current?.entrada;
            if (entrada) {
                const diffMs = new Date(data.salida).getTime() - new Date(entrada).getTime();
                data.duracion_min = Math.max(0, Math.floor(diffMs / 60000));
            }
        }
    },
};
