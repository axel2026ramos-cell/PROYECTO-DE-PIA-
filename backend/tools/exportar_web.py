"""Genera los recursos de la versión web: modelo ONNX y riesgo precalculado."""
import json
import shutil
import sys
from pathlib import Path

from fastapi.testclient import TestClient
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from app.api import app, model, risk_data  # noqa: E402

PUBLIC = ROOT.parent / "frontend" / "public"
client = TestClient(app)

health = client.get("/health").json()
risk = {}
for machine_id in sorted(risk_data["ID_Máquina"].astype(str).str.upper().unique()):
    risk[machine_id] = client.get(f"/risk/{machine_id}").json()

(PUBLIC / "data" / "riesgo_predicciones.json").write_text(
    json.dumps({"health": health, "risk": risk}, ensure_ascii=False, indent=1),
    encoding="utf-8",
)

weights = ROOT / "runs" / "dicapri_yolov8n_preliminar" / "weights" / "best.pt"
onnx_path = Path(YOLO(str(weights)).export(format="onnx", imgsz=640, opset=17, simplify=True))
(PUBLIC / "models").mkdir(exist_ok=True)
shutil.move(str(onnx_path), PUBLIC / "models" / "dicapri_yolov8n.onnx")
(PUBLIC / "models" / "dicapri_yolov8n.json").write_text(
    json.dumps({"imgsz": 640, "names": model.names}, ensure_ascii=False), encoding="utf-8"
)
print("Máquinas:", list(risk))
