# Sandra IA - WCAG 2.1 AA Accessibility Audit Report

**Project:** Sandra IA 7.0 - Phase 12 Accessibility
**Target:** Convert from 45/100 to 80+/100 compliance score
**Date:** 2025-10-28
**Auditor:** Mobile-First UI/UX Optimization Specialist

---

## EXECUTIVE SUMMARY

**Current State:** 45/100 Accessibility Score (Critical gaps identified)
**Target State:** 80+/100 WCAG 2.1 AA Compliance
**Estimated Implementation Time:** 3-4 hours
**Priority Level:** HIGH (Legal compliance + UX improvement)

---

## CRITICAL ACCESSIBILITY GAPS IDENTIFIED

### 1. SEMANTIC HTML STRUCTURE - CRITICAL
**Status:** FAILING
**Impact:** Screen readers cannot navigate document structure
**Current State:**
- No semantic HTML5 elements (nav, main, article, footer)
- No ARIA landmark roles
- Flat div-based structure

**Required Fix:**
```html
<main role="main" aria-label="Sandra IA Chat Interface">
  <div class="container">
    <!-- Chat content -->
  </div>
</main>

<footer role="contentinfo" aria-label="Application Footer">
  <!-- Footer content if needed -->
</footer>
```

**WCAG Criteria:** 1.3.1 Info and Relationships (Level A)

---

### 2. ARIA ATTRIBUTES - CRITICAL
**Status:** FAILING (ZERO ARIA attributes detected)
**Impact:** Screen reader users cannot understand interface purpose
**Current State:**
- No aria-label on any element
- No aria-describedby associations
- No role attributes except implicit HTML roles

**Required Implementation:**

#### Chat Input Field
```html
<input
  id="input"
  type="text"
  placeholder="Escribe o pulsa 🎤 para hablar..."
  autocomplete="off"
  aria-label="Campo de texto para enviar mensaje o activar entrada por voz"
  aria-describedby="input-hint"
/>
<span id="input-hint" class="sr-only">
  Presiona Enter para enviar o haz clic en el botón del micrófono para hablar
</span>
```

#### Send Button
```html
<button
  class="btn"
  id="sendBtn"
  aria-label="Enviar mensaje"
  title="Enviar mensaje (Enter o click)"
>▶️</button>
```

#### Voice/Microphone Button
```html
<button
  class="btn voice-btn"
  id="micBtn"
  aria-label="Activar o desactivar entrada de voz"
  aria-pressed="false"
  title="Micrófono para entrada de voz"
>🎤</button>
```

#### Chat Messages Container
```html
<div class="chat" role="log" aria-label="Historial de conversación con Sandra">
  <!-- Messages -->
</div>
```

#### Individual Messages
```html
<div
  class="msg user"
  role="article"
  aria-label="Tu mensaje"
  tabindex="0"
>
  [User message content]
</div>

<div
  class="msg ai"
  role="article"
  aria-label="Respuesta de Sandra"
  tabindex="0"
>
  [AI response content]
</div>
```

**WCAG Criteria:** 4.1.2 Name, Role, Value (Level A)

---

### 3. KEYBOARD NAVIGATION - CRITICAL
**Status:** FAILING
**Impact:** Keyboard-only users cannot interact with application
**Current State:**
- No keyboard event handlers
- No Enter key support for sending messages
- No Space/Enter for button activation
- No Tab order management

**Required Implementation:**

```javascript
// Keyboard Navigation Handler
document.addEventListener('keydown', (e) => {
  // Send message with Enter key
  if (e.key === 'Enter' && e.target.id === 'input') {
    e.preventDefault();
    document.getElementById('sendBtn').click();
  }

  // Toggle microphone with Space or Enter
  if ((e.key === ' ' || e.key === 'Enter') && e.target.id === 'micBtn') {
    e.preventDefault();
    e.target.click();
  }

  // Navigate messages with Arrow keys
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    const messages = document.querySelectorAll('.msg[tabindex="0"]');
    const currentIndex = Array.from(messages).indexOf(document.activeElement);

    if (e.key === 'ArrowUp' && currentIndex > 0) {
      messages[currentIndex - 1].focus();
    } else if (e.key === 'ArrowDown' && currentIndex < messages.length - 1) {
      messages[currentIndex + 1].focus();
    }
  }

  // Escape key to stop voice recognition
  if (e.key === 'Escape' && recognizing) {
    stopRec();
  }
});

// Update aria-pressed for mic button
function updateMicButtonState(isActive) {
  const micBtn = document.getElementById('micBtn');
  micBtn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
}
```

**WCAG Criteria:** 2.1.1 Keyboard (Level A)

---

### 4. FOCUS INDICATORS - CRITICAL
**Status:** FAILING
**Impact:** Keyboard users cannot see current focus position
**Current State:**
- No custom focus styles
- Browser default focus may be suppressed
- No focus-visible implementation

**Required CSS:**

```css
/* Visible Focus Indicators */
button:focus-visible,
input:focus-visible,
[tabindex]:focus-visible {
  outline: 3px solid #5f9cff; /* --accent2 color */
  outline-offset: 2px;
  border-radius: 12px;
}

/* Remove default outline but keep for keyboard */
button:focus:not(:focus-visible),
input:focus:not(:focus-visible) {
  outline: none;
}

/* Enhanced focus for high contrast mode */
@media (prefers-contrast: high) {
  button:focus-visible,
  input:focus-visible {
    outline: 4px solid currentColor;
    outline-offset: 4px;
  }
}

/* Focus for chat messages */
.msg:focus-visible {
  outline: 2px solid #5f9cff;
  outline-offset: 4px;
}
```

**WCAG Criteria:** 2.4.7 Focus Visible (Level AA)

---

### 5. SCREEN READER SUPPORT - CRITICAL
**Status:** FAILING
**Impact:** Screen reader users receive no dynamic updates
**Current State:**
- No ARIA live regions
- No status announcements
- No loading state indicators

**Required Implementation:**

#### Add Live Regions to HTML
```html
<!-- Screen reader announcements for chat messages -->
<div
  id="chat-announcer"
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
></div>

<!-- Screen reader announcements for app status -->
<div
  id="status-announcer"
  role="status"
  aria-live="assertive"
  aria-atomic="true"
  class="sr-only"
></div>

<!-- Loading indicator -->
<div
  id="loading-indicator"
  aria-busy="false"
  aria-label="Estado de carga"
  class="sr-only"
></div>
```

#### Update JavaScript Functions
```javascript
// Announce new messages to screen readers
function pushMsg(role, content) {
  const div = document.createElement('div');
  div.className = 'msg ' + (role === 'user' ? 'user' : 'ai');
  div.setAttribute('role', 'article');
  div.setAttribute('aria-label', role === 'user' ? 'Tu mensaje' : 'Respuesta de Sandra');
  div.setAttribute('tabindex', '0');
  div.textContent = content;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  messages.push({ role, content });

  // Announce to screen readers
  const announcer = document.getElementById('chat-announcer');
  announcer.textContent = `${role === 'user' ? 'Tú dijiste' : 'Sandra respondió'}: ${content}`;
}

// Announce status changes
function state(t) {
  stateEl.textContent = t;

  // Announce to screen readers
  const announcer = document.getElementById('status-announcer');
  announcer.textContent = t;
}

// Update loading state
function setLoadingState(isLoading) {
  const loader = document.getElementById('loading-indicator');
  loader.setAttribute('aria-busy', isLoading ? 'true' : 'false');
  loader.textContent = isLoading ? 'Cargando respuesta de Sandra' : '';
}
```

**WCAG Criteria:** 4.1.3 Status Messages (Level AA)

---

### 6. COLOR CONTRAST - WARNING
**Status:** NEEDS VERIFICATION
**Impact:** Low vision users may not be able to read text
**Current Colors to Verify:**

| Element | Foreground | Background | Ratio Required | Status |
|---------|-----------|------------|----------------|---------|
| Body text | #e8f0fe | #0b0c10 | 4.5:1 | VERIFY |
| Muted text | #9aa3b2 | #0b0c10 | 4.5:1 | VERIFY |
| Primary button | #04251e | gradient | 4.5:1 | VERIFY |
| User message | #e8f0fe | rgba(255,255,255,.06) | 4.5:1 | VERIFY |
| AI message | #e8f0fe | gradient | 4.5:1 | VERIFY |

**Required Action:** Use contrast checker tool to verify all combinations meet WCAG AA (4.5:1 for normal text, 3:1 for large text)

**Tools:**
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools: Lighthouse accessibility audit

**WCAG Criteria:** 1.4.3 Contrast (Minimum) (Level AA)

---

### 7. FORM LABELS - CRITICAL
**Status:** FAILING
**Impact:** Screen readers cannot identify form field purpose
**Current State:**
- Input uses placeholder as label (not accessible)
- No <label> element
- No aria-labelledby association

**Required Fix:**

**Option 1: Visible Label (Recommended)**
```html
<label for="input" class="input-label">Mensaje:</label>
<input
  id="input"
  type="text"
  placeholder="Escribe o pulsa 🎤 para hablar..."
  autocomplete="off"
  aria-describedby="input-hint"
/>
```

**Option 2: Screen Reader Only Label**
```html
<label for="input" class="sr-only">Campo de mensaje para Sandra IA</label>
<input
  id="input"
  type="text"
  placeholder="Escribe o pulsa 🎤 para hablar..."
  autocomplete="off"
/>
```

**Required CSS for .sr-only class:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**WCAG Criteria:** 1.3.1 Info and Relationships (Level A), 3.3.2 Labels or Instructions (Level A)

---

### 8. HEADING STRUCTURE - CRITICAL
**Status:** FAILING
**Impact:** Screen reader users cannot navigate by heading
**Current State:**
- Title is a div, not a heading
- No heading hierarchy
- Modal has h3 but no h1/h2 context

**Required Fix:**

```html
<div class="container">
  <header class="header">
    <div class="avatar">
      <!-- Avatar content -->
    </div>
    <div>
      <h1 class="title">Sandra IA</h1>
      <p class="badge">Voz · Barge-in · Español</p>
    </div>
  </header>

  <section aria-label="Conversación">
    <h2 class="sr-only">Historial de mensajes</h2>
    <div class="panel" id="panelChat">
      <!-- Chat content -->
    </div>
  </section>

  <section aria-label="Controles de entrada">
    <h2 class="sr-only">Enviar mensaje</h2>
    <div class="controls">
      <!-- Input controls -->
    </div>
  </section>
</div>
```

**Update CSS for heading styles:**
```css
h1.title {
  font-weight: 800;
  font-size: 1.25rem; /* 20px */
  margin: 0;
}

h2.sr-only {
  /* Use sr-only class styles */
}
```

**WCAG Criteria:** 1.3.1 Info and Relationships (Level A), 2.4.6 Headings and Labels (Level AA)

---

### 9. ERROR HANDLING - HIGH PRIORITY
**Status:** FAILING
**Impact:** Users don't receive accessible error messages
**Current State:**
- Errors shown only in status div
- No aria-invalid on form fields
- No error associations

**Required Implementation:**

```javascript
// Enhanced error handling
function showError(message, fieldId = null) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert';
  errorDiv.setAttribute('role', 'alert');
  errorDiv.setAttribute('aria-live', 'assertive');
  errorDiv.id = 'error-message';
  errorDiv.textContent = message;

  // Associate with field if provided
  if (fieldId) {
    const field = document.getElementById(fieldId);
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', 'error-message');
  }

  // Announce to screen readers
  const announcer = document.getElementById('status-announcer');
  announcer.textContent = `Error: ${message}`;

  // Insert error message
  const panel = document.getElementById('panelChat');
  panel.appendChild(errorDiv);

  // Remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
    if (fieldId) {
      const field = document.getElementById(fieldId);
      field.setAttribute('aria-invalid', 'false');
      field.removeAttribute('aria-describedby');
    }
  }, 5000);
}

// Update error handling in handleQuery
async function handleQuery(text) {
  try {
    state('🤖 Pensando...');
    setLoadingState(true);
    const { text: answer } = await chatLLM(text);
    if (!answer) throw new Error('Respuesta vacía del sistema');
    pushMsg('assistant', answer);
    state('📢 Hablando...');
    await ttsSpeak(answer);
    state('🟢 Listo');
    setLoadingState(false);
  } catch(e) {
    console.error('handleQuery error:', e);
    setLoadingState(false);
    const errorMessage = e.message || 'Error desconocido';
    state(`❌ Error: ${errorMessage}`);
    showError(`Disculpa, hubo un error: ${errorMessage}`);
    pushMsg('assistant', '❌ Disculpa, hubo un error. Reinténtalo.');
  }
}

// Validation before sending
sendBtn.onclick = () => {
  const v = input.value.trim();
  if (!v) {
    showError('Por favor escribe un mensaje antes de enviar', 'input');
    input.focus();
    return;
  }
  pushMsg('user', v);
  input.value = '';
  handleQuery(v);
};
```

**WCAG Criteria:** 3.3.1 Error Identification (Level A), 3.3.3 Error Suggestion (Level AA)

---

### 10. RESPONSIVE TEXT SIZING - MEDIUM PRIORITY
**Status:** NEEDS IMPROVEMENT
**Impact:** Users cannot zoom text to 200% without horizontal scrolling
**Current State:**
- Uses px units for most text
- No rem-based scaling
- Fixed font-size: 15px

**Required CSS Updates:**

```css
:root {
  --bg: #0b0c10;
  --panel: #121417;
  --text: #e8f0fe;
  --muted: #9aa3b2;
  --accent: #2ee6a6;
  --accent2: #5f9cff;
  --danger: #ff4d6d;

  /* Typography scale in rem */
  --font-xs: 0.75rem;   /* 12px */
  --font-sm: 0.875rem;  /* 14px */
  --font-base: 1rem;    /* 16px */
  --font-lg: 1.125rem;  /* 18px */
  --font-xl: 1.25rem;   /* 20px */
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font: 500 var(--font-base) system-ui, -apple-system, Segoe UI, Roboto, Ubuntu;
  line-height: 1.5;
}

.title {
  font-weight: 800;
  font-size: var(--font-xl);
}

.badge {
  font-size: var(--font-xs);
  color: var(--muted);
}

.msg {
  max-width: 85%;
  padding: 0.625rem 0.75rem;
  border-radius: 1rem;
  line-height: 1.35;
  font-size: var(--font-base);
}

button {
  font-size: var(--font-base);
}

.state {
  font-size: var(--font-xs);
  color: var(--muted);
  margin-top: 0.375rem;
}

.small {
  font-size: var(--font-xs);
  color: var(--muted);
}

/* Support text zoom up to 200% */
@media (max-width: 400px) {
  :root {
    --font-base: 0.9375rem; /* 15px */
  }
}
```

**WCAG Criteria:** 1.4.4 Resize Text (Level AA)

---

### 11. SKIP NAVIGATION - MEDIUM PRIORITY
**Status:** MISSING
**Impact:** Keyboard users must tab through all elements
**Current State:** No skip link present

**Required Implementation:**

```html
<!-- Add at the very top of body -->
<a href="#main-content" class="skip-link">
  Saltar al contenido principal
</a>

<!-- Add id to main content area -->
<div class="container" id="main-content">
  <!-- Existing content -->
</div>
```

**Required CSS:**
```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent);
  color: #000;
  padding: 8px 16px;
  text-decoration: none;
  font-weight: 700;
  border-radius: 0 0 8px 0;
  z-index: 10000;
}

.skip-link:focus {
  top: 0;
}
```

**WCAG Criteria:** 2.4.1 Bypass Blocks (Level A)

---

### 12. ANIMATION PREFERENCES - MEDIUM PRIORITY
**Status:** NEEDS IMPROVEMENT
**Impact:** Users with vestibular disorders may experience discomfort
**Current State:**
- Pulse animation always active
- Wave animation on voice input
- Mouth animation during speech
- No reduced motion support

**Required CSS:**

```css
/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Disable pulse animation */
  .avatar .pulse {
    animation: none;
    opacity: 0.3;
  }

  /* Simplify wave animation */
  .wave.active span {
    animation: none;
    height: 14px;
    opacity: 0.5;
  }

  /* Disable mouth animation */
  .mouth {
    transition: none;
  }
}
```

**WCAG Criteria:** 2.3.3 Animation from Interactions (Level AAA - but important for accessibility)

---

### 13. TOUCH TARGET SIZE - MOBILE CRITICAL
**Status:** NEEDS VERIFICATION
**Impact:** Mobile users may have difficulty tapping buttons
**Current State:**
- Buttons may be smaller than 44x44px minimum
- No explicit touch target sizing

**Required Verification and Fixes:**

```css
/* Ensure minimum 44x44px touch targets */
button,
input[type="button"],
input[type="submit"],
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: 0.625rem 0.875rem; /* 10px 14px */
}

.voice-btn {
  min-width: 48px;
  min-height: 44px;
}

/* Increase tap target for small icons */
.btn::before {
  content: '';
  position: absolute;
  inset: -8px;
  /* Extends hit area without changing visual size */
}

/* Ensure input field is easily tappable */
input[type="text"] {
  min-height: 44px;
  padding: 0.75rem; /* 12px */
}
```

**WCAG Criteria:** 2.5.5 Target Size (Level AAA - but critical for mobile)

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Critical Fixes (1-2 hours)
- [ ] Add semantic HTML structure (main, header, section)
- [ ] Implement all ARIA attributes (labels, roles, states)
- [ ] Add keyboard navigation support
- [ ] Implement focus indicators
- [ ] Add ARIA live regions for screen readers
- [ ] Add proper form labels

### Phase 2: Important Fixes (1 hour)
- [ ] Implement heading hierarchy (h1, h2)
- [ ] Add accessible error handling
- [ ] Verify and fix color contrast issues
- [ ] Add skip navigation link
- [ ] Implement touch target sizing

### Phase 3: Enhanced Accessibility (30-60 min)
- [ ] Add responsive text sizing with rem units
- [ ] Implement reduced motion support
- [ ] Add high contrast mode support
- [ ] Create comprehensive ARIA descriptions
- [ ] Add loading state indicators

### Phase 4: Testing & Verification (1 hour)
- [ ] Test with NVDA screen reader
- [ ] Test keyboard-only navigation
- [ ] Test at 200% zoom
- [ ] Run axe-core automated audit
- [ ] Test on mobile devices
- [ ] Verify WCAG 2.1 AA compliance

---

## TESTING REQUIREMENTS

### Manual Testing
1. **Screen Reader Testing (NVDA)**
   - Install NVDA: https://www.nvaccess.org/download/
   - Test navigation with Tab key
   - Verify all content is announced
   - Check live region announcements

2. **Keyboard Navigation**
   - Tab through all interactive elements
   - Verify focus indicators visible
   - Test Enter/Space on buttons
   - Test Arrow keys for message navigation

3. **Zoom Testing**
   - Test at 150% zoom
   - Test at 200% zoom
   - Verify no horizontal scrolling
   - Check text remains readable

4. **Mobile Testing**
   - Test on iPhone (Safari)
   - Test on Android (Chrome)
   - Verify touch target sizes
   - Check responsive behavior

### Automated Testing

**Install axe-core:**
```bash
npm install --save-dev axe-core @axe-core/cli
```

**Run accessibility audit:**
```bash
# Start development server
npm run dev

# In another terminal, run audit
npx axe http://localhost:3001 --tags=wcag21aa --save=accessibility-report.json
```

**Chrome Lighthouse:**
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Accessibility" category
4. Run audit
5. Target score: 80+/100

---

## EXPECTED OUTCOMES

### Before Implementation
- Accessibility Score: 45/100
- Screen reader support: 0%
- Keyboard navigation: 0%
- WCAG compliance: F (Failing)

### After Implementation
- Accessibility Score: 80+/100
- Screen reader support: 90%+
- Keyboard navigation: 100%
- WCAG 2.1 AA compliance: PASS

---

## MAINTENANCE RECOMMENDATIONS

1. **Automated Testing Integration**
   - Add axe-core to CI/CD pipeline
   - Run accessibility tests on every PR
   - Set minimum score threshold (80)

2. **Regular Manual Testing**
   - Monthly screen reader testing
   - Quarterly keyboard navigation audit
   - Annual WCAG compliance review

3. **Developer Training**
   - ARIA best practices documentation
   - Keyboard navigation patterns
   - Screen reader usage basics

4. **User Feedback**
   - Accessibility feedback form
   - User testing with assistive technology users
   - Continuous improvement process

---

## REFERENCES

- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/
- **WebAIM Resources:** https://webaim.org/
- **MDN Accessibility:** https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **axe-core Documentation:** https://github.com/dequelabs/axe-core

---

**Report prepared by:** Mobile-First UI/UX Optimization Specialist
**Date:** 2025-10-28
**Status:** READY FOR IMPLEMENTATION
