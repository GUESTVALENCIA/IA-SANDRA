#!/usr/bin/env node
// ============================================
// HEYGEN INTEGRATION PATCH SCRIPT
// Modifies sandra-mobile.js to add HeyGen video avatar support
// CEO: Clayton Thomas - URGENT REQUIREMENT #5
// ============================================

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/js/sandra-mobile.js');
const backupPath = filePath + '.pre-heygen.backup';

console.log('[HeyGen Patch] Starting integration...');

// Create backup
fs.copyFileSync(filePath, backupPath);
console.log('[HeyGen Patch] Backup created:', backupPath);

// Read file
let content = fs.readFileSync(filePath, 'utf8');

// PATCH 1: Add video avatar elements to HTML
const avatarHtmlSearch = `        <div class="avatar">
          <img id="avatar-img" src="/img/avatar-sandra.png" alt="Sandra avatar"/>
          <div class="pulse"></div>
          <div class="mouth" id="mouth"></div>
        </div>`;

const avatarHtmlReplace = `        <!-- AVATAR CONTAINER - Circle mode -->
        <div class="avatar" id="avatarCircle">
          <img id="avatar-img" src="/img/avatar-sandra.png" alt="Sandra avatar"/>
          <div class="pulse"></div>
          <div class="mouth" id="mouth"></div>
        </div>

        <!-- HEYGEN VIDEO AVATAR CONTAINER - Video mode -->
        <div id="videoAvatarContainer" style="display: none;">
          <video id="videoAvatar" autoplay playsinline muted></video>
        </div>

        <!-- VIDEO TOGGLE BUTTON - Switch between modes -->
        <button id="videoToggle" title="Activar avatar video HeyGen" onclick="toggleVideoMode()">📹</button>`;

if (content.includes(avatarHtmlSearch)) {
  content = content.replace(avatarHtmlSearch, avatarHtmlReplace);
  console.log('[HeyGen Patch] ✅ Avatar HTML patched');
} else {
  console.log('[HeyGen Patch] ⚠️  Avatar HTML already patched or structure changed');
}

// PATCH 2: Modify ttsSpeak to use HeyGen when video mode active
const ttsSpeakSearch = `  async function ttsSpeak(text){
    const langConfig = getCurrentLanguageConfig();

    // ENTERPRISE: Timeout controller (10s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const r = await fetch('/api/tts',`;

const ttsSpeakReplace = `  async function ttsSpeak(text){
    // HEYGEN INTEGRATION: Use HeyGen video avatar when active
    if (typeof window.isVideoMode === 'function' && window.isVideoMode()) {
      console.log('[Sandra] Using HeyGen video avatar for speech');

      // Use HeyGen speak with lipsync
      if (typeof window.heygenSpeak === 'function') {
        try {
          await window.heygenSpeak(text);
          return; // Skip regular TTS
        } catch (error) {
          console.error('[Sandra] HeyGen speak failed, falling back to TTS:', error);
          // Continue with regular TTS below
        }
      }
    }

    // REGULAR TTS (ElevenLabs/Cartesia)
    const langConfig = getCurrentLanguageConfig();

    // ENTERPRISE: Timeout controller (10s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const r = await fetch('/api/tts',`;

if (content.includes(ttsSpeakSearch)) {
  content = content.replace(ttsSpeakSearch, ttsSpeakReplace);
  console.log('[HeyGen Patch] ✅ ttsSpeak function patched');
} else {
  console.log('[HeyGen Patch] ⚠️  ttsSpeak already patched or structure changed');
}

// Write modified content
fs.writeFileSync(filePath, content, 'utf8');
console.log('[HeyGen Patch] ✅ File updated successfully');
console.log('[HeyGen Patch] Integration complete!');
console.log('');
console.log('Next steps:');
console.log('1. Update Netlify environment variables with HeyGen credentials');
console.log('2. Deploy to Netlify');
console.log('3. Test video toggle button in the mobile PWA');
