# ✅ Verificación de Producción - Sandra IA

## 📊 Estado Actual

Ejecuta estos scripts para verificar el estado:

```bash
# Verificar DNS
node scripts/verificar-dns-vercel.js

# Verificar sitio y APIs
node scripts/verificar-produccion.js

# Verificar configuración en Vercel
node scripts/configurar-dominio-vercel.js
```

---

## 🔍 Qué Verificar

### **1. DNS**
- ✅ Debe apuntar a: `cname.vercel-dns.com`
- ⏳ Propagación: 5-30 minutos (puede variar)

### **2. Sitio Web**
- ✅ Debe estar accesible en: `https://sandra.guestsvalencia.es`
- ✅ SSL activo (candado verde)
- ✅ Sin errores 503 o 502

### **3. APIs**
- ✅ `/api/health` - Debe responder 200
- ✅ `/api/twilio-whatsapp` - Debe estar accesible
- ✅ `/api/twilio-voice` - Debe estar accesible

### **4. Vercel Dashboard**
- ✅ Dominio verificado
- ✅ SSL emitido
- ✅ Deploy más reciente exitoso

---

## 🆘 Si Aún Hay Problemas

### **DNS no propagado:**
1. Espera más tiempo (hasta 24 horas en casos extremos)
2. Verifica en: https://dnschecker.org
3. Limpia caché DNS local: `ipconfig /flushdns` (Windows)

### **Sitio no carga:**
1. Verifica en Vercel Dashboard → Deployments
2. Asegúrate de que hay un deploy reciente
3. Revisa los logs del deploy

### **Error 503:**
- Normal durante la configuración inicial
- Espera 10-30 minutos
- Vuelve a verificar

---

**Ejecuta los scripts de verificación para ver el estado actual.** 🔍

