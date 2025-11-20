# 🔧 Guía de Actualización DNS para Vercel

## 📊 Estado Actual

### ✅ Dominios ya configurados en Vercel:
- `guestsvalencia.es` ✅ Verificado
- `www.guestsvalencia.es` ✅ Verificado y agregado al proyecto
- `sandra.guestsvalencia.es` ✅ Certificado SSL
- `api.guestsvalencia.es` ✅ Certificado SSL

### ⚠️ Problema Detectado:

**Registro A actual:**
```
guestsvalencia.es  A  76.76.21.21
```

**Vercel necesita:**
```
guestsvalencia.es  ALIAS  cname.vercel-dns-017.com.
```

## 🔄 Cambios Requeridos en tu Panel DNS

### Opción 1: Usar ALIAS (Recomendado si tu proveedor lo soporta)

**Eliminar:**
```
guestsvalencia.es  A  76.76.21.21
```

**Agregar:**
```
guestsvalencia.es  ALIAS  cname.vercel-dns-017.com.
```

**Mantener (sin cambios):**
```
www.guestsvalencia.es  CNAME  0766c3485bb54aed.vercel-dns-017.com  ✅
```

### Opción 2: Usar solo www (Solución temporal)

Si tu proveedor DNS no soporta ALIAS para el dominio raíz:

**Mantener:**
```
guestsvalencia.es  A  76.76.21.21  (redirige a www)
www.guestsvalencia.es  CNAME  0766c3485bb54aed.vercel-dns-017.com  ✅
```

**Nota:** Con esta opción, la PWA funcionará en `www.guestsvalencia.es` pero no en `guestsvalencia.es` directamente.

## 📋 Registros que DEBEN mantenerse (NO tocar)

Estos registros son necesarios para otros servicios y NO deben modificarse:

```
✅ _twilio.guestsvalencia.es  TXT  twilio-domain-verification=98be577faf9768ab78eee4d08ca8b74a
✅ api.guestsvalencia.es  CNAME  cname.vercel-dns.com
✅ sandra.guestsvalencia.es  CNAME  cname.vercel-dns.com
✅ autoconfig.guestsvalencia.es  CNAME  autoconfig.buzondecorreo.com
✅ autodiscover.guestsvalencia.es  CNAME  autodiscover.buzondecorreo.com
✅ control.guestsvalencia.es  CNAME  pdc.piensasolutions.com
✅ ftp.guestsvalencia.es  CNAME  www.guestsvalencia.es
✅ guestsvalencia.es  MX  10  mx.buzondecorreo.com
✅ guestsvalencia.es  SPF  v=spf1 include:_spf.buzondecorreo.com ~all
✅ panel.guestsvalencia.es  CNAME  pdc.piensasolutions.com
✅ webmail.guestsvalencia.es  CNAME  buzondecorreo.com
```

## 🎯 Configuración Final Recomendada

### Para el dominio raíz (guestsvalencia.es):

**Si tu proveedor DNS soporta ALIAS:**
```
guestsvalencia.es  ALIAS  cname.vercel-dns-017.com.
```

**Si NO soporta ALIAS:**
```
guestsvalencia.es  A  76.76.21.21  (mantener, redirige a www)
```

### Para www (ya está correcto):
```
www.guestsvalencia.es  CNAME  0766c3485bb54aed.vercel-dns-017.com  ✅
```

## ✅ Verificación

Después de hacer los cambios:

1. **Esperar propagación DNS** (5-30 minutos)
2. **Verificar en Vercel Dashboard:**
   - https://vercel.com/guests-valencias-projects/guests-pwa/settings/domains
   - Debe mostrar "Verified" ✅

3. **Probar acceso:**
   - `https://www.guestsvalencia.es` → Debe funcionar
   - `https://guestsvalencia.es` → Debe funcionar (si usaste ALIAS)

## 🔍 Comandos de Verificación

```bash
# Verificar DNS
dig guestsvalencia.es
dig www.guestsvalencia.es

# Verificar en Vercel
VERCEL_TOKEN=xxx VERCEL_ORG_ID=xxx VERCEL_PROJECT_ID=xxx \
  node scripts/update-dns-vercel.js
```

## 📱 URLs de Producción

Una vez configurado correctamente:

- **PWA Principal**: `https://www.guestsvalencia.es` ✅
- **PWA Alternativa**: `https://guestsvalencia.es` (si usas ALIAS)
- **API**: `https://api.guestsvalencia.es`
- **Sandra**: `https://sandra.guestsvalencia.es`

## ⚠️ Notas Importantes

1. **No elimines** los registros MX, SPF, ni los CNAMEs de otros servicios
2. **Mantén** el registro TXT de Twilio para verificación
3. **El cambio de A a ALIAS** puede tardar hasta 30 minutos en propagarse
4. **Si usas solo www**, configura una redirección en tu servidor de 76.76.21.21 para que `guestsvalencia.es` redirija a `www.guestsvalencia.es`

## 🆘 Soporte

Si tienes problemas:
1. Verifica que los nameservers sean correctos
2. Espera la propagación DNS completa
3. Revisa el dashboard de Vercel para errores
4. Usa el script `scripts/update-dns-vercel.js` para diagnóstico

