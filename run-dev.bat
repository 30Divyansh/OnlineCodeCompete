@echo off
title CodeDuel Launcher
color 0B
echo ===================================================
echo     Starting CodeDuel in Development Mode
echo ===================================================
echo.
echo Launching Backend Server on port 5000...
start "CodeDuel Backend (Port 5000)" cmd /k "cd /d "%~dp0server" && node server.js"

echo Launching Frontend Client on port 3000...
start "CodeDuel Frontend (Port 3000)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo Both servers are starting!
echo Open your browser at: http://localhost:3000
echo ===================================================
timeout /t 3 >nul
exit
