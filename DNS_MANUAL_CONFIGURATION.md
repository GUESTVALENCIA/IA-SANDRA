# 🌐 Configuración Manual de DNS - Vercel y Netlify

**Fecha**: 20 de noviembre de 2025

## ⚠️ Problema

Los valores CNAME no se pueden cambiar directamente desde la API. Necesitas configurarlos manualmente en los dashboards.

---

## 📋 Valores DNS para PiensaSolution

### ✅ Valores Confirmados

| Host | Tipo | Valor | Dónde Configurar |
|------|------|-------|------------------|
| `guestsvalencia.es` | A | `76.76.21.21` | PiensaSolution |
| `www.guestsvalencia.es` | CNAME | `nuxwxfa4j.vercel-dns.com` | PiensaSolution |
| `site.guestsvalencia.es` | CNAME | `sandra-guestsvalencia.netlify.app` | PiensaSolution |
| `api.guestsvalencia.es` | CNAME | `cname.vercel-dns.com` | PiensaSolution |
| `sandra.guestsvalencia.es` | CNAME | `cname.vercel-dns.com` | PiensaSolution |

---

## 🔧 Configuración en Vercel

### Paso 1: Añadir Dominios en Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Selecciona el proyecto: **guestsvalencia-site**
3. Ve a: **Settings → Domains**
4. Haz clic en **Add Domain**
5. Añade:
   - `guestsvalencia.es`
   - `www.guestsvalencia.es`

### Paso 2: Obtener el Valor CNAME

Después de añadir `www.guestsvalencia.es`, Vercel mostrará:
- El valor CNAME que debes usar (normalmente tipo: `[HASH].vercel-dns.com`)
- O el valor genérico: `cname.vercel-dns.com`

**Valor actual detectado**: `nuxwxfa4j.vercel-dns.com`

### Paso 3: Configurar en PiensaSolution

En PiensaSolution, configura:
```
www.guestsvalencia.es  CNAME  nuxwxfa4j.vercel-dns.com
```

---

## 🔧 Configuración en Netlify

### Paso 1: Añadir Dominio en Netlify Dashboard

1. Ve a: https://app.netlify.com
2. Selecciona el sitio: **sandra-guestsvalencia**
3. Ve a: **Site Settings → Domain management → Custom domains**
4. Haz clic en **Add custom domain**
5. Añade: `site.guestsvalencia.es`

### Paso 2: Obtener el Valor CNAME

Netlify mostrará el valor CNAME que debes usar:
- Normalmente: `[SITIO].netlify.app`
- O el valor específico que te indique

**Valor actual detectado**: `sandra-guestsvalencia.netlify.app`

### Paso 3: Configurar en PiensaSolution

En PiensaSolution, configura:
```
site.guestsvalencia.es  CNAME  sandra-guestsvalencia.netlify.app
```

---

## ✅ Checklist de Configuración

### Vercel
- [ ] Añadir `guestsvalencia.es` en Vercel Dashboard
- [ ] Añadir `www.guestsvalencia.es` en Vercel Dashboard
- [ ] Verificar que aparecen en la lista de dominios
- [ ] Copiar el valor CNAME mostrado por Vercel

### Netlify
- [ ] Añadir `site.guestsvalencia.es` en Netlify Dashboard
- [ ] Verificar que aparece en la lista de dominios
- [ ] Copiar el valor CNAME mostrado por Netlify

### PiensaSolution
- [ ] Configurar A record: `guestsvalencia.es` → `76.76.21.21`
- [ ] Configurar CNAME: `www.guestsvalencia.es` → `nuxwxfa4j.vercel-dns.com`
- [ ] Configurar CNAME: `site.guestsvalencia.es` → `sandra-guestsvalencia.netlify.app`
- [ ] Configurar CNAME: `api.guestsvalencia.es` → `cname.vercel-dns.com`
- [ ] Configurar CNAME: `sandra.guestsvalencia.es` → `cname.vercel-dns.com`

---

## 🚨 Notas Importantes

1. **Los valores CNAME se generan automáticamente** cuando añades el dominio en Vercel/Netlify
2. **No puedes cambiarlos manualmente** - son generados por la plataforma
3. **El valor puede cambiar** si eliminas y vuelves a añadir el dominio
4. **Espera 5-10 minutos** después de configurar en PiensaSolution para que propague

---

## 🔍 Verificación

Después de configurar todo:

1. **Vercel**: Verifica en Dashboard → Settings → Domains que los dominios aparecen
2. **Netlify**: Verifica en Site Settings → Domain management que el dominio aparece
3. **PiensaSolution**: Verifica que todos los registros DNS están configurados
4. **Espera propagación**: 5-10 minutos
5. **Prueba**: Accede a `www.guestsvalencia.es` y `site.guestsvalencia.es`

---

**Última actualización**: Valores detectados, pendiente configuración manual en dashboards

