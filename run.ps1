# PowerShell Launcher untuk Website Pribadi Aldo Mogol
$ErrorActionPreference = "Stop"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "      MEMULAI WEBSITE PRIBADI ALDO MOGOL (CSS, JS, SQLITE)      " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan

$pythonExe = "$env:LOCALAPPDATA\Python\pythoncore-3.15-64\python.exe"

if (-not (Test-Path $pythonExe)) {
    $found = Get-Command python, py -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $pythonExe = $found.Source
    } else {
        Write-Host "[!] Python tidak ditemukan di sistem." -ForegroundColor Red
        Exit 1
    }
}

Write-Host "[✓] Menggunakan Python: $pythonExe" -ForegroundColor Green
Write-Host "[*] Menginisialisasi basis data SQLite..." -ForegroundColor Yellow
& $pythonExe init_db.py

Write-Host "[*] Membuka browser: http://localhost:8000" -ForegroundColor Yellow
Start-Process "http://localhost:8000"

Write-Host "[*] Menjalankan server web..." -ForegroundColor Cyan
& $pythonExe server.py

