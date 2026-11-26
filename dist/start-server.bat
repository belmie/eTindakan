@echo off
title STSM MAINS - Pelayan Pengeluaran (Port 5130)
echo ========================================================
echo   STSM MAINS - Memulakan Servis Pengeluaran
echo ========================================================
echo.
echo [1/2] Memulakan Backend Express API (Port 3001)...
start "STSM Backend (3001)" cmd /k "node server/index.js"
timeout /t 2 /nobreak > nul

echo [2/2] Memulakan Frontend Next.js (Port 5130)...
start "STSM Frontend (5130)" cmd /k "node server.js"

echo.
echo ========================================================
echo   Servis Berjaya Dijalankan!
echo   Frontend : http://localhost:5130
echo   Backend  : http://localhost:3001
echo ========================================================
pause
