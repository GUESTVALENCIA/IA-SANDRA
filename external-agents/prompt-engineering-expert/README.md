# 🎯 Prompt Engineering Expert Agent

## Especialización

Agente experto especializado en:
- **Prompt Engineering** avanzado
- **Workflow Analysis** y optimización
- **Critical Analysis** de sistemas de IA
- **AI System Integration** compleja

## 🎯 Objetivo

Activar a Sandra como **desarrolladora** conectando el prompt engineering existente (creado por GPT-5 Thinking) al núcleo de Sandra.

## ⚠️ Restricciones

- ❌ NO tocar subagentes de Sandra (256 existentes)
- ✅ Trabajar SOLO en núcleo y orquestación
- ✅ Mantener separación de ecosistemas

## 🔧 Uso

```javascript
const { PromptEngineeringExpert } = require('./expert-agent');

const expert = new PromptEngineeringExpert();

// Analizar núcleo
const analysis = await expert.analyzeNucleus();

// Conectar prompt engineering
const result = await expert.connectPromptEngineering();

// Activar rol de desarrolladora
const activation = await expert.activateDeveloperRole();
```

## 📋 Proceso

1. **Análisis del Núcleo**
   - Identificar prompts existentes
   - Encontrar puntos de conexión
   - Detectar prompts desconectados

2. **Búsqueda de Roles**
   - Localizar los 18 roles de Sandra
   - Encontrar prompt engineering de GPT-5
   - Mapear estructura de roles

3. **Conexión al Núcleo**
   - Integrar prompts al método getSystemPrompt
   - Activar rol de desarrolladora
   - Conectar workflows necesarios

4. **Verificación**
   - Probar funcionalidad
   - Verificar que todo esté conectado
   - Confirmar activación

---

**Status**: Listo para activar en Cursor como subagente experto

