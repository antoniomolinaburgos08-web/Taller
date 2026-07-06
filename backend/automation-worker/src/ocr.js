// OCR de facturas con Claude Vision.
// Devuelve un objeto con los campos que el CRM necesita: fecha, proveedor, concepto, importe, iva, numero_factura.
import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

const anthropic = process.env.ANTHROPIC_API_KEY
    ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    : null;

const SISTEMA = `Eres un extractor de datos de facturas de proveedores para un taller mecánico.
Devuelve SOLO un JSON válido con esta forma exacta:
{
  "fecha": "YYYY-MM-DD",
  "proveedor": "razón social del emisor",
  "concepto": "resumen breve de lo comprado (máx 200 caracteres)",
  "importe": 0.0,          // base imponible en EUR (sin IVA)
  "iva": 21,               // porcentaje de IVA aplicado
  "numero_factura": "",
  "categoria": "Recambios" // uno de: Recambios | Herramientas | Consumibles | Alquiler / Suministros | Vehículo para taller | Formación | Marketing | Otros
}
Si un campo no aparece en la factura, usa cadena vacía o 0.
No añadas texto fuera del JSON.`;

export async function extractInvoice(buffer, mediaType) {
    if (!anthropic) throw new Error('ANTHROPIC_API_KEY no configurada');

    const base64 = buffer.toString('base64');

    const res = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 800,
        system: SISTEMA,
        messages: [
            {
                role: 'user',
                content: [
                    { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
                    { type: 'text', text: 'Extrae los datos de esta factura.' },
                ],
            },
        ],
    });

    const text = res.content?.[0]?.text || '{}';
    // El modelo devuelve JSON, pero por seguridad extraemos el bloque { ... }
    const match = text.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : text);
}
