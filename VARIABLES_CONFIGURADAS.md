# ✅ Variables Twilio - Listas para Configurar

## 📋 Variables Extraídas

Todas las variables Twilio están listas:

```
TWILIO_ACCOUNT_SID=AC38300ea2b028ab4a55d6487f6451f69b
TWILIO_AUTH_TOKEN=5502a7df0779ba9124318c4e0543d695
TWILIO_PHONE_NUMBER=+18577608754
TWILIO_WHATSAPP_NUMBER=whatsapp:+18577608754
```

---

## 🚀 Cómo Configurarlas en Vercel

### **Opción 1: Manual en Dashboard (MÁS RÁPIDO)**

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto
3. **Settings** → **Environment Variables**
4. Agrega estas 4 variables:

```
TWILIO_ACCOUNT_SID
Valor: AC38300ea2b028ab4a55d6487f6451f69b
Entornos: Production, Preview, Development ✅

TWILIO_AUTH_TOKEN
Valor: 5502a7df0779ba9124318c4e0543d695
Entornos: Production, Preview, Development ✅

TWILIO_PHONE_NUMBER
Valor: +18577608754
Entornos: Production, Preview, Development ✅

TWILIO_WHATSAPP_NUMBER
Valor: whatsapp:+18577608754
Entornos: Production, Preview, Development ✅
```

5. **Save** todas las variables
6. **Redeploy** el proyecto

---

### **Opción 2: Script Automático**

```bash
node scripts/subir-variables-vercel-auto.js
```

Este script intenta subir las variables automáticamente.

---

### **Opción 3: Vercel CLI**

```bash
# Configurar cada variable
npx vercel env add TWILIO_ACCOUNT_SID production
# Cuando pregunte el valor, ingresa: AC38300ea2b028ab4a55d6487f6451f69b

npx vercel env add TWILIO_AUTH_TOKEN production
# Valor: 5502a7df0779ba9124318c4e0543d695

npx vercel env add TWILIO_PHONE_NUMBER production
# Valor: +18577608754

npx vercel env add TWILIO_WHATSAPP_NUMBER production
# Valor: whatsapp:+18577608754

# Repite para preview y development
```

---

## 📝 Después de Configurar

1. ✅ **Redeploy** en Vercel
2. ✅ **Configurar webhooks** en Twilio Dashboard
3. ✅ **Probar** el chatbot

---

**¡Variables listas para usar!** 🚀

