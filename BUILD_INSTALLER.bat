@echo off
title Build Installer Jurnal Guru Digital
echo ========================================================
echo   MEMBUAT FILE INSTALLER (.EXE) JURNAL GURU DIGITAL
echo ========================================================
echo.

set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/

if not exist node_modules (
    echo Menginstal dependensi build, mohon tunggu sebentar...
    call npm.cmd install
)

echo.
echo Sedang mengemas aplikasi menjadi file Setup .exe ...
echo Harap tunggu hingga proses selesai.
echo.

call npm.cmd run dist

echo.
echo ========================================================
echo   SELESAI!
echo   File installer .exe tersimpan di dalam folder 'dist':
echo   - Jurnal Guru Digital Setup 1.0.0.exe (Installer)
echo   - Jurnal Guru Digital 1.0.0.exe (Portable)
echo ========================================================
pause
