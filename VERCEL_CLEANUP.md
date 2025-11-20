# 🧹 Limpieza de Configuración Vercel

## ✅ Cambios Realizados

### 1. Eliminado Workflow de Vercel del Repo de Sandra

**Archivo eliminado**: `.github/workflows/vercel.yml`

**Razón**: La PWA está en el repositorio separado `guestsvalencia-site`, no en el monorepo de Sandra.

### 2. Dominio Configurado en el Proyecto Correcto

**Proyecto Vercel**: `guestsvalencia-site` (no `guests-pwa`)

**Dominios asociados**:
- ✅ `www.guestsvalencia.es` → `guestsvalencia-site`
- ✅ `guestsvalencia.es` → `guestsvalencia-site`

## 📋 Estado Actual

### Repositorio de Sandra (`IA-SANDRA`):
- ❌ **NO tiene** workflow de Vercel
- ❌ **NO despliega** a Vercel automáticamente
- ✅ **Mantiene** solo servicios backend y desktop app

### Repositorio de PWA (`guestsvalencia-site`):
- ✅ **Tiene** `vercel.json` configurado
- ✅ **Despliega** automáticamente a Vercel
- ✅ **Dominio principal** apunta aquí
- ✅ **index.html** en la raíz funcionando

## 🎯 Configuración Final

**Dominio Principal**: `guestsvalencia.es` / `www.guestsvalencia.es`
- **Proyecto Vercel**: `guestsvalencia-site`
- **Repositorio**: `https://github.com/GUESTVALENCIA/guestsvalencia-site`
- **Deploy**: Automático al hacer push a `main`

## ✅ Verificación

1. **Dominio funciona**: `https://www.guestsvalencia.es`
2. **Deploy automático**: Push a `guestsvalencia-site` → Deploy en Vercel
3. **Sin conflictos**: No hay dos proyectos compitiendo por el dominio

---

**Estado**: ✅ **COMPLETADO** - Configuración limpia y correcta

