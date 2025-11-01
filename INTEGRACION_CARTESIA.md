# 🎙️ Integración de Cartesia TTS - Sandra IA

## ✅ Endpoint Creado

### **API Endpoint:**
```
POST /api/cartesia-tts
```

### **Parámetros:**
```json
{
  "text": "Texto a convertir a voz",
  "voice": "sandra",           // Opcional: sandra, spanish, english
  "model": "sonic-english",     // Opcional
  "language": "es",             // Opcional: es, en
  "sampleRate": 22050,          // Opcional
  "format": "mp3"               // Opcional: pcm, mp3, wav
}
```

### **Respuesta:**
- **Content-Type:** `audio/mpeg`, `audio/wav`, o `audio/pcm`
- **Body:** Buffer de audio binario

---

## 🔑 API Key Configurada

La API key de Cartesia está configurada:
- **Variable de entorno:** `CARTESIA_API_KEY`
- **Valor:** `sk_car_67c5Tg8LMpR9G6unHvsvnw`

**Asegúrate de agregarla en Vercel:**
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Agrega: `CARTESIA_API_KEY` = `sk_car_67c5Tg8LMpR9G6unHvsvnw`

---

## 📋 Uso en el Sistema

### **1. En Twilio Voice:**
Cartesia ya está integrada en `twilio-voice-process.js` para generar respuestas de voz.

### **2. En Frontend:**
Puedes llamar al endpoint directamente:

```javascript
const response = await fetch('https://sandra.guestsvalencia.es/api/cartesia-tts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Hola, soy Sandra, tu asistente virtual.',
    voice: 'sandra',
    format: 'mp3'
  })
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
audio.play();
```

### **3. En el Orchestrator:**
El sistema multimodal puede usar Cartesia a través del endpoint:

```javascript
const audioBuffer = await fetch('/api/cartesia-tts', {
  method: 'POST',
  body: JSON.stringify({ text: responseText })
}).then(r => r.arrayBuffer());
```

---

## 🎯 Voces Disponibles

- **sandra** (sonic-english) - Voz principal de Sandra
- **spanish** (sonic-spanish) - Para español
- **english** (sonic-english) - Para inglés

---

## ⚙️ Formatos Soportados

- **pcm** - Formato sin comprimir (mejor calidad)
- **mp3** - Formato comprimido (recomendado para web)
- **wav** - Formato sin comprimir (compatible universal)

---

## 📊 Características

✅ **Alta calidad de voz**
✅ **Latencia baja** (< 2 segundos)
✅ **Múltiples idiomas** (español e inglés)
✅ **Múltiples formatos** (PCM, MP3, WAV)
✅ **Configuración de sample rate**

---

## 🧪 Testing

### **Test con cURL:**
```bash
curl -X POST https://sandra.guestsvalencia.es/api/cartesia-tts \
  -H "Content-Type: application/json" \
  -d '{"text":"Hola mundo","voice":"sandra","format":"mp3"}' \
  --output audio.mp3
```

### **Test en Node.js:**
```javascript
const axios = require('axios');
const fs = require('fs');

const response = await axios.post(
  'https://sandra.guestsvalencia.es/api/cartesia-tts',
  {
    text: 'Hola, soy Sandra.',
    voice: 'sandra',
    format: 'mp3'
  },
  { responseType: 'arraybuffer' }
);

fs.writeFileSync('test-audio.mp3', response.data);
```

---

## 🔗 Integración Completa

Cartesia está integrada en:
- ✅ `api/cartesia-tts.js` - Endpoint directo
- ✅ `api/twilio-voice-process.js` - Para llamadas telefónicas
- ✅ `orchestrator/sandra-nucleus-core.js` - Configuración central

---

**¡Cartesia TTS completamente integrado y funcional!** 🎉🎙️

