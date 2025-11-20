# 📝 Instrucciones Simples - Configuración DNS

## 🎯 Lo que necesitas hacer

### 1️⃣ En PiensaSolution (DNS)

Configura estos registros:

```
guestsvalencia.es          A      76.76.21.21
www.guestsvalencia.es      CNAME  nuxwxfa4j.vercel-dns.com
site.guestsvalencia.es     CNAME  sandra-guestsvalencia.netlify.app
api.guestsvalencia.es      CNAME  cname.vercel-dns.com
sandra.guestsvalencia.es   CNAME  cname.vercel-dns.com
```

### 2️⃣ En Vercel Dashboard

1. Ve a: https://vercel.com/dashboard
2. Proyecto: **guestsvalencia-site**
3. **Settings → Domains → Add Domain**
4. Añade: `guestsvalencia.es` y `www.guestsvalencia.es`
5. Vercel te dará las instrucciones de DNS (ya las tienes arriba)

### 3️⃣ En Netlify Dashboard

1. Ve a: https://app.netlify.com
2. Sitio: **sandra-guestsvalencia**
3. **Site Settings → Domain management → Add custom domain**
4. Añade: `site.guestsvalencia.es`
5. Netlify te mostrará el CNAME (ya lo tienes: `sandra-guestsvalencia.netlify.app`)

---

## ✅ Valores Listos

- ✅ `www.guestsvalencia.es` → `nuxwxfa4j.vercel-dns.com`
- ✅ `site.guestsvalencia.es` → `sandra-guestsvalencia.netlify.app`

**Solo necesitas añadirlos en los dashboards y configurar los CNAME en PiensaSolution.**

---

## ⏱️ Tiempo de Propagación

Después de configurar en PiensaSolution, espera **5-10 minutos** para que los DNS propaguen.

