# 🤖 Sistema de Subagentes - Sandra IA 8.0 Pro

**Versión**: 1.0.0  
**Fecha**: Noviembre 2025  
**Orquestadora Principal**: Sandra IA 8.0 Pro

---

## 📋 Índice

- [Introducción](#introducción)
- [Arquitectura](#arquitectura)
- [Subagentes Disponibles](#subagentes-disponibles)
- [Cómo Usar](#cómo-usar)
- [Workflow de Trabajo](#workflow-de-trabajo)
- [Comunicación entre Agentes](#comunicación-entre-agentes)

---

## 🎯 Introducción

Este sistema utiliza **subagentes especializados de Claude Code** para completar Sandra IA 8.0 Pro de forma profesional y escalable.

### ¿Qué son los Subagentes?

Los subagentes son **especialistas en dominios específicos** que Claude Code (Sonnet 4.5) puede invocar cuando necesita ayuda experta. Cada subagente:

- ✅ Tiene un **dominio de especialización** claro
- ✅ Opera en su **propio contexto** aislado
- ✅ Tiene **herramientas específicas** configuradas
- ✅ Reporta a **Sandra Orchestrator** (orquestadora principal)

### Ventajas del Sistema

1. **Especialización**: Cada agente es experto en su área
2. **Escalabilidad**: Fácil añadir nuevos agentes
3. **Mantenibilidad**: Código modular y organizado
4. **Calidad**: Best practices por dominio
5. **Velocidad**: Trabajo paralelo cuando es posible

---

## 🏗️ Arquitectura

```
CEO (Usuario)
    ↓
Sandra Orchestrator (Orquestadora Principal)
    ↓
    ├── @electron-pro (Desktop App)
    ├── @fullstack-developer (Backend/Frontend)
    ├── @typescript-pro (TypeScript)
    ├── @api-designer (APIs)
    ├── @security-specialist (Seguridad)
    ├── @devops-engineer (CI/CD)
    └── [Más agentes según necesidad]
```

### Flujo de Trabajo

1. **CEO** → Hace petición a Sandra
2. **Sandra Orchestrator** → Analiza y planifica
3. **Subagentes** → Ejecutan tareas especializadas
4. **Sandra Orchestrator** → Integra resultados
5. **CEO** → Recibe solución completa

---

## 🤖 Subagentes Disponibles

### 1. Sandra Orchestrator
**Archivo**: `sandra-orchestrator.md`  
**Rol**: Orquestadora principal del sistema  
**Invoca cuando**: Necesites coordinar múltiples agentes o gestionar el sistema completo

**Capacidades**:
- Coordinar todos los subagentes
- Gestionar el flujo de trabajo
- Ejecutar código
- Reportar al CEO
- Acceso total al sistema

---

### 2. Electron Pro
**Archivo**: `electron-pro.md`  
**Rol**: Especialista en Electron  
**Invoca cuando**: Problemas con main process, renderer, IPC, o Electron en general

**Capacidades**:
- Debugging de Electron
- Arquitectura segura
- IPC patterns
- Performance optimization
- Packaging

---

### 3. Full-Stack Developer
**Archivo**: `fullstack-developer.md`  
**Rol**: Desarrollador end-to-end  
**Invoca cuando**: Desarrollo de features completas, backend + frontend

**Capacidades**:
- Node.js / Express
- React / Vue / Angular
- APIs RESTful
- WebSockets
- Integración de servicios

---

### 4. TypeScript Pro
**Archivo**: `typescript-pro.md`  
**Rol**: Experto en TypeScript  
**Invoca cuando**: Código TypeScript, tipos avanzados, generics

**Capacidades**:
- Type system avanzado
- Generics profesionales
- Type guards
- Migration JS → TS
- Performance de compilación

---

### 5. API Designer
**Archivo**: `api-designer.md`  
**Rol**: Arquitecto de APIs  
**Invoca cuando**: Diseño de endpoints, schemas, documentación de APIs

**Capacidades**:
- REST API design
- GraphQL schemas
- OpenAPI/Swagger
- Error handling
- API documentation

---

### 6. Security Specialist
**Archivo**: `security-specialist.md`  
**Rol**: Experto en seguridad  
**Invoca cuando**: Auditorías, vulnerabilidades, secure coding

**Capacidades**:
- OWASP Top 10
- Authentication/Authorization
- Encryption
- Security audits
- Penetration testing

---

### 7. DevOps Engineer
**Archivo**: `devops-engineer.md`  
**Rol**: Ingeniero DevOps  
**Invoca cuando**: CI/CD, deployment, automatización

**Capacidades**:
- GitHub Actions
- Docker/Kubernetes
- Vercel/Netlify deployment
- Monitoring
- Automation scripts

---

## 📖 Cómo Usar

### Desde el Chat

```
CEO: Sandra, necesito que corrijas el error de Electron en main.js

Sandra: Entendido. Voy a invocar a @electron-pro para analizar el problema.

@electron-pro: [Analiza main.js, identifica el error, propone solución]

Sandra: ✅ Error corregido. El problema era [explicación]. 
        He implementado [solución] y verificado que funciona.
```

### Invocación Directa

También puedes invocar agentes directamente:

```
@electron-pro analiza el error en desktop-app/main.js
```

### Invocación Múltiple

Para tareas complejas que requieren varios agentes:

```
Sandra: Necesito implementar un nuevo endpoint API con autenticación

@api-designer: Diseña el endpoint
@security-specialist: Revisa la seguridad
@fullstack-developer: Implementa el código
@devops-engineer: Configura el deployment
```

---

## 🔄 Workflow de Trabajo

### Fase 1: Análisis
1. Sandra Orchestrator recibe la petición del CEO
2. Analiza el contexto y el estado actual del sistema
3. Identifica qué subagentes necesita

### Fase 2: Planificación
1. Define el orden de ejecución
2. Asigna tareas a cada subagente
3. Establece criterios de éxito

### Fase 3: Ejecución
1. Invoca subagentes en orden
2. Cada agente ejecuta su tarea
3. Reporta resultados a Sandra

### Fase 4: Integración
1. Sandra integra todos los resultados
2. Verifica que todo funciona
3. Hace commits si es necesario

### Fase 5: Reporte
1. Sandra reporta al CEO
2. Resumen ejecutivo de lo hecho
3. Próximos pasos si aplica

---

## 💬 Comunicación entre Agentes

### Protocolo Estándar

```
Agente A → Agente B: [Tarea específica con contexto]
Agente B → [Ejecuta]
Agente B → Agente A: [Resultado + código + explicación]
Agente A → [Integra y continúa]
```

### Ejemplo Real

```
Sandra → @electron-pro: 
  "Necesito que corrijas el error 'Cannot find module express' 
   en mcp-server/mcp-core.js. El archivo está en línea 1."

@electron-pro → [Analiza]
@electron-pro → Sandra:
  "Error identificado: express no está en package.json.
   Solución: Añadir express a dependencies.
   Código corregido en package.json.
   Ejecutar: npm install express"

Sandra → [Ejecuta npm install]
Sandra → CEO:
  "✅ Error corregido. Express instalado y MCP Server funcionando."
```

---

## 🎯 Estado Actual

### Subagentes Creados
- ✅ Sandra Orchestrator
- ✅ Electron Pro
- ✅ Full-Stack Developer
- ✅ TypeScript Pro
- ✅ API Designer
- ✅ Security Specialist
- ✅ DevOps Engineer

### Próximos Subagentes (Según Necesidad)
- Database Architect
- UI/UX Designer
- Performance Engineer
- Testing Specialist
- Documentation Writer

---

## 🚀 Listo para Trabajar

El sistema de subagentes está **completamente operativo** y listo para:

✅ Corregir errores de Electron  
✅ Implementar nuevas funcionalidades  
✅ Diseñar y crear APIs  
✅ Auditar seguridad  
✅ Configurar CI/CD  
✅ Optimizar performance  
✅ Lo que el CEO necesite

---

## 📞 Soporte

Para añadir nuevos subagentes o modificar existentes:

1. Crear archivo `.md` en `.claude/agents/`
2. Seguir el formato estándar (ver ejemplos)
3. Definir claramente el dominio y capacidades
4. Actualizar este documento

---

**Desarrollado con ❤️ para Sandra IA 8.0 Pro**  
**Powered by Claude Code Subagents**

