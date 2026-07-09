# Exponer el backend con un túnel (sin abrir puertos)

La web pública va en **Cloudflare Pages / GitHub Pages** (estática, gratis).
El **backend** (Strapi + automation-worker + Chatwoot) necesita salir a
Internet para que el CRM y la web lo consuman. Aquí tienes **4 formas
open-source / gratuitas** de exponerlo. Elige una.

## Comparativa rápida

| Opción | Coste | ¿IP pública propia? | Dificultad | Cuándo usarla |
|---|---|---|---|---|
| **Cloudflare Tunnel** ⭐ | Gratis | No hace falta | Baja | Recomendada. Cero puertos, HTTPS y DDoS de Cloudflare. |
| **frp** | Gratis (+VPS ~4€) | Sí, en un VPS | Media | Control total, sin depender de Cloudflare. |
| **rathole** | Gratis (+VPS ~4€) | Sí, en un VPS | Media | Como frp pero ultraligero (Rust). |
| **Pangolin + Newt** | Gratis (+VPS ~4€) | Sí, en un VPS | Media/Alta | Igual que CF Tunnel pero self-hosted con panel. |
| **Tailscale Funnel** | Gratis | No | Baja | Rápido para uso personal/pruebas. |

> Todas son gratuitas en software. Las que llevan "+VPS" necesitan una máquina
> con IP pública (un VPS de ~4 €/mes, o tu propio servidor) porque el túnel
> necesita un punto de entrada público. **Cloudflare Tunnel y Tailscale no lo
> necesitan** porque ese punto lo pone su red.

## 1) Cloudflare Tunnel (recomendada)
1. En [Cloudflare Zero Trust](https://one.dash.cloudflare.com) → *Networks →
   Tunnels* → *Create tunnel*. Copia el **token**.
2. Ponlo en `deploy/.env` como `CLOUDFLARE_TUNNEL_TOKEN=...`.
3. Arranca el stack con el túnel:
   ```bash
   docker compose -f docker-compose.yml \
     -f tunnel/cloudflared/docker-compose.cloudflared.yml up -d
   ```
4. En el panel, mapea los *Public hostnames*:
   - `cms.tudominio.es`  → `http://strapi:1337`
   - `automation.tudominio.es` → `http://automation:4000`
   - `chat.tudominio.es` → `http://chatwoot-web:3000`
   - `crm.tudominio.es`  → `http://caddy:80`

   (o usa el fichero `cloudflared/config.example.yml` en modo fichero).
5. En el CRM (`crm/admin.html`) y la web, apunta `API_BASE` / `AUTOMATION_BASE`
   a esos subdominios.

## 2) frp  ·  3) rathole  ·  4) Pangolin
Necesitan un VPS con IP pública que haga de "servidor". Tienes las plantillas
en `frp/`, `rathole/` y `pangolin/`. Copia los `*.example.*` quitando el
`.example`, cambia los tokens y dominios, y levanta cliente + servidor.

## 5) Tailscale Funnel (extra, muy fácil)
```bash
# En la máquina del backend:
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up
tailscale funnel 1337   # expone Strapi en https://<tu-host>.ts.net
```
Open-source: el cliente de Tailscale y **Headscale** (servidor de control OSS)
lo son. Rápido para pruebas; para producción con dominio propio usa las de arriba.
