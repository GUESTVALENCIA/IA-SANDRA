# Prompt & Policy Guidelines

Este documento centraliza las plantillas de prompt utilizadas por los agentes del sistema. Cuando se añada un nuevo agente, define su plantilla aquí y mantén una guía coherente de estilo y formato.

## Ejemplo de plantilla

```js
exports.devAgentPrompt = ({ task }) => `
You are the Dev Agent. Complete the following task and return valid JSON.

Task:
${task}

Return format:
{
  "result": "...",
  "meta": { ... }
}
`;
```

## Directrices generales

- Siempre instruye a los modelos a devolver solo JSON, sin comentarios ni texto adicional.
- Utiliza el wrapper seguro (`safeLLM`) para manejar reintentos y reparaciones automáticas de JSON.
- Valida las salidas contra un esquema cuando sea posible y registra cualquier desviación.
- Centraliza todas las políticas de redacción y formatos de respuesta para una mayor coherencia.
