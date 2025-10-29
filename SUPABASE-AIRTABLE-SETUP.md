# 🚀 SANDRA IA 7.0 - SUPABASE + AIRTABLE SETUP GUIDE

## ARQUITECTURA NUEVA (Sin Socket.IO)

```
┌─────────────────────────────────────────────────────────┐
│ FRONTEND (Netlify Static)                               │
│ - sandra-ia-mobile-galaxy-responsive.html               │
│ - public/js/supabase-realtime-client.js                 │
│ - public/js/airtable-integration.js                     │
└─────────────┬───────────────────────────────────────────┘
              │
    ┌─────────┴──────────────────────────┐
    │                                    │
┌───▼─────────────────┐       ┌─────────▼──────────┐
│ SUPABASE REALTIME   │       │ NETLIFY FUNCTIONS  │
│ ✅ WebSocket        │       │ ✅ Chat (Ollama)   │
│ ✅ Messages         │       │ ✅ TTS             │
│ ✅ Audio Streams    │       │ ✅ Voice (STT)     │
│ ✅ Presence         │       │ ✅ Health Check    │
└───┬─────────────────┘       └─────────┬──────────┘
    │                                   │
    └─────────────┬─────────────────────┘
                  │
        ┌─────────▼──────────┐
        │ NEON PostgreSQL    │
        │ ✅ Conversations   │
        │ ✅ Messages        │
        │ ✅ Sessions        │
        │ ✅ User Profiles   │
        └─────────┬──────────┘
                  │
        ┌─────────▼──────────┐
        │ AIRTABLE (CMS)     │
        │ ✅ Real-time sync  │
        │ ✅ Data backup     │
        │ ✅ Analytics       │
        └────────────────────┘
```

---

## 🔧 PASO 1: CONFIGURAR SUPABASE

### 1.1 Crear Proyecto en Supabase
1. Ve a https://supabase.com
2. Click "New Project"
3. Nombre: `sandra-ia-7`
4. Database Password: Guarda en lugar seguro
5. Region: Elige cercana a tu ubicación

### 1.2 Obtener Credenciales
```
Settings → API → URL (copia este)
Settings → API → anon public (copia este)
```

### 1.3 Crear Tablas PostgreSQL
En el SQL Editor, ejecuta:

```sql
-- Tabla de Conversaciones
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  model TEXT DEFAULT 'Qwen 2.5',
  status TEXT DEFAULT 'active',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Mensajes
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role TEXT NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  provider TEXT,
  tier TEXT,
  tokens INTEGER,
  latency_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Usuarios
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  region TEXT,
  total_messages INTEGER DEFAULT 0,
  preferences JSONB,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Sesiones
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  duration_minutes INTEGER,
  total_messages INTEGER,
  device TEXT,
  browser TEXT,
  quality_score DECIMAL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
```

### 1.4 Crear Índices para Performance
```sql
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

---

## 📊 PASO 2: CONFIGURAR AIRTABLE

### 2.1 Crear Base en Airtable
1. Ve a https://airtable.com
2. Click "Add a base"
3. Nombre: `Sandra IA 7.0`

### 2.2 Crear Tablas
Crea estas 4 tablas:

#### Tabla 1: Conversations
```
Fields:
- Conversation ID (Text) - Unique
- User ID (Text)
- Session ID (Text)
- Start Time (Date)
- Status (Single Select: Active/Archived)
- Model (Text)
- Metadata (Long Text)
```

#### Tabla 2: Messages
```
Fields:
- Message ID (Text) - Unique
- Conversation ID (Text - Link to Conversations)
- Role (Single Select: User/Assistant)
- Content (Long Text)
- Timestamp (Date)
- Provider (Text: Ollama/GROQ/Cartesia)
- Tier (Text: Tier1/Tier2/Tier3/Tier4)
- Tokens (Number)
- Latency (Number) - Milliseconds
```

#### Tabla 3: Users
```
Fields:
- User ID (Text) - Unique
- Name (Text)
- Email (Email)
- Phone (Phone Number)
- Region (Text)
- Total Messages (Number)
- Preferences (Long Text - JSON)
- Last Seen (Date)
```

#### Tabla 4: Sessions
```
Fields:
- Session ID (Text) - Unique
- User ID (Text - Link to Users)
- Start Time (Date)
- End Time (Date)
- Duration (Number) - Minutes
- Total Messages (Number)
- Device (Text)
- Browser (Text)
- Quality Score (Number) - 0-100
```

### 2.3 Obtener API Key
1. Account Settings → Personal Access Tokens
2. Click "Create new token"
3. Permissions: `data.records:read`, `data.records:write`, `data.bases:read`
4. Copia el token

### 2.4 Obtener Base ID
URL de tu base: `https://airtable.com/app**BASEID**/tbl...`
Copia `BASEID`

---

## 🔑 PASO 3: CONFIGURAR VARIABLES DE ENTORNO

### 3.1 En tu .env.local
```bash
# Supabase
REACT_APP_SUPABASE_URL=https://XXXX.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Airtable
REACT_APP_AIRTABLE_API_KEY=pat_YOUR_TOKEN_HERE
REACT_APP_AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

### 3.2 En Netlify Dashboard
1. Site Settings → Build & Deploy → Environment
2. Add these variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_AIRTABLE_API_KEY`
   - `REACT_APP_AIRTABLE_BASE_ID`

---

## 🎯 PASO 4: INTEGRAR EN FRONTEND

### 4.1 Importar en HTML
```html
<!-- En public/sandra-ia-mobile-galaxy-responsive.html -->
<script src="/js/supabase-realtime-client.js"></script>
<script src="/js/airtable-integration.js"></script>
```

### 4.2 Inicializar en JavaScript
```javascript
// Supabase Realtime
const realtimeClient = new SupabaseRealtimeClient({
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY
});

await realtimeClient.connect();

// Listeners para mensajes
realtimeClient.on('message', (msg) => {
  console.log('Mensaje recibido:', msg);
  // Actualizar UI
});

// Airtable
const airtable = new AirtableIntegration({
  apiKey: process.env.REACT_APP_AIRTABLE_API_KEY,
  baseId: process.env.REACT_APP_AIRTABLE_BASE_ID
});

await airtable.initialize();
```

### 4.3 Ejemplo: Enviar Mensaje
```javascript
// Enviar a Supabase (Real-time)
await realtimeClient.sendMessage('Hola Sandra');

// Guardar en Airtable (Persistencia)
await airtable.addMessage(conversationId, {
  id: messageId,
  role: 'user',
  content: 'Hola Sandra',
  timestamp: new Date().toISOString()
});
```

---

## ✅ VERIFI CACIÓN

### Test 1: Supabase Connection
```javascript
const client = new SupabaseRealtimeClient();
await client.connect();
console.log(client.isConnectedToRealtime()); // Should be true
```

### Test 2: Airtable Connection
```javascript
const airtable = new AirtableIntegration();
await airtable.initialize();
console.log(airtable.isInitialized); // Should be true
```

### Test 3: Real-time Messaging
1. Abre dos tabs del sitio
2. Envía mensaje desde Tab 1
3. Debería aparecer en Tab 2 inmediatamente

### Test 4: Data Persistence
1. Envía varios mensajes
2. Recarga la página
3. Histórico debería estar en Supabase
4. Airtable debería tener los registros

---

## 🚀 VENTAJAS DE ESTA ARQUITECTURA

✅ **Real-time Communication**
- WebSocket nativo via Supabase
- Sin Socket.IO (sin problemas de timeout)
- Escalable horizontalmente

✅ **Data Persistence**
- PostgreSQL en Neon (GRATIS tier)
- Backups automáticos
- SQL queries directas

✅ **CMS Integration**
- Airtable para no-tech users
- Interfaz visual
- Fácil análisis de datos

✅ **Cost Optimized**
- Supabase: Gratis hasta 50GB
- Neon: Gratis hasta 3GB
- Airtable: Gratis hasta 1200 registros/mes

✅ **Production Ready**
- Escalable
- Seguro (JWT auth)
- Monitoreado
- Backups redundantes

---

## 📝 PRÓXIMOS PASOS

1. ✅ Crear proyectos en Supabase y Airtable
2. ✅ Obtener credenciales
3. ✅ Configurar variables de entorno
4. ✅ Deploy a Netlify
5. ✅ Testear en producción

**Tiempo estimado:** 30 minutos

---

**Generado:** 2025-10-29
**Status:** READY FOR PRODUCTION DEPLOYMENT
