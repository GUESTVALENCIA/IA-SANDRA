# SISTEMA HÍBRIDO FRONTEND - 100% GRATUITO

**Fecha:** 2025-10-28
**Objetivo:** APIs gratuitas para testing/feedback Sandra IA
**CEO:** Clayton Thomas
**Presupuesto:** 0 EUR (solo modelos gratuitos)

---

## 🎯 ARQUITECTURA FINAL

### TIER SYSTEM OPTIMIZADO (GRATIS)

```
┌─────────────────────────────────────────────────┐
│  SANDRA IA FRONTEND - SISTEMA HÍBRIDO GRATIS   │
└─────────────────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────┐
        │   TIER 1 (80% queries)  │
        │   QWEN 2.5:7B (Ollama)  │
        │   ✅ GRATIS - RÁPIDO    │
        └─────────────────────────┘
                      │
              ┌───────┴───────┐
              │   Si falla    │
              ▼               │
        ┌─────────────────────────┐
        │   TIER 2 (15% queries)  │
        │ DeepSeek Coder V2 (Oll) │
        │   ✅ GRATIS - SMART     │
        └─────────────────────────┘
                      │
              ┌───────┴───────┐
              │   Si falla    │
              ▼               │
        ┌─────────────────────────┐
        │   TIER 3 (4% queries)   │
        │   Llama 3.1 (Ollama)    │
        │   ✅ GRATIS - ESTABLE   │
        └─────────────────────────┘
                      │
              ┌───────┴───────┐
              │  Emergencia   │
              ▼               │
        ┌─────────────────────────┐
        │   TIER 4 (1% queries)   │
        │   GROQ Mixtral (API)    │
        │   ⚠️ GRATIS LIMITADO    │
        └─────────────────────────┘
```

---

## 📦 MODELOS A INSTALAR (OLLAMA)

### 1. QWEN 2.5:7B (Primario - Conversacional)
```bash
ollama pull qwen2.5:7b
```

**Características:**
- Tamaño: 4.7 GB
- RAM necesaria: 8 GB
- Velocidad: Muy rápida
- Español: Excelente
- Conversacional: Excelente
- **Uso:** 80% de consultas de Sandra

**Por qué es perfecto para Sandra:**
- Entrenado específicamente para conversación multilingüe
- Excelente comprensión de contexto
- Respuestas naturales y empáticas
- Rápido para experiencia en tiempo real

---

### 2. DEEPSEEK CODER V2:16B (Secundario - Razonamiento)
```bash
ollama pull deepseek-coder-v2:16b
```

**Características:**
- Tamaño: 8.9 GB
- RAM necesaria: 16 GB
- Velocidad: Rápida
- Español: Muy buena
- Razonamiento: Excelente
- **Uso:** 15% de consultas complejas

**Por qué como fallback:**
- Mejor razonamiento que Qwen
- Contexto largo (128K tokens)
- Excelente para consultas complejas
- Backup robusto

---

### 3. LLAMA 3.1:8B (Terciario - Estabilidad)
```bash
ollama pull llama3.1:8b
```

**Características:**
- Tamaño: 4.7 GB
- RAM necesaria: 8 GB
- Velocidad: Media
- Español: Buena
- Estabilidad: Excelente
- **Uso:** 4% fallback final

**Por qué como último recurso:**
- Muy estable y probado
- Funciona siempre
- Backup confiable

---

## 🚀 INSTALACIÓN RÁPIDA

### Paso 1: Verificar Ollama instalado
```bash
ollama --version
```

Si no está instalado:
```bash
# Windows
winget install Ollama.Ollama

# O descargar desde https://ollama.com
```

---

### Paso 2: Descargar los 3 modelos
```bash
# Modelo primario (OBLIGATORIO)
ollama pull qwen2.5:7b

# Modelo secundario (RECOMENDADO)
ollama pull deepseek-coder-v2:16b

# Modelo terciario (OPCIONAL)
ollama pull llama3.1:8b
```

**Tiempo estimado:** 15-30 minutos (dependiendo de conexión)
**Espacio disco:** ~18 GB total

---

### Paso 3: Probar los modelos
```bash
# Probar Qwen
ollama run qwen2.5:7b "Hola, soy Sandra. ¿En qué puedo ayudarte hoy?"

# Probar DeepSeek
ollama run deepseek-coder-v2:16b "Explícame brevemente qué servicios ofrece GuestsValencia"

# Probar Llama
ollama run llama3.1:8b "Hola, cuéntame sobre ti"
```

---

## 💻 CÓDIGO DE INTEGRACIÓN

### Backend: Nuevo endpoint `/api/chat-local`

```javascript
// netlify/functions/chat-local/index.js
const fetch = require('node-fetch');

// Llamar a Ollama local (Qwen primario)
async function callQwen(messages) {
  const systemPrompt = {
    role: 'system',
    content: `Eres Sandra, asistente virtual de GuestsValencia.

PERSONALIDAD:
- Cálida, empática y profesional
- Hablas español de España (no latino)
- Respondes de forma natural y conversacional
- Usas un tono amigable pero profesional

CONTEXTO:
- GuestsValencia: Gestión de alquileres vacacionales en Valencia
- Servicios: Reservas, atención huéspedes, gestión propiedades
- Tu misión: Ayudar a huéspedes y propietarios

ESTILO:
- Respuestas breves (2-3 frases máximo)
- Directa y clara
- Empática con las necesidades del usuario
- Siempre dispuesta a ayudar

IMPORTANTE:
- Si no sabes algo, lo admites honestamente
- Ofreces alternativas cuando no puedes ayudar directamente
- Mantienes la conversación fluida y natural`
  };

  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:7b',
        messages: [systemPrompt, ...messages],
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40
        }
      })
    });

    if (!response.ok) throw new Error(`Qwen failed: ${response.status}`);

    const data = await response.json();
    return {
      text: data.message.content,
      provider: 'Qwen 2.5 (Local)'
    };
  } catch (error) {
    throw new Error(`Qwen error: ${error.message}`);
  }
}

// Fallback a DeepSeek
async function callDeepSeek(messages) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-coder-v2:16b',
      messages: messages,
      stream: false,
      options: {
        temperature: 0.6,
        top_p: 0.85
      }
    })
  });

  if (!response.ok) throw new Error(`DeepSeek failed: ${response.status}`);

  const data = await response.json();
  return {
    text: data.message.content,
    provider: 'DeepSeek V2 (Local)'
  };
}

// Fallback a Llama 3.1
async function callLlama(messages) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.1:8b',
      messages: messages,
      stream: false
    })
  });

  if (!response.ok) throw new Error(`Llama failed: ${response.status}`);

  const data = await response.json();
  return {
    text: data.message.content,
    provider: 'Llama 3.1 (Local)'
  };
}

// Fallback a GROQ (gratis limitado)
async function callGROQ(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) throw new Error(`GROQ failed: ${response.status}`);

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    provider: 'GROQ Mixtral (API)'
  };
}

// Handler principal con cascada
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { messages = [] } = JSON.parse(event.body || '{}');

    if (!messages || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No messages provided' })
      };
    }

    let result;

    // TIER 1: Qwen 2.5 (primario - gratis local)
    try {
      console.log('🤖 Intentando Qwen 2.5 (Local Tier 1)...');
      result = await callQwen(messages);
      console.log('✅ Qwen 2.5 respondió exitosamente');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          text: result.text,
          provider: result.provider,
          tier: 1,
          cost: 'FREE'
        })
      };
    } catch (qwenError) {
      console.warn('⚠️ Qwen falló:', qwenError.message);

      // TIER 2: DeepSeek (secundario - gratis local)
      try {
        console.log('🤖 Intentando DeepSeek Coder V2 (Local Tier 2)...');
        result = await callDeepSeek(messages);
        console.log('✅ DeepSeek respondió exitosamente');
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            text: result.text,
            provider: result.provider,
            tier: 2,
            cost: 'FREE'
          })
        };
      } catch (deepseekError) {
        console.warn('⚠️ DeepSeek falló:', deepseekError.message);

        // TIER 3: Llama 3.1 (terciario - gratis local)
        try {
          console.log('🤖 Intentando Llama 3.1 (Local Tier 3)...');
          result = await callLlama(messages);
          console.log('✅ Llama 3.1 respondió exitosamente');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              text: result.text,
              provider: result.provider,
              tier: 3,
              cost: 'FREE'
            })
          };
        } catch (llamaError) {
          console.warn('⚠️ Llama falló:', llamaError.message);

          // TIER 4: GROQ (emergencia - gratis limitado API)
          try {
            console.log('🤖 Intentando GROQ Mixtral (API Tier 4)...');
            result = await callGROQ(messages);
            console.log('✅ GROQ respondió exitosamente');
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                text: result.text,
                provider: result.provider,
                tier: 4,
                cost: 'FREE (limited)'
              })
            };
          } catch (groqError) {
            console.error('❌ Todos los modelos fallaron');
            throw new Error('All free models failed');
          }
        }
      }
    }
  } catch (error) {
    console.error('Handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message || 'Internal server error',
        text: 'Error en la IA. Por favor reinténtalo.'
      })
    };
  }
};
```

---

## 🎨 PROMPT ENGINEERING OPTIMIZADO

### Sistema de Prompts por Contexto

```javascript
const SANDRA_PROMPTS = {
  // Prompt base para todos los modelos
  base: `Eres Sandra, asistente virtual de GuestsValencia.

PERSONALIDAD:
- Cálida, empática y profesional
- Hablas español de España natural
- Respondes de forma conversacional
- Tono amigable pero profesional

SERVICIOS GUESTSVALENCIA:
- Gestión alquileres vacacionales Valencia
- Atención huéspedes 24/7
- Gestión propiedades para propietarios
- Reservas y coordinación llegadas/salidas

TU MISIÓN:
- Ayudar a huéspedes con dudas sobre alojamiento
- Asistir propietarios en gestión propiedades
- Proporcionar información sobre servicios
- Mantener conversación natural y útil`,

  // Prompt mejorado para Qwen (conversacional)
  qwen: `Eres Sandra, la voz de GuestsValencia.

🎯 TU ESENCIA:
- Asistente IA cálida y profesional
- Experta en hospitalidad valenciana
- Hablas español natural de España
- Empatizas con huéspedes y propietarios

💼 GUESTSVALENCIA:
- Gestión premium de alquileres vacacionales
- Ubicación: Valencia, España
- Servicios 24/7 para máxima satisfacción
- Tecnología + toque humano

🗣️ TU ESTILO:
- Respuestas breves (2-3 frases)
- Natural y conversacional
- Directa pero amable
- Enfocada en soluciones

💡 RECUERDA:
- Si no sabes algo, lo admites honestamente
- Ofreces alternativas cuando no puedes ayudar
- Mantienes la conversación fluida
- Priorizas la experiencia del usuario`,

  // Prompt para DeepSeek (consultas complejas)
  deepseek: `Contexto: Eres Sandra, IA de GuestsValencia para consultas complejas.

Características:
- Análisis detallado cuando necesario
- Razonamiento paso a paso
- Información precisa y verificable
- Español profesional

Objetivo: Resolver consultas específicas con precisión manteniendo el tono de Sandra.`,

  // Prompt para Llama (fallback)
  llama: `System: You are Sandra, GuestsValencia's AI assistant.

Key points:
- Friendly and professional
- Speak natural Spanish (Spain)
- Brief responses (2-3 sentences)
- Focus on helping users

Response in Spanish, naturally and warmly.`
};
```

---

## 📊 MÉTRICAS Y MONITOREO

### Dashboard de Uso (para optimizar)

```javascript
const METRICS = {
  usage: {
    tier1_qwen: 0,      // Contador llamadas Qwen
    tier2_deepseek: 0,  // Contador llamadas DeepSeek
    tier3_llama: 0,     // Contador llamadas Llama
    tier4_groq: 0       // Contador llamadas GROQ (⚠️ costo)
  },

  latency: {
    qwen: [],
    deepseek: [],
    llama: [],
    groq: []
  },

  quality: {
    user_satisfaction: [],  // Rating 1-5
    response_length: [],    // Tokens de respuesta
    fallback_rate: 0        // % que llegaron a Tier 2+
  }
};

function trackMetric(tier, model, latency, tokens) {
  METRICS.usage[`tier${tier}_${model}`]++;
  METRICS.latency[model].push(latency);

  // Log para análisis
  console.log(`📊 Métricas: Tier ${tier} | ${model} | ${latency}ms | ${tokens} tokens`);
}
```

---

## 🎯 VENTAJAS DEL SISTEMA

### ECONÓMICAS:
- ✅ **100% GRATIS** para 99% de consultas
- ✅ Solo GROQ en emergencias (gratis limitado)
- ✅ Cero costo mensual recurrente
- ✅ Escalable sin incremento de costo

### TÉCNICAS:
- ✅ Latencia baja (Ollama local rápido)
- ✅ Sin límites de rate (es local)
- ✅ Privacidad (datos no salen del servidor)
- ✅ Redundancia (4 tiers de fallback)

### OPERATIVAS:
- ✅ Ideal para testing masivo
- ✅ Perfecto para crear feedback
- ✅ Sin presión de costos
- ✅ Puedes hacer miles de pruebas gratis

---

## 🚀 PRÓXIMOS PASOS

### FASE 1: Instalación (15-30 min)
1. Instalar Ollama en servidor
2. Descargar Qwen 2.5:7b (obligatorio)
3. Descargar DeepSeek V2:16b (recomendado)
4. Descargar Llama 3.1:8b (opcional)
5. Probar cada modelo individualmente

### FASE 2: Integración (30 min)
6. Crear `/api/chat-local` en Netlify Functions
7. Configurar cascada de fallback
8. Implementar prompt engineering optimizado
9. Añadir métricas de tracking

### FASE 3: Frontend (15 min)
10. Actualizar `sandra-mobile.js`
11. Cambiar endpoint de `/api/chat` a `/api/chat-local`
12. Añadir indicador de modelo usado
13. Deploy y testing

### FASE 4: Optimización (continua)
14. Analizar métricas de uso
15. Ajustar prompts según feedback
16. Optimizar para que 95%+ use Qwen (Tier 1)
17. Minimizar uso de GROQ (Tier 4)

---

## 💡 RECOMENDACIONES FINALES

### Para Testing con Sandrita:
- Usa **Qwen 2.5** - Excelente para conversación natural
- Ajusta prompts para enseñanza de inglés
- Monitorea qué modelo responde mejor

### Para Feedback Falso (Pruebas):
- Haz miles de consultas sin preocuparte por costo
- Prueba edge cases y errores
- Perfecciona el sistema tranquilamente

### Cuando Perfecciones Sistema:
- Cambia endpoint a GPT-4o para producción
- Mantén Ollama como backup gratuito
- Usa métricas para decidir cuándo cambiar

---

## 📝 NOTAS IMPORTANTES

### RAM Necesaria:
- **Mínimo:** 8 GB (para Qwen o Llama)
- **Recomendado:** 16 GB (para DeepSeek también)
- **Óptimo:** 32 GB (todos los modelos + OS)

### Espacio Disco:
- Qwen 2.5:7b → 4.7 GB
- DeepSeek V2:16b → 8.9 GB
- Llama 3.1:8b → 4.7 GB
- **Total:** ~18 GB

### Servidor:
- Ollama se ejecuta en `localhost:11434`
- Netlify Functions llama a Ollama local
- Asegúrate de que Ollama esté ejecutándose

---

**Sistema diseñado para:** Testing masivo sin costo, feedback, perfeccionamiento
**Migración a producción:** Cambiar endpoint cuando sistema esté perfecto
**Costo operativo:** 0 EUR (100% gratuito local)

---

🚀 **LISTO PARA IMPLEMENTAR** - Solo necesitas confirmar y empezamos instalación.
