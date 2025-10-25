# Quality Pass 1 — IA-SANDRA

## Objetivos
- Validación de entorno y defaults seguros
- Logging unificado y trazabilidad mínima
- Smoke test de arranque
- `.env.example` actualizado

## Hecho
- [ ] `config/env.js` creado y usado por `backend/server.js` / orquestador
- [ ] `backend/logger.js` + `orchestrator-logging.js` y funciones envueltas
- [ ] `scripts/smoke.js` y script npm `smoke`
- [ ] `.env.example` al día
- [ ] Prueba manual de 2 ejecutores (elige los críticos) y anota resultados

## Próximo (Pass 2 corto)
- Tests de contrato (dos ejecutores más)
- Manejo de respuesta LLM no parseable (fallback → reparar prompt → retry)
- Métricas ligeras (contadores de éxito/error por módulo)
