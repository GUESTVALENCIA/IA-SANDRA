# 🚀 ACTIVAR COMANDOS AI - GUÍA RÁPIDA

## ✅ **PASO 1: La app ya está abierta**

Si ves los logs:
```
✅ Electron app ready
✅ AIGateway disponible: true
✅ Ventana lista, mostrando...
```

**¡La app está funcionando!** 🎉

---

## 🎯 **PASO 2: Activar comandos AI**

### **Opción A: Desde la consola DevTools (F12)**

1. Abre DevTools (F12 o clic derecho → Inspeccionar)
2. Ve a la pestaña **Console**
3. Ejecuta estos comandos:

```javascript
// 1. Activar comandos AI
window.AI_COMMANDS = true;

// 2. Cargar el script
const script = document.createElement('script');
script.src = './experimental/ai-gateway/ai-commands.js';
document.head.appendChild(script);

// 3. Recargar la página
location.reload();
```

### **Opción B: Añadir al HTML (temporal)**

Edita `desktop-app/renderer/index.html` y añade antes del `</head>`:

```html
<script>
  window.AI_COMMANDS = true;
</script>
<script src="./experimental/ai-gateway/ai-commands.js"></script>
```

Luego recarga la app.

---

## 📝 **PASO 3: Probar comandos**

En el chat de Sandra, escribe:

### **Ver modelos disponibles:**
```
/modelos
```

### **Llamar a OpenAI:**
```
/ai openai gpt-4.0 Hola, ¿qué tal?
```

### **Llamar a Anthropic:**
```
/ai anthropic claude-sonnet-4.5 Analiza este sistema
```

---

## 🔍 **VERIFICACIÓN**

Si todo funciona, verás en la consola:
```
[AI Commands] ✅ Activado
[AI Commands] ✅ Input encontrado
[AI Commands] ✅ Listeners instalados
```

Y cuando uses `/ai`, verás:
```
⏳ Llamando a OPENAI gpt-4.0...
🤖 OPENAI gpt-4.0

[Respuesta del modelo aquí]
```

---

## ❌ **SI NO FUNCIONA**

### **Error: "API de IA no disponible"**

Verifica que el MCP esté corriendo:
```javascript
// En la consola DevTools
fetch('http://localhost:3001/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### **Error: "AI Gateway experimental no disponible"**

Verifica que el archivo existe:
```javascript
// En la consola DevTools
fetch('./experimental/ai-gateway/gateway.js')
  .then(r => console.log('✅ Existe'))
  .catch(e => console.error('❌ No existe:', e));
```

---

## ✅ **RESUMEN**

1. ✅ App abierta (logs lo confirman)
2. ⏳ Activar `window.AI_COMMANDS = true`
3. ⏳ Cargar `ai-commands.js`
4. ⏳ Probar `/modelos` y `/ai`

**¡Ya puedes usar tus modelos de IA!** 🎉

