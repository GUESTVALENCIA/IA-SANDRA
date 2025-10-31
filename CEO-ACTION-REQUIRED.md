# CEO ACTION REQUIRED - API KEY VERIFICATION

## IMMEDIATE ACTION NEEDED

Sandra IA 7.0 is **100% READY** for deployment to production staging at:
**https://sandra.guestsvalencia.es**

**ONLY BLOCKING ISSUE:** Need to verify 6 critical API keys are configured in Netlify.

---

## STEP 1: OPEN NETLIFY DASHBOARD

Go to: https://app.netlify.com/sites/grand-pasca-a584d5/settings/env

**Login with:** claytis33@gmail.com

---

## STEP 2: VERIFY THESE 6 API KEYS EXIST

Check if these environment variables are set (click "Show values" if needed):

### 1. ANTHROPIC_API_KEY
- **Purpose:** Claude AI for conversational intelligence
- **Critical:** YES - Powers Sandra's conversational brain
- **Expected format:** `sk-ant-api03-...`

### 2. OPENAI_API_KEY
- **Purpose:** GPT models for advanced reasoning
- **Critical:** YES - Backup AI model
- **Expected format:** `sk-proj-...` or `sk-...`

### 3. GROQ_API_KEY
- **Purpose:** Ultra-fast AI inference
- **Critical:** YES - Real-time responses
- **Expected format:** `gsk_...`

### 4. CARTESIA_API_KEY
- **Purpose:** Text-to-speech (Sandra's voice)
- **Critical:** YES - Voice output
- **Expected format:** `ck_...`

### 5. CARTESIA_VOICE_ID
- **Purpose:** Sandra's specific voice configuration
- **Critical:** YES - Voice identity
- **Expected format:** UUID like `a0e99841-438c-4a64-b679-ae501e7d6091`

### 6. DEEPGRAM_API_KEY
- **Purpose:** Speech-to-text (voice input)
- **Critical:** YES - Voice input
- **Expected format:** `[long string]`

---

## STEP 3: IF ANY KEY IS MISSING

### Option A: Add from existing .env file

1. Open: `C:\Users\clayt\Desktop\IA-SANDRA\.env`
2. Find the missing key(s)
3. In Netlify Dashboard, click "Add variable"
4. Enter:
   - **Key:** The variable name (e.g., `ANTHROPIC_API_KEY`)
   - **Value:** The value from .env file
   - **Scopes:** Check "All" (or "Production" + "Deploy previews")
5. Click "Save"

### Option B: If .env is missing keys

**Contact CTO immediately** - Keys need to be rotated for security.

DO NOT deploy without these keys - Sandra will not function.

---

## STEP 4: AFTER VERIFICATION

Once all 6 keys are confirmed present in Netlify Dashboard:

### Notify CTO with this message:

```
✅ API Keys verified in Netlify Dashboard
Ready for deployment to production staging
Proceed with: npm run deploy
```

---

## OPTIONAL: TEST KEYS BEFORE DEPLOYMENT

You can test a specific key works:

```bash
# Test Anthropic (Claude)
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY_HERE" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'

# Should return JSON with Claude's response
```

---

## TIMELINE

- **Verification time:** 5-10 minutes
- **Deployment time:** 2-3 minutes after verification
- **Total to live:** ~15 minutes

---

## CONTACT

If you have any questions or need the CTO to add the keys:

**CTO Available:** Yes, standing by
**Response time:** Immediate

---

**STATUS:** ⏳ Waiting for CEO verification
**NEXT:** CEO verifies → CTO deploys → Sandra goes live
