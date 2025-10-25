#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════════════
// SANDRA IA MOBILE GALAXY - Download Testing Script
// Test all download functionality locally and production
// ═══════════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class SandraDownloadTester {
    constructor() {
        this.projectRoot = path.join(__dirname, '..');
        this.downloadsPath = path.join(this.projectRoot, 'downloads');
        this.baseURL = 'https://sandra.guestsvalencia.es';
        this.localURL = 'http://localhost:8080';
    }

    async testAllDownloads() {
        console.log('🧪 Testing Sandra IA download functionality...\n');

        const results = {
            localFiles: await this.testLocalFiles(),
            downloadMetadata: await this.testDownloadMetadata(),
            apkValidation: await this.testAPKValidation(),
            iosConfiguration: await this.testIOSConfiguration(),
            pwaManifest: await this.testPWAManifest()
        };

        this.generateTestReport(results);
        return results;
    }

    async testLocalFiles() {
        console.log('📁 Testing local download files...');

        const tests = {
            apkExists: fs.existsSync(path.join(this.downloadsPath, 'sandra-ia-galaxy.apk')),
            apkInAndroid: fs.existsSync(path.join(this.downloadsPath, 'android', 'sandra-ia-galaxy.apk')),
            metadataExists: fs.existsSync(path.join(this.downloadsPath, 'metadata', 'download-info.json')),
            iosInfoExists: fs.existsSync(path.join(this.downloadsPath, 'ios', 'testflight-info.json')),
            checksumsExist: fs.existsSync(path.join(this.downloadsPath, 'checksums', 'checksums.json')),
            downloadPageExists: fs.existsSync(path.join(this.downloadsPath, 'index.html'))
        };

        console.log('  📦 APK in root:', tests.apkExists ? '✅' : '❌');
        console.log('  📦 APK in android/', tests.apkInAndroid ? '✅' : '❌');
        console.log('  📋 Metadata:', tests.metadataExists ? '✅' : '❌');
        console.log('  🍎 iOS info:', tests.iosInfoExists ? '✅' : '❌');
        console.log('  🔐 Checksums:', tests.checksumsExist ? '✅' : '❌');
        console.log('  📄 Download page:', tests.downloadPageExists ? '✅' : '❌');

        return tests;
    }

    async testDownloadMetadata() {
        console.log('\n📋 Testing download metadata...');

        try {
            const metadataPath = path.join(this.downloadsPath, 'metadata', 'download-info.json');
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

            const tests = {
                hasVersion: !!metadata.version,
                hasAndroidInfo: !!metadata.platforms?.android,
                hasIOSInfo: !!metadata.platforms?.ios,
                hasPWAInfo: !!metadata.platforms?.pwa,
                hasInstallGuides: !!metadata.installation_guides,
                androidAvailable: metadata.platforms?.android?.available === true,
                iosAvailable: metadata.platforms?.ios?.available === true,
                pwaAvailable: metadata.platforms?.pwa?.available === true
            };

            console.log('  📊 Version info:', tests.hasVersion ? '✅' : '❌');
            console.log('  🤖 Android platform:', tests.hasAndroidInfo ? '✅' : '❌');
            console.log('  🍎 iOS platform:', tests.hasIOSInfo ? '✅' : '❌');
            console.log('  🌐 PWA platform:', tests.hasPWAInfo ? '✅' : '❌');
            console.log('  📖 Install guides:', tests.hasInstallGuides ? '✅' : '❌');
            console.log('  🤖 Android available:', tests.androidAvailable ? '✅' : '❌');
            console.log('  🍎 iOS available:', tests.iosAvailable ? '✅' : '❌');
            console.log('  🌐 PWA available:', tests.pwaAvailable ? '✅' : '❌');

            return { success: true, ...tests, metadata };

        } catch (error) {
            console.log('  ❌ Error reading metadata:', error.message);
            return { success: false, error: error.message };
        }
    }

    async testAPKValidation() {
        console.log('\n📦 Testing APK validation...');

        try {
            const apkPath = path.join(this.downloadsPath, 'android', 'sandra-ia-galaxy.apk');

            if (!fs.existsSync(apkPath)) {
                console.log('  ❌ APK file not found');
                return { success: false, error: 'APK file not found' };
            }

            const stats = fs.statSync(apkPath);
            const checksumsPath = path.join(this.downloadsPath, 'checksums', 'checksums.json');

            let checksums = {};
            if (fs.existsSync(checksumsPath)) {
                checksums = JSON.parse(fs.readFileSync(checksumsPath, 'utf8'));
            }

            const tests = {
                fileExists: true,
                fileSize: stats.size,
                fileSizeFormatted: this.formatFileSize(stats.size),
                hasChecksums: !!checksums['sandra-ia-galaxy.apk'],
                isValidSize: stats.size > 1000 && stats.size < 100 * 1024 * 1024 // Between 1KB and 100MB
            };

            console.log('  📁 File exists:', tests.fileExists ? '✅' : '❌');
            console.log('  📊 File size:', tests.fileSizeFormatted);
            console.log('  📏 Valid size:', tests.isValidSize ? '✅' : '❌');
            console.log('  🔐 Has checksums:', tests.hasChecksums ? '✅' : '❌');

            return { success: true, ...tests };

        } catch (error) {
            console.log('  ❌ Error validating APK:', error.message);
            return { success: false, error: error.message };
        }
    }

    async testIOSConfiguration() {
        console.log('\n🍎 Testing iOS configuration...');

        try {
            const iosInfoPath = path.join(this.downloadsPath, 'ios', 'testflight-info.json');

            if (!fs.existsSync(iosInfoPath)) {
                console.log('  ❌ iOS info file not found');
                return { success: false, error: 'iOS info file not found' };
            }

            const iosInfo = JSON.parse(fs.readFileSync(iosInfoPath, 'utf8'));

            const tests = {
                hasTestFlightLink: !!iosInfo.testFlightLink,
                hasBundleId: !!iosInfo.bundleId,
                hasAppStoreUrl: !!iosInfo.appStoreUrl,
                hasMetadata: !!iosInfo.metadata,
                validTestFlightLink: iosInfo.testFlightLink?.includes('testflight.apple.com'),
                validBundleId: iosInfo.bundleId?.includes('com.guestsvalencia.sandra')
            };

            console.log('  🔗 TestFlight link:', tests.hasTestFlightLink ? '✅' : '❌');
            console.log('  📱 Bundle ID:', tests.hasBundleId ? '✅' : '❌');
            console.log('  🏪 App Store URL:', tests.hasAppStoreUrl ? '✅' : '❌');
            console.log('  📋 Metadata:', tests.hasMetadata ? '✅' : '❌');
            console.log('  ✅ Valid TestFlight:', tests.validTestFlightLink ? '✅' : '❌');
            console.log('  ✅ Valid Bundle ID:', tests.validBundleId ? '✅' : '❌');

            return { success: true, ...tests, iosInfo };

        } catch (error) {
            console.log('  ❌ Error testing iOS config:', error.message);
            return { success: false, error: error.message };
        }
    }

    async testPWAManifest() {
        console.log('\n🌐 Testing PWA manifest...');

        try {
            const manifestPath = path.join(this.projectRoot, 'manifest.json');

            if (!fs.existsSync(manifestPath)) {
                console.log('  ❌ Manifest file not found');
                return { success: false, error: 'Manifest file not found' };
            }

            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

            const tests = {
                hasName: !!manifest.name,
                hasShortName: !!manifest.short_name,
                hasStartUrl: !!manifest.start_url,
                hasIcons: Array.isArray(manifest.icons) && manifest.icons.length > 0,
                hasDisplay: !!manifest.display,
                hasThemeColor: !!manifest.theme_color,
                productionUrls: !manifest.start_url?.includes('localhost'),
                validDisplay: manifest.display === 'standalone',
                hasSandraConfig: !!manifest.sandra_config
            };

            console.log('  📛 App name:', tests.hasName ? '✅' : '❌');
            console.log('  📱 Short name:', tests.hasShortName ? '✅' : '❌');
            console.log('  🏠 Start URL:', tests.hasStartUrl ? '✅' : '❌');
            console.log('  🎨 Icons:', tests.hasIcons ? '✅' : '❌');
            console.log('  📱 Display mode:', tests.hasDisplay ? '✅' : '❌');
            console.log('  🎨 Theme color:', tests.hasThemeColor ? '✅' : '❌');
            console.log('  🌐 Production URLs:', tests.productionUrls ? '✅' : '❌');
            console.log('  📱 Standalone mode:', tests.validDisplay ? '✅' : '❌');
            console.log('  ⚙️ Sandra config:', tests.hasSandraConfig ? '✅' : '❌');

            return { success: true, ...tests, manifest };

        } catch (error) {
            console.log('  ❌ Error testing PWA manifest:', error.message);
            return { success: false, error: error.message };
        }
    }

    generateTestReport(results) {
        console.log('\n📊 DOWNLOAD TESTING REPORT');
        console.log('═══════════════════════════════════════\n');

        // Calculate overall score
        let totalTests = 0;
        let passedTests = 0;

        Object.entries(results).forEach(([category, result]) => {
            if (result && typeof result === 'object') {
                Object.entries(result).forEach(([test, value]) => {
                    if (typeof value === 'boolean') {
                        totalTests++;
                        if (value) passedTests++;
                    }
                });
            }
        });

        const score = Math.round((passedTests / totalTests) * 100);
        const status = score >= 90 ? '✅ EXCELLENT' :
                      score >= 80 ? '⚠️ GOOD' :
                      score >= 70 ? '⚠️ FAIR' : '❌ NEEDS WORK';

        console.log(`📈 Overall Score: ${score}% (${passedTests}/${totalTests}) - ${status}\n`);

        // Category breakdown
        console.log('📋 Category Breakdown:');
        console.log('  📁 Local Files:', this.getCategoryStatus(results.localFiles));
        console.log('  📋 Download Metadata:', this.getCategoryStatus(results.downloadMetadata));
        console.log('  📦 APK Validation:', this.getCategoryStatus(results.apkValidation));
        console.log('  🍎 iOS Configuration:', this.getCategoryStatus(results.iosConfiguration));
        console.log('  🌐 PWA Manifest:', this.getCategoryStatus(results.pwaManifest));

        console.log('\n🎯 DOWNLOAD READINESS:');
        console.log('  🤖 Android APK:', this.getDownloadReadiness('android', results));
        console.log('  🍎 iOS TestFlight:', this.getDownloadReadiness('ios', results));
        console.log('  🌐 PWA Installation:', this.getDownloadReadiness('pwa', results));

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        const recommendations = this.generateRecommendations(results);
        recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. ${rec}`);
        });
    }

    getCategoryStatus(result) {
        if (!result) return '❌ Failed';
        if (!result.success && result.success !== undefined) return '❌ Failed';

        const tests = Object.entries(result).filter(([key, value]) => typeof value === 'boolean');
        const passed = tests.filter(([key, value]) => value).length;
        const total = tests.length;

        if (total === 0) return '❓ No tests';

        const percentage = Math.round((passed / total) * 100);
        return percentage >= 90 ? '✅ Pass' :
               percentage >= 70 ? '⚠️ Warning' : '❌ Fail';
    }

    getDownloadReadiness(platform, results) {
        switch (platform) {
            case 'android':
                return (results.localFiles?.apkExists &&
                        results.apkValidation?.isValidSize &&
                        results.downloadMetadata?.androidAvailable) ?
                        '✅ Ready for production' : '⚠️ Issues detected';

            case 'ios':
                return (results.iosConfiguration?.validTestFlightLink &&
                        results.downloadMetadata?.iosAvailable) ?
                        '✅ Ready for TestFlight' : '⚠️ Configuration needed';

            case 'pwa':
                return (results.pwaManifest?.productionUrls &&
                        results.pwaManifest?.validDisplay) ?
                        '✅ Ready for installation' : '⚠️ Configuration needed';

            default:
                return '❓ Unknown';
        }
    }

    generateRecommendations(results) {
        const recommendations = [];

        if (!results.localFiles?.apkExists) {
            recommendations.push('Generate APK file using: npm run mobile:android');
        }

        if (!results.downloadMetadata?.success) {
            recommendations.push('Regenerate download metadata using: npm run build:downloads');
        }

        if (!results.iosConfiguration?.validTestFlightLink) {
            recommendations.push('Configure proper TestFlight beta link for iOS distribution');
        }

        if (!results.pwaManifest?.productionUrls) {
            recommendations.push('Update manifest.json URLs to production domains');
        }

        if (!results.apkValidation?.hasChecksums) {
            recommendations.push('Generate file checksums for security validation');
        }

        if (recommendations.length === 0) {
            recommendations.push('All download functionality appears to be working correctly! 🎉');
        }

        return recommendations;
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
    const tester = new SandraDownloadTester();
    tester.testAllDownloads()
        .then(results => {
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Testing failed:', error);
            process.exit(1);
        });
}

module.exports = SandraDownloadTester;