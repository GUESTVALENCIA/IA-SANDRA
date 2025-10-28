# 🔒 SANDRA IA 7.0 - SECURITY POLICY

**Classification:** Galaxy Level Pro Enterprise
**Date:** 2025-10-28
**Status:** PRODUCTION GRADE

---

## 📋 EXECUTIVE SUMMARY

This document defines security policies for Sandra IA 7.0 development, deployment, and operations. All team members must comply with these policies to maintain production-grade security standards.

**CRITICAL RULE:** 🚫 **NEVER commit API keys, secrets, or credentials to git repository**

---

## 🛡️ ENVIRONMENT VARIABLES MANAGEMENT

### ✅ SECURE APPROACH (REQUIRED)

1. **Local Development:**
   ```bash
   # Create local .env file (never commit)
   cp .env.example .env
   # Edit .env with YOUR OWN test API keys
   # .env is in .gitignore - safe to edit locally
   ```

2. **Team Collaboration:**
   - Use `.env.example` with placeholder values ONLY
   - Commit `.env.example` to git
   - Share actual credentials via SECURE channel:
     - 1Password/LastPass (team vault)
     - Netlify Environment Variables UI
     - Private Slack channel
     - NOT via email, Slack messages, or git

3. **Production Deployment:**
   - Set environment variables in Netlify dashboard
   - **NEVER** use local `.env` files in production
   - Netlify → Site Settings → Build & Deploy → Environment
   - Use different keys for staging/production

### ❌ DANGEROUS APPROACHES (FORBIDDEN)

```bash
# ❌ DO NOT DO THIS
git add .env                    # NEVER - exposes secrets
.env.production="real-key"      # NEVER - tracked in git
hardcode("sk-proj-...")         # NEVER - visible in code
```

---

## 🔑 API KEY ROTATION SCHEDULE

| Service | Rotation Frequency | Owner |
|---------|-------------------|-------|
| OpenAI | Quarterly | DevOps Lead |
| Anthropic | Quarterly | DevOps Lead |
| GROQ | Quarterly | DevOps Lead |
| Cartesia | Quarterly | DevOps Lead |
| Meta/WhatsApp | Monthly | Product Lead |
| Netlify Deploy Tokens | When team changes | CTO |
| Database Credentials | Every 6 months | DBA |

**EMERGENCY ROTATION:** Immediately if:
- Key is committed to git
- Key is exposed in documentation
- Key is accidentally shared in messaging
- Unauthorized API usage detected

---

## 📝 COMMITTING GUIDELINES

### Pre-Commit Checklist

Before every `git commit`, verify:

```bash
# ❌ Check 1: No .env files staged
git status | grep "\.env"
# Expected: (no output)

# ❌ Check 2: No API keys in diff
git diff --cached | grep -i "api_key\|secret\|token"
# Expected: (no output)

# ❌ Check 3: No documentation with real keys
git diff --cached --name-only | xargs grep -l "sk-proj-\|sk-ant-\|gsk_"
# Expected: (no output)
```

### Commit Message Standards

**GOOD:**
```
🔒 SECURITY: Update .gitignore - prevent secret exposure

Prevent accidental commits of environment files
- Add .env* patterns
- Add Claude Code settings
- Add sensitive file patterns
```

**BAD:**
```
Updated files
Added stuff to gitignore
WIP: setup keys
```

---

## 🚨 INCIDENT RESPONSE

### If You Accidentally Commit a Secret

**IMMEDIATE ACTIONS (within 15 minutes):**

1. **STOP - Do not push**
   ```bash
   # Do NOT push to GitHub yet
   git push origin --force  # ❌ WRONG - spreads exposure
   ```

2. **Rotate the exposed key**
   - Go to service dashboard (OpenAI, Anthropic, etc.)
   - Delete/revoke the exposed key
   - Generate a new key

3. **Remove from local git**
   ```bash
   git reset HEAD~1              # Undo the commit
   git checkout .env             # Discard changes
   rm .env                        # Remove file
   ```

4. **Re-commit properly**
   ```bash
   git add .                      # Stage cleaned changes
   git commit -m "WIP: cleanup"   # New commit without secrets
   ```

5. **Notify team immediately**
   - CEO/CTO (private message)
   - GitHub: Create security advisory
   - Timeline: 15 min notification window

### If You Discover an Exposed Secret in History

**Remediation Process:**

1. **Rotate ALL affected keys immediately**
2. **Notify security team**
3. **Execute BFG Repo-Cleaner to remove from history**
   ```bash
   # DevOps only - requires coordination
   bfg --delete-files ".env*" --no-blob-protection
   git gc --prune=now --aggressive
   git push origin --force --all
   ```
4. **Coordinate team re-clone** (all devs pull fresh history)

---

## 🔐 CODING STANDARDS

### ✅ SECURE PATTERNS

```javascript
// ✅ Correct: Read from environment only
const apiKey = process.env.OPENAI_API_KEY;

// ✅ Correct: .env.example with placeholders
// .env.example
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE

// ✅ Correct: Error messages without keys
console.error('OpenAI error:', error.message);
// NOT: console.error('OpenAI error:', error, 'Key was: ' + apiKey);
```

### ❌ DANGEROUS PATTERNS

```javascript
// ❌ NEVER: Hardcoded keys
const apiKey = "sk-proj-M0i_Na3z3I2jb0uvv_cixD1...";

// ❌ NEVER: Keys in comments
// ***REMOVED***

// ❌ NEVER: Keys in error messages
if (error) throw new Error(`Key ${apiKey} failed: ${error}`);

// ❌ NEVER: Keys in console logs
console.log('Using key:', apiKey);
```

---

## 🔍 CODE REVIEW REQUIREMENTS

**All PRs must be reviewed for:**

1. **No hardcoded secrets**
   ```bash
   grep -r "sk-\|gsk_\|nfp_" public/ src/
   # Should return: (no matches)
   ```

2. **No .env files staged**
   ```bash
   git diff --cached --name-only | grep "\.env"
   # Should return: (no matches)
   ```

3. **No environment files in commits**
   ```bash
   git log --all --source --full-history -S "OPENAI_API_KEY"
   # Should return: (no matches except .env.example)
   ```

4. **Documentation uses placeholders**
   ```bash
   grep -l "sk-proj-M0i\|sk-ant-api03-" *.md
   # Should return: (no matches)
   ```

---

## 🛠️ TOOLS & AUTOMATION

### Pre-Commit Hook (Automatic)

**Location:** `.git/hooks/pre-commit`
**Function:** Blocks commits with potential secrets
**Status:** ✅ Installed and active

```bash
# Automatically runs before every commit
# Prevents staging of:
# - .env files
# - API keys
# - Credentials
```

### GitHub Secret Scanning (Configured)

**Status:** ✅ Enabled on repository
**Function:** Detects exposed secrets in commits
**Action:** Automatic alerts to security team

---

## 📚 TEAM TRAINING

### Required Reading
- [ ] This SECURITY.md document
- [ ] .env.example structure
- [ ] Code review guidelines

### Required Actions
- [ ] Install pre-commit hook: `git init --template=.git/hooks`
- [ ] Set up 1Password/LastPass vault access
- [ ] Read OWASP A02:2021 (Cryptographic Failures)

---

## ✅ SECURITY CHECKLIST

**Before each release:**

- [ ] All API keys rotated in last quarter
- [ ] No .env files in git history
- [ ] GitHub secret scanning enabled
- [ ] Documentation has only placeholders
- [ ] Pre-commit hooks installed on all machines
- [ ] Environment variables set in Netlify
- [ ] Team trained on security policies
- [ ] Code review checked for secrets

---

## 📞 SECURITY CONTACTS

**Security Issues:** security@guestsvalencia.es
**CEO/CTO:** clayton@guestsvalencia.es
**DevOps Lead:** devops@guestsvalencia.es
**Emergency:** +34-XXX-XXX-XXXX

---

## 📋 AUDIT LOG

| Date | Event | Action Taken |
|------|-------|-------------|
| 2025-10-28 | Security audit completed | Installed BFG, updated .gitignore, created pre-commit hook |
| 2025-10-28 | Sanitized documentation | Replaced 28 exposed keys with placeholders |
| 2025-10-28 | Rotated API keys | All services rotated |

---

**Last Updated:** 2025-10-28
**Next Review:** 2025-11-28
**Status:** ACTIVE - MANDATORY COMPLIANCE

---

*This policy is binding for all team members. Violations may result in project access revocation.*
