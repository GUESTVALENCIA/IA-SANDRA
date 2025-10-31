# SANDRA IA 7.0 - DEPLOYMENT CHECKLIST
**Date:** 2025-10-28
**Environment:** Production Staging
**Site:** sandra.guestsvalencia.es

## STATUS: READY FOR DEPLOYMENT

---

## 1. NETLIFY CONFIGURATION ✅

- ✅ Netlify site connected: `grand-pasca-a584d5`
- ✅ Domain configured: `sandra.guestsvalencia.es`
- ✅ Admin panel access: https://app.netlify.com/projects/grand-pasca-a584d5
- ✅ Site ID: `a75819c1-20d5-43f1-8ebc-b3a35ddf7605`
- ✅ netlify.toml configuration fixed and validated

---

## 2. BUILD VERIFICATION ✅

- ✅ npm run build executed successfully
- ✅ Manifest generated: 13865 bytes
- ✅ Service Worker generated: 15815 bytes
- ✅ 8 PWA icons generated (72x72 → 512x512)
- ✅ 4 PWA shortcuts configured
- ✅ Public directory ready with assets

---

## 3. ENVIRONMENT VARIABLES STATUS

**Currently Configured (38 variables detected):**
- ✅ META_ACCESS_TOKEN (WhatsApp)
- ✅ META_PHONE_NUMBER_ID (WhatsApp)
- ✅ TWILIO_SID (SMS/Voice)
- ✅ TWILIO_PHONE_NUMBER
- ✅ WHATSAPP_SANDRA
- ✅ HEYGEN_AVATAR_ID
- ✅ HEYGEN_VIDEO_AVATAR_ID
- ✅ HEYGEN_EMBED_URL
- ✅ OPENAI_MODEL_DEFAULT
- ✅ OPENAI_MODEL_GUEST
- ✅ OPENAI_MODEL_VISITOR
- ✅ PAYPAL_CLIENT_ID
- ✅ PAYPAL_CLIENT_SECRET
- ✅ PAYPAL_MODE
- ✅ SUPABASE_TOKEN
- ✅ TRAINING_API_KEY
- ✅ NETLIFY_DATABASE_URL
- ✅ NETLIFY_DATABASE_URL_UNPOOLED
- ✅ NODE_VERSION

**CRITICAL - NEED VERIFICATION:**
- ⚠️ ANTHROPIC_API_KEY (Claude - conversational AI)
- ⚠️ OPENAI_API_KEY (GPT models)
- ⚠️ GROQ_API_KEY (Fast inference)
- ⚠️ CARTESIA_API_KEY (Text-to-speech)
- ⚠️ CARTESIA_VOICE_ID (Voice configuration)
- ⚠️ DEEPGRAM_API_KEY (Speech-to-text)

**ACTION REQUIRED:**
CEO must verify these 6 critical API keys are set in Netlify Dashboard:
https://app.netlify.com/sites/grand-pasca-a584d5/settings/env

---

## 4. NETLIFY FUNCTIONS READY ✅

**Available Functions:**
- ✅ `/netlify/functions/health.js` - Health check endpoint
- ✅ `/netlify/functions/ready.js` - Readiness probe
- ✅ `/netlify/functions/socket-server.js` - WebSocket server
- ✅ `/netlify/functions/chat/*` - Chat endpoints
- ✅ `/netlify/functions/tts/*` - Text-to-speech
- ✅ `/netlify/functions/webrtc/*` - Video/audio streaming

---

## 5. SECURITY CONFIGURATION ✅

- ✅ CSP headers configured
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection enabled
- ✅ CORS configured for API endpoints
- ✅ WebSocket upgrade headers set
- ✅ Permissions-Policy configured (microphone, camera)

---

## 6. DEPLOYMENT ROUTING ✅

- ✅ `/socket.io/*` → WebSocket function
- ✅ `/api/*` → API functions
- ✅ `/*` → SPA fallback to index.html

---

## 7. NEXT STEPS

### Step 1: Verify API Keys (CEO Action Required)
```bash
# Check which keys are missing:
npx netlify env:list | grep -E "(ANTHROPIC|OPENAI|GROQ|CARTESIA|DEEPGRAM)"
```

### Step 2: Deploy to Staging
```bash
# When keys are verified, deploy:
npm run deploy:staging
# OR for production:
npm run deploy
```

### Step 3: Post-Deployment Verification
```bash
# Check deployment status:
curl -I https://sandra.guestsvalencia.es

# Test health endpoint:
curl https://sandra.guestsvalencia.es/.netlify/functions/health

# Test readiness:
curl https://sandra.guestsvalencia.es/.netlify/functions/ready
```

### Step 4: Functional Testing
- [ ] Open https://sandra.guestsvalencia.es
- [ ] Test chat text input
- [ ] Test voice input (microphone)
- [ ] Test text-to-speech output
- [ ] Test avatar sync and blink
- [ ] Test PWA installation
- [ ] Test on mobile device
- [ ] Test barge-in interruption

---

## 8. ROLLBACK PLAN

If deployment fails:
```bash
# List recent deployments:
npx netlify deploy:list

# Rollback to previous:
npx netlify rollback
```

---

## 9. MONITORING & LOGS

**Access logs:**
```bash
# Live function logs:
npx netlify functions:log --live

# Specific function:
npx netlify functions:log socket-server
```

**Dashboard monitoring:**
- Analytics: https://app.netlify.com/sites/grand-pasca-a584d5/analytics
- Functions: https://app.netlify.com/sites/grand-pasca-a584d5/functions
- Logs: https://app.netlify.com/sites/grand-pasca-a584d5/logs

---

## 10. BLOCKING ISSUES

**NONE - Ready to deploy once API keys are verified**

---

## DEPLOYMENT COMMAND

Once CEO confirms all 6 critical API keys are set in Netlify Dashboard:

```bash
cd "C:\Users\clayt\Desktop\IA-SANDRA"
npm run deploy
```

This will:
1. Run production build
2. Deploy to https://sandra.guestsvalencia.es
3. Create deployment preview
4. Activate on production domain

**Estimated deployment time:** 2-3 minutes

---

**STATUS:** ✅ READY - Waiting for CEO API key verification
**NEXT:** CEO verifies 6 API keys → Execute deployment
