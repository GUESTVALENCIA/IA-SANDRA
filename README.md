# 🧠 SANDRA PROFESSIONAL - CEO EDITION

**Aplicación de Escritorio Profesional**  
**Empresa:** GuestsValencia  
**CEO:** Claytis Miguel Tom Zuaznabar

---

## ✨ CARACTERÍSTICAS

✅ **Desktop App (Electron)** - Aplicación nativa de Windows  
✅ **GPT-4o Conversacional** - Sandra con inteligencia real  
✅ **HeyGen Avatar** - Video avatar con voz integrada  
✅ **MCP Integration** - Model Context Protocol  
✅ **Diseño Corporativo** - Profesional, sin colores Disney  
✅ **Multimodal** - Texto, voz, archivos  
✅ **Backend Seguro** - Express + APIs protegidas

---

## 🚀 INSTALACIÓN

### 1. Instalar Dependencias

```bash
cd C:\Users\clayt\Desktop\sandra-professional
npm install
```

### 2. Verificar Variables de Entorno

El archivo `.env` ya está configurado con todas tus claves API:
- ✅ OpenAI GPT-4o
- ✅ HeyGen API + Avatar ID
- ✅ Cartesia (standby)
- ✅ Netlify Token
- ✅ PayPal credentials

### 3. Iniciar Backend

```bash
npm run backend
```

El servidor Express arrancará en `http://localhost:5000`

### 4. Iniciar Aplicación Desktop

```bash
npm start
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
sandra-professional/
├── .env                    ← Variables de entorno
├── package.json            ← Dependencias
├── electron-main.js        ← Aplicación Electron
├── backend/
│   └── server.js           ← Express API Gateway
└── frontend/
    └── index.html          ← Interfaz profesional
```

---

## 🔧 ENDPOINTS BACKEND

### Chat con Sandra (GPT-4o)
```
POST http://localhost:5000/api/chat
Body: {
  "message": "Hola Sandra",
  "context": []
}
```

### Generar Video HeyGen
```
POST http://localhost:5000/api/heygen/generate
Body: {
  "text": "Texto para el avatar"
}
```

### Estado del Sistema
```
GET http://localhost:5000/health
```

---

## 💡 USO

1. **Iniciar Backend:** `npm run backend`
2. **Iniciar App:** `npm start`
3. **Chatear con Sandra:** Escribe en la interfaz
4. **Avatar HeyGen:** Click en botón 🎬
5. **Voz:** Click en botón 🎤
6. **Archivos:** Click en botón 📎

---

## 🎯 PRÓXIMOS PASOS

Una vez Sandra funcione correctamente:

1. ✅ Verificar conversación GPT-4o
2. ✅ Probar integración HeyGen
3. ✅ Validar sistema multimodal
4. 🚀 Desarrollar proyecto completo (54 subagentes)
5. 🚀 Desplegar ecosistema GuestsValencia

---

## 🛡️ SEGURIDAD

- ✅ API Keys en `.env` (nunca en código)
- ✅ Backend Express aislado
- ✅ Electron con nodeIntegration controlado
- ✅ CORS configurado

---

## 📞 SOPORTE

**Desarrollado por:** Claude (Anthropic API)  
**Para:** Claytis Miguel Tom Zuaznabar  
**Proyecto:** Sandra Professional - GuestsValencia

---

**¿TODO LISTO?** → Ejecuta `npm install` y luego `npm run backend` seguido de `npm start`
