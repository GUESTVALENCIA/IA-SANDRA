#!/bin/bash
# Script para subir variables de entorno a Netlify usando Netlify CLI
# Requiere: npm install -g netlify-cli
# Uso: ./upload-env-to-netlify-cli.sh

cd "$(dirname "$0")/.."

echo ""
echo "========================================"
echo "  SUBIR VARIABLES A NETLIFY (CLI)"
echo "========================================"
echo ""

# Verificar que netlify CLI está instalado
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI no encontrado"
    echo ""
    echo "Instalar con:"
    echo "  npm install -g netlify-cli"
    echo ""
    exit 1
fi

# Verificar que .env existe
if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
    echo "❌ Archivo .env no encontrado"
    echo "Crea .env o .env.production con tus API keys"
    exit 1
fi

# Determinar archivo .env
ENV_FILE=""
if [ -f ".env.production" ]; then
    ENV_FILE=".env.production"
elif [ -f ".env" ]; then
    ENV_FILE=".env"
fi

echo "📋 Usando archivo: $ENV_FILE"
echo ""

# Verificar que está autenticado
echo "🔐 Verificando autenticación..."
if ! netlify status &> /dev/null; then
    echo "⚠️  No autenticado en Netlify"
    echo "Ejecutando: netlify login"
    netlify login
fi

# Verificar que el sitio está linkeado
echo "🔗 Verificando link del sitio..."
if ! netlify status --json | grep -q "Site ID"; then
    echo "⚠️  Sitio no linkeado"
    echo "Ejecutando: netlify link"
    netlify link
fi

echo ""
echo "📤 Subiendo variables de entorno..."
echo ""

# Leer .env y subir cada variable
SUCCESS=0
ERRORS=0

while IFS='=' read -r key value; do
    # Ignorar comentarios y líneas vacías
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    
    # Remover espacios y comillas
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs | sed "s/^['\"]//;s/['\"]$//")
    
    # Verificar que tiene valor
    [[ -z "$value" ]] && continue
    
    echo -n "  Subiendo $key... "
    
    # Subir variable
    if netlify env:set "$key" "$value" --production &> /dev/null; then
        echo "✅"
        ((SUCCESS++))
    else
        echo "❌"
        ((ERRORS++))
    fi
    
    # Pequeño delay para evitar rate limiting
    sleep 0.5
done < "$ENV_FILE"

echo ""
echo "========================================"
echo "  RESULTADO"
echo "========================================"
echo "  ✅ Subidas: $SUCCESS"
echo "  ❌ Errores: $ERRORS"
echo ""
echo "🔗 Verificar en:"
echo "   https://app.netlify.com/sites/$(netlify status --json | grep -o '"site_id":"[^"]*' | cut -d'"' -f4)/settings/env"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ Todas las variables subidas correctamente"
    exit 0
else
    echo "⚠️  Algunas variables tuvieron errores"
    exit 1
fi

