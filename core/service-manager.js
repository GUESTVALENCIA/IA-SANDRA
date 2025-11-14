/**
 * Gestor de Servicios Profesional
 * Por @electron-pro + @fullstack-developer
 * 
 * Inicializa servicios de forma paralela y robusta
 */

class ServiceManager {
  constructor() {
    this.services = new Map();
    this.status = new Map();
    this.dependencies = new Map();
    this.initOrder = [];
  }

  /**
   * Registrar un servicio
   */
  register(name, ServiceClass, options = {}) {
    this.services.set(name, {
      ServiceClass,
      dependencies: options.dependencies || [],
      critical: options.critical || false,
      retries: options.retries || 0,
      timeout: options.timeout || 30000,
      constructorArgs: options.constructorArgs || [] // Argumentos para el constructor
    });

    this.status.set(name, 'registered');
  }

  /**
   * Inicializar todos los servicios
   */
  async initializeAll(context = {}) {
    console.log('🚀 Iniciando todos los servicios...');

    // Fase 1: Servicios críticos (secuencial)
    const criticalServices = Array.from(this.services.entries())
      .filter(([_, config]) => config.critical);

    for (const [name, config] of criticalServices) {
      await this.initializeService(name, config, context);
    }

    // Fase 2: Servicios opcionales (paralelo)
    const optionalServices = Array.from(this.services.entries())
      .filter(([_, config]) => !config.critical);

    const results = await Promise.allSettled(
      optionalServices.map(([name, config]) => 
        this.initializeService(name, config, context)
      )
    );

    // Resumen
    const summary = this.getSummary();
    console.log('\n📊 Resumen de inicialización:');
    console.log(`   ✅ Listos: ${summary.ready}`);
    console.log(`   ⚠️  Fallidos: ${summary.failed}`);
    console.log(`   ⏳ Pendientes: ${summary.pending}\n`);

    return summary;
  }

  /**
   * Inicializar un servicio específico
   */
  async initializeService(name, config, context) {
    this.status.set(name, 'initializing');

    try {
      // Esperar dependencias
      await this.waitForDependencies(config.dependencies);

      // Resolver argumentos del constructor (pueden ser nombres de servicios)
      const resolvedArgs = config.constructorArgs.map(arg => {
        if (typeof arg === 'string' && this.services.has(arg)) {
          return this.get(arg);
        }
        return arg;
      });

      // Crear instancia con argumentos
      const instance = new config.ServiceClass(...resolvedArgs);

      // Inicializar con timeout
      const initPromise = this.callInitMethod(instance, context);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), config.timeout)
      );

      await Promise.race([initPromise, timeoutPromise]);

      // Guardar instancia
      this.services.get(name).instance = instance;
      this.status.set(name, 'ready');

      console.log(`✅ ${name} inicializado`);
      return instance;

    } catch (error) {
      console.warn(`⚠️  ${name} falló: ${error.message}`);

      // Retry si está configurado
      if (config.retries > 0) {
        config.retries--;
        console.log(`🔄 Reintentando ${name}...`);
        return this.initializeService(name, config, context);
      }

      // Marcar como fallido
      this.status.set(name, 'failed');
      this.services.get(name).error = error.message;

      // Si es crítico, lanzar error
      if (config.critical) {
        throw error;
      }

      return null;
    }
  }

  /**
   * Llamar método de inicialización si existe
   */
  async callInitMethod(instance, context) {
    if (typeof instance.initialize === 'function') {
      await instance.initialize(context);
    } else if (typeof instance.init === 'function') {
      await instance.init(context);
    } else if (typeof instance.start === 'function') {
      await instance.start(context);
    }
    // Si no tiene método de init, asumimos que el constructor es suficiente
  }

  /**
   * Esperar a que las dependencias estén listas
   */
  async waitForDependencies(dependencies, timeout = 60000) {
    if (!dependencies || dependencies.length === 0) {
      return true;
    }

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const allReady = dependencies.every(dep => 
        this.status.get(dep) === 'ready'
      );

      if (allReady) {
        return true;
      }

      // Esperar 100ms antes de verificar de nuevo
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Timeout esperando dependencias: ${dependencies.join(', ')}`);
  }

  /**
   * Obtener instancia de un servicio
   */
  get(name) {
    const service = this.services.get(name);
    return service?.instance || null;
  }

  /**
   * Verificar si un servicio está listo
   */
  isReady(name) {
    return this.status.get(name) === 'ready';
  }

  /**
   * Obtener estado de un servicio
   */
  getStatus(name) {
    return this.status.get(name) || 'unknown';
  }

  /**
   * Obtener resumen de todos los servicios
   */
  getSummary() {
    const statuses = Array.from(this.status.values());

    return {
      total: statuses.length,
      ready: statuses.filter(s => s === 'ready').length,
      failed: statuses.filter(s => s === 'failed').length,
      pending: statuses.filter(s => s === 'initializing' || s === 'registered').length,
      services: Array.from(this.services.entries()).map(([name, config]) => ({
        name,
        status: this.status.get(name),
        critical: config.critical,
        error: config.error
      }))
    };
  }

  /**
   * Detener todos los servicios
   */
  async shutdownAll() {
    console.log('🛑 Deteniendo todos los servicios...');

    const shutdownPromises = Array.from(this.services.entries())
      .filter(([name]) => this.status.get(name) === 'ready')
      .map(([name, config]) => this.shutdownService(name, config.instance));

    await Promise.allSettled(shutdownPromises);

    console.log('✅ Todos los servicios detenidos');
  }

  /**
   * Detener un servicio específico
   */
  async shutdownService(name, instance) {
    try {
      if (typeof instance.shutdown === 'function') {
        await instance.shutdown();
      } else if (typeof instance.stop === 'function') {
        await instance.stop();
      } else if (typeof instance.close === 'function') {
        await instance.close();
      }

      this.status.set(name, 'stopped');
      console.log(`✅ ${name} detenido`);
    } catch (error) {
      console.error(`❌ Error deteniendo ${name}:`, error.message);
    }
  }
}

module.exports = ServiceManager;

