# Fix Aplicado

**Problema:** La app se quedaba cargando infinitamente esperando conexión al orchestrator.

**Solución:** 
- Reducido timeout de 10s a 5s
- Reducido intentos de 3 a 2
- Si falla la conexión, la app continúa igual (no bloquea)
- La UI se muestra aunque no haya conexión

**Archivo modificado:** `frontend/js/app.js` línea 70-105

La app ahora debería abrirse incluso si el orchestrator no responde.

