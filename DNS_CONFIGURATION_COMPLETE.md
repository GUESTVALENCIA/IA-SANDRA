# 🌐 Configuración DNS Completa - Vercel y Netlify

**Fecha**: 20 de noviembre de 2025

## ✅ Dominios Configurados

### Vercel (guestsvalencia-site)

**Proyecto ID**: `prj_HNCaiegvbQcqBHrV8kZwttlKrDPe`

**Dominios añadidos**:
- ✅ `guestsvalencia.es`
- ✅ `www.guestsvalencia.es`

**Estado**: Configurados en Vercel (pendiente de propagación DNS)

---

### Netlify (sitio corporativo)

**Dominio añadido**:
- ✅ `site.guestsvalencia.es`

**CNAME a configurar en PiensaSolution**:
```
site.guestsvalencia.es → [SITIO].netlify.app
```

---

## 📋 Registros DNS para PiensaSolution

### Registros A y CNAME

| Host | Tipo | Valor | Explicación |
|------|------|-------|-------------|
| `guestsvalencia.es` | A | `76.76.21.21` | IP de Vercel (servirá la PWA) |
| `www.guestsvalencia.es` | CNAME | `[HASH].vercel-dns.com` | Alias www → Vercel |
| `site.guestsvalencia.es` | CNAME | `[SITIO].netlify.app` | Landing corporativa en Netlify |
| `api.guestsvalencia.es` | CNAME | `cname.vercel-dns.com` | Proxy bridge HTTP (puerto 3800) |
| `sandra.guestsvalencia.es` | CNAME | `cname.vercel-dns.com` | Para futuras demos |

### Registros a Mantener (NO TOCAR)

- ✅ TXT (verificación Twilio)
- ✅ MX (correo)
- ✅ SPF (correo)

---

## 🔍 Cómo Obtener los Valores Faltantes

### Para `www.guestsvalencia.es` (CNAME de Vercel)

1. Ve a: https://vercel.com/dashboard
2. Selecciona el proyecto `guestsvalencia-site`
3. Ve a **Settings → Domains**
4. Busca `www.guestsvalencia.es`
5. Verás el valor CNAME tipo: `[HASH].vercel-dns.com`

**O ejecuta**:
```bash
node scripts/check-vercel-domains.js
```

### Para `site.guestsvalencia.es` (CNAME de Netlify)

1. Ve a: https://app.netlify.com
2. Selecciona el sitio
3. Ve a **Site Settings → Domain management**
4. Busca `site.guestsvalencia.es`
5. Verás el valor CNAME tipo: `[SITIO].netlify.app`

**O ejecuta**:
```bash
node scripts/configure-netlify-domain.js
```

---

## ✅ Checklist

### Vercel
- [x] Dominios añadidos en Vercel Dashboard
- [ ] DNS propagado (verificar en 5-10 minutos)
- [ ] Estado "Ready" en Vercel

### Netlify
- [x] Dominio añadido en Netlify Dashboard
- [ ] CNAME configurado en PiensaSolution
- [ ] DNS propagado (verificar en 5-10 minutos)

### PiensaSolution
- [ ] A record para `guestsvalencia.es` → `76.76.21.21`
- [ ] CNAME para `www.guestsvalencia.es` → `[HASH].vercel-dns.com`
- [ ] CNAME para `site.guestsvalencia.es` → `[SITIO].netlify.app`
- [ ] CNAME para `api.guestsvalencia.es` → `cname.vercel-dns.com`
- [ ] CNAME para `sandra.guestsvalencia.es` → `cname.vercel-dns.com`

---

## 🚀 Próximos Pasos

1. **Obtener valores CNAME** de Vercel y Netlify
2. **Configurar en PiensaSolution** los registros DNS
3. **Esperar propagación** (5-10 minutos típicamente)
4. **Verificar** que los dominios funcionan

---

**Última actualización**: Scripts ejecutados, pendiente de obtener valores CNAME específicos

