# ADR-001: Usar Netlify Functions como Backend Único

**Estado**: Aceptado  
**Fecha**: 2025-01-27  
**Decisor**: Clayton (CEO)

## Contexto

Necesitábamos elegir una arquitectura de backend para Sandra DevConsole. Las opciones eran:
- Express Server local ($50-100/mes en hosting)
- WebSocket MCP Bridge (no soportado en Netlify free tier)
- Netlify Functions (serverless, $19/mes Netlify Pro)

## Decisión

**Usar Netlify Functions como backend único para la aplicación web.**

## Razones

1. **Cost-Effective**: $19/mes vs $50-100/mes
2. **Auto-scaling**: Escala automáticamente sin configuración
3. **Ya Deployado**: Las functions ya existen y funcionan
4. **CDN Global**: Netlify CDN para assets estáticos
5. **CI/CD Integrado**: Deploy automático con GitHub

## Alternativas Rechazadas

### Express Server
- ❌ Requiere servidor dedicado ($50-100/mes)
- ❌ Gestión de escalado manual
- ❌ Mantenimiento de infraestructura

### WebSocket MCP Bridge
- ❌ No soportado en Netlify free tier
- ❌ Requiere servidor persistente
- ❌ No necesario para chat (HTTP REST suficiente)

## Consecuencias

### Positivas
- ✅ Costo reducido
- ✅ Escalado automático
- ✅ Sin gestión de servidores
- ✅ Deployment simplificado

### Negativas
- ⚠️ Cold starts (500ms primera llamada)
- ⚠️ Timeout de 26s máximo (suficiente para chat)
- ⚠️ Sin WebSocket persistente (no necesario)

## Trade-offs

**Cold Starts**: Aceptable para chat. Se puede mitigar con warmup periódico.

**Timeout**: 26s es suficiente para respuestas de GPT-4o (típicamente 2-5s).

**WebSocket**: No es necesario para chat. HTTP REST es suficiente.

## Notas

- Las Netlify Functions ya están implementadas y funcionando
- Frontend ya tiene soporte para Netlify Functions
- API Client Wrapper detecta automáticamente el entorno

---

**Actualizado**: 2025-01-27 - Decisión implementada y funcionando

