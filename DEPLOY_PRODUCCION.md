# 🚀 DEPLOY A PRODUCCIÓN - Sandra IA LiveKit

## ✅ Estado Actual

- ✅ **Frontend**: Compilado y listo
- ✅ **Backend**: Código completo
- ✅ **Credenciales**: Configuradas
- ✅ **Código**: Commiteado y pusheado a GitHub

## 🎯 PASOS FINALES PARA PRODUCCIÓN

### 1. Frontend en Vercel

**Ve a:** https://vercel.com/dashboard

1. **"Add New" → "Project"**
2. **Import:** `GUESTVALENCIA/IA-SANDRA`
3. **Root Directory:** `sandra-livekit-app`
4. **Framework:** Next.js (auto-detecta)

**Variables de Entorno** (Settings → Environment Variables):
```
LIVEKIT_URL=wss://sandra-ia-zao5fe43.livekit.cloud
LIVEKIT_API_KEY=APIqjYoygUaeqVr
LIVEKIT_API_SECRET=VfvfuprOXBDHgU4CoBdFxLPqCMnwf1pC2WVaKpz3ltoB
OPENAI_API_KEY=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
```

5. **Deploy**

**✅ Resultado: `https://sandra-ia-xxx.vercel.app`**

### 2. Backend Agent en LiveKit Cloud

**Ve a:** https://cloud.livekit.io/projects/p_2fqop8qm4os

1. **"Agents" o "Workers"**
2. **"Deploy Agent" o "Create Worker"**
3. **Conectar Repo:**
   - Repo: `GUESTVALENCIA/IA-SANDRA`
   - Path: `sandra-livekit-agent`
   - Dockerfile: auto-detecta

4. **Variables de Entorno:**
```
LIVEKIT_URL=wss://sandra-ia-zao5fe43.livekit.cloud
LIVEKIT_API_KEY=APIqjYoygUaeqVr
LIVEKIT_API_SECRET=VfvfuprOXBDHgU4CoBdFxLPqCMnwf1pC2WVaKpz3ltoB
OPENAI_API_KEY=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
```

5. **Deploy**

**✅ El agent corre en la nube 24/7**

### 3. Verificación End-to-End

1. Abre la URL de Vercel (frontend)
2. Haz clic en "Conversar con Sandra"
3. Habla
4. **Sandra responde con voz**

## 🎉 RESULTADO FINAL

**URL Frontend:** `https://sandra-ia-xxx.vercel.app`  
**Backend Agent:** Corriendo en LiveKit Cloud  
**Funcionalidad:** ✅ Voz en tiempo real funcionando

## 📊 Arquitectura de Producción

```
Usuario
  ↓
Frontend (Vercel)
  ↓ WebRTC
LiveKit Cloud Server
  ↓ WebRTC
Backend Agent (LiveKit Cloud)
  ↓ OpenAI API
Sandra IA
```

**✅ Todo en producción, escalable, profesional.**

