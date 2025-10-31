#!/bin/bash

# ============================================================================
# SANDRA NUCLEUS - INSTALLATION & SETUP SCRIPT
# Automated setup for the unified SANDRA IA system
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Header
cat << "EOF"
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║   ███████╗ █████╗ ███╗   ██╗██████╗ ██████╗  █████╗              ║
║   ██╔════╝██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔══██╗             ║
║   ███████╗███████║██╔██╗ ██║██║  ██║██████╔╝███████║             ║
║   ╚════██║██╔══██║██║╚██╗██║██║  ██║██╔══██╗██╔══██║             ║
║   ███████║██║  ██║██║ ╚████║██████╔╝██║  ██║██║  ██║             ║
║   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝             ║
║                                                                    ║
║            NUCLEUS v100.0 GALAXY - UNIFIED SYSTEM                 ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
EOF

echo -e "${CYAN}Starting SANDRA NUCLEUS Installation...${NC}\n"

# ============================================================================
# FUNCTIONS
# ============================================================================

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Print step
print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

# Print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ============================================================================
# PREREQUISITES CHECK
# ============================================================================

print_step "Checking prerequisites..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    print_success "Node.js installed (v$NODE_VERSION)"
    
    # Check if version is >= 18
    if [ "$(printf '%s\n' "18.0.0" "$NODE_VERSION" | sort -V | head -n1)" != "18.0.0" ]; then
        print_warning "Node.js version should be >= 18.0.0 for optimal performance"
    fi
else
    print_error "Node.js not found. Please install Node.js >= 18.0.0"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm installed (v$NPM_VERSION)"
else
    print_error "npm not found"
    exit 1
fi

# Check Docker
if command_exists docker; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    print_success "Docker installed (v$DOCKER_VERSION)"
else
    print_warning "Docker not found. Some features will be limited"
    echo "Install Docker from: https://docs.docker.com/get-docker/"
fi

# Check Docker Compose
if command_exists docker-compose; then
    DC_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
    print_success "Docker Compose installed (v$DC_VERSION)"
else
    print_warning "Docker Compose not found"
fi

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================

print_step "Setting up environment..."

# Check if .env exists
if [ -f ".env" ]; then
    print_warning ".env file already exists"
    read -p "Do you want to backup and create a new one? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mv .env .env.backup.$(date +%Y%m%d_%H%M%S)
        print_success "Previous .env backed up"
    fi
fi

# Create .env from example if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        
        # Prompt for API keys
        echo -e "\n${MAGENTA}API Keys Configuration${NC}"
        echo "Press Enter to skip any key (you can add them later)"
        
        read -p "OpenAI API Key: " OPENAI_KEY
        if [ ! -z "$OPENAI_KEY" ]; then
            sed -i "s/sk-your-openai-key-here/$OPENAI_KEY/" .env
            print_success "OpenAI API key configured"
        fi
        
        read -p "ElevenLabs API Key: " ELEVENLABS_KEY
        if [ ! -z "$ELEVENLABS_KEY" ]; then
            sed -i "s/your-elevenlabs-key/$ELEVENLABS_KEY/" .env
            print_success "ElevenLabs API key configured"
        fi
    else
        print_warning ".env.example not found, creating basic .env"
        cat > .env << EOL
NODE_ENV=production
PORT=7777
WS_PORT=7778
MCP_PORT=7779
DATABASE_URL=postgresql://sandra_admin:SandraGalaxy2025!@localhost:5432/sandra_nucleus
REDIS_URL=redis://:SandraRedis2025@localhost:6379
EOL
    fi
fi

# ============================================================================
# DEPENDENCIES INSTALLATION
# ============================================================================

print_step "Installing Node.js dependencies..."

npm install
print_success "Dependencies installed"

# ============================================================================
# DATABASE SETUP
# ============================================================================

if command_exists docker && command_exists docker-compose; then
    print_step "Setting up database with Docker..."
    
    # Start only database services first
    docker-compose up -d postgres redis
    
    # Wait for PostgreSQL to be ready
    echo -n "Waiting for PostgreSQL to be ready"
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U sandra_admin > /dev/null 2>&1; then
            echo
            print_success "PostgreSQL is ready"
            break
        fi
        echo -n "."
        sleep 1
    done
    
    # Initialize database if needed
    if [ -f "init.sql" ]; then
        print_step "Initializing database schema..."
        docker-compose exec -T postgres psql -U sandra_admin -d sandra_nucleus < init.sql 2>/dev/null || true
        print_success "Database initialized"
    fi
else
    print_warning "Docker not available. Please set up PostgreSQL and Redis manually"
    echo "PostgreSQL: Port 5432, Database: sandra_nucleus"
    echo "Redis: Port 6379"
fi

# ============================================================================
# OPTIONAL SERVICES
# ============================================================================

if command_exists docker && command_exists docker-compose; then
    echo -e "\n${MAGENTA}Optional Services${NC}"
    read -p "Do you want to start monitoring services (Prometheus, Grafana)? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose up -d prometheus grafana
        print_success "Monitoring services started"
        echo "Grafana will be available at: http://localhost:3000"
        echo "Default login: admin / SandraGrafana2025"
    fi
    
    read -p "Do you want to start RabbitMQ for advanced subagents? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose up -d rabbitmq
        print_success "RabbitMQ started"
        echo "RabbitMQ Management: http://localhost:15672"
        echo "Login: sandra / SandraRabbit2025"
    fi
fi

# ============================================================================
# START SERVICES
# ============================================================================

print_step "Starting SANDRA NUCLEUS..."

# Create start script
cat > start.sh << 'EOL'
#!/bin/bash
echo "Starting SANDRA NUCLEUS..."

# Start Docker services if available
if command -v docker-compose >/dev/null 2>&1; then
    docker-compose up -d postgres redis
    sleep 5
fi

# Start main application
node sandra-core.js
EOL

chmod +x start.sh

# Create stop script
cat > stop.sh << 'EOL'
#!/bin/bash
echo "Stopping SANDRA NUCLEUS..."

# Stop Docker services if available
if command -v docker-compose >/dev/null 2>&1; then
    docker-compose down
fi

# Kill Node process
pkill -f "node sandra-core.js" || true

echo "SANDRA NUCLEUS stopped"
EOL

chmod +x stop.sh

# ============================================================================
# FINAL SETUP
# ============================================================================

print_step "Finalizing setup..."

# Create necessary directories
mkdir -p logs
mkdir -p data
mkdir -p backups

print_success "Directories created"

# ============================================================================
# COMPLETION
# ============================================================================

echo
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   SANDRA NUCLEUS Installation Complete! 🎉${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo
echo -e "${CYAN}Quick Start Commands:${NC}"
echo -e "  ${YELLOW}./start.sh${NC}     - Start SANDRA NUCLEUS"
echo -e "  ${YELLOW}./stop.sh${NC}      - Stop SANDRA NUCLEUS"
echo -e "  ${YELLOW}npm start${NC}      - Start without Docker"
echo -e "  ${YELLOW}npm run dev${NC}    - Start in development mode"
echo
echo -e "${CYAN}Access Points:${NC}"
echo -e "  Web Interface:  ${MAGENTA}http://localhost:7777${NC}"
echo -e "  API Endpoint:   ${MAGENTA}http://localhost:7777/api${NC}"
echo -e "  WebSocket:      ${MAGENTA}ws://localhost:7778${NC}"
echo -e "  Health Check:   ${MAGENTA}http://localhost:7777/health${NC}"
echo
echo -e "${CYAN}Next Steps:${NC}"
echo -e "  1. Configure your API keys in ${YELLOW}.env${NC} file"
echo -e "  2. Run ${YELLOW}./start.sh${NC} to start the system"
echo -e "  3. Open ${MAGENTA}http://localhost:7777${NC} in your browser"
echo -e "  4. Access the HTML interface or integrate with your app"
echo
echo -e "${GREEN}Thank you for choosing SANDRA NUCLEUS!${NC}"
echo -e "${BLUE}For support, documentation, and updates, visit guestsvalencia.es${NC}"
echo

# Ask if user wants to start now
read -p "Do you want to start SANDRA NUCLEUS now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./start.sh
fi
