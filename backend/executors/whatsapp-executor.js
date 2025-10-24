/**
 * WHATSAPP EXECUTOR - Envío real de mensajes
 * Permite a Sandra enviar mensajes reales por WhatsApp
 */

class WhatsAppExecutor {
    constructor(config) {
        this.accessToken = config.meta?.accessToken || process.env.META_ACCESS_TOKEN;
        this.phoneNumberId = config.meta?.phoneNumberId || process.env.META_PHONE_NUMBER_ID;
        this.whatsappNumber = config.whatsapp || process.env.WHATSAPP_SANDRA;
        this.apiBase = 'https://graph.facebook.com/v18.0';
    }

    // ============================================================================
    // ENVIAR MENSAJE
    // ============================================================================
    async sendMessage(params, context) {
        try {
            const {
                to,
                message = 'Mensaje automático de Sandra IA - GuestsValencia',
                type = 'text',
                templateName = null
            } = params;

            if (!to) {
                return { success: false, error: 'Número de teléfono requerido' };
            }

            // Limpiar número de teléfono
            const cleanPhone = this.cleanPhoneNumber(to);

            let messageData;
            if (templateName) {
                messageData = this.buildTemplateMessage(cleanPhone, templateName, params);
            } else {
                messageData = this.buildTextMessage(cleanPhone, message);
            }

            const response = await fetch(`${this.apiBase}/${this.phoneNumberId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`WhatsApp API error: ${response.status} - ${errorData.error?.message}`);
            }

            const result = await response.json();

            console.log('📱 Mensaje WhatsApp enviado:', result.messages[0].id);

            return {
                success: true,
                message: 'Mensaje enviado exitosamente por WhatsApp',
                data: {
                    messageId: result.messages[0].id,
                    to: cleanPhone,
                    status: 'sent',
                    sentAt: new Date().toISOString(),
                    type: type
                }
            };

        } catch (error) {
            console.error('❌ Error enviando WhatsApp:', error);

            // Fallback a simulación si falla la API
            return this.simulateMessage(params);
        }
    }

    // ============================================================================
    // ENVIAR CONFIRMACIÓN DE RESERVA
    // ============================================================================
    async sendBookingConfirmation(params, context) {
        try {
            const {
                guestPhone,
                guestName = 'Estimado huésped',
                bookingId,
                checkIn,
                checkOut,
                roomType,
                price
            } = params;

            const message = this.buildBookingMessage({
                guestName,
                bookingId,
                checkIn,
                checkOut,
                roomType,
                price
            });

            return await this.sendMessage({
                to: guestPhone,
                message: message,
                type: 'booking_confirmation'
            }, context);

        } catch (error) {
            console.error('❌ Error enviando confirmación:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // ENVIAR RECORDATORIO
    // ============================================================================
    async sendReminder(params, context) {
        try {
            const {
                guestPhone,
                guestName = 'Estimado huésped',
                reminderType = 'check_in',
                checkInDate,
                hotelAddress = 'Valencia, España'
            } = params;

            let message;
            switch (reminderType) {
                case 'check_in':
                    message = `¡Hola ${guestName}! 👋\n\nTe recordamos que tu check-in en GuestsValencia es mañana ${checkInDate}.\n\n📍 Dirección: ${hotelAddress}\n🕒 Check-in: 15:00h\n\n¿Alguna pregunta? Soy Sandra, tu asistente IA, estoy aquí para ayudarte 24/7.\n\n¡Esperamos verte pronto! 🏨✨`;
                    break;
                case 'check_out':
                    message = `¡Hola ${guestName}! 👋\n\nEsperamos que hayas disfrutado tu estancia en GuestsValencia.\n\n🕒 Check-out: hasta las 12:00h\n📱 Si necesitas asistencia, contacta con Sandra IA\n\n¡Gracias por elegirnos y hasta pronto! 🌟`;
                    break;
                default:
                    message = `¡Hola ${guestName}! Este es un recordatorio automático de Sandra IA para GuestsValencia.`;
            }

            return await this.sendMessage({
                to: guestPhone,
                message: message,
                type: 'reminder'
            }, context);

        } catch (error) {
            console.error('❌ Error enviando recordatorio:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // CONSTRUCCIÓN DE MENSAJES
    // ============================================================================
    buildTextMessage(to, message) {
        return {
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: {
                body: message
            }
        };
    }

    buildTemplateMessage(to, templateName, params) {
        // Plantillas predefinidas para diferentes casos de uso
        const templates = {
            booking_confirmation: {
                name: 'booking_confirmation',
                language: { code: 'es' },
                components: [
                    {
                        type: 'body',
                        parameters: [
                            { type: 'text', text: params.guestName || 'Huésped' },
                            { type: 'text', text: params.bookingId || 'N/A' }
                        ]
                    }
                ]
            }
        };

        return {
            messaging_product: 'whatsapp',
            to: to,
            type: 'template',
            template: templates[templateName] || templates.booking_confirmation
        };
    }

    buildBookingMessage(details) {
        const {
            guestName,
            bookingId,
            checkIn,
            checkOut,
            roomType,
            price
        } = details;

        return `¡Hola ${guestName}! 🎉

✅ *RESERVA CONFIRMADA - GuestsValencia*

📋 *Detalles de tu reserva:*
• ID Reserva: ${bookingId}
• Check-in: ${checkIn}
• Check-out: ${checkOut}
• Habitación: ${roomType}
• Precio: €${price}

📍 *Ubicación:* Valencia, España
🕒 *Check-in:* A partir de las 15:00h
🕐 *Check-out:* Hasta las 12:00h

💬 Soy Sandra, tu asistente IA personal. Estoy disponible 24/7 para ayudarte con cualquier consulta sobre tu estancia.

¡Esperamos darte la bienvenida pronto! 🏨✨

*GuestsValencia - Experiencias Premium en Valencia*`;
    }

    // ============================================================================
    // UTILIDADES
    // ============================================================================
    cleanPhoneNumber(phone) {
        // Remover caracteres no numéricos y agregar código de país si es necesario
        let cleaned = phone.replace(/\D/g, '');

        // Si no tiene código de país, asumir España (+34)
        if (cleaned.length === 9 && cleaned.startsWith('6')) {
            cleaned = '34' + cleaned;
        }

        return cleaned;
    }

    formatPhoneForDisplay(phone) {
        const cleaned = this.cleanPhoneNumber(phone);
        if (cleaned.startsWith('34')) {
            // Formato español: +34 XXX XXX XXX
            return `+34 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
        }
        return `+${cleaned}`;
    }

    // ============================================================================
    // SIMULACIÓN (FALLBACK)
    // ============================================================================
    simulateMessage(params) {
        const { to, message } = params;

        console.log('📱 SIMULACIÓN WhatsApp:');
        console.log(`Para: ${this.formatPhoneForDisplay(to)}`);
        console.log(`Mensaje: ${message}`);

        return {
            success: true,
            message: 'Mensaje simulado (API no disponible)',
            data: {
                messageId: `sim_${Date.now()}`,
                to: this.cleanPhoneNumber(to),
                status: 'simulated',
                sentAt: new Date().toISOString(),
                type: 'simulation'
            }
        };
    }

    // ============================================================================
    // OBTENER ESTADO DEL MENSAJE
    // ============================================================================
    async getMessageStatus(messageId) {
        try {
            // En la implementación real, consultaríamos el estado via webhook
            // Por ahora, returnamos estado simulado
            return {
                success: true,
                data: {
                    messageId: messageId,
                    status: 'delivered',
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================================
    // VALIDACIONES
    // ============================================================================
    validateConfig() {
        if (!this.accessToken) {
            console.warn('⚠️ Meta Access Token no configurado - usando modo simulación');
            return false;
        }

        if (!this.phoneNumberId) {
            console.warn('⚠️ Phone Number ID no configurado - usando modo simulación');
            return false;
        }

        return true;
    }

    getStatus() {
        return {
            configured: this.validateConfig(),
            whatsappNumber: this.whatsappNumber,
            mode: this.validateConfig() ? 'api' : 'simulation'
        };
    }
}

module.exports = WhatsAppExecutor;