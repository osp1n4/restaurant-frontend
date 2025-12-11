@echo off
REM Script simple para iniciar el frontend - mantiene la ventana abierta
cd /d "%~dp0"
echo.
echo ===================================
echo   FRONTEND - VITE SERVER
echo ===================================
echo.
echo Iniciando en http://localhost:5173
echo Presiona Ctrl+C para detener
echo.
call npm.cmd run dev
pause
