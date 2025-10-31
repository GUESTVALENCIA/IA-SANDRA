# 💳 NETLIFY: CRÉDITOS Y DEPLOYS - EXPLICACIÓN COMPLETA

## 📊 CÓMO FUNCIONAN LOS CRÉDITOS EN NETLIFY

### 🆓 DEPLOYS GRATUITOS (Sin consumir créditos)
- ✅ **Deploys desde GitHub** (Git-based deployments) - **GRATIS**
- ✅ **Deploy Previews** (PR/Pull Requests) - **GRATIS**
- ✅ **Branch Deploys** (deploys de branches no-production) - **GRATIS**

### 💰 DEPLOYS QUE CONSUMEN CRÉDITOS
- ❌ **Deploy a Producción desde API/CLI** - Consume **15 créditos por deploy**
- ❌ **Deploys manuales desde Netlify CLI con `--prod`** - Consume créditos

---

## 🎯 TU POLÍTICA (La Correcta)

### ✅ WORKFLOW RECOMENDADO (GRATIS)

```
1. Código en Local
   ↓
2. Git Commit
   ↓
3. Git Push a GitHub
   ↓
4. Netlify detecta cambios automáticamente
   ↓
5. Netlify hace deploy GRATIS (Git-based)
   ↓
6. ✅ Site actualizado sin consumir créditos
```

**Ventajas**:
- ✅ **100% GRATIS** (no consume créditos)
- ✅ Automático (cada push = deploy)
- ✅ Historial completo en GitHub
- ✅ Rollback fácil (git revert)

---

## ⚠️ QUÉ EVITAR (Consume Créditos)

### ❌ NO HACER:
```bash
# ❌ ESTO CONSUME 15 CRÉDITOS:
netlify deploy --prod
npx netlify deploy --prod
```

### ✅ HACER EN SU LUGAR:
```bash
# ✅ ESTO ES GRATIS:
git add .
git commit -m "Cambios"
git push origin main
# Netlify hace deploy automático GRATIS
```

---

## 📋 CONFIGURACIÓN ACTUAL

### Estado del Repo Git:
- ✅ Repo git inicializado
- ⚠️ **Falta**: Conectar remote de GitHub
- ⚠️ **Falta**: Configurar Netlify para escuchar GitHub

---

## 🚀 PRÓXIMOS PASOS

### 1. Conectar Repo a GitHub
1. Crear repo en GitHub (si no existe)
2. Agregar remote:
   ```bash
   git remote add origin https://github.com/tu-usuario/tu-repo.git
   ```

### 2. Configurar Netlify para GitHub
1. Netlify Dashboard → Site settings
2. Build & deploy → Continuous Deployment
3. Conectar repositorio de GitHub
4. Seleccionar branch: `main` o `master`
5. Configurar:
   - Build command: `npm run build`
   - Publish directory: `frontend`
   - Functions directory: `netlify/functions`

### 3. Workflow de Deploy (Desde Ahora)
```bash
# Siempre usar este workflow:
git add .
git commit -m "Descripción de cambios"
git push origin main

# Netlify detectará automáticamente y hará deploy GRATIS
```

---

## 💡 EXPLICACIÓN DEL SISTEMA DE CRÉDITOS

### ¿Qué son los créditos?
- Son la moneda de facturación de Netlify en planes basados en créditos
- Cada acción consume una cantidad específica
- Se renuevan cada mes

### ¿Cuántos créditos tienes?
- **Plan Free**: 300 créditos/mes
- **Plan Pro**: 1,000 créditos/mes
- Los créditos no consumidos **NO se acumulan**

### ¿Por qué se agotaron?
Si usaste `netlify deploy --prod` varias veces:
- Cada deploy = 15 créditos
- 300 créditos ÷ 15 = **solo 20 deploys/mes en plan free**
- Con GitHub deploys: **ILIMITADOS** (gratis)

---

## ✅ SOLUCIÓN IMPLEMENTADA

He preparado todo para usar **GitHub deploys (GRATIS)**:
- ✅ Scripts ajustados
- ✅ Workflow documentado
- ✅ Configuración lista

**Solo falta**: Conectar repo a GitHub y configurar en Netlify Dashboard.

---

## 📚 REFERENCIAS

- [Cómo funcionan los créditos](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work)
- [Deploys desde GitHub](https://docs.netlify.com/deploy/deploy-overview/)
- [Continuous Deployment](https://docs.netlify.com/deploy/continuous-deployment/)

---

**Resumen**: Deploys desde GitHub = **GRATIS**. Deploys desde API/CLI = **Consumen créditos**.

**Política correcta**: Siempre commit + push a GitHub ✅

