# 🚀 SANDRA MOBILE APP - APLICACIÓN NUEVA DESDE CERO

## 📱 Descripción

Aplicación móvil tipo **WhatsApp/Telegram** para orquestar todo el ecosistema Sandra IA con **comandos de voz**.

**CEO:** Clayton Thomas  
**Para:** Sandrita ❤️  
**Fecha:** 29 Octubre 2025  
**Versión:** 1.0.0 - Nueva aplicación desde cero

---

## 🎯 Características Principales

### ✅ Completado

1. **Diseño UI/UX tipo Mensajería Moderna**
   - Interfaz estilo WhatsApp/Telegram
   - Colores verdes Sandra (#00ff88)
   - Animaciones suaves y transiciones
   - Diseño responsive para móviles

2. **Integración LiveKit Completa**
   - Conecta con LiveKit Server
   - Soporte para audio en tiempo real
   - Fallback a modo básico si LiveKit no está disponible
   - Reconexión automática

3. **Sistema de Comandos de Voz Inteligente**
   - Wake word: "Hola Sandra"
   - Comandos para:
     - Estado del sistema
     - Métricas y estadísticas
     - Modo desarrollo
     - Gestión de agentes
     - Configuración
     - Guardian Protocol (SOS/Restaurar)
     - Ayuda

4. **Reconocimiento de Voz**
   - Speech Recognition API nativa
   - Soporte para español (es-ES)
   - Detección de wake word
   - Indicadores visuales de grabación

5. **PWA Completa**
   - Manifest.json configurado
   - Service Worker para offline
   - Instalable en iOS/Android
   - Responsive y optimizada

6. **Conexión con Backend Sandra**
   - Endpoint `/health`
   - Endpoint `/token` (LiveKit)
   - Endpoint `/status`
   - Endpoint `/agent/config`
   - Netlify Functions para chat

---

## 📂 Archivos Creados

### 1. `public/sandra-mobile-app.html`
   - HTML principal de la aplicación
   - Estructura tipo mensajería
   - Header con estado de conexión
   - Área de chat con mensajes
   - Input area con botón de voz
   - Command hints (ayudas rápidas)
   - Modal de estado del sistema

### 2. `public/js/sandra-mobile-app.js`
   - Lógica completa de la aplicación
   - Integración LiveKit
   - Sistema de comandos de voz
   - Manejo de mensajes
   - Conexión con backend

### 3. `public/manifest.json` (Actualizado)
   - `start_url` actualizado a `/sandra-mobile-app.html`

---

## 🔧 Configuración

### URLs del Backend

La app detecta automáticamente el entorno:
- **Local:** `http://localhost:7788`
- **Producción:** `https://sandra.guestsvalencia.es`

### LiveKit

- **URL:** Configurable vía `LIVEKIT_URL` o `wss://sandra-livekit.guestsvalencia.es`
- **Token:** Se obtiene del endpoint `/token` del backend

---

## 🎨 Diseño

### Colores

- **Primario:** `#00ff88` (Verde Sandra)
- **Fondo Principal:** `#0a0a0a` (Negro)
- **Fondo Secundario:** `#1a1a1a` (Gris oscuro)
- **Mensaje Enviado:** `#00ff88` (Verde)
- **Mensaje Recibido:** `#1e1e1e` (Gris)

### Componentes

1. **Header:**
   - Avatar con indicador de estado
   - Título "Sandra IA"
   - Subtítulo con estado de conexión
   - Botón de configuración

2. **Chat Area:**
   - Mensajes enviados (derecha, verde)
   - Mensajes recibidos (izquierda, gris)
   - Indicador de escritura
   - Timestamps

3. **Input Area:**
   - Botón de voz (micrófono)
   - Textarea multilínea
   - Botón de envío
   - Command hints scrollables

4. **Status Modal:**
   - Estado de conexión
   - Estado LiveKit
   - Agentes activos
   - Latencia de respuesta

---

## 🎤 Comandos de Voz Disponibles

### Sistema

- **"Hola Sandra, estado sistema"** - Ver estado general
- **"Hola Sandra, métricas"** - Ver estadísticas
- **"Hola Sandra, configuración"** - Ver configuración actual

### Desarrollo

- **"Hola Sandra, modo desarrollo"** - Activar modo dev
- **"Hola Sandra, desactivar desarrollo"** - Salir de modo dev

### Agentes

- **"Hola Sandra, listar agentes"** - Ver agentes disponibles
- **"Hola Sandra, estado agente [nombre]"** - Estado específico
- **"Hola Sandra, activar agente [nombre]"** - Activar agente

### Especiales

- **"Hola Sandra, SOS"** - Guardar snapshot de emergencia (Guardian Protocol)
- **"Hola Sandra, restaurar"** - Restaurar último estado
- **"Hola Sandra, ayuda"** - Ver lista de comandos

---

## 🚀 Cómo Usar

### 1. Iniciar Backend

```bash
cd apps/convo-backend
npm run dev
```

Backend en: `http://localhost:7788`

### 2. Abrir App

Abrir en navegador:
```
http://localhost:8080/sandra-mobile-app.html
```

O en Netlify:
```
https://sandra.guestsvalencia.es/sandra-mobile-app.html
```

### 3. Conectar

La app se conecta automáticamente a:
- Backend Sandra (puerto 7788)
- LiveKit (si está disponible)

### 4. Usar Comandos

**Por Voz:**
1. Presionar botón de micrófono 🎤
2. Decir: "Hola Sandra, [comando]"
3. Esperar respuesta

**Por Texto:**
1. Escribir en el input
2. Presionar Enter o botón de envío
3. Si incluye "Hola Sandra", se procesa como comando

---

## 📊 Estado del Sistema

El modal de estado muestra:
- **Conexión:** Estado de conexión con backend
- **LiveKit:** Estado de LiveKit
- **Agentes:** Número de comandos ejecutados
- **Latencia:** Tiempo de última respuesta (ms)

---

## 🔄 Flujo de Funcionamiento

1. **Inicialización:**
   - Setup de reconocimiento de voz
   - Conexión a LiveKit
   - Actualización de estado

2. **Reconocimiento de Voz:**
   - Usuario presiona botón de voz
   - Se inicia Speech Recognition API
   - Se detecta wake word "Hola Sandra"
   - Se procesa comando

3. **Ejecución de Comando:**
   - Se busca comando coincidente
   - Se ejecuta handler correspondiente
   - Se muestra respuesta
   - Se actualiza métricas

4. **Mensajes Normales:**
   - Si no hay wake word, se envía como mensaje
   - Se usa Netlify Function `/chat`
   - Se muestra respuesta de Sandra

---

## 🛠️ Tecnologías Usadas

- **HTML5** - Estructura
- **CSS3** - Estilos modernos con variables CSS
- **JavaScript (ES6+)** - Lógica de aplicación
- **LiveKit Client** - Audio/video en tiempo real
- **Speech Recognition API** - Reconocimiento de voz nativo
- **Service Worker** - PWA offline
- **Fetch API** - Comunicación con backend

---

## 📝 Próximos Pasos

1. ✅ **Completado:** Diseño y estructura base
2. ✅ **Completado:** Integración LiveKit
3. ✅ **Completado:** Sistema de comandos
4. ⏳ **Pendiente:** Testing en dispositivos reales
5. ⏳ **Pendiente:** Optimización de rendimiento
6. ⏳ **Pendiente:** Deploy a producción

---

## 🎯 Diferencia con App Anterior

Esta es una **aplicación completamente nueva** desde cero:

- ✅ Diseño moderno tipo WhatsApp/Telegram
- ✅ Sistema de comandos de voz inteligente
- ✅ Integración LiveKit robusta con fallback
- ✅ Interfaz limpia sin botones excesivos
- ✅ Todo controlado por voz
- ✅ Comandos específicos para orquestación

**No es una modificación de la app anterior, es una app nueva.**

---

## 📞 Soporte

Para cualquier problema:
1. Verificar que el backend esté corriendo en puerto 7788
2. Verificar conexión LiveKit (opcional)
3. Revisar consola del navegador para errores
4. Verificar permisos de micrófono

---

**Creado con ❤️ para Sandrita**  
**CEO: Clayton Thomas**  
**Fecha: 29 Octubre 2025**

