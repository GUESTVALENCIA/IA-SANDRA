# 🎤 INTEGRACIÓN DE PROGRAMACIÓN POR VOZ - DOCUMENTACIÓN

## ✅ INTEGRACIÓN COMPLETADA

### **Componentes Integrados:**

1. **✅ Módulo de Programación por Voz** (`voice-programming.js`)
   - Procesamiento de comandos de voz
   - Detección de acciones y entidades
   - Generación de código
   - Feedback por voz

2. **✅ Núcleo de Sandra** (`sandra-nucleus-core.js`)
   - Inicialización automática del módulo
   - Integración con STT/TTS existente
   - Endpoints API para voice commands

3. **✅ Orquestador** (`sandra-orchestrator.js`)
   - Servicio `nucleus` añadido
   - Método `processVoiceCommand()` implementado
   - Integración con historial y métricas

4. **✅ Main Process** (`main.js`)
   - Handler IPC `voice-command` añadido
   - Handler IPC `voice-programming-status` añadido
   - Soporte para diferentes formatos de audio

---

## 🔌 CÓMO USAR

### **Desde el Frontend (Electron IPC)**

```javascript
// Procesar comando de voz
const { ipcRenderer } = require('electron');

async function processVoiceCommand(audioBuffer) {
  try {
    const result = await ipcRenderer.invoke('voice-command', audioBuffer, {
      conversationId: 'unique-id',
      includeVoice: true
    });
    
    console.log('Comando procesado:', result);
    // result contiene:
    // - success: boolean
    // - command: texto del comando reconocido
    // - parsedCommand: comando parseado
    // - generatedCode: código generado
    // - applied: si se aplicó el código
    // - message: mensaje de feedback
    // - audio: audio de feedback (si includeVoice)
    
    return result;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Obtener estado
async function getVoiceProgrammingStatus() {
  const status = await ipcRenderer.invoke('voice-programming-status');
  return status;
}
```

### **Desde API HTTP** (si el servidor está corriendo)

```javascript
// POST /api/voice-command
fetch('http://localhost:7777/api/voice-command', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    audio: audioBuffer.toString('base64') // o directamente como buffer
  })
})
.then(res => res.json())
.then(result => {
  console.log('Resultado:', result);
});

// GET /api/voice-programming/status
fetch('http://localhost:7777/api/voice-programming/status')
.then(res => res.json())
.then(status => {
  console.log('Estado:', status);
});
```

---

## 🎯 FLUJO COMPLETO

```
┌─────────────────────────────────────┐
│  1. Usuario habla comando           │
│     "Crea una función suma"         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. Frontend captura audio          │
│     (MediaRecorder API)             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. IPC: voice-command              │
│     main.js → orchestrator          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. Orchestrator.processVoiceCommand│
│     → SandraNucleus.voiceProgramming│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. VoiceProgramming Module         │
│     a) STT (Deepgram)               │
│     b) Parse Command                │
│     c) Generate Code (GPT-4o)       │
│     d) Apply Code                   │
│     e) TTS Feedback (Cartesia)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  6. Response al Frontend            │
│     - Código generado               │
│     - Audio de confirmación         │
│     - Estado de aplicación          │
└─────────────────────────────────────┘
```

---

## 📋 EJEMPLOS DE COMANDOS

### **Comandos Soportados:**

1. **Crear función**:
   ```
   "Crea una función llamada suma que reciba dos números"
   "Implementa una función que calcule el promedio"
   "Añade una función para validar email"
   ```

2. **Modificar código**:
   ```
   "Modifica la función X para que haga Y"
   "Cambia la función suma para que también reste"
   ```

3. **Obtener datos**:
   ```
   "Tráeme los datos del archivo config.json"
   "Lee el contenido del archivo X"
   ```

4. **Añadir estructura**:
   ```
   "Añade un bucle for que recorra el array"
   "Crea una clase llamada Usuario"
   "Implementa un if que verifique X"
   ```

---

## 🛠️ CONFIGURACIÓN REQUERIDA

### **Variables de Entorno:**

```env
# APIs necesarias (ya configuradas)
OPENAI_API_KEY=sk-...          # Para generación de código
DEEPGRAM_API_KEY=...            # Para STT
CARTESIA_API_KEY=...            # Para TTS

# Opcional: Configuración del servidor
PORT=7777                       # Puerto del servidor Express
WS_PORT=7778                    # Puerto del WebSocket
```

---

## 📊 ESTADO Y MONITOREO

### **Verificar Estado:**

```javascript
const status = await ipcRenderer.invoke('voice-programming-status');
// Retorna:
// {
//   available: true/false,
//   listening: true/false,
//   commandHistory: number
// }
```

### **Logs del Sistema:**

El sistema genera logs en cada etapa:
- `[VOICE] Comando reconocido: ...`
- `[VOICE] Comando parseado: ...`
- `[VOICE] Código generado`
- `[VOICE-COMMAND] Procesando comando de voz...`

---

## 🔧 TROUBLESHOOTING

### **Problema: "Voice programming not available"**

**Causas posibles**:
1. Sandra Nucleus no se inicializó correctamente
2. Módulo de programación por voz no está disponible

**Solución**:
```javascript
// Verificar estado del servicio
const status = await ipcRenderer.invoke('voice-programming-status');
console.log(status);
```

### **Problema: "Invalid audio buffer format"**

**Causas posibles**:
1. Audio no está en formato correcto
2. Buffer no se convirtió correctamente

**Solución**:
```javascript
// Asegurar que el audio es un Buffer
let audioBuffer;
if (audioBuffer instanceof ArrayBuffer) {
  audioBuffer = Buffer.from(audioBuffer);
} else if (typeof audioBuffer === 'string') {
  audioBuffer = Buffer.from(audioBuffer, 'base64');
}
```

---

## 🚀 PRÓXIMOS PASOS

### **Mejoras Pendientes**:

1. **Aplicación Real de Código**:
   - [ ] Insertar código en archivos reales
   - [ ] Validar sintaxis antes de aplicar
   - [ ] Crear backups automáticos

2. **Mejora de Parsing**:
   - [ ] Soporte para comandos más complejos
   - [ ] Detección de contexto del proyecto
   - [ ] Identificación de archivos específicos

3. **Interfaz de Usuario**:
   - [ ] Botón de grabación de voz
   - [ ] Visualización de código generado
   - [ ] Confirmación antes de aplicar

4. **Testing**:
   - [ ] Tests unitarios
   - [ ] Tests de integración
   - [ ] Tests de comandos de voz

---

## 📝 NOTAS TÉCNICAS

### **Dependencias**:
- ✅ Deepgram (STT) - Ya integrado
- ✅ Cartesia (TTS) - Ya integrado
- ✅ OpenAI GPT-4o (Generación) - Ya integrado
- ✅ Sandra Nucleus - Ya integrado

### **Arquitectura**:
- Modular: Cada componente es independiente
- Resiliente: Manejo de errores en cada capa
- Extensible: Fácil añadir nuevas funcionalidades

---

**Fecha de integración**: $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Estado**: ✅ Integración completa - Listo para testing

