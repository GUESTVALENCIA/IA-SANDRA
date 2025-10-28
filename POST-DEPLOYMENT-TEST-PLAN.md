# SANDRA IA 7.0 - POST-DEPLOYMENT TEST PLAN

**Production Staging URL:** https://sandra.guestsvalencia.es

---

## PHASE 1: INFRASTRUCTURE HEALTH (2 minutes)

### 1.1 Site Accessibility
```bash
# Check site is live:
curl -I https://sandra.guestsvalencia.es
# Expected: HTTP/2 200
```

**Manual check:**
- [ ] Open https://sandra.guestsvalencia.es in browser
- [ ] Page loads without errors
- [ ] No console errors in DevTools
- [ ] SSL certificate valid (green lock icon)

### 1.2 Health Endpoints
```bash
# Health check:
curl https://sandra.guestsvalencia.es/.netlify/functions/health
# Expected: {"status":"healthy","timestamp":"..."}

# Readiness check:
curl https://sandra.guestsvalencia.es/.netlify/functions/ready
# Expected: {"ready":true,"services":{...}}
```

### 1.3 Function Logs
```bash
# Monitor function logs:
npx netlify functions:log --live
# Should show function invocations without errors
```

---

## PHASE 2: UI/UX VALIDATION (5 minutes)

### 2.1 Visual Inspection
- [ ] Sandra avatar visible and properly sized
- [ ] Chat interface loads correctly
- [ ] Input field accessible
- [ ] Send button visible
- [ ] Voice button (microphone) visible
- [ ] Settings/menu accessible
- [ ] Responsive design works (resize browser)

### 2.2 PWA Features
- [ ] Manifest loads: Open DevTools → Application → Manifest
- [ ] Service Worker registers: Application → Service Workers
- [ ] Install prompt appears (or can be triggered)
- [ ] Icons load correctly (check manifest)
- [ ] Shortcuts defined (4 shortcuts expected)

### 2.3 Mobile Responsiveness
**Test on multiple viewports:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667 - iPhone SE)
- [ ] Mobile (390x844 - iPhone 14)

---

## PHASE 3: CORE FUNCTIONALITY (10 minutes)

### 3.1 Text Chat
1. **Send simple message:**
   - [ ] Type: "Hola Sandra"
   - [ ] Click send or press Enter
   - [ ] Message appears in chat
   - [ ] Loading indicator shows
   - [ ] Sandra responds within 3-5 seconds
   - [ ] Response is coherent and relevant

2. **Send follow-up:**
   - [ ] Type: "¿Cómo estás?"
   - [ ] Sandra maintains context
   - [ ] Response references previous message

3. **Error handling:**
   - [ ] Type very long message (500+ chars)
   - [ ] System handles gracefully
   - [ ] No crashes or freezes

### 3.2 Voice Input (Speech-to-Text)
**Requires microphone permission:**

1. **Grant permission:**
   - [ ] Click microphone button
   - [ ] Browser requests microphone access
   - [ ] Grant permission
   - [ ] Microphone indicator activates

2. **Voice message:**
   - [ ] Hold/click microphone button
   - [ ] Speak clearly: "Hola Sandra, ¿qué tiempo hace hoy?"
   - [ ] Release button
   - [ ] Speech converts to text in input
   - [ ] Text accuracy >80%
   - [ ] Send message
   - [ ] Sandra responds appropriately

3. **Background noise handling:**
   - [ ] Test with background music
   - [ ] Test with multiple speakers
   - [ ] System maintains accuracy

### 3.3 Voice Output (Text-to-Speech)
**Test Cartesia integration:**

1. **Basic TTS:**
   - [ ] Send message that triggers voice response
   - [ ] Audio plays automatically or on click
   - [ ] Voice is clear and natural (Cartesia quality)
   - [ ] Proper Spanish pronunciation
   - [ ] No robotic artifacts

2. **Voice controls:**
   - [ ] Can pause/resume audio
   - [ ] Can adjust volume
   - [ ] Can stop audio mid-sentence
   - [ ] Voice sync with text display

### 3.4 Avatar Sync
**Visual-audio synchronization:**

1. **Avatar animation:**
   - [ ] Avatar "speaks" when audio plays
   - [ ] Lip sync appears natural
   - [ ] Mouth movements match audio timing
   - [ ] No lag between audio and visual

2. **Idle animation:**
   - [ ] Avatar blinks periodically (every 3-5 seconds)
   - [ ] Subtle breathing/idle movement
   - [ ] Natural appearance when not speaking

3. **Transition smoothness:**
   - [ ] Idle → Speaking transition smooth
   - [ ] Speaking → Idle transition smooth
   - [ ] No jarring movements or glitches

### 3.5 Barge-in Detection
**Interrupt Sandra mid-response:**

1. **Text barge-in:**
   - [ ] Start Sandra speaking (long response)
   - [ ] Type new message mid-response
   - [ ] Send message
   - [ ] Sandra stops current response immediately
   - [ ] New response begins
   - [ ] No overlapping audio

2. **Voice barge-in:**
   - [ ] Start Sandra speaking
   - [ ] Click microphone while she's speaking
   - [ ] Speak interruption
   - [ ] Sandra stops immediately
   - [ ] Processes new voice input
   - [ ] Responds to interruption

---

## PHASE 4: ADVANCED FEATURES (10 minutes)

### 4.1 WebSocket Connection
**Real-time communication:**

```bash
# Monitor WebSocket in DevTools:
# Network → WS → socket.io
```

- [ ] WebSocket connects on page load
- [ ] Connection status indicator shows "connected"
- [ ] Reconnects automatically if disconnected
- [ ] No repeated connection attempts (no loop)

### 4.2 Multi-modal Interaction
**Combine text, voice, and avatar:**

1. **Test flow:**
   - [ ] Send text message
   - [ ] Sandra responds with voice
   - [ ] Avatar syncs with voice
   - [ ] Interrupt with voice
   - [ ] Sandra switches context smoothly
   - [ ] Continue with text
   - [ ] Conversation maintains coherence

### 4.3 Session Persistence
**Test conversation history:**

1. **Create conversation:**
   - [ ] Send 5-10 messages
   - [ ] Build conversation context
   - [ ] Note conversation state

2. **Refresh page:**
   - [ ] Reload browser (Ctrl+R)
   - [ ] Conversation history preserved
   - [ ] Context maintained
   - [ ] Can continue conversation

3. **Clear history:**
   - [ ] Clear conversation button works
   - [ ] History removed
   - [ ] New conversation starts fresh

### 4.4 Error Recovery
**Test failure scenarios:**

1. **Network interruption:**
   - [ ] Disconnect internet mid-conversation
   - [ ] UI shows "offline" indicator
   - [ ] Reconnect internet
   - [ ] System recovers automatically
   - [ ] Can resume conversation

2. **API failures:**
   - [ ] Monitor for API errors in console
   - [ ] System displays user-friendly error
   - [ ] Retry mechanism works
   - [ ] Doesn't crash application

---

## PHASE 5: PERFORMANCE METRICS (5 minutes)

### 5.1 Lighthouse Audit
```bash
# Run Lighthouse:
npx lighthouse https://sandra.guestsvalencia.es --output=json --output-path=./reports/lighthouse.json
```

**Target scores:**
- [ ] Performance: ≥90
- [ ] Accessibility: ≥95
- [ ] Best Practices: ≥90
- [ ] SEO: ≥100
- [ ] PWA: ✅ All checks pass

### 5.2 Response Times
**Measure latency:**

- [ ] Text message → Response: <3 seconds
- [ ] Voice input → Text: <2 seconds
- [ ] TTS audio generation: <2 seconds
- [ ] Avatar sync delay: <100ms
- [ ] Page load time: <2 seconds
- [ ] Time to Interactive (TTI): <3 seconds

### 5.3 Resource Loading
**Check DevTools → Network:**

- [ ] Total page weight: <2MB
- [ ] JavaScript bundle: <500KB
- [ ] CSS: <100KB
- [ ] Images optimized: WebP/AVIF
- [ ] Fonts subset/optimized
- [ ] No 404 errors
- [ ] All CORS headers correct

---

## PHASE 6: MOBILE DEVICE TESTING (15 minutes)

### 6.1 iOS Testing
**Test on iPhone (iOS 14+):**

1. **Browser test (Safari):**
   - [ ] Open https://sandra.guestsvalencia.es
   - [ ] All features work in Safari
   - [ ] Voice input works
   - [ ] TTS audio plays
   - [ ] Avatar animates smoothly
   - [ ] Responsive design correct

2. **PWA installation:**
   - [ ] Safari → Share → Add to Home Screen
   - [ ] Icon appears on home screen
   - [ ] Launch from home screen
   - [ ] Runs in standalone mode
   - [ ] No browser UI visible
   - [ ] Splash screen displays
   - [ ] App feels native

3. **Offline capability:**
   - [ ] Enable airplane mode
   - [ ] Open PWA from home screen
   - [ ] Offline page/message shows
   - [ ] Cached content accessible
   - [ ] Disable airplane mode
   - [ ] Auto-reconnects

### 6.2 Android Testing
**Test on Android (8.0+):**

1. **Browser test (Chrome):**
   - [ ] Open URL in Chrome
   - [ ] Install prompt appears
   - [ ] All features functional
   - [ ] Voice/TTS works
   - [ ] Avatar smooth

2. **PWA installation:**
   - [ ] Chrome → Menu → Install app
   - [ ] App installs on device
   - [ ] Launch from app drawer
   - [ ] Standalone mode works
   - [ ] Native app experience

3. **Permissions:**
   - [ ] Microphone permission granted
   - [ ] Camera permission (if needed)
   - [ ] Notifications enabled
   - [ ] Permissions persist

---

## PHASE 7: SECURITY VALIDATION (5 minutes)

### 7.1 Headers Check
```bash
# Check security headers:
curl -I https://sandra.guestsvalencia.es
```

**Verify headers present:**
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy: microphone=*; camera=*
- [ ] Strict-Transport-Security (HSTS)

### 7.2 SSL/TLS
- [ ] Valid SSL certificate
- [ ] Certificate not expired
- [ ] HTTPS enforced (HTTP redirects)
- [ ] TLS 1.2+ enabled
- [ ] Strong cipher suites

### 7.3 API Key Security
- [ ] No API keys exposed in client code
- [ ] Keys only in server-side functions
- [ ] No keys in console logs
- [ ] No keys in network responses

---

## PHASE 8: MONITORING SETUP (5 minutes)

### 8.1 Netlify Analytics
**Check dashboard:**
- [ ] Analytics enabled: https://app.netlify.com/sites/grand-pasca-a584d5/analytics
- [ ] Traffic tracking works
- [ ] Function invocations logged
- [ ] Error rates monitored

### 8.2 Function Logs
```bash
# Set up log monitoring:
npx netlify functions:log --live
```

**Monitor for:**
- [ ] Function cold starts
- [ ] Execution times
- [ ] Error rates
- [ ] Memory usage
- [ ] Timeout warnings

### 8.3 Alerts (Optional)
**Set up alerts for:**
- [ ] Error rate >5%
- [ ] Response time >5s
- [ ] Function timeout
- [ ] 500 errors
- [ ] API quota exceeded

---

## PHASE 9: USER ACCEPTANCE (10 minutes)

### 9.1 Real-world Scenarios
**Test actual use cases:**

1. **Customer inquiry:**
   - [ ] "Necesito ayuda con una reserva"
   - [ ] Sandra provides relevant assistance
   - [ ] Can handle follow-up questions
   - [ ] Transfers to human if needed

2. **Information request:**
   - [ ] "¿Qué servicios ofrecen?"
   - [ ] Sandra provides accurate information
   - [ ] Can elaborate on details
   - [ ] Provides links/resources

3. **Conversational flow:**
   - [ ] Sandra maintains personality
   - [ ] Responses feel natural
   - [ ] Context preserved across messages
   - [ ] Handles topic changes gracefully

### 9.2 Edge Cases
**Test unusual inputs:**

- [ ] Empty message (should be blocked)
- [ ] Very long message (500+ words)
- [ ] Special characters: `@#$%^&*()`
- [ ] Emojis: 😀🎉🚀
- [ ] Multiple languages: English, Spanish, mixed
- [ ] Code snippets: \`const x = 1;\`
- [ ] URLs: https://example.com
- [ ] Repeated identical messages
- [ ] Rapid-fire messages (spam test)

---

## PHASE 10: FINAL CHECKLIST (5 minutes)

### 10.1 Production Readiness
- [ ] All critical features working
- [ ] No console errors
- [ ] Performance meets targets
- [ ] Security validated
- [ ] Mobile experience excellent
- [ ] PWA installable
- [ ] Monitoring active
- [ ] Error handling robust
- [ ] User experience smooth

### 10.2 Documentation
- [ ] README updated
- [ ] API documentation current
- [ ] Deployment guide accurate
- [ ] Troubleshooting guide available
- [ ] Change log updated

### 10.3 Rollback Plan
- [ ] Previous version noted
- [ ] Rollback command ready: `npx netlify rollback`
- [ ] Backup of current state
- [ ] Recovery procedure documented

---

## SUCCESS CRITERIA

### MUST PASS (Blocking)
- ✅ Site accessible
- ✅ Text chat functional
- ✅ Voice I/O working
- ✅ Avatar sync operational
- ✅ No critical errors
- ✅ Performance ≥80 Lighthouse
- ✅ Mobile responsive
- ✅ PWA installable

### SHOULD PASS (Non-blocking)
- Voice quality excellent
- Barge-in reliable
- Sub-2s response times
- Offline mode works
- All edge cases handled
- Performance ≥90 Lighthouse

### NICE TO HAVE
- Perfect lip sync
- <1s response times
- 100% voice accuracy
- Advanced analytics

---

## ISSUE REPORTING

**If test fails, document:**

1. **What was tested?**
2. **Expected result?**
3. **Actual result?**
4. **Steps to reproduce?**
5. **Browser/device?**
6. **Console errors?**
7. **Network logs?**
8. **Screenshots/video?**

**Report to:** CTO (immediate)
**Format:** GitHub issue or direct message

---

## DEPLOYMENT SIGN-OFF

**Tested by:** [Name]
**Date:** [Date]
**Time:** [Time]
**Duration:** [Total test time]

**Overall Status:**
- [ ] ✅ PASS - Ready for production
- [ ] ⚠️ PASS WITH ISSUES - Deploy with monitoring
- [ ] ❌ FAIL - Rollback required

**Notes:**

**Approved by:**
- [ ] CTO - Technical validation
- [ ] CEO - Business validation

---

**READY TO GO LIVE!** 🚀
