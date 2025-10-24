// ═══════════════════════════════════════════════════════
// SANDRA IA - SISTEMA DE MONITOREO DE SESGO Y ÉTICA
// Implementación del BiasMonitor para garantizar equidad
// ═══════════════════════════════════════════════════════

class SandraBiasMonitor {
  constructor() {
    this.protectedAttributes = [
      'nationality', 'language', 'age_group', 'gender',
      'economic_status', 'booking_history', 'device_type'
    ];

    this.fairnessThresholds = {
      demographic_parity: 0.1,     // 10% máximo de diferencia entre grupos
      equalized_odds: 0.08,        // 8% máximo para true/false positive rates
      price_disparity: 0.05,       // 5% máximo de diferencia en precios
      recommendation_diversity: 0.15 // 15% mínimo de diversidad en recomendaciones
    };

    this.monitoring_metrics = {
      daily_interactions: 0,
      bias_violations: [],
      fairness_scores: {},
      last_audit: null
    };

    console.log('🛡️ Sandra Bias Monitor inicializado');
  }

  /**
   * Evalúa equidad en precios dinámicos
   */
  evaluatePricingFairness(userId, priceOffered, userDemographics) {
    const results = {
      fair: true,
      violations: [],
      scores: {}
    };

    // Verificar discriminación por nacionalidad
    const nationalityBias = this.checkNationalityPricingBias(
      priceOffered,
      userDemographics.nationality
    );

    if (nationalityBias.violation) {
      results.fair = false;
      results.violations.push({
        type: 'nationality_pricing_discrimination',
        severity: 'HIGH',
        details: nationalityBias.details,
        timestamp: new Date().toISOString()
      });
    }

    // Verificar sesgo por historial de reservas
    const loyaltyBias = this.checkLoyaltyBias(
      priceOffered,
      userDemographics.booking_history
    );

    results.scores.nationality_fairness = nationalityBias.score;
    results.scores.loyalty_fairness = loyaltyBias.score;

    return results;
  }

  /**
   * Monitorea sesgo en recomendaciones turísticas
   */
  evaluateRecommendationFairness(userId, recommendations, userDemographics) {
    const results = {
      diversity_score: 0,
      cultural_bias: false,
      economic_bias: false,
      violations: []
    };

    // Evaluar diversidad cultural en recomendaciones
    const culturalDiversity = this.measureCulturalDiversity(recommendations);
    results.diversity_score = culturalDiversity.score;

    if (culturalDiversity.score < this.fairnessThresholds.recommendation_diversity) {
      results.cultural_bias = true;
      results.violations.push({
        type: 'low_cultural_diversity',
        severity: 'MEDIUM',
        score: culturalDiversity.score,
        threshold: this.fairnessThresholds.recommendation_diversity
      });
    }

    // Evaluar sesgo económico (solo lugares caros/baratos)
    const economicDiversity = this.measureEconomicDiversity(recommendations);
    if (economicDiversity.bias_detected) {
      results.economic_bias = true;
      results.violations.push({
        type: 'economic_recommendation_bias',
        severity: 'HIGH',
        details: economicDiversity.details
      });
    }

    return results;
  }

  /**
   * Verifica equidad en ejecución de código
   */
  evaluateCodeExecutionFairness(userId, codeRequest, userRole) {
    const results = {
      execution_allowed: true,
      security_score: 1.0,
      violations: []
    };

    // Verificar que no hay discriminación por rol/nivel de usuario
    const roleDiscrimination = this.checkRoleBasedExecution(userRole, codeRequest);
    if (roleDiscrimination.discrimination_detected) {
      results.violations.push({
        type: 'role_based_code_discrimination',
        severity: 'HIGH',
        details: roleDiscrimination.details
      });
    }

    // Evaluar seguridad del código a ejecutar
    const securityAssessment = this.assessCodeSecurity(codeRequest);
    results.security_score = securityAssessment.score;

    if (securityAssessment.score < 0.7) {
      results.execution_allowed = false;
      results.violations.push({
        type: 'security_risk_in_code_execution',
        severity: 'CRITICAL',
        score: securityAssessment.score
      });
    }

    return results;
  }

  /**
   * Auditoría periódica del sistema
   */
  async performSystemAudit() {
    console.log('🔍 Iniciando auditoría de sesgo Sandra IA...');

    const auditReport = {
      timestamp: new Date().toISOString(),
      overall_fairness_score: 0,
      modules_audited: [],
      violations_found: [],
      recommendations: []
    };

    // Auditar módulo de precios
    const pricingAudit = await this.auditPricingModule();
    auditReport.modules_audited.push(pricingAudit);

    // Auditar módulo de recomendaciones
    const recommendationAudit = await this.auditRecommendationModule();
    auditReport.modules_audited.push(recommendationAudit);

    // Auditar módulo de ejecución de código
    const codeAudit = await this.auditCodeExecutionModule();
    auditReport.modules_audited.push(codeAudit);

    // Calcular puntuación general
    auditReport.overall_fairness_score = this.calculateOverallFairnessScore(
      auditReport.modules_audited
    );

    // Generar recomendaciones
    auditReport.recommendations = this.generateFairnessRecommendations(auditReport);

    this.monitoring_metrics.last_audit = auditReport;
    console.log(`✅ Auditoría completada. Puntuación de equidad: ${auditReport.overall_fairness_score}/10`);

    return auditReport;
  }

  /**
   * Métodos auxiliares para cálculos específicos
   */
  checkNationalityPricingBias(price, nationality) {
    // Implementación simplificada - en producción conectar con base de datos histórica
    const averagePriceByNationality = this.getAveragePriceByNationality();
    const expectedPrice = averagePriceByNationality['baseline'] || price;
    const priceDifference = Math.abs(price - expectedPrice) / expectedPrice;

    return {
      violation: priceDifference > this.fairnessThresholds.price_disparity,
      score: Math.max(0, 1 - priceDifference),
      details: `Precio ofrecido: €${price}, Precio esperado: €${expectedPrice}`
    };
  }

  measureCulturalDiversity(recommendations) {
    // Medir diversidad de tipos de experiencias culturales
    const culturalCategories = new Set();
    recommendations.forEach(rec => {
      if (rec.category) culturalCategories.add(rec.category);
    });

    const diversityScore = culturalCategories.size / 10; // Normalizado a 10 categorías máx
    return {
      score: Math.min(1, diversityScore),
      categories_covered: Array.from(culturalCategories)
    };
  }

  assessCodeSecurity(codeRequest) {
    // Análisis básico de seguridad del código
    const dangerousPatterns = [
      /exec\(/gi, /eval\(/gi, /fs\.unlink/gi,
      /rm\s+-rf/gi, /process\.exit/gi, /require\(['"]child_process['"]/gi
    ];

    let riskScore = 0;
    dangerousPatterns.forEach(pattern => {
      if (pattern.test(codeRequest)) riskScore += 0.3;
    });

    return {
      score: Math.max(0, 1 - riskScore),
      patterns_detected: dangerousPatterns.filter(p => p.test(codeRequest)).length
    };
  }

  generateFairnessRecommendations(auditReport) {
    const recommendations = [];

    if (auditReport.overall_fairness_score < 7) {
      recommendations.push({
        priority: 'HIGH',
        action: 'Implementar revisión manual para decisiones de alto impacto',
        module: 'all'
      });
    }

    auditReport.modules_audited.forEach(module => {
      if (module.fairness_score < 6) {
        recommendations.push({
          priority: 'CRITICAL',
          action: `Revisar algoritmo del módulo ${module.name}`,
          module: module.name
        });
      }
    });

    return recommendations;
  }

  // Métodos auxiliares (implementación simplificada)
  getAveragePriceByNationality() { return { baseline: 100 }; }
  checkLoyaltyBias(price, history) { return { score: 0.9 }; }
  measureEconomicDiversity(recs) { return { bias_detected: false }; }
  checkRoleBasedExecution(role, code) { return { discrimination_detected: false }; }
  auditPricingModule() { return { name: 'pricing', fairness_score: 8.5 }; }
  auditRecommendationModule() { return { name: 'recommendations', fairness_score: 7.8 }; }
  auditCodeExecutionModule() { return { name: 'code_execution', fairness_score: 9.1 }; }
  calculateOverallFairnessScore(modules) {
    return modules.reduce((acc, m) => acc + m.fairness_score, 0) / modules.length;
  }
}

module.exports = SandraBiasMonitor;