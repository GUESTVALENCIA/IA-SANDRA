/**
 * Script para corregir nombres de funciones duplicadas
 * Convierte funciones index.js a nombres únicos basados en su carpeta original
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, '../api');
const NETLIFY_FUNCTIONS_DIR = path.join(__dirname, '../netlify/functions');

/**
 * Mapeo de funciones index.js a nombres únicos
 */
const functionMap = {
  'chat/index.js': 'chat-endpoint.js',
  'chat-local/index.js': 'chat-local.js',
  'documents/index.js': 'documents.js',
  'guardian/index.js': 'guardian.js',
  'heygen-avatar/index.js': 'heygen-avatar-endpoint.js',
  'metrics/index.js': 'metrics.js',
  'tts/index.js': 'tts.js',
  'vision/index.js': 'vision.js',
  'voice/index.js': 'voice.js'
};

/**
 * Restaurar funciones desde netlify/functions
 */
function restoreFunctions() {
  console.log('🔧 Corrigiendo nombres de funciones duplicadas...\n');

  // Leer y convertir cada función del mapa
  for (const [netlifyPath, vercelName] of Object.entries(functionMap)) {
    const sourcePath = path.join(NETLIFY_FUNCTIONS_DIR, netlifyPath);
    const targetPath = path.join(API_DIR, vercelName);

    if (!fs.existsSync(sourcePath)) {
      console.log(`⚠️  No encontrado: ${sourcePath}`);
      continue;
    }

    console.log(`📄 Convirtiendo: ${netlifyPath} → ${vercelName}`);

    // Leer y convertir
    let content = fs.readFileSync(sourcePath, 'utf-8');

    // Convertir handler
    content = content.replace(
      /exports\.handler\s*=\s*(?:async\s+)?function\s*\(event,\s*context\)/g,
      'export default async function handler(req, res)'
    );

    content = content.replace(
      /exports\.handler\s*=\s*(?:async\s+)?\(event,\s*context\)\s*=>/g,
      'export default async (req, res) =>'
    );

    // Cambiar event.* a req.*
    content = content.replace(/event\.body/g, 'req.body');
    content = content.replace(/event\.httpMethod/g, 'req.method');
    content = content.replace(/event\.headers/g, 'req.headers');
    content = content.replace(/event\.queryStringParameters/g, 'req.query');
    content = content.replace(/event\.path/g, 'req.url');

    // Cambiar return { statusCode, body } a res.status().json()
    content = content.replace(
      /return\s*{\s*statusCode:\s*(\d+),\s*body:\s*JSON\.stringify\((.*?)\)\s*};/gs,
      (match, statusCode, body) => {
        return `res.status(${statusCode}).json(${body});`;
      }
    );

    // OPTIONS handler
    content = content.replace(
      /if\s*\(event\.httpMethod\s*===\s*['"]OPTIONS['"]\)/g,
      "if (req.method === 'OPTIONS')"
    );

    content = content.replace(
      /if\s*\(req\.method\s*===\s*['"]OPTIONS['"]\)\s*{[\s\S]*?return\s*{\s*statusCode:\s*(\d+)[^}]*};[\s\S]*?}/g,
      (match, statusCode) => {
        return match.replace(
          /return\s*{\s*statusCode:\s*\d+[^}]*};/,
          `res.status(${statusCode}).end();`
        );
      }
    );

    // Parse body si es string
    if (content.includes('req.body') && !content.includes('JSON.parse(req.body)')) {
      content = content.replace(
        /(export default async function handler\(req, res\) \{)/,
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
    }

    // Escribir archivo
    fs.writeFileSync(targetPath, content, 'utf-8');
    console.log(`✅ Creado: ${vercelName}`);
  }

  // Eliminar index.js duplicado
  const indexPath = path.join(API_DIR, 'index.js');
  if (fs.existsSync(indexPath)) {
    fs.unlinkSync(indexPath);
    console.log(`\n🗑️  Eliminado index.js duplicado`);
  }

  console.log('\n✅ Corrección completada!');
}

if (require.main === module) {
  restoreFunctions();
}

module.exports = { restoreFunctions };

