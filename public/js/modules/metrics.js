// ─── MÉTRICAS ADICIONALES DINÁMICAS ─────────────────────────────
// Las métricas activas se guardan en state.config.activeMetrics = ['bf','waist',...]
// Al abrir el picker el usuario activa/desactiva métricas individualmente.

var _METRIC_PICKER_DEFS = [
  { key:'bf',    emoji:'🔥', label:'Grasa corporal', desc:'% de grasa en tu cuerpo',   unit:'%',  placeholder:'18.0', inp:'inpBFReal' },
  { key:'muscle', emoji:'💎', label:'Masa muscular',   desc:'% de músculo estimado',           unit:'%',  placeholder:'40.0', inp:'inpMuscle'  },
  { key:'waist', emoji:'📏', label:'Cintura',         desc:'Medida a la altura del ombligo', unit:'cm', placeholder:'80',   inp:'inpWaist'  },
  { key:'chest', emoji:'💪', label:'Pecho',           desc:'Contorno de pecho',         unit:'cm', placeholder:'95',   inp:'inpChest'  },
  { key:'arms',  emoji:'💪', label:'Brazos',          desc:'Bíceps contraído',           unit:'cm', placeholder:'35',   inp:'inpArms'   },
  { key:'hips',  emoji:'📐', label:'Cadera',          desc:'Contorno de cadera',         unit:'cm', placeholder:'95',   inp:'inpHips'   },
];

function _getActiveMetrics() {
  return (state.config && state.config.activeMetrics) || [];
}

function _setActiveMetrics(arr) {
  if (!state.config) state.config = {};
  state.config.activeMetrics = arr;
  saveState(state);
}

function renderActiveMetricFields() {
  var container = document.getElementById('metricsActiveFields');
  if (!container) return;
  var active = _getActiveMetrics();
  container.innerHTML = active.map(function(key) {
    var def = _METRIC_PICKER_DEFS.find(function(d){ return d.key === key; });
    if (!def) return '';
    return '<div style="flex:1;min-width:calc(50% - 4px)">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
      + '<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px">' + def.label + ' (' + def.unit + ')</div>'
      + '<button onclick="removeActiveMetric(\'' + def.key + '\')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px;padding:0;line-height:1">✕</button>'
      + '</div>'
      + '<input class="inp" id="' + def.inp + '_visible" type="number" step="0.1" placeholder="' + def.placeholder + '"'
      + ' oninput="document.getElementById(\'' + def.inp + '\').value=this.value">'
      + '</div>';
  }).join('');
}

function removeActiveMetric(key) {
  var active = _getActiveMetrics().filter(function(k){ return k !== key; });
  _setActiveMetrics(active);
  var def = _METRIC_PICKER_DEFS.find(function(d){ return d.key === key; });
  if (def) { var el = document.getElementById(def.inp); if (el) el.value = ''; }
  renderMetricsPage();
  if (typeof _syncProgresoContent === 'function') _syncProgresoContent();
}

function openMetricPicker() {
  var active = _getActiveMetrics();
  var existing = document.getElementById('metricPickerSheet');
  if (existing) existing.remove();

  var cards = _METRIC_PICKER_DEFS.map(function(def) {
    var isActive = active.indexOf(def.key) >= 0;
    var bg     = isActive ? 'rgba(77,138,255,0.12)' : 'var(--bg3)';
    var border = isActive ? '1.5px solid var(--accent)' : '1.5px solid var(--border)';
    var checkHtml = isActive
      ? '<div style="width:20px;height:20px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0">✓</div>'
      : '<div style="width:20px;height:20px;border-radius:50%;border:1.5px solid var(--border);flex-shrink:0"></div>';
    return '<div onclick="toggleMetricPick(\'' + def.key + '\')" id="mpChip_' + def.key + '"'
      + ' style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;border:' + border + ';background:' + bg + ';cursor:pointer">'
      + '<div style="font-size:24px;flex-shrink:0">' + def.emoji + '</div>'
      + '<div style="flex:1;min-width:0">'
        + '<div style="font-size:13px;font-weight:700;color:var(--text)">' + def.label + ' <span style="font-size:11px;color:var(--text3);font-weight:400">(' + def.unit + ')</span></div>'
        + '<div style="font-size:11px;color:var(--text3);margin-top:1px">' + def.desc + '</div>'
      + '</div>'
      + checkHtml
      + '</div>';
  }).join('');

var sheet = document.createElement('div');
  sheet.id = 'metricPickerSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px;width:100%;max-width:480px;margin:0 auto;max-height:85vh;overflow-y:auto">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
    + '<div style="font-size:14px;font-weight:700;color:var(--text)">Métricas corporales</div>'
    + '<button onclick="document.getElementById(\'metricPickerSheet\').remove()" style="background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;padding:0">✕</button>'
    + '</div>'
    + '<div style="font-size:12px;color:var(--text3);margin-bottom:16px">Seleccioná las que querés registrar junto con tu peso.</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">' + cards + '</div>'
    + '<button onclick="document.getElementById(\'metricPickerSheet\').remove();openAddCustomMetric()" style="width:100%;background:var(--bg3);border:1.5px dashed var(--border);border-radius:12px;padding:12px;color:var(--text2);font-size:13px;cursor:pointer;margin-bottom:12px">＋ Agregar métrica personalizada</button>'
    + '<button class="btn btn-primary" style="width:100%" onclick="document.getElementById(\'metricPickerSheet\').remove();renderMetricsPage();if(typeof _syncProgresoContent===\'function\')_syncProgresoContent()">Listo</button>'
    + '</div>';
  sheet.addEventListener('click', function(e){ if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

function toggleMetricPick(key) {
  var active = _getActiveMetrics();
  var idx = active.indexOf(key);
  var wasInactive = idx < 0;

  if (idx >= 0) {
    active.splice(idx, 1);
  } else {
    active.push(key);
  }
  _setActiveMetrics(active);
  renderMetricsPage();
  if (typeof _syncProgresoContent === 'function') _syncProgresoContent();

  // Update card style in picker
  var chip = document.getElementById('mpChip_' + key);
  if (chip) {
    var isNowActive = active.indexOf(key) >= 0;
    chip.style.background = isNowActive ? 'rgba(77,138,255,0.12)' : 'var(--bg3)';
    chip.style.border = isNowActive ? '1.5px solid var(--accent)' : '1.5px solid var(--border)';
    var check = chip.lastElementChild;
    if (check) {
      check.style.cssText = isNowActive
        ? 'width:20px;height:20px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:11px;flex-shrink:0'
        : 'width:20px;height:20px;border-radius:50%;border:1.5px solid var(--border);flex-shrink:0';
      check.textContent = isNowActive ? '\u2713' : '';
    }
  }

  // Si el usuario ACTIVÓ la métrica, ofrecer poner objetivo ahora
  if (wasInactive && active.indexOf(key) >= 0) {
    _openGoalOnActivate(key);
  }
}

function _openGoalOnActivate(key) {
  var def = _METRIC_PICKER_DEFS.find(function(d){ return d.key === key; });
  if (!def) {
    var cm = (state.customMetrics||[]).find(function(c){ return 'custom_'+c.id === key; });
    if (cm) def = { key: key, label: cm.name, unit: cm.unit, placeholder: '0' };
  }
  if (!def) return;

  var existing = document.getElementById('metricGoalOnActivate');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'metricGoalOnActivate';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10001;display:flex;align-items:flex-end';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:480px;margin:0 auto">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
        '<div style="font-size:14px;font-weight:700;color:var(--text)">🎯 Meta para ' + def.label + '</div>' +
        '<button onclick="document.getElementById(\'metricGoalOnActivate\').remove()" style="background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;padding:0">✕</button>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--text3);margin-bottom:16px">¿Cuál es tu objetivo en ' + def.unit + '? Podés saltear esto y definirlo después.</div>' +
      '<input id="goalOnActivateInput" class="inp" type="number" step="0.1" placeholder="Ej: ' + (def.placeholder || '0') + '" style="margin-bottom:14px">' +
      '<div style="display:flex;gap:8px">' +
        '<button class="btn btn-ghost" style="flex:1" onclick="document.getElementById(\'metricGoalOnActivate\').remove()">Saltar →</button>' +
        '<button class="btn btn-primary" style="flex:2" onclick="_saveGoalOnActivate(\'' + key + '\')">Guardar meta</button>' +
      '</div>' +
    '</div>';
  sheet.addEventListener('click', function(e){ if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
  setTimeout(function(){ var inp = document.getElementById('goalOnActivateInput'); if(inp) inp.focus(); }, 200);
}

function _saveGoalOnActivate(key) {
  var inp = document.getElementById('goalOnActivateInput');
  var val = inp ? parseFloat(inp.value) : NaN;
  if (isNaN(val)) {
    // Si está vacío, simplemente cerrar (equivale a saltar)
    document.getElementById('metricGoalOnActivate').remove();
    return;
  }
  if (!state.config) state.config = {};
  if (!state.config.metricGoals) state.config.metricGoals = {};
  state.config.metricGoals[key] = val;
  saveState(state);
  document.getElementById('metricGoalOnActivate').remove();
  _renderMetricProgressBars();
  if (typeof _syncProgresoContent === 'function') _syncProgresoContent();
  showToast('🎯 Meta guardada');
}
window._saveGoalOnActivate = _saveGoalOnActivate;
window._openGoalOnActivate = _openGoalOnActivate;

// Mantener compatibilidad con código que llama toggleOptionalMetrics
function toggleOptionalMetrics() { openMetricPicker(); }

// Exponer funciones al scope global para que los onclick en HTML generado funcionen
window.removeActiveMetric       = removeActiveMetric;
window.openMetricPicker         = openMetricPicker;
window.toggleMetricPick         = toggleMetricPick;
window.toggleOptionalMetrics    = toggleOptionalMetrics;
window.renderActiveMetricFields = renderActiveMetricFields;
window.selectUnifiedMetric      = selectUnifiedMetric;
window.selectMetricRange        = selectMetricRange;
window.openAddCustomMetric      = openAddCustomMetric;
window.closeAddCustomMetric     = closeAddCustomMetric;
window.saveCustomMetric         = saveCustomMetric;
window.deleteCustomMetric       = deleteCustomMetric;
window.openMetricGoalModal      = openMetricGoalModal;
window.saveMetricGoal           = saveMetricGoal;
window.clearMetricGoal          = clearMetricGoal;
// ─── METRICS ─────────────────────────────────────────────────────
function saveMetrics() {
  const wEl = document.getElementById('progreso_inpWeight') || document.getElementById('inpWeight');
  const w = wEl ? wEl.value.trim() : '';
  const weight = parseFloat(w);
// Verificar si hay al menos alguna métrica con valor
 var _hasOtherMetric = false;
  var _activeKeys = _getActiveMetrics();
  _activeKeys.forEach(function(key) {
    var def = _METRIC_PICKER_DEFS.find(function(d){ return d.key === key; });
    if (def) {
      var elV = document.getElementById(def.inp + '_visible');
      var elH = document.getElementById(def.inp);
      if ((elV && elV.value) || (elH && elH.value)) _hasOtherMetric = true;
    }
  });
  (state.customMetrics || []).forEach(function(cm) {
    var el2 = document.getElementById('inpCustom_' + cm.id); if (el2 && el2.value) _hasOtherMetric = true;
  });
if ((w === '' || isNaN(weight) || weight <= 0) && !_hasOtherMetric) { showToast('⚠ Ingresá al menos una métrica'); return; }
  if (!isNaN(weight) && weight < 0) { showToast('⚠ El peso no puede ser negativo'); return; }  // Campos adicionales visibles
  const _v = id => { const el = document.getElementById(id); return el ? (+el.value || null) : null; };
  const entry = {
    date:   TODAY,
weight: (w !== '' && !isNaN(weight) && weight > 0) ? Math.max(0, weight) : null,bf:     _v('inpBFReal'),
    muscle: _v('inpMuscle'),
    // nuevos campos corporales
    waist:  _v('inpWaist'),
    chest:  _v('inpChest'),
    arms:   _v('inpArms'),
    hips:   _v('inpHips'),
  };

  // Métricas personalizadas
  const customs = state.customMetrics || [];
  customs.forEach(function(cm) {
    const el = document.getElementById('inpCustom_' + cm.id);
    if (el && el.value) entry['custom_' + cm.id] = +el.value || null;
  });

  // Sin límite de entradas — las métricas ocupan ~50 bytes por entrada
  state.metricsHistory.unshift(entry);
  saveState(state);

  // Limpiar campos (incluye los visibles del picker)
['inpWeight','inpBFReal','inpMuscle','inpWaist','inpChest','inpArms','inpHips',
   'inpBFReal_visible','inpMuscle_visible','inpWaist_visible','inpChest_visible','inpArms_visible','inpHips_visible'
  ].forEach(function(id) {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  customs.forEach(function(cm) {
    const el = document.getElementById('inpCustom_' + cm.id); if (el) el.value = '';
  });

renderMetrics();
  renderGoalBars();
  renderWeightGoalBar();
  renderMetricsPage();
  renderUnifiedChart();
  if (typeof _syncProgresoContent === 'function') _syncProgresoContent();
showToast('⚖️ ¡Medición guardada!');
  celebrate('weight');
  if (typeof showActionFeedback === 'function') showActionFeedback('habit');
  _checkWeightGoalReached();
}

function renderMetrics() {
  const hist = state.metricsHistory || [];
  const latest = hist[0];
  const prev = hist[1];

  if (latest) {
    document.getElementById('metricWeight').textContent = latest.weight || '—';
    document.getElementById('metricBF').textContent = latest.bf || '—';
    document.getElementById('metricMuscle').textContent = latest.muscle || '—';

    if (prev && latest.weight && prev.weight) {
      const diff = (latest.weight - prev.weight).toFixed(1);
      const el = document.getElementById('weightChange');
      el.textContent = (diff > 0 ? '▲ +' : '▼ ') + diff + ' kg';
      el.className = 'metric-change ' + (diff > 0 ? 'up' : 'down');
    }
    if (prev && latest.bf && prev.bf) {
      const diff = (latest.bf - prev.bf).toFixed(1);
      const el = document.getElementById('bfChange');
      el.textContent = (diff > 0 ? '▲ +' : '▼ ') + diff + '%';
      el.className = 'metric-change ' + (diff > 0 ? 'up' : 'down');
    }
  }

  renderBodyChart();
  renderWeightGoalBar();
}

// ─── EXERCISE HISTORY ────────────────────────────────────────────
function saveExerciseHistory(day, exIdx, sets) {
  const ex = getConfigTraining()?.exercises[exIdx];
  if (!ex) return;
  const key = ex.name;
  if (!state.exerciseHistory[key]) state.exerciseHistory[key] = [];
  if (state.exerciseHistory[key].find(h => h.date === TODAY)) return;
  const kgVals = sets.map(s => parseFloat(s.kg)).filter(v => !isNaN(v) && v > 0);
  const repsVals = sets.map(s => parseFloat(s.reps)).filter(v => !isNaN(v) && v > 0);
  if (kgVals.length === 0) return;
  const maxKg = Math.max(...kgVals);
  const avgReps = repsVals.length ? Math.round(repsVals.reduce((a,b)=>a+b,0)/repsVals.length) : null;
  const oneRM = avgReps ? Math.round(maxKg * (1 + avgReps / 30)) : maxKg;
  // Save individual sets too so we can show them as placeholders next session
  const setsLog = sets.map(s => ({ kg: s.kg || '', reps: s.reps || '' }));
  state.exerciseHistory[key].unshift({ date:TODAY, maxKg, avgReps, oneRM, sets:sets.length, setsLog });
  if (state.exerciseHistory[key].length > 40) state.exerciseHistory[key] = state.exerciseHistory[key].slice(0,40);
  saveState(state);
}

function findExByName(name) {
  for (const d of Object.values(TRAINING)) {
    const ex = d.exercises.find(e => e.name === name);
    if (ex) return ex;
  }
  return null;
}

// ─── SUGGESTIONS ─────────────────────────────────────────────────

// ─── STRENGTH CHART ───────────────────────────────────────────────
function populateExSelect() {
  const sel = document.getElementById('exSelect');
  if (!sel) return;
  const hist = state.exerciseHistory || {};
  const allEx = [];
  Object.values(TRAINING).forEach(d => d.exercises.forEach(e => allEx.push(e.name)));
  sel.innerHTML = '<option value="">— Seleccionar ejercicio —</option>' +
    [...new Set(allEx)].map(name => {
      const hasData = hist[name] && hist[name].length > 0;
      return '<option value="' + name + '">' + (hasData ? '📊 ' : '') + name + '</option>';
    }).join('');
}

// DESPUÉS
function drawLineChart(svgId, data, color, onPointClick) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  if (data.length < 2) {
    svg.innerHTML = '<text x="180" y="85" text-anchor="middle" fill="var(--text3)" font-size="12" font-family="DM Sans,sans-serif">Sin suficientes datos aún</text>';
    return;
  }
  const W=360, H=160, pL=38, pR=10, pT=14, pB=26;
  const vals = data.map(d=>d.val);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const px = i => pL + (i/(data.length-1))*(W-pL-pR);
  const py = v => pT + (1-(v-minV)/range)*(H-pT-pB);
  let html = '';
  [0, 0.5, 1].forEach(t => {
    const y = pT + t*(H-pT-pB);
    const v = (maxV - t*range).toFixed(1);
    html += '<line class="chart-grid" x1="' + pL + '" x2="' + (W-pR) + '" y1="' + y + '" y2="' + y + '"/>';
    html += '<text class="chart-label-y" x="' + (pL-4) + '" y="' + (y+3) + '">' + v + '</text>';
  });
  const aPath = 'M' + px(0) + ',' + py(data[0].val) + ' ' +
    data.map((d,i)=>'L'+px(i)+','+py(d.val)).join(' ') +
    ' L'+px(data.length-1)+','+(H-pB)+' L'+px(0)+','+(H-pB)+' Z';
  html += '<path d="' + aPath + '" fill="' + color + '" class="chart-area"/>';
  html += '<path d="M' + px(0) + ',' + py(data[0].val) + ' ' +
    data.map((d,i)=>'L'+px(i)+','+py(d.val)).join(' ') +
    '" class="chart-line" stroke="' + color + '"/>';
  data.forEach((d,i) => {
    const x=px(i), y=py(d.val);
    const clickable = onPointClick ? ' style="cursor:pointer"' : '';
    const dataAttr  = onPointClick && d.date ? ' data-date="' + d.date + '"' : '';
    html += '<circle cx="' + x + '" cy="' + y + '" r="' + (onPointClick ? 7 : 4) + '" fill="' + color + '" stroke="var(--bg)" stroke-width="2"' + clickable + dataAttr + '/>';
    if (data.length<=7 || i%Math.ceil(data.length/6)===0)
      html += '<text class="chart-label-x" x="' + x + '" y="' + (H-pB+14) + '">' + d.label + '</text>';
  });
  svg.innerHTML = html;
  if (onPointClick) {
    svg.querySelectorAll('circle[data-date]').forEach(function(c) {
      c.addEventListener('click', function() { onPointClick(c.getAttribute('data-date')); });
    });
  }
}

function renderStrengthChart() {
  const name = document.getElementById('exSelect')?.value;
  const wrap = document.getElementById('strengthChartWrap');
  const statsEl = document.getElementById('strengthChartStats');
  const histList = document.getElementById('exHistoryList');
  if (!name) {
    if(wrap) wrap.style.display='none';
    if(statsEl) statsEl.innerHTML='';
    if(histList) histList.innerHTML='';
    return;
  }
  const history = (state.exerciseHistory||{})[name] || [];
  if (history.length === 0) {
    wrap.style.display='none';
    statsEl.innerHTML='<div style="color:var(--text3);font-size:12px;text-align:center;padding:14px 0">Sin datos — completá las series para ver el progreso.</div>';
    histList.innerHTML=''; return;
  }
  const chartData = history.slice().reverse().map(h=>({ val:h.oneRM||h.maxKg, label:h.date.slice(5) }));
  wrap.style.display = chartData.length >= 2 ? 'block' : 'none';
  if (chartData.length >= 2) drawLineChart('strengthChartSvg', chartData, 'var(--accent)');
  const latest = history[0], prev = history[1];
  const allOneRM = history.map(h=>h.oneRM||h.maxKg);
  const maxOneRM = Math.max(...allOneRM);
  const diff = prev ? ((latest.oneRM||latest.maxKg)-(prev.oneRM||prev.maxKg)).toFixed(1) : null;
  statsEl.innerHTML = '<div class="stat-trio">' +
    '<div class="stat-pill"><div class="stat-pill-val" style="color:var(--accent)">' + latest.maxKg + 'kg</div><div class="stat-pill-lbl">Último peso</div></div>' +
    '<div class="stat-pill"><div class="stat-pill-val" style="color:var(--yellow)">' + maxOneRM + 'kg</div><div class="stat-pill-lbl">1RM estimado</div></div>' +
    '<div class="stat-pill"><div class="stat-pill-val" style="color:' + (diff>0?'var(--green)':diff<0?'var(--red)':'var(--text)') + '">' + (diff!=null?((+diff>0?'+':'')+diff+'kg'):'—') + '</div><div class="stat-pill-lbl">vs anterior</div></div>' +
    '</div>';
  histList.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin:10px 0 6px">Historial</div>' +
    history.slice(0,8).map(h => {
      const isPR = (h.oneRM||h.maxKg) === maxOneRM;
      return '<div class="ex-history-item"><div class="ex-history-date">' + h.date + '</div>' +
        '<div style="display:flex;align-items:center"><div class="ex-history-val">' + h.maxKg + 'kg × ' + (h.avgReps||'?') + ' reps</div>' +
        (isPR?'<span class="ex-history-pr">PR</span>':'') + '</div></div>';
    }).join('');
}

// ─── BODY COMPOSITION CHART ───────────────────────────────────────
let currentBodyMetric = 'weight';

function selectBodyChart(metric, btn) {
  currentBodyMetric = metric;
  document.querySelectorAll('#bodyChartSelector .prog-sel-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderBodyChart();
}

function renderBodyChart() {
  const configs = {
    weight: { key:'weight', color:'var(--accent)',   unit:'kg', best:'max' },
    bf:     { key:'bf',     color:'var(--yellow)',   unit:'%',  best:'min' },
    muscle: { key:'muscle', color:'var(--green)',    unit:'%',  best:'max' },
  };
  const cfg = configs[currentBodyMetric];
  const hist = (state.metricsHistory||[]).slice().reverse();
  const data = hist.filter(h=>h[cfg.key]!=null).map(h=>({ val:h[cfg.key], label:h.date.slice(5) }));
  drawLineChart('bodyChartSvg', data, cfg.color);
  const statsEl = document.getElementById('bodyChartStats');
  if (data.length >= 2) {
    const first=data[0].val, last=data[data.length-1].val;
    const diff=(last-first).toFixed(1);
    const best = cfg.best==='min' ? Math.min(...data.map(d=>d.val)) : Math.max(...data.map(d=>d.val));
    const diffGood = (cfg.best==='max'&&+diff>0)||(cfg.best==='min'&&+diff<0);
    statsEl.innerHTML =
      '<div class="stat-pill"><div class="stat-pill-val" style="color:' + cfg.color + '">' + last + cfg.unit + '</div><div class="stat-pill-lbl">Actual</div></div>' +
      '<div class="stat-pill"><div class="stat-pill-val" style="color:' + (diffGood?'var(--green)':'var(--red)') + '">' + (+diff>0?'+':'') + diff + cfg.unit + '</div><div class="stat-pill-lbl">Cambio total</div></div>' +
      '<div class="stat-pill"><div class="stat-pill-val" style="color:var(--yellow)">' + best + cfg.unit + '</div><div class="stat-pill-lbl">' + (cfg.best==='min'?'Mínimo':'Máximo') + '</div></div>';
  } else {
    statsEl.innerHTML = '<div style="color:var(--text3);font-size:12px;width:100%;text-align:center;padding:10px 0">Registrá al menos 2 mediciones para ver el gráfico.</div>';
  }
}

// ─── GRÁFICO UNIFICADO DE MÉTRICAS ───────────────────────────────
// Selector de rango de tiempo
var _metricRange = '30';   // '7' | '30' | 'all'
var _metricKey   = 'weight'; // key del historial o 'custom_X'

// Definición de métricas fijas — retrocompat: entradas viejas sin el campo muestran puntos vacíos
var METRIC_DEFS = [
  { key:'weight', label:'⚖️ Peso',          unit:'kg', color:'var(--accent)',  best:'goal' },
  { key:'bf',     label:'🔥 Grasa corporal', unit:'%',  color:'var(--yellow)',  best:'min'  },
  { key:'muscle', label:'💎 Masa muscular',  unit:'%',  color:'var(--green)',   best:'max'  },
  { key:'waist',  label:'📏 Cintura',        unit:'cm', color:'var(--red)',     best:'min'  },
  { key:'chest',  label:'💪 Pecho',          unit:'cm', color:'var(--green)',   best:'max'  },
  { key:'arms',   label:'💪 Brazos',         unit:'cm', color:'var(--accent2)', best:'max'  },
  { key:'hips',   label:'📐 Cadera',         unit:'cm', color:'var(--text2)',   best:'min'  },
];

function _getMetricDef(key) {
  // Buscar en fijas
  var fixed = METRIC_DEFS.find(function(m){ return m.key === key; });
  if (fixed) return fixed;
  // Buscar en personalizadas
  var customs = state.customMetrics || [];
  var cm = customs.find(function(c){ return 'custom_' + c.id === key; });
  if (cm) return { key: key, label: cm.name, unit: cm.unit, color: 'var(--accent)', best: 'max' };
  return null;
}

// DESPUÉS
var _metricRangeFrom = null; // 'YYYY-MM-DD' cuando range === 'custom'
var _metricRangeTo   = null;

function _getFilteredHistory(key, range) {
  var hist = (state.metricsHistory || []).slice().reverse();
  var filtered = hist.filter(function(h){ return h[key] != null; });
  if (range === '7') {
    var c = new Date(TODAY); c.setDate(c.getDate() - 7);
    filtered = filtered.filter(function(h){ return new Date(h.date) >= c; });
  } else if (range === '30') {
    var c30 = new Date(TODAY); c30.setDate(c30.getDate() - 30);
    filtered = filtered.filter(function(h){ return new Date(h.date) >= c30; });
  } else if (range === 'custom' && _metricRangeFrom && _metricRangeTo) {
    var from = new Date(_metricRangeFrom), to = new Date(_metricRangeTo);
    filtered = filtered.filter(function(h){ var d = new Date(h.date); return d >= from && d <= to; });
  }
  return filtered.map(function(h){ return { val: h[key], label: h.date.slice(5), date: h.date }; });
}

// DESPUÉS
// DESPUÉS// DESPUÉS (esto exacto)
// DESPUÉS
function _getActiveUnifiedWrap() {
  return document.getElementById('unifiedChartWrap');
}

// DESPUÉS
function renderUnifiedChart() {
  var el = _getActiveUnifiedWrap();
  if (!el) return;

  _renderMetricSelector();

  var def = _getMetricDef(_metricKey);
  if (!def) return;

  var data = _getFilteredHistory(_metricKey, _metricRange);

  var svgEl = el.querySelector('[id$="unifiedChartSvg"]');
  if (svgEl) {
    var origId = svgEl.id;
    svgEl.id = '__unifiedChartSvg_active__';
    drawLineChart('__unifiedChartSvg_active__', data, def.color, function(date) {
      _confirmDeleteMetricEntry(date);
    });
    svgEl.id = origId;
  }

  var statsEl = el.querySelector('[id$="unifiedChartStats"]');
  if (!statsEl) return;

  if (data.length < 2) {
    statsEl.innerHTML = '<div style="color:var(--text3);font-size:12px;text-align:center;padding:10px 0">Registrá al menos 2 mediciones para ver el análisis.</div>';
    return;
  }

  var first = data[0].val, last = data[data.length-1].val;
  var diff = (last - first).toFixed(1);
  var sign = +diff > 0 ? '+' : '';

  var diffGood;
  if (def.best === 'goal') {
    var goal = (state.config && state.config.goal) || 'cut';
    diffGood = (goal==='cut'||goal==='cut_aggressive') ? +diff <= 0 : +diff >= 0;
  } else {
    diffGood = def.best === 'max' ? +diff > 0 : +diff < 0;
  }
  var diffColor = +diff === 0 ? 'var(--text2)' : diffGood ? 'var(--green)' : 'var(--red)';

  statsEl.innerHTML = '<div class="stat-trio">' +
    '<div class="stat-pill"><div class="stat-pill-val" style="color:' + def.color + '">' + last + def.unit + '</div><div class="stat-pill-lbl">Actual</div></div>' +
    '<div class="stat-pill"><div class="stat-pill-val" style="color:' + diffColor + '">' + sign + diff + def.unit + '</div><div class="stat-pill-lbl">Cambio (período)</div></div>' +
  '</div>';
}

function _renderMetricSelector() {
  var wrap = _getActiveUnifiedWrap();
  var selEl = wrap ? wrap.querySelector('[id$="unifiedMetricSel"]') : document.getElementById('unifiedMetricSel');
  if (!selEl) return;
  var customs = state.customMetrics || [];
  var history = state.metricsHistory || [];

  // ─── GRÁFICOS DINÁMICOS: solo mostrar métricas con datos ─────────
  // Siempre mostrar Peso. Resto: solo si hay al menos 1 entrada con ese campo.
  var allDefs = METRIC_DEFS.concat(customs.map(function(c){
    return { key: 'custom_' + c.id, label: c.name, unit: c.unit };
  }));

var active = _getActiveMetrics();
var defsWithData = allDefs.filter(function(d) {
    if (d.key === 'weight') return true;
    return active.indexOf(d.key) >= 0; // mostrar si está activa, tenga o no datos
  });

  // Si la métrica activa ya no tiene datos, volver a peso
  if (!defsWithData.find(function(d) { return d.key === _metricKey; })) {
    _metricKey = 'weight';
  }

  selEl.innerHTML = defsWithData.map(function(d){
    var active = d.key === _metricKey ? ' active' : '';
    return '<button class="metric-sel-btn' + active + '" onclick="selectUnifiedMetric(\'' + d.key + '\',this)">' + d.label + '</button>';
  }).join('');
}

// DESPUÉS
function selectUnifiedMetric(key, btn) {
  _metricKey = key;
  renderUnifiedChart();
  _reSyncProgresoIfActive();
}

// DESPUÉS
function selectMetricRange(range, btn) {
  if (range === 'custom') { _openCustomRangePicker(); return; }
  _metricRange = range;
  document.querySelectorAll('.metric-range-btn').forEach(function(b){ b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  renderUnifiedChart();
  _reSyncProgresoIfActive();
}

function _openCustomRangePicker() {
  var existing = document.getElementById('metricRangeSheet');
  if (existing) existing.remove();
  var hist = (state.metricsHistory || []);
  var minDate = hist.length ? hist[hist.length-1].date : TODAY;
  var sheet = document.createElement('div');
  sheet.id = 'metricRangeSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:480px;margin:0 auto">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
        '<div style="font-size:14px;font-weight:700;color:var(--text)">📅 Rango personalizado</div>' +
        '<button onclick="document.getElementById(\'metricRangeSheet\').remove()" style="background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;padding:0">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:12px;margin-bottom:16px">' +
        '<div style="flex:1"><div style="font-size:11px;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Desde</div>' +
        '<input id="metricRangeFrom" class="inp" type="date" min="' + minDate + '" max="' + TODAY + '" value="' + minDate + '"></div>' +
        '<div style="flex:1"><div style="font-size:11px;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">Hasta</div>' +
        '<input id="metricRangeTo" class="inp" type="date" min="' + minDate + '" max="' + TODAY + '" value="' + TODAY + '"></div>' +
      '</div>' +
      '<button class="btn btn-primary" style="width:100%" onclick="_applyCustomRange()">Aplicar</button>' +
    '</div>';
  sheet.addEventListener('click', function(e){ if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

function _applyCustomRange() {
  var from = document.getElementById('metricRangeFrom').value;
  var to   = document.getElementById('metricRangeTo').value;
  if (!from || !to || from > to) { showToast('⚠ Rango inválido'); return; }
  _metricRangeFrom = from;
  _metricRangeTo   = to;
  _metricRange     = 'custom';
  document.getElementById('metricRangeSheet').remove();
  document.querySelectorAll('.metric-range-btn').forEach(function(b){ b.classList.remove('active'); });
  var customBtn = document.querySelector('.metric-range-btn[data-range="custom"]');
  if (customBtn) customBtn.classList.add('active');
  renderUnifiedChart();
  _reSyncProgresoIfActive();
}

function _confirmDeleteMetricEntry(date) {
  var existing = document.getElementById('metricDeleteSheet');
  if (existing) existing.remove();
  var entry = (state.metricsHistory || []).find(function(h){ return h.date === date; });
  if (!entry) return;
  var sheet = document.createElement('div');
  sheet.id = 'metricDeleteSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:flex-end';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:480px;margin:0 auto">' +
      '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:6px">🗑 Eliminar medición</div>' +
      '<div style="font-size:12px;color:var(--text3);margin-bottom:20px">¿Eliminás el registro del <strong>' + date + '</strong>? Esta acción no se puede deshacer.</div>' +
      '<div style="display:flex;gap:8px">' +
        '<button class="btn btn-ghost" style="flex:1" onclick="document.getElementById(\'metricDeleteSheet\').remove()">Cancelar</button>' +
        '<button class="btn" style="flex:1;background:var(--red);color:#fff" onclick="_deleteMetricEntry(\'' + date + '\')">Eliminar</button>' +
      '</div>' +
    '</div>';
  sheet.addEventListener('click', function(e){ if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

function _deleteMetricEntry(date) {
  state.metricsHistory = (state.metricsHistory || []).filter(function(h){ return h.date !== date; });
  saveState(state);
  var s = document.getElementById('metricDeleteSheet');
  if (s) s.remove();
  renderMetricsPage();
  renderMetrics();
  _reSyncProgresoIfActive();
  showToast('🗑 Medición eliminada');
}
function _checkWeightGoalReached() {
  var cfg = state.config || {};
  var startWeight = cfg.weight;
  if (!startWeight) return;
  var goal = cfg.goal || 'cut';
  var isLoss = goal==='cut'||goal==='cut_aggressive';
  var isGain = goal==='lean_bulk'||goal==='bulk';
  var goalWeight;
  if (isLoss) {
    var lossGoal = goal==='cut_aggressive' ? 0.1*startWeight : 0.07*startWeight;
    goalWeight = Math.max(startWeight - lossGoal, 50);
  } else if (isGain) {
    goalWeight = startWeight + 0.05*startWeight;
  } else {
    return;
  }
  if (cfg._goalReachedDismissedFor && cfg._goalReachedDismissedFor === goalWeight) return;
  if (cfg._goalReachedDismissed && cfg._goalReachedDismissedFor === goalWeight) return;
  var hist = state.metricsHistory || [];
  var latest = hist.find(function(h){ return h.weight != null; });
  if (!latest) return;
  var w = latest.weight;
  var reached = isLoss ? w <= goalWeight : w >= goalWeight;
  if (!reached) return;

  // ── Celebración grande ────────────────────────────────────────
  var userName = (cfg.name) ? cfg.name : '';
  var lost = isLoss ? (startWeight - w).toFixed(1) : null;
  var gained = isGain ? (w - startWeight).toFixed(1) : null;
  var kgLabel = isLoss ? lost + ' kg menos' : gained + ' kg de músculo';
  var entries = hist.filter(function(h){ return h.weight != null; });
  var weeks = entries.length > 1
    ? Math.round(Math.abs(new Date(entries[0].date) - new Date(entries[entries.length-1].date)) / (7*24*60*60*1000))
    : null;
  var weekStr = weeks && weeks > 0 ? weeks + (weeks === 1 ? ' semana' : ' semanas') + ' de constancia' : null;

  if (typeof celebrateGoalReached === 'function') {
    celebrateGoalReached({
      emoji: isLoss ? '🎉' : '💪',
      title: isLoss ? '¡Meta de peso alcanzada!' : '¡Objetivo de masa logrado!',
      subtitle: '¡Lo lograste' + (userName ? ', ' + userName : '') + '! ' + kgLabel,
      detail: weekStr
        ? 'Eso representa ' + weekStr + '. El esfuerzo diario se convirtió en resultado real.'
        : 'Cada decisión que tomaste sumó. Esto es solo el comienzo.'
    });
  }

  var existing = document.getElementById('goalReachedSheet');
  if (existing) return;
  var sheet = document.createElement('div');
  sheet.id = 'goalReachedSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10010;display:flex;align-items:flex-end';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:480px;margin:0 auto">' +
      '<div style="text-align:center;margin-bottom:16px">' +
        '<div style="font-size:36px;margin-bottom:8px">🏆</div>' +
        '<div style="font-size:16px;font-weight:800;color:var(--text)">¡Objetivo alcanzado!</div>' +
        '<div style="font-size:13px;color:var(--text3);margin-top:4px">Llegaste a <strong>' + w + ' kg</strong>. ¿Qué querés hacer ahora?</div>' +
      '</div>' +
  '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">' +
        (isLoss ? _goalOptionBtn('cut', '📉 Seguir bajando', 'Continuar reduciendo peso') : '') +
        (!isLoss ? _goalOptionBtn('bulk', '💪 Seguir subiendo masa', 'Continuar en fase de volumen') : '') +
        _goalOptionBtn('maintain',   '⚖️ Mantener peso',        'Sostener el peso actual') +
        (isLoss ? _goalOptionBtn('bulk', '💪 Subir masa', 'Fase de volumen') : '') +
        (!isLoss ? _goalOptionBtn('cut', '📉 Bajar grasa', 'Fase de definición') : '') +
        _goalOptionBtn('new_goal',   '🎯 Definir nuevo objetivo','Establecer una nueva meta') +
      '</div>' +
    '</div>';
  sheet.addEventListener('click', function(e){ if (e.target === sheet) _dismissGoalSheet(); });
  document.body.appendChild(sheet);
}

function _goalOptionBtn(action, label, desc) {
  return '<button onclick="_onGoalReachedAction(\'' + action + '\')" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg3);cursor:pointer;text-align:left;width:100%">' +
    '<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--text)">' + label + '</div>' +
    '<div style="font-size:11px;color:var(--text3);margin-top:2px">' + desc + '</div></div>' +
    '<div style="color:var(--text3)">›</div>' +
    '</button>';
}

function _dismissGoalSheet() {
  var s = document.getElementById('goalReachedSheet');
  if (s) s.remove();
}

function _onGoalReachedAction(action) {
  _dismissGoalSheet();
  if (!state.config) state.config = {};
  if (action === 'new_goal') {
    state.config._goalReachedDismissed = true;
    state.config._goalReachedDismissedFor = goalWeight;
    saveState(state);
    if (typeof openGoalModal === 'function') openGoalModal();
    else showToast('Abrí Configuración para definir tu nueva meta');
    return;
  }
var goalMap = { cut: 'cut', maintain: 'maintain', bulk: 'bulk' };
  if (goalMap[action]) state.config.goal = goalMap[action];
  // Actualizar peso de inicio al peso actual para recalcular la barra
  var hist = state.metricsHistory || [];
  var latestEntry = hist.find(function(h){ return h.weight != null; });
  if (latestEntry) state.config.weight = latestEntry.weight;
  // Resetear dismissed para la nueva meta calculada desde el nuevo peso
  state.config._goalReachedDismissed = false;
  state.config._goalReachedDismissedFor = null;
  saveState(state);
  renderWeightGoalBar();
  renderMetricsPage();
  if (typeof _syncProgresoContent === 'function') _syncProgresoContent();
  showToast('✓ Objetivo actualizado');
}
window._onGoalReachedAction = _onGoalReachedAction;
window._dismissGoalSheet    = _dismissGoalSheet;

window._applyCustomRange        = _applyCustomRange;window._confirmDeleteMetricEntry = _confirmDeleteMetricEntry;
window._deleteMetricEntry       = _deleteMetricEntry;

function _reSyncProgresoIfActive() {
  var progreso = document.getElementById('page-progreso');
  if (progreso && progreso.classList.contains('active')) {
    if (typeof _syncProgresoContent === 'function') _syncProgresoContent();
  }
}

// ─── MÉTRICAS PERSONALIZADAS ──────────────────────────────────────
function openAddCustomMetric() {
  var modal = document.getElementById('addCustomMetricModal');
  if (modal) {
    document.getElementById('customMetricName').value = '';
    document.getElementById('customMetricUnit').value = '';
    modal.classList.add('open');
  }
}

function closeAddCustomMetric() {
  var modal = document.getElementById('addCustomMetricModal');
  if (modal) modal.classList.remove('open');
}

function saveCustomMetric() {
  var name = (document.getElementById('customMetricName').value || '').trim();
  var unit = (document.getElementById('customMetricUnit').value || '').trim();
  if (!name) { showToast('⚠ Ingresá un nombre'); return; }
  if (!state.customMetrics) state.customMetrics = [];
  var id = Date.now().toString(36); // id único corto
  state.customMetrics.push({ id: id, name: name, unit: unit || 'u' });
  saveState(state);
  closeAddCustomMetric();
  renderMetricsPage();
  showToast('✓ Métrica "' + name + '" agregada');
}

function deleteCustomMetric(id) {
  if (!state.customMetrics) return;
  state.customMetrics = state.customMetrics.filter(function(c){ return c.id !== id; });
  saveState(state);
  renderMetricsPage();
  showToast('Métrica eliminada');
}

// Renderiza toda la página (campos de entrada + gráfico) — llamada por saveMetrics y al cargar
// Renderiza toda la página (campos de entrada + gráfico) — llamada por saveMetrics y al cargar
function renderMetricsPage() {
  var customs = state.customMetrics || [];

  // Render métricas activas elegidas por el usuario
  renderActiveMetricFields();

  // Sub-barras de progreso para métricas activas
  _renderMetricProgressBars();

  // Rebuild campos extra en el formulario
  var extraEl = document.getElementById('metricsExtraInputs');
  if (extraEl) {
    extraEl.innerHTML = customs.map(function(cm){
      return '<div style="flex:1;min-width:calc(50% - 4px)">' +
        '<div style="font-size:10px;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px">' + cm.name + ' (' + cm.unit + ')</div>' +
        '<input class="inp" id="inpCustom_' + cm.id + '" type="number" step="0.1" placeholder="0">' +
      '</div>';
    }).join('');

    // Botón para borrar métricas personalizadas
    var manageEl = document.getElementById('metricsCustomManage');
    if (manageEl) {
      manageEl.innerHTML = customs.length ? customs.map(function(cm){
        return '<div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:6px 10px;margin-bottom:6px">' +
          '<span style="font-size:12px;color:var(--text2)">' + cm.name + ' <span style="color:var(--text3)">(' + cm.unit + ')</span></span>' +
          '<button onclick="deleteCustomMetric(\'' + cm.id + '\')" style="background:none;border:none;color:var(--red);font-size:14px;cursor:pointer;padding:0 4px">✕</button>' +
        '</div>';
      }).join('') : '';
    }
  }

  renderUnifiedChart();
}
// ─── SUB-BARRAS DE PROGRESO POR MÉTRICA ──────────────────────────
function _renderMetricProgressBars() {
  var el = document.getElementById('metricProgressBars');
  if (!el) return;

  var active = _getActiveMetrics();
  var hist   = state.metricsHistory || [];
  if (!active.length || !hist.length) { el.innerHTML = ''; return; }

  var goals  = (state.config && state.config.metricGoals) || {};
  var goal   = (state.config && state.config.goal) || 'cut';
  var isCut  = goal === 'cut' || goal === 'cut_aggressive';
  var isBulk = goal === 'bulk' || goal === 'lean_bulk';

  var DIR = {
    bf:'var(--yellow)', muscle:'var(--green)', waist:'var(--red)',
    chest:'var(--green)', arms:'var(--accent2)', hips:'var(--text2)',
  };
  var COLORS = DIR; // mismo objeto, alias semántico

  var DIR_VAL = {
    bf:     isCut ? -1 : +1,
    muscle: isBulk ? +1 : -1,
    waist:  isCut ? -1 : 0,
    chest:  isBulk ? +1 : 0,
    arms:   isBulk ? +1 : 0,
    hips:   isCut ? -1 : 0,
  };

  var html = active.map(function(key) {
    var def = _METRIC_PICKER_DEFS.find(function(d){ return d.key === key; });
    if (!def) {
      var cm = (state.customMetrics||[]).find(function(c){ return 'custom_'+c.id === key; });
      if (cm) def = { key: key, label: cm.name, unit: cm.unit };
    }
    if (!def) return '';

    var entries = hist.filter(function(h){ return h[key] != null; });
    if (!entries.length) return '';
    var latest  = entries[0][key];
    var prev    = entries.length > 1 ? entries[1][key] : null;
    var diff    = prev !== null ? (latest - prev) : null;
    var color   = COLORS[key] || 'var(--accent)';
    var dir     = DIR_VAL[key] !== undefined ? DIR_VAL[key] : 0;
    var target  = goals[key] != null ? parseFloat(goals[key]) : null;

    // ── Cálculo del % de la barra ──────────────────────────────────
    var pct, statusHtml = '';
    if (target !== null) {
      // Con objetivo: progreso real desde primer registro hasta meta
      var start = entries[entries.length - 1][key]; // valor más antiguo
      var totalRange = target - start;
      if (totalRange === 0) {
        pct = 100;
      } else {
        pct = Math.round(((latest - start) / totalRange) * 100);
        pct = Math.max(0, Math.min(100, pct));
      }
      var remaining = (target - latest).toFixed(1);
      var reached   = Math.abs(latest - target) < 0.05;
      var goodColor = ((dir === -1 && latest <= target) || (dir === +1 && latest >= target) || dir === 0)
                      ? 'var(--green)' : color;
      statusHtml = reached
        ? '<div style="font-size:10px;color:var(--green);margin-top:3px">🎯 ¡Meta alcanzada!</div>'
        : '<div style="font-size:10px;color:var(--text3);margin-top:3px">Meta: <span style="color:' + goodColor + ';font-weight:700">' + target + ' ' + def.unit + '</span>'
          + ' · Faltan <strong>' + Math.abs(remaining) + ' ' + def.unit + '</strong></div>';
    } else {
      // Sin objetivo: progreso relativo min→max
      var vals  = entries.slice(0, 10).map(function(h){ return h[key]; });
      var minV  = Math.min.apply(null, vals);
      var maxV  = Math.max.apply(null, vals);
      var range = maxV - minV || 1;
      pct = Math.round(((latest - minV) / range) * 100);
      if (dir === -1) pct = 100 - pct;
      pct = Math.max(5, Math.min(100, pct));
      statusHtml = '<div style="font-size:10px;color:var(--text3);margin-top:3px;cursor:pointer" onclick="openMetricGoalModal(\'' + key + '\')">Toca para establecer meta 🎯</div>';
    }

    var sign      = diff !== null ? (diff > 0 ? '+' : '') : '';
    var diffColor = diff === null ? 'var(--text3)'
                  : dir === 0    ? 'var(--text2)'
                  : (dir === -1 && diff <= 0) || (dir === +1 && diff >= 0) ? 'var(--green)' : 'var(--red)';

    return '<div style="margin-bottom:12px;cursor:pointer" onclick="openMetricGoalModal(\'' + key + '\')">'
      + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">'
        + '<div style="font-size:11px;color:var(--text2);font-weight:600">' + def.label + '</div>'
        + '<div style="display:flex;align-items:center;gap:8px">'
          + '<div style="font-size:12px;font-weight:700;color:' + color + '">' + latest + ' ' + def.unit + '</div>'
          + (diff !== null ? '<div style="font-size:10px;color:' + diffColor + '">' + sign + diff.toFixed(1) + '</div>' : '')
          + '<div style="font-size:10px;color:var(--text3)">🎯</div>'
        + '</div>'
      + '</div>'
      + '<div style="background:var(--bg4);border-radius:4px;height:5px;overflow:hidden">'
        + '<div style="height:100%;border-radius:4px;background:' + color + ';width:' + pct + '%;transition:width 0.4s"></div>'
      + '</div>'
      + statusHtml
    + '</div>';
  }).join('');

  el.innerHTML = html
    ? '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">' + html + '</div>'
    : '';
}

function openMetricGoalModal(key) {
  var existing = document.getElementById('metricGoalSheet');
  if (existing) existing.remove();

  var def = _METRIC_PICKER_DEFS.find(function(d){ return d.key === key; });
  if (!def) {
    var cm = (state.customMetrics||[]).find(function(c){ return 'custom_'+c.id === key; });
    if (cm) def = { key: key, label: cm.name, unit: cm.unit };
  }
  if (!def) return;

  var goals   = (state.config && state.config.metricGoals) || {};
  var current = goals[key] != null ? goals[key] : '';

  var sheet = document.createElement('div');
  sheet.id  = 'metricGoalSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:480px;margin:0 auto">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
      + '<div style="font-size:14px;font-weight:700;color:var(--text)">🎯 Meta: ' + def.label + '</div>'
      + '<button onclick="document.getElementById(\'metricGoalSheet\').remove()" style="background:none;border:none;color:var(--text3);font-size:18px;cursor:pointer;padding:0">✕</button>'
    + '</div>'
    + '<div style="font-size:12px;color:var(--text3);margin-bottom:16px">Establecé tu valor objetivo en ' + def.unit + '.</div>'
    + '<input id="metricGoalInput" class="inp" type="number" step="0.1" placeholder="Ej: ' + (def.placeholder || '0') + '" value="' + current + '" style="margin-bottom:14px">'
    + '<div style="display:flex;gap:8px">'
      + '<button class="btn btn-primary" style="flex:1" onclick="saveMetricGoal(\'' + key + '\')">Guardar meta</button>'
      + (current !== '' ? '<button class="btn btn-ghost" onclick="clearMetricGoal(\'' + key + '\')">Quitar meta</button>' : '')
    + '</div>'
    + '</div>';
  sheet.addEventListener('click', function(e){ if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
  setTimeout(function(){ var inp = document.getElementById('metricGoalInput'); if(inp) inp.focus(); }, 200);
}

function saveMetricGoal(key) {
  var inp = document.getElementById('metricGoalInput');
  var val = inp ? parseFloat(inp.value) : NaN;
  if (isNaN(val)) { showToast('⚠ Ingresá un valor válido'); return; }
  if (!state.config) state.config = {};
  if (!state.config.metricGoals) state.config.metricGoals = {};
  state.config.metricGoals[key] = val;
  saveState(state);
  document.getElementById('metricGoalSheet').remove();
  _renderMetricProgressBars();
  if (typeof _syncProgresoContent === 'function') _syncProgresoContent();
  showToast('🎯 Meta guardada');
}

function clearMetricGoal(key) {
  if (!state.config || !state.config.metricGoals) return;
  delete state.config.metricGoals[key];
  saveState(state);
  document.getElementById('metricGoalSheet').remove();
  _renderMetricProgressBars();
  if (typeof _syncProgresoContent === 'function') _syncProgresoContent();
  showToast('Meta eliminada');
}

// ─── AI NUTRITION CHAT ────────────────────────────────────────────
// ─── AI NUTRITION CHAT ────────────────────────────────────────────
const GROQ_URL = 'https://fittrack-backend-one.vercel.app/api/ai';
let lastAIResult = null;

function openAIChat() {
  document.getElementById('aiChatModal').classList.add('open');
  setTimeout(() => document.getElementById('aiInput').focus(), 300);
}
function closeAIChat() {
  document.getElementById('aiChatModal').classList.remove('open');
}
function sendAIChip(el) {
  document.getElementById('aiInput').value = el.textContent.trim();
  sendAIMessage();
}
function appendBubble(text, type) {
  const area = document.getElementById('aiChatArea');
  const div = document.createElement('div');
  div.className = 'ai-bubble ' + type;
  div.innerHTML = text;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
  return div;
}
function buildResultCard(data) {
  const meals = ['Desayuno','Almuerzo','Merienda','Cena','Extra'];
  const cardId = 'aiCard_' + Date.now();
  const itemsHtml = data.items && data.items.length > 1
    ? '<div class="ai-items-list">' + data.items.map(it => '• ' + it.food + ' (' + it.amount + '): ' + it.prot + 'p · ' + it.carb + 'c · ' + it.fat + 'g').join('<br>') + '</div>' : '';
  return '<div class="ai-result-card" id="' + cardId + '">' +
    '<div style="font-size:13px;font-weight:700;margin-bottom:4px">\u{1F4CA} ' + data.name + '</div>' +
    '<div style="font-size:10px;color:var(--text3);margin-bottom:8px">Editá si la IA se equivocó</div>' +
    '<div class="ai-result-macros">' +
      '<div class="ai-macro-pill">' +
        '<input type="number" id="' + cardId + '_p" value="' + data.prot + '" min="0" style="width:44px;text-align:center;font-size:14px;font-weight:700;background:none;border:none;border-bottom:1px solid rgba(59,130,246,0.5);color:#3b82f6;padding:0">' +
        '<div class="lbl">Prot g</div></div>' +
      '<div class="ai-macro-pill">' +
        '<input type="number" id="' + cardId + '_c" value="' + data.carb + '" min="0" style="width:44px;text-align:center;font-size:14px;font-weight:700;background:none;border:none;border-bottom:1px solid rgba(245,158,11,0.5);color:#f59e0b;padding:0">' +
        '<div class="lbl">Carbs g</div></div>' +
      '<div class="ai-macro-pill">' +
        '<input type="number" id="' + cardId + '_f" value="' + data.fat + '" min="0" style="width:44px;text-align:center;font-size:14px;font-weight:700;background:none;border:none;border-bottom:1px solid rgba(239,68,68,0.5);color:#ef4444;padding:0">' +
        '<div class="lbl">Grasas g</div></div>' +
      '<div class="ai-macro-pill"><div class="val kcal-color">' + data.kcal + '</div><div class="lbl">Kcal</div></div>' +
    '</div>' +
    itemsHtml +
    (data.notes ? '<div class="ai-notes">\u{1F4A1} ' + data.notes + '</div>' : '') +
    '<div style="font-size:11px;color:var(--text3);margin-bottom:8px;font-weight:600">Agregar a:</div>' +
    '<div class="ai-add-btns">' + meals.map(m => '<button class="ai-meal-btn" onclick="addAIToMeal(\'' + m + '\',\'' + cardId + '\')">' + m + '</button>').join('') + '</div>' +
    '</div>';
}
function addAIToMeal(meal, cardId) {
  if (!lastAIResult) { showToast('\u26A0 Sin resultado de IA'); return; }
  var prot = +lastAIResult.prot||0, carb = +lastAIResult.carb||0, fat = +lastAIResult.fat||0;
  if (cardId) {
    var pEl = document.getElementById(cardId + '_p');
    var cEl = document.getElementById(cardId + '_c');
    var fEl = document.getElementById(cardId + '_f');
    if (pEl) prot = +pEl.value || 0;
    if (cEl) carb = +cEl.value || 0;
    if (fEl) fat  = +fEl.value || 0;
  }
  state[TODAY].foods.push({ id:Date.now().toString(), name:lastAIResult.name, meal, prot, carb, fat });
  saveState(state);
  renderMeals();
  renderHome();
  showToast('\u2713 Agregado a ' + meal);
  if (typeof showActionFeedback === 'function') showActionFeedback('food');
  document.querySelectorAll('.ai-meal-btn').forEach(b => { if(b.textContent===meal){b.textContent='\u2713 Listo';b.classList.add('primary');} });
}

async function sendAIMessage() {
  const inp = document.getElementById('aiInput');
  const query = inp.value.trim();
  if (!query) return;
  const btn = document.getElementById('aiSendBtn');
  btn.disabled = true; inp.value = '';
  appendBubble(query, 'user');
  const loading = appendBubble('⚡ Analizando...', 'bot loading');
  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: query })
    });
    const rawText = await res.text();
    if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + rawText.substring(0, 200));
    let data;
    try { data = JSON.parse(rawText); } catch(e) { throw new Error('Respuesta no es JSON: ' + rawText.substring(0, 200)); }
    loading.remove();
    lastAIResult = data;
    appendBubble(buildResultCard(data), 'bot');
  } catch(err) {
    loading.className = 'ai-bubble bot';
    if (!navigator.onLine) {
      loading.innerHTML = '📡 Sin conexión. Verificá tu internet e intentá de nuevo.';
    } else {
      loading.innerHTML = '❌ Error al conectar con la IA. Intentá de nuevo.';
    }
  } finally {
    btn.disabled = false;
    var aiInp = document.getElementById('aiInput');
    if (aiInp) aiInp.focus();
  }
}
// ─── DEFERRED CHART RENDER ────────────────────────────────────────
// Marca el chart como sucio; se redibuja cuando la página de métricas se activa
var _metricChartDirty = false;
function _markChartDirty() {
  _metricChartDirty = true;
}

function _flushChartIfDirty() {
  if (!_metricChartDirty) return;
  _metricChartDirty = false;
  renderUnifiedChart();
  _renderMetricProgressBars();
}
