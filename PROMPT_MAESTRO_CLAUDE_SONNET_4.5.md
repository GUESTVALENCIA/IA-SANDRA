# 🎯 PROMPT MAESTRO - Implementación Completa Sandra IA 8.0 Pro

## 📋 CONTEXTO Y OBJETIVO

Eres **Claude Sonnet 4.5** trabajando como **Implementador Principal** de Sandra IA 8.0 Pro. Tu misión es implementar un sistema completo de roles profesionales, mejorar el sistema multimodal premium, y corregir todos los problemas identificados.

**Estado Actual:**
- ✅ OpenAI (GPT-4o-mini) configurado como proveedor principal
- ✅ Claude 3.5 Sonnet disponible para razonamiento complejo
- ✅ Sistema de roles básico funcionando (19 roles genéricos)
- ❌ Roles reales de Sandra IA 7.0 NO integrados
- ❌ Sistema multimodal incompleto (falta Barge-in, avatar sincronizado)
- ❌ Prompts con mala gramática y respuestas genéricas
- ❌ Falta integración de subagentes de marketing

---

## 🎯 OBJETIVOS PRINCIPALES

### 1. **Sistema Multimodal Premium Completo**
- ✅ Barra estilo ChatGPT con llamada de voz
- ✅ GPT-4o para voz (conversación)
- ✅ Cartesia TTS (voz natural)
- ✅ Deepgram STT (transcripción)
- ✅ GPT-4o-mini para chat de texto
- ✅ Llamada conversacional con **Barge-in funcional**
- ✅ Videollamada de avatar en tiempo real (HeyGen)
- ✅ Video avatar IV perfectamente sincronizado

### 2. **Sistema de Roles Completo y Profesional**

#### **A. Roles Core SOE (7 roles - MANTENER)**
1. **Orchestrator** - Orquestación principal, routing inteligente
2. **Product/CEO Ops** - Estrategia de negocio, monetización
3. **Full-Stack Developer** - Código, debugging, deployment
4. **DevOps/SRE** - Infraestructura, CI/CD, MCP
5. **API/Integrations Designer** - APIs, webhooks, integraciones
6. **Security Specialist** - Seguridad, compliance, hardening
7. **Prompt Engineer** - Optimización de prompts, estilo

#### **B. Roles de Sandra IA 7.0 (18 roles - INTEGRAR)**
Basados en `memory/roles/`:
1. **Concierge** - Recepcionista 7 estrellas, atención premium
2. **Owner Acquisition** - Adquisición de propietarios
3. **Listings Manager** - Gestión de listados
4. **Pricing Revenue** - Optimización de precios y revenue
5. **Channel Sync** - Sincronización multi-canal
6. **Housekeeping Maintenance** - Mantenimiento y limpieza
7. **Check-in Check-out** - Procesos de entrada/salida
8. **Performance Marketing** - Marketing de rendimiento
9. **Content SEO** - Contenido optimizado SEO
10. **Social YouTube** - Gestión de YouTube y redes
11. **Legal Policy** - Asuntos legales y políticas
12. **Finance Invoicing** - Finanzas y facturación
13. **Data Analytics** - Análisis de datos (Agent #250)
14. **DevOps Vercel** - Deployment y DevOps
15. **Voice Telephony** - Llamadas y telefonía
16. **Feedback Intelligence** - Análisis de feedback
17. **Memory Librarian** - Gestión de memoria y contexto

#### **C. Roles Especializados Adicionales (NUEVOS)**
1. **Community Manager** - Gestión de comunidad, engagement
2. **Influencer Marketing** - Estrategia de influencers, viralización
3. **Cryptocurrency Expert** - Criptomonedas, blockchain, DeFi
4. **Viral Content Creator** - Contenido viral para TikTok/Instagram
5. **UI/UX Designer** - Diseño de interfaces, experiencia de usuario
6. **Financial Advisor** - Asesoría financiera, inversiones
7. **Yoga Instructor** - Clases de yoga, mindfulness
8. **Mindfulness Coach** - Meditación, bienestar mental
9. **Psychologist** - Psicología, terapia, apoyo emocional
10. **Sexologist** - Sexología, educación sexual
11. **Web Content Creator** - Creación de contenido web
12. **Children's Entertainer** - Animación infantil, cuentos
13. **Language Teacher** - Enseñanza de idiomas, acentos regionales
14. **Empathy Specialist** - Apoyo emocional, empatía
15. **Lawyer** - Abogacía, asesoría legal
16. **Geographer** - Geografía, culturas, regiones
17. **Startup Visionary** - Creación de startups, innovación
18. **Self-Development Coach** - Autodesarrollo, autoconocimiento
19. **Project Analyst** - Análisis de proyectos, optimización
20. **YouTube Channel Creator** - Creación y monetización de canales YouTube
21. **TikTok Creator** - Contenido TikTok, viralización
22. **Instagram Creator** - Contenido Instagram, engagement
23. **Dev Support** - Soporte técnico, troubleshooting
24. **Logistics Coordinator** - Logística y transporte
25. **Organizer** - Organización y coordinación
26. **General Knowledge Expert** - Conocimientos generales, cultura, política
27. **AI Monetization Expert** - Monetización de IA, mercado IA

#### **D. Subagentes de Marketing (INTEGRAR)**
Basados en `sandra_mcp_subagentes_marketing.json`:
1. **Analista de Negocios** - KPIs, dashboards, decisiones
2. **Estratega de Marketing** - Campañas virales, posicionamiento
3. **Content Marketer** - Publicaciones, email marketing
4. **YouTube Growth Hacker** - Crecimiento de canales YouTube
5. **TikTok Virality Agent** - Contenido viral TikTok
6. **SEO Content Wizard** - Optimización SEO, EEAT
7. **Automator de Ventas** - Prospección, CRM, automatización
8. **YouTube Tutorial Agent** - Tutoriales interactivos
9. **Redactor Creativo Sandrita** - Contenido infantil viral
10. **Community Sandra Agent** - Soporte emocional, comunidad

---

## 🔧 TAREAS DE IMPLEMENTACIÓN

### **FASE 1: Sistema Multimodal Premium**

#### **1.1 Barra Multimodal Estilo ChatGPT**
**Archivo:** `desktop-app/renderer/index.html`
- ✅ Barra de input con botón de micrófono
- ✅ Indicador visual de grabación
- ✅ Auto-scroll en chat
- ✅ Integración con Deepgram STT

**Mejoras necesarias:**
- [ ] Botón de videollamada (avatar)
- [ ] Indicador de estado de conexión
- [ ] Selector de modo (texto/voz/video)
- [ ] Visualización de onda de audio en tiempo real

#### **1.2 Sistema de Voz Completo**
**Archivos:** 
- `services/deepgram-service.js` (STT)
- `services/cartesia-service.js` (TTS)
- `services/multimodal-conversation-service.js`

**Implementar:**
- [ ] **Barge-in funcional**: Interrumpir respuesta del avatar
- [ ] **Conversación continua**: Sin necesidad de clicks
- [ ] **Sincronización audio-video**: Avatar habla mientras se reproduce audio
- [ ] **GPT-4o para voz**: Usar modelo GPT-4o (no mini) para conversación de voz
- [ ] **GPT-4o-mini para texto**: Mantener mini para chat de texto

#### **1.3 Avatar HeyGen Sincronizado**
**Archivo:** `services/heygen-service.js`
- [ ] Videollamada en tiempo real (WebRTC)
- [ ] Sincronización perfecta audio-video
- [ ] Avatar IV (última versión)
- [ ] Gestos y expresiones naturales
- [ ] Integración con sistema de voz

---

### **FASE 2: Sistema de Roles Completo**

#### **2.1 Actualizar `core/roles-system.js`**
**Estructura:**
```javascript
defineRoles() {
  return {
    // ROLES CORE SOE (7)
    orchestrator: { ... },
    product_ceo: { ... },
    developer: { ... },
    devops: { ... },
    api_designer: { ... },
    security: { ... },
    prompt_engineer: { ... },
    
    // ROLES SANDRA IA 7.0 (18)
    concierge: { ... },
    owner_acquisition: { ... },
    // ... (todos los 18 roles)
    
    // ROLES ESPECIALIZADOS (27)
    community_manager: { ... },
    influencer_marketing: { ... },
    cryptocurrency: { ... },
    // ... (todos los nuevos roles)
    
    // SUBAGENTES MARKETING (10)
    business_analyst: { ... },
    marketing_strategist: { ... },
    // ... (todos los subagentes)
  };
}
```

#### **2.2 Crear Prompts Optimizados**
**Archivo:** `core/optimized-prompts.js`

**Estructura de cada prompt:**
```javascript
roleName: `
Eres [IDENTIDAD DEL ROL], experto/a en [DOMINIO].

MODO DE OPERACIÓN: EJECUCIÓN REAL SIEMPRE
- No teoría, solo acciones concretas
- Código ejecutable, comandos reales, resultados verificables
- Si no puedes ejecutar, propón el plan exacto

CAPACIDADES EJECUTABLES:
- [Lista de capacidades específicas]
- [Herramientas disponibles]
- [Integraciones activas]

FORMATO DE RESPUESTA:
1. **Resultado/Decisión**: [Respuesta directa]
2. **Próximos Pasos**: [Acciones concretas]
3. **Código/Comandos**: [Si aplica, código ejecutable]

EJEMPLOS:
[2-3 ejemplos de interacción real]

RESTRICCIONES:
- [Qué NO hacer]
- [Límites del rol]
`
```

**Correcciones de gramática:**
- ✅ Español correcto, sin errores
- ✅ Tono profesional pero cercano
- ✅ Sin respuestas genéricas tipo "no hay tarea específica"
- ✅ Si el usuario dice "hola", responder con 3 opciones accionables

#### **2.3 Integrar Subagentes de Marketing**
**Archivo:** `llm-orchestrator/ai-orchestrator.js`
- [ ] Añadir subagentes de marketing al sistema
- [ ] Configurar orquestación entre subagentes
- [ ] Integrar con MCP para gestión de agentes

---

### **FASE 3: Mejoras de UX y Flujo**

#### **3.1 Mensaje de Bienvenida Inteligente**
**Archivo:** `desktop-app/renderer/index.html`
- [ ] Al cargar, mostrar mensaje de bienvenida de Sandra
- [ ] 3 quick-actions sugeridas:
  - "Verificar estado del sistema"
  - "Probar chat multimodal"
  - "Sincronizar con GitHub"
- [ ] Botones clickeables que ejecutan acciones

#### **3.2 Eliminar Respuestas Genéricas**
**Archivo:** `core/roles-system.js` → `executeWithRole()`
- [ ] Si el mensaje es saludo, responder con opciones
- [ ] Nunca mostrar "no hay tarea específica"
- [ ] Siempre ofrecer valor, incluso en saludos

#### **3.3 Mejorar Sidebar de Roles**
**Archivo:** `desktop-app/renderer/index.html`
- [ ] Organizar roles por categorías:
  - Core SOE
  - Sandra IA 7.0
  - Especializados
  - Marketing
- [ ] Búsqueda de roles
- [ ] Favoritos/Activos destacados

---

### **FASE 4: Configuración de Modelos**

#### **4.1 Ruteo Inteligente de Modelos**
**Archivo:** `llm-orchestrator/ai-orchestrator.js`

**Lógica:**
```javascript
function selectModel(task, role, mode) {
  if (mode === 'voice' || mode === 'video') {
    return 'gpt-4o'; // Modelo completo para voz/video
  }
  
  if (mode === 'text') {
    return 'gpt-4o-mini'; // Modelo rápido para texto
  }
  
  if (task.complexity === 'high' || role === 'product_ceo' || role === 'startup_visionary') {
    return 'claude-3-5-sonnet'; // Razonamiento complejo
  }
  
  return 'gpt-4o-mini'; // Por defecto
}
```

#### **4.2 Configurar Modelos por Rol**
- [ ] Voz/Video → GPT-4o
- [ ] Texto → GPT-4o-mini
- [ ] Razonamiento complejo → Claude 3.5 Sonnet
- [ ] Roles de marketing → GPT-4o-mini (rápido)
- [ ] Roles estratégicos → Claude 3.5 Sonnet

---

## 📝 REGLAS DE ESTILO Y GRAMÁTICA

### **Gramática y Estilo:**
1. ✅ **Español correcto**: Sin errores ortográficos ni gramaticales
2. ✅ **Tono profesional pero cercano**: Como un asistente premium
3. ✅ **Directo y accionable**: Sin relleno, solo valor
4. ✅ **Empático cuando corresponde**: Roles de psicología, mindfulness, etc.

### **Formato de Respuestas:**
1. **Saludos**: Siempre ofrecer 3 opciones accionables
2. **Tareas**: Resultado → Pasos → Código (si aplica)
3. **Errores**: Mensaje claro + solución + siguiente paso
4. **Sin tarea**: Nunca decir "no hay tarea", siempre sugerir algo útil

### **Ejemplos de Respuestas Correctas:**

**❌ INCORRECTO:**
```
"Lo siento, pero no hay una tarea específica asignada. Por favor, proporciona la tarea..."
```

**✅ CORRECTO:**
```
"¡Hola! Soy Sandra IA 8.0 Pro. ¿En qué puedo ayudarte hoy?

Puedo ayudarte con:
1. 🚀 Verificar estado del sistema y servicios
2. 💻 Generar código o revisar implementaciones
3. 📊 Analizar datos o crear visualizaciones

¿Cuál prefieres?"
```

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### **Sistema Multimodal:**
- ✅ Barra estilo ChatGPT funcional
- ✅ Voz con GPT-4o, texto con GPT-4o-mini
- ✅ Barge-in funcional (interrumpir avatar)
- ✅ Avatar sincronizado audio-video
- ✅ Conversación continua sin clicks

### **Sistema de Roles:**
- ✅ 7 roles core SOE activos
- ✅ 18 roles Sandra IA 7.0 integrados
- ✅ 27 roles especializados añadidos
- ✅ 10 subagentes de marketing integrados
- ✅ Total: 62 roles profesionales

### **Calidad:**
- ✅ Prompts con gramática perfecta
- ✅ Sin respuestas genéricas
- ✅ Saludos con opciones accionables
- ✅ Tono profesional y empático

### **Rendimiento:**
- ✅ Voz: <2s latencia
- ✅ Texto: <1s latencia
- ✅ Avatar: Sincronización perfecta
- ✅ UI: Responsive y fluida

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. **FASE 1**: Sistema Multimodal Premium (Barge-in, avatar sincronizado)
2. **FASE 2**: Sistema de Roles Completo (62 roles)
3. **FASE 3**: Prompts Optimizados (gramática, estilo)
4. **FASE 4**: UX y Flujo (bienvenida, quick-actions)
5. **FASE 5**: Ruteo de Modelos (GPT-4o voz, GPT-4o-mini texto)
6. **FASE 6**: Testing y Ajustes Finales

---

## 📚 ARCHIVOS A MODIFICAR

### **Archivos Principales:**
1. `core/roles-system.js` - Sistema completo de roles
2. `core/optimized-prompts.js` - Prompts de todos los roles
3. `services/multimodal-conversation-service.js` - Barge-in, conversación continua
4. `services/heygen-service.js` - Avatar sincronizado
5. `llm-orchestrator/ai-orchestrator.js` - Ruteo de modelos
6. `desktop-app/renderer/index.html` - UI multimodal, bienvenida
7. `desktop-app/main.js` - IPC handlers para nuevos roles

### **Archivos Nuevos (si necesario):**
1. `core/marketing-subagents.js` - Subagentes de marketing
2. `services/avatar-sync-service.js` - Sincronización audio-video

---

## ✅ CHECKLIST FINAL

Antes de considerar la implementación completa:

- [ ] Sistema multimodal 100% funcional
- [ ] 62 roles implementados y probados
- [ ] Prompts con gramática perfecta
- [ ] Sin respuestas genéricas
- [ ] Barge-in funcional
- [ ] Avatar sincronizado
- [ ] Ruteo de modelos correcto
- [ ] UI responsive y fluida
- [ ] Testing completo
- [ ] Documentación actualizada

---

**¡Éxito en la implementación!** 🚀

*Este prompt maestro debe ser usado por Claude Sonnet 4.5 para implementar todas las mejoras de Sandra IA 8.0 Pro de forma sistemática y profesional.*

