# Sandra IA - Backend API Documentation

## Architecture Overview

Sandra IA uses a **hybrid backend architecture** combining:
- **Local Models** (Ollama): Qwen 2.5, Mistral 7B, Llama 3.1 (80% of requests)
- **API Models**: GROQ Mixtral (fallback), Claude Vision, Whisper, Cartesia TTS
- **Intelligent Caching**: Semantic similarity matching
- **Rate Limiting**: Per-endpoint IP-based throttling
- **Metrics & Telemetry**: Real-time performance tracking

---

## Base URL

```
Production: https://sandra.guestsvalencia.es/.netlify/functions/
Development: http://localhost:8888/.netlify/functions/
```

---

## Authentication

Currently, all endpoints are **publicly accessible** but protected by:
- Rate limiting (per IP)
- Input validation
- CORS restrictions

Future: API key authentication will be added for production.

---

## Common Headers

### Request Headers
```http
Content-Type: application/json
X-Request-ID: <optional-uuid>
```

### Response Headers
```http
Content-Type: application/json
X-Request-ID: <uuid>
X-Response-Time: <ms>
X-RateLimit-Limit: <max-requests>
X-RateLimit-Remaining: <remaining>
X-RateLimit-Reset: <unix-timestamp>
```

---

## Endpoints

### 1. Chat (Local Models)

**Endpoint:** `POST /chat-local`

**Description:** Chat using local Ollama models with intelligent fallback cascade.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hola, ¿cómo estás?" }
  ],
  "locale": "es-ES"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "¡Hola! Estoy muy bien, gracias por preguntar. ¿En qué puedo ayudarte hoy?",
    "provider": "Qwen 2.5 (Local)",
    "tier": 1,
    "cost": "FREE",
    "latency": "245ms",
    "cached": false
  },
  "timestamp": "2025-10-29T12:34:56.789Z"
}
```

**Tier System:**
- Tier 1 (80%): Qwen 2.5:7b (Local)
- Tier 2 (15%): Mistral 7B (Local)
- Tier 3 (4%): Llama 3.1:8b (Local)
- Tier 4 (1%): GROQ Mixtral (API fallback)

**Rate Limit:** 60 requests/minute

---

### 2. Voice Processing

**Endpoint:** `POST /voice`

**Description:** Complete voice pipeline: STT (Whisper) + Chat + TTS (Cartesia)

**Request Body:**
```json
{
  "audioBase64": "<base64-encoded-audio>",
  "language": "es",
  "mode": "full"
}
```

**Modes:**
- `stt`: Speech-to-text only
- `tts`: Text-to-speech only (requires `text` field)
- `full`: Complete pipeline (STT → Chat → TTS)

**Response (full mode):**
```json
{
  "success": true,
  "data": {
    "transcription": "Hola Sandra, ¿qué tiempo hace hoy?",
    "text": "Hoy hace un día soleado con temperaturas agradables. ¿Quieres saber algo más?",
    "audio": "<base64-audio-response>",
    "mime": "audio/wav",
    "requestId": "uuid",
    "mode": "full"
  },
  "timestamp": "2025-10-29T12:34:56.789Z"
}
```

**Rate Limit:** 30 requests/minute

---

### 3. Vision Analysis

**Endpoint:** `POST /vision`

**Description:** Image analysis using Claude Vision (OCR, object detection, face analysis)

**Request Body:**
```json
{
  "imageBase64": "<base64-image>",
  "prompt": "Describe esta imagen",
  "mode": "analyze"
}
```

**Modes:**
- `analyze`: General image description (custom prompt)
- `ocr`: Extract text from image
- `objects`: Detect and locate objects
- `faces`: Analyze facial features (privacy-conscious)

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "La imagen muestra un paisaje urbano con edificios modernos...",
    "mode": "analyze",
    "imageFormat": "image/jpeg",
    "requestId": "uuid"
  },
  "timestamp": "2025-10-29T12:34:56.789Z"
}
```

**Supported Formats:** JPEG, PNG, WebP, GIF
**Max Size:** 5MB (auto-compressed if larger)
**Rate Limit:** 20 requests/minute

---

### 4. Document Processing

**Endpoint:** `POST /documents`

**Description:** Parse and extract text from PDFs, Markdown, and plain text

**Request Body:**
```json
{
  "documentBase64": "<base64-document>",
  "type": "pdf",
  "mode": "parse"
}
```

**Types:**
- `pdf`: PDF document
- `markdown`: Markdown file
- `text`: Plain text
- `auto`: Auto-detect

**Modes:**
- `parse`: Extract text and metadata
- `extract`: Full text extraction
- `search`: Semantic search (requires `query` field)

**Response (parse mode):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "wordCount": 1523,
      "charCount": 9876,
      "lines": 145
    },
    "preview": "Este es el contenido del documento...",
    "pages": 5,
    "type": "pdf",
    "fileId": "abc123",
    "requestId": "uuid"
  },
  "timestamp": "2025-10-29T12:34:56.789Z"
}
```

**Response (search mode):**
```json
{
  "success": true,
  "data": {
    "searchResults": [
      {
        "text": "...resultado relevante...",
        "score": 5,
        "position": 3
      }
    ],
    "fileId": "abc123"
  }
}
```

**Max Size:** 10MB
**Rate Limit:** 30 requests/minute

---

### 5. Metrics & Telemetry

**Endpoint:** `POST /metrics` or `GET /metrics`

**Description:** Real-time system metrics and health monitoring

**Request Body:**
```json
{
  "action": "stats"
}
```

**Actions:**
- `stats`: Overall statistics
- `health`: System health check
- `performance`: Performance metrics
- `errors`: Recent errors
- `system`: System resources

**Response (stats):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "latency": {
        "avg": 245,
        "max": 1023,
        "min": 89,
        "unit": "ms"
      },
      "errorRate": "0.42%",
      "modelSuccessRate": "99.58%",
      "uptime": "5d 12h",
      "requestsPerMinute": 45
    },
    "requests": {
      "total": 125340,
      "byEndpoint": {
        "chat": 98234,
        "voice": 15432,
        "vision": 8234,
        "documents": 3440
      },
      "byStatus": {
        "2xx": 124813,
        "4xx": 321,
        "5xx": 206
      }
    },
    "models": {
      "calls": 98234,
      "failures": 412,
      "successRate": "99.58%",
      "byModel": {
        "Qwen 2.5 (Local)": {
          "calls": 78634,
          "failures": 123,
          "tier": 1
        }
      }
    },
    "tierDistribution": {
      "tier1": { "count": 78634, "percentage": "80.02%" },
      "tier2": { "count": 14735, "percentage": "15.00%" },
      "tier3": { "count": 3926, "percentage": "4.00%" },
      "tier4": { "count": 939, "percentage": "0.98%" }
    },
    "cache": {
      "hits": 45678,
      "misses": 52562,
      "hitRate": "46.50%",
      "size": 856,
      "maxSize": 1000,
      "enabled": true
    }
  },
  "timestamp": "2025-10-29T12:34:56.789Z"
}
```

**Response (health):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "checks": {
      "ollama": "healthy",
      "apiKeys": {
        "groq": true,
        "anthropic": true,
        "openai": true,
        "cartesia": true
      }
    },
    "timestamp": 1698765432100
  }
}
```

**Rate Limit:** None (metrics endpoint is unrestricted)

---

### 6. TTS (Text-to-Speech)

**Endpoint:** `POST /tts`

**Description:** Legacy TTS endpoint (use `/voice` for full pipeline)

**Request Body:**
```json
{
  "text": "Hola, ¿cómo estás?"
}
```

**Response:**
```json
{
  "success": true,
  "audioBase64": "<base64-audio>",
  "mime": "audio/mpeg",
  "provider": "TTS MP3"
}
```

**Rate Limit:** 30 requests/minute

---

### 7. Health Check

**Endpoint:** `GET /health`

**Description:** Basic health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-29T12:34:56.789Z",
  "version": "98.0.0",
  "uptime": 1234567,
  "checks": {
    "api": "ok",
    "database": "ok",
    "cache": "ok"
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error descriptivo en español",
  "code": 400,
  "details": "Detalles técnicos (solo en desarrollo)",
  "timestamp": "2025-10-29T12:34:56.789Z"
}
```

### Common Error Codes

- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing/invalid API key)
- `404`: Not Found (endpoint doesn't exist)
- `405`: Method Not Allowed (wrong HTTP method)
- `408`: Request Timeout (operation took too long)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error (server-side error)
- `503`: Service Unavailable (all models failed)

---

## Rate Limiting

Rate limits are applied **per IP address** with the following default limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/chat-local` | 60 req | 1 min |
| `/voice` | 30 req | 1 min |
| `/vision` | 20 req | 1 min |
| `/documents` | 30 req | 1 min |
| `/tts` | 30 req | 1 min |
| `/metrics` | Unlimited | - |
| `/health` | Unlimited | - |

When rate limit is exceeded, you'll receive a `429` error:

```json
{
  "error": "Demasiadas solicitudes. Por favor, espera un momento.",
  "code": 429,
  "timestamp": "2025-10-29T12:34:56.789Z"
}
```

---

## Caching

The backend implements **intelligent semantic caching**:

- **Cache Duration:** 5 minutes
- **Max Size:** 1000 entries
- **Similarity Threshold:** 85%
- **Strategy:** LRU eviction

Cached responses include `"cached": true` in the response.

---

## Best Practices

### 1. Request IDs
Always include a unique `X-Request-ID` header for tracking:
```http
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
```

### 2. Error Handling
Always check the `success` field in responses:
```javascript
const response = await fetch('/api/chat-local', { ... });
const data = await response.json();

if (!data.success) {
  console.error('Error:', data.error);
}
```

### 3. Rate Limit Handling
Monitor rate limit headers and implement backoff:
```javascript
const remaining = response.headers.get('X-RateLimit-Remaining');
if (parseInt(remaining) < 5) {
  await sleep(1000); // Wait before next request
}
```

### 4. Image Compression
Pre-compress images before sending to `/vision`:
```javascript
// Max 5MB, JPEG quality 80%
const compressed = await compressImage(originalImage, { quality: 0.8 });
```

### 5. Message History
For chat endpoints, limit message history to recent context:
```javascript
const recentMessages = messages.slice(-10); // Last 10 messages only
```

---

## Security

### Input Validation
All inputs are validated and sanitized:
- HTML tags removed
- Control characters stripped
- Max length enforced (10KB per field)

### CORS
CORS is enabled for all origins in development. In production, restrict to:
```javascript
Access-Control-Allow-Origin: https://sandra.guestsvalencia.es
```

### Headers
Security headers are automatically added:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

---

## Performance

### Latency Targets
- **Tier 1 (Qwen):** < 500ms
- **Tier 2 (Mistral):** < 800ms
- **Tier 3 (Llama):** < 1000ms
- **Tier 4 (GROQ):** < 2000ms

### Optimization Tips
1. Use cache when possible (similar queries)
2. Limit message history (max 10 messages)
3. Compress images before upload
4. Use streaming for long responses (future feature)
5. Implement client-side retry with exponential backoff

---

## Examples

### Example 1: Simple Chat
```javascript
const response = await fetch('/api/chat-local', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'Hola Sandra' }
    ]
  })
});

const data = await response.json();
console.log(data.data.text); // "¡Hola! ¿En qué puedo ayudarte?"
```

### Example 2: Voice Pipeline
```javascript
// Record audio
const audioBlob = await recordAudio();
const audioBase64 = await blobToBase64(audioBlob);

// Process
const response = await fetch('/api/voice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audioBase64,
    language: 'es',
    mode: 'full'
  })
});

const data = await response.json();
console.log('Transcription:', data.data.transcription);
console.log('Response:', data.data.text);

// Play audio response
playAudio(data.data.audio);
```

### Example 3: Image Analysis
```javascript
const imageBase64 = await imageToBase64(imageFile);

const response = await fetch('/api/vision', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageBase64,
    mode: 'analyze',
    prompt: 'Describe los objetos principales en esta imagen'
  })
});

const data = await response.json();
console.log(data.data.analysis);
```

### Example 4: Document Search
```javascript
const pdfBase64 = await fileToBase64(pdfFile);

const response = await fetch('/api/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentBase64: pdfBase64,
    type: 'pdf',
    mode: 'search',
    query: 'contratos de alquiler'
  })
});

const data = await response.json();
console.log('Results:', data.data.searchResults);
```

### Example 5: Monitor Metrics
```javascript
const response = await fetch('/api/metrics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'stats'
  })
});

const data = await response.json();
console.log('Cache Hit Rate:', data.data.cache.hitRate);
console.log('Tier Distribution:', data.data.tierDistribution);
```

---

## Changelog

### Version 98.0.0 (2025-10-29)
- Initial hybrid backend architecture
- Local models integration (Ollama)
- Intelligent caching system
- Rate limiting per endpoint
- Metrics and telemetry
- Voice pipeline (Whisper + TTS)
- Vision analysis (Claude Vision)
- Document processing (PDF/Markdown)

---

## Support

For issues or questions:
- GitHub: https://github.com/ClayTom/sandra-ia-mobile
- Email: clayton@guestsvalencia.es
- Docs: https://sandra.guestsvalencia.es/docs

---

**Built with love by ClayTom Systems for GuestsValencia**
