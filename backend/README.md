# YOLOv8n preliminar — defectos de medias Dicapri

Este paquete permite entrenar una prueba de concepto local con las anotaciones disponibles.

## Alcance real

- 37 imágenes: 29 para entrenamiento y 8 para validación.
- 41 recuadros.
- Tres clases implementadas: D04, D06 y D09.
- Cuatro fotografías conformes se mantienen como negativos sin recuadros.
- D01 y D03 permanecen fuera del entrenamiento porque no tienen muestras anotadas.
- La división se realizó por grupos horarios de captura, no mediante imágenes individuales aleatorias.

Este modelo sirve para demostrar el flujo técnico del prototipo. Sus métricas no deben presentarse como evidencia de desempeño industrial ni de generalización.

## Instalación en Windows

Instalar Python 3.11 y abrir PowerShell en esta carpeta. Luego ejecutar:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Si PowerShell bloquea la activación, usar CMD:

```cmd
.venv\Scripts\activate.bat
```

## Entrenamiento

```powershell
python scripts\entrenar.py
```

El mejor modelo se guardará en:

```text
runs/dicapri_yolov8n_preliminar/weights/best.pt
```

## Inferencia de prueba

Usar una fotografía que no haya intervenido en el entrenamiento, si está disponible:

```powershell
python scripts\predecir.py "C:\ruta\foto_media.jpeg"
```

La predicción mostrará la clase, confianza y coordenadas, además de guardar una imagen con los recuadros.

## Advertencia metodológica

La clase D09 está sobrerrepresentada. D04 y D06 contienen muy pocos ejemplos. El modelo debe denominarse “preliminar” o “prueba de concepto”. Antes de una validación formal deben añadirse nuevas prendas independientes, D01, D03 y más imágenes conformes.
