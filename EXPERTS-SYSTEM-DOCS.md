# 🌟 SISTEMA DE SUBAGENTES EXPERTOS GALAXY

## 📋 DESCRIPCIÓN

Sistema profesional de 6 subagentes especializados con SDKs oficiales de Anthropic y OpenAI, diseñado para SANDRA IA de GuestsValencia.es.

---

## 🎯 SUBAGENTES DISPONIBLES

### 1. 👔 SANDRA CEO
**Especialidad:** Estrategia empresarial y decisiones de alto nivel  
**Modelo:** Claude Sonnet 4.5 (Anthropic)  
**Uso:** Planificación estratégica, análisis de mercado, ROI, decisiones críticas

**Ejemplo:**
```javascript
POST /api/experts/ceo
{
  "message": "Analiza la viabilidad de expandir GuestsValencia a Madrid"
}
```

---

### 2. 💻 SANDRA DEV
**Especialidad:** Desarrollo full-stack profesional  
**Modelo:** Claude Sonnet 4.5 (Anthropic)  
**Uso:** Código producción, arquitectura, debugging, implementaciones complejas

**Stack:**
- Frontend: React, Electron, Tailwind
- Backend: Node.js, Express, PostgreSQL
- APIs: Anthropic, OpenAI, HeyGen, Deepgram

**Ejemplo:**
```javascript
POST /api/experts/dev
{
  "message": "Implementa un sistema de cache Redis para las reservas"
}
```

---

### 3. 📢 SANDRA MARKETING
**Especialidad:** Marketing digital y growth hacking  
**Modelo:** GPT-4o (OpenAI)  
**Uso:** SEO, campañas publicitarias, copywriting, social media

**Ejemplo:**
```javascript
POST /api/experts/marketing
{
  "message": "Diseña una estrategia de contenido para Instagram enfocada en parejas jóvenes"
}
```

---

### 4. ⚙️ SANDRA OPS
**Especialidad:** Operaciones y automatización  
**Modelo:** Claude Sonnet 4.5 (Anthropic)  
**Uso:** Procesos operativos, automatizaciones, check-in/out, gestión incidencias

**Ejemplo:**
```javascript
POST /api/experts/ops
{
  "message": "Automatiza el proceso de envío de instrucciones de acceso post-reserva"
}
```

---

### 5. 💬 SANDRA SUPPORT
**Especialidad:** Atención al cliente 24/7  
**Modelo:** GPT-4o (OpenAI)  
**Uso:** Chat, resolución dudas, recomendaciones Valencia, gestión incidencias

**Ejemplo:**
```javascript
POST /api/experts/support
{
  "message": "Recomiéndame restaurantes cerca de la Malvarrosa para cena romántica"
}
```

---

### 6. 📊 SANDRA ANALYST
**Especialidad:** Inteligencia de negocio y análisis de datos  
**Modelo:** Claude Sonnet 4.5 (Anthropic)  
**Uso:** Análisis de datos, forecasting, pricing dinámico, KPIs, reportes

**Ejemplo:**
```javascript
POST /api/experts/analyst
{
  "message": "Analiza la ocupación de julio y predice la demanda para agosto"
}
```

---

## 🔄 ENDPOINTS PRINCIPALES

### Router Automático (Recomendado)
```javascript
POST /api/experts/auto
{
  "message": "Tu consulta aquí",
  "expertHint": "auto"  // o especifica: "ceo", "dev", etc.
}
```

El sistema detecta automáticamente el experto más apropiado basándose en el contenido del mensaje.

**Keywords de detección:**
- CEO: estrategia, decisión, inversión, expansión, competencia, mercado, ROI
- DEV: código, api, función, bug, implementa, react, node, deploy
- MARKETING: marketing, seo, ads, campaña, social media, conversión
- OPS: reserva, check-in, limpieza, proceso, automatiza, workflow
- ANALYST: análisis, datos, kpi, forecast, métrica, predicción, reporte
- SUPPORT: (por defecto para atención cliente)

---

## 🤝 COLABORACIÓN MULTI-EXPERTO

### Colaboración Paralela
Múltiples expertos trabajan simultáneamente sobre la misma tarea.

```javascript
POST /api/experts/collaborate
{
  "task": "Estrategia completa para lanzar nuevo servicio premium",
  "expertsList": ["ceo", "dev", "marketing"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "task": "...",
  "experts": ["Sandra CEO", "Sandra Dev", "Sandra Marketing"],
  "results": {
    "ceo": {
      "expert": "Sandra CEO",
      "response": "...",
      "model": "claude-sonnet-4-5-20250929"
    },
    "dev": { ... },
    "marketing": { ... }
  }
}
```

---

### Pipeline Secuencial
Los expertos trabajan en secuencia, cada uno con el contexto del anterior.

```javascript
POST /api/experts/pipeline
{
  "task": "Implementar sistema de descuentos por fidelidad",
  "pipeline": ["ceo", "dev", "ops", "marketing"]
}
```

**Flujo:**
1. **CEO** → Analiza viabilidad y ROI
2. **DEV** → Diseña arquitectura técnica (con análisis CEO)
3. **OPS** → Define procesos operativos (con arquitectura DEV)
4. **MARKETING** → Crea estrategia de comunicación (con todo el contexto)

---

## 📡 ENDPOINTS COMPLETOS

### 1. Router Automático
```bash
POST /api/experts/auto
Content-Type: application/json

{
  "message": "string (requerido)",
  "expertHint": "auto" | "ceo" | "dev" | "marketing" | "ops" | "support" | "analyst"
}
```

### 2. Expertos Específicos
```bash
POST /api/experts/{expertId}
# expertId: ceo | dev | marketing | ops | support | analyst

{
  "message": "string (requerido)",
  "context": {}  # opcional
}
```

### 3. Colaboración
```bash
POST /api/experts/collaborate

{
  "task": "string (requerido)",
  "expertsList": ["ceo", "dev", ...]  # default: ["ceo", "dev"]
}
```

### 4. Pipeline
```bash
POST /api/experts/pipeline

{
  "task": "string (requerido)",
  "pipeline": ["ceo", "dev", "ops"]  # default: ["ceo", "dev", "ops"]
}
```

### 5. Información del Sistema
```bash
GET /api/experts/list      # Lista todos los expertos
GET /api/experts/status    # Estado del sistema completo
GET /health                # Health check general (incluye expertos)
```

---

## 🔥 EJEMPLOS DE USO REAL

### Caso 1: Problema Técnico Urgente
```javascript
// Router detecta automáticamente que es para DEV
POST /api/experts/auto
{
  "message": "Tenemos un bug crítico: las reservas no se guardan en Supabase"
}

// Respuesta inmediata del experto DEV con solución
```

### Caso 2: Decisión Estratégica
```javascript
// Colaboración CEO + Analyst para decisión informada
POST /api/experts/collaborate
{
  "task": "¿Deberíamos bajar precios en septiembre o mantenerlos?",
  "expertsList": ["analyst", "ceo"]
}

// Analyst proporciona datos, CEO toma decisión estratégica
```

### Caso 3: Lanzamiento Nueva Funcionalidad
```javascript
// Pipeline completo: estrategia → desarrollo → operaciones → marketing
POST /api/experts/pipeline
{
  "task": "Implementar check-in automático con código QR",
  "pipeline": ["ceo", "dev", "ops", "marketing"]
}

// Cada experto construye sobre el trabajo del anterior
```

### Caso 4: Atención Cliente
```javascript
// Support responde consultas de huéspedes
POST /api/experts/support
{
  "message": "Hola, ¿a qué hora puedo hacer el check-in? ¿Dónde está la llave?"
}

// Respuesta amable y profesional con info específica
```

---

## ⚙️ CONFIGURACIÓN

### Variables de Entorno Requeridas
```env
# Anthropic (para CEO, DEV, OPS, ANALYST)
ANTHROPIC_API_KEY=sk-ant-api03-xxx...
ANTHROPIC_MODEL=claude-sonnet-4-5-20250929

# OpenAI (para MARKETING, SUPPORT)
OPENAI_API_KEY=sk-proj-xxx...
OPENAI_MODEL=gpt-4o
```

### Iniciar el Backend
```bash
cd backend
node server.js

# Output esperado:
# 🚀 Sandra Professional Backend
# 📡 Servidor activo en http://localhost:5000
# ✅ Sistema de Expertos Galaxy: 6 expertos operativos
```

---

## 🧪 TESTING

### Test Automático Completo
```bash
node test-experts-system.js
```

**Prueba:**
- ✅ Conexión con APIs
- ✅ Router automático
- ✅ Cada experto individualmente
- ✅ Colaboración multi-experto
- ✅ Pipeline secuencial

### Test Manual con cURL

#### 1. Health Check
```bash
curl http://localhost:5000/health
```

#### 2. Listar Expertos
```bash
curl http://localhost:5000/api/experts/list
```

#### 3. Consulta al CEO
```bash
curl -X POST http://localhost:5000/api/experts/ceo \
  -H "Content-Type: application/json" \
  -d '{"message":"Resume la estrategia de GuestsValencia en 3 puntos"}'
```

#### 4. Router Automático
```bash
curl -X POST http://localhost:5000/api/experts/auto \
  -H "Content-Type: application/json" \
  -d '{"message":"Recomiéndame playas en Valencia"}'
```

---

## 📊 MÉTRICAS Y MONITOREO

Cada respuesta incluye:
```json
{
  "success": true,
  "expert": "Sandra CEO",
  "specialty": "Estrategia empresarial...",
  "response": "...",
  "model": "claude-sonnet-4-5-20250929",
  "usage": {
    "input_tokens": 245,
    "output_tokens": 512,
    "total_tokens": 757
  },
  "timestamp": "2025-10-24T10:30:00.000Z"
}
```

---

## 🚀 CASOS DE USO AVANZADOS

### 1. Análisis Completo de Negocio
```javascript
// Pipeline CEO → Analyst → Marketing
const analisis = await fetch('/api/experts/pipeline', {
  method: 'POST',
  body: JSON.stringify({
    task: 'Analizar rendimiento Q3 y proponer estrategia Q4',
    pipeline: ['analyst', 'ceo', 'marketing']
  })
});
```

### 2. Desarrollo Integral de Feature
```javascript
// Colaboración Dev + Ops para deployment completo
const feature = await fetch('/api/experts/collaborate', {
  method: 'POST',
  body: JSON.stringify({
    task: 'Sistema de notificaciones push para la app',
    expertsList: ['dev', 'ops']
  })
});
```

### 3. Crisis Management
```javascript
// Router automático + escalación a CEO si es crítico
const crisis = await fetch('/api/experts/auto', {
  method: 'POST',
  body: JSON.stringify({
    message: 'Cancelación masiva de reservas por error en la web',
    expertHint: 'ceo'  // Forzar escalación inmediata
  })
});
```

---

## 🛡️ MEJORES PRÁCTICAS

### ✅ DO

- Usa el router automático (`/api/experts/auto`) para la mayoría de consultas
- Especifica el experto solo cuando necesitas garantizar un enfoque específico
- Usa colaboración para decisiones complejas que requieren múltiples perspectivas
- Usa pipelines cuando el orden de análisis importa
- Mantén los mensajes claros y específicos

### ❌ DON'T

- No envíes consultas genéricas sin contexto
- No uses múltiples expertos para tareas simples
- No ignores el contexto retornado en colaboraciones
- No mezcles idiomas en el mismo mensaje
- No esperes que un experto tenga datos que no le corresponden

---

## 📞 SOPORTE

**CEO del proyecto:** Claytis Miguel Tom Zuaznabar  
**Proyecto:** GuestsValencia.es  
**Documentación técnica:** `/docs` en el proyecto

---

## 🔄 PRÓXIMAS MEJORAS

- [ ] Memoria persistente entre sesiones
- [ ] Integración con base de datos histórica
- [ ] Subagente Legal (contratos, regulaciones)
- [ ] Subagente Finance (contabilidad avanzada)
- [ ] Sistema de feedback y aprendizaje
- [ ] Dashboard de analytics de expertos

---

**Versión:** 1.0.0 Galaxy  
**Última actualización:** 24 Oct 2025  
**Sello:** 🌟 SANDRA IA - Nivel Profesional Galaxy
