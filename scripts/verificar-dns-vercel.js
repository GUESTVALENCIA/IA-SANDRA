/**
 * Verifica si el dominio está correctamente configurado para Vercel
 */

const { execSync } = require('child_process');
const dns = require('dns').promises;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function verificarDNS(dominio) {
  log(`\n🔍 Verificando DNS para: ${dominio}\n`, 'cyan');

  try {
    // Resolver CNAME
    const cname = await dns.resolveCname(dominio);
    
    log(`✅ CNAME encontrado:`, 'green');
    cname.forEach(record => {
      if (record.includes('vercel-dns.com') || record.includes('vercel')) {
        log(`   ${record} ✅ Correcto para Vercel`, 'green');
      } else {
        log(`   ${record} ⚠️  No apunta a Vercel`, 'yellow');
      }
    });

    // Resolver A record (si existe)
    try {
      const a = await dns.resolve4(dominio);
      log(`\n📋 A Records:`, 'cyan');
      a.forEach(ip => {
        log(`   ${ip}`, 'white');
      });
    } catch (e) {
      // No hay A record, solo CNAME
    }

  } catch (error) {
    if (error.code === 'ENOTFOUND') {
      log(`❌ Dominio no encontrado`, 'red');
    } else if (error.code === 'ENODATA') {
      log(`⚠️  No hay CNAME configurado`, 'yellow');
      log(`   Necesitas agregar: ${dominio} CNAME cname.vercel-dns.com`, 'cyan');
    } else {
      log(`❌ Error: ${error.message}`, 'red');
    }
  }
}

async function main() {
  log('\n🌐 VERIFICADOR DE DNS PARA VERCEL\n', 'cyan');

  const dominios = [
    'sandra.guestsvalencia.es',
    'www.sandra.guestsvalencia.es'
  ];

  for (const dominio of dominios) {
    await verificarDNS(dominio);
  }

  log('\n📝 Instrucciones:', 'cyan');
  log('   Si el CNAME no apunta a Vercel:', 'white');
  log('   1. Ve a tu panel DNS', 'white');
  log('   2. Modifica el registro CNAME', 'white');
  log('   3. Cambia el valor a: cname.vercel-dns.com', 'white');
  log('   4. Espera la propagación (5 min - 1 hora)', 'white');
  log('   5. Vuelve a ejecutar este script para verificar\n', 'white');
}

main();

