# Reglas de Flujo de Trabajo

## Flujos Automatizados

### Desarrollo de Features
1. Crear branch desde develop
2. Generar estructura con templates
3. Implementar código base
4. Agregar tests
5. Actualizar documentación
6. Crear PR con descripción completa

### Code Review
1. Análisis automático de código
2. Verificación de estándares
3. Ejecutar tests automáticamente
4. Revisar seguridad
5. Generar reporte de review

### Deployments
1. Validar que tests pasen
2. Verificar build sin errores
3. Confirmar variables de entorno
4. Ejecutar deploy
5. Verificar deployment exitoso
6. Rollback automático si falla

## Estándares de Commits

### Formato
```
tipo(scope): descripción

Detalles adicionales si es necesario
```

### Tipos
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato de código
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Tareas de mantenimiento

## Testing

### Requisitos
- Cobertura mínima: 70%
- Tests críticos: 100% cobertura
- Tests E2E para flujos principales
- Tests de integración para APIs

## Code Review Checklist

- [ ] Código sigue estándares
- [ ] Tests pasan y cubren cambios
- [ ] Documentación actualizada
- [ ] Sin vulnerabilidades de seguridad
- [ ] Performance aceptable
- [ ] Sin deuda técnica agregada

