# 🧠 ANÁLISIS DEL NÚCLEO DE SANDRA POR CAPAS

## 📋 Arquitectura del Núcleo (sandra-nucleus-core.js)

### **CAPA 1: CONFIGURACIÓN CENTRAL** (líneas 8-67)
- **Propósito**: Configuración global del sistema
- **Contenido**:
  - Variables de entorno (API keys)
  - Configuración de servicios (port, database)
  - Features flags (multimodal, voice, avatar, mcp, subagents)
- **Estado**: ✅ Funcional

---

### **CAPA 2: MOTOR CENTRAL DE IA (BRAIN)** (líneas 70-291)
- **Propósito**: Procesamiento inteligente de mensajes
- **Componentes**:
  - `processMessage()` - Orquestador principal
  - `enrichContext()` - Enriquecimiento con memoria
  - `detectIntent()` - Detección de intención (BÁSICO)
  - `generateResponse()` - Generación con GPT-4o
  - **`getSystemPrompt()`** - ⚠️ **PROBLEMA DETECTADO**: Solo tiene 4 prompts básicos
  - `memoryStore` - Memoria persistente (✅ Funcional)

- **PROBLEMA CRÍTICO**: 
  - `getSystemPrompt()` solo tiene prompts para: `booking`, `pricing`, `support`, `general`
  - **NO tiene integrados los 18 roles** de `sandra-prompts.js`
  - **NO detecta qué rol usar** según el contexto

- **SOLUCIÓN NECESARIA**:
  1. Integrar sistema de 18 roles desde `sandra-prompts.js`
  2. Conectar `buildSystemPrompt()` de `sandra-prompts.js`
  3. Modificar `detectIntent()` para detectar roles además de intenciones
  4. Activar especialmente el rol `dev-fullstack` (desarrolladora)

---

### **CAPA 3: SISTEMA DE SUBAGENTES** (líneas 294-347)
- **Propósito**: Gestión de 256 subagentes especializados
- **Componentes**:
  - `registry` - Registro de subagentes
  - `register()` - Registrar nuevos subagentes
  - `execute()` - Ejecutar tareas con subagentes
  - `getStatus()` - Estado de todos los subagentes
- **Estado**: ✅ Funcional (solo tiene 3 básicos: pricing, booking, support)
- **NOTA**: Los 256 subagentes de Sandra NO deben tocarse según instrucciones

---

### **CAPA 4: MOTOR DE VOZ Y MULTIMODAL** (líneas 350-430)
- **Propósito**: Procesamiento de voz y avatar
- **Componentes**:
  - `textToSpeech()` - TTS con Cartesia (✅ Integrado)
  - `speechToText()` - STT con Deepgram (✅ Integrado)
  - `generateAvatar()` - Avatar con HeyGen (✅ Integrado)
- **Estado**: ✅ Funcional

---

### **CAPA 5: SERVIDOR WEB Y WEBSOCKET** (líneas 433-578)
- **Propósito**: Comunicación HTTP y WebSocket
- **Componentes**:
  - `initializeExpress()` - Servidor Express
  - `initializeWebSocket()` - Servidor WebSocket
  - Rutas API: `/api/chat`, `/api/subagents`, `/api/tts`, `/api/stt`
- **Estado**: ✅ Funcional

---

### **CAPA 6: SISTEMA DE PERSISTENCIA Y CHECKPOINTS** (líneas 581-663)
- **Propósito**: Guardar/restaurar estado del sistema
- **Componentes**:
  - `createCheckpoint()` - Crear punto de restauración
  - `restoreCheckpoint()` - Restaurar desde checkpoint
  - Guardado en `.sandra-checkpoints.json`
- **Estado**: ✅ Funcional

---

### **CAPA 7: WIDGETS Y COMPONENTES UI** (líneas 666-743)
- **Propósito**: Componentes de interfaz
- **Componentes**:
  - `generateChatWidget()` - Widget de chat
  - `generateAvatarWidget()` - Widget de avatar
- **Estado**: ✅ Funcional

---

### **CAPA 8: INICIALIZACIÓN** (líneas 746-846)
- **Propósito**: Bootstrap del sistema
- **Componentes**:
  - `initialize()` - Inicialización completa
  - `loadConfiguration()` - Cargar config desde env
  - `registerBaseSubagents()` - Registrar subagentes básicos
- **Estado**: ✅ Funcional

---

## 🎯 PROBLEMA PRINCIPAL IDENTIFICADO

### **DESCONEXIÓN DE LOS 18 ROLES**

**Ubicación del problema**: `brain.getSystemPrompt()` (línea 160-200)

**Situación actual**:
```javascript
getSystemPrompt(intent, context) {
  const sandraPersonality = `Eres Sandra...`;
  const prompts = {
    booking: `${sandraPersonality}...`,
    pricing: `${sandraPersonality}...`,
    support: `${sandraPersonality}...`,
    general: sandraPersonality
  };
  return prompts[intent] || prompts.general;
}
```

**Lo que debería ser**:
```javascript
getSystemPrompt(intent, context) {
  const { buildSystemPrompt } = require('../path/to/sandra-prompts.js');
  const role = context.role || this.detectRole(context.message || intent);
  const language = context.language || 'es';
  return buildSystemPrompt(role, language);
}
```

**Archivo con los 18 roles**: `C:\Users\clayt\IA-SANDRA\netlify\functions\shared\sandra-prompts.js`

**Roles disponibles**:
1. `guests-valencia` - Recepcionista Virtual
2. `asesora-imagen` - Asesora de Imagen Personal
3. `instructora-fitness` - Instructora de Fitness
4. **`dev-fullstack`** - ⭐ **DESARROLLADORA FULL STACK** (EL QUE NECESITAMOS ACTIVAR)
5. `marketing-digital` - Marketing Digital
6. `community-manager` - Community Manager
7. `instructora-idiomas` - Instructora de Idiomas
8. `psicologa-apoyo` - Psicóloga de Apoyo
9. `sexologa-educativa` - Sexóloga Educativa
10. `finanzas-personales` - Finanzas Personales
11. `yoga-mindfulness` - Yoga y Mindfulness
12. `abogada-orientadora` - Abogada Orientadora
13. `cripto-experta` - Experta en Criptomonedas
14. `creadora-contenido` - Creadora de Contenido
15. `asistente-investigacion` - Asistente de Investigación
16. `logistica-organizacion` - Logística y Organización
17. `analista-ia-tech` - Analista de IA y Tecnología
18. `coach-emprendimiento` - Coach de Emprendimiento

---

## ✅ PLAN DE INTEGRACIÓN

### **Paso 1**: Copiar `sandra-prompts.js` al proyecto
- Ubicación origen: `C:\Users\clayt\IA-SANDRA\netlify\functions\shared\sandra-prompts.js`
- Ubicación destino: `extracted_app/orchestrator/sandra-prompts.js`

### **Paso 2**: Modificar `brain.getSystemPrompt()`
- Importar `buildSystemPrompt` desde `sandra-prompts.js`
- Detectar rol automáticamente o usar contexto
- Activar especialmente `dev-fullstack` cuando sea necesario

### **Paso 3**: Mejorar `brain.detectIntent()`
- Añadir detección de roles además de intenciones
- Detectar cuando el usuario necesita ayuda de desarrolladora

### **Paso 4**: Integrar en `brain.processMessage()`
- Pasar información de rol al contexto
- Permitir cambio de rol dinámico según necesidad

---

## 🚀 RESULTADO ESPERADO

Después de la integración:
- ✅ Sandra tendrá acceso a los 18 roles
- ✅ Activación automática del rol `dev-fullstack` cuando se necesite
- ✅ Respuestas más especializadas según el contexto
- ✅ Personalidad y expertise por rol mantenidos
- ✅ Compatibilidad con sistema actual (no rompe nada)

---

**Fecha de análisis**: $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Estado**: 🔴 Pendiente de integración
