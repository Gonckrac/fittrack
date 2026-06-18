function calNav(dir) {
  calViewMonth += dir;
  if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; }
  if (calViewMonth < 0)  { calViewMonth = 11; calViewYear--; }
  renderCalendar();
}

function calcDayScoreForDate(dateStr) {
  var dd = state[dateStr];
  if (!dd) return 0;
  // Construir snapshot compatible con _calcScoreFromSnapshot()
  // Misma estructura que _deepCopyDaySnap(), pero para una fecha arbitraria.
  var snap = {
    foods: (dd.foods || []).map(function(f) { return Object.assign({}, f); }),
    water: dd.water || 0,
    trainDay: dd.trainDay,
    sleep: Object.assign({}, dd.sleep || {}),
    supps: Object.assign({}, dd.supps || {}),
    kcal: Object.assign({}, dd.kcal || {}),
    steps: dd.steps || 0
  };
  var td = dd.trainDay;
  if (td && td > 0) {
    var key = 'trainSets_' + td;
    if (dd[key]) {
      snap[key] = {};
      Object.keys(dd[key]).forEach(function(exIdx) {
        snap[key][exIdx] = dd[key][exIdx].map(function(s) { return Object.assign({}, s); });
      });
    }
  }
  return _calcScoreFromSnapshot(snap).overall;
}

// ─── STREAK CALCULATION ────────────────────────────────────────────
function calcCurrentStreak() {
  var streak = 0;
  var today = new Date(TODAY);
  for (var i = 0; i < 90; i++) {
    var d = new Date(today);
    d.setDate(d.getDate() - i);
    var ds = d.toLocaleDateString('en-CA');
    if (i === 0) continue; // hoy no cuenta aún
    var score = calcDayScoreForDate(ds);
    if (score >= 85) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function renderCalendar() {
  const grid = document.getElementById('calGrid');
  const label = document.getElementById('calMonthLabel');
  const statsEl = document.getElementById('calMonthStats');
  if (!grid) return;

  label.textContent = MONTHS_ES[calViewMonth] + ' ' + calViewYear;

  // Day-of-week headers (Mon first)
  let html = DOWS.map(d => `<div class="cal-dow">${d}</div>`).join('');

  // First day of month (0=Sun, adjust to Mon=0)
  const firstDay = new Date(calViewYear, calViewMonth, 1).getDay();
  const startOffset = (firstDay === 0) ? 6 : firstDay - 1;
  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();

  // Empty cells before month start
  for (let i = 0; i < startOffset; i++) html += '<div class="cal-day empty"></div>';

  const todayStr = TODAY;
  let monthTrained = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = calViewYear + '-' + String(calViewMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
    const dayData = state[dateStr];
    const trainDay = dayData?.trainDay;
    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;

    let cls = 'cal-day';
    let clickable = false;

    if (isToday) cls += ' today';

    // Days before installDate shown as inactive
    const installDate = state.installDate || TODAY;
    const isBeforeInstall = dateStr < installDate && dateStr !== installDate;

if (isBeforeInstall) {
      cls += ' pre-install';
    } else if (!isFuture) {
      clickable = true;
      if (dayData !== undefined) {
        const dayScore = calcDayScoreForDate(dateStr);
        if (dayScore >= 85) { cls += ' day-great'; if (!isToday) monthTrained++; }
        else if (dayScore >= 60) { cls += ' day-ok'; }
        else if (dayScore > 0)   { cls += ' day-low'; }
      }
    }

    // Contenido interior: solo número + score si hay datos
    let inner = `<span style="display:block;font-size:9px;font-weight:700;line-height:1.2">${d}</span>`;
    if (!isFuture && !isToday && (cls.includes('day-great') || cls.includes('day-ok') || cls.includes('day-low'))) {
      const sc = calcDayScoreForDate(dateStr);
      inner += `<span style="display:block;font-size:7px;opacity:0.85;margin-top:1px">${sc}%</span>`;
    }

    // Agregar cursor y onclick solo en días clickeables
    const clickAttr = clickable ? `onclick="openCalDay('${dateStr}')" style="cursor:pointer"` : '';
    html += `<div class="${cls}" ${clickAttr}>${inner}</div>`;
  }

  grid.innerHTML = html;

  // ─── ACTUALIZAR BADGE DE RACHA ────────────────────────────────
// ─── ACTUALIZAR BADGE DE RACHA ────────────────────────────────
  const streak = calcCurrentStreak();
  const streakNumEl = document.getElementById('calStreakNum');
  const streakFireEl = document.getElementById('calStreakFire');
  const streakBadge = document.getElementById('calStreakBadge');
const streakMsgs = [
    { min:0,  max:0,  emoji:'😴', msg:'Empezá tu racha hoy' },
    { min:1,  max:2,  emoji:'🌱', msg:'¡Buen comienzo!' },
    { min:3,  max:6,  emoji:'⚡', msg:'¡Seguí rompiéndola!' },
    { min:7,  max:13, emoji:'🔥', msg:'¡Una semana seguida!' },
    { min:14, max:20, emoji:'💪', msg:'¡Dos semanas, imparable!' },
    { min:21, max:29, emoji:'🚀', msg:'¡Tres semanas, sos una bestia!' },
    { min:30, max:Infinity, emoji:'🏆', msg:'¡Récord absoluto!' },
  ];
  const sm = streakMsgs.find(function(s){ return streak >= s.min && streak <= s.max; }) || streakMsgs[0];

  if (streakNumEl) streakNumEl.textContent = streak;
  if (streakFireEl) streakFireEl.textContent = sm.emoji;
  if (streakBadge) {
    streakBadge.style.borderColor = streak >= 3 ? 'var(--accent)' : 'var(--border)';
    streakBadge.style.background  = streak >= 3 ? 'rgba(77,138,255,0.08)' : 'var(--bg3)';
  }

  // Mensaje debajo del badge
  var streakMsgEl = document.getElementById('calStreakMsg');
  if (streakMsgEl) {
    streakMsgEl.textContent = sm.msg;
    streakMsgEl.style.color = streak >= 3 ? 'var(--accent)' : 'var(--text3)';
  }

  // Month stats
  statsEl.innerHTML =
    `<div style="font-size:10px;color:var(--text3);line-height:1.5">
      ${monthTrained} día${monthTrained !== 1 ? 's' : ''} con score ≥85% este mes · Tocá un día para ver el detalle.
    </div>`;
}

// ─── MODAL DETALLE DE DÍA ─────────────────────────────────────────
function openCalDay(dateStr) {
  var dd = state[dateStr];
  var modal = document.getElementById('calDayModal');
  var titleEl = document.getElementById('calDayModalTitle');
  var scoreNumEl = document.getElementById('calDayScoreNum');
  var scoreDashEl = document.getElementById('calDayScoreDash');
  var scoreLabelEl = document.getElementById('calDayScoreLabel');
  var scoreSubEl = document.getElementById('calDayScoreSub');
  var checklistEl = document.getElementById('calDayChecklist');
  if (!modal) return;

  // Formatear título de fecha
  var d = new Date(dateStr + 'T12:00:00');
  var DIAS = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  var MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var isToday = dateStr === TODAY;
  titleEl.textContent = (isToday ? 'Hoy — ' : '') + DIAS[d.getDay()] + ' ' + d.getDate() + ' ' + MESES[d.getMonth()];

  if (!dd) {
    // Sin datos para este día
    scoreNumEl.textContent = '—';
    scoreLabelEl.textContent = 'Sin datos registrados';
    scoreSubEl.textContent = '';
    scoreDashEl.style.strokeDashoffset = '163.4';
    checklistEl.innerHTML = '<div style="font-size:12px;color:var(--text3);text-align:center;padding:12px 0">No hay registros para este día.</div>';
    modal.classList.add('open');
    return;
  }

  // ─── Calcular scores usando la misma lógica que el home ──────
  // Construir snapshot idéntico al de calcDayScoreForDate()
  var snap = {
    foods: (dd.foods || []).map(function(f) { return Object.assign({}, f); }),
    water: dd.water || 0,
    trainDay: dd.trainDay,
    sleep: Object.assign({}, dd.sleep || {}),
    supps: Object.assign({}, dd.supps || {}),
    kcal: Object.assign({}, dd.kcal || {}),
    steps: dd.steps || 0
  };
  var td = dd.trainDay;
  if (td && td > 0) {
    var key = 'trainSets_' + td;
    if (dd[key]) {
      snap[key] = {};
      Object.keys(dd[key]).forEach(function(exIdx) {
        snap[key][exIdx] = dd[key][exIdx].map(function(s) { return Object.assign({}, s); });
      });
    }
  }
  var scoreResult = _calcScoreFromSnapshot(snap);
  var overallScore = scoreResult.overall;
  var scores = scoreResult.scores;

  // Datos de display para el checklist (solo para etiquetas, no para el score)
  var foods = dd.foods || [];
  var prot = 0, carb = 0, fat = 0;
  foods.forEach(function(f) { prot += +f.prot||0; carb += +f.carb||0; fat += +f.fat||0; });
  var waterGoal = getWaterGoal();
  var water = dd.water || 0;
  var sleep = dd.sleep || {};

  var trainDay = dd.trainDay;
  var trainLabel = '';
  if (trainDay === 0) {
    trainLabel = 'Día de descanso';
  } else if (trainDay > 0) {
    var sets = dd['trainSets_'+trainDay] || {};
    var total = 0, done = 0;
    Object.values(sets).forEach(function(ex){ ex.forEach(function(s){ total++; if(s.done) done++; }); });
    trainLabel = 'Día ' + trainDay + ' — ' + done + '/' + total + ' sets';
  }

  var macroScore = scores.macros;
  var trainScore = scores.training;
  var waterScore = Math.min(100, Math.round((water/waterGoal)*100));
  var sleepScore = scores.sleep;

  // ─── Actualizar círculo ───────────────────────────────────────
  scoreNumEl.textContent = overallScore;
  var scoreColor = overallScore >= 85 ? 'var(--green)' : overallScore >= 60 ? 'var(--yellow)' : 'var(--red)';
  scoreNumEl.style.color = scoreColor;
  scoreDashEl.style.stroke = scoreColor;
  scoreDashEl.style.strokeDashoffset = (163.4 - (163.4 * overallScore / 100));
  scoreLabelEl.textContent = overallScore >= 85 ? '¡Excelente día!' : overallScore >= 60 ? 'Día regular' : 'Día difícil';
  scoreLabelEl.style.color = scoreColor;
  scoreSubEl.textContent = 'Score general del día';

  // ─── Checklist ───────────────────────────────────────────────
  function checkItem(icon, label, score, detail) {
    var ok = score >= 80;
    var warn = score >= 50 && score < 80;
    var color = ok ? 'var(--green)' : warn ? 'var(--yellow)' : 'var(--red)';
    var icon2 = ok ? '✔' : warn ? '⚠' : '✖';
    return '<div style="display:flex;align-items:center;gap:10px;background:var(--bg3);border-radius:10px;padding:10px 12px">' +
      '<span style="font-size:18px">' + icon + '</span>' +
      '<div style="flex:1">' +
        '<div style="font-size:12px;font-weight:600;color:var(--text)">' + label + '</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-top:1px">' + detail + '</div>' +
      '</div>' +
      '<div style="font-size:12px;font-weight:700;color:' + color + '">' + icon2 + ' ' + score + '%</div>' +
    '</div>';
  }

  var macroDetail = prot + 'g prot · ' + carb + 'g carbos · ' + fat + 'g grasas';
  var waterDetail = water + 'ml de ' + waterGoal + 'ml';
  var sleepDetail = sleep.manHours ? sleep.manHours + 'h' : (sleep.readiness ? 'Readiness Oura' : 'Sin datos');

  checklistEl.innerHTML =
    checkItem('🍽', 'Macros', macroScore, macroDetail) +
    checkItem('💪', 'Entrenamiento', trainScore, trainLabel || 'Sin datos') +
    checkItem('💧', 'Hidratación', waterScore, waterDetail) +
    (sleepScore > 0 ? checkItem('🌙', 'Sueño', sleepScore, sleepDetail) : '');

// Botón editar ejercicios (solo hoy y futuro con rutina gym asignada)
  var editBtnEl = document.getElementById('calDayEditBtn');
  if (editBtnEl) {
    var isFutureOrToday = dateStr >= TODAY;
    var dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(dateStr + 'T12:00:00').getDay()];
    var cycleVal = state.config && state.config.cycle && state.config.cycle[dow];
    var hasGymRoutine = cycleVal !== null && cycleVal !== undefined && cycleVal !== -1 && cycleVal !== '-1' && cycleVal !== 'sport' && cycleVal !== 'rest';
    if (isFutureOrToday && hasGymRoutine) {
      var rIdx = parseInt(cycleVal);
      editBtnEl.innerHTML = '<button onclick="closeCalDay();_weekDayEditGym(\'' + dow + '\')" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;font-size:13px;font-weight:600;color:var(--accent)">✏️ Editar ejercicios de este día</button>';
    } else {
      editBtnEl.innerHTML = '';
    }
  }

  modal.classList.add('open');
}

function closeCalDay() {
  var modal = document.getElementById('calDayModal');
  if (modal) modal.classList.remove('open');
}

// ═══════════════════════════════════════════════════════════════
// DELOAD WEEK — every 4 weeks, auto-reduce volume
// ═══════════════════════════════════════════════════════════════

const DELOAD_INTERVAL_WEEKS = 4; // Every 4th week
const PROGRAM_START = '2026-03-03'; // When the training program started

function getWeekNumber(dateStr) {
  const start = new Date(PROGRAM_START + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.round((target - start) / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7); // 0-indexed week number
}

function isDeloadWeek(dateStr) {
  const week = getWeekNumber(dateStr);
  return week > 0 && (week + 1) % DELOAD_INTERVAL_WEEKS === 0; // Weeks 3, 7, 11...
}

function checkDeloadWeek() { return;
  const banner = document.getElementById('deloadBanner');
  if (!banner) return;

  const week = getWeekNumber(TODAY);
  // Show deload banner starting from week 3 (0-indexed)
  if (!isDeloadWeek(TODAY)) {
    banner.style.display = 'none';

    // Preview: warn 3 days before deload week
    const nextDeloadWeek = (Math.floor(week / DELOAD_INTERVAL_WEEKS) + 1) * DELOAD_INTERVAL_WEEKS - 1;
    const nextDeloadStart = new Date(PROGRAM_START + 'T00:00:00');
    nextDeloadStart.setDate(nextDeloadStart.getDate() + nextDeloadWeek * 7);
    const daysUntil = Math.round((nextDeloadStart - new Date(TODAY + 'T00:00:00')) / (1000*60*60*24));

    if (daysUntil <= 3 && daysUntil > 0) {
      banner.style.display = 'block';
      banner.innerHTML = `<div class="deload-banner">
        <div class="deload-banner-title">📅 Semana de deload en ${daysUntil} día${daysUntil>1?'s':''}</div>
        <div class="deload-banner-sub">En ${daysUntil} días empieza tu semana de descarga. Prepará los pesos reducidos.</div>
        <div class="deload-banner-pills">
          <div class="deload-pill">Semana ${week + 1}</div>
          <div class="deload-pill">Deload en semana ${nextDeloadWeek + 1}</div>
        </div>
      </div>`;
    }
    return;
  }

  // It IS deload week
  if (state.deloadDismissed === TODAY.slice(0,7)) {
    banner.style.display = 'none';
    return;
  }

  banner.style.display = 'block';
  banner.innerHTML = `<div class="deload-banner">
    <div class="deload-banner-title">🔄 Semana de Deload — Semana ${week + 1}</div>
    <div class="deload-banner-sub">
      Llevás ${week + 1} semanas entrenando. Esta semana reducí el volumen para supercompensar y llegar más fuerte la próxima.
    </div>
    <div class="deload-banner-pills">
      <div class="deload-pill">🏋️ Bajar 40% el peso</div>
      <div class="deload-pill">📉 50% del volumen</div>
      <div class="deload-pill">✅ Mismos ejercicios</div>
      <div class="deload-pill">😴 Priorizá el sueño</div>
    </div>
    <button class="deload-dismiss" onclick="dismissDeload()">Entendido, no mostrar esta semana</button>
  </div>`;
}

function dismissDeload() {
  state.deloadDismissed = TODAY.slice(0,7); // store YYYY-MM
  saveState(state);
  document.getElementById('deloadBanner').style.display = 'none';
}


