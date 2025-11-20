# 🧹 Limpieza de Deployments en Netlify

## 📋 Instrucciones

Este script limpia todos los deployments pendientes, pausados, con errores o antiguos en tu cuenta de Netlify para liberar créditos.

## 🔑 Obtener Token de Netlify

1. Ve a: https://app.netlify.com/user/applications
2. Haz clic en "New access token"
3. Dale un nombre (ej: "Sandra Cleanup Script")
4. Copia el token generado (solo se muestra una vez)

## 🚀 Ejecutar Limpieza

### Opción 1: Script Interactivo (Recomendado)

```bash
node scripts/cleanup-netlify-deployments-interactive.js
```

El script te pedirá:
- Tu token de Netlify (si no está en .env.pro)
- Qué sitio(s) quieres limpiar

### Opción 2: Con Token en .env.pro

1. Añade a `.env.pro`:
```env
NETLIFY_TOKEN=tu_token_aqui
```

2. Ejecuta:
```bash
node scripts/cleanup-netlify-deployments.js
```

### Opción 3: Con Token en Variable de Entorno

```bash
# Windows PowerShell
$env:NETLIFY_TOKEN="tu_token_aqui"
node scripts/cleanup-netlify-deployments.js

# Linux/Mac
NETLIFY_TOKEN="tu_token_aqui" node scripts/cleanup-netlify-deployments.js
```

## 🎯 Qué Limpia el Script

El script elimina/cancela:
- ✅ Deployments en estado `building`, `enqueued`, `processing`, `new` (pendientes)
- ✅ Deployments con estado `error`, `canceled`, `failed` (con errores)
- ✅ Deployments `ready` pero no publicados
- ✅ Deployments antiguos (>30 días) no publicados

**NO elimina:**
- ❌ Deployments publicados y activos
- ❌ Deployments recientes (<30 días) publicados

## 📊 Ejemplo de Salida

```
🧹 Limpieza de Deployments en Netlify
==================================================

📋 Obteniendo sitios de Netlify...

📦 Sitios encontrados: 2

🔍 Procesando sitio: guestsvalencia-site (abc123...)
   📊 Total deployments: 45
   🧹 Deployments a limpiar: 12
   ⏸️ abc123def456... (building) - 20/11/2024 ✅ Cancelado
   🗑️ def456ghi789... (error) - 19/11/2024 ✅ Eliminado
   ...

==================================================

✅ Limpieza completada:

   ⏸️  Cancelados: 5
   🗑️  Eliminados: 7
   📊 Total procesado: 12
```

## ⚠️ Notas Importantes

- El script hace pausas entre operaciones para no sobrecargar la API
- Los deployments publicados NO se tocan
- Puedes ejecutar el script múltiples veces de forma segura
- Si un deployment no se puede cancelar, se intenta eliminar

## 🔒 Seguridad

- **NUNCA** subas tu token a Git
- Añade `.env.pro` a `.gitignore` si no está ya
- El token tiene acceso completo a tu cuenta de Netlify, úsalo con cuidado

## 🆘 Troubleshooting

### Error: "Token inválido"
- Verifica que el token esté correcto
- Asegúrate de que no haya espacios extra
- Genera un nuevo token si es necesario

### Error: "No se encontraron sitios"
- Verifica que el token tenga permisos de lectura
- Asegúrate de que tengas al menos un sitio en Netlify

### Error: "No se puede cancelar/eliminar"
- Algunos deployments pueden estar en estados que no permiten cancelación
- El script intentará eliminarlos automáticamente
- Si persiste, cancela manualmente desde el dashboard de Netlify

