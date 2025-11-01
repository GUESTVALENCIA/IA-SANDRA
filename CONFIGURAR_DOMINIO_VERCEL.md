# 🌐 Configurar Dominio en Vercel - Guía Completa

## 🎯 Objetivo

Conectar tu dominio personalizado (ej: `sandra.guestsvalencia.es`) con el proyecto de Vercel para tener Sandra en producción.

---

## 🚀 Pasos para Configurar el Dominio

### **Paso 1: Ve a Vercel Dashboard**

1. Abre: **https://vercel.com/dashboard**
2. Selecciona tu proyecto: **ia-sandra-9oh9** o el que corresponda
3. Ve a **Settings** (en el menú superior)
4. Haz clic en **Domains** (menú lateral izquierdo)

### **Paso 2: Agregar Dominio**

1. Haz clic en el botón **"Add"** o **"Add Domain"**
2. Ingresa tu dominio:
   - Ejemplo: `sandra.guestsvalencia.es`
   - O: `www.sandra.guestsvalencia.es`
3. Haz clic en **"Add"**

### **Paso 3: Configurar DNS en tu Proveedor de Dominio**

Vercel te mostrará las instrucciones específicas. Generalmente necesitarás:

#### **Opción A: CNAME (Recomendado para subdominios)**

```
Tipo: CNAME
Nombre: sandra (o @ si es dominio raíz)
Valor: cname.vercel-dns.com
TTL: 3600 (o automático)
```

#### **Opción B: A Record (Para dominio raíz)**

```
Tipo: A
Nombre: @
Valor: 76.76.21.21 (IP de Vercel - puede variar)
TTL: 3600
```

#### **Opción C: CNAME para www**

```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
TTL: 3600
```

### **Paso 4: Verificación**

1. Después de agregar los registros DNS, vuelve a Vercel
2. Haz clic en **"Refresh"** o espera unos minutos
3. Vercel verificará automáticamente los registros DNS
4. Una vez verificado, verás un ✅ verde

### **Paso 5: SSL Automático**

- Vercel emitirá automáticamente un certificado SSL
- Tu sitio estará disponible en `https://sandra.guestsvalencia.es`
- ¡Todo seguro y en producción! 🔒

---

## 📋 Ejemplo de Configuración DNS

Si tu dominio es `sandra.guestsvalencia.es`:

### **En tu proveedor de DNS (ej: Cloudflare, Namecheap, etc.):**

```
Tipo: CNAME
Nombre: sandra
Valor: cname.vercel-dns.com
Proxy: Desactivado (o activado según prefieras)
TTL: Auto
```

### **Para www.sandra.guestsvalencia.es:**

```
Tipo: CNAME
Nombre: www.sandra (o solo www según tu proveedor)
Valor: cname.vercel-dns.com
TTL: Auto
```

---

## 🔍 Verificar Configuración

### **Opción 1: En Vercel Dashboard**

1. Ve a **Settings** → **Domains**
2. Deberías ver tu dominio con estado:
   - ✅ **Verified** - Todo listo
   - ⏳ **Pending** - Esperando verificación DNS
   - ❌ **Error** - Revisa los registros DNS

### **Opción 2: Comando Terminal**

```bash
# Verificar DNS
nslookup sandra.guestsvalencia.es

# Debería apuntar a Vercel
```

### **Opción 3: Online**

Usa: **https://dnschecker.org** para verificar que los DNS están propagados globalmente.

---

## ⚙️ Configuración Avanzada

### **Múltiples Dominios**

Puedes agregar múltiples dominios al mismo proyecto:
- `sandra.guestsvalencia.es`
- `www.sandra.guestsvalencia.es`
- `api.sandra.guestsvalencia.es` (para APIs)

### **Redirecciones**

En **Settings** → **Domains** puedes configurar:
- Redirección de `www` a dominio raíz
- Redirección de HTTP a HTTPS (automático)

---

## 🎯 Después de Configurar

Una vez que el dominio esté verificado:

1. ✅ Tu sitio estará disponible en tu dominio personalizado
2. ✅ SSL automático habilitado
3. ✅ Sandra IA en producción oficial
4. ✅ Actualiza los webhooks de Twilio con el nuevo dominio:
   - WhatsApp: `https://sandra.guestsvalencia.es/api/twilio-whatsapp`
   - Voice: `https://sandra.guestsvalencia.es/api/twilio-voice`

---

## 📝 Notas Importantes

- **Propagación DNS:** Puede tardar de 5 minutos a 48 horas (generalmente menos de 1 hora)
- **SSL:** Se emite automáticamente después de la verificación (puede tardar unos minutos)
- **HTTPS:** Se fuerza automáticamente, no necesitas configuración adicional
- **Subdominios:** Puedes agregar múltiples subdominios al mismo proyecto

---

## 🆘 Troubleshooting

### **Dominio no se verifica:**
1. Verifica que los registros DNS estén correctos
2. Espera hasta 24 horas para propagación completa
3. Usa https://dnschecker.org para verificar propagación global

### **SSL no se emite:**
1. Espera unos minutos después de la verificación
2. Verifica que el dominio apunte correctamente a Vercel
3. Contacta soporte de Vercel si persiste

### **Sitio no carga:**
1. Verifica que el proyecto esté deployado
2. Verifica que el dominio esté verificado
3. Limpia la caché del navegador

---

**¡Listo para configurar tu dominio!** 🚀🌐

