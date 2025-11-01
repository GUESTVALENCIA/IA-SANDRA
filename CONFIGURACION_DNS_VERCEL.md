# 🌐 Configuración DNS para Vercel - Instrucciones Específicas

## 📋 Estado Actual

Tu dominio `sandra.guestsvalencia.es` actualmente apunta a:
```
sandra.guestsvalencia.es  CNAME  grand-pasca-a584d5.netlify.app
```

Necesitas cambiarlo para que apunte a **Vercel**.

---

## 🔧 Configuración DNS Requerida

### **Paso 1: Obtener el CNAME de Vercel**

1. Ve a: **https://vercel.com/dashboard**
2. Selecciona tu proyecto: **ia-sandra-9oh9**
3. **Settings** → **Domains**
4. Verás los dominios agregados: `sandra.guestsvalencia.es` y `www.sandra.guestsvalencia.es`
5. Haz clic en cada dominio para ver las **instrucciones de verificación**

### **Paso 2: Configurar en tu Panel DNS**

Ve a tu panel de DNS (donde gestionas los registros que me mostraste) y **modifica** estos registros:

#### **Para sandra.guestsvalencia.es:**

**Cambiar de:**
```
sandra.guestsvalencia.es  CNAME  grand-pasca-a584d5.netlify.app
```

**A:**
```
sandra.guestsvalencia.es  CNAME  cname.vercel-dns.com
```

#### **Para www.sandra.guestsvalencia.es (si lo agregaste):**

**Agregar nuevo registro:**
```
www.sandra.guestsvalencia.es  CNAME  cname.vercel-dns.com
```

---

## 📋 Instrucciones Detalladas

### **En tu Panel DNS (donde gestionas los registros):**

1. **Busca el registro:**
   ```
   sandra.guestsvalencia.es  CNAME  grand-pasca-a584d5.netlify.app
   ```

2. **Haz clic en "Modificar"**

3. **Cambia el Valor de:**
   ```
   grand-pasca-a584d5.netlify.app
   ```
   
   **A:**
   ```
   cname.vercel-dns.com
   ```

4. **Guarda los cambios**

5. **Espera la propagación DNS** (5 minutos a 1 hora)

---

## ✅ Verificación

### **Opción 1: En Vercel Dashboard**

1. Ve a **Settings** → **Domains**
2. Verás el estado del dominio:
   - ⏳ **Pending Verification** - Esperando propagación DNS
   - ✅ **Verified** - ¡Todo listo!

### **Opción 2: Comando Terminal**

```bash
# Verificar DNS
nslookup sandra.guestsvalencia.es

# Debería mostrar: cname.vercel-dns.com
```

### **Opción 3: Online**

Usa: **https://dnschecker.org**

Ingresa: `sandra.guestsvalencia.es`  
Debería mostrar `cname.vercel-dns.com` globalmente.

---

## 🎯 Después de la Verificación

Una vez que Vercel verifique el dominio:

1. ✅ **SSL automático** se emitirá (puede tardar unos minutos)
2. ✅ Tu sitio estará disponible en: `https://sandra.guestsvalencia.es`
3. ✅ **Actualiza webhooks de Twilio** con el nuevo dominio:
   - WhatsApp: `https://sandra.guestsvalencia.es/api/twilio-whatsapp`
   - Voice: `https://sandra.guestsvalencia.es/api/twilio-voice`

---

## 📝 Notas Importantes

- ⏰ **Propagación DNS:** Puede tardar de 5 minutos a 24 horas (generalmente menos de 1 hora)
- 🔒 **SSL:** Se emite automáticamente después de la verificación
- 🔄 **Migración desde Netlify:** Una vez configurado, el tráfico se moverá automáticamente a Vercel
- ⚠️ **Downtime mínimo:** Durante la propagación puede haber un breve período de transición

---

## 🆘 Si hay Problemas

### **Dominio no se verifica:**
1. Verifica que el CNAME esté correcto: `cname.vercel-dns.com`
2. Espera hasta 24 horas para propagación completa
3. Usa https://dnschecker.org para verificar propagación global

### **SSL no se emite:**
1. Espera unos minutos después de la verificación
2. Verifica que el dominio apunte correctamente
3. Contacta soporte de Vercel si persiste

---

**¡Listo para configurar!** 🚀🌐

