# 🔧 Correcciones Aplicadas a Vercel

## ✅ Cambios Realizados

### 1. Simplificación de `vercel.json`

**Problema**: El archivo `vercel.json` tenía propiedades incompatibles o innecesarias que causaban errores.

**Solución**: Simplificado a formato moderno de Vercel:
- ❌ Eliminado: `version`, `builds`, `buildCommand`, `outputDirectory`, `framework`
- ✅ Mantenido: `rewrites` y `headers` (formato correcto para Vercel moderno)

### 2. Configuración para Sitio Estático

El `vercel.json` ahora está optimizado para:
- ✅ Sitio estático sin build (el `index.html` está en la raíz)
- ✅ Rewrites para SPA (todas las rutas → `/index.html`)
- ✅ Proxy de API (`/api/orch/*` → `https://api.guestsvalencia.es/orchestrator/*`)
- ✅ Headers de seguridad configurados

## 📋 Formato Final de `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/api/orch/:path*",
      "destination": "https://api.guestsvalencia.es/orchestrator/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [...]
}
```

## 🎯 Errores Comunes Resueltos

### Error 1: Build Command / Output Directory
**Causa**: Vercel intentaba ejecutar un build que no existe
**Solución**: Eliminado `buildCommand` y `outputDirectory` - Vercel detecta automáticamente que es un sitio estático

### Error 2: 404 en index.html
**Causa**: Vercel no encontraba el `index.html` en la ubicación esperada
**Solución**: Rewrite configurado para servir `/index.html` para todas las rutas

## 🚀 Próximos Pasos

1. **Verificar deployment**: El nuevo `vercel.json` debería deployar sin errores
2. **Probar rutas**: Verificar que todas las rutas funcionan correctamente
3. **Verificar assets**: Asegurar que los assets (CSS, JS, imágenes) se cargan correctamente

## 📝 Notas

- El `index.html` está en la raíz del repositorio (correcto)
- No se requiere build step (sitio estático puro)
- Los rewrites manejan el routing del SPA
- Los headers de seguridad están configurados

---

**Última actualización**: 20 de noviembre de 2025
**Commit**: `fix: usar formato moderno de vercel.json sin version ni builds`

