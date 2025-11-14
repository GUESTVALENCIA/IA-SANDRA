/**
 * Validador de Configuración Profesional
 * Por @devops-engineer
 * 
 * Valida todas las API keys y configuraciones antes de iniciar
 */

const axios = require('axios');

class ConfigValidator {
  constructor() {
    this.results = {
      critical: [],
      optional: [],
      warnings: [],
      errors: []
    };
  }

  /**
   * Validar toda la configuración
   */
  async validateAll() {
    console.log('🔍 Validando configuración del sistema...');

    // Validar APIs críticas
    await this.validateGroqAPI();
    await this.validateNeonDB();

    // Validar APIs opcionales
    await this.validateDeepgramAPI();
    await this.validateHeyGenAPI();
    await this.validateGitHubToken();
    await this.validateVercelToken();

    // Generar reporte
    return this.generateReport();
  }

  /**
   * Validar Groq API (CRÍTICO)
   */
  async validateGroqAPI() {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      this.results.errors.push({
        service: 'Groq API',
        severity: 'critical',
        message: 'GROQ_API_KEY no configurada',
        solution: 'Añadir GROQ_API_KEY en .env.pro'
      });
      return false;
    }

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      this.results.critical.push({
        service: 'Groq API',
        status: 'valid',
        message: '✅ API key válida y funcional'
      });
      return true;
    } catch (error) {
      this.results.errors.push({
        service: 'Groq API',
        severity: 'critical',
        message: `API key inválida o error de conexión: ${error.message}`,
        solution: 'Verificar GROQ_API_KEY en https://console.groq.com'
      });
      return false;
    }
  }

  /**
   * Validar Neon DB (CRÍTICO)
   */
  async validateNeonDB() {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      this.results.warnings.push({
        service: 'Neon DB',
        severity: 'warning',
        message: 'DATABASE_URL no configurada (modo offline)',
        solution: 'Configurar DATABASE_URL para persistencia'
      });
      return false;
    }

    try {
      const { Client } = require('pg');
      const client = new Client({ connectionString: dbUrl });
      
      await client.connect();
      await client.query('SELECT NOW()');
      await client.end();

      this.results.critical.push({
        service: 'Neon DB',
        status: 'valid',
        message: '✅ Conexión a base de datos exitosa'
      });
      return true;
    } catch (error) {
      this.results.warnings.push({
        service: 'Neon DB',
        severity: 'warning',
        message: `Error de conexión: ${error.message} (modo offline)`,
        solution: 'Verificar DATABASE_URL en https://neon.tech'
      });
      return false;
    }
  }

  /**
   * Validar Deepgram API (OPCIONAL)
   */
  async validateDeepgramAPI() {
    const apiKey = process.env.DEEPGRAM_API_KEY;

    if (!apiKey) {
      this.results.optional.push({
        service: 'Deepgram STT',
        status: 'disabled',
        message: 'API key no configurada (STT deshabilitado)'
      });
      return false;
    }

    try {
      const response = await axios.get(
        'https://api.deepgram.com/v1/projects',
        {
          headers: {
            'Authorization': `Token ${apiKey}`
          },
          timeout: 10000
        }
      );

      this.results.optional.push({
        service: 'Deepgram STT',
        status: 'valid',
        message: '✅ Speech-to-Text disponible'
      });
      return true;
    } catch (error) {
      this.results.optional.push({
        service: 'Deepgram STT',
        status: 'invalid',
        message: `API key inválida (STT deshabilitado)`
      });
      return false;
    }
  }

  /**
   * Validar HeyGen API (OPCIONAL)
   */
  async validateHeyGenAPI() {
    const apiKey = process.env.HEYGEN_API_KEY;

    if (!apiKey) {
      this.results.optional.push({
        service: 'HeyGen Avatar',
        status: 'disabled',
        message: 'API key no configurada (Avatar deshabilitado)'
      });
      return false;
    }

    try {
      // HeyGen usa autenticación diferente
      const response = await axios.get(
        'https://api.heygen.com/v1/avatar.list',
        {
          headers: {
            'X-Api-Key': apiKey
          },
          timeout: 10000
        }
      );

      this.results.optional.push({
        service: 'HeyGen Avatar',
        status: 'valid',
        message: '✅ Avatar conversacional disponible'
      });
      return true;
    } catch (error) {
      this.results.optional.push({
        service: 'HeyGen Avatar',
        status: 'invalid',
        message: `API key inválida o expirada (Avatar deshabilitado)`
      });
      return false;
    }
  }

  /**
   * Validar GitHub Token (OPCIONAL)
   */
  async validateGitHubToken() {
    const token = process.env.GITHUB_TOKEN;

    if (!token) {
      this.results.optional.push({
        service: 'GitHub',
        status: 'disabled',
        message: 'Token no configurado (Git sync deshabilitado)'
      });
      return false;
    }

    try {
      const response = await axios.get(
        'https://api.github.com/user',
        {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          },
          timeout: 10000
        }
      );

      this.results.optional.push({
        service: 'GitHub',
        status: 'valid',
        message: `✅ Autenticado como ${response.data.login}`
      });
      return true;
    } catch (error) {
      this.results.optional.push({
        service: 'GitHub',
        status: 'invalid',
        message: 'Token inválido (Git sync deshabilitado)'
      });
      return false;
    }
  }

  /**
   * Validar Vercel Token (OPCIONAL)
   */
  async validateVercelToken() {
    const token = process.env.VERCEL_TOKEN;

    if (!token) {
      this.results.optional.push({
        service: 'Vercel',
        status: 'disabled',
        message: 'Token no configurado (Deploy deshabilitado)'
      });
      return false;
    }

    try {
      const response = await axios.get(
        'https://api.vercel.com/v2/user',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 10000
        }
      );

      this.results.optional.push({
        service: 'Vercel',
        status: 'valid',
        message: `✅ Autenticado como ${response.data.user.username}`
      });
      return true;
    } catch (error) {
      this.results.optional.push({
        service: 'Vercel',
        status: 'invalid',
        message: 'Token inválido (Deploy deshabilitado)'
      });
      return false;
    }
  }

  /**
   * Generar reporte de validación
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.critical.length + this.results.optional.length,
        critical: this.results.critical.length,
        optional: this.results.optional.length,
        errors: this.results.errors.length,
        warnings: this.results.warnings.length
      },
      canStart: this.results.errors.length === 0,
      results: this.results
    };

    // Log del reporte
    console.log('\n📊 REPORTE DE VALIDACIÓN:');
    console.log('═'.repeat(60));

    // Servicios críticos
    if (this.results.critical.length > 0) {
      console.log('\n🔴 SERVICIOS CRÍTICOS:');
      this.results.critical.forEach(r => console.log(`   ${r.message}`));
    }

    // Errores
    if (this.results.errors.length > 0) {
      console.log('\n❌ ERRORES:');
      this.results.errors.forEach(e => {
        console.log(`   ${e.service}: ${e.message}`);
        console.log(`   💡 Solución: ${e.solution}`);
      });
    }

    // Servicios opcionales
    if (this.results.optional.length > 0) {
      console.log('\n🟡 SERVICIOS OPCIONALES:');
      this.results.optional.forEach(r => console.log(`   ${r.service}: ${r.message}`));
    }

    // Warnings
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  ADVERTENCIAS:');
      this.results.warnings.forEach(w => {
        console.log(`   ${w.service}: ${w.message}`);
        if (w.solution) console.log(`   💡 Solución: ${w.solution}`);
      });
    }

    console.log('\n═'.repeat(60));

    if (report.canStart) {
      console.log('✅ Sistema listo para iniciar\n');
    } else {
      console.log('❌ Errores críticos detectados. Corregir antes de continuar.\n');
    }

    return report;
  }

  /**
   * Validación rápida (solo críticos)
   */
  async validateCritical() {
    await this.validateGroqAPI();
    
    const hasErrors = this.results.errors.length > 0;
    
    if (hasErrors) {
      console.error('❌ Validación crítica fallida:');
      this.results.errors.forEach(e => {
        console.error(`   ${e.service}: ${e.message}`);
      });
      return false;
    }

    console.log('✅ Validación crítica exitosa');
    return true;
  }
}

module.exports = ConfigValidator;

