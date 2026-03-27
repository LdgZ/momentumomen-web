@echo off
title Elora Wedding - Auto Installer
color 0A

echo ========================================
echo    ELORA WEDDING - AUTO SETUP
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js tidak terdeteksi!
    echo Silakan install Node.js dari https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js terdeteksi
node --version
echo.

:: Check if dependencies are installed
if not exist "node_modules\" (
    echo [INFO] Dependencies belum terinstall
    echo [INFO] Menginstall dependencies... (tunggu sebentar)
    echo.
    call npm install
    echo.
    echo [OK] Install selesai!
    echo.
) else (
    echo [OK] Dependencies sudah terinstall
    echo.
)

:: Check if .env.local exists
if not exist ".env.local" (
    echo [WARNING] File .env.local belum ada
    echo [INFO] Membuat .env.local dari template...
    echo.
    (
        echo NEXT_PUBLIC_GOOGLE_SCRIPT_URL=
        echo ADMIN_PASSWORD=admin123
    ) > .env.local
    echo [OK] File .env.local dibuat
    echo [INFO] Edit .env.local untuk konfigurasi Google Sheets
    echo.
)

echo ========================================
echo    STARTING DEV SERVER...
echo ========================================
echo.
echo Server akan berjalan di: http://localhost:3000
echo.
echo Tekan Ctrl+C untuk stop server
echo.

:: Run dev server
npm run dev

pause
