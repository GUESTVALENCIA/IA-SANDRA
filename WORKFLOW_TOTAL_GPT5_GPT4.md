# 🎯 WORKFLOW TOTAL - SANDRA IA 8.0 PRO
## Documento Maestro para Modelos GPT-5 y GPT-4

**Fecha:** 2025-11-16  
**Proyecto:** Sandra IA 8.0 Pro v8.0.0  
**Repositorio:** https://github.com/GUESTVALENCIA/IA-SANDRA  
**Workspace Local:** `C:\Sandra-IA-8.0-Pro`  
**Destinatarios:** GPT-5 Instant, GPT-5 Thinking, GPT-5 Pro, GPT-5 Thinking Mini, GPT-4.0, GPT-4.1, O3, O4 Mini

---

## 📋 ÍNDICE

1. [¿QUÉ ES SANDRA IA 8.0 PRO?](#qué-es-sandra-ia-80-pro)
2. [ESTADO ACTUAL DEL PROYECTO](#estado-actual-del-proyecto)
3. [ARQUITECTURA TÉCNICA ACTUAL](#arquitectura-técnica-actual)
4. [QUÉ TENEMOS IMPLEMENTADO](#qué-tenemos-implementado)
5. [QUÉ FALTA POR IMPLEMENTAR](#qué-falta-por-implementar)
6. [OBJETIVOS Y ROADMAP](#objetivos-y-roadmap)
7. [ASIGNACIÓN DE MODELOS POR TAREA](#asignación-de-modelos-por-tarea)
8. [ESTRUCTURA DE ARCHIVOS CLAVE](#estructura-de-archivos-clave)
9. [DOCUMENTOS DE REFERENCIA](#documentos-de-referencia)
10. [INSTRUCCIONES DE TRABAJO](#instrucciones-de-trabajo)

---

## ¿QUÉ ES SANDRA IA 8.0 PRO?

### Visión General

**Sandra IA 8.0 Pro** es un **ecosistema completo de inteligencia artificial orquestada** diseñado para transformar la industria del turismo vacacional y expandirse a múltiples verticales (guarderías, gimnasios, etc.).

### Concepto Fundamental

> **"Un núcleo técnico, múltiples productos especializados, escalabilidad infinita"**

Sandra IA es la **orquestadora general** que:
- Coordina múltiples subagentes especializados
- Decide qué modelo LLM usar para cada tarea
- Gestiona el flujo de trabajo entre servicios
- Monitorea la salud del sistema completo
- Escala automáticamente según demanda

### Propuesta de Valor

- **Para el CEO/Emprendedor**: Consola de gestión profesional que monitorea y orquesta múltiples servicios de IA
- **Para Clientes B2B**: Productos SaaS especializados (mini-Sandras) adaptados a sus necesidades
- **Para Huéspedes**: Experiencia conversacional multimodal premium con atención 24/7
- **Para el Negocio**: Automatización completa, reducción de costes, escalabilidad sin límites

### Mini-Sandras (Productos SaaS)

Cada mini-Sandra es un producto SaaS independiente montado sobre el mismo núcleo técnico:
- **Sandra Concierge** (alojamientos turísticos)
- **Sandra Nursery** (guarderías)
- **Sandra Gym** (gimnasios)
- **Sandra [Vertical]** (cualquier vertical)

---

## ESTADO ACTUAL DEL PROYECTO

### ✅ COMPLETADO

1. **Aplicación Desktop Electron**
   - Frontend: `desktop-app/renderer/index.html`
   - Backend: `desktop-app/main.js`
   - IPC Bridge: `desktop-app/preload.js`

2. **Sistema Multimodal Conversacional**
   - Servicio core: `services/multimodal-conversation-service.js`
   - FSM (Finite State Machine) implementada con `xstate`
   - Estados: IDLE → GREETING → LISTENING → THINKING → SPEAKING
   - Wake word detection ("Hola Sandra")
   - Saludo único por sesión

3. **Integraciones de Servicios**
   - **STT (Speech-to-Text)**: Deepgram Service (`services/deepgram-service.js`)
   - **TTS (Text-to-Speech)**: Cartesia Service (`services/cartesia-service.js`)
   - **Avatar**: HeyGen Service (`services/heygen-service.js`)
   - **Lip-sync**: LipSync Service (`services/lipsync-service.js`)
   - **Datos en vivo**: BrightData Service (`services/bright-data-service.js`)

4. **Orquestador LLM**
   - `llm-orchestrator/ai-orchestrator.js`
   - Gateway para múltiples proveedores (OpenAI, Claude, Groq, DeepSeek)
   - Ruteo básico de modelos

5. **Sistema de Roles**
   - `core/roles-system.js`
   - 62+ roles especializados
   - Detección de saludos
   - Activación/desactivación de roles

6. **Barra Multimodal (Parcial)**
   - Input dock con botones de acción
   - Botones: Adjuntar (Foto/Vídeo/PDF), Grabar Audio, Llamada
   - Footer contextual
   - Manejo de archivos adjuntos

7. **MCP Server**
   - `mcp-server/server.js` (puerto 3001)
   - Endpoints para chat multimodal, análisis de media, incidencias
   - Integración con Twilio WhatsApp para notificaciones

8. **Base de Datos**
   - Neon DB Adapter (`neon-db-adapter/neon-db.js`)
   - Persistencia de conversaciones, incidencias, roles

### ⚠️ PARCIALMENTE COMPLETADO

1. **Barge-in en Tiempo Real**
   - ✅ Lógica básica implementada
   - ⚠️ Necesita refinamiento (detección más precisa)
   - ⚠️ Coordinación con FSM mejorable

2. **Conversación Continua**
   - ✅ Modo continuo implementado
   - ⚠️ Necesita estabilización
   - ⚠️ Manejo de timeouts mejorable

3. **Avatar HeyGen WebRTC**
   - ✅ Integración básica con HeyGen
   - ⚠️ WebRTC real no completamente funcional
   - ⚠️ Video en vivo en `#heygen-avatar-video` necesita trabajo

4. **Ruteo Inteligente de Modelos**
   - ✅ Ruteo básico implementado
   - ⚠️ Falta lógica avanzada de selección
   - ⚠️ Fallbacks no completamente implementados

### ❌ PENDIENTE

1. **Refinamiento del Sistema Conversacional**
   - Eliminar saludos duplicados (ya parcialmente resuelto con FSM)
   - Mejorar respuestas asíncronas con BrightData
   - Optimizar barge-in para ser más preciso
   - Estabilizar modo continuo

2. **Barra Multimodal Completa**
   - Modos rápidos (chips FAQ, Reserva, Incidencia)
   - Indicadores de estado mejorados
   - Visualización de onda de audio en tiempo real
   - Manejo de errores más robusto

3. **Sistema de Incidencias Automatizado**
   - Análisis automático de fotos con o3-mini
   - Creación automática de incidencias
   - Notificación automática a equipos de limpieza (Twilio WhatsApp)
   - Política de reintentos y escalación

4. **Ruteo Avanzado de Modelos**
   - Lógica inteligente: GPT-4o para voz/video, GPT-4o-mini para texto
   - Fallback a Claude para razonamiento complejo
   - "Sandra Mini" con Groq para modo ahorro
   - Selección dinámica según tarea y rol

5. **Optimización y Performance**
   - Caché de respuestas de voz
   - Optimización de prompts
   - Reducción de latencia en respuestas
   - Manejo de errores más robusto

---

## ARQUITECTURA TÉCNICA ACTUAL

### Stack Tecnológico

- **Frontend**: Electron Renderer (HTML/CSS/JavaScript)
- **Backend**: Electron Main Process (Node.js)
- **Base de Datos**: Neon PostgreSQL
- **STT**: Deepgram Live API
- **TTS**: Cartesia API
- **Avatar**: HeyGen API
- **LLM**: OpenAI (GPT-4o, GPT-4o-mini), Claude 3.5 Sonnet, Groq, DeepSeek
- **FSM**: xstate (Finite State Machine)
- **Comunicación**: IPC (Inter-Process Communication)

### Flujo de Conversación Actual

```
1. Usuario dice "Hola Sandra" (Wake Word)
   ↓
2. Frontend detecta wake word (index.html)
   ↓
3. Se dispara SOS agent (emergency handler)
   ↓
4. Se inicia llamada conversacional (startConversationalCall)
   ↓
5. FSM transiciona: IDLE → GREETING → LISTENING
   ↓
6. Deepgram Live se conecta (STT en tiempo real)
   ↓
7. Cada transcripción → MultimodalConversationService.sendVoice()
   ↓
8. FSM transiciona: LISTENING → THINKING → SPEAKING
   ↓
9. GPT-4o genera respuesta
   ↓
10. Cartesia TTS genera audio
   ↓
11. HeyGen Avatar reproduce audio con lip-sync
   ↓
12. FSM transiciona: SPEAKING → LISTENING (loop)
```

### Componentes Principales

#### 1. MultimodalConversationService
**Archivo:** `services/multimodal-conversation-service.js` (~1280 líneas)

**Responsabilidades:**
- Gestión de sesiones conversacionales
- Coordinación STT → LLM → TTS → Avatar
- Manejo de FSM (Finite State Machine)
- Barge-in en tiempo real
- Modo continuo
- Enriquecimiento asíncrono con BrightData

**Estados FSM:**
- `IDLE`: Estado inicial, esperando wake word
- `GREETING`: Reproduciendo saludo único
- `LISTENING`: Escuchando al usuario
- `THINKING`: Procesando transcripción con LLM
- `SPEAKING`: Reproduciendo respuesta

#### 2. AI Orchestrator
**Archivo:** `llm-orchestrator/ai-orchestrator.js`

**Responsabilidades:**
- Ruteo de modelos LLM según tarea
- Gestión de múltiples proveedores (OpenAI, Claude, Groq, DeepSeek)
- Fallbacks automáticos
- Gestión de tokens y costes

#### 3. Roles System
**Archivo:** `core/roles-system.js` (~1700 líneas)

**Responsabilidades:**
- Gestión de 62+ roles especializados
- Activación/desactivación de roles
- Detección de saludos
- Ejecución de tareas con roles específicos

#### 4. Desktop App Main
**Archivo:** `desktop-app/main.js` (~1300 líneas)

**Responsabilidades:**
- Inicialización de servicios
- IPC handlers para comunicación frontend-backend
- Gestión de ventanas Electron
- Integración con todos los servicios

#### 5. Frontend Renderer
**Archivo:** `desktop-app/renderer/index.html` (~4000+ líneas)

**Responsabilidades:**
- UI completa de la aplicación
- Wake word detection
- Barra multimodal
- CEO Dashboard
- Logs & Alerts Panel
- Integración con servicios vía IPC

---

## QUÉ TENEMOS IMPLEMENTADO

### ✅ Sistema Conversacional Multimodal

1. **FSM (Finite State Machine)**
   - Implementada con `xstate`
   - Estados claramente definidos
   - Transiciones controladas
   - Previene saludos duplicados

2. **Wake Word Detection**
   - Detección de "Hola Sandra"
   - Debounce para evitar múltiples activaciones
   - Integración con FSM

3. **STT (Speech-to-Text)**
   - Deepgram Live API integrado
   - Transcripciones en tiempo real
   - Manejo de transcripciones interim y finales

4. **TTS (Text-to-Speech)**
   - Cartesia API integrado
   - Generación de audio natural
   - Reproducción en tiempo real

5. **Avatar HeyGen**
   - Integración básica con HeyGen API
   - Lip-sync básico
   - Configuración WebRTC parcial

6. **Barge-in Básico**
   - Detección de interrupciones
   - Parada de reproducción al detectar voz
   - Integración con FSM

### ✅ Barra Multimodal (Parcial)

1. **Input Dock**
   - Campo de texto con auto-resize
   - Botones de acción (Adjuntar, Grabar, Llamada, Enviar)
   - Menú desplegable de adjuntos

2. **Manejo de Archivos**
   - Upload de fotos, vídeos, PDFs
   - Validación de tipos y tamaños
   - Preview de archivos adjuntos

3. **Footer Contextual**
   - Información de minutos restantes
   - Recordatorio de privacidad
   - SLA de respuesta

### ✅ Sistema de Roles

1. **62+ Roles Especializados**
   - Roles core SOE (7 roles)
   - Roles de Sandra IA 7.0 (18 roles)
   - Roles adicionales (37+ roles)
   - Subagentes de marketing (10 roles)

2. **Gestión de Roles**
   - Activación/desactivación dinámica
   - Validación de roles
   - Ejecución de tareas con roles específicos

### ✅ MCP Server

1. **Endpoints Implementados**
   - `/mcp/chat/multimodal` - Chat multimodal
   - `/mcp/assets/upload` - Upload de archivos
   - `/mcp/analyze-media` - Análisis de media con o3-mini
   - `/mcp/incidents/create` - Creación de incidencias
   - `/mcp/incidents` - Listado de incidencias
   - `/mcp/role-config/:role` - Configuración de roles

2. **Integraciones**
   - Twilio WhatsApp para notificaciones
   - Análisis automático de media
   - Creación automática de incidencias

---

## QUÉ FALTA POR IMPLEMENTAR

### 🔴 CRÍTICO (Prioridad Alta)

1. **Refinamiento del Sistema Conversacional**
   - **Problema**: Saludos duplicados (parcialmente resuelto con FSM)
   - **Solución**: Mejorar coordinación entre wake word detection y FSM
   - **Archivos**: `services/multimodal-conversation-service.js`, `desktop-app/renderer/index.html`

2. **Barge-in Mejorado**
   - **Problema**: Detección no siempre precisa
   - **Solución**: Mejorar lógica de detección (mínimo 4 palabras, 1 segundo sostenido)
   - **Archivos**: `services/multimodal-conversation-service.js`

3. **Respuestas Asíncronas con BrightData**
   - **Problema**: Respuestas lentas cuando se consulta disponibilidad de alojamientos
   - **Solución**: Respuesta rápida inicial + enriquecimiento asíncrono (ya parcialmente implementado)
   - **Archivos**: `services/multimodal-conversation-service.js`

4. **Avatar HeyGen WebRTC Real**
   - **Problema**: Video en vivo no completamente funcional
   - **Solución**: Implementar `services/webrtc-avatar-manager.js` completo
   - **Archivos**: `services/webrtc-avatar-manager.js`, `services/heygen-service.js`

### 🟡 IMPORTANTE (Prioridad Media)

1. **Ruteo Inteligente de Modelos**
   - **Problema**: Ruteo básico, falta lógica avanzada
   - **Solución**: Implementar `selectModel(task, role, mode)` con lógica inteligente
   - **Archivos**: `llm-orchestrator/ai-orchestrator.js`

2. **Barra Multimodal Completa**
   - **Problema**: Faltan modos rápidos y mejoras de UX
   - **Solución**: Implementar chips de modos rápidos, mejoras visuales
   - **Archivos**: `desktop-app/renderer/index.html`, `desktop-app/renderer/enterprise.css`

3. **Sistema de Incidencias Automatizado**
   - **Problema**: Análisis automático de fotos no completamente funcional
   - **Solución**: Mejorar integración con o3-mini, notificaciones automáticas
   - **Archivos**: `mcp-server/server.js`

4. **Optimización de Performance**
   - **Problema**: Latencia en respuestas, falta caché
   - **Solución**: Implementar caché de respuestas, optimizar prompts
   - **Archivos**: `services/voice-cache-service.js`, `core/optimized-prompts.js`

### 🟢 MEJORAS (Prioridad Baja)

1. **CEO Dashboard Mejorado**
   - Más métricas y KPIs
   - Visualizaciones avanzadas
   - Alertas en tiempo real

2. **Logs & Alerts Panel Mejorado**
   - Filtros avanzados
   - Exportación de logs
   - Alertas configurables

3. **Documentación Técnica**
   - Documentación de API
   - Guías de desarrollo
   - Diagramas de arquitectura

---

## OBJETIVOS Y ROADMAP

### Objetivo Principal

**Crear un sistema conversacional multimodal enterprise-level que:**
1. Funcione de forma fluida y natural
2. Escale a múltiples verticales (mini-Sandras)
3. Sea configurable sin cambios de código
4. Proporcione experiencia premium a usuarios finales

### Roadmap Inmediato (Próximas 2 Semanas)

#### Semana 1: Estabilización del Sistema Conversacional
- ✅ Refinar FSM y eliminar saludos duplicados
- ✅ Mejorar barge-in para ser más preciso
- ✅ Estabilizar modo continuo
- ✅ Completar avatar HeyGen WebRTC

#### Semana 2: Optimización y Ruteo Inteligente
- ✅ Implementar ruteo inteligente de modelos
- ✅ Completar barra multimodal
- ✅ Mejorar sistema de incidencias automatizado
- ✅ Optimizar performance y latencia

### Roadmap Medio Plazo (Próximo Mes)

1. **Mini-Sandras**
   - Configuración por vertical
   - Productos SaaS independientes
   - Escalabilidad horizontal

2. **Mejoras de UX**
   - UI más pulida
   - Animaciones y transiciones
   - Feedback visual mejorado

3. **Monetización**
   - Sistema de suscripciones
   - Facturación automática
   - Gestión de clientes B2B

---

## ASIGNACIÓN DE MODELOS POR TAREA

### GPT-5 Pro / GPT-5 Thinking
**Uso:** Arquitectura y diseño de alto nivel

**Tareas asignadas:**
- Diseño arquitectónico completo del sistema
- Orquestación general del ecosistema
- Decisiones estratégicas de tecnología
- Diseño de workflows complejos
- Análisis de escalabilidad y performance

**Documentos a leer:**
- `VISION_COMPLETA_SANDRA_IA_ECOSISTEMA_O3PRO.md`
- `TECHNICAL_REPORT_CONVERSATIONAL_SYSTEM_O3PRO.md`
- `DESIGN_MULTIMODAL_CHAT.md`
- `DESIGN_DESKTOP_CONSOLE.md`

### GPT-5 Instant / GPT-5 Thinking Mini
**Uso:** Implementación rápida y eficiente

**Tareas asignadas:**
- Implementación de funcionalidades específicas
- Corrección de bugs
- Optimización de código
- Refinamiento de features existentes
- Testing y validación

**Archivos a trabajar:**
- `services/multimodal-conversation-service.js`
- `desktop-app/renderer/index.html`
- `llm-orchestrator/ai-orchestrator.js`
- `core/roles-system.js`

### GPT-4.1 / GPT-4.0
**Uso:** Conversación y UX

**Tareas asignadas:**
- Mejora de prompts conversacionales
- Optimización de respuestas de IA
- Refinamiento de UX
- Testing de flujos conversacionales
- Validación de experiencia de usuario

**Archivos a trabajar:**
- `core/optimized-prompts.js`
- `core/roles-system.js`
- `services/multimodal-conversation-service.js`

### O3 / O4 Mini
**Uso:** Razonamiento profundo y análisis

**Tareas asignadas:**
- Análisis de problemas complejos
- Optimización de algoritmos
- Análisis de media (fotos, vídeos)
- Detección de incidencias automática
- Razonamiento sobre arquitectura

**Archivos a trabajar:**
- `mcp-server/server.js` (análisis de media)
- `services/multimodal-conversation-service.js` (lógica compleja)

---

## ESTRUCTURA DE ARCHIVOS CLAVE

### Archivos Core del Sistema

```
Sandra-IA-8.0-Pro/
├── desktop-app/
│   ├── main.js                    # Main process Electron (IPC handlers)
│   ├── preload.js                 # IPC bridge (seguridad)
│   └── renderer/
│       ├── index.html             # Frontend completo (UI, wake word, chat)
│       ├── enterprise.css         # Estilos enterprise
│       ├── callcenter.module.js   # Módulo call center
│       └── voice-stream.module.js  # Módulo de streaming de voz
│
├── services/
│   ├── multimodal-conversation-service.js  # CORE: Servicio multimodal (FSM, STT, TTS, Avatar)
│   ├── deepgram-service.js        # STT (Speech-to-Text)
│   ├── cartesia-service.js        # TTS (Text-to-Speech)
│   ├── heygen-service.js          # Avatar HeyGen
│   ├── lipsync-service.js         # Lip-sync avanzado
│   ├── webrtc-avatar-manager.js   # WebRTC para avatar (PENDIENTE)
│   ├── bright-data-service.js     # Datos en vivo (alojamientos)
│   └── voice-cache-service.js     # Caché de respuestas de voz
│
├── llm-orchestrator/
│   ├── ai-orchestrator.js         # Orquestador LLM (ruteo de modelos)
│   └── ai-gateway.js              # Gateway para múltiples proveedores
│
├── core/
│   ├── roles-system.js            # Sistema de 62+ roles
│   ├── optimized-prompts.js      # Prompts optimizados
│   ├── service-manager.js         # Gestor de servicios
│   └── config-validator.js        # Validador de configuración
│
├── mcp-server/
│   ├── server.js                  # Servidor MCP (puerto 3001)
│   ├── mcp-core.js                # Core MCP
│   └── mcp-sonnet-full-access.js  # MCP para Sonnet 4.5+
│
└── neon-db-adapter/
    └── neon-db.js                 # Adaptador Neon PostgreSQL
```

### Documentos de Referencia

```
Sandra-IA-8.0-Pro/
├── WORKFLOW_TOTAL_GPT5_GPT4.md           # ESTE DOCUMENTO (workflow maestro)
├── VISION_COMPLETA_SANDRA_IA_ECOSISTEMA_O3PRO.md  # Visión completa del proyecto
├── TECHNICAL_REPORT_CONVERSATIONAL_SYSTEM_O3PRO.md # Reporte técnico detallado
├── DESIGN_MULTIMODAL_CHAT.md            # Diseño de barra multimodal
├── DESIGN_DESKTOP_CONSOLE.md            # Diseño de consola desktop
├── WORKFLOW_PENDIENTE.md                 # Workflow anterior (referencia)
├── UBICACION_PROYECTO_O3PRO.md          # Ubicación del proyecto
└── ARCHIVOS_COMPLETOS_SISTEMA_CONVERSACIONAL_O3PRO.md  # Código completo de archivos clave
```

---

## DOCUMENTOS DE REFERENCIA

### Documentos Principales (LEER PRIMERO)

1. **`WORKFLOW_TOTAL_GPT5_GPT4.md`** (ESTE DOCUMENTO)
   - Workflow maestro completo
   - Estado actual del proyecto
   - Tareas pendientes
   - Asignación de modelos

2. **`VISION_COMPLETA_SANDRA_IA_ECOSISTEMA_O3PRO.md`**
   - Visión completa del ecosistema
   - Concepto de mini-Sandras
   - Modelo de negocio SaaS
   - Arquitectura general

3. **`TECHNICAL_REPORT_CONVERSATIONAL_SYSTEM_O3PRO.md`**
   - Reporte técnico detallado
   - Problemas identificados
   - Soluciones propuestas
   - Arquitectura del sistema conversacional

4. **`DESIGN_MULTIMODAL_CHAT.md`**
   - Diseño UX de la barra multimodal
   - Flujos técnicos por tipo de entrada
   - Contratos de datos
   - Recomendaciones de LLM

5. **`DESIGN_DESKTOP_CONSOLE.md`**
   - Diseño de la consola desktop
   - Arquitectura de pantallas
   - CEO Dashboard
   - Logs & Alerts Panel

### Documentos de Soporte

6. **`ARCHIVOS_COMPLETOS_SISTEMA_CONVERSACIONAL_O3PRO.md`**
   - Código completo de archivos clave
   - Referencias rápidas
   - Contexto técnico

7. **`UBICACION_PROYECTO_O3PRO.md`**
   - Ubicación exacta del proyecto
   - Estructura de carpetas
   - Verificación de archivos

8. **`WORKFLOW_PENDIENTE.md`**
   - Workflow anterior (referencia histórica)
   - Tareas pendientes anteriores
   - Contexto de desarrollo

---

## INSTRUCCIONES DE TRABAJO

### Para Modelos GPT-5 Pro / GPT-5 Thinking

1. **LEER PRIMERO:**
   - `WORKFLOW_TOTAL_GPT5_GPT4.md` (este documento)
   - `VISION_COMPLETA_SANDRA_IA_ECOSISTEMA_O3PRO.md`
   - `TECHNICAL_REPORT_CONVERSATIONAL_SYSTEM_O3PRO.md`

2. **ANALIZAR:**
   - Arquitectura actual del sistema
   - Problemas identificados
   - Objetivos y roadmap

3. **DISEÑAR:**
   - Solución arquitectónica completa
   - Workflows optimizados
   - Estrategia de escalabilidad

4. **ENTREGAR:**
   - Documento de diseño arquitectónico
   - Diagramas de flujo
   - Especificaciones técnicas
   - Plan de implementación

### Para Modelos GPT-5 Instant / GPT-5 Thinking Mini

1. **LEER PRIMERO:**
   - `WORKFLOW_TOTAL_GPT5_GPT4.md` (este documento)
   - `DESIGN_MULTIMODAL_CHAT.md`
   - `ARCHIVOS_COMPLETOS_SISTEMA_CONVERSACIONAL_O3PRO.md`

2. **REVISAR CÓDIGO:**
   - `services/multimodal-conversation-service.js`
   - `desktop-app/renderer/index.html`
   - `llm-orchestrator/ai-orchestrator.js`

3. **IMPLEMENTAR:**
   - Funcionalidades específicas asignadas
   - Correcciones de bugs
   - Optimizaciones de código

4. **VALIDAR:**
   - Testing básico
   - Verificación de funcionalidad
   - Commits pequeños y frecuentes

### Para Modelos GPT-4.1 / GPT-4.0

1. **LEER PRIMERO:**
   - `WORKFLOW_TOTAL_GPT5_GPT4.md` (este documento)
   - `core/optimized-prompts.js`
   - `core/roles-system.js`

2. **MEJORAR:**
   - Prompts conversacionales
   - Respuestas de IA
   - Experiencia de usuario

3. **TESTEAR:**
   - Flujos conversacionales
   - Validación de respuestas
   - Feedback de usuario

### Para Modelos O3 / O4 Mini

1. **LEER PRIMERO:**
   - `WORKFLOW_TOTAL_GPT5_GPT4.md` (este documento)
   - `TECHNICAL_REPORT_CONVERSATIONAL_SYSTEM_O3PRO.md`

2. **ANALIZAR:**
   - Problemas complejos
   - Algoritmos de optimización
   - Media (fotos, vídeos)

3. **RESOLVER:**
   - Análisis profundo
   - Soluciones algorítmicas
   - Detección automática de incidencias

---

## ACCESO AL REPOSITORIO

### Repositorio GitHub
- **URL**: https://github.com/GUESTVALENCIA/IA-SANDRA
- **Branch principal**: `main`
- **Workspace local**: `C:\Sandra-IA-8.0-Pro`

### MCP Server (Opcional)
- **Puerto**: 3001 (servidor principal)
- **Puerto**: 3002 (servidor o3-pro, si es necesario)
- **Endpoint base**: `http://localhost:3001/mcp`
- **Health check**: `GET /mcp/health`

### Sincronización
1. Clonar repositorio en workspace local
2. Trabajar directamente en archivos
3. Commits pequeños y frecuentes
4. Push regular al repositorio

---

## REGLAS DE TRABAJO

### ✅ HACER

1. **Leer TODOS los documentos de referencia antes de empezar**
2. **Entender el contexto completo del proyecto**
3. **Trabajar de forma incremental** (commits pequeños)
4. **Validar cambios** antes de commitear
5. **Documentar cambios** importantes
6. **Seguir el estilo de código existente**
7. **Comunicar problemas** o dudas claramente

### ❌ NO HACER

1. **NO hacer cambios sin entender el contexto**
2. **NO romper funcionalidad existente**
3. **NO hacer commits grandes sin validar**
4. **NO ignorar errores o warnings**
5. **NO trabajar en aislamiento** (consultar documentación)
6. **NO hacer cambios arquitectónicos sin consenso**
7. **NO dejar código comentado o TODO sin resolver**

---

## CONTACTO Y SOPORTE

### Documentación
- Todos los documentos están en el repositorio
- Consultar `WORKFLOW_TOTAL_GPT5_GPT4.md` para dudas generales
- Consultar documentos específicos para detalles técnicos

### Verificación
- Verificar que los archivos existen antes de trabajar
- Validar que el código compila y funciona
- Probar cambios antes de commitear

---

## CONCLUSIÓN

Este documento es el **workflow maestro** para todos los modelos GPT-5 y GPT-4 que trabajarán en Sandra IA 8.0 Pro.

**OBJETIVO FINAL:** Crear un sistema conversacional multimodal enterprise-level que funcione de forma fluida, escale a múltiples verticales, y proporcione experiencia premium a usuarios finales.

**METODOLOGÍA:** Trabajo incremental, commits pequeños, validación continua, documentación clara.

**RESULTADO ESPERADO:** Sistema completo, estable, escalable y profesional.

---

**FIN DEL DOCUMENTO**

**Última actualización:** 2025-11-16  
**Versión:** 1.0  
**Estado:** Activo

