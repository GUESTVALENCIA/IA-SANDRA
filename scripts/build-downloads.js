#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════════════
// SANDRA IA MOBILE GALAXY - Build Downloads Script
// Production Build Script for All Download Assets
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Import our generators
const SandraAPKGenerator = require('./mobile/generate-apk');
const SandraIOSTestFlightSetup = require('./mobile/ios-testflight-setup');

class SandraDownloadBuilder {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.downloadsPath = path.join(this.projectRoot, 'downloads');
        this.version = '98.0.0';
        this.buildTimestamp = new Date().toISOString();

        console.log('🚀 Sandra IA Galaxy Download Builder v' + this.version);
        console.log('📁 Project Root:', this.projectRoot);
        console.log('📦 Downloads Path:', this.downloadsPath);
    }

    async buildAllDownloads() {
        console.log('\n🏗️ Building all Sandra IA download assets...\n');

        try {
            // Ensure downloads directory exists
            await this.ensureDownloadsDirectory();

            // Build APK for Android
            const apkResult = await this.buildAndroidAPK();

            // Setup iOS TestFlight
            const iosResult = await this.setupIOSTestFlight();

            // Generate download metadata
            const metadata = await this.generateDownloadMetadata(apkResult, iosResult);

            // Generate download page
            await this.generateDownloadInfoPage(metadata);

            // Create checksums
            await this.generateChecksums();

            console.log('\n✅ All downloads built successfully!');
            console.log('📊 Build Summary:');
            console.log('  - Android APK:', apkResult.success ? '✅' : '❌');
            console.log('  - iOS TestFlight:', iosResult.success ? '✅' : '❌');
            console.log('  - Download Metadata: ✅');
            console.log('  - File Checksums: ✅');

            return {
                success: true,
                android: apkResult,
                ios: iosResult,
                metadata: metadata,
                timestamp: this.buildTimestamp
            };

        } catch (error) {
            console.error('❌ Build failed:', error);
            return { success: false, error: error.message };
        }
    }

    async ensureDownloadsDirectory() {
        console.log('📁 Ensuring downloads directory exists...');

        if (!fs.existsSync(this.downloadsPath)) {
            fs.mkdirSync(this.downloadsPath, { recursive: true });
            console.log('✅ Downloads directory created');
        } else {
            console.log('✅ Downloads directory exists');
        }

        // Create subdirectories
        const subdirs = ['android', 'ios', 'metadata', 'checksums'];
        for (const subdir of subdirs) {
            const subdirPath = path.join(this.downloadsPath, subdir);
            if (!fs.existsSync(subdirPath)) {
                fs.mkdirSync(subdirPath, { recursive: true });
            }
        }
    }

    async buildAndroidAPK() {
        console.log('🤖 Building Android APK...');

        try {
            // First install required dependencies
            await this.installAPKDependencies();

            const apkGenerator = new SandraAPKGenerator();
            const result = await apkGenerator.generateAPK();

            if (result.success) {
                console.log('✅ Android APK built successfully');
                console.log('  📦 Size:', this.formatFileSize(result.size));
                console.log('  📍 Path:', result.path);

                // Copy to downloads/android/
                const androidDir = path.join(this.downloadsPath, 'android');
                const targetPath = path.join(androidDir, 'sandra-ia-galaxy.apk');

                if (fs.existsSync(result.path)) {
                    fs.copyFileSync(result.path, targetPath);
                    console.log('✅ APK copied to downloads directory');
                }

                return { ...result, finalPath: targetPath };
            } else {
                console.error('❌ Android APK build failed:', result.error);
                return result;
            }

        } catch (error) {
            console.error('❌ Android APK build error:', error);
            return { success: false, error: error.message };
        }
    }

    async installAPKDependencies() {
        console.log('📦 Installing APK generation dependencies...');

        try {
            // Check if jszip is installed
            const packageJsonPath = path.join(this.projectRoot, 'package.json');
            let packageJson = {};

            if (fs.existsSync(packageJsonPath)) {
                packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            }

            // Ensure required dependencies
            const requiredDeps = {
                'jszip': '^3.10.1'
            };

            let needsInstall = false;
            for (const [dep, version] of Object.entries(requiredDeps)) {
                if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
                    needsInstall = true;
                    break;
                }
            }

            if (needsInstall) {
                console.log('Installing required dependencies...');
                const deps = Object.entries(requiredDeps).map(([dep, version]) => `${dep}@${version}`).join(' ');

                await new Promise((resolve, reject) => {
                    exec(`npm install ${deps}`, { cwd: this.projectRoot }, (error, stdout, stderr) => {
                        if (error) {
                            console.warn('Warning: Could not install dependencies automatically');
                            console.warn('Please run: npm install jszip');
                            resolve(); // Continue anyway
                        } else {
                            console.log('✅ Dependencies installed');
                            resolve();
                        }
                    });
                });
            } else {
                console.log('✅ Dependencies already available');
            }

        } catch (error) {
            console.warn('Warning: Could not verify dependencies:', error.message);
        }
    }

    async setupIOSTestFlight() {
        console.log('🍎 Setting up iOS TestFlight...');

        try {
            const iosSetup = new SandraIOSTestFlightSetup();
            const result = await iosSetup.setupTestFlightDistribution();

            if (result.success) {
                console.log('✅ iOS TestFlight setup completed');
                console.log('  🔗 TestFlight Link:', result.testFlightLink);
                console.log('  📱 Bundle ID:', result.bundleId);

                // Save iOS metadata
                const iosMetadataPath = path.join(this.downloadsPath, 'ios', 'testflight-info.json');
                fs.writeFileSync(iosMetadataPath, JSON.stringify(result, null, 2));

                return result;
            } else {
                console.error('❌ iOS TestFlight setup failed:', result.error);
                return result;
            }

        } catch (error) {
            console.error('❌ iOS TestFlight setup error:', error);
            return { success: false, error: error.message };
        }
    }

    async generateDownloadMetadata(apkResult, iosResult) {
        console.log('📋 Generating download metadata...');

        const metadata = {
            version: this.version,
            build_timestamp: this.buildTimestamp,
            build_number: '9800',
            platforms: {
                android: {
                    available: apkResult.success,
                    filename: 'sandra-ia-galaxy.apk',
                    size: apkResult.size || 0,
                    formatted_size: apkResult.size ? this.formatFileSize(apkResult.size) : 'Unknown',
                    download_url: 'https://sandra.guestsvalencia.es/downloads/sandra-ia-galaxy.apk',
                    requirements: {
                        android_version: '8.0+',
                        api_level: '26+',
                        architecture: 'ARM64, ARM32',
                        storage: '50 MB'
                    },
                    permissions: [
                        'Internet',
                        'Camera',
                        'Microphone',
                        'Storage',
                        'Vibration'
                    ]
                },
                ios: {
                    available: iosResult.success,
                    type: 'TestFlight Beta',
                    testflight_url: iosResult.testFlightLink || 'https://testflight.apple.com/join/ABC123XY',
                    bundle_id: iosResult.bundleId || 'com.guestsvalencia.sandra',
                    requirements: {
                        ios_version: '14.0+',
                        device_compatibility: ['iPhone', 'iPad', 'iPod Touch'],
                        storage: '150 MB'
                    },
                    beta_info: {
                        group: 'Sandra IA Beta Testers',
                        max_testers: 10000,
                        feedback_email: 'soporte@guestsvalencia.es'
                    }
                },
                pwa: {
                    available: true,
                    type: 'Progressive Web App',
                    url: 'https://sandra.guestsvalencia.es',
                    manifest_url: 'https://sandra.guestsvalencia.es/manifest.json',
                    requirements: {
                        browser: 'Chrome, Safari, Edge, Firefox',
                        support: 'Modern browsers with PWA support'
                    },
                    features: [
                        'Offline capability',
                        'Push notifications',
                        'Home screen installation',
                        'Full screen experience'
                    ]
                }
            },
            installation_guides: {
                android: [
                    'Descarga el archivo APK',
                    'Habilita "Fuentes desconocidas" en Configuración',
                    'Localiza el archivo en Descargas',
                    'Toca el archivo APK para instalar',
                    'Otorga los permisos necesarios',
                    'Abre Sandra IA desde el menú'
                ],
                ios: [
                    'Toca el enlace de TestFlight',
                    'Instala TestFlight si es necesario',
                    'Acepta la invitación beta',
                    'Instala Sandra IA desde TestFlight',
                    'Permite permisos de cámara y micrófono',
                    'Abre Sandra IA desde la pantalla de inicio'
                ],
                pwa: [
                    'Visita sandra.guestsvalencia.es',
                    'Busca el botón "Instalar" en el navegador',
                    'O usa "Añadir a pantalla de inicio"',
                    'Confirma la instalación',
                    'Accede desde el icono instalado'
                ]
            },
            support: {
                email: 'soporte@guestsvalencia.es',
                documentation: 'https://sandra.guestsvalencia.es/docs',
                troubleshooting: 'https://sandra.guestsvalencia.es/help'
            }
        };

        // Save metadata
        const metadataPath = path.join(this.downloadsPath, 'metadata', 'download-info.json');
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        console.log('✅ Download metadata generated');
        return metadata;
    }

    async generateDownloadInfoPage(metadata) {
        console.log('📄 Generating download info page...');

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sandra IA Galaxy - Información de Descarga</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .platform { border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 8px; }
        .available { border-color: #4CAF50; background: #f9fff9; }
        .unavailable { border-color: #f44336; background: #fff9f9; }
        .download-btn { background: #00ff88; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        .requirements { background: #f5f5f5; padding: 10px; border-radius: 4px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>Sandra IA Galaxy - Información de Descarga</h1>
    <p><strong>Versión:</strong> ${metadata.version}</p>
    <p><strong>Generado:</strong> ${new Date(metadata.build_timestamp).toLocaleString('es-ES')}</p>

    <div class="platform ${metadata.platforms.android.available ? 'available' : 'unavailable'}">
        <h2>🤖 Android APK</h2>
        <p><strong>Estado:</strong> ${metadata.platforms.android.available ? 'Disponible' : 'No disponible'}</p>
        ${metadata.platforms.android.available ? `
        <p><strong>Archivo:</strong> ${metadata.platforms.android.filename}</p>
        <p><strong>Tamaño:</strong> ${metadata.platforms.android.formatted_size}</p>
        <a href="${metadata.platforms.android.download_url}" class="download-btn">Descargar APK</a>
        <div class="requirements">
            <strong>Requisitos:</strong>
            <ul>
                <li>Android ${metadata.platforms.android.requirements.android_version}</li>
                <li>Arquitectura: ${metadata.platforms.android.requirements.architecture}</li>
                <li>Espacio: ${metadata.platforms.android.requirements.storage}</li>
            </ul>
        </div>
        ` : '<p>El APK está siendo generado.</p>'}
    </div>

    <div class="platform ${metadata.platforms.ios.available ? 'available' : 'unavailable'}">
        <h2>🍎 iOS TestFlight</h2>
        <p><strong>Estado:</strong> ${metadata.platforms.ios.available ? 'Disponible' : 'No disponible'}</p>
        ${metadata.platforms.ios.available ? `
        <a href="${metadata.platforms.ios.testflight_url}" class="download-btn">Unirse a TestFlight</a>
        <div class="requirements">
            <strong>Requisitos:</strong>
            <ul>
                <li>iOS ${metadata.platforms.ios.requirements.ios_version}</li>
                <li>Dispositivos: ${metadata.platforms.ios.requirements.device_compatibility.join(', ')}</li>
                <li>Espacio: ${metadata.platforms.ios.requirements.storage}</li>
            </ul>
        </div>
        ` : '<p>TestFlight no está configurado.</p>'}
    </div>

    <div class="platform available">
        <h2>🌐 Progressive Web App (PWA)</h2>
        <p><strong>Estado:</strong> Disponible</p>
        <a href="${metadata.platforms.pwa.url}" class="download-btn">Abrir Web App</a>
        <div class="requirements">
            <strong>Características:</strong>
            <ul>
                ${metadata.platforms.pwa.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        </div>
    </div>

    <h2>📞 Soporte</h2>
    <p><strong>Email:</strong> <a href="mailto:${metadata.support.email}">${metadata.support.email}</a></p>
    <p><strong>Documentación:</strong> <a href="${metadata.support.documentation}">Ver guías</a></p>

    <hr>
    <p><small>Generado automáticamente el ${new Date(metadata.build_timestamp).toLocaleString('es-ES')}</small></p>
</body>
</html>`;

        const infoPagePath = path.join(this.downloadsPath, 'index.html');
        fs.writeFileSync(infoPagePath, html);

        console.log('✅ Download info page generated');
    }

    async generateChecksums() {
        console.log('🔐 Generating file checksums...');

        const crypto = require('crypto');
        const checksums = {};

        // Generate checksum for APK if it exists
        const apkPath = path.join(this.downloadsPath, 'android', 'sandra-ia-galaxy.apk');
        if (fs.existsSync(apkPath)) {
            const apkBuffer = fs.readFileSync(apkPath);
            checksums['sandra-ia-galaxy.apk'] = {
                md5: crypto.createHash('md5').update(apkBuffer).digest('hex'),
                sha256: crypto.createHash('sha256').update(apkBuffer).digest('hex'),
                size: apkBuffer.length
            };
        }

        // Save checksums
        const checksumsPath = path.join(this.downloadsPath, 'checksums', 'checksums.json');
        fs.writeFileSync(checksumsPath, JSON.stringify(checksums, null, 2));

        console.log('✅ Checksums generated');
        return checksums;
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// CLI execution
if (require.main === module) {
    const builder = new SandraDownloadBuilder();
    builder.buildAllDownloads()
        .then(result => {
            if (result.success) {
                console.log('\n🎉 Build completed successfully!');
                process.exit(0);
            } else {
                console.error('\n💥 Build failed:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n💥 Unexpected error:', error);
            process.exit(1);
        });
}

module.exports = SandraDownloadBuilder;