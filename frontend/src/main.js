import './style.css'
import Chart from 'chart.js/auto'
import { apiFetch } from './localApi.js'

document.querySelector('#app').innerHTML = `
  <div class="app-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">TEXTILES DICAPRI E.I.R.L.</p>
        <h1>Prototipo digital de supervisión y control</h1>
        <p class="subtitle">
          Simulación del proceso de alimentación y tensión del hilo
        </p>
      </div>

      <div class="system-status normal" id="systemStatus">
        <span class="status-light"></span>
        <div>
          <small>ESTADO GENERAL</small>
          <strong id="systemStatusText">Sistema preparado</strong>
        </div>
      </div>
    </header>

        <section class="data-context-panel panel">
      <div class="data-context-header">
        <div class="panel-heading">
          <span>00</span>
          <div>
            <h2>Contexto operativo Dicapri</h2>
            <p>Parámetros cargados desde la base reconstruida de 2025</p>
          </div>
        </div>

        <div class="data-origin-badge" id="dataOriginBadge">
          Cargando datos...
        </div>
      </div>

      <div class="data-context-grid">
        <div class="machine-selector-card">
          <label class="field-label" for="machineSelect">
            Máquina analizada
          </label>

          <select id="machineSelect">
            <option value="">Cargando máquinas...</option>
          </select>

          <div class="machine-description">
            <div>
              <small>MODELO</small>
              <strong id="machineModel">—</strong>
            </div>

            <div>
              <small>PRODUCTO HABITUAL</small>
              <strong id="machineProduct">—</strong>
            </div>

            <div>
              <small>ESTADO</small>
              <strong id="machineOperationalStatus">—</strong>
            </div>
          </div>
        </div>

        <div class="historical-kpi-card">
          <small>PRODUCCIÓN ANUAL</small>
          <strong id="machineProduction">—</strong>
          <p>Piezas reconstruidas</p>
        </div>

        <div class="historical-kpi-card critical">
          <small>PORCENTAJE DE DEFECTOS</small>
          <strong id="machineDefectRate">—</strong>
          <p>Línea base de la máquina</p>
        </div>

        <div class="historical-kpi-card">
          <small>EVENTOS DE FALLA</small>
          <strong id="machineFailureEvents">—</strong>
          <p>Eventos reconstruidos</p>
        </div>

        <div class="historical-kpi-card">
          <small>DISPONIBILIDAD</small>
          <strong id="machineAvailability">—</strong>
          <p>Indicador anual</p>
        </div>

        <div class="historical-kpi-card">
          <small>MTBF</small>
          <strong id="machineMtbf">—</strong>
          <p>Horas por evento</p>
        </div>
      </div>

      <div class="baseline-strip">
        <div>
          <small>LÍNEA BASE GLOBAL</small>
          <strong>
            <span id="globalDefectRate">—</span> defectuosas
          </strong>
        </div>

        <div>
          <small>OEE RECONSTRUIDO</small>
          <strong id="globalOee">—</strong>
        </div>

        <div>
          <small>DEFECTO PRIORITARIO</small>
          <strong id="priorityDefect">—</strong>
        </div>

        <div>
          <small>PARTICIPACIÓN</small>
          <strong id="priorityDefectShare">—</strong>
        </div>
      </div>

      <p class="synthetic-warning">
        Línea base reconstruida y sintética. Se utiliza para calibrar y
        demostrar el prototipo digital; no representa registros históricos
        reales ni resultados industriales alcanzados.
      </p>
    </section>
    <main class="dashboard">
      <aside class="control-panel panel">
        <div class="panel-heading">
          <span>01</span>
          <div>
            <h2>Control de simulación</h2>
            <p>Selecciona una condición operativa</p>
          </div>
        </div>

        <div class="main-controls">
          <button class="button primary" id="startButton">
            Iniciar operación
          </button>

          <button class="button secondary" id="pauseButton">
            Pausar
          </button>

          <button class="button outline" id="resetButton">
            Restablecer
          </button>
        </div>

        <div class="autonomous-control-card">
          <label class="field-label" for="operationMode">Modo de operación</label>
          <select id="operationMode">
            <option value="manual">Manual</option>
            <option value="autonomous">Autónomo</option>
          </select>
          <div class="autonomous-options" id="autonomousOptions">
            <label class="field-label" for="autonomousInterval">Intervalo entre ciclos</label>
            <select id="autonomousInterval">
              <option value="15">15 s — demostración</option>
              <option value="25" selected>25 s — recomendado</option>
              <option value="40">40 s — pausado</option>
            </select>
            <label class="autonomous-check">
              <input type="checkbox" id="autonomousYolo" checked>
              <span>Analizar automáticamente la fotografía seleccionada</span>
            </label>
            <div class="autonomous-status-row">
              <span id="autonomousState">Detenido</span>
              <strong id="autonomousCycles">0 ciclos</strong>
            </div>
          </div>
        </div>

        <label class="field-label" for="scenarioSelect">
          Escenario experimental
        </label>

        <select id="scenarioSelect">
  <option value="normal">Operación normal</option>
  <option value="lowTension">F07 — Tensión insuficiente</option>
  <option value="highTension">F07 — Sobretensión</option>
  <option value="brokenThread">F03 — Rotura de hilo</option>
  <option value="jam">F04/F10 — Atascamiento</option>
  <option value="brokenNeedle">F01 — Rotura de aguja</option>
  <option value="elasticTrigger">
    F09 — Falla del disparador elástico
  </option>
  <option value="oilStain">
    F12 — Lubricante sobre la prenda
  </option>
</select>

        <button class="button danger" id="applyScenarioButton">
          Inducir escenario
        </button>
<div class="amef-scenario-card">
  <div class="amef-title">
    <span>AMEF</span>
    <strong id="amefFailureCode">Sin falla</strong>
  </div>

  <div class="amef-data-grid">
    <div>
      <small>MODO DE FALLA</small>
      <strong id="amefFailureMode">Operación normal</strong>
    </div>

    <div>
      <small>DEFECTO POTENCIAL</small>
      <strong id="amefPotentialDefect">Ninguno</strong>
    </div>

    <div>
      <small>NPR</small>
      <strong id="amefNpr">0</strong>
    </div>

    <div>
      <small>DURACIÓN REFERENCIAL</small>
      <strong id="amefDuration">—</strong>
    </div>
  </div>

  <div class="amef-action">
    <small>RESPUESTA PROPUESTA</small>
    <strong id="amefRecommendedAction">
      Mantener supervisión
    </strong>
  </div>
</div>
        <div class="automatic-control">
          <div>
            <strong>Control automático</strong>
            <small>Permite ejecutar acciones correctivas</small>
          </div>

          <label class="switch">
            <input type="checkbox" id="automaticControl" checked>
            <span class="slider"></span>
          </label>
        </div>

        <div class="simulation-time">
          <small>TIEMPO DE OPERACIÓN</small>
          <strong id="simulationTime">00:00</strong>
        </div>
      </aside>

      <section class="process-panel panel">
        <div class="panel-heading">
          <span>02</span>
          <div>
            <h2>Banco experimental virtual</h2>
            <p>Representación funcional del recorrido del hilo</p>
          </div>
        </div>

        <div class="process-stage" id="processStage">
          <div class="machine-label">ALIMENTACIÓN</div>
          <div class="machine-label weaving-label">ZONA DE TEJIDO</div>

          <div class="spool machine-part" id="spool">
            <div class="spool-core"></div>
          </div>

          <div class="thread thread-one"></div>

          <div class="roller machine-part" id="rollerOne">
            <div class="roller-center"></div>
          </div>

          <div class="thread thread-two"></div>

          <div class="tension-sensor machine-part" id="tensionSensor">
            <span>T</span>
            <small>Sensor</small>
          </div>

          <div class="thread thread-three"></div>

          <div class="servo machine-part" id="servo">
            <div class="servo-arm"></div>
            <small>Servotensor</small>
          </div>

          <div class="thread thread-four" id="threadFour"></div>

          <div class="optical-sensor machine-part" id="opticalSensor">
            <span></span>
            <small>Sensor óptico</small>
          </div>

          <div class="thread thread-five" id="threadFive"></div>

          <div class="weaving-unit machine-part" id="weavingUnit">
            <div class="weaving-wheel"></div>
            <small>Módulo representativo</small>
          </div>

          <div class="flow-arrow arrow-one">→</div>
          <div class="flow-arrow arrow-two">→</div>
          <div class="flow-arrow arrow-three">→</div>
        </div>

        <div class="decision-strip">
          <div>
            <small>ANOMALÍA</small>
            <strong id="anomalyText">Ninguna</strong>
          </div>

          <div>
            <small>DIAGNÓSTICO</small>
            <strong id="diagnosisText">Operación sin evaluar</strong>
          </div>

          <div>
            <small>ACCIÓN</small>
            <strong id="actionText">Esperando inicio</strong>
          </div>
        </div>
      </section>

      <aside class="sensor-panel panel">
        <div class="panel-heading">
          <span>03</span>
          <div>
            <h2>Sensores virtuales</h2>
            <p>Lecturas en tiempo real</p>
          </div>
        </div>

        <div class="sensor-grid">
          <article class="sensor-card" id="tensionCard">
            <div class="sensor-icon">T</div>
            <div>
              <small>TENSIÓN</small>
              <strong><span id="tensionValue">42.0</span> cN</strong>
              <p>Rango: 35–50 cN</p>
            </div>
          </article>

          <article class="sensor-card" id="speedCard">
            <div class="sensor-icon">V</div>
            <div>
              <small>VELOCIDAD</small>
              <strong><span id="speedValue">105</span> rpm</strong>
              <p>Rango: 90–120 rpm</p>
            </div>
          </article>

          <article class="sensor-card" id="vibrationCard">
            <div class="sensor-icon">R</div>
            <div>
              <small>VIBRACIÓN RMS</small>
              <strong><span id="vibrationValue">1.8</span> mm/s</strong>
              <p>Límite: 5 mm/s</p>
            </div>
          </article>

          <article class="sensor-card" id="temperatureCard">
            <div class="sensor-icon">°</div>
            <div>
              <small>TEMPERATURA</small>
              <strong><span id="temperatureValue">38.0</span> °C</strong>
              <p>Límite: 65 °C</p>
            </div>
          </article>

          <article class="sensor-card" id="currentCard">
            <div class="sensor-icon">I</div>
            <div>
              <small>CORRIENTE</small>
              <strong><span id="currentValue">1.1</span> A</strong>
              <p>Límite: 2 A</p>
            </div>
          </article>

          <article class="sensor-card" id="threadCard">
            <div class="sensor-icon">H</div>
            <div>
              <small>PRESENCIA DE HILO</small>
              <strong id="threadValue">Detectado</strong>
              <p>Sensor óptico</p>
            </div>
          </article>
        </div>
      </aside>
    </main>
    <section class="charts-panel panel">
      <div class="panel-heading">
        <span>04</span>
        <div>
          <h2>Comportamiento de las variables</h2>
          <p>Evolución de los sensores durante los últimos 30 segundos</p>
        </div>
      </div>

      <div class="charts-grid">
        <article class="chart-card">
          <div class="chart-header">
            <h3>Condición del hilo</h3>
            <small>Tensión y velocidad</small>
          </div>
          <div class="chart-container">
            <canvas id="threadConditionChart"></canvas>
          </div>
        </article>

        <article class="chart-card">
          <div class="chart-header">
            <h3>Condición mecánica</h3>
            <small>Vibración y corriente</small>
          </div>
          <div class="chart-container">
            <canvas id="mechanicalChart"></canvas>
          </div>
        </article>

        <article class="chart-card">
          <div class="chart-header">
            <h3>Condición térmica</h3>
            <small>Temperatura del sistema</small>
          </div>
          <div class="chart-container">
            <canvas id="temperatureChart"></canvas>
          </div>
        </article>
      </div>
    </section>
    <section class="visual-inspection-panel panel">
      <div class="panel-heading">
        <span>05</span>
        <div>
          <h2>Inspección visual de la media</h2>
          <p>Evaluación asistida desde el elástico hasta antes de la puntera abierta</p>
        </div>
      </div>

      <div class="visual-inspection-grid">
        <div class="visual-viewer">
          <div class="visual-preview" id="visualPreview">
            <div class="visual-placeholder" id="visualPlaceholder">
              <strong>Cargar fotografía de una media</strong>
              <span>Formatos admitidos: JPG, JPEG y PNG</span>
            </div>
            <img id="visualImage" alt="Media seleccionada para inspección">
            <div class="inspection-roi" id="inspectionRoi">
              <span>REGIÓN INSPECCIONABLE</span>
            </div>
            <div class="yolo-detection-layer" id="yoloDetectionLayer"></div>
          </div>

          <p class="visual-scope-note">
            La puntera abierta y los hilos del borde se excluyen porque corresponden
            al estado normal de la prenda antes del remallado.
          </p>
        </div>

        <div class="visual-controls">
          <label class="file-button" for="visualImageInput">
            Seleccionar fotografía(s)
          </label>
          <input id="visualImageInput" type="file" accept="image/jpeg,image/png" multiple>

          <div class="api-status checking" id="yoloApiStatus">
            <span></span>
            <strong>Comprobando conexión con YOLOv8n...</strong>
          </div>

          <label for="visualConfidence">
            Umbral mínimo de confianza:
            <strong><span id="visualConfidenceValue">50</span> %</strong>
          </label>
          <input id="visualConfidence" type="range" min="10" max="90" value="50">

          <button class="button visual-analyze-button" id="visualAnalyzeButton" disabled>
            Analizar con YOLOv8n
          </button>

          <div class="visual-batch-card">
            <div class="visual-batch-heading">
              <div>
                <small>INSPECCIÓN CONSECUTIVA</small>
                <strong id="visualBatchStatus">Lote no seleccionado</strong>
              </div>
              <span id="visualBatchProgress">0 / 0</span>
            </div>

            <label for="visualBatchInterval">Tiempo entre medias</label>
            <select id="visualBatchInterval">
              <option value="2">2 s — demostración rápida</option>
              <option value="5" selected>5 s — recomendado</option>
              <option value="10">10 s — observación detallada</option>
            </select>

            <div class="visual-batch-actions">
              <button class="button" id="visualBatchStart" disabled>Iniciar lote</button>
              <button class="button outline" id="visualBatchStop" disabled>Pausar lote</button>
            </div>

            <div class="visual-batch-counters">
              <span>Conformes <strong id="visualBatchOk">0</strong></span>
              <span>No conformes <strong id="visualBatchNg">0</strong></span>
            </div>
          </div>

          <div class="visual-result" id="visualResult">
            <small>RESULTADO DE INSPECCIÓN</small>
            <strong id="visualResultStatus">Esperando imagen</strong>
            <p id="visualResultDetail">
              Selecciona una fotografía para ejecutar la inferencia local.
            </p>
          </div>

          <p class="visual-disclaimer">
            Inferencia local con YOLOv8n preliminar. Clases implementadas:
            D04, D06 y D09. D01 y D03 permanecen pendientes de nuevas muestras.
          </p>
        </div>
      </div>
    </section>

    <section class="risk-panel panel">
      <div class="panel-heading">
        <span>06</span>
        <div>
          <h2>Predicción de riesgo operacional</h2>
          <p>Evaluación histórica mensual mediante Random Forest</p>
        </div>
      </div>

      <div class="risk-grid">
        <article class="risk-summary-card" id="riskSummaryCard">
          <small>RIESGO DEL SIGUIENTE PERIODO</small>
          <strong id="riskLevel">Sin evaluar</strong>
          <p id="riskScope">Selecciona una máquina y ejecuta la predicción.</p>
          <button class="button risk-analyze-button" id="riskAnalyzeButton">
            Evaluar con Random Forest
          </button>
        </article>

        <article class="risk-detail-card">
          <div><span>Modelo</span><strong id="riskModel">Random Forest</strong></div>
          <div><span>Periodo analizado</span><strong id="riskSourceMonth">—</strong></div>
          <div><span>Periodo objetivo</span><strong id="riskTargetMonth">—</strong></div>
          <div><span>Confianza</span><strong id="riskConfidence">—</strong></div>
        </article>

        <article class="risk-probability-card">
          <small>PROBABILIDAD POR NIVEL</small>
          <div class="risk-probability-row">
            <span>Bajo</span><progress id="riskProbLow" max="100" value="0"></progress><strong id="riskProbLowValue">0 %</strong>
          </div>
          <div class="risk-probability-row">
            <span>Medio</span><progress id="riskProbMedium" max="100" value="0"></progress><strong id="riskProbMediumValue">0 %</strong>
          </div>
          <div class="risk-probability-row">
            <span>Alto</span><progress id="riskProbHigh" max="100" value="0"></progress><strong id="riskProbHighValue">0 %</strong>
          </div>
        </article>

        <article class="risk-action-card">
          <small>INTERPRETACIÓN OPERATIVA</small>
          <strong id="riskFailure">Sin diagnóstico</strong>
          <p id="riskAction">La recomendación aparecerá después de la evaluación.</p>
          <span id="riskNotice">Base reconstruida/sintética 2025.</span>
        </article>
      </div>
    </section>

    <section class="decision-panel panel">
      <div class="panel-heading">
        <span>07</span>
        <div>
          <h2>Módulo inteligente de decisión</h2>
          <p>Integración de YOLOv8n, Random Forest y criticidad AMEF</p>
        </div>
      </div>

      <div class="decision-grid">
        <article class="decision-evidence-card">
          <small>EVIDENCIA DE VISIÓN</small>
          <strong id="decisionVisualEvidence">Pendiente</strong>
          <p id="decisionVisualDetail">Analiza primero una fotografía con YOLOv8n.</p>
        </article>

        <article class="decision-evidence-card">
          <small>EVIDENCIA HISTÓRICA</small>
          <strong id="decisionRiskEvidence">Pendiente</strong>
          <p id="decisionRiskDetail">Evalúa primero la máquina con Random Forest.</p>
        </article>

        <article class="decision-evidence-card">
          <small>CRITICIDAD AMEF</small>
          <strong id="decisionAmefEvidence">Pendiente</strong>
          <p id="decisionAmefDetail">Se calculará con las fallas asociadas.</p>
        </article>

        <article class="decision-output-card" id="decisionOutputCard">
          <small>DECISIÓN INTEGRADA</small>
          <strong id="integratedDecisionStatus">Esperando evidencias</strong>
          <p id="integratedDecisionAction">
            Ejecuta la inspección visual y la predicción histórica.
          </p>
          <span id="integratedDecisionReason">
            El sistema requiere ambos resultados antes de decidir.
          </span>
          <button class="button" id="registerDecisionButton" disabled>
            Registrar decisión conjunta
          </button>
        </article>
      </div>
    </section>

        <section class="metrics-panel panel">
      <div class="panel-heading">
        <span>08</span>
        <div>
          <h2>Resultados experimentales</h2>
          <p>Indicadores calculados durante la simulación</p>
        </div>
      </div>

      <div class="metrics-grid">
        <article class="metric-card">
          <small>ANOMALÍAS DETECTADAS</small>
          <strong id="totalAnomalies">0</strong>
          <p>Eventos diferentes de operación normal</p>
        </article>

        <article class="metric-card success">
          <small>EVENTOS CONTROLADOS</small>
          <strong id="controlledEvents">0</strong>
          <p>Recuperaciones verificadas</p>
        </article>

        <article class="metric-card critical">
          <small>PARADAS CRÍTICAS</small>
          <strong id="criticalStops">0</strong>
          <p>Roturas y atascamientos</p>
        </article>

        <article class="metric-card">
          <small>PORCENTAJE DE RECUPERACIÓN</small>
          <strong><span id="recoveryPercentage">0.0</span> %</strong>
          <p>Eventos controlados sobre recuperables</p>
        </article>

        <article class="metric-card">
          <small>TIEMPO MEDIO DE DIAGNÓSTICO</small>
          <strong><span id="averageResponseTime">0.0</span> s</strong>
          <p>Desde inducción hasta diagnóstico</p>
        </article>

        <article class="metric-card">
          <small>TIEMPO MEDIO DE RECUPERACIÓN</small>
          <strong><span id="averageRecoveryTime">0.0</span> s</strong>
          <p>Desde anomalía hasta normalización</p>
        </article>
      </div>

      <div class="metrics-actions">
        <p>
          Los resultados corresponden a escenarios simulados del prototipo digital.
        </p>

        <button class="button export-button" id="exportButton">
          Exportar registros CSV
        </button>

        <button class="button" id="clearHistoryButton">
          Limpiar historial
        </button>
      </div>
    </section>
    <section class="event-panel panel">
      <div class="panel-heading">
        <span>09</span>
        <div>
          <h2>Registro de eventos</h2>
          <p>Historial de detecciones y actuaciones</p>
        </div>
      </div>

      <div class="event-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Fecha / tiempo</th>
              <th>Máquina</th>
              <th>Escenario</th>
              <th>AMEF / NPR</th>
              <th>Defecto / confianza</th>
              <th>Diagnóstico</th>
              <th>Acción</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody id="eventTable">
            <tr class="empty-row">
              <td colspan="8">Todavía no se han registrado eventos.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
`

let running = false
let seconds = 0
let timer = null
let currentScenario = 'normal'
let correctionTimers = []
let correctionInProgress = false
let autonomousTimer = null
let autonomousCycleInProgress = false
let autonomousCycleCount = 0

function scheduleCorrection(callback, delay) {
  const timerId = setTimeout(callback, delay)
  correctionTimers.push(timerId)
}

function cancelScheduledCorrections() {
  correctionTimers.forEach(timerId => clearTimeout(timerId))
  correctionTimers = []
  correctionInProgress = false
}

const values = {
  tension: 42,
  speed: 105,
  vibration: 1.8,
  temperature: 38,
  current: 1.1,
  threadPresent: true
}
const metrics = {
  totalAnomalies: 0,
  recoverableEvents: 0,
  controlledEvents: 0,
  criticalStops: 0,
  responseTimes: [],
  recoveryTimes: []
}

const EVENT_STORAGE_KEY = 'dicapri-event-records-v1'

let eventRecords = loadStoredEvents()

function loadStoredEvents() {
  try {
    const storedEvents = JSON.parse(
      localStorage.getItem(EVENT_STORAGE_KEY) || '[]'
    )

    return Array.isArray(storedEvents) ? storedEvents : []
  } catch (error) {
    console.warn('No se pudo recuperar el historial:', error)
    return []
  }
}

function saveEventRecords() {
  localStorage.setItem(
    EVENT_STORAGE_KEY,
    JSON.stringify(eventRecords)
  )
}

function calculateAverage(numbers) {
  if (numbers.length === 0) return 0

  const total = numbers.reduce((sum, value) => sum + value, 0)
  return total / numbers.length
}

function updateMetrics() {
  const recoveryPercentage =
    metrics.recoverableEvents === 0
      ? 0
      : (metrics.controlledEvents / metrics.recoverableEvents) * 100

  elements.totalAnomalies.textContent = metrics.totalAnomalies
  elements.controlledEvents.textContent = metrics.controlledEvents
  elements.criticalStops.textContent = metrics.criticalStops

  elements.recoveryPercentage.textContent =
    recoveryPercentage.toFixed(1)

  elements.averageResponseTime.textContent =
    calculateAverage(metrics.responseTimes).toFixed(1)

  elements.averageRecoveryTime.textContent =
    calculateAverage(metrics.recoveryTimes).toFixed(1)
}
const elements = {
  startButton: document.querySelector('#startButton'),
  pauseButton: document.querySelector('#pauseButton'),
  resetButton: document.querySelector('#resetButton'),
  applyScenarioButton: document.querySelector('#applyScenarioButton'),
  scenarioSelect: document.querySelector('#scenarioSelect'),
  automaticControl: document.querySelector('#automaticControl'),
  operationMode: document.querySelector('#operationMode'),
  autonomousOptions: document.querySelector('#autonomousOptions'),
  autonomousInterval: document.querySelector('#autonomousInterval'),
  autonomousYolo: document.querySelector('#autonomousYolo'),
  autonomousState: document.querySelector('#autonomousState'),
  autonomousCycles: document.querySelector('#autonomousCycles'),
  simulationTime: document.querySelector('#simulationTime'),
  systemStatus: document.querySelector('#systemStatus'),
  systemStatusText: document.querySelector('#systemStatusText'),
  anomalyText: document.querySelector('#anomalyText'),
  diagnosisText: document.querySelector('#diagnosisText'),
  actionText: document.querySelector('#actionText'),
  eventTable: document.querySelector('#eventTable'),
  spool: document.querySelector('#spool'),
  weavingUnit: document.querySelector('#weavingUnit'),
  servo: document.querySelector('#servo'),
  threadFour: document.querySelector('#threadFour'),
  threadFive: document.querySelector('#threadFive'),  
  totalAnomalies: document.querySelector('#totalAnomalies'),
  controlledEvents: document.querySelector('#controlledEvents'),
  criticalStops: document.querySelector('#criticalStops'),
  recoveryPercentage: document.querySelector('#recoveryPercentage'),
  averageResponseTime: document.querySelector('#averageResponseTime'),
  averageRecoveryTime: document.querySelector('#averageRecoveryTime'),
  exportButton: document.querySelector('#exportButton'),
  clearHistoryButton: document.querySelector('#clearHistoryButton'),
  machineSelect: document.querySelector('#machineSelect'),
  machineModel: document.querySelector('#machineModel'),
  machineProduct: document.querySelector('#machineProduct'),
  machineOperationalStatus: document.querySelector(
    '#machineOperationalStatus'
  ),
  machineProduction: document.querySelector('#machineProduction'),
  machineDefectRate: document.querySelector('#machineDefectRate'),
  machineFailureEvents: document.querySelector('#machineFailureEvents'),
  machineAvailability: document.querySelector('#machineAvailability'),
  machineMtbf: document.querySelector('#machineMtbf'),
  globalDefectRate: document.querySelector('#globalDefectRate'),
  globalOee: document.querySelector('#globalOee'),
  priorityDefect: document.querySelector('#priorityDefect'),
  priorityDefectShare: document.querySelector('#priorityDefectShare'),
  dataOriginBadge: document.querySelector('#dataOriginBadge'),
    amefFailureCode: document.querySelector('#amefFailureCode'),
  amefFailureMode: document.querySelector('#amefFailureMode'),
  amefPotentialDefect: document.querySelector(
    '#amefPotentialDefect'
  ),
  amefNpr: document.querySelector('#amefNpr'),
  amefDuration: document.querySelector('#amefDuration'),
  amefRecommendedAction: document.querySelector(
    '#amefRecommendedAction'
  ),
  visualImageInput: document.querySelector('#visualImageInput'),
  visualImage: document.querySelector('#visualImage'),
  visualPlaceholder: document.querySelector('#visualPlaceholder'),
  inspectionRoi: document.querySelector('#inspectionRoi'),
  yoloDetectionLayer: document.querySelector('#yoloDetectionLayer'),
  yoloApiStatus: document.querySelector('#yoloApiStatus'),
  visualConfidence: document.querySelector('#visualConfidence'),
  visualConfidenceValue: document.querySelector('#visualConfidenceValue'),
  visualAnalyzeButton: document.querySelector('#visualAnalyzeButton'),
  visualBatchStatus: document.querySelector('#visualBatchStatus'),
  visualBatchProgress: document.querySelector('#visualBatchProgress'),
  visualBatchInterval: document.querySelector('#visualBatchInterval'),
  visualBatchStart: document.querySelector('#visualBatchStart'),
  visualBatchStop: document.querySelector('#visualBatchStop'),
  visualBatchOk: document.querySelector('#visualBatchOk'),
  visualBatchNg: document.querySelector('#visualBatchNg'),
  visualResult: document.querySelector('#visualResult'),
  visualResultStatus: document.querySelector('#visualResultStatus'),
  visualResultDetail: document.querySelector('#visualResultDetail'),
  riskSummaryCard: document.querySelector('#riskSummaryCard'),
  riskLevel: document.querySelector('#riskLevel'),
  riskScope: document.querySelector('#riskScope'),
  riskAnalyzeButton: document.querySelector('#riskAnalyzeButton'),
  riskModel: document.querySelector('#riskModel'),
  riskSourceMonth: document.querySelector('#riskSourceMonth'),
  riskTargetMonth: document.querySelector('#riskTargetMonth'),
  riskConfidence: document.querySelector('#riskConfidence'),
  riskProbLow: document.querySelector('#riskProbLow'),
  riskProbMedium: document.querySelector('#riskProbMedium'),
  riskProbHigh: document.querySelector('#riskProbHigh'),
  riskProbLowValue: document.querySelector('#riskProbLowValue'),
  riskProbMediumValue: document.querySelector('#riskProbMediumValue'),
  riskProbHighValue: document.querySelector('#riskProbHighValue'),
  riskFailure: document.querySelector('#riskFailure'),
  riskAction: document.querySelector('#riskAction'),
  riskNotice: document.querySelector('#riskNotice'),
  decisionVisualEvidence: document.querySelector('#decisionVisualEvidence'),
  decisionVisualDetail: document.querySelector('#decisionVisualDetail'),
  decisionRiskEvidence: document.querySelector('#decisionRiskEvidence'),
  decisionRiskDetail: document.querySelector('#decisionRiskDetail'),
  decisionAmefEvidence: document.querySelector('#decisionAmefEvidence'),
  decisionAmefDetail: document.querySelector('#decisionAmefDetail'),
  decisionOutputCard: document.querySelector('#decisionOutputCard'),
  integratedDecisionStatus: document.querySelector('#integratedDecisionStatus'),
  integratedDecisionAction: document.querySelector('#integratedDecisionAction'),
  integratedDecisionReason: document.querySelector('#integratedDecisionReason'),
  registerDecisionButton: document.querySelector('#registerDecisionButton'),
}
let dicapriData = {
  machines: [],
  machineKpis: [],
  baseline: null,
  defectPareto: [],
  failures: [],
  defectCauses: []
}

function formatInteger(value) {
  return new Intl.NumberFormat('es-PE', {
    maximumFractionDigits: 0
  }).format(value ?? 0)
}

function formatPercentage(value) {
  return new Intl.NumberFormat('es-PE', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value ?? 0)
}

function formatDecimal(value, decimals = 2) {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value ?? 0)
}

async function loadDicapriData() {
  try {
const responses = await Promise.all([
  fetch(import.meta.env.BASE_URL + 'data/maquinas.json'),
  fetch(import.meta.env.BASE_URL + 'data/kpi_maquinas.json'),
  fetch(import.meta.env.BASE_URL + 'data/linea_base.json'),
  fetch(import.meta.env.BASE_URL + 'data/pareto_defectos_ordenado.json'),
  fetch(import.meta.env.BASE_URL + 'data/fallas_amef.json'),
  fetch(import.meta.env.BASE_URL + 'data/defectos_causas.json')
])

    if (responses.some(response => !response.ok)) {
      throw new Error('No se pudieron leer uno o más archivos JSON.')
    }

    const [
  machines,
  machineKpis,
  baseline,
  defectPareto,
  failures,
  defectCauses
] = await Promise.all(
  responses.map(response => response.json())
)
    dicapriData = {
      machines,
      machineKpis,
      baseline,
      defectPareto,
      failures,
      defectCauses
    }

    populateMachineSelector()
    renderGlobalBaseline()
    renderAmefScenarioInfo(elements.scenarioSelect.value)
    elements.dataOriginBadge.textContent =
      'Base reconstruida 2025'

    elements.dataOriginBadge.classList.add('loaded')
  } catch (error) {
    console.error('Error al cargar la base Dicapri:', error)

    elements.dataOriginBadge.textContent =
      'Error al cargar datos'

    elements.dataOriginBadge.classList.add('error')
  }
}
const scenarioAmefMap = {
  normal: {
    failureIds: [],
    defect: 'Ninguno',
    action: 'Mantener supervisión de variables'
  },
  lowTension: {
    failureIds: ['F07'],
    defect: 'D09 — Tejido incorrecto parcial',
    action: 'Aumentar tensión mediante servotensor'
  },
  highTension: {
    failureIds: ['F07'],
    defect: 'D09 — Tejido incorrecto parcial',
    action: 'Liberar tensor y reducir velocidad'
  },
  brokenThread: {
    failureIds: ['F03'],
    defect: 'D03 — Vacío o falta de tejido',
    action: 'Detener máquina y reponer el hilo'
  },
  jam: {
    failureIds: ['F04', 'F10'],
    defect: 'D02/D03 — Zona sin tejer o vacío',
    action: 'Ejecutar parada y revisar el mecanismo'
  },
  brokenNeedle: {
    failureIds: ['F01'],
    defect: 'D01 — Raya vertical',
    action: 'Detener máquina y sustituir la aguja'
  },
  elasticTrigger: {
    failureIds: ['F09'],
    defect: 'D04/D07 — Defecto en el elástico',
    action: 'Detener y ajustar el disparador elástico'
  },
  oilStain: {
    failureIds: ['F12'],
    defect: 'D06 — Mancha',
    action: 'Segregar prenda y revisar lubricación'
  }
}

function renderAmefScenarioInfo(scenario) {
  const map = scenarioAmefMap[scenario]

  if (!map) return

  if (map.failureIds.length === 0) {
    elements.amefFailureCode.textContent = 'Sin falla'
    elements.amefFailureMode.textContent = 'Operación normal'
    elements.amefPotentialDefect.textContent = map.defect
    elements.amefNpr.textContent = '0'
    elements.amefDuration.textContent = '—'
    elements.amefRecommendedAction.textContent = map.action
    return
  }

  const failures = map.failureIds
    .map(id =>
      dicapriData.failures.find(
        failure => failure['ID_Falla'] === id
      )
    )
    .filter(Boolean)

  if (failures.length === 0) {
    elements.amefFailureCode.textContent =
      map.failureIds.join(' / ')

    elements.amefFailureMode.textContent =
      'Información AMEF no disponible'

    elements.amefPotentialDefect.textContent = map.defect
    elements.amefNpr.textContent = '—'
    elements.amefDuration.textContent = '—'
    elements.amefRecommendedAction.textContent = map.action
    return
  }

  elements.amefFailureCode.textContent =
    failures.map(failure => failure['ID_Falla']).join(' / ')

  elements.amefFailureMode.textContent =
    failures
      .map(failure => failure['Modo_falla'])
      .join(' / ')

  elements.amefPotentialDefect.textContent = map.defect

  elements.amefNpr.textContent = Math.max(
    ...failures.map(failure => Number(failure['NPR']) || 0)
  )

  elements.amefDuration.textContent =
    failures
      .map(failure => failure['Duración_ref_min'])
      .filter(Boolean)
      .join(' / ') || 'Sin parada'

  elements.amefRecommendedAction.textContent = map.action
}
function populateMachineSelector() {
  elements.machineSelect.innerHTML = dicapriData.machines
    .map(machine => {
      const id = machine['ID_Máquina']
      const model = machine['Modelo']

      return `
        <option value="${id}">
          ${id} — ${model}
        </option>
      `
    })
    .join('')

  const initialMachine =
    dicapriData.machines.some(
      machine => machine['ID_Máquina'] === 'M04'
    )
      ? 'M04'
      : dicapriData.machines[0]?.['ID_Máquina']

  if (initialMachine) {
    elements.machineSelect.value = initialMachine
    renderMachineData(initialMachine)
  }
}

function renderMachineData(machineId) {
  const machine = dicapriData.machines.find(
    item => item['ID_Máquina'] === machineId
  )

  const kpi = dicapriData.machineKpis.find(
    item => item['ID_Máquina'] === machineId
  )

  if (!machine || !kpi) return

  elements.machineModel.textContent =
    `${machine['Marca']} ${machine['Modelo']}`

  elements.machineProduct.textContent =
    machine['Producto_habitual'] || 'Sin producto asignado'

  elements.machineOperationalStatus.textContent =
    machine['Estado'] || 'Sin información'

  elements.machineProduction.textContent =
    formatInteger(kpi['Producción'])

  elements.machineDefectRate.textContent =
    formatPercentage(kpi['% Defectos'])

  elements.machineFailureEvents.textContent =
    formatInteger(kpi['Eventos_falla'])

  elements.machineAvailability.textContent =
    formatPercentage(kpi['Disponibilidad'])

  elements.machineMtbf.textContent =
    `${formatDecimal(kpi['MTBF_h'], 2)} h`
}

function renderGlobalBaseline() {
  const baseline = dicapriData.baseline
  const priorityDefect = dicapriData.defectPareto[0]

  if (!baseline || !priorityDefect) return

  elements.globalDefectRate.textContent =
    formatPercentage(baseline['% defectuosas']?.valor)

  elements.globalOee.textContent =
    formatPercentage(baseline['OEE reconstruido']?.valor)

  elements.priorityDefect.textContent =
    priorityDefect['Defecto']

  elements.priorityDefectShare.textContent =
    formatPercentage(priorityDefect['Porcentaje'])
}

const chartLabels = []

const chartConfiguration = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  plugins: {
    legend: {
      labels: {
        color: '#334e68',
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
        font: {
          size: 10
        }
      }
    },
    tooltip: {
      backgroundColor: '#172033',
      borderColor: '#52677d',
      borderWidth: 1,
      titleColor: '#ffffff',
      bodyColor: '#e2e8f0'
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#52677d',
        maxTicksLimit: 6,
        font: {
          size: 9
        }
      },
      grid: {
        color: 'rgba(72, 104, 135, 0.18)'
      }
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: '#52677d',
        font: {
          size: 9
        }
      },
      grid: {
        color: 'rgba(72, 104, 135, 0.18)'
      }
    }
  }
}

const threadConditionChart = new Chart(
  document.querySelector('#threadConditionChart'),
  {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: 'Tensión (cN)',
          data: [],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.12)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.35
        },
        {
          label: 'Velocidad (rpm)',
          data: [],
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167, 139, 250, 0.12)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.35
        }
      ]
    },
    options: chartConfiguration
  }
)

const mechanicalChart = new Chart(
  document.querySelector('#mechanicalChart'),
  {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: 'Vibración (mm/s)',
          data: [],
          borderColor: '#fbbf24',
          backgroundColor: 'rgba(251, 191, 36, 0.12)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.35
        },
        {
          label: 'Corriente (A)',
          data: [],
          borderColor: '#fb7185',
          backgroundColor: 'rgba(251, 113, 133, 0.12)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.35
        }
      ]
    },
    options: chartConfiguration
  }
)

const temperatureChart = new Chart(
  document.querySelector('#temperatureChart'),
  {
    type: 'line',
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: 'Temperatura (°C)',
          data: [],
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.13)',
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.35
        }
      ]
    },
    options: chartConfiguration
  }
)

function updateCharts() {
  const timeLabel = elements.simulationTime.textContent

  chartLabels.push(timeLabel)

  threadConditionChart.data.datasets[0].data.push(
    Number(values.tension.toFixed(1))
  )

  threadConditionChart.data.datasets[1].data.push(
    Math.round(values.speed)
  )

  mechanicalChart.data.datasets[0].data.push(
    Number(values.vibration.toFixed(1))
  )

  mechanicalChart.data.datasets[1].data.push(
    Number(values.current.toFixed(1))
  )

  temperatureChart.data.datasets[0].data.push(
    Number(values.temperature.toFixed(1))
  )

  if (chartLabels.length > 30) {
    chartLabels.shift()

    threadConditionChart.data.datasets.forEach(dataset => {
      dataset.data.shift()
    })

    mechanicalChart.data.datasets.forEach(dataset => {
      dataset.data.shift()
    })

    temperatureChart.data.datasets.forEach(dataset => {
      dataset.data.shift()
    })
  }

  threadConditionChart.update('none')
  mechanicalChart.update('none')
  temperatureChart.update('none')
}

function clearCharts() {
  chartLabels.length = 0

  threadConditionChart.data.datasets.forEach(dataset => {
    dataset.data.length = 0
  })

  mechanicalChart.data.datasets.forEach(dataset => {
    dataset.data.length = 0
  })

  temperatureChart.data.datasets.forEach(dataset => {
    dataset.data.length = 0
  })

  threadConditionChart.update('none')
  mechanicalChart.update('none')
  temperatureChart.update('none')
}

function randomNoise(amount) {
  return (Math.random() - 0.5) * amount
}

function approach(current, target, rate) {
  return current + (target - current) * rate
}

function updateTimer() {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const remainingSeconds = String(seconds % 60).padStart(2, '0')
  elements.simulationTime.textContent = `${minutes}:${remainingSeconds}`
}

function updateValues() {
  if (!running) return

  const targets = {
    normal: {
      tension: 42,
      speed: 105,
      vibration: 1.8,
      temperature: 40,
      current: 1.1,
      threadPresent: true
    },
    lowTension: {
      tension: 20,
      speed: 102,
      vibration: 2.2,
      temperature: 42,
      current: 1.0,
      threadPresent: true
    },
    highTension: {
      tension: 68,
      speed: 108,
      vibration: 3.2,
      temperature: 47,
      current: 1.6,
      threadPresent: true
    },
    brokenThread: {
      tension: 0.5,
      speed: 0,
      vibration: 0.2,
      temperature: 37,
      current: 0.1,
      threadPresent: false
    },
    jam: {
      tension: 72,
      speed: 35,
      vibration: 6.8,
      temperature: 61,
      current: 2.6,
      threadPresent: true
    },
        brokenNeedle: {
      tension: 46,
      speed: 55,
      vibration: 5.8,
      temperature: 48,
      current: 1.8,
      threadPresent: true
    },
    elasticTrigger: {
      tension: 29,
      speed: 88,
      vibration: 2.7,
      temperature: 43,
      current: 1.3,
      threadPresent: true
    },
    oilStain: {
      tension: 42,
      speed: 103,
      vibration: 1.9,
      temperature: 44,
      current: 1.1,
      threadPresent: true
    },
    correctingLowTension: {
      tension: 42,
      speed: 90,
      vibration: 2.0,
      temperature: 41,
      current: 1.1,
      threadPresent: true
    },
    correctingHighTension: {
      tension: 45,
      speed: 80,
      vibration: 2.3,
      temperature: 43,
      current: 1.2,
      threadPresent: true
    }
  }

  const target = targets[currentScenario]

  values.tension = approach(values.tension, target.tension, 0.18)
  values.speed = approach(values.speed, target.speed, 0.18)
  values.vibration = approach(values.vibration, target.vibration, 0.18)
  values.temperature = approach(values.temperature, target.temperature, 0.08)
  values.current = approach(values.current, target.current, 0.18)
  values.threadPresent = target.threadPresent

  renderValues()
}

function renderValues() {
  document.querySelector('#tensionValue').textContent =
    Math.max(0, values.tension + randomNoise(0.7)).toFixed(1)

  document.querySelector('#speedValue').textContent =
    Math.max(0, Math.round(values.speed + randomNoise(2)))

  document.querySelector('#vibrationValue').textContent =
    Math.max(0, values.vibration + randomNoise(0.15)).toFixed(1)

  document.querySelector('#temperatureValue').textContent =
    Math.max(0, values.temperature + randomNoise(0.3)).toFixed(1)

  document.querySelector('#currentValue').textContent =
    Math.max(0, values.current + randomNoise(0.08)).toFixed(1)

  document.querySelector('#threadValue').textContent =
    values.threadPresent ? 'Detectado' : 'No detectado'

  setCardStatus('tensionCard',
    values.tension < 25 || values.tension > 60
      ? 'critical'
      : values.tension < 35 || values.tension > 50
        ? 'warning'
        : 'normal'
  )

  setCardStatus('speedCard',
    values.speed < 60 ? 'critical' : values.speed < 90 ? 'warning' : 'normal'
  )

  setCardStatus('vibrationCard',
    values.vibration > 5 ? 'critical' : values.vibration > 3 ? 'warning' : 'normal'
  )

  setCardStatus('temperatureCard',
    values.temperature > 65
      ? 'critical'
      : values.temperature > 55
        ? 'warning'
        : 'normal'
  )

  setCardStatus('currentCard',
    values.current > 2
      ? 'critical'
      : values.current > 1.5
        ? 'warning'
        : 'normal'
  )

  setCardStatus('threadCard', values.threadPresent ? 'normal' : 'critical')
}

function setCardStatus(id, status) {
  const card = document.querySelector(`#${id}`)
  card.classList.remove('normal', 'warning', 'critical')
  card.classList.add(status)
}

function setSystemStatus(status, text) {
  elements.systemStatus.className = `system-status ${status}`
  elements.systemStatusText.textContent = text
}

function applyScenario() {
  cancelScheduledCorrections()

  currentScenario = elements.scenarioSelect.value
  renderAmefScenarioInfo(currentScenario)

  correctionInProgress = false

  const scenarioData = {
    normal: {
      anomaly: 'Ninguna',
      diagnosis: 'Operación dentro de parámetros',
      action: 'Mantener condiciones actuales',
      status: 'normal',
      statusText: 'Operación normal',
      recoverable: false
    },
    lowTension: {
      anomaly: 'Tensión por debajo del límite',
      diagnosis: 'Tensión insuficiente',
      action: 'Incrementar posición del servotensor',
      status: 'warning',
      statusText: 'Advertencia de tensión',
      recoverable: true
    },
    highTension: {
      anomaly: 'Tensión por encima del límite',
      diagnosis: 'Sobretensión del hilo',
      action: 'Liberar tensor y reducir velocidad',
      status: 'warning',
      statusText: 'Sobretensión detectada',
      recoverable: true
    },
    brokenThread: {
      anomaly: 'Ausencia de hilo',
      diagnosis: 'Rotura de hilo',
      action: 'Detener máquina y solicitar intervención',
      status: 'critical',
      statusText: 'Parada por rotura',
      recoverable: false
    },
    jam: {
      anomaly: 'Corriente y vibración elevadas',
      diagnosis: 'Posible atascamiento',
      action: 'Ejecutar parada de protección',
      status: 'critical',
      statusText: 'Atascamiento detectado',
      recoverable: false
    },
        brokenNeedle: {
      anomaly: 'Vibración elevada y pérdida de estabilidad',
      diagnosis: 'Posible rotura de aguja',
      action: 'Detener máquina y sustituir la aguja',
      status: 'critical',
      statusText: 'Rotura de aguja detectada',
      recoverable: false
    },
    elasticTrigger: {
      anomaly: 'Comportamiento irregular del elástico',
      diagnosis: 'Falla del disparador automático',
      action: 'Detener y ajustar el disparador elástico',
      status: 'critical',
      statusText: 'Falla del elástico detectada',
      recoverable: false
    },
    oilStain: {
      anomaly: 'Anomalía visual en la superficie',
      diagnosis: 'Posible mancha de lubricante',
      action: 'Segregar prenda y revisar lubricación',
      status: 'warning',
      statusText: 'Mancha detectada',
      recoverable: false
    }
  }

  const data = scenarioData[currentScenario]
  const eventStartSeconds = seconds
  const inducedScenario = currentScenario

  if (inducedScenario !== 'normal') {
    metrics.totalAnomalies += 1

    if (data.recoverable) {
      metrics.recoverableEvents += 1
    }

if (
  inducedScenario === 'brokenThread' ||
  inducedScenario === 'jam' ||
  inducedScenario === 'brokenNeedle' ||
  inducedScenario === 'elasticTrigger'
) {
      metrics.criticalStops += 1
    }

    updateMetrics()
  }
  elements.anomalyText.textContent = data.anomaly
  elements.diagnosisText.textContent = 'Analizando variables...'
  elements.actionText.textContent = 'Esperando decisión'
  setSystemStatus(data.status, data.statusText)
  updateMachineAnimation()

  scheduleCorrection(() => {
    elements.diagnosisText.textContent = data.diagnosis
        if (inducedScenario !== 'normal') {
      const responseTime = Math.max(1, seconds - eventStartSeconds)
      metrics.responseTimes.push(responseTime)
      updateMetrics()
    }

    if (elements.automaticControl.checked) {
      elements.actionText.textContent = data.action
    } else {
      elements.actionText.textContent = 'Control automático desactivado'
    }

    addEvent(inducedScenario, data)
  }, 1500)

  if (
    data.recoverable &&
    elements.automaticControl.checked &&
    currentScenario !== 'normal'
  ) {
    scheduleCorrection(() => {
      correctionInProgress = true

      if (currentScenario === 'lowTension') {
        currentScenario = 'correctingLowTension'
        elements.actionText.textContent =
          'Aumentando tensión mediante servotensor'
      } else if (currentScenario === 'highTension') {
        currentScenario = 'correctingHighTension'
        elements.actionText.textContent =
          'Liberando tensor y reduciendo velocidad'
      }

      elements.diagnosisText.textContent =
        'Corrección automática en ejecución'

      setSystemStatus('correcting', 'Aplicando corrección')
      updateMachineAnimation()
    }, 4500)

    scheduleCorrection(() => {
      currentScenario = 'normal'
      correctionInProgress = false

      elements.anomalyText.textContent = 'Condición controlada'
      elements.diagnosisText.textContent =
        'Variables nuevamente dentro del rango'

      elements.actionText.textContent =
        'Recuperación verificada; velocidad normalizada'

      setSystemStatus('normal', 'Anomalía controlada')
      updateMachineAnimation()

            const recoveryTime = Math.max(1, seconds - eventStartSeconds)

      metrics.controlledEvents += 1
      metrics.recoveryTimes.push(recoveryTime)
      updateMetrics()

      addRecoveryEvent(inducedScenario, data, recoveryTime)
    }, 10000)
  }
}

function updateMachineAnimation() {
  const moving =
  running &&
  currentScenario !== 'brokenThread' &&
  currentScenario !== 'jam' &&
  currentScenario !== 'brokenNeedle' &&
  currentScenario !== 'elasticTrigger'

  elements.spool.classList.toggle('rotating', moving)
  elements.weavingUnit.classList.toggle('rotating', moving)

  const broken = currentScenario === 'brokenThread'

  elements.threadFour.classList.toggle('broken', broken)
  elements.threadFive.classList.toggle('broken', broken)

  const servoOperating =
    currentScenario === 'lowTension' ||
    currentScenario === 'highTension' ||
    currentScenario === 'correctingLowTension' ||
    currentScenario === 'correctingHighTension'

  elements.servo.classList.toggle('adjusting', servoOperating)
}

const scenarioLabels = {
  normal: 'Operación normal',
  lowTension: 'Tensión insuficiente',
  highTension: 'Sobretensión',
  brokenThread: 'Rotura de hilo',
  jam: 'Atascamiento',
  brokenNeedle: 'Rotura de aguja',
  elasticTrigger: 'Falla del disparador elástico',
  oilStain: 'Lubricante sobre la prenda'
}

function getAmefEventData(scenario) {
  const map = scenarioAmefMap[scenario] || {
    failureIds: [],
    defect: 'No determinado'
  }

  const failures = map.failureIds
    .map(id =>
      dicapriData.failures.find(
        failure => failure['ID_Falla'] === id
      )
    )
    .filter(Boolean)

  return {
    codigoAmef: map.failureIds.join(' / ') || 'Sin falla',
    modoFalla:
      failures.map(failure => failure['Modo_falla']).join(' / ') ||
      'Operación normal',
    npr:
      failures.length > 0
        ? Math.max(...failures.map(failure => Number(failure.NPR) || 0))
        : 0,
    defectoPotencial: map.defect
  }
}

function formatEventDate(value) {
  if (!value) return 'Fecha y hora no registradas'

  const parsedDate = new Date(value)

  // Los eventos nuevos se guardan en ISO y pueden convertirse normalmente.
  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.toLocaleString('es-PE', {
      dateStyle: 'short',
      timeStyle: 'medium'
    })
  }

  // Compatibilidad con eventos antiguos guardados directamente en formato es-PE.
  return String(value)
}

function renderEventRow(record, prepend = true) {
  const emptyRow = elements.eventTable.querySelector('.empty-row')
  if (emptyRow) emptyRow.remove()

  const row = document.createElement('tr')
  const resultText = String(record.resultado || 'Pendiente')
  const resultClass = resultText.includes('Recuperación') ||
    record.resultado === 'Acción iniciada' ||
    record.resultado === 'Conforme' ||
    resultText === 'Riesgo Bajo' ||
    resultText === 'Continuar operación'
    ? 'success'
    : record.resultado === 'Parada crítica' ||
        record.resultado === 'No conforme' ||
        resultText === 'Riesgo Alto' ||
        resultText.includes('Parada')
      ? 'critical'
      : 'pending'

  const fecha = formatEventDate(record.fechaHora)
  const npr = record.npr === 0 || record.npr ? record.npr : '—'
  const confidence = record.confianzaVisual || '—'

  row.innerHTML = `
    <td>
      <span class="event-main">${fecha}</span>
      <span class="event-sub">Tiempo simulado: ${record.tiempo || '—'}</span>
    </td>
    <td><span class="event-main">${record.maquina || '—'}</span></td>
    <td><span class="event-main">${record.escenario || '—'}</span></td>
    <td>
      <span class="event-main event-code">${record.codigoAmef || '—'}</span>
      <span class="event-sub">NPR: ${npr}</span>
    </td>
    <td>
      <span class="event-main">${record.defectoPotencial || '—'}</span>
      <span class="event-sub">Confianza: ${confidence}</span>
    </td>
    <td>${record.diagnostico || '—'}</td>
    <td>${record.accion || '—'}</td>
    <td>
      <span class="result-tag ${resultClass}">
        ${resultText}
      </span>
    </td>
  `

  if (prepend) {
    elements.eventTable.prepend(row)
  } else {
    elements.eventTable.append(row)
  }
}

function renderStoredEvents() {
  if (eventRecords.length === 0) return

  elements.eventTable.innerHTML = ''
  eventRecords
    .slice()
    .reverse()
    .forEach(record => renderEventRow(record, false))
}

function addEvent(scenario, data) {
  const action = elements.automaticControl.checked
    ? data.action
    : 'Sin actuación'

  const criticalScenarios = [
    'brokenThread',
    'jam',
    'brokenNeedle',
    'elasticTrigger'
  ]

  const result = criticalScenarios.includes(scenario)
    ? 'Parada crítica'
    : elements.automaticControl.checked
      ? 'Acción iniciada'
      : 'Pendiente'

  const amef = getAmefEventData(scenario)
  const record = {
    fechaHora: new Date().toISOString(),
    tiempo: elements.simulationTime.textContent,
    maquina: elements.machineSelect.value,
    escenario: scenarioLabels[scenario] || scenario,
    ...amef,
    tension: values.tension.toFixed(1),
    velocidad: Math.round(values.speed),
    vibracion: values.vibration.toFixed(1),
    temperatura: values.temperature.toFixed(1),
    corriente: values.current.toFixed(1),
    presenciaHilo: values.threadPresent ? 'Detectado' : 'No detectado',
    diagnostico: data.diagnosis,
    accion: action,
    resultado: result
  }

  eventRecords.push(record)
  saveEventRecords()
  renderEventRow(record)
}

function addRecoveryEvent(originalScenario, originalData, recoveryTime) {
  const amef = getAmefEventData(originalScenario)
  const record = {
    fechaHora: new Date().toISOString(),
    tiempo: elements.simulationTime.textContent,
    maquina: elements.machineSelect.value,
    escenario: 'Recuperación automática',
    ...amef,
    tension: values.tension.toFixed(1),
    velocidad: Math.round(values.speed),
    vibracion: values.vibration.toFixed(1),
    temperatura: values.temperature.toFixed(1),
    corriente: values.current.toFixed(1),
    presenciaHilo: values.threadPresent ? 'Detectado' : 'No detectado',
    diagnostico: `${originalData.diagnosis} controlada`,
    accion: originalData.action,
    resultado: `Recuperación verificada en ${recoveryTime} s`
  }

  eventRecords.push(record)
  saveEventRecords()
  renderEventRow(record)
}

const visualDefectCatalog = {
  OK: {
    label: 'Sin defecto visible',
    failureId: null,
    action: 'Autorizar el pase de la prenda al área de remallado'
  },
  D01: {
    label: 'Raya vertical',
    failureId: 'F01',
    action: 'Segregar la prenda y revisar el estado de las agujas'
  },
  D03: {
    label: 'Vacío o falta de tejido',
    failureId: 'F03',
    action: 'Segregar la prenda y revisar alimentación y rotura de hilo'
  },
  D04: {
    label: 'Defecto en el elástico',
    failureId: 'F09',
    action: 'Segregar la prenda y revisar el disparador del elástico'
  },
  D06: {
    label: 'Mancha de aceite',
    failureId: 'F12',
    action: 'Segregar la prenda y revisar puntos de lubricación'
  },
  D09: {
    label: 'Tejido incorrecto parcial',
    failureId: 'F07',
    action: 'Segregar la prenda y verificar la tensión del hilo'
  }
}

const YOLO_API_URL = '/api'
let visualImageUrl = null
let visualImageName = ''
let visualImageFile = null
let yoloApiAvailable = false
let riskModelAvailable = false
let latestVisualAssessment = null
let latestRiskAssessment = null
let latestIntegratedDecision = null
let visualBatchFiles = []
let visualBatchIndex = 0
let visualBatchTimer = null
let visualBatchRunning = false
let visualBatchOk = 0
let visualBatchNg = 0
let visualInferenceInProgress = false

async function checkYoloApi() {
  try {
    const response = await apiFetch(`${YOLO_API_URL}/health`)
    if (!response.ok) throw new Error('API no disponible')

    const data = await response.json()
    yoloApiAvailable = data.model_loaded === true
    riskModelAvailable = data.risk_model_loaded === true
    elements.yoloApiStatus.className = 'api-status online'
    elements.yoloApiStatus.querySelector('strong').textContent =
      'YOLOv8n conectado · modelo cargado'
  } catch (error) {
    yoloApiAvailable = false
    riskModelAvailable = false
    elements.yoloApiStatus.className = 'api-status offline'
    elements.yoloApiStatus.querySelector('strong').textContent =
      'Modelo YOLO no disponible · recarga la página'
  }

  elements.visualAnalyzeButton.disabled =
    !visualImageFile || !yoloApiAvailable
  elements.riskAnalyzeButton.disabled = !riskModelAvailable
  elements.visualBatchStart.disabled =
    !visualBatchFiles.length || !yoloApiAvailable || visualBatchRunning
}

function setRiskProbability(element, valueElement, probability) {
  const percentage = Math.round((Number(probability) || 0) * 1000) / 10
  element.value = percentage
  valueElement.textContent = `${percentage.toFixed(1)} %`
}

function updateIntegratedDecision() {
  if (latestVisualAssessment) {
    elements.decisionVisualEvidence.textContent =
      latestVisualAssessment.hasDefect ? 'Defecto detectado' : 'Prenda conforme'
    elements.decisionVisualDetail.textContent = latestVisualAssessment.hasDefect
      ? `${latestVisualAssessment.codes.join(', ')} · confianza máxima ${latestVisualAssessment.confidence.toFixed(1)} %`
      : 'Sin detecciones por encima del umbral configurado.'
  } else {
    elements.decisionVisualEvidence.textContent = 'Pendiente'
    elements.decisionVisualDetail.textContent =
      'Analiza primero una fotografía con YOLOv8n.'
  }

  if (latestRiskAssessment) {
    elements.decisionRiskEvidence.textContent =
      `Riesgo ${latestRiskAssessment.risk}`
    elements.decisionRiskDetail.textContent =
      `${latestRiskAssessment.targetMonth} · confianza ${latestRiskAssessment.confidence.toFixed(1)} %`
  } else {
    elements.decisionRiskEvidence.textContent = 'Pendiente'
    elements.decisionRiskDetail.textContent =
      'Evalúa primero la máquina con Random Forest.'
  }

  const allFailureCodes = [
    ...(latestVisualAssessment?.failureIds || []),
    ...(latestRiskAssessment?.failureCode
      ? [latestRiskAssessment.failureCode]
      : [])
  ]
  const uniqueFailureCodes = [...new Set(allFailureCodes)]
  const maximumNpr = Math.max(
    latestVisualAssessment?.npr || 0,
    latestRiskAssessment?.npr || 0
  )

  elements.decisionAmefEvidence.textContent = uniqueFailureCodes.length
    ? `${uniqueFailureCodes.join(' / ')} · NPR ${maximumNpr}`
    : 'Pendiente'
  elements.decisionAmefDetail.textContent = uniqueFailureCodes.length
    ? maximumNpr >= 300
      ? 'Criticidad AMEF elevada; la decisión debe escalarse.'
      : 'Criticidad incorporada en la regla de decisión.'
    : 'Se calculará con las fallas asociadas.'

  if (!latestVisualAssessment || !latestRiskAssessment) {
    latestIntegratedDecision = null
    elements.decisionOutputCard.className = 'decision-output-card'
    elements.integratedDecisionStatus.textContent = 'Esperando evidencias'
    elements.integratedDecisionAction.textContent =
      'Ejecuta la inspección visual y la predicción histórica.'
    elements.integratedDecisionReason.textContent =
      'El sistema requiere ambos resultados antes de decidir.'
    elements.registerDecisionButton.disabled = true
    return
  }

  const hasDefect = latestVisualAssessment.hasDefect
  const risk = latestRiskAssessment.risk.toLowerCase()
  let level = 'normal'
  let status = 'Continuar operación'
  let action = 'Autorizar el flujo de la prenda y mantener supervisión periódica.'

  if (!hasDefect && risk === 'medio') {
    level = 'preventive'
    status = 'Inspección preventiva'
    action = 'Continuar con vigilancia y programar una inspección preventiva de la máquina.'
  } else if (!hasDefect && risk === 'alto') {
    level = 'warning'
    status = 'Intervención prioritaria'
    action = 'Programar mantenimiento antes del siguiente periodo y aumentar la frecuencia de inspección.'
  } else if (hasDefect && risk === 'bajo') {
    level = 'warning'
    status = 'Segregar prenda'
    action = 'Segregar la prenda, verificar el punto asociado y continuar bajo observación.'
  } else if (hasDefect && risk === 'medio') {
    level = 'high'
    status = 'Segregar y ajustar'
    action = 'Segregar la prenda, ajustar la máquina e inspeccionar la siguiente unidad producida.'
  } else if (hasDefect && risk === 'alto') {
    level = 'critical'
    status = 'Parada preventiva'
    action = 'Detener la máquina, segregar la prenda y ejecutar inspección y mantenimiento prioritario.'
  }

  if (maximumNpr >= 300 && level === 'normal') {
    level = 'preventive'
    status = 'Inspección por criticidad AMEF'
    action = 'Continuar temporalmente y programar inspección prioritaria por NPR elevado.'
  } else if (maximumNpr >= 300 && hasDefect && level !== 'critical') {
    level = 'critical'
    status = 'Parada por criticidad AMEF'
    action = 'Detener temporalmente, segregar la prenda y revisar el modo de falla con NPR elevado.'
  }

  latestIntegratedDecision = {
    level,
    status,
    action,
    maximumNpr,
    failureCodes: uniqueFailureCodes,
    reason:
      `YOLO: ${hasDefect ? 'defecto detectado' : 'sin defecto'}; ` +
      `Random Forest: riesgo ${risk}; AMEF: NPR ${maximumNpr}.`
  }

  elements.decisionOutputCard.className =
    `decision-output-card decision-${level}`
  elements.integratedDecisionStatus.textContent = status
  elements.integratedDecisionAction.textContent = action
  elements.integratedDecisionReason.textContent =
    latestIntegratedDecision.reason
  elements.registerDecisionButton.disabled = false
}

function registerIntegratedDecision() {
  if (!latestIntegratedDecision) return

  const visualConfidence = latestVisualAssessment?.confidence || 0
  const riskConfidence = latestRiskAssessment?.confidence || 0
  const modes = [
    ...(latestVisualAssessment?.failureModes || []),
    latestRiskAssessment?.failureMode
  ].filter(Boolean)

  const record = {
    fechaHora: new Date().toISOString(),
    tiempo: elements.simulationTime.textContent,
    maquina: elements.machineSelect.value,
    escenario: 'Decisión conjunta YOLO + Random Forest + AMEF',
    codigoAmef: latestIntegratedDecision.failureCodes.join(' / ') || 'Sin falla',
    modoFalla: [...new Set(modes)].join(' / ') || 'Sin modo de falla',
    npr: latestIntegratedDecision.maximumNpr,
    defectoPotencial: latestVisualAssessment?.hasDefect
      ? latestVisualAssessment.defects.join(' / ')
      : 'Sin defecto visual detectado',
    tension: values.tension.toFixed(1),
    velocidad: Math.round(values.speed),
    vibracion: values.vibration.toFixed(1),
    temperatura: values.temperature.toFixed(1),
    corriente: values.current.toFixed(1),
    presenciaHilo: values.threadPresent ? 'Detectado' : 'No detectado',
    archivoImagen: visualImageName || 'No aplica',
    zonaVisual: 'Fusión de visión, riesgo histórico y AMEF',
    confianzaVisual:
      `YOLO ${visualConfidence.toFixed(1)}% / RF ${riskConfidence.toFixed(1)}%`,
    diagnostico: latestIntegratedDecision.reason,
    accion: latestIntegratedDecision.action,
    resultado: latestIntegratedDecision.status
  }

  eventRecords.push(record)
  saveEventRecords()
  renderEventRow(record)
  elements.registerDecisionButton.disabled = true
  elements.registerDecisionButton.textContent = 'Decisión registrada'
}

async function evaluateMachineRisk() {
  const machineId = elements.machineSelect.value
  if (!machineId) {
    window.alert('Selecciona primero una máquina.')
    return
  }

  elements.riskAnalyzeButton.disabled = true
  elements.riskAnalyzeButton.textContent = 'Evaluando...'
  elements.riskLevel.textContent = 'Procesando'
  elements.riskScope.textContent =
    'Random Forest está analizando el historial mensual de la máquina.'

  try {
    const response = await apiFetch(`${YOLO_API_URL}/risk/${machineId}`)
    if (!response.ok) {
      const detail = await response.text()
      throw new Error(detail || 'No se pudo ejecutar la predicción')
    }

    const prediction = await response.json()
    const risk = String(prediction.predicted_risk || '').toLowerCase()
    const riskLabel = risk
      ? `${risk.charAt(0).toUpperCase()}${risk.slice(1)}`
      : 'Sin resultado'
    const confidence = Number(prediction.confidence) || 0

    elements.riskSummaryCard.className =
      `risk-summary-card risk-${risk}`
    elements.riskLevel.textContent = riskLabel
    elements.riskScope.textContent = prediction.scope
    elements.riskModel.textContent = prediction.model
    elements.riskSourceMonth.textContent = prediction.source_month
    elements.riskTargetMonth.textContent = prediction.target_month
    elements.riskConfidence.textContent =
      `${(confidence * 100).toFixed(1)} %`
    elements.riskFailure.textContent =
      `${prediction.dominant_failure} — ${prediction.failure_mode} · NPR ${prediction.npr}`
    elements.riskAction.textContent = prediction.recommended_action
    elements.riskNotice.textContent = prediction.notice

    latestRiskAssessment = {
      risk: riskLabel,
      confidence: confidence * 100,
      targetMonth: prediction.target_month,
      failureCode: prediction.dominant_failure,
      failureMode: prediction.failure_mode,
      npr: Number(prediction.npr) || 0
    }
    updateIntegratedDecision()

    setRiskProbability(
      elements.riskProbLow,
      elements.riskProbLowValue,
      prediction.probabilities.bajo
    )
    setRiskProbability(
      elements.riskProbMedium,
      elements.riskProbMediumValue,
      prediction.probabilities.medio
    )
    setRiskProbability(
      elements.riskProbHigh,
      elements.riskProbHighValue,
      prediction.probabilities.alto
    )

    const record = {
      fechaHora: new Date().toISOString(),
      tiempo: elements.simulationTime.textContent,
      maquina: machineId,
      escenario: 'Predicción histórica Random Forest',
      codigoAmef: prediction.dominant_failure,
      modoFalla: prediction.failure_mode,
      npr: prediction.npr,
      defectoPotencial: `Riesgo operacional ${riskLabel.toLowerCase()}`,
      tension: values.tension.toFixed(1),
      velocidad: Math.round(values.speed),
      vibracion: values.vibration.toFixed(1),
      temperatura: values.temperature.toFixed(1),
      corriente: values.current.toFixed(1),
      presenciaHilo: values.threadPresent ? 'Detectado' : 'No detectado',
      archivoImagen: 'No aplica',
      zonaVisual: 'No aplica',
      confianzaVisual: `${(confidence * 100).toFixed(1)}% (ML)`,
      diagnostico:
        `Riesgo ${riskLabel.toLowerCase()} para ${prediction.target_month}`,
      accion: prediction.recommended_action,
      resultado: `Riesgo ${riskLabel}`
    }

    eventRecords.push(record)
    saveEventRecords()
    renderEventRow(record)
  } catch (error) {
    console.error('Error de predicción de riesgo:', error)
    elements.riskSummaryCard.className = 'risk-summary-card risk-error'
    elements.riskLevel.textContent = 'Error de conexión'
    elements.riskScope.textContent =
      'No se pudo leer la predicción de riesgo. Recarga la página.'
    await checkYoloApi()
  } finally {
    elements.riskAnalyzeButton.textContent = 'Evaluar con Random Forest'
    elements.riskAnalyzeButton.disabled = !riskModelAvailable
  }
}

function displayVisualFile(file) {
  if (!file) return

  if (visualImageUrl) URL.revokeObjectURL(visualImageUrl)

  visualImageUrl = URL.createObjectURL(file)
  visualImageName = file.name
  visualImageFile = file
  latestVisualAssessment = null
  latestIntegratedDecision = null
  elements.registerDecisionButton.textContent =
    'Registrar decisión conjunta'
  updateIntegratedDecision()
  elements.visualImage.src = visualImageUrl
  elements.visualImage.classList.add('visible')
  elements.visualPlaceholder.classList.add('hidden')
  elements.inspectionRoi.classList.add('visible')
  elements.yoloDetectionLayer.innerHTML = ''
  elements.visualAnalyzeButton.disabled = !yoloApiAvailable
  elements.visualResult.className = 'visual-result'
  elements.visualResultStatus.textContent = 'Imagen preparada'
  elements.visualResultDetail.textContent =
    'Pulsa Analizar con YOLOv8n para ejecutar la inferencia local.'
}

function loadVisualImage(event) {
  const files = [...event.target.files]
  if (!files.length) return

  stopVisualBatch('Lote preparado')
  visualBatchFiles = files
  visualBatchIndex = 0
  visualBatchOk = 0
  visualBatchNg = 0
  elements.visualBatchOk.textContent = '0'
  elements.visualBatchNg.textContent = '0'
  elements.visualBatchProgress.textContent = `0 / ${files.length}`
  elements.visualBatchStatus.textContent =
    files.length === 1 ? '1 fotografía preparada' : `${files.length} fotografías preparadas`
  elements.visualBatchStart.disabled = !yoloApiAvailable
  displayVisualFile(files[0])
}

function stopVisualBatch(status = 'Lote pausado') {
  clearTimeout(visualBatchTimer)
  visualBatchTimer = null
  visualBatchRunning = false
  elements.visualBatchStatus.textContent = status
  elements.visualBatchStop.disabled = true
  elements.visualBatchStart.disabled =
    !visualBatchFiles.length || !yoloApiAvailable
  elements.visualBatchStart.textContent =
    visualBatchIndex > 0 && visualBatchIndex < visualBatchFiles.length
      ? 'Continuar lote'
      : 'Iniciar lote'
  elements.visualAnalyzeButton.disabled =
    !visualImageFile || !yoloApiAvailable || visualInferenceInProgress
}

function waitForNextVisualBatchImage() {
  const delay = (Number(elements.visualBatchInterval.value) || 5) * 1000
  visualBatchTimer = setTimeout(runNextVisualBatchImage, delay)
}

async function runNextVisualBatchImage() {
  if (!visualBatchRunning) return

  if (visualBatchIndex >= visualBatchFiles.length) {
    visualBatchRunning = false
    elements.visualBatchStatus.textContent = 'Lote finalizado'
    elements.visualBatchStart.textContent = 'Repetir lote'
    elements.visualBatchStart.disabled = false
    elements.visualBatchStop.disabled = true
    elements.visualAnalyzeButton.disabled =
      !visualImageFile || !yoloApiAvailable
    return
  }

  const file = visualBatchFiles[visualBatchIndex]
  displayVisualFile(file)
  elements.visualBatchStatus.textContent =
    `Inspeccionando media ${visualBatchIndex + 1}`

  try {
    await elements.visualImage.decode()
  } catch (error) {
    console.warn('La vista previa todavía no terminó de decodificarse:', error)
  }

  const result = await evaluateVisualImage()
  if (!visualBatchRunning) return

  if (result?.isConforming === true) visualBatchOk += 1
  if (result?.isConforming === false) visualBatchNg += 1

  visualBatchIndex += 1
  elements.visualBatchOk.textContent = String(visualBatchOk)
  elements.visualBatchNg.textContent = String(visualBatchNg)
  elements.visualBatchProgress.textContent =
    `${visualBatchIndex} / ${visualBatchFiles.length}`

  if (visualBatchIndex >= visualBatchFiles.length) {
    runNextVisualBatchImage()
  } else {
    elements.visualBatchStatus.textContent = 'Esperando siguiente media'
    waitForNextVisualBatchImage()
  }
}

function startVisualBatch() {
  if (!visualBatchFiles.length) {
    window.alert('Selecciona primero un lote de fotografías.')
    return
  }

  if (!yoloApiAvailable) {
    window.alert('La API YOLOv8n no está disponible.')
    return
  }

  if (visualBatchIndex >= visualBatchFiles.length) {
    visualBatchIndex = 0
    visualBatchOk = 0
    visualBatchNg = 0
    elements.visualBatchOk.textContent = '0'
    elements.visualBatchNg.textContent = '0'
  }

  visualBatchRunning = true
  elements.visualBatchStart.disabled = true
  elements.visualBatchStop.disabled = false
  elements.visualAnalyzeButton.disabled = true
  runNextVisualBatchImage()
}

function updateVisualConfidence() {
  elements.visualConfidenceValue.textContent =
    elements.visualConfidence.value
}

function drawYoloDetections(detections, imageWidth, imageHeight) {
  elements.yoloDetectionLayer.innerHTML = ''

  const previewRect = document
    .querySelector('#visualPreview')
    .getBoundingClientRect()
  const imageRect = elements.visualImage.getBoundingClientRect()

  detections.forEach(detection => {
    const [x1, y1, x2, y2] = detection.bbox_xyxy
    const box = document.createElement('div')
    box.className = 'yolo-box'
    box.style.left = `${imageRect.left - previewRect.left + (x1 / imageWidth) * imageRect.width}px`
    box.style.top = `${imageRect.top - previewRect.top + (y1 / imageHeight) * imageRect.height}px`
    box.style.width = `${((x2 - x1) / imageWidth) * imageRect.width}px`
    box.style.height = `${((y2 - y1) / imageHeight) * imageRect.height}px`

    const label = document.createElement('span')
    label.textContent =
      `${detection.class_code} · ${(detection.confidence * 100).toFixed(1)}%`
    box.appendChild(label)
    elements.yoloDetectionLayer.appendChild(box)
  })
}

async function evaluateVisualImage() {
  if (!visualImageFile) {
    window.alert('Selecciona primero una fotografía.')
    return
  }

  if (visualInferenceInProgress) return null
  visualInferenceInProgress = true

  elements.visualAnalyzeButton.disabled = true
  elements.visualAnalyzeButton.textContent = 'Analizando...'
  elements.visualResultStatus.textContent = 'Inferencia en curso'
  elements.visualResultDetail.textContent =
    'El navegador está procesando la fotografía con YOLOv8n.'

  try {
    const threshold = Number(elements.visualConfidence.value) / 100
    const formData = new FormData()
    formData.append('file', visualImageFile)

    const response = await apiFetch(
      `${YOLO_API_URL}/predict?conf=${threshold}`,
      { method: 'POST', body: formData }
    )

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(detail || 'No se pudo ejecutar la inferencia')
    }

    const prediction = await response.json()
    const detections = prediction.detections
    const isConforming = detections.length === 0
    const result = isConforming ? 'Conforme' : 'No conforme'

    drawYoloDetections(
      detections,
      prediction.image_width,
      prediction.image_height
    )

    const detectedCodes = [
      ...new Set(detections.map(item => item.class_code))
    ]
    const detectedDefects = detectedCodes
      .map(code => visualDefectCatalog[code])
      .filter(Boolean)
    const failureIds = [
      ...new Set(detectedDefects.map(item => item.failureId).filter(Boolean))
    ]
    const failures = failureIds
      .map(id =>
        dicapriData.failures.find(item => item['ID_Falla'] === id)
      )
      .filter(Boolean)
    const topConfidence = detections.length
      ? Math.max(...detections.map(item => item.confidence))
      : 0

    latestVisualAssessment = {
      hasDefect: !isConforming,
      codes: detectedCodes,
      defects: isConforming
        ? ['Sin defecto visual detectado']
        : detections.map(item => item.class_name),
      confidence: topConfidence * 100,
      failureIds,
      failureModes: failures.map(item => item['Modo_falla']),
      npr: failures.length
        ? Math.max(...failures.map(item => Number(item.NPR) || 0))
        : 0
    }
    updateIntegratedDecision()

    elements.visualResult.className =
      `visual-result ${isConforming ? 'conforming' : 'nonconforming'}`
    elements.visualResultStatus.textContent = result
    elements.visualResultDetail.textContent = isConforming
      ? 'YOLOv8n no detectó defectos por encima del umbral configurado.'
      : `${detections.length} detección(es): ${detectedCodes.join(', ')}. ${prediction.recommended_action}`

    if (!isConforming) {
      metrics.totalAnomalies += 1
      updateMetrics()
    }

    const record = {
      fechaHora: new Date().toISOString(),
      tiempo: elements.simulationTime.textContent,
      maquina: elements.machineSelect.value,
      escenario: 'Inferencia real YOLOv8n',
      codigoAmef: failureIds.join(' / ') || 'Sin falla asociada',
      modoFalla:
        failures.map(item => item['Modo_falla']).join(' / ') ||
        'Sin modo de falla asociado',
      npr: failures.length
        ? Math.max(...failures.map(item => Number(item.NPR) || 0))
        : 0,
      defectoPotencial: isConforming
        ? 'Sin defecto detectado'
        : detections.map(item => item.class_name).join(' / '),
      tension: values.tension.toFixed(1),
      velocidad: Math.round(values.speed),
      vibracion: values.vibration.toFixed(1),
      temperatura: values.temperature.toFixed(1),
      corriente: values.current.toFixed(1),
      presenciaHilo: values.threadPresent ? 'Detectado' : 'No detectado',
      archivoImagen: visualImageName,
      zonaVisual: 'Coordenadas calculadas por YOLO',
      confianzaVisual: `${(topConfidence * 100).toFixed(1)}%`,
      diagnostico: isConforming
        ? 'Sin detecciones por encima del umbral'
        : `${detections.length} región(es) defectuosa(s) detectada(s)`,
      accion: prediction.recommended_action,
      resultado: result
    }

    eventRecords.push(record)
    saveEventRecords()
    renderEventRow(record)
    return { isConforming, prediction }
  } catch (error) {
    console.error('Error de inferencia:', error)
    elements.visualResult.className = 'visual-result nonconforming'
    elements.visualResultStatus.textContent = 'Error de conexión'
    elements.visualResultDetail.textContent =
      'No fue posible ejecutar el modelo YOLO en el navegador. Recarga la página.'
    await checkYoloApi()
    return null
  } finally {
    visualInferenceInProgress = false
    elements.visualAnalyzeButton.textContent = 'Analizar con YOLOv8n'
    elements.visualAnalyzeButton.disabled =
      !visualImageFile || !yoloApiAvailable || visualBatchRunning
  }
}

function escapeCsvValue(value) {
  const text = String(value ?? '')
  return `"${text.replaceAll('"', '""')}"`
}

function exportCsv() {
  if (eventRecords.length === 0) {
    window.alert('Todavía no existen eventos para exportar.')
    return
  }

  const headers = [
    'Fecha y hora',
    'Tiempo',
    'Máquina',
    'Escenario',
    'Código AMEF',
    'Modo de falla',
    'NPR',
    'Defecto potencial',
    'Tensión (cN)',
    'Velocidad (rpm)',
    'Vibración RMS (mm/s)',
    'Temperatura (°C)',
    'Corriente (A)',
    'Presencia de hilo',
    'Archivo de imagen',
    'Zona visual',
    'Confianza visual',
    'Diagnóstico',
    'Acción',
    'Resultado'
  ]

  const rows = eventRecords.map(record => [
    record.fechaHora,
    record.tiempo,
    record.maquina,
    record.escenario,
    record.codigoAmef,
    record.modoFalla,
    record.npr,
    record.defectoPotencial,
    record.tension,
    record.velocidad,
    record.vibracion,
    record.temperatura,
    record.corriente,
    record.presenciaHilo,
    record.archivoImagen,
    record.zonaVisual,
    record.confianzaVisual,
    record.diagnostico,
    record.accion,
    record.resultado
  ])

  const csvContent = [
    headers.map(escapeCsvValue).join(';'),
    ...rows.map(row => row.map(escapeCsvValue).join(';'))
  ].join('\n')

  const blob = new Blob(
    ['\ufeff', csvContent],
    { type: 'text/csv;charset=utf-8;' }
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `resultados-prototipo-${Date.now()}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}
function startSimulation() {
  if (running) return

  running = true
  setSystemStatus('normal', 'Operación en curso')
  elements.actionText.textContent = 'Supervisando variables'

  updateMachineAnimation()

  timer = setInterval(() => {
    seconds += 1
    updateTimer()
    updateValues()
    updateCharts()
  }, 1000)

  if (elements.operationMode.value === 'autonomous') {
    startAutonomousScheduler()
  }
}

function pauseSimulation() {
  stopAutonomousScheduler('Pausado')
  running = false
  clearInterval(timer)
  timer = null
  setSystemStatus('warning', 'Simulación pausada')
  elements.actionText.textContent = 'Simulación detenida temporalmente'
  updateMachineAnimation()
}

function resetSimulation() {
  stopAutonomousScheduler('Detenido')
  cancelScheduledCorrections()
  running = false
  clearInterval(timer)
  timer = null
  seconds = 0
  autonomousCycleCount = 0
  elements.autonomousCycles.textContent = '0 ciclos'
  currentScenario = 'normal'
  metrics.totalAnomalies = 0
  metrics.recoverableEvents = 0
  metrics.controlledEvents = 0
  metrics.criticalStops = 0
  metrics.responseTimes = []
  metrics.recoveryTimes = []

  updateMetrics()

  Object.assign(values, {
    tension: 42,
    speed: 105,
    vibration: 1.8,
    temperature: 38,
    current: 1.1,
    threadPresent: true
  })

  elements.scenarioSelect.value = 'normal'
  elements.anomalyText.textContent = 'Ninguna'
  elements.diagnosisText.textContent = 'Operación sin evaluar'
  elements.actionText.textContent = 'Esperando inicio'
  updateTimer()
  renderValues()
  clearCharts()
  updateMachineAnimation()
  setSystemStatus('normal', 'Sistema preparado')
}

function setAutonomousState(text) {
  elements.autonomousState.textContent = text
}

function stopAutonomousScheduler(state = 'Detenido') {
  clearTimeout(autonomousTimer)
  autonomousTimer = null
  autonomousCycleInProgress = false
  setAutonomousState(state)
}

function selectAutonomousScenario() {
  const risk = latestRiskAssessment?.risk?.toLowerCase() || 'medio'
  const weightedScenarios = [
    { scenario: 'brokenThread', weight: 30, critical: true },
    { scenario: 'lowTension', weight: 16, critical: false },
    { scenario: 'highTension', weight: 8, critical: false },
    { scenario: 'jam', weight: 14, critical: true },
    { scenario: 'brokenNeedle', weight: 12, critical: true },
    { scenario: 'elasticTrigger', weight: 12, critical: true },
    { scenario: 'oilStain', weight: 8, critical: false }
  ].map(item => ({
    ...item,
    weight: item.weight * (
      risk === 'alto' && item.critical
        ? 1.4
        : risk === 'bajo' && item.critical
          ? 0.75
          : 1
    )
  }))

  const totalWeight = weightedScenarios.reduce(
    (sum, item) => sum + item.weight,
    0
  )
  let draw = Math.random() * totalWeight

  for (const item of weightedScenarios) {
    draw -= item.weight
    if (draw <= 0) return item.scenario
  }

  return 'lowTension'
}

function scheduleNextAutonomousCycle(delaySeconds) {
  clearTimeout(autonomousTimer)
  autonomousTimer = setTimeout(runAutonomousCycle, delaySeconds * 1000)
}

async function runAutonomousCycle() {
  if (!running || elements.operationMode.value !== 'autonomous') return

  if (autonomousCycleInProgress || correctionInProgress) {
    setAutonomousState('Esperando corrección')
    scheduleNextAutonomousCycle(3)
    return
  }

  autonomousCycleInProgress = true
  setAutonomousState('Evaluando riesgo')

  try {
    if (!latestRiskAssessment && riskModelAvailable) {
      await evaluateMachineRisk()
    }

    const scenario = selectAutonomousScenario()
    elements.scenarioSelect.value = scenario
    currentScenario = scenario
    setAutonomousState(`Ejecutando ${scenarioLabels[scenario]}`)
    applyScenario()

    autonomousCycleCount += 1
    elements.autonomousCycles.textContent =
      `${autonomousCycleCount} ciclo${autonomousCycleCount === 1 ? '' : 's'}`

    if (
      elements.autonomousYolo.checked &&
      visualImageFile &&
      yoloApiAvailable
    ) {
      setAutonomousState('Analizando con YOLOv8n')
      await evaluateVisualImage()
      if (latestIntegratedDecision) {
        registerIntegratedDecision()
      }
    }

    setAutonomousState('Supervisando')
  } finally {
    autonomousCycleInProgress = false
    if (running && elements.operationMode.value === 'autonomous') {
      scheduleNextAutonomousCycle(
        Number(elements.autonomousInterval.value) || 25
      )
    }
  }
}

function startAutonomousScheduler() {
  stopAutonomousScheduler('Preparando ciclo')
  elements.automaticControl.checked = true
  scheduleNextAutonomousCycle(2)
}

function updateOperationMode() {
  const autonomous = elements.operationMode.value === 'autonomous'
  elements.autonomousOptions.classList.toggle('visible', autonomous)
  elements.scenarioSelect.disabled = autonomous
  elements.applyScenarioButton.disabled = autonomous
  elements.startButton.textContent = autonomous
    ? 'Iniciar ciclo autónomo'
    : 'Iniciar operación'

  if (!autonomous) {
    stopAutonomousScheduler('Detenido')
  } else if (running) {
    startAutonomousScheduler()
  }
}

function clearEventHistory() {
  const confirmed = window.confirm(
    '¿Deseas eliminar definitivamente el historial almacenado?'
  )

  if (!confirmed) return

  eventRecords = []
  localStorage.removeItem(EVENT_STORAGE_KEY)
  elements.eventTable.innerHTML = `
    <tr class="empty-row">
      <td colspan="8">Todavía no se han registrado eventos.</td>
    </tr>
  `
}

elements.startButton.addEventListener('click', startSimulation)
elements.pauseButton.addEventListener('click', pauseSimulation)
elements.resetButton.addEventListener('click', resetSimulation)
elements.applyScenarioButton.addEventListener('click', applyScenario)
elements.exportButton.addEventListener('click', exportCsv)
elements.clearHistoryButton.addEventListener('click', clearEventHistory)
elements.visualImageInput.addEventListener('change', loadVisualImage)
elements.visualConfidence.addEventListener('input', updateVisualConfidence)
elements.visualAnalyzeButton.addEventListener('click', evaluateVisualImage)
elements.visualBatchStart.addEventListener('click', startVisualBatch)
elements.visualBatchStop.addEventListener(
  'click',
  () => stopVisualBatch('Lote pausado')
)
elements.riskAnalyzeButton.addEventListener('click', evaluateMachineRisk)
elements.registerDecisionButton.addEventListener(
  'click',
  registerIntegratedDecision
)
elements.operationMode.addEventListener('change', updateOperationMode)
elements.machineSelect.addEventListener('change', event => {
  renderMachineData(event.target.value)
  latestRiskAssessment = null
  latestIntegratedDecision = null
  elements.riskSummaryCard.className = 'risk-summary-card'
  elements.riskLevel.textContent = 'Sin evaluar'
  elements.riskScope.textContent =
    'Ejecuta una nueva predicción para la máquina seleccionada.'
  elements.registerDecisionButton.textContent =
    'Registrar decisión conjunta'
  updateIntegratedDecision()
})
elements.scenarioSelect.addEventListener('change', () => {
  currentScenario = elements.scenarioSelect.value
  renderAmefScenarioInfo(currentScenario)
})
updateOperationMode()
renderValues()
renderStoredEvents()
loadDicapriData()
checkYoloApi()
