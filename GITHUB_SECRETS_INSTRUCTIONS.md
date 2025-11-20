# 🔐 Instrucciones para Añadir Secrets en GitHub

**Fecha**: 20 de noviembre de 2025

## 📋 Secrets Necesarios

Para que el workflow `.github/workflows/vercel.yml` funcione, añade estos secrets:

### 🔗 URL Directa

https://github.com/GUESTVALENCIA/IA-SANDRA/settings/secrets/actions

---

## ✅ Valores a Añadir

| Secret Name | Valor | Descripción |
|-------------|-------|--------------|
| `VERCEL_TOKEN` | `rTbbeIXzN70ZvXbG6L9Avj5d` | Token de API de Vercel |
| `VERCEL_ORG_ID` | `team_w9AY6yfr55sc9UzBFkS8OyY8` | ID de organización Vercel |
| `VERCEL_PROJECT_ID` | `prj_HNCaiegvbQcqBHrV8kZwttlKrDPe` | ID del proyecto guestsvalencia-site |

---

## 📝 Pasos

1. Ve a: https://github.com/GUESTVALENCIA/IA-SANDRA/settings/secrets/actions
2. Haz clic en **"New repository secret"**
3. Añade cada uno de los 3 secrets arriba
4. Guarda cada uno

---

## ✅ Verificación

Después de añadir los secrets, el workflow se ejecutará automáticamente en el próximo push a `main`.

---

**Nota**: Estos secrets son necesarios para el deployment automático a Vercel.

