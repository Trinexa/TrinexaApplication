@echo off
echo Cleaning up and restarting development server...

cd /d "c:\Users\Thenuka_W\Desktop\TrinexaAppliation\project"

echo Stopping any existing development server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo Clearing Vite cache...
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist ".vite" rmdir /s /q ".vite"
if exist "dist" rmdir /s /q "dist"

echo Starting development server...
npm run dev
