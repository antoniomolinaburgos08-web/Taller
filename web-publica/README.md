# Web pública de El Taller de Migue

Contenido **público** de la web. Se publica automáticamente en **GitHub Pages** cada vez que se hace push a `main` con cambios en esta carpeta.

## Estructura

```
web-publica/
├── index.html         Landing principal
├── manifest.json      Manifest PWA de la web pública
├── sw.js              Service Worker
├── CNAME              Dominio personalizado (eltallerdemigue.es)
├── robots.txt         Reglas para buscadores
├── sitemap.xml        Mapa del sitio para Google
├── assets/            Imágenes, iconos
├── logo_transparente.png
├── logo_nuevo.png
└── taller_migue_logo.jpeg
```

## Cómo se despliega

El workflow `.github/workflows/deploy-pages.yml` publica esta carpeta en GitHub Pages en cada push a `main`.

**Primera vez** (una sola vez, tú):
1. GitHub → repositorio → Settings → **Pages**
2. Source: **GitHub Actions**
3. Custom domain: **eltallerdemigue.es** → Save
4. Configura los DNS del dominio (registros A o CNAME) siguiendo las instrucciones de GitHub.

Una vez configurado, cada `git push` a `main` que toque `web-publica/` re-despliega la web en ~1 minuto.

## Separada del CRM

El CRM está en `crm/` y **no se publica en GitHub Pages** (queda en el VPS o en Vercel privado). Así el panel interno del taller nunca es accesible desde una URL pública.
