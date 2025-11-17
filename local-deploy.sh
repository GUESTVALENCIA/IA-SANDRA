#!/usr/bin/env bash
set -euo pipefail
echo "🌍 Sandra: Iniciando despliegue soberano local…"
command -v docker >/dev/null || { echo "❌ Docker no instalado"; exit 1; }
command -v npm >/dev/null || { echo "❌ Node/npm no instalado"; exit 1; }
echo "📦 Construyendo app en modo offline…"
npm ci --no-fund --no-audit --prefer-offline || true
npm run build:offline || npm run build || true
mkdir -p .docker/nginx
cat > .docker/nginx/default.conf << 'EOF'
server {
    listen 80;
    server_name localhost 127.0.0.1;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF
cat > Dockerfile << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-fund --no-audit --prefer-offline
COPY . .
RUN npm run build:offline || npm run build
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY .docker/nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
echo "🐳 Construyendo imagen Docker…"
docker build -t sandra-local .
echo "🧽 Limpiando contenedor previo (si existe)…"
docker rm -f sandra-local >/dev/null 2>&1 || true
echo "🚀 Ejecutando en http://localhost:8080"
docker run -d --name sandra-local -p 8080:80 --restart unless-stopped sandra-local
echo "✅ Despliegue local soberano activo: http://localhost:8080"

