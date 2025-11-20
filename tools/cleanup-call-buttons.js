// tools/cleanup-call-buttons.js
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'desktop-app', 'renderer', 'index.html');
let html = fs.readFileSync(file, 'utf8');

if (!html.includes('__CALL_GUARD__')) {
  const injection = `
<script>
  window.__CALL_GUARD__ = window.__CALL_GUARD__ || { starting:false, lastStartAt:0 };
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('callButton');
    if (btn) { btn.onclick = null; btn.onclick = () => window.startConversationalCall && window.startConversationalCall(); }
    document.querySelectorAll('#callButton2, .call-btn-legacy').forEach(el => {
      try { el.onclick = null; el.disabled = true; el.style.display = 'none'; } catch {}
    });
  });
</script>`;
  // Inserta antes de </body>
  html = html.replace(/<\/body>\s*<\/html>\s*$/i, `${injection}\n</body>\n</html>\n`);
  fs.writeFileSync(file, html, 'utf8');
  console.log('✔ Guard anti-dobles y neutralización de botones legacy inyectados en index.html');
} else {
  console.log('ℹ Guard ya presente. Sin cambios.');
}

