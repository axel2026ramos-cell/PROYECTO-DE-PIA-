// Versión en navegador de la API FastAPI (backend/app/api.py): mismas rutas y mismas respuestas.
import * as ort from 'onnxruntime-web/wasm'

ort.env.wasm.numThreads = 1

const BASE = import.meta.env.BASE_URL
const IOU_THRESHOLD = 0.45
const MAX_DETECTIONS = 300

const DEFECT_RULES = {
  D04: { failure_code: 'F09', action: 'Segregar la prenda y revisar el disparador del elástico' },
  D06: { failure_code: 'F12', action: 'Segregar la prenda y revisar los puntos de lubricación' },
  D09: { failure_code: 'F07', action: 'Segregar la prenda y verificar la tensión del hilo' }
}
const DEFAULT_RULE = {
  failure_code: 'Sin asociación',
  action: 'Segregar la prenda y realizar inspección manual'
}

let riskDataPromise = null
let modelPromise = null

function loadRiskData() {
  riskDataPromise ??= fetch(`${BASE}data/riesgo_predicciones.json`).then(r => {
    if (!r.ok) throw new Error('No se pudo leer riesgo_predicciones.json')
    return r.json()
  })
  return riskDataPromise
}

function loadModel() {
  modelPromise ??= (async () => {
    const meta = await fetch(`${BASE}models/dicapri_yolov8n.json`).then(r => r.json())
    const session = await ort.InferenceSession.create(`${BASE}models/dicapri_yolov8n.onnx`, {
      executionProviders: ['wasm']
    })
    return { session, meta }
  })()
  modelPromise.catch(() => { modelPromise = null })
  return modelPromise
}

function readPixels(bitmap) {
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(bitmap, 0, 0)
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height).data
}

// Letterbox de Ultralytics con redimensionado bilineal equivalente a cv2.INTER_LINEAR.
function letterbox(bitmap, size) {
  const srcW = bitmap.width
  const srcH = bitmap.height
  const src = readPixels(bitmap)
  const gain = Math.min(size / srcW, size / srcH)
  const w = Math.round(srcW * gain)
  const h = Math.round(srcH * gain)
  const padX = Math.round((size - w) / 2 - 0.1)
  const padY = Math.round((size - h) / 2 - 0.1)
  const area = size * size
  const tensor = new Float32Array(3 * area).fill(114 / 255)

  const scaleX = srcW / w
  const scaleY = srcH / h
  const xs = new Int32Array(w)
  const xw = new Float32Array(w)
  for (let x = 0; x < w; x++) {
    const fx = Math.min(Math.max((x + 0.5) * scaleX - 0.5, 0), srcW - 1)
    xs[x] = Math.min(Math.floor(fx), srcW - 2 < 0 ? 0 : srcW - 2)
    xw[x] = fx - xs[x]
  }
  for (let y = 0; y < h; y++) {
    const fy = Math.min(Math.max((y + 0.5) * scaleY - 0.5, 0), srcH - 1)
    const y0 = Math.min(Math.floor(fy), srcH - 2 < 0 ? 0 : srcH - 2)
    const y1 = Math.min(y0 + 1, srcH - 1)
    const wy = fy - y0
    const row0 = y0 * srcW
    const row1 = y1 * srcW
    const out = (y + padY) * size + padX
    for (let x = 0; x < w; x++) {
      const x0 = xs[x]
      const x1 = Math.min(x0 + 1, srcW - 1)
      const wx = xw[x]
      const i00 = (row0 + x0) * 4
      const i01 = (row0 + x1) * 4
      const i10 = (row1 + x0) * 4
      const i11 = (row1 + x1) * 4
      for (let c = 0; c < 3; c++) {
        const top = src[i00 + c] + (src[i01 + c] - src[i00 + c]) * wx
        const bottom = src[i10 + c] + (src[i11 + c] - src[i10 + c]) * wx
        tensor[c * area + out + x] = Math.round(top + (bottom - top) * wy) / 255
      }
    }
  }
  return { tensor, gain, padX, padY }
}

function iou(a, b) {
  const x1 = Math.max(a[0], b[0])
  const y1 = Math.max(a[1], b[1])
  const x2 = Math.min(a[2], b[2])
  const y2 = Math.min(a[3], b[3])
  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1)
  const areaA = (a[2] - a[0]) * (a[3] - a[1])
  const areaB = (b[2] - b[0]) * (b[3] - b[1])
  return inter / (areaA + areaB - inter + 1e-9)
}

function postprocess(output, dims, conf, numClasses) {
  const anchors = dims[2]
  const candidates = []
  for (let i = 0; i < anchors; i++) {
    let best = 0
    let cls = -1
    for (let c = 0; c < numClasses; c++) {
      const score = output[(4 + c) * anchors + i]
      if (score > best) { best = score; cls = c }
    }
    if (best <= conf) continue
    const cx = output[i]
    const cy = output[anchors + i]
    const w = output[2 * anchors + i]
    const h = output[3 * anchors + i]
    candidates.push({ box: [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], score: best, cls })
  }
  candidates.sort((a, b) => b.score - a.score)

  const kept = []
  for (const cand of candidates) {
    if (kept.every(k => k.cls !== cand.cls || iou(k.box, cand.box) <= IOU_THRESHOLD)) {
      kept.push(cand)
      if (kept.length >= MAX_DETECTIONS) break
    }
  }
  return kept
}

const round = (value, digits) => Math.round(value * 10 ** digits) / 10 ** digits

async function predict(file, conf) {
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    return jsonResponse(415, { detail: 'Solo se admiten imágenes JPEG o PNG.' })
  }
  let bitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return jsonResponse(400, { detail: 'No se pudo interpretar el archivo como imagen.' })
  }

  const { session, meta } = await loadModel()
  const size = meta.imgsz
  const { tensor, gain, padX, padY } = letterbox(bitmap, size)
  const input = new ort.Tensor('float32', tensor, [1, 3, size, size])
  const outputs = await session.run({ [session.inputNames[0]]: input })
  const output = outputs[session.outputNames[0]]
  const names = meta.names
  const kept = postprocess(output.data, output.dims, conf, Object.keys(names).length)

  const detections = kept.map(({ box, score, cls }) => {
    const [x1, y1, x2, y2] = box.map((v, idx) => {
      const scaled = (v - (idx % 2 === 0 ? padX : padY)) / gain
      const limit = idx % 2 === 0 ? bitmap.width : bitmap.height
      return round(Math.min(Math.max(scaled, 0), limit), 2)
    })
    const className = names[cls]
    const classCode = className.split('_')[0]
    const rule = DEFECT_RULES[classCode] ?? DEFAULT_RULE
    return {
      class_id: cls,
      class_code: classCode,
      class_name: className,
      confidence: round(score, 4),
      bbox_xyxy: [x1, y1, x2, y2],
      failure_code: rule.failure_code,
      recommended_action: rule.action
    }
  })

  const actions = [...new Set(detections.map(d => d.recommended_action))]
  const result = {
    filename: file.name,
    image_width: bitmap.width,
    image_height: bitmap.height,
    threshold: conf,
    decision: detections.length ? 'NO_CONFORME' : 'CONFORME',
    recommended_action: actions.length
      ? actions.join(' / ')
      : 'Autorizar el pase de la prenda al área de remallado',
    detections
  }
  bitmap.close()
  return jsonResponse(200, result)
}

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (status >= 400 ? body.detail : JSON.stringify(body))
  }
}

export async function apiFetch(url, options = {}) {
  const parsed = new URL(url, 'http://local')
  const path = parsed.pathname.replace(/^\/api/, '')

  try {
    if (path === '/health') {
      const [{ health }] = await Promise.all([loadRiskData(), loadModel()])
      return jsonResponse(200, health)
    }

    if (path.startsWith('/risk/')) {
      const machineId = decodeURIComponent(path.slice('/risk/'.length)).toUpperCase().trim()
      const { risk } = await loadRiskData()
      return risk[machineId]
        ? jsonResponse(200, risk[machineId])
        : jsonResponse(404, { detail: `No existen observaciones para la máquina ${machineId}.` })
    }

    if (path === '/predict' && options.method === 'POST') {
      const conf = Number(parsed.searchParams.get('conf') ?? 0.5)
      return await predict(options.body.get('file'), conf)
    }
  } catch (error) {
    return jsonResponse(500, { detail: error.message })
  }

  return jsonResponse(404, { detail: 'Ruta no encontrada' })
}
