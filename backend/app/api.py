from io import BytesIO
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
from ultralytics import YOLO


PROJECT_ROOT = Path(__file__).resolve().parents[1]
MODEL_PATH = (
    PROJECT_ROOT
    / "runs"
    / "dicapri_yolov8n_preliminar"
    / "weights"
    / "best.pt"
)
RISK_MODEL_PATH = PROJECT_ROOT / "models" / "random_forest_riesgo.joblib"
RISK_DATA_PATH = PROJECT_ROOT / "data" / "dataset_riesgo_mensual.csv"
AMEF_PATH = PROJECT_ROOT / "data" / "fallas_amef.json"

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"No se encontró el modelo en: {MODEL_PATH}"
    )

model = YOLO(str(MODEL_PATH))

for required_path in (RISK_MODEL_PATH, RISK_DATA_PATH, AMEF_PATH):
    if not required_path.exists():
        raise FileNotFoundError(f"No se encontró el recurso de riesgo: {required_path}")

risk_model = joblib.load(RISK_MODEL_PATH)
risk_data = pd.read_csv(RISK_DATA_PATH)
with AMEF_PATH.open("r", encoding="utf-8") as file:
    amef_catalog = {
        item["ID_Falla"]: item for item in json.load(file)
    }

app = FastAPI(
    title="API inteligente Dicapri — YOLOv8n y Random Forest",
    version="0.2.0",
    description="Inspección visual y predicción preliminar de riesgo operacional.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

DEFECT_RULES = {
    "D04": {
        "failure_code": "F09",
        "action": "Segregar la prenda y revisar el disparador del elástico",
    },
    "D06": {
        "failure_code": "F12",
        "action": "Segregar la prenda y revisar los puntos de lubricación",
    },
    "D09": {
        "failure_code": "F07",
        "action": "Segregar la prenda y verificar la tensión del hilo",
    },
}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": True,
        "model": "YOLOv8n preliminar Dicapri",
        "classes": list(model.names.values()),
        "risk_model_loaded": True,
        "risk_model": "Random Forest preliminar Dicapri",
        "risk_classes": [str(item) for item in risk_model.classes_],
    }


RISK_ACTIONS = {
    "bajo": "Mantener operación y supervisión periódica",
    "medio": "Programar inspección preventiva y revisar la falla predominante",
    "alto": "Priorizar mantenimiento preventivo antes del siguiente periodo operativo",
}


@app.get("/risk/{machine_id}")
def predict_machine_risk(machine_id: str):
    machine_id = machine_id.upper().strip()
    machine_rows = risk_data[
        risk_data["ID_Máquina"].astype(str).str.upper() == machine_id
    ].sort_values("mes_num")

    if machine_rows.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No existen observaciones para la máquina {machine_id}.",
        )

    row = machine_rows.tail(1)
    predicted_risk = str(risk_model.predict(row)[0])
    probabilities_array = risk_model.predict_proba(row)[0]
    probabilities = {
        str(label): round(float(value), 4)
        for label, value in zip(risk_model.classes_, probabilities_array)
    }
    confidence = max(probabilities.values())

    failure_code = str(row.iloc[0]["ID_Falla_principal"])
    amef = amef_catalog.get(failure_code, {})

    return {
        "model": "Random Forest",
        "scope": "Riesgo histórico mensual del siguiente periodo",
        "machine_id": machine_id,
        "source_month": str(row.iloc[0]["Mes"]),
        "target_month": str(row.iloc[0]["Mes_objetivo"]),
        "predicted_risk": predicted_risk,
        "confidence": round(confidence, 4),
        "probabilities": probabilities,
        "dominant_failure": failure_code,
        "failure_mode": amef.get("Modo_falla", "Sin descripción AMEF"),
        "npr": int(amef.get("NPR", 0)),
        "recommended_action": RISK_ACTIONS[predicted_risk],
        "input_summary": {
            "total_events": int(row.iloc[0]["Total_eventos"]),
            "unplanned_downtime_min": round(float(row.iloc[0]["Parada_NP_min"]), 2),
            "defect_rate": round(float(row.iloc[0]["%_Defectuosas"]), 4),
            "recurrences": int(row.iloc[0]["reincidencias"]),
        },
        "notice": "Resultado preliminar basado en la base reconstruida/sintética 2025.",
    }


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    conf: float = Query(0.50, ge=0.10, le=0.90),
):
    if file.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(
            status_code=415,
            detail="Solo se admiten imágenes JPEG o PNG.",
        )

    try:
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(
            status_code=400,
            detail="No se pudo interpretar el archivo como imagen.",
        ) from error

    image_array = np.asarray(image)
    result = model.predict(
        source=image_array,
        conf=conf,
        iou=0.45,
        verbose=False,
    )[0]

    detections = []
    actions = []

    for box in result.boxes:
        class_id = int(box.cls.item())
        class_name = model.names[class_id]
        class_code = class_name.split("_", 1)[0]
        confidence = float(box.conf.item())
        coordinates = [
            round(value, 2) for value in box.xyxy[0].tolist()
        ]
        rule = DEFECT_RULES.get(
            class_code,
            {
                "failure_code": "Sin asociación",
                "action": "Segregar la prenda y realizar inspección manual",
            },
        )

        detections.append(
            {
                "class_id": class_id,
                "class_code": class_code,
                "class_name": class_name,
                "confidence": round(confidence, 4),
                "bbox_xyxy": coordinates,
                "failure_code": rule["failure_code"],
                "recommended_action": rule["action"],
            }
        )
        actions.append(rule["action"])

    unique_actions = list(dict.fromkeys(actions))
    recommended_action = (
        " / ".join(unique_actions)
        if unique_actions
        else "Autorizar el pase de la prenda al área de remallado"
    )

    return {
        "filename": file.filename,
        "image_width": image.width,
        "image_height": image.height,
        "threshold": conf,
        "decision": "NO_CONFORME" if detections else "CONFORME",
        "recommended_action": recommended_action,
        "detections": detections,
    }
