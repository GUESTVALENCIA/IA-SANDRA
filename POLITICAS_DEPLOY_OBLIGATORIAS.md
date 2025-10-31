# 📋 POLÍTICAS DE DEPLOY OBLIGATORIAS

## 🚨 REGLAS CRÍTICAS - SIEMPRE APLICAR

### ✅ POLÍTICA #1: SIEMPRE TRABAJAR DESDE EL REPO GITHUB

**REGLA**: TODO el trabajo se hace desde el repositorio GitHub
- ✅ Código → Repo GitHub
- ✅ Cambios → Repo GitHub  
- ✅ NUNCA trabajar fuera del repo

---

### ✅ POLÍTICA #2: WORKFLOW OBLIGATORIO

**PASO A PASO (NO SALTAR NINGUNO)**:

1. **Hacer cambios en código**
   ↓
2. **Commit al repo**
   ```bash
   git add .
   git commit -m "Descripción"
   ```
   ↓
3. **Push a GitHub**
   ```bash
   git push origin main
   ```
   ↓
4. **⚠️ VERIFICAR DEPLOY EN NETLIFY (OBLIGATORIO)**
   - Esperar 6-8 segundos
   - Verificar que Netlify detectó el push
   - Verificar que el deploy se completó
   - Confirmar que el sitio está actualizado
   ↓
5. **✅ CONFIRMAR DEPLOY EXITOSO**
   ↓
6. **SIGUIENTE TAREA** (solo después de confirmar)

---

### ✅ POLÍTICA #3: NUNCA MÚLTIPLES DEPLOYS SIN VERIFICAR

**PROHIBIDO**:
- ❌ Hacer múltiples commits sin verificar deploys
- ❌ Enviar otro deploy sin verificar el anterior
- ❌ Asumir que el deploy funcionó sin verificar

**OBLIGATORIO**:
- ✅ Un deploy a la vez
- ✅ Verificar que se completó
- ✅ Confirmar antes del siguiente

---

### ✅ POLÍTICA #4: VERIFICACIÓN DE DEPLOY

**DESPUÉS DE CADA `git push`**:

1. **Esperar 6-8 segundos** (tiempo normal de deploy)

2. **Verificar en Netlify Dashboard**:
   - Ir a: https://app.netlify.com/
   - Verificar sección "Deploys"
   - Confirmar que el último deploy es del push reciente
   - Verificar estado: "Published" o "Building"

3. **Verificar sitio público**:
   - Abrir: https://sandra.guestsvalencia.es
   - Verificar que cambios se reflejan
   - O hacer un health check

4. **Solo entonces continuar con siguiente tarea**

---

## 🚨 VIOLACIONES COMUNES A EVITAR

### ❌ ERROR #1: Push sin verificar deploy
**Problema**: Hacer push → asumir que funcionó → siguiente commit
**Solución**: SIEMPRE verificar deploy antes de continuar

### ❌ ERROR #2: Múltiples deploys simultáneos
**Problema**: Varios commits seguidos sin verificar
**Solución**: Uno a la vez, verificar, siguiente

### ❌ ERROR #3: No seguir el flujo completo
**Problema**: Saltarse pasos del workflow
**Solución**: Seguir TODOS los pasos siempre

---

## ✅ WORKFLOW CORRECTO (EJEMPLO)

```
1. Hacer cambio en código
   ↓
2. git add .
   ↓
3. git commit -m "Cambio X"
   ↓
4. git push origin main
   ↓
5. ⏳ ESPERAR 6-8 segundos
   ↓
6. 🔍 VERIFICAR DEPLOY en Netlify
   ↓
7. ✅ CONFIRMAR deploy exitoso
   ↓
8. ✅ OK - Continuar con siguiente tarea
```

---

## 📝 RECORDATORIO PARA AI

**SIEMPRE**:
- ✅ Trabajar desde repo GitHub
- ✅ Commit + Push
- ✅ Verificar deploy completado (6-8 segundos)
- ✅ Confirmar antes de siguiente paso
- ✅ UN deploy a la vez

**NUNCA**:
- ❌ Múltiples deploys sin verificar
- ❌ Asumir que deploy funcionó
- ❌ Saltarse verificación

---

**Estas políticas son OBLIGATORIAS y deben aplicarse SIEMPRE.**

