# 🚀 Quick Start - Sandra MCP Server

## Instalación Rápida

### 1. Instalar Dependencias

```bash
cd extracted_app/mcp-servers/sandra-env-server
npm install
```

O ejecuta `install.bat` (Windows)

### 2. Configurar en Cursor

**Ubicación del archivo de configuración:**
- Windows: `%APPDATA%\Cursor\User\globalStorage\mcp.json`
- macOS: `~/Library/Application Support/Cursor/User/globalStorage/mcp.json`
- Linux: `~/.config/Cursor/User/globalStorage/mcp.json`

**Contenido del archivo `mcp.json`:**
```json
{
  "mcpServers": {
    "sandra-env": {
      "command": "node",
      "args": [
        "C:/Users/clayt/AppData/Local/Programs/Sandra DevConsole/extracted_app/mcp-servers/sandra-env-server/index.js"
      ]
    }
  }
}
```

**⚠️ IMPORTANTE:** Reemplaza la ruta con la ubicación real de tu instalación.

### 3. Reiniciar Cursor

Cierra y vuelve a abrir Cursor para que cargue la configuración MCP.

### 4. Verificar Instalación

Una vez reiniciado, deberías poder usar todas las herramientas expandidas:

- ✅ Acceso a archivos fuera del workspace
- ✅ Ejecución de comandos del sistema
- ✅ Gestión de procesos y servicios
- ✅ Acceso a bases de datos
- ✅ Peticiones de red

## 🎯 Próximos Pasos

1. Lee la documentación completa en `MCP_ENVIRONMENT_SETUP.md`
2. Prueba las herramientas con comandos simples
3. Configura permisos según tus necesidades de seguridad

## ❓ Problemas Comunes

**El servidor no aparece:**
- Verifica que la ruta en `mcp.json` sea correcta
- Asegúrate de que Node.js esté instalado
- Revisa los logs de Cursor

**Errores de permisos:**
- Algunas operaciones requieren permisos de administrador
- En Windows, ejecuta Cursor como administrador si es necesario

---

¿Listo? ¡Ya puedes trabajar sin limitaciones de entorno! 🚀

