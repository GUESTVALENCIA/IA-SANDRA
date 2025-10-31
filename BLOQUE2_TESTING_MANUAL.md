# 🧪 BLOQUE 2: TESTING MANUAL - GUÍA

## 📋 CHECKLIST DE TESTING MANUAL

### 🌐 TESTING PWA WEB (Sandra IA 7.0)

**URL**: https://sandra.guestsvalencia.es

#### Test 1: Carga Inicial
- [ ] Abrir URL en navegador
- [ ] Verificar que carga sin errores 404/500
- [ ] Verificar que UI se muestra correctamente
- [ ] Verificar que hay mensaje de bienvenida de Sandra

#### Test 2: Console y Conectividad
1. Abrir DevTools (F12)
2. Ir a Console tab
3. Verificar mensajes:
   - [ ] "Sandra API initialized"
   - [ ] "[API Client] Initialized"
   - [ ] "[ResilientAI] Initialized"
   - [ ] "[SW] Service Worker registered"
4. Ir a Network tab
5. Verificar requests:
   - [ ] `/.netlify/functions/health` → 200 OK
   - [ ] Sin errores CORS (rojos)

#### Test 3: Chat Funcional
1. Escribir mensaje: "Hola Sandra"
2. Click en enviar
3. Verificar:
   - [ ] Mensaje aparece en chat
   - [ ] Indicador "Sandra está pensando..." aparece
   - [ ] Respuesta de Sandra aparece
   - [ ] Respuesta es coherente (no "dificultades técnicas")

#### Test 4: Service Worker
1. DevTools → Application tab
2. Service Workers:
   - [ ] Service Worker registrado
   - [ ] Estado: activated
   - [ ] Sin errores

#### Test 5: PWA Installation
1. Verificar icono de instalación en navegador (si aplica)
2. Intentar instalar como PWA
3. Verificar:
   - [ ] Manifest válido
   - [ ] Iconos cargan
   - [ ] PWA instalable

---

### 🖥️ TESTING APP DESKTOP (Electron)

#### Test 1: Inicialización
1. Abrir aplicación desktop
2. Verificar:
   - [ ] App inicia sin errores
   - [ ] UI carga correctamente
   - [ ] No pantalla en blanco

#### Test 2: Console y Seguridad
1. Abrir DevTools (Ctrl+Shift+I)
2. Console tab:
   - [ ] "[MAIN] Registering IPC handlers..."
   - [ ] "[PRELOAD] Secure IPC bridge initialized"
   - [ ] Sin errores de seguridad
3. Verificar:
   - [ ] No errores "contextIsolation"
   - [ ] No errores "nodeIntegration"

#### Test 3: Conexión Orchestrator
1. Verificar que status dice "Conectado" o "Online"
2. Verificar que servicios muestran estado
3. Sin mensaje "Error de Conexión"

#### Test 4: Chat en Desktop
1. Escribir: "Hola Sandra"
2. Enviar
3. Verificar:
   - [ ] Mensaje enviado
   - [ ] Respuesta recibida
   - [ ] Sin errores en console

#### Test 5: Reset Services
1. Abrir sidebar
2. Click "Reiniciar Servicios"
3. Verificar:
   - [ ] Botón funciona (no bloqueado)
   - [ ] Servicios se reinician
   - [ ] Sin error "No handler registered"

---

### 📊 TESTING MONITORING

#### Sentry (Si configurado)
- [ ] Ir a Sentry dashboard
- [ ] Verificar que eventos se capturan
- [ ] Verificar transacciones aparecen

#### Netlify Functions Logs
1. Netlify Dashboard → Functions
2. Verificar:
   - [ ] Logs de invocaciones
   - [ ] Sin errores críticos
   - [ ] Latencia aceptable

#### Error Monitoring Dashboard
1. En navegador: Ctrl+Shift+E
2. Verificar:
   - [ ] Dashboard aparece
   - [ ] Errores se registran (si hay)
   - [ ] Métricas visibles

---

## ✅ RESULTADO FINAL

**Tests Automatizados**: 4/6 pasaron, 2 advertencias  
**Tests Manuales**: Ejecutar según checklist arriba

**Estado**: ⏳ **TESTING EN PROGRESO**

---

**Ejecutar manualmente y reportar resultados** 🧪

