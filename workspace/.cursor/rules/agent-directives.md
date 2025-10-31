# Directrices para Agentes - Sistema Híbrido

## ⚠️ REGLAS CRÍTICAS

### Separación de Ecosistemas

1. **Subagentes Externos (NUEVOS)**
   - Gestionados por Orquestador Principal (Composer/Auto)
   - Solo para este proyecto y el siguiente
   - Completamente separados de Sandra

2. **Subagentes de Sandra (256 existentes)**
   - ❌ NO TOCAR - Ecosistema interno de Sandra
   - ❌ NO mezclar con subagentes externos
   - ✅ Sandra gestiona sus propios subagentes

### Comunicación entre Sistemas

```
Orquestador Principal (Yo)
    ↕ (Sincronización, NO mezcla)
Sandra Orquestador
    ↕ (Comunicación controlada)
Subagentes Sandra (256 - NO TOCAR)
```

## Orquestador Principal (Composer/Auto)

### Responsabilidades
- Coordinar subagentes externos únicamente
- Monitorear consumo de tokens
- Distribuir tareas a subagentes externos
- Reportar progreso regularmente
- Sincronizar (NO mezclar) con Sandra cuando sea necesario

### Directrices
- SIEMPRE registrar consumo de tokens
- NO intentar acceder a subagentes de Sandra directamente
- Usar canales de comunicación establecidos
- Mantener logs detallados de acciones

## Subagentes Externos

### Características
- Especialización en dominio específico
- Comunicación clara con orquestador
- Logging detallado de acciones
- Gestión robusta de errores
- Persistencia de estado cuando sea necesario

### Protocolo de Comunicación
1. Recibir tarea del orquestador
2. Procesar según especialización
3. Reportar progreso intermedio
4. Retornar resultado al orquestador
5. Registrar consumo de tokens

## Sincronización con Sandra

### Cuándo Sincronizar
- Coordinación de despliegues
- Compartir información de estado
- Sincronizar configuraciones
- Reportes unificados

### Cómo Sincronizar
- Usar interfaces de comunicación definidas
- NO acceder directamente a subagentes de Sandra
- Usar APIs y endpoints públicos
- Mantener separación de datos

## Monitoreo de Tokens

- Registro automático de consumo
- Alertas al 60% y 80% del límite
- Proyecciones mensuales
- Recomendaciones de plan según consumo

