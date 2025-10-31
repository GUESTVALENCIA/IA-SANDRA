#!/bin/bash
# Setup Workspace Script
# Configura el workspace de automatización

echo "🚀 Setting up Clayton Enterprise Workspace..."

# Crear estructura de directorios
echo "📁 Creating directory structure..."
mkdir -p .cursor/{rules,commands,prompts}
mkdir -p workflows
mkdir -p templates
mkdir -p automation
mkdir -p logs

# Verificar dependencias
echo "🔍 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

# Instalar dependencias del workspace
if [ -f "package.json" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Crear archivos de configuración base
echo "⚙️ Creating configuration files..."

# .env template si no existe
if [ ! -f ".env.example" ]; then
    cat > .env.example << EOF
# Environment Variables Template
NODE_ENV=development
API_KEY=your_api_key_here
DATABASE_URL=your_database_url
EOF
fi

# .gitignore si no existe
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << EOF
# Dependencies
node_modules/
package-lock.json

# Environment
.env
.env.local

# Logs
logs/
*.log

# Build
dist/
build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF
fi

echo "✅ Workspace setup complete!"
echo ""
echo "Next steps:"
echo "1. Review .cursor/rules/ for custom rules"
echo "2. Configure .cursor/commands/ for custom commands"
echo "3. Set up workflows in workflows/"
echo "4. Copy .env.example to .env and configure"

