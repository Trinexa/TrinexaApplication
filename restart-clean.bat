@echo off
echo ===================================================
echo    FIXING MODULE EXPORT ISSUE - FULL RESET
echo ===================================================
cd /d "c:\Users\Thenuka_W\Desktop\TrinexaAppliation\project"

echo.
echo [1/5] Killing any running processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
timeout /t 2 >nul

echo.
echo [2/5] Clearing ALL cache directories...
rmdir /s /q node_modules\.vite >nul 2>&1
rmdir /s /q node_modules\.cache >nul 2>&1
rmdir /s /q dist >nul 2>&1
rmdir /s /q .vite >nul 2>&1
echo Cache cleared successfully!

echo.
echo [3/5] Reinstalling dependencies...
npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [4/5] TypeScript check...
npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ERROR: TypeScript compilation failed!
    pause
    exit /b 1
)

echo.
echo [5/5] Starting fresh development server...
echo Server will be available at: http://localhost:5173
echo Products page: http://localhost:5173/products
echo.
npm run dev
