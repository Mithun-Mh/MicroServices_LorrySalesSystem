@echo off
echo =========================================
echo   Lorry Sales System - Starting Up...
echo =========================================
echo.

REM Install dependencies if needed
for %%s in (AuthService InventoryService FleetService CustomerService SalesService FinanceService ApiGateway) do (
    if not exist "%%s\node_modules" (
        echo [INSTALL] Installing dependencies for %%s...
        cd %%s
        call npm install
        cd ..
        echo [DONE] %%s dependencies installed.
    ) else (
        echo [SKIP] %%s already has node_modules.
    )
)

echo.
echo =========================================
echo   Starting all services...
echo =========================================
echo.

REM Start each service in a new command window
start "AuthService - Port 5006" cmd /k "cd AuthService && node index.js"
timeout /t 2 /nobreak > nul

start "InventoryService - Port 5001" cmd /k "cd InventoryService && node index.js"
timeout /t 1 /nobreak > nul

start "FleetService - Port 5002" cmd /k "cd FleetService && node index.js"
timeout /t 1 /nobreak > nul

start "CustomerService - Port 5003" cmd /k "cd CustomerService && node index.js"
timeout /t 1 /nobreak > nul

start "SalesService - Port 5004" cmd /k "cd SalesService && node index.js"
timeout /t 1 /nobreak > nul

start "FinanceService - Port 5005" cmd /k "cd FinanceService && node index.js"
timeout /t 1 /nobreak > nul

start "ApiGateway - Port 3000" cmd /k "cd ApiGateway && node index.js"
timeout /t 2 /nobreak > nul

echo.
echo =========================================
echo   All services started!
echo =========================================
echo.
echo   API Gateway:      http://localhost:3000
echo   Swagger Docs:     http://localhost:3000/api-docs
echo   Auth Service:     http://localhost:5006/api-docs
echo   Inventory:        http://localhost:5001/api-docs
echo   Fleet:            http://localhost:5002/api-docs
echo   Customer:         http://localhost:5003/api-docs
echo   Sales:            http://localhost:5004/api-docs
echo   Finance:          http://localhost:5005/api-docs
echo.
echo   Each service runs in its own window.
echo   Close this window or press any key to exit.
echo.
pause
