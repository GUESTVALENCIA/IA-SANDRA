# 🚀 PLAN DE MIGRACIÓN A VERCEL

## 📊 SITUACIÓN ACTUAL

- ❌ **Netlify**: $56 de deuda, deploys pausados
- ✅ **Vercel**: Alternativa gratuita/pagada más flexible
- 🌎 **Cuenta Brasil**: Disponible para usar

---

## 🎯 VENTAJAS DE VERCEL vs NETLIFY

### ✅ **Vercel Gratis (Hobby Plan)**
- ✅ Deploys **GRATIS** desde GitHub (ilimitados)
- ✅ 100GB bandwidth/mes
- ✅ Serverless Functions incluidos
- ✅ SSL automático
- ✅ Edge Network global
- ✅ Sin bloqueos por deuda (si usas cuenta nueva)

### 📊 **Comparación**

| Feature | Netlify Pro | Vercel Pro | Vercel Hobby (Gratis) |
|---------|-------------|------------|----------------------|
| Deploys GitHub | ✅ Gratis | ✅ Gratis | ✅ Gratis |
| Build Minutes | 25,000/mes | 6,000/mes | 100/mes |
| Bandwidth | 1TB/mes | 1TB/mes | 100GB/mes |
| Functions | ✅ | ✅ | ✅ |
| SSL | ✅ | ✅ | ✅ |
| Precio | $19/mes | $20/mes | **GRATIS** |

---

## 🔧 CAMBIOS NECESARIOS PARA MIGRAR

### 1. **Estructura de Carpetas**

**Netlify** (Actual):
```
netlify/functions/
  ├── chat.js
  ├── documents/index.js
  └── ...
```

**Vercel** (Nuevo):
```
api/
  ├── chat.js
  ├── documents.js
  └── ...
```

**O** (con estructura similar):
```
vercel/
  functions/
    ├── chat.js
    └── ...
```

---

### 2. **Sintaxis de Handlers**

**Netlify** (Actual):
```javascript
exports.handler = async (event, context) => {
  // ...
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'OK' })
  };
};
```

**Vercel** (Nuevo):
```javascript
export default async function handler(req, res) {
  // ...
  res.status(200).json({ message: 'OK' });
}
```

---

### 3. **Configuración**

**Netlify**: `netlify.toml`
**Vercel**: `vercel.json`

---

## 📋 PLAN DE MIGRACIÓN PASO A PASO

### **FASE 1: Preparación** (30 min)

1. ✅ Crear cuenta Vercel (con cuenta Brasil si es necesario)
2. ✅ Conectar repositorio GitHub
3. ✅ Configurar variables de entorno en Vercel Dashboard
4. ✅ Crear `vercel.json` con configuración base

### **FASE 2: Conversión de Functions** (2-3 horas)

1. ✅ Crear carpeta `api/` o `vercel/functions/`
2. ✅ Convertir cada Netlify Function a formato Vercel
3. ✅ Actualizar imports y exports
4. ✅ Probar localmente con `vercel dev`

### **FASE 3: Configuración** (1 hora)

1. ✅ Configurar `vercel.json` (headers, redirects, functions)
2. ✅ Actualizar variables de entorno
3. ✅ Configurar dominio `sandra.guestsvalencia.es`
4. ✅ Configurar DNS

### **FASE 4: Deploy y Validación** (1 hora)

1. ✅ Deploy inicial a Vercel
2. ✅ Verificar todas las funciones
3. ✅ Testing end-to-end
4. ✅ Actualizar frontend para usar nuevos endpoints

### **FASE 5: Migración de Dominio** (30 min)

1. ✅ Actualizar DNS a Vercel
2. ✅ Verificar SSL
3. ✅ Verificar que todo funciona

---

## 🔍 FUNCIONES A MIGRAR

Total: **~25 funciones**

1. ✅ `chat.js`
2. ✅ `chat-resilient.js`
3. ✅ `voice-conversation.js`
4. ✅ `voice-conversation-optimized.js`
5. ✅ `documents/index.js`
6. ✅ `vision/index.js`
7. ✅ `voice/index.js`
8. ✅ `tts/index.js`
9. ✅ `guardian/index.js`
10. ✅ `metrics/index.js`
11. ✅ `health.js`
12. ✅ `ai-multi-model.js`
13. ✅ `avatar-heygen.js`
14. ✅ ... (y más)

---

## 💰 COSTOS

### **Vercel Hobby (GRATIS)**
- ✅ Perfecto para empezar
- ✅ 100GB bandwidth/mes (debería ser suficiente inicialmente)
- ✅ Sin costos ocultos

### **Vercel Pro ($20/mes)** - Si necesitas más:
- ✅ 1TB bandwidth
- ✅ 6,000 build minutes
- ✅ Soporte prioritario

**VS Netlify**: 
- ❌ $19/mes + $56 de deuda = $75 mínimo
- ✅ Vercel: **GRATIS** para empezar

---

## ⚠️ CONSIDERACIONES

### ✅ **Ventajas**
- ✅ Deploys desde GitHub GRATIS
- ✅ Sin bloqueos por deuda
- ✅ Mejor DX (Developer Experience)
- ✅ Edge Functions más rápidas

### ⚠️ **Desventajas**
- ⚠️ Hay que convertir código (2-3 horas trabajo)
- ⚠️ Cambios en estructura de carpetas
- ⚠️ Aprender nuevo sistema (pero similar a Netlify)

---

## 🚀 PRÓXIMOS PASOS

**¿Quieres que proceda con la migración?**

1. ✅ Puedo crear la estructura de carpetas para Vercel
2. ✅ Convertir todas las funciones automáticamente
3. ✅ Crear `vercel.json` con toda la configuración
4. ✅ Preparar script de migración automatizado
5. ✅ Documentar todo el proceso

**O prefieres:**
- Primero probar localmente con `vercel dev`
- Migrar función por función
- Otra estrategia que prefieras

---

**¿Cómo quieres proceder?**

