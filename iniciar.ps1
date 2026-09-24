$root = $PSScriptRoot

Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$root\frontend'; npm run dev"
)

Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"
