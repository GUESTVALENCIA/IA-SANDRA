# 🚀 CONFIGURAR SONNET 4.5+ EN CURSOR

## 📋 **PASOS RÁPIDOS**

### **1. Iniciar el Servidor MCP**

Ejecuta uno de estos comandos:

**Opción A - Script Batch:**
```batch
cd C:\Sandra-IA-8.0-Pro
INICIAR_SONNET_MCP.bat
```

**Opción B - NPM:**
```bash
npm run start:sonnet-mcp
```

**Opción C - Node Directo:**
```bash
node mcp-server/mcp-sonnet-full-access.js
```

### **2. Verificar que el Servidor Funciona**

Abre otra terminal y ejecuta:
```bash
curl http://localhost:3001/health
```

Deberías ver:
```json
{
  "status": "healthy",
  "protocol": "mcp",
  "version": "1.0.0",
  "capabilities": { ... },
  "tokens": 15
}
```

### **3. Configurar Cursor para Sonnet**

#### **En Cursor:**
1. Abre **Settings** (`Ctrl+,`)
2. Ve a **Features** > **Model Context Protocol** (MCP)
3. O busca directamente "MCP" en settings

#### **Añade esta configuración:**

```json
{
  "mcpServers": {
    "sandra-full-access": {
      "command": "node",
      "args": [
        "C:\\Sandra-IA-8.0-Pro\\mcp-server\\mcp-sonnet-full-access.js"
      ],
      "env": {
        "MCP_PORT": "3001",
        "MCP_SECRET_KEY": "sandra_mcp_ultra_secure_2025"
      }
    }
  }
}
```

#### **Guardar y Reiniciar:**
- Guarda la configuración
- **Reinicia Cursor** completamente (`Ctrl+Shift+P` > "Reload Window" o cierra y abre de nuevo)

### **4. Usar Sonnet 4.5+**

#### **Opción A - Nueva Ventana (RECOMENDADO):**
1. Abre nueva ventana: `File > New Window` o `Ctrl+Shift+N`
2. En esa ventana, selecciona **Sonnet 4.5** como modelo
3. Sonnet tendrá acceso completo a través del MCP

#### **Opción B - Misma Ventana:**
1. En esta ventana, cambia el modelo a **Sonnet 4.5** (selector superior)
2. Sonnet también tendrá acceso completo

### **5. Verificar que Sonnet Tiene Acceso**

Cuando uses Sonnet, puedes preguntarle:
- "¿Puedes listar los archivos en C:\Sandra-IA-8.0-Pro?"
- "¿Cuáles son los tokens disponibles?"
- "¿Puedes hacer un commit en el repositorio?"

Sonnet debería poder acceder a todo automáticamente.

---

## ✅ **VERIFICACIÓN RÁPIDA**

### **Checklist:**
- [ ] Servidor MCP corriendo en `http://localhost:3001`
- [ ] Configuración MCP añadida en Cursor
- [ ] Cursor reiniciado
- [ ] Sonnet 4.5 seleccionado como modelo
- [ ] Sonnet puede acceder a archivos/tokens

---

## 🎯 **LO QUE SONNET PUEDE HACER**

Con el MCP configurado, Sonnet puede:

✅ **Leer y escribir archivos** en tu sistema
✅ **Navegar carpetas** completas
✅ **Hacer commits y push** a GitHub
✅ **Deploy proyectos** a Vercel
✅ **Usar todas tus APIs** (Groq, Deepgram, Cartesia, etc.)
✅ **Ejecutar comandos** del sistema
✅ **Acceder a todos los tokens** del `.env.pro`

---

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **El servidor no inicia:**
- Verifica que el puerto 3001 no esté ocupado
- Verifica que todas las dependencias estén instaladas: `npm install`

### **Sonnet no se conecta:**
- Verifica que el servidor esté corriendo (`curl http://localhost:3001/health`)
- Verifica que la ruta en la configuración sea correcta
- Reinicia Cursor completamente

### **Sonnet no encuentra archivos:**
- El servidor MCP debe estar corriendo ANTES de usar Sonnet
- Verifica que `.env.pro` exista y tenga los tokens

---

## 📞 **SIGUIENTE PASO**

Una vez configurado:
1. **Esta ventana**: Seguimos trabajando juntos aquí
2. **Nueva ventana**: Abre Sonnet 4.5 allí con acceso completo
3. **Ambas funcionan**: Independientes y con acceso total

¡Listo para trabajar con Sonnet! 🚀

