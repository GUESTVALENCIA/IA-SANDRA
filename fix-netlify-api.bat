@echo off
echo Intentando corregir configuracion de Netlify via API...

REM Primero obtenemos el token
for /f "tokens=*" %%i in ('npx netlify-cli status --json ^| findstr "token"') do set NETLIFY_TOKEN=%%i

echo Token obtenido...

REM Actualizamos la configuracion del sitio
curl -X PATCH ^
  -H "Authorization: Bearer %NETLIFY_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"build_settings\":{\"dir\":\"sandra-deploy\"}}" ^
  "https://api.netlify.com/api/v1/sites/a75819c1-20d5-43f1-8ebc-b3a35ddf7605"

echo Configuracion actualizada.
pause