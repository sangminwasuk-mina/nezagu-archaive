@echo off
cd /d "%~dp0"
title Kaiten City Online Server

echo ========================================================
echo   KAITEN CITY - ONLINE MULTIPLAYER SERVER
echo ========================================================
echo.
echo [1/2] Starting Local Game Server (Port 8080)...
start "Kaiten Node Server" cmd /k "cd /d ""%~dp0"" && node server.js"

echo [2/2] Generating Public Link for Friends...
echo.
echo ========================================================
echo   COPY THE 'https://....loca.lt' LINK BELOW
echo   AND SEND IT TO YOUR FRIEND!
echo.
echo   * Both of you can open this link to play together!
echo   * DO NOT CLOSE THIS WINDOW WHILE PLAYING!
echo ========================================================
echo.
npx -y localtunnel --port 8080
pause
