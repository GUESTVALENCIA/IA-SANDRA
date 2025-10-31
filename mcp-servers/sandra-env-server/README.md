# 🚀 Sandra Environment MCP Server

Servidor MCP (Model Context Protocol) personalizado que amplía las capacidades de entorno para trabajar fuera de las limitaciones del workspace.

## 📦 Instalación

```bash
cd extracted_app/mcp-servers/sandra-env-server
npm install
```

## ⚙️ Configuración en Cursor

Crea o edita el archivo de configuración MCP de Cursor:

**Windows:**
```
%APPDATA%\Cursor\User\globalStorage\mcp.json
```

**macOS:**
```
~/Library/Application Support/Cursor/User/globalStorage/mcp.json
```

**Linux:**
```
~/.config/Cursor/User/globalStorage/mcp.json
```

### Configuración:

```json
{
  "mcpServers": {
    "sandra-env": {
      "command": "node",
      "args": [
        "C:/Users/clayt/AppData/Local/Programs/Sandra DevConsole/extracted_app/mcp-servers/sandra-env-server/index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

**Nota:** Ajusta la ruta según tu instalación.

## 🛠️ Herramientas Disponibles

### Sistema de Archivos
- `file_read`: Lee archivos en cualquier ubicación
- `file_write`: Escribe archivos en cualquier ubicación
- `file_list`: Lista archivos y directorios
- `file_copy`: Copia archivos/directorios
- `file_move`: Mueve/renombra archivos
- `file_delete`: Elimina archivos/directorios
- `file_info`: Información detallada de archivos
- `directory_create`: Crea directorios

### Comandos del Sistema
- `execute_system_command`: Ejecuta comandos del sistema
- `process_spawn`: Inicia procesos en background
- `process_list`: Lista procesos en ejecución

### Gestión de Servicios
- `service_start`: Inicia servicios
- `service_stop`: Detiene servicios
- `service_status`: Estado de servicios

### Bases de Datos
- `database_query`: Ejecuta queries SQL

### Sistema
- `environment_variable`: Lee/escribe variables de entorno
- `network_request`: Peticiones HTTP/HTTPS

## 🔒 Consideraciones de Seguridad

⚠️ **ADVERTENCIA**: Este servidor otorga acceso amplio al sistema. Úsalo con precaución:

1. Revisa siempre los comandos antes de ejecutarlos
2. Limita el acceso a rutas críticas si es posible
3. No ejecutes comandos destructivos sin verificación
4. Mantén logs de todas las operaciones

## 📝 Ejemplos de Uso

### Leer archivo fuera del workspace:
```json
{
  "tool": "file_read",
  "arguments": {
    "path": "C:/Users/clayt/important-file.txt"
  }
}
```

### Ejecutar comando del sistema:
```json
{
  "tool": "execute_system_command",
  "arguments": {
    "command": "git status",
    "workingDir": "C:/Users/clayt/projects"
  }
}
```

### Iniciar servicio:
```json
{
  "tool": "service_start",
  "arguments": {
    "service": "MySQL"
  }
}
```

## 🐛 Troubleshooting

Si el servidor no inicia:
1. Verifica que Node.js esté instalado: `node --version`
2. Instala dependencias: `npm install`
3. Verifica la ruta en la configuración de Cursor
4. Revisa los logs de Cursor para errores

## 📚 Recursos

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Cursor MCP Integration](https://cursor.sh/docs/mcp)

