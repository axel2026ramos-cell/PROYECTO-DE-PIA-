# Prototipo Dicapri — Sistema de inspección textil con IA

Sistema integrado para la inspección de medias Dicapri:

- **Inspección visual (YOLOv8n):** detecta los defectos D04 (elástico), D06 (mancha de aceite) y D09 (tejido incorrecto parcial) en una fotografía.
- **Predicción de riesgo (Random Forest):** estima el riesgo operacional (bajo / medio / alto) de cada máquina para el siguiente mes.
- **Módulo de decisión:** combina la visión, el riesgo histórico y la criticidad AMEF en una acción recomendada.
- **Gemelo digital:** simulación de la línea, KPIs, Pareto de defectos y exportación CSV.

```
PROYECTO-DE-PIA-/
├── backend/            API FastAPI + modelos (puerto 8000)
│   ├── app/api.py      Endpoints /health, /predict, /risk/{maquina}
│   ├── runs/.../best.pt  Pesos YOLOv8n entrenados
│   ├── models/         Random Forest de riesgo
│   ├── data/           Dataset de riesgo mensual y catálogo AMEF
│   ├── dataset/        Imágenes y etiquetas de entrenamiento
│   └── scripts/        entrenar.py y predecir.py
├── frontend/           Interfaz web Vite (puerto 5173)
├── instalar.bat        Instala todo (una sola vez)
└── iniciar.bat         Arranca backend + frontend y abre el navegador
```

## Requisitos

Obligatorios: **Python 3.11 (64 bits)**, **Node.js LTS 20 o 22** y un navegador web.
Recomendados: Visual Studio Code, Git y PowerShell.

Al instalar Python, marcar la casilla **"Add python.exe to PATH"**.

## Uso rápido en Windows

1. Doble clic en `instalar.bat` (la primera vez tarda varios minutos: descarga PyTorch y Ultralytics).
2. Doble clic en `iniciar.bat`. Se abren dos ventanas (API y frontend) y el navegador en `http://localhost:5173`.
3. Para detener el sistema, cerrar ambas ventanas.

## Instalación manual

```powershell
# Backend
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.api:app --host 127.0.0.1 --port 8000
```

```powershell
# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

Abrir `http://localhost:5173`. El frontend reenvía `/api/*` al backend en el puerto 8000.
La documentación interactiva de la API está en `http://127.0.0.1:8000/docs`.

## Endpoints de la API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado de los modelos cargados |
| POST | `/predict?conf=0.5` | Imagen JPEG/PNG → decisión CONFORME / NO_CONFORME y detecciones |
| GET | `/risk/M01` | Riesgo del siguiente periodo para la máquina indicada |

## Reentrenar el modelo

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python scripts\entrenar.py
python scripts\predecir.py "C:\ruta\foto_media.jpeg"
```

## Advertencia

Los modelos son **preliminares** (37 imágenes, datos de riesgo reconstruidos/sintéticos 2025). Sirven para demostrar el flujo técnico, no como evidencia de desempeño industrial. Ver `backend/README.md`.
