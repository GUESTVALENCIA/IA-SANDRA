# SANDRA IA 7.0 - GUÍA RÁPIDA DE ROLES
## Uso del Sistema de 18 Roles

---

## 🎯 USO RÁPIDO

### API Endpoints

```javascript
// 1. CHAT LOCAL (Ollama Tiers + GROQ)
POST /.netlify/functions/chat-local
{
  "messages": [{"role": "user", "content": "tu mensaje"}],
  "role": "guests-valencia"  // ← Especifica el rol
}

// 2. CHAT CLOUD (GROQ + Claude + GPT-4o)
POST /.netlify/functions/chat
{
  "messages": [{"role": "user", "content": "tu mensaje"}],
  "role": "dev-fullstack"
}

// 3. VOICE (STT + Chat + TTS)
POST /.netlify/functions/voice
{
  "text": "tu mensaje",
  "mode": "full",
  "role": "instructora-fitness"
}
```

---

## 🎭 LISTA DE ROLES

| ID Rol | Nombre | Emoji | Uso Típico |
|--------|--------|-------|------------|
| `guests-valencia` | Recepcionista | 🏨 | Alojamientos, turismo Valencia |
| `asesora-imagen` | Asesora Imagen | 👗 | Estilismo, moda, marca personal |
| `instructora-fitness` | Instructora Fitness | 💪 | Ejercicio, yoga, bienestar |
| `dev-fullstack` | Desarrolladora | 👩‍💻 | Programación, debugging, tech |
| `marketing-digital` | Marketing | 📱 | Estrategias digitales, SEO, ads |
| `community-manager` | Community Manager | 💬 | Redes sociales, engagement |
| `instructora-idiomas` | Instructora Idiomas | 🌍 | Aprendizaje de idiomas |
| `psicologa-apoyo` | Psicóloga Apoyo | 🧠 | Apoyo emocional, ansiedad |
| `sexologa-educativa` | Sexóloga | 💕 | Educación sexual, salud |
| `finanzas-personales` | Finanzas | 💰 | Ahorro, inversión, presupuesto |
| `yoga-mindfulness` | Yoga & Mindfulness | 🧘‍♀️ | Meditación, yoga, paz interior |
| `abogada-orientadora` | Abogada | ⚖️ | Orientación legal básica |
| `cripto-experta` | Cripto Expert | ₿ | Blockchain, Bitcoin, DeFi |
| `creadora-contenido` | Creadora | 🎥 | YouTube, TikTok, contenido |
| `asistente-investigacion` | Investigación | 📚 | Research, análisis, datos |
| `logistica-organizacion` | Logística | 📋 | Proyectos, productividad |
| `analista-ia-tech` | IA & Tech | 🤖 | Inteligencia artificial, trends |
| `coach-emprendimiento` | Coach Emprendimiento | 🚀 | Startups, negocios, validación |

---

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Recepcionista (Default)

```bash
curl -X POST https://sandrita-ia.netlify.app/.netlify/functions/chat-local \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hola, busco alojamiento para 2 personas"}
    ]
  }'
```

**Respuesta esperada:**
```json
{
  "text": "¡Hola! 😊 Perfecto, te ayudo a encontrar alojamiento ideal para 2 personas.\n\n¿Para qué fechas buscas? Y si me dices qué zona de Valencia prefieres, mejor. Tenemos opciones cerca de la playa, centro histórico o zonas residenciales.\n\n¿Qué te viene mejor?",
  "provider": "Qwen 2.5:7b",
  "tier": 1,
  "role": "guests-valencia"
}
```

---

### Ejemplo 2: Desarrolladora

```bash
curl -X POST https://sandrita-ia.netlify.app/.netlify/functions/chat-local \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Mi API REST devuelve 500, cómo debugueo"}
    ],
    "role": "dev-fullstack"
  }'
```

**Respuesta esperada:**
```json
{
  "text": "Vale, vamos a diagnosticar esto paso a paso. 🔍\n\nPrimero, dime:\n1. ¿Qué error exacto ves en los logs?\n2. ¿Es en desarrollo o producción?\n3. ¿Cambiaste algo recientemente?\n\nMientras, revisa:\n- Logs del servidor (console.error)\n- Variables de entorno\n- Conexión a base de datos\n\nCuéntame y resolvemos. 👩‍💻",
  "provider": "Qwen 2.5:7b",
  "tier": 1,
  "role": "dev-fullstack"
}
```

---

### Ejemplo 3: Instructora Fitness

```bash
curl -X POST https://sandrita-ia.netlify.app/.netlify/functions/chat-local \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Quiero perder peso pero no tengo tiempo"}
    ],
    "role": "instructora-fitness"
  }'
```

**Respuesta esperada:**
```json
{
  "text": "¡Entiendo perfectamente! 💪😊 La buena noticia: NO necesitas horas de gimnasio.\n\nMi plan exprés:\n1. 20 min de HIIT (3 veces/semana)\n2. Camina 10 min después de comer\n3. Sube escaleras en vez de ascensor\n\n¿Puedes hacer ejercicio en casa o prefieres al aire libre? Te doy rutina específica. 🏃‍♀️✨",
  "provider": "Qwen 2.5:7b",
  "tier": 1,
  "role": "instructora-fitness"
}
```

---

### Ejemplo 4: Voice con Rol

```bash
curl -X POST https://sandrita-ia.netlify.app/.netlify/functions/voice \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Cómo empiezo a meditar",
    "mode": "tts",
    "role": "yoga-mindfulness"
  }'
```

**Respuesta esperada:**
```json
{
  "text": "Namaste 🙏✨ Qué hermoso que quieras comenzar con meditación.\n\nEmpecemos simple:\n1. Siéntate cómoda, espalda recta\n2. Cierra los ojos suavemente\n3. Respira natural, solo observa\n4. 5 minutos es perfecto para empezar\n\nNo busques 'vaciar la mente'. Solo observa tus pensamientos sin juzgar.\n\n¿Prefieres meditación guiada o en silencio? 🧘‍♀️💙",
  "audio": "base64_audio_data...",
  "mime": "audio/wav",
  "role": "yoga-mindfulness"
}
```

---

## 🔄 ROL DEFAULT

Si no especificas rol, el sistema usa **`guests-valencia`** por defecto:

```javascript
// Sin rol especificado
{
  "messages": [{"role": "user", "content": "Hola"}]
}
// ↓
// Sistema usa: role = "guests-valencia"
```

---

## ✅ VALIDACIÓN DE ROLES

Si envías un rol inválido, el sistema:

1. Registra warning en logs
2. Usa `guests-valencia` como fallback
3. Continúa funcionando normalmente

```javascript
// Rol inválido
{
  "role": "rol-inexistente"
}
// ↓
// Sistema usa: role = "guests-valencia"
```

---

## 🎨 PERSONALIZACIÓN DE RESPUESTAS

Cada rol tiene:

### 1. Tono Único
- **Recepcionista:** Profesional, cálida
- **Desarrolladora:** Técnica, paciente
- **Fitness:** Motivadora, energética
- **Psicóloga:** Empática, sin juicio

### 2. Emojis Adaptados
- **Profesional:** ✨😊👍✅
- **Casual:** 😄🎉💙
- **Técnico:** 🔍💻🔧
- **Cálido:** 🥰💕❤️

### 3. Especialización
Cada rol tiene conocimiento profundo de su área.

---

## 📝 AGREGAR NUEVO ROL

### Paso 1: Editar `sandra-prompts.js`

```javascript
ROLE_PROMPTS = {
  // ... roles existentes ...

  'nuevo-rol': `ROL ESPECÍFICO: Título

CONTEXTO:
Descripción del contexto.

TUS RESPONSABILIDADES:
- Responsabilidad 1
- Responsabilidad 2

TONO: Descripción del tono

EJEMPLOS:
Usuario: "Pregunta"
Tú: "Respuesta"`
};
```

### Paso 2: ¡Listo!

El sistema automáticamente:
- Lo valida
- Lo integra en todas las funciones
- Lo hace disponible en toda la arquitectura

---

## 🧪 TESTING RÁPIDO

```bash
# Test todos los roles
for role in guests-valencia dev-fullstack instructora-fitness; do
  curl -X POST https://sandrita-ia.netlify.app/.netlify/functions/chat-local \
    -H "Content-Type: application/json" \
    -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Hola\"}],\"role\":\"$role\"}" \
    | jq '.role'
done
```

---

## 📊 LOGS Y DEBUG

Los logs incluyen el rol activo:

```
[INFO] Processing chat request {
  "messageCount": 1,
  "userMessage": "Hola",
  "role": "dev-fullstack"
}
```

---

## 🔒 HEADERS CORS

Frontend debe incluir (opcional):

```javascript
fetch('/.netlify/functions/chat-local', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Sandra-Role': 'dev-fullstack'  // ← Opcional
  },
  body: JSON.stringify({
    messages: [...],
    role: 'dev-fullstack'  // ← Este es el importante
  })
});
```

---

## 🚀 PERFORMANCE

### Cache por Rol

El sistema cachea respuestas diferenciadas por rol:

```javascript
// Cache key incluye rol
cache_key = "dev-fullstack:Mi API no funciona"
cache_key = "guests-valencia:Busco alojamiento"
```

Esto evita conflictos entre roles.

---

## 📚 DOCUMENTACIÓN COMPLETA

Ver: `SANDRA-ADN-BASE-IMPLEMENTATION.md`

---

**FIN DE GUÍA RÁPIDA**
