// ═══════════════════════════════════════════════════════════════════════════════
// AI ROUTINE GENERATOR — UI LAYER v2.0
// Drop-in replacement for the original ai-routine.js
// Integrates with: workout-generator.js + exercise-db.js
// ═══════════════════════════════════════════════════════════════════════════════

// ─── WIZARD STATE ─────────────────────────────────────────────────────────────
var _airWizStep  = 1;
var _airEquip    = 'gym';
var _airLevel    = 'intermediate';
var _airGoal     = 'hypertrophy';
var _airDays     = 4;
var _airTime     = 60;
var _airSelected = new Set();   // Selected muscle IDs
var _airPriority = new Set();   // Priority muscles (extra volume)
var _airInjuries = new Set();   // Injury list (reduced volume)
var _airSchedule = {};          // DOW → 'train' | 'rest'
var _airResult   = null;        // Last generated routine result

const _AIR_STEPS = 6;
const _AIR_STEP_INFO = [
  { title: 'Where do you train?',       hint: 'Equipment determines exercise selection.' },
  { title: 'Level & Goal',              hint: 'Your level and goal adjust volume, sets, reps and rest with evidence-based logic.' },
  { title: 'Weekly availability',       hint: 'Days and session duration define your split and maximum volume.' },
  { title: 'Muscles to train',          hint: 'Select target muscles. Use ⭐ to prioritize or 🚫 to mark injuries.' },
  { title: 'Weekly schedule',           hint: 'Distribute training days for optimal recovery between sessions.' },
  { title: 'Your science-based routine',hint: 'Generated from meta-analysis data: Schoenfeld, Krieger, Israetel.' },
];

// ─── OPEN / CLOSE ─────────────────────────────────────────────────────────────
function openAIRoutine() {
  _airWizStep  = 1;
  _airEquip    = 'gym';
  _airLevel    = 'intermediate';
  _airGoal     = 'hypertrophy';
  _airDays     = 4;
  _airTime     = 60;
  _airSelected = new Set();
  _airPriority = new Set();
  _airInjuries = new Set();
  _airSchedule = {};
  _airResult   = null;
  _airRenderWiz();
  document.getElementById('aiRoutineModal').classList.add('open');
}

// ─── WIZARD NAVIGATION ────────────────────────────────────────────────────────
function _airRenderWiz() {
  for (var i = 1; i <= _AIR_STEPS; i++) {
    var el = document.getElementById('airStep' + i);
    if (el) el.classList.toggle('active', i === _airWizStep);
  }

  var info = _AIR_STEP_INFO[_airWizStep - 1];
  var t = document.getElementById('airModalTitle');
  if (t) t.childNodes[0].textContent = '🧬 ' + info.title + ' ';
  var s = document.getElementById('airStepSubtitle');
  if (s) s.textContent = info.hint;

  // Progress dots
  var prog = '';
  for (var j = 1; j <= _AIR_STEPS; j++) {
    prog += '<div class="wiz-dot' + (j <= _airWizStep ? ' done' : '') + '"></div>';
  }
  var pd = document.getElementById('airProgress');
  if (pd) pd.innerHTML = prog;

  // Back / Next buttons
  var bk = document.getElementById('airBtnBack');
  var nx = document.getElementById('airBtnNext');
  if (bk) bk.style.display = _airWizStep > 1 ? '' : 'none';
  if (nx) {
    if (_airWizStep === _AIR_STEPS) nx.textContent = '✅ Apply Routine';
    else if (_airWizStep === _AIR_STEPS - 1) nx.textContent = '⚡ Generate Routine';
    else nx.textContent = 'Continue →';
  }

  // Step-specific renders
  if (_airWizStep === 4) _airRenderMuscleSelector();
  if (_airWizStep === 5) { _airGenerateRoutine(); _airRenderSchedule(); }
  if (_airWizStep === 6) _airRenderResult();
}

function airWizNav(dir) {
  if (dir === 1) {
    if (_airWizStep === 4 && _airSelected.size === 0) {
      showToast('⚠ Select at least one muscle group');
      return;
    }
    if (_airWizStep === _AIR_STEPS) {
      applyAIRoutine();
      return;
    }
  }
  _airWizStep = Math.max(1, Math.min(_AIR_STEPS, _airWizStep + dir));
  _airRenderWiz();
}

// ─── STEP 1 — EQUIPMENT ──────────────────────────────────────────────────────
function airPickEquip(btn) {
  document.querySelectorAll('.air-equip-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  _airEquip = btn.dataset.eq;
}

// ─── STEP 2 — LEVEL & GOAL ────────────────────────────────────────────────────
function airSetLevel(btn) {
  document.querySelectorAll('.air-level').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  _airLevel = btn.dataset.level;
}

function airSetGoal(btn) {
  document.querySelectorAll('.air-goal').forEach(function(b) {
    b.classList.remove('active');
    b.style.borderColor = 'var(--border)';
    b.style.background  = 'var(--bg3)';
  });
  btn.classList.add('active');
  var goalBg     = { strength:'rgba(255,107,77,0.1)', hypertrophy:'rgba(77,138,255,0.08)', fat_loss:'rgba(77,255,180,0.08)', general:'rgba(255,212,77,0.08)' };
  var goalBorder = { strength:'var(--red)', hypertrophy:'var(--accent)', fat_loss:'var(--green)', general:'var(--yellow)' };
  btn.style.borderColor = goalBorder[btn.dataset.goal] || 'var(--accent)';
  btn.style.background  = goalBg[btn.dataset.goal]     || 'rgba(77,138,255,0.08)';
  _airGoal = btn.dataset.goal;
}

// ─── STEP 3 — DAYS & TIME ────────────────────────────────────────────────────
function airPickDays(btn) {
  document.querySelectorAll('.air-days-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  _airDays = parseInt(btn.dataset.d);
}
function airPickTime(btn) {
  document.querySelectorAll('.air-time-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  _airTime = parseInt(btn.dataset.t);
}

// ─── STEP 4 — MUSCLE SELECTOR ─────────────────────────────────────────────────
function _airRenderMuscleSelector() {
  var cl = document.getElementById('bmCheckList');
  if (!cl) return;

  cl.innerHTML = MUSCLE_META.map(function(m) {
    var isSelected = _airSelected.has(m.id);
    var isPriority = _airPriority.has(m.id);
    var isInjured  = _airInjuries.has(m.id);
    var stateClass = isSelected ? ' active' : '';
    if (isPriority) stateClass += ' priority';
    if (isInjured)  stateClass += ' injured';

    var statusBadge = isPriority
      ? '<span style="font-size:9px;margin-left:4px">⭐</span>'
      : isInjured
      ? '<span style="font-size:9px;margin-left:4px">🚫</span>'
      : '';

    return '<div style="display:flex;align-items:center;gap:4px;margin-bottom:5px">' +
      '<button class="bm-check' + stateClass + '" ' +
        'onclick="bmToggle(\'' + m.id + '\')" ' +
        'style="flex:1">' +
        m.emoji + ' ' + m.label + statusBadge +
      '</button>' +
      (isSelected ? (
        '<button onclick="bmSetPriority(\'' + m.id + '\')" title="Priority (more volume)" ' +
          'style="padding:4px 7px;border-radius:6px;border:1px solid var(--border);background:' +
          (isPriority ? 'rgba(255,212,77,0.2);color:var(--yellow)' : 'var(--bg3);color:var(--text3)') +
          ';font-size:12px;cursor:pointer">⭐</button>' +
        '<button onclick="bmSetInjury(\'' + m.id + '\')" title="Injured (reduced volume)" ' +
          'style="padding:4px 7px;border-radius:6px;border:1px solid var(--border);background:' +
          (isInjured ? 'rgba(255,107,77,0.2);color:var(--red)' : 'var(--bg3);color:var(--text3)') +
          ';font-size:12px;cursor:pointer">🚫</button>'
      ) : '') +
    '</div>';
  }).join('');

  // Update body map SVG if present
  MUSCLE_META.forEach(function(m) {
    var el = document.getElementById('bm-' + m.id);
    if (el) {
      el.style.fill    = _airSelected.has(m.id) ? 'var(--accent)' : '';
      el.style.opacity = _airSelected.has(m.id) ? '1' : '';
    }
    document.querySelectorAll('.bm-mirror[data-zone="' + m.id + '"]').forEach(function(el2) {
      el2.style.fill    = _airSelected.has(m.id) ? 'var(--accent)' : '';
      el2.style.opacity = _airSelected.has(m.id) ? '1' : '';
    });
  });
}

function bmToggle(id) {
  if (_airSelected.has(id)) {
    _airSelected.delete(id);
    _airPriority.delete(id);
    _airInjuries.delete(id);
  } else {
    _airSelected.add(id);
  }
  _airRenderMuscleSelector();
}

function bmSetPriority(id) {
  if (_airPriority.has(id)) { _airPriority.delete(id); }
  else { _airPriority.add(id); _airInjuries.delete(id); }
  _airRenderMuscleSelector();
}

function bmSetInjury(id) {
  if (_airInjuries.has(id)) { _airInjuries.delete(id); }
  else { _airInjuries.add(id); _airPriority.delete(id); }
  _airRenderMuscleSelector();
}

// ─── STEP 5 — SCHEDULE ────────────────────────────────────────────────────────
function _airRenderSchedule() {
  var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var dowL    = ['MON','TUE','WED','THU','FRI','SAT','SUN'];

  // Auto-assign training days if not set
  var trainDows = allDows.filter(function(d) { return _airSchedule[d] === 'train'; });
  if (trainDows.length === 0) {
    allDows.forEach(function(d) { _airSchedule[d] = 'rest'; });
    var spacing = Math.max(1, Math.floor(7 / _airDays));
    var assigned = 0, di = 0;
    while (assigned < _airDays && di < 21) {
      var dow = allDows[di % 7];
      if (_airSchedule[dow] === 'rest') { _airSchedule[dow] = 'train'; assigned++; }
      di += spacing;
    }
    // Fill any remaining
    allDows.forEach(function(d) {
      if (assigned < _airDays && _airSchedule[d] === 'rest') { _airSchedule[d] = 'train'; assigned++; }
    });
  }

  var info = document.getElementById('airSchedInfo');
  if (info) {
    info.innerHTML = '🧬 <strong>' + (_airResult ? _airResult.splitName : _airDays + 'x/week') + '</strong> ' +
      '— Tap days to customize. <strong>' + _airDays + ' training days</strong> optimal for your goal.';
  }

  var grid = document.getElementById('airSchedGrid');
  if (!grid) return;
  grid.innerHTML = allDows.map(function(d, i) {
    var isTrain = _airSchedule[d] === 'train';
    return '<div onclick="airToggleSched(\'' + d + '\')" ' +
      'style="border-radius:8px;padding:7px 2px;cursor:pointer;' +
      'border:1.5px solid ' + (isTrain ? 'var(--accent)' : 'var(--border)') + ';' +
      'background:' + (isTrain ? 'rgba(77,138,255,0.12)' : 'var(--bg3)') + ';text-align:center">' +
      '<div style="font-size:9px;font-weight:700;color:' + (isTrain ? 'var(--accent)' : 'var(--text3)') + '">' + dowL[i] + '</div>' +
      '<div style="font-size:16px;margin-top:2px">' + (isTrain ? '💪' : '🛋') + '</div>' +
    '</div>';
  }).join('');
}

function airToggleSched(d) {
  var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var trainCount = allDows.filter(function(x) { return _airSchedule[x] === 'train'; }).length;
  var isTrain = _airSchedule[d] === 'train';
  if (isTrain && trainCount <= 2) { showToast('⚠ Minimum 2 training days required'); return; }
  if (!isTrain && trainCount >= _airDays + 1) { showToast('⚠ Already have enough days assigned'); return; }
  _airSchedule[d] = isTrain ? 'rest' : 'train';

  // Warn about consecutive days
  var consec = false;
  for (var i = 0; i < 7; i++) {
    if (_airSchedule[allDows[i]] === 'train' && _airSchedule[allDows[(i+1)%7]] === 'train') {
      consec = true; break;
    }
  }
  var warn = document.getElementById('airSchedWarning');
  if (warn) warn.style.display = consec ? '' : 'none';
  _airRenderSchedule();
}

// ─── GENERATE ROUTINE ─────────────────────────────────────────────────────────
function _airGenerateRoutine() {
  _airResult = generateRoutine({
    level:       _airLevel,
    goal:        _airGoal,
    days:        _airDays,
    sessionTime: _airTime,
    equipment:   _airEquip,
    muscles:     [..._airSelected],
    priorities:  [..._airPriority],
    injuries:    [..._airInjuries],
  });
}

// ─── STEP 6 — RENDER RESULT ───────────────────────────────────────────────────
function _airRenderResult() {
  if (!_airResult) _airGenerateRoutine();
  if (!_airResult || !_airResult.days.length) return;

  var allDows  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var dowFull  = { Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday',Sun:'Sunday' };
  var trainDows = allDows.filter(function(d) { return _airSchedule[d] === 'train'; });

  var equipL  = { gym:'Gym', home:'Home', calisthenics:'Calisthenics' };
  var levelL  = { beginner:'Beginner', intermediate:'Intermediate', advanced:'Advanced' };
  var goalL   = { strength:'Strength', hypertrophy:'Hypertrophy', fat_loss:'Fat Loss', general:'General Fitness' };

  // Header summary
  var html = '<div style="font-size:11px;color:var(--text2);background:var(--bg3);border-radius:8px;padding:10px;margin-bottom:12px">' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px">' +
    '<span style="background:rgba(77,138,255,0.15);color:var(--accent);padding:3px 8px;border-radius:20px;font-size:10px;font-weight:700">🏋️ ' + equipL[_airEquip] + '</span>' +
    '<span style="background:rgba(77,138,255,0.15);color:var(--accent);padding:3px 8px;border-radius:20px;font-size:10px;font-weight:700">⚡ ' + levelL[_airLevel] + '</span>' +
    '<span style="background:rgba(77,138,255,0.15);color:var(--accent);padding:3px 8px;border-radius:20px;font-size:10px;font-weight:700">🎯 ' + goalL[_airGoal] + '</span>' +
    '</div>' +
    '<div style="font-size:10px;color:var(--text3)">📐 <strong>' + _airResult.splitName + '</strong></div>' +
  '</div>';

  // Volume analysis bars
  var volReport = _airResult.weeklyVolume;
  var reportMuscles = Object.keys(volReport).filter(function(m) { return volReport[m].actual > 0; });
  if (reportMuscles.length > 0) {
    html += '<div style="margin-bottom:14px">';
    html += '<div style="font-size:10px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">📊 Weekly Volume Analysis (sets/muscle)</div>';

    reportMuscles.forEach(function(mId) {
      var vr = volReport[mId];
      var meta = MUSCLE_META.find(function(m) { return m.id === mId; });
      if (!meta) return;
      var pct   = Math.min(100, Math.round((vr.actual / vr.mav) * 100));
      var color = vr.status === 'sub_mev' ? '#ef4444' : vr.status === 'optimal' ? '#22c55e' : '#f59e0b';
      var statusLabel = vr.status === 'sub_mev' ? '⚠ Sub-MEV' : vr.status === 'optimal' ? '✓ Optimal' : '⚡ High';
      var injuredBadge = [..._airInjuries].indexOf(mId) >= 0 ? ' 🚫' : '';
      var priorityBadge = [..._airPriority].indexOf(mId) >= 0 ? ' ⭐' : '';

      html += '<div style="margin-bottom:7px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">' +
          '<span style="font-size:10px;color:var(--text2)">' + meta.emoji + ' ' + meta.label + injuredBadge + priorityBadge + '</span>' +
          '<span style="font-size:10px;font-weight:700;color:' + color + '">' + vr.actual + ' sets · ' + statusLabel + '</span>' +
        '</div>' +
        '<div style="height:5px;background:var(--border);border-radius:4px;overflow:hidden">' +
          '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:4px"></div>' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-top:1px">' +
          '<span>MEV ' + vr.mev + '</span><span>MAV ' + vr.mav + '</span><span>MRV ' + vr.mrv + '</span>' +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  }

  // Workout days
  html += _airResult.days.map(function(d, i) {
    var dow = trainDows[i] || null;
    var compounds  = d.exercises.filter(function(e) { return e.type === 'compound'; }).length;
    var isolations = d.exercises.filter(function(e) { return e.type === 'isolation'; }).length;
    var timeColor  = d.estimatedTime > _airTime ? 'var(--red)' : 'var(--green)';

    return '<div class="air-day-card" style="margin-bottom:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">' +
        '<div>' +
          '<div class="air-day-title" style="font-size:12px;font-weight:700">💪 ' + d.name + '</div>' +
          '<div style="font-size:9px;color:var(--text3);margin-top:1px">' +
            compounds + ' compound · ' + isolations + ' iso · ' +
            '<span style="color:' + timeColor + '">~' + d.estimatedTime + ' min</span>' +
          '</div>' +
        '</div>' +
        (dow ? '<div style="font-size:10px;color:var(--accent);font-weight:700">' + dowFull[dow] + '</div>' : '') +
      '</div>' +
      d.exercises.map(function(ex) {
        var restLabel  = ex.rest ? ex.rest.label : '';
        var typeIcon   = ex.type === 'compound' ? '🏋️' : '🎯';
        var muscleMeta = MUSCLE_META.find(function(m) { return m.id === ex.muscle; });
        var muscleTag  = muscleMeta ? '<span style="font-size:9px;color:var(--text3);margin-left:4px">' + muscleMeta.emoji + '</span>' : '';
        var rirBadge   = ex.rir !== undefined
          ? ' <span style="font-size:9px;background:rgba(77,138,255,0.12);color:var(--accent);padding:1px 5px;border-radius:8px">RIR ' + ex.rir + '</span>'
          : '';
        return '<div style="padding:6px 0;border-bottom:1px solid var(--border)">' +
          '<div style="display:flex;justify-content:space-between;align-items:center">' +
            '<span style="font-size:11px">' + typeIcon + ' <strong>' + ex.name + '</strong>' + muscleTag + rirBadge + '</span>' +
            '<span style="color:var(--accent);font-size:11px;font-weight:700;white-space:nowrap;margin-left:8px">' + ex.sets + '×' + ex.reps + '</span>' +
          '</div>' +
          (restLabel ? '<div style="font-size:9px;color:var(--text3);margin-top:1px">⏱ ' + restLabel + '</div>' : '') +
          (ex.notes ? '<div style="font-size:9px;color:var(--text3);margin-top:1px;font-style:italic">📖 ' + ex.notes + '</div>' : '') +
        '</div>';
      }).join('') +
    '</div>';
  }).join('');

  // Evidence footer
  html += '<div style="font-size:9px;color:var(--text3);background:var(--bg3);border-radius:6px;padding:8px;margin-top:8px;line-height:1.5">' +
    '📚 <strong>Sources:</strong> Schoenfeld 2010/2016/2021 · Krieger 2010 meta-analysis · Israetel MEV/MAV/MRV · Grgic 2018 (frequency) · Morton 2016 (rep ranges) · Ratamess 2009 (rest)' +
  '</div>';

  var rc = document.getElementById('airResultContent');
  if (rc) rc.innerHTML = html;
}

// ─── APPLY ROUTINE TO APP ────────────────────────────────────────────────────
function applyAIRoutine() {
  if (!_airResult || !_airResult.days.length) {
    showToast('⚠ Generate a routine first'); return;
  }
  if (!state) { showToast('⚠ Error: app state unavailable'); return; }
  if (!state.config) state.config = {};

  var existingTraining = state.config.training || [];
  var newDays = _airResult.days.map(function(d) {
    return {
      name:      d.name,
      exercises: d.exercises.map(function(ex) {
        return { name: ex.name, sets: ex.sets, reps: ex.reps };
      }),
    };
  });

  // Merge or append
  newDays.forEach(function(newDay) {
    var existIdx = existingTraining.findIndex(function(d) { return d.name === newDay.name; });
    if (existIdx >= 0) existingTraining[existIdx] = newDay;
    else existingTraining.push(newDay);
  });
  state.config.training = existingTraining;

  // Assign days of week
  if (!state.config.cycle) state.config.cycle = {};
  var allDows   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var trainDows = allDows.filter(function(d) { return _airSchedule[d] === 'train'; });
  allDows.forEach(function(d) {
    if (_airSchedule[d] === 'rest') state.config.cycle[d] = 'rest';
  });
  trainDows.forEach(function(dow, i) {
    var matchIdx = state.config.training.findIndex(function(d) {
      return d.name === (newDays[i] && newDays[i].name);
    });
    if (matchIdx >= 0) state.config.cycle[dow] = matchIdx;
  });

  saveState(state);
  closeModal('aiRoutineModal');
  renderTraining();
  showToast('✅ Science-based routine applied. Time to train!');

  if (typeof sp3AiDone === 'function' &&
      document.getElementById('setupOverlay') &&
      document.getElementById('setupOverlay').style.display !== 'none') {
    sp3AiDone();
  }
}
