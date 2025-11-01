# 🧪 TEST SIMPLE - SANDRA COO DESKTOP

## 🎯 OBJETIVO

**Probar que Sandra Desktop funciona LOCALMENTE, sin complicaciones.**

---

## 📋 PASOS SIMPLES

### 1. Verificar que tienes lo necesario

```bash
cd extracted_app
```

**Verificar:**
- ✅ `main.js` existe
- ✅ `package.json` existe
- ⚠️ `node_modules/` (si no existe: `npm install`)
- ⚠️ `.env` con `OPENAI_API_KEY`

### 2. Instalar dependencias (si es necesario)

```bash
npm install
```

### 3. Verificar .env

**Necesitas un archivo `.env` con:**
```
OPENAI_API_KEY=sk-tu-api-key-aqui
```

**Ubicaciones donde busca:**
- `extracted_app/.env`
- `extracted_app/../.env`
- Variables de entorno del sistema

### 4. Iniciar la app

```bash
npm start
```

**O con DevTools para ver errores:**
```bash
npm start -- --dev
```

---

## 🔍 QUÉ DEBERÍAS VER

1. ✅ Ventana de Electron se abre
2. ✅ Frontend carga (interfaz de Sandra)
3. ✅ Puedes escribir un mensaje
4. ✅ Sandra responde

---

## ❌ SI NO FUNCIONA

**Dime EXACTAMENTE qué error ves:**

- ¿Se abre la ventana?
- ¿Qué dice la consola? (F12 en la ventana o `--dev`)
- ¿Hay errores en la terminal donde ejecutaste `npm start`?

---

## ✅ SI FUNCIONA

**Entonces ya tenemos algo que funciona. Y lo mejoramos paso a paso.**

---

**VAMOS A PROBAR ESTO. SIN DEPLOY. SIN COMPLICACIONES. SOLO LOCAL Y SIMPLE.**

