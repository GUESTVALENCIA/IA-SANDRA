# 🚀 Sandra IA 8.0 Pro - Sistema Completo

**Aplicación de Escritorio Profesional con IA Multimodal**

Versión: 8.0.0  
Estado: ✅ **Completamente Operativa**  
Modo: 100% Offline (con capacidades online opcionales)

---

## 📋 Índice

- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [18 Roles Especializados](#-18-roles-especializados)
- [MCP - Modular Control Panel](#-mcp---modular-control-panel)
- [Servicios Multimodales](#-servicios-multimodales)
- [Instalación y Uso](#-instalación-y-uso)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [APIs y Tokens](#-apis-y-tokens)

---

## ✨ Características Principales

### 🎯 18 Roles Especializados con Capacidades Ejecutables
- **Administrador**: Gestión completa del sistema
- **Desarrollador**: Generación y ejecución de código
- **YouTuber**: Creación y monetización de contenido
- **Community Manager**: Gestión de redes sociales
- **Especialista Turístico**: Negociación de alojamientos
- **Negociador de Ventas**: Cierre de deals y ventas
- **Analista de Datos**: Análisis y reportes
- **Marketing**: Estrategias y campañas
- **CEO/Ejecutivo**: Estrategia empresarial
- **Diseñador**: UX/UI y branding
- **Abogado**: Asesoramiento legal
- **Médico**: Asesoramiento de salud
- **Profesor**: Educación y tutoría
- **Asesor Financiero**: Inversiones y análisis
- **Artista**: Creación artística
- **Científico**: Investigación científica
- **Ingeniero**: Diseño de sistemas
- **Psicólogo**: Asesoramiento psicológico

### 🤖 AI Orchestrator
- **Múltiples LLMs**: Groq, DeepSeek, Claude, Ollama
- **Fallback Automático**: Si un proveedor falla, cambia automáticamente
- **Sistema de Subagentes**: Spawning dinámico de agentes especializados
- **Herramientas Ejecutables**: Comandos, APIs, archivos, GitHub

### 🛠️ MCP - Modular Control Panel
- **Generación de Código**: Con IA según rol y lenguaje
- **Despliegue Automático**: Vercel, Netlify
- **Gestión de Agentes**: Crear, monitorear, terminar
- **Sincronización GitHub**: Estado del repo en tiempo real

### 🎙️ Multimodal
- **Deepgram STT**: Speech-to-Text en tiempo real
- **Cartesia TTS**: Text-to-Speech con caché
- **HeyGen Avatar**: Avatar conversacional con WebRTC
- **Barge-in**: Interrumpir respuestas del avatar
- **Modo Continuo**: Conversación sin clicks

### 🔄 Live Updater
- **Auto-actualización**: Desde GitHub
- **Sin reinicio**: Actualiza en caliente
- **Versión semántica**: Control de versiones

### 🗄️ Neon DB
- **PostgreSQL**: Base de datos en la nube
- **Persistencia**: Conversaciones, deployments, updates
- **Logging**: Todas las interacciones

### 🌐 Integraciones
- **Bright Data**: Scraping de Airbnb y Booking.com
- **Twilio**: Llamadas telefónicas para negociación
- **PayPal**: Procesamiento de pagos
- **GitHub**: Commits, PRs, sincronización
- **Vercel/Netlify**: Despliegues automáticos

---

## 🏗️ Arquitectura del Sistema

```
Sandra IA 8.0 Pro
├── Desktop App (Electron)
│   ├── Main Process (main.js)
│   ├── Renderer Process (index.html)
│   └── Preload (preload.js)
│
├── AI Orchestrator
│   ├── Groq (Mixtral, Llama2)
│   ├── DeepSeek (Chat, Coder)
│   ├── Claude (Sonnet, Opus)
│   └── Ollama (Local LLMs)
│
├── Roles System (18 roles)
│   ├── Role Definitions
│   ├── System Prompts
│   ├── Tools per Role
│   └── Subagent Spawning
│
├── MCP Server (Express)
│   ├── Code Generation
│   ├── Deployment
│   ├── Agent Management
│   └── GitHub Sync
│
├── Multimodal Services
│   ├── Deepgram STT
│   ├── Cartesia TTS
│   ├── HeyGen Avatar
│   ├── WebRTC Manager
│   ├── Audio Visualizer
│   └── Voice Cache
│
├── Business Services
│   ├── Bright Data (Scraping)
│   ├── Negotiation Service
│   └── Live Updater
│
└── Database (Neon DB)
    ├── Conversations
    ├── Deployments
    ├── Updates
    └── Configuration
```

---

## 🎯 18 Roles Especializados

### 1. 👔 Administrador
**Capacidades**:
- Gestión de usuarios y permisos
- Configuración del sistema
- Monitoreo de recursos
- Seguridad y auditoría

**Herramientas**:
- `systeminfo`, `tasklist`, `disk_usage`

---

### 2. 💻 Desarrollador
**Capacidades**:
- Generación de código ejecutable
- Debugging y testing
- Deployment
- Operaciones Git

**Herramientas**:
- `run_code`, `run_tests`, `git_commit`, `create_pr`

---

### 3. 🎬 YouTuber
**Capacidades**:
- Creación de guiones
- Optimización SEO
- Monetización
- Análisis de métricas

**Herramientas**:
- `generate_script`, `optimize_title`, `analyze_trends`

---

### 4. 👥 Community Manager
**Capacidades**:
- Gestión de redes sociales
- Calendario de contenido
- Engagement
- Crisis management

**Herramientas**:
- `create_post`, `schedule_content`, `analyze_engagement`

---

### 5. 🏨 Especialista Turístico
**Capacidades**:
- Búsqueda de alojamientos (Airbnb, Booking)
- Negociación de precios
- Gestión de reservas
- Llamadas con Twilio

**Herramientas**:
- `search_airbnb`, `search_booking`, `negotiate_price`, `make_call`

---

### 6. 💼 Negociador de Ventas
**Capacidades**:
- Negociación de ventas
- Manejo de objeciones
- Cierre de deals
- Procesamiento de pagos (PayPal)

**Herramientas**:
- `create_proposal`, `send_email`, `track_deal`, `process_payment`

---

### 7. 📊 Analista de Datos
**Capacidades**:
- Análisis de datos
- Reportes ejecutivos
- Visualización
- Insights accionables

**Herramientas**:
- `analyze_data`, `generate_report`, `create_chart`

---

### 8. 📈 Marketing
**Capacidades**:
- Estrategias de marketing
- Optimización de campañas
- Copywriting
- Análisis de ROI

**Herramientas**:
- `create_campaign`, `optimize_ads`, `track_conversions`

---

### 9. 🏢 CEO/Ejecutivo
**Capacidades**:
- Planificación estratégica
- Toma de decisiones
- Análisis de negocio
- Liderazgo

**Herramientas**:
- `strategic_analysis`, `financial_review`, `market_research`

---

### 10. 🎨 Diseñador
**Capacidades**:
- Diseño UX/UI
- Branding
- Prototyping
- Sistemas de diseño

**Herramientas**:
- `generate_design`, `create_mockup`, `color_palette`

---

### 11. ⚖️ Abogado
**Capacidades**:
- Asesoramiento legal
- Revisión de contratos
- Compliance
- Documentación legal

**Herramientas**:
- `review_contract`, `legal_research`, `generate_document`

---

### 12. 🥼 Médico
**Capacidades**:
- Asesoramiento de salud
- Análisis de síntomas
- Planes de bienestar
- Investigación médica

**Herramientas**:
- `analyze_symptoms`, `research_treatment`, `wellness_plan`

---

### 13. 📚 Profesor
**Capacidades**:
- Enseñanza
- Diseño de currículo
- Evaluación
- Contenido educativo

**Herramientas**:
- `create_lesson`, `generate_quiz`, `explain_concept`

---

### 14. 💰 Asesor Financiero
**Capacidades**:
- Asesoramiento de inversiones
- Gestión de portafolio
- Análisis de riesgo
- Planificación financiera

**Herramientas**:
- `analyze_investment`, `market_data`, `portfolio_optimization`

---

### 15. 🎭 Artista
**Capacidades**:
- Escritura creativa
- Dirección artística
- Storytelling
- Conceptos visuales

**Herramientas**:
- `generate_story`, `create_concept`, `art_prompt`

---

### 16. 🔬 Científico
**Capacidades**:
- Investigación científica
- Prueba de hipótesis
- Análisis de datos
- Escritura científica

**Herramientas**:
- `research_paper`, `analyze_data`, `generate_hypothesis`

---

### 17. 🔧 Ingeniero
**Capacidades**:
- Diseño de sistemas
- Arquitectura
- Optimización
- Especificaciones técnicas

**Herramientas**:
- `design_system`, `optimize_performance`, `technical_spec`

---

### 18. 🧠 Psicólogo
**Capacidades**:
- Asesoramiento psicológico
- Análisis de comportamiento
- Salud mental
- Estrategias de bienestar

**Herramientas**:
- `analyze_behavior`, `wellness_plan`, `coping_strategies`

---

## 🛠️ MCP - Modular Control Panel

### Generación de Código
- **Entrada**: Tarea, Rol, Lenguaje
- **Proceso**: AI genera código ejecutable
- **Salida**: Código validado y listo para usar

### Despliegue Automático
- **Proveedores**: Vercel, Netlify
- **Proceso**:
  1. Clonar repositorio
  2. Instalar dependencias
  3. Build
  4. Deploy a producción
- **Resultado**: URL de producción

### Gestión de Agentes
- **Crear**: Spawn agente con rol específico
- **Monitorear**: Estado, tareas completadas
- **Terminar**: Liberar recursos

### Sincronización GitHub
- **Información**:
  - Último commit
  - Branch activo
  - Stars y forks
  - Issues abiertos

---

## 🎙️ Servicios Multimodales

### Deepgram STT
- **Transcripción en tiempo real**
- **Múltiples idiomas**
- **Alta precisión**
- **Streaming y batch**

### Cartesia TTS
- **Voces naturales**
- **Múltiples idiomas**
- **Caché de respuestas**
- **Baja latencia**

### HeyGen Avatar
- **Avatar conversacional**
- **WebRTC streaming**
- **Sincronización labial**
- **Expresiones faciales**

### Características Avanzadas
- **Barge-in**: Interrumpir al avatar
- **Modo Continuo**: Conversación sin clicks
- **Audio Visualizer**: Visualización de ondas de audio
- **Voice Cache**: Caché de respuestas de voz

---

## 📦 Instalación y Uso

### Requisitos
- Node.js 18+
- npm 9+
- Windows 10/11

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/GUESTVALENCIA/IA-SANDRA.git
cd IA-SANDRA

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.pro
# Editar .env.pro con tus API keys
```

### Ejecución

```bash
# Iniciar aplicación
npm start

# O usar el acceso directo
.\ABRIR_SANDRA.bat

# Iniciar MCP Server (opcional)
npm run start:mcp
```

### Build

```bash
# Build para producción
npm run build

# Crear instalador
electron-builder --win --x64
```

---

## ⚙️ Configuración

### Variables de Entorno (`.env.pro`)

```env
# APIs Principales
GROQ_API_KEY=tu_groq_api_key
DEEPGRAM_API_KEY=tu_deepgram_api_key
CARTESIA_API_KEY=tu_cartesia_api_key
HEYGEN_API_KEY=tu_heygen_api_key
HEYGEN_AVATAR_ID=tu_avatar_id

# Claude API (opcional, para desarrollo profesional)
CLAUDE_API_KEY=tu_claude_api_key

# Base de Datos
NEON_API_KEY=tu_neon_api_key
DATABASE_URL=postgresql://user@host/db

# GitHub
GITHUB_TOKEN=tu_github_token
GITHUB_REPO=USUARIO/REPO

# Vercel
VERCEL_TOKEN=tu_vercel_token

# MCP
MCP_PORT=3001
MCP_SECRET_KEY=tu_secret_key

# Bright Data
BRIGHT_DATA_AUTH=tu_auth
BRIGHT_DATA_HOST=brd.superproxy.io:9515

# PayPal
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_CLIENT_SECRET=tu_client_secret
PAYPAL_MODE=sandbox

# Twilio
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 📁 Estructura del Proyecto

```
C:\Sandra-IA-8.0-Pro\
├── desktop-app/
│   ├── main.js                 # Proceso principal de Electron
│   ├── preload.js              # Preload script (IPC bridge)
│   ├── renderer/
│   │   └── index.html          # UI principal
│   └── assets/
│       └── icon.ico            # Icono de la aplicación
│
├── llm-orchestrator/
│   └── ai-orchestrator.js      # Orquestador de LLMs
│
├── core/
│   ├── roles-system.js         # Sistema de 18 roles
│   ├── practical-execution-framework.js
│   └── sandra-prompt-optimizer.js
│
├── mcp-server/
│   ├── mcp-core.js             # MCP Core Server
│   └── server.js               # Express server
│
├── services/
│   ├── live-updater.js         # Auto-actualización
│   ├── deepgram-service.js     # STT
│   ├── cartesia-service.js     # TTS
│   ├── heygen-service.js       # Avatar
│   ├── multimodal-conversation-service.js
│   ├── webrtc-avatar-manager.js
│   ├── audio-visualizer.js
│   ├── voice-cache-service.js
│   ├── bright-data-service.js  # Scraping
│   └── negotiation-service.js  # Negociación
│
├── neon-db-adapter/
│   └── neon-db.js              # Adaptador de base de datos
│
├── testing/
│   └── role-validator.js       # Validación de roles
│
├── .env.pro                    # Variables de entorno
├── package.json                # Dependencias
├── ABRIR_SANDRA.bat            # Acceso directo
└── README.md                   # Este archivo
```

---

## 🔑 APIs y Tokens

### APIs Requeridas
- **Groq**: Para LLM principal (Mixtral, Llama2)
- **Deepgram**: Para Speech-to-Text
- **Cartesia**: Para Text-to-Speech
- **HeyGen**: Para avatar conversacional

### APIs Opcionales
- **Claude**: Para desarrollo profesional
- **Neon DB**: Para persistencia
- **GitHub**: Para sincronización
- **Vercel**: Para despliegues
- **Bright Data**: Para scraping
- **Twilio**: Para llamadas
- **PayPal**: Para pagos

### Obtener API Keys

1. **Groq**: https://console.groq.com
2. **Deepgram**: https://console.deepgram.com
3. **Cartesia**: https://cartesia.ai
4. **HeyGen**: https://heygen.com
5. **Claude**: https://console.anthropic.com
6. **Neon**: https://neon.tech
7. **GitHub**: https://github.com/settings/tokens
8. **Vercel**: https://vercel.com/account/tokens
9. **Bright Data**: https://brightdata.com
10. **Twilio**: https://www.twilio.com/console
11. **PayPal**: https://developer.paypal.com

---

## 🚀 Características Avanzadas

### Live Updater
- Auto-actualización desde GitHub
- Comprobación cada 60 minutos
- Instalación sin reinicio
- Rollback automático si falla

### Voice Cache
- Caché de respuestas de voz
- Ahorro de costos de API
- Respuestas instantáneas
- Límite configurable (100MB por defecto)

### Barge-in
- Interrumpir al avatar mientras habla
- Detección de voz del usuario
- Cancelación de TTS en curso

### Modo Continuo
- Conversación sin clicks
- Detección automática de silencio
- Respuesta automática

---

## 📊 Estadísticas

- **18 Roles Especializados**: Cada uno con capacidades únicas
- **256 Subagentes**: Capacidad de spawning dinámico
- **4 LLM Providers**: Groq, DeepSeek, Claude, Ollama
- **10+ Integraciones**: APIs externas
- **100% Offline**: Modo offline completo (con Ollama)
- **Multimodal**: Voz, texto, avatar

---

## 🛡️ Seguridad

- **API Keys**: Almacenadas en `.env.pro` (no en Git)
- **Context Isolation**: Electron con preload script
- **Content Security Policy**: Configurada en HTML
- **No Remote Module**: Deshabilitado
- **Web Security**: Activada

---

## 📝 Notas Importantes

1. **Modo Offline**: La aplicación puede funcionar 100% offline usando Ollama
2. **APIs Opcionales**: Puedes usar solo las APIs que necesites
3. **Escalabilidad**: El sistema está diseñado para escalar
4. **Extensibilidad**: Fácil añadir nuevos roles y servicios
5. **Producción**: Lista para producción con todas las características

---

## 🎉 ¡Listo para Usar!

Sandra IA 8.0 Pro está **completamente operativa** y lista para:

✅ Chat multimodal con 18 roles especializados  
✅ Generación de código con IA  
✅ Despliegues automáticos  
✅ Negociación de alojamientos  
✅ Procesamiento de ventas  
✅ Análisis de datos  
✅ Y mucho más...

**¡Disfruta de Sandra IA 8.0 Pro!** 🚀

---

## 📞 Soporte

Para soporte, abre un issue en GitHub o contacta al equipo de desarrollo.

**Repositorio**: https://github.com/GUESTVALENCIA/IA-SANDRA  
**Versión**: 8.0.0  
**Última actualización**: Noviembre 2025

---

**Desarrollado con ❤️ por el equipo de Sandra IA**
