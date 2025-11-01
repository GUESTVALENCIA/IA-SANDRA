# 🔗 Linkear Repositorio con Vercel - Guía

## 🎯 Objetivo

Conectar el repositorio de GitHub (`GUESTVALENCIA/IA-SANDRA`) con Vercel para que los deploys sean automáticos desde GitHub (y gratis).

---

## 🚀 Opción 1: Automático (Script)

```bash
node scripts/linkear-repo-vercel.js
```

Este script intentará linkear automáticamente el repositorio usando la API de Vercel.

---

## 🖥️ Opción 2: Manual (Recomendado)

### **Paso 1: Ve a Vercel Dashboard**

1. Abre: **https://vercel.com/dashboard**
2. Inicia sesión con tu cuenta

### **Paso 2: Selecciona tu Proyecto**

1. Busca y selecciona: **ia-sandra-9oh9** (o tu proyecto)

### **Paso 3: Configura Git**

1. Ve a **Settings** (en el menú superior)
2. Haz clic en **Git** (menú lateral izquierdo)
3. Si ya hay un repo linkeado, verás su información
4. Si no, verás un botón **"Connect Git Repository"**

### **Paso 4: Conecta GitHub**

1. Haz clic en **"Connect Git Repository"**
2. Selecciona **GitHub** como proveedor
3. Si es la primera vez, autoriza Vercel a acceder a GitHub
4. Busca el repositorio: **GUESTVALENCIA/IA-SANDRA**
5. Haz clic en **"Import"** o **"Connect"**

### **Paso 5: Configuración de Build**

Vercel detectará automáticamente la configuración, pero verifica:

- **Root Directory:** `.` (raíz del proyecto)
- **Build Command:** `npm run build:prod` (o el que tengas)
- **Output Directory:** `frontend` (si aplica)
- **Install Command:** `npm install`

### **Paso 6: Variables de Entorno**

1. Ve a **Settings** → **Environment Variables**
2. Verifica que todas las variables estén configuradas:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `TWILIO_WHATSAPP_NUMBER`
   - `OPENAI_API_KEY`
   - `DEEPGRAM_API_KEY`
   - `CARTESIA_API_KEY`
   - `HEYGEN_API_KEY`
   - Y todas las demás que necesites

---

## ✅ Verificación

### **Después de linkear:**

1. Ve a **Deployments** (en el menú superior)
2. Deberías ver un deploy iniciado automáticamente
3. Si no, haz clic en **"Redeploy"** o haz un `git push`

### **Prueba el Deploy:**

1. Haz un pequeño cambio en el código
2. Haz commit y push:
   ```bash
   git add .
   git commit -m "test: Deploy automático"
   git push origin main
   ```
3. Ve a Vercel Dashboard → **Deployments**
4. Deberías ver un nuevo deploy iniciándose automáticamente

---

## 🎯 Beneficios del Linkeo

✅ **Deploys Automáticos:**
   - Cada push a `main` → Deploy a producción
   - Pull requests → Preview automático

✅ **Gratis:**
   - Deploys desde GitHub son completamente gratis
   - Sin consumo de créditos

✅ **Preview Deploys:**
   - Cada PR genera una URL única para testing
   - Ideal para pruebas antes de producción

✅ **CI/CD Integrado:**
   - Build automático en cada commit
   - Validación automática
   - Rollback fácil si algo falla

---

## 📋 Configuración Recomendada

### **Branch Protection:**

1. Ve a GitHub: **Settings** → **Branches**
2. Configura protección para `main`:
   - Require pull request reviews
   - Require status checks to pass
   - Include administrators

### **Vercel Settings:**

1. **Production Branch:** `main`
2. **Preview Deploys:** Activado
3. **Automatic Deploys:** Activado para `main`

---

## 🆘 Troubleshooting

### **"Repository not found":**
- Verifica que Vercel tenga acceso a tu organización de GitHub
- Asegúrate de que el repo sea público o que hayas dado acceso a Vercel

### **"Build failed":**
- Verifica las variables de entorno en Vercel
- Revisa los logs del build en Vercel Dashboard
- Verifica que `package.json` tenga los scripts correctos

### **"No deployments":**
- Haz un push a `main` para disparar el primer deploy
- Verifica que la branch esté configurada correctamente

---

## 📝 Próximos Pasos

Después de linkear:

1. ✅ Verifica que el primer deploy funcione
2. ✅ Prueba haciendo un cambio y push
3. ✅ Verifica que los previews funcionen en PRs
4. ✅ Configura webhooks de Twilio con el dominio de producción

---

**¡Repositorio linkeado y deploys automáticos activados!** 🚀🔗

