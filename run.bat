@echo off
chcp 65001 >nul
title Server Website Pribadi Aldo Mogol

echo ================================================================
echo       MEMULAI WEBSITE PRIBADI ALDO MOGOL (CSS, JS, SQLITE)
echo ================================================================
echo.

set PYTHON_CMD=

:: Cek Python di path AppData spesifik
if exist "%LOCALAPPDATA%\Python\pythoncore-3.15-64\python.exe" (
    set "PYTHON_CMD=%LOCALAPPDATA%\Python\pythoncore-3.15-64\python.exe"
    goto found_python
)

:: Cek python standar di PATH
where python >nul 2>nul
if %errorlevel% equ 0 (
    set "PYTHON_CMD=python"
    goto found_python
)

:: Cek py launcher
where py >nul 2>nul
if %errorlevel% equ 0 (
    set "PYTHON_CMD=py"
    goto found_python
)

echo [!] Python tidak ditemukan secara otomatis.
echo     Silakan pastikan Python terinstal di sistem Anda.
pause
exit /b 1

:found_python
echo [✓] Menggunakan Python: %PYTHON_CMD%
echo [*] Memastikan basis data SQLite telah terinisialisasi...

"%PYTHON_CMD%" init_db.py

echo.
echo [*] Membuka browser ke http://localhost:8000 ...
start http://localhost:8000

echo [*] Menjalankan server web...
echo.
"%PYTHON_CMD%" server.py

pause

