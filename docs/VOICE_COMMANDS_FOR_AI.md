# 🎙️ COMANDOS DE VOZ PARA EL ASISTENTE IA

## 📋 PROPÓSITO

Sistema de comandos de voz que permite controlar y usar las capacidades del asistente de IA mediante comandos verbales.

---

## 🎯 TIPOS DE COMANDOS DISPONIBLES

### **1. Comandos de Búsqueda** 🔍
**Patrones**: "busca", "buscar", "encuentra", "localiza", "investiga"

**Ejemplos**:
- "Busca información sobre Node.js"
- "Investiga cómo funciona React"
- "Encuentra documentación de TypeScript"

**Acción**: Ejecuta búsqueda web o en el código

---

### **2. Comandos de Análisis** 📊
**Patrones**: "analiza", "analizar", "revisa", "examina", "check"

**Ejemplos**:
- "Analiza el archivo main.js"
- "Revisa el código de la función login"
- "Examina la estructura del proyecto"

**Acción**: Analiza código o archivos

---

### **3. Comandos de Creación** ✨
**Patrones**: "crea", "crear", "haz", "genera", "construye"

**Ejemplos**:
- "Crea un archivo config.js"
- "Haz una función que valide emails"
- "Genera un componente React"

**Acción**: Crea archivos, funciones o componentes

---

### **4. Comandos de Lectura** 📖
**Patrones**: "lee", "muestra", "trae", "obtén"

**Ejemplos**:
- "Lee el archivo package.json"
- "Muéstrame la función handleSubmit"
- "Trae el contenido del README"

**Acción**: Lee y muestra contenido de archivos

---

### **5. Comandos de Escritura/Modificación** ✏️
**Patrones**: "escribe", "modifica", "actualiza", "edita"

**Ejemplos**:
- "Modifica la función suma para que también reste"
- "Actualiza el README con nueva información"
- "Edita el archivo de configuración"

**Acción**: Modifica archivos o código

---

### **6. Comandos de Navegación** 🧭
**Patrones**: "ve a", "navega", "abre"

**Ejemplos**:
- "Ve a la línea 50 del archivo"
- "Navega al directorio de componentes"
- "Abre el archivo utils.js"

**Acción**: Navega por el proyecto

---

### **7. Comandos de Explicación** 💡
**Patrones**: "explica", "qué es", "qué significa", "dime sobre"

**Ejemplos**:
- "Explica qué es un hook en React"
- "Qué significa async await"
- "Dime sobre el patrón Observer"

**Acción**: Explica conceptos o código

---

### **8. Comandos de Ejecución** ⚡
**Patrones**: "ejecuta", "realiza", "procesa", "haz que"

**Ejemplos**:
- "Ejecuta los tests"
- "Realiza un análisis de código"
- "Procesa los datos del archivo"

**Acción**: Ejecuta tareas o procesos

---

### **9. Comandos de Resumen** 📝
**Patrones**: "resume", "resumen", "sumariza"

**Ejemplos**:
- "Resume el contenido del archivo"
- "Haz un resumen de los cambios"
- "Sumariza la documentación"

**Acción**: Genera resúmenes

---

### **10. Comandos de Comparación** ⚖️
**Patrones**: "compara", "diferencia"

**Ejemplos**:
- "Compara estas dos funciones"
- "Cuál es la diferencia entre X e Y"

**Acción**: Compara elementos

---

### **11. Comandos de Ayuda** ❓
**Patrones**: "ayuda", "qué puedes", "capacidades"

**Ejemplos**:
- "Qué puedes hacer"
- "Muéstrame tus capacidades"
- "Ayuda con comandos"

**Acción**: Muestra ayuda y capacidades disponibles

---

### **12. Comandos de Chat Normal** 💬
**Cualquier otra frase**

**Ejemplos**:
- "Hola, cómo estás"
- "Cuéntame sobre tu día"
- Conversación normal

**Acción**: Procesa como mensaje normal de chat

---

## 🔌 USO

### **Desde el Frontend (IPC)**

```javascript
const { ipcRenderer } = require('electron');

// Procesar comando de voz para el asistente
async function sendAIVoiceCommand(audioBuffer) {
  try {
    const result = await ipcRenderer.invoke('ai-voice-command', audioBuffer, {
      conversationId: 'unique-id'
    });
    
    console.log('Comando procesado:', result);
    // result contiene:
    // - success: boolean
    // - command: texto reconocido
    // - type: tipo de comando (search, analyze, create, etc.)
    // - result: resultado de la ejecución
    // - feedback: feedback por voz
    
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Obtener estado
async function getAIVoiceCommandsStatus() {
  const status = await ipcRenderer.invoke('ai-voice-commands-status');
  return status;
}
```

### **Desde API HTTP**

```javascript
// POST /api/ai-voice-command
fetch('http://localhost:7777/api/ai-voice-command', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    audio: audioBuffer.toString('base64')
  })
})
.then(res => res.json())
.then(result => {
  console.log('Resultado:', result);
});
```

---

## 🎯 FLUJO DE EJECUCIÓN

```
1. Usuario habla comando
   ↓
2. Frontend captura audio
   ↓
3. IPC: ai-voice-command
   ↓
4. Orchestrator.processAIVoiceCommand()
   ↓
5. VoiceCommandsForAI.processAICommand()
   ↓
6. STT (Deepgram) → Texto
   ↓
7. Detectar tipo de comando
   ↓
8. Ejecutar comando según tipo
   ↓
9. Generar respuesta/acción
   ↓
10. TTS (Cartesia) → Feedback por voz
   ↓
11. Response al frontend
```

---

## 📊 EJEMPLOS DE USO

### **Ejemplo 1: Buscar información**
```
Usuario: "Busca información sobre programación por voz"
↓
Sistema detecta: tipo "search"
↓
Ejecuta: búsqueda web sobre el tema
↓
Feedback: "Buscando información sobre programación por voz"
```

### **Ejemplo 2: Analizar código**
```
Usuario: "Analiza el archivo main.js"
↓
Sistema detecta: tipo "analyze"
↓
Ejecuta: lectura y análisis del archivo
↓
Feedback: "Analizando el archivo main.js"
```

### **Ejemplo 3: Crear función**
```
Usuario: "Crea una función que valide emails"
↓
Sistema detecta: tipo "create"
↓
Ejecuta: generación de código
↓
Feedback: "Creando función de validación de emails"
```

### **Ejemplo 4: Explicar concepto**
```
Usuario: "Explica qué es async await"
↓
Sistema detecta: tipo "explain"
↓
Ejecuta: explicación usando IA
↓
Feedback: "Explicando async await"
```

---

## 🛠️ CONFIGURACIÓN

### **Variables Requeridas** (ya configuradas):
```env
DEEPGRAM_API_KEY=...    # Para STT
CARTESIA_API_KEY=...    # Para TTS
OPENAI_API_KEY=...      # Para generación de respuestas
```

---

## 📈 ESTADO Y MONITOREO

### **Verificar Estado**:
```javascript
const status = await ipcRenderer.invoke('ai-voice-commands-status');
// {
//   available: true,
//   listening: false,
//   commandHistory: 5
// }
```

### **Ver Historial**:
Los comandos se guardan automáticamente en el historial del módulo.

---

## 💡 CONSEJOS DE USO

1. **Habla claro**: Pronuncia bien los comandos
2. **Sé específico**: "Analiza el archivo X" es mejor que "analiza algo"
3. **Usa comandos simples**: "Lee archivo" funciona mejor que frases complejas
4. **Confirma acciones**: El sistema te dará feedback por voz

---

## 🚀 PRÓXIMAS MEJORAS

- [ ] Reconocimiento de contexto del proyecto
- [ ] Comandos más complejos y naturales
- [ ] Aprendizaje de patrones del usuario
- [ ] Integración con herramientas específicas
- [ ] Comandos de múltiples pasos

---

**Fecha**: $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Estado**: ✅ Sistema completo - Listo para usar

