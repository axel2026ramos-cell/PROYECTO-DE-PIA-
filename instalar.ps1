$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "== Backend: entorno Python 3.11 ==" -ForegroundColor Cyan
Set-Location "$root\backend"
if (-not (Test-Path ".venv")) {
    py -3.11 -m venv .venv
}
& ".\.venv\Scripts\python.exe" -m pip install --upgrade pip
& ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt

Write-Host "== Frontend: dependencias Node.js ==" -ForegroundColor Cyan
Set-Location "$root\frontend"
npm install

Set-Location $root
Write-Host "Instalacion completa. Ejecuta iniciar.bat para abrir el sistema." -ForegroundColor Green
