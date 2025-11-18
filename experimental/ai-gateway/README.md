# 🤖 AI Gateway Experimental

**Sistema aislado para llamar a modelos OpenAI y Anthropic desde tu aplicación de escritorio.**

## ✅ **CARACTERÍSTICAS**

- ✅ **100% AISLADO** - No toca tu app estable
- ✅ **Sin roles** - Llamadas directas a OpenAI/Anthropic
- ✅ **Sin subagentes** - Sin complicaciones
- ✅ **Comandos simples** - `/ai openai gpt-4.0 mensaje`
- ✅ **Activable/desactivable** - Solo funciona si lo activas

---

## 🚀 **CÓMO ACTIVAR**

### **Paso 1: Verificar que estás en la rama correcta**

```bash
git branch
# Debe mostrar: * feat/mcp-ai-gateway
```

Si no, cambia a la rama:
```bash
git checkout feat/mcp-ai-gateway
```

### **Paso 2: Verificar que las claves estén en .env.pro**

```bash
# C:\Sandra-IA-8.0-Pro\.env.pro debe tener:
OPENAI_API_KEY=tu_clave_aqui
ANTHROPIC_API_KEY=tu_clave_aqui
```

### **Paso 3: Iniciar la aplicación**

```bash
cd C:\Sandra-IA-8.0-Pro
npm start
```

**La app debe arrancar NORMALMENTE** (sin errores).

### **Paso 4: Activar comandos AI en el frontend**

1. Abre la consola DevTools (F12)
2. Ejecuta:
   ```javascript
   window.AI_COMMANDS = true;
   ```
3. Recarga la página (Ctrl+R)
4. Verás en consola: `[AI Commands] ✅ Activado`

### **Paso 5: Cargar el script de comandos**

En la consola DevTools, ejecuta:

```javascript
// Cargar el script de comandos
const script = document.createElement('script');
script.src = './experimental/ai-gateway/ai-commands.js';
document.head.appendChild(script);
```

**O mejor aún**, añade esto al HTML temporalmente (solo para pruebas):

```html
<script>
  window.AI_COMMANDS = true;
</script>
<script src="./experimental/ai-gateway/ai-commands.js"></script>
```

---

## 📝 **CÓMO USAR**

### **1. Ver modelos disponibles**

En el chat, escribe:
```
/modelos
```

**Respuesta:** Lista completa de modelos OpenAI y Anthropic disponibles.

---

### **2. Llamar a un modelo**

**Sintaxis:**
```
/ai <provider> <modelo> <tu mensaje>
```

**Ejemplos:**

**OpenAI GPT-4.0:**
```
/ai openai gpt-4.0 Necesito ayuda para optimizar código JavaScript
```

**OpenAI O3 Pro:**
```
/ai openai o3-pro Analiza esta arquitectura de microservicios
```

**Anthropic Claude Sonnet 4.5:**
```
/ai anthropic claude-sonnet-4.5 Lee el archivo services/deepgram-service.js y analízalo
```

**Anthropic Claude Opus 4.1:**
```
/ai anthropic claude-opus-4.1 Dame una estrategia completa para escalar este proyecto
```

---

## 📋 **MODELOS DISPONIBLES**

### **OpenAI:**
- `gpt-4.0` → GPT-4o general purpose
- `gpt-5-mini` → GPT-5 Mini (rápido, económico)
- `gpt-5.1-thinking` → GPT-5.1 Thinking (razonamiento)
- `gpt-5` → GPT-5 (alias para 4o)
- `o3` → O3
- `o3-pro` → O3 Pro

### **Anthropic:**
- `claude-sonnet-3.7` → Claude 3.5 Sonnet
- `claude-haiku-thinking` → Claude 3 Haiku (rápido, económico)
- `claude-opus-4.1` → Claude 3 Opus (razonamiento avanzado)
- `claude-sonnet-4.5` → Claude 3.5 Sonnet (alias)

---

## 🔧 **ARQUITECTURA**

```
Frontend (chat)
  ↓
window.sandraAPI.aiChat()
  ↓
IPC: ai:chat
  ↓
Main Process: ipcMain.handle('ai:chat')
  ↓
experimental/ai-gateway/gateway.js
  ↓
OpenAI API / Anthropic API
  ↓
Respuesta directa al frontend
```

**SIN pasar por:**
- ❌ Sistema de roles
- ❌ Subagentes
- ❌ CallCenter
- ❌ Multimodal conversation service

---

## 🛠️ **TROUBLESHOOTING**

### **Error: "AI Gateway experimental no disponible"**

**Causa:** El gateway no se cargó correctamente.

**Solución:**
1. Verifica que `experimental/ai-gateway/gateway.js` existe
2. Revisa los logs del backend para ver el error exacto
3. Verifica que las claves API estén en `.env.pro`

---

### **Error: "OPENAI_API_KEY no configurada"**

**Causa:** Falta la clave en `.env.pro`.

**Solución:**
```bash
# Añadir en C:\Sandra-IA-8.0-Pro\.env.pro
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

### **Error: "API de IA no disponible"**

**Causa:** El script `ai-commands.js` no se cargó o `window.sandraAPI` no existe.

**Solución:**
1. Verifica que ejecutaste `window.AI_COMMANDS = true;`
2. Verifica que el script se cargó: `console.log(window.sandraAPI)`
3. Recarga la página

---

### **El comando /ai no hace nada**

**Causa:** El script `ai-commands.js` no está interceptando los mensajes.

**Solución:**
1. Verifica en consola: `[AI Commands] ✅ Activado`
2. Verifica que el input del chat se encontró: `[AI Commands] ✅ Input encontrado`
3. Verifica que los listeners se instalaron: `[AI Commands] ✅ Listeners instalados`

---

## 🎯 **PRÓXIMOS PASOS (OPCIONAL)**

### **1. Integrar herramientas MCP**

Actualmente los modelos NO tienen acceso a herramientas (filesystem, git, etc.).

Para añadirlas:
- Modificar `experimental/ai-gateway/gateway.js`
- Añadir `tools` al request de OpenAI/Anthropic
- Implementar función `invokeMCPTool()` que llame a `http://localhost:3001/api/tools/invoke`

### **2. Hacer merge a main**

Si todo funciona bien y te gusta:

```bash
git checkout main
git merge feat/mcp-ai-gateway
git push origin main
```

### **3. Eliminar si no te gusta**

Si no funciona o no te gusta:

```bash
git checkout main
git branch -D feat/mcp-ai-gateway
# La app vuelve exactamente como estaba antes
```

---

## ✅ **RESUMEN**

1. ✅ Estás en rama `feat/mcp-ai-gateway`
2. ✅ Claves API en `.env.pro`
3. ✅ App arranca normalmente
4. ✅ Activas `window.AI_COMMANDS = true;`
5. ✅ Cargas `ai-commands.js`
6. ✅ Usas `/ai openai gpt-4.0 mensaje`

**¡LISTO!** 🎉

