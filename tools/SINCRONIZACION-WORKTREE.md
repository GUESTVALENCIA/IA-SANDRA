# 🔄 Sincronización Automática Worktree ↔ Ejecución

## 📋 **PROBLEMA RESUELTO**

Trabajabas en **dos directorios diferentes**:
- **Worktree:** `C:\Users\clayt\.cursor\worktrees\Sandra-IA-8.0-Pro\uTqbj` (Cursor)
- **Ejecución:** `C:\Sandra-IA-8.0-Pro` (donde se ejecuta la app)

Esto causaba:
- ❌ Cambios en lugares diferentes
- ❌ Archivos desincronizados
- ❌ Caos y confusión

---

## ✅ **SOLUCIÓN: Sincronización Automática**

Sistema que sincroniza automáticamente cambios del **worktree → ejecución** en tiempo real.

---

## 🚀 **CÓMO USAR**

### **OPCIÓN 1: Script Batch (Más Fácil)**

1. **Doble clic en:**
   ```
   tools\INICIAR-SINCRONIZACION.bat
   ```

2. **Verás:**
   ```
   ═══════════════════════════════════════════════════════
   🔄 Sincronizador Worktree → Ejecución
   ═══════════════════════════════════════════════════════
   ✅ Sincronización inicial completada
   ✅ Watcher listo, observando cambios...
   💡 Presiona Ctrl+C para detener
   ```

3. **Deja la ventana abierta** - Sincroniza automáticamente

---

### **OPCIÓN 2: Desde Terminal**

```powershell
cd C:\Sandra-IA-8.0-Pro
node tools\sync-worktree.js
```

---

### **OPCIÓN 3: Desde MCP (Desde la App)**

#### **Iniciar sincronización:**
```javascript
// En DevTools de la app
fetch('http://localhost:3001/api/tools/invoke', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'sync_worktree_start',
    arguments: {}
  })
}).then(r => r.json()).then(console.log);
```

#### **Ver estado:**
```javascript
fetch('http://localhost:3001/api/tools/invoke', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'sync_worktree_status',
    arguments: {}
  })
}).then(r => r.json()).then(console.log);
```

#### **Sincronizar manualmente un archivo:**
```javascript
fetch('http://localhost:3001/api/tools/invoke', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'sync_worktree_manual',
    arguments: {
      path: 'desktop-app/main.js'
    }
  })
}).then(r => r.json()).then(console.log);
```

#### **Detener sincronización:**
```javascript
fetch('http://localhost:3001/api/tools/invoke', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tool: 'sync_worktree_stop',
    arguments: {}
  })
}).then(r => r.json()).then(console.log);
```

---

## 📁 **ARCHIVOS SINCRONIZADOS**

El sistema sincroniza automáticamente:

- ✅ `desktop-app/` (todos los archivos)
- ✅ `services/` (todos los servicios)
- ✅ `experimental/` (AI Gateway y más)
- ✅ `sandra-mcp-bridge.js`
- ✅ `config/`
- ✅ `callcenter/`

**Ignora automáticamente:**
- ❌ `node_modules/`
- ❌ `.git/`
- ❌ `.voice-cache/`
- ❌ `temp-lipsync/`
- ❌ `.env.pro`

---

## ⚙️ **CONFIGURACIÓN**

Edita `tools/sync-worktree.js` para cambiar:

```javascript
const CONFIG = {
  worktree: 'C:\\Users\\clayt\\.cursor\\worktrees\\Sandra-IA-8.0-Pro\\uTqbj',
  execution: 'C:\\Sandra-IA-8.0-Pro',
  syncPaths: [
    'desktop-app',
    'services',
    'experimental',
    // ... añade más si necesitas
  ],
  debounceMs: 500  // Espera 500ms antes de sincronizar (evita múltiples copias)
};
```

---

## 📊 **LOGS**

Verás en la consola:

```
[14:30:15] 📁 Sincronizando directorio: desktop-app
[14:30:15] 📄 Sincronizando archivo: desktop-app/main.js
[14:30:15] ✅ Sincronización completada
```

---

## 🔧 **INSTALACIÓN**

### **1. Instalar chokidar:**

```powershell
cd C:\Sandra-IA-8.0-Pro
npm install chokidar --save-dev
```

### **2. Verificar que funciona:**

```powershell
node tools\sync-worktree.js
```

Deberías ver:
```
✅ Sincronización inicial completada
✅ Watcher listo, observando cambios...
```

---

## 🎯 **WORKFLOW RECOMENDADO**

### **1. Inicia la sincronización:**

```powershell
# Opción A: Doble clic en INICIAR-SINCRONIZACION.bat
# Opción B: node tools\sync-worktree.js
```

### **2. Trabaja normalmente en Cursor:**

- Edita archivos en el worktree
- Los cambios se sincronizan automáticamente
- La app siempre tiene los últimos cambios

### **3. Ejecuta la app:**

```powershell
cd C:\Sandra-IA-8.0-Pro
npm start
```

**Todo está sincronizado automáticamente.** ✅

---

## 🛠️ **HERRAMIENTAS MCP DISPONIBLES**

### **`sync_worktree_start`**
Inicia la sincronización automática.

### **`sync_worktree_stop`**
Detiene la sincronización.

### **`sync_worktree_status`**
Obtiene el estado (corriendo o no, PID).

### **`sync_worktree_manual`**
Sincroniza manualmente un archivo/carpeta específica.

**Ejemplo:**
```json
{
  "tool": "sync_worktree_manual",
  "arguments": {
    "path": "desktop-app/renderer/index.html"
  }
}
```

---

## ⚠️ **NOTAS IMPORTANTES**

1. **Sincronización unidireccional:** Worktree → Ejecución
   - Los cambios en ejecución NO se copian al worktree
   - Siempre edita en el worktree (Cursor)

2. **Debounce:** Espera 500ms antes de sincronizar
   - Evita múltiples copias si guardas rápido
   - Si necesitas sincronización inmediata, usa `sync_worktree_manual`

3. **No sincroniza eliminaciones:** Por seguridad
   - Si eliminas un archivo en worktree, NO se elimina en ejecución
   - Elimínalo manualmente si es necesario

4. **Ignora `.env.pro`:** Por seguridad
   - Las claves API no se sincronizan
   - Configúralas manualmente en cada directorio

---

## 🐛 **TROUBLESHOOTING**

### **Error: "chokidar no está instalado"**

```powershell
cd C:\Sandra-IA-8.0-Pro
npm install chokidar --save-dev
```

### **Error: "sync-worktree.js no encontrado"**

Verifica que el archivo existe:
```powershell
Test-Path "C:\Sandra-IA-8.0-Pro\tools\sync-worktree.js"
```

### **La sincronización no funciona**

1. Verifica que ambos directorios existen
2. Verifica permisos de escritura
3. Revisa los logs en la consola

### **Quiero sincronizar más archivos**

Edita `tools/sync-worktree.js` y añade a `syncPaths`:
```javascript
syncPaths: [
  'desktop-app',
  'services',
  'experimental',
  'nueva-carpeta',  // ← Añade aquí
]
```

---

## ✅ **RESUMEN**

1. ✅ **Sistema de sincronización automática creado**
2. ✅ **Script batch para iniciar fácilmente**
3. ✅ **Herramientas MCP para control desde la app**
4. ✅ **Sincronización en tiempo real (500ms debounce)**
5. ✅ **Logs detallados de cada cambio**

**Ahora puedes trabajar en el worktree y los cambios se sincronizan automáticamente al directorio de ejecución.** 🎉

