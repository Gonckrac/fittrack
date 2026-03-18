// ─── START ───────────────────────────────────────────────────────
async function bootstrap() {
  state = await loadStateAsync();

  if (!state[TODAY]) state[TODAY] = { foods:[], supps:{}, sleep:{}, metrics:null, kcal:{burned:0,active:0}, trainDay: 0 };
 if (!state.metricsHistory) state.metricsHistory = [];
  if (!state.kcalHistory) state.kcalHistory = [];
  if (!state.exerciseHistory) state.exerciseHistory = {};
if (!state.notifications) state.notifications = {
    meals:    { enabled: true,  mode: 'auto', times: ['08:00','13:00','20:00'] },
    training: { enabled: true,  days: [1,2,3,4,5], hour: 8 },
    water:    { enabled: true,  intervalHours: 2,  startHour: 8, endHour: 22 },
    supps:    { enabled: true,  morning: true, noon: true, night: true }
  };
  // Guardar fecha de instalación la primera vez

  // Guardar fecha de instalación la primera vez
  if (!state.installDate) {
    state.installDate = TODAY;
    saveState(state);
  }

  // Always recalculate trainDay from config when config exists
  if (state.config && state.config.training && state.config.training.length > 0) {
    state[TODAY].trainDay = _getTodayTrainDayCfg(state.config);
  }
if (!state.exerciseHistory) state.exerciseHistory = {};
  // Migrar estructura antigua de notifications si falta campos nuevos
  if (state.notifications) {
    if (!state.notifications.training.hour)       state.notifications.training.hour = 8;
    if (!state.notifications.water.startHour)     state.notifications.water.startHour = 8;
    if (!state.notifications.water.endHour)       state.notifications.water.endHour = 22;
    if (state.notifications.supps.morning === undefined) {
      state.notifications.supps.morning = true;
      state.notifications.supps.noon    = true;
      state.notifications.supps.night   = true;
    }
  }
_initNotifications();
  // Guardar timestamp cuando se completa una actividad deportiva (para aprendizaje de horario)
  var _origCompleteSport = window.completeSportDay;
  if (typeof _origCompleteSport === 'function') {
    window.completeSportDay = function(dow, sportName) {
      if (state[TODAY] && sportName) {
        state[TODAY]['sportTimestamp_' + sportName] = Date.now();
      }
      return _origCompleteSport.apply(this, arguments);
    };
  }  // ─── CONDITIONAL BOOT
// Resetear dismissed si goalWeight cambió
  if (state.config && state.config._goalReachedDismissedFor !== undefined &&
      state.config._goalReachedDismissedFor !== parseFloat(state.config.goalWeight)) {
    state.config._goalReachedDismissed = false;
  }
if (state.setupDone && state.config) {
    state._prevScore = state._prevScore !== undefined ? state._prevScore : null;
if (!bootstrap._loading) {
  bootstrap._loading = true;
  try { _launchApp(); } finally { bootstrap._loading = false; }
  // BroadcastChannel: coordinar tabs para evitar overwrites concurrentes
  if (typeof BroadcastChannel !== 'undefined') {
    if (!bootstrap._bc) {
      bootstrap._bc = new BroadcastChannel('fittrack_state');
      bootstrap._bc.onmessage = function(e) {
        if (e.data && e.data.type === 'STATE_UPDATED') {
          loadStateAsync().then(function(fresh) {
            // Solo merge si la versión remota es más nueva
            if (!state._ts || (fresh._ts && fresh._ts > state._ts)) {
              Object.assign(state, fresh);
            }
          });
        }
      };
    }
  }
}  } else {
    // First time — show setup wizard
    initSetup();
  }
}
bootstrap();


