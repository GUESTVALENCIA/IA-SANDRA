# 🔧 SANDRA PROFESSIONAL - TROUBLESHOOTING

**Solución de Problemas Comunes**

---

## ❌ Error: "Cannot find module..."

**Problema:** Dependencias no instaladas

**Solución:**
```bash
cd C:\Users\clayt\Desktop\sandra-professional
npm install
```

---

## ❌ Backend no arranca

**Problema:** Puerto 5000 ocupado

**Solución:**
1. Abrir PowerShell como administrador
2. Ejecutar:
```powershell
netstat -ano | findstr :5000
taskkill /PID [número_del_PID] /F
```

**O cambiar puerto en `.env`:**
```env
PORT=5001
```

---

## ❌ Error OpenAI API

**Problema:** API Key inválida o sin crédito

**Verificar:**
1. Revisar key en `.env`
2. Verificar crédito en: https://platform.openai.com/account/usage
3. Confirmar que la key es correcta

---

## ❌ HeyGen no genera videos

**Problema:** API Key o Avatar ID incorrecto

**Verificar:**
1. Abrir `.env`
2. Confirmar:
```env
HEYGEN_API_KEY=M2IzYzcyOGY1ZmFhNGI5YmE5NzBlZTFiNDhmOTc3MDMtMTc1MzU4MDA1OA==
HEYGEN_AVATAR_ID=306d1c6f1b014036b467ff70ea38d965
```

---

## ❌ Electron no abre

**Problema:** Node.js o Electron no instalado

**Solución:**
```bash
npm install electron --save-dev
npm start
```

---

## ❌ Chat no responde

**Problema:** Backend no conectado

**Verificar:**
1. Backend corriendo: `npm run backend`
2. Abrir `http://localhost:5000/health`
3. Debe responder JSON con status "operational"

---

## ❌ Errores de CORS

**Problema:** Frontend no puede conectar a backend

**Solución:** Ya está configurado en `backend/server.js`:
```javascript
app.use(cors());
```

Si persiste, verificar que backend está en puerto 5000.

---

## 🔄 REINICIO COMPLETO

Si nada funciona:

1. **Cerrar todo** (Ctrl+C en terminales)
2. **Eliminar node_modules:**
```bash
rmdir /s /q node_modules
```
3. **Reinstalar:**
```bash
npm install
```
4. **Reiniciar:**
```bash
npm run backend
npm start
```

---

## 📞 SOPORTE DIRECTO

Si ninguna solución funciona:

1. Captura el error completo
2. Envíalo al chat
3. Especifica qué estabas haciendo cuando ocurrió

**Responderé inmediatamente con solución específica.**

---

**IMPORTANTE:** NO modificar archivos sin consultar primero.
