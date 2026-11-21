@echo off
title Menjalankan Jurnal Guru Digital
echo ========================================================
echo   MENJALANKAN JURNAL GURU DIGITAL (DESKTOP)
echo ========================================================
echo.

if not exist node_modules (
    echo Menginstal dependensi pertama kali, mohon tunggu sebentar...
    call npm.cmd install
)

echo Membuka aplikasi...
call npm.cmd start
