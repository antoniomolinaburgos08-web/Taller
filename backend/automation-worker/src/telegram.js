// Bot de Telegram del taller.
// - Recibe fotos de vehículos, facturas, documentación → llama a Claude Vision → crea entradas en Strapi.
// - Envía publicaciones generadas al móvil del dueño para subirlas a WhatsApp Estados en 1 tap.
import { Bot, InputFile } from 'grammy';
import { extractInvoice } from './ocr.js';
import { createGasto } from './strapi.js';
import fetch from 'node-fetch';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const OWNER_CHAT = process.env.TELEGRAM_OWNER_CHAT_ID;

export const bot = TOKEN ? new Bot(TOKEN) : null;

if (bot) {
    bot.command('start', ctx => ctx.reply(
        '🚗 *Bot de El Taller de Migue*\n\n' +
        'Envíame:\n' +
        '  • Una foto de una *factura* → la subo al CRM como gasto\n' +
        '  • Una foto de la *ficha técnica* → creo la ficha del vehículo\n' +
        '  • /publish <matrícula> → te devuelvo el pack para subir a redes\n\n' +
        'Chat ID: `' + ctx.chat.id + '`',
        { parse_mode: 'Markdown' }
    ));

    bot.on('message:photo', async ctx => {
        try {
            const photo = ctx.message.photo.at(-1); // la mayor calidad disponible
            const file = await ctx.api.getFile(photo.file_id);
            const url = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
            const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
            const caption = (ctx.message.caption || '').toLowerCase();

            await ctx.reply('🔍 Analizando la imagen con IA…');

            if (caption.includes('factura') || caption.includes('gasto') || caption === '') {
                // Por defecto: interpretar como factura
                const data = await extractInvoice(buf, 'image/jpeg');
                data.extraido_por_ocr = true;
                await createGasto(data);
                await ctx.reply(
                    `✅ Gasto creado:\n\n` +
                    `📅 ${data.fecha}\n🏢 ${data.proveedor}\n💰 ${data.importe} € (+${data.iva}% IVA)\n📝 ${data.concepto}`
                );
            } else {
                await ctx.reply('Puedo procesar fotos de facturas. Añade el texto "factura" en el pie de foto y te la subo al CRM.');
            }
        } catch (err) {
            console.error('Bot photo error:', err);
            await ctx.reply('❌ No pude procesar la imagen. Revisa que la clave de IA esté configurada.');
        }
    });

    bot.catch(err => console.error('Bot error:', err));
}

export async function sendPublicationToOwner(imageBuffer, caption) {
    if (!bot || !OWNER_CHAT) throw new Error('Bot o TELEGRAM_OWNER_CHAT_ID no configurado');
    await bot.api.sendPhoto(OWNER_CHAT, new InputFile(imageBuffer, 'publicacion.png'), { caption });
}
