# 🧪 TEST SIMPLE - SANDRA COO DESKTOP LOCAL

## 🎯 OBJETIVO

**Hacer que Sandra Desktop funcione LOCAL, sin deploy, sin complicaciones.**

---

## 📋 PASOS (COPIA Y PEGA)

### 1. Abrir terminal en extracted_app

```powershell
cd "C:\Users\clayt\AppData\Local\Programs\Sandra DevConsole\extracted_app"
```

### 2. Instalar dependencias (si falta)

```powershell
npm install
```

### 3. Verificar API Key

**Opción A: Si tienes .env**
```powershell
Get-Content .env | Select-String "OPENAI_API_KEY"
```

**Opción B: Crear .env**
```powershell
@"
OPENAI_API_KEY=sk-tu-api-key-aqui
"@ | Out-File -FilePath .env -Encoding utf8
```

### 4. Iniciar app

```powershell
npm start
```

**O con DevTools para ver errores:**
```powershell
npm start -- --dev
```

---

## 🔍 QUÉ DEBERÍAS VER

1. ✅ Terminal muestra: "Sandra Orchestrator initialized"
2. ✅ Se abre ventana de Electron
3. ✅ Ves la interfaz de Sandra
4. ✅ Puedes escribir un mensaje
5. ✅ Sandra responde

---

## ❌ SI NO FUNCIONA

**Dime EXACTAMENTE:**

1. ¿Qué error aparece en la terminal?
2. ¿Se abre la ventana?
3. ¿Qué dice la consola? (F12 o `--dev`)

---

## ✅ SI FUNCIONA

**Ya tenemos algo. Lo mejoramos paso a paso.**

---

**EJECUTA ESTOS COMANDOS Y DIME QUÉ PASA.**

