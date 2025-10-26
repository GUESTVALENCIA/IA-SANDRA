// Sandra IA Galaxy PWA - Performance Testing with Lighthouse CI
// Automated performance monitoring and validation

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');

/**
 * Sandra IA Galaxy Performance Testing Suite
 * Validates PWA performance, accessibility, and best practices
 */
class SandraPerformanceTester {
  constructor() {
    this.targetUrl = process.env.TEST_URL || 'https://sandra.guestsvalencia.es';
    this.thresholds = {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 85,
      pwa: 95
    };
    this.results = {};
  }

  async runAudit() {
    console.log('🚀 Starting Sandra IA Galaxy Performance Audit...');
    console.log(`📊 Testing URL: ${this.targetUrl}`);

    let chrome;
    try {
      // Launch Chrome browser
      chrome = await chromeLauncher.launch({
        chromeFlags: [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--disable-web-security',
          '--disable-dev-shm-usage'
        ]
      });

      // Lighthouse configuration
      const options = {
        logLevel: 'info',
        output: 'json',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
        port: chrome.port,
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1
        }
      };

      // Run Lighthouse audit
      const runnerResult = await lighthouse(this.targetUrl, options);

      if (!runnerResult) {
        throw new Error('Lighthouse audit failed to produce results');
      }

      // Process results
      this.results = this.processResults(runnerResult.lhr);

      // Generate reports
      await this.generateReports(runnerResult);

      // Validate against thresholds
      const passed = this.validateThresholds();

      console.log('✅ Performance audit completed successfully');
      return { passed, results: this.results };

    } catch (error) {
      console.error('❌ Performance audit failed:', error.message);
      throw error;
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  }

  processResults(lhr) {
    const categories = lhr.categories;
    const audits = lhr.audits;

    return {
      scores: {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100),
        pwa: Math.round(categories.pwa.score * 100)
      },
      metrics: {
        firstContentfulPaint: audits['first-contentful-paint'].numericValue,
        largestContentfulPaint: audits['largest-contentful-paint'].numericValue,
        cumulativeLayoutShift: audits['cumulative-layout-shift'].numericValue,
        totalBlockingTime: audits['total-blocking-time'].numericValue,
        speedIndex: audits['speed-index'].numericValue,
        timeToInteractive: audits['interactive'].numericValue
      },
      opportunities: this.extractOpportunities(audits),
      diagnostics: this.extractDiagnostics(audits),
      pwa: {
        installable: audits['installable-manifest']?.score === 1,
        serviceWorker: audits['service-worker']?.score === 1,
        offline: audits['works-offline']?.score === 1,
        responsive: audits['viewport']?.score === 1
      }
    };
  }

  extractOpportunities(audits) {
    const opportunities = [];

    Object.keys(audits).forEach(key => {
      const audit = audits[key];
      if (audit.details?.type === 'opportunity' && audit.score !== null && audit.score < 1) {
        opportunities.push({
          id: key,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          savings: audit.details.overallSavingsMs || 0
        });
      }
    });

    return opportunities.sort((a, b) => b.savings - a.savings);
  }

  extractDiagnostics(audits) {
    const diagnostics = [];

    const diagnosticKeys = [
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'uses-text-compression',
      'uses-rel-preconnect',
      'font-display'
    ];

    diagnosticKeys.forEach(key => {
      if (audits[key] && audits[key].score !== null && audits[key].score < 1) {
        diagnostics.push({
          id: key,
          title: audits[key].title,
          description: audits[key].description,
          score: audits[key].score
        });
      }
    });

    return diagnostics;
  }

  validateThresholds() {
    const scores = this.results.scores;
    let passed = true;
    const failures = [];

    Object.keys(this.thresholds).forEach(category => {
      const score = scores[category.replace('bestPractices', 'best-practices')] || scores[category];
      const threshold = this.thresholds[category];

      if (score < threshold) {
        passed = false;
        failures.push(`${category}: ${score} < ${threshold}`);
      }
    });

    console.log('\n📊 Performance Score Summary:');
    console.log(`🚀 Performance: ${scores.performance}/100 (threshold: ${this.thresholds.performance})`);
    console.log(`♿ Accessibility: ${scores.accessibility}/100 (threshold: ${this.thresholds.accessibility})`);
    console.log(`✅ Best Practices: ${scores.bestPractices}/100 (threshold: ${this.thresholds.bestPractices})`);
    console.log(`🔍 SEO: ${scores.seo}/100 (threshold: ${this.thresholds.seo})`);
    console.log(`📱 PWA: ${scores.pwa}/100 (threshold: ${this.thresholds.pwa})`);

    console.log('\n⚡ Core Web Vitals:');
    console.log(`LCP: ${(this.results.metrics.largestContentfulPaint / 1000).toFixed(2)}s (target: <2.5s)`);
    console.log(`CLS: ${this.results.metrics.cumulativeLayoutShift.toFixed(3)} (target: <0.1)`);
    console.log(`TBT: ${this.results.metrics.totalBlockingTime.toFixed(0)}ms (target: <300ms)`);

    if (!passed) {
      console.log('\n❌ Performance thresholds not met:');
      failures.forEach(failure => console.log(`   ${failure}`));
    } else {
      console.log('\n✅ All performance thresholds passed!');
    }

    return passed;
  }

  async generateReports(runnerResult) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportsDir = 'test-results/performance';

    try {
      await fs.mkdir(reportsDir, { recursive: true });

      // Save JSON report
      const jsonPath = path.join(reportsDir, `lighthouse-${timestamp}.json`);
      await fs.writeFile(jsonPath, JSON.stringify(runnerResult.lhr, null, 2));

      // Save HTML report
      const htmlPath = path.join(reportsDir, `lighthouse-${timestamp}.html`);
      await fs.writeFile(htmlPath, runnerResult.report);

      // Save summary report
      const summaryPath = path.join(reportsDir, `summary-${timestamp}.json`);
      await fs.writeFile(summaryPath, JSON.stringify(this.results, null, 2));

      console.log(`📄 Reports saved:`);
      console.log(`   JSON: ${jsonPath}`);
      console.log(`   HTML: ${htmlPath}`);
      console.log(`   Summary: ${summaryPath}`);

    } catch (error) {
      console.warn('⚠️  Failed to save reports:', error.message);
    }
  }

  async generateCIReport() {
    const ciReport = {
      timestamp: new Date().toISOString(),
      url: this.targetUrl,
      passed: this.validateThresholds(),
      scores: this.results.scores,
      metrics: this.results.metrics,
      thresholds: this.thresholds,
      summary: {
        coreWebVitals: {
          lcp: this.results.metrics.largestContentfulPaint,
          cls: this.results.metrics.cumulativeLayoutShift,
          tbt: this.results.metrics.totalBlockingTime
        },
        pwaReady: this.results.pwa.installable && this.results.pwa.serviceWorker,
        recommendations: this.results.opportunities.slice(0, 5)
      }
    };

    const ciReportPath = 'performance-ci-report.json';
    await fs.writeFile(ciReportPath, JSON.stringify(ciReport, null, 2));

    console.log(`🤖 CI report generated: ${ciReportPath}`);
    return ciReport;
  }
}

// CLI execution
async function main() {
  const tester = new SandraPerformanceTester();

  try {
    const { passed, results } = await tester.runAudit();
    await tester.generateCIReport();

    if (passed) {
      console.log('\n🎉 Performance test PASSED - Sandra IA Galaxy meets all requirements!');
      process.exit(0);
    } else {
      console.log('\n💥 Performance test FAILED - Improvements needed');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Performance testing failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
module.exports = SandraPerformanceTester;

// Run if called directly
if (require.main === module) {
  main();
}