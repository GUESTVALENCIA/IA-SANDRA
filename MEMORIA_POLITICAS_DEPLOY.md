# 🧠 MEMORIA PERMANENTE: POLÍTICAS DE DEPLOY

## 📋 POLÍTICAS CRÍTICAS - MEMORIZAR PERMANENTEMENTE

### ✅ REGLA FUNDAMENTAL #1: SIEMPRE TRABAJAR DESDE REPO GITHUB

**TODO** el trabajo se hace desde el repositorio GitHub.
- ✅ Código → Repo
- ✅ Cambios → Repo
- ✅ NUNCA trabajar fuera del repo

---

### ✅ REGLA FUNDAMENTAL #2: WORKFLOW OBLIGATORIO COMPLETO

**NUNCA SALTAR PASOS**:

```
1. Cambios en código
   ↓
2. git add .
   ↓
3. git commit -m "mensaje"
   ↓
4. git push origin main
   ↓
5. ⏳ ESPERAR 6-8 SEGUNDOS (OBLIGATORIO)
   ↓
6. 🔍 VERIFICAR DEPLOY COMPLETADO (OBLIGATORIO)
   - Verificar en Netlify Dashboard
   - O verificar sitio público
   - O usar script: npm run deploy:verify
   ↓
7. ✅ CONFIRMAR DEPLOY EXITOSO
   ↓
8. ✅ OK - Continuar con siguiente tarea
```

---

### ✅ REGLA FUNDAMENTAL #3: UN DEPLOY A LA VEZ

**PROHIBIDO**:
- ❌ Múltiples commits sin verificar
- ❌ Push → siguiente push sin verificar
- ❌ Asumir que funcionó sin verificar

**OBLIGATORIO**:
- ✅ Un deploy a la vez
- ✅ Verificar que se completó
- ✅ Confirmar antes del siguiente

---

### ✅ REGLA FUNDAMENTAL #4: VERIFICACIÓN SIEMPRE

**DESPUÉS DE CADA `git push`**:

1. **Esperar 6-8 segundos** (tiempo normal de deploy en Netlify)

2. **Verificar deploy** (una de estas opciones):
   - Opción A: Netlify Dashboard → Verificar último deploy
   - Opción B: Sitio público → Verificar cambios reflejados
   - Opción C: Script automático → `npm run deploy:verify`

3. **Solo después de confirmar** → Continuar con siguiente tarea

---

## 🚨 VIOLACIONES CRÍTICAS

### ❌ NUNCA HACER:
1. Push sin verificar deploy
2. Múltiples deploys simultáneos
3. Saltarse verificación
4. Asumir que deploy funcionó

### ✅ SIEMPRE HACER:
1. Push → Esperar 6-8s → Verificar → Confirmar
2. Un deploy a la vez
3. Seguir TODOS los pasos
4. Confirmar antes de continuar

---

## 📝 PARA AI - RECORDATORIO PERMANENTE

**CADA VEZ QUE HAGO `git push`**:

1. ⏳ ESPERO 6-8 segundos
2. 🔍 VERIFICO que el deploy se completó
3. ✅ CONFIRMO que está publicado
4. ✅ SOLO ENTONCES continúo

**NUNCA**:
- Asumir que funcionó
- Saltar verificación
- Múltiples deploys sin verificar

---

**ESTAS POLÍTICAS SON PERMANENTES Y OBLIGATORIAS.**

