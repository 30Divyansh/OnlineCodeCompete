@echo off
title CodeDuel Production Server
color 0A
echo ===================================================
echo           Starting CodeDuel Platform
echo ===================================================
echo.
echo Running on: http://localhost:5000
echo (Serves Backend APIs, Socket.IO, and React Frontend)
echo.
cd /d "%~dp0server"
node server.js
pause
