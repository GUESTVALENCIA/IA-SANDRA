# 🚨 ACCIONES URGENTES DE SEGURIDAD

## ⚠️ PROBLEMAS CRÍTICOS DETECTADOS

### P0 - BLOQUEADORES (RESOLVER HOY)

1. **🔴 API Keys Expuestas**
   - Archivos HTML con keys hardcodeadas
   - Acción: REVOCAR keys inmediatamente
   - Script: `npm run security-check` para detectar

2. **🔴 Archivos .env en Git**
   - `.env` o `.env.production` pueden estar en git
   - Acción: `git rm --cached .env .env.production`
   - Verificar con: `git ls-files | grep .env`

3. **🔴 .gitignore Corrupto**
   - Puede tener merge conflicts
   - Acción: Verificar y corregir

## 🛠️ SOLUCIÓN PASO A PASO

### 1. REVOCAR API KEYS EXPUESTAS (INMEDIATO)

```bash
# Ejecutar script de verificación
npm run security-check

# Si encuentra keys, REVOCARLAS:
# - OpenAI: https://platform.openai.com/api-keys
# - Cartesia: https://console.cartesia.ai/settings/api-keys
# - Deepgram: https://console.deepgram.com/project/keys
```

### 2. ELIMINAR ARCHIVOS .env DE GIT

```bash
# Verificar qué archivos .env están en git
git ls-files | grep .env

# Eliminar del índice (mantiene archivo local)
git rm --cached .env
git rm --cached .env.production

# Commit (IMPORTANTE: las keys ya están comprometidas en el historial)
git commit -m "SECURITY: Remove .env files from git"
```

### 3. VERIFICAR/CORREGIR .gitignore

```bash
# Verificar que .gitignore incluye:
cat .gitignore | grep ".env"

# Debe incluir:
# .env
# .env.*
# !.env.example
```

### 4. GENERAR NUEVAS API KEYS

- **OpenAI**: https://platform.openai.com/api-keys
- **Cartesia**: Dashboard de Cartesia
- **Deepgram**: Dashboard de Deepgram

### 5. ACTUALIZAR .env LOCAL

```bash
# Copiar template
cp .env.example .env

# Editar con nuevas keys
nano .env  # o tu editor preferido
```

### 6. BUSCAR Y ELIMINAR KEYS EN HTML

```bash
# Buscar en archivos HTML
grep -r "sk-" frontend/ --include="*.html"

# Si encuentra keys, ELIMINARLAS y usar variables de entorno
```

### 7. LIMPIAR HISTORIAL DE GIT (OPCIONAL)

Si las keys están en commits anteriores:

```bash
# ⚠️ CUIDADO: Esto reescribe el historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env .env.production" \
  --prune-empty --tag-name-filter cat -- --all

# O usar BFG Repo-Cleaner (más seguro)
```

## ✅ CHECKLIST POST-REVOCACIÓN

- [ ] API keys revocadas en todas las plataformas
- [ ] Nuevas keys generadas
- [ ] `.env` actualizado con nuevas keys
- [ ] `.env` eliminado de git (`git rm --cached`)
- [ ] `.gitignore` verificado y corregido
- [ ] Keys eliminadas de archivos HTML
- [ ] `npm run security-check` pasa sin errores
- [ ] Archivos HTML actualizados para usar variables de entorno

## 🛡️ PREVENCIÓN FUTURA

### Pre-commit Hook (Recomendado)

Crear `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Pre-commit hook para detectar keys

if git diff --cached --name-only | grep -E "\.(env|html)$"; then
  echo "⚠️  WARNING: Environment files or HTML detected"
  echo "Checking for API keys..."
  npm run security-check
  if [ $? -ne 0 ]; then
    echo "❌ Security check failed. Commit blocked."
    exit 1
  fi
fi
```

### CI/CD Check

Agregar a GitHub Actions o similar:

```yaml
- name: Security Check
  run: npm run security-check
```

## 📞 CONTACTO DE EMERGENCIA

Si las keys están comprometidas:

1. **Revocar INMEDIATAMENTE** en los dashboards
2. **Monitorear uso** de las keys revocadas
3. **Revisar logs** de acceso no autorizado
4. **Generar nuevas keys** y actualizar `.env`

## 🔗 ENLACES ÚTILES

- OpenAI API Keys: https://platform.openai.com/api-keys
- Cartesia Dashboard: https://console.cartesia.ai
- Deepgram Dashboard: https://console.deepgram.com
- Git BFG Cleaner: https://rtyley.github.io/bfg-repo-cleaner/

---

**⚠️ URGENTE: Ejecutar `npm run security-check` ahora mismo**

