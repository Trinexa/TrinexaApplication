@echo off
echo Clearing Vite cache and restarting server...
cd /d "c:\Users\Thenuka_W\Desktop\TrinexaAppliation\project"
rmdir /s /q node_modules\.vite 2>nul
rmdir /s /q .vite 2>nul
echo Cache cleared. Starting development server...
npm run dev
