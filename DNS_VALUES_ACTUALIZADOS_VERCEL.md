# 🔧 Valores DNS Actualizados para Vercel

**Fecha**: 20 de noviembre de 2025

## ⚠️ Estado Actual

Vercel muestra **"Invalid Configuration"** porque los DNS en PiensaSolution no coinciden exactamente con los valores que Vercel espera.

---

## 📋 Valores DNS para PiensaSolution

### 1. guestsvalencia.es (Apex - Dominio Principal)

**Registro A**:
- **Tipo**: A
- **Nombre**: `@` (o `guestsvalencia.es`)
- **Valor NUEVO (recomendado)**: `216.198.79.1`
- **Valor antiguo (sigue funcionando)**: `76.76.21.21`

**💡 Vercel recomienda usar el nuevo valor `216.198.79.1`**

---

### 2. www.guestsvalencia.es

**Registro CNAME**:
- **Tipo**: CNAME
- **Nombre**: `www`
- **Valor NUEVO (recomendado)**: `76e54a8c3eb14bd2.vercel-dns-017.com.`
- **Valor antiguo (sigue funcionando)**: `cname.vercel-dns.com` o `nuxwxfa4j.vercel-dns.com`

**💡 Vercel recomienda usar el nuevo valor `76e54a8c3eb14bd2.vercel-dns-017.com.`**

---

## 🔧 Acción Requerida

### Actualizar DNS en PiensaSolution

1. **guestsvalencia.es**:
   - Cambiar registro A de `76.76.21.21` → `216.198.79.1`

2. **www.guestsvalencia.es**:
   - Cambiar registro CNAME de `nuxwxfa4j.vercel-dns.com` → `76e54a8c3eb14bd2.vercel-dns-017.com.`

---

## ⏳ Tiempo de Propagación

Después de actualizar los DNS:
- **Tiempo estimado**: 5-30 minutos
- Vercel verificará automáticamente cuando los DNS coincidan
- El estado cambiará de "Invalid Configuration" a "Valid Configuration"

---

## ✅ Verificación

Después de actualizar, verifica en:
- Vercel Dashboard → Project → Domains
- El estado debería cambiar a "Valid Configuration"

---

## 📝 Nota

Los valores antiguos siguen funcionando, pero Vercel recomienda usar los nuevos valores como parte de una expansión planificada de rango IP.

---

**Última actualización**: Valores DNS nuevos proporcionados por Vercel

