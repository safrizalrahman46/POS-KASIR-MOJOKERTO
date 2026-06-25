@echo off
:: POS Toko - Production Startup Script (single server)
:: =====================================================

echo.
echo ====================================
echo   POS Toko - Production Server
echo ====================================
echo.

cd /d "%~dp0backend"

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python tidak ditemukan.
    pause
    exit /b 1
)

echo [INFO] Mengaktifkan virtual environment...
if not exist "venv" (
    echo [INFO] Membuat virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat

echo [INFO] Menginstall dependencies...
pip install -r requirements.txt -q

echo [INFO] Menjalankan migrasi...
python manage.py migrate

echo [INFO] Build frontend...
cd /d "%~dp0frontend"
call npm install --silent
call npm run build

cd /d "%~dp0backend"

:: Collect static files
python manage.py collectstatic --noinput

echo.
echo ====================================
echo   Server siap!
echo   Buka http://localhost:8000
echo   Login: admin / admin123
echo   CTRL+C untuk berhenti
echo ====================================
echo.

:: Run with Daphne for WebSocket + HTTP
python -m daphne config.asgi:application -b 0.0.0.0 -p 8000
