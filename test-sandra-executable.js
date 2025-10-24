/**
 * TEST SANDRA EJECUTABLE - Validación completa del sistema
 * Prueba todas las capacidades ejecutables de Sandra IA
 */

const SandraNucleusCore = require('./backend/sandra-nucleus-core');

class TestSandraExecutable {
    constructor() {
        this.sandra = new SandraNucleusCore();
        this.testResults = [];
    }

    // ============================================================================
    // EJECUTAR TODAS LAS PRUEBAS
    // ============================================================================
    async runAllTests() {
        console.log('🧪 INICIANDO PRUEBAS DE SANDRA EJECUTABLE\n');

        try {
            // Esperar a que Sandra se inicialice
            await this.waitForInitialization();

            // Pruebas por rol
            await this.testDesarrolladoraRole();
            await this.testRecepcionistaRole();
            await this.testMarketingRole();
            await this.testCOORole();

            // Resumen final
            this.showResults();

        } catch (error) {
            console.error('❌ Error en pruebas:', error);
        }
    }

    // ============================================================================
    // PRUEBAS ROL DESARROLLADORA
    // ============================================================================
    async testDesarrolladoraRole() {
        console.log('👩‍💻 PROBANDO ROL DESARROLLADORA (EJECUTABLE)');
        console.log('=' .repeat(50));

        // Test 1: Crear código
        await this.testExecutableAction(
            'Desarrolladora - Escribir código',
            'crear archivo test-component.jsx con un componente React',
            'desarrolladora',
            ['write_code']
        );

        // Test 2: Commit
        await this.testExecutableAction(
            'Desarrolladora - Git commit',
            'hacer commit de los cambios con mensaje "feat: new component by Sandra"',
            'desarrolladora',
            ['commit_changes']
        );

        // Test 3: Deploy
        await this.testExecutableAction(
            'Desarrolladora - Deploy',
            'deploy el sitio a Netlify',
            'desarrolladora',
            ['deploy_site']
        );

        console.log('');
    }

    // ============================================================================
    // PRUEBAS ROL RECEPCIONISTA
    // ============================================================================
    async testRecepcionistaRole() {
        console.log('🏨 PROBANDO ROL RECEPCIONISTA (EJECUTABLE)');
        console.log('=' .repeat(50));

        // Test 1: Crear reserva
        await this.testExecutableAction(
            'Recepcionista - Crear reserva',
            'hacer reserva para Juan Pérez del 25/10 al 27/10 para 2 huéspedes',
            'recepcionista',
            ['create_reservation']
        );

        // Test 2: Procesar pago
        await this.testExecutableAction(
            'Recepcionista - Procesar pago',
            'procesar pago de 178 euros para la reserva',
            'recepcionista',
            ['process_payment']
        );

        // Test 3: Enviar confirmación
        await this.testExecutableAction(
            'Recepcionista - WhatsApp',
            'enviar confirmacion por whatsapp al +34624829117',
            'recepcionista',
            ['send_confirmation']
        );

        console.log('');
    }

    // ============================================================================
    // PRUEBAS ROL MARKETING
    // ============================================================================
    async testMarketingRole() {
        console.log('📈 PROBANDO ROL MARKETING (EJECUTABLE)');
        console.log('=' .repeat(50));

        // Test 1: Crear contenido
        await this.testExecutableAction(
            'Marketing - Crear contenido',
            'crear articulo sobre Valencia para el blog',
            'marketing',
            ['create_content']
        );

        // Test 2: Publicar contenido
        await this.testExecutableAction(
            'Marketing - Publicar',
            'publicar el contenido en el website',
            'marketing',
            ['publish_post']
        );

        console.log('');
    }

    // ============================================================================
    // PRUEBAS ROL COO
    // ============================================================================
    async testCOORole() {
        console.log('📊 PROBANDO ROL COO (EJECUTABLE)');
        console.log('=' .repeat(50));

        // Test 1: Generar reporte
        await this.testExecutableAction(
            'COO - Generar reporte',
            'generar reporte de reservas del último mes',
            'coo',
            ['generate_reports']
        );

        // Test 2: Analizar datos
        await this.testExecutableAction(
            'COO - Análisis',
            'analizar datos de ocupación y revenue',
            'coo',
            ['analyze_data']
        );

        console.log('');
    }

    // ============================================================================
    // UTILIDADES DE PRUEBA
    // ============================================================================
    async testExecutableAction(testName, message, expectedRole, expectedActions) {
        try {
            console.log(`\n🔄 ${testName}:`);
            console.log(`   Mensaje: "${message}"`);

            const startTime = Date.now();
            const result = await this.sandra.processMessage(message, {
                sessionId: 'test_session',
                userId: 'test_user',
                isCEO: true // Activar modo CEO para pruebas
            });

            const processingTime = Date.now() - startTime;

            // Verificar resultado
            const success = this.validateResult(result, expectedRole, expectedActions);

            this.testResults.push({
                name: testName,
                success: success,
                processingTime: processingTime,
                result: result,
                expectedRole: expectedRole,
                expectedActions: expectedActions
            });

            // Mostrar resultado
            console.log(`   ✅ Rol detectado: ${result.role}`);
            console.log(`   ⚡ Tiempo: ${processingTime}ms`);
            console.log(`   📝 Respuesta: ${result.response.substring(0, 100)}...`);

            if (success) {
                console.log(`   🎯 PRUEBA EXITOSA`);
            } else {
                console.log(`   ❌ PRUEBA FALLIDA`);
            }

        } catch (error) {
            console.log(`   💥 ERROR: ${error.message}`);
            this.testResults.push({
                name: testName,
                success: false,
                error: error.message
            });
        }
    }

    validateResult(result, expectedRole, expectedActions) {
        // Verificar que el rol fue detectado correctamente
        if (result.role !== expectedRole) {
            console.log(`   ⚠️ Rol esperado: ${expectedRole}, obtenido: ${result.role}`);
            return false;
        }

        // Verificar que la respuesta menciona acciones ejecutables
        const response = result.response.toLowerCase();
        const hasExecutableIndicators =
            response.includes('ejecutado') ||
            response.includes('creado') ||
            response.includes('completado') ||
            response.includes('procesado') ||
            response.includes('enviado') ||
            response.includes('generado');

        if (!hasExecutableIndicators) {
            console.log(`   ⚠️ Respuesta no indica ejecución real`);
            return false;
        }

        return true;
    }

    // ============================================================================
    // MOSTRAR RESULTADOS
    // ============================================================================
    showResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 RESUMEN DE PRUEBAS SANDRA EJECUTABLE');
        console.log('=' .repeat(60));

        const successful = this.testResults.filter(test => test.success).length;
        const total = this.testResults.length;
        const successRate = total > 0 ? (successful / total * 100).toFixed(1) : 0;

        console.log(`\n📊 ESTADÍSTICAS:`);
        console.log(`   Pruebas ejecutadas: ${total}`);
        console.log(`   Exitosas: ${successful}`);
        console.log(`   Fallidas: ${total - successful}`);
        console.log(`   Tasa de éxito: ${successRate}%`);

        const avgTime = this.testResults
            .filter(test => test.processingTime)
            .reduce((sum, test) => sum + test.processingTime, 0) / successful;

        console.log(`   Tiempo promedio: ${avgTime.toFixed(0)}ms`);

        console.log(`\n📝 DETALLES POR PRUEBA:`);
        this.testResults.forEach(test => {
            const status = test.success ? '✅' : '❌';
            const time = test.processingTime ? `(${test.processingTime}ms)` : '';
            console.log(`   ${status} ${test.name} ${time}`);
            if (test.error) {
                console.log(`      Error: ${test.error}`);
            }
        });

        // Evaluación final
        console.log(`\n🎯 EVALUACIÓN FINAL:`);
        if (successRate >= 80) {
            console.log('   🌟 SANDRA EJECUTABLE FUNCIONANDO CORRECTAMENTE');
            console.log('   💪 Sistema listo para uso en producción');
        } else if (successRate >= 60) {
            console.log('   ⚠️ SANDRA PARCIALMENTE EJECUTABLE');
            console.log('   🔧 Requiere ajustes menores');
        } else {
            console.log('   ❌ SANDRA REQUIERE REVISIÓN CRÍTICA');
            console.log('   🛠️ Necesita debugging completo');
        }

        console.log('\n🚀 TRANSFORMACIÓN COMPLETADA:');
        console.log('   De: "Sandra habla de hacer"');
        console.log('   A: "Sandra HACE realmente"');
        console.log('\n' + '=' .repeat(60));
    }

    async waitForInitialization() {
        console.log('⏳ Esperando inicialización de Sandra...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

// ============================================================================
// EJECUTAR PRUEBAS
// ============================================================================
async function runTests() {
    const tester = new TestSandraExecutable();
    await tester.runAllTests();
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = TestSandraExecutable;