# ============================================================
# Strapi v5 — imagen de producción multi-etapa
# ============================================================
# Etapa 1: instalar dependencias + compilar el admin panel.
# Etapa 2: imagen final ligera solo con lo necesario para correr.
# ============================================================

FROM node:22-alpine AS builder
WORKDIR /app

# Dependencias nativas (sharp, better-sqlite3, pg…) necesitan compilador
RUN apk add --no-cache python3 make g++ vips-dev

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Compila el panel de administración (necesita devDependencies)
RUN npm run build && npm prune --omit=dev

# ------------------------------------------------------------

FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
RUN apk add --no-cache vips

# Copiamos solo lo necesario de la etapa de build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/build ./build
COPY --from=builder /app/config ./config
COPY --from=builder /app/database ./database
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/favicon.png ./favicon.png

EXPOSE 1337
CMD ["npm", "run", "start"]
