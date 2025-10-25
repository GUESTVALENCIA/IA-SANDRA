# 🚀 Sandra IA Mobile Galaxy - Deployment Guide

## Production Deployment to sandra.guestsvalencia.es

### 📋 Deployment Overview

**Domain**: `sandra.guestsvalencia.es`
**Platform**: Netlify
**Version**: 98.0.0
**Environment**: Production
**PWA**: Enabled
**Mobile Optimized**: iOS 14+ & Android 8+

---

## 🎯 Quick Deploy Commands

### 1. Production Deployment
```bash
# Build for production
npm run build:production

# Deploy to production
npm run deploy

# Or manual Netlify deploy
netlify deploy --prod --dir=. --functions=netlify/functions
```

### 2. Staging Deployment
```bash
# Build for staging
npm run build:staging

# Deploy to staging
npm run deploy:staging
```

### 3. Development Preview
```bash
# Build for development
npm run build:development

# Deploy preview
npm run deploy:preview
```

---

## 🔧 Environment Configuration

### Production Environment Variables

Required environment variables for production:

```bash
# Core Configuration
NODE_ENV=production
SANDRA_DOMAIN=sandra.guestsvalencia.es
SANDRA_URL=https://sandra.guestsvalencia.es

# PWA Configuration
PWA_ENABLED=true
PWA_VERSION=98.0.0
MOBILE_OPTIMIZED=true

# API Keys (Production)
OPENAI_API_KEY=your_production_openai_key
GROQ_API_KEY=your_production_groq_key
ANTHROPIC_API_KEY=your_production_anthropic_key
ELEVENLABS_API_KEY=your_production_elevenlabs_key

# Security
SECURE_MODE=true
HTTPS_ONLY=true
CSP_ENABLED=true
```

### Netlify Deployment Settings

1. **Build Command**: `npm run build:production`
2. **Publish Directory**: `.` (root)
3. **Functions Directory**: `netlify/functions`
4. **Environment Variables**: Set in Netlify dashboard

---

## 🏗️ Build Process

### Automated Build Pipeline

1. **Quality Checks**
   - Code linting
   - Security audit
   - Format validation

2. **Build & Optimization**
   - Asset optimization
   - Manifest generation
   - Service worker build

3. **Testing Suite**
   - Unit tests
   - Integration tests
   - Performance tests
   - Accessibility tests

4. **Deployment**
   - Staging deployment
   - Production deployment
   - Health checks

### Build Scripts

```json
{
  "build": "npm run build:production",
  "build:production": "npm run optimize:assets && npm run generate:manifest && npm run build:sw",
  "optimize:assets": "npm run optimize:html && npm run optimize:js && npm run optimize:css",
  "generate:manifest": "node scripts/generate-manifest.js",
  "build:sw": "node scripts/build-service-worker.js"
}
```

---

## 📱 PWA Configuration

### Manifest Features

- **Standalone App**: Full-screen mobile experience
- **Offline Support**: Service worker caching
- **Install Prompts**: Add to home screen
- **App Shortcuts**: Quick actions
- **File Handling**: Open various file types
- **Share Target**: Receive shared content

### Service Worker Features

- **Cache Strategies**:
  - Cache First (static assets)
  - Network First (API calls)
  - Stale While Revalidate (dynamic content)
- **Offline Fallbacks**: Custom offline pages
- **Background Sync**: Queue failed requests
- **Push Notifications**: Future enhancement ready

---

## 🔒 Security Configuration

### HTTPS & SSL

- **SSL Certificate**: Automatic via Netlify
- **HTTPS Redirect**: Enforced
- **HSTS Headers**: Enabled
- **Certificate Pinning**: Production ready

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
connect-src 'self' https://api.openai.com https://api.groq.com;
img-src 'self' data: blob: https:;
font-src 'self' https://fonts.gstatic.com data:;
```

### Security Headers

- **X-Frame-Options**: DENY
- **X-Content-Type-Options**: nosniff
- **X-XSS-Protection**: 1; mode=block
- **Referrer-Policy**: strict-origin-when-cross-origin

---

## 📊 Performance Optimization

### Target Metrics

- **Lighthouse Score**: 90+ overall
- **Performance**: 90+
- **Accessibility**: 95+
- **SEO**: 100
- **PWA**: 100

### Optimization Features

- **Asset Compression**: Gzip/Brotli
- **Image Optimization**: WebP conversion
- **Code Splitting**: Lazy loading
- **Caching**: Multi-layer strategy
- **CDN**: Global content delivery

---

## 🧪 Testing & Validation

### Automated Testing

```bash
# Run all tests
npm test

# Individual test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance
npm run test:accessibility
npm run test:security
```

### Manual Testing Checklist

#### 📱 Mobile Testing
- [ ] iPhone iOS 14+ compatibility
- [ ] Android 8+ compatibility
- [ ] Responsive design on all screen sizes
- [ ] Touch interactions work properly
- [ ] PWA installation flow

#### 🎯 Feature Testing
- [ ] Chat functionality
- [ ] Voice input/output
- [ ] File upload/processing
- [ ] Avatar video sync
- [ ] Offline mode operation
- [ ] Settings and preferences

#### 🔍 Technical Testing
- [ ] Service worker registration
- [ ] Manifest validation
- [ ] API endpoint connectivity
- [ ] Error handling
- [ ] Performance metrics

---

## 🚨 Health Monitoring

### Health Check Endpoints

- **Health**: `https://sandra.guestsvalencia.es/api/health`
- **Readiness**: `https://sandra.guestsvalencia.es/api/ready`

### Monitoring Commands

```bash
# Check deployment health
curl -f https://sandra.guestsvalencia.es/api/health

# Validate PWA manifest
curl -f https://sandra.guestsvalencia.es/manifest.json

# Test service worker
curl -f https://sandra.guestsvalencia.es/sw.js

# Performance test
npm run test:performance
```

---

## 🛠️ Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
npm run clean
npm ci
npm run build
```

#### Deployment Issues
```bash
# Check Netlify status
netlify status

# Manual deploy with debug
netlify deploy --prod --debug
```

#### PWA Issues
```bash
# Regenerate manifest
npm run generate:manifest

# Rebuild service worker
npm run build:sw
```

### Debug Commands

```bash
# Local development server
npm run serve

# HTTPS local server (for PWA testing)
npm run serve:https

# Performance analysis
npm run analyze

# Bundle size analysis
npm run analyze:bundle
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] API keys updated for production
- [ ] Security headers validated
- [ ] Performance targets met
- [ ] All tests passing

### During Deployment
- [ ] Build completed successfully
- [ ] No console errors
- [ ] Health checks passing
- [ ] PWA manifest valid
- [ ] Service worker registered

### Post-Deployment
- [ ] Domain accessible
- [ ] HTTPS working
- [ ] PWA installable
- [ ] All features functional
- [ ] Performance metrics acceptable
- [ ] Monitoring active

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

The deployment uses automated CI/CD with the following stages:

1. **Quality Checks** (5 min)
2. **Build & Optimization** (10 min)
3. **Testing Suite** (15 min)
4. **Staging Deployment** (5 min)
5. **Production Deployment** (10 min)
6. **Post-Deploy Validation** (5 min)

### Manual Workflow Triggers

```bash
# Trigger manual deployment
gh workflow run deploy.yml -f environment=production

# Check workflow status
gh run list --workflow=deploy.yml
```

---

## 📞 Support & Maintenance

### Production Support
- **Monitoring**: 24/7 automated monitoring
- **Alerts**: Critical issue notifications
- **Backup**: Automated daily backups
- **Updates**: Weekly security updates

### Emergency Procedures
1. **Rollback**: Revert to previous deployment
2. **Hotfix**: Critical bug fix deployment
3. **Maintenance**: Scheduled maintenance mode
4. **Scaling**: Auto-scaling for traffic spikes

---

## 🎯 Future Enhancements

### Planned Features
- [ ] App Store deployment (iOS/Android)
- [ ] Push notifications
- [ ] Background sync
- [ ] Enhanced offline capabilities
- [ ] Multi-language support
- [ ] Advanced analytics

### Infrastructure Improvements
- [ ] Redis caching layer
- [ ] Database clustering
- [ ] CDN optimization
- [ ] Load balancer setup
- [ ] Container orchestration

---

## 📖 Documentation Links

- [Netlify Documentation](https://docs.netlify.com/)
- [PWA Guidelines](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

---

**Last Updated**: October 25, 2025
**Version**: 98.0.0
**Status**: ✅ Production Ready