# 🚀 GUÍA COMPLETA DE MIGRACIÓN A VERCEL

## 📋 RESUMEN EJECUTIVO

**Situación**: Netlify bloqueado por deuda ($56), necesitamos migrar a Vercel.

**Solución**: Migración completa a Vercel (GRATIS inicialmente, luego $20/mes Pro si necesario).

**Tiempo estimado**: 4-6 horas de trabajo.

---

## 🔧 PASO 1: CREAR CUENTA VERCEL

1. Ve a: https://vercel.com/signup
2. Inicia sesión con GitHub (usa tu cuenta de Brasil si es necesario)
3. Conecta el repositorio: `GUESTVALENCIA/IA-SANDRA`

---

## 📦 PASO 2: INSTALAR VERCEL CLI (OPCIONAL)

```bash
npm install -g vercel
```

O usar npx:
```bash
npx vercel
```

---

## 🔄 PASO 3: CONVERTIR FUNCIONES

### Opción A: Automático (Script)

```bash
cd extracted_app
node scripts/convert-netlify-to-vercel.js
```

Esto creará la carpeta `api/` con todas las funciones convertidas.

### Opción B: Manual (Función por función)

Para cada función en `netlify/functions/`:

**ANTES (Netlify)**:
```javascript
exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'OK' })
  };
};
```

**DESPUÉS (Vercel)**:
```javascript
export default async function handler(req, res) {
  const body = req.body;
  
  res.status(200).json({ message: 'OK' });
}
```

---

## ⚙️ PASO 4: CONFIGURAR VARIABLES DE ENTORNO

En Vercel Dashboard:
1. Ve a tu proyecto
2. Settings → Environment Variables
3. Agrega todas las variables que tenías en Netlify:
   - `OPENAI_API_KEY`
   - `DEEPGRAM_API_KEY`
   - `CARTESIA_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `HEYGEN_API_KEY`
   - ... (todas las demás)

---

## 🚀 PASO 5: PRIMER DEPLOY

### Desde Vercel Dashboard:
1. Import project → Conectar GitHub repo
2. Configurar:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build:prod`
   - **Output Directory**: `frontend`
   - **Install Command**: `npm install`
3. Deploy

### O desde CLI:
```bash
vercel --prod
```

---

## 🌐 PASO 6: CONFIGURAR DOMINIO

1. En Vercel Dashboard → Settings → Domains
2. Agregar: `sandra.guestsvalencia.es`
3. Vercel te dará registros DNS
4. Actualizar DNS en tu proveedor:
   ```
   Tipo: CNAME
   Nombre: sandra
   Valor: cname.vercel-dns.com
   ```
5. Esperar propagación DNS (5-60 minutos)
6. SSL automático (Vercel lo gestiona)

---

## ✅ PASO 7: VALIDACIÓN

### Verificar Endpoints:

```bash
# Health check
curl https://sandra.guestsvalencia.es/api/health

# Chat
curl -X POST https://sandra.guestsvalencia.es/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

### Verificar Frontend:
- Abrir https://sandra.guestsvalencia.es
- Probar chat
- Probar voz
- Verificar Service Worker

---

## 🔍 DIFERENCIAS PRINCIPALES

### 1. **Estructura de Carpetas**

**Netlify**:
```
netlify/functions/
  ├── chat.js
  └── documents/index.js
```

**Vercel**:
```
api/
  ├── chat.js
  └── documents.js
```

### 2. **Handlers**

**Netlify**:
```javascript
exports.handler = async (event, context) => {
  return { statusCode: 200, body: JSON.stringify({}) };
};
```

**Vercel**:
```javascript
export default async function handler(req, res) {
  res.status(200).json({});
}
```

### 3. **Request/Response**

**Netlify**:
- `event.body` (string, necesita JSON.parse)
- `event.httpMethod`
- `event.headers`
- `event.queryStringParameters`

**Vercel**:
- `req.body` (ya parseado si es JSON)
- `req.method`
- `req.headers`
- `req.query`

### 4. **Response**

**Netlify**:
```javascript
return {
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
};
```

**Vercel**:
```javascript
res.setHeader('Content-Type', 'application/json');
res.status(200).json(data);
```

---

## 🛠️ MIGRACIÓN DE FUNCIONES ESPECÍFICAS

### **CORS Preflight Handler**

**Netlify**:
```javascript
if (event.httpMethod === 'OPTIONS') {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: ''
  };
}
```

**Vercel**:
```javascript
if (req.method === 'OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.status(200).end();
  return;
}
```

---

## 📊 COSTOS COMPARADOS

| Feature | Netlify | Vercel Hobby | Vercel Pro |
|---------|---------|--------------|------------|
| Precio | $19/mes + deuda | **GRATIS** | $20/mes |
| Deploys GitHub | ✅ Gratis | ✅ Gratis | ✅ Gratis |
| Bandwidth | 1TB/mes | 100GB/mes | 1TB/mes |
| Functions | ✅ | ✅ | ✅ |
| SSL | ✅ | ✅ | ✅ |

**Recomendación**: Empezar con Hobby (GRATIS), actualizar a Pro solo si necesitas más bandwidth.

---

## ⚠️ PROBLEMAS COMUNES

### 1. **Error: Function not found**
- Verificar que archivo está en `api/` (no `netlify/functions/`)
- Verificar nombre del archivo coincide con ruta

### 2. **Error: Cannot find module**
- Verificar que dependencias están en `package.json`
- Verificar que `vercel.json` tiene configuración correcta

### 3. **CORS Errors**
- Verificar headers en `vercel.json`
- Verificar que función retorna CORS headers correctos

---

## ✅ CHECKLIST FINAL

- [ ] Cuenta Vercel creada
- [ ] Repo GitHub conectado
- [ ] Variables de entorno configuradas
- [ ] Funciones convertidas a formato Vercel
- [ ] `vercel.json` configurado
- [ ] Primer deploy exitoso
- [ ] Dominio configurado
- [ ] SSL activo
- [ ] Todos los endpoints funcionando
- [ ] Frontend funcionando
- [ ] Testing completo

---

## 🎯 PRÓXIMOS PASOS

**¿Quieres que:**
1. ✅ Ejecute el script de conversión automática ahora?
2. ✅ Cree todos los archivos de configuración?
3. ✅ Convierta función por función manualmente?
4. ✅ Prepare todo y tú haces el deploy?

---

**TODO LISTO PARA MIGRAR CUANDO QUIERAS** 🚀

