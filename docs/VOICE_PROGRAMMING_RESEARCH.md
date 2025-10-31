# 🎤 PROGRAMACIÓN POR VOZ - INVESTIGACIÓN E IMPLEMENTACIÓN

## 📋 OBJETIVO

Implementar capacidad de programación por voz en Sandra, similar a Cursor 2.0, donde el usuario puede dar comandos de voz que se conviertan en código ejecutable.

---

## 🔍 INVESTIGACIÓN

### **Referencia Principal: Cursor 2.0**

Según [Brais Moure en LinkedIn](https://es.linkedin.com/posts/braismoure_ufff-cursor-acaba-de-lanzar-la-versi%C3%B3n-activity-7389341821996539905-3bAA):

> "Cursor acaba de lanzar la versión 2.0! → Con su propio modelo para desarrollo llamado Composer. → Una nueva interfaz multi-agente para ejecutar en paralelo y comparar resultados. → Navegador integrado para ejecutar y probar código. → Y permite programar con voz."

**Ejemplos mencionados**:
- "Haz un bucle de tal, y lo añada"
- "Tráeme los datos del repositorio con el método X"

---

## 🎯 CASOS DE USO

### **1. Comandos Estructurales**
- Crear funciones/clases
- Añadir bucles/condicionales
- Modificar estructura de código

### **2. Comandos de Datos**
- Obtener datos de APIs
- Leer archivos
- Consultar bases de datos

### **3. Comandos de Navegación**
- Abrir archivos
- Ir a líneas específicas
- Buscar funciones

### **4. Comandos de Refactorización**
- Renombrar variables
- Extraer funciones
- Optimizar código

---

## 🏗️ ARQUITECTURA PROPUESTA

```
┌─────────────────────────────────────────────────┐
│   USUARIO HABLA                                  │
│   "Crea una función que sume dos números"       │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│   DEEPGRAM STT                                  │
│   Conversión: Voz → Texto                      │
│   "crea una función que sume dos números"      │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│   PROCESADOR DE COMANDOS                        │
│   - Detección de intención                      │
│   - Extracción de entidades                     │
│   - Parseo de estructura                        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│   GENERADOR DE CÓDIGO (GPT-4o)                 │
│   - Contexto del proyecto                       │
│   - Generación de código                        │
│   - Validación de sintaxis                      │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│   APLICADOR DE CÓDIGO                           │
│   - Insertar código en archivo                 │
│   - Validar sintaxis                            │
│   - Ejecutar tests (opcional)                   │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│   FEEDBACK POR VOZ (CARTESIA TTS)              │
│   "Función creada exitosamente"                 │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ COMPONENTES TÉCNICOS

### **1. Speech-to-Text (STT)**
**Tecnología**: Deepgram (ya integrado)
- ✅ API configurada
- ✅ Reconocimiento en tiempo real
- ✅ Soporte múltiples idiomas

**Mejoras necesarias**:
- [ ] Filtrado de ruido
- [ ] Detección de finalización de frase
- [ ] Manejo de comandos parciales

### **2. Procesador de Comandos**
**Nuevo componente a desarrollar**

**Funcionalidades**:
- Detectar tipo de comando (crear, modificar, obtener)
- Extraer entidades (nombres de funciones, variables, archivos)
- Parsear estructura del comando

**Ejemplo de parsing**:
```
Input: "Crea una función llamada sumar que reciba dos números y devuelva la suma"

Output: {
  action: "create",
  type: "function",
  name: "sumar",
  parameters: ["número", "número"],
  return: "suma",
  body: "devolver suma de parámetros"
}
```

### **3. Generador de Código**
**Tecnología**: OpenAI GPT-4o (ya integrado)
- ✅ API configurada
- ✅ Contexto de conversación
- ✅ Generación de código

**Mejoras necesarias**:
- [ ] Contexto del proyecto actual
- [ ] Estilo de código del proyecto
- [ ] Librerías disponibles

### **4. Aplicador de Código**
**Nuevo componente a desarrollar**

**Funcionalidades**:
- Localizar archivo objetivo
- Insertar código en posición correcta
- Validar sintaxis antes de aplicar
- Crear backups

### **5. Text-to-Speech (TTS)**
**Tecnología**: Cartesia (ya integrado)
- ✅ API configurada
- ✅ Voz natural
- ✅ Múltiples voces

**Mejoras necesarias**:
- [ ] Respuestas contextuales
- [ ] Confirmaciones de acciones
- [ ] Errores verbales descriptivos

---

## 📝 GRAMÁTICA DE COMANDOS

### **Estructura General**:
```
[ACCIÓN] [TIPO] [NOMBRE] [PARÁMETROS] [CONDICIONES]
```

### **Ejemplos**:

1. **Crear función**:
   ```
   "Crea una función llamada X que haga Y"
   "Añade una función X"
   "Implementa X"
   ```

2. **Modificar código**:
   ```
   "Modifica la función X para que haga Y"
   "Cambia X por Y"
   "Reemplaza X con Y"
   ```

3. **Obtener datos**:
   ```
   "Tráeme los datos de X"
   "Obtén información de X"
   "Lee el archivo X"
   ```

4. **Añadir estructura**:
   ```
   "Añade un bucle for"
   "Crea una clase llamada X"
   "Implementa un if que verifique X"
   ```

5. **Navegar**:
   ```
   "Abre el archivo X"
   "Ve a la línea X"
   "Muéstrame la función X"
   ```

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **Archivo: `extracted_app/orchestrator/voice-programming.js`**

```javascript
class VoiceProgramming {
  constructor() {
    this.stt = null; // Deepgram
    this.tts = null; // Cartesia
    this.commandProcessor = new CommandProcessor();
    this.codeGenerator = new CodeGenerator();
    this.codeApplier = new CodeApplier();
  }

  async processVoiceCommand(audioBuffer) {
    // 1. STT
    const text = await this.stt.process(audioBuffer);
    
    // 2. Procesar comando
    const command = await this.commandProcessor.parse(text);
    
    // 3. Generar código
    const code = await this.codeGenerator.generate(command);
    
    // 4. Aplicar código
    const result = await this.codeApplier.apply(code);
    
    // 5. Feedback por voz
    await this.tts.speak(result.message);
    
    return result;
  }
}
```

### **Archivo: `extracted_app/orchestrator/command-processor.js`**

```javascript
class CommandProcessor {
  parse(text) {
    // Detectar acción
    const action = this.detectAction(text);
    
    // Extraer entidades
    const entities = this.extractEntities(text);
    
    // Parsear estructura
    const structure = this.parseStructure(text);
    
    return {
      action,
      entities,
      structure,
      original: text
    };
  }

  detectAction(text) {
    const actions = {
      create: ['crea', 'añade', 'implementa', 'agrega'],
      modify: ['modifica', 'cambia', 'reemplaza', 'actualiza'],
      get: ['trae', 'obtén', 'lee', 'consulta'],
      delete: ['elimina', 'borra', 'quita'],
      navigate: ['abre', 've a', 'muestra', 'ir a']
    };

    for (const [action, keywords] of Object.entries(actions)) {
      if (keywords.some(k => text.toLowerCase().includes(k))) {
        return action;
      }
    }
    
    return 'general';
  }

  extractEntities(text) {
    // Extraer nombres de funciones, variables, archivos
    // Usar regex o NLP básico
    return {
      functionName: this.extractFunctionName(text),
      fileName: this.extractFileName(text),
      variables: this.extractVariables(text)
    };
  }
}
```

---

## 🧪 TESTING

### **Casos de Prueba**:

1. **Comando simple**:
   - Input: "Crea una función suma"
   - Expected: Función `suma` creada

2. **Comando complejo**:
   - Input: "Crea una función que reciba dos números y devuelva la suma"
   - Expected: Función con parámetros y return

3. **Comando con contexto**:
   - Input: "Modifica la función suma para que también reste"
   - Expected: Función modificada

4. **Comando de datos**:
   - Input: "Tráeme los datos del archivo config.json"
   - Expected: Datos del archivo

---

## 📊 ESTADO ACTUAL

### **✅ Ya Disponible**:
- Deepgram STT integrado
- Cartesia TTS integrado
- OpenAI GPT-4o para generación
- Núcleo modular

### **🚧 En Desarrollo**:
- Procesador de comandos
- Aplicador de código
- Gramática de comandos

### **⏳ Pendiente**:
- Testing exhaustivo
- Documentación de usuario
- Optimización de respuestas

---

## 🎯 PRÓXIMOS PASOS

1. **Implementar CommandProcessor básico**
2. **Crear CodeApplier con validación**
3. **Integrar con interfaz de Sandra**
4. **Testing con casos reales**
5. **Refinamiento basado en feedback**

---

**Fecha**: $(Get-Date -Format "yyyy-MM-dd HH:mm")
**Estado**: 🔬 Investigación completada - Listo para implementación

