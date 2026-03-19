// ─── V15 NAV: 5 tabs con sub-tabs en Nutrición ───────────────────

// Mapa de tab antigua → nueva tab + sub-tab opcional
// Permite que código existente que llame showPage('macros') siga funcionando
const PAGE_REDIRECT = {
  'macros':   { page: 'nutricion', sub: 'comida' },
  'kcal':     { page: 'nutricion', sub: 'balance' },
'supps':    { page: 'recuperacion', sub: 'suplementos' },
  'sleep':    { page: 'recuperacion', sub: 'sueno' },
  'water':    { page: 'recuperacion', sub: 'agua' },
'metrics':  { page: 'progreso', sub: 'metricas' },
  'calendar': { page: 'progreso', sub: 'calendario' },
}

function showPage(id, el) {
  // Reset scroll al cambiar de página
  var _contentEl = document.querySelector('.content');
  if (_contentEl) _contentEl.scrollTop = 0;

  // Resolver redirecciones
var redirect = PAGE_REDIRECT[id];
  if (redirect) {
    id = redirect.page;
    var _redirectSub = redirect.sub || null;
    var _redirectPage = id;
  }
document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));  // Si navegamos fuera de nutrición, resetear sub-tabs al default (comida)
// Si navegamos fuera de nutrición, resetear sub-tabs al default (comida)
// Si navegamos fuera de nutrición, resetear sub-tabs al default (comida)
  if (id !== 'nutricion') {
    document.querySelectorAll('#page-nutricion .v15-subpage').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('#page-nutricion .v15-subtab').forEach(t => t.classList.remove('active'));
    var defaultSub = document.getElementById('sub-nutricion-comida');
    var defaultBtn = document.getElementById('subtab-comida');
    if (defaultSub) defaultSub.classList.add('active');
    if (defaultBtn) defaultBtn.classList.add('active');
    // Vaciar el contenido del plan para que no se filtre visualmente a otras tabs
    var mealPlanEl = document.getElementById('mealPlanContent');
    if (mealPlanEl) mealPlanEl.innerHTML = '';
  }
  // Si navegamos fuera de recuperación, resetear sub-tabs al default (sueno)
if (id !== 'progreso') {
    document.querySelectorAll('#page-progreso .v15-subpage').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('#page-progreso .v15-subtab').forEach(t => t.classList.remove('active'));
    var defaultProgSub = document.getElementById('sub-progreso-metricas');
    var defaultProgBtn = document.getElementById('subtab-prog-metricas');
    if (defaultProgSub) defaultProgSub.classList.add('active');
    if (defaultProgBtn) defaultProgBtn.classList.add('active');
  }
  if (id !== 'recuperacion') {    document.querySelectorAll('#page-recuperacion .v15-subpage').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('#page-recuperacion .v15-subtab').forEach(t => t.classList.remove('active'));
    var defaultRecSub = document.getElementById('sub-recuperacion-sueno');
    var defaultRecBtn = document.getElementById('subtab-rec-sueno');
    if (defaultRecSub) defaultRecSub.classList.add('active');
    if (defaultRecBtn) defaultRecBtn.classList.add('active');
  }

var targetPage = document.getElementById('page-' + id);
  if (targetPage) targetPage.classList.add('active');

  if (typeof _redirectSub !== 'undefined' && _redirectSub) {
    var subBtn = document.getElementById('subtab-rec-' + _redirectSub) ||
                 document.getElementById('subtab-prog-' + _redirectSub) ||
                 document.getElementById('subtab-' + _redirectSub);
    if (subBtn) switchSubtab(_redirectPage, _redirectSub, subBtn);
  }

  // Activar el tab correcto
  if (el) {
    el.classList.add('active');
  } else {
    // Buscar el tab que corresponde a esta página
    var tabMap = {
      'home': 'tab-hoy',
      'nutricion': 'tab-nutricion',
      'training': 'tab-training',
      'recuperacion': 'tab-recuperacion',
      'progreso': 'tab-progreso'
    };
    var tabId = tabMap[id];
    if (tabId) {
      var tabEl = document.getElementById(tabId);
      if (tabEl) tabEl.classList.add('active');
    }
  }

  var contentEl = document.querySelector('.content');
  if (contentEl) contentEl.scrollTop = 0;

  // Re-render específicos al activar ciertas páginas
// Re-render específicos al activar ciertas páginas
// Re-render específicos al activar ciertas páginas
if (id === 'training') {
    setTimeout(function() {
      try {
        if (typeof renderTraining === 'function') renderTraining();
      } catch(e) {
        var c = document.getElementById('page-training');
        if (c) c.innerHTML = '<div class="empty"><div class="empty-icon">⚠️</div>Error al cargar el entrenamiento</div>';
      }
      var contentEl = document.querySelector('.content');
      if (contentEl) contentEl.scrollTop = 0;
    }, 60);
  }
// DESPUÉS
// DESPUÉS
if (id === 'progreso') {
    _syncProgresoContent('metricas');
  }
if (id === 'home') {
    _animateScoreIfChanged();
  }
  if (id === 'recuperacion') {
    _syncRecuperacionSleep();
    renderSuppsV15();
  }
}

// Sub-tabs dentro de una página
// Sub-tabs dentro de una página
function switchSubtab(pageId, subId, btn) {
  var pageEl = document.getElementById('page-' + pageId);
  if (!pageEl) return;
  pageEl.querySelectorAll('.v15-subtab').forEach(t => t.classList.remove('active'));
  pageEl.querySelectorAll('.v15-subpage').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  var subEl = document.getElementById('sub-' + pageId + '-' + subId);
  if (subEl) subEl.classList.add('active');
  // Render on demand cuando el sub-tab se vuelve visible
if (pageId === 'nutricion' && subId === 'plan' && typeof renderMealPlan === 'function') renderMealPlan();
  if (pageId === 'progreso' && subId === 'metricas')  _syncProgresoContent('metricas');
  if (pageId === 'progreso' && subId === 'calendario') _syncProgresoContent('calendario');
  if (pageId === 'recuperacion' && subId === 'sueno')       _syncRecuperacionSleep();
  if (pageId === 'recuperacion' && subId === 'suplementos') renderSuppsV15();
  if (pageId === 'recuperacion' && subId === 'agua')        _syncRecuperacionWater();
}

// ─── HOME METRIC CARDS → navegación ──────────────────────────────
function initHomeCardNav() {
  document.querySelectorAll('.day-metric-item[data-nav]').forEach(function(card) {
    card.addEventListener('click', function() {
      var target = card.getAttribute('data-nav');
      if (target && target !== 'home') showPage(target);
    });
  });
}

// ─── SYNC DE CONTENIDO COMPARTIDO ────────────────────────────────
// En lugar de duplicar el DOM, re-renderizamos en el contenedor de la nueva página
// usando los mismos render functions que ya existen.

function _syncProgresoContent(sub) {
  sub = sub || 'metricas';
  // Clonar contenido de page-metrics en progreso-metrics-content
  var srcMetrics = document.getElementById('page-metrics');
  var dstMetrics = document.getElementById('progreso-metrics-content');
  if (srcMetrics && dstMetrics) {
    // Renderizar primero (asegura datos frescos)
    if (typeof renderMetrics === 'function') renderMetrics();
    if (typeof renderMetricsPage === 'function') renderMetricsPage();
    // Clonar el innerHTML (read-only mirror)
      dstMetrics.innerHTML = srcMetrics.innerHTML;
    dstMetrics.querySelectorAll('[id]').forEach(function(el) {
      el.id = 'progreso_' + el.id;
    });
    dstMetrics.querySelectorAll('[for]').forEach(function(el) {
      el.setAttribute('for', 'progreso_' + el.getAttribute('for'));
    });
  }

  // Clonar contenido de page-calendar en progreso-calendar-content
if (sub !== 'calendario') return;
  // Clonar contenido de page-calendar en progreso-calendar-content
  var srcCal = document.getElementById('page-calendar');
  var dstCal = document.getElementById('progreso-calendar-content');
  if (srcCal && dstCal) {
    if (typeof renderCalendar === 'function') renderCalendar();
    dstCal.innerHTML = srcCal.innerHTML;
    // Re-attach event handlers del calendario (botones de nav mes)
    var prevBtn = dstCal.querySelector('[onclick*="calNav(-1)"]');
    var nextBtn = dstCal.querySelector('[onclick*="calNav(1)"]');
    if (prevBtn) prevBtn.onclick = function(){ calNav(-1); setTimeout(_syncProgresoContent, 100); };
    if (nextBtn) nextBtn.onclick = function(){ calNav(1); setTimeout(_syncProgresoContent, 100); };
  }
}

function _syncRecuperacionContent() {
  _syncRecuperacionSleep();
  _syncRecuperacionWater();
}
function _animateScoreIfChanged() {
  var scoreEl  = document.getElementById('dayScore');
  var circleEl = document.getElementById('dayScoreDash');
  if (!scoreEl || !circleEl) return;

  // Guardar score anterior ANTES de que renderHome lo sobreescriba
  var prevScore = (state._prevScore !== null && state._prevScore !== undefined)
    ? state._prevScore : null;

  // Calcular nuevo score directamente (sin tocar el DOM todavía)
  var newScore = 0;
  try {
    newScore = (typeof calculateDayScore === 'function') ? calculateDayScore().overall : 0;
  } catch(e) { newScore = 0; }

  // Actualizar _prevScore para la próxima navegación
  state._prevScore = newScore;

  // Dejar que renderHome pinte el DOM normalmente
  if (typeof renderHome === 'function') renderHome();

  // Si no hay score previo (primera carga), no animar
  if (prevScore === null || prevScore === newScore) return;

  var startScore = prevScore;
  var endScore   = newScore;
  var duration   = 850;
  var startTime  = null;
  var circ       = parseFloat(circleEl.getAttribute('stroke-dasharray')) || 471;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function step(ts) {
    if (!startTime) startTime = ts;
    var elapsed  = ts - startTime;
    var progress = Math.min(elapsed / duration, 1);
    var eased    = easeOut(progress);
    var current  = Math.round(startScore + (endScore - startScore) * eased);

    scoreEl.textContent = current;
    scoreEl.style.color = endScore >= 85 ? 'var(--green)' : endScore >= 70 ? 'var(--accent)' : endScore >= 50 ? 'var(--yellow)' : 'var(--red)';

    var pct    = Math.max(0, Math.min(100, current)) / 100;
    circleEl.style.strokeDashoffset = circ * (1 - pct);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      scoreEl.textContent = endScore;
      circleEl.style.strokeDashoffset = circ * (1 - Math.max(0, Math.min(100, endScore)) / 100);
    }
  }

  requestAnimationFrame(step);
}
function _syncRecuperacionSleep_OLD_UNUSED() {
  var srcSleep = document.getElementById('page-sleep');
  var dstSleep = document.getElementById('recuperacion-sleep-content');
  if (!srcSleep || !dstSleep) return;

  var hasWearable = !!(
    (typeof isWearableConnected === 'function' && isWearableConnected('oura')) ||
    (state[TODAY] && state[TODAY].sleep && state[TODAY].sleep.readiness)
  );

  // Renderizar en el source primero
  if (typeof renderSleep === 'function') renderSleep();

  // Clonar al destino
  dstSleep.innerHTML = srcSleep.innerHTML;

  // Quitar sufijo de IDs clonados para que renderSleep() los encuentre
  // y en cambio prefixar los del source para que no colisionen
  dstSleep.querySelectorAll('[id]').forEach(function(el) {
    el.id = 'rec_' + el.id;
  });
  srcSleep.querySelectorAll('[id]').forEach(function(el) {
    if (el.id.indexOf('src_') !== 0) el.id = 'src_' + el.id;
  });

  // Ahora renderSleep no tiene IDs destino — re-apuntar manualmente
  var pairs = [
    ['readinessDash','readinessDash'],['readinessNum','readinessNum'],['readinessLabel','readinessLabel'],
    ['sleepHours','sleepHours'],['sleepEff','sleepEff'],['sleepDeep','sleepDeep'],['sleepHRV','sleepHRV'],
    ['manualSleepCard','manualSleepCard'],['syncBtn','syncBtn']
  ];
  pairs.forEach(function(p) {
    var src = document.getElementById('src_' + p[0]);
    var dst = document.getElementById('rec_' + p[1]);
    if (src && dst) dst.innerHTML = src.innerHTML;
  });

  // Mostrar/ocultar card manual según wearable
  var manualCard = document.getElementById('rec_manualSleepCard');
  if (manualCard) manualCard.style.display = hasWearable ? 'none' : '';

  // Mostrar/ocultar card de Oura sync
  dstSleep.querySelectorAll('.card').forEach(function(card) {
    if (card.innerHTML.indexOf('syncOura') >= 0 || card.innerHTML.indexOf('Sync Oura') >= 0) {
      card.style.display = hasWearable ? '' : 'none';
    }
  });

  // Re-renderizar sobre los IDs rec_ del destino
  if (typeof renderSleep === 'function') {
    var _origId = Element.prototype.__defineGetter__;
    // Swap temporal: apuntar getElementById al destino para los IDs de sueño
    var _get = document.getElementById.bind(document);
    var sleepIds = ['readinessDash','readinessNum','readinessLabel',
                    'sleepHours','sleepEff','sleepDeep','sleepHRV',
                    'manSleepHours','manSleepQuality','manSleepDeep','manSleepHRV',
                    'manualSleepCard'];
    var _origGetById = document.getElementById;
    document.getElementById = function(id) {
      if (sleepIds.indexOf(id) >= 0) {
        return _origGetById.call(document, 'rec_' + id) || _origGetById.call(document, id);
      }
      return _origGetById.call(document, id);
    };
    renderSleep();
    document.getElementById = _origGetById;
  }

  // Re-conectar botón sync
  var syncBtn = document.getElementById('rec_syncBtn');
  if (syncBtn) syncBtn.onclick = function() { if (typeof syncOura === 'function') syncOura(); };
}
function _syncRecuperacionSleep() {
  var dst = document.getElementById('recuperacion-sleep-content');
  if (!dst) return;

var hasWearable = typeof isWearableConnected === 'function' && 
  (isWearableConnected('oura') || isWearableConnected('fitbit'));
  dst.innerHTML = [
    // Card manual — oculto si hay wearable
    '<div class="card" id="rec_manualSleepCard" style="' + (hasWearable ? 'display:none' : '') + '">',
      '<div class="card-title"><span>✏️</span> Cargar manualmente</div>',
      '<div style="font-size:11px;color:var(--text3);margin-bottom:14px">Si no tenés wearable, ingresá tus datos acá.</div>',
      '<div style="display:flex;gap:8px;margin-bottom:14px">',
        '<div style="flex:1"><label class="input-label">Horas de sueño</label>',
        '<input class="inp" id="rec_manSleepHours" type="number" step="0.5" placeholder="7.5"></div>',
        '<div style="flex:1"><label class="input-label">Calidad (1–10)</label>',
        '<input class="inp" id="rec_manSleepQuality" type="number" step="1" min="1" max="10" placeholder="8"></div>',
      '</div>',
      '<button class="btn btn-primary" style="width:100%" onclick="saveManualSleep()">Guardar sueño</button>',
    '</div>',

    // Card Oura — visible siempre, datos reales si hay wearable
'<div class="card" id="rec_ouraSleepCard" style="' + (!hasWearable ? 'display:none' : 'margin-bottom:12px') + '">',
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">',
        '<div class="card-title" style="margin-bottom:0"><span>🌙</span> Sueño de hoy</div>',
        (hasWearable ? '<button onclick="syncOura()" class="btn btn-sm" style="background:var(--bg3);border:1px solid var(--border);color:var(--accent);font-size:11px">↻ Sync Oura</button>' : ''),
      '</div>',
      '<div style="display:flex;align-items:center;gap:16px;margin-bottom:12px">',
        '<div style="flex-shrink:0;width:80px;height:80px;position:relative">',
          '<svg width="80" height="80" viewBox="0 0 100 100">',
            '<circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg4)" stroke-width="8"/>',
            '<circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent)" stroke-width="8"',
            ' stroke-dasharray="251.2" id="rec_readinessDash" stroke-dashoffset="251.2" stroke-linecap="round"/>',
          '</svg>',
          '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700" id="rec_readinessNum">—</div>',
        '</div>',
        '<div>',
          '<div style="font-size:12px;font-weight:700;color:var(--text)" id="rec_readinessLabel">' + (hasWearable ? 'Cargando…' : 'Sin datos de Oura') + '</div>',
          '<div style="font-size:11px;color:var(--text3);margin-top:3px">' + (hasWearable ? '' : 'Conectá Oura o cargá manualmente') + '</div>',
        '</div>',
      '</div>',
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">',
        '<div class="sleep-card"><div class="sleep-icon">😴</div><div class="sleep-label">Horas</div><div class="sleep-val" id="rec_sleepHours">—</div></div>',
        '<div class="sleep-card"><div class="sleep-icon">📊</div><div class="sleep-label">Eficiencia</div><div class="sleep-val" id="rec_sleepEff">—</div></div>',
        '<div class="sleep-card"><div class="sleep-icon">🌊</div><div class="sleep-label">Profundo</div><div class="sleep-val" id="rec_sleepDeep">—</div></div>',
        '<div class="sleep-card"><div class="sleep-icon">💓</div><div class="sleep-label">HRV</div><div class="sleep-val" id="rec_sleepHRV">—</div></div>',
      '</div>',
    '</div>',

    // Wearables card
    '<div class="card" style="border:1px solid var(--border);background:var(--bg3)">',
      '<div style="margin-bottom:14px">',
        '<div class="card-title" style="margin-bottom:4px"><span>⌚</span> Conectar wearable</div>',
        '<div style="font-size:12px;color:var(--text3)">Conectá tu wearable y FitTrack sincroniza automáticamente.</div>',
      '</div>',
      '<div class="wearables-card-container"></div>',
    '</div>'
  ].join('');

  // Poblar datos de sueño desde state
  var s = (state[TODAY] && state[TODAY].sleep) || {};
  var r = s.readiness;
  var dash = document.getElementById('rec_readinessDash');
  var num  = document.getElementById('rec_readinessNum');
  var lbl  = document.getElementById('rec_readinessLabel');
  if (r && dash) {
    dash.style.strokeDashoffset = 251.2 - (251.2 * r / 100);
    var col = r >= 70 ? 'var(--green)' : r >= 60 ? 'var(--yellow)' : 'var(--red)';
    dash.style.stroke = col;
    if (num) { num.textContent = r; num.style.color = col; }
    if (lbl) { lbl.textContent = r >= 70 ? 'BUENA — Entrenar normal' : r >= 60 ? 'MODERADA — Sin forzar' : 'BAJA — Bajar volumen'; lbl.style.color = col; }
  }
  var fill = function(id, val) { var el = document.getElementById('rec_' + id); if (el) el.textContent = val || '—'; };
  fill('sleepHours', s.hours ? s.hours + 'h' : null);
  fill('sleepEff',   s.efficiency ? s.efficiency + '%' : null);
  fill('sleepDeep',  s.deep ? s.deep + 'h' : null);
  fill('sleepHRV',   s.hrv ? s.hrv + ' ms' : null);

  // Pre-llenar inputs manuales si hay datos guardados
  var mh = document.getElementById('rec_manSleepHours');
  var mq = document.getElementById('rec_manSleepQuality');
  if (mh && s.manHours)   mh.value = s.manHours;
  if (mq && s.manQuality) mq.value = s.manQuality;

  // Parchear saveManualSleep para leer los inputs rec_
  window.saveManualSleep = function() {
    var h = parseFloat(document.getElementById('rec_manSleepHours')?.value) || null;
    var q = parseInt(document.getElementById('rec_manSleepQuality')?.value) || null;
    if (!h && !q) { showToast('⚠ Ingresá al menos las horas'); return; }
    if (!state[TODAY].sleep) state[TODAY].sleep = {};
    state[TODAY].sleep.manHours   = h;
    state[TODAY].sleep.manQuality = q;
    saveState(state);
    _syncRecuperacionSleep();
    showToast('🌙 Sueño guardado');
  };

  // Renderizar wearables card dentro del destino
  if (typeof renderWearablesCard === 'function') renderWearablesCard();
}
function _syncRecuperacionWater() {
  var srcWater = document.getElementById('page-water');
  var dstWater = document.getElementById('recuperacion-water-content');
  if (srcWater && dstWater) {
    if (typeof renderWater === 'function') renderWater(false);
    dstWater.innerHTML = srcWater.innerHTML;

    // Patch dynamic water goal — use querySelector('#id') which is reliable on cloned DOM
    var goal = typeof getWaterGoal === 'function' ? getWaterGoal() : 3000;
    var ml   = (state && state[TODAY] && state[TODAY].water) || 0;

    var goalLabelEl = dstWater.querySelector('#waterGoalLabel');
    if (goalLabelEl) {
      goalLabelEl.textContent = '💧 OBJETIVO DIARIO: ' + goal + 'ML';
    }

    var remEl = dstWater.querySelector('#waterRemainingNum');
    if (remEl) {
      remEl.textContent = Math.max(0, goal - ml);
    }    // Re-bind el glass click que usa addWater()
    dstWater.querySelectorAll('[onclick*="addWater"]').forEach(function(el) {
      var match = el.getAttribute('onclick') && el.getAttribute('onclick').match(/addWater\((\d+)\)/);
      if (match) {
        var ml = parseInt(match[1]);
        el.onclick = function() { addWater(ml); setTimeout(function(){ _syncRecuperacionWater(); }, 80); };
      }
    });
  }
}

// ─── SUPLEMENTOS DUPLICADOS EN RECUPERACIÓN ──────────────────────
// Renderiza los suplementos en los IDs del panel de recuperación
function renderSuppsV15() {
  var todaySupps = getDynamicSupps().filter(function(s) { return isSuppActiveToday(s); });
  var taken = state[TODAY].supps || {};
  var doneCount = todaySupps.filter(function(s) { return taken[s.id]; }).length;

  var doneEl = document.getElementById('suppDoneCount2');
  var totEl  = document.getElementById('suppTotal2');
  var pctEl  = document.getElementById('suppPct2');
  var barEl  = document.getElementById('suppBar2');
  if (doneEl) doneEl.textContent = doneCount;
  if (totEl)  totEl.textContent  = todaySupps.length;
  if (pctEl)  pctEl.textContent  = todaySupps.length > 0 ? Math.round(doneCount/todaySupps.length*100) + '%' : '0%';
  if (barEl)  barEl.style.width  = todaySupps.length > 0 ? Math.round(doneCount/todaySupps.length*100) + '%' : '0%';

  var groups = {
    morning: document.getElementById('suppsMorning2'),
    noon:    document.getElementById('suppsNoon2'),
    night:   document.getElementById('suppsNight2'),
  };
  Object.values(groups).forEach(function(g){ if (g) g.innerHTML = ''; });

  var sectionMorning2 = document.getElementById('suppsSectionMorning2');
  var sectionNoon2    = document.getElementById('suppsSectionNoon2');
  var sectionNight2   = document.getElementById('suppsSectionNight2');

 todaySupps.forEach(function(s) {
    var isDone = taken[s.id];
    var div = document.createElement('div');
div.className = 'supp-item' + (isDone ? ' supp-done' : '');
    div.style.cursor = 'pointer';
   div.onclick = (function(suppId) {
      return function() {
        var wasUntaken = !(state[TODAY].supps && state[TODAY].supps[suppId]);
        toggleSupp(suppId);
        renderSuppsV15();
        if (wasUntaken && typeof showActionFeedback === 'function') showActionFeedback('habit');
      };
    })(s.id);
    div.innerHTML =
      '<div class="supp-check' + (isDone ? ' done' : '') + '" style="pointer-events:none">' +
        (isDone ? '✓' : '') +
      '</div>' +
      '<div class="supp-info" style="pointer-events:none"><div class="supp-name">' + s.name + '</div>' +
      (s.dose ? '<div class="supp-dose">' + s.dose + '</div>' : '') + '</div>';
    var group = groups[s.time] || groups.morning;
    if (group) group.appendChild(div);
  });

  if (sectionMorning2) sectionMorning2.style.display = groups.morning && groups.morning.children.length > 0 ? '' : 'none';
  if (sectionNoon2)    sectionNoon2.style.display    = groups.noon    && groups.noon.children.length    > 0 ? '' : 'none';
  if (sectionNight2)   sectionNight2.style.display   = groups.night   && groups.night.children.length   > 0 ? '' : 'none';
}

// ─── INIT ─────────────────────────────────────────────────────────
function init() {
  // Prevenir zoom accidental en double-tap en iOS
  var lastTap = 0;
  document.addEventListener('touchend', function(e) {
    var now = Date.now();
    if (now - lastTap < 300 && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
    lastTap = now;
  }, { passive: false });

  applyTheme(state.config && state.config.theme ? state.config.theme : currentTheme);
  var savedLayout = (state.config && state.config.layout) || localStorage.getItem('fittrack_layout') || 'terra';
  if (savedLayout !== 'dark') applyLayout(savedLayout);
  initFont();
  initHomeCardNav();
  var badge = document.getElementById('greetBadge');
  if (badge) badge.textContent = '👋 Hola ' + (state.config && state.config.name ? state.config.name : '') + '!';
  updateHeader();
  renderDailyMotiv();
  renderHome();
  renderMeals();
  renderQuickFoods();
  renderTraining();
  renderSupps();
  renderMetrics();
  renderMetricsPage();
  renderSleep();
  renderKcal();
  renderActivityGrid();
  renderWater(false);
  renderGoalBars();
  populateExSelect();
renderCalendar();
  checkDeloadWeek();
  syncOura();
  if (!state.wearables) state.wearables = {};
  renderWearablesCard();
  _resumeSessionTimerIfNeeded();
  // Re-render training después de que el DOM esté completamente montado

}

function updateHeader() {
  const d = new Date();
  const days = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  document.getElementById('headerDate').textContent = `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
  const td = state[TODAY].trainDay;
  document.getElementById('dayBadge').textContent = td === 0 ? 'DESCANSO' : `DIA ${td}`;
}
