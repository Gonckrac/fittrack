// ═══════════════════════════════════════════════════════════════
// SESSION TIMER — cronómetro persistente durante el entrenamiento
// Incluye estado de DESCANSO integrado en el banner (sin overlay)
// ═══════════════════════════════════════════════════════════════

var _sessionTimerInterval = null;
var _sessionStartTs = 0;
var _sessionPaused = false;
var _sessionPausedAt = 0;
var _sessionPausedAccum = 0;

// Estado de descanso activo (seteado desde startRestTimer)
var _restState = null; // null | { exName, sIdx, endTime, total }

// Inicia (o retoma) el cronómetro de sesión
function startSessionTimer() {
  _sessionPaused = false;
  _sessionPausedAt = 0;
  _sessionPausedAccum = 0;
  if (state[TODAY] && state[TODAY].trainingStartedAt) {
    _sessionStartTs = state[TODAY].trainingStartedAt;
  } else {
    _sessionStartTs = Date.now();
    if (state[TODAY]) {
      state[TODAY].trainingStartedAt = _sessionStartTs;
      saveState(state);
    }
  }
  clearInterval(_sessionTimerInterval);
  _sessionTimerInterval = setInterval(_tickSessionTimer, 500);
  setTimeout(_renderSessionTimer, 100);
}
// Detiene y oculta el cronómetro
function stopSessionTimer() {
  clearInterval(_sessionTimerInterval);
  _sessionTimerInterval = null;
  _restState = null;
  _sessionPaused = false;
  _sessionPausedAt = 0;
  _sessionPausedAccum = 0;
  var banner = document.getElementById('sessionTimerBanner');
  if (banner) banner.style.display = 'none';
}

function _togglePauseSessionBanner() {
  if (_sessionPaused) {
    _sessionPausedAccum += Date.now() - _sessionPausedAt;
    _sessionPausedAt = 0;
    _sessionPaused = false;
    clearInterval(_sessionTimerInterval);
    _sessionTimerInterval = setInterval(_tickSessionTimer, 500);
    if (state[TODAY]) { state[TODAY].trainingPaused = false; saveState(state); }
  } else {
    _sessionPausedAt = Date.now();
    _sessionPaused = true;
    clearInterval(_sessionTimerInterval);
    _sessionTimerInterval = null;
    if (state[TODAY]) { state[TODAY].trainingPaused = true; saveState(state); }
  }
  _renderSessionTimer();
}
// Tick interno
function _tickSessionTimer() {
  if (_restState && Date.now() >= _restState.endTime) {
    _restState = null;
  }
  _renderSessionTimer();
}

// Formatea ms → "mm:ss" o "h:mm:ss"
function _fmtSessionTime(ms) {
  var totalSecs = Math.floor(ms / 1000);
  var h = Math.floor(totalSecs / 3600);
  var m = Math.floor((totalSecs % 3600) / 60);
  var s = totalSecs % 60;
  var mm = m < 10 ? '0' + m : '' + m;
  var ss = s < 10 ? '0' + s : '' + s;
  return h > 0 ? h + ':' + mm + ':' + ss : mm + ':' + ss;
}

// Re-dibuja el banner
function _renderSessionTimer() {
  var banner = document.getElementById('sessionTimerBanner');
  if (!banner) {
    console.log('[SessionTimer] banner NOT FOUND, retrying in 200ms');
    setTimeout(_renderSessionTimer, 200);
    return;
  }

  var dayState = state[TODAY];
  if (!dayState || !dayState.trainingStarted) {
    console.log('[SessionTimer] hidden — trainingStarted=', dayState && dayState.trainingStarted);
    banner.style.display = 'none'; return;
  }

  var d = (typeof getConfigTraining === 'function') ? getConfigTraining() : null;
  if (!d) {
    console.log('[SessionTimer] hidden — getConfigTraining() returned null');
    banner.style.display = 'none'; return;
  }
  console.log('[SessionTimer] SHOWING banner, day=', dayState.trainDay, 'routine=', d.name);

  var day = dayState.trainDay;
  var savedSets = dayState['trainSets_' + day] || {};

  // Progreso
  var exDone = 0, exTotal = d.exercises.length;
  var setsDone = 0, setsTotal = 0;
  d.exercises.forEach(function(ex, exIdx) {
    var exSets = savedSets[exIdx] || [];
    var numSets = parseInt(ex.sets) || 3;
    setsTotal += numSets;
    var doneInEx = 0;
    for (var i = 0; i < numSets; i++) {
      if (exSets[i] && exSets[i].done) { setsDone++; doneInEx++; }
    }
    if (doneInEx === numSets && numSets > 0) exDone++;
  });

var elapsed = _sessionStartTs > 0 ? (Date.now() - _sessionStartTs - _sessionPausedAccum) : 0;  var timeStr = _fmtSessionTime(elapsed);
  var allDone = exDone === exTotal && exTotal > 0;
if (allDone && _sessionTimerInterval) {
  clearInterval(_sessionTimerInterval);
  _sessionTimerInterval = null;
}
  var pct = setsTotal > 0 ? Math.round(setsDone / setsTotal * 100) : 0;

  // ── MODO DESCANSO ──────────────────────────────────────────────
  if (_restState && Date.now() < _restState.endTime) {
    var restRemaining = Math.max(0, Math.round((_restState.endTime - Date.now()) / 1000));
    var restPct = _restState.total > 0 ? Math.round(restRemaining / _restState.total * 100) : 0;
    var restColor = restRemaining <= 10 ? 'var(--yellow)' : 'var(--accent)';

    banner.style.display = 'flex';
    banner.innerHTML =
      // Tiempo de sesión (pequeño, a la izquierda)
      '<div style="display:flex;flex-direction:column;align-items:center;min-width:52px;gap:1px">' +
        '<span style="font-family:\'Space Mono\',monospace;font-size:12px;font-weight:700;color:var(--text3)">' + timeStr + '</span>' +
        '<span style="font-size:9px;color:var(--text3)">sesión</span>' +
      '</div>' +

      '<div style="width:1px;background:var(--border);align-self:stretch;margin:0 10px"></div>' +

      // Countdown de descanso
      '<div style="flex:1;min-width:0">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
          '<span style="font-size:11px;font-weight:700;color:' + restColor + '">😮‍💨 Descansando — ' + _restState.exName + '</span>' +
          '<span style="font-family:\'Space Mono\',monospace;font-size:14px;font-weight:700;color:' + restColor + '">' + restRemaining + 's</span>' +
        '</div>' +
        '<div style="height:4px;background:var(--bg4);border-radius:2px;overflow:hidden">' +
          '<div style="height:4px;background:' + restColor + ';border-radius:2px;width:' + restPct + '%;transition:width 0.5s linear"></div>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:3px">' +
          '<span style="font-size:10px;color:var(--text3)">Serie ' + _restState.sIdx + ' completada</span>' +
          '<div style="display:flex;gap:6px">' +
            '<button onclick="_restAddTime(30)" style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:1px 7px;font-size:10px;color:var(--text2);cursor:pointer">+30s</button>' +
            '<button onclick="_restSkip()" style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:1px 7px;font-size:10px;color:var(--text3);cursor:pointer">Saltar</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    return;
  }

  // ── MODO NORMAL ────────────────────────────────────────────────
  var accentColor = allDone ? 'var(--green)' : 'var(--accent)';
  banner.style.display = 'flex';
  banner.innerHTML =
    '<div style="display:flex;align-items:center;gap:6px;min-width:62px">' +
      '<span style="font-size:16px">⏱</span>' +
      '<span style="font-family:\'Space Mono\',monospace;font-size:15px;font-weight:700;color:' + accentColor + ';letter-spacing:1px">' + timeStr + '</span>' +
    '</div>' +

    '<div style="width:1px;background:var(--border);align-self:stretch;margin:0 10px"></div>' +

    '<div style="flex:1;min-width:0">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
        '<span style="font-size:11px;font-weight:600;color:var(--text2)">' +
          (allDone ? '🏁 ¡Sesión completa!' : d.name) +
        '</span>' +
        '<span style="font-size:10px;color:var(--text3)">' + setsDone + '/' + setsTotal + ' series</span>' +
      '</div>' +
      '<div style="height:4px;background:var(--bg4);border-radius:2px;overflow:hidden">' +
        '<div style="height:4px;background:' + accentColor + ';border-radius:2px;width:' + pct + '%;transition:width 0.4s ease"></div>' +
      '</div>' +
      '<div style="font-size:10px;color:var(--text3);margin-top:3px">' +
        exDone + ' de ' + exTotal + ' ejercicios completos' +
      '</div>' +
    '</div>' +

(allDone
      ? '<div style="margin-left:10px">' +
          '<button onclick="stopSessionTimer();state[TODAY].trainingStarted=false;state[TODAY].trainingStartedAt=null;saveState(state);renderTraining();" ' +
          'style="background:var(--green);color:#000;border:none;border-radius:8px;padding:5px 10px;font-size:11px;font-weight:700;cursor:pointer">✓ Cerrar</button>' +
        '</div>'
      : '<div style="display:flex;gap:6px;margin-left:10px">' +
          '<button onclick="_togglePauseSessionBanner()" id="bannerPauseBtn" ' +
          'style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:4px 9px;font-size:11px;font-weight:600;color:var(--text2);cursor:pointer">' +
          (_sessionPaused ? '▶' : '⏸') + '</button>' +
          '<button onclick="_finishTrainingEarly()" ' +
          'style="background:rgba(255,170,40,0.1);border:1px solid rgba(255,170,40,0.4);border-radius:8px;padding:4px 9px;font-size:11px;font-weight:600;color:#ffa828;cursor:pointer">🏁</button>' +
        '</div>');
}

// Llamado desde startRestTimer en timers.js para activar modo descanso en el banner
function _activateRestInBanner(exName, sIdx, secs) {
  _restState = {
    exName: exName,
    sIdx: sIdx,
    endTime: Date.now() + secs * 1000,
    total: secs
  };
  _renderSessionTimer();
}

// +30s desde el banner
function _restAddTime(extra) {
  if (!_restState) return;
  _restState.endTime += extra * 1000;
  _restState.total += extra;
  addRestTime(extra); // sincroniza con timers.js
  _renderSessionTimer();
}

// Saltar descanso desde el banner
function _restSkip() {
  _restState = null;
  dismissRestTimer();
  _renderSessionTimer();
}

// Retoma el timer si la app se recarga con sesión en curso
function _resumeSessionTimerIfNeeded() {
  if (!state[TODAY]) return;
  if (!state[TODAY].trainingStarted) return;
  startSessionTimer();
}
