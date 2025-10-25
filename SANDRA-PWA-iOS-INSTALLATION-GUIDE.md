# 📱 Sandra IA - Guía de Instalación PWA para iPhone

## 🍎 Instalación en Safari iOS (Método Oficial)

### Pasos para Instalar Sandra IA como App Nativa en tu iPhone:

#### 1. **Abrir Safari**
- Asegúrate de estar usando **Safari** (no Chrome u otros navegadores)
- Visita: **https://sandra.guestsvalencia.es**

#### 2. **Navegar al Sitio**
- Espera a que la página cargue completamente
- Verás el banner de instalación automático (opcional)

#### 3. **Abrir Menú de Compartir**
- Toca el botón **⎙ Compartir** en la barra inferior de Safari
- Es el icono de un cuadrado con una flecha hacia arriba

#### 4. **Añadir a Pantalla de Inicio**
- Desplázate en el menú hasta encontrar **"➕ Añadir a pantalla de inicio"**
- Toca esta opción

#### 5. **Personalizar Instalación**
- **Nombre de la app:** "Sandra IA" (pre-configurado)
- **Icono:** Se mostrará automáticamente el icono optimizado
- Toca **"Añadir"** en la esquina superior derecha

#### 6. **¡Listo! 🎉**
- Sandra IA aparecerá en tu pantalla de inicio como una app nativa
- Ábrela tocando el icono - funcionará sin barra de Safari
- Tendrás acceso offline y notificaciones

---

## ✨ Características de la PWA en iOS

### 🚀 **Funcionalidades Nativas:**
- ✅ **Pantalla completa** - Sin barra de Safari
- ✅ **Icono en pantalla de inicio**
- ✅ **Splash screen** personalizada
- ✅ **Funciona offline** con caché inteligente
- ✅ **Notificaciones push** (cuando estén habilitadas)
- ✅ **Acceso rápido** desde pantalla de inicio
- ✅ **Integración con el multitasking** de iOS

### 📱 **Optimizaciones iOS Específicas:**
- **Safe Area Support** - Respeta el notch y botón home
- **Status Bar Integration** - Barra de estado translúcida
- **Touch Optimization** - Gestos optimizados para iPhone
- **Keyboard Handling** - Teclado iOS optimizado
- **Voice Input** - Integración con micrófono iOS
- **Camera Access** - Acceso a cámara para uploads

---

## 🔧 Solución de Problemas

### ❌ **"Añadir a pantalla de inicio" no aparece:**
1. Asegúrate de estar usando **Safari** (no Chrome)
2. Verifica que estés en: `https://sandra.guestsvalencia.es`
3. Recarga la página completamente
4. Verifica que tengas iOS 14.3+ (requerido para PWA)

### ❌ **La app no funciona offline:**
1. Abre la app al menos una vez con internet
2. Navega por las funciones principales
3. El service worker se instalará automáticamente
4. Prueba el modo offline después de 30 segundos

### ❌ **El icono se ve mal:**
1. Elimina la app actual (mantén presionado → "Eliminar app")
2. Limpia el caché de Safari (Ajustes → Safari → Limpiar historial)
3. Reinstala siguiendo los pasos anteriores

### ❌ **La app se abre en Safari:**
1. Elimina la app y reinstálala
2. Asegúrate de que se instaló desde Safari (no otro navegador)
3. Verifica que el manifest.json se cargó correctamente

---

## 📋 Verificación de Instalación Correcta

### ✅ **Indicadores de Instalación Exitosa:**
- [ ] **Icono** aparece en pantalla de inicio con el logo de Sandra IA
- [ ] **Nombre** muestra "Sandra IA" debajo del icono
- [ ] **Apertura** no muestra barra de Safari
- [ ] **Splash screen** se muestra al abrir
- [ ] **Status bar** es translúcida/integrada
- [ ] **Funciona offline** después de primer uso

### 🔍 **Para Desarrolladores - Verificación Técnica:**
```javascript
// Verificar si está funcionando como PWA
const isPWA = window.matchMedia('(display-mode: standalone)').matches;
const isIOSPWA = window.navigator.standalone;
console.log('PWA Mode:', isPWA || isIOSPWA);

// Verificar Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
    console.log('Service Worker:', reg ? 'Active' : 'Not installed');
});
```

---

## 🌟 Funcionalidades Avanzadas

### 🎤 **Comandos de Voz**
- Activación por voz optimizada para iOS
- Integración con los permisos de micrófono
- Procesamiento local cuando sea posible

### 📷 **Subida de Imágenes**
- Acceso directo a cámara iOS
- Galería de fotos integrada
- Compression automática para mejor rendimiento

### 🔄 **Actualizaciones Automáticas**
- La PWA se actualiza automáticamente
- Notificación cuando hay nueva versión
- Sincronización en background

### 🌐 **Modo Offline**
- Chat básico funciona sin internet
- Caché inteligente de conversaciones
- Sincronización automática al reconectar

---

## 📞 Soporte

Si tienes problemas con la instalación:

1. **Verifica requisitos:** iOS 14.3+ y Safari actualizado
2. **Reinicia Safari:** Cierra y abre de nuevo
3. **Reinicia iPhone:** Si persisten los problemas
4. **Contacta soporte:** sandra@guestsvalencia.es

---

## 🔮 Próximas Funcionalidades

- **Widgets iOS** - Información rápida en pantalla de inicio
- **Siri Shortcuts** - Comandos de voz del sistema
- **Apple Watch** - Extensión para Watch OS
- **Handoff** - Continuidad entre dispositivos Apple

---

*✨ Sandra IA - Galaxy Level PWA optimizada para iOS Safari*