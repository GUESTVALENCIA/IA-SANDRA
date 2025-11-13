# 🚀 Sandra IA 8.0 Pro - Guía de Inicio Offline

## ✅ Estado Actual

✅ **La aplicación está completamente funcional en MODO OFFLINE**
- No requiere conexión a internet
- Todas las funciones principales operativas
- Interfaz completa cargada localmente

## 📦 Requisitos

- **Node.js 18+** (incluye npm)
- **Windows 10/11**
- **200MB de espacio libre** (incluidas dependencias)

## 🚀 FORMA MÁS RÁPIDA DE INICIAR

### Opción 1: Doble clic (RECOMENDADO)
1. Abre la carpeta `C:\Sandra-IA-8.0-Pro`
2. **Haz doble clic** en `ABRIR_SANDRA.bat`
3. ¡Listo! La app se abre en 10 segundos

### Opción 2: PowerShell (Avanzado)
```powershell
cd C:\Sandra-IA-8.0-Pro
npm start
```

### Opción 3: Terminal (Developers)
```cmd
cd C:\Sandra-IA-8.0-Pro
npx electron desktop-app/main.js --no-sandbox --disable-gpu
```

## 🎯 Que Encontrarás Dentro

```
┌─────────────────────────────────────────────────┐
│          SANDRA IA 8.0 PRO INTERFACE            │
├──────────────────────┬──────────────────────────┤
│   PANEL DE CONTROL   │     ÁREA PRINCIPAL      │
│                      │                          │
│ ⚡ Sistema           │   Encabezado:            │
│ 🧠 Roles de Sandra   │   - Estado del sistema  │
│ 🎯 Funciones         │   - Modo Offline: ✅    │
│ 📡 Conexiones        │                          │
│                      │   Chat interactivo:     │
│                      │   - Mensajes en tiempo  │
│                      │   - Respuestas Sandra   │
│                      │   - Entrada de texto    │
└──────────────────────┴──────────────────────────┘
```

## 🎮 Funciones Disponibles

### Panel de Control (Izquierda)

#### ⚡ Sistema
- **Test Sistema**: Diagnóstico de hardware
- **Estado Actual**: Estado completo de la app
- **Limpiar Logs**: Resetea el chat

#### 🧠 Roles de Sandra (18 disponibles)
- 🎥 **YouTuber**: Gestión de contenido YouTube
- 👥 **Community Manager**: Gestión de comunidades
- 💰 **Sales Negotiator**: Negociación de precios
- 👨‍💻 **Developer**: Generación de código
- ... y 14 más

#### 🎯 Funciones
- **Validar Rol**: Confirma que el rol está activo
- **Generar Código**: Crea código JavaScript
- **Negociar**: Simula negociación comercial

### Chat Interactivo (Centro/Derecha)

Escribe mensajes y Sandra responderá según el rol actual:

```
Ejemplos de mensajes:
- "Hola" → Sandra te saluda
- "¿Cuál es tu estado?" → Muestra estado del sistema
- "Cambia a YouTuber" → Cambia de rol
- "Ayuda" → Muestra opciones disponibles
```

## ⚙️ Solución de Problemas

### Problema: "No se abre nada"
**Solución:**
```cmd
cd C:\Sandra-IA-8.0-Pro
npm install --force --legacy-peer-deps
npm start
```

### Problema: "El puerto 9080 está en uso"
**Solución:**
```cmd
netstat -ano | findstr :9080
taskkill /pid <PID> /f
npm start
```

### Problema: "Error: Cannot find module"
**Solución:**
```cmd
cd C:\Sandra-IA-8.0-Pro
del node_modules
npm install --force
```

### Problema: "Electron no inicia en Windows"
**Solución:**
```cmd
cd C:\Sandra-IA-8.0-Pro
npx electron --version
npx electron desktop-app/main.js --no-sandbox --disable-gpu
```

## 📊 Estructura de Archivos

```
C:\Sandra-IA-8.0-Pro\
├── ABRIR_SANDRA.bat          👈 HAGA DOBLE CLIC AQUÍ
├── desktop-app/
│   ├── main.js               (Proceso principal)
│   ├── renderer/
│   │   └── index.html        (Interfaz offline)
│   ├── preload.js            (Puente electron-renderer)
│   └── assets/
├── mcp-server/               (API - no requiere internet)
├── .env.pro                  (Variables de entorno)
└── package.json              (Dependencias)
```

## 🔧 Configuración

El archivo `.env.pro` contiene:

```env
# Modo
NODE_ENV=development

# APIs (offline por defecto)
GROQ_API_KEY=***
DEEPSEEK_API_KEY=***

# Base de datos (desactivada en modo offline)
DATABASE_URL=***

# GitHub (offline - solo local)
GITHUB_TOKEN=***
```

## 🔌 Puertos Utilizados

| Puerto | Servicio | Estado |
|--------|----------|--------|
| 9080   | Electron (UI) | ✅ Activo |
| 3000   | MCP Server | ⚙️ Bajo demanda |
| 8765   | WebSocket | ⚙️ Bajo demanda |

## 💾 Carpetas Importantes

```
Desktop:
  └── Sandra IA 8.0 Pro.lnk     (Acceso directo)

Documents:
  └── sandra-logs/              (Historial de chats)

AppData\Roaming\electron:
  └── cache/                    (Caché de Electron)
```

## 📝 Logs

Los logs se guardan automáticamente en:
- **Consola Electron**: F12 (Herramientas de Desarrollo)
- **Terminal**: Mismo proceso de Node

Para depuración:
```cmd
npm start 2>&1 | tee sandra.log
```

## 🚀 Próximos Pasos

### Para desarrolladores:
1. Modifica `desktop-app/renderer/index.html` para personalizar
2. Actualiza `desktop-app/main.js` para nuevas funciones
3. Ejecuta `npm run build` para crear instalador

### Para producción:
```cmd
npm run build
```

Genera: `dist\Sandra-IA-8.0.exe`

## 📞 Soporte Offline

Cuando no hay internet:
- ✅ Chat local funciona
- ✅ Interfaz responde
- ✅ Roles disponibles
- ❌ APIs externas (Groq, DeepSeek) - fallback local

## 🎓 Ejemplos de Uso

### Cambiar de rol
1. Haz clic en un botón del Panel de Control izquierdo
2. Sandra cambia automáticamente de rol
3. Las respuestas serán según el nuevo rol

### Validar que todo funciona
1. Haz clic en "Test Sistema"
2. Espera el diagnóstico
3. Verás estado completo del sistema

### Generar código
1. Haz clic en "Generar Código"
2. Sandra crea un ejemplo JavaScript
3. Puedes copiar y usar

## ✨ Características Implementadas

- ✅ Interfaz offline completa
- ✅ 18 roles especializados
- ✅ Chat interactivo
- ✅ Panel de control
- ✅ Modo desarrollo
- ✅ Sin dependencias externas (en offline)
- ✅ Responsive design
- ✅ Animaciones suave

## 🎉 ¡Listo!

**Sandra IA 8.0 Pro está completamente funcional y lista para usar.**

Simplemente:
1. **Abre** `ABRIR_SANDRA.bat` (doble clic)
2. **Espera** 10 segundos
3. **¡Interactúa!** con Sandra

---

**Versión:** 8.0.0 | **Modo:** Offline | **Estado:** ✅ Operativo

