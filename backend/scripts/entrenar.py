import os
from pathlib import Path

import torch
from ultralytics import YOLO


ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "dataset" / "data.yaml"
OUTPUT = ROOT / "runs"

device = 0 if torch.cuda.is_available() else "cpu"
os.chdir(ROOT)

model = YOLO("yolov8n.pt")
model.train(
    data=str(DATASET),
    epochs=80,
    imgsz=640,
    batch=8,
    patience=20,
    seed=42,
    workers=0,
    device=device,
    project=str(OUTPUT),
    name="dicapri_yolov8n_preliminar",
    plots=True,
)

print("Entrenamiento finalizado.")
print(
    "Pesos esperados en:",
    OUTPUT / "dicapri_yolov8n_preliminar" / "weights" / "best.pt",
)
