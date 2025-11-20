# 🔄 Migración de Dominio a Proyecto Correcto

## ✅ Cambios Realizados

### 1. Dominios Movidos al Proyecto Correcto

**Proyecto Anterior** (incorrecto): `guests-pwa` (prj_xEESQwQomxT8svc4Q82AfIXny9Wu)
**Proyecto Correcto**: `guestsvalencia-site` (prj_HNCaiegvbQcqBHrV8kZwttlKrDPe)

**Dominios migrados**:
- ✅ `www.guestsvalencia.es` → Ahora en `guestsvalencia-site`
- ✅ `guestsvalencia.es` → Ahora en `guestsvalencia-site`

### 2. Workflow Eliminado del Repo de Sandra

**Archivo eliminado**: `.github/workflows/vercel.yml`

**Razón**: La PWA está en el repositorio separado `guestsvalencia-site`, no necesita deploy desde Sandra.

## 📋 Estado Final

### Proyecto Vercel: `guestsvalencia-site`
- ✅ **Repositorio**: `https://github.com/GUESTVALENCIA/guestsvalencia-site`
- ✅ **Dominios**:
  - `www.guestsvalencia.es`
  - `guestsvalencia.es`
- ✅ **Deploy**: Automático al hacer push a `main`
- ✅ **index.html**: En la raíz, funcionando correctamente

### Proyecto Vercel: `guests-pwa` (antiguo)
- ⚠️ **Ya no tiene** dominios asociados
- ⚠️ **Puede eliminarse** si no se usa

## 🎯 Resultado

**Dominio Principal**: `https://www.guestsvalencia.es` / `https://guestsvalencia.es`
- ✅ Apunta al proyecto correcto: `guestsvalencia-site`
- ✅ Sirve el `index.html` desde la raíz
- ✅ Deploy automático desde el repo correcto

---

**Estado**: ✅ **COMPLETADO** - Dominio apunta al proyecto correcto

