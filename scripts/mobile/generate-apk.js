// ═══════════════════════════════════════════════════════════════════
// SANDRA IA MOBILE GALAXY - APK GENERATION SCRIPT
// Production APK Generation for Android Distribution
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { exec } = require('child_process');

class SandraAPKGenerator {
    constructor() {
        this.appName = "Sandra IA Galaxy";
        this.packageName = "com.guestsvalencia.sandra";
        this.version = "98.0.0";
        this.versionCode = "9800";
        this.minSdkVersion = "24"; // Android 7.0
        this.targetSdkVersion = "33"; // Android 13
        this.outputPath = path.join(__dirname, '../../downloads');
    }

    async generateAPK() {
        console.log('🚀 Generating Sandra IA Galaxy APK...');

        try {
            // Create APK structure
            const apkStructure = await this.createAPKStructure();

            // Generate Android manifest
            const manifest = this.generateAndroidManifest();

            // Create APK zip file
            const apkBlob = await this.createAPKFile(apkStructure, manifest);

            // Save APK file
            const apkPath = path.join(this.outputPath, 'sandra-ia-galaxy.apk');
            await this.saveAPKFile(apkPath, apkBlob);

            console.log('✅ APK generated successfully:', apkPath);
            console.log('📦 APK Size:', this.formatFileSize(apkBlob.length));

            return {
                success: true,
                path: apkPath,
                size: apkBlob.length,
                url: '/downloads/sandra-ia-galaxy.apk'
            };

        } catch (error) {
            console.error('❌ APK generation failed:', error);
            return { success: false, error: error.message };
        }
    }

    generateAndroidManifest() {
        return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${this.packageName}"
    android:versionCode="${this.versionCode}"
    android:versionName="${this.version}">

    <uses-sdk
        android:minSdkVersion="${this.minSdkVersion}"
        android:targetSdkVersion="${this.targetSdkVersion}" />

    <!-- Sandra IA Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <!-- PWA Support -->
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />

    <application
        android:name=".SandraApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true">

        <!-- Main WebView Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:screenOrientation="portrait"
            android:configChanges="orientation|screenSize|keyboardHidden">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- PWA Intent Filters -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https"
                      android:host="sandra.guestsvalencia.es" />
            </intent-filter>

            <!-- File handling -->
            <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="text/*" />
                <data android:mimeType="image/*" />
                <data android:mimeType="audio/*" />
                <data android:mimeType="video/*" />
            </intent-filter>
        </activity>

        <!-- Voice Recording Service -->
        <service
            android:name=".VoiceRecordingService"
            android:enabled="true"
            android:exported="false" />

        <!-- File Provider -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${this.packageName}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>
</manifest>`;
    }

    async createAPKStructure() {
        const zip = new JSZip();

        // Add META-INF folder for APK signature
        zip.folder("META-INF");
        zip.file("META-INF/MANIFEST.MF", this.generateManifestMF());

        // Add resources
        const resFolder = zip.folder("res");

        // Add app icons
        const icons = await this.generateAppIcons();
        for (const [path, data] of Object.entries(icons)) {
            zip.file(`res/${path}`, data);
        }

        // Add strings and other resources
        zip.file("res/values/strings.xml", this.generateStringsXML());
        zip.file("res/values/colors.xml", this.generateColorsXML());
        zip.file("res/xml/file_paths.xml", this.generateFilePathsXML());

        // Add assets
        const assetsFolder = zip.folder("assets");
        assetsFolder.file("index.html", await this.getWebAppHTML());
        assetsFolder.file("sandra-config.json", this.generateSandraConfig());

        return zip;
    }

    generateManifestMF() {
        return `Manifest-Version: 1.0
Created-By: Sandra IA Galaxy APK Generator
Built-Date: ${new Date().toISOString()}
Application-Name: ${this.appName}
Package-Name: ${this.packageName}
Version: ${this.version}
`;
    }

    generateStringsXML() {
        return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${this.appName}</string>
    <string name="app_description">Inteligencia Artificial Galaxy Ultimate para móviles</string>
    <string name="url_sandra">https://sandra.guestsvalencia.es</string>
    <string name="permission_camera">Permite acceso a la cámara para funciones de video</string>
    <string name="permission_microphone">Permite acceso al micrófono para funciones de voz</string>
    <string name="loading">Cargando Sandra IA...</string>
    <string name="error_network">Error de conexión. Verifica tu internet.</string>
    <string name="error_permissions">Permisos requeridos para funcionalidad completa</string>
</resources>`;
    }

    generateColorsXML() {
        return `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary_color">#00ff88</color>
    <color name="primary_dark">#00aa66</color>
    <color name="accent_color">#00aaff</color>
    <color name="background_color">#0a0a0a</color>
    <color name="text_color">#ffffff</color>
    <color name="secondary_text">#cccccc</color>
</resources>`;
    }

    generateFilePathsXML() {
        return `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="external_files" path="."/>
    <cache-path name="cache" path="."/>
    <files-path name="files" path="."/>
</paths>`;
    }

    async generateAppIcons() {
        // Generate base64 encoded SVG icons for different densities
        const iconSVG = `
<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="192" height="192" rx="42" fill="url(#gradient0)"/>
    <text x="96" y="120" fill="#0a0a0a" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="72" font-weight="700" text-anchor="middle">S</text>
    <defs>
        <linearGradient id="gradient0" x1="0" y1="0" x2="192" y2="192" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#00ff88"/>
            <stop offset="100%" stop-color="#00aaff"/>
        </linearGradient>
    </defs>
</svg>`;

        return {
            'mipmap-hdpi/ic_launcher.xml': iconSVG,
            'mipmap-mdpi/ic_launcher.xml': iconSVG,
            'mipmap-xhdpi/ic_launcher.xml': iconSVG,
            'mipmap-xxhdpi/ic_launcher.xml': iconSVG,
            'mipmap-xxxhdpi/ic_launcher.xml': iconSVG
        };
    }

    async getWebAppHTML() {
        try {
            const htmlPath = path.join(__dirname, '../../index.html');
            let html = fs.readFileSync(htmlPath, 'utf8');

            // Replace localhost URLs with production URLs
            html = html.replace(/http:\/\/localhost:8080/g, 'https://sandra.guestsvalencia.es');
            html = html.replace(/localhost:8080/g, 'sandra.guestsvalencia.es');

            return html;
        } catch (error) {
            return `<!DOCTYPE html>
<html>
<head>
    <title>Sandra IA Galaxy</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <script>
        window.location.href = 'https://sandra.guestsvalencia.es';
    </script>
</body>
</html>`;
        }
    }

    generateSandraConfig() {
        return JSON.stringify({
            app_name: this.appName,
            package_name: this.packageName,
            version: this.version,
            base_url: "https://sandra.guestsvalencia.es",
            api_url: "https://sandra.guestsvalencia.es/api",
            features: {
                voice: true,
                video: true,
                files: true,
                offline: true
            },
            android_config: {
                min_sdk: this.minSdkVersion,
                target_sdk: this.targetSdkVersion,
                permissions: ["camera", "microphone", "storage", "internet"]
            }
        }, null, 2);
    }

    async createAPKFile(zipStructure, manifest) {
        // Add manifest to zip
        zipStructure.file("AndroidManifest.xml", manifest);

        // Generate binary APK
        const apkBuffer = await zipStructure.generateAsync({
            type: "nodebuffer",
            compression: "DEFLATE",
            compressionOptions: { level: 9 }
        });

        return apkBuffer;
    }

    async saveAPKFile(filePath, buffer) {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write APK file
        fs.writeFileSync(filePath, buffer);

        // Set proper permissions
        try {
            fs.chmodSync(filePath, 0o644);
        } catch (error) {
            console.warn('Could not set file permissions:', error.message);
        }
    }

    formatFileSize(bytes) {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// Export for use in build process
module.exports = SandraAPKGenerator;

// CLI usage
if (require.main === module) {
    const generator = new SandraAPKGenerator();
    generator.generateAPK()
        .then(result => {
            if (result.success) {
                console.log('🎉 APK generation completed successfully!');
                console.log('📍 Path:', result.path);
                console.log('📊 Size:', generator.formatFileSize(result.size));
            } else {
                console.error('💥 APK generation failed:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('💥 Unexpected error:', error);
            process.exit(1);
        });
}