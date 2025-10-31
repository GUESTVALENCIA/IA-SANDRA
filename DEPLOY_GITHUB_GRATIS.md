# 🚀 DEPLOY GRATIS DESDE GITHUB - GUÍA RÁPIDA

## ✅ POLÍTICA DE DEPLOY ESTABLECIDA

**SIEMPRE**: Commit + Push a GitHub → Deploy automático GRATIS

**NUNCA**: `netlify deploy --prod` (consume 15 créditos)

---

## 📋 CONFIGURACIÓN INICIAL (Una vez)

### Paso 1: Crear Repo en GitHub

1. Ir a https://github.com/new
2. Nombre: `sandra-devconsole` (o el que prefieras)
3. Crear repositorio (público o privado)

### Paso 2: Conectar Local a GitHub

```bash
cd "C:\Users\clayt\AppData\Local\Programs\Sandra DevConsole\extracted_app"

# Agregar remote (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git

# Verificar
git remote -v
```

### Paso 3: Configurar Netlify para GitHub

1. Netlify Dashboard → Site settings
2. **Build & deploy** → **Continuous Deployment**
3. Click **"Link repository"**
4. Seleccionar GitHub → Autorizar → Seleccionar repo
5. Configurar:
   - **Branch**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend`
   - **Functions directory**: `netlify/functions`
6. Click **"Deploy site"**

---

## 🔄 WORKFLOW DIARIO (Desde Ahora)

### Cada vez que hagas cambios:

```bash
# 1. Hacer cambios en código

# 2. Commit
git add .
git commit -m "Descripción de los cambios"

# 3. Push (esto activa deploy GRATIS automático)
git push origin main

# ✅ Netlify detecta el push y hace deploy automáticamente
# ✅ GRATIS (no consume créditos)
```

---

## ✅ VENTAJAS

1. **💰 GRATIS**: No consume créditos
2. **🔄 Automático**: Cada push = deploy automático
3. **📊 Historial**: Todo en GitHub
4. **↩️ Rollback fácil**: `git revert`
5. **👥 Colaboración**: Múltiples personas pueden deployar

---

## ⚙️ CONFIGURACIÓN ACTUAL

### GitHub Actions Workflow
Ya existe: `.github/workflows/deploy.yml`

**Funciona así**:
1. Push a GitHub
2. GitHub Actions detecta
3. Ejecuta build
4. Deploy a Netlify (si está configurado)

---

## 🎯 PRÓXIMO PASO

**Ahora mismo**: Configurar remote de GitHub

```bash
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

**Luego**: Conectar en Netlify Dashboard

---

**Estado**: ✅ **CONFIGURACIÓN LISTA PARA GITHUB DEPLOYS GRATIS**

