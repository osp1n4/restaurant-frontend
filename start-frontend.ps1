# Script para iniciar el frontend y mantenerlo activo
Write-Host "🚀 Iniciando Frontend..." -ForegroundColor Cyan

# Matar procesos previos en el puerto 5173
$port = 5173
$processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host "🔄 Limpiando puerto $port..." -ForegroundColor Yellow
    foreach ($proc in $processes) {
        Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Iniciar Vite
Write-Host "✨ Levantando Vite en puerto $port..." -ForegroundColor Green
& node node_modules/vite/bin/vite.js

# Mantener la ventana abierta si hay error
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar Vite" -ForegroundColor Red
    Read-Host "Presiona Enter para cerrar"
}
