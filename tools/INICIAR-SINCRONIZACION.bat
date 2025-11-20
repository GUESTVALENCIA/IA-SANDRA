@echo off
echo ====================================================
echo   SINCRONIZADOR WORKTREE - EJECUCION
echo ====================================================
echo.
echo Sincronizando cambios automaticamente...
echo Worktree: C:\Users\clayt\.cursor\worktrees\Sandra-IA-8.0-Pro\uTqbj
echo Ejecucion: C:\Sandra-IA-8.0-Pro
echo.
echo Presiona Ctrl+C para detener
echo.

cd /d C:\Sandra-IA-8.0-Pro
node tools\sync-worktree.js

pause

