# 🚀 EJECUTAR SCRIPT PARA SUBIR VARIABLES

## ⚡ MÉTODO RÁPIDO

El script está listo pero necesita el **Netlify Auth Token**. Tienes 3 opciones:

---

## Opción 1: Token en Variable de Entorno (Recomendado)

```cmd
set NETLIFY_AUTH_TOKEN=tu_token_aqui
node scripts/upload-env-simple.js
```

---

## Opción 2: Guardar Token en Archivo

1. Crear archivo `.netlify-token` en la raíz del proyecto:
```
tu_token_completo_aqui
```

2. Ejecutar:
```cmd
node scripts/upload-env-simple.js
```

---

## Opción 3: Ingresar Token Interactivamente

Simplemente ejecuta:
```cmd
node scripts/upload-env-simple.js
```

El script te pedirá el token y puedes pegarlo.

---

## 🔑 OBTENER TOKEN DE NETLIFY

1. Ir a: https://app.netlify.com/user/applications
2. Click en **"New access token"**
3. Dar un nombre (ej: "Sandra DevConsole")
4. Click en **"Generate token"**
5. **Copiar el token inmediatamente** (solo se muestra una vez)

---

## ✅ DESPUÉS DE EJECUTAR

El script:
- ✅ Lee todas las variables del `.env`
- ✅ Las sube a Netlify automáticamente
- ✅ Te muestra el resultado

Verificar en:
https://app.netlify.com/sites/grand-pasca-a584d5/settings/env

---

**¿Listo para ejecutar?** Elige una opción y ejecuta el script 🚀

