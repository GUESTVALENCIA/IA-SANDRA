# Sandra IA - Backend Functions

## Architecture Overview

Sandra IA uses a **hybrid serverless architecture** with Netlify Functions:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT REQUESTS                          │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                  NETLIFY EDGE                               │
│  - CORS Handling                                            │
│  - SSL/TLS                                                  │
│  - CDN Caching                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│               SHARED MIDDLEWARE LAYER                       │
│  - Rate Limiting (per IP)                                   │
│  - Request Validation                                       │
│  - Input Sanitization                                       │
│  - Error Handling                                           │
│  - Request Tracking (UUID)                                  │
│  - Structured Logging                                       │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────┐    ┌──────────────────┐
│ CACHE LAYER  │    │  METRICS LAYER   │
│ - Semantic   │    │  - Performance   │
│ - LRU        │    │  - Telemetry     │
│ - 5min TTL   │    │  - Health        │
└──────────────┘    └──────────────────┘
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────┴───────────────────┬───────────┬──────────┐
        │                              │           │          │
        ▼                              ▼           ▼          ▼
┌──────────────┐  ┌─────────────┐  ┌─────────┐  ┌──────────┐
│  CHAT-LOCAL  │  │    VOICE    │  │  VISION │  │ DOCUMENTS│
│              │  │             │  │         │  │          │
│  Tier 1-4    │  │  Whisper    │  │ Claude  │  │   PDF    │
│  Cascade     │  │  + TTS      │  │ Vision  │  │ Markdown │
│              │  │  + Chat     │  │         │  │  Search  │
└──────┬───────┘  └──────┬──────┘  └────┬────┘  └────┬─────┘
       │                 │               │            │
       ▼                 ▼               ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                   MODEL PROVIDERS                           │
│                                                              │
│  LOCAL (Ollama):                                            │
│    • Qwen 2.5:7b    (Tier 1) → 80%                         │
│    • Mistral 7B     (Tier 2) → 15%                         │
│    • Llama 3.1:8b   (Tier 3) →  4%                         │
│                                                              │
│  API (Fallback):                                            │
│    • GROQ Mixtral   (Tier 4) →  1%                         │
│    • Claude Vision  (Vision)                                │
│    • Whisper        (STT)                                   │
│    • Cartesia       (TTS)                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
netlify/functions/
├── shared/                    # Shared utilities
│   ├── config.js             # Centralized configuration
│   ├── logger.js             # Structured logging
│   ├── middleware.js         # Request/response middleware
│   ├── rate-limiter.js       # IP-based rate limiting
│   └── cache.js              # Intelligent semantic cache
│
├── chat-local/               # Local LLM endpoint
│   └── index.js             # Tier cascade (Qwen → Mistral → Llama → GROQ)
│
├── voice/                    # Voice pipeline
│   └── index.js             # Whisper (STT) + Chat + Cartesia (TTS)
│
├── vision/                   # Image analysis
│   └── index.js             # Claude Vision (OCR, objects, faces)
│
├── documents/                # Document processing
│   └── index.js             # PDF/Markdown parser + semantic search
│
├── metrics/                  # Telemetry
│   └── index.js             # Performance tracking + health check
│
├── tts/                      # Legacy TTS
│   └── index.js             # TTS MP3 → Cartesia fallback
│
├── chat/                     # API models chat
│   └── index.js             # GROQ → Claude → GPT-4o
│
├── health.js                 # Basic health check
├── ready.js                  # Deployment readiness
└── README.md                 # This file
```

---

## Key Features

### 1. Intelligent Tier System
- **80% Tier 1**: Qwen 2.5:7b (fastest, local)
- **15% Tier 2**: Mistral 7B (fast, local)
- **4% Tier 3**: Llama 3.1:8b (slower, local)
- **1% Tier 4**: GROQ Mixtral (API fallback)

**Cost**: 99% FREE (only GROQ fallback uses API)

### 2. Semantic Caching
- Matches similar queries using Levenshtein distance
- 85% similarity threshold
- 5-minute TTL
- LRU eviction strategy
- Up to **50% cache hit rate**

### 3. Rate Limiting
- Per-IP tracking
- Different limits per endpoint
- Automatic cleanup
- Rate limit headers in response

### 4. Comprehensive Metrics
- Real-time performance tracking
- Model usage statistics
- Error logging
- Health monitoring
- Cache analytics

### 5. Robust Error Handling
- Graceful degradation
- Automatic retries
- User-friendly error messages
- Detailed logging (dev mode)

---

## Environment Variables

Required for full functionality:

```bash
# LLM Models
GROQ_API_KEY=gsk_...               # GROQ (Tier 4 fallback)
ANTHROPIC_API_KEY=sk-ant-...       # Claude Vision
OPENAI_API_KEY=sk-proj-...         # Whisper (STT)

# TTS
CARTESIA_API_KEY=sk_car_...        # Cartesia TTS
CARTESIA_VOICE_ID=a34aec03-...     # Voice ID

# Optional
OLLAMA_URL=http://localhost:11434  # Ollama base URL
NODE_ENV=production                # Environment mode
LOG_LEVEL=info                     # Logging level
```

---

## Development

### Local Testing

1. **Start Ollama** (for local models):
```bash
ollama serve
```

2. **Pull models**:
```bash
ollama pull qwen2.5:7b
ollama pull mistral:7b
ollama pull llama3.1:8b
```

3. **Start Netlify Dev**:
```bash
netlify dev
```

4. **Run tests**:
```bash
node tests/backend/api-tests.js
```

### Adding a New Endpoint

1. Create directory: `netlify/functions/my-endpoint/`
2. Create `index.js`:

```javascript
const { withMiddleware, createSuccessResponse, createErrorResponse } = require('../shared/middleware');
const config = require('../shared/config');
const logger = require('../shared/logger');

const handler = async (event, context, { requestId, body, logger: requestLogger }) => {
  try {
    // Your logic here

    return createSuccessResponse({ result: 'success' });

  } catch (error) {
    requestLogger.error('Endpoint failed', { error: error.message });
    return createErrorResponse(error);
  }
};

exports.handler = withMiddleware(handler, {
  endpoint: 'my-endpoint',
  methods: ['POST'],
  requiredFields: ['field1', 'field2'],
  rateLimit: true,
  logging: true
});
```

3. Add rate limit config in `shared/config.js`:
```javascript
rateLimits: {
  'my-endpoint': {
    windowMs: 60000,
    maxRequests: 30
  }
}
```

4. Test locally:
```bash
curl -X POST http://localhost:8888/.netlify/functions/my-endpoint \
  -H "Content-Type: application/json" \
  -d '{"field1":"value1","field2":"value2"}'
```

---

## Monitoring

### Health Check
```bash
curl https://sandra.guestsvalencia.es/.netlify/functions/health
```

### System Metrics
```bash
curl -X POST https://sandra.guestsvalencia.es/.netlify/functions/metrics \
  -H "Content-Type: application/json" \
  -d '{"action":"stats"}'
```

### Cache Performance
```bash
curl -X POST https://sandra.guestsvalencia.es/.netlify/functions/metrics \
  -H "Content-Type: application/json" \
  -d '{"action":"stats"}' | jq '.data.cache'
```

### Tier Distribution
```bash
curl -X POST https://sandra.guestsvalencia.es/.netlify/functions/metrics \
  -H "Content-Type: application/json" \
  -d '{"action":"stats"}' | jq '.data.tierDistribution'
```

---

## Performance Optimization

### 1. Cache Strategy
- Cache similar queries (85% similarity)
- 5-minute TTL for fresh responses
- LRU eviction for memory efficiency

### 2. Tier Cascade
- Start with fastest model (Qwen)
- Fallback to slower models only if needed
- 99% of requests handled locally

### 3. Message Optimization
- Limit message history to 10 recent messages
- Reduces token usage and latency

### 4. Compression
- Auto-compress images (> 5MB)
- JPEG quality 80%
- Max resolution 1920x1920

### 5. Connection Pooling
- Reuse HTTP connections
- Timeout management
- Graceful error handling

---

## Security

### Input Validation
- JSON schema validation
- Required field checking
- Type validation

### Sanitization
- HTML tag removal
- Control character stripping
- Length limits (10KB per field)

### Rate Limiting
- Per-IP tracking
- Configurable per endpoint
- Automatic cleanup

### Headers
- CORS configuration
- Security headers (XSS, CSP, etc.)
- Request tracking (UUID)

---

## Troubleshooting

### Issue: "All models failed"
**Solution**: Check Ollama is running:
```bash
curl http://localhost:11434/api/tags
```

### Issue: "GROQ_API_KEY not configured"
**Solution**: Add to `.env`:
```bash
GROQ_API_KEY=gsk_your_key_here
```

### Issue: Rate limit exceeded
**Solution**: Wait 1 minute or implement backoff:
```javascript
if (response.status === 429) {
  await sleep(60000); // Wait 1 minute
  retry();
}
```

### Issue: Cache not working
**Solution**: Check cache stats:
```bash
curl -X POST http://localhost:8888/.netlify/functions/metrics \
  -d '{"action":"stats"}' | jq '.data.cache'
```

---

## Deployment

### Netlify
```bash
netlify deploy --prod
```

### Environment Variables
Set in Netlify Dashboard:
- Site settings → Environment variables
- Add all required API keys

### Build Command
```bash
npm run build
```

### Functions Directory
```
netlify/functions
```

---

## API Documentation

Full API documentation: `docs/API-DOCUMENTATION.md`

Quick reference:
- **POST** `/chat-local` - Chat with local models
- **POST** `/voice` - Voice pipeline (STT + Chat + TTS)
- **POST** `/vision` - Image analysis
- **POST** `/documents` - Document processing
- **POST** `/metrics` - System metrics
- **GET** `/health` - Health check

---

## Metrics & KPIs

### Target Metrics
- **Latency**: < 500ms (Tier 1)
- **Cache Hit Rate**: > 40%
- **Error Rate**: < 1%
- **Tier Distribution**: 80/15/4/1
- **Uptime**: > 99.9%

### Monitoring
Use `/metrics` endpoint to track:
- Request counts
- Latency percentiles
- Error rates
- Cache performance
- Model usage

---

## Best Practices

1. **Always check cache first** before making model calls
2. **Limit message history** to recent context only
3. **Implement retry logic** with exponential backoff
4. **Monitor rate limits** and adjust client behavior
5. **Use request IDs** for tracking and debugging
6. **Compress large payloads** before sending
7. **Handle errors gracefully** with user-friendly messages
8. **Log important events** for debugging
9. **Test locally** before deploying
10. **Monitor metrics** regularly

---

## Contributing

### Code Style
- Use async/await (no callbacks)
- Destructure parameters
- Use const/let (no var)
- Add JSDoc comments
- Follow existing patterns

### Testing
- Test locally with Netlify Dev
- Run integration tests
- Check rate limiting
- Verify error handling
- Test edge cases

### Documentation
- Update API docs
- Add JSDoc comments
- Update README if needed
- Document breaking changes

---

## License

Proprietary - ClayTom Systems / GuestsValencia

---

**Built with Galaxy Level Pro Enterprise standards**
