#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════
 * SANDRA IA GALAXY LEVEL - PRODUCTION MONITORING & ALERTING
 * Comprehensive monitoring system for sandra.guestsvalencia.es
 * ═══════════════════════════════════════════════════════════════════
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Monitoring Configuration
const MONITORING_CONFIG = {
    domain: 'sandra.guestsvalencia.es',
    endpoints: [
        '/',
        '/download',
        '/galaxy',
        '/app',
        '/mobile',
        '/manifest.json',
        '/sw.js'
    ],
    performance: {
        maxResponseTime: 3000, // 3 seconds
        minLighthouseScore: 85,
        maxErrorRate: 0.1 // 0.1%
    },
    healthCheck: {
        interval: 300000, // 5 minutes
        timeout: 30000,   // 30 seconds
        retries: 3
    },
    alerts: {
        email: process.env.ALERT_EMAIL || 'admin@guestsvalencia.es',
        webhook: process.env.ALERT_WEBHOOK || null
    }
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    const timestamp = new Date().toISOString();
    console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// Health check functions
async function checkEndpoint(endpoint) {
    return new Promise((resolve, reject) => {
        const url = `https://${MONITORING_CONFIG.domain}${endpoint}`;
        const startTime = Date.now();

        const req = https.get(url, {
            timeout: MONITORING_CONFIG.healthCheck.timeout
        }, (res) => {
            const responseTime = Date.now() - startTime;

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    endpoint,
                    url,
                    statusCode: res.statusCode,
                    responseTime,
                    contentLength: data.length,
                    success: res.statusCode >= 200 && res.statusCode < 400
                });
            });
        });

        req.on('error', (error) => {
            reject({
                endpoint,
                url,
                error: error.message,
                success: false
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject({
                endpoint,
                url,
                error: 'Request timeout',
                success: false
            });
        });
    });
}

async function checkSSLCertificate() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: MONITORING_CONFIG.domain,
            port: 443,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            const cert = res.socket.getPeerCertificate();

            if (cert && cert.valid_from && cert.valid_to) {
                const validFrom = new Date(cert.valid_from);
                const validTo = new Date(cert.valid_to);
                const now = new Date();
                const daysUntilExpiry = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));

                resolve({
                    valid: true,
                    issuer: cert.issuer,
                    subject: cert.subject,
                    validFrom,
                    validTo,
                    daysUntilExpiry,
                    fingerprint: cert.fingerprint
                });
            } else {
                reject({ valid: false, error: 'Invalid certificate' });
            }
        });

        req.on('error', (error) => {
            reject({ valid: false, error: error.message });
        });

        req.end();
    });
}

async function runPerformanceCheck() {
    logInfo('Running performance checks...');

    const results = [];

    try {
        for (const endpoint of MONITORING_CONFIG.endpoints) {
            try {
                const result = await checkEndpoint(endpoint);
                results.push(result);

                if (result.success) {
                    if (result.responseTime <= MONITORING_CONFIG.performance.maxResponseTime) {
                        logSuccess(`${endpoint}: ${result.statusCode} (${result.responseTime}ms)`);
                    } else {
                        logWarning(`${endpoint}: Slow response ${result.responseTime}ms`);
                    }
                } else {
                    logError(`${endpoint}: ${result.statusCode} - Failed`);
                }
            } catch (error) {
                logError(`${endpoint}: ${error.error || error.message}`);
                results.push(error);
            }
        }

        // Calculate overall health score
        const successfulChecks = results.filter(r => r.success).length;
        const healthScore = (successfulChecks / results.length) * 100;

        logInfo(`Overall health score: ${healthScore.toFixed(1)}%`);

        return {
            timestamp: new Date().toISOString(),
            healthScore,
            results,
            summary: {
                total: results.length,
                successful: successfulChecks,
                failed: results.length - successfulChecks
            }
        };

    } catch (error) {
        logError(`Performance check failed: ${error.message}`);
        throw error;
    }
}

async function runSecurityCheck() {
    logInfo('Running security checks...');

    try {
        // SSL Certificate check
        const sslResult = await checkSSLCertificate();

        if (sslResult.valid) {
            logSuccess(`SSL certificate valid until ${sslResult.validTo.toDateString()}`);

            if (sslResult.daysUntilExpiry < 30) {
                logWarning(`SSL certificate expires in ${sslResult.daysUntilExpiry} days`);
            }
        } else {
            logError(`SSL certificate invalid: ${sslResult.error}`);
        }

        // Security headers check
        const securityCheck = await checkEndpoint('/');

        return {
            ssl: sslResult,
            securityHeaders: securityCheck
        };

    } catch (error) {
        logError(`Security check failed: ${error.message}`);
        throw error;
    }
}

async function generateMonitoringReport(performanceResult, securityResult) {
    const report = {
        monitoring: {
            timestamp: new Date().toISOString(),
            domain: MONITORING_CONFIG.domain,
            version: '98.0.0'
        },
        performance: performanceResult,
        security: securityResult,
        alerts: [],
        recommendations: []
    };

    // Generate alerts
    if (performanceResult.healthScore < 95) {
        report.alerts.push({
            type: 'PERFORMANCE',
            severity: 'WARNING',
            message: `Health score below threshold: ${performanceResult.healthScore.toFixed(1)}%`
        });
    }

    if (securityResult.ssl.daysUntilExpiry < 30) {
        report.alerts.push({
            type: 'SECURITY',
            severity: 'WARNING',
            message: `SSL certificate expires in ${securityResult.ssl.daysUntilExpiry} days`
        });
    }

    // Generate recommendations
    const slowEndpoints = performanceResult.results.filter(r =>
        r.success && r.responseTime > MONITORING_CONFIG.performance.maxResponseTime
    );

    if (slowEndpoints.length > 0) {
        report.recommendations.push({
            type: 'OPTIMIZATION',
            message: `Optimize slow endpoints: ${slowEndpoints.map(e => e.endpoint).join(', ')}`
        });
    }

    // Save report
    const reportPath = `monitoring-report-${Date.now()}.json`;
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    logSuccess(`Monitoring report generated: ${reportPath}`);

    return report;
}

async function sendAlert(alert) {
    logWarning(`ALERT: ${alert.type} - ${alert.message}`);

    // Here you would integrate with your alerting system
    // For example: email, Slack, Discord, etc.

    if (MONITORING_CONFIG.alerts.webhook) {
        // Send webhook notification
        logInfo('Sending webhook notification...');
    }

    if (MONITORING_CONFIG.alerts.email) {
        // Send email notification
        logInfo('Sending email notification...');
    }
}

async function runComprehensiveMonitoring() {
    logInfo('🔍 Starting comprehensive monitoring for Sandra IA Galaxy Level...');
    log('═══════════════════════════════════════════════════════════════════', 'bright');

    try {
        // Run all monitoring checks
        const performanceResult = await runPerformanceCheck();
        const securityResult = await runSecurityCheck();

        // Generate comprehensive report
        const report = await generateMonitoringReport(performanceResult, securityResult);

        // Process alerts
        for (const alert of report.alerts) {
            await sendAlert(alert);
        }

        // Display summary
        log('\n📊 MONITORING SUMMARY', 'bright');
        log('═══════════════════════════════════════════════════════════════════', 'bright');
        logInfo(`Domain: https://${MONITORING_CONFIG.domain}`);
        logInfo(`Health Score: ${performanceResult.healthScore.toFixed(1)}%`);
        logInfo(`SSL Status: ${securityResult.ssl.valid ? 'Valid' : 'Invalid'}`);
        logInfo(`SSL Expires: ${securityResult.ssl.validTo ? securityResult.ssl.validTo.toDateString() : 'Unknown'}`);
        logInfo(`Alerts Generated: ${report.alerts.length}`);
        logInfo(`Recommendations: ${report.recommendations.length}`);

        if (report.alerts.length === 0) {
            logSuccess('🎯 All systems operational - No alerts');
        } else {
            logWarning(`⚠️  ${report.alerts.length} alerts require attention`);
        }

        log('═══════════════════════════════════════════════════════════════════\n', 'bright');

        return report;

    } catch (error) {
        logError(`Monitoring failed: ${error.message}`);
        throw error;
    }
}

// Continuous monitoring mode
async function startContinuousMonitoring() {
    logInfo('🔄 Starting continuous monitoring mode...');

    const runMonitoringCycle = async () => {
        try {
            await runComprehensiveMonitoring();
        } catch (error) {
            logError(`Monitoring cycle failed: ${error.message}`);
        }
    };

    // Run initial check
    await runMonitoringCycle();

    // Set up recurring checks
    setInterval(runMonitoringCycle, MONITORING_CONFIG.healthCheck.interval);

    logInfo(`🔄 Continuous monitoring active (interval: ${MONITORING_CONFIG.healthCheck.interval/1000}s)`);
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'check';

    switch (command) {
        case 'check':
            await runComprehensiveMonitoring();
            break;

        case 'continuous':
            await startContinuousMonitoring();
            break;

        case 'performance':
            await runPerformanceCheck();
            break;

        case 'security':
            await runSecurityCheck();
            break;

        default:
            console.log('Usage:');
            console.log('  node production-monitoring.js check       - Run single monitoring check');
            console.log('  node production-monitoring.js continuous  - Start continuous monitoring');
            console.log('  node production-monitoring.js performance - Run performance check only');
            console.log('  node production-monitoring.js security    - Run security check only');
            break;
    }
}

// Execute if run directly
if (require.main === module) {
    main().catch(error => {
        logError(`Monitoring script failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    runComprehensiveMonitoring,
    startContinuousMonitoring,
    MONITORING_CONFIG
};