# Limpiar Cache del Service Worker

Si los errores persisten, necesitas limpiar el cache del Service Worker manualmente:

1. Cierra completamente la app Electron
2. Abre DevTools (si está abierto)
3. Ve a Application > Service Workers
4. Haz clic en "Unregister" para todos los SW registrados
5. Ve a Application > Storage > Clear site data
6. Reinicia la app

O simplemente:
- Cierra todas las ventanas de Electron
- Espera 5 segundos
- Inicia de nuevo con `npm start`

