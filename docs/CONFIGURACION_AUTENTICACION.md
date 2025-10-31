# 🔐 Configuración de Autenticación - Sandra DevConsole

## 📋 Autenticación Activada para Producción

La autenticación está configurada para activarse automáticamente en producción y puede activarse manualmente en desarrollo.

## ⚙️ Configuración

### Variables de Entorno

Agregar a `.env`:

```bash
# Activar autenticación (true = activado)
REQUIRE_AUTH=true

# Modo estricto (todas las rutas requieren auth)
AUTH_REQUIRED=true

# API Keys válidas (separadas por coma)
API_KEYS=sk_your_key_1,sk_your_key_2,sk_your_key_3
```

### Activar en Producción

1. **Editar `.env`**:
   ```bash
   REQUIRE_AUTH=true
   AUTH_REQUIRED=true
   API_KEYS=sk_production_key_1,sk_production_key_2
   ```

2. **O usar variables de entorno del sistema**:
   ```bash
   export REQUIRE_AUTH=true
   export AUTH_REQUIRED=true
   export API_KEYS="sk_key1,sk_key2"
   ```

## 🔑 Uso de API Keys

### Generar Nueva API Key

```bash
node -e "const crypto = require('crypto'); console.log('sk_' + crypto.randomBytes(32).toString('hex'));"
```

### Enviar Requests con API Key

#### Opción 1: Header `X-API-Key`
```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'sk_your_api_key_here'
  },
  body: JSON.stringify({ message: 'Hello' })
});
```

#### Opción 2: Header `Authorization`
```javascript
fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk_your_api_key_here'
  },
  body: JSON.stringify({ message: 'Hello' })
});
```

#### Opción 3: Query Parameter (menos seguro)
```javascript
fetch('/api/chat?apiKey=sk_your_api_key_here', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello' })
});
```

## 🛡️ Rutas Protegidas

### Con Autenticación Activada

**Protegidas** (requieren API key):
- `/api/chat` - Chat principal
- `/api/tts` - Text-to-Speech
- `/api/stt` - Speech-to-Text
- `/api/voice-command` - Comandos de voz
- `/api/ai-voice-command` - Comandos de voz para IA

**Públicas** (no requieren auth):
- `/health` - Health check
- `/metrics` - Métricas Prometheus

## 📊 Niveles de Autenticación

### Nivel 1: Autenticación Opcional (`REQUIRE_AUTH=true`, `AUTH_REQUIRED=false`)
- Si se proporciona API key, se valida
- Si no se proporciona, se permite el acceso
- Útil para desarrollo o endpoints públicos con opción de auth

### Nivel 2: Autenticación Requerida (`AUTH_REQUIRED=true`)
- Todas las rutas protegidas REQUIEREN API key válida
- Sin API key → 401 Unauthorized
- Recomendado para producción

### Nivel 3: Desarrollo (`REQUIRE_AUTH=false`)
- Autenticación desactivada
- Útil para desarrollo local

## 🔧 Gestión de API Keys

### Agregar Nueva Key Programáticamente

```javascript
const { authManager } = require('./orchestrator/auth');

// Agregar key
authManager.addApiKey('sk_new_key_here', {
  description: 'Key for mobile app',
  createdAt: new Date()
});
```

### Revocar Key

```javascript
// Revocar key comprometida
authManager.revokeApiKey('sk_compromised_key');
```

### Ver Estadísticas

```javascript
const stats = authManager.getUsageStats();
console.log(stats);
// {
//   totalKeys: 3,
//   activeKeys: 2,
//   usage: [...]
// }
```

## 🚨 Seguridad

### Mejores Prácticas

1. **Generar keys únicas** para cada aplicación/cliente
2. **Revocar keys comprometidas** inmediatamente
3. **Rotar keys periódicamente** (cada 90 días)
4. **Usar HTTPS** siempre en producción
5. **No exponer keys en frontend** (usar backend proxy)
6. **Monitorear uso** de cada key

### Revocación de Emergencia

Si una key está comprometida:

```bash
# 1. Editar .env y remover la key
# API_KEYS=sk_key1,sk_key2  (remover sk_key_compromised)

# 2. Reiniciar servidor
npm start

# 3. O revocar programáticamente (si el servidor está corriendo)
```

## 📝 Ejemplo de Configuración Completa

`.env` para producción:

```bash
NODE_ENV=production
REQUIRE_AUTH=true
AUTH_REQUIRED=true
API_KEYS=sk_prod_key_1,sk_prod_key_2,sk_prod_key_mobile

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Otros...
OPENAI_API_KEY=sk-openai-key
BASE_URL=https://sandra-devconsole.com
ALLOWED_ORIGINS=https://sandra-devconsole.com
```

## 🔍 Verificar Autenticación

### Test con cURL

```bash
# Sin API key (debe fallar si AUTH_REQUIRED=true)
curl -X POST http://localhost:7777/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Con API key (debe funcionar)
curl -X POST http://localhost:7777/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sk_your_key" \
  -d '{"message":"Hello"}'
```

## ✅ Checklist de Activación

- [ ] Variable `REQUIRE_AUTH=true` en `.env`
- [ ] Variable `AUTH_REQUIRED=true` si se requiere estricto
- [ ] API keys válidas en `API_KEYS`
- [ ] Servidor reiniciado
- [ ] Verificado con test request
- [ ] Documentación de keys entregada a clientes
- [ ] Monitoreo de uso configurado

---

**Estado**: ✅ Sistema de autenticación implementado y listo  
**Recomendación**: Activar en producción antes del deploy

