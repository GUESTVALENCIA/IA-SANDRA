# 🚀 SETUP: DEPLOY GRATIS DESDE GITHUB

## 📋 PASOS PARA CONFIGURAR (Una vez)

### 1. Crear Repositorio en GitHub

1. Ir a: https://github.com/new
2. Nombre: `sandra-devconsole` (o el que prefieras)
3. Descripción: "Sandra DevConsole - AI Assistant"
4. Público o Privado (tu elección)
5. **NO** inicializar con README, .gitignore o license
6. Click **"Create repository"**

---

### 2. Conectar Repo Local a GitHub

**Ejecutar estos comandos**:

```bash
cd "C:\Users\clayt\AppData\Local\Programs\Sandra DevConsole\extracted_app"

# Agregar remote (REEMPLAZA con tu URL de GitHub)
git remote add origin https://github.com/TU-USUARIO/sandra-devconsole.git

# Verificar que se agregó
git remote -v

# Hacer primer push
git push -u origin main
```

**Si tienes autenticación en GitHub**, se te pedirá credenciales.

**Si no tienes autenticación**, puedes usar:
- Personal Access Token (recomendado)
- GitHub CLI (`gh auth login`)

---

### 3. Configurar Netlify para GitHub

1. Ir a: https://app.netlify.com
2. Seleccionar tu sitio: `grand-pasca-a584d5`
3. **Site settings** → **Build & deploy**
4. **Continuous Deployment** → **Link repository**
5. Seleccionar **GitHub**
6. Autorizar Netlify (si es necesario)
7. Seleccionar tu repositorio: `sandra-devconsole`
8. Configurar:
   - **Branch**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend`
   - **Functions directory**: `netlify/functions`
9. Click **"Deploy site"**

---

### 4. Verificar Variables de Entorno

Netlify Dashboard → **Site settings** → **Environment variables**

Asegúrate de tener:
- `OPENAI_API_KEY`
- `DEEPGRAM_API_KEY`
- `CARTESIA_API_KEY`
- `HEYGEN_API_KEY`
- `NODE_ENV=production`
- `ALLOWED_ORIGIN=https://sandra.guestsvalencia.es`

---

## 🔄 WORKFLOW DIARIO (Desde Ahora)

### Cada vez que quieras hacer deploy:

```bash
# 1. Hacer tus cambios en el código

# 2. Validar y build local (opcional pero recomendado)
npm run deploy:check

# 3. Commit
git add .
git commit -m "Descripción de los cambios"

# 4. Push (esto activa deploy GRATIS automático)
git push origin main

# ✅ Netlify detectará automáticamente
# ✅ Hará build y deploy GRATIS
# ✅ No consume créditos
```

---

## ✅ VENTAJAS DE ESTE MÉTODO

1. **💰 100% GRATIS** - No consume créditos
2. **🔄 Automático** - Cada push = deploy
3. **📊 Historial completo** - Todo en GitHub
4. **↩️ Rollback fácil** - `git revert` y push
5. **👥 Colaboración** - Múltiples devs pueden deployar
6. **🔍 Visibilidad** - Ver qué se deployó y cuándo

---

## 🎯 ESTADO ACTUAL

**Listo para configurar**:
- ✅ Repo git inicializado
- ✅ Commits realizados
- ⏳ Falta: Conectar remote de GitHub
- ⏳ Falta: Configurar Netlify para escuchar GitHub

---

## 📝 NOTAS IMPORTANTES

### ⚠️ NUNCA uses estos comandos (consumen créditos):
```bash
# ❌ NO HACER:
netlify deploy --prod
npx netlify deploy --prod
npm run deploy:force-api  # Solo para emergencias
```

### ✅ SIEMPRE usa esto (gratis):
```bash
# ✅ HACER:
git push origin main
```

---

**Una vez configurado, todos los deploys serán GRATIS** 🎉

