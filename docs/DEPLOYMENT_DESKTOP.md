# 🚀 Guía de Deployment - Desktop App (Electron)

## 📋 Prerequisitos

### Dependencias

```bash
npm install electron-updater electron-builder
```

### Variables de Entorno

Crear `.env` con:
```
OPENAI_API_KEY=sk-...
DEEPGRAM_API_KEY=...
CARTESIA_API_KEY=...
HEYGEN_API_KEY=...
NODE_ENV=production
```

## 🔒 Seguridad Verificada

✅ Context Isolation: Habilitado  
✅ Node Integration: Deshabilitado  
✅ Web Security: Habilitado  
✅ IPC Validation: Implementado  
✅ Command Injection: Protegido  
✅ Path Traversal: Protegido  

## 🏗️ Build

### Desarrollo

```bash
npm start
```

### Producción (con empaquetado)

```bash
npm run build:desktop
```

## 📦 Code Signing (Opcional)

### Windows

1. Obtener certificado de code signing
2. Configurar variables de entorno:
   ```bash
   set CSC_LINK=path/to/certificate.pfx
   set CSC_KEY_PASSWORD=your_password
   ```
3. Build con signing:
   ```bash
   npm run build:desktop:signed
   ```

### macOS

1. Obtener Apple Developer ID
2. Configurar:
   ```bash
   export CSC_LINK=path/to/certificate.p12
   export CSC_KEY_PASSWORD=your_password
   ```

## 🔄 Auto-Update

El auto-update está implementado en `main-auto-update.js`.

### Configuración

1. Publicar releases en GitHub Releases
2. Configurar `package.json`:
   ```json
   {
     "build": {
       "publish": {
         "provider": "github",
         "owner": "your-username",
         "repo": "sandra-devconsole"
       }
     }
   }
   ```

### Testing

```bash
# Desarrollo (no verifica updates)
NODE_ENV=development npm start

# Producción (verifica updates)
NODE_ENV=production npm start
```

## 🐛 Troubleshooting

### Error: "electron-updater not found"

```bash
npm install electron-updater
```

### Error: "Context Isolation disabled"

Verificar `main.js` tiene:
```javascript
contextIsolation: true
```

### Error: "IPC channel not allowed"

Verificar que el canal está en la whitelist en `preload.js`.

---

**Estado**: ✅ App desktop segura y lista para distribución

