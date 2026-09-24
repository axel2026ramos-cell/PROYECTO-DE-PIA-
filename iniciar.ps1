$root = $PSScriptRoot

Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$root\backend'; .\.venv\Scripts\python.exe -m uvicorn app.api:app --host 127.0.0.1 --port 8000"
)

Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$root\frontend'; npm run dev"
)

Start-Sleep -Seconds 8
Start-Process "http://localhost:5173"
