// Automatizacion por navegador para portales SIN API publica
// (Wallapop, Milanuncios, Facebook Marketplace).
//
// AVISO: automatizar el login con usuario/contrasena puede chocar con los
// Terminos de Servicio de cada portal y romperse ante captchas/2FA. Uselo solo
// con cuentas propias y bajo su responsabilidad. Alternativa mas robusta:
// publicacion asistida por Telegram (el worker envia el pack listo al movil).
//
// Plantilla lista: requiere Playwright (npm i playwright) y los selectores del
// portal. Se deja sin implementar los selectores hasta tener la cuenta real.
export async function publicarConNavegador(portal, vehiculo, creds) {
  // Estructura de referencia (descomentar e implementar con la cuenta real):
  //
  // const { chromium } = await import('playwright');
  // const browser = await chromium.launch({
  //   executablePath: process.env.CHROMIUM_PATH || undefined,
  //   headless: true,
  // });
  // const page = await browser.newPage();
  // await page.goto(LOGIN_URL[portal]);
  // await page.fill(SEL[portal].user, creds.usuario);
  // await page.fill(SEL[portal].pass, creds.password);
  // await page.click(SEL[portal].submit);
  // ...rellenar formulario con `vehiculo`...
  // await browser.close();
  return {
    ok: false,
    pendiente: true,
    portal,
    mensaje: `Publicacion en ${portal}: plantilla de navegador lista. `
      + `Anade Playwright y los selectores del portal, o usa la publicacion asistida por Telegram.`,
  };
}
