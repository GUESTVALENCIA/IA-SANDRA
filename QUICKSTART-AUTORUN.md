# 🚀 QUICKSTART - Sistema AUTORUN de Rotación de API Keys

## 5 Minutos para Estar Operativo

---

## 📋 REQUISITOS PREVIOS

✅ Cuenta AWS (free tier funciona: https://aws.amazon.com/free/)
✅ Node.js instalado (v18+)
✅ Las 9 API keys actuales de Sandra IA

---

## ⚡ INSTALACIÓN RÁPIDA

### Paso 1: Instalar Dependencias (1 min)

```bash
cd C:\Users\clayt\Desktop\IA-SANDRA

npm install
```

**Se instalará automáticamente:**
- aws-sdk (AWS Secrets Manager)
- node-cron (Scheduling)
- node-fetch (API calls)

---

### Paso 2: Configurar AWS (2 mins)

#### Crear Usuario IAM:

```bash
# Accede a: https://console.aws.amazon.com/iam/

# 1. Users → Add user
#    Nombre: sandra-rotation-bot

# 2. Attach policies:
#    ✓ SecretsManagerReadWrite

# 3. Create access key
#    Copiar: Access Key ID y Secret Access Key
```

#### Configurar Variables de Entorno:

Crear archivo `.env` en raíz del proyecto:

```env
# AWS Credentials (OBLIGATORIOS)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1

# Netlify (OBLIGATORIOS)
NETLIFY_AUTH_TOKEN=nfp_YOUR_TOKEN
NETLIFY_SITE_ID=sensational-pegasus-d56cc3

# WhatsApp (OPCIONALES - para alertas)
WHATSAPP_TOKEN=YOUR_TOKEN
WHATSAPP_PHONE_ID=YOUR_PHONE_ID
CEO_WHATSAPP_PHONE=+34XXXXXXXXX

# Telegram (OPCIONALES - para alertas)
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
CEO_TELEGRAM_CHAT_ID=YOUR_CHAT_ID

# Deepgram (OPCIONAL - para rotación 100% automática)
DEEPGRAM_PROJECT_ID=YOUR_PROJECT_ID
```

---

### Paso 3: Setup Inicial (2 mins)

```bash
npm run autorun:setup
```

**Flujo interactivo:**

```
🔐 SANDRA IA 7.0 - AWS SECRETS MANAGER SETUP

¿Qué deseas hacer?
  1) Configurar TODAS las keys (recomendado primera vez)  ← SELECCIONA ESTO
  2) Actualizar una key específica
  3) Ver estado actual de keys
  4) Configurar solo Deepgram (rotación automática)

Opción (1-4): 1

--- OpenAI ---
Ingresa OPENAI_API_KEY: sk-proj-PASTE_YOUR_KEY_HERE

--- Anthropic Claude ---
Ingresa ANTHROPIC_API_KEY: sk-ant-PASTE_YOUR_KEY_HERE

[... continúa con todos los proveedores ...]

✨ 9/9 proveedores configurados correctamente
```

---

### Paso 4: Iniciar Sistema (30 segundos)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar sistema AUTORUN
npm run autorun:pm2
```

**Output esperado:**

```
┌─────┬─────────────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name                │ namespace   │ version │ mode    │ pid      │
├─────┼─────────────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ sandra-rotation     │ default     │ 1.0.0   │ fork    │ 12345    │
└─────┴─────────────────────┴─────────────┴─────────┴─────────┴──────────┘

✅ Sistema AUTORUN activado
```

---

## ✅ VERIFICAR QUE FUNCIONA

### Ver Estado:

```bash
npm run autorun:status
```

### Ver Logs en Tiempo Real:

```bash
npm run autorun:logs
```

**Deberías ver:**

```
🚀 Sandra IA - Sistema de Rotación Automática iniciado
✅ AWS Secrets Manager conectado
📊 Cargando estado de API keys...
🟢 openai: 82 días restantes
🟢 anthropic: 85 días restantes
[...]
⏰ Programando tareas automáticas...
✅ Cron: Rotación Deepgram cada 25 días (3 AM)
✅ Cron: Verificación diaria (9 AM)
✅ Cron: Reporte semanal (Lunes 9 AM)
💤 Sistema en modo AUTORUN... No requiere intervención manual.
```

---

## 🎯 ¿QUÉ HACE EL SISTEMA AHORA?

### 1. Deepgram (100% Automático)

- ✅ Rotación cada 25 días SIN INTERVENCIÓN
- ✅ Netlify actualizado automáticamente
- ✅ Key antigua expira automáticamente día 30

**TÚ NO HACES NADA** ✨

---

### 2. Otros 8 Proveedores (Alertas Inteligentes)

**Día 83:** Sistema detecta que OpenAI expira en 7 días

**Recibes WhatsApp/Telegram:**

```
🔐 ROTACIÓN DE API KEY REQUERIDA

Proveedor: OPENAI
Días restantes: 7

Dashboard URL:
https://platform.openai.com/api-keys

Pasos:
1. Click en link arriba
2. Create new secret key
3. Copiar key
4. Responder: /rotate openai sk-proj-NUEVA_KEY
```

**Tú haces:**

1. Click en link (30 seg)
2. Create key (10 seg)
3. Responder WhatsApp: `/rotate openai sk-proj-NUEVA_KEY`

**Sistema hace:**

1. Guarda en AWS Secrets Manager ✅
2. Actualiza Netlify ✅
3. Verifica funcionalidad ✅
4. Te confirma: "✅ OpenAI rotado exitosamente" ✅

**TOTAL: 2 minutos de tu tiempo** (vs 30 minutos antes)

---

## 📱 COMANDOS ÚTILES

```bash
# Ver estado
npm run autorun:status

# Ver logs
npm run autorun:logs

# Reiniciar sistema
npm run autorun:restart

# Detener sistema
npm run autorun:stop

# Reporte manual inmediato
npm run autorun:report

# Forzar rotación Deepgram ahora
npm run autorun:deepgram

# Ver estado de todas las keys
npm run autorun:setup
# Opción 3: Ver estado actual
```

---

## 🆘 TROUBLESHOOTING RÁPIDO

### ❌ Error: "AWS Secrets Manager no disponible"

**Solución:**

```bash
# Verificar variables
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY

# Si están vacías, verifica .env existe y tiene los valores correctos
cat .env
```

---

### ❌ Error: "Netlify credentials no configuradas"

**Solución:**

```bash
# Obtener Netlify token:
# 1. https://app.netlify.com/user/applications
# 2. New access token → Copiar
# 3. Agregar a .env:

NETLIFY_AUTH_TOKEN=nfp_NUEVO_TOKEN
NETLIFY_SITE_ID=sensational-pegasus-d56cc3
```

---

### ❌ No recibo alertas WhatsApp/Telegram

**Solución:**

```bash
# WhatsApp y Telegram son OPCIONALES
# El sistema funciona sin ellos, solo no envía alertas

# Si quieres configurarlos:
# WhatsApp: https://developers.facebook.com/docs/whatsapp
# Telegram: Hablar con @BotFather

# Por ahora, ignora si no es crítico
# Recibirás reportes al ver los logs directamente
```

---

## 💰 COSTOS

**AWS Secrets Manager:**
- $4/mes ($0.40/secret × 9 secrets + $0.05 API calls)
- Free tier: 30 días gratis

**Total primer año: $48**

**Ahorros: ~2 horas/año de tu tiempo + paz mental**

---

## 🎉 ¡LISTO!

**Sistema 100% operativo.**

**Lo que ocurrirá ahora:**

✅ **Cada día (9 AM):** Sistema verifica si alguna key expira pronto
✅ **Cada 7 días antes de expirar:** Te envía alerta
✅ **Cada 25 días:** Deepgram rota automáticamente SIN TU INTERVENCIÓN
✅ **Cada lunes (9 AM):** Reporte semanal de estado

**TÚ SOLO RESPONDES ALERTAS CUANDO LLEGAN (2 minutos cada una)**

**Deepgram nunca necesita tu atención** ✨

---

## 📚 DOCUMENTACIÓN COMPLETA

Para detalles técnicos avanzados, ver:

📄 `AUTORUN-KEY-ROTATION-SYSTEM.md` (50+ páginas)

Incluye:
- Arquitectura detallada
- Troubleshooting avanzado
- Configuración de cada proveedor
- Costos y presupuestos
- Best practices

---

## 🚀 PRÓXIMOS PASOS

### Configuración Opcional (Recomendado):

**1. WhatsApp Business API** (Alertas móviles)
- Guía: https://developers.facebook.com/docs/whatsapp
- Tiempo: 30 mins
- Beneficio: Alertas en tu móvil

**2. Telegram Bot** (Alertas alternativas)
- Crear bot: @BotFather en Telegram
- Tiempo: 5 mins
- Beneficio: Backup de alertas

**3. Deepgram Master Key** (Rotación 100% automática)
- Dashboard: https://console.deepgram.com/
- Ejecutar: `npm run autorun:setup` → Opción 4
- Tiempo: 3 mins
- Beneficio: 1 proveedor completamente automático

---

## ✅ CHECKLIST DE ÉXITO

- [ ] `npm install` ejecutado exitosamente
- [ ] Usuario AWS IAM creado con permisos
- [ ] `.env` configurado con AWS credentials
- [ ] `npm run autorun:setup` completado (9/9 keys)
- [ ] `npm run autorun:pm2` iniciado sin errores
- [ ] `npm run autorun:logs` muestra sistema operativo
- [ ] Logs muestran: "💤 Sistema en modo AUTORUN..."

**Si todos los ✅ están marcados: SISTEMA OPERATIVO** 🎉

---

## 📞 SOPORTE

**Problemas técnicos:**
- Revisar logs: `npm run autorun:logs`
- Revisar `AUTORUN-KEY-ROTATION-SYSTEM.md` (sección Troubleshooting)

**Pregunta rápida:**
- Ver `AUTORUN-KEY-ROTATION-SYSTEM.md` (búsqueda Ctrl+F)

---

**🎯 Sistema listo en 5 minutos. Paz mental para siempre.**

---

*Generado por CTO Claude Code - Sandra IA Team*
*Galaxy Level Pro Enterprise*
*2025-01-28*
