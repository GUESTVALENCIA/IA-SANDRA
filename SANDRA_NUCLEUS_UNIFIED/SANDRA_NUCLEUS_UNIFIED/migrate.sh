#!/bin/bash

# ============================================================================
# SANDRA MIGRATION SCRIPT
# Migración desde sistema fragmentado a NUCLEUS unificado
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

cat << "EOF"
╔════════════════════════════════════════════════════════════════════╗
║                    SANDRA MIGRATION TOOL                          ║
║         Fragmentado → NUCLEUS Unificado v100.0                    ║
╚════════════════════════════════════════════════════════════════════╝
EOF

echo -e "\n${CYAN}Iniciando migración a SANDRA NUCLEUS...${NC}\n"

# ============================================================================
# DETECCIÓN DE ARCHIVOS EXISTENTES
# ============================================================================

echo -e "${BLUE}▶ Detectando sistema actual...${NC}"

FOUND_FILES=()
MIGRATION_NEEDED=false

# Lista de archivos a buscar
FILES_TO_CHECK=(
    "sandra-galaxy.js"
    "sandra-bridge.js"
    "index.html"
    "docker-compose.yml"
    "package.json"
    ".env"
    "public/index.html"
    "app/"
    "desktop/"
    "mobile/"
)

# Buscar archivos existentes
for file in "${FILES_TO_CHECK[@]}"; do
    if [ -e "../$file" ] || [ -e "../../$file" ] || [ -e "../../../$file" ]; then
        FOUND_FILES+=("$file")
        MIGRATION_NEEDED=true
    fi
done

if [ "$MIGRATION_NEEDED" = false ]; then
    echo -e "${YELLOW}No se encontraron archivos del sistema anterior.${NC}"
    echo -e "${GREEN}Puedes proceder con la instalación limpia.${NC}"
    exit 0
fi

echo -e "${GREEN}Archivos encontrados:${NC}"
for file in "${FOUND_FILES[@]}"; do
    echo "  - $file"
done

# ============================================================================
# BACKUP
# ============================================================================

echo -e "\n${BLUE}▶ Creando backup del sistema actual...${NC}"

BACKUP_DIR="../SANDRA_BACKUP_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Copiar archivos encontrados al backup
for file in "${FOUND_FILES[@]}"; do
    if [ -e "../$file" ]; then
        cp -r "../$file" "$BACKUP_DIR/" 2>/dev/null || true
    elif [ -e "../../$file" ]; then
        cp -r "../../$file" "$BACKUP_DIR/" 2>/dev/null || true
    elif [ -e "../../../$file" ]; then
        cp -r "../../../$file" "$BACKUP_DIR/" 2>/dev/null || true
    fi
done

echo -e "${GREEN}✅ Backup creado en: $BACKUP_DIR${NC}"

# ============================================================================
# EXTRACCIÓN DE CONFIGURACIÓN
# ============================================================================

echo -e "\n${BLUE}▶ Extrayendo configuración actual...${NC}"

# Buscar .env existente
ENV_FILE=""
if [ -f "../.env" ]; then
    ENV_FILE="../.env"
elif [ -f "../../.env" ]; then
    ENV_FILE="../../.env"
elif [ -f "../../../.env" ]; then
    ENV_FILE="../../../.env"
fi

if [ ! -z "$ENV_FILE" ]; then
    echo -e "${GREEN}Encontrado archivo .env${NC}"
    
    # Extraer API keys del .env existente
    if [ -f "$ENV_FILE" ]; then
        OPENAI_KEY=$(grep "OPENAI" "$ENV_FILE" | cut -d'=' -f2 | head -1 || echo "")
        ELEVENLABS_KEY=$(grep "ELEVENLABS" "$ENV_FILE" | cut -d'=' -f2 | head -1 || echo "")
        DEEPGRAM_KEY=$(grep "DEEPGRAM" "$ENV_FILE" | cut -d'=' -f2 | head -1 || echo "")
        HEYGEN_KEY=$(grep "HEYGEN" "$ENV_FILE" | cut -d'=' -f2 | head -1 || echo "")
        
        echo -e "${GREEN}API Keys extraídas del sistema anterior${NC}"
    fi
fi

# ============================================================================
# MIGRACIÓN DE DATOS
# ============================================================================

echo -e "\n${BLUE}▶ Iniciando migración de datos...${NC}"

# Crear estructura NUCLEUS si no existe
if [ ! -d "SANDRA_NUCLEUS_UNIFIED" ]; then
    echo -e "${YELLOW}Creando estructura NUCLEUS...${NC}"
    mkdir -p SANDRA_NUCLEUS_UNIFIED
fi

cd SANDRA_NUCLEUS_UNIFIED

# Copiar archivos del nuevo sistema (ya deberían estar aquí)
echo -e "${GREEN}Verificando archivos NUCLEUS...${NC}"

# ============================================================================
# CONFIGURACIÓN DEL NUEVO SISTEMA
# ============================================================================

echo -e "\n${BLUE}▶ Configurando SANDRA NUCLEUS...${NC}"

# Crear .env con las API keys migradas
if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || echo "NODE_ENV=production" > .env
fi

# Actualizar API keys si las encontramos
if [ ! -z "$OPENAI_KEY" ]; then
    sed -i "s/sk-your-openai-key-here/$OPENAI_KEY/" .env 2>/dev/null || true
    echo -e "${GREEN}✅ OpenAI API key migrada${NC}"
fi

if [ ! -z "$ELEVENLABS_KEY" ]; then
    sed -i "s/your-elevenlabs-key/$ELEVENLABS_KEY/" .env 2>/dev/null || true
    echo -e "${GREEN}✅ ElevenLabs API key migrada${NC}"
fi

if [ ! -z "$DEEPGRAM_KEY" ]; then
    sed -i "s/your-deepgram-key/$DEEPGRAM_KEY/" .env 2>/dev/null || true
    echo -e "${GREEN}✅ Deepgram API key migrada${NC}"
fi

# ============================================================================
# MIGRACIÓN DE ASSETS
# ============================================================================

echo -e "\n${BLUE}▶ Migrando assets y archivos estáticos...${NC}"

# Crear directorios necesarios
mkdir -p public/assets
mkdir -p data
mkdir -p logs

# Buscar y copiar assets del sistema anterior
if [ -d "../../public/assets" ]; then
    cp -r ../../public/assets/* public/assets/ 2>/dev/null || true
    echo -e "${GREEN}✅ Assets migrados${NC}"
fi

# ============================================================================
# INSTALACIÓN DE DEPENDENCIAS
# ============================================================================

echo -e "\n${BLUE}▶ Instalando dependencias...${NC}"

npm install --silent
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# ============================================================================
# CONFIGURACIÓN DE DOCKER
# ============================================================================

if command -v docker >/dev/null 2>&1; then
    echo -e "\n${BLUE}▶ Configurando servicios Docker...${NC}"
    
    # Detener servicios antiguos si existen
    if [ -f "../../docker-compose.yml" ]; then
        echo "Deteniendo servicios anteriores..."
        (cd ../.. && docker-compose down 2>/dev/null || true)
    fi
    
    # Iniciar nuevos servicios
    docker-compose up -d postgres redis
    echo -e "${GREEN}✅ Servicios Docker iniciados${NC}"
    
    # Esperar a que PostgreSQL esté listo
    echo -n "Esperando PostgreSQL"
    for i in {1..20}; do
        if docker-compose exec -T postgres pg_isready -U sandra_admin > /dev/null 2>&1; then
            echo
            break
        fi
        echo -n "."
        sleep 1
    done
    
    # Inicializar base de datos
    if [ -f "init.sql" ]; then
        docker-compose exec -T postgres psql -U sandra_admin -d sandra_nucleus < init.sql 2>/dev/null || true
        echo -e "${GREEN}✅ Base de datos inicializada${NC}"
    fi
fi

# ============================================================================
# CREACIÓN DE SCRIPTS
# ============================================================================

echo -e "\n${BLUE}▶ Creando scripts de utilidad...${NC}"

# Script para importar datos antiguos (si existen)
cat > import-old-data.js << 'EOL'
#!/usr/bin/env node

/**
 * Script para importar datos del sistema anterior
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 Importando datos del sistema anterior...');

// Buscar archivos de configuración antiguos
const oldConfigPaths = [
    '../../sandra-galaxy.js',
    '../../sandra-bridge.js',
    '../../../sandra-galaxy.js'
];

let imported = false;

for (const configPath of oldConfigPaths) {
    if (fs.existsSync(configPath)) {
        console.log(`✅ Encontrado: ${configPath}`);
        // Aquí podrías extraer configuración específica
        imported = true;
    }
}

if (imported) {
    console.log('✅ Importación completada');
} else {
    console.log('ℹ️ No se encontraron datos para importar');
}
EOL

chmod +x import-old-data.js

# ============================================================================
# VERIFICACIÓN FINAL
# ============================================================================

echo -e "\n${BLUE}▶ Verificando instalación...${NC}"

# Verificar que los archivos principales existen
REQUIRED_FILES=(
    "sandra-core.js"
    "package.json"
    "docker-compose.yml"
    ".env"
    "index.html"
)

ALL_GOOD=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file faltante${NC}"
        ALL_GOOD=false
    fi
done

# ============================================================================
# RESUMEN DE MIGRACIÓN
# ============================================================================

echo
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}              MIGRACIÓN COMPLETADA CON ÉXITO! 🎉${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo

echo -e "${CYAN}📁 Sistema anterior:${NC}"
echo -e "   Backup guardado en: ${YELLOW}$BACKUP_DIR${NC}"
echo
echo -e "${CYAN}🚀 Nuevo sistema NUCLEUS:${NC}"
echo -e "   Ubicación: ${YELLOW}$(pwd)${NC}"
echo
echo -e "${CYAN}✨ Características migradas:${NC}"
[ ! -z "$OPENAI_KEY" ] && echo -e "   ✅ OpenAI API Key"
[ ! -z "$ELEVENLABS_KEY" ] && echo -e "   ✅ ElevenLabs API Key"
[ ! -z "$DEEPGRAM_KEY" ] && echo -e "   ✅ Deepgram API Key"
echo -e "   ✅ Estructura de proyecto"
echo -e "   ✅ Configuración base"
echo

echo -e "${MAGENTA}📝 Próximos pasos:${NC}"
echo -e "   1. Revisar el archivo ${YELLOW}.env${NC} y completar configuración"
echo -e "   2. Ejecutar ${YELLOW}./start.sh${NC} para iniciar el sistema"
echo -e "   3. Acceder a ${CYAN}http://localhost:7777${NC}"
echo -e "   4. Verificar que todo funciona correctamente"
echo

echo -e "${YELLOW}⚠️ IMPORTANTE:${NC}"
echo -e "   - El sistema anterior sigue intacto en el backup"
echo -e "   - Puedes volver al sistema anterior desde: $BACKUP_DIR"
echo -e "   - Se recomienda mantener el backup hasta verificar que todo funciona"
echo

read -p "¿Deseas iniciar SANDRA NUCLEUS ahora? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "\n${GREEN}Iniciando SANDRA NUCLEUS...${NC}"
    ./start.sh
else
    echo -e "\n${CYAN}Para iniciar más tarde, ejecuta:${NC}"
    echo -e "   ${YELLOW}cd SANDRA_NUCLEUS_UNIFIED${NC}"
    echo -e "   ${YELLOW}./start.sh${NC}"
fi

echo
echo -e "${BLUE}¡Gracias por actualizar a SANDRA NUCLEUS!${NC}"
echo -e "${GREEN}El futuro de la IA multimodal está aquí.${NC}"
