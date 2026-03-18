// ─── WIDGETS SYSTEM ───────────────────────────────────────────────
// Arquitectura: DATA → RENDER → INTERACT
// Preparado para integración con Capacitor native widgets

// ─── DATA LAYER ──────────────────────────────────────────────────
function getWidgetData(simState) {
  // simState: 'empty' | 'mid' | 'full' | null (usa state real)
  if (simState === 'empty') {
    return {
      score: 0,
      water: { current: 0, goal: 3000 },
      meals: { breakfast: false, lunch: false, snack: false, dinner: false },
      training: { today: null, nextSession: 'Sin rutina', time: null, done: false, pct: 0 }
    };
  }
  if (simState === 'mid') {
    return {
      score: 52,
      water: { current: 1500, goal: 3000 },
      meals: { breakfast: true, lunch: true, snack: false, dinner: false },
      training: { today: 'Push', nextSession: 'Push', time: '18:00', done: false, pct: 45 }
    };
  }
  if (simState === 'full') {
    return {
      score: 91,
      water: { current: 3000, goal: 3000 },
      meals: { breakfast: true, lunch: true, snack: true, dinner: true },
      training: { today: 'Push', nextSession: 'Pull', time: '18:00', done: true, pct: 100 }
    };
  }

  // DATOS REALES
  var cfg = state.config || {};
  var today = state[TODAY] || {};
  var foods = today.foods || [];
  var waterGoal = typeof getWaterGoal === 'function' ? getWaterGoal() : 2500;
  var waterCurrent = today.water || 0;

  // Score
  var scoreData = typeof calculateDayScore === 'function' ? calculateDayScore() : { overall: 0 };
  var score = scoreData.overall || 0;

  // Meals
  var MEAL_KEYS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena'];
  var meals = {
    breakfast: foods.some(function(f) { return f.meal === 'Desayuno'; }),
    lunch:     foods.some(function(f) { return f.meal === 'Almuerzo'; }),
    snack:     foods.some(function(f) { return f.meal === 'Merienda'; }),
    dinner:    foods.some(function(f) { return f.meal === 'Cena'; })
  };

  // Training
  var trainDay = today.trainDay || 0;
  var training = { today: null, nextSession: 'Descanso', time: null, done: false, pct: 0 };
  if (trainDay > 0 && cfg.training && cfg.training[trainDay - 1]) {
    var td = cfg.training[trainDay - 1];
    var savedSets = today['trainSets_' + trainDay] || {};
    var total = 0, done = 0;
    (td.exercises || []).forEach(function(ex, i) {
      var n = parseInt(ex.sets) || 3;
      total += n;
      (savedSets[i] || []).forEach(function(s) { if (s.done) done++; });
    });
    training.today = td.name;
    training.nextSession = td.name;
    training.pct = total > 0 ? Math.round(done / total * 100) : 0;
    training.done = total > 0 && done === total;
  }

  // Next session (upcoming)
  var dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  var cycle = cfg.cycle || {};
  for (var i = 1; i <= 6; i++) {
    var nextDowIdx = (new Date().getDay() + i) % 7;
    var nextDow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][nextDowIdx];
    var val = cycle[nextDow];
    if (val && val !== -1 && val !== '-1' && val !== 'rest') {
      if (val === 'sport') {
        training.nextSession = (cfg.sportNames && cfg.sportNames[nextDow]) || 'Deporte';
      } else {
        var idx = parseInt(val);
        if (cfg.training && cfg.training[idx]) training.nextSession = cfg.training[idx].name;
      }
      break;
    }
  }

  return { score: score, water: { current: waterCurrent, goal: waterGoal }, meals: meals, training: training };
}

// ─── RENDER LAYER ─────────────────────────────────────────────────

// SMALL WIDGETS
function renderWidgetSmall(type, data) {
  data = data || getWidgetData();
  switch (type) {
    case 'water':   return _widgetSmallWater(data);
    case 'score':   return _widgetSmallScore(data);
    case 'training': return _widgetSmallTraining(data);
    case 'meal':    return _widgetSmallMeal(data);
    default: return '';
  }
}

function _widgetSmallWater(data) {
  var pct = Math.min(100, Math.round(data.water.current / data.water.goal * 100));
  var done = pct >= 100;
  // Acento dorado en progreso, apagado si vacío
  var color = done ? '#c8a84b' : pct >= 50 ? '#c8a84bcc' : '#c8a84b55';
  var trackColor = 'rgba(200,168,75,0.12)';
  var r = 24; var circ = (2 * Math.PI * r).toFixed(1);
  var offset = (circ * (1 - pct / 100)).toFixed(1);
  // Sin emoji decorativo — el arco dorado ES la info visual
  // El número debajo es el único texto
  return '<div class="wg wg-small"' +
    ' style="background:linear-gradient(145deg,#0f1a0c,#172013);cursor:pointer"' +
    ' onclick="event.stopPropagation();addWater(250);_refreshWidgetPreview()">' +
    '<div class="wg-s-inner">' +
      '<div class="wg-s-arc">' +
        '<svg width="58" height="58" viewBox="0 0 58 58">' +
          '<circle cx="29" cy="29" r="' + r + '" fill="none" stroke="' + trackColor + '" stroke-width="4"/>' +
          '<circle cx="29" cy="29" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="4"' +
            ' stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '"' +
            ' stroke-linecap="round" transform="rotate(-90 29 29)"/>' +
        '</svg>' +
        // Icono centrado: muy pequeño, solo orientación
        '<div class="wg-s-arc-inner">' +
          '<span style="font-size:13px;line-height:1;opacity:0.7">💧</span>' +
        '</div>' +
      '</div>' +
      '<div class="wg-s-arc-val" style="color:' + color + '">' +
        pct + '<span class="wg-t-unit">%</span>' +
      '</div>' +
      '<div class="wg-s-hint" style="opacity:0.4">' + (done ? '✓' : '+250') + '</div>' +
    '</div>' +
  '</div>';
}

function _widgetSmallScore(data) {
  var s = data.score;
  // Acento dorado solo para score alto, azul para medio, rojo para bajo
  var color = s >= 85 ? '#c8a84b' : s >= 60 ? '#c8a84b99' : '#94a3b8';
  var emoji = s >= 85 ? '✦' : s >= 60 ? '◎' : '○';
  // Fondo: gradiente verde oscuro terra, sin borde
  // Número es el único elemento de peso visual — lo demás desaparece
  return '<div class="wg wg-small"' +
    ' style="background:linear-gradient(145deg,#111a0d,#182214);cursor:pointer"' +
    ' onclick="showPage(\'home\')">' +
    '<div class="wg-s-score-body">' +
      '<span class="wg-s-score-emoji" style="color:' + color + ';font-style:normal;font-size:14px">' + emoji + '</span>' +
      '<span class="wg-s-score-num" style="color:' + color + '">' + s + '</span>' +
      '<span class="wg-s-score-sub" style="color:' + color + ';opacity:0.45">/100</span>' +
    '</div>' +
  '</div>';
}

function _widgetSmallTraining(data) {
  var pct = data.training.pct;
  var done = data.training.done;
  var color = done ? '#34d399' : pct > 0 ? '#fbbf24' : '#4d8aff';
  var r = 24; var circ = (2 * Math.PI * r).toFixed(1);
  var offset = (circ * (1 - pct / 100)).toFixed(1);
  var label = done ? '✓' : pct > 0 ? pct + '%' : '▶';
  // Mismo esqueleto que water: arco + valor + hint
  return '<div class="wg wg-small" style="background:var(--bg3);cursor:pointer"' +
    ' onclick="showPage(\'training\')">' +
    '<div class="wg-s-inner">' +
      '<div class="wg-s-arc">' +
        '<svg width="58" height="58" viewBox="0 0 58 58">' +
          '<circle cx="29" cy="29" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="4"/>' +
          '<circle cx="29" cy="29" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="4"' +
            ' stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '"' +
            ' stroke-linecap="round" transform="rotate(-90 29 29)"/>' +
        '</svg>' +
        '<div class="wg-s-arc-inner"><span class="wg-emoji" style="font-size:15px;width:auto;height:auto">💪</span></div>' +
      '</div>' +
      '<div class="wg-s-arc-val" style="color:' + color + ';font-size:' + (done ? '20px' : '18px') + '">' + label + '</div>' +
      '<div class="wg-s-hint">' + (done ? 'hecho' : 'entreno') + '</div>' +
    '</div>' +
  '</div>';
}

function _widgetSmallMeal(data) {
  var keys = ['breakfast','lunch','snack','dinner'];
  var icons = ['🌅','☀️','🍎','🌙'];
  var done = keys.filter(function(k){ return data.meals[k]; }).length;
  var color = done === 4 ? '#34d399' : done >= 2 ? '#fbbf24' : '#94a3b8';
  var dots = keys.map(function(k, i) {
    var filled = data.meals[k];
    return '<div class="wg-s-meal-dot" style="background:' + (filled ? color + '33' : 'rgba(255,255,255,0.07)') + ';border:1px solid ' + (filled ? color + '66' : 'rgba(255,255,255,0.10)') + '">' +
      '<span style="font-size:9px;line-height:1;opacity:' + (filled ? '1' : '0.3') + '">' + icons[i] + '</span>' +
    '</div>';
  }).join('');
  // número hero arriba, grid 2×2 abajo — ambos caben en 86px útil sin overflow
  return '<div class="wg wg-small" style="background:var(--bg3);cursor:pointer"' +
    ' onclick="showPage(\'nutricion\')">' +
    '<div class="wg-s-meal-body">' +
      '<div class="wg-s-meal-num" style="color:' + color + '">' + done + '<span class="wg-t-unit">/4</span></div>' +
      '<div class="wg-s-meal-grid">' + dots + '</div>' +
    '</div>' +
  '</div>';
}

// MEDIUM WIDGETS
function renderWidgetMedium(type, data) {
  data = data || getWidgetData();
  switch (type) {
    case 'water':    return _widgetMediumWater(data);
    case 'meals':    return _widgetMediumMeals(data);
    case 'training': return _widgetMediumTraining(data);
    default: return '';
  }
}

function _widgetMediumWater(data) {
  var pct = Math.min(100, Math.round(data.water.current / data.water.goal * 100));
  var done = pct >= 100;
  var color = done ? '#c8a84b' : pct >= 50 ? '#c8a84bcc' : '#c8a84b55';
  var trackColor = 'rgba(200,168,75,0.10)';
  var remaining = Math.max(0, data.water.goal - data.water.current);
  // 10 segmentos — menos es más limpio
  var segs = 10; var filled = Math.round(pct / 100 * segs); var segHtml = '';
  for (var i = 0; i < segs; i++) {
    var isOn = i < filled;
    segHtml += '<div class="wg-m-seg' + (isOn ? ' on' : '') +
      '" style="background:' + (isOn ? color : trackColor) + '"></div>';
  }
  // Fondo: gradiente terra más oscuro que el base — diferencia sutil del fondo de app
  // Sin borde. El número grande + segmentos son los únicos elementos de peso.
  // El botón es fantasma: texto dorado apagado, sin caja visible.
  return '<div class="wg wg-medium"' +
    ' style="background:linear-gradient(145deg,#0f1a0c,#172013)">' +
    '<div class="wg-m-top" style="margin-bottom:12px">' +
      '<div class="wg-m-top-left">' +
        // Sin emoji — el número es la jerarquía principal
        '<div class="wg-m-val" style="color:' + color + '">' +
          pct + '<span class="wg-m-val-unit">%</span>' +
        '</div>' +
        '<div class="wg-m-sub" style="opacity:0.45">' +
          (done ? 'objetivo cumplido' : remaining + 'ml restantes') +
        '</div>' +
      '</div>' +
      // Icono derecha: muy pequeño, no compite con el número
      '<span style="font-size:22px;opacity:0.35;flex-shrink:0">💧</span>' +
    '</div>' +
    '<div class="wg-m-mid" style="margin-bottom:12px">' +
      '<div class="wg-m-segs">' + segHtml + '</div>' +
    '</div>' +
    // Botón fantasma: sin fondo, sin borde — solo texto
    '<button style="width:100%;background:none;border:none;padding:6px 0;' +
      'color:' + color + ';opacity:0.7;font-size:12px;font-weight:700;cursor:pointer;text-align:left"' +
      ' onclick="event.stopPropagation();addWater(250);_refreshWidgetPreview()">' +
      '+ 250ml' +
    '</button>' +
  '</div>';
}
function _widgetMediumMeals(data) {
  var MEALS = [
    { key:'breakfast', icon:'🌅', nav:'Desayuno' },
    { key:'lunch',     icon:'☀️', nav:'Almuerzo' },
    { key:'snack',     icon:'🍎', nav:'Merienda' },
    { key:'dinner',    icon:'🌙', nav:'Cena'     }
  ];
  var done = MEALS.filter(function(m){ return data.meals[m.key]; }).length;
  var color = done === 4 ? '#34d399' : done >= 2 ? '#fbbf24' : '#94a3b8';
  var next = MEALS.find(function(m){ return !data.meals[m.key]; });
  // 4 slots flex:1 — height fija 42px, emoji font-size 16px → nunca desborda
  var slots = MEALS.map(function(m) {
    var isDone = data.meals[m.key];
    return '<div class="wg-m-slot' + (isDone ? ' done' : '') + '"' +
      ' onclick="event.stopPropagation();' + (isDone ? 'showPage(\'nutricion\')' : 'openAddFood(\'' + m.nav + '\')') + '">' +
      '<span class="wg-m-slot-icon">' + m.icon + '</span>' +
      (isDone ? '<span class="wg-m-slot-check">✓</span>' : '') +
    '</div>';
  }).join('');
  return '<div class="wg wg-medium">' +
    '<div class="wg-m-top">' +
      '<div class="wg-m-top-left">' +
        '<span class="wg-m-emoji">🍽</span>' +
        '<div class="wg-m-val" style="color:' + color + '">' + done + '<span class="wg-m-val-unit">/4</span></div>' +
        '<div class="wg-m-sub">' + (done === 4 ? '¡Completo!' : next ? 'Falta: ' + next.icon : '') + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="wg-m-mid"><div class="wg-m-slot-row">' + slots + '</div></div>' +
    '<button class="wg-btn-full" onclick="event.stopPropagation();' +
      (next ? 'openAddFood(\'' + next.nav + '\')' : 'showPage(\'nutricion\')') + '">' +
      (next ? '+ Agregar ' + next.icon : '✓ Ver comidas') +
    '</button>' +
  '</div>';
}

function _widgetMediumTraining(data) {
  var pct = data.training.pct;
  var done = data.training.done;
  var name = data.training.today || data.training.nextSession || 'Sin entreno';
  var color = done ? '#34d399' : pct > 0 ? '#fbbf24' : '#4d8aff';
  // r=28, viewBox 68×68
  var r = 28; var circ = (2 * Math.PI * r).toFixed(1);
  var offset = (circ * (1 - pct / 100)).toFixed(1);
  var btnLabel = done ? '✓ Completado' : pct > 0 ? '▶ Continuar' : '▶ Iniciar';
  // nombre: text-overflow:ellipsis en .wg-m-train-name → nunca desborda
  return '<div class="wg wg-medium">' +
    '<div class="wg-m-train-row">' +
      // Ring izquierda: 68×68 fijo
      '<div class="wg-m-ring">' +
        '<svg width="68" height="68" viewBox="0 0 68 68">' +
          '<circle cx="34" cy="34" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="5"/>' +
          '<circle cx="34" cy="34" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="5"' +
            ' stroke-dasharray="' + circ + '" stroke-dashoffset="' + offset + '"' +
            ' stroke-linecap="round" transform="rotate(-90 34 34)"/>' +
        '</svg>' +
        '<div class="wg-m-ring-val" style="color:' + color + '">' + (done ? '✓' : pct + '%') + '</div>' +
      '</div>' +
      // Info derecha: min-width:0 permite ellipsis
      '<div class="wg-m-train-info">' +
        '<span class="wg-m-emoji">💪</span>' +
        '<div class="wg-m-train-name">' + name + '</div>' +
        (data.training.nextSession && !done
          ? '<div class="wg-m-train-next">Próximo: ' + data.training.nextSession + '</div>'
          : '') +
      '</div>' +
    '</div>' +
    '<button class="wg-btn-full" style="color:' + color + (done ? ';opacity:0.55;pointer-events:none' : '') + '"' +
      ' onclick="event.stopPropagation();' + (done ? '' : 'showPage(\'training\')') + '">' + btnLabel + '</button>' +
  '</div>';
}

// LARGE WIDGET
function renderWidgetLarge(data) {
  data = data || getWidgetData();
  var s = data.score;
  var sc = s >= 85 ? '#34d399' : s >= 70 ? '#4d8aff' : s >= 50 ? '#fbbf24' : '#f87171';
  var waterPct = Math.min(100, Math.round(data.water.current / data.water.goal * 100));
  var wc = waterPct >= 80 ? '#34d399' : waterPct >= 50 ? '#4d8aff' : '#94a3b8';
  var mealsDone = [data.meals.breakfast, data.meals.lunch, data.meals.snack, data.meals.dinner].filter(Boolean).length;
  var mc = mealsDone >= 3 ? '#34d399' : mealsDone >= 2 ? '#fbbf24' : '#94a3b8';
  var tc = data.training.done ? '#34d399' : data.training.pct > 0 ? '#fbbf24' : '#4d8aff';

  // Score arc — r=38
  var r = 38; var circ = (2 * Math.PI * r).toFixed(1);
  var sOffset = (circ * (1 - s / 100)).toFixed(1);

  // Meal icons inline
  var mKeys = ['breakfast','lunch','snack','dinner'];
  var mIcons = ['🌅','☀️','🍎','🌙'];
  var mDots = mKeys.map(function(k, i) {
    return '<span style="font-size:12px;opacity:' + (data.meals[k] ? '1' : '0.2') + '">' + mIcons[i] + '</span>';
  }).join('');

  return '<div class="wg wg-large wg-l-dash">' +

    // Row 1: Score hero
    '<div class="wg-l-hero" onclick="showPage(\'home\')" style="cursor:pointer">' +
      '<div class="wg-l-ring">' +
        '<svg width="90" height="90" viewBox="0 0 90 90">' +
          '<circle cx="45" cy="45" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>' +
          '<circle cx="45" cy="45" r="' + r + '" fill="none" stroke="' + sc + '" stroke-width="6"' +
            ' stroke-dasharray="' + circ + '" stroke-dashoffset="' + sOffset + '"' +
            ' stroke-linecap="round" transform="rotate(-90 45 45)" style="filter:drop-shadow(0 0 6px ' + sc + '44)"/>' +
        '</svg>' +
        '<div class="wg-l-score" style="color:' + sc + '">' + s + '</div>' +
      '</div>' +
      '<div class="wg-l-hero-text">' +
        '<div class="wg-l-date">' + _widgetTodayLabel() + '</div>' +
        '<div class="wg-l-verdict" style="color:' + sc + '">' + _widgetScoreLabel(s) + '</div>' +
        '<div class="wg-l-sub">/100 puntos del día</div>' +
      '</div>' +
    '</div>' +

    // Divider
    '<div style="height:1px;background:rgba(255,255,255,0.06);margin:14px 0"></div>' +

    // Row 2: 3 metric tiles
    '<div class="wg-l-tiles">' +
      // Agua
      '<div class="wg-l-tile" onclick="event.stopPropagation();showPage(\'recuperacion\')">' +
        '<div class="wg-l-tile-icon">💧</div>' +
        '<div class="wg-l-tile-val" style="color:' + wc + '">' + waterPct + '<span style="font-size:11px">%</span></div>' +
        '<div class="wg-l-tile-bar"><div style="width:' + waterPct + '%;height:3px;border-radius:2px;background:' + wc + '"></div></div>' +
      '</div>' +
      // Comidas
      '<div class="wg-l-tile" onclick="event.stopPropagation();showPage(\'nutricion\')">' +
        '<div class="wg-l-tile-icon">🍽</div>' +
        '<div class="wg-l-tile-val" style="color:' + mc + '">' + mealsDone + '<span style="font-size:11px">/4</span></div>' +
        '<div style="display:flex;gap:3px;justify-content:center;margin-top:4px">' + mDots + '</div>' +
      '</div>' +
      // Entreno
      '<div class="wg-l-tile" onclick="event.stopPropagation();showPage(\'training\')">' +
        '<div class="wg-l-tile-icon">💪</div>' +
        '<div class="wg-l-tile-val" style="color:' + tc + '">' + (data.training.done ? '✓' : data.training.pct + '<span style="font-size:11px">%</span>') + '</div>' +
        '<div class="wg-l-tile-bar"><div style="width:' + data.training.pct + '%;height:3px;border-radius:2px;background:' + tc + '"></div></div>' +
      '</div>' +
    '</div>' +

    // Row 3: quick actions
    '<div class="wg-l-actions">' +
      '<button class="wg-l-act" onclick="event.stopPropagation();addWater(250);_refreshWidgetPreview()">💧 +Agua</button>' +
      '<button class="wg-l-act wg-l-act-primary" onclick="event.stopPropagation();showPage(\'training\')">▶ Entrenar</button>' +
      '<button class="wg-l-act" onclick="event.stopPropagation();openAIChat()">✨ IA</button>' +
    '</div>' +

  '</div>';
}

function _widgetTodayLabel() {
  var d = new Date();
  var days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return days[d.getDay()] + ' ' + d.getDate() + ' ' + months[d.getMonth()];
}

function _widgetScoreLabel(score) {
  if (score >= 90) return '🏆 ¡Día excelente!';
  if (score >= 75) return '💪 Muy bien';
  if (score >= 60) return '📈 Buen ritmo';
  if (score >= 40) return '⚡ En progreso';
  return '🎯 Empezá ahora';
}

// ─── WIDGET PREVIEW PAGE ──────────────────────────────────────────
var _widgetSimState = null;

function renderWidgetPreview() {
  var container = document.getElementById('widgetPreviewContainer');
  if (!container) return;
  var data = getWidgetData(_widgetSimState);

  container.innerHTML =
    // Selector de estado
    '<div class="wg-preview-sim">' +
      '<div class="wg-preview-sim-label">Simular estado:</div>' +
      '<div class="wg-preview-sim-btns">' +
        ['empty','mid','full',null].map(function(s) {
          var label = s === 'empty' ? 'Vacío' : s === 'mid' ? 'A medias' : s === 'full' ? 'Completo' : 'Real';
          var active = _widgetSimState === s;
          return '<button class="wg-sim-btn' + (active ? ' active' : '') + '"' +
            ' onclick="_widgetSetSim(' + JSON.stringify(s) + ')">' + label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +

    // Small widgets
    '<div class="wg-preview-section">' +
      '<div class="wg-preview-section-title">Widgets pequeños</div>' +
      '<div class="wg-row-small">' +
        renderWidgetSmall('score', data) +
        renderWidgetSmall('water', data) +
        renderWidgetSmall('training', data) +
        renderWidgetSmall('meal', data) +
      '</div>' +
    '</div>' +

    // Medium widgets
    '<div class="wg-preview-section">' +
      '<div class="wg-preview-section-title">Widgets medianos</div>' +
      renderWidgetMedium('water', data) +
      renderWidgetMedium('meals', data) +
      renderWidgetMedium('training', data) +
    '</div>' +

    // Large widget
    '<div class="wg-preview-section">' +
      '<div class="wg-preview-section-title">Widget grande</div>' +
      renderWidgetLarge(data) +
    '</div>';
}

function _widgetSetSim(s) {
  _widgetSimState = s;
  renderWidgetPreview();
}

function _refreshWidgetPreview() {
  // Llama al re-render si el preview está abierto
  var container = document.getElementById('widgetPreviewContainer');
  if (container && container.offsetParent !== null) renderWidgetPreview();
}

// ─── NAVEGACIÓN A PREVIEW ─────────────────────────────────────────
function openWidgetPreview() {
  var existing = document.getElementById('widgetPreviewOverlay');
  if (existing) { existing.remove(); return; }

  var overlay = document.createElement('div');
  overlay.id = 'widgetPreviewOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9500;background:var(--bg);overflow-y:auto;display:flex;flex-direction:column';
  overlay.innerHTML =
    '<div style="position:sticky;top:0;z-index:1;background:var(--bg2);border-bottom:1px solid var(--border);' +
      'padding:12px 16px;display:flex;align-items:center;justify-content:space-between;' +
      'padding-top:calc(12px + env(safe-area-inset-top))">' +
      '<div>' +
        '<div style="font-size:15px;font-weight:700;color:var(--text)">🧩 Widgets</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-top:1px">Vista previa y acciones rápidas</div>' +
      '</div>' +
      '<button onclick="document.getElementById(\'widgetPreviewOverlay\').remove()" ' +
        'style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;' +
        'padding:6px 14px;color:var(--text);font-size:13px;font-weight:600;cursor:pointer">Cerrar</button>' +
    '</div>' +
    '<div id="widgetPreviewContainer" style="padding:16px;flex:1"></div>';

  document.body.appendChild(overlay);
  renderWidgetPreview();
}

// Exponer al scope global
window.getWidgetData       = getWidgetData;
window.renderWidgetSmall   = renderWidgetSmall;
window.renderWidgetMedium  = renderWidgetMedium;
window.renderWidgetLarge   = renderWidgetLarge;
window.renderWidgetPreview = renderWidgetPreview;
window.openWidgetPreview   = openWidgetPreview;
window._widgetSetSim       = _widgetSetSim;
window._refreshWidgetPreview = _refreshWidgetPreview;