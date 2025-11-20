# 🌐 Valores DNS para PiensaSolution

**Fecha**: 20 de noviembre de 2025

## 📋 Registros DNS Completos

### ✅ Valores Confirmados

| Host | Tipo | Valor | Estado |
|------|------|-------|--------|
| `guestsvalencia.es` | A | `76.76.21.21` | ✅ Listo |
| `www.guestsvalencia.es` | CNAME | `[VERCEL_HASH].vercel-dns.com` | ⏳ Pendiente obtener hash |
| `site.guestsvalencia.es` | CNAME | `sandra-guestsvalencia.netlify.app` | ✅ Listo |
| `api.guestsvalencia.es` | CNAME | `cname.vercel-dns.com` | ✅ Listo |
| `sandra.guestsvalencia.es` | CNAME | `cname.vercel-dns.com` | ✅ Listo |

---

## 🔍 Cómo Obtener el Hash de Vercel para www

### Opción 1: Desde Vercel Dashboard
1. Ve a: https://vercel.com/dashboard
2. Selecciona proyecto: **guestsvalencia-site**
3. Ve a: **Settings → Domains**
4. Busca: `www.guestsvalencia.es`
5. Verás el valor CNAME tipo: `[HASH].vercel-dns.com`

### Opción 2: Después de añadir el dominio
Una vez que añadas `www.guestsvalencia.es` en Vercel, el hash aparecerá automáticamente.

### Opción 3: Usar el formato genérico
Si no aparece el hash específico, puedes usar:
```
cname.vercel-dns.com
```

---

## ✅ Valores Listos para Configurar

### Netlify (site.guestsvalencia.es)
```
CNAME: site.guestsvalencia.es → sandra-guestsvalencia.netlify.app
```

### Vercel (www.guestsvalencia.es)
```
CNAME: www.guestsvalencia.es → [HASH].vercel-dns.com
```
**Nota**: El hash se obtiene después de añadir el dominio en Vercel Dashboard.

---

## 🚀 Pasos Siguientes

1. **Añadir dominios en Vercel Dashboard**:
   - `guestsvalencia.es`
   - `www.guestsvalencia.es`
   
2. **Obtener el hash CNAME** de Vercel para `www.guestsvalencia.es`

3. **Configurar en PiensaSolution** todos los registros DNS

4. **Esperar propagación** (5-10 minutos)

5. **Verificar** que los dominios funcionan

---

## 📝 Notas

- El dominio `site.guestsvalencia.es` ya tiene el valor CNAME: `sandra-guestsvalencia.netlify.app`
- Los dominios `api.guestsvalencia.es` y `sandra.guestsvalencia.es` usan el CNAME genérico: `cname.vercel-dns.com`
- El dominio `www.guestsvalencia.es` necesita el hash específico de Vercel (se obtiene después de añadirlo)

---

**Última actualización**: Valores de Netlify confirmados, pendiente hash de Vercel

