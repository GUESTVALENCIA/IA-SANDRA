# 🚨 SOLUCIÓN URGENTE - ERROR DE DEPLOY EN NETLIFY

## El Problema
Netlify está leyendo `sandra-deploy}` con un `}` extra que NO está en los archivos del repositorio.

## Solución Inmediata (HAZLO AHORA)

### Paso 1: Ve a la configuración de Netlify
👉 **CLICK AQUÍ**: https://app.netlify.com/sites/grand-pasca-a584d5/settings/deploys#build-settings

### Paso 2: Busca "Build settings"
En la sección **"Build settings"**, encuentra el campo **"Publish directory"**

### Paso 3: Corrige el error
- **ACTUAL** (incorrecto): `sandra-deploy}`
- **CAMBIAR A**: `sandra-deploy`

⚠️ **IMPORTANTE**: Quita el `}` al final!

### Paso 4: Guarda los cambios
Click en el botón **"Save"** para guardar

### Paso 5: Activa un nuevo deploy
- Ve a: https://app.netlify.com/sites/grand-pasca-a584d5/deploys
- Click en **"Trigger deploy"** → **"Deploy site"**

## Verificación

✅ Los archivos están correctos:
- `netlify.toml` dice: `publish = "sandra-deploy"` ✓
- `netlify.json` dice: `"publish": "sandra-deploy"` ✓
- La carpeta `sandra-deploy` existe con `index.html` ✓

❌ La configuración en Netlify UI tiene un error:
- Está leyendo: `sandra-deploy}` (con `}` extra)

## Si no funciona

Si después de corregir en la UI sigue sin funcionar:

1. **Opción A**: Elimina completamente el valor del campo "Publish directory" en la UI (déjalo vacío)
2. **Opción B**: En la misma página, busca "Environment variables" y añade:
   - Key: `PUBLISH_DIR`
   - Value: `sandra-deploy`

## Resultado Esperado

Una vez corregido, el sitio se desplegará correctamente en:
https://sandra.guestsvalencia.es

---

**NOTA**: El draft deploy funcionó perfectamente, lo que confirma que los archivos están bien.
Solo necesitas corregir la configuración en la UI de Netlify.