# Uso de variables de entorno (ANTHROPIC_API_KEY)

Este documento explica cómo guardar tu clave de Anthropic localmente y cómo usarla en Node.js.

1) Añadir la clave localmente (crear `.env` en la raíz)

- Copia `.env.example` a `.env` y añade tu clave real en la línea:

  ANTHROPIC_API_KEY=sk-...tu_clave_aqui...

2) Comandos rápidos (PowerShell):

- Crear `.env` con la clave (línea única):

  New-Item -Path . -Name ".env" -ItemType "file" -Force;
  "ANTHROPIC_API_KEY=sk-xxxx" | Out-File -FilePath .\.env -Encoding utf8

- O exportar temporalmente en la sesión (no persiste):

  $env:ANTHROPIC_API_KEY = "sk-xxxx"

3) Uso en Node.js (ejemplo):

- Instala dotenv si no está instalado:

  npm install dotenv --save

- En tu código (por ejemplo `index.js`):

  require('dotenv').config();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('Anthropic API key cargada:', !!apiKey);

- Nota: nunca imprimas la clave real en logs para entornos de producción.

4) Buenas prácticas

- Asegúrate de que `.env` está en `.gitignore` (ya añadimos `.env`).
- Mantén claves en servicios de secret management para producción (Azure Key Vault, AWS Secrets Manager, GitHub Secrets, etc.).

Si quieres, puedo:
- Añadir una pequeña función wrapper que lea la clave y haga una petición de prueba a Anthropic (sin tu clave, solo plantilla).
- Guardar la clave usando el almacenamiento secreto de VS Code (requiere pasos adicionales).
