# Pangolin — alternativa open-source y self-hosted a Cloudflare Tunnel

[Pangolin](https://github.com/fosrl/pangolin) (Fossorial) es un servidor de
túnel inverso **open-source** con panel web, autenticación y WireGuard por
debajo. Es la opción más parecida a Cloudflare Tunnel pero **100 % tuya**.

## Cuándo elegirlo
- Quieres panel propio, usuarios/roles y no depender de Cloudflare.
- Tienes (o alquilas) un VPS barato con IP pública para el nodo central.

## Piezas
- **Pangolin** (servidor central, en el VPS público): panel + proxy (Traefik).
- **Newt** (cliente, junto al backend): abre el túnel WireGuard hacia Pangolin.

## Puesta en marcha (resumen)
1. En el VPS público, despliega Pangolin con su `docker-compose` oficial
   (ver repo). Define tu dominio, p.ej. `panel.eltallerdemigue.es`.
2. Crea un "site" en el panel y copia el comando `newt` que te da.
3. Junto al backend (este stack), ejecuta el cliente **Newt** apuntando a
   los servicios internos: `strapi:1337`, `automation:4000`, `chatwoot-web:3000`.
4. Crea los "resources" (subdominios) en el panel de Pangolin.

> Requiere un VPS público. Si no quieres mantener servidor, usa
> **Cloudflare Tunnel** (carpeta `../cloudflared`), que no necesita IP pública.
