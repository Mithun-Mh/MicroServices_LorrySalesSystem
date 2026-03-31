# ─── Lorry Sales System - Start All Services ─────────────────
# This script installs dependencies and starts all microservices

$ROOT = $PSScriptRoot

$services = @(
    @{ Name = "AuthService";      Port = 5006 },
    @{ Name = "InventoryService"; Port = 5001 },
    @{ Name = "FleetService";     Port = 5002 },
    @{ Name = "CustomerService";  Port = 5003 },
    @{ Name = "SalesService";     Port = 5004 },
    @{ Name = "FinanceService";   Port = 5005 },
    @{ Name = "ApiGateway";       Port = 3000 }
)

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Lorry Sales System - Starting Up..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Install dependencies for each service
foreach ($svc in $services) {
    $svcPath = Join-Path $ROOT $svc.Name
    if (-Not (Test-Path (Join-Path $svcPath "node_modules"))) {
        Write-Host "[INSTALL] Installing dependencies for $($svc.Name)..." -ForegroundColor Yellow
        Push-Location $svcPath
        npm install 2>&1 | Out-Null
        Pop-Location
        Write-Host "[DONE]    $($svc.Name) dependencies installed." -ForegroundColor Green
    } else {
        Write-Host "[SKIP]    $($svc.Name) dependencies already installed." -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Starting all services..." -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Start each service in a new window
$processes = @()
foreach ($svc in $services) {
    $svcPath = Join-Path $ROOT $svc.Name
    Write-Host "[START]   $($svc.Name) on port $($svc.Port)..." -ForegroundColor Green
    $proc = Start-Process -FilePath "node" -ArgumentList "index.js" -WorkingDirectory $svcPath -PassThru -WindowStyle Normal
    $processes += $proc
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  All services started!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  API Gateway:      http://localhost:3000" -ForegroundColor White
Write-Host "  Swagger Docs:     http://localhost:3000/api-docs" -ForegroundColor White
Write-Host "  Auth Service:     http://localhost:5006/api-docs" -ForegroundColor White
Write-Host "  Inventory:        http://localhost:5001/api-docs" -ForegroundColor White
Write-Host "  Fleet:            http://localhost:5002/api-docs" -ForegroundColor White
Write-Host "  Customer:         http://localhost:5003/api-docs" -ForegroundColor White
Write-Host "  Sales:            http://localhost:5004/api-docs" -ForegroundColor White
Write-Host "  Finance:          http://localhost:5005/api-docs" -ForegroundColor White
Write-Host ""
Write-Host "  Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Wait and cleanup on exit
try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    Write-Host ""
    Write-Host "Stopping all services..." -ForegroundColor Red
    foreach ($proc in $processes) {
        if (-Not $proc.HasExited) {
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }
    Write-Host "All services stopped." -ForegroundColor Red
}
