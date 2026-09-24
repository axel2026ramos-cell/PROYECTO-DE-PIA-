import argparse
from pathlib import Path

from ultralytics import YOLO


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODEL = (
    ROOT
    / "runs"
    / "dicapri_yolov8n_preliminar"
    / "weights"
    / "best.pt"
)

parser = argparse.ArgumentParser()
parser.add_argument("imagen", help="Ruta de la imagen que se desea evaluar")
parser.add_argument("--modelo", default=str(DEFAULT_MODEL))
parser.add_argument("--conf", type=float, default=0.25)
args = parser.parse_args()

model = YOLO(args.modelo)
results = model.predict(
    source=args.imagen,
    conf=args.conf,
    save=True,
    project=str(ROOT / "predicciones"),
    name="resultado",
)

for result in results:
    for box in result.boxes:
        class_id = int(box.cls.item())
        confidence = float(box.conf.item())
        coordinates = [round(value, 2) for value in box.xyxy[0].tolist()]
        print(
            {
                "clase": model.names[class_id],
                "confianza": round(confidence, 4),
                "bbox_xyxy": coordinates,
            }
        )

print("Resultado visual guardado en:", ROOT / "predicciones" / "resultado")
