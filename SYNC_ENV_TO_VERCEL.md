# Sincronizar variables con Vercel CLI

Este repositorio ahora incluye el script `sync_env_to_vercel.sh` para automatizar
la subida de variables de entorno a Vercel a partir de un archivo `.env` o
`sandra.env.local`.

## Uso rápido

```bash
./sync_env_to_vercel.sh sandra.env.local
```

- Si defines `VERCEL_TOKEN` en el entorno, el script lo reenvía al CLI (`vercel`).
- Por defecto sincroniza los tres entornos: `production`, `preview` y
  `development`.
- Puedes limitar el entorno objetivo con el segundo argumento: por ejemplo
  `./sync_env_to_vercel.sh sandra.env.local production`.
- También puedes pasar una lista separada por comas, como
  `./sync_env_to_vercel.sh sandra.env.local "production,preview"`.

## Requisitos

- Tener instalado y autenticado el [Vercel CLI](https://vercel.com/docs/cli).
- Contar con un archivo `.env` en formato `KEY=valor`. Se ignoran líneas vacías o
  que comiencen con `#`.

## Qué hace exactamente

1. Lee todas las claves/valores del archivo proporcionado.
2. Para cada entorno solicitado elimina la variable (si existe) usando
   `vercel env rm ... --yes` para evitar prompts interactivos.
3. Vuelve a crear la variable canalizando el valor al comando
   `vercel env add`.
4. Muestra un resumen de cuántas variables se sincronizaron y de posibles
   errores.

Esto permite integrar el script con automatizaciones más grandes (por ejemplo,
un orquestador que prepare la app de escritorio y despliegues de Vercel sin
intervención manual).

## Integración con el orquestador de escritorio

Si utilizas el flujo `sandra_ia_desktop_full` (el ejecutable que suele
descargarse en `~/Downloads`), incluye este script en el paso de orquestación
antes de realizar el despliegue en Vercel. El comando típico quedaría:

```bash
./sync_env_to_vercel.sh ./sandra.env.local all
```

De este modo te aseguras de que las variables de `sandra.env.local` estén ya en
los entornos `production`, `preview` y `development` cuando el orquestador
configure dominios, cron jobs y el despliegue principal.
