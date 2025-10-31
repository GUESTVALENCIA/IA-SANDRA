# 📋 POLÍTICAS DE TRABAJO - SANDRA DEVCONSOLE

## 🎯 TRIÁNGULO DE TRABAJO (WORKFLOW ESENCIAL)

```
     ┌─────────────┐
     │   GITHUB    │
     │   (REPO)    │
     └──────┬──────┘
            │
            │ push/pull
            │
     ┌──────▼──────┐
     │   NETLIFY   │
     │  (DEPLOY)   │
     └──────┬──────┘
            │
            │ sync
            │
     ┌──────▼──────┐
     │   LOCAL     │
     │  (FILES)    │
     └─────────────┘
```

## ✅ POLÍTICAS OBLIGATORIAS

### 1. **SIEMPRE GITHUB PRIMERO**
- ✅ Todo código → Commit → Push a GitHub
- ✅ Nunca deployar sin push a GitHub
- ✅ GitHub es la fuente de verdad

### 2. **DEPLOY GRATIS DESDE GITHUB**
- ✅ Netlify escucha GitHub automáticamente
- ✅ Cada `git push` → Deploy automático GRATIS
- ✅ NUNCA usar `netlify deploy --prod` (consume créditos)

### 3. **MOVIMIENTO ENTRE 3 PUNTOS**
- 🔄 **Repo GitHub** ↔ **Netlify** ↔ **Archivos Locales**
- Siempre verificar los 3 puntos
- Mantener sincronización constante

### 4. **WORKFLOW ESTÁNDAR**
```
1. Cambios locales
   ↓
2. Commit local
   ↓
3. Push a GitHub
   ↓
4. Netlify detecta y hace deploy GRATIS
   ↓
5. Verificar en Netlify Dashboard
```

## 🚫 NUNCA HACER

- ❌ Deploy sin push a GitHub
- ❌ `netlify deploy --prod` (consume créditos)
- ❌ Trabajar solo en local sin commitear
- ❌ Olvidar verificar el repo existente

## ✅ SIEMPRE HACER

- ✅ Verificar repo GitHub antes de trabajar
- ✅ Commit + Push antes de cualquier deploy
- ✅ Verificar estado en Netlify después de push
- ✅ Documentar cambios en el triángulo

## 📍 CONTEXTO ACTUAL

- **Repo**: `https://github.com/GUESTVALENCIA/IA-SANDRA.git`
- **Netlify**: Deploy automático desde GitHub
- **Local**: `C:\Users\clayt\AppData\Local\Programs\Sandra DevConsole\extracted_app`

---

**Estas son las políticas de trabajo. SIEMPRE aplicarlas.**

