# 🔄 Automated Key Rotation System - Complete Setup Guide

## 🎯 What This Does

Your API keys will be **automatically rotated every month** with:
- ✅ Zero manual intervention required
- ✅ Real-time secret detection in commits
- ✅ Weekly verification of all keys
- ✅ Slack notifications for all events
- ✅ Complete audit trail
- ✅ Emergency procedures ready

## 📋 One-Time Setup Instructions

### Step 1: GitHub Repository Settings

1. **Navigate to your repository settings:**
   ```
   https://github.com/[YOUR-USERNAME]/IA-SANDRA/settings/secrets/actions
   ```

2. **Add these repository secrets:**

   Click "New repository secret" for each:

   | Secret Name | Description | How to Get |
   |------------|-------------|------------|
   | `OPENAI_API_KEY` | OpenAI API key | https://platform.openai.com/api-keys |
   | `ANTHROPIC_API_KEY` | Anthropic API key | https://console.anthropic.com/settings/keys |
   | `GROQ_API_KEY` | GROQ API key | https://console.groq.com/keys |
   | `CARTESIA_API_KEY` | Cartesia API key | https://cartesia.ai/dashboard |
   | `ELEVENLABS_API_KEY` | ElevenLabs API key | https://elevenlabs.io/api-keys |
   | `NETLIFY_AUTH_TOKEN` | Netlify personal access token | https://app.netlify.com/user/applications |
   | `NETLIFY_SITE_ID` | Your Netlify site ID | Found in Netlify site settings |
   | `ENCRYPTION_KEY` | For encrypting stored keys | Generate below |
   | `SLACK_WEBHOOK` | (Optional) For notifications | https://api.slack.com/messaging/webhooks |

3. **Generate encryption key:**
   ```bash
   # Run this command and save the output as ENCRYPTION_KEY secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Step 2: Enable GitHub Actions

1. Go to: `Settings → Actions → General`
2. Select: "Allow all actions and reusable workflows"
3. Save

### Step 3: Local Setup (For Testing)

```bash
# Install dependencies
npm install

# Create .env.secure file for local testing
cp .env.example .env.secure

# Edit .env.secure with your current API keys
# Add the ENCRYPTION_KEY you generated
```

### Step 4: Test the System

```bash
# Test secret scanning
npm run secrets:scan

# Test API key validation
npm run test:api-keys

# Test rotation locally (dry run)
npm run rotation:verify

# View expiration status
npm run security:monitor
```

### Step 5: Deploy to Production

```bash
# Commit all security files
git add -A
git commit -m "🔒 SECURITY: Enable automated key rotation system"
git push origin main
```

## 🤖 What Happens Automatically

### 📅 Monthly (1st of every month at midnight UTC)
1. All API keys are rotated
2. New keys are encrypted and stored
3. Netlify environment is updated
4. Site is redeployed with new keys
5. All services are verified
6. Slack notification is sent
7. Audit log is created

### 📆 Daily (9 AM UTC)
1. Check days until key expiration
2. Send warning if < 14 days
3. Send critical alert if < 7 days
4. Auto-trigger rotation if < 3 days

### 🔍 On Every Commit
1. Scan for hardcoded secrets
2. Block merge if secrets found
3. Alert security team
4. Comment on pull request

### ✅ Weekly Verification
1. Test each API key
2. Check service availability
3. Log results
4. Alert if issues found

## 📊 Monitoring

### Security Dashboard
Access your real-time security dashboard:
```
https://sandra.guestsvalencia.es/admin/security-dashboard.html
```

### View Logs Locally
```bash
# Check rotation history
cat security-logs/rotation-audit.json

# Check verification results
cat security-logs/verification-log.json

# Check expiration status
cat security-logs/expiration-checks.json
```

### Manual Commands
```bash
# Force immediate rotation
npm run rotation:start

# Emergency revoke all keys
npm run rotation:emergency-revoke

# Verify all keys now
npm run rotation:verify

# Scan for secrets
npm run secrets:scan

# Check expiration
npm run security:monitor
```

## 🚨 Emergency Procedures

### If Keys Are Compromised

1. **Immediate revocation:**
   ```bash
   npm run rotation:emergency-revoke
   ```

2. **Generate new keys:**
   ```bash
   npm run rotation:start
   ```

3. **Verify and deploy:**
   ```bash
   npm run rotation:verify
   npm run deploy:prod
   ```

### If Rotation Fails

1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Test keys manually:
   ```bash
   npm run test:api-keys
   ```
4. Check Slack for error details

### Manual Rotation for Specific Provider

```bash
# Rotate only OpenAI
npm run rotation:provider -- openai

# Rotate only Anthropic
npm run rotation:provider -- anthropic
```

## 🔔 Slack Notifications

If you configured `SLACK_WEBHOOK`, you'll receive:

- ✅ **Success notifications:** When rotation completes
- ⚠️ **Warning alerts:** Keys expiring soon
- 🚨 **Critical alerts:** Immediate action required
- 📊 **Status updates:** Weekly verification results

### Setting Up Slack Webhook

1. Go to https://api.slack.com/apps
2. Create new app → From scratch
3. Add "Incoming Webhooks" feature
4. Activate and add to workspace
5. Copy webhook URL
6. Add as `SLACK_WEBHOOK` secret in GitHub

## 📝 Compliance & Audit

### Audit Trail
Every action is logged with:
- Timestamp
- Action performed
- User/system that triggered it
- Result status
- Error details (if any)

### Reports Available
- Monthly rotation reports
- Daily expiration checks
- Security scan results
- Service availability logs

### Compliance Features
- 90-day automatic rotation
- Encrypted key storage
- Zero secret exposure
- Complete audit trail
- Emergency procedures

## 🎯 Quick Status Check

Run this to see everything at once:
```bash
echo "=== Security Status ==="
echo "Checking keys..."
npm run test:api-keys
echo ""
echo "Checking expiration..."
npm run security:monitor
echo ""
echo "Scanning for secrets..."
npm run secrets:scan
echo ""
echo "Dashboard: https://sandra.guestsvalencia.es/admin/security-dashboard.html"
```

## ✅ Setup Complete!

Your API keys are now:
- 🔄 **Automatically rotated** every month
- 🔍 **Continuously monitored** for expiration
- 🚨 **Protected** from accidental exposure
- 📊 **Fully audited** with complete logs
- 🎯 **Zero maintenance** required

**You can now rest easy knowing your keys are secure and automated! 😴**

---

## 📞 Support

If you need help:
1. Check GitHub Actions logs
2. Review security dashboard
3. Check Slack notifications
4. Run manual verification commands
5. Review this documentation

## 🔐 Security Best Practices

1. **Never** commit API keys to code
2. **Always** use environment variables
3. **Rotate** keys regularly (automated now!)
4. **Monitor** for unauthorized usage
5. **Audit** access logs regularly
6. **Test** emergency procedures quarterly

---

Last Updated: {{ current_date }}
System Status: FULLY AUTOMATED ✅