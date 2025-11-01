# 🔄 Cambio de DNS: Netlify → Vercel

## 📋 Situación Actual

Tu dominio `sandra.guestsvalencia.es` está configurado así:

```
sandra.guestsvalencia.es  CNAME  grand-pasca-a584d5.netlify.app
```

Necesitas cambiarlo para que apunte a **Vercel**.

---

## ✅ Cambio Necesario

### **En tu Panel DNS:**

1. **Encuentra este registro:**
   ```
   sandra.guestsvalencia.es  CNAME  grand-pasca-a584d5.netlify.app
   ```

2. **Modifica el registro:**
   - Tipo: **CNAME** (mantener)
   - Nombre: **sandra** (mantener)
   - Valor: **cambiar a** `cname.vercel-dns.com`

3. **Resultado final:**
   ```
   sandra.guestsvalencia.es  CNAME  cname.vercel-dns.com
   ```

4. **Guarda los cambios**

---

## 📋 Valores Exactos para Copiar

### **Registro CNAME Principal:**

```
Tipo: CNAME
Nombre: sandra
Valor: cname.vercel-dns.com
TTL: 3600 (o automático)
```

### **Registro CNAME para www (opcional):**

```
Tipo: CNAME
Nombre: www.sandra
Valor: cname.vercel-dns.com
TTL: 3600 (o automático)
```

---

## ⏰ Tiempo de Propagación

- **Mínimo:** 5 minutos
- **Promedio:** 30 minutos - 1 hora
- **Máximo:** 24 horas

Puedes verificar la propagación en: **https://dnschecker.org**

---

## ✅ Verificación en Vercel

Después de cambiar el DNS:

1. Ve a: **Vercel Dashboard** → Tu proyecto → **Settings** → **Domains**
2. Verás el estado:
   - ⏳ **Pending Verification** - Esperando DNS
   - ✅ **Verified** - ¡Listo!

---

## 🎯 Después de la Verificación

Una vez verificado:

1. ✅ SSL se emitirá automáticamente
2. ✅ Tu sitio estará en: `https://sandra.guestsvalencia.es`
3. ✅ Actualiza webhooks de Twilio:
   - `https://sandra.guestsvalencia.es/api/twilio-whatsapp`
   - `https://sandra.guestsvalencia.es/api/twilio-voice`

---

## 🔍 Verificar DNS Correctamente Configurado

Ejecuta:
```bash
node scripts/verificar-dns-vercel.js
```

Este script verificará que el DNS apunta correctamente a Vercel.

---

**¡Solo cambia el CNAME y espera la verificación!** 🚀

