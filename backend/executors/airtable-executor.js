/**
 * AIRTABLE EXECUTOR - Gestión real de reservas y datos
 * Permite a Sandra hacer reservas reales y gestionar datos en Airtable
 */

class AirtableExecutor {
    constructor(config) {
        this.apiKey = config.key || process.env.AIRTABLE_API_KEY;
        this.baseId = config.baseId || process.env.AIRTABLE_BASE_ID || 'appGuestsValencia';
        this.apiBase = 'https://api.airtable.com/v0';
    }

    // ============================================================================
    // CREAR RESERVA REAL
    // ============================================================================
    async createReservation(params, context) {
        try {
            const {
                guestName = 'Cliente Auto',
                email = 'auto@guestsvalencia.com',
                checkIn = new Date().toISOString().split('T')[0],
                checkOut = new Date(Date.now() + 86400000).toISOString().split('T')[0],
                guests = 2,
                roomType = 'Standard',
                price = 89.00
            } = params;

            const reservationData = {
                records: [{
                    fields: {
                        'Guest Name': guestName,
                        'Email': email,
                        'Check In': checkIn,
                        'Check Out': checkOut,
                        'Guests': guests,
                        'Room Type': roomType,
                        'Price': price,
                        'Status': 'Confirmed',
                        'Created By': 'Sandra IA',
                        'Created At': new Date().toISOString(),
                        'Booking Source': 'Sandra AI Auto-Booking',
                        'Notes': `Reserva creada automáticamente por Sandra IA el ${new Date().toLocaleString('es-ES')}`
                    }
                }]
            };

            const response = await fetch(`${this.apiBase}/${this.baseId}/Reservations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reservationData)
            });

            if (!response.ok) {
                throw new Error(`Airtable API error: ${response.status}`);
            }

            const result = await response.json();
            const record = result.records[0];

            console.log('✅ Reserva creada en Airtable:', record.id);

            return {
                success: true,
                message: 'Reserva creada exitosamente en Airtable',
                data: {
                    bookingId: record.id,
                    guestName: record.fields['Guest Name'],
                    checkIn: record.fields['Check In'],
                    checkOut: record.fields['Check Out'],
                    price: record.fields['Price'],
                    status: record.fields['Status'],
                    createdAt: record.createdTime
                }
            };

        } catch (error) {
            console.error('❌ Error creando reserva:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // GENERAR REPORTE DE DATOS
    // ============================================================================
    async generateReport(params, context) {
        try {
            const {
                table = 'Reservations',
                startDate = null,
                endDate = null,
                status = null
            } = params;

            // Construir filtros
            let filterFormula = '';
            const filters = [];

            if (startDate) {
                filters.push(`IS_AFTER({Check In}, '${startDate}')`);
            }
            if (endDate) {
                filters.push(`IS_BEFORE({Check In}, '${endDate}')`);
            }
            if (status) {
                filters.push(`{Status} = '${status}'`);
            }

            if (filters.length > 0) {
                filterFormula = `AND(${filters.join(', ')})`;
            }

            // Construir URL con filtros
            const url = new URL(`${this.apiBase}/${this.baseId}/${table}`);
            if (filterFormula) {
                url.searchParams.set('filterByFormula', filterFormula);
            }
            url.searchParams.set('sort[0][field]', 'Created At');
            url.searchParams.set('sort[0][direction]', 'desc');

            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });

            if (!response.ok) {
                throw new Error(`Airtable API error: ${response.status}`);
            }

            const data = await response.json();
            const records = data.records;

            // Calcular métricas
            const metrics = this.calculateMetrics(records);

            console.log(`📊 Reporte generado: ${records.length} registros`);

            return {
                success: true,
                message: 'Reporte generado exitosamente',
                data: {
                    totalRecords: records.length,
                    reportDate: new Date().toISOString(),
                    metrics: metrics,
                    records: records.slice(0, 10), // Primeros 10 para preview
                    summary: this.generateSummary(metrics, records.length)
                }
            };

        } catch (error) {
            console.error('❌ Error generando reporte:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // ANALIZAR DATOS
    // ============================================================================
    async analyzeData(params, context) {
        try {
            const reportResult = await this.generateReport(params, context);

            if (!reportResult.success) {
                return reportResult;
            }

            const { metrics, totalRecords } = reportResult.data;

            // Análisis avanzado
            const analysis = {
                performance: {
                    totalBookings: totalRecords,
                    totalRevenue: metrics.totalRevenue,
                    averageBookingValue: metrics.averageBookingValue,
                    occupancyTrend: this.calculateOccupancyTrend(metrics)
                },
                insights: [
                    `Total de reservas analizadas: ${totalRecords}`,
                    `Ingresos totales: €${metrics.totalRevenue?.toFixed(2) || 0}`,
                    `Valor promedio por reserva: €${metrics.averageBookingValue?.toFixed(2) || 0}`,
                    `Tipo de habitación más popular: ${metrics.mostPopularRoomType || 'N/A'}`
                ],
                recommendations: this.generateRecommendations(metrics)
            };

            console.log('🔍 Análisis de datos completado');

            return {
                success: true,
                message: 'Análisis de datos completado',
                data: analysis
            };

        } catch (error) {
            console.error('❌ Error analizando datos:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // ACTUALIZAR ESTADO DE RESERVA
    // ============================================================================
    async updateBookingStatus(bookingId, newStatus) {
        try {
            const updateData = {
                fields: {
                    'Status': newStatus,
                    'Updated At': new Date().toISOString(),
                    'Updated By': 'Sandra IA'
                }
            };

            const response = await fetch(`${this.apiBase}/${this.baseId}/Reservations/${bookingId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error(`Airtable API error: ${response.status}`);
            }

            const result = await response.json();

            return {
                success: true,
                message: 'Estado de reserva actualizado',
                data: {
                    bookingId: result.id,
                    newStatus: result.fields['Status'],
                    updatedAt: result.fields['Updated At']
                }
            };

        } catch (error) {
            console.error('❌ Error actualizando reserva:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // UTILIDADES DE CÁLCULO
    // ============================================================================
    calculateMetrics(records) {
        if (!records || records.length === 0) {
            return {
                totalRevenue: 0,
                averageBookingValue: 0,
                totalGuests: 0,
                mostPopularRoomType: null
            };
        }

        const metrics = {
            totalRevenue: 0,
            totalGuests: 0,
            roomTypes: {},
            statusCounts: {}
        };

        records.forEach(record => {
            const fields = record.fields;

            // Revenue
            if (fields['Price']) {
                metrics.totalRevenue += parseFloat(fields['Price']);
            }

            // Guests
            if (fields['Guests']) {
                metrics.totalGuests += parseInt(fields['Guests']);
            }

            // Room types
            if (fields['Room Type']) {
                metrics.roomTypes[fields['Room Type']] =
                    (metrics.roomTypes[fields['Room Type']] || 0) + 1;
            }

            // Status
            if (fields['Status']) {
                metrics.statusCounts[fields['Status']] =
                    (metrics.statusCounts[fields['Status']] || 0) + 1;
            }
        });

        // Calcular promedios
        metrics.averageBookingValue = records.length > 0 ?
            metrics.totalRevenue / records.length : 0;

        // Tipo de habitación más popular
        metrics.mostPopularRoomType = Object.keys(metrics.roomTypes).reduce((a, b) =>
            metrics.roomTypes[a] > metrics.roomTypes[b] ? a : b, null);

        return metrics;
    }

    calculateOccupancyTrend(metrics) {
        // Simplificado - en producción haríamos análisis temporal real
        if (metrics.totalRevenue > 5000) return 'Alta';
        if (metrics.totalRevenue > 2000) return 'Media';
        return 'Baja';
    }

    generateRecommendations(metrics) {
        const recommendations = [];

        if (metrics.averageBookingValue < 100) {
            recommendations.push('Considerar estrategias de upselling para aumentar el valor promedio');
        }

        if (metrics.mostPopularRoomType) {
            recommendations.push(`Optimizar inventario para ${metrics.mostPopularRoomType} (tipo más demandado)`);
        }

        if (metrics.totalRevenue > 0) {
            recommendations.push('Continuar con las estrategias actuales de pricing');
        }

        return recommendations;
    }

    generateSummary(metrics, totalRecords) {
        return `Análisis de ${totalRecords} reservas generado automáticamente por Sandra IA. ` +
               `Ingresos totales: €${metrics.totalRevenue?.toFixed(2) || 0}. ` +
               `Valor promedio: €${metrics.averageBookingValue?.toFixed(2) || 0}.`;
    }

    // ============================================================================
    // VALIDACIONES
    // ============================================================================
    validateConfig() {
        if (!this.apiKey) {
            throw new Error('Airtable API key no configurada');
        }

        if (!this.baseId) {
            throw new Error('Airtable Base ID no configurado');
        }

        return true;
    }
}

module.exports = AirtableExecutor;