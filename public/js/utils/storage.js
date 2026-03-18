// ─── STATE ────────────────────────────────────────────────────────
const TODAY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });

// ── Persistent storage: IndexedDB (persiste en Safari PWA) ──────
const STORE_KEY = 'fittrack_v2';
const IDB_NAME  = 'FitTrackDB';
const IDB_STORE = 'kv';
// IDB VERSIONING NOTE:
// Versión actual: 1. Schema: un solo store 'kv', clave fittrack_v2, valor = blob JSON completo.
// Límite práctico: ~5MB antes de degradación. Con historial >2 años considerar migración
// a multi-key por fecha (ej: 'day:2025-01-01'). Para migrar: incrementar versión a 2,
// manejar onupgradeneeded con migración de datos, nunca bajar el número de versión.
// Checklist de migración futura:
//   1. Incrementar IDB_VERSION a 2
//   2. En onupgradeneeded: if (e.oldVersion < 2) { crear nuevos stores, migrar datos }
//   3. Actualizar loadStateAsync y saveState para multi-key
const IDB_VERSION = 1;
let _idb = null;
function _openIDB() {
  return new Promise((res, rej) => {
    if (_idb) { res(_idb); return; }
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess = e => { _idb = e.target.result; res(_idb); };
    req.onerror   = e => rej(e);
  });
}

async function loadStateAsync() {
  try {
    const db   = await _openIDB();
    const tx   = db.transaction(IDB_STORE, 'readonly');
    const data = await new Promise((res, rej) => {
      const req = tx.objectStore(IDB_STORE).get(STORE_KEY);
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e);
    });
    if (data) return data;
    try {
      const legacy = localStorage.getItem(STORE_KEY) || localStorage.getItem('fittrack');
      if (legacy) { const parsed = JSON.parse(legacy); saveState(parsed); return parsed; }
    } catch(_) {}
    return {};
  } catch(e) {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch(_) { return {}; }
  }
}

function saveState(s) {
  s._ts = Date.now(); // timestamp para resolución de conflictos entre tabs
  _openIDB().then(db => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(s, STORE_KEY);
  }).catch(() => {});
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch(_) {}
  // Notificar otras tabs
  try {
    if (typeof BroadcastChannel !== 'undefined' && bootstrap._bc) {
      bootstrap._bc.postMessage({ type: 'STATE_UPDATED', ts: s._ts });
    }
  } catch(_) {}
}

// Deprecated — use loadStateAsync() instead
// function loadState() { return {}; }
// Ciclo automático basado en la fecha de instalación del usuario (no una fecha hardcodeada)
const CYCLE = [1, 2, 3, 4, 5, 6];

function getAutoTrainDay() {
  const today = new Date(TODAY);
  // Usar installDate del state si existe, sino TODAY como fallback
  const installStr = (state && state.installDate) ? state.installDate : TODAY;
  const cycleStart = new Date(installStr);
  const diffMs = today - cycleStart;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const idx = ((diffDays % CYCLE.length) + CYCLE.length) % CYCLE.length;
  return CYCLE[idx];
}

let state = {}; // populated async by bootstrap()

// ─── TRAINING REMINDER STATE DEFAULTS ────────────────────────────
function _migrateTrainingReminder() {
  if (!state.notifications) return;
  var n = state.notifications;
  if (!n.training) n.training = {};

  // Nueva estructura
  if (!n.training.trainingReminder) {
    n.training.trainingReminder = {
      enabled:       n.training.enabled !== undefined ? n.training.enabled : true,
      mode:          n.training.mode    || 'smart',
      offsetMinutes: 20
    };
  }

  // Migrar trainingSplit desde cycle+training si no existe
  if (!state.trainingSplit) {
    state.trainingSplit = _buildSplitFromConfig();
  }

  // learnedTimes: calculado en runtime, no migrar
  if (!state.learnedTimes) state.learnedTimes = {};
}

function _buildSplitFromConfig() {
  var cfg = state.config;
  if (!cfg || !cfg.cycle) return [];
  var dowMap = { Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6, Sun:0 };
  var dowOrder = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var sportEmojis = { Correr:'🏃', Bici:'🚴', Caminata:'🚶', HIIT:'🔥', Natación:'🏊', Pilates:'🧘', Fútbol:'⚽', Tenis:'🎾', Pádel:'🏓', Otro:'🏅' };
  var result = [];
  var seen = {};

  dowOrder.forEach(function(dow) {
    var val = cfg.cycle[dow];
    if (val === null || val === undefined || val === -1 || val === '-1' || val === 'rest') return;
    var dayNum = dowMap[dow] !== undefined ? dowMap[dow] : -1;
    var key = String(dayNum);
    if (seen[key]) return;
    seen[key] = true;

    if (val === 'sport') {
      var sName = (cfg.sportNames && cfg.sportNames[dow]) || 'Deporte';
      var emoji = (window._airCustomEmojis && window._airCustomEmojis[sName]) || sportEmojis[sName] || '🏅';
      result.push({ day: dayNum, name: emoji + ' ' + sName, time: '18:00', type: 'sport' });
    } else {
      var idx = parseInt(val);
      var d = cfg.training && cfg.training[idx];
      if (!d) return;
      result.push({ day: dayNum, name: '💪 ' + d.name, time: '18:00', type: 'gym' });
    }
  });

  // Actividades extra (gym+sport en mismo día)
  if (cfg.extraActivities) {
    Object.keys(cfg.extraActivities).forEach(function(dow) {
      var dayNum = dowMap[dow] !== undefined ? dowMap[dow] : -1;
      (cfg.extraActivities[dow] || []).forEach(function(sName) {
        var emoji = (window._airCustomEmojis && window._airCustomEmojis[sName]) || sportEmojis[sName] || '🏅';
        result.push({ day: dayNum, name: emoji + ' ' + sName, time: '18:00', type: 'sport' });
      });
    });
  }

  // Ordenar por día de la semana (Lun=1 … Dom=0 al final)
  result.sort(function(a, b) {
    var oa = a.day === 0 ? 7 : a.day;
    var ob = b.day === 0 ? 7 : b.day;
    return oa - ob;
  });

  return result;
}
