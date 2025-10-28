# SANDRA IA 7.0 - MANUAL API KEY ROTATION GUIDE
## CRITICAL SECURITY INCIDENT RESPONSE

**Date:** 2025-10-28
**Severity:** CRITICAL
**Status:** IMMEDIATE ACTION REQUIRED

---

## ⚠️ EXPOSED KEYS (COMPROMISED)

These keys have been exposed in git and must be rotated IMMEDIATELY:

```
OPENAI_API_KEY=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
ANTHROPIC_API_KEY=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
GROQ_API_KEY=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
CARTESIA_API_KEY=sk_car_67c5Tg8LMpR9G6unHvsvnw
DEEPGRAM_API_KEY=30e9dbaec29dcde1b23a8bd9de31438c74f23522
HEYGEN_API_KEY=M2IzYzcyOGY1ZmFhNGI5YmE5NzBlZTFiNDhmOTc3MDMtMTc1MzU4MDA1OA==
PAYPAL_CLIENT_SECRET=EEjIKqOQpLodh6VEpwt0z3YOE_xkk1sQ1J1DzSKXjfpKKGZ6WqjidWus3hcrIwpl3jyo6JpI2jHsg7mA
META_ACCESS_TOKEN=EAATkBfISk9cBPiszg5gmZAmq9GODrr3zeI9YHGSzSNFGebVMz8piNXlPy1Gzr0smXpr1ZCDMwrP8v0FCWuttmrWSQLxMcTY0OWC3LSHYVPcFm41uSBlVU9wSsuPZACk1zHuDUIo68jvFEfkzcSt3BLgRddLs9Rjl1NKSwufuUpkGZA5VCY8EYpGs94PHtatCAD75tswLMsyC19CWmI3C0PeieksEJpdSTBjjWUxZCpm4ZD
NETLIFY_AUTH_TOKEN=nfp_BguXWY1a87dAj2hLJvB2wy5ndvvkkCkm0b60
```

---

## 📋 STEP-BY-STEP ROTATION PROCEDURE

### 1️⃣ OpenAI (GPT-4) - CRITICAL

**Dashboard:** https://platform.openai.com/api-keys

**Steps:**
1. Login to OpenAI Platform
2. Navigate to **API Keys** section
3. Click **"Create new secret key"**
4. Name: `sandra-ia-secure-20251028`
5. Set permissions: **All capabilities**
6. Copy the new key immediately (shown once only!)
7. Find the old key ending in `...HKAA`
8. Click **"Revoke"** on the old key
9. Update `.env.secure` with new key

**Verification:**
```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_NEW_KEY"
```

---

### 2️⃣ Anthropic (Claude) - CRITICAL

**Dashboard:** https://console.anthropic.com/settings/keys

**Steps:**
1. Login to Anthropic Console
2. Go to **Settings > API Keys**
3. Click **"Create Key"**
4. Name: `sandra-ia-production-secure`
5. Copy the new key
6. Find old key ending in `...DQAA`
7. Click **"Delete"** on compromised key
8. Update `.env.secure`

**Verification:**
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_NEW_KEY" \
  -H "anthropic-version: 2023-06-01"
```

---

### 3️⃣ GROQ - HIGH PRIORITY

**Dashboard:** https://console.groq.com/keys

**Steps:**
1. Login to GROQ Console
2. Navigate to **API Keys**
3. Click **"Create API Key"**
4. Name: `sandra-ia-prod-secure`
5. Copy the new key
6. Delete old key starting with `gsk_zeT...`
7. Update `.env.secure`

**Verification:**
```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_NEW_KEY"
```

---

### 4️⃣ Cartesia (TTS) - HIGH PRIORITY

**Dashboard:** https://play.cartesia.ai/settings

**Steps:**
1. Login to Cartesia
2. Go to **Settings > API Keys**
3. Click **"Generate New Key"**
4. Copy immediately
5. Revoke old key `sk_car_67c5...`
6. Update `.env.secure`

**Verification:**
```bash
curl https://api.cartesia.ai/voices \
  -H "X-API-Key: YOUR_NEW_KEY"
```

---

### 5️⃣ Deepgram (STT) - HIGH PRIORITY

**Dashboard:** https://console.deepgram.com/project/keys

**Steps:**
1. Login to Deepgram Console
2. Select your project
3. Go to **API Keys**
4. Click **"Create a New API Key"**
5. Description: `sandra-ia-secure-2025`
6. Copy the new key
7. Delete old key `30e9db...`
8. Update `.env.secure`

**Verification:**
```bash
curl https://api.deepgram.com/v1/projects \
  -H "Authorization: Token YOUR_NEW_KEY"
```

---

### 6️⃣ HeyGen (Avatar) - MEDIUM PRIORITY

**Dashboard:** https://www.heygen.com/app/settings/api

**Steps:**
1. Login to HeyGen
2. Go to **Settings > API**
3. Click **"Regenerate API Key"**
4. Copy new key
5. Update `.env.secure`

---

### 7️⃣ PayPal - CRITICAL

**Dashboard:** https://developer.paypal.com/dashboard/

**Steps:**
1. Login to PayPal Developer Dashboard
2. Find app: **"Sandra IA Production"**
3. Go to app settings
4. Under **Secret**, click **"Show"**
5. Click **"Generate New Secret"**
6. Copy the new secret
7. Update `.env.secure`

---

### 8️⃣ Meta/WhatsApp - HIGH PRIORITY

**Dashboard:** https://developers.facebook.com/apps/

**Steps:**
1. Login to Meta for Developers
2. Select your app
3. Go to **WhatsApp > API Setup**
4. Generate new **Permanent Access Token**
5. Copy token
6. Update `.env.secure`

---

### 9️⃣ Netlify - CRITICAL

**Dashboard:** https://app.netlify.com/user/applications

**Steps:**
1. Login to Netlify
2. Go to **User Settings > Applications**
3. Under **Personal Access Tokens**, click **"New access token"**
4. Description: `sandra-ia-deploy-secure`
5. Copy token
6. Revoke old token
7. Update `.env.secure`

---

## 🚀 DEPLOYMENT PROCEDURE

After rotating all keys:

### 1. Update Local Environment
```bash
# Copy new keys to .env.secure
nano .env.secure
# Paste each new key, replacing REPLACE_WITH_NEW_KEY_FROM_DASHBOARD
```

### 2. Deploy to Netlify
```bash
# Run the automated updater
node scripts/netlify-env-updater.js

# Or manually update each key
netlify env:set OPENAI_API_KEY "your-new-key" --site sensational-pegasus-d56cc3
netlify env:set ANTHROPIC_API_KEY "your-new-key" --site sensational-pegasus-d56cc3
# ... repeat for all keys
```

### 3. Trigger New Deployment
```bash
# Deploy with new environment
netlify deploy --prod --site sensational-pegasus-d56cc3
```

### 4. Verify Services
```bash
# Test each API endpoint
curl https://sensational-pegasus-d56cc3.netlify.app/api/health

# Check specific services
curl https://sensational-pegasus-d56cc3.netlify.app/api/test-openai
curl https://sensational-pegasus-d56cc3.netlify.app/api/test-cartesia
```

---

## ✅ POST-ROTATION CHECKLIST

### Immediate Actions
- [ ] All 9 API keys rotated
- [ ] Old keys revoked/deleted from dashboards
- [ ] New keys added to `.env.secure`
- [ ] Netlify environment variables updated
- [ ] Production deployment triggered
- [ ] All services tested and functional

### Security Hardening
- [ ] Enable 2FA on all provider accounts
- [ ] Set up IP whitelisting where available
- [ ] Configure webhook notifications for key usage
- [ ] Set up budget alerts on all services
- [ ] Enable audit logging

### Future Prevention
- [ ] Never commit `.env` files to git
- [ ] Use GitHub Secrets for CI/CD
- [ ] Implement secret scanning pre-commit hooks
- [ ] Schedule quarterly key rotation
- [ ] Document key management procedures

---

## 📊 VERIFICATION COMMANDS

Test all services after rotation:

```bash
# OpenAI
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "test"}]}'

# Anthropic
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model": "claude-3-haiku-20240307", "max_tokens": 10, "messages": [{"role": "user", "content": "test"}]}'

# Cartesia TTS
curl -X GET https://api.cartesia.ai/voices \
  -H "X-API-Key: $CARTESIA_API_KEY"

# Deepgram STT
curl https://api.deepgram.com/v1/projects \
  -H "Authorization: Token $DEEPGRAM_API_KEY"
```

---

## 🔒 SECURITY CONTACTS

For security incidents:
- OpenAI Security: security@openai.com
- Anthropic Security: security@anthropic.com
- GROQ Support: support@groq.com
- Netlify Support: https://www.netlify.com/support/

---

## 📝 INCIDENT TIMELINE

- **2025-10-28 15:53 UTC**: Security audit initiated
- **2025-10-28 15:54 UTC**: Exposed keys identified
- **2025-10-28 15:55 UTC**: Rotation procedures documented
- **2025-10-28 [PENDING]**: Manual key rotation
- **2025-10-28 [PENDING]**: Deployment with new keys
- **2025-10-28 [PENDING]**: Verification complete

---

**CRITICAL REMINDER:** Complete all rotations within 1 hour to minimize exposure window. The exposed keys are already public in git history and could be compromised at any moment.

**Security Auditor:** Claude Code Enterprise
**Authorized by:** CTO Authority
**Project:** SANDRA IA 7.0