#!/bin/bash
echo "Cleaning Vite cache and restarting development server..."

# Change to project directory
cd "c:/Users/Thenuka_W/Desktop/TrinexaAppliation/project"

# Stop any running processes on port 5173
netstat -ano | findstr :5173 | findstr LISTENING > temp.txt
if [ -s temp.txt ]; then
    for /f "tokens=5" %%a in (temp.txt) do taskkill /F /PID %%a
fi
rm -f temp.txt

# Clear Vite cache
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist

# Restart development server
npm run dev
