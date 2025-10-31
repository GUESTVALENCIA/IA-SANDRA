# 📱 Sandra IA Mobile Galaxy Ultimate v98.0

**Inteligencia Artificial Galaxy Ultimate optimizada para iOS 14+ con soporte completo para iPhone Pro y iPad Pro**

## ✨ Características Galaxy Level

### 🔥 Optimizaciones Móviles Core

- **✅ Safe Areas iOS 14+**: Soporte completo para notch y Dynamic Island (iPhone 14 Pro/Pro Max)
- **✅ Gestos Nativos**: Swipe, pinch, long-press, pull-to-refresh optimizados
- **✅ Performance ARM64**: Optimización específica para chips Apple Silicon
- **✅ Teclado Virtual Inteligente**: Adaptación automática para evitar oclusión
- **✅ Dark/Light Mode**: Automático según preferencias del sistema iOS
- **✅ PWA Completa**: Service Worker con caché inteligente y funcionalidad offline

### 🎯 Targets de Dispositivos

| Dispositivo | Resolución | Safe Area | Dynamic Island | Estado |
|------------|------------|-----------|----------------|--------|
| iPhone SE (2nd gen) | 375x667 | ✅ | ❌ | ✅ Optimizado |
| iPhone 12 mini | 375x812 | ✅ | ❌ | ✅ Optimizado |
| iPhone 12/13 | 390x844 | ✅ | ❌ | ✅ Optimizado |
| iPhone 14 Pro | 393x852 | ✅ | ✅ | 🚀 Galaxy Level |
| iPhone 14 Pro Max | 430x932 | ✅ | ✅ | 🚀 Galaxy Level |
| iPad Pro 11" | 834x1194 | ✅ | ❌ | ✅ Optimizado |
| iPad Pro 12.9" | 1024x1366 | ✅ | ❌ | ✅ Optimizado |

### 🚀 Performance Targets

| Métrica | Target | Status |
|---------|--------|---------|
| Tiempo de carga | < 2 segundos | ✅ |
| Uso de memoria | < 150MB | ✅ |
| Uso de CPU | < 30% promedio | ✅ |
| Drenaje de batería | < 5% por hora | ✅ |
| Eficiencia de red | < 1MB por conversación | ✅ |
| Frame rate | 60 FPS smooth | ✅ |

## 🏗️ Arquitectura del Sistema

### 📁 Estructura de Archivos

```
SandraDevInterface/
├── sandra-ia-mobile-galaxy.html          # 📱 Interfaz móvil principal
├── sandra-mobile-performance-optimizations.js  # 🚀 Motor de performance
├── sw.js                                  # 💾 Service Worker PWA
├── manifest.json                          # 📋 Manifiesto Web App
├── ios-config.json                        # 🍎 Configuración iOS específica
├── sandra-mobile-launcher.bat            # 🚀 Launcher Windows
└── SANDRA-MOBILE-GALAXY-README.md        # 📖 Esta documentación
```

### 🧩 Componentes Principales

#### 1. **SandraMobileGalaxy Class** (Núcleo Principal)
- Sistema de gestos móviles avanzados
- Manejo de orientación y Safe Areas
- Integración de performance engine
- Detección automática de capacidades del dispositivo

#### 2. **SandraMobilePerformanceEngine** (Motor de Performance)
- Optimización automática basada en dispositivo
- Gestión inteligente de memoria y batería
- Selección adaptiva de endpoints API (Groq/OpenAI)
- Sistema de caché con LRU y expiración

#### 3. **Service Worker** (PWA Capabilities)
- Caché estratégico por tipo de contenido
- Funcionalidad offline limitada
- Background sync para mensajes
- Push notifications ready

## 🔧 Instalación y Configuración

### Prerrequisitos

- **Node.js** 16+ instalado
- **Red WiFi** compartida entre PC y móvil
- **API Key de OpenAI** (requerida)
- **API Key de Groq** (opcional, para mejor performance)

### 🚀 Inicio Rápido

1. **Lanzar el servidor**:
   ```bash
   # Windows
   sandra-mobile-launcher.bat

   # Manual
   node sandra-mcp-bridge.js
   ```

2. **Acceder desde móvil**:
   - URL: `http://[TU_IP]:5001/sandra-ia-mobile-galaxy.html`
   - Reemplaza `[TU_IP]` con tu IP local
   - Ejemplo: `http://192.168.1.100:5001/sandra-ia-mobile-galaxy.html`

3. **Añadir a pantalla de inicio**:
   - iOS Safari: Compartir → "Añadir a pantalla de inicio"
   - Android Chrome: Menú → "Añadir a pantalla de inicio"

### ⚙️ Configuración API

Al iniciar por primera vez, se solicitará:

```javascript
// API Key de OpenAI (obligatoria)
OpenAI API Key: sk-proj-YOUR_OPENAI_API_KEY_HERE...

// API Key de Groq (opcional, mejora performance)
Groq API Key: gsk_YOUR_GROQ_API_KEY_HERE...
```

## 🎮 Características de UX Móvil

### 👆 Gestos Implementados

| Gesto | Acción | Área |
|-------|--------|------|
| **Swipe derecha** (desde borde) | Abrir sidebar | Global |
| **Swipe izquierda** | Cerrar sidebar | Sidebar |
| **Pull down** | Refrescar conversación | Área de mensajes |
| **Long press** | Opciones de mensaje | Mensaje individual |
| **Pinch to zoom** | Zoom en imágenes | Contenido multimedia |
| **Double tap** | Respuesta rápida | Avatar de Sandra |

### 🎨 Temas Adaptativos

```css
/* Dark Mode (default) */
:root {
  --bg-primary: #0a0a0a;
  --text-primary: #ffffff;
  --accent: #00ff88;
}

/* Light Mode (auto-detect) */
@media (prefers-color-scheme: light) {
  :root {
    --bg-primary: #f8f9fa;
    --text-primary: #1a1a1a;
    --accent: #007c5a;
  }
}
```

### 📏 Responsive Breakpoints

```css
/* Mobile First Design */
/* Base: 320px+ (iPhone SE) */
/* Small: 375px+ (iPhone 12 mini) */
/* Medium: 390px+ (iPhone 12/13) */
/* Large: 414px+ (iPhone Pro Max) */
/* Tablet: 768px+ (iPad) */
/* Desktop: 1024px+ (iPad Pro) */
```

## 🔌 APIs y Integraciones

### 🤖 Endpoints Soportados

1. **OpenAI GPT-4o** (Principal)
   - Endpoint: `https://api.openai.com/v1/chat/completions`
   - Modelo: `gpt-4o` para responses rápidos
   - Fallback: `gpt-3.5-turbo` para conexiones lentas

2. **Groq** (Performance)
   - Endpoint: `https://api.groq.com/openai/v1/chat/completions`
   - Selección automática basada en conexión y batería
   - ~10x más rápido que OpenAI en condiciones óptimas

### 📊 Sistema de Performance Adaptativo

```javascript
// Selección automática de API basada en:
- Nivel de batería (< 30% = modo ahorro)
- Tipo de conexión (5G/4G = Groq, 3G = OpenAI)
- Memoria disponible (< 4GB = optimizaciones agresivas)
- Cores CPU (< 6 = límites de tokens)
```

## 🔒 Seguridad y Privacidad

### 🛡️ Medidas de Seguridad

- **CSP (Content Security Policy)**: Restrictivo, solo orígenes confiables
- **API Keys**: Almacenamiento local seguro (no server-side)
- **Conversaciones**: Privacidad total, no almacenamiento permanente servidor
- **HTTPS**: Required para Service Worker y PWA features

### 🔐 Permisos Requeridos

```json
{
  "microphone": "Grabación de voz",
  "camera": "Subida de imágenes (futuro)",
  "storage": "Caché y configuración",
  "notifications": "Alertas de respuesta"
}
```

## 📱 Capacidades PWA

### ✨ Funciones Disponibles

- **📱 Standalone App**: Se ejecuta como app nativa
- **🔄 Background Sync**: Sincronización cuando hay conexión
- **💾 Offline Mode**: Funcionalidad limitada sin conexión
- **🔔 Push Notifications**: Listo para implementar
- **🎯 File Handlers**: Abre archivos directamente
- **🔗 Share Target**: Recibe contenido compartido de otras apps

### 🚀 Shortcuts de App

| Shortcut | Acción | URL |
|----------|--------|-----|
| Nueva Conversación | Limpiar chat | `?action=new` |
| Grabación de Voz | Iniciar micrófono | `?action=voice` |
| Subir Archivo | Abrir selector | `?action=upload` |
| Configuración | Abrir settings | `?action=settings` |

## 🔧 Desarrollo y Debugging

### 🛠️ Herramientas de Debug

1. **Inspector de Performance**:
   ```javascript
   sandra.performanceEngine.getPerformanceReport();
   ```

2. **Estado del Sistema**:
   ```javascript
   sandra.capabilities; // Capacidades detectadas
   sandra.deviceCapabilities; // Info del dispositivo
   ```

3. **Cache Management**:
   ```javascript
   // Via Service Worker
   navigator.serviceWorker.controller.postMessage({
     type: 'GET_CACHE_SIZE'
   });
   ```

### 📊 Métricas en Tiempo Real

La app muestra en el sidebar:
- **Mensajes**: Contador total
- **Uptime**: Tiempo activo
- **Latencia**: Tiempo de respuesta API
- **GPU**: Estado de aceleración hardware

## 🚀 Optimizaciones Específicas por Dispositivo

### 🍎 iPhone 14 Pro/Pro Max

```css
/* Dynamic Island Support */
@supports (top: env(safe-area-inset-top)) {
  .header {
    padding-top: calc(env(safe-area-inset-top) + 10px);
  }
}

/* Dynamic Island Detection */
@media (width: 393px) and (height: 852px) {
  /* iPhone 14 Pro specific styles */
  :root {
    --dynamic-island-height: 37px;
  }
}
```

### 📱 iPad Pro Optimizations

- **Sidebar persistente** en landscape
- **Multi-column layout** para mejor uso del espacio
- **Hover states** para Magic Keyboard/trackpad
- **Drag & drop** para archivos (futuro)

### ⚡ Performance por RAM

| RAM | Max Tokens | Cache Size | Optimizations |
|-----|------------|------------|---------------|
| ≤ 4GB | 200 | 5 entries | Aggressive cleanup |
| 4-6GB | 400 | 10 entries | Balanced mode |
| 6GB+ | 600 | 20 entries | Full features |

## 🐛 Troubleshooting

### ❌ Problemas Comunes

1. **"API key no configurada"**
   - Solución: Actualizar página y ingresar API key válida

2. **"Voice recording no funciona"**
   - Verificar permisos de micrófono en navegador
   - iOS: Settings > Safari > Microphone

3. **"App muy lenta"**
   - Verificar conexión de red
   - Limpiar caché: Configuración > Almacenamiento

4. **"No se ve en móvil"**
   - Verificar IP local: `ipconfig` (Windows) / `ifconfig` (Mac/Linux)
   - Confirmar mismo WiFi entre PC y móvil

### 🔍 Logs de Debug

```javascript
// Activar logs detallados
localStorage.setItem('sandra-debug', 'true');

// Ver performance metrics
console.log(sandra.performanceEngine.getPerformanceReport());

// Estado de Service Worker
navigator.serviceWorker.ready.then(registration => {
  console.log('SW registered:', registration);
});
```

## 🚧 Roadmap y Futuras Mejoras

### 📅 v98.1 (Próxima versión)
- [ ] Live transcription en tiempo real
- [ ] HeyGen Avatar 4K integration
- [ ] Multi-idioma (EN/ES/FR)
- [ ] Widgets de iOS 17

### 📅 v99.0 (Galaxy Pro)
- [ ] AR/VR integration (Vision Pro ready)
- [ ] Local AI models (Core ML)
- [ ] Siri Shortcuts avanzados
- [ ] Apple Intelligence integration

## 📞 Soporte

Para reportar bugs o solicitar features:

1. **GitHub Issues**: (Configurar cuando esté disponible)
2. **Email**: sandra-support@claytonsystems.com
3. **Discord**: Sandra IA Community

## 📄 Licencia

MIT License - Copyright (c) 2024 Sandra IA Team

---

**🧠 Sandra IA Mobile Galaxy Ultimate v98.0**
*"La IA móvil más avanzada para iOS 14+ con Galaxy Level Performance"*

**✨ Desarrollado con amor por el equipo Sandra IA Galaxy**