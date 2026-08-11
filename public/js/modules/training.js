// ─── TRAINING ────────────────────────────────────────────────────
let trainingSets = {};

// Traduce nombres de músculos del inglés al español (solo visualización)
function _translateMuscle(name) {
  if (!name) return name;
  var map = {
    'quads':       'cuádriceps',
    'glutes':      'glúteos',
    'abs':         'abdominales',
    'hamstrings':  'isquiotibiales',
    'calves':      'pantorrillas',
    'chest':       'pecho',
    'back':        'espalda',
    'shoulders':   'hombros',
    'biceps':      'bíceps',
    'triceps':     'tríceps',
    'forearms':    'antebrazos',
    'core':        'core',
    'lats':        'dorsales',
    'traps':       'trapecios',
    'glute':       'glúteo'
  };
  return name.split(',').map(function(part) {
    var trimmed = part.trim().toLowerCase();
    return map[trimmed] || part.trim();
  }).join(', ');
}
// ─── TRAINING SESSION HELPERS ────────────────────────────────────

// Volumen total de una sesión: suma kg×reps de sets completados
function _calcSessionVolume(savedSets) {
  var total = 0;
  Object.values(savedSets).forEach(function(exSets) {
    (exSets || []).forEach(function(s) {
      if (!s.done) return;
      var kg   = parseFloat(s.kg) || 0;
      var reps = parseFloat(String(s.reps || '').replace(/[^0-9]/g, '')) || 0;
      total += kg * reps;
    });
  });
  return Math.round(total);
}

// Cuenta ejercicios completos (todos sus sets done) y total
function _calcExProgress(savedSets, exercises) {
  var done = 0;
  exercises.forEach(function(ex, exIdx) {
    var exSets = savedSets[exIdx] || [];
    if (exSets.length > 0 && exSets.every(function(s){ return s.done; })) done++;
  });
  return { done: done, total: exercises.length };
}

// Inicia la sesión: setea el flag y re-renderiza
function startTraining() {
  state[TODAY].trainingStarted = true;
  if (!state[TODAY].trainingPaused) state[TODAY].trainingStartedAt = Date.now();
  state[TODAY].trainingPaused = false;
  saveState(state);
  if (typeof startSessionTimer === 'function') startSessionTimer();
  renderTraining();
  var firstCard = document.getElementById('excard-0');
  if (firstCard) {
    firstCard.classList.add('open');
    setTimeout(function() {
      firstCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }
}
function _pauseTraining() {
  if (typeof _togglePauseSessionBanner === 'function') _togglePauseSessionBanner();
  else if (typeof stopSessionTimer === 'function') stopSessionTimer();
  state[TODAY].trainingPaused = true;
  state[TODAY].trainingStarted = false;
  saveState(state);
  showToast('⏸ Entrenamiento pausado');
  renderTraining();
}

function _cancelTraining() {
  if (!confirm('¿Cancelar el entrenamiento? Se perderán los sets no completados.')) return;
  if (typeof stopSessionTimer === 'function') stopSessionTimer();
  const day = state[TODAY].trainDay;
  state[TODAY].trainingStarted = false;
  state[TODAY].trainingPaused = false;
  delete state[TODAY].trainingStartedAt;
  delete state[TODAY]['trainSets_' + day];
  saveState(state);
  showToast('✕ Entrenamiento cancelado');
  renderTraining();
  renderHome();
}

function _finishTrainingEarly() {
  if (typeof stopSessionTimer === 'function') stopSessionTimer();
  state[TODAY].trainingStarted = false;
  state[TODAY].trainingStartedAt = null;
  saveState(state);
  showToast('🏁 Entrenamiento finalizado');
  renderTraining();
  renderHome();
}

// ─── DOUBLE PROGRESSION TARGET ───────────────────────────────────
function getProgressionTarget(exName, ex) {  const history = (state.exerciseHistory||{})[exName]||[];
  if(history.length===0) return null;
  const latest = history[0];
  if(ex.noTopRep) return {type:'info',line1:`Última: ${latest.maxKg||'—'} × ${latest.avgReps||'?'}`,line2:'Igualá o superá esa marca hoy.'};
const topRep = ex.topRep;
  const avgReps = latest.avgReps||0;
  if(!latest.maxKg) return null;
  // Si no hay topRep definido (ejercicio manual), mostrar solo info sin mencionar tope
  if(!topRep) {
    const repRange = parseRepRange(ex.reps);
    const maxTarget = repRange ? repRange.max : null;
    if (maxTarget && avgReps >= maxTarget) return null;
    const goal = maxTarget || (avgReps + 1);
    return{type:'info', line1:`💪 Apuntá a ${goal} reps para poder subir de peso`, line2:`Última sesión: ${latest.maxKg}kg × ${avgReps} reps`};
  }
  if(avgReps>=topRep){
    const nextKg=(+latest.maxKg+2.5).toFixed(1);
    return{type:'warn',line1:`🔼 Subí a ${nextKg}kg × ${ex.reps} reps`,line2:`Última: ${latest.maxKg}kg × ${avgReps} reps — TOPE ${topRep} ALCANZADO ✓`};
  } else {
    const nextReps=avgReps+1;
    return{type:'info',line1:`🎯 Apuntá a ${latest.maxKg}kg × ${nextReps} reps`,line2:`Última: ${latest.maxKg}kg × ${avgReps} reps | Tope para subir peso: ${topRep}`};
  }
}

// Check if completing these sets is a new PR
function checkIfPR(exName, sets) {
  const history = (state.exerciseHistory || {})[exName] || [];
  const kgVals = sets.map(s => parseFloat(s.kg)).filter(v => !isNaN(v) && v > 0);
  if (!kgVals.length) return false;
  const maxKg = Math.max(...kgVals);
  const repsVals = sets.map(s => parseFloat(s.reps)).filter(v => !isNaN(v) && v > 0);
  const avgReps = repsVals.length ? Math.round(repsVals.reduce((a,b)=>a+b,0)/repsVals.length) : 0;
  const oneRM = avgReps ? Math.round(maxKg * (1 + avgReps / 30)) : maxKg;
  const prevBest = history.length ? Math.max(...history.map(h => h.oneRM || h.maxKg)) : 0;
  return oneRM > prevBest;
}

function setTrainDay(day) {
  state[TODAY].trainDay = day;
  trainingSets = {};
  saveState(state);
  updateHeader();
  renderTrainingDaySelector();
  renderTraining();
  _renderSessionTimer();

}

// Returns the training data object for the current day from config or null
function getConfigTraining() {
  var cfg = state.config;
  if (cfg && cfg.training && cfg.training.length > 0) {
    var day = state[TODAY].trainDay;
    if (day === 0) return null; // rest
    var d = cfg.training[day - 1];
    if (!d) return null;
    // Day with no exercises = rest day
    if (!d.exercises || d.exercises.length === 0) return null;
    var mappedExercises = d.exercises.map(function(ex) {
      return { name: ex.name, muscle: ex.muscle || '', sets: parseInt(ex.sets) || 3, reps: ex.reps || '8-12', noTopRep: false, ssGroup: ex.ssGroup || null, ssPart: ex.ssPart || null, ssRestSec: ex.ssRestSec || null, isTimeBased: !!ex.isTimeBased, restSec: ex.restSec || null, setRIRs: ex.setRIRs || null };
    });
    var supersets = [];
    mappedExercises.forEach(function(ex) {
      if (ex.ssGroup && ex.ssPart === 'a') {
        var partnerB = mappedExercises.find(function(e) { return e.ssGroup === ex.ssGroup && e.ssPart === 'b'; });
        if (partnerB) supersets.push({ id: ex.ssGroup, label: 'Superserie — ' + ex.name + ' + ' + partnerB.name });
      }
    });
    return {
      name: d.name,
      supersets: supersets,
      exercises: mappedExercises
    };
  }
  return null;
}

function renderWeekStrip() { return; /* replaced by _renderPremiumTraining */ }
function _renderWeekStripLegacy() {
  if (!strip) return;
  var cfg = state.config;
  var cycle = cfg && cfg.cycle;
  var training = cfg && cfg.training;
  var dowKeys = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var dowLabels = ['D','L','M','X','J','V','S'];
  var today = new Date().getDay();

  var html = '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">';
  for (var i = 0; i < 7; i++) {
    var key = dowKeys[i];
    var label = dowLabels[i];
    var isToday = i === today;
    var dayIdx = cycle ? cycle[key] : null;
    var routineName = null;
 var isSport = dayIdx === 'sport';
    var isRest = true;
    if (isSport) {
      var _sn = (cfg.sportNames && cfg.sportNames[key]) || 'Deporte';
      var _sportEmojiMap = { Correr:'🏃', Bici:'🚴', Caminata:'🚶', HIIT:'🔥', Natación:'🏊', Pilates:'🧘', Fútbol:'⚽', Tenis:'🎾', Pádel:'🏓', Otro:'🏅' };
      var _se = (window._airCustomEmojis && window._airCustomEmojis[_sn]) || _sportEmojiMap[_sn] || '🏅';
      routineName = _se;
      isRest = false;
    } else if (dayIdx !== null && dayIdx !== undefined && dayIdx !== -1 && dayIdx !== '-1') {
      var dIdx = parseInt(dayIdx);
      if (training && training[dIdx]) {
        routineName = training[dIdx].name;
        isRest = false;
      }
    }

    // Truncate name to fit in small square
    var shortName = '';
    if (!isRest && !isSport && routineName) {
      shortName = routineName.length > 6 ? routineName.substring(0,5)+'…' : routineName;
 } else if (isSport) {
      shortName = routineName; // ya tiene el emoji correcto
    }

    // Check if trained today (has sets recorded)
    var dateForDay = new Date();
    var diff = i - today;
    dateForDay.setDate(dateForDay.getDate() + diff);
    var ds = dateForDay.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    var dd = state[ds];
    var hasSets = dd && Object.keys(dd).some(function(k){ return k.startsWith('trainSets_'); });
    var score = hasSets ? calcDayScoreForDate(ds) : null;

    var bg, border, textCol;
    if (isToday) {
      bg = 'rgba(77,138,255,0.15)';
      border = '1.5px solid var(--accent)';
      textCol = 'var(--accent)';
    } else if (isRest) {
      bg = 'var(--bg3)';
      border = '1px solid var(--border)';
      textCol = 'var(--text3)';
    } else if (score !== null && score >= 85) {
      bg = 'rgba(50,220,100,0.2)';
      border = '1px solid rgba(50,220,100,0.5)';
      textCol = 'var(--green)';
    } else if (score !== null && score >= 60) {
      bg = 'rgba(255,170,40,0.18)';
      border = '1px solid rgba(255,170,40,0.4)';
      textCol = '#ffa828';
} else if (score !== null) {
      bg = 'var(--bg3)';
      border = '1px solid var(--border)';
      textCol = 'var(--text2)';
    } else {
      bg = 'var(--bg3)';
      border = '1px solid var(--border)';
      textCol = isRest ? 'var(--text3)' : 'var(--text2)';
    }

var nameLineContent = isRest ? '—' : (isSport ? routineName : shortName || 'D' + (parseInt(dayIdx)+1));
    html += '<div style="background:' + bg + ';border:' + border + ';border-radius:8px;padding:6px 2px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:58px;cursor:pointer" onclick="_openDayModal(\'' + key + '\')">'
      + '<div style="font-size:9px;font-weight:700;color:' + textCol + ';letter-spacing:0.3px">' + label + '</div>'
      + '<div style="font-size:9px;font-weight:600;color:' + textCol + ';text-align:center;line-height:1.2;margin-top:3px;padding:0 1px;word-break:break-word">' + nameLineContent + '</div>'
      + '</div>';
  }
  html += '</div>';
  strip.innerHTML = html;
}

function _openDayModal(dow) {
  var existing = document.getElementById('weekDayModal'); if (existing) existing.remove();
  var cfg = state.config;
  var cycle = cfg && cfg.cycle;
  var training = cfg && cfg.training;
  var dowLabels = { Sun:'Domingo', Mon:'Lunes', Tue:'Martes', Wed:'Miércoles', Thu:'Jueves', Fri:'Viernes', Sat:'Sábado' };
  var label = dowLabels[dow] || dow;

  var dayIdx = cycle ? cycle[dow] : null;
  var isSport = dayIdx === 'sport';
  var hasGym = false;
  var routineName = null;

  if (isSport) {
    routineName = 'Deporte / Actividad';
  } else if (dayIdx !== null && dayIdx !== undefined && dayIdx !== -1 && dayIdx !== '-1') {
    var dIdx = parseInt(dayIdx);
    if (training && training[dIdx]) {
      hasGym = !training[dIdx].isSport;
      isSport = training[dIdx].isSport || false;
      routineName = training[dIdx].name;
    }
  }

var isAssigned = isSport || hasGym;

  // Siempre: agregar deporte/actividad
  // Si ya hay gym: editar gym. Si no hay gym: agregar gym.
  // Sin botón "quitar asignación" (el chip ✕ en edit week lo maneja)
  var gymBtn = hasGym
    ? '<button onclick="_weekDayEditGym(\'' + dow + '\')" style="width:100%;text-align:left;padding:14px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;font-size:13px;color:var(--accent);margin-bottom:8px">✏️ Modificar rutina gym</button>'
    : '<button onclick="_weekDayAddGym(\'' + dow + '\')" style="width:100%;text-align:left;padding:14px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;font-size:13px;color:var(--accent);margin-bottom:8px">🏋️ Agregar rutina gym</button>';

  var btnsHtml = gymBtn
    + '<button onclick="_weekDayAddSport(\'' + dow + '\')" style="width:100%;text-align:left;padding:14px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;font-size:13px;color:var(--green);margin-bottom:8px">⚽ Agregar deporte / actividad</button>';

  var removeBtn = '';

  var subtitle = !isAssigned ? 'Día libre' : (isSport ? '⚽ ' + (routineName || 'Deporte') : '🏋️ ' + (routineName || 'Rutina gym'));

  var modal = document.createElement('div');
  modal.id = 'weekDayModal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  modal.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px">'
      + '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>'
      + '<div style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:4px">' + label + '</div>'
      + '<div style="font-size:12px;color:var(--text3);margin-bottom:20px">' + subtitle + '</div>'
      + btnsHtml
      + removeBtn
      + '<button onclick="document.getElementById(\'weekDayModal\').remove()" class="btn btn-ghost" style="width:100%;margin-top:4px">Cancelar</button>'
    + '</div>';
  modal.addEventListener('click', function(e){ if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

function _weekDayAddSport(dow) {
  document.getElementById('weekDayModal') && document.getElementById('weekDayModal').remove();
  _showSportPicker(dow);
}

function _showSportPicker(dow) {
  var existing = document.getElementById('sportPickerSheet');
  if (existing) existing.remove();

  var dowLabels = { Sun:'Domingo', Mon:'Lunes', Tue:'Martes', Wed:'Miércoles', Thu:'Jueves', Fri:'Viernes', Sat:'Sábado' };

  // Actividades del perfil del usuario (para marcar las que ya eligió antes)
  var userActivities = (state.user && state.user.activities) || [];
  var userActivityNames = userActivities.map(function(a){ return a.name; });

  var categories = [
    {
      label: 'Cardio',
      items: [
        { name: 'Correr',   emoji: '🏃', type: 'cardio', detail: { km: true, duration: true } },
        { name: 'Bici',     emoji: '🚴', type: 'cardio', detail: { km: true, duration: true } },
        { name: 'Caminata', emoji: '🚶', type: 'cardio', detail: { km: true, duration: true } },
        { name: 'HIIT',     emoji: '🔥', type: 'cardio', detail: { duration: true } },
        { name: 'Natación', emoji: '🏊', type: 'cardio', detail: { duration: true } },
        { name: 'Pilates',  emoji: '🧘', type: 'cardio', detail: { duration: true } }
      ]
    },
    {
      label: 'Deportes',
      items: [
        { name: 'Fútbol',   emoji: '⚽', type: 'sport', detail: {} },
        { name: 'Tenis',    emoji: '🎾', type: 'sport', detail: {} },
        { name: 'Pádel',    emoji: '🏓', type: 'sport', detail: {} },
        { name: 'Otro',     emoji: '🏅', type: 'sport', detail: {} }
      ]
    }
  ];

function _buildCard(s) {
var id = 'spcard_' + s.name.replace(/\s/g,'_');
    return '<div id="' + id + '" '
      + 'style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;'
      + 'border:1.5px solid var(--border);background:var(--bg3);cursor:pointer;margin-bottom:6px">'
      + '<div style="font-size:24px;line-height:1">' + s.emoji + '</div>'
      + '<div style="font-size:13px;font-weight:600;color:var(--text)">' + s.name + '</div>'
      + '</div>';
  }

  var categoriesHtml = categories.map(function(cat) {
    return '<div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:0.5px;text-transform:uppercase;margin:14px 0 8px">' + cat.label + '</div>'
      + cat.items.map(_buildCard).join('');
  }).join('');

  var sheet = document.createElement('div');
  sheet.id = 'sportPickerSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:10000;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px;max-height:88vh;overflow-y:auto">'
    + '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>'
    + '<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:2px">¿Qué actividad querés incluir?</div>'
    + '<div style="font-size:12px;color:var(--text3);margin-bottom:4px">' + (dowLabels[dow] || dow) + ' · aunque no la hayas hecho antes</div>'
    + categoriesHtml
    + '<button onclick="document.getElementById(\'sportPickerSheet\').remove()" class="btn btn-ghost" style="width:100%;margin-top:12px">Cancelar</button>'
    + '</div>';
  sheet.addEventListener('click', function(e){
    if (e.target === sheet) { sheet.remove(); return; }
    var emojiEl = e.target.closest('[data-emoji]');
    if (emojiEl && emojiEl.closest('#customEmojiGrid')) {
      _customSportPickEmoji(emojiEl, emojiEl.getAttribute('data-emoji'));
    }
  });
  document.body.appendChild(sheet);
// Asignar eventos después de insertar en DOM
  categories.forEach(function(cat) {
    cat.items.forEach(function(s) {
      var id = 'spcard_' + s.name.replace(/\s/g,'_');
      var el = document.getElementById(id);
      if (el) (function(sport) {
        el.addEventListener('click', function() {
          if (sport.name === 'Otro') {
            _showCustomSportSheet(dow);
          } else {
            _assignSportDay(dow, sport.name, sport.type, sport.detail);
          }
        });
      })(s);
    });
  });
}

function _showCustomSportSheet(dow) {
  document.getElementById('sportPickerSheet') && document.getElementById('sportPickerSheet').remove();
  window._customSportEmoji = '🏅';

  var allEmojis = ['🏃','🚴','🏊','🧘','🚶','🔥','🏋️','⚽','🎾','🏓','🏸','🥊','🤸','🧗','🏄','🚣','🤺','🎿','⛷️','🛹','🏇','🤼','🏒','🥋','🎯','🏌️','🪂','🤿','🏆','💪','⚡','🌊','🏔️','🌲','🎽','🧢','👟','🎱','🏹','🥅'];

  var sheet = document.createElement('div');
  sheet.id = 'customSportSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:99999;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 36px;width:100%;max-width:480px">'
    + '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>'
    + '<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:12px">Actividad personalizada</div>'
    + '<div style="font-size:11px;color:var(--text3);margin-bottom:6px;font-weight:600">NOMBRE (máx. 20 caracteres)</div>'
    + '<input id="customSportName" class="inp" placeholder="Ej: Esquí, Surf, Boxeo…" maxlength="20" style="margin-bottom:16px">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
      + '<div style="font-size:11px;color:var(--text3);font-weight:600">EMOJI (máx. 1)</div>'
      + '<div style="font-size:28px" id="customEmojiPreview">🏅</div>'
    + '</div>'
    + '<div id="customEmojiGrid" style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px;margin-bottom:16px;max-height:180px;overflow-y:auto">' + allEmojis.map(function(e,i){ var sel = e===window._customSportEmoji ? 'background:rgba(77,138,255,0.2);border-color:var(--accent);' : ''; return '<div data-idx="'+i+'" data-emoji="' + e + '" style="height:44px;display:flex;align-items:center;justify-content:center;font-size:24px;border-radius:10px;border:2px solid transparent;cursor:pointer;' + sel + '">' + e + '</div>'; }).join('') + '</div>'
    + '<button onclick="_confirmCustomSport(\'' + dow + '\')" style="width:100%;padding:12px;border-radius:12px;background:var(--accent);border:none;color:#fff;font-size:14px;font-weight:700;cursor:pointer">✓ Agregar actividad</button>'
    + '<button onclick="document.getElementById(\'customSportSheet\').remove()" class="btn btn-ghost" style="width:100%;margin-top:8px">Cancelar</button>'
    + '</div>';
  sheet.addEventListener('click', function(e){
    if (e.target === sheet) { sheet.remove(); return; }
    var emojiEl = e.target.closest ? e.target.closest('[data-emoji]') : null;
    if (emojiEl && emojiEl.closest('#customEmojiGrid')) {
      _customSportPickEmoji(emojiEl, emojiEl.getAttribute('data-emoji'));
    }
  });
  document.body.appendChild(sheet);
}

function _customSportPickEmoji(el, emoji) {
  window._customSportEmoji = emoji;
  var grid = document.getElementById('customEmojiGrid');
  if (grid) grid.querySelectorAll('[data-emoji]').forEach(function(e){
    e.style.background = 'none';
    e.style.borderColor = 'transparent';
  });
  if (el) { el.style.background = 'rgba(77,138,255,0.2)'; el.style.borderColor = 'var(--accent)'; }
  var preview = document.getElementById('customEmojiPreview');
  if (preview) preview.textContent = emoji;
}

function _customSportEmojiPage(page) {
  var emojiCategories = [
    ['🏃','🚴','🏊','🧘','🚶','🔥','🏋️','⚽','🎾','🏓','🏸','🥊','🤸','🧗','🏄','🚣','🤺','🎿','⛷️','🛹'],
    ['🏇','🤼','🏒','🥋','🎯','🏌️','🪂','🤿','🧜','🏆','💪','🦵','🫀','🧠','⚡','🌊','🏔️','🌲','🛤️','🎽']
  ];
  var grid = document.getElementById('customEmojiGrid');
  if (!grid) return;
  grid.innerHTML = emojiCategories[page].map(function(e) {
    var selected = e === window._customSportEmoji ? 'background:rgba(77,138,255,0.2);border-color:var(--accent);' : '';
    return '<div onclick="_customSportPickEmoji(this,\'' + e + '\')" data-emoji="' + e + '" style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:26px;border-radius:10px;border:2px solid transparent;cursor:pointer;' + selected + '">' + e + '</div>';
  }).join('');
  [0,1].forEach(function(i){
    var btn = document.getElementById('emojiPageBtn'+i);
    if (!btn) return;
    if (i === page) { btn.style.borderColor='var(--accent)'; btn.style.background='rgba(77,138,255,0.15)'; btn.style.color='var(--accent)'; }
    else { btn.style.borderColor='var(--border)'; btn.style.background='var(--bg3)'; btn.style.color='var(--text3)'; }
  });
}

function _confirmCustomSport(dow) {
  var nameEl = document.getElementById('customSportName');
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) { showToast('⚠ Ingresá un nombre'); return; }
  var emoji = window._customSportEmoji || '🏅';
  if (!window._airCustomEmojis) window._airCustomEmojis = {};
  window._airCustomEmojis[name] = emoji;
  if (!state.config) state.config = {};
  if (!state.config.customSportEmojis) state.config.customSportEmojis = {};
  state.config.customSportEmojis[name] = emoji;
  document.getElementById('customSportSheet') && document.getElementById('customSportSheet').remove();
  _assignSportDay(dow, name, 'sport', {});
}

function _assignSportDay(dow, sportName, activityType, activityDetail) {
  document.getElementById('sportPickerSheet') && document.getElementById('sportPickerSheet').remove();
  document.getElementById('weekDayModal') && document.getElementById('weekDayModal').remove();
  if (!state.config) state.config = {};
  if (!state.config.cycle) state.config.cycle = {};

  var existingVal = state.config.cycle[dow];
  var hasGymAlready = existingVal !== null && existingVal !== undefined
    && existingVal !== -1 && existingVal !== '-1'
    && existingVal !== 'sport' && existingVal !== 'rest';

  if (hasGymAlready) {
    // Agregar como actividad extra sin pisar la rutina gym
    if (!state.config.extraActivities) state.config.extraActivities = {};
    if (!state.config.extraActivities[dow]) state.config.extraActivities[dow] = [];
    if (state.config.extraActivities[dow].indexOf(sportName) === -1)
      state.config.extraActivities[dow].push(sportName);
  } else if (existingVal === 'sport') {
    // Ya hay un deporte principal — agregar como extra
    if (!state.config.extraActivities) state.config.extraActivities = {};
    if (!state.config.extraActivities[dow]) state.config.extraActivities[dow] = [];
    if (state.config.extraActivities[dow].indexOf(sportName) === -1)
      state.config.extraActivities[dow].push(sportName);
  } else {
    // Slot libre — asignar como deporte principal
    state.config.cycle[dow] = 'sport';
    if (!state.config.sportNames) state.config.sportNames = {};
    state.config.sportNames[dow] = sportName;
  }

  // Guardar en perfil del usuario para que la IA y el wizard recuerden los gustos
  if (!state.user) state.user = {};
  if (!state.user.activities) state.user.activities = [];
  var alreadySaved = state.user.activities.some(function(a){ return a.name === sportName; });
  if (!alreadySaved) {
    state.user.activities.push({
      name:   sportName,
      type:   activityType || 'sport',
      detail: activityDetail || {}
    });
  }

// Guardar en perfil del usuario
  if (!state.user) state.user = {};
  if (!state.user.activities) state.user.activities = [];
  var alreadySaved = state.user.activities.some(function(a){ return a.name === sportName; });
  if (!alreadySaved) {
    state.user.activities.push({ name: sportName, type: activityType || 'sport', detail: activityDetail || {} });
  }

  saveState(state);
  renderWeekStrip();
  renderRoutineCards();
  renderTraining();
  renderHome();
  updateHeader();

  // Si el overlay de editar semana está abierto, actualizarlo también
  var overlayBody = document.getElementById('editWeekOverlayBody');
  if (overlayBody) _renderEditWeekInto(overlayBody);

  var dowLabels = { Sun:'Domingo', Mon:'Lunes', Tue:'Martes', Wed:'Miércoles', Thu:'Jueves', Fri:'Viernes', Sat:'Sábado' };
  var emoji = Object.assign({ Correr:'🏃', Fútbol:'⚽', Bici:'🚴', Tenis:'🎾', Pádel:'🏓', Natación:'🏊', Caminata:'🚶', HIIT:'🔥', Pilates:'🧘', Otro:'🏅' }, window._airCustomEmojis || {});
  showToast((emoji[sportName] || '⚽') + ' ' + (dowLabels[dow] || dow) + ' → ' + sportName);
}


function _weekDayAddGym(dow) {
  document.getElementById('weekDayModal') && document.getElementById('weekDayModal').remove();
  _showGymPickerOrCreate(dow);
}

function _showGymPickerOrCreate(dow) {
  var existing = document.getElementById('gymPickerSheet');
  if (existing) existing.remove();

  var cfg = state.config;
  var training = cfg && cfg.training;
  var dowLabels = { Sun:'Domingo', Mon:'Lunes', Tue:'Martes', Wed:'Miércoles', Thu:'Jueves', Fri:'Viernes', Sat:'Sábado' };

  var cards = '';
  if (training && training.length > 0) {cards = training.map(function(d, i) {
      var exCount = d.exercises ? d.exercises.length : 0;
      return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
        + '<div onclick="_assignGymDay(\'' + dow + '\',' + i + ')" '
        + 'style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;'
        + 'border:1.5px solid var(--border);background:var(--bg3);cursor:pointer;flex:1">'
        + '<div style="font-size:22px">🏋️</div>'
        + '<div style="flex:1">'
          + '<div style="font-size:13px;font-weight:700;color:var(--text)">' + d.name + '</div>'
          + '<div style="font-size:11px;color:var(--text3)">' + exCount + ' ejercicio' + (exCount !== 1 ? 's' : '') + '</div>'
        + '</div>'
        + '</div>'
        + '<button onclick="_deleteTrainingDay(' + i + ',\'' + dow + '\')" style="padding:10px 12px;border-radius:10px;border:1px solid rgba(231,76,60,0.3);background:rgba(231,76,60,0.07);color:var(--red);font-size:14px;cursor:pointer;flex-shrink:0">🗑</button>'
        + '</div>';
    }).join('');
  }

  var createBtn =
    '<div onclick="_createNewDayAndAssign(\'' + dow + '\')" '
    + 'style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;'
    + 'border:1.5px dashed var(--accent);background:rgba(77,138,255,0.06);cursor:pointer;margin-bottom:8px">'
    + '<div style="font-size:22px;color:var(--accent)">＋</div>'
    + '<div style="flex:1">'
      + '<div style="font-size:13px;font-weight:700;color:var(--accent)">Crear nuevo día</div>'
      + '<div style="font-size:11px;color:var(--text3)">Definí ejercicios, series y reps</div>'
    + '</div>'
    + '</div>';

  var sheet = document.createElement('div');
  sheet.id = 'gymPickerSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:10000;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px">'
    + '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 14px"></div>'
    + '<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">¿Qué rutina asignar?</div>'
    + '<div style="font-size:12px;color:var(--text3);margin-bottom:16px">' + (dowLabels[dow] || dow) + '</div>'
    + cards
    + createBtn
    + '<button onclick="document.getElementById(\'gymPickerSheet\').remove()" class="btn btn-ghost" style="width:100%;margin-top:4px">Cancelar</button>'
    + '</div>';
  sheet.addEventListener('click', function(e){ if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

function _deleteTrainingDay(idx, dow) {
  if (!state.config || !state.config.training) return;
  if (!confirm('¿Eliminar "' + state.config.training[idx].name + '"?')) return;
  state.config.training.splice(idx, 1);
  // Remap cycle indices
  var cycle = state.config.cycle || {};
  Object.keys(cycle).forEach(function(k) {
    var v = cycle[k];
    if (v === idx) cycle[k] = -1;
    else if (typeof v === 'number' && v > idx) cycle[k] = v - 1;
    else if (!isNaN(parseInt(v)) && parseInt(v) === idx) cycle[k] = -1;
    else if (!isNaN(parseInt(v)) && parseInt(v) > idx) cycle[k] = parseInt(v) - 1;
  });
  saveState(state);
  renderWeekStrip();
  renderRoutineCards();
  renderTraining();
  document.getElementById('gymPickerSheet') && document.getElementById('gymPickerSheet').remove();
  document.getElementById('gymPickerOrCreateSheet') && document.getElementById('gymPickerOrCreateSheet').remove();
  showToast('✓ Día eliminado');
}
function _createNewDayAndAssign(dow) {
  document.getElementById('gymPickerSheet') && document.getElementById('gymPickerSheet').remove();
  if (!state.config) state.config = {};
  if (!state.config.training) state.config.training = [];
  var newIdx = state.config.training.length;
  state.config.training.push({ name: 'Día ' + (newIdx + 1), exercises: [] });
if (!state.config.cycle) state.config.cycle = {};
  state.config.cycle[dow] = newIdx;
  saveState(state);
  renderWeekStrip();
  renderRoutineCards();
  renderHome();
  updateHeader();
  // Abrir el editor posicionado en el nuevo día
  if (typeof openRoutineEditorOnDay === 'function') {
    openRoutineEditorOnDay(newIdx);
  } else {
    openRoutineEditor();
  }
}
function _assignGymDay(dow, routineIdx) {
  document.getElementById('gymPickerSheet') && document.getElementById('gymPickerSheet').remove();
  document.getElementById('gymPickerOrCreateSheet') && document.getElementById('gymPickerOrCreateSheet').remove();
  document.getElementById('weekDayModal') && document.getElementById('weekDayModal').remove();
  if (!state.config) state.config = {};
  if (!state.config.cycle) state.config.cycle = {};

  var cycle = state.config.cycle;
  var dowLabels = { Sun:'Domingo', Mon:'Lunes', Tue:'Martes', Wed:'Miércoles', Thu:'Jueves', Fri:'Viernes', Sat:'Sábado' };

  // Buscar si esta rutina ya estaba asignada a otro día y liberarlo
  var prevDow = null;
  Object.keys(cycle).forEach(function(key) {
    if (key !== dow && parseInt(cycle[key]) === routineIdx) {
      prevDow = key;
      cycle[key] = -1; // liberar el día anterior
    }
  });

  // Si había un sport principal en ese día, preservarlo como extra
  if (cycle[dow] === 'sport') {
    var _prevSportName = state.config.sportNames && state.config.sportNames[dow];
    if (_prevSportName) {
      if (!state.config.extraActivities) state.config.extraActivities = {};
      if (!state.config.extraActivities[dow]) state.config.extraActivities[dow] = [];
      if (state.config.extraActivities[dow].indexOf(_prevSportName) === -1)
        state.config.extraActivities[dow].push(_prevSportName);
      delete state.config.sportNames[dow];
    }
  }
  cycle[dow] = routineIdx;
  // Si el día asignado es hoy, actualizar trainDay para que renderTraining muestre la rutina correcta
  var _todayDowGA = (function(){ var k=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']; return k[new Date().getDay()]; })();
  if (dow === _todayDowGA) { state[TODAY].trainDay = routineIdx + 1; }
saveState(state);
  renderWeekStrip();
  renderRoutineCards();
  renderTraining();
  renderHome();
  updateHeader();

var name = state.config.training && state.config.training[routineIdx] ? state.config.training[routineIdx].name : 'Rutina';
  var msg = '🏋️ ' + (dowLabels[dow] || dow) + ' → ' + name;
  if (prevDow) msg += ' (movido desde ' + (dowLabels[prevDow] || prevDow) + ')';

  var overlayBody = document.getElementById('editWeekOverlayBody');
  if (overlayBody) _renderEditWeekInto(overlayBody);

  showToast(msg);
}

function _weekDayEditGym(dow) {
  document.getElementById('weekDayModal') && document.getElementById('weekDayModal').remove();
  var cfg = state.config;
  var cycle = cfg && cfg.cycle;
  var training = cfg && cfg.training;
  var dayIdx = cycle ? cycle[dow] : null;

  // Sin rutina asignada: mostrar picker de rutinas + opción de crear día nuevo
  if (dayIdx === null || dayIdx === undefined || dayIdx === -1 || dayIdx === '-1') {
    _showGymPickerOrCreate(dow);
    return;
  }

  var dIdx = parseInt(dayIdx);

  // Verificar que la rutina existe en training[]
  if (!training || !training[dIdx]) {
    showToast('⚠ Rutina no encontrada');
    return;
  }

  // Abrir el editor posicionado en esa rutina específica
  if (typeof openRoutineEditorOnDay === 'function') {
    openRoutineEditorOnDay(dIdx);
  } else {
    openRoutineEditor();
  }
}

function _showGymPickerOrCreate(dow) {
  var existing = document.getElementById('gymPickerOrCreateSheet');
  if (existing) existing.remove();

  var cfg = state.config;
  var training = cfg && cfg.training;
  var dowLabels = { Sun:'Domingo', Mon:'Lunes', Tue:'Martes', Wed:'Miércoles', Thu:'Jueves', Fri:'Viernes', Sat:'Sábado' };

  var existingCards = '';
  if (training && training.length > 0) {
existingCards = training.map(function(d, i) {
  var exCount = d.exercises ? d.exercises.length : 0;
  return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'
      + '<div onclick="_assignGymDay(\'' + dow + '\',' + i + ')" '
      + 'style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;'
      + 'border:1px solid var(--border);background:var(--bg3);cursor:pointer;flex:1">'
        + '<div style="font-size:22px">🏋️</div>'
        + '<div style="flex:1">'
          + '<div style="font-size:13px;font-weight:700;color:var(--text)">' + d.name + '</div>'
          + '<div style="font-size:11px;color:var(--text3)">' + exCount + ' ejercicio' + (exCount !== 1 ? 's' : '') + '</div>'
        + '</div>'
        + '</div>'
        + '<button onclick="_deleteTrainingDay(' + i + ',\'' + dow + '\')" style="padding:10px 12px;border-radius:10px;border:1px solid rgba(231,76,60,0.3);background:rgba(231,76,60,0.07);color:var(--red);font-size:14px;cursor:pointer;flex-shrink:0">🗑</button>'
        + '</div>';
    }).join('');
  } else {
    existingCards = '<div style="font-size:12px;color:var(--text3);text-align:center;padding:12px 0">No tenés rutinas creadas todavía.</div>';
  }

  var sheet = document.createElement('div');
  sheet.id = 'gymPickerOrCreateSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:10000;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px">'
    + '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 14px"></div>'
    + '<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px">¿Qué rutina asignar?</div>'
    + '<div style="font-size:12px;color:var(--text3);margin-bottom:16px">' + (dowLabels[dow] || dow) + '</div>'
    + existingCards
+ '<div onclick="_createNewDayAndAssignFromPicker(\'' + dow + '\')" '      + 'style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;'
      + 'border:1.5px dashed var(--accent);background:rgba(77,138,255,0.06);cursor:pointer;margin-bottom:8px">'
      + '<div style="font-size:22px">＋</div>'
      + '<div style="flex:1">'
        + '<div style="font-size:13px;font-weight:700;color:var(--accent)">Crear nuevo día</div>'
        + '<div style="font-size:11px;color:var(--text3)">Definí ejercicios, series y reps</div>'
      + '</div>'
    + '</div>'
    + '<button onclick="document.getElementById(\'gymPickerOrCreateSheet\').remove()" class="btn btn-ghost" style="width:100%;margin-top:4px">Cancelar</button>'
    + '</div>';
  sheet.addEventListener('click', function(e){ if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

function _createNewDayAndAssignFromPicker(dow) {
  document.getElementById('gymPickerOrCreateSheet') && document.getElementById('gymPickerOrCreateSheet').remove();
  _createNewDayAndAssign(dow);
}

function _createNewDayAndAssign(dow) {
  document.getElementById('gymPickerSheet') && document.getElementById('gymPickerSheet').remove();
  _showNewDayWizardForDow(dow);
}

function _showNewDayWizardForDow(dow) {
  var overlay = document.createElement('div');
  overlay.id = 'newDayWizardDow';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10001;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = ''
    + '<div style="background:var(--bg2);border-radius:16px;padding:20px;width:100%;max-width:380px;max-height:80vh;overflow-y:auto">'
    +   '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
    +     '<span style="font-weight:700;font-size:15px">🏋️ Nuevo día de gym</span>'
    +     '<button onclick="document.getElementById(\'newDayWizardDow\').remove()" style="background:none;border:none;color:var(--text3);font-size:20px;cursor:pointer;line-height:1">×</button>'
    +   '</div>'
    +   '<input id="ndwName" class="inp" placeholder="Nombre del día (ej: Push, Piernas…)" style="margin-bottom:12px">'
    +   '<div style="font-size:11px;color:var(--text3);margin-bottom:8px;font-weight:600">EJERCICIOS</div>'
    +   '<div id="ndwExList"></div>'
    +   '<div style="display:flex;gap:6px;margin-top:4px">'
    +     '<button onclick="_ndwAddEx()" style="flex:1;padding:8px;border-radius:8px;border:1px dashed var(--accent);background:none;color:var(--accent);font-size:12px;cursor:pointer">+ Ejercicio</button>'
    +     '<button onclick="_ndwAddSuperset()" style="flex:1;padding:8px;border-radius:8px;border:1px dashed var(--green);background:none;color:var(--green);font-size:12px;cursor:pointer">⚡ + Superserie</button>'
    +   '</div>'
    +   '<button onclick="_ndwConfirm(\'' + dow + '\')" style="width:100%;padding:10px;border-radius:10px;background:var(--accent);color:#fff;font-weight:700;font-size:13px;border:none;cursor:pointer;margin-top:14px">✓ Crear y asignar</button>'
    + '</div>';
  document.body.appendChild(overlay);
  window._ndwExercises = [];
  _ndwRenderExList();
}

function _ndwAddEx() {
  if (!window._ndwExercises) window._ndwExercises = [];
  window._ndwExercises.push({name:'', sets:3, reps:'8-12'});
  _ndwRenderExList();
}

function _ndwAddSuperset() {
  if (!window._ndwExercises) window._ndwExercises = [];
  var ssGroup = 'ss_' + Date.now();
  window._ndwExercises.push({name:'', sets:3, reps:'8-12', ssGroup:ssGroup, ssPart:'a', ssRestSec:null});
  window._ndwExercises.push({name:'', sets:3, reps:'8-12', ssGroup:ssGroup, ssPart:'b'});
  _ndwRenderExList();
}

// Misma lógica de agrupamiento que _reBuildExerciseListHtml() (routine-editor.js),
// adaptada a window._ndwExercises / #ndwExList — este es el wizard real que se
// abre al crear un día nuevo desde "Editar semana → Agregar rutina gym".
function _ndwRenderExList() {
  var exercises = window._ndwExercises || [];
  var el = document.getElementById('ndwExList');
  if (!el) return;
  if (!exercises.length) {
    el.innerHTML = '<div style="color:var(--text3);font-size:12px;padding:8px 0;text-align:center">Sin ejercicios todavía</div>';
    return;
  }
  var html = '';
  var renderedGroups = {};
  exercises.forEach(function(ex, i) {
    if (ex.ssGroup) {
      if (renderedGroups[ex.ssGroup]) return;
      renderedGroups[ex.ssGroup] = true;
      var aIdx = exercises.findIndex(function(e) { return e.ssGroup === ex.ssGroup && e.ssPart === 'a'; });
      var bIdx = exercises.findIndex(function(e) { return e.ssGroup === ex.ssGroup && e.ssPart === 'b'; });
      html += _ndwSupersetBlockHtml(aIdx, bIdx);
      return;
    }
    html += _ndwExerciseRowHtml(i);
  });
  el.innerHTML = html;
}

function _ndwExerciseRowHtml(i) {
  var ex = window._ndwExercises[i];
  return '<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">'
    +'<input class="inp" style="flex:1;margin-bottom:0;font-size:12px" placeholder="Ejercicio" value="'+(ex.name||'')+'" oninput="window._ndwExercises['+i+'].name=this.value">'
    +'<div style="display:flex;flex-direction:column;align-items:center;gap:2px">'
    +'<span style="font-size:9px;color:var(--text3)">Series</span>'
    +'<input class="inp" style="width:46px;margin-bottom:0;font-size:12px;text-align:center;padding:4px" type="number" min="1" value="'+(ex.sets||3)+'" oninput="window._ndwExercises['+i+'].sets=+this.value">'
    +'</div>'
    +'<div style="display:flex;flex-direction:column;align-items:center;gap:2px">'
    +'<span style="font-size:9px;color:var(--text3)">Reps</span>'
    +'<input class="inp" style="width:56px;margin-bottom:0;font-size:12px;text-align:center;padding:4px" value="'+(ex.reps||"8-12")+'" oninput="window._ndwExercises['+i+'].reps=this.value">'
    +'</div>'
    +'<button onclick="_ndwRemoveExercise('+i+')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:16px;flex-shrink:0;margin-top:10px">✕</button>'
    +'</div>';
}

function _ndwSSExerciseRowHtml(i, letter) {
  var ex = window._ndwExercises[i];
  return '<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">'
    +'<span style="font-size:11px;font-weight:700;color:var(--accent);width:14px;flex-shrink:0">'+letter+'</span>'
    +'<input class="inp" style="flex:1;margin-bottom:0;font-size:12px" placeholder="Ejercicio" value="'+(ex.name||'')+'" oninput="window._ndwExercises['+i+'].name=this.value">'
    +'<div style="display:flex;flex-direction:column;align-items:center;gap:2px">'
    +'<span style="font-size:9px;color:var(--text3)">Series</span>'
    +'<input class="inp" style="width:46px;margin-bottom:0;font-size:12px;text-align:center;padding:4px" type="number" min="1" value="'+(ex.sets||3)+'" oninput="window._ndwExercises['+i+'].sets=+this.value">'
    +'</div>'
    +'<div style="display:flex;flex-direction:column;align-items:center;gap:2px">'
    +'<span style="font-size:9px;color:var(--text3)">Reps</span>'
    +'<input class="inp" style="width:56px;margin-bottom:0;font-size:12px;text-align:center;padding:4px" value="'+(ex.reps||"8-12")+'" oninput="window._ndwExercises['+i+'].reps=this.value">'
    +'</div>'
    +'</div>';
}

function _ndwSupersetBlockHtml(aIdx, bIdx) {
  var exA = window._ndwExercises[aIdx];
  var restMin = (typeof exA.ssRestSec === 'number' && exA.ssRestSec > 0) ? (exA.ssRestSec/60) : '';
  return '<div style="border:1.5px solid var(--accent);border-radius:10px;padding:8px;margin-bottom:8px;background:rgba(77,138,255,0.05)">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
    +   '<span style="font-size:11px;font-weight:700;color:var(--accent)">⚡ Superserie</span>'
    +   '<button onclick="_ndwRemoveSuperset(\''+exA.ssGroup+'\')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:11px">✕ Quitar superserie</button>'
    + '</div>'
    + _ndwSSExerciseRowHtml(aIdx, 'A')
    + _ndwSSExerciseRowHtml(bIdx, 'B')
    + '<div style="display:flex;align-items:center;gap:6px;margin-top:2px">'
    +   '<span style="font-size:11px;color:var(--text3)">⏱ Descanso total del ciclo:</span>'
    +   '<input class="inp" style="width:56px;margin-bottom:0;font-size:12px;text-align:center" type="number" min="0" step="0.5" placeholder="ej: 3" value="'+restMin+'" oninput="_ndwSetSSRest(\''+exA.ssGroup+'\',this.value)">'
    +   '<span style="font-size:11px;color:var(--text3)">min</span>'
    + '</div>'
    + '</div>';
}

function _ndwSetSSRest(ssGroup, val) {
  var min = parseFloat(val);
  var secs = (isNaN(min) || min <= 0) ? null : Math.round(min*60);
  (window._ndwExercises || []).forEach(function(ex) {
    if (ex.ssGroup === ssGroup && ex.ssPart === 'a') ex.ssRestSec = secs;
  });
}

function _ndwRemoveExercise(i) {
  window._ndwExercises.splice(i, 1);
  _ndwRenderExList();
}

function _ndwRemoveSuperset(ssGroup) {
  window._ndwExercises = (window._ndwExercises || []).filter(function(e) { return e.ssGroup !== ssGroup; });
  _ndwRenderExList();
}

function _ndwConfirm(dow) {
  var nameEl = document.getElementById('ndwName');
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) { showToast('⚠ Ingresá un nombre'); return; }
  if (!state.config) state.config = {};
  if (!state.config.training) state.config.training = [];
  var exercises = (window._ndwExercises||[]).filter(function(e){ return e.name && e.name.trim(); });
  state.config.training.push({ name: name, exercises: exercises });
  var newIdx = state.config.training.length - 1;
  if (!state.config.cycle) state.config.cycle = {};
  state.config.cycle[dow] = newIdx;
  saveState(state);
  document.getElementById('newDayWizardDow') && document.getElementById('newDayWizardDow').remove();
  document.getElementById('gymPickerSheet') && document.getElementById('gymPickerSheet').remove();
  document.getElementById('weekDayModal') && document.getElementById('weekDayModal').remove();
  var overlayBody = document.getElementById('editWeekOverlayBody');
  if (overlayBody) _renderEditWeekInto(overlayBody);
  renderWeekStrip();
  renderRoutineCards();
  renderTraining();
  renderHome();
  updateHeader();
  var dowLabels = { Sun:'Domingo', Mon:'Lunes', Tue:'Martes', Wed:'Miércoles', Thu:'Jueves', Fri:'Viernes', Sat:'Sábado' };
  showToast('✓ ' + name + ' asignado a ' + (dowLabels[dow]||dow));
}

function _weekDayRemove(dow) {
  document.getElementById('weekDayModal') && document.getElementById('weekDayModal').remove();
  var cfg = state.config;
  if (!cfg || !cfg.cycle) { showToast('No hay ciclo configurado'); return; }
cfg.cycle[dow] = -1;
  if (cfg.sportNames) delete cfg.sportNames[dow];
  saveState(state);
  renderWeekStrip();
  renderRoutineCards();
  renderTraining();
  renderHome();
  updateHeader();
  showToast('✓ Día libre');
}

function renderRoutineCards() {
  var el = document.getElementById('routineCards');
  if (!el) return;
  var cfg = state.config;
  var training = cfg && cfg.training;
  var cycle = cfg && cfg.cycle;
  var currentDay = state[TODAY] ? (state[TODAY].trainDay || 0) : 0;

  if (!training || training.length === 0) {
    el.innerHTML = '<div style="color:var(--text3);font-size:12px;text-align:center;padding:16px">No tenés rutina configurada.<br>Usá <strong>🤖 Generar</strong> o <strong>✏️ Editar</strong> para crear una.</div>';
    return;
  }

  var dowKeys = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var dowLabelsFull = {Sun:'Domingo',Mon:'Lunes',Tue:'Martes',Wed:'Miércoles',Thu:'Jueves',Fri:'Viernes',Sat:'Sábado'};var todayDow = dowKeys[new Date().getDay()];
var sportEmojis = Object.assign({ Correr:'🏃', Bici:'🚴', Caminata:'🚶', HIIT:'🔥', Natación:'🏊', Pilates:'🧘', Fútbol:'⚽', Tenis:'🎾', Pádel:'🏓', Otro:'🏅' }, window._airCustomEmojis || {});
  // Orden cronológico empezando por hoy
// Orden fijo Lun→Dom
var baseDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var orderedDow = baseDows;
  // Mapear rutina gym → qué días está asignada
  var routineToDow = {};
  if (cycle) {
    dowKeys.forEach(function(k) {
      var v = cycle[k];
      if (v !== null && v !== undefined && v !== -1 && v !== '-1' && v !== 'rest' && v !== 'sport') {
        var idx = parseInt(v);
        if (!routineToDow[idx]) routineToDow[idx] = [];
        routineToDow[idx].push(k);
      }
    });
  }

  // Today's assigned routine
  var todayAssigned = cycle ? cycle[todayDow] : null;
  var todayRoutineIdx = (todayAssigned !== null && todayAssigned !== undefined && todayAssigned !== -1 && todayAssigned !== '-1' && todayAssigned !== 'rest' && todayAssigned !== 'sport')
    ? parseInt(todayAssigned) : null;

  // Construir lista unificada en orden cronológico
// Un card por día, en orden cronológico desde hoy
// Migrar keys falsas del ciclo viejo (Mon_sport0, Tue_sport0, etc.) a extraActivities
  if (cfg && cycle) {
    var fakeDowKeys = Object.keys(cycle).filter(function(k) {
      return /_(sport|extra)\d+$/.test(k);
    });
    if (fakeDowKeys.length > 0) {
      if (!cfg.extraActivities) cfg.extraActivities = {};
      fakeDowKeys.forEach(function(fk) {
        var baseDow = fk.replace(/_(sport|extra)\d+$/, '');
        var actName = cfg.sportNames && cfg.sportNames[fk];
        if (actName) {
          if (!cfg.extraActivities[baseDow]) cfg.extraActivities[baseDow] = [];
          if (cfg.extraActivities[baseDow].indexOf(actName) === -1) {
            cfg.extraActivities[baseDow].push(actName);
          }
          delete cfg.sportNames[fk];
        }
        delete cycle[fk];
      });
      saveState(state);
    }
  }

  var extraActivities = (cfg && cfg.extraActivities) || {};
  var items = [];
  orderedDow.forEach(function(k) {
    if (!cycle) return;
    var v = cycle[k];
    if (v === 'sport') {
      items.push({ type: 'sport', dow: k });
    } else if (v !== null && v !== undefined && v !== -1 && v !== '-1' && v !== 'rest') {
      items.push({ type: 'gym', dow: k, routineIdx: parseInt(v) });
    } else {
      items.push({ type: 'rest', dow: k });
    }
    // Actividades extra del mismo día (gym+sport)
    if (extraActivities[k]) {
      extraActivities[k].forEach(function(actName) {
        items.push({ type: 'sport', dow: k, sportNameOverride: actName });
      });
    }
  });

// Reordenar items poniendo hoy primero
  var todayIdx = orderedDow.indexOf(todayDow);
  if (todayIdx > 0) {
    var reordered = orderedDow.slice(todayIdx).concat(orderedDow.slice(0, todayIdx));
    items.sort(function(a, b) {
      return reordered.indexOf(a.dow) - reordered.indexOf(b.dow);
    });
  }

  var html = '';

  items.forEach(function(item) {
    if (item.type === 'gym') {
      var i = item.routineIdx;
      var d = training[i];
      if (!d) return;

var isToday = item.dow === todayDow;
      var isActive = isToday;
      var dayLabel = dowLabelsFull[item.dow] || '';
      var dayLabels = item.dow ? [dayLabel] : [];
      var exTotal = d.exercises ? d.exercises.length : 0;

      var doneCount = 0, totalSets = 0;
      if (isActive && state[TODAY]) {
        var savedSets = state[TODAY]['trainSets_' + (i+1)] || {};
        d.exercises && d.exercises.forEach(function(ex, exIdx) {
          var sets = ex.sets || 3;
          totalSets += sets;
          var exSets = savedSets[exIdx] || [];
          for (var s = 0; s < sets; s++) {
            if (exSets[s] && exSets[s].done) doneCount++;
          }
        });
      }

   var isToday2 = isToday;
      var isSportDay = !!d.isSport;
      var cardTitle = isSportDay ? ((typeof _getSportEmoji==='function'?_getSportEmoji(d.sportName||d.name):'⚽')+' '+(d.sportName||d.name||'Deporte')) : d.name;
      var todayBadge = isToday2 ? '<span style="font-size:9px;background:var(--accent);color:#fff;border-radius:4px;padding:1px 6px;font-weight:700">TOCA HOY</span>' : '';

      var progressBar = '';
      if (isActive && totalSets > 0) {
        var pct = Math.round(doneCount / totalSets * 100);
        progressBar = '<div style="margin-top:6px;height:3px;background:var(--bg4);border-radius:2px">'
          + '<div style="height:3px;background:var(--green);border-radius:2px;width:' + pct + '%"></div>'
          + '</div>'
          + '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-top:3px">'
          + '<span>Progreso</span><span>' + doneCount + '/' + totalSets + ' series</span></div>';
      }

      var accentColor = isToday2 ? 'var(--accent)' : 'var(--text3)';
      var bg = isToday2 ? 'rgba(77,138,255,0.07)' : 'var(--bg2)';
      var borderLeft = isToday2 ? '3px solid var(--accent)' : '3px solid var(--border)';

      html += '<div style="background:' + bg + ';border-left:' + borderLeft + ';border-radius:0 8px 8px 0;padding:10px 12px;margin-bottom:2px;cursor:pointer;display:flex;align-items:center;gap:10px" onclick="setTrainDay(' + (i+1) + ')">'
        + '<div style="width:52px;flex-shrink:0">'
          + '<div style="font-size:11px;font-weight:700;color:' + accentColor + '">' + dayLabel + '</div>'
          + (isToday2 ? '<div style="font-size:9px;color:var(--accent);font-weight:600">HOY</div>' : '')
        + '</div>'
        + '<div style="flex:1;min-width:0">'
          + '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px">'
            + '<div style="font-size:13px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + cardTitle + '</div>'
            + todayBadge
          + '</div>'
          + '<div style="font-size:11px;color:var(--text3);margin-top:1px">' + exTotal + ' ejercicios</div>'
          + progressBar
        + '</div>'
        + '</div>';
} else if (item.type === 'rest') {
      var isToday = item.dow === todayDow;
      if (isToday) {
        var cycleVal = cycle ? cycle[item.dow] : null;
        var isTrueRest = (cycleVal === 'rest' || cycleVal === null || cycleVal === undefined || cycleVal === -1 || cycleVal === '-1');
        if (isTrueRest) {
          html += '<div style="background:var(--bg2);border-left:3px solid var(--border);border-radius:0 8px 8px 0;padding:10px 12px;margin-bottom:2px;display:flex;align-items:center;gap:10px">'
            + '<div style="width:52px;flex-shrink:0"><div style="font-size:11px;font-weight:700;color:var(--text3)">' + (dowLabelsFull[item.dow]||'') + '</div><div style="font-size:9px;color:var(--accent);font-weight:600">HOY</div></div>'
            + '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--text3)">🛋 Descanso</div><div style="font-size:11px;color:var(--text3)">El músculo crece hoy</div></div>'
            + '</div>';
        }
      }
} else if (item.type === 'sport') {
      var k = item.dow;
      var sName = item.sportNameOverride || (cfg.sportNames && cfg.sportNames[k]) || 'Deporte';
      var emoji = sportEmojis[sName] || '🏅';
      var isToday = item.dow === todayDow;
     var sportDone = state[TODAY] && (state[TODAY]['sportDone_' + sName] || state[TODAY]['sportDone_' + k]);
      var sportData = state[TODAY] && (state[TODAY]['sportData_' + sName] || state[TODAY]['sportData_' + k]);

      var borderStyle = isToday
        ? (sportDone
            ? 'border:1.5px solid var(--green);background:rgba(77,255,150,0.07);'
            : 'border:1.5px solid var(--accent);background:rgba(77,138,255,0.07);')
        : 'border:1px solid var(--border);background:var(--bg3);';
      var todayBadge = isToday ? '<span style="font-size:9px;background:var(--accent);color:#fff;border-radius:4px;padding:1px 6px;font-weight:700">TOCA HOY</span>' : '';
      var doneBadge = sportDone ? '<span onclick="event.stopPropagation();completeSportDay(\''+k+'\',\''+sName+'\')" style="font-size:9px;background:var(--green);color:#000;border-radius:4px;padding:1px 6px;font-weight:700;cursor:pointer">✓ HECHO</span>' : '';

      var statsLine = '';
      if (sportDone && sportData) {
        var parts = [];
        if (sportData.tiempo) parts.push('⏱ ' + sportData.tiempo + ' min');
        if (sportData.distancia) parts.push('📍 ' + sportData.distancia + ' km');
        if (sportData.velocidad) parts.push('⚡ ' + sportData.velocidad + ' km/h');
        if (parts.length) statsLine = '<div style="font-size:10px;color:var(--green);margin-top:4px">' + parts.join('  ·  ') + '</div>';
      }

      var completeBtn = '';
      if (isToday && !sportDone) {
        if (sName === 'Correr' || sName === 'Bici') {
          completeBtn = '<div style="margin-top:10px" id="sportForm_' + k + '">'
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">'
            + '<div><div style="font-size:10px;color:var(--text3);margin-bottom:4px">Tiempo (min)</div>'
            + '<input id="spt_tiempo_' + k + '" type="number" inputmode="decimal" placeholder="ej: 35" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--bg4);color:var(--text);font-size:13px;box-sizing:border-box"></div>'
            + '<div><div style="font-size:10px;color:var(--text3);margin-bottom:4px">Distancia (km)</div>'
            + '<input id="spt_dist_' + k + '" type="number" inputmode="decimal" placeholder="ej: 5.2" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--bg4);color:var(--text);font-size:13px;box-sizing:border-box"></div>'
            + '</div>'
            + '<button onclick="event.stopPropagation();completeSportDay(\'' + k + '\',\'' + sName + '\')" style="width:100%;padding:10px;background:var(--accent);border:none;border-radius:10px;color:#fff;font-size:13px;font-weight:700;cursor:pointer">' + emoji + ' Completar ' + sName + '</button>'
            + '</div>';
        } else {
          completeBtn = '<div style="margin-top:10px">'
            + '<button onclick="event.stopPropagation();completeSportDay(\'' + k + '\',\'' + sName + '\')" style="width:100%;padding:10px;background:var(--accent);border:none;border-radius:10px;color:#fff;font-size:13px;font-weight:700;cursor:pointer">' + emoji + ' Completar ' + sName + '</button>'
            + '</div>';
        }
      }

var sportAccent = isToday ? (sportDone ? 'var(--green)' : 'var(--accent)') : 'var(--text3)';
      var sportBg = isToday ? (sportDone ? 'rgba(77,255,150,0.05)' : 'rgba(77,138,255,0.07)') : 'var(--bg2)';
      var sportBorderLeft = isToday ? ('3px solid ' + (sportDone ? 'var(--green)' : 'var(--accent)')) : '3px solid var(--border)';
      var realDowLabel = dowLabelsFull[k.replace(/_sport\d+$/,'').replace(/_extra\d+$/,'')] || dowLabelsFull[k] || '';

      html += '<div style="background:' + sportBg + ';border-left:' + sportBorderLeft + ';border-radius:0 8px 8px 0;padding:10px 12px;margin-bottom:2px">'
        + '<div style="display:flex;align-items:center;gap:10px">'
          + '<div style="width:52px;flex-shrink:0">'
            + '<div style="font-size:11px;font-weight:700;color:' + sportAccent + '">' + realDowLabel + '</div>'
            + (isToday ? '<div style="font-size:9px;color:var(--accent);font-weight:600">HOY</div>' : '')
          + '</div>'
          + '<div style="flex:1;min-width:0">'
            + '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px">'
              + '<div style="font-size:13px;font-weight:700;color:var(--text)">' + emoji + ' ' + sName + '</div>'
              + '<div style="display:flex;gap:4px">' + todayBadge + doneBadge + '</div>'
            + '</div>'
            + statsLine
            + completeBtn
          + '</div>'
        + '</div>'
        + '</div>';
    }
  });



  el.innerHTML = html;
}

function renderTrainingDaySelector() {
  // kept for compatibility - now delegates to renderRoutineCards
  renderRoutineCards();
}

// ─── PREMIUM TRAINING RENDER (Layout Apple Fitness+) ─────────────

function _getPremiumWeekDates() {
  var now = new Date();
  var dow = now.getDay(); // 0=Sun
  // Semana Lun→Dom
  var mondayOffset = dow === 0 ? -6 : 1 - dow;
  var monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  var days = [];
  var dowKeys  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var dowNames = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
  for (var i = 0; i < 7; i++) {
    var d = new Date(monday);
    d.setDate(monday.getDate() + i);
    var ds = d.toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
    var hasSets = state[ds] && Object.keys(state[ds]).some(function(k){ return k.startsWith('trainSets_'); });
    var isToday = ds === TODAY;
    days.push({
      dow: dowKeys[i],
      name: dowNames[i],
      num: d.getDate(),
      date: ds,
      isToday: isToday,
      done: hasSets
    });
  }
  return { days: days, monday: monday };
}

function _getPremiumTodayWorkouts() {
  var cfg = state.config;
  if (!cfg) return [];
  var dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  var cycle = cfg.cycle || {};
  var training = cfg.training || [];
  var sportEmojis = Object.assign({ Correr:'🏃', Bici:'🚴', Caminata:'🚶', HIIT:'🔥', Natación:'🏊', Pilates:'🧘', Fútbol:'⚽', Tenis:'🎾', Pádel:'🏓', Otro:'🏅' }, window._airCustomEmojis || {});
  var results = [];

  var val = cycle[dow];
  if (val === 'sport') {
    var sName = (cfg.sportNames && cfg.sportNames[dow]) || 'Deporte';
    var sportDone = state[TODAY] && (state[TODAY]['sportDone_' + sName] || state[TODAY]['sportDone_sport']);
    results.push({ type: 'sport', name: sName, emoji: sportEmojis[sName] || '🏅', done: !!sportDone });
  } else if (val !== null && val !== undefined && val !== -1 && val !== '-1') {
    var idx = parseInt(val);
    var d = training[idx];
    if (d && d.exercises && d.exercises.length > 0) {
      var savedSets = state[TODAY] && state[TODAY]['trainSets_' + (idx + 1)] || {};
      var totalSets = 0, doneSets = 0;
      d.exercises.forEach(function(ex, ei) {
        var n = parseInt(ex.sets) || 3;
        totalSets += n;
        var exSets = savedSets[ei] || [];
        exSets.forEach(function(s){ if (s.done) doneSets++; });
      });
      var isDone = totalSets > 0 && doneSets === totalSets;
      var muscles = [...new Set(d.exercises.map(function(e){ return e.muscle||''; }).filter(Boolean))].slice(0,3);
      results.push({
        type: 'gym', name: d.name, emoji: '💪',
        tag: 'Fuerza · Hoy',
        exCount: d.exercises.length,
        setCount: totalSets,
        muscles: muscles,
        done: isDone,
        trainDay: idx + 1
      });
    }
  }

  // Actividades extra del mismo día (gym + deporte)
  var extras = cfg.extraActivities && cfg.extraActivities[dow];
  if (extras) {
    extras.forEach(function(sName) {
      var sportDone = state[TODAY] && state[TODAY]['sportDone_' + sName];
      results.push({ type: 'sport', name: sName, emoji: sportEmojis[sName] || '🏅', done: !!sportDone });
    });
  }

  return results;
}

function _getPremiumUpcoming() {
  var cfg = state.config;
  if (!cfg) return [];
  var cycle = cfg.cycle || {};
  var training = cfg.training || [];
  var sportEmojis = Object.assign({ Correr:'🏃', Bici:'🚴', Caminata:'🚶', HIIT:'🔥', Natación:'🏊', Pilates:'🧘', Fútbol:'⚽', Tenis:'🎾', Pádel:'🏓', Otro:'🏅' }, window._airCustomEmojis || {});
  var dowKeys  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var dowNames = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var todayDow = new Date().getDay();
  var results = [];
  for (var i = 1; i <= 4; i++) {
    var di = (todayDow + i) % 7;
    var dk = dowKeys[di];
    var val = cycle[dk];
    var acts = [];
    if (val === 'sport') {
      var sn = (cfg.sportNames && cfg.sportNames[dk]) || 'Deporte';
      acts.push({ name: sn, emoji: sportEmojis[sn] || '🏅', done: false });
    } else if (val !== null && val !== undefined && val !== -1 && val !== '-1') {
      var idx = parseInt(val);
      var d = training[idx];
      if (d) acts.push({ name: d.name, emoji: '💪', done: false });
    }
    // Actividades extra del mismo día
    var extras = cfg.extraActivities && cfg.extraActivities[dk];
    if (extras) {
      extras.forEach(function(sName) {
        acts.push({ name: sName, emoji: sportEmojis[sName] || '🏅', done: false });
      });
    }
    if (acts.length) {
      var dateN = new Date();
      dateN.setDate(dateN.getDate() + i);
      results.push({ dowName: dowNames[di], num: dateN.getDate(), acts: acts });
    }
  }
  return results.slice(0, 3);
}

// ─── EDIT WEEK MODE ──────────────────────────────────────────────
var _editWeekMode = false;

function toggleEditWeekMode() {
  _editWeekMode = !_editWeekMode;
  if (_editWeekMode) {
    // Abrir como overlay encima de todo
    var existing = document.getElementById('editWeekOverlay');
    if (existing) existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'editWeekOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;background:var(--bg);overflow-y:auto;display:flex;flex-direction:column;padding-top:env(safe-area-inset-top)';
    overlay.innerHTML = '<div style="position:sticky;top:0;z-index:1;background:var(--bg2);border-bottom:1px solid var(--border);padding:12px 16px;display:flex;align-items:center;justify-content:space-between">'
      + '<div><div style="font-size:15px;font-weight:700;color:var(--text)">✏️ Editar semana</div><div style="font-size:11px;color:var(--text3);margin-top:1px">Arrastrá actividades entre días</div></div>'
      + '<button onclick="toggleEditWeekMode()" style="background:var(--accent);border:none;border-radius:10px;padding:8px 16px;color:#fff;font-size:13px;font-weight:700;cursor:pointer">✓ Listo</button>'
      + '</div>'
      + '<div id="editWeekOverlayBody" style="padding:16px;flex:1"></div>';
    document.body.appendChild(overlay);
    _renderEditWeekInto(document.getElementById('editWeekOverlayBody'));
    setTimeout(_initDragDrop, 50);
  } else {
    var ov = document.getElementById('editWeekOverlay');
    if (ov) ov.remove();
    _renderPremiumTraining();
  }
}

function _initDragDrop() {
  var _dragging = null;
  var _clone = null;
  var _startX = 0, _startY = 0;

  function _getCell(x, y) {
    var els = document.elementsFromPoint(x, y);
    for (var i = 0; i < els.length; i++) {
      if (els[i].classList.contains('ew-day-cell')) return els[i];
    }
    return null;
  }

  var chips = document.querySelectorAll('.ew-chip[draggable]');
  chips.forEach(function(chip) {
    chip.addEventListener('touchstart', function(e) {
      // ignore if tapping a button inside chip
      if (e.target.tagName === 'BUTTON') return;
      var t = e.touches[0];
      _startX = t.clientX; _startY = t.clientY;
      _dragging = chip;
      // clone visual
      _clone = chip.cloneNode(true);
      _clone.style.cssText = 'position:fixed;z-index:99999;opacity:0.85;pointer-events:none;transition:none;left:' + (t.clientX - chip.offsetWidth/2) + 'px;top:' + (t.clientY - chip.offsetHeight/2) + 'px';
      document.body.appendChild(_clone);
      chip.style.opacity = '0.3';
    }, { passive: true });

    chip.addEventListener('touchmove', function(e) {
      if (!_dragging || !_clone) return;
      e.preventDefault();
      var t = e.touches[0];
      _clone.style.left = (t.clientX - _dragging.offsetWidth/2) + 'px';
      _clone.style.top  = (t.clientY - _dragging.offsetHeight/2) + 'px';
      // highlight cell below
      document.querySelectorAll('.ew-day-cell').forEach(function(c){ c.classList.remove('ew-drag-over'); });
      var cell = _getCell(t.clientX, t.clientY);
      if (cell) cell.classList.add('ew-drag-over');
    }, { passive: false });

    chip.addEventListener('touchend', function(e) {
      if (!_dragging || !_clone) return;
      var t = e.changedTouches[0];
      if (_clone) { _clone.remove(); _clone = null; }
      _dragging.style.opacity = '';
      document.querySelectorAll('.ew-day-cell').forEach(function(c){ c.classList.remove('ew-drag-over'); });
      var cell = _getCell(t.clientX, t.clientY);
      if (cell) {
        var payload = _dragging.getAttribute('data-payload');
        if (payload) {
          try { _dropActivityOnDay(JSON.parse(payload), cell.getAttribute('data-dow')); }
          catch(err) {}
        }
      }
      _dragging = null;
    });
  });
}

function _dropActivityOnDay(payload, targetDow) {
  var cfg = state.config;
  if (!cfg) return;
  if (!cfg.cycle) cfg.cycle = {};

  var sourceDow = payload.sourceDow;
  if (sourceDow === targetDow) return;

  if (payload.type === 'gym') {
    var routineIdx = payload.routineIdx;
    // Liberar día origen
    if (cfg.cycle[sourceDow] === routineIdx) cfg.cycle[sourceDow] = -1;
    // Guardar en destino
    cfg.cycle[targetDow] = routineIdx;
  } else if (payload.type === 'sport') {
    var sportName = payload.name;
    // Liberar origen
    if (cfg.cycle[sourceDow] === 'sport' && (!cfg.sportNames || cfg.sportNames[sourceDow] === sportName)) {
      cfg.cycle[sourceDow] = -1;
      if (cfg.sportNames) delete cfg.sportNames[sourceDow];
    } else if (cfg.extraActivities && cfg.extraActivities[sourceDow]) {
      var idx = cfg.extraActivities[sourceDow].indexOf(sportName);
      if (idx !== -1) cfg.extraActivities[sourceDow].splice(idx, 1);
    }
    // Asignar en destino
    var destVal = cfg.cycle[targetDow];
    if (!destVal || destVal === -1 || destVal === '-1') {
      cfg.cycle[targetDow] = 'sport';
      if (!cfg.sportNames) cfg.sportNames = {};
      cfg.sportNames[targetDow] = sportName;
    } else {
      if (!cfg.extraActivities) cfg.extraActivities = {};
      if (!cfg.extraActivities[targetDow]) cfg.extraActivities[targetDow] = [];
      if (cfg.extraActivities[targetDow].indexOf(sportName) === -1)
        cfg.extraActivities[targetDow].push(sportName);
    }
  }

saveState(state);
  var overlayBody = document.getElementById('editWeekOverlayBody');
  if (overlayBody) {
    _renderEditWeekInto(overlayBody);
  }
  showToast('✓ Actividad movida');
}

function _ewAddActivity(dow) {
  _openDayModal(dow);
}

function _ewRemoveActivity(dow, type, identifier) {
  if (!confirm('¿Eliminar esta actividad del día?')) return;
  var overlayBody = document.getElementById('editWeekOverlayBody');  var cfg = state.config;
  if (!cfg || !cfg.cycle) return;
  if (type === 'gym') {
    cfg.cycle[dow] = -1;
  } else if (type === 'sport') {
    if (cfg.cycle[dow] === 'sport' && (!cfg.sportNames || !cfg.sportNames[dow] || cfg.sportNames[dow] === identifier)) {
      cfg.cycle[dow] = -1;
      if (cfg.sportNames) delete cfg.sportNames[dow];
    } else if (cfg.extraActivities && cfg.extraActivities[dow]) {
      var idx = cfg.extraActivities[dow].indexOf(identifier);
      if (idx !== -1) cfg.extraActivities[dow].splice(idx, 1);
    }
  }
saveState(state);
  var _todayDowRem = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  if (dow === _todayDowRem && type === 'gym') { state[TODAY].trainDay = 0; saveState(state); }
  if (overlayBody) {
    _renderEditWeekInto(overlayBody);
  }
  renderTraining();
  renderHome();
}

function _ewOpenGymEditor(routineIdx) {
  var ov = document.getElementById('editWeekOverlay');
  if (ov) ov.remove();
  _editWeekMode = false;

  // Patch saveRoutineEditor para reabrir el overlay al guardar
  var _origSave = window.saveRoutineEditor;
  window.saveRoutineEditor = function() {
    window.saveRoutineEditor = _origSave;
    if (typeof _origSave === 'function') _origSave();
    setTimeout(function() {
      _editWeekMode = false;
      toggleEditWeekMode();
    }, 300);
  };

  setTimeout(function() {
    if (typeof openRoutineEditorOnDay === 'function') {
      openRoutineEditorOnDay(routineIdx);
    } else if (typeof openRoutineEditor === 'function') {
      openRoutineEditor();
    }
    // Si cierran el modal sin guardar, restaurar saveRoutineEditor original
    var modal = document.getElementById('routineEditorModal');
    if (modal) {
      var closeBtn = modal.querySelector('.modal-close, [onclick*="closeModal"]');
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          if (window.saveRoutineEditor !== _origSave) {
            window.saveRoutineEditor = _origSave;
          }
        }, { once: true });
      }
    }
  }, 30);
}

function _renderEditWeekInto(container) {
  if (!container) return;
  container.innerHTML = _buildEditWeekHTML();
  setTimeout(_initDragDrop, 30);
}

function _renderEditWeek() {
  // Solo para compatibilidad — no se usa en overlay mode
  return _buildEditWeekHTML();
}

function _buildEditWeekHTML() {
  var cfg = state.config;
  var cycle = (cfg && cfg.cycle) || {};
  var training = (cfg && cfg.training) || [];
  var sportNames = (cfg && cfg.sportNames) || {};
  var extraActivities = (cfg && cfg.extraActivities) || {};
  var sportEmojis = Object.assign({ Correr:'🏃', Bici:'🚴', Caminata:'🚶', HIIT:'🔥', Natación:'🏊', Pilates:'🧘', Fútbol:'⚽', Tenis:'🎾', Pádel:'🏓', Otro:'🏅' }, window._airCustomEmojis || {});
  var dowKeys  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var dowNames = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

  var rows = dowKeys.map(function(dow, i) {
    var val = cycle[dow];
    var chips = '';

    if (val === 'sport') {
      var sn = sportNames[dow] || 'Deporte';
      var payload = JSON.stringify({ type:'sport', name:sn, sourceDow:dow });
      chips += '<div class="ew-chip ew-chip-sport" draggable="true" data-payload=\'' + payload + '\'>'
        + '<span>' + (sportEmojis[sn]||'🏅') + ' ' + sn + '</span>'
        + '<button class="ew-chip-del" onclick="event.stopPropagation();_ewRemoveActivity(\'' + dow + '\',\'sport\',\'' + sn + '\')">✕</button>'
        + '</div>';
    } else if (val !== null && val !== undefined && val !== -1 && val !== '-1') {
      var ri = parseInt(val);
      var d = training[ri];
      if (d) {
        var payload = JSON.stringify({ type:'gym', routineIdx:ri, sourceDow:dow });
        chips += '<div class="ew-chip ew-chip-gym" draggable="true" data-payload=\'' + payload + '\'>'
          + '<span>🏋️ ' + d.name + '</span>'
          + '<button class="ew-chip-edit" onclick="event.stopPropagation();_ewOpenGymEditor(' + ri + ')">✏️</button>'
          + '<button class="ew-chip-del" onclick="event.stopPropagation();_ewRemoveActivity(\'' + dow + '\',\'gym\',' + ri + ')">✕</button>'
          + '</div>';
      }
    }

    // Extra activities
    if (extraActivities[dow]) {
      extraActivities[dow].forEach(function(sn) {
        var payload = JSON.stringify({ type:'sport', name:sn, sourceDow:dow });
        chips += '<div class="ew-chip ew-chip-sport" draggable="true" data-payload=\'' + payload + '\'>'
          + '<span>' + (sportEmojis[sn]||'🏅') + ' ' + sn + '</span>'
          + '<button class="ew-chip-del" onclick="event.stopPropagation();_ewRemoveActivity(\'' + dow + '\',\'sport\',\'' + sn + '\')">✕</button>'
          + '</div>';
      });
    }

    var isEmpty = !chips;

    return '<div class="ew-day-row">'
      + '<div class="ew-day-label">' + dowNames[i] + '</div>'
      + '<div class="ew-day-cell" data-dow="' + dow + '">'
        + chips
        + '<button class="ew-add-btn" onclick="_ewAddActivity(\'' + dow + '\')">'
          + (isEmpty ? '＋ Agregar' : '＋')
        + '</button>'
      + '</div>'
      + '</div>';
  }).join('');

return '<div class="ew-grid">' + rows + '</div>';
}

function _renderPremiumTraining() {
  var container = document.getElementById('premiumTrainingContainer');
  if (!container) return;

if (_editWeekMode) return; // overlay handles it

  var weekInfo = _getPremiumWeekDates();
  var days = weekInfo.days;
  var monday = weekInfo.monday;
  var sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  var months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  var weekLabel = monday.getDate() + ' al ' + sunday.getDate() + ' ' + months[sunday.getMonth()];

  // Calcular sesiones completadas en la semana
  var weekTotal = 0;
  var weekDone = 0;
  days.forEach(function(d){
    var cfg = state.config; if (!cfg) return;
    var val = cfg.cycle && cfg.cycle[d.dow];
    if (!val || val === -1 || val === '-1') return; // descanso, no cuenta
    weekTotal++;
    // Gym: tiene trainSets_ con al menos un set done
    if (val !== 'sport') {
      if (d.done) weekDone++;
      return;
    }
    // Sport puro: sportDone_ guardado
    var sName = cfg.sportNames && cfg.sportNames[d.dow];
    var ds = state[d.date];
    if (ds && sName && ds['sportDone_' + sName]) weekDone++;
  });
  var weekPct = weekTotal > 0 ? Math.round(weekDone / weekTotal * 100) : 0;

  // Week strip
  var stripHtml = days.map(function(d) {
    var cls = 'prem-day-btn';
    if (d.isToday) cls += ' today';
    else if (d.done) cls += ' done-day';
    return '<div class="' + cls + '" onclick="_openDayModal(\'' + d.dow + '\')">'
      + '<div class="prem-btn-name">' + d.name + '</div>'
      + '<div class="prem-btn-num">' + d.num + '</div>'
+ ''      + '</div>';
  }).join('');

  // Today cards
  var todayWorkouts = _getPremiumTodayWorkouts();
  var todayCardsHtml = '';
  if (todayWorkouts.length === 0) {
    todayCardsHtml = '<div class="prem-workout-card prem-rest-card">'
      + '<span class="prem-card-emoji">🛋</span>'
      + '<div class="prem-card-tag">Hoy</div>'
      + '<div class="prem-card-name">Descanso</div>'
      + '<div class="prem-card-sub">El músculo crece hoy</div>'
      + '</div>';
  } else {
    todayCardsHtml = todayWorkouts.map(function(w, wi) {
      var isHighlight = wi === 0 && !w.done;
      var cls = 'prem-workout-card' + (isHighlight ? ' highlight' : '') + (w.done ? ' prem-done-card' : '');
      if (w.type === 'sport') {
        return '<div class="' + cls + '">'
          + '<span class="prem-card-emoji">' + w.emoji + '</span>'
          + '<div class="prem-card-tag">Deporte · Hoy</div>'
          + '<div class="prem-card-name">' + w.name + '</div>'
          + '<div class="prem-card-action">'
          + (w.done
              ? '<span class="prem-done-badge" onclick="completeSportDay(\'sport\',\''+w.name+'\')" style="cursor:pointer">✓ Hecho</span>'
              : '<button class="prem-btn-go" onclick="completeSportDay(\'sport\',\'' + w.name + '\')">▶ Completar</button>')
          + '</div>'
          + '</div>';
      }
      var muscleStr = w.muscles ? w.muscles.map(_translateMuscle).join(' · ') : '';
      return '<div class="' + cls + '">'
        + '<span class="prem-card-emoji">' + w.emoji + '</span>'
        + '<div class="prem-card-tag">Fuerza · Hoy</div>'
        + '<div class="prem-card-name">' + w.name + '</div>'
        + (muscleStr ? '<div class="prem-card-sub">' + muscleStr + '</div>' : '')
        + '<div class="prem-card-stats">'
          + '<div class="prem-cs"><div class="prem-cs-val">' + w.exCount + '</div><div class="prem-cs-label">Ejercicios</div></div>'
          + '<div class="prem-cs"><div class="prem-cs-val">' + w.setCount + '</div><div class="prem-cs-label">Series</div></div>'
        + '</div>'
        + '<div class="prem-card-action">'
        + (w.done
            ? '<span class="prem-done-badge">✓ Hecho</span>'
            : '<button class="prem-btn-go" onclick="setTrainDay(' + w.trainDay + ');_showExerciseList()">▶ Iniciar</button>')
        + '</div>'
        + '</div>';
    }).join('');
  }

  // Upcoming
  var upcoming = _getPremiumUpcoming();
  var upcomingHtml = '';
  if (upcoming.length > 0) {
    var rows = upcoming.map(function(u) {
      var chips = u.acts.map(function(a) {
        return '<span class="prem-act-chip' + (a.done ? ' done' : '') + '">' + a.emoji + ' ' + a.name + '</span>';
      }).join('');
      return '<div class="prem-up-row">'
        + '<div class="prem-up-day"><div class="prem-up-day-name">' + u.dowName + '</div><div class="prem-up-day-num">' + u.num + '</div></div>'
        + '<div class="prem-up-activities">' + chips + '</div>'
        + '</div>';
    }).join('');
    upcomingHtml = '<div class="premium-upcoming"><div class="prem-up-header">Próximos días</div>' + rows + '</div>';
  }

  // AI + edit buttons
var hasRoutine = state.config && state.config.training && state.config.training.length > 0;
  var actionsHtml = '<div class="prem-actions" id="trainingActionsBar">'
    + (hasRoutine
        ? '<button onclick="openAIRoutine()" class="prem-action-btn"><span>🤖</span>Nueva rutina IA</button>'
        : '<button onclick="openAIRoutine()" class="prem-action-btn prem-action-primary"><span style="font-size:18px">🤖</span>Generar rutina con IA</button>')
    + '<button onclick="toggleEditWeekMode()" class="prem-action-btn"><span>✏️</span>Editar semana</button>'
    + '<button onclick="_openTrainingCsvSheet()" class="prem-action-btn"><span>📁</span>Importar CSV</button>'
    + '</div>';
  container.innerHTML =
    '<div class="premium">'
      + '<div class="premium-header">'
        + '<div class="premium-title-group">'
          + '<div class="premium-week-label">Semana del ' + weekLabel + '</div>'
          + '<div class="premium-title">Tu semana de<br><em>entrenamiento</em></div>'
        + '</div>'

      + '</div>'
      + '<div class="premium-week-strip" id="trainingWeekStrip">' + stripHtml + '</div>'
      + actionsHtml
      + '<div class="premium-today-block">' + todayCardsHtml + '</div>'
      + upcomingHtml
    + '</div>';
}

function _showExerciseList() {
  var el = document.getElementById('exerciseListSection');
  if (el) {
    el.style.display = 'block';
    setTimeout(function(){ el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
  }
}

function renderTraining() {
  try {
  const day = state[TODAY].trainDay;
  const list = document.getElementById('exerciseList');

  // Render premium header always
  _renderPremiumTraining();

  // Botón IA: grande si no hay rutina, pequeño si ya tiene
  var aiBtnEl = document.getElementById('aiRoutineBtn');
  if (aiBtnEl) {
    var hasRoutine = state.config && state.config.training && state.config.training.length > 0;
    if (hasRoutine) {
      aiBtnEl.innerHTML = '<button onclick="openAIRoutine()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:6px;padding:7px 12px;margin-bottom:10px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;cursor:pointer;font-size:12px;font-weight:600;color:var(--text2)"><span>🤖</span>Generar nueva rutina con IA</button>';
    } else {
      aiBtnEl.innerHTML = '<button onclick="openAIRoutine()" style="width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px 16px;margin-bottom:12px;background:var(--accent);border:none;border-radius:12px;cursor:pointer;font-size:15px;font-weight:700;color:#fff;letter-spacing:0.2px;box-shadow:0 4px 16px rgba(77,138,255,0.35)"><span style="font-size:18px">🤖</span>Generar rutina con IA</button>';
    }
  }

  renderTrainingDaySelector();
if(day===0){
    var _todayDow2 = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
    var _todayCycle = state.config && state.config.cycle && state.config.cycle[_todayDow2];
    if(_todayCycle === 'sport'){
      list.innerHTML='';
      return;
    }
    list.innerHTML = '';
    return;
  }
  // Check if current day is a sport day
// Check if current day is a sport day
  var _dayConfig = state.config && state.config.training && state.config.training[day-1];
  if (_dayConfig && _dayConfig.isSport) {
    var _sEmoji = (typeof _getSportEmoji==='function') ? _getSportEmoji(_dayConfig.sportName||_dayConfig.name) : '⚽';
    var _sName = _dayConfig.sportName || _dayConfig.name || 'Deporte';
var _sportDone = state[TODAY] && (state[TODAY]['sportDone_' + _sName] || state[TODAY]['sportDone_sport']);    list.innerHTML = '<div class="card" style="text-align:center;padding:32px 20px">'
      + '<div style="font-size:48px;margin-bottom:12px">' + _sEmoji + '</div>'
      + '<div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:16px">' + _sName + '</div>'
      + (_sportDone
          ? '<div style="display:inline-flex;align-items:center;gap:8px;background:rgba(50,220,100,0.15);border:1.5px solid var(--green);border-radius:12px;padding:12px 24px;font-size:15px;font-weight:700;color:var(--green)">✓ ¡Actividad completada!</div>'
: '<button onclick="completeSportDay(\'sport\',\'' + _sName + '\')" style="width:100%;padding:14px;background:var(--accent);border:none;border-radius:12px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;margin-bottom:12px">' + _sEmoji + ' Completar ' + _sName + '</button>')
      + '</div>';
    return;
  }
  const d = getConfigTraining();
  if(!d){
    var cfg = state.config;
    var hasCfg = cfg && cfg.training && cfg.training.length > 0;
    var dayData = hasCfg ? cfg.training[day-1] : null;
    var isRestDay = hasCfg && dayData && (!dayData.exercises || dayData.exercises.length === 0);
    if (isRestDay) {
list.innerHTML=`<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;margin-top:4px"><span style="font-size:20px">🛋</span><span style="font-size:13px;color:var(--text3);font-weight:600">${dayData.name} — Descanso</span><span style="margin-left:auto;font-size:11px;color:var(--text3);opacity:0.6">El músculo crece hoy</span></div>`;    } else if (!hasCfg) {
list.innerHTML=`<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;margin-top:4px"><span style="font-size:20px">🛋</span><span style="font-size:13px;color:var(--text3);font-weight:600">Día de descanso</span><span style="margin-left:auto;font-size:11px;color:var(--text3);opacity:0.6">El músculo crece hoy</span></div>`;    } else {
list.innerHTML=`<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;margin-top:4px"><span style="font-size:20px">🛋</span><span style="font-size:13px;color:var(--text3);font-weight:600">Día de descanso</span><span style="margin-left:auto;font-size:11px;color:var(--text3);opacity:0.6">El músculo crece hoy</span></div>`;    }
    return;
  }
  const savedSets = state[TODAY]['trainSets_'+day] || {};

  // ── FLAG DE SESIÓN ──────────────────────────────────────────────
  // Compatibilidad hacia atrás: si ya hay sets completados y no hay flag,
  // lo consideramos como sesión iniciada (datos previos a esta versión).
  const anyDone = Object.values(savedSets).some(function(exSets) {
    return (exSets || []).some(function(s){ return s.done; });
  });
  const sessionStarted = state[TODAY].trainingStarted || anyDone;

  // ── PROGRESS BAR EN HEADER ──────────────────────────────────────
  const prog = _calcExProgress(savedSets, d.exercises);
  const progEl = document.getElementById('trainingProgressWrap');
  if (progEl) {
    progEl.style.display = sessionStarted ? 'block' : 'none';
    if (sessionStarted) {
      const pct = prog.total > 0 ? Math.round(prog.done / prog.total * 100) : 0;
      const progColor = pct === 100 ? 'var(--green)' : 'var(--accent)';
      document.getElementById('trainingProgressBar').style.width = pct + '%';
      document.getElementById('trainingProgressBar').style.background = progColor;
      document.getElementById('trainingProgressLabel').textContent =
        prog.done + ' de ' + prog.total + ' ejercicios completos';
    }
  }

  // ── PANTALLA PRE-ENTRENAMIENTO ───────────────────────────────────
  if (!sessionStarted) {
    var totalSets = d.exercises.reduce(function(s, ex){ return s + (parseInt(ex.sets)||3); }, 0);
    var muscleGroups = [...new Set(d.exercises.map(function(ex){ return ex.muscle||''; }).filter(Boolean))].slice(0,4);
    // Contador de semanas y alerta de descarga
    if (state.config && !state.config.programStartDate) {
      state.config.programStartDate = TODAY;
      saveState(state);
    }
    var weekBannerHtml = '';
    var _progStart = state.config && state.config.programStartDate;
    if (_progStart) {
      var _msPerWeek = 7 * 24 * 3600 * 1000;
      var _weekNum = Math.max(1, Math.floor((new Date(TODAY) - new Date(_progStart)) / _msPerWeek) + 1);
      var _deloadDue = _weekNum > 0 && _weekNum % 7 === 0;
      var _deloadSoon = !_deloadDue && _weekNum > 0 && (_weekNum % 7 === 6);
      var _weekLabel = _deloadDue
        ? '<span style="color:var(--yellow);font-weight:700">⚡ Semana ' + _weekNum + ' — Esta semana toca descarga</span>'
        : _deloadSoon
          ? '<span style="color:var(--accent)">Semana ' + _weekNum + '</span><span style="color:var(--text3);font-size:10px;margin-left:6px">· Próxima semana: descarga</span>'
          : '<span style="color:var(--text2)">Semana ' + _weekNum + '</span>';
      weekBannerHtml = '<div style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;background:var(--bg3);border-radius:8px;padding:7px 12px;margin-bottom:10px;border:1px solid ' + (_deloadDue ? 'rgba(255,200,40,0.4)' : 'var(--border)') + '">📅 ' + _weekLabel + '</div>';
    }
    list.innerHTML =
      '<div class="card train-start-card">' +
        '<div class="train-start-day">' + d.name + '</div>' +
        weekBannerHtml +
        '<div class="train-start-stats">' +
          '<div class="train-start-stat"><span class="train-start-stat-val">' + d.exercises.length + '</span><span class="train-start-stat-lbl">ejercicios</span></div>' +
          '<div class="train-start-divider"></div>' +
          '<div class="train-start-stat"><span class="train-start-stat-val">' + totalSets + '</span><span class="train-start-stat-lbl">series totales</span></div>' +
        '</div>' +
(muscleGroups.length ? '<div class="train-start-muscles">' + muscleGroups.map(function(m){ return '<span class="train-start-muscle-chip">' + _translateMuscle(m) + '</span>'; }).join('') + '</div>' : '') +
        '<button class="btn btn-primary train-start-btn" onclick="startTraining()">' + (state[TODAY].trainingPaused ? '▶ Reanudar entrenamiento' : '▶ Iniciar entrenamiento') + '</button>' +
        '<div class="train-start-hint">También podés marcar sets directamente</div>' +
      '</div>';
    // Inicializar trainSets_ con los ejercicios del día para que toggleSet funcione sin "Iniciar"
    if (!state[TODAY]['trainSets_'+day]) {
      // Build a properly initialized set structure (not just the empty {} from state)
      var initSets = {};
      d.exercises.forEach(function(ex, i) {
        initSets[i] = Array.from({length: parseInt(ex.sets)||3}, function(){ return {kg:'',reps:'',done:false}; });
      });
      state[TODAY]['trainSets_'+day] = initSets;
      saveState(state);
    }
    checkAdaptiveRoutine();
    renderPRHistory();
    return;
  }

  // ── LISTA DE EJERCICIOS (sesión iniciada) ────────────────────────
// ── CONTROLES DE SESIÓN (pausar / cancelar / terminar) ──────────
// ── LISTA DE EJERCICIOS (sesión iniciada) ────────────────────────
list.innerHTML = '<div class="section-div">' + d.name + '</div><div id="sessionTimerWrap"></div>';
_renderSessionTimer();
  const renderedSS = new Set();
  d.exercises.forEach((ex, exIdx) => {
    // Superset divider before first exercise of each group
    if(ex.ssGroup && ex.ssPart==='a' && !renderedSS.has(ex.ssGroup)) {
      renderedSS.add(ex.ssGroup);
      const ssInfo = d.supersets?.find(s=>s.id===ex.ssGroup);
      if(ssInfo) {
        const div = document.createElement('div');
        div.className='ss-timer-wrap';
        div.id='ss-timer-'+ex.ssGroup;
        div.innerHTML=
          '<div class="ss-divider-row">⚡ '+ssInfo.label+'</div>'+
          '<div class="ss-timer-bar-wrap" id="ss-bar-'+ex.ssGroup+'">'+
            '<div class="ss-timer-countdown">'+
              '<div class="ss-timer-secs" id="ss-secs-'+ex.ssGroup+'">—</div>'+
              '<div class="ss-timer-label" id="ss-lbl-'+ex.ssGroup+'"></div>'+
            '</div>'+
            '<div class="ss-timer-track"><div class="ss-timer-fill" id="ss-fill-'+ex.ssGroup+'" style="width:100%;background:var(--accent)"></div></div>'+
            '<div class="ss-timer-done-msg" id="ss-done-'+ex.ssGroup+'">✅ ¡Listo para la próxima serie de '+ex.name+'!</div>'+
            '<div class="ss-timer-btns">'+
              '<button class="ss-timer-btn add" onclick="ssAddTime(\''+ex.ssGroup+'\',30)">+30s</button>'+
              '<button class="ss-timer-btn skip" onclick="ssDismiss(\''+ex.ssGroup+'\')">Saltar</button>'+
            '</div>'+
          '</div>';
        list.appendChild(div);
      }
    }

    const exSets = savedSets[exIdx] || Array.from({length:ex.sets},()=>({kg:'',reps:'',done:false}));
    const lastSession = (state.exerciseHistory||{})[ex.name]?.[0];
    const lastSetsLog = lastSession?.setsLog||[];

    // Auto-fill de peso desde última sesión (a menos que la progresión indique subir)
    const autoFillTarget = getProgressionTarget(ex.name, ex);
    const shouldUpgradeWeight = autoFillTarget && autoFillTarget.type === 'warn'; // tope de reps alcanzado → subir peso
    const lastKg = lastSession?.maxKg || '';
    const suggestedKg = shouldUpgradeWeight
      ? (lastKg ? (parseFloat(lastKg) + 2.5).toFixed(1) : '')
      : (lastKg || '');

    const setsHtml = exSets.map((s,sIdx)=>{
      const prev = lastSetsLog[sIdx];
      const repsPH = prev?.reps ? prev.reps+' reps' : ex.reps;

      // Peso: si hay valor guardado en la sesión actual → usarlo.
      // Si es la primera serie → pre-cargar con sugerido de última sesión.
      // Si es serie 2+ y serie 0 tiene kg → copiar el kg de la serie 0 automáticamente.
      var kgVal = s.kg || '';
      if (!kgVal && sIdx === 0 && suggestedKg) kgVal = suggestedKg;
      if (!kgVal && sIdx > 0) {
        var firstSetKg = exSets[0] && exSets[0].kg;
        if (firstSetKg) kgVal = firstSetKg;
        else if (suggestedKg) kgVal = suggestedKg;
      }
      // Si acabamos de auto-rellenar, persistir en state
      if (kgVal && !s.kg) {
        if (!state[TODAY]['trainSets_'+state[TODAY].trainDay]) state[TODAY]['trainSets_'+state[TODAY].trainDay] = savedSets;
        if (state[TODAY]['trainSets_'+state[TODAY].trainDay][exIdx] && state[TODAY]['trainSets_'+state[TODAY].trainDay][exIdx][sIdx]) {
          state[TODAY]['trainSets_'+state[TODAY].trainDay][exIdx][sIdx].kg = kgVal;
        }
      }

      const setRIR = ex.setRIRs && ex.setRIRs[sIdx] != null ? ex.setRIRs[sIdx] : null;
      const rirBadge = setRIR !== null ? `<span style="font-size:10px;font-weight:700;color:var(--accent);background:rgba(77,138,255,0.12);padding:2px 5px;border-radius:4px;flex-shrink:0;white-space:nowrap">RIR ${setRIR}</span>` : '';
      const weightSection = ex.isTimeBased ? '' : `<div class="weight-picker" id="wpkg-${exIdx}-${sIdx}">
          <button class="wp-btn wp-minus" ontouchstart="event.preventDefault();adjustWeight(${exIdx},${sIdx},-2.5)" onclick="adjustWeight(${exIdx},${sIdx},-2.5)">−</button>
          <input class="set-input wp-input" inputmode="decimal" placeholder="kg" value="${kgVal}" oninput="this.value=_sanitizeNumInput(this.value,true);updateSetAndPropagate(${exIdx},${sIdx},'kg',this.value)">
          <button class="wp-btn wp-plus" ontouchstart="event.preventDefault();adjustWeight(${exIdx},${sIdx},2.5)" onclick="adjustWeight(${exIdx},${sIdx},2.5)">+</button>
        </div>`;
      const repsSection = ex.isTimeBased
        ? `<div style="display:flex;align-items:center;gap:3px;flex:1"><input class="set-input" inputmode="numeric" placeholder="seg" value="${s.reps||''}" style="max-width:70px" oninput="this.value=_sanitizeNumInput(this.value,false);updateSet(${exIdx},${sIdx},'reps',this.value)"><span style="font-size:11px;color:var(--text3);flex-shrink:0">s</span></div>`
        : `<input class="set-input" inputmode="numeric" placeholder="${repsPH}" value="${s.reps||''}" oninput="this.value=_sanitizeNumInput(this.value,false);updateSet(${exIdx},${sIdx},'reps',this.value)">`;

      return `<div class="set-row" id="setrow-${exIdx}-${sIdx}">
        <div class="set-num">${sIdx+1}</div>
        ${weightSection}
        ${repsSection}
        ${rirBadge}
        <button class="set-check ${s.done?'done':''}" id="sc-${exIdx}-${sIdx}" onclick="toggleSet(${exIdx},${sIdx})">${s.done?'✓':''}</button>
      </div>`;
    }).join('');

    const doneCount = exSets.filter(s=>s.done).length;
    const allDone = doneCount===exSets.length&&exSets.length>0;
    const isPR = allDone&&checkIfPR(ex.name,exSets);
const target = getProgressionTarget(ex.name, ex);
    const targetHtml = (target && target.type === 'info') ? `<div class="prog-target ${target.type}" style="margin-bottom:8px"><div class="prog-target-icon">💪</div><div><div class="prog-target-text">${target.line1}</div><div class="prog-target-sub">${target.line2}</div></div></div>` : '';
    const topeBadge = '';
    const ssBadge = ex.ssGroup ? `<span class="ss-badge">${ex.ssPart==='a'?'A':'B'}</span>` : '';

    // Feature 1: Progression bar
    const progBarHtml = buildProgressionBar(exSets, ex);
    // Feature 2: Weight suggestion (show if any set is done)
const weightSuggHtml = doneCount > 0 ? buildWeightSuggestionUpgradeOnly(ex.name, ex, exSets) : '';
function buildWeightSuggestionUpgradeOnly(exName, ex, currentSets) {
  // Solo muestra el cartel de subir peso — nunca el "apuntá al máximo" (ya lo cubre targetHtml)
  const history = (state.exerciseHistory || {})[exName] || [];
  if (history.length < 1) return '';
  const repRange = parseRepRange(ex.reps);
  if (!repRange || ex.noTopRep) return '';
  const numSets = ex.sets || 4;
  const maxReps = numSets * repRange.max;
  const lastSession = history[0];
  const lastTotalReps = (lastSession.avgReps || 0) * numSets;
  const lastWeight = lastSession.maxKg || 0;
  const nextWeight = (lastWeight + 2.5).toFixed(1);
  if (lastTotalReps >= maxReps) {
    return '<div class="weight-suggestion upgrade"><div class="ws-icon">\ud83d\udd3c</div><div class="ws-body">' +
      '<div class="ws-title">\u00a1Sub\u00ed el peso hoy! \u2014 ' + exName + '</div>' +
      '<div class="ws-detail">La \u00faltima sesi\u00f3n completaste ' + lastTotalReps + '/' + maxReps + ' reps. Ya es hora de progresar.</div>' +
      '<div class="ws-next upgrade">Hoy: ' + nextWeight + 'kg \u00d7 ' + repRange.min + '\u2013' + repRange.max + ' reps</div>' +
    '</div></div>';
  }
  return '';
}
    const card = document.createElement('div');
    card.className = `exercise-card${ex.ssGroup?(' superset-'+ex.ssPart):''}`;
    card.id = 'excard-'+exIdx;
    card.innerHTML = `
      <div class="exercise-header" onclick="toggleExCard(${exIdx})">
        <div style="flex:1">
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:2px">
            ${ssBadge}<div class="exercise-name">${ex.name}</div>${topeBadge}
          </div>
<div class="exercise-muscle">${_translateMuscle(ex.muscle)} · ${ex.sets}×${ex.reps}</div>        </div>
    <div style="display:flex;align-items:center;gap:4px;">
          ${isPR?`<span class="tag tag-green">🏆 PR</span>`:doneCount>0?`<span class="tag tag-green">${doneCount}/${ex.sets}</span>`:''}
          <button onclick="event.stopPropagation();openProgressionModal('${ex.name.replace(/'/g,"\\'")}')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:0 3px;line-height:1" title="Ver progreso">📊</button>
          <button onclick="event.stopPropagation();reorderExercise(${exIdx},-1)" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:0 2px;line-height:1" ${(exIdx===0||ex.ssGroup)?'disabled style="opacity:0.2;background:none;border:none;cursor:default;font-size:13px;padding:0 2px"':''}>↑</button>
          <button onclick="event.stopPropagation();reorderExercise(${exIdx},1)" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:13px;padding:0 2px;line-height:1" ${(exIdx===d.exercises.length-1||ex.ssGroup)?'disabled style="opacity:0.2;background:none;border:none;cursor:default;font-size:13px;padding:0 2px"':''}>↓</button>
          <div class="exercise-chevron">▾</div>
        </div>
      </div>
      <div class="sets-container">
        ${targetHtml}${setsHtml}
        ${progBarHtml}
        ${weightSuggHtml}
        <button class="add-set-btn" onclick="addSet(${exIdx})">+ Serie</button>
      </div>`;
    list.appendChild(card);
    if(!savedSets[exIdx]) savedSets[exIdx]=exSets;
  });

  if(!state[TODAY]['trainSets_'+day]){
    state[TODAY]['trainSets_'+day]=savedSets;
    saveState(state);
  }
checkAdaptiveRoutine();
  renderPRHistory();
  _reattachSSTimers();
  // Progreso por ejercicio siempre visible
  var phEl = document.getElementById('prHistorySection');
  if (phEl) phEl.open = true;

  // ── RESUMEN DE SESIÓN (al completar todos los ejercicios) ────────
  const finalProg = _calcExProgress(savedSets, d.exercises);
  if (finalProg.done > 0 && finalProg.done === finalProg.total) {
    const volume = _calcSessionVolume(savedSets);
    // Contar PRs del día
    const prCount = d.exercises.filter(function(ex, exIdx) {
      var exSets = savedSets[exIdx] || [];
      return exSets.length > 0 && checkIfPR(ex.name, exSets);
    }).length;
    const volStr = volume > 0 ? volume.toLocaleString() + ' kg' : '—';
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'card train-summary-card';
    summaryDiv.innerHTML =
      '<div class="train-summary-title">🏁 ¡Entrenamiento completo!</div>' +
      '<div class="train-summary-stats">' +
        '<div class="train-summary-stat">' +
          '<div class="train-summary-val">' + finalProg.total + '</div>' +
          '<div class="train-summary-lbl">ejercicios</div>' +
        '</div>' +
        '<div class="train-summary-stat">' +
          '<div class="train-summary-val">' + volStr + '</div>' +
          '<div class="train-summary-lbl">volumen total</div>' +
        '</div>' +
        (prCount > 0
          ? '<div class="train-summary-stat"><div class="train-summary-val" style="color:var(--yellow)">🏆 ' + prCount + '</div><div class="train-summary-lbl">PR' + (prCount > 1 ? 's' : '') + ' hoy</div></div>'
          : '') +
      '</div>';
list.appendChild(summaryDiv);
  }
  } catch(e) {
    var _list = document.getElementById('exerciseList');
    if (_list) _list.innerHTML = '<div class="empty"><div class="empty-icon">⚠️</div>Error al cargar el entrenamiento. Recargá la app.</div>';
  }
}

function toggleExCard(idx) {
  const c = document.getElementById('excard-' + idx);
  c.classList.toggle('open');
}

function updateSet(exIdx, sIdx, field, val) {
  const day = state[TODAY].trainDay;
  if (!state[TODAY]['trainSets_'+day]) return;
  if (!state[TODAY]['trainSets_'+day][exIdx] || !state[TODAY]['trainSets_'+day][exIdx][sIdx]) return;
  state[TODAY]['trainSets_'+day][exIdx][sIdx][field] = val;
  saveState(state);
}

// Actualiza kg y propaga el valor a las series siguientes vacías del mismo ejercicio
// Actualiza kg y lo sincroniza en TODAS las series del mismo ejercicio
function updateSetAndPropagate(exIdx, sIdx, field, val) {
  const day = state[TODAY].trainDay;
  if (!state[TODAY]['trainSets_'+day]) return;
  var sets = state[TODAY]['trainSets_'+day][exIdx];
  if (!sets) return;
  sets[sIdx][field] = val;
  if (field === 'kg' && val) {
    for (var i = 0; i < sets.length; i++) {
      if (i === sIdx) continue;
      sets[i][field] = val;
      var inp = document.querySelector('#setrow-' + exIdx + '-' + i + ' .wp-input');
      if (inp) inp.value = val;
    }
  }
  saveState(state);
}

// Ajusta el peso con los botones +/- del weight picker
// Ajusta el peso con los botones +/- y sincroniza en TODAS las series del ejercicio
function adjustWeight(exIdx, sIdx, delta) {
  const day = state[TODAY].trainDay;
  if (!state[TODAY]['trainSets_'+day]) return;
  var sets = state[TODAY]['trainSets_'+day][exIdx];
  if (!sets || !sets[sIdx]) return;
  var current = Math.max(0, parseFloat(sets[sIdx].kg) || 0);
  var newVal = Math.max(0, Math.round((current + delta) * 10) / 10);
  var newStr = newVal % 1 === 0 ? String(newVal) : newVal.toFixed(1);
  for (var i = 0; i < sets.length; i++) {
    sets[i].kg = newStr;
    var inp = document.querySelector('#setrow-' + exIdx + '-' + i + ' .wp-input');
    if (inp) inp.value = newStr;
  }
  saveState(state);
}

function toggleSet(exIdx, sIdx) {
  haptic('medium');
  const day = state[TODAY].trainDay;
// asegurar que la sesión esté iniciada
if (!state[TODAY].trainingStarted) {
  state[TODAY].trainingStarted = true;
}
  // Garantizar que trainSets_ exista y tenga el ejercicio inicializado
  if (!state[TODAY]['trainSets_'+day]) {
    const d = getConfigTraining();
    if (!d) return;
    const init = {};
    d.exercises.forEach(function(ex, i) {
      init[i] = Array.from({length: parseInt(ex.sets)||3}, function(){ return {kg:'',reps:'',done:false}; });
    });
    state[TODAY]['trainSets_'+day] = init;
    saveState(state);
  }
  const exSetsArr = state[TODAY]['trainSets_'+day][exIdx];
  if (!exSetsArr || !exSetsArr[sIdx]) return;
  const s = state[TODAY]['trainSets_'+day][exIdx][sIdx];
s.done = !s.done;
  saveState(state);
  const allSets = state[TODAY]['trainSets_'+day][exIdx];
  const allDone = allSets.every(s => s.done);
  const cfg = getConfigTraining();
  const ex = cfg ? cfg.exercises[exIdx] : null;
  if (allDone) saveExerciseHistory(day, exIdx, allSets);

  // ── Actualización quirúrgica del DOM ────────────────────────────
  const btn = document.getElementById('sc-' + exIdx + '-' + sIdx);
  if (btn) {
    btn.classList.toggle('done', s.done);
    btn.textContent = s.done ? '✓' : '';
  }

  // Actualizar badge de progreso en la card
// Actualizar barra de progreso del ejercicio (rep-prog-wrap)
  const card = document.getElementById('excard-' + exIdx);
  if (card) {
    const cfg2 = getConfigTraining();
    const ex2 = cfg2 ? cfg2.exercises[exIdx] : null;
    if (ex2) {
      const newProgHtml = buildProgressionBar(allSets, ex2);
      const progWrap = card.querySelector('.rep-prog-wrap');
      if (progWrap) {
        const tmp = document.createElement('div');
        tmp.innerHTML = newProgHtml;
        const newEl = tmp.firstElementChild;
        if (newEl) progWrap.replaceWith(newEl);
      }
      // Actualizar weight suggestion
      const wsList = card.querySelectorAll('.weight-suggestion');
      wsList.forEach(function(ws){ ws.remove(); });
      const addSetBtn = card.querySelector('.add-set-btn');
      const doneCount2 = allSets.filter(function(s){ return s.done; }).length;
      const newWsHtml = doneCount2 > 0
        ? buildWeightSuggestionUpgradeOnly(ex2.name, ex2, allSets)
        : '';
      if (newWsHtml && addSetBtn) {
        const tmp2 = document.createElement('div');
        tmp2.innerHTML = newWsHtml;
        addSetBtn.before(tmp2.firstElementChild);
      }
    }
  }

  // Actualizar badge de progreso en la card
  if (card) {
    const doneCount = allSets.filter(function(s){ return s.done; }).length;
    const headerRight = card.querySelector('.exercise-header > div:last-child');
    if (headerRight) {
      let tagEl = headerRight.querySelector('.tag');
      if (doneCount > 0) {
        if (!tagEl) {
          tagEl = document.createElement('span');
          tagEl.className = 'tag tag-green';
          headerRight.insertBefore(tagEl, headerRight.firstChild);
        }
        if (allDone && ex && checkIfPR(ex.name, allSets)) {
          tagEl.textContent = '🏆 PR';
        } else {
          tagEl.textContent = doneCount + '/' + (ex ? ex.sets : allSets.length);
        }
        tagEl.className = 'tag tag-green';
      }
    }
  }

  // Re-render completo solo cuando termina el ejercicio o inicia la sesión
  if (allDone || !state[TODAY].trainingStarted) {
    renderTraining();
    renderHome();
    populateExSelect();
    const refreshedCard = document.getElementById('excard-' + exIdx);
    if (refreshedCard) refreshedCard.classList.add('open');
  } else {
    // Actualizar barra de progreso global sin re-render
    const d = getConfigTraining();
    if (d) {
      const savedSets = state[TODAY]['trainSets_'+day] || {};
      const prog = _calcExProgress(savedSets, d.exercises);
      const progEl = document.getElementById('trainingProgressWrap');
      if (progEl && state[TODAY].trainingStarted) {
        progEl.style.display = 'block';
        const pct = prog.total > 0 ? Math.round(prog.done / prog.total * 100) : 0;
        const progBar = document.getElementById('trainingProgressBar');
        const progLbl = document.getElementById('trainingProgressLabel');
        if (progBar) { progBar.style.width = pct + '%'; progBar.style.background = pct === 100 ? 'var(--green)' : 'var(--accent)'; }
        if (progLbl) progLbl.textContent = prog.done + ' de ' + prog.total + ' ejercicios completos';
      }
    }
  }

  if (s.done && ex) {
    if (ex.ssGroup && ex.ssPart === 'a') {
      // Disparar timer SS incluso cuando todas las series de A terminan,
      // siempre que B tenga series pendientes (fix: antes se bloqueaba con !allDone)
      const _ts2 = state[TODAY]['trainSets_'+day] || {};
      const _bIdx2 = cfg ? cfg.exercises.findIndex(function(e2){ return e2.ssGroup === ex.ssGroup && e2.ssPart === 'b'; }) : -1;
      const _bSets2 = _bIdx2 >= 0 ? (_ts2[_bIdx2] || []) : [];
      const _bAllDone2 = _bSets2.length > 0 && _bSets2.every(function(s2){ return s2.done; });
      if (!_bAllDone2) startSSTimer(ex, allSets, sIdx);
    } else if (!ex.ssGroup && !allDone) {
      startRestTimer(ex, allSets, sIdx);
    }
  }
  if (allDone) {
    if (ex && checkIfPR(ex.name, allSets)) {
      showToast('🏆 ¡NUEVO PR en ' + ex.name + '!');
    } else {
      showToast('✓ Ejercicio completado');
    }
    if (typeof showActionFeedback === 'function') showActionFeedback('training');
    // Mensaje histórico ocasional (30% prob, máx 1 por sesión)
    if (ex && Math.random() < 0.30 && !state[TODAY]._shownHistMsg) {
      var hist = (state.exerciseHistory || {})[ex.name] || [];
      if (hist.length >= 4) {
        var now4WeeksAgo = new Date(); now4WeeksAgo.setDate(now4WeeksAgo.getDate() - 28);
        var old = hist.find(function(h) { return h.date && new Date(h.date) <= now4WeeksAgo; });
        if (old && old.maxKg && hist[0].maxKg && hist[0].maxKg > old.maxKg) {
          var diff = (hist[0].maxKg - old.maxKg).toFixed(1);
          setTimeout(function() {
            showToast('📈 +' + diff + 'kg en ' + ex.name + ' vs hace 4 semanas');
          }, 2500);
          state[TODAY]._shownHistMsg = true;
          saveState(state);
        }
      }
    }
  }
}
function reorderExercise(exIdx, dir) {
  const day = state[TODAY].trainDay;
  const d = getConfigTraining();
  if (!d) return;
  const exercises = state.config.training[day - 1].exercises;
  // No reordenar ejercicios de una superserie desde la vista en vivo — separarlos rompe el agrupamiento visual del timer
  if (exercises[exIdx] && exercises[exIdx].ssGroup) return;
  const newIdx = exIdx + dir;
  if (newIdx < 0 || newIdx >= exercises.length) return;

  // Swap exercises
  var tmp = exercises[exIdx];
  exercises[exIdx] = exercises[newIdx];
  exercises[newIdx] = tmp;

  // Swap saved sets
  var savedSets = state[TODAY]['trainSets_' + day] || {};
  var tmpSets = savedSets[exIdx];
  savedSets[exIdx] = savedSets[newIdx];
  savedSets[newIdx] = tmpSets;
  state[TODAY]['trainSets_' + day] = savedSets;

  saveState(state);
  renderTraining();
  var card = document.getElementById('excard-' + newIdx);
  if (card) card.classList.add('open');
}

function addSet(exIdx) {
  const day = state[TODAY].trainDay;
  state[TODAY]['trainSets_'+day][exIdx].push({kg:'0',reps:'',done:false});
  saveState(state);
  renderTraining();
  document.getElementById('excard-'+exIdx).classList.add('open');
}

function _sanitizeNumInput(val, allowDecimals) {
  if (allowDecimals) return val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  return val.replace(/[^0-9]/g, '');
}

// ─── MODAL DE PROGRESIÓN POR EJERCICIO ───────────────────────────
function openProgressionModal(exName) {
  var hist = (state.exerciseHistory || {})[exName] || [];
  var modal = document.getElementById('progressionModal');
  var titleEl = document.getElementById('progressionModalTitle');
  var content = document.getElementById('progressionModalContent');
  if (!modal || !content) return;
  if (titleEl) titleEl.innerHTML = '📊 ' + exName + ' <button class="modal-close" onclick="closeProgressionModal()">✕</button>';

  if (hist.length === 0) {
    content.innerHTML = '<div style="text-align:center;color:var(--text3);padding:24px 0">Sin historial aún — completá series para ver el progreso.</div>';
    modal.classList.add('open');
    return;
  }

  var chartData = hist.slice().reverse().map(function(h){ return { val: h.oneRM || h.maxKg, label: (h.date || '').slice(5), date: h.date }; });
  var maxOneRM = Math.max.apply(null, hist.map(function(h){ return h.oneRM || h.maxKg || 0; }));
  var latest = hist[0];
  var prev = hist[1];
  var diff = prev ? ((latest.oneRM || latest.maxKg || 0) - (prev.oneRM || prev.maxKg || 0)).toFixed(1) : null;
  var diffColor = diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--text)';

  content.innerHTML =
    '<div class="stat-trio" style="margin-bottom:14px">' +
      '<div class="stat-pill"><div class="stat-pill-val" style="color:var(--accent)">' + (latest.maxKg || '—') + 'kg</div><div class="stat-pill-lbl">Último peso</div></div>' +
      '<div class="stat-pill"><div class="stat-pill-val" style="color:var(--yellow)">' + maxOneRM + '</div><div class="stat-pill-lbl">1RM est. max</div></div>' +
      '<div class="stat-pill"><div class="stat-pill-val" style="color:' + diffColor + '">' + (diff != null ? ((+diff > 0 ? '+' : '') + diff + 'kg') : '—') + '</div><div class="stat-pill-lbl">vs anterior</div></div>' +
    '</div>' +
    (chartData.length >= 2
      ? '<div style="margin-bottom:14px"><div style="font-size:11px;color:var(--text3);margin-bottom:6px">1RM estimado a lo largo del tiempo</div>' +
        '<svg id="progressionChartSvg" viewBox="0 0 360 140" width="100%" height="140" style="display:block"></svg></div>'
      : '') +
    '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Historial reciente</div>' +
    hist.slice(0, 15).map(function(h) {
      var isPR = (h.oneRM || h.maxKg) === maxOneRM;
      var setsDetail = h.setsLog ? h.setsLog.map(function(sl){ return sl.kg + 'kg×' + sl.reps; }).join(', ') : '';
      return '<div class="ex-history-item">' +
        '<div class="ex-history-date">' + h.date + '</div>' +
        '<div style="flex:1">' +
          '<div style="display:flex;align-items:center;gap:6px">' +
            '<div class="ex-history-val">' + (h.maxKg || '—') + 'kg × ' + (h.avgReps || '?') + ' reps</div>' +
            (h.oneRM ? '<span style="font-size:10px;color:var(--text3)">1RM≈' + h.oneRM + '</span>' : '') +
            (isPR ? '<span class="ex-history-pr">PR</span>' : '') +
          '</div>' +
          (setsDetail ? '<div style="font-size:10px;color:var(--text3);margin-top:1px">' + setsDetail + '</div>' : '') +
        '</div>' +
      '</div>';
    }).join('');

  modal.classList.add('open');
  if (chartData.length >= 2 && typeof drawLineChart === 'function') {
    setTimeout(function(){ drawLineChart('progressionChartSvg', chartData, 'var(--accent)'); }, 60);
  }
}

function closeProgressionModal() {
  var modal = document.getElementById('progressionModal');
  if (modal) modal.classList.remove('open');
}
function _clampPositive(val) { return Math.max(0, parseFloat(val) || 0); }

function completeSportDay(dow, sportName) {
  if (!state[TODAY]) return;
var storeKey = sportName || dow;
  // Leer stats opcionales si existen los inputs (Correr / Bici)
  var tiempoEl = document.getElementById('spt_tiempo_' + dow);
  var distEl   = document.getElementById('spt_dist_'   + dow);
  var tiempo   = tiempoEl   ? parseFloat(tiempoEl.value)   || 0 : 0;
  var distancia = distEl    ? parseFloat(distEl.value)     || 0 : 0;
  var velocidad = (tiempo > 0 && distancia > 0)
    ? Math.round((distancia / tiempo * 60) * 10) / 10
    : 0;

  // Toggle: si ya estaba hecho, deshacer
  if (state[TODAY]['sportDone_' + storeKey]) {
    delete state[TODAY]['sportDone_' + storeKey];
    delete state[TODAY]['sportData_' + storeKey];
    saveState(state);
    showToast('↩ ' + sportName + ' desmarcado');
    renderTraining();
    renderRoutineCards();
    if (typeof renderHome === 'function') renderHome();
    return;
  }
  state[TODAY]['sportDone_' + storeKey] = true;
  if (tiempo || distancia) {
    state[TODAY]['sportData_' + storeKey] = {
      tiempo:    tiempo    || null,
      distancia: distancia || null,
      velocidad: velocidad || null
    };
  }
  saveState(state);
var toastParts = ['✓ ' + sportName + ' completado'];
  if (distancia) toastParts.push(distancia + ' km');
  if (tiempo)    toastParts.push(tiempo + ' min');
  if (velocidad) toastParts.push(velocidad + ' km/h avg');
  showToast(toastParts.join('  ·  '));
  if (typeof showActionFeedback === 'function') showActionFeedback('training');

  renderTraining();
  renderRoutineCards();
  if (typeof renderHome === 'function') renderHome();
}

// ─── IMPORTAR RUTINA DESDE CSV ─────────────────────────────────────
var _trainingCsvPreview = null;

function _openTrainingCsvSheet() {
  var existing = document.getElementById('trainingCsvSheet');
  if (existing) { existing.remove(); return; }
  var sheet = document.createElement('div');
  sheet.id = 'trainingCsvSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;width:100%;max-width:480px;max-height:92vh;display:flex;flex-direction:column;overflow:hidden">' +
      '<div style="padding:16px 20px 0;flex-shrink:0"><div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div></div>' +
      '<div style="padding:0 20px;flex:1;overflow-y:auto">' +
        '<div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px">Importar rutina desde archivo</div>' +
        '<div style="font-size:13px;color:var(--text3);line-height:1.6;margin-bottom:16px">Subí un CSV con una fila por ejercicio. Columnas esperadas:</div>' +
        '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:12px;overflow-x:auto">' +
          '<code style="font-size:11px;color:var(--text2);white-space:nowrap;display:block">Día rutina,Ejercicio,Series,Reps,RIR,Descanso (seg),Superserie (S/N)</code>' +
          '<code style="font-size:11px;color:var(--text3);white-space:nowrap;display:block">Pecho,Press banca,4,8-12,2,90,N</code>' +
          '<code style="font-size:11px;color:var(--text3);white-space:nowrap;display:block">Pecho,Press inclinado,3,10-12,2,60,S</code>' +
          '<code style="font-size:11px;color:var(--text3);white-space:nowrap;display:block">Pecho,Aperturas,3,12-15,1,60,S</code>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-bottom:16px">Las superseries se agrupan de a pares: dos ejercicios consecutivos con <strong>S</strong> forman una superserie. El RIR se aplica igual a todas las series del ejercicio.</div>' +
        '<button onclick="_downloadTrainingCsvTemplate()" class="btn btn-ghost" style="width:100%;margin-bottom:10px;font-size:13px">⬇️ Descargar plantilla de ejemplo</button>' +
        '<button onclick="_triggerTrainingCsvInput()" class="btn btn-primary" style="width:100%;font-size:14px">📁 Elegir archivo CSV</button>' +
      '</div>' +
      '<div style="padding:16px 20px 32px;flex-shrink:0">' +
        '<button onclick="document.getElementById(\'trainingCsvSheet\').remove()" class="btn btn-ghost" style="width:100%">Cerrar</button>' +
      '</div>' +
    '</div>';
  sheet.addEventListener('click', function(e){ if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

function _downloadTrainingCsvTemplate() {
  var rows = [
    ['Día rutina','Ejercicio','Series','Reps','RIR','Descanso (seg)','Superserie (S/N)'],
    ['Pecho','Press banca',4,'8-12',2,90,'N'],
    ['Pecho','Press inclinado con mancuernas',3,'10-12',2,60,'S'],
    ['Pecho','Aperturas con mancuernas',3,'12-15',1,60,'S'],
    ['Pecho','Extensión de tríceps en polea',3,'10-12',2,60,'N'],
    ['Espalda','Dominadas',4,'6-8',2,120,'N'],
    ['Espalda','Remo con barra',4,'8-10',2,90,'S'],
    ['Espalda','Curl de bíceps con barra',3,'10-12',1,60,'S'],
    ['Piernas','Sentadilla',4,'6-10',2,120,'N'],
    ['Piernas','Prensa de piernas',3,'10-15',2,90,'N'],
    ['Piernas','Extensión de cuádriceps',3,'12-15',1,60,'S'],
    ['Piernas','Curl femoral acostado',3,'12-15',1,60,'S'],
  ];
  var csv = rows.map(function(r){ return r.join(','); }).join('\n');
  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  _fallbackDownload(url, 'plantilla-rutina.csv');
}

function _triggerTrainingCsvInput() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,text/csv';
  input.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
  document.body.appendChild(input);
  input.onchange = function(e) {
    var file = e.target.files[0];
    document.body.removeChild(input);
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) { _handleTrainingCsvImport(ev.target.result); };
    reader.onerror = function() { showToast('⚠ No se pudo leer el archivo'); };
    reader.readAsText(file, 'UTF-8');
  };
  input.click();
}

function _handleTrainingCsvImport(text) {
  var parsed = _parseTrainingCSV(text);
  if (!parsed.days.length) {
    showToast('⚠ No se encontraron ejercicios válidos en el archivo' + (parsed.errors.length ? ' (' + parsed.errors.length + ' con errores)' : ''));
    return;
  }
  _trainingCsvPreview = parsed;
  _openTrainingCsvConfirmSheet(parsed);
}

function _openTrainingCsvConfirmSheet(parsed) {
  var totalEx = parsed.days.reduce(function(s, d){ return s + d.exercises.length; }, 0);
  var summary = parsed.days.length + ' día' + (parsed.days.length > 1 ? 's' : '') + ' de rutina · ' + totalEx + ' ejercicio' + (totalEx > 1 ? 's' : '');
  var errHtml = parsed.errors.length ?
    '<div style="background:rgba(255,196,0,0.08);border:1px solid var(--yellow);border-radius:10px;padding:10px 12px;margin-bottom:16px">' +
      '<div style="font-size:12px;font-weight:700;color:var(--yellow);margin-bottom:4px">⚠ ' + parsed.errors.length + ' fila' + (parsed.errors.length > 1 ? 's' : '') + ' con problemas (se van a ignorar)</div>' +
      parsed.errors.slice(0, 6).map(function(e){ return '<div style="font-size:11px;color:var(--text3)">• ' + _escapeHtml(e) + '</div>'; }).join('') +
      (parsed.errors.length > 6 ? '<div style="font-size:11px;color:var(--text3)">… y ' + (parsed.errors.length - 6) + ' más</div>' : '') +
    '</div>' : '';
  var previewHtml = parsed.days.map(function(d) {
    var exHtml = d.exercises.slice(0, 5).map(function(ex) {
      var ssLabel = ex.ssGroup ? ' <span style="color:var(--green);font-size:10px;font-weight:700">SS</span>' : '';
      return '<div style="font-size:11px;color:var(--text3);padding:2px 0 2px 8px">• ' + _escapeHtml(ex.name) + ' · ' + ex.sets + '×' + ex.reps + ' · RIR ' + (ex.setRIRs && ex.setRIRs[0] !== undefined ? ex.setRIRs[0] : '—') + ' · ' + ex.restSec + 's descanso' + ssLabel + '</div>';
    }).join('') + (d.exercises.length > 5 ? '<div style="font-size:11px;color:var(--text3);padding:2px 0 2px 8px">… y ' + (d.exercises.length - 5) + ' más</div>' : '');
    return '<div style="margin-bottom:12px;border-bottom:1px solid var(--bg4);padding-bottom:10px">' +
      '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">🏋️ ' + _escapeHtml(d.name) + '</div>' +
      exHtml +
    '</div>';
  }).join('');
  var existing = document.getElementById('trainingCsvConfirmSheet'); if (existing) existing.remove();
  var sheet = document.createElement('div');
  sheet.id = 'trainingCsvConfirmSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10001;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px;max-height:80vh;display:flex;flex-direction:column">' +
      '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px;flex-shrink:0"></div>' +
      '<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px;flex-shrink:0">' + summary + '</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:12px;flex-shrink:0">Si ya existe un día con el mismo nombre, sus ejercicios se reemplazan.</div>' +
      '<div style="overflow-y:auto;flex:1;margin-bottom:12px">' + errHtml + previewHtml + '</div>' +
      '<button onclick="_confirmTrainingCsvImport()" class="btn btn-primary" style="width:100%;margin-bottom:8px;flex-shrink:0">✅ Agregar a mi rutina</button>' +
      '<button onclick="document.getElementById(\'trainingCsvConfirmSheet\').remove()" class="btn btn-ghost" style="width:100%;flex-shrink:0">Cancelar</button>' +
    '</div>';
  sheet.addEventListener('click', function(e){ if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

function _confirmTrainingCsvImport() {
  var parsed = _trainingCsvPreview;
  var s1 = document.getElementById('trainingCsvConfirmSheet'); if (s1) s1.remove();
  var s2 = document.getElementById('trainingCsvSheet'); if (s2) s2.remove();
  if (!parsed || !parsed.days.length) return;
  if (!state.config) state.config = {};
  if (!state.config.training) state.config.training = [];
  parsed.days.forEach(function(csvDay) {
    var idx = state.config.training.findIndex(function(d){ return d.name === csvDay.name; });
    if (idx >= 0) {
      state.config.training[idx].exercises = csvDay.exercises;
    } else {
      state.config.training.push({ name: csvDay.name, exercises: csvDay.exercises });
    }
  });
  saveState(state);
  renderTraining();
  if (typeof renderHome === 'function') renderHome();
  _trainingCsvPreview = null;
  showToast('✅ ' + parsed.days.length + ' día' + (parsed.days.length > 1 ? 's' : '') + ' de rutina importado' + (parsed.days.length > 1 ? 's' : ''));
}

function _parseTrainingCSV(text) {
  var days = [], errors = [], rawByDay = {}, dayOrder = [];
  if (!text) return { days: days, errors: errors };
  var lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(function(l){ return l.trim().length; });
  if (!lines.length) return { days: days, errors: errors };

  var firstLine = lines[0];
  var delim = (firstLine.match(/;/g)||[]).length > (firstLine.match(/,/g)||[]).length ? ';' : ',';
  var numDelim = delim === ';' ? ',' : null;

  function parseNum(v) {
    if (numDelim) v = String(v).replace(numDelim, '.');
    return parseFloat(v);
  }
  function splitLine(line) {
    var out = [], cur = '', inQ = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (inQ) { if (ch==='"') { if(line[i+1]==='"'){cur+='"';i++;} else inQ=false; } else cur+=ch; }
      else { if(ch==='"') inQ=true; else if(ch===delim){out.push(cur);cur='';} else cur+=ch; }
    }
    out.push(cur);
    return out.map(function(c){ return c.trim(); });
  }

  var headerCells = splitLine(firstLine).map(function(c){ return c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim(); });
  var looksLikeHeader = headerCells.some(function(c){ return ['dia rutina','ejercicio','series','reps'].indexOf(c) >= 0; });
  var startIdx = looksLikeHeader ? 1 : 0;

  for (var i = startIdx; i < lines.length; i++) {
    var rowNum = i + 1;
    var cells = splitLine(lines[i]);
    var dayName = (cells[0] || '').trim();
    var exName  = (cells[1] || '').trim();
    if (!dayName || !exName) { if (dayName || exName) errors.push('Fila ' + rowNum + ': falta nombre de día o ejercicio'); continue; }
    var sets    = Math.max(1, parseInt(cells[2]) || 3);
    var reps    = (cells[3] || '8-12').trim() || '8-12';
    var rir     = isNaN(parseNum(cells[4])) ? 2 : Math.max(0, Math.min(5, Math.round(parseNum(cells[4]))));
    var restSec = isNaN(parseNum(cells[5])) ? 90 : Math.max(0, Math.round(parseNum(cells[5])));
    var ssRaw   = (cells[6] || '').trim().toUpperCase();
    var isSuperset = ssRaw === 'S' || ssRaw === 'SI' || ssRaw === 'SÍ' || ssRaw === '1' || ssRaw === 'YES';
    if (!rawByDay[dayName]) { rawByDay[dayName] = []; dayOrder.push(dayName); }
    rawByDay[dayName].push({ name: exName, sets: sets, reps: reps, rir: rir, restSec: restSec, isSuperset: isSuperset });
  }

  // Deduplicate dayOrder and build days with superset grouping
  dayOrder.filter(function(d, i, a){ return a.indexOf(d) === i; }).forEach(function(dayName) {
    var rawExs = rawByDay[dayName];
    var exercises = [];
    var ssCounter = 0;
    var pendingSS = null;
    rawExs.forEach(function(raw) {
      var ex = { name: raw.name, sets: raw.sets, reps: raw.reps, restSec: raw.restSec, setRIRs: Array(raw.sets).fill(raw.rir) };
      if (raw.isSuperset) {
        if (!pendingSS) {
          ex.ssGroup = 'csv_ss_' + ssCounter;
          ex.ssPart = 'a';
          pendingSS = ex;
        } else {
          ex.ssGroup = pendingSS.ssGroup;
          ex.ssPart = 'b';
          ssCounter++;
          pendingSS = null;
        }
      }
      exercises.push(ex);
    });
    if (pendingSS) { delete pendingSS.ssGroup; delete pendingSS.ssPart; }
    days.push({ name: dayName, exercises: exercises });
  });
  return { days: days, errors: errors };
}

