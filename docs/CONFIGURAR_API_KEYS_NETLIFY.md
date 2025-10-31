# 🔑 Guía: Configurar API Keys en Netlify Dashboard

## 📋 REQUERIDO ANTES DEL DEPLOYMENT

Las API Keys deben configurarse en Netlify Dashboard porque el código NO puede leer `.env` en Netlify Functions en runtime.

## 🚀 PASOS PARA CONFIGURAR

### 1. Acceder a Netlify Dashboard

1. Ve a https://app.netlify.com
2. Selecciona tu sitio: **sandra.guestsvalencia.es**
3. Ve a **Site settings** → **Environment variables**

### 2. Agregar Variables de Entorno

Agrega las siguientes variables (una por una):

#### Variables Críticas (REQUERIDAS):

```bash
OPENAI_API_KEY=sk-your-openai-key-here
```

```bash
CARTESIA_API_KEY=your-cartesia-key-here
```

```bash
DEEPGRAM_API_KEY=your-deepgram-key-here
```

```bash
HEYGEN_API_KEY=your-heygen-key-here
```

#### Variables de Configuración (RECOMENDADAS):

```bash
NODE_ENV=production
```

```bash
ALLOWED_ORIGIN=https://sandra.guestsvalencia.es
```

```bash
BASE_URL=https://sandra.guestsvalencia.es
```

```bash
REQUIRE_AUTH=true
```

```bash
AUTH_REQUIRED=true
```

```bash
API_KEYS=sk_prod_key_1,sk_prod_key_2
```

### 3. Configurar por Contexto (Opcional)

Si tienes múltiples entornos (staging, production):

1. En **Environment variables**, selecciona el contexto:
   - **Production**: Solo para producción
   - **Deploy previews**: Para PRs
   - **Branch deploys**: Para branches específicos

2. Configura las keys según el entorno:
   - **Production**: Keys de producción
   - **Staging**: Keys de staging (si aplica)

### 4. Verificar Variables Configuradas

Después de agregar las variables:

1. Ve a **Deploys** → Selecciona el último deploy
2. En los logs del build, deberías ver:
   ```
   Environment variables loaded
   ```

### 5. Verificar en Runtime

Para verificar que las variables están disponibles:

1. Ve a **Functions** → Selecciona una función (ej: `chat`)
2. En los logs, deberías poder ver que las keys están disponibles
3. O prueba la función directamente

## 🔍 CÓMO VERIFICAR QUE FUNCIONA

### Test 1: Verificar Variables en Build

Agrega temporalmente a `netlify/functions/chat.js`:

```javascript
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('NODE_ENV:', process.env.NODE_ENV);
```

### Test 2: Llamar a la Function

```bash
curl -X POST https://sandra.guestsvalencia.es/.netlify/functions/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
```

Si funciona correctamente, las keys están configuradas.

## ⚠️ IMPORTANTE: Seguridad

1. **NUNCA** subas las keys a Git
2. **Siempre** usa Netlify Dashboard para configurarlas
3. **Rota** las keys periódicamente
4. **Monitorea** el uso de las keys

## 📝 CHECKLIST

- [ ] OPENAI_API_KEY configurada
- [ ] CARTESIA_API_KEY configurada
- [ ] DEEPGRAM_API_KEY configurada
- [ ] HEYGEN_API_KEY configurada
- [ ] NODE_ENV=production configurado
- [ ] ALLOWED_ORIGIN configurado
- [ ] BASE_URL configurado
- [ ] REQUIRE_AUTH configurado (opcional)
- [ ] Variables verificadas en deploy
- [ ] Function test exitoso

---

**Nota**: Después de configurar las variables, debes hacer un **nuevo deploy** para que surtan efecto.

