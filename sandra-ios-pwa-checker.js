// ═══════════════════════════════════════════════════════════════════
// SANDRA IA - iOS PWA COMPATIBILITY CHECKER
// Verificación automática de funcionalidades PWA para iOS Safari
// ═══════════════════════════════════════════════════════════════════

class SandraIOSPWAChecker {
    constructor() {
        this.results = {};
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
        this.isIOSSafari = this.isIOS && this.isSafari;
        this.isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    }

    // Verificación completa del sistema PWA
    async runCompleteCheck() {
        console.log('🔍 Iniciando verificación completa de Sandra IA PWA para iOS...');

        // Verificaciones básicas
        this.checkBasicCompatibility();
        this.checkManifest();
        await this.checkServiceWorker();
        this.checkMetaTags();
        this.checkIcons();
        this.checkPWAFeatures();
        this.checkIOSSpecificFeatures();
        this.checkPerformance();

        // Generar reporte
        this.generateReport();

        return this.results;
    }

    // Verificación de compatibilidad básica
    checkBasicCompatibility() {
        console.log('📱 Verificando compatibilidad básica...');

        this.results.basicCompatibility = {
            isIOS: this.isIOS,
            isSafari: this.isSafari,
            isIOSSafari: this.isIOSSafari,
            isPWA: this.isPWA,
            viewportMeta: !!document.querySelector('meta[name="viewport"]'),
            httpsProtocol: location.protocol === 'https:',
            serviceWorkerSupport: 'serviceWorker' in navigator
        };

        // Log de resultados
        console.log(`✅ iOS Device: ${this.isIOS ? 'Sí' : 'No'}`);
        console.log(`✅ Safari Browser: ${this.isSafari ? 'Sí' : 'No'}`);
        console.log(`✅ iOS Safari: ${this.isIOSSafari ? 'Sí' : 'No'}`);
        console.log(`✅ Running as PWA: ${this.isPWA ? 'Sí' : 'No'}`);
        console.log(`✅ HTTPS Protocol: ${this.results.basicCompatibility.httpsProtocol ? 'Sí' : 'No'}`);
        console.log(`✅ Service Worker Support: ${this.results.basicCompatibility.serviceWorkerSupport ? 'Sí' : 'No'}`);
    }

    // Verificación del manifest.json
    checkManifest() {
        console.log('📋 Verificando manifest.json...');

        const manifestLink = document.querySelector('link[rel="manifest"]');

        this.results.manifest = {
            linkExists: !!manifestLink,
            href: manifestLink ? manifestLink.href : null,
            accessible: false,
            validJSON: false,
            requiredFields: {}
        };

        if (manifestLink) {
            // Intentar cargar el manifest
            fetch(manifestLink.href)
                .then(response => response.json())
                .then(manifest => {
                    this.results.manifest.accessible = true;
                    this.results.manifest.validJSON = true;
                    this.results.manifest.content = manifest;

                    // Verificar campos requeridos
                    this.results.manifest.requiredFields = {
                        name: !!manifest.name,
                        shortName: !!manifest.short_name,
                        startUrl: !!manifest.start_url,
                        display: manifest.display === 'standalone',
                        themeColor: !!manifest.theme_color,
                        backgroundColor: !!manifest.background_color,
                        icons: Array.isArray(manifest.icons) && manifest.icons.length > 0
                    };

                    console.log('✅ Manifest cargado exitosamente');
                    console.log('📊 Campos requeridos:', this.results.manifest.requiredFields);
                })
                .catch(error => {
                    console.error('❌ Error cargando manifest:', error);
                });
        }
    }

    // Verificación del Service Worker
    async checkServiceWorker() {
        console.log('⚙️ Verificando Service Worker...');

        this.results.serviceWorker = {
            supported: 'serviceWorker' in navigator,
            registered: false,
            active: false,
            cacheExists: false,
            offlineCapable: false
        };

        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.getRegistration();

                if (registration) {
                    this.results.serviceWorker.registered = true;
                    this.results.serviceWorker.active = !!registration.active;

                    console.log('✅ Service Worker registrado');
                    console.log(`✅ Service Worker activo: ${this.results.serviceWorker.active ? 'Sí' : 'No'}`);

                    // Verificar caché
                    if ('caches' in window) {
                        const cacheNames = await caches.keys();
                        this.results.serviceWorker.cacheExists = cacheNames.length > 0;
                        this.results.serviceWorker.cacheNames = cacheNames;

                        console.log(`✅ Cachés disponibles: ${cacheNames.length}`);
                        console.log('📦 Nombres de caché:', cacheNames);
                    }
                }
            } catch (error) {
                console.error('❌ Error verificando Service Worker:', error);
            }
        }
    }

    // Verificación de meta tags
    checkMetaTags() {
        console.log('🏷️ Verificando meta tags...');

        const requiredMetaTags = {
            'apple-mobile-web-app-capable': 'meta[name="apple-mobile-web-app-capable"]',
            'apple-mobile-web-app-status-bar-style': 'meta[name="apple-mobile-web-app-status-bar-style"]',
            'apple-mobile-web-app-title': 'meta[name="apple-mobile-web-app-title"]',
            'theme-color': 'meta[name="theme-color"]'
        };

        this.results.metaTags = {};

        Object.keys(requiredMetaTags).forEach(tagName => {
            const element = document.querySelector(requiredMetaTags[tagName]);
            this.results.metaTags[tagName] = {
                exists: !!element,
                content: element ? element.content : null
            };

            console.log(`${this.results.metaTags[tagName].exists ? '✅' : '❌'} ${tagName}: ${this.results.metaTags[tagName].content || 'No encontrado'}`);
        });
    }

    // Verificación de iconos
    checkIcons() {
        console.log('🎨 Verificando iconos...');

        const appleTouchIcons = document.querySelectorAll('link[rel="apple-touch-icon"]');
        const manifestIcons = this.results.manifest?.content?.icons || [];

        this.results.icons = {
            appleTouchIcons: appleTouchIcons.length,
            manifestIcons: manifestIcons.length,
            appleTouchIconsList: Array.from(appleTouchIcons).map(icon => ({
                sizes: icon.getAttribute('sizes'),
                href: icon.href
            })),
            manifestIconsList: manifestIcons.map(icon => ({
                sizes: icon.sizes,
                src: icon.src,
                type: icon.type
            }))
        };

        console.log(`✅ Apple Touch Icons: ${appleTouchIcons.length}`);
        console.log(`✅ Manifest Icons: ${manifestIcons.length}`);
    }

    // Verificación de funcionalidades PWA
    checkPWAFeatures() {
        console.log('🚀 Verificando funcionalidades PWA...');

        this.results.pwaFeatures = {
            installable: this.checkInstallability(),
            offlineSupport: 'caches' in window && 'serviceWorker' in navigator,
            backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
            pushNotifications: 'serviceWorker' in navigator && 'PushManager' in window,
            geolocation: 'geolocation' in navigator,
            camera: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
            fileSystem: 'showOpenFilePicker' in window || 'webkitdirectory' in document.createElement('input'),
            fullscreen: 'requestFullscreen' in document.documentElement
        };

        console.log('📊 Funcionalidades PWA disponibles:');
        Object.keys(this.results.pwaFeatures).forEach(feature => {
            console.log(`${this.results.pwaFeatures[feature] ? '✅' : '❌'} ${feature}`);
        });
    }

    // Verificación específica para iOS
    checkIOSSpecificFeatures() {
        console.log('🍎 Verificando funcionalidades específicas de iOS...');

        this.results.iosFeatures = {
            standalone: window.navigator.standalone,
            safeAreaSupport: this.checkSafeAreaSupport(),
            touchEvents: 'ontouchstart' in window,
            orientationChange: 'onorientationchange' in window,
            visualViewport: 'visualViewport' in window,
            webShare: 'share' in navigator,
            webAuthentication: 'credentials' in navigator,
            clipboard: 'clipboard' in navigator
        };

        console.log('📊 Funcionalidades iOS disponibles:');
        Object.keys(this.results.iosFeatures).forEach(feature => {
            console.log(`${this.results.iosFeatures[feature] ? '✅' : '❌'} ${feature}`);
        });
    }

    // Verificación de soporte para Safe Area
    checkSafeAreaSupport() {
        const testElement = document.createElement('div');
        testElement.style.paddingTop = 'env(safe-area-inset-top)';
        document.body.appendChild(testElement);
        const hasSafeArea = getComputedStyle(testElement).paddingTop !== '0px';
        document.body.removeChild(testElement);
        return hasSafeArea;
    }

    // Verificación de instalabilidad
    checkInstallability() {
        // Para iOS, la instalabilidad se determina por la presencia de manifest y meta tags
        return !!(
            document.querySelector('link[rel="manifest"]') &&
            document.querySelector('meta[name="apple-mobile-web-app-capable"]') &&
            this.isIOSSafari
        );
    }

    // Verificación de rendimiento
    checkPerformance() {
        console.log('⚡ Verificando rendimiento...');

        this.results.performance = {
            navigationTiming: null,
            largestContentfulPaint: null,
            firstInputDelay: null,
            cumulativeLayoutShift: null
        };

        // Navigation Timing
        if ('performance' in window && 'getEntriesByType' in performance) {
            const navTiming = performance.getEntriesByType('navigation')[0];
            if (navTiming) {
                this.results.performance.navigationTiming = {
                    domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart,
                    loadComplete: navTiming.loadEventEnd - navTiming.loadEventStart,
                    totalTime: navTiming.loadEventEnd - navTiming.fetchStart
                };
            }
        }

        // Web Vitals (si están disponibles)
        if ('PerformanceObserver' in window) {
            try {
                new PerformanceObserver((entryList) => {
                    for (const entry of entryList.getEntries()) {
                        if (entry.entryType === 'largest-contentful-paint') {
                            this.results.performance.largestContentfulPaint = entry.startTime;
                        }
                    }
                }).observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                console.log('Performance Observer no disponible para LCP');
            }
        }

        console.log('📊 Métricas de rendimiento recopiladas');
    }

    // Generar reporte completo
    generateReport() {
        console.log('\n🎯 REPORTE COMPLETO - SANDRA IA PWA iOS');
        console.log('═══════════════════════════════════════════');

        // Puntuación general
        const scores = this.calculateScores();
        console.log(`\n📊 PUNTUACIÓN GENERAL: ${scores.total}/100`);
        console.log(`📱 Compatibilidad iOS: ${scores.iosCompatibility}/25`);
        console.log(`📋 Manifest: ${scores.manifest}/20`);
        console.log(`⚙️ Service Worker: ${scores.serviceWorker}/20`);
        console.log(`🎨 Iconos y Meta Tags: ${scores.iconsAndMeta}/20`);
        console.log(`🚀 Funcionalidades PWA: ${scores.pwaFeatures}/15`);

        // Recomendaciones
        this.generateRecommendations();

        // Guardar en localStorage para análisis posterior
        localStorage.setItem('sandra-pwa-check-results', JSON.stringify({
            timestamp: new Date().toISOString(),
            results: this.results,
            scores: scores
        }));

        console.log('\n✅ Reporte guardado en localStorage como "sandra-pwa-check-results"');
    }

    // Calcular puntuaciones
    calculateScores() {
        const scores = {
            iosCompatibility: 0,
            manifest: 0,
            serviceWorker: 0,
            iconsAndMeta: 0,
            pwaFeatures: 0,
            total: 0
        };

        // iOS Compatibility (25 puntos)
        if (this.results.basicCompatibility?.isIOSSafari) scores.iosCompatibility += 10;
        if (this.results.basicCompatibility?.httpsProtocol) scores.iosCompatibility += 5;
        if (this.results.basicCompatibility?.serviceWorkerSupport) scores.iosCompatibility += 5;
        if (this.results.basicCompatibility?.viewportMeta) scores.iosCompatibility += 5;

        // Manifest (20 puntos)
        if (this.results.manifest?.linkExists) scores.manifest += 5;
        if (this.results.manifest?.accessible) scores.manifest += 5;
        const manifestFields = this.results.manifest?.requiredFields || {};
        scores.manifest += Object.values(manifestFields).filter(Boolean).length * 1.25;

        // Service Worker (20 puntos)
        if (this.results.serviceWorker?.supported) scores.serviceWorker += 5;
        if (this.results.serviceWorker?.registered) scores.serviceWorker += 7;
        if (this.results.serviceWorker?.active) scores.serviceWorker += 8;

        // Icons and Meta Tags (20 puntos)
        const metaTags = this.results.metaTags || {};
        scores.iconsAndMeta += Object.values(metaTags).filter(tag => tag.exists).length * 3;
        if (this.results.icons?.appleTouchIcons > 0) scores.iconsAndMeta += 4;
        if (this.results.icons?.manifestIcons > 0) scores.iconsAndMeta += 4;

        // PWA Features (15 puntos)
        const pwaFeatures = this.results.pwaFeatures || {};
        scores.pwaFeatures += Object.values(pwaFeatures).filter(Boolean).length * 1.5;

        // Total
        scores.total = scores.iosCompatibility + scores.manifest + scores.serviceWorker + scores.iconsAndMeta + scores.pwaFeatures;

        return scores;
    }

    // Generar recomendaciones
    generateRecommendations() {
        console.log('\n💡 RECOMENDACIONES');
        console.log('══════════════════');

        const recommendations = [];

        // Verificar problemas críticos
        if (!this.results.basicCompatibility?.isIOSSafari) {
            recommendations.push('❗ Prueba la app en Safari iOS para mejor compatibilidad');
        }

        if (!this.results.basicCompatibility?.httpsProtocol) {
            recommendations.push('🔒 Asegúrate de usar HTTPS para funcionalidades PWA');
        }

        if (!this.results.manifest?.accessible) {
            recommendations.push('📋 Verifica que manifest.json sea accesible');
        }

        if (!this.results.serviceWorker?.registered) {
            recommendations.push('⚙️ Registra el Service Worker para funcionalidad offline');
        }

        if (!this.results.metaTags?.['apple-mobile-web-app-capable']?.exists) {
            recommendations.push('🏷️ Añade meta tag apple-mobile-web-app-capable');
        }

        if (this.results.icons?.appleTouchIcons === 0) {
            recommendations.push('🎨 Añade iconos apple-touch-icon para iOS');
        }

        // Mostrar recomendaciones
        if (recommendations.length > 0) {
            recommendations.forEach(rec => console.log(rec));
        } else {
            console.log('🎉 ¡Todo perfecto! Sandra IA está optimizada para iOS.');
        }
    }

    // Método para ejecutar verificación desde consola
    static async runCheck() {
        const checker = new SandraIOSPWAChecker();
        return await checker.runCompleteCheck();
    }
}

// Hacer disponible globalmente para debugging
window.SandraIOSPWAChecker = SandraIOSPWAChecker;

// Auto-ejecutar si se carga el script
if (typeof document !== 'undefined' && document.readyState !== 'loading') {
    console.log('🚀 Sandra IA PWA Checker cargado. Ejecuta SandraIOSPWAChecker.runCheck() para verificar.');
} else {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 Sandra IA PWA Checker cargado. Ejecuta SandraIOSPWAChecker.runCheck() para verificar.');
    });
}

export default SandraIOSPWAChecker;