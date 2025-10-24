# 🔌 CONEXIÓN API ANTHROPIC - SANDRA PROFESSIONAL

## ✅ ESTADO ACTUAL

**Backend actualizado con:**
- ✓ SDK Anthropic instalado
- ✓ Cliente Claude Sonnet 4.5 inicializado
- ✓ Endpoint `/api/claude` creado
- ✓ Health check actualizado
- ✓ Test de verificación listo

---

## 🔑 PASO 1: OBTENER TU API KEY

1. **Ve a**: https://console.anthropic.com/settings/keys
2. **Inicia sesión** con tu cuenta Anthropic
3. **Click en** "Create Key"
4. **Copia** la API key que te dan
5. **IMPORTANTE**: Guárdala, no se mostrará de nuevo

---

## 📝 PASO 2: CONFIGURAR .ENV

Abre el archivo `.env` y reemplaza:

```env
ANTHROPIC_API_KEY=TU_API_KEY_AQUI
```

Por tu API key real:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxx
```

**Guarda el archivo.**

---

## 🧪 PASO 3: PROBAR LA CONEXIÓN

En la carpeta del proyecto ejecuta:

```bash
node test-anthropic.js
```

**Si todo está bien verás**:
```
✅ RESPUESTA DE CLAUDE:
──────────────────────────────────────────────────
Antropic API conectada correctamente
──────────────────────────────────────────────────
✨ TEST COMPLETADO EXITOSAMENTE
```

---

## 🚀 PASO 4: INICIAR EL BACKEND

```bash
cd backend
node server.js
```

**Debe mostrar**:
```
🚀 Sandra Professional Backend
📡 Servidor activo en http://localhost:5000
✅ Servicios conectados:
   - OpenAI (GPT-4o)
   - Anthropic (Claude Sonnet 4.5)
   - HeyGen (Avatar)
```

---

## 🎯 USO DE LOS ENDPOINTS

### Endpoint Claude (razonamiento avanzado)
```javascript
POST http://localhost:5000/api/claude

Body:
{
  "message": "Hola Sandra",
  "mode": "professional"  // o "development" para tareas técnicas
}
```

### Endpoint GPT-4o (conversación rápida)
```javascript
POST http://localhost:5000/api/chat

Body:
{
  "message": "Hola Sandra"
}
```

---

## 🔧 DIFERENCIAS ENTRE MODELOS

**Claude (Anthropic Sonnet 4.5)**:
- ✓ Razonamiento profundo
- ✓ Tareas de desarrollo complejas
- ✓ Análisis técnico detallado
- ✓ Código producción listo
- ✓ Máximo 8192 tokens

**GPT-4o (OpenAI)**:
- ✓ Respuestas conversacionales
- ✓ Interacciones rápidas
- ✓ Multimodal (imagen + texto)
- ✓ Chat natural

---

## ❓ PROBLEMAS COMUNES

**Error 401 (Unauthorized)**
→ API key incorrecta o no válida
→ Verifica en https://console.anthropic.com/settings/keys

**Error: Cannot find module '@anthropic-ai/sdk'**
→ Ejecuta: `npm install @anthropic-ai/sdk`

**Puerto 5000 ocupado**
→ Cambia PORT en .env a otro puerto (ej: 5001)

---

## 📊 MONITOREO

**Health Check**:
```bash
GET http://localhost:5000/health
```

**Respuesta esperada**:
```json
{
  "status": "operational",
  "services": {
    "openai": true,
    "anthropic": true,
    "heygen": true
  }
}
```

---

## ✨ PRÓXIMOS PASOS

Una vez verificado que todo funciona:
1. Iniciar frontend Electron
2. Probar widgets de chat
3. Verificar avatar HeyGen
4. Test completo end-to-end
