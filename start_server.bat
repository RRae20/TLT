@echo off
title Server
echo.
echo Starting...
echo.

:: Finding IP
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr "IPv4 Address"') do set localip=%%i
set localip=%localip: =%
echo IP: %localip%
echo Copy to Android: http://%localip%:3000/api/
echo.

:: ngrok
echo For other WiFi:
echo Run: ngrok http 3000
echo Then copy link to Android activity
echo.

:: Start
echo Starting Server...
echo (Ctrl+C to stop)
echo.
npm start
pause
