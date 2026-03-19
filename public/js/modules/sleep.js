
// ─── SLEEP ───────────────────────────────────────────────────────
function renderSleep() {
  const s = state[TODAY].sleep || {};
  const r = s.readiness;

  const circle = document.getElementById('readinessDash');
  const numEl  = document.getElementById('readinessNum');
  const lblEl  = document.getElementById('readinessLabel');
  if (r && circle) {
    const offset = 251.2 - (251.2 * r / 100);
    circle.style.strokeDashoffset = offset;
    const color = r >= 70 ? 'var(--green)' : r >= 60 ? 'var(--yellow)' : 'var(--red)';
    circle.style.stroke = color;
    numEl.textContent = r;
    numEl.style.color = color;
    lblEl.textContent = r >= 70 ? 'BUENA — Entrenar normal' : r >= 60 ? 'MODERADA — Sin forzar' : 'BAJA — Bajar volumen';
    lblEl.style.color = color;
  } else if (numEl) {
    numEl.textContent = '—';
    if (lblEl) lblEl.textContent = 'Sin datos de Oura · cargá manualmente';
  }

  const hours = s.hours || s.manHours || null;
  const eff   = s.efficiency || null;
  const deep  = s.deep || s.manDeep || null;
  const hrv   = s.hrv || s.manHrv || null;
  const qual  = s.manQuality || null;

  const el = id => document.getElementById(id);
  if (el('sleepHours')) el('sleepHours').textContent = hours ? hours + 'h' : '—';
  if (el('sleepEff'))   el('sleepEff').textContent   = eff ? eff + '%' : (qual ? qual + '/10' : '—');
  if (el('sleepDeep'))  el('sleepDeep').textContent  = deep ? deep + 'h' : '—';
  if (el('sleepHRV'))   el('sleepHRV').textContent   = hrv ? hrv + ' ms' : '—';

  if (el('manSleepHours')   && s.manHours)   el('manSleepHours').value   = s.manHours;
  if (el('manSleepQuality') && s.manQuality) el('manSleepQuality').value = s.manQuality;
  if (el('manSleepDeep')    && s.manDeep)    el('manSleepDeep').value    = s.manDeep;
  if (el('manSleepHRV')     && s.manHrv)     el('manSleepHRV').value     = s.manHrv;

  // Show sleep quality in readiness circle if no Oura
  // Ocultar carga manual si hay wearable conectado
// Después — limpio y correcto
const hasOuraConnected = typeof isWearableConnected === 'function' && isWearableConnected('oura');

const manualCard = document.getElementById('manualSleepCard');
if (manualCard) {
  manualCard.style.display = hasOuraConnected ? 'none' : '';
}

const ouraCard = document.getElementById('ouraSleepCard');
if (ouraCard) {
  ouraCard.style.display = hasOuraConnected ? 'block' : 'none';
}
  // Show sleep quality in readiness circle if no Oura
  if (!r) {
    const sleepScore = qual ? qual * 10 : (hours ? Math.min(100, Math.round(hours / 8 * 100)) : null);
    if (sleepScore !== null && numEl) {
      numEl.textContent = sleepScore;
      const col = sleepScore >= 70 ? 'var(--green)' : sleepScore >= 50 ? 'var(--yellow)' : 'var(--red)';
      numEl.style.color = col;
      if (circle) { circle.style.stroke = col; circle.style.strokeDashoffset = 251.2 - (251.2 * sleepScore / 100); }
      if (lblEl)  { lblEl.textContent = sleepScore >= 70 ? 'BUEN SUEÑO ✓' : sleepScore >= 50 ? 'SUEÑO MODERADO' : 'SUEÑO POBRE — descansá más'; lblEl.style.color = col; }
    }
  }
}

function saveManualSleep() {
  const h = parseFloat(document.getElementById('manSleepHours')?.value)   || null;
  const q = parseInt(document.getElementById('manSleepQuality')?.value)   || null;
  const d = parseFloat(document.getElementById('manSleepDeep')?.value)    || null;
  const v = parseInt(document.getElementById('manSleepHRV')?.value)       || null;
  if (!h && !q) { showToast('⚠ Ingresá al menos las horas'); return; }
  if (!state[TODAY].sleep) state[TODAY].sleep = {};
  state[TODAY].sleep.manHours   = h;
  state[TODAY].sleep.manQuality = q;
  state[TODAY].sleep.manDeep    = d;
  state[TODAY].sleep.manHrv     = v;
  saveState(state);
  renderSleep();
  showToast('🌙 Sueño guardado');
}

// ─── ACTIVIDAD / KCAL ────────────────────────────────────────────
const ACTIVITIES = [
  { id:'weights',  icon:'🏋️', label:'Pesas',       met:{low:3.5, mid:5.0, high:6.0}  },
  { id:'cardio',   icon:'🏃', label:'Cardio',       met:{low:6.0, mid:9.0, high:12.0} },
  { id:'hiit',     icon:'⚡', label:'HIIT',         met:{low:7.0, mid:10.0, high:14.0}},
  { id:'cycling',  icon:'🚴', label:'Bicicleta',    met:{low:5.5, mid:8.0, high:12.0} },
  { id:'swimming', icon:'🏊', label:'Natación',     met:{low:5.0, mid:7.0, high:10.0} },
  { id:'walk',     icon:'🚶', label:'Caminata',     met:{low:2.8, mid:3.5, high:5.0}  },
  { id:'yoga',     icon:'🧘', label:'Yoga/Pilates', met:{low:2.0, mid:3.0, high:4.0}  },
  { id:'sports',   icon:'⚽', label:'Deporte',      met:{low:5.0, mid:7.0, high:10.0} },
  { id:'climb',    icon:'🧗', label:'Escalada',     met:{low:5.5, mid:8.0, high:11.0} },
  { id:'other',    icon:'🤸', label:'Otro',         met:{low:4.0, mid:6.0, high:9.0}  },
];
let _selectedActivity = null;

function renderActivityGrid() {
  const grid = document.getElementById('activityGrid');
  if (!grid) return;
  grid.innerHTML = ACTIVITIES.map(a =>
    `<button class="btn btn-ghost act-btn" id="actBtn-${a.id}"
      style="display:flex;align-items:center;gap:8px;padding:10px 12px;font-size:13px;border:1px solid var(--border);border-radius:10px"
      onclick="selectActivity('${a.id}')">
      <span style="font-size:18px">${a.icon}</span><span>${a.label}</span>
    </button>`).join('');
}

function selectActivity(id) {
  _selectedActivity = id;
  document.querySelectorAll('.act-btn').forEach(b => { b.style.background=''; b.style.borderColor='var(--border)'; b.style.color='var(--text)'; });
  const btn = document.getElementById('actBtn-' + id);
  if (btn) { btn.style.background='var(--accent)'; btn.style.borderColor='var(--accent)'; btn.style.color='#fff'; }
  updateActPreview();
}

function updateActPreview() {
  const preview = document.getElementById('actPreview');
  if (!_selectedActivity || !preview) return;
  const act = ACTIVITIES.find(a => a.id === _selectedActivity);
  if (!act) return;
  const dur       = parseFloat(document.getElementById('actDuration')?.value) || 0;
  const intensity = document.getElementById('actIntensity')?.value || 'mid';
  const weight    = state.config?.weight || 75;
  const met       = act.met[intensity];
  const kcal      = dur > 0 ? Math.round(met * weight * dur / 60) : 0;
  preview.style.display = 'block';
  document.getElementById('actKcalPreview').textContent = dur > 0 ? kcal + ' kcal' : '— kcal';
  document.getElementById('actMetPreview').textContent  = 'MET ' + met + ' · ' + weight + 'kg · ' + (dur||0) + 'min';
}

function logActivity() {
  if (!_selectedActivity) { showToast('⚠ Elegí una actividad'); return; }
  const dur = parseFloat(document.getElementById('actDuration')?.value);
  if (!dur || dur <= 0) { showToast('⚠ Ingresá la duración'); return; }
  const intensity = document.getElementById('actIntensity')?.value || 'mid';
  const act    = ACTIVITIES.find(a => a.id === _selectedActivity);
  const weight = state.config?.weight || 75;
  const kcal   = Math.round(act.met[intensity] * weight * dur / 60);
  if (!state[TODAY].activities) state[TODAY].activities = [];
  state[TODAY].activities.push({ id:act.id, icon:act.icon, label:act.label, dur, intensity, kcal,
    time: new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'}) });
  saveState(state);
  renderKcal();
  showToast('🔥 +' + kcal + ' kcal quemadas');
  celebrate('kcal');
  document.getElementById('actDuration').value = '';
  document.getElementById('actPreview').style.display = 'none';
  _selectedActivity = null;
  document.querySelectorAll('.act-btn').forEach(b => { b.style.background=''; b.style.borderColor='var(--border)'; b.style.color='var(--text)'; });
}

function deleteActivity(idx) {
  if (!state[TODAY].activities) return;
  state[TODAY].activities.splice(idx, 1);
  saveState(state);
  renderKcal();
}
function updateKcalBalance() { renderKcal(); }
function renderKcal() {
  const consumed   = Math.round(calcTotals().kcal);
  const ouraKcal   = state[TODAY]?.kcal?.burned || 0;
  const activities = state[TODAY]?.activities || [];
  const actKcal    = activities.reduce((s, a) => s + (a.kcal || 0), 0);
  const burned     = ouraKcal || actKcal;
  const hasOura    = ouraKcal > 0;
  const cfg        = state.config || {};

  const goal       = cfg.goal || 'cut';
  const tdee = cfg.tdee || cfg.kcal || 2000;
  const targetMap  = { cut_aggressive:-500, cut:-300, maintain:0, lean_bulk:200, bulk:400 };
  const targetKcal = tdee + (targetMap[goal] || -300);
  const balance = consumed - (burned || cfg.tdee || tdee);


  const el = id => document.getElementById(id);
  const isBulk = goal === 'bulk' || goal === 'lean_bulk';
  const dailyTarget = cfg.kcal || targetKcal;
  const remaining = dailyTarget - consumed;
  const targetDelta = targetMap[goal] || -300;

  // ── Número grande: consumidas (siempre positivo, nunca asusta) ──
// ── Número grande: cuánto falta (framing accionable) ────────────
  const kcalFaltantes = dailyTarget - consumed;
  const preEl    = el('kcalBalancePre');
  const numEl    = el('kcalBalance');
  const labelEl  = el('kcalBalanceLabel');
if (consumed === 0) {
    if (preEl)   preEl.textContent  = 'Objetivo de hoy';
    if (numEl)   { numEl.textContent = dailyTarget; numEl.style.color = 'var(--text2)'; }
    if (labelEl) labelEl.textContent = 'kcal — empezá a cargar comidas';
  } else if (Math.abs(kcalFaltantes) <= 100) {    // En objetivo — celebrar
    if (preEl)   preEl.textContent  = '✅ Objetivo cumplido';
    if (numEl)   { numEl.textContent = (kcalFaltantes >= 0 ? '+' : '') + Math.abs(kcalFaltantes); numEl.style.color = 'var(--green)'; }
    if (labelEl) labelEl.textContent = 'kcal de margen';
  } else if (kcalFaltantes > 0) {
    // Falta comer
    if (preEl)   preEl.textContent  = 'Te faltan';
    if (numEl)   { numEl.textContent = kcalFaltantes; numEl.style.color = 'var(--accent)'; }
    if (labelEl) labelEl.textContent = isBulk ? 'kcal — seguí comiendo' : 'kcal para tu objetivo';
  } else {
    // Se pasó del objetivo
    if (preEl)   preEl.textContent  = isBulk ? '💪 Superávit de' : '⚠️ Te excediste';
    if (numEl)   { numEl.textContent = Math.abs(kcalFaltantes); numEl.style.color = isBulk ? 'var(--green)' : 'var(--yellow)'; }
    if (labelEl) labelEl.textContent = isBulk ? 'kcal extra — bien para ganar masa' : 'kcal sobre tu objetivo';
  }

  // ── Tres columnas ────────────────────────────────────────────────
  if (el('kcalConsumed')) el('kcalConsumed').textContent = consumed;
  if (el('kcalBurned'))   el('kcalBurned').textContent   = dailyTarget;

  // Tercera columna: ajuste dinámico por objetivo
  if (el('kcalTarget')) {
    el('kcalTarget').textContent = (targetDelta > 0 ? '+' : '') + targetDelta;
    el('kcalTarget').style.color = isBulk ? 'var(--green)' : 'var(--accent)';
  }
  if (el('kcalTargetLabel')) {
    el('kcalTargetLabel').textContent = isBulk ? 'Superávit meta' : 'Déficit meta';
  }

  // ── Barra de progreso ────────────────────────────────────────────
  const progressPct = dailyTarget > 0 ? Math.min(100, Math.round((consumed / dailyTarget) * 100)) : 0;
  const isOver = consumed > dailyTarget;
  const barColor = isOver ? (isBulk ? 'var(--green)' : 'var(--yellow)') : progressPct >= 85 ? 'var(--yellow)' : 'var(--green)';
  if (el('deficitBar')) {
    el('deficitBar').style.width = progressPct + '%';
    el('deficitBar').style.background = barColor;
  }
  if (el('kcalTargetLbl')) el('kcalTargetLbl').textContent = dailyTarget + ' kcal';

  // ── Mensaje de estado personalizado por objetivo ─────────────────
  const msgEl = el('kcalStatusMsg');
  if (msgEl) {
    let msg = '', color = 'var(--text2)';
    if (consumed === 0) {
      msg = '🎯 Objetivo de hoy: <strong>' + dailyTarget + ' kcal</strong>';
      color = 'var(--text3)';
    } else if (isBulk) {
      if (remaining > 150) {
        msg = '🍽 Te faltan <strong>' + remaining + ' kcal</strong> para llegar a tu objetivo';
        color = 'var(--accent)';
      } else if (remaining >= -150) {
        msg = '✅ ¡Perfecto! Estás en tu objetivo de volumen';
        color = 'var(--green)';
      } else {
        msg = '💪 Superávit de <strong>' + Math.abs(remaining) + ' kcal</strong> — bien para ganar masa';
        color = 'var(--green)';
      }
    } else {
      if (remaining > 100) {
        msg = '🍽 Te faltan <strong>' + remaining + ' kcal</strong> para llegar a tu objetivo';
        color = 'var(--accent)';
      } else if (remaining >= -100) {
        msg = '✅ ¡Perfecto! Estás en tu objetivo de hoy';
        color = 'var(--green)';
      } else {
        msg = '⚠️ Excediste tu objetivo por <strong>' + Math.abs(remaining) + ' kcal</strong>';
        color = 'var(--yellow)';
      }
    }
    msgEl.innerHTML = '<div style="font-size:12px;color:' + color + ';text-align:center;padding:8px 0;line-height:1.5">' + msg + '</div>';
  }

  if (el('ouraKcalBadge')) el('ouraKcalBadge').style.display = hasOura ? 'block' : 'none';
  // Render 7-day macro history always after updating today's balance
  renderMacroHistory();
}
// ─── HISTORIAL DE ADHERENCIA MACROS 7 DÍAS ───────────────────────
function renderMacroHistory() {
  var container = document.getElementById('macroHistorySection');
  if (!container) return;
  var cfg = state.config || {};
  var targetKcal = cfg.kcal || cfg.tdee || 2000;
  var goalType = cfg.goal || 'cut';
  var isBulk = goalType === 'bulk' || goalType === 'lean_bulk';

  var days = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date(TODAY + 'T12:00:00');
    d.setDate(d.getDate() - i);
    var dateStr = d.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    var dayData = state[dateStr] || {};
    var foods = dayData.foods || [];
    var kcal = 0;
    foods.forEach(function(f) {
      kcal += (+f.prot||0)*4 + (+f.carb||0)*4 + (+f.fat||0)*9;
    });
    kcal = Math.round(kcal);
    var balance = foods.length > 0 ? kcal - targetKcal : null;
    var isToday = i === 0;
    var dayNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    days.push({ dayName: dayNames[d.getDay()], balance: balance, isToday: isToday });
  }

  // Escala máxima para las barras
  var maxAbs = 600;
  var BAR_HEIGHT = 36; // px mitad arriba / mitad abajo

  var daysHtml = days.map(function(d) {
    var isToday = d.isToday;
    var labelStr, labelColor, barUp, barDown, barColor;

    if (d.balance === null) {
      labelStr = '—'; labelColor = 'var(--bg4)';
      barUp = 0; barDown = 0; barColor = 'var(--bg4)';
    } else {
      var diff = d.balance;
      // Qué tan lejos está del objetivo (0 = perfecto, 600 = muy lejos)
      var distFromGoal = Math.abs(diff);
      // Verde si cerca del objetivo (<150 kcal), amarillo si moderado, rojo si lejos
      if (distFromGoal <= 150) {
        barColor = 'var(--green)';
      } else if (distFromGoal <= 350) {
        barColor = 'var(--yellow)';
      } else {
        barColor = 'var(--red)';
      }
      var pct = Math.min(100, Math.round(distFromGoal / maxAbs * 100));
      var barPx = Math.round(pct * BAR_HEIGHT / 100);
      barUp   = diff > 0 ? barPx : 0;  // superávit → barra arriba
      barDown = diff < 0 ? barPx : 0;  // déficit → barra abajo
      labelStr = (diff > 0 ? '+' : '') + diff;
      labelColor = barColor;
    }

    return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px">' +
      // Nombre del día
      '<div style="font-size:9px;color:' + (isToday ? 'var(--accent)' : 'var(--text3)') + ';font-weight:' + (isToday ? '700' : '400') + '">' + d.dayName + '</div>' +
      // Zona superior (superávit)
      '<div style="height:' + BAR_HEIGHT + 'px;width:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center">' +
        '<div style="width:8px;height:' + barUp + 'px;background:' + barColor + ';border-radius:3px 3px 0 0;transition:height 0.4s"></div>' +
      '</div>' +
      // Línea del 0
      '<div style="width:100%;height:1px;background:var(--border)"></div>' +
      // Zona inferior (déficit)
      '<div style="height:' + BAR_HEIGHT + 'px;width:100%;display:flex;flex-direction:column;justify-content:flex-start;align-items:center">' +
        '<div style="width:8px;height:' + barDown + 'px;background:' + barColor + ';border-radius:0 0 3px 3px;transition:height 0.4s"></div>' +
      '</div>' +
      // Valor numérico
      '<div style="font-size:9px;font-weight:700;color:' + labelColor + ';line-height:1;text-align:center">' + labelStr + '</div>' +
    '</div>';
  }).join('');

var goalLabel = isBulk ? 'Verde = cerca del superávit objetivo' : 'Verde = cerca del déficit objetivo';
  var hasAnyData = days.some(function(d) { return d.balance !== null; });

  if (!hasAnyData) {
    container.innerHTML =
      '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);text-align:center;padding:20px 0">' +
        '<div style="font-size:24px;margin-bottom:8px">📊</div>' +
        '<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px">Sin historial aún</div>' +
        '<div style="font-size:11px;color:var(--text3)">Empezá a cargar comidas para ver tu balance de los últimos 7 días</div>' +
      '</div>';
    return;
  }

  container.innerHTML =
    '<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
        '<div style="font-size:12px;font-weight:700;color:var(--text)">Balance últimos 7 días</div>' +
        '<div style="font-size:10px;color:var(--text3)">vs ' + targetKcal + ' kcal</div>' +
      '</div>' +
      '<div style="display:flex;gap:4px;align-items:stretch">' + daysHtml + '</div>' +
      '<div style="font-size:10px;color:var(--text3);margin-top:6px">' + goalLabel + '</div>' +
    '</div>';
}