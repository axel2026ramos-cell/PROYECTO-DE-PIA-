# Prototipo Dicapri — Sistema de inspección textil con IA

**Página web:** https://axel2026ramos-cell.github.io/PROYECTO-DE-PIA-/

Sistema integrado para la inspección de medias Dicapri:

- **Inspección visual (YOLOv8n):** detecta los defectos D04 (elástico), D06 (mancha de aceite) y D09 (tejido incorrecto parcial) en una fotografía.
- **Predicción de riesgo (Random Forest):** estima el riesgo operacional (bajo / medio / alto) de cada máquina para el siguiente mes.
- **Módulo de decisión:** combina la visión, el riesgo histórico y la criticidad AMEF en una acción recomendada.
- **Gemelo digital:** simulación de la línea, KPIs, Pareto de defectos y exportación CSV.

## Cómo funciona en la nube

Todo el sistema es una página estática publicada en GitHub Pages; no necesita servidor.

- El modelo YOLOv8n se exporta a ONNX (`frontend/public/models/`) y se ejecuta dentro del navegador con ONNX Runtime Web. La foto nunca sale del equipo del usuario.
- Las predicciones del Random Forest se precalculan para las 30 máquinas (`frontend/public/data/riesgo_predicciones.json`), porque dependen solo del último mes del historial.
- Cada `push` ejecuta `.github/workflows/pages.yml`, que compila el frontend y publica la página.

**Activar GitHub Pages (una sola vez):** en el repositorio ir a *Settings → Pages → Build and deployment → Source* y elegir **GitHub Actions**. Después volver a ejecutar el workflow desde la pestaña *Actions*.

```
PROYECTO-DE-PIA-/
├── frontend/             Página web (Vite) — lo que se publica
│   ├── src/main.js       Interfaz y gemelo digital
│   ├── src/localApi.js   YOLOv8n + riesgo ejecutados en el navegador
│   └── public/           Datos JSON y modelo ONNX
├── backend/              Python: entrenamiento, API FastAPI y exportación
│   ├── app/api.py        API original (/health, /predict, /risk/{maquina})
│   ├── tools/exportar_web.py  Regenera el ONNX y el riesgo precalculado
│   ├── runs/.../best.pt  Pesos YOLOv8n entrenados
│   ├── models/ data/     Random Forest, dataset de riesgo y catálogo AMEF
│   └── dataset/ scripts/ Imágenes, etiquetas, entrenar.py y predecir.py
└── .github/workflows/pages.yml
```

## Ejecutar en local

Requisitos: **Node.js LTS 20 o 22**. Para reentrenar o usar la API Python también **Python 3.11 (64 bits)**.

```powershell
cd frontend
npm install
npm run dev      # http://localhost:5173
```

En Windows también sirve doble clic en `instalar.bat` y luego en `iniciar.bat`.

## Reentrenar y actualizar la página

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python scripts\entrenar.py                # nuevo best.pt
python tools\exportar_web.py              # actualiza ONNX y riesgo en frontend/public
```

Luego hacer `commit` y `push`; la página se actualiza sola.

La API Python sigue disponible para pruebas: `uvicorn app.api:app --port 8000` (documentación en `http://127.0.0.1:8000/docs`).

## Advertencia

Los modelos son **preliminares** (37 imágenes, datos de riesgo reconstruidos/sintéticos 2025). Sirven para demostrar el flujo técnico, no como evidencia de desempeño industrial. Ver `backend/README.md`.
