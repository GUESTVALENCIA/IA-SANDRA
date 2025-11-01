/**
 * Script final para corregir TODAS las funciones restantes
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../api');

const functionsToFix = [
  'voice.js',
  'vision.js',
  'tts.js',
  'metrics.js',
  'guardian.js',
  'documents.js',
  'chat-local.js',
  'chat-endpoint.js'
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

  // Fix: exports.handler = withMiddleware(handler, {...})
  if (content.includes('exports.handler = withMiddleware')) {
    // Extraer la configuración del middleware
    const middlewareMatch = content.match(/exports\.handler\s*=\s*withMiddleware\(handler,\s*\{[\s\S]*?\}\);/);
    if (middlewareMatch) {
      const fullMatch = middlewareMatch[0];
      const configMatch = fullMatch.match(/withMiddleware\(handler,\s*(\{[\s\S]*?\})\);/);
      if (configMatch) {
        content = content.replace(
          /exports\.handler\s*=\s*withMiddleware\(handler,\s*\{[\s\S]*?\}\);/,
          `export default withMiddleware(handler, ${configMatch[1]});`
        );
        modified = true;
      }
    }
  }

  // Cambiar event.* a req.* (si aún existe)
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
    // Patrón completo con headers
    content = content.replace(
      /return\s*{\s*statusCode:\s*(\d+),[\s\S]*?body:\s*JSON\.stringify\((.*?)\)\s*};/gs,
      (match, statusCode, body) => {
        // Extraer headers si existen
        const headersMatch = match.match(/headers:\s*\{([^}]+)\}/);
        let headersCode = '';
        if (headersMatch) {
          headersMatch[1].split(',').forEach(header => {
            const trimmed = header.trim();
            if (trimmed) {
              const [key, value] = trimmed.split(':').map(s => s.trim());
              if (key && value) {
                headersCode += `  res.setHeader('${key}', ${value});\n`;
              }
            }
          });
        }
        return `${headersCode}res.status(${statusCode}).json(${body});`;
      }
    );
    
    // Patrón simple sin headers
    content = content.replace(
      /return\s*{\s*statusCode:\s*(\d+),\s*body:\s*JSON\.stringify\((.*?)\)\s*};/gs,
      (match, statusCode, body) => {
        return `res.status(${statusCode}).json(${body});`;
      }
    );
    
    modified = true;
  }

  // Fix OPTIONS handler
  if (content.includes('OPTIONS')) {
    content = content.replace(
      /if\s*\(event\.httpMethod\s*===\s*['"]OPTIONS['"]\)/g,
      "if (req.method === 'OPTIONS')"
    );
    modified = true;
  }

  // Agregar parse body al inicio si falta
  if (content.includes('req.body') && !content.includes('JSON.parse(req.body)') && !content.includes('typeof req.body === \'string\'')) {
    const handlerRegex = /(export default async function handler\(req, res\) \{)/;
    if (handlerRegex.test(content)) {
      content = content.replace(
        handlerRegex,
        `$1
  // Parse body if string
  if (typeof req.body === 'string' && req.body) {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // Body is not JSON, keep as string
    }
  }`
      );
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Corregido: ${fileName}`);
  } else {
    console.log(`ℹ️  Sin cambios: ${fileName}`);
  }
}

function main() {
  console.log('🔧 Corrigiendo TODAS las funciones restantes...\n');

  functionsToFix.forEach(fixFunction);

  console.log('\n✅ Todas las funciones corregidas!');
  
  // Verificar si quedan exports.handler
  console.log('\n🔍 Verificando funciones restantes con exports.handler...');
  const remaining = [];
  functionsToFix.forEach(fileName => {
    const filePath = path.join(API_DIR, fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes('exports.handler')) {
        remaining.push(fileName);
      }
    }
  });
  
  if (remaining.length > 0) {
    console.log(`⚠️  Funciones que aún necesitan corrección manual:`);
    remaining.forEach(f => console.log(`   - ${f}`));
  } else {
    console.log('✅ Todas las funciones convertidas correctamente!');
  }
}

if (require.main === module) {
  main();
}

module.exports = { fixFunction };

