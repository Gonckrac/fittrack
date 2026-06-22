// ─── DAILY MOTIVATIONAL CARDS (from mama) ─────────────────────────────────
var DAILY_MOTIV = [
  { emoji:'🌟', title:'¡Hoy es tu día!', msg:'Cada vez que abrís esta app estás eligiendo cuidarte. Eso es una decisión valiente.' },
  { emoji:'💪', title:'¡Sos más fuerte de lo que creés!', msg:'Cada pequeño hábito que construís suma. No subestimes lo que estás logrando.' },
  { emoji:'🎯', title:'¡Foco en el camino!', msg:'Los resultados llegan cuando los hábitos se repiten. Vos ya estás en el camino correcto.' },
  { emoji:'🔥', title:'¡Sin excusas!', msg:'Empezar el día con intención es lo que separa a quienes logran sus metas.' },
  { emoji:'🏆', title:'¡Un campeón silencioso!', msg:'No necesitás aplausos para hacer las cosas bien. Vos las hacés porque te importás. ¡Admirable!' },
  { emoji:'✨', title:'¡Constancia es clave!', msg:'No hace falta ser perfecto, hace falta ser consistente. Y vos lo sos.' },
  { emoji:'⭐', title:'¡El proceso funciona!', msg:'Todo lo que estás haciendo tiene un efecto real en tu cuerpo y tu mente. ¡Creéle al proceso!' },
];

function renderDailyMotiv() {
  var idx = ((new Date(TODAY).getDate()) + (new Date(TODAY).getMonth() * 7)) % DAILY_MOTIV.length;
  var m = DAILY_MOTIV[idx];
  var e = document.getElementById('dailyMotivEmoji');
  var t = document.getElementById('dailyMotivTitle');
  var msg = document.getElementById('dailyMotivMsg');
  if (e) e.textContent = m.emoji;
  if (t) t.textContent = m.title;
  if (msg) msg.textContent = m.msg;
}

// ─── WEIGHT GOAL BAR (from mama) ──────────────────────────────────────────
function renderWeightGoalBar() {
  var hist = state.metricsHistory || [];
  var cfg = state.config || {};
  var goal = cfg.goal || 'cut';
  var startWeight = cfg.weight || null; // weight from setup
  var latest = hist[0];
  var currentWeight = latest && latest.weight ? latest.weight : (startWeight || null);

  // Big weight display
  var bigEl = document.getElementById('weightBig');
  if (bigEl) bigEl.textContent = currentWeight ? currentWeight.toFixed(1) : '—';

  // Badge label based on goal
  var GOAL_LABELS = {
    cut_aggressive: '🔥 Bajando agresivo',
    cut: '📉 En déficit',
    maintain: '⚖️ Mantenimiento',
    lean_bulk: '💪 Lean Bulk',
    bulk: '🏋️ Volumen'
  };
  var badge = document.getElementById('weightGoalBadge');
  if (badge) badge.textContent = GOAL_LABELS[goal] || '';

  // Delta vs previous
  var deltaEl = document.getElementById('weightDelta');
  if (deltaEl && hist.length >= 2 && hist[0].weight && hist[1].weight) {
    var delta = hist[0].weight - hist[1].weight;
    var sign = delta > 0 ? '+' : '';
    var isGoodDelta = (goal==='cut'||goal==='cut_aggressive') ? delta<=0 : delta>=0;
    deltaEl.textContent = sign + delta.toFixed(1) + ' kg';
    deltaEl.style.color = isGoodDelta ? 'var(--green)' : 'var(--red)';
  } else if (deltaEl) {
    deltaEl.textContent = '';
  }

  // Progress bar
  var fillEl = document.getElementById('weightProgressFill');
  var startLbl = document.getElementById('wgStartLbl');
  var targetLbl = document.getElementById('wgTargetLbl');
  var statusEl = document.getElementById('weightProgressStatus');

  if (!currentWeight || !startWeight) {
    if (fillEl) fillEl.style.width = '0%';
    if (statusEl) statusEl.textContent = 'Registrá tu primera medición para ver el progreso.';
    if (startLbl) startLbl.textContent = 'Inicio: ' + (startWeight ? startWeight.toFixed(1)+' kg' : '—');
    if (targetLbl) targetLbl.textContent = 'Meta: —';
    return;
  }

  var targetWeight, pct, statusMsg, fillColor;
  var isLoss = goal==='cut'||goal==='cut_aggressive';
  var isGain = goal==='lean_bulk'||goal==='bulk';

  if (isLoss) {
    var lossGoal = goal==='cut_aggressive' ? 0.1 * startWeight : 0.07 * startWeight; // 10% or 7%
    targetWeight = Math.max(startWeight - lossGoal, 50);
    var lost = startWeight - currentWeight;
    pct = Math.min(100, Math.max(0, Math.round(lost / lossGoal * 100)));
    fillColor = 'var(--accent)';
    var rem = Math.max(0, currentWeight - targetWeight);
    statusMsg = rem <= 0 ? '🏆 ¡Meta alcanzada!' :
                pct >= 50 ? '⚡ '+pct+'% del camino — ¡vas muy bien! Faltan '+rem.toFixed(1)+' kg' :
                '📍 '+pct+'% del camino — Faltan '+rem.toFixed(1)+' kg';
  } else if (isGain) {
    var gainGoal = 0.05 * startWeight; // +5%
    targetWeight = startWeight + gainGoal;
    var gained = currentWeight - startWeight;
    pct = Math.min(100, Math.max(0, Math.round(gained / gainGoal * 100)));
    fillColor = 'var(--yellow)';
    var remG = Math.max(0, targetWeight - currentWeight);
    statusMsg = remG <= 0 ? '🏆 ¡Primera meta alcanzada!' :
                '📈 +'+Math.max(0,gained).toFixed(1)+' kg ganados — Faltan '+remG.toFixed(1)+' kg para la meta';
  } else {
    // maintain: show ±1kg tolerance
    targetWeight = startWeight;
    var diff = Math.abs(currentWeight - startWeight);
    pct = Math.min(100, Math.max(0, Math.round((1 - diff) * 100)));
    fillColor = 'var(--green)';
    statusMsg = diff <= 0.5 ? '✅ Peso estable — perfecto' :
                diff <= 1.0 ? '⚠ '+diff.toFixed(1)+' kg de variación — en rango' :
                '❌ '+diff.toFixed(1)+' kg de variación — revisá tu ingesta';
  }

  if (fillEl) { fillEl.style.width = pct+'%'; fillEl.style.background = fillColor; }
  if (startLbl) startLbl.textContent = 'Inicio: ' + startWeight.toFixed(1) + ' kg';
  if (targetLbl) targetLbl.textContent = 'Meta: ' + targetWeight.toFixed(1) + ' kg';
  if (statusEl) statusEl.textContent = statusMsg;
}

// ═══════════════════════════════════════════════════════════════════════════
// DYNAMIC TARGETS — reads from state.config if available, else uses defaults
// ═══════════════════════════════════════════════════════════════════════════
function getDynamicTargets() {
  var cfg = state.config;
  if (cfg && cfg.kcal) {
    return { prot:cfg.prot||190, carb:cfg.carb||240, fat:cfg.fat||70, kcal:cfg.kcal||2400 };
  }
  return { prot:190, carb:240, fat:70, kcal:2400 };
}

function getDynamicSupps() {
  var cfg = state.config;
  if (cfg && cfg.supps && cfg.supps.length) {
    return cfg.supps.map(function(s, i) {
      var group = s.time === 'morning' ? 'morning' : s.time === 'noon' ? 'noon' : 'night';
      var timeLabel = s.time === 'morning' ? 'Mañana' : s.time === 'noon' ? 'Mediodía' : 'Noche';
      return { id:s.id || ('cfg_supp_'+i), name:s.name, dose:s.dose, time:timeLabel, group:group };
    });
  }
  return [];
}
