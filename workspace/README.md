# 🚀 Clayton Enterprise Workspace

Workspace personalizado para automatización de tareas según nuestras necesidades específicas.

## 📋 Estructura

```
workspace/
├── .cursor/              # Configuración de Cursor
│   ├── rules/            # Reglas personalizadas
│   ├── commands/         # Comandos personalizados
│   └── prompts/          # Templates de prompts
├── workflows/            # Flujos de trabajo automatizados
├── templates/            # Plantillas de código
├── automation/           # Scripts de automatización
└── README.md            # Este archivo
```

## 🎯 Características

### 1. Reglas Personalizadas
- Estándares de código
- Directrices para agentes
- Flujos de trabajo

### 2. Comandos Personalizados
- Deploy a producción
- Suite de tests completa
- Build y verificación

### 3. Workflows Automatizados
- Deployment completo
- Testing automatizado
- Code review

### 4. Monitoreo de Tokens
- Registro automático
- Alertas y proyecciones
- Recomendaciones de plan

## 🚀 Uso Rápido

1. **Setup inicial:**
   ```bash
   cd workspace
   chmod +x automation/setup-workspace.sh
   ./automation/setup-workspace.sh
   ```

2. **Configurar variables:**
   ```bash
   cp .env.example .env
   # Editar .env con tus valores
   ```

3. **Usar comandos personalizados:**
   - En Cursor: `Cmd+Shift+P` → Buscar comando
   - Ejemplo: "Deploy to Production"

## 📊 Monitoreo de Tokens

El sistema de monitoreo está integrado. Ver:
- `monitoring/token-monitor.js`
- `monitoring/token-monitor-integration.js`

## 🔧 Personalización

### Agregar Nuevo Comando
1. Crear archivo en `.cursor/commands/`
2. Definir estructura JSON
3. Configurar steps y validaciones

### Agregar Nuevo Workflow
1. Crear archivo en `workflows/`
2. Definir steps secuenciales o paralelos
3. Configurar notificaciones

## 📝 Notas Importantes

- ✅ Subagentes externos gestionados por orquestador
- ❌ NO tocar subagentes de Sandra (256 existentes)
- 🔄 Sincronización sin mezclar ecosistemas

---

**Mantenido por**: Clayton Enterprise  
**Versión**: 1.0.0

