@echo off
echo =========================================
echo   Testing FinanceService directly...
echo =========================================
echo.
echo Starting FinanceService - watch for errors below:
echo.
cd /d "c:\xampp\htdocs\MicroServices_LorrySalesSystem\FinanceService"
node index.js
echo.
echo ─────────────────────────────────────────
echo If you see an error above, that is what
echo is preventing the service from starting.
echo ─────────────────────────────────────────
pause
