# ADR-002: Deprecar WebSocket MCP Bridge

**Estado**: Aceptado  
**Fecha**: 2025-01-27  
**Decisor**: Clayton (CEO)

## Contexto

El código original incluía un WebSocket MCP Bridge en `sandra-mcp-bridge.js` que:
- Intentaba conectarse a `ws://sandra.guestsvalencia.es:3000`
- No estaba deployado en producción
- Netlify no soporta WebSocket persistente en free tier

## Decisión

**Deprecar WebSocket MCP Bridge y usar HTTP REST exclusivamente.**

## Razones

1. **No Desplegado**: El bridge nunca fue deployado
2. **No Soportado**: Netlify free tier no soporta WebSocket persistente
3. **No Necesario**: HTTP REST es suficiente para chat
4. **Simplicidad**: Arquitectura más simple y mantenible

## Alternativas Consideradas

### Mantener WebSocket
- ❌ Requiere servidor dedicado ($50-100/mes)
- ❌ Netlify no soporta en free tier
- ❌ Complejidad innecesaria

### HTTP REST (Elegido)
- ✅ Soportado por Netlify Functions
- ✅ Suficiente para chat
- ✅ Más simple de mantener

## Consecuencias

### Positivas
- ✅ Arquitectura simplificada
- ✅ Funciona en Netlify free tier
- ✅ Menos código que mantener
- ✅ Frontend ya usa HTTP REST

### Negativas
- ⚠️ Sin real-time bidireccional (no necesario para chat)
- ⚠️ Código legacy puede quedar en el repo (marcado como deprecated)

## Implementación

1. ✅ Frontend actualizado para usar Netlify Functions
2. ✅ WebSocket code marcado como deprecated
3. ✅ Documentación actualizada
4. ⚠️ Código legacy puede removerse en futura refactorización

## Trade-offs

**Real-time**: No es necesario para chat. El usuario envía mensaje y recibe respuesta.

**Simplicidad**: HTTP REST es más simple que WebSocket.

---

**Actualizado**: 2025-01-27 - WebSocket deprecado, usando HTTP REST

