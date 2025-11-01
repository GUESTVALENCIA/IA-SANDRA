/**
 * Script para convertir Netlify Functions a Vercel Serverless Functions
 * 
 * Convierte:
 * - netlify/functions/*.js -> api/*.js
 * - exports.handler -> export default handler
 * - event.body -> req.body
 * - event.httpMethod -> req.method
 * - return { statusCode, body } -> res.status().json()
 */

const fs = require('fs');
const path = require('path');

const NETLIFY_FUNCTIONS_DIR = path.join(__dirname, '../netlify/functions');
const VERCEL_API_DIR = path.join(__dirname, '../api');

/**
 * Convertir handler de Netlify a Vercel
 */
function convertHandler(content) {
  let converted = content;

  // 1. Cambiar exports.handler a export default
  converted = converted.replace(
    /exports\.handler\s*=\s*(?:async\s+)?function\s*\(event,\s*context\)/g,
    'export default async function handler(req, res)'
  );

  converted = converted.replace(
    /exports\.handler\s*=\s*(?:async\s+)?\(event,\s*context\)\s*=>/g,
    'export default async (req, res) =>'
  );

  // 2. Cambiar event.body a req.body
  converted = converted.replace(/event\.body/g, 'req.body');
  
  // 3. Cambiar event.httpMethod a req.method
  converted = converted.replace(/event\.httpMethod/g, 'req.method');

  // 4. Cambiar event.headers a req.headers
  converted = converted.replace(/event\.headers/g, 'req.headers');

  // 5. Cambiar event.queryStringParameters a req.query
  converted = converted.replace(/event\.queryStringParameters/g, 'req.query');

  // 6. Cambiar event.path a req.url
  converted = converted.replace(/event\.path/g, 'req.url');

  // 7. Cambiar return { statusCode, body } a res.status().json()
  // Patrón: return { statusCode: 200, body: JSON.stringify(...) }
  converted = converted.replace(
    /return\s*{\s*statusCode:\s*(\d+),\s*body:\s*JSON\.stringify\((.*?)\)\s*};/gs,
    (match, statusCode, body) => {
      return `res.status(${statusCode}).json(${body});`;
    }
  );

  // 8. Cambiar return { statusCode, headers, body }
  converted = converted.replace(
    /return\s*{\s*statusCode:\s*(\d+),[\s\S]*?body:\s*JSON\.stringify\((.*?)\)\s*};/gs,
    (match, statusCode, body) => {
      // Extraer headers si existen
      const headersMatch = match.match(/headers:\s*{([^}]+)}/);
      let headersCode = '';
      if (headersMatch) {
        headersMatch[1].split(',').forEach(header => {
          const [key, value] = header.split(':').map(s => s.trim());
          if (key && value) {
            headersCode += `  res.setHeader('${key}', ${value});\n`;
          }
        });
      }
      return `${headersCode}res.status(${statusCode}).json(${body});`;
    }
  );

  // 9. Agregar CORS headers si no existen
  if (converted.includes('Access-Control-Allow-Origin') && !converted.includes('res.setHeader')) {
    // Ya tiene CORS, pero necesitamos convertirlo
    converted = converted.replace(
      /'Access-Control-Allow-Origin':\s*['"](.*?)['"]/g,
      "res.setHeader('Access-Control-Allow-Origin', '$1');"
    );
  }

  // 10. Manejar OPTIONS preflight
  if (converted.includes('OPTIONS')) {
    converted = converted.replace(
      /if\s*\(event\.httpMethod\s*===\s*['"]OPTIONS['"]\)/g,
      "if (req.method === 'OPTIONS')"
    );
    converted = converted.replace(
      /if\s*\(req\.method\s*===\s*['"]OPTIONS['"]\)\s*{[\s\S]*?return\s*{[^}]+};[\s\S]*?}/g,
      (match) => {
        return match.replace(
          /return\s*{\s*statusCode:\s*(\d+)[^}]*};/,
          'res.status($1).end();'
        );
      }
    );
  }

  // 11. Parsear body si es necesario
  if (converted.includes('req.body') && !converted.includes('JSON.parse')) {
    // Agregar parsing al inicio del handler si body existe
    const bodyParseRegex = /(export default async function handler\(req, res\) \{)/;
    if (bodyParseRegex.test(converted)) {
      converted = converted.replace(
        bodyParseRegex,
        `$1
  // Parse body if string
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // Body is not JSON, keep as string
    }
  }`
      );
    }
  }

  return converted;
}

/**
 * Procesar archivo de función
 */
function processFunction(filePath, outputDir) {
  console.log(`📄 Procesando: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const converted = convertHandler(content);

  // Determinar nombre del archivo de salida
  const relativePath = path.relative(NETLIFY_FUNCTIONS_DIR, filePath);
  let outputPath;

  if (relativePath.includes('/index.js')) {
    // Si es un index.js en una subcarpeta, convertir a archivo único
    const folderName = path.dirname(relativePath).split(path.sep)[0];
    outputPath = path.join(outputDir, `${folderName}.js`);
  } else {
    // Si es un archivo directo, mantener nombre
    const fileName = path.basename(relativePath);
    outputPath = path.join(outputDir, fileName);
  }

  // Crear directorio si no existe
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // Escribir archivo convertido
  fs.writeFileSync(outputPath, converted, 'utf-8');
  console.log(`✅ Convertido: ${outputPath}`);

  return outputPath;
}

/**
 * Recursivamente procesar todas las funciones
 */
function processAllFunctions(dir, outputDir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Procesar subdirectorios recursivamente
      if (entry.name !== 'shared' && entry.name !== 'webrtc') {
        processAllFunctions(fullPath, outputDir);
      }
    } else if (entry.name.endsWith('.js') && entry.name !== 'README.md') {
      // Procesar archivos .js
      processFunction(fullPath, outputDir);
    }
  }
}

/**
 * Main
 */
function main() {
  console.log('🚀 CONVERSIÓN NETLIFY → VERCEL\n');

  // Crear directorio api/ si no existe
  if (!fs.existsSync(VERCEL_API_DIR)) {
    fs.mkdirSync(VERCEL_API_DIR, { recursive: true });
    console.log(`📁 Creado directorio: ${VERCEL_API_DIR}`);
  }

  // Procesar todas las funciones
  processAllFunctions(NETLIFY_FUNCTIONS_DIR, VERCEL_API_DIR);

  console.log('\n✅ CONVERSIÓN COMPLETADA');
  console.log(`\n📝 Archivos convertidos en: ${VERCEL_API_DIR}`);
  console.log('\n⚠️  IMPORTANTE: Revisa manualmente los archivos convertidos');
  console.log('   Algunos casos edge pueden requerir ajustes manuales.\n');
}

if (require.main === module) {
  main();
}

module.exports = { convertHandler, processFunction, processAllFunctions };

