#!/bin/bash
# Script para preparar deploy a GitHub (GRATIS)

echo "🚀 PREPARANDO DEPLOY GRATIS A GITHUB"
echo ""

# Verificar que estamos en repo git
if [ ! -d ".git" ]; then
    echo "❌ No es un repositorio git"
    echo "Ejecutar: git init"
    exit 1
fi

# Verificar si hay remote
if git remote get-url origin >/dev/null 2>&1; then
    echo "✅ Remote configurado:"
    git remote get-url origin
    echo ""
    echo "¿Hacer push ahora? (y/n)"
    read -r answer
    if [ "$answer" = "y" ]; then
        echo ""
        echo "📤 Haciendo push a GitHub..."
        git push origin main || git push origin master
        echo ""
        echo "✅ Push completado"
        echo "✅ Netlify hará deploy automático GRATIS"
    fi
else
    echo "⚠️  No hay remote configurado"
    echo ""
    echo "Para configurar:"
    echo "  git remote add origin https://github.com/USUARIO/REPO.git"
    echo ""
    echo "Luego ejecutar este script de nuevo"
fi

