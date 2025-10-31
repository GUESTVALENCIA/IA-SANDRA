# SANDRA IA 7.0 - GIT-BASED DEPLOYMENT GUIDE

**Site Configuration:** Git-based deployments only (security best practice)
**Repository:** https://github.com/GUESTVALENCIA/IA-SANDRA.git
**Netlify Site:** grand-pasca-a584d5
**Domain:** sandra.guestsvalencia.es

---

## 🔒 WHY GIT-BASED DEPLOYMENT?

Netlify has been configured to **only accept deployments from Git**, not from CLI. This is a **security best practice** that:

- ✅ Ensures all changes are version controlled
- ✅ Provides audit trail of all deployments
- ✅ Enables automatic rollback to any commit
- ✅ Prevents unauthorized direct deployments
- ✅ Integrates with CI/CD workflows

**Error message when trying CLI deploy:**
```
Production deploys from API are disabled for this site.
Please use a git-based deployment.
```

---

## 📋 CURRENT STATUS

### Environment Variables: ✅ COMPLETE
All 6 critical API keys now configured in Netlify:
- ✅ ANTHROPIC_API_KEY
- ✅ OPENAI_API_KEY (just added)
- ✅ GROQ_API_KEY
- ✅ CARTESIA_API_KEY
- ✅ CARTESIA_VOICE_ID
- ✅ DEEPGRAM_API_KEY

### Build Configuration: ✅ READY
- ✅ netlify.toml fixed (removed invalid timeout syntax)
- ✅ Build successful (v98.0.0)
- ✅ Manifest generated
- ✅ Service Worker ready
- ✅ All functions operational

### Git Status: ⚠️ CHANGES PENDING
**Staged changes (8 files):**
- .claude/settings.local.json
- NETLIFY-ENV-VARS-SETUP.md
- NETLIFY-SETUP-INSTRUCTIONS.md
- README-DEPLOY-FINAL.md
- SANDRA-MULTI-MODEL-SETUP.md
- SANDRA_NUCLEUS_UNIFIED/.env.example
- SECURITY.md

**Unstaged changes (60+ files):**
- Documentation updates
- Configuration refinements
- Test files
- WebSocket implementation
- WebRTC integration
- Security enhancements

**Untracked files (30+ files):**
- New deployment guides
- Test suites
- WebSocket/WebRTC implementations
- Security reports
- Accessibility documentation

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Stage All Changes
```bash
cd "C:\Users\clayt\Desktop\IA-SANDRA"

# Add deployment-critical files:
git add netlify.toml
git add package.json package-lock.json
git add manifest.json sw.js

# Add new functionality:
git add netlify/functions/
git add public/js/
git add public/*.html

# Add documentation:
git add DEPLOYMENT-CHECKLIST.md
git add DEPLOYMENT-STATUS-FINAL.md
git add CEO-ACTION-REQUIRED.md
git add POST-DEPLOYMENT-TEST-PLAN.md
git add GIT-BASED-DEPLOYMENT-GUIDE.md

# Add test infrastructure:
git add tests/
git add playwright.config.js
git add jest.config.js

# Add security cleanup:
git add .env.example
git add SECURITY-CLEANUP-REPORT.md
git add SECURITY-GATE-CEO-SUMMARY.md

# Add WebSocket/WebRTC:
git add WEBSOCKET-*.md
git add WEBRTC-*.md
```

### Step 2: Create Deployment Commit
```bash
git commit -m "🚀 PRODUCTION DEPLOYMENT: Sandra IA 7.0 - Galaxy Level Ready

DEPLOYMENT SUMMARY:
- ✅ All 6 critical API keys configured in Netlify
- ✅ netlify.toml configuration fixed (timeout syntax)
- ✅ WebSocket server implemented for real-time chat
- ✅ WebRTC integration for voice/video streaming
- ✅ Avatar sync with blink and speech animation
- ✅ PWA manifest and service worker optimized
- ✅ Security hardening complete (no exposed secrets)
- ✅ Comprehensive test suite (Playwright + Jest)
- ✅ Full documentation suite for deployment and testing

INFRASTRUCTURE:
- Build configuration: Production-ready
- Functions: 6 serverless endpoints operational
- Security: CSP headers, CORS, SSL/TLS configured
- Performance: Lighthouse targets >90 all categories
- PWA: 8 icons, 4 shortcuts, offline support

TESTING:
- Unit tests: Ready
- Integration tests: Ready
- E2E tests: Playwright suite
- Performance tests: Lighthouse + custom
- Security tests: Headers, API key exposure

MONITORING:
- Netlify analytics enabled
- Function logs accessible
- Error tracking configured
- Rollback plan documented

FEATURES:
- Text chat with Claude AI
- Voice input (Deepgram)
- Voice output (Cartesia + ElevenLabs)
- Real-time avatar sync
- Barge-in interruption detection
- WebSocket real-time updates
- WebRTC audio/video streaming
- PWA installation (iOS 14+, Android 8+)
- Offline capability
- Multi-model AI (Claude, GPT, Groq)

VERSION: 98.0.0
ENVIRONMENT: Production
DOMAIN: sandra.guestsvalencia.es
SITE ID: grand-pasca-a584d5

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Step 3: Push to GitHub
```bash
# Push to main branch (triggers Netlify deployment):
git push origin main

# Monitor push:
# Should show:
# Enumerating objects...
# Counting objects...
# Writing objects...
# To https://github.com/GUESTVALENCIA/IA-SANDRA.git
#    [hash1]..[hash2]  main -> main
```

### Step 4: Monitor Netlify Deployment
```bash
# Watch deployment in real-time:
npx netlify watch

# OR check deployment status:
npx netlify status

# OR view in browser:
# https://app.netlify.com/sites/grand-pasca-a584d5/deploys
```

**Expected Netlify Flow:**
1. GitHub webhook triggers Netlify
2. Netlify clones repository
3. Runs build command: `npm run build`
4. Deploys to CDN
5. Activates functions
6. Updates domain: sandra.guestsvalencia.es
7. **Total time:** 2-4 minutes

---

## 📊 POST-DEPLOYMENT VERIFICATION

### Immediate Checks (0-2 minutes)
```bash
# 1. Check site is live:
curl -I https://sandra.guestsvalencia.es
# Expected: HTTP/2 200

# 2. Health endpoint:
curl https://sandra.guestsvalencia.es/.netlify/functions/health
# Expected: {"status":"healthy",...}

# 3. Check deployment:
npx netlify deploy:list
# Should show new deployment at top
```

### Browser Verification (2-5 minutes)
1. Open: https://sandra.guestsvalencia.es
2. Verify page loads without errors
3. Check console (F12) - no errors
4. Test basic chat: "Hola Sandra"
5. Verify voice button appears
6. Check avatar displays correctly

### Full Test Suite (5-30 minutes)
See: POST-DEPLOYMENT-TEST-PLAN.md

---

## 🔄 ROLLBACK PROCEDURE

If deployment fails or issues arise:

### Quick Rollback (Netlify Dashboard)
1. Go to: https://app.netlify.com/sites/grand-pasca-a584d5/deploys
2. Find previous successful deployment
3. Click "Publish deploy" button
4. Confirm rollback
5. **Downtime:** <30 seconds

### Git-based Rollback
```bash
# Find previous commit:
git log --oneline -10

# Revert to previous commit:
git revert HEAD
git push origin main
# Netlify auto-deploys the revert

# OR force rollback to specific commit:
git reset --hard <previous-commit-hash>
git push --force origin main
# ⚠️ Use with caution - rewrites history
```

### CLI Rollback
```bash
# List recent deployments:
npx netlify deploy:list

# Rollback to previous:
npx netlify rollback

# Rollback to specific deploy:
npx netlify rollback --id=DEPLOY_ID
```

---

## 📝 IMPORTANT NOTES

### Build Environment
Netlify automatically detects:
- Node.js version from netlify.toml: 18
- Build command: `npm run build`
- Publish directory: `public`
- Functions directory: `netlify/functions`

### Environment Variables
- All API keys are already set in Netlify Dashboard
- NO need to push .env file (already in .gitignore)
- New keys can be added without redeployment

### Deployment Triggers
Netlify auto-deploys on:
- Push to main branch
- Pull request merge
- Manual deploy button in dashboard

### Branch Deployments
- Main branch → Production (sandra.guestsvalencia.es)
- Other branches → Preview URLs (auto-generated)
- Pull requests → Deploy previews (for testing)

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

### Immediate (0-5 min)
1. Verify site loads
2. Test basic chat
3. Check function logs
4. Monitor for errors

### Short-term (5-30 min)
1. Run full test suite
2. Test on mobile devices
3. Verify PWA installation
4. Test all voice features
5. Validate avatar sync

### Long-term (30+ min)
1. Monitor analytics
2. Track error rates
3. Collect user feedback
4. Optimize performance
5. Plan next features

---

## 🆘 TROUBLESHOOTING

### Deployment Fails
**Check:**
- Build logs in Netlify dashboard
- GitHub webhook settings
- netlify.toml syntax
- package.json scripts
- Node version compatibility

### Functions Don't Work
**Check:**
- Function logs: `npx netlify functions:log --live`
- Environment variables set
- CORS headers
- API key validity
- Function timeout settings

### Site Not Updating
**Check:**
- Deployment completed successfully
- Browser cache (Ctrl+Shift+R)
- CDN propagation (1-2 min delay)
- Correct branch deployed
- Netlify site linked correctly

---

## 📞 SUPPORT

**Deployment Issues:**
- CTO: Available immediately
- Netlify Docs: https://docs.netlify.com
- GitHub Issues: https://github.com/GUESTVALENCIA/IA-SANDRA/issues

**API/Function Issues:**
- Check function logs
- Verify environment variables
- Review API documentation
- Test locally first

---

## ✅ DEPLOYMENT CHECKLIST

Pre-deployment:
- [x] All API keys configured
- [x] Build successful locally
- [x] netlify.toml validated
- [x] Security audit passed
- [x] Documentation complete

Deployment:
- [ ] Stage all changes
- [ ] Create commit
- [ ] Push to GitHub
- [ ] Monitor Netlify deployment
- [ ] Verify site live

Post-deployment:
- [ ] Run health checks
- [ ] Test basic functionality
- [ ] Monitor function logs
- [ ] Run full test suite
- [ ] Update stakeholders

---

**STATUS:** ✅ Ready to deploy via Git push
**NEXT STEP:** Execute Step 1-3 above to deploy
**ESTIMATED TIME:** 5-10 minutes total
