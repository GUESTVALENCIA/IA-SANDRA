# 🤖 WORKFLOW: Uso de Modelos IA desde Sandra Desktop

## 📦 ¿QUÉ ESTÁ INSTALADO?

### ✅ Modelos OpenAI Disponibles
- **gpt-4.0** → GPT-4o general purpose
- **gpt-5-mini** → GPT-5 Mini (rápido, económico)
- **gpt-5.1-thinking** → GPT-5.1 Thinking (razonamiento)
- **gpt-5** → GPT-5 (alias para 4o)
- **o3** → O3 (alias para 4o)
- **o3-pro** → O3 Pro (alias para 4o)

### ✅ Modelos Anthropic Disponibles
- **claude-sonnet-3.7** → Claude 3.5 Sonnet
- **claude-haiku-thinking** → Claude 3 Haiku (rápido, económico)
- **claude-opus-4.1** → Claude 3 Opus (razonamiento avanzado)
- **claude-sonnet-4.5** → Claude 3.5 Sonnet (alias)

### ✅ Herramientas MCP Completas
El MCP tiene acceso total a:
- **Filesystem** (leer, escribir, listar archivos locales)
- **Git** (status, commit, pull, push en tu repo)
- **HTTP** (fetch URLs externas)
- **AI Gateway** (llamar a OpenAI y Anthropic con tus claves)

---

## 🎯 CÓMO USAR LOS MODELOS DESDE EL CHAT

### 1️⃣ Ver Todos los Modelos Disponibles

Escribe en el chat de Sandra:

```
/modelos
```

o

```
/models
```

**Respuesta:** Sandra te mostrará todos los modelos OpenAI y Anthropic disponibles con sus alias y descripciones.

---

### 2️⃣ Llamar a un Modelo Específico

**Sintaxis:**
```
/ai <provider> <modelo> <tu mensaje>
```

**Ejemplos:**

**OpenAI GPT-4.0:**
```
/ai openai gpt-4.0 Necesito ayuda para optimizar este código JavaScript
```

**OpenAI O3 Pro:**
```
/ai openai o3-pro Analiza esta arquitectura de microservicios y dame recomendaciones
```

**Anthropic Claude Sonnet 4.5:**
```
/ai anthropic claude-sonnet-4.5 Revisa este sistema conversacional y encuentra bugs
```

**Anthropic Claude Opus 4.1:**
```
/ai anthropic claude-opus-4.1 Dame una estrategia completa para escalar este proyecto
```

---

### 3️⃣ Usar Sandra Normalmente (Sin Comandos)

Si escribes un mensaje normal (sin `/ai` ni `/modelos`), Sandra responderá usando el **rol actual** y el sistema por defecto.

**Ejemplo:**
```
Hola Sandra, ¿cómo está el sistema?
```

**Respuesta:** Sandra usará el rol que tengas seleccionado (concierge, developer, etc.) y responderá según su configuración.

---

## ⚙️ CONFIGURACIÓN AUTOMÁTICA (PRÓXIMO PASO)

Una vez que pruebes manualmente los modelos, podemos configurar:

### 🎯 Enrutamiento Automático por Tipo de Tarea

**Ejemplo de configuración futura:**

```javascript
// En roles-system.js o en un nuevo archivo de orquestación

const autoRouting = {
  // Tareas de código → O3 Pro (razonamiento profundo)
  code: { provider: 'openai', model: 'o3-pro' },
  
  // Análisis de arquitectura → Claude Opus 4.1 (pensamiento complejo)
  architecture: { provider: 'anthropic', model: 'claude-opus-4.1' },
  
  // Chat rápido/FAQ → GPT-5 Mini (económico)
  quick: { provider: 'openai', model: 'gpt-5-mini' },
  
  // Análisis de código → Claude Sonnet 4.5 (excelente para código)
  review: { provider: 'anthropic', model: 'claude-sonnet-4.5' },
  
  // Tareas generales → GPT-4.0 (balanceado)
  general: { provider: 'openai', model: 'gpt-4.0' }
};
```

### 🔄 Detección Automática

Sandra podría detectar automáticamente qué modelo usar según:
- **Palabras clave:** "analiza código" → Claude Sonnet
- **Complejidad:** mensaje largo + técnico → O3 Pro
- **Velocidad:** pregunta simple → GPT-5 Mini
- **Rol activo:** developer → Claude, concierge → GPT-4.0

---

## 🛠️ HERRAMIENTAS MCP QUE LOS MODELOS PUEDEN USAR

Cuando llamas a un modelo con `/ai`, ese modelo tiene acceso a:

### 📁 Filesystem
- **filesystem_read:** Leer cualquier archivo de tu proyecto
- **filesystem_write:** Escribir/modificar archivos
- **filesystem_list:** Listar contenidos de carpetas

### 🔧 Git
- **git_status:** Ver estado del repo
- **git_commit:** Hacer commits
- **git_pull:** Actualizar desde GitHub
- **git_push:** Subir cambios

### 🌐 HTTP
- **http_fetch:** Hacer peticiones GET/POST a APIs externas

### 🤖 AI Models
- **ai_model_list:** Listar modelos disponibles
- **openai_chat:** Llamar a modelos OpenAI
- **anthropic_chat:** Llamar a modelos Anthropic
- **ai_chat:** Llamada unificada a ambos

---

## 📊 ENDPOINTS REST DEL MCP

### Ver Herramientas Disponibles
```
GET http://localhost:3000/api/tools
```

**Respuesta:** JSON con todas las herramientas, sus esquemas y parámetros.

### Invocar una Herramienta
```
POST http://localhost:3000/api/tools/invoke
Content-Type: application/json

{
  "tool": "filesystem_read",
  "arguments": {
    "path": "services/deepgram-service.js"
  }
}
```

### Ver Logs de Invocaciones
```
GET http://localhost:3000/api/tools/logs
```

**Respuesta:** Historial de todas las llamadas a herramientas con timestamps.

---

## 🎓 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Analizar un Archivo con Claude
```
/ai anthropic claude-sonnet-4.5 Lee el archivo services/deepgram-service.js y dime qué errores tiene
```

**Sandra ejecutará:**
1. Llamar a Claude Sonnet 4.5
2. Claude usará `filesystem_read` para leer el archivo
3. Claude analizará el código
4. Te devolverá los errores encontrados

---

### Ejemplo 2: Hacer un Commit con O3 Pro
```
/ai openai o3-pro Haz un commit con todos los cambios actuales del proyecto, usa un mensaje descriptivo
```

**Sandra ejecutará:**
1. Llamar a O3 Pro
2. O3 usará `git_status` para ver qué cambió
3. O3 usará `git_commit` con un mensaje auto-generado
4. Te confirmará el commit

---

### Ejemplo 3: Análisis Completo del Sistema
```
/ai anthropic claude-opus-4.1 Analiza todo el sistema conversacional, lee los archivos necesarios y dame un informe completo
```

**Sandra ejecutará:**
1. Claude Opus leerá múltiples archivos (multimodal-conversation-service, deepgram-service, etc.)
2. Analizará la arquitectura completa
3. Te dará un informe detallado con recomendaciones

---

## ⚡ PRÓXIMOS PASOS

### 1. Prueba Manual (AHORA)
- Escribe `/modelos` en el chat
- Prueba llamar a 2-3 modelos diferentes
- Observa cuál te gusta más para cada tipo de tarea

### 2. Configuración de Roles (DESPUÉS)
Una vez que sepas qué modelo usar para qué:
- Te creo un archivo `model-orchestration.js`
- Configuramos reglas de enrutamiento automático
- Sandra elegirá el modelo perfecto para cada tarea sin comandos

### 3. Permisos Extendidos (OPCIONAL)
Si necesitas más herramientas:
- Email (enviar/recibir)
- Database (consultas SQL)
- WhatsApp API (enviar mensajes)
- Stripe (procesar pagos)
- Lo que necesites...

---

## 🔐 SEGURIDAD

✅ **Tus claves están seguras:**
- `OPENAI_API_KEY` y `ANTHROPIC_API_KEY` solo están en `.env.pro`
- No se exponen en frontend
- Solo el MCP backend las usa

✅ **Control total:**
- Los modelos solo acceden a lo que el MCP les permite
- Puedes auditar todas las llamadas en `/api/tools/logs`
- Los archivos solo se modifican si lo autorizas

---

## 📞 SOPORTE

Si algo no funciona:
1. Verifica que el MCP esté corriendo: `http://localhost:3000/health`
2. Revisa que las claves estén en `.env.pro`
3. Mira los logs del backend en la consola de Electron

---

**🎉 ¡YA PUEDES USAR TODOS TUS MODELOS DE IA DESDE TU APLICACIÓN!**

Empieza escribiendo `/modelos` en el chat.

