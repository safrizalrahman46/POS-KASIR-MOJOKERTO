@echo off
:: POS Toko - Development Startup Script
:: =======================================

echo.
echo ====================================
echo   POS Toko - Development Server
echo ====================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python tidak ditemukan. Install Python 3.10+ terlebih dahulu.
    pause
    exit /b 1
)

:: Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan. Install Node.js 18+ terlebih dahulu.
    pause
    exit /b 1
)

echo [INFO] Membuat virtual environment Python...
cd /d "%~dp0backend"
if not exist "venv" (
    python -m venv venv
)
call venv\Scripts\activate.bat

echo [INFO] Menginstall dependencies Python...
pip install -r requirements.txt -q

echo [INFO] Menjalankan migrasi database...
python manage.py migrate

echo [INFO] Membuat superuser (jika belum ada)...
python manage.py shell -c "from apps.accounts.models import User; User.objects.get_or_create(username='admin', defaults={'role':'admin','is_staff':True,'is_superuser':True})" || echo Superuser sudah ada.
python manage.py shell -c "from apps.accounts.models import User; u=User.objects.get(username='admin'); u.set_password('admin123'); u.save()" 2>nul

echo.
echo ====================================
echo   Menjalankan server...
echo   Backend : http://localhost:8000
echo   Frontend: http://localhost:5173
echo   Login   : admin / admin123
echo ====================================
echo.

:: Start Django in background
start "Django" cmd /c "call venv\Scripts\activate.bat && python manage.py runserver 0.0.0.0:8000"

:: Start React frontend
cd /d "%~dp0frontend"
echo [INFO] Menginstall dependencies Node...
call npm install --silent
echo [INFO] Menjalankan React dev server...
start "React" cmd /c "npm run dev"

echo.
echo Server berjalan! Buka http://localhost:5173 di browser.
echo Login default: admin / admin123
echo.
pause
