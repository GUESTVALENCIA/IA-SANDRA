# 🚀 SANDRA NUCLEUS - Sistema Central Unificado v100.0 GALAXY

<div align="center">
  <img src="https://img.shields.io/badge/version-100.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/status-production-green.svg" alt="Status">
  <img src="https://img.shields.io/badge/AI-multimodal-purple.svg" alt="AI">
  <img src="https://img.shields.io/badge/license-proprietary-red.svg" alt="License">
</div>

## 📋 Tabla de Contenidos

- [Introducción](#-introducción)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [API Reference](#-api-reference)
- [Subagentes](#-subagentes)
- [Docker](#-docker)
- [Desarrollo](#-desarrollo)
- [Producción](#-producción)

## 🎯 Introducción

**SANDRA NUCLEUS** es el sistema central unificado de inteligencia artificial multimodal para GuestsValencia. Esta versión consolida TODA la funcionalidad de SANDRA IA en una única carpeta con arquitectura modular, eliminando la fragmentación anterior entre múltiples archivos y ubicaciones.

### ¿Por qué NUCLEUS?

- **UNIFICADO**: Todo el código en un solo lugar
- **MODULAR**: Componentes independientes pero integrados
- **ESCALABLE**: Preparado para crecer sin límites
- **PROFESIONAL**: Código de producción con estándares enterprise

## ✨ Características

### Core Features
- 🧠 **Motor IA GPT-4 Turbo** - Procesamiento inteligente de lenguaje natural
- 🎙️ **Multimodal** - Voz, texto, imagen, video
- 🤖 **248 Subagentes** - Sistema distribuido de agentes especializados
- 🔄 **Real-time WebSocket** - Comunicación bidireccional instantánea
- 💾 **PostgreSQL + Redis** - Persistencia y cache de alto rendimiento
- 📊 **Analytics & Metrics** - Monitoreo completo del sistema
- 🔐 **Security First** - Autenticación, encriptación, rate limiting
- 🌍 **Multi-tenant** - Soporte para múltiples instalaciones
- 🔄 **Auto-checkpoints** - Recuperación automática ante fallos
- 🚀 **Edge Cache** - Optimización de respuesta

### Servicios Incluidos
- API REST (Express.js)
- WebSocket Server
- MCP Protocol Server
- Dashboard Web
- Terminal Interactivo
- Sistema de Widgets

## 🏗️ Arquitectura

```
SANDRA_NUCLEUS_UNIFIED/
│
├── sandra-core.js          # 🧠 Núcleo principal del sistema
├── package.json            # 📦 Dependencias y scripts
├── docker-compose.yml      # 🐳 Orquestación de servicios
├── Dockerfile              # 🏗️ Imagen del contenedor
├── .env.example            # 🔐 Template de configuración
├── init.sql                # 💾 Schema de base de datos
├── index.html              # 🌐 Interfaz web
├── setup.sh                # 🔧 Script de instalación
├── start.sh                # ▶️ Script de inicio
├── stop.sh                 # ⏹️ Script de parada
└── README.md               # 📚 Documentación
```

## 🚀 Instalación

### Requisitos Previos
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (opcional pero recomendado)
- PostgreSQL 14+ (si no usas Docker)
- Redis 7+ (si no usas Docker)

### Instalación Rápida (Recomendada)

```bash
# Clonar o descargar el proyecto
cd SANDRA_NUCLEUS_UNIFIED

# Dar permisos de ejecución
chmod +x setup.sh

# Ejecutar instalador automático
./setup.sh
```

### Instalación Manual

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar configuración
cp .env.example .env

# 3. Editar .env con tus API keys
nano .env

# 4. Iniciar servicios Docker
docker-compose up -d

# 5. Inicializar base de datos
docker-compose exec postgres psql -U sandra_admin -d sandra_nucleus < init.sql

# 6. Iniciar aplicación
npm start
```

## ⚙️ Configuración

### Variables de Entorno Principales

```env
# Modo y Entorno
NODE_ENV=production
SANDRA_MODE=GALAXY_PROFESSIONAL

# Servidor
PORT=7777
WS_PORT=7778
MCP_PORT=7779

# Base de Datos
DATABASE_URL=postgresql://sandra_admin:password@localhost:5432/sandra_nucleus
REDIS_URL=redis://:password@localhost:6379

# APIs de IA
OPENAI_API_KEY=sk-your-key-here
ELEVENLABS_API_KEY=your-key
DEEPGRAM_API_KEY=your-key
HEYGEN_API_KEY=your-key

# Features
ENABLE_MULTIMODAL=true
ENABLE_VOICE=true
ENABLE_AVATAR=true
ENABLE_MCP=true
ENABLE_SUBAGENTS=true
```

## 💻 Uso

### Iniciar el Sistema

```bash
# Con Docker (Recomendado)
./start.sh

# Sin Docker
npm start

# Modo desarrollo
npm run dev
```

### Acceder a la Interfaz

1. **Dashboard Web**: http://localhost:7777
2. **API REST**: http://localhost:7777/api
3. **WebSocket**: ws://localhost:7778
4. **Health Check**: http://localhost:7777/health

### Comandos Útiles

```bash
# Ver logs
docker-compose logs -f sandra-core

# Reiniciar servicios
docker-compose restart

# Crear checkpoint manual
curl -X POST http://localhost:7777/api/checkpoint

# Ver estado del sistema
curl http://localhost:7777/health
```

## 📡 API Reference

### Chat Endpoint
```javascript
POST /api/chat
{
  "message": "Hola Sandra",
  "context": {
    "sessionId": "session_123",
    "tenant": "guestsvalencia"
  }
}
```

### WebSocket Messages
```javascript
// Conectar
const ws = new WebSocket('ws://localhost:7778');

// Enviar mensaje
ws.send(JSON.stringify({
  type: 'chat',
  text: 'Hola Sandra',
  context: { sessionId: 'session_123' }
}));

// Recibir respuesta
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.text);
};
```

### Subagents Status
```javascript
GET /api/subagents

Response:
{
  "pricing-agent": {
    "active": true,
    "capabilities": ["dynamic_pricing", "competitor_analysis"]
  },
  "booking-agent": {
    "active": true,
    "capabilities": ["reservation", "availability"]
  }
}
```

## 🤖 Subagentes

El sistema incluye 5 subagentes base:

1. **Pricing Agent** - Gestión de precios dinámicos
2. **Booking Agent** - Gestión de reservas
3. **Support Agent** - Soporte al cliente
4. **Marketing Agent** - Marketing y contenido
5. **Security Agent** - Seguridad y validación

### Registrar Nuevo Subagente

```javascript
SandraNucleus.subagents.register('custom-agent', {
  capabilities: ['custom_task'],
  async handler(task) {
    // Lógica del agente
    return { result: 'success' };
  }
});
```

## 🐳 Docker

### Servicios Incluidos

- **postgres** - Base de datos principal
- **redis** - Cache y sesiones
- **sandra-core** - Aplicación principal
- **nginx** - Reverse proxy
- **prometheus** - Métricas
- **grafana** - Dashboard de monitoreo
- **rabbitmq** - Cola de mensajes para subagentes

### Comandos Docker

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Reiniciar un servicio específico
docker-compose restart sandra-core

# Ejecutar comandos en contenedor
docker-compose exec sandra-core node -v
```

## 🔧 Desarrollo

### Estructura del Código

```javascript
// sandra-core.js estructura principal
const SandraNucleus = {
  config: {},        // Configuración
  brain: {},         // Motor de IA
  subagents: {},     // Sistema de subagentes
  multimodal: {},    // Procesamiento multimodal
  server: {},        // Servidor HTTP/WS
  persistence: {},   // Checkpoints y backups
  widgets: {}        // Componentes UI
};
```

### Agregar Nueva Funcionalidad

1. Añadir módulo en `sandra-core.js`
2. Registrar rutas en `server.setupRoutes()`
3. Actualizar documentación
4. Crear tests si aplica

### Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en watch mode
npm run test:watch
```

## 🚀 Producción

### Checklist de Deployment

- [ ] Configurar todas las API keys en `.env`
- [ ] Configurar SSL/TLS para HTTPS
- [ ] Configurar dominio y DNS
- [ ] Habilitar backups automáticos
- [ ] Configurar monitoreo (Grafana)
- [ ] Configurar alertas
- [ ] Revisar límites de rate limiting
- [ ] Configurar firewall

### Deploy en Servidor

```bash
# 1. Clonar repositorio en servidor
git clone [repository] /opt/sandra-nucleus

# 2. Configurar como servicio systemd
sudo cp sandra-nucleus.service /etc/systemd/system/
sudo systemctl enable sandra-nucleus
sudo systemctl start sandra-nucleus

# 3. Configurar Nginx reverse proxy
sudo cp nginx.conf /etc/nginx/sites-available/sandra
sudo ln -s /etc/nginx/sites-available/sandra /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### Monitoreo

- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **RabbitMQ**: http://localhost:15672

## 📊 Métricas y Performance

### KPIs Principales

- Response Time: < 200ms
- Uptime: 99.9%
- Concurrent Users: 1000+
- Messages/Second: 100+
- Memory Usage: < 500MB
- CPU Usage: < 30%

### Optimizaciones

- Edge caching habilitado
- Connection pooling para DB
- Redis para sesiones
- Lazy loading de módulos
- Compression gzip habilitado

## 🔐 Seguridad

### Características de Seguridad

- JWT Authentication
- Rate Limiting
- CORS configurado
- SQL Injection prevention
- XSS Protection
- Helmet.js middleware
- Encriptación de datos sensibles
- Audit logs

## 📝 Licencia

PROPRIETARY - GuestsValencia™ 2025

## 🤝 Soporte

Para soporte técnico y consultas:
- Web: https://guestsvalencia.es
- Email: support@guestsvalencia.es

## 🎯 Roadmap

- [ ] Integración con WhatsApp Business
- [ ] Soporte multi-idioma completo
- [ ] Dashboard analytics avanzado
- [ ] Marketplace de subagentes
- [ ] Mobile app nativa
- [ ] Blockchain integration
- [ ] AR/VR support

---

<div align="center">
  <strong>SANDRA NUCLEUS v100.0 GALAXY</strong><br>
  Sistema Central Unificado<br>
  <em>Desarrollado con ❤️ para GuestsValencia</em>
</div>
