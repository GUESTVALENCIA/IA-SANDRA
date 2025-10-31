#!/bin/bash
# Script para subir variables de entorno a Netlify (Linux/Mac)
# Uso: ./upload-env-to-netlify.sh

cd "$(dirname "$0")/.."

echo ""
echo "========================================"
echo "  SUBIR VARIABLES A NETLIFY"
echo "========================================"
echo ""

# Verificar que .env existe
if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
    echo "Error: Archivo .env no encontrado"
    echo "Crea .env o .env.production con tus API keys antes de ejecutar este script"
    exit 1
fi

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "Error: Node.js no encontrado"
    echo "Instala Node.js desde https://nodejs.org"
    exit 1
fi

# Ejecutar script Node
node scripts/upload-env-to-netlify.js

if [ $? -ne 0 ]; then
    echo ""
    echo "Error al subir variables"
    exit 1
fi

echo ""
echo "========================================"
echo "  COMPLETADO"
echo "========================================"

