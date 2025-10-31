# 💳 EXPLICACIÓN COMPLETA: CRÉDITOS Y DEPLOYS EN NETLIFY

## 📊 ¿QUÉ SON LOS CRÉDITOS?

Los **créditos** son como una "moneda virtual" que Netlify usa para facturar en planes basados en créditos.

### Planes y Créditos:

- **Plan FREE (Gratis)**: 
  - ✅ 300 créditos por mes
  - ❌ **NO se acumulan** (si no los usas, se pierden)
  - ⏰ Se renuevan cada mes

- **Plan PRO ($19/mes)**: 
  - ✅ 1,000 créditos por mes
  - ❌ Tampoco se acumulan

---

## 💰 ¿QUÉ CONSUME CRÉDITOS Y QUÉ NO?

### ❌ LO QUE **SÍ CONSUME** CRÉDITOS (15 créditos cada uno):

1. **Deploy a Producción desde API/CLI**
   ```bash
   # ❌ ESTO CONSUME 15 CRÉDITOS:
   netlify deploy --prod
   npx netlify deploy --prod
   npm run deploy:force-api
   ```

   - Cada vez que ejecutas esto = **15 créditos menos**
   - Con plan FREE (300 créditos) = Solo **20 deploys por mes máximo**

### ✅ LO QUE **NO CONSUME** CRÉDITOS (100% GRATIS):

1. **Deploys desde GitHub** (Git-based deployments)
   - ✅ Cuando haces `git push` y Netlify detecta los cambios
   - ✅ Automático, sin costos
   - ✅ **ILIMITADOS**

2. **Deploy Previews** (Pull Requests)
   - ✅ Cuando creas un PR en GitHub
   - ✅ Netlify crea un preview del sitio
   - ✅ **GRATIS**

3. **Branch Deploys**
   - ✅ Deploys de branches que no son `main`
   - ✅ **GRATIS**

---

## 🔍 ¿POR QUÉ SE AGOTARON TUS CRÉDITOS?

Si estuviste usando:
```bash
netlify deploy --prod
# o
npx netlify deploy --prod
```

**Cada ejecución = 15 créditos**

**Ejemplo**:
- Plan FREE: 300 créditos
- 20 deploys × 15 créditos = 300 créditos ✅ (se acabaron)

---

## ✅ LA SOLUCIÓN (TU NUEVA POLÍTICA - CORRECTA)

### **SIEMPRE usar GitHub para deploy** → **100% GRATIS**

### Workflow Correcto:

```bash
# 1. Haces cambios en tu código

# 2. Commit
git add .
git commit -m "Descripción de cambios"

# 3. Push a GitHub
git push origin main

# ✅ Netlify detecta automáticamente el push
# ✅ Hace deploy automático
# ✅ 100% GRATIS (no consume créditos)
```

---

## 🚀 CÓMO FUNCIONA EL DEPLOY DESDE GITHUB

### Proceso Automático:

1. **Haces push a GitHub**
   ```bash
   git push origin main
   ```

2. **Netlify detecta el cambio**
   - Netlify está "escuchando" tu repositorio de GitHub
   - Cuando detecta un push → activa el deploy

3. **Netlify hace build automático**
   - Ejecuta: `npm run build`
   - Genera los archivos estáticos
   - Prepara las funciones serverless

4. **Netlify hace deploy**
   - Sube los archivos al CDN
   - Actualiza las funciones
   - **Sitio actualizado**

5. **Todo esto es GRATIS**
   - ✅ No consume créditos
   - ✅ Puedes hacerlo infinitas veces

---

## 📋 CONFIGURACIÓN NECESARIA (Una vez)

### Paso 1: Conectar GitHub a Netlify

1. Ir a Netlify Dashboard
2. Seleccionar tu sitio
3. **Site settings** → **Build & deploy**
4. **Continuous Deployment** → **Link repository**
5. Seleccionar GitHub → Autorizar
6. Seleccionar tu repositorio
7. Configurar:
   - Branch: `main`
   - Build command: `npm run build`
   - Publish directory: `frontend`
   - Functions directory: `netlify/functions`

### Paso 2: Verificar que tu repo local esté conectado

```bash
# Verificar si hay remote configurado
git remote -v

# Si NO aparece nada, agregar:
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git

# Verificar de nuevo
git remote -v
```

---

## 🎯 RESUMEN FINAL

### ❌ Lo que consumía tus créditos:
- Deploys manuales desde CLI con `--prod`
- Cada deploy = 15 créditos
- Plan FREE = máximo 20 deploys/mes

### ✅ Lo que NO consume créditos (tu nueva política):
- Deploys automáticos desde GitHub
- Cada `git push` = deploy gratis
- **ILIMITADOS** deploys

### 🚀 Tu nuevo workflow:
```bash
git add .
git commit -m "Cambios"
git push origin main
# → Deploy automático GRATIS
```

---

## 💡 VENTAJAS DEL MÉTODO GRATIS

1. **💰 100% Gratis** - No consume créditos
2. **🔄 Automático** - Cada push = deploy
3. **📊 Historial** - Todo queda registrado en GitHub
4. **↩️ Rollback fácil** - `git revert` y push
5. **👥 Colaboración** - Múltiples personas pueden deployar
6. **🔍 Visibilidad** - Ver qué se deployó y cuándo

---

## ⚠️ IMPORTANTE

### NUNCA más uses estos comandos:
```bash
# ❌ EVITAR:
netlify deploy --prod
npx netlify deploy --prod
```

### SIEMPRE usa esto:
```bash
# ✅ USAR:
git push origin main
```

---

**🎉 Conclusión: Los deploys desde GitHub son 100% GRATIS y tu mejor opción!**

