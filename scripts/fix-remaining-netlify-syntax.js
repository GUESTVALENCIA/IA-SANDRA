/**
 * Script para corregir funciones que aún tienen sintaxis de Netlify
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../api');

const functionsToFix = [
  'chat.js',
  'health.js',
  'voice-conversation.js',
  'heygen-avatar.js'
];

function fixFunction(fileName) {
  const filePath = path.join(API_DIR, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  No encontrado: ${fileName}`);
    return;
  }

  console.log(`🔧 Corrigiendo: ${fileName}`);

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Fix: exports.handler = async (event) => {}
  if (content.includes('exports.handler = async (event)')) {
    content = content.replace(
      /exports\.handler\s*=\s*async\s*\(event\)\s*=>\s*\{/g,
      'export default async function handler(req, res) {'
    );
    modified = true;
  }

  // Fix: exports.handler = withMiddleware(...)
  if (content.includes('exports.handler = withMiddleware')) {
    content = content.replace(
      /exports\.handler\s*=\s*withMiddleware\(handler,\s*\{[\s\S]*?\}\);/g,
      (match) => {
        // Extraer configuración del middleware
        const configMatch = match.match(/withMiddleware\(handler,\s*\{([\s\S]*?)\}\)/);
        if (configMatch) {
          return `export default withMiddleware(handler, ${configMatch[1]}});`;
        }
        return match;
      }
    );
    modified = true;
  }

  // Fix: exports.handler = withSentry(...)
  if (content.includes('exports.handler = withSentry')) {
    content = content.replace(
      /exports\.handler\s*=\s*withSentry\(handler\);/g,
      'export default withSentry(handler);'
    );
    modified = true;
  }

  // Fix: exports.handler = optimized.handler
  if (content.includes('exports.handler = optimized.handler')) {
    content = content.replace(
      /exports\.handler\s*=\s*optimized\.handler;/g,
      'export default optimized.handler;'
    );
    modified = true;
  }

  // Cambiar event.* a req.*
  if (content.includes('event.')) {
    content = content.replace(/event\.body/g, 'req.body');
    content = content.replace(/event\.httpMethod/g, 'req.method');
    content = content.replace(/event\.headers/g, 'req.headers');
    content = content.replace(/event\.queryStringParameters/g, 'req.query');
    content = content.replace(/event\.path/g, 'req.url');
    modified = true;
  }

  // Cambiar return { statusCode, body } a res.status().json()
  if (content.includes('statusCode:') && content.includes('body:')) {
    content = content.replace(
      /return\s*{\s*statusCode:\s*(\d+),\s*body:\s*JSON\.stringify\((.*?)\)\s*};/gs,
      (match, statusCode, body) => {
        return `res.status(${statusCode}).json(${body});`;
      }
    );
    modified = true;
    
    // Fix return sin JSON.stringify
    content = content.replace(
      /return\s*{\s*statusCode:\s*(\d+),\s*body:\s*(['"].*?['"])\s*};/gs,
      (match, statusCode, body) => {
        return `res.status(${statusCode}).send(${body});`;
      }
    );
  }

  // OPTIONS handler
  if (content.includes('OPTIONS')) {
    content = content.replace(
      /if\s*\(event\.httpMethod\s*===\s*['"]OPTIONS['"]\)/g,
      "if (req.method === 'OPTIONS')"
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Corregido: ${fileName}`);
  } else {
    console.log(`ℹ️  Sin cambios: ${fileName}`);
  }
}

function main() {
  console.log('🔧 Corrigiendo funciones con sintaxis de Netlify...\n');

  functionsToFix.forEach(fixFunction);

  console.log('\n✅ Corrección completada!');
}

if (require.main === module) {
  main();
}

module.exports = { fixFunction };

