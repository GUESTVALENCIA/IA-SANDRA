# 🔧 Instrucciones para Corregir el Error DNS

## ❌ Error que estás viendo:

```
El valor debe ser una dirección IP
Tipo: A
Valor: cname.vercel-dns-017.com
```

## ✅ Solución:

### **NO puedes poner un CNAME en un registro tipo A**

Un registro **A** solo acepta direcciones IP (ej: `76.76.21.21`), NO acepta nombres de dominio.

## 🎯 Opciones para Solucionarlo:

### **Opción A: Usar ALIAS (Si tu panel DNS lo soporta)**

1. **Elimina** el registro A actual:
   ```
   Tipo: A
   Nombre: guestsvalencia.es
   Valor: 76.76.21.21
   → ELIMINAR
   ```

2. **Crea un NUEVO registro tipo ALIAS** (NO es tipo A):
   ```
   Tipo: ALIAS (o ANAME si aparece en tu panel)
   Nombre: guestsvalencia.es (o @)
   Valor: cname.vercel-dns-017.com.
   ```

3. **Verifica** que www sigue correcto:
   ```
   Tipo: CNAME
   Nombre: www.guestsvalencia.es
   Valor: 0766c3485bb54aed.vercel-dns-017.com
   → MANTENER (ya está bien)
   ```

### **Opción B: Mantener A y usar solo www (Más fácil)**

Si tu panel DNS **NO tiene opción ALIAS**:

1. **MANTÉN el registro A** (NO lo cambies):
   ```
   Tipo: A
   Nombre: guestsvalencia.es
   Valor: 76.76.21.21
   → MANTENER ASÍ
   ```

2. **MANTÉN www** (ya está correcto):
   ```
   Tipo: CNAME
   Nombre: www.guestsvalencia.es
   Valor: 0766c3485bb54aed.vercel-dns-017.com
   → MANTENER (ya está bien)
   ```

3. **Resultado:**
   - ✅ `www.guestsvalencia.es` → Funcionará con Vercel
   - ⚠️ `guestsvalencia.es` → Redirigir a www (configurar en servidor o Vercel)

## 📋 Pasos Exactos en tu Panel DNS:

### Si tu panel tiene opción "ALIAS" o "ANAME":

1. Busca el registro:
   ```
   guestsvalencia.es  A  76.76.21.21
   ```

2. **Elimínalo** (botón "Eliminar" o "Modificar" → "Eliminar")

3. **Crea nuevo registro:**
   - Tipo: **ALIAS** (o **ANAME**)
   - Nombre: `guestsvalencia.es` (o `@`)
   - Valor: `cname.vercel-dns-017.com.` (con el punto al final)

4. Guarda

### Si tu panel NO tiene opción "ALIAS":

1. **NO toques** el registro A:
   ```
   guestsvalencia.es  A  76.76.21.21
   → DEJARLO ASÍ
   ```

2. **Verifica** que www está correcto:
   ```
   www.guestsvalencia.es  CNAME  0766c3485bb54aed.vercel-dns-017.com
   → DEBE ESTAR ASÍ
   ```

3. La PWA funcionará en `www.guestsvalencia.es`

## ✅ Verificación:

Después de hacer los cambios:

1. Espera 5-30 minutos para propagación DNS
2. Verifica en Vercel Dashboard:
   - https://vercel.com/guests-valencias-projects/guests-pwa/settings/domains
   - Debe mostrar "Verified" ✅

3. Prueba acceso:
   - `https://www.guestsvalencia.es` → Debe funcionar
   - `https://guestsvalencia.es` → Debe funcionar (si usaste ALIAS) o redirigir a www

## 🆘 Si sigues teniendo problemas:

1. **Verifica el tipo de registro:**
   - ❌ NO uses tipo "A" con valor CNAME
   - ✅ Usa tipo "ALIAS" o "ANAME" con valor CNAME
   - ✅ O mantén tipo "A" con IP y usa solo www

2. **Contacta a tu proveedor DNS:**
   - Pregunta si soportan registros ALIAS/ANAME
   - Si no, usa la Opción B (mantener A, usar solo www)

3. **Usa el script de verificación:**
   ```bash
   VERCEL_TOKEN=xxx VERCEL_ORG_ID=xxx VERCEL_PROJECT_ID=xxx \
     node scripts/check-dns-status.js
   ```

