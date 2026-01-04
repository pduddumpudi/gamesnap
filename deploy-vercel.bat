@echo off
echo ========================================
echo   GameSnap - Vercel Deployment Script
echo ========================================
echo.

REM Set PATH to include Node.js
set PATH=C:\Program Files\nodejs;%PATH%

REM Change to project directory
cd /d "%~dp0"

echo Checking Vercel CLI...
call vercel --version
if errorlevel 1 (
    echo Vercel CLI not found or PATH issue
    echo Please run: npm install -g vercel
    pause
    exit /b 1
)

echo.
echo Deploying to Vercel...
echo.

call vercel --prod

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
pause
