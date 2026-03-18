// ─── TIMER VARIABLES (declaradas explícitamente para scope global) ──
var _rtEndTime = 0;
var _rtRemaining = 0;
var _rtInterval = null;
var _rtTotal = 0;
var _wakeLock = null;
var _swReg = null;
var _audioCtx = null;
var _audioUnlocked = false;
var _pushDeviceId = null;
var _pushSubscription = null;

// ─── SCREEN WAKE LOCK ────────────────────────────────────────────
// Mantiene la pantalla activa durante el timer. Falla silenciosamente.
async function _acquireWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    if (_wakeLock) { _wakeLock.release().catch(function(){}); _wakeLock = null; }
    _wakeLock = await navigator.wakeLock.request('screen');
    _wakeLock.addEventListener('release', function() { _wakeLock = null; });
  } catch (e) {
    _wakeLock = null;
  }
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 5 — PROGRESSION DATA STRUCTURE HELPERS
// ═══════════════════════════════════════════════════════════════

function parseRepRange(repsStr) {
  if (!repsStr || repsStr === 'MAX') return null;
  const str = String(repsStr).replace(/c\/lado|s$/,'').trim();
  const parts = str.split('-');
  if (parts.length === 2) return { min: +parts[0], max: +parts[1] };
  const n = +str;
  return isNaN(n) ? null : { min: n, max: n };
}

function computeVolume(sets) {
  return sets.reduce((sum, s) => {
    const kg = parseFloat(s.kg) || 0;
    const reps = parseFloat(String(s.reps || '').replace(/[^0-9]/g,'')) || 0;
    return sum + (kg * reps);
  }, 0);
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 1 — PROGRESSION BAR
// ═══════════════════════════════════════════════════════════════
function buildProgressionBar(exSets, ex) {
  let repRange = parseRepRange(ex.reps);
  // Para ejercicios manuales con reps fijas (ej: "12"), tratar como min=max
  if (!repRange) {
    const n = parseInt(String(ex.reps || '').replace(/[^0-9]/g,''));
    if (!n) return '';
    repRange = { min: n, max: n };
  }
  const numSets = ex.sets || exSets.length;
  const doneSets = exSets.filter(s => s.done);
  const doneReps = doneSets.map(s => {
    const v = parseFloat(String(s.reps || '').replace(/[^0-9]/g,''));
    return isNaN(v) ? 0 : v;
  });
  const totalReps = doneReps.reduce((a, b) => a + b, 0);
  const maxReps   = numSets * repRange.max;
  const pct = maxReps > 0 ? Math.min(100, Math.round(totalReps / maxReps * 100)) : 0;
  let fillClass = 'normal', hintClass = '';
  let hint = totalReps + ' / ' + maxReps + ' reps';
  if (totalReps >= maxReps) {
    fillClass = 'at-max';
    hint = '\u2705 ' + totalReps + '/' + maxReps + ' \u2014 \u00a1Sub\u00ed el peso la pr\u00f3xima!';
    hintClass = 'upgrade';
  } else if (pct >= 75) {
    fillClass = 'near-max';
    hint = totalReps + ' / ' + maxReps + ' \u2014 falta poco para subir peso';
  }
  return '<div class="rep-prog-wrap">' +
    '<div class="rep-prog-header">' +
      '<div class="rep-prog-label">Progresión ' + repRange.min + '\u2013' + repRange.max + ' reps</div>' +
      '<div class="rep-prog-count">' + totalReps + '/' + maxReps + '</div>' +
    '</div>' +
    '<div class="rep-prog-track"><div class="rep-prog-fill ' + fillClass + '" style="width:' + pct + '%"></div></div>' +
    '<div class="rep-prog-hint ' + hintClass + '">' + hint + '</div>' +
  '</div>';
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 2 — AUTOMATIC WEIGHT SUGGESTION
// ══════════════════════════════════════════════════════════════
function buildWeightSuggestionUpgradeOnly(exName, ex, currentSets) {
  const history = (state.exerciseHistory || {})[exName] || [];
  if (history.length < 1) return '';
  const repRange = parseRepRange(ex.reps);
  if (!repRange || ex.noTopRep) return '';
  const numSets = ex.sets || 4;
  const maxReps = numSets * repRange.max;
  const lastSession = history[0];
  const lastWeight = lastSession.maxKg || 0;
  const nextWeight = (lastWeight + 2.5).toFixed(1);
  // Calcular reps ACTUALES (sets de esta sesión)
  const doneSets = currentSets.filter(function(s){ return s.done; });
  const currentTotalReps = doneSets.reduce(function(sum, s){
    var v = parseFloat(String(s.reps || '').replace(/[^0-9]/g,''));
    return sum + (isNaN(v) ? 0 : v);
  }, 0);
  if (currentTotalReps >= maxReps) {    return '<div class="weight-suggestion upgrade"><div class="ws-icon">\ud83d\udd3c</div><div class="ws-body">' +
      '<div class="ws-title">\u00a1Sub\u00ed el peso hoy! \u2014 ' + exName + '</div>' +
      '<div class="ws-detail">La \u00faltima sesi\u00f3n completaste ' + lastTotalReps + '/' + maxReps + ' reps. Ya es hora de progresar.</div>' +
      '<div class="ws-next upgrade">Hoy: ' + nextWeight + 'kg \u00d7 ' + repRange.min + '\u2013' + repRange.max + ' reps</div>' +
    '</div></div>';
  }
  // Si no llegó al máximo → insistir en llegar al máximo esta sesión
return '';
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 3 — PR DETECTION + DISPLAY
// ═══════════════════════════════════════════════════════════════
function detectPRTypes(exName, newSets) {
  const history = (state.exerciseHistory || {})[exName] || [];
  const prs = [];
  const kgVals = newSets.map(s=>parseFloat(s.kg)).filter(v=>!isNaN(v)&&v>0);
  const repsVals = newSets.map(s=>parseFloat(String(s.reps||'').replace(/[^0-9]/g,''))).filter(v=>!isNaN(v)&&v>0);
  if (!kgVals.length) return prs;
  const newMaxKg   = Math.max(...kgVals);
  const newMaxReps = repsVals.length ? Math.max(...repsVals) : 0;
  const newVol     = computeVolume(newSets);
  const prevMaxKg  = history.length ? Math.max(...history.map(h=>h.maxKg||0)) : 0;
  const prevBestRepAtKg = history.reduce((best, h) => (h.maxKg===newMaxKg) ? Math.max(best, h.avgReps||0) : best, 0);
  const prevBestVol = history.length ? Math.max(...history.map(h=>h.volume||0)) : 0;
  if (newMaxKg > prevMaxKg)
    prs.push({ type:'weight', label:'M\u00e1ximo peso', value: newMaxKg + 'kg' });
  if (newMaxReps > prevBestRepAtKg && newMaxKg > 0)
    prs.push({ type:'reps', label:'M\u00e1s reps con ' + newMaxKg + 'kg', value: newMaxKg + 'kg \u00d7 ' + newMaxReps });
  if (newVol > prevBestVol && newVol > 0)
    prs.push({ type:'volume', label:'Volumen total', value: Math.round(newVol) + 'kg' });
  return prs;
}

function showPRPopup(exName, prs) {
  if (!prs.length) return;
  const pr = prs[0];
  document.getElementById('prPopupMain').textContent = exName + ' \u2014 ' + pr.value;
  document.getElementById('prPopupType').textContent = pr.label;
  const popup = document.getElementById('prPopup');
  popup.classList.add('show');
  setTimeout(() => popup.classList.remove('show'), 4000);
}

function renderPRHistory() {
  const container = document.getElementById('prHistoryContainer');
  if (!container) return;
  const hist = state.exerciseHistory || {};
  const entries = [];
  Object.entries(hist).forEach(([name, sessions]) => {
    if (!sessions.length) return;
    const maxKg = Math.max(...sessions.map(h=>h.maxKg||0));
    const maxVol = Math.max(...sessions.map(h=>h.volume||0));
    const bestRepsEntry = sessions.reduce((best, h) => (!best||(h.avgReps||0)>(best.avgReps||0))?h:best, null);
    const prKgEntry = sessions.find(h=>h.maxKg===maxKg);
    if (!prKgEntry) return;
    entries.push({ name, maxKg, prKgDate:prKgEntry.date, bestReps:bestRepsEntry?.avgReps, bestRepsDate:bestRepsEntry?.date, maxVol:maxVol>0?Math.round(maxVol):null, prVolDate:sessions.find(h=>(h.volume||0)===maxVol)?.date });
  });
  if (!entries.length) {
    container.innerHTML = '<div style="color:var(--text3);font-size:12px;text-align:center;padding:14px 0">Complet\u00e1 ejercicios para ver tus PRs aqu\u00ed.</div>';
    return;
  }
  container.innerHTML = entries.map(e =>
    '<div class="pr-history-card">' +
      '<div class="pr-history-exname">\ud83c\udfc6 ' + e.name + '</div>' +
      '<div class="pr-row"><div class="pr-row-type">\u2696 Peso m\u00e1ximo</div><div class="pr-row-val">' + e.maxKg + 'kg</div><div class="pr-row-date">' + (e.prKgDate||'\u2014') + '</div></div>' +
      (e.bestReps ? '<div class="pr-row"><div class="pr-row-type">\ud83d\udd01 Mejor serie</div><div class="pr-row-val">' + e.maxKg + 'kg \u00d7 ' + e.bestReps + '</div><div class="pr-row-date">' + (e.bestRepsDate||'\u2014') + '</div></div>' : '') +
      (e.maxVol ? '<div class="pr-row"><div class="pr-row-type">\ud83d\udce6 Volumen m\u00e1x</div><div class="pr-row-val">' + e.maxVol + 'kg vol</div><div class="pr-row-date">' + (e.prVolDate||'\u2014') + '</div></div>' : '') +
    '</div>'
  ).join('');
}

// ═══════════════════════════════════════════════════════════════
// FEATURE 4 — ADAPTIVE ROUTINE LOGIC
// ═══════════════════════════════════════════════════════════════
function getLastTrainingDate() {
  const keys = Object.keys(state).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k));
  const sorted = keys.sort().reverse();
  for (const dateKey of sorted) {
    if (dateKey === TODAY) continue;
    const day = state[dateKey]?.trainDay;
    if (day && day > 0) return { date: dateKey, day };
  }
  return null;
}

function checkAdaptiveRoutine() {
  const banner = document.getElementById('adaptiveRoutineBanner');
  if (!banner) return;
  const last = getLastTrainingDate();
  if (!last) { banner.style.display = 'none'; return; }
  const lastDate = new Date(last.date + 'T00:00:00');
  const todayDate = new Date(TODAY + 'T00:00:00');
  const daysDiff = Math.round((todayDate - lastDate) / (1000*60*60*24));
  if (daysDiff < 2) { banner.style.display = 'none'; return; }
  const DAYS_TOTAL = 6;
  let nextDay = (last.day % DAYS_TOTAL) + 1;
  if (nextDay === 4) nextDay = 5; // Skip rest day in sequence
  const _cfgTrain = state.config && state.config.training;
  const _nextDayData = _cfgTrain && _cfgTrain[nextDay - 1];
  const nextDayName = (_nextDayData ? _nextDayData.name : ('Día ' + nextDay));
  const skippedCount = daysDiff - 1;
  const currentDay = state[TODAY].trainDay;
  if (currentDay === nextDay) { banner.style.display = 'none'; return; }
  banner.style.display = 'block';
  banner.innerHTML = '<div class="routine-shift-banner">' +
    '<div class="rsb-icon">\ud83d\udcc5</div>' +
    '<div class="rsb-body">' +
      '<div class="rsb-title">Rutina adaptada \u2014 ' + skippedCount + ' d\u00eda' + (skippedCount>1?'s':'') + ' sin entrenar</div>' +
      '<div class="rsb-sub">\u00daltima sesi\u00f3n: ' + last.date + ' (D\u00eda ' + last.day + '). Siguiente en secuencia: <strong>D\u00eda ' + nextDay + '</strong> \u2014 ' + nextDayName + '</div>' +
      '<div class="rsb-action" onclick="setTrainDay(' + nextDay + ');document.getElementById(\'adaptiveRoutineBanner\').style.display=\'none\'">' +
        '\u2192 Ir a D\u00eda ' + nextDay +
      '</div>' +
    '</div>' +
  '</div>';
}

// ═══════════════════════════════════════════════════════════════
// OVERRIDE saveExerciseHistory — adds volume tracking + PR detection
// ═══════════════════════════════════════════════════════════════

function _urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function _setupWebPush() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) { dbLog('[Push] No soportado'); return; }
  if (Notification.permission !== 'granted') { dbLog('[Push] Sin permiso'); return; }
  if (!_swReg) { dbLog('[Push] Sin SW'); return; }

  try {
    // Generar ID persistente
    let deviceId = localStorage.getItem('_pushDeviceId');
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('_pushDeviceId', deviceId);
    }
    _pushDeviceId = deviceId;
    dbLog('[Push] deviceId: ' + deviceId.slice(0,12) + '...');

    // Suscribirse al push
    const sub = await _swReg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: _urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    _pushSubscription = sub;
    dbLog('[Push] Suscripción OK');

    // Registrar en backend (no crítico si falla)
    try {
      const resp = await fetch(PUSH_BACKEND, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subscribe', subscription: sub, deviceId })
      });
      const respData = await resp.json();
      dbLog('[Push] Backend: ' + JSON.stringify(respData));
    } catch(e) {
      dbLog('[Push] Backend no disponible: ' + e.message);
      dbLog('[Push] Usando SW local como fallback');
    }
  } catch(e) {
    dbLog('[Push] Error subscribe: ' + e.message);
    console.warn('[Push] Error setup:', e);
  }
}

function requestNotifPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    dbLog('[Notif] Pidiendo permiso...');
    Notification.requestPermission().then(perm => {
      dbLog('[Notif] Permiso: ' + perm);
      if (perm === 'granted') {
        showToast('🔔 Notificaciones activadas');
        _setupWebPush();
      }
    });
  } else if (Notification.permission === 'granted') {
    _setupWebPush();
  } else {
    dbLog('[Notif] Permiso denegado — activalo en Configuración');
  }
}

// Programar notif via backend — funciona con pantalla bloqueada
function _scheduleTimerNotif(exName, secs) {
  if (!_pushDeviceId || !_pushSubscription) {
    // Fallback al SW local si no hay push backend
    if (_swReg?.active) {
      const endTime = Date.now() + secs * 1000;
      _swReg.active.postMessage({
        type: 'SCHEDULE_NOTIF',
        title: '⏱ ¡Descanso terminado!',
        body: exName + ' — listo para la próxima serie 💪',
        endTime
      });
    }
    return;
  }
  fetch(PUSH_BACKEND, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'schedule',
      deviceId: _pushDeviceId,
      title: '⏱ ¡Descanso terminado!',
      body: exName + ' — listo para la próxima serie 💪',
      delayMs: secs * 1000
    })
  }).catch(() => {});
}

function _cancelTimerNotif() {
  // SW local
  if (_swReg?.active) _swReg.active.postMessage({ type: 'CANCEL_NOTIF' });
  // Backend (best effort — la notif puede llegar igual si ya fue programada)
  if (_pushDeviceId) {
    fetch(PUSH_BACKEND, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel', deviceId: _pushDeviceId })
    }).catch(() => {});
  }
}

function sendNotif(title, body) {
  if (_swReg && _swReg.active && Notification.permission === 'granted') {
    _swReg.active.postMessage({ type: 'SHOW_NOTIF', title, body });
  }
}

// iOS bloquea AudioContext hasta que haya un tap del usuario.
// Usamos un <audio> con un beep en base64 como método principal,
// y AudioContext como secundario.

// _audioCtx and _audioUnlocked declared at top of file

// Beep WAV embebido
const BEEP_B64 = 'data:audio/wav;base64,UklGRtAUAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YawUAAAAAB0AcgDzAJABNALHAjIDXgM7A8AC6QG8AEr/qP31+1L65PjP9zH3I/e19+r4vPoV/db/1ALeBb8IPwssDVkOpQ78DVsM0Al4BoMCK/62+W71nvGP7nzslev466ztpPC89Lv5V/84BQALTBC/FAgY4xkmGrwYrxUjEVYLnQRh/RP2Le8j6WDkPOH437bgeeMi6HPuD/aE/kkH1Q+ZFw8exSJkJbIlnCM2H7gYgBALB+v8wfI06eLgWtoR1lrUXtUc2Wbf4+cT8lv9CAleFKQeLCdjLdkwSTGbLu0ojiD3FcsJyvzA74Lj29h+0P3KvsjzyZnOctYM4cft3/tyCpkYbCUVMOA3QjznPLc51TKjKLkb3wz9/BDtGt4Q0c3GAMAlvXa+78NFze/ZLOkO+okLhhzxK8o4OkKcR41I7kTrPPcwxiFFEIb9sur82IPJSb0etZGx6rIiuePDj9JC5On3SwwkIDEySEFvTOZSNlQ+UC1HiDkdKPwTY/6n6CjUNcL0s1eqBKZPpzKuTbrqygrfcPW6DHMjKziPSX5WHV7jX6ZbmlFUQr0uBRiU/+7moc8mu8+qrZ9/mqebV6MMsbLDHtro8oMMVyXVO5ROaVx3ZDxmm2HgVrVGHjJlGgUBleesz8m6OaoIn+eZKZu6oiGwhsLE2HbxEAv6I6Q6o03GWyxkTmYKYqNXwkdjM80begIB6ffQ3rsIq4KfBprrmiKiOa9dwWzXBfCdCZwicDmtTB5b3GNbZnNiYljKSKQ0NB3wA23qRNL2vNqrAqArmrKakKFWrjfAFtaV7ikIOyE6OLRLcVqHY2Nm12IcWc9J4zWZHmUF2+uT0xK+sayGoFSafpoCoXatFb/D1CXttAbZHwA3tkrAWS1jZWY2Y9JZ0EogN/0f2gZK7eTUMr+MrRChg5pQmnmgm6z2vXHTtus/BXUexDW1SQpZzWJiZpBjg1rNS1k4XyFOCLnuONZUwGyunqG3miea9Z/Fq9q8ItJJ6soDEB2ENLBIT1hoYlpm5GMvW8ZMjzm/IsIJKvCO13vBUK8xovGaA5p2n/OqwrvV0NzoVQKpG0Izp0eQV/9hTGY0ZNdbu03DOh0kNgub8efYpMI4sMmiMJvkmfyeJaqtuovPcefgAEEa/jGaRsxWkGE5Zn5kelysTvM7eiWoDA3zQdrRwySxZqN0m8uZh55cqZy5Q84H5mv/1xi3MIpFBFYcYSFmw2QYXZlPID3UJhsOgPSd2wDFFLIIpL2bt5kXnpeoj7j+zJ/k9v1sF20vdkQ3VaNgBGYDZbFdglBKPi0ojA/09fvcM8YJs6+kC5yomayd16eFt7zLOOOA/AAWIS5eQ2VUJWDhZT5lRV5nUXE/gyn9EGj3W95pxwG0WqVfnJ+ZR50bp3+2fMrS4Qv7kxTSLENCkFOiX7llc2XUXkdSlUDYKm0S3Pi836LI/bQKpricm5nmnGSmfbU/yW7glvkkE4ErJUG2Uhpfi2WjZV9fI1O1QSos3BNR+iDh3cn9tb+mFp2cmYucsqV/tAXIC98i+LURLioDQNdRjV5ZZc5l5F/7U9FCei1KFcb7heIcywG3eKd5naOZNJwEpYSzzsar3a72RRDYKN4+9VD7XSFl82VlYM9U60PHLrYWO/3r413MCbg2qOGdr5njm1ukjrKZxUzcOvXUDoEntj0OUGVd5GQTZuBgnlUARRIwIhiw/lPloM0VufmoTp7AmZibt6OcsWjE79rH82INJyaKPCNPyVyhZC5mV2FoVhJGWzGMGSUAvObnziS6wKnBnteZUZsXo62wOsOT2VTy7wvMJFs7NE4pXFpkRGbIYS5XIUegMvUamgEn6DDQN7uLqjif85kQm32iw68PwjrY4/B8Cm4jKTpBTYRbDWRUZjRi8FcsSOQzXRwQA5Lpe9FNvFurtZ8UmtOa56HdrufA49Zy7wgJDyL0OEpM2lq7Y19mm2KtWDNJJDXDHYUE/+rJ0me9MKw2oDuanZpWofytw7+O1QHulAeuIL03T0srWmNjZGb+YmZZNkpiNigf+gVu7BrUhb4Irb2gZpprmsqgHq2hvjvUkuwfBksfgjZQSnhZB2NlZlpjGVo1S503iiBvB93tbNWmv+WtSKGXmj+aQ6BFrIS969Ik66oE5x1ENU1JwFilYmBmsmPIWjFM1TjsIeMITe/B1srAx67Yoc6aGJrBn3Crabyd0bfpNQOBHAQ0RkgDWD9iVWYFZHNbKE0LOksjVwq+8BjY8cGsr26iCZv2mUSfoKpTu1HQS+jAARkbwTI8R0JX02FFZlJkGFwcTj07qSTKCy/ycdkcw5awCKNKm9mZzJ7UqT+6CM/g5koAsBl7MS5GfFZiYTBmmmS5XAtPbDwFJj0NovPM2krEhLGno5CbwplangypMLnBzXfl1v5GGDMwHEWyVexgFmbdZFVd90+YPV4nrw4V9Snce8V2skqk3JuxmeydSagkuH3MD+Rg/dsW6C4HRORUcWD2ZRtl7V3eUME+tiggEIj2h92vxmyz86QsnKSZg52Lpxy3O8uo4uv7bhWbLe5CEVTxX9JlU2V/XsFR5j8MKpAR/Pfo3ubHZbSgpYKcnZkfndGmF7b9yUPhdvoAFEss0UE5U2xfp2WHZQxfoFIIQV8rABNx+UrgH8ljtVKm3ZybmcGcHKYXtcHI4N8B+ZIS+iqxQF1S4l54ZbVllV96UydCsCxuFOb6ruFcymW2Cac9nZ6ZaJxspRq0iMd+3o33IhGmKY4/fVFTXkNl3WUYYFBUQkP/LdwVW/wU45zLa7fEp6Kdp5kTnMCkIbNSxh7dGfaxD08oaD6ZUMBdCWUBZpdgIlVaREwvSBfQ/Xvk3sx0uISoDJ61mcSbGaQtsh/FwNul9EAO9yY+PbFPJ13KZB9mEGHvVW5FljCzGEb/4+UjzoG5SKl7nsmZe5t2ozyx78Nj2jLzzgydJRE8xE6KXIVkN2aFYbhWf0bdMR0augBN52rPkroRqvCe4Zk2m9miT7DCwgnZwPFbC0Ak4TrTTedbPGRLZvRhfFeMRyIzhRswArjotNCmu96qaZ//mfeaQKJnr5jBsddP8OcJ4iKuOd9MQFvtY1lmXmI8WJVIZDTsHKUDJOoB0r68sKvonyOavZqtoYOucsBa1t7ucwiCIXg45kuUWphjYmbDYvdYm0mkNVIeGgWS61DT2b2GrGugS5qImh6ho61PvwbVbu3/BiAgPzfpSuRZP2NlZiNjrlmdSuE2th+PBgDtodT4vmCt9KB5mlmalKDHrC++tdMA7IoFvR4DNulJL1nhYmNmfmNgWptLGjgYIQQIcO701RrAP66Boa2aLpoPoO+rEr1l0pLqFQRYHcU05Eh1WH1iXGbUYw1blExROXkieAng70rXP8EirxOi5ZoKmo+fHKv5uxjRJemgAvEbgzPcR7dXFGJPZiRktluKTYU61yPrClHxothowgmwq6Ijm+qZFJ9OquS6zc+65yoBiRo/MtBG9FamYT5mcGRZXHxOtjs0JV4Mw/L72ZTD9bBHo2ab0JmenoSp0rmFzlDmtv8gGfgwwUUsVjRhJ2a2ZPhcak/kPI8m0Q029Ffbw8Tkseijrpu7mS2evqjEuD/N5+RA/rUXry+tRGBVvGAKZvdkkl1UUA8+6CdCD6n1tdz1xdiyjaT7m6uZwZ39p7q3/Mt/48v8SRZjLpdDkFQ/YOhlMmUoXjlRNj8/KbMQHfcU3ivHz7M4pU6coJlbnUCns7a8yhniVvvcFBUtfEK7U71fwWVpZbheG1JaQJQqIxKR+HbfY8jLtOelppybmfmciKawtX7JteDh+W4TxStfQeJSNl+VZZplQ1/4UntB5iuSEwb62OCeycq1mqYCnZyZnZzVpbG0Q8hS32z4/xFyKj1ABFKqXmNlxWXKX9BTmUI3LQEVe/s94tzKzbZTp2WdoZlFnCaltrMMx/Hd+PaOEB0pGT8jURleLWXsZUtgpVSzQ4Uubhbw/KPjHMzUtxCozJ2smfObfKS/stfFktyE9R0PxifxPT1Qg13wZA1myGB1VclE0C/ZF2b+C+Vgzd+40qg4nryZppvXo8yxpcQ02xH0rA1tJsY8U0/pXK9kKWY/YUBW3EUZMUQZ2/905qXO7rmYqame0plfmzej3bB2w9nZnvI5DBElmDtkTklcaGRAZrJhB1frRmAyrRpQAd7n7s8Au2KqIJ/tmRybm6Lyr0rCf9gs8cYKtCNnOnJNpVsdZFFmH2LKV/dHozMVHMUCSuk50RW8Maubnw2a35oFoguvIsEo17vvUglVIjI5fEz8WsxjXWaHYohY/0jkNHsdOgS26obSL70FrBygMpqnmnOhKa79v9LVS+7eB/Ug+zeBS05adWNkZupiQVkDSiM24B6vBSTs1tNLvt2soaBdmnWa5qBKrdu+f9Tc7GoGkh/BNoNKnFkaY2VmSGP2WQNLXjdEICQHk+0o1Wu/ua0soY2aR5peoHCsvb0u023r9QQuHoQ1gUnlWLliYWahY6Za/0uXOKUhmAgD733Wj8CZrruhwpofmtufm6uivN/RAOqAA8gcRDR7SClYVGJYZvVjUVv3TM05BSMMCnTw09e2wX6vT6L9mvyZXZ/Jqoq7k9CU6AoCYRsCM3FHaVfpYUlmQ2T4W+xNADtjJIAL5fEs2eDCZ7Dooj2b35nknvypdrpJzynnlQD5Gb0xZEakVnlhNWaMZJpc3E4vPL8l8wxY84baDcRUsYajgpvHmXCeNKlmuQLOv+Ug/48YdTBTRdtVBGEcZtBkN13IT1w9GSdlDsr049s9xUWyKaTMm7SZAZ5wqFm4vsxX5Kv9JBcrLz5EDVWKYP1lD2XPXbBQhT5yKNYPPvZB3XHGOrPRpBycppmYnbGnULd8y/DiNvy3Fd4tJkM7VAtg2WVJZWJelFGsP8gpRxGy96Hep8cztH2lcJyemTOd9qZLtjzKi+HB+koUjywKQmVTh1+wZX1l8F50Us5AHCu2Eib5A+DgyDC1LqbKnJuZ05xApkq1AMkn4Ez52xI9K+tAilL+XoJlrGV6X09T7kFtLCUUm/pn4R3KMbbkpimdnZl5nI+lTLTGx8Xe1/drEeopyT+qUXBeTmXVZf5fJlQKQ7wtkxUQ/MziXMs2t56njZ2lmSSc4qRTs5DGZN1j9vsPlCijPsdQ3l0VZfplfmD4VCJECS//Fob9M+SdzD64Xaj2nbKZ1Js6pF2yXMUG3PD0ig48J3o9309GXddkGWb4YMdVN0VUMGsY+/6b5eLNS7kgqWWexJmJm5ejbLErxKnaffMYDeIlTjz0Tqlck2QzZm5hkFZJRpwx1RlwAAXnKc9buuip2J7cmUSb+KJ+sP7CTtkK8qULhiQeOwROCFxLZEdm3mFWV1dH4TI9G+UBb+hy0G67tapRn/mZA5teopWv08H115nwMgooI+w5EE1iW/1jVmZJYhZYYUgkNKUcWgPb6b7RhbyFq86fG5rImsqhsK6swJ/WKO++CMghtjgYTLdaqmNgZq9i0lhnSWQ1Ch7QBEnrDNOgvVusUaBDmpKaOqHPrYi/StW47UkHZyB+NxxLCFpRY2VmEWOKWWlKoTZvH0QGt+xd1L6+NK3YoHCaYpqvoPOsaL7400ns1QUEH0M2HEpTWfRiZGZsYz1aaEvcN9EguQcm7rDV4L8SrmWhopo2mimgGqxLvajS2+pgBJ8dBDUZSZpYkWJeZsNj61pjTBM5MiItCZbvBdcFwfSu9qHZmhCaqJ9GqzG8WtFu6eoCORzEMxFI3VcqYlJmFWSUW1pNSDqRI6EKB/Fd2C3C26+Mohab8Jksn3eqG7sP0ALodQHRGoAyBkcbV71hQmZhZDlcTE56O+8kFAx58rbZWMPFsCejWJvUmbWerKkJusbOmOYAAFkZATF9RYxVMWDIZA9jKludTUg7VSUoDUf0PtyMxou0Vae4nyaesqILrYW8ItCk5qD+lBYCLYVA6U8+WuRel112VvhJ6zhnJLcNSvaU3wHL17kkra6l46Pbp02xnb/f0ermav32EyYpqDtaSlRU/lgUWKxRNEZqNlAjGw4i+MTiVs8Mv+Wyn6umqRStqbXXwsLTWedf/IARbSXpNt5EdE4XU4VSzUxTQsQzDyJUDtL5zuWL0yfEl7iLsW+vXbIfujHGzNXz5377Mw/ZIUYydz+fSDFN7EzaR1U++zCnIGMOV/uy6J7XKck4vnG3PbW1t6y+q8n817XoyPoPDWkewS0mOtZCTEdJR9RCOzoOLhcfSA6y/G7rj9sRzsfDUb0Ouxu9UcNFzVLaouk8+hQLHhtbKes0GT1qQZ5Buz0FNv8qXx0CDuP9Au5e397SRckow+LAj8INyP/Qzdy36tr5QQn4FxQlxy9qN4o77DuQOLUxzid/G5IN6v5v8Avjj9exzvfIt8YOyN/M1tRt3/Xro/mZB/gU7SC6KskxrjUyNlUzSi17JHkZ+QzH/7TylOYk3AjUvM6OzJnNxtHL2DHiXO2X+RkGHhLmHMYlNyzXL3MwCS7HKAchTBc1DHgA0fT56ZzgTNl31GXSL9PC1t3cGeXr7rT5xARrD/8Y6yC1JgUqryquKCskcx35FEkLAAHF9jvt9+R63ibaOtjO2NHbDOEk6KPw/PmYA94MOxUqHEQhOyTnJEUjdx+/GYASMgpdAZH4V/Az6ZLjyd8P3nbe8+BW5VLrgfJv+pcCeQqYEYQX5Bt3Hhwfzx2sGuwV4g/zCJABM/pP81DtlOhf5eDjJuQn5rvpoe6I9Av7vwE7CBcO+RKXFrwYTxlMGMsV+xEgDYsHmQGs+yH2TvF+7efqrune6WzrOu4T8rX20fsSASUGugqKDl0RCxOAE70S1BDsDTgK+gV4Afz8zfgs9VDyYfB375vvwvDT8qb1CfnA/I8ANwSABzgKNwxjDbENIw3JC78JLQdBBCwBIv5T++r4CffL9Tv1XfUn9oT3WfmC+9r9NgByAmoEAwYlB8cH4wd/B6oGdgX/A18CtgAf/7L9hvyp+yT7+fok+5r7Tvws/SL+HP8HANUAeQHrASoCNgIWAtIBdwESAa4AVwAWAPH/6/8=';

// Pool de 3 elementos pre-creados — se desbloquean con el primer tap
const _audioPool = [new Audio(BEEP_B64), new Audio(BEEP_B64), new Audio(BEEP_B64)];
_audioPool.forEach(a => { a.volume = 1.0; a.preload = 'auto'; });

function _unlockAudio() {
  if (_audioUnlocked) return;
  _audioUnlocked = true;
  _audioPool.forEach((a, i) => {
    setTimeout(() => {
      a.volume = 0.001;
      a.play().then(() => { a.pause(); a.currentTime = 0; a.volume = 1.0; }).catch(() => {});
    }, i * 30);
  });
}
document.addEventListener('touchstart', _unlockAudio, { capture: true, passive: true });
document.addEventListener('touchend',   _unlockAudio, { capture: true, passive: true });
document.addEventListener('click',      _unlockAudio, { capture: true, passive: true });

function playBeep() {
  _audioPool.forEach((a, i) => {
    setTimeout(() => {
      a.currentTime = 0;
      a.volume = 1.0;
      a.play().catch(() => { _playBeepCtx(); });
    }, i * 250);
  });
}

function _playBeepCtx() {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = _audioCtx;
    const doPlay = () => {
      const now = ctx.currentTime;
      [[880,0,0.15],[880,0.25,0.4],[1320,0.5,0.8]].forEach(([freq, start, end]) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.5, now + start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + end);
        osc.start(now + start);
        osc.stop(now + end + 0.05);
      });
    };
    if (ctx.state === 'suspended') ctx.resume().then(doPlay);
    else doPlay();
  } catch(e) {}
}

// ── Service Worker externo (sw.js) ───────────────────────────────
// _swReg declared at top

if ('serviceWorker' in navigator) {
  // Only try to register SW if sw.js is actually reachable (avoids 404 console noise)
  fetch('./sw.js', {method:'HEAD'}).then(res => {
    if (!res.ok) return; // sw.js not found, skip silently
    navigator.serviceWorker.getRegistrations().then(regs => {
    const unregisterPromises = regs
      .filter(r => !r.active?.scriptURL?.includes('sw.js'))
      .map(r => { console.log('[FitTrack] Desregistrando SW viejo:', r.scope); return r.unregister(); });
    return Promise.all(unregisterPromises);
  }).then(() => {
    // Ahora registrar el SW correcto
    return navigator.serviceWorker.register('./sw.js');
  }).then(reg => {
    _swReg = reg;
    console.log('[FitTrack] SW registrado:', reg.scope);
    dbLog('[SW] Registrado OK: ' + reg.scope);
    if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    reg.addEventListener('updatefound', () => {
      const newSW = reg.installing;
      newSW?.addEventListener('statechange', () => {
        if (newSW.state === 'installed') newSW.postMessage({ type: 'SKIP_WAITING' });
      });
    });
    // Pedir permiso de notificaciones ahora que el SW está listo
    setTimeout(requestNotifPermission, 1500);
  }).catch(e => {
    console.warn('[FitTrack] SW error:', e);
    dbLog('[SW] Error: ' + e.message);
  });
  }).catch(() => {}); // sw.js not reachable, ignore silently
}


// ── Resync timers when page becomes visible again ─────────────────
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Resumir AudioContext — iOS lo suspende en background
    if (_audioCtx && _audioCtx.state === 'suspended') {
      _audioCtx.resume().then(() => { _audioUnlocked = true; });
    }
    // Rest timer: check if it expired while screen was off
    if (_rtEndTime && _rtEndTime > 0) {
      const remaining = Math.round((_rtEndTime - Date.now()) / 1000);
      if (remaining <= 0) {
        // Timer already finished while screen was off — fire alarm now
        clearInterval(_rtInterval);
        _rtEndTime = 0;
        _rtRemaining = 0;
        _updateRtDisplay();
        if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
        playBeep();
        const doneEl = document.getElementById('rtDone');
        if (doneEl) doneEl.classList.add('show');
        const overlay = document.getElementById('restTimerOverlay');
        if (overlay) overlay.classList.add('active');
        setTimeout(() => dismissRestTimer(), 4000);
      } else {
        _resyncRtTimer();
      }
    }
    _resyncSSTimers();
  }
});

// Classify exercise: 'compound' | 'push_isolation' | 'pull_isolation' | 'core' | 'iso_hold'
function classifyExercise(ex) {
  const name = (ex.name || '').toLowerCase();
  const repsStr = String(ex.reps || '');
  if (repsStr.includes('s') || repsStr.includes('m') || name.includes('hold') || name.includes('hang') || name.includes('plank') || name.includes('carry')) return 'iso_hold';
  if (name.includes('ab wheel') || name.includes('russian') || name.includes('plank')) return 'core';
  if (name.includes('bench') || name.includes('press banca') || name.includes('barbell row') || name.includes('pull-up') || name.includes('pullup') || name.includes('dominada') || name.includes('squat') || name.includes('deadlift') || name.includes('dips') || name.includes('fondos')) return 'compound';
  if (name.includes('shoulder press') || name.includes('press militar') || (name.includes('overhead') && name.includes('press'))) return 'compound';
  if (name.includes('row') || name.includes('remo') || name.includes('chest supported')) return 'compound';
  if (name.includes('incline') && (name.includes('press') || name.includes('fly'))) return 'push_isolation';
  if (name.includes('tricep') || name.includes('extension') || name.includes('fly') || name.includes('apertura')) return 'push_isolation';
  if (name.includes('curl') || name.includes('rear delt') || name.includes('lateral raise') || name.includes('elevacion') || name.includes('vuelo') || name.includes('external rotation')) return 'pull_isolation';
  return 'push_isolation';
}

/**
 * Estimate how long (seconds) it takes to perform one set of an exercise.
 * Used for superset timing: total timer = rest + time(exercise B)
 */
function estimateSetDuration(ex) {
  if (!ex) return 30;
  const type = classifyExercise(ex);
  const repsStr = String(ex.reps || '');
  const repRange = parseRepRange(repsStr);
  const avgReps = repRange ? Math.round((repRange.min + repRange.max) / 2) : 10;

  if (type === 'iso_hold') return 40;  // hold + transition
  if (type === 'core') return 35;

  // Seconds per rep varies by type and load
  const secsPerRep = type === 'compound' ? 3.5 : 2.5;
  const setTime = Math.round(avgReps * secsPerRep);
  return Math.min(Math.max(setTime, 20), 60); // clamp 20–60s
}

/**
 * Pure rest time for regular (non-superset) exercises.
 * Compound heavy → 3:30, compound hypertrophy → 2:30, isolation → 60–90s
 */
function calcRestTime(ex, completedSets, setIdx) {
  const type = classifyExercise(ex);
  const repsStr = String(ex.reps || '');
  const repRange = parseRepRange(repsStr);
  const maxReps = repRange ? repRange.max : 12;
  const setNum = setIdx + 1;

  let base, reason;

  if (type === 'iso_hold') return { secs: 60, reason: 'Isométrico — 60s' };
  if (type === 'core')     return { secs: 60, reason: 'Core — 60s' };

  if (type === 'compound') {
    if (maxReps <= 6)       { base = 210; reason = 'Compuesto pesado (≤6 reps) — 3:30'; }
    else if (maxReps <= 10) { base = 150; reason = 'Compuesto hipertrofia — 2:30'; }
    else                    { base = 120; reason = 'Compuesto volumen — 2:00'; }
  } else {
    if (maxReps <= 10)      { base = 90;  reason = 'Aislamiento fuerza — 1:30'; }
    else if (maxReps <= 15) { base = 75;  reason = 'Aislamiento hipertrofia — 1:15'; }
    else                    { base = 60;  reason = 'Aislamiento alto rep — 1:00'; }
  }

  // Later sets: +8% per set after 2nd
  if (setNum >= 3) base = Math.round(base * (1 + (setNum - 2) * 0.08));

  return { secs: base, reason };
}

/**
 * SS timer = real rest after B + time to perform B
 * So when it rings, you just finished B and you're ready for A again.
 *
 * Pairing rules:
 *   compound + compound   → 90–120s rest
 *   compound + isolation  → 75–90s rest
 *   isolation + isolation → 45–60s rest
 */
function calcSSRestTime(exA, exB, setIdx) {
  const typeA = classifyExercise(exA);
  const typeB = exB ? classifyExercise(exB) : 'push_isolation';
  const repsA = parseRepRange(String(exA.reps || ''));
  const maxRepsA = repsA ? repsA.max : 12;
  const setNum = setIdx + 1;

  const aIsCompound = typeA === 'compound';
  const bIsCompound = typeB === 'compound';

  let restAfterB; // pure rest seconds after finishing exercise B

  if (aIsCompound && bIsCompound) {
    // compound + compound: 90–120s based on rep range of A
    restAfterB = maxRepsA <= 8 ? 110 : 90;
  } else if (aIsCompound && !bIsCompound) {
    // compound + isolation: 75–90s
    restAfterB = maxRepsA <= 8 ? 90 : 75;
  } else {
    // isolation + isolation: 45–60s
    restAfterB = maxRepsA <= 12 ? 60 : 45;
  }

  // Later sets get a bit more rest
  if (setNum >= 3) restAfterB = Math.round(restAfterB * (1 + (setNum - 2) * 0.08));

  const bDuration = estimateSetDuration(exB); // time to perform exercise B
  const total = restAfterB + bDuration;

  return {
    total,
    restAfterB,
    bDuration,
    label: `~${bDuration}s ${exB ? exB.name : 'ej B'} + ${restAfterB}s descanso`
  };
}

function startRestTimer(ex, completedSets, setIdx) {
  const { secs, reason } = calcRestTime(ex, completedSets, setIdx);
  _rtTotal = secs;
  _rtRemaining = secs;
  _rtEndTime = Date.now() + secs * 1000;
  _acquireWakeLock();
  _scheduleTimerNotif(ex.name, secs);
  // Timer vive en el banner sticky — el overlay está desactivado
  if (typeof _activateRestInBanner === 'function') {
    _activateRestInBanner(ex.name, setIdx + 1, secs);
  }
  // Iniciar el resync interval para que el banner se actualice
  clearInterval(_rtInterval);
  _rtInterval = setInterval(function() {
    _rtRemaining = Math.round((_rtEndTime - Date.now()) / 1000);
    if (_rtRemaining <= 0) {
      clearInterval(_rtInterval);
      _rtFinished();
    }
  }, 500);
}

function _resyncRtTimer() {
  if (!_rtEndTime || _rtEndTime <= Date.now()) return;
  _rtRemaining = Math.round((_rtEndTime - Date.now()) / 1000);
  _updateRtDisplay();
  clearInterval(_rtInterval);
  _rtInterval = setInterval(() => {
    _rtRemaining = Math.round((_rtEndTime - Date.now()) / 1000);
    _updateRtDisplay();
    if (_rtRemaining <= 0) { clearInterval(_rtInterval); _rtFinished(); }
  }, 500);
}

function _updateRtDisplay() {
  const s = Math.max(0, _rtRemaining);
  const el = document.getElementById('rtSecs');
  if (!el) return;
  el.textContent = s;
  // Color: green when done, yellow when <10s, accent otherwise
  if (s <= 0) el.style.color = 'var(--green)';
  else if (s <= 10) el.style.color = 'var(--yellow)';
  else el.style.color = 'var(--accent)';
  // Ring animation
  const ring = document.getElementById('rtRingFill');
  if (ring) {
    const pct = s / _rtTotal;
    const circumference = 427;
    ring.style.strokeDashoffset = circumference * (1 - pct);
    ring.style.stroke = s <= 0 ? 'var(--green)' : s <= 10 ? 'var(--yellow)' : 'var(--accent)';
  }
}

function _rtFinished() {
  _cancelTimerNotif(); // terminó en primer plano, cancelar notif del SW
  document.getElementById('rtDone').classList.add('show');
  document.getElementById('rtSecs').textContent = '0';
  _rtEndTime = 0;
  // Vibrate + beep
  if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
  playBeep();
  // Auto dismiss after 3s
  setTimeout(() => dismissRestTimer(), 3000);
}

function addRestTime(extra) {
  _rtEndTime += extra * 1000;
  _rtTotal += extra;
  _rtRemaining = Math.round((_rtEndTime - Date.now()) / 1000);
  _updateRtDisplay();
  // Restart interval if it had stopped
  if (_rtRemaining > 0) {
    clearInterval(_rtInterval);
    _rtInterval = setInterval(() => {
      _rtRemaining = Math.round((_rtEndTime - Date.now()) / 1000);
      _updateRtDisplay();
      if (_rtRemaining <= 0) { clearInterval(_rtInterval); _rtFinished(); }
    }, 500);
  }
}

function dismissRestTimer() {
  clearInterval(_rtInterval);
  _cancelTimerNotif();
  _rtEndTime = 0;
  if (_wakeLock) { _wakeLock.release().catch(()=>{}); _wakeLock = null; }
  document.getElementById('restTimerOverlay').classList.remove('active');
}

// ═══════════════════════════════════════════════════════════════
// INLINE SUPERSET TIMER — runs inside the ss-divider strip
// One timer object per active ssGroup
// ═══════════════════════════════════════════════════════════════
const _ssTimers = {}; // ssGroup → { interval, remaining, total, endTime, restAfterB }

function startSSTimer(ex, completedSets, setIdx) {
  const ssGroup = ex.ssGroup;
  const exB = _findSSPartB(ex);
  const { total, restAfterB, bDuration, label } = calcSSRestTime(ex, exB, setIdx);

  if (_ssTimers[ssGroup]) clearInterval(_ssTimers[ssGroup].interval);
  const endTime = Date.now() + total * 1000;
  _ssTimers[ssGroup] = { remaining: total, total, endTime, restAfterB };

  const barWrap = document.getElementById('ss-bar-'+ssGroup);
  const secsEl  = document.getElementById('ss-secs-'+ssGroup);
  const lblEl   = document.getElementById('ss-lbl-'+ssGroup);
  const fillEl  = document.getElementById('ss-fill-'+ssGroup);
  const doneEl  = document.getElementById('ss-done-'+ssGroup);
  if (!barWrap) return;

  barWrap.classList.add('active');
  if (doneEl) doneEl.classList.remove('show');
  if (lblEl) lblEl.innerHTML =
    'hasta próximo <strong>' + ex.name + '</strong>' +
    (exB ? '<br>→ hacé ' + exB.name + ' (~' + bDuration + 's) + ' + restAfterB + 's descanso' : '');

  function tick() {
    const r = Math.max(0, Math.round((_ssTimers[ssGroup].endTime - Date.now()) / 1000));
    _ssTimers[ssGroup].remaining = r;
    const pct = r / _ssTimers[ssGroup].total * 100;
    const inBPhase = r > _ssTimers[ssGroup].restAfterB;

    if (secsEl) {
      secsEl.textContent = r;
      secsEl.style.color = r <= 0 ? 'var(--green)' : r <= 10 ? 'var(--yellow)' : inBPhase ? 'var(--text2)' : 'var(--accent)';
    }
    if (fillEl) {
      fillEl.style.width = pct + '%';
      fillEl.style.background = r <= 0 ? 'var(--green)' : inBPhase ? 'var(--text3)' : r <= 10 ? 'var(--yellow)' : 'var(--accent)';
    }

    if (r <= 0) {
      clearInterval(_ssTimers[ssGroup].interval);
      if (doneEl) doneEl.classList.add('show');
      if (navigator.vibrate) navigator.vibrate([150, 80, 150]);
      playBeep();
      setTimeout(() => ssDismiss(ssGroup), 4000);
    }
  }

  _ssTimers[ssGroup].interval = setInterval(tick, 500);
  tick();
}

function _findSSPartB(exA) {
  const d = getConfigTraining();
  if (!d) return null;
  return d.exercises.find(e => e.ssGroup === exA.ssGroup && e.ssPart === 'b') || null;
}

function ssAddTime(ssGroup, extra) {
  if (!_ssTimers[ssGroup]) return;
  _ssTimers[ssGroup].endTime += extra * 1000;
  _ssTimers[ssGroup].total += extra;
  const r = Math.max(0, Math.round((_ssTimers[ssGroup].endTime - Date.now()) / 1000));
  _ssTimers[ssGroup].remaining = r;
  clearInterval(_ssTimers[ssGroup].interval);
  _ssTimers[ssGroup].interval = setInterval(() => {
    const r2 = Math.max(0, Math.round((_ssTimers[ssGroup].endTime - Date.now()) / 1000));
    _ssTimers[ssGroup].remaining = r2;
    const secsEl = document.getElementById('ss-secs-'+ssGroup);
    const fillEl = document.getElementById('ss-fill-'+ssGroup);
    const doneEl = document.getElementById('ss-done-'+ssGroup);
    if (secsEl) { secsEl.textContent = r2; secsEl.style.color = r2<=0?'var(--green)':r2<=10?'var(--yellow)':'var(--accent)'; }
    if (fillEl) { fillEl.style.width = (r2/_ssTimers[ssGroup].total*100)+'%'; fillEl.style.background = r2<=0?'var(--green)':r2<=10?'var(--yellow)':'var(--accent)'; }
    if (r2 <= 0) {
      clearInterval(_ssTimers[ssGroup].interval);
      if (doneEl) doneEl.classList.add('show');
      if (navigator.vibrate) navigator.vibrate([150,80,150]);
      playBeep();
      setTimeout(() => ssDismiss(ssGroup), 4000);
    }
  }, 500);
}

function ssDismiss(ssGroup) {
  if (_ssTimers[ssGroup]) { clearInterval(_ssTimers[ssGroup].interval); delete _ssTimers[ssGroup]; }
  const barWrap = document.getElementById('ss-bar-'+ssGroup);
  if (barWrap) barWrap.classList.remove('active');
}

// After renderTraining() rebuilds the DOM, restore any timers that were running
function _reattachSSTimers() {
  Object.keys(_ssTimers).forEach(ssGroup => {
    const t = _ssTimers[ssGroup];
    if (!t) return;
    const barWrap = document.getElementById('ss-bar-'+ssGroup);
    if (!barWrap) return;
    const r = Math.max(0, Math.round((t.endTime - Date.now()) / 1000));
    t.remaining = r;
    barWrap.classList.add('active');
    const secsEl = document.getElementById('ss-secs-'+ssGroup);
    const fillEl = document.getElementById('ss-fill-'+ssGroup);
    const doneEl = document.getElementById('ss-done-'+ssGroup);
    if (secsEl) { secsEl.textContent = r; secsEl.style.color = r<=0?'var(--green)':r<=10?'var(--yellow)':'var(--accent)'; }
    if (fillEl) { fillEl.style.width = (t.total>0?r/t.total*100:0)+'%'; fillEl.style.background = r<=0?'var(--green)':r<=10?'var(--yellow)':'var(--accent)'; }
    if (r <= 0 && doneEl) { doneEl.classList.add('show'); return; }
    // Restart tick interval
    clearInterval(t.interval);
    t.interval = setInterval(() => {
      const r2 = Math.max(0, Math.round((t.endTime - Date.now()) / 1000));
      t.remaining = r2;
      const s2 = document.getElementById('ss-secs-'+ssGroup);
      const f2 = document.getElementById('ss-fill-'+ssGroup);
      const d2 = document.getElementById('ss-done-'+ssGroup);
      const inB = r2 > t.restAfterB;
      if (s2) { s2.textContent = r2; s2.style.color = r2<=0?'var(--green)':r2<=10?'var(--yellow)':inB?'var(--text2)':'var(--accent)'; }
      if (f2) { f2.style.width=(t.total>0?r2/t.total*100:0)+'%'; f2.style.background=r2<=0?'var(--green)':inB?'var(--text3)':r2<=10?'var(--yellow)':'var(--accent)'; }
      if (r2 <= 0) {
        clearInterval(t.interval);
        if (d2) d2.classList.add('show');
        if (navigator.vibrate) navigator.vibrate([150,80,150]);
        playBeep();
        setTimeout(() => ssDismiss(ssGroup), 4000);
      }
    }, 500);
  });
}

function _resyncSSTimers() { _reattachSSTimers(); }

// ═══════════════════════════════════════════════════════════════
// SESSION TIMER — cronómetro con Pausar/Reanudar + Terminar
// ═══════════════════════════════════════════════════════════════
// SESSION TIMER — authoritative implementation in session-timer-patch.js
// All session timer functions (startSessionTimer, stopSessionTimer,
// _renderSessionTimer, _resumeSessionTimerIfNeeded, _togglePauseSessionBanner)
// are defined exclusively in session-timer-patch.js.
// Do NOT add session timer code here.
// ═══════════════════════════════════════════════════════════════
// CALENDAR OF SESSIONS
// ═══════════════════════════════════════════════════════════════

let calViewYear  = new Date().getFullYear();
let calViewMonth = new Date().getMonth(); // 0-indexed

const DAY_COLORS = { 1:'d1', 2:'d2', 3:'d3', 5:'d5', 6:'d6' };
const DAY_NAMES_SHORT = { 1:'Push+Pull', 2:'Shoulders', 3:'Pull heavy', 5:'Push', 6:'Pull+Arms' };
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DOWS = ['L','M','X','J','V','S','D'];

