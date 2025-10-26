# SANDRA NUCLEUS DOCKERFILE
# Build optimizado para producción con todas las dependencias

FROM node:20-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++ git

# Directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# ============================================================================
# IMAGEN FINAL DE PRODUCCIÓN
# ============================================================================
FROM node:20-alpine

# Instalar dumb-init para manejo de señales
RUN apk add --no-cache dumb-init

# Crear usuario no-root
RUN addgroup -g 1001 -S sandra && \
    adduser -u 1001 -S sandra -G sandra

# Directorio de trabajo
WORKDIR /app

# Copiar desde builder
COPY --from=builder --chown=sandra:sandra /app/node_modules ./node_modules
COPY --chown=sandra:sandra . .

# Cambiar a usuario no-root
USER sandra

# Exponer puertos
EXPOSE 7777 7778 7779

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:7777/health', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Comando de inicio con dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "sandra-core.js"]
