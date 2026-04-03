# start_all.ps1
# This script starts all 7 microservices for the Lorry Sales System

$services = @(
    "AuthService",
    "CustomerService",
    "FinanceService",
    "FleetService",
    "InventoryService",
    "SalesService",
    "ApiGateway"
)

Write-Host "--- Lorry Sales System: Starting All Microservices ---" -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "Starting $service..." -ForegroundColor Yellow
    
    # Change directory and run node index.js in a NEW terminal window
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd .\$service; node index.js" -WindowStyle Normal
    
    # Tiny delay to avoid port conflicts or race conditions during startup
    Start-Sleep -Seconds 1
}

Write-Host "--- All services initiated! ---" -ForegroundColor Green
Write-Host "You should see 7 new terminal windows open."
Write-Host "API Gateway is on http://localhost:3000"
Write-Host "Swagger UI: http://localhost:3000/api-docs"
