#!/bin/bash
# Environment Variable Automation
# Setup automático de variables de entorno en Netlify

set -e

echo "🔧 SETUP AUTOMÁTICO DE VARIABLES DE ENTORNO\n"

# Verificar que netlify CLI está instalado
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI no está instalado"
    echo "   Instalar con: npm install -g netlify-cli"
    exit 1
fi

# Verificar que está autenticado
if ! netlify status &> /dev/null; then
    echo "❌ No estás autenticado en Netlify"
    echo "   Ejecutar: netlify login"
    exit 1
fi

echo "📋 Variables de entorno a configurar:\n"

# Cargar variables desde .env.production si existe
ENV_FILE=".env.production"
if [ ! -f "$ENV_FILE" ]; then
    ENV_FILE=".env"
fi

if [ -f "$ENV_FILE" ]; then
    echo "✅ Cargando variables desde: $ENV_FILE\n"
    
    # Leer variables críticas
    while IFS='=' read -r key value; do
        # Ignorar comentarios y líneas vacías
        if [[ ! $key =~ ^#.* ]] && [ -n "$key" ]; then
            # Remover espacios
            key=$(echo "$key" | xargs)
            value=$(echo "$value" | xargs)
            
            # Solo variables críticas para Netlify
            if [[ "$key" =~ ^(OPENAI_API_KEY|CARTESIA_API_KEY|DEEPGRAM_API_KEY|HEYGEN_API_KEY|NODE_ENV|ALLOWED_ORIGIN|BASE_URL)$ ]]; then
                echo "   📝 $key"
                
                # Configurar en Netlify
                netlify env:set "$key" "$value" --context production
            fi
        fi
    done < "$ENV_FILE"
    
    echo "\n✅ Variables configuradas en Netlify\n"
    echo "💡 Verifica en: https://app.netlify.com -> Site settings -> Environment variables\n"
else
    echo "⚠️ No se encontró .env o .env.production"
    echo "   Configura las variables manualmente en Netlify Dashboard\n"
fi

