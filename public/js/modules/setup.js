// ═══════════════════════════════════════════════════════════════════════════
// SETUP WIZARD — from mama (integrated)
// ═══════════════════════════════════════════════════════════════════════════

var _setupStep = 0;
var _TOTAL_STEPS = 5;
// Map from logical step number to actual sp- page ID
// sp-1 (theme) y sp-4 (ciclo semanal) removidos del flujo; steps: 0→sp-0, 1→sp-2, 2→sp-3, 3→sp-5, 4→sp-6
var _STEP_PAGE_MAP = [0, 2, 3, 5, 6];
var _wizardGoal = null; // 'cut_aggressive','cut','maintain','lean_bulk','bulk'
var _wizardDays = [];
var _currentWizardDay = 0;
var _wizardCycle = { Mon:null, Tue:null, Wed:null, Thu:null, Fri:null, Sat:null, Sun:null };
var _wizardSupps = [];
var _wizardTheme = 'dark';
var _wizardPlan = null;

var WEEK_DAYS = [
  { key:'Mon', label:'Lunes' }, { key:'Tue', label:'Martes' }, { key:'Wed', label:'Miércoles' },
  { key:'Thu', label:'Jueves' }, { key:'Fri', label:'Viernes' }, { key:'Sat', label:'Sábado' }, { key:'Sun', label:'Domingo' }
];

document.addEventListener('DOMContentLoaded', function() {
  var grid = document.getElementById('paletteGrid');
  if (grid) {
    grid.addEventListener('click', function(e) {
      var card = e.target.closest('.palette-card');
      if (!card) return;
      var theme = card.dataset.theme;
      if (!theme) return;
      document.querySelectorAll('#paletteGrid .palette-card').forEach(function(c) { c.classList.remove('selected'); });
      card.classList.add('selected');
      _wizardTheme = theme;
      applyTheme(theme);
    });
  }
});

function getActivityFactor() {
  var sel = document.querySelector('.activity-opt.selected');
  return sel ? parseFloat(sel.dataset.factor) : 1.55;
}

function selectActivityOpt(el) {
  document.querySelectorAll('.activity-opt').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
  calcPlanLive();
}

function calcNutritionPlan() {
  var age = parseFloat(document.getElementById('cfgAge') ? document.getElementById('cfgAge').value : 0) || 0;
  var weight = parseFloat(document.getElementById('cfgWeight') ? document.getElementById('cfgWeight').value : 0) || 0;
  var height = parseFloat(document.getElementById('cfgHeight') ? document.getElementById('cfgHeight').value : 0) || 0;
  var factor = getActivityFactor();
  if (!age || !weight || !height) return null;
  var bmr = Math.round(10*weight + 6.25*height - 5*age + 5); // Mifflin-St Jeor hombre
  var tdee = Math.round(bmr * factor);

  // Ajuste según objetivo elegido
  var goalMult = 0.85; // default: déficit 15%
  var protMult = 2.2;
  var goalKey = _wizardGoal || 'cut';
  if      (goalKey === 'cut_aggressive') { goalMult = 0.75; protMult = 2.4; }
  else if (goalKey === 'cut')            { goalMult = 0.85; protMult = 2.2; }
  else if (goalKey === 'maintain')       { goalMult = 1.00; protMult = 1.8; }
  else if (goalKey === 'lean_bulk')      { goalMult = 1.10; protMult = 2.0; }
  else if (goalKey === 'bulk')           { goalMult = 1.20; protMult = 1.8; }

  var kcal = Math.round(tdee * goalMult);
  var prot = Math.round(weight * protMult);
  var fat = Math.round((kcal * 0.25) / 9);
  var carbKcal = kcal - (prot * 4) - (fat * 9);
  var carb = Math.round(Math.max(carbKcal, 0) / 4);
  var diff = tdee - kcal;
  var weekChange = parseFloat((Math.abs(diff)*7/7700).toFixed(2));
  return { bmr:bmr, tdee:tdee, kcal:kcal, prot:prot, carb:carb, fat:fat, deficit:diff, weightLossPerWeek: diff > 0 ? weekChange : -weekChange };
}

function calcPlanLive() {
  var plan = calcNutritionPlan();
var el = document.getElementById('planResult');
  if (!el) return;
  if (!plan) { el.innerHTML = ''; return; }
  var goalKey = _wizardGoal || 'cut';
  var isGain = goalKey === 'lean_bulk' || goalKey === 'bulk';
  var isMaint = goalKey === 'maintain';
  var changeKg = Math.abs(plan.weightLossPerWeek);
  var changeMsg;
  if (isMaint) {
    changeMsg = '⚖️ Sin cambio de peso estimado';
  } else if (isGain) {
    changeMsg = changeKg <= 0.5 ? '✅ +'+changeKg+' kg/sem' : '⚠️ +'+changeKg+' kg/sem — ritmo alto';
  } else {
    changeMsg = changeKg >= 0.3 && changeKg <= 0.8 ? '✅ -'+changeKg+' kg/sem — ideal' :
                changeKg < 0.3 ? 'ℹ️ -'+changeKg+' kg/sem — lento' : '⚠️ -'+changeKg+' kg/sem — agresivo';
  }
var isTerra = document.body.classList.contains('layout-terra') || document.documentElement.classList.contains('layout-terra');
  var isLinen = document.body.classList.contains('layout-linen') || document.documentElement.classList.contains('layout-linen');
  var cardBg     = isTerra ? 'rgba(200,168,75,0.06)'  : isLinen ? 'rgba(45,38,32,0.05)'  : 'var(--bg2)';
  var cardBorder = isTerra ? 'rgba(200,168,75,0.2)'   : isLinen ? 'rgba(45,38,32,0.12)'  : 'var(--border)';
  var rowBorder  = isTerra ? 'rgba(200,168,75,0.1)'   : isLinen ? 'rgba(45,38,32,0.08)'  : 'var(--border)';
  var lblColor   = isTerra ? '#a09878'                : isLinen ? '#7a6858'               : 'var(--text2)';
  var valColor   = isTerra ? '#6a9e5a'                : isLinen ? '#5a8070'               : 'var(--green)';
  var fatColor   = isTerra ? '#c8a84b'                : isLinen ? '#a09050'               : 'var(--yellow)';
  var tipBg      = isTerra ? 'rgba(200,168,75,0.07)'  : isLinen ? 'rgba(45,38,32,0.04)'  : 'var(--bg3)';
  var tipBorder  = isTerra ? '#c8a84b'                : isLinen ? '#8a7060'               : 'var(--accent)';
  var tipColor   = isTerra ? '#a09878'                : isLinen ? '#7a6858'               : 'var(--text2)';
  var hdrColor   = isTerra ? '#5a5438'                : isLinen ? '#a89880'               : 'var(--text2)';

  el.innerHTML = '<div class="plan-result" style="background:'+cardBg+';border:1px solid '+cardBorder+';border-radius:12px;padding:14px;margin-top:12px">' +
    '<div style="font-size:10px;font-weight:700;color:'+hdrColor+';text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">📊 Tu plan</div>' +
    '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid '+rowBorder+'"><span style="color:'+lblColor+'">🎯 Objetivo diario</span><span style="color:'+valColor+';font-weight:700">'+plan.kcal+' kcal</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid '+rowBorder+'"><span style="color:'+lblColor+'">🍗 Proteína</span><span style="color:'+valColor+';font-weight:700">'+plan.prot+'g</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid '+rowBorder+'"><span style="color:'+lblColor+'">🍚 Carbos</span><span style="color:'+lblColor+';font-weight:700">'+plan.carb+'g</span></div>' +
    '<div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:'+lblColor+'">🥑 Grasas</span><span style="color:'+fatColor+';font-weight:700">'+plan.fat+'g</span></div>' +
    '<div style="margin-top:8px;padding:8px 10px;background:'+tipBg+';border-left:3px solid '+tipBorder+';border-radius:6px;font-size:11px;color:'+tipColor+'">'+changeMsg+' · TDEE: '+plan.tdee+' kcal</div>' +
    '</div>';

  _wizardPlan = plan;
}

function initSetup() {
  _resetWizardChips && _resetWizardChips();
  document.getElementById('setupOverlay').style.display = 'flex';
  document.getElementById('mainApp').style.display = 'none';
  _wizardDays = []; // starts empty — user adds days or AI generates them
  _currentWizardDay = 0;
  _renderSetupDots();
  _renderSetupPage();
}

function _renderSetupDots() {
  var c = document.getElementById('setupDots');
  var html = '';
  // Show one dot per logical step (6 total, no theme step)
  for (var i = 0; i < _TOTAL_STEPS; i++) {
    var cls = i < _setupStep ? 'done' : i === _setupStep ? 'active' : '';
    html += '<div class="setup-step-dot '+cls+'"></div>';
  }
  c.innerHTML = html;
}

var _sp3Mode = null; // 'manual' | 'ai' | 'skip' | null

function _renderSetupPage() {
  // Hide all setup pages
  document.querySelectorAll('.setup-page').forEach(function(p) {
    p.classList.remove('active');
  });
  // Show only the current logical step's page
  var pageId = 'sp-' + _STEP_PAGE_MAP[_setupStep];
  var page = document.getElementById(pageId);
  if (page) page.classList.add('active');

  if (_setupStep === 0) _renderGoalStep();
  if (_setupStep === 2) {
    // Routine step: show choose or manual sub-step
    var chooseEl = document.getElementById('sp3-choose');
    var manualEl = document.getElementById('sp3-manual');
    if (chooseEl && manualEl) {
chooseEl.style.display = (_sp3Mode === 'manual') ? 'none' : 'block';
      manualEl.style.display = (_sp3Mode === 'manual') ? 'block' : 'none';
      if (_sp3Mode === 'manual') _renderManualSubStep();
    }
  }
  // sp-4 ciclo semanal eliminado del wizard
  if (_setupStep === 4) _renderSuppBuilderSetup();
}

function sp3SelectMode(mode) {
  _manualWizStep = 1;
  _airActivities = [];
  _airActivityDays = {};
  _airWantsCombine = false;
  _airSchedule = {};
  window._wizardDaysSel = {};
  _sp3Mode = mode;
  if (mode === 'manual') {
    document.getElementById('setupBack').style.display = 'none';
    document.getElementById('setupNext').style.display = 'none';
  }
  if (mode === 'skip') {
    // Skip the routine step, advance to next
    _setupStep++;
    _renderSetupDots();
    _renderSetupPage();
    document.getElementById('setupBack').style.display = '';
    document.getElementById('setupNext').textContent = 'Continuar →';
    return;
  }
  if (mode === 'ai') {
    // Open AI routine modal; stay on this step so user can continue after
    openAIRoutine();
    return;
  }
// manual — reveal the builder sub-step
// manual — reveal the builder sub-step
  var chooseEl = document.getElementById('sp3-choose');
  var manualEl = document.getElementById('sp3-manual');
  if (chooseEl) chooseEl.style.display = 'none';
  if (manualEl) manualEl.style.display = 'block';
  _manualSubStep = 'days';
  _renderManualSubStep();
}

var _manualSubStep = 'days';

function _renderManualSubStep() {
  if (_manualSubStep === 'days') _renderExBuilderUI();
  else if (_manualSubStep === 'activities') _renderManualActUI();
  else _renderManualCalUI();
}

var _manualDayPickerDow = null;

function _gymDayIdx(dow) {
  return _wizardDays.findIndex(function(d){ return d._dow === dow; });
}

function _renderExBuilderUI() {
  var manualEl = document.getElementById('sp3-manual');
  if (!manualEl) return;
  if (!window._wizardDaysSel) window._wizardDaysSel = {};

  var DOW_KEYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var DOW_SHORT = { Mon:'LUN', Tue:'MAR', Wed:'MIÉ', Thu:'JUE', Fri:'VIE', Sat:'SÁB', Sun:'DOM' };
  var DOW_FULL  = { Mon:'Lunes', Tue:'Martes', Wed:'Miércoles', Thu:'Jueves', Fri:'Viernes', Sat:'Sábado', Sun:'Domingo' };

  manualEl.innerHTML =
    '<div class="setup-label" style="margin-bottom:4px">Tu semana de gym</div>'
    + '<div class="setup-hint" style="margin-bottom:14px">Tocá los días que entrenás. Luego tocalos de nuevo para cargar ejercicios.</div>'
    + '<div id="manDayGrid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-bottom:18px"></div>'
    + '<div id="manDaySheetWrap"></div>'
    + '<div style="margin-top:16px;display:flex;gap:8px">'
      + '<button onclick="sp3BackToChoose()" class="btn btn-ghost" style="flex:0 0 auto;font-size:11px">← Método</button>'
      + '<button onclick="_manualGoActivities()" class="btn btn-primary" style="flex:1">Continuar →</button>'
    + '</div>';

  function _renderGrid() {
    var grid = document.getElementById('manDayGrid');
    if (!grid) return;
    grid.innerHTML = DOW_KEYS.map(function(dow) {
      var active = !!window._wizardDaysSel[dow];
      var idx = _gymDayIdx(dow);
      var hasEx = active && idx !== -1 && _wizardDays[idx].exercises && _wizardDays[idx].exercises.length > 0;
      return '<div onclick="_manualDayGridTap(\'' + dow + '\')" style="'
        + 'border-radius:10px;padding:8px 4px;text-align:center;cursor:pointer;'
        + 'border:1.5px solid ' + (active ? 'var(--accent)' : 'var(--border)') + ';'
        + 'background:' + (active ? 'rgba(77,138,255,0.13)' : 'var(--bg3)') + '">'
        + '<div style="font-size:9px;font-weight:700;color:' + (active ? 'var(--accent)' : 'var(--text3)') + '">' + DOW_SHORT[dow] + '</div>'
        + '<div style="font-size:18px;margin:4px 0">' + (active ? '🏋️' : '➕') + '</div>'
        + '<div style="font-size:8px;color:' + (hasEx ? 'var(--green)' : 'transparent') + '">' + (hasEx ? '✓' : '·') + '</div>'
        + '</div>';
    }).join('');
  }

  window._renderManualGrid = _renderGrid;

  window._manualDayGridTap = function(dow) {
    if (!window._wizardDaysSel[dow]) {
      window._wizardDaysSel[dow] = true;
      if (_gymDayIdx(dow) === -1) {
        _wizardDays.push({ _dow: dow, name: DOW_FULL[dow], focus: '', exercises: [], isSport: false });
        _currentWizardDay = _wizardDays.length - 1;
      }
    }
    _manualOpenDaySheet(dow);
    _renderGrid();
  };

  window._manualRemoveDay = function(dow) {
    window._wizardDaysSel[dow] = false;
    var idx = _gymDayIdx(dow);
    if (idx !== -1) _wizardDays.splice(idx, 1);
    _currentWizardDay = Math.max(0, _currentWizardDay - 1);
    var wrap = document.getElementById('manDaySheetWrap');
    if (wrap) wrap.innerHTML = '';
    _renderGrid();
  };

  window._manualOpenDaySheet = function(dow) {
    _manualDayPickerDow = dow;
    var idx = _gymDayIdx(dow);
    if (idx === -1) return;
    var d = _wizardDays[idx];

    function _exRow(ei) {
      var ex = d.exercises[ei];
      return '<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">'
        + '<input class="inp" style="flex:2;margin-bottom:0;font-size:13px" placeholder="Ejercicio" value="' + (ex.name || '') + '" '
        + 'oninput="_wizardDays[' + idx + '].exercises[' + ei + '].name=this.value">'
        + '<input class="inp" style="width:46px;margin-bottom:0;font-size:13px;text-align:center" type="number" min="1" placeholder="4" value="' + (ex.sets || 3) + '" '
        + 'oninput="_wizardDays[' + idx + '].exercises[' + ei + '].sets=+this.value">'
        + '<input class="inp" style="width:62px;margin-bottom:0;font-size:13px;text-align:center" placeholder="8-12" value="' + (ex.reps || '8-12') + '" '
        + 'oninput="_wizardDays[' + idx + '].exercises[' + ei + '].reps=this.value">'
        + '<button onclick="_manualDelEx(' + idx + ',' + ei + ')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:17px;flex-shrink:0;padding:0">✕</button>'
        + '</div>';
    }

    function _ssExRow(ei, letter) {
      var ex = d.exercises[ei];
      return '<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">'
        + '<span style="font-size:11px;font-weight:700;color:var(--accent);width:14px;flex-shrink:0">' + letter + '</span>'
        + '<input class="inp" style="flex:2;margin-bottom:0;font-size:13px" placeholder="Ejercicio" value="' + (ex.name || '') + '" '
        + 'oninput="_wizardDays[' + idx + '].exercises[' + ei + '].name=this.value">'
        + '<input class="inp" style="width:46px;margin-bottom:0;font-size:13px;text-align:center" type="number" min="1" placeholder="4" value="' + (ex.sets || 3) + '" '
        + 'oninput="_wizardDays[' + idx + '].exercises[' + ei + '].sets=+this.value">'
        + '<input class="inp" style="width:62px;margin-bottom:0;font-size:13px;text-align:center" placeholder="8-12" value="' + (ex.reps || '8-12') + '" '
        + 'oninput="_wizardDays[' + idx + '].exercises[' + ei + '].reps=this.value">'
        + '</div>';
    }

    function _ssBlockRow(aIdx, bIdx) {
      var exA = d.exercises[aIdx];
      var restMin = (typeof exA.ssRestSec === 'number' && exA.ssRestSec > 0) ? (exA.ssRestSec / 60) : '';
      return '<div style="border:1.5px solid var(--accent);border-radius:10px;padding:8px;margin-bottom:8px;background:rgba(77,138,255,0.05)">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
        +   '<span style="font-size:11px;font-weight:700;color:var(--accent)">⚡ Superserie</span>'
        +   '<button onclick="_manualRemoveSuperset(' + idx + ',\'' + exA.ssGroup + '\')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:11px">✕ Quitar superserie</button>'
        + '</div>'
        + _ssExRow(aIdx, 'A')
        + _ssExRow(bIdx, 'B')
        + '<div style="display:flex;align-items:center;gap:6px;margin-top:2px">'
        +   '<span style="font-size:11px;color:var(--text3)">⏱ Descanso total del ciclo:</span>'
        +   '<input class="inp" style="width:56px;margin-bottom:0;font-size:12px;text-align:center" type="number" min="0" step="0.5" placeholder="ej: 3" value="' + restMin + '" oninput="_manualSetSSRest(' + idx + ',\'' + exA.ssGroup + '\',this.value)">'
        +   '<span style="font-size:11px;color:var(--text3)">min</span>'
        + '</div>'
        + '</div>';
    }

    function _exRows() {
      if (!d.exercises || d.exercises.length === 0)
        return '<div style="color:var(--text3);font-size:12px;text-align:center;padding:12px 0">Sin ejercicios. Agregá uno abajo.</div>';
      var html = '';
      var renderedGroups = {};
      d.exercises.forEach(function(ex, ei) {
        if (ex.ssGroup) {
          if (renderedGroups[ex.ssGroup]) return;
          renderedGroups[ex.ssGroup] = true;
          var aIdx = d.exercises.findIndex(function(e) { return e.ssGroup === ex.ssGroup && e.ssPart === 'a'; });
          var bIdx = d.exercises.findIndex(function(e) { return e.ssGroup === ex.ssGroup && e.ssPart === 'b'; });
          html += _ssBlockRow(aIdx, bIdx);
          return;
        }
        html += _exRow(ei);
      });
      return html;
    }

    function _sheetHtml() {
      return '<div style="background:var(--bg2);border:1.5px solid var(--accent);border-radius:14px;padding:16px;margin-bottom:8px">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
          + '<span style="font-weight:700;font-size:15px;color:var(--accent)">' + DOW_FULL[dow] + '</span>'
          + '<button onclick="_manualRemoveDay(\'' + dow + '\')" style="background:none;border:none;color:var(--red);font-size:12px;cursor:pointer;text-decoration:underline">Quitar día</button>'
        + '</div>'
        + '<input class="inp" placeholder="Nombre del día (ej: Push, Pecho...)" value="' + (d.name || '') + '" '
        + 'style="margin-bottom:8px" oninput="_wizardDays[' + idx + '].name=this.value">'
        + '<input class="inp" placeholder="Foco muscular (ej: Pecho y tríceps)" value="' + (d.focus || '') + '" '
        + 'style="margin-bottom:12px" oninput="_wizardDays[' + idx + '].focus=this.value">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
          + '<span style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px">Ejercicios</span>'
          + (d.exercises && d.exercises.length ? '<span style="font-size:10px;color:var(--text3)">Nombre · Series · Reps</span>' : '')
        + '</div>'
        + '<div id="sheetExList">' + _exRows() + '</div>'
        + '<div style="display:flex;gap:6px;margin-top:4px">'
        +   '<button onclick="_manualAddEx(\'' + dow + '\')" style="flex:1;padding:9px;border-radius:10px;border:1.5px dashed var(--accent);background:none;color:var(--accent);font-size:13px;font-weight:700;cursor:pointer">+ Ejercicio</button>'
        +   '<button onclick="_manualAddSuperset(\'' + dow + '\')" style="flex:1;padding:9px;border-radius:10px;border:1.5px dashed var(--green);background:none;color:var(--green);font-size:13px;font-weight:700;cursor:pointer">⚡ + Superserie</button>'
        + '</div>'
        + '</div>';
    }

    var wrap = document.getElementById('manDaySheetWrap');
    if (wrap) wrap.innerHTML = _sheetHtml();
  };

  window._manualAddEx = function(dow) {
    var idx = _gymDayIdx(dow);
    if (idx === -1) return;
    if (!_wizardDays[idx].exercises) _wizardDays[idx].exercises = [];
    _wizardDays[idx].exercises.push({ name: '', sets: 3, reps: '8-12' });
    _manualOpenDaySheet(dow);
    _renderGrid();
  };

  window._manualAddSuperset = function(dow) {
    var idx = _gymDayIdx(dow);
    if (idx === -1) return;
    if (!_wizardDays[idx].exercises) _wizardDays[idx].exercises = [];
    var ssGroup = 'ss_' + Date.now();
    _wizardDays[idx].exercises.push({ name: '', sets: 3, reps: '8-12', ssGroup: ssGroup, ssPart: 'a', ssRestSec: null });
    _wizardDays[idx].exercises.push({ name: '', sets: 3, reps: '8-12', ssGroup: ssGroup, ssPart: 'b' });
    _manualOpenDaySheet(dow);
    _renderGrid();
  };

  window._manualSetSSRest = function(dayIdx, ssGroup, val) {
    var min = parseFloat(val);
    var secs = (isNaN(min) || min <= 0) ? null : Math.round(min * 60);
    (_wizardDays[dayIdx].exercises || []).forEach(function(ex) {
      if (ex.ssGroup === ssGroup && ex.ssPart === 'a') ex.ssRestSec = secs;
    });
  };

  window._manualRemoveSuperset = function(dayIdx, ssGroup) {
    var dow2 = _wizardDays[dayIdx]._dow;
    _wizardDays[dayIdx].exercises = _wizardDays[dayIdx].exercises.filter(function(e) { return e.ssGroup !== ssGroup; });
    _manualOpenDaySheet(dow2);
    _renderGrid();
  };

  window._manualDelEx = function(dayIdx, exIdx) {
    _wizardDays[dayIdx].exercises.splice(exIdx, 1);
    var dow2 = _wizardDays[dayIdx]._dow;
    _manualOpenDaySheet(dow2);
    _renderGrid();
  };

  _renderGrid();
}

function _renderExBuilder() { if (typeof _renderExBuilderUI === 'function') _renderExBuilderUI(); }

function _manualBuildSchedule() {
  var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  allDows.forEach(function(d) { _airSchedule[d] = []; });
  var hasDow = _wizardDays.some(function(d){ return !!d._dow; });
  if (hasDow) {
    _wizardDays.forEach(function(day, i) {
      if (day._dow) _airSchedule[day._dow] = ['train:' + i];
    });
  } else {
    var patterns = { 1:[0], 2:[0,3], 3:[0,2,4], 4:[0,1,3,4], 5:[0,1,2,4,5], 6:[0,1,2,3,4,5] };
    var gymDays = Math.min(6, Math.max(1, _wizardDays.length));
    var pattern = patterns[gymDays] || patterns[4];
    pattern.forEach(function(idx, i) {
      _airSchedule[allDows[idx]] = ['train:' + i];
    });
  }
  if (_airWantsCombine && _airActivities.length > 0) {
    _airActivities.forEach(function(name) {
      var n = _airActivityDays[name] || 1;
      var placed = 0;
// Primero días vacíos (descanso)
      allDows.forEach(function(d) {
        if (placed >= n) return;
        if (_airSchedule[d].length === 0) { _airSchedule[d].push('activity:' + name); placed++; }
      });
      // Si no alcanzó, agregar junto a días de gym (hasta max 3 slots)
      // Si no alcanzó, agregar junto a días de gym
      if (placed < n) {
        allDows.forEach(function(d) {
          if (placed >= n) return;
          var slots = _airSchedule[d];
          if (slots.some(function(s){ return s.startsWith('train'); }) && slots.indexOf('activity:'+name) === -1 && slots.length < 3) {
            slots.push('activity:' + name); placed++;
          }
        });
      }
    });
  }
}

function _manualGoActivities() {
  if (_wizardDays.length === 0) { showToast('⚠ Seleccioná al menos un día de gym'); return; }
  _manualSubStep = 'activities';
  _airActivities = [];
  _airActivityDays = {};
  _airWantsCombine = false;
  _renderManualActUI();
}

function _renderManualActUI() {
  var manualEl = document.getElementById('sp3-manual');
  if (!manualEl) return;
  var categories = [
    { label: 'Cardio', items: [
      { name:'Correr', emoji:'🏃' }, { name:'Bici', emoji:'🚴' }, { name:'Caminata', emoji:'🚶' },
      { name:'HIIT', emoji:'🔥' }, { name:'Natación', emoji:'🏊' }, { name:'Pilates', emoji:'🧘' }
    ]},
    { label: 'Deportes', items: [
      { name:'Fútbol', emoji:'⚽' }, { name:'Tenis', emoji:'🎾' }, { name:'Pádel', emoji:'🏓' }, { name:'Otro', emoji:'🏅' }
    ]}
  ];
  function _daysBtn(name) {
    var cur = _airActivityDays[name] || 1;
    return '<div style="display:flex;align-items:center;gap:4px;margin-top:6px">'
      + '<span style="font-size:10px;color:var(--text3);margin-right:2px">días/semana:</span>'
      + [1,2,3,4].map(function(n) {
          var a = cur === n;
          return '<button onclick="event.stopPropagation();_manualSetActDays2(\''+name+'\','+n+')" '
            + 'style="padding:3px 8px;border-radius:6px;border:1.5px solid '+(a?'var(--accent)':'var(--border)')+';'
            + 'background:'+(a?'rgba(77,138,255,0.15)':'var(--bg4)')+';font-size:11px;font-weight:700;'
            + 'color:'+(a?'var(--accent)':'var(--text3)')+';cursor:pointer">'+n+'x</button>';
        }).join('')
      + '</div>';
  }
  function _actCard(s) {
    var isOn = _airActivities.indexOf(s.name) !== -1;
    return '<div onclick="_manualToggleAct2(\''+s.name+'\')" '
      + 'style="padding:11px 14px;border-radius:12px;margin-bottom:6px;cursor:pointer;'
      + 'border:1.5px solid '+(isOn?'var(--accent)':'var(--border)')+';'
      + 'background:'+(isOn?'rgba(77,138,255,0.1)':'var(--bg3)')+'">'
      + '<div style="display:flex;align-items:center;gap:12px">'
        + '<div style="font-size:22px">'+s.emoji+'</div>'
        + '<div style="font-size:13px;font-weight:600;color:var(--text);flex:1">'+s.name+'</div>'
        + (isOn ? '<div style="font-size:16px;color:var(--accent)">✓</div>' : '')
      + '</div>'
      + (isOn ? _daysBtn(s.name) : '')
      + '</div>';
  }
  var catsHtml = categories.map(function(cat) {
    return '<div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:0.5px;text-transform:uppercase;margin:14px 0 8px">'+cat.label+'</div>'
      + cat.items.map(_actCard).join('');
  }).join('');
  var bodyHtml = _airWantsCombine
    ? '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding:8px 12px;background:rgba(77,138,255,0.08);border:1px solid rgba(77,138,255,0.2);border-radius:10px">'
        + '<span style="font-size:16px">✅</span>'
        + '<span style="font-size:12px;font-weight:600;color:var(--accent)">Combinando gym con actividades</span>'
        + '<button onclick="_manualSetActMode2(false)" style="margin-left:auto;background:none;border:none;font-size:11px;color:var(--text3);cursor:pointer;text-decoration:underline">Solo gym</button>'
        + '</div>' + catsHtml
    : '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px">¿Querés sumar actividades a tu semana de gym?</div>'
      + '<div style="font-size:11px;color:var(--text3);margin-bottom:14px">Podés combinar gym con deportes, cardio u otras actividades.</div>'
      + '<div style="display:flex;gap:8px;margin-bottom:16px">'
      + '<button onclick="_manualSetActMode2(false)" style="flex:1;padding:12px;border-radius:12px;border:1.5px solid var(--accent);background:rgba(77,138,255,0.1);cursor:pointer;font-size:13px;font-weight:700;color:var(--accent)">Solo gym</button>'
      + '<button onclick="_manualSetActMode2(true)" style="flex:1;padding:12px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg3);cursor:pointer;font-size:13px;font-weight:700;color:var(--text2)">Sí, sumar actividades</button>'
      + '</div>';
  manualEl.innerHTML = '<div class="setup-label" style="margin-bottom:4px">¿Sumás actividades?</div>'
    + '<div class="setup-hint" style="margin-bottom:12px">Gym ya está incluido. Agregá deportes o cardio si querés.</div>'
    + '<div id="manualActBody">' + bodyHtml + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:16px">'
      + '<button onclick="_manualSubStep=\'days\';_renderExBuilderUI()" class="btn btn-ghost" style="flex:0 0 auto">← Atrás</button>'
      + '<button onclick="_manualGoCalendar()" class="btn btn-primary" style="flex:1">Continuar →</button>'
    + '</div>';
}

function _manualSetActMode2(wants) {
  _airWantsCombine = wants;
  if (!wants) { _airActivities = []; _airActivityDays = {}; }
  _renderManualActUI();
}

function _manualToggleAct2(name) {
  var idx = _airActivities.indexOf(name);
  if (idx !== -1) { _airActivities.splice(idx, 1); delete _airActivityDays[name]; }
  else { _airActivities.push(name); _airActivityDays[name] = 1; }
  _renderManualActUI();
}

function _manualSetActDays2(name, n) {
  _airActivityDays[name] = n;
  _renderManualActUI();
}

function _manualGoCalendar() {
  _manualSubStep = 'calendar';
  _manualBuildSchedule();
  _renderManualCalUI();
}

var _calDragVal = null, _calDragFrom = null;
var _savedManualCycle = null, _savedManualSportNames = null, _savedManualTraining = null;var _calTouchChip = null, _calTouchClone = null, _calTouchFrom = null, _calTouchVal = null;

function _calTouchMove(e) {
  if (!_calTouchClone) return; e.preventDefault();
  var t = e.touches[0];
  _calTouchClone.style.left = (t.clientX - _calTouchClone.offsetWidth/2) + 'px';
  _calTouchClone.style.top  = (t.clientY - 20) + 'px';
  document.querySelectorAll('.man-drop-zone').forEach(function(z){ z.style.background=''; z.style.borderColor=''; });
  _calTouchClone.style.display = 'none';
  var under = document.elementFromPoint(t.clientX, t.clientY);
  _calTouchClone.style.display = '';
  if (under) { var z = under.closest('.man-drop-zone'); if (z && z.dataset.dow !== _calTouchFrom){ z.style.background='rgba(77,138,255,0.10)'; z.style.borderColor='var(--accent)'; } }
}

function _calTouchEnd(e) {
  if (!_calTouchChip || !_calTouchClone) return;
  var t = e.changedTouches[0];
  _calTouchClone.style.display = 'none';
  var under = document.elementFromPoint(t.clientX, t.clientY);
  _calTouchClone.style.display = '';
  if (under) {
    var zone = under.closest('.man-drop-zone');
    if (zone && zone.dataset.dow !== _calTouchFrom) {
      var toDow = zone.dataset.dow, val = _calTouchVal;
      var fromSlots = _airSchedule[_calTouchFrom] || [];
      var toSlots = (_airSchedule[toDow] || []).slice();
      if (!toSlots.some(function(v){return v===val;}) && !(val.startsWith('train') && toSlots.some(function(v){return v.startsWith('train');})) && toSlots.length < 3) {
        _airSchedule[_calTouchFrom] = fromSlots.filter(function(v){return v!==val;});
        toSlots.push(val); _airSchedule[toDow] = toSlots;
      }
    }
  }
  if (_calTouchChip) _calTouchChip.style.opacity = '';
  _calTouchClone.remove();
  _calTouchChip = null; _calTouchClone = null; _calTouchFrom = null; _calTouchVal = null;
  document.querySelectorAll('.man-drop-zone').forEach(function(z){ z.style.background=''; z.style.borderColor=''; });
  _renderManualCalUI();
}

function _renderManualCalUI() {
  _manualShowGlobalNav();  var manualEl = document.getElementById('sp3-manual');
  if (!manualEl) return;
  var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var dowFull = { Mon:'Lunes', Tue:'Martes', Wed:'Miércoles', Thu:'Jueves', Fri:'Viernes', Sat:'Sábado', Sun:'Domingo' };
  var ACT_EMOJI = Object.assign({ Correr:'🏃', Bici:'🚴', Caminata:'🚶', HIIT:'🔥', Natación:'🏊', Pilates:'🧘', Fútbol:'⚽', Tenis:'🎾', Pádel:'🏓', Otro:'🏅' }, window._airCustomEmojis || {});

  function _chipHtml(val, d) {
    var isGym = val.startsWith('train');
    var dayIdx = isGym ? parseInt(val.split(':')[1]) : -1;
    var actName = isGym ? '' : val.split(':')[1];
    var label = isGym ? ('🏋️ ' + (_wizardDays[dayIdx] ? _wizardDays[dayIdx].name : 'Gym')) : ((ACT_EMOJI[actName] || '⚡') + ' ' + actName);
    var color  = isGym ? 'var(--accent)' : 'var(--green)';
    var bg     = isGym ? 'rgba(77,138,255,0.14)' : 'rgba(50,220,140,0.12)';
    var border = isGym ? 'rgba(77,138,255,0.45)' : 'rgba(50,220,140,0.38)';
    return '<div class="man-chip" draggable="true" data-dow="'+d+'" data-val="'+val+'" '
      + 'style="display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:20px;'
      + 'border:1.5px solid '+border+';background:'+bg+';cursor:grab;user-select:none;'
      + 'font-size:12px;font-weight:700;color:'+color+';white-space:nowrap">'+label+'</div>';
  }

  // Solo actualizar filas si ya existe el contenedor — evita re-bindear listeners
  var existing = document.getElementById('manCalRows');
  var rowsHtml = allDows.map(function(d) {
    var slots = _airSchedule[d] || [];
    var isRest = slots.length === 0;
    var chips = slots.map(function(v) { return _chipHtml(v, d); }).join('');
    return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);min-height:50px">'
      + '<div style="width:78px;flex-shrink:0;font-size:13px;font-weight:700;color:'+(isRest?'var(--text3)':'var(--text)')+'">'+dowFull[d]+'</div>'
      + '<div class="man-drop-zone" data-dow="'+d+'" style="display:flex;align-items:center;gap:6px;flex:1;flex-wrap:wrap;min-height:36px;padding:3px 6px;border-radius:10px;border:1.5px dashed '+(isRest?'var(--border)':'transparent')+';background:'+(isRest?'var(--bg4)':'transparent')+';transition:all 0.15s">'
        + (isRest ? '<span style="font-size:11px;color:var(--text3)">😴 Descanso</span>' : chips)
      + '</div>'
      + '</div>';
  }).join('');

if (existing) {
    existing.innerHTML = rowsHtml;
    _bindCalDragListeners(existing);
    return;
  }

  manualEl.innerHTML = '<div class="setup-label" style="margin-bottom:4px">Calendario semanal</div>'
    + '<div class="setup-hint" style="margin-bottom:12px">Arrastrá los chips para moverlos entre días.</div>'
    + '<div id="manCalRows">'+rowsHtml+'</div>'
;

var calRows = document.getElementById('manCalRows');
  _bindCalDragListeners(calRows);
}

function _bindCalDragListeners(calRows) {
  calRows.addEventListener('dragstart', function(e) {
    var chip = e.target.closest('.man-chip');
    if (!chip) return;
    _calDragVal = chip.dataset.val; _calDragFrom = chip.dataset.dow;
    chip.style.opacity = '0.35'; e.dataTransfer.effectAllowed = 'move';
    calRows.querySelectorAll('.man-drop-zone').forEach(function(z) {
      if (z.dataset.dow !== _calDragFrom) { z.style.borderColor='rgba(77,138,255,0.35)'; z.style.background='rgba(77,138,255,0.04)'; }
    });
  });
  calRows.addEventListener('dragend', function(e) {
    var chip = e.target.closest('.man-chip');
    if (chip) chip.style.opacity = '';
    calRows.querySelectorAll('.man-drop-zone').forEach(function(z){ z.style.borderColor=''; z.style.background=''; });
    if (_calDragVal) { _calDragVal = null; _calDragFrom = null; _renderManualCalUI(); }
  });
  calRows.addEventListener('dragover', function(e) {
    var zone = e.target.closest('.man-drop-zone');
    if (!zone) return; e.preventDefault();
    zone.style.background='rgba(77,138,255,0.10)'; zone.style.borderColor='var(--accent)'; zone.style.borderStyle='dashed';
  });
  calRows.addEventListener('dragleave', function(e) {
    var zone = e.target.closest('.man-drop-zone');
    if (zone) { zone.style.background=''; zone.style.borderColor=''; }
  });
  calRows.addEventListener('drop', function(e) {
    var zone = e.target.closest('.man-drop-zone');
    if (!zone) return;
    e.preventDefault(); zone.style.background=''; zone.style.borderColor='';
    var toDow = zone.dataset.dow;
    if (!_calDragFrom || !_calDragVal || toDow === _calDragFrom) return;
    var fromSlots = _airSchedule[_calDragFrom] || [];
    var toSlots = (_airSchedule[toDow] || []).slice();
    if (toSlots.some(function(v){ return v === _calDragVal; })) { showToast('Ya está en ese día'); return; }
    if (_calDragVal.startsWith('train') && toSlots.some(function(v){ return v.startsWith('train'); })) { showToast('Ya hay Gym ese día'); return; }
    if (toSlots.length >= 3) { showToast('Máximo 3 actividades por día'); return; }
    _airSchedule[_calDragFrom] = fromSlots.filter(function(v){ return v !== _calDragVal; });
    toSlots.push(_calDragVal); _airSchedule[toDow] = toSlots;
    _calDragVal = null; _calDragFrom = null;
    _renderManualCalUI();
  });

  // Touch — listeners en document (únicos, no se acumulan por los guards de _calTouchClone)
  document.removeEventListener('touchmove', _calTouchMove);
  document.removeEventListener('touchend', _calTouchEnd);
  document.addEventListener('touchmove', _calTouchMove, {passive:false});
  document.addEventListener('touchend', _calTouchEnd);

  calRows.addEventListener('touchstart', function(e) {
    var chip = e.target.closest('.man-chip');
    if (!chip) return;
    _calTouchChip = chip; _calTouchFrom = chip.dataset.dow; _calTouchVal = chip.dataset.val;
    var r = chip.getBoundingClientRect();
    _calTouchClone = chip.cloneNode(true);
    _calTouchClone.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;opacity:0.85;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;';
    document.body.appendChild(_calTouchClone);
    chip.style.opacity = '0.3';
  }, {passive:true});
  // Drag & drop
// Drag & drop — usando event delegation para evitar acumulación de listeners
// listeners ya bindeados arriba
  var _unused_dragstart = function(e) {
    var chip = e.target.closest('.man-chip');
    if (!chip) return;
    _calDragVal = chip.dataset.val; _calDragFrom = chip.dataset.dow;
    chip.style.opacity = '0.35'; e.dataTransfer.effectAllowed = 'move';
    manualEl.querySelectorAll('.man-drop-zone').forEach(function(z) {
      if (z.dataset.dow !== _calDragFrom) { z.style.borderColor='rgba(77,138,255,0.35)'; z.style.background='rgba(77,138,255,0.04)'; }
    });
  };

 document.removeEventListener('touchmove', _calTouchMove);
  document.removeEventListener('touchend', _calTouchEnd);
  document.addEventListener('touchmove', _calTouchMove, {passive:false});
  document.addEventListener('touchend', _calTouchEnd);

  calRows.addEventListener('touchstart', function(e) {
    var chip = e.target.closest('.man-chip');
    if (!chip) return;
    _calTouchChip = chip; _calTouchFrom = chip.dataset.dow; _calTouchVal = chip.dataset.val;
    var r = chip.getBoundingClientRect();
    _calTouchClone = chip.cloneNode(true);
    _calTouchClone.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;opacity:0.85;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;';
    document.body.appendChild(_calTouchClone);
    chip.style.opacity = '0.3';
  }, {passive:true});
}

function _manualShowGlobalNav() {
  document.getElementById('setupBack').style.display = '';
  document.getElementById('setupNext').style.display = '';
  document.getElementById('setupNext').textContent = 'Continuar →';
}
function _manualCalDone() {
  _collectManualCycle();
  _manualShowGlobalNav();
  _manualSubStep = 'done';
  _setupStep++;
  _renderSetupDots();
  _renderSetupPage();
  document.getElementById('setupBack').style.display = '';
  document.getElementById('setupNext').textContent = 'Continuar →';
}
function _collectManualCycle() {
  _savedManualCycle = null; _savedManualSportNames = {}; _savedManualTraining = null;  var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var manualTraining = _wizardDays.map(function(d) {
    return { name: d.name, exercises: d.exercises.filter(function(e){ return e.name && e.name.trim(); }) };
  });
  if (!state.config) state.config = {};
  state.config.training = manualTraining;
  state.config.cycle = {};
  if (!state.config.sportNames) state.config.sportNames = {};
var cycle = {}, sportNames = {};
  allDows.forEach(function(dow) {
    var slots = _airSchedule[dow] || [];
    var gymSlot = slots.find(function(v){ return v.startsWith('train'); });
    var actSlots = slots.filter(function(v){ return v.startsWith('activity:'); });
    if (gymSlot) { cycle[dow] = parseInt(gymSlot.split(':')[1]); }
    else if (actSlots.length > 0) { cycle[dow] = 'sport'; }
    else { cycle[dow] = 'rest'; }
    if (actSlots.length > 0) { sportNames[dow] = actSlots.map(function(v){ return v.split(':')[1]; }).join('+'); }
  });
  state.config.cycle = cycle;
  state.config.sportNames = sportNames;
  _savedManualCycle = cycle;
  _savedManualSportNames = sportNames;
  _savedManualTraining = manualTraining;
}

function sp3BackToChoose() {
  _sp3Mode = null;
  document.getElementById('setupBack').style.display = 'none';
  document.getElementById('setupNext').style.display = '';
  var chooseEl = document.getElementById('sp3-choose');
  var manualEl = document.getElementById('sp3-manual');
  if (chooseEl) chooseEl.style.display = 'block';
  if (manualEl) manualEl.style.display = 'none';
}

// Called from AI routine modal after applying, to advance the wizard
function sp3AiDone() {
  _sp3Mode = 'ai';
  _setupStep++;
  _renderSetupDots();
  _renderSetupPage();
  document.getElementById('setupBack').style.display = '';
  document.getElementById('setupNext').textContent = 'Continuar →';
}

function setupNext() {
  // Step 2 is the routine step; require a choice or show choose screen
if (_setupStep === 2 && _sp3Mode === null) {
    showToast('⚠ Elegí cómo armar tu rutina, o usá "Saltar este paso"');
    return;
  }
if (_setupStep === 2 && _sp3Mode === 'manual') {
    if (_manualSubStep === 'calendar') {
      _collectManualCycle();
    } else if (_manualSubStep !== 'done') {
      showToast('⚠ Completá todos los pasos de tu rutina');
      return;
    }
  }
  if (!_validateSetupStep()) return;
  // Step 5 is last (sp-6 summary/finish)
  if (_setupStep >= _TOTAL_STEPS - 1) { _buildSetupSummary(); _finishSetup(); return; }
  // Build summary preview when arriving at step 4 (supps) so step 5 is ready
  if (_setupStep === _TOTAL_STEPS - 2) _buildSetupSummary();
  _setupStep++;
  _renderSetupDots();
  _renderSetupPage();
  document.getElementById('setupBack').style.display = '';
  document.getElementById('setupNext').textContent = _setupStep === _TOTAL_STEPS - 1 ? '¡Empezar! 🚀' : 'Continuar →';
}

function setupPrev() {
  if (_setupStep === 0) return;
  _setupStep--;
  // If going back to routine step, reset sub-mode so choose screen shows
  if (_setupStep === 2) _sp3Mode = null;
  _renderSetupDots();
  _renderSetupPage();
  document.getElementById('setupBack').style.display = _setupStep === 0 ? 'none' : '';
  document.getElementById('setupNext').textContent = 'Continuar →';
}

function _validateSetupStep() {
  if (_setupStep === 0) {
    if (!_wizardGoal) { showToast('⚠ Elegí tu objetivo'); return false; }
    return true;
  }
  if (_setupStep === 1) { // datos personales (sp-2)
    var name = document.getElementById('cfgName').value.trim();
    if (!name) { showToast('⚠ Ingresá tu nombre'); return false; }
    var age = parseFloat(document.getElementById('cfgAge').value);
    var weight = parseFloat(document.getElementById('cfgWeight').value);
    var height = parseFloat(document.getElementById('cfgHeight').value);
    if (!age || !weight || !height) { showToast('⚠ Completá edad, peso y altura'); return false; }
    _wizardPlan = calcNutritionPlan();
  }
  if (_setupStep === 2) { /* exercise builder — collected via oninput */ }
  // sp-4 collect removed
  if (_setupStep === 4) { /* supps — collected via oninput */ }
  return true;
}

// ── STEP 0: Goal Selection ────────────────────────────────────────────────
var GOALS = [
  {
    key: 'cut_aggressive',
    emoji: '🔥',
    title: 'Perder peso rápido',
    desc: 'Comés bastante menos de lo que gastás · perdés ~1kg por semana',
    detail: 'Reducís bastante las calorías para perder peso rápido. Requiere disciplina y comer suficiente proteína para no perder músculo en el proceso.',
    color: 'var(--red)'
  },
  {
    key: 'cut',
    emoji: '📉',
    title: 'Perder peso de forma sostenida',
    desc: 'Comés un poco menos de lo que gastás · perdés ~0.5kg por semana',
    detail: 'El ritmo más recomendado para perder grasa sin sacrificar músculo. Más fácil de mantener en el tiempo.',
    color: 'var(--accent)'
  },
  {
    key: 'maintain',
    emoji: '⚖️',
    title: 'Mantener mi peso actual',
    desc: 'Comés lo mismo que gastás · podés ganar músculo y perder grasa a la vez',
    detail: 'Ideal si ya estás bien de peso y querés mejorar tu cuerpo entrenando sin cambiar la balanza.',
    color: 'var(--green)'
  },
  {
    key: 'lean_bulk',
    emoji: '💪',
    title: 'Ganar músculo con poca grasa',
    desc: 'Comés un poco más de lo que gastás · subís ~0.3kg por semana',
    detail: 'Comés un poco más para que el cuerpo tenga energía de sobra para construir músculo. El aumento es lento pero casi todo músculo.',
    color: 'var(--yellow)'
  },
  {
    key: 'bulk',
    emoji: '🏋️',
    title: 'Ganar masa muscular (volumen)',
    desc: 'Comés bastante más de lo que gastás · subís ~0.7kg por semana',
    detail: 'Más calorías para maximizar las ganancias musculares. Vas a ganar algo de grasa también, pero es la forma más efectiva de ganar masa.',
    color: 'var(--accent2)'
  }
];

function _renderGoalStep() {
  var grid = document.getElementById('goalGrid');
  if (!grid) return;
grid.innerHTML = GOALS.map(function(g) {
    var isSelected = _wizardGoal === g.key;
    return '<div class="goal-card'+(isSelected?' selected':'')+'" data-goal="'+g.key+'" onclick="_selectGoal(\''+g.key+'\')" style="border-color:'+(isSelected?g.color:'var(--border)')+'">'+
      '<div style="display:flex;align-items:center;gap:10px">'+
        '<div style="font-size:20px">'+g.emoji+'</div>'+
        '<div style="flex:1">'+
          '<div style="font-size:13px;font-weight:700;color:var(--text)">'+g.title+'</div>'+
          '<div style="font-size:10px;color:'+g.color+';margin-top:1px">'+g.desc+'</div>'+
        '</div>'+
        '<div style="width:18px;height:18px;flex-shrink:0;border-radius:50%;border:2px solid '+(isSelected?g.color:'var(--border)')+';display:flex;align-items:center;justify-content:center;font-size:10px;color:'+g.color+';">'+(isSelected?'✓':'')+'</div>'+
      '</div>'+
    '</div>';
  }).join('');
}

function _selectGoal(key) {
  _wizardGoal = key;
  _renderGoalStep();
}

// ── STEP 2: Exercise Builder ──────────────────────────────────────────────
// Only re-renders the day tabs (not the whole builder) — keeps input focus
function _updateDayTabs() {
  var tabs = document.getElementById('trainDayTabs');
  if (!tabs) return;
  var html = '';
  for (var i = 0; i < _wizardDays.length; i++) {
    html += '<div class="ex-dtab '+(i===_currentWizardDay?'active':'')+'" onclick="switchWizardDay('+i+')">'+(_wizardDays[i].name||'Día '+(i+1))+'</div>';
  }
  tabs.innerHTML = html;
}

// Sport emoji map
var SPORT_EMOJIS = {
  'Tenis':'🎾','Fútbol':'⚽','Natación':'🏊','Básquet':'🏀','Ciclismo':'🚴','Running':'🏃',
  'Vóley':'🏐','Padel':'🏓','Pilates':'🧘','Yoga':'🧘','Boxeo':'🥊','CrossFit':'💪',
  'Escalada':'🧗','Rugby':'🏉','Hockey':'🏑','Golf':'⛳','Handball':'🤾','Artes marciales':'🥋'
};
function _getSportEmoji(name) {
  if (!name) return '⚽';
  var found = Object.keys(SPORT_EMOJIS).find(function(k){ return name.toLowerCase().includes(k.toLowerCase()); });
  return found ? SPORT_EMOJIS[found] : '⚽';
}

function _renderExBuilder() {
  var tabs = document.getElementById('trainDayTabs');
  var nameInp = document.getElementById('currentDayName');
  var container = document.getElementById('exBuilderContainer');
  var addRow = document.getElementById('addExRow');
  var hdr = document.getElementById('exColHdr');

  // Si no hay días, mostrar estado vacío
  if (_wizardDays.length === 0) {
    tabs.innerHTML = '';
    nameInp.innerHTML = '';
    hdr.style.display = 'none';
    addRow.style.display = 'none';
    container.innerHTML = '<div style="color:var(--text3);font-size:12px;text-align:center;padding:20px 0">Agregá un día con el botón de abajo.</div>';
    return;
  }

  var tabsHtml = '';
  for (var i = 0; i < _wizardDays.length; i++) {
    var td = _wizardDays[i];
    var tabLabel = td.isSport ? (_getSportEmoji(td.sportName||td.name) + ' ' + (td.sportName||td.name||'Deporte')) : td.name;
    tabsHtml += '<div class="ex-dtab '+(i===_currentWizardDay?'active':'')+'" onclick="switchWizardDay('+i+')">'+tabLabel+'</div>';
  }
  tabs.innerHTML = tabsHtml;
  var day = _wizardDays[_currentWizardDay];
  var isSport = !!day.isSport;

  var toggleHtml = '<div style="display:flex;gap:6px;margin-bottom:10px">'
    + '<button onclick="_wizardToggleSport(false)" style="flex:1;padding:7px;border-radius:8px;border:1.5px solid '+(isSport?'var(--border)':'var(--accent)')+';background:'+(isSport?'var(--bg3)':'rgba(77,138,255,0.12)')+';color:'+(isSport?'var(--text3)':'var(--accent)')+';font-size:12px;font-weight:700;cursor:pointer">🏋️ Entrenamiento</button>'
    + '<button onclick="_wizardToggleSport(true)" style="flex:1;padding:7px;border-radius:8px;border:1.5px solid '+(isSport?'var(--accent)':'var(--border)')+';background:'+(isSport?'rgba(77,200,120,0.12)':'var(--bg3)')+';color:'+(isSport?'var(--green)':'var(--text3)')+';font-size:12px;font-weight:700;cursor:pointer">⚽ Deporte</button>'
    + '</div>';

  if (isSport) {
    var sportName = day.sportName || '';
    var chips = Object.keys(SPORT_EMOJIS).map(function(s){
      var active = sportName === s;
      return '<button onclick="_wizardSetSport(\''+s+'\')" style="padding:5px 11px;border-radius:20px;border:1px solid '+(active?'var(--green)':'var(--border)')+';background:'+(active?'rgba(77,200,120,0.15)':'var(--bg3)')+';color:'+(active?'var(--green)':'var(--text2)')+';font-size:11px;cursor:pointer;white-space:nowrap">'+SPORT_EMOJIS[s]+' '+s+'</button>';
    }).join('');
    nameInp.innerHTML = toggleHtml
      + '<input class="day-name-inp" value="'+sportName+'" placeholder="Nombre del deporte (ej: Tenis, Fútbol…)" style="margin-bottom:10px" oninput="_wizardDays[_currentWizardDay].sportName=this.value;_wizardDays[_currentWizardDay].name=this.value||\'Deporte\';_updateDayTabs()">'
      + '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">'+chips+'</div>';
    hdr.style.display = 'none';
    addRow.style.display = 'none';
    container.innerHTML = '<div style="color:var(--text3);font-size:12px;text-align:center;padding:16px;border:1px dashed var(--border);border-radius:8px">'+_getSportEmoji(sportName)+' Día de deporte libre.<br>Se registra como actividad en tu historial.</div>';
  } else {
    nameInp.innerHTML = toggleHtml
      + '<input class="day-name-inp" id="dayNameInp" value="'+day.name+'" placeholder="Nombre del día (ej: Push, Piernas…)" oninput="_wizardDays[_currentWizardDay].name=this.value;_updateDayTabs()">';
    hdr.style.display = (day.exercises && day.exercises.length) ? 'flex' : 'none';
    addRow.style.display = 'block';
    container.innerHTML = '';
    var builder = document.createElement('div');
    builder.className = 'ex-builder';
    if (!day.exercises || day.exercises.length === 0) {
      builder.innerHTML = '<div style="color:var(--text3);font-size:12px;text-align:center;padding:16px 0">No hay ejercicios aún. Agregá uno abajo.</div>';
    } else {
      day.exercises.forEach(function(ex, i) {
        var row = document.createElement('div');
        row.className = 'ex-row-build';
        row.innerHTML = '<input class="e-name" value="'+ex.name+'" placeholder="Nombre del ejercicio" oninput="_wizardDays[_currentWizardDay].exercises['+i+'].name=this.value">'
          +'<input class="e-sets" value="'+ex.sets+'" placeholder="4" type="number" min="1" oninput="_wizardDays[_currentWizardDay].exercises['+i+'].sets=+this.value">'
          +'<input class="e-reps" value="'+ex.reps+'" placeholder="8-12" oninput="_wizardDays[_currentWizardDay].exercises['+i+'].reps=this.value">'
          +'<button class="e-del" onclick="removeExercise('+i+')">✕</button>';
        builder.appendChild(row);
      });
    }
    container.appendChild(builder);
  }
}

function _wizardToggleSport(isSport) {
  _wizardDays[_currentWizardDay].isSport = isSport;
  if (isSport) {
    _wizardDays[_currentWizardDay].exercises = [];
    if (!_wizardDays[_currentWizardDay].sportName) _wizardDays[_currentWizardDay].sportName = '';
    _wizardDays[_currentWizardDay].name = _wizardDays[_currentWizardDay].sportName || 'Deporte';
  }
  _renderExBuilder();
}
function _wizardSetSport(name) {
  _wizardDays[_currentWizardDay].sportName = name;
  _wizardDays[_currentWizardDay].name = name;
  _renderExBuilder();
  _updateDayTabs();
}
function switchWizardDay(i) { _currentWizardDay = i; _renderExBuilder(); }
function addExercise() { _wizardDays[_currentWizardDay].exercises.push({name:'',sets:3,reps:'8-12'}); _renderExBuilder(); }
function removeExercise(i) { _wizardDays[_currentWizardDay].exercises.splice(i,1); _renderExBuilder(); }
function addTrainDay() { _wizardDays.push({name:'Día '+(_wizardDays.length+1),exercises:[],isSport:false}); _currentWizardDay=_wizardDays.length-1; _renderExBuilder(); }
function _resetWizardChips() { window._wizardDayChips = {}; WEEK_DAYS.forEach(function(wd){ window._wizardDayChips[wd.key] = []; }); }

function removeTrainDay() { if(_wizardDays.length<=1){showToast('Necesitás al menos 1 día');return;} _wizardDays.splice(_currentWizardDay,1); _currentWizardDay=Math.max(0,_currentWizardDay-1); _renderExBuilder(); }

// ── STEP 3: Cycle Builder ─────────────────────────────────────────────────
// ── STEP 3: Cycle Builder ─────────────────────────────────────────────────
function _renderCycleBuilder() {
  var container = document.getElementById('sp4-content');
  if (!container) return;

  var aiCycle = (_sp3Mode === 'ai' && state.config && state.config.cycle && state.config.training && state.config.training.length > 0);

  if (_sp3Mode === 'manual') {
    // Manual mode: use same chip-drag calendar as AI
    _manualWizStep = _manualWizStep || 1;
    _renderManualWizStep();
    return;
  }

  if (aiCycle) {
    // Show the AI-configured schedule visually + option to add sports
    var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    var dowLabels = {Mon:'Lun',Tue:'Mar',Wed:'Mié',Thu:'Jue',Fri:'Vie',Sat:'Sáb',Sun:'Dom'};
    var dowFull = {Mon:'Lunes',Tue:'Martes',Wed:'Miércoles',Thu:'Jueves',Fri:'Viernes',Sat:'Sábado',Sun:'Domingo'};
    var training = state.config.training || [];
    var cycle = state.config.cycle || {};

    var calendarHtml = allDows.map(function(d) {
      var val = cycle[d];
      var isTrain = (val !== undefined && val !== null && val !== 'rest' && val !== -1);
      var isSport = (val === 'sport');
      var dayName = isTrain && !isSport && training[val] ? training[val].name : (isSport ? 'Deporte' : 'Descanso');
      var bg = isTrain ? (isSport ? 'rgba(77,200,120,0.15)' : 'rgba(77,138,255,0.15)') : 'var(--bg3)';
      var border = isTrain ? (isSport ? 'var(--green)' : 'var(--accent)') : 'var(--border)';
      var color = isTrain ? (isSport ? 'var(--green)' : 'var(--accent)') : 'var(--text3)';
      var emoji = isTrain ? (isSport ? '⚽' : '💪') : '🛋';
      return '<div style="background:'+bg+';border:1.5px solid '+border+';border-radius:10px;padding:10px 8px;text-align:center">' +
        '<div style="font-size:10px;font-weight:700;color:'+color+';text-transform:uppercase;margin-bottom:4px">'+dowLabels[d]+'</div>' +
        '<div style="font-size:18px;margin-bottom:3px">'+emoji+'</div>' +
        '<div style="font-size:9px;color:'+color+';font-weight:600;line-height:1.2">'+dayName+'</div>' +
        '</div>';
    }).join('');

    // Sport addition dropdown
    var sportOpts = '<option value="">— Elegí un día —</option>' + allDows.map(function(d){
      return '<option value="'+d+'">'+dowFull[d]+'</option>';
    }).join('');

    container.innerHTML =
      '<div class="setup-label">Tu semana de entrenamiento</div>' +
      '<div class="setup-hint" style="margin-bottom:16px">Tu rutina con IA ya está configurada. Así quedó tu semana:</div>' +
      '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:20px">' + calendarHtml + '</div>' +
      '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:14px">' +
        '<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px">⚽ ¿Practicás algún deporte?</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-bottom:10px">Podés agregar días de deporte libre para registrarlos en tu historial.</div>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
          '<select id="sportDaySelect" class="cycle-sel" style="flex:1">'+sportOpts+'</select>' +
          '<button onclick="sp4AddSport()" class="btn btn-ghost" style="font-size:12px;white-space:nowrap;padding:8px 12px">+ Agregar</button>' +
        '</div>' +
      '</div>';
    return;
  }

  // Default: manual cycle builder with dropdowns// Chip-based cycle builder (same UX as AI routine)
  if (!window._wizardDayChips) window._wizardDayChips = {};
  WEEK_DAYS.forEach(function(wd) {
    if (!window._wizardDayChips[wd.key]) window._wizardDayChips[wd.key] = [];
  });

  container.innerHTML =
    '<div class="setup-label">¿Qué días entrenás?</div>' +
    '<div class="setup-hint" style="margin-bottom:14px">Tocá cada día para configurarlo. Podés agregar varias actividades por día.</div>' +
    '<div id="wizardChipCalendar"></div>';

  _renderWizardChipCalendar();
}

function _renderWizardChipCalendar() {
  var cal = document.getElementById('wizardChipCalendar');
  if (!cal) return;
  var html = '';
  WEEK_DAYS.forEach(function(wd) {
    var chips = (window._wizardDayChips[wd.key] || []);
    var chipsHtml = chips.map(function(c, ci) {
      var isGym = c.type === 'gym';
      var emoji = isGym ? '🏋️' : (_getSportEmoji(c.name));
      var label = isGym ? (_wizardDays[c.dayIdx] ? _wizardDays[c.dayIdx].name : c.name) : c.name;
      var bg = isGym ? 'rgba(77,138,255,0.15)' : 'rgba(77,200,120,0.15)';
      var border = isGym ? 'var(--accent)' : 'var(--green)';
      var color = isGym ? 'var(--accent)' : 'var(--green)';
      return '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;background:'+bg+';border:1.5px solid '+border+';font-size:12px;font-weight:700;color:'+color+';white-space:nowrap">'
        + emoji + ' ' + label
        + '<button onclick="event.stopPropagation();_wizardRemoveChip(\''+wd.key+'\','+ci+')" style="background:none;border:none;color:'+color+';cursor:pointer;font-size:13px;line-height:1;padding:0 0 0 3px;opacity:0.7">✕</button>'
        + '</span>';
    }).join('');
    html += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">'
      + '<div style="width:72px;font-size:13px;font-weight:700;color:var(--text2);flex-shrink:0">'+wd.label+'</div>'
      + '<div style="display:flex;flex-wrap:wrap;gap:6px;flex:1">'
      + (chipsHtml || '<span style="font-size:11px;color:var(--text3)">🛋 Descanso</span>')
      + '</div>'
      + '<button onclick="_wizardOpenDayPicker(\''+wd.key+'\')" style="flex-shrink:0;width:28px;height:28px;border-radius:50%;border:1.5px dashed var(--accent);background:none;color:var(--accent);font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center">+</button>'
      + '</div>';
  });
  cal.innerHTML = html;
}

function _wizardRemoveChip(dow, idx) {
  if (!window._wizardDayChips[dow]) return;
  window._wizardDayChips[dow].splice(idx, 1);
  _renderWizardChipCalendar();
}

function _wizardOpenDayPicker(dow) {
  var existing = document.getElementById('wizardDayPickerSheet');
  if (existing) existing.remove();

  var gymOptions = _wizardDays.map(function(d, i) {
    return '<div onclick="_wizardAddChip(\''+dow+'\',\'gym\','+i+',\''+d.name+'\')" '
      + 'style="display:flex;align-items:center;gap:10px;padding:11px 14px;border-radius:10px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;margin-bottom:6px">'
      + '<span style="font-size:20px">🏋️</span>'
      + '<span style="font-size:13px;font-weight:600;color:var(--accent)">'+d.name+'</span>'
      + '</div>';
  }).join('') || '<div style="font-size:12px;color:var(--text3);padding:8px 0">No tenés días de gym creados aún.</div>';

  var sportOptions = Object.keys(SPORT_EMOJIS).map(function(sp) {
    return '<button onclick="_wizardAddChip(\''+dow+'\',\'sport\',null,\''+sp+'\')" '
      + 'style="padding:5px 11px;border-radius:20px;border:1px solid var(--border);background:var(--bg3);color:var(--text2);font-size:11px;cursor:pointer;margin:3px">'
      + SPORT_EMOJIS[sp] + ' ' + sp + '</button>';
  }).join('');

  var sheet = document.createElement('div');
  sheet.id = 'wizardDayPickerSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:10001;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px;max-height:85vh;overflow-y:auto">'
    + '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 14px"></div>'
    + '<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:14px">Agregar actividad</div>'
    + '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">🏋️ Gym</div>'
    + gymOptions
    + '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin:14px 0 8px">⚽ Deporte / Actividad</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">'+sportOptions+'</div>'
    + '<div style="display:flex;gap:8px;margin-top:8px">'
    + '<input id="wizardCustomSport" class="inp" placeholder="Otro deporte personalizado…" style="flex:1;margin-bottom:0;font-size:12px">'
    + '<button onclick="_wizardAddCustomSport(\''+dow+'\')" style="padding:8px 14px;border-radius:8px;background:var(--accent);color:#fff;border:none;font-size:12px;font-weight:700;cursor:pointer">+ Agregar</button>'
    + '</div>'
    + '<button onclick="document.getElementById(\'wizardDayPickerSheet\').remove()" class="btn btn-ghost" style="width:100%;margin-top:12px">Cancelar</button>'
    + '</div>';
  sheet.addEventListener('click', function(e){ if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

function _wizardAddChip(dow, type, dayIdx, name) {
  if (!window._wizardDayChips[dow]) window._wizardDayChips[dow] = [];
  // Evitar gym duplicado
  if (type === 'gym' && window._wizardDayChips[dow].some(function(c){ return c.type === 'gym' && c.dayIdx === dayIdx; })) {
    showToast('⚠ Ya agregaste ese día de gym');
    return;
  }
  window._wizardDayChips[dow].push({ type: type, dayIdx: dayIdx, name: name });
  document.getElementById('wizardDayPickerSheet') && document.getElementById('wizardDayPickerSheet').remove();
  _renderWizardChipCalendar();
}

function _wizardAddCustomSport(dow) {
  var inp = document.getElementById('wizardCustomSport');
  if (!inp || !inp.value.trim()) { showToast('⚠ Escribí un nombre'); return; }
  _wizardAddChip(dow, 'sport', null, inp.value.trim());
}

function sp4AddSport() {
  var sel = document.getElementById('sportDaySelect');
  if (!sel || !sel.value) { showToast('⚠ Elegí un día primero'); return; }
  var dow = sel.value;
  if (!state.config) state.config = {};
  if (!state.config.cycle) state.config.cycle = {};
  state.config.cycle[dow] = 'sport';
  saveState(state);
  showToast('✅ Día de deporte agregado');
  _renderCycleBuilder(); // re-render to show updated calendar
}

function _collectWizardCycle() {
  if (_sp3Mode === 'manual') return;
  if (_sp3Mode === 'ai') return;
  var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var manualTraining = _wizardDays.map(function(d) {
    return { name: d.name, exercises: d.exercises.filter(function(e){ return e.name && e.name.trim(); }) };
  });
  if (!state.config) state.config = {};
  state.config.training = manualTraining;
  state.config.cycle = {};
  if (!state.config.sportNames) state.config.sportNames = {};
  allDows.forEach(function(dow) {
    var slots = _airSchedule[dow] || [];
    var gymSlot = slots.find(function(v){ return v.startsWith('train'); });
    var actSlots = slots.filter(function(v){ return v.startsWith('activity:'); });
    if (gymSlot) {
      state.config.cycle[dow] = parseInt(gymSlot.split(':')[1]);
    } else if (actSlots.length > 0) {
      state.config.cycle[dow] = 'sport';
    } else {
      state.config.cycle[dow] = 'rest';
    }
    if (actSlots.length > 0) {
      state.config.sportNames[dow] = actSlots.map(function(v){ return v.split(':')[1]; }).join('+');
    }
  });
}

// ── STEP 4: Supp Builder ─────────────────────────────────────────────────
function _renderSuppBuilderSetup() {
  var c = document.getElementById('suppBuilder');
  c.innerHTML = '';
  _wizardSupps.forEach(function(s, i) {
    var row = document.createElement('div');
    row.className = 'supp-row-build';
    row.innerHTML = '<input class="s-name" placeholder="Suplemento" value="'+s.name+'" oninput="_wizardSupps['+i+'].name=this.value">'+
      '<input class="s-dose" placeholder="Dosis" value="'+s.dose+'" oninput="_wizardSupps['+i+'].dose=this.value">'+
      '<select class="s-time" onchange="_wizardSupps['+i+'].time=this.value">'+
        '<option '+(s.time==='morning'?'selected':'')+' value="morning">Mañana</option>'+
        '<option '+(s.time==='noon'?'selected':'')+' value="noon">Mediodía</option>'+
        '<option '+(s.time==='night'?'selected':'')+' value="night">Noche</option>'+
      '</select><button class="s-del" onclick="removeSuppRow('+i+')">✕</button>';
    c.appendChild(row);
  });
}

function addSuppRow() { _wizardSupps.push({name:'',dose:'',time:'morning'}); _renderSuppBuilderSetup(); }
function removeSuppRow(i) { _wizardSupps.splice(i,1); _renderSuppBuilderSetup(); }

// ── STEP 5: Summary ───────────────────────────────────────────────────────
function _buildSetupSummary() {
  var name = document.getElementById('cfgName').value.trim();
  var plan = _wizardPlan || calcNutritionPlan();
  var suppCount = _wizardSupps.filter(function(s){return s.name;}).length;
  var exCount = _wizardDays.reduce(function(a,d){return a+d.exercises.filter(function(e){return e.name;}).length;},0);
  document.getElementById('setupReadySub').textContent = '¡'+name+', tu plan está listo! Empezá a trackear hoy mismo.';
  document.getElementById('setupSummary').innerHTML = '<div style="display:flex;flex-direction:column;gap:10px">'+
    '<div style="display:flex;justify-content:space-between"><span style="color:var(--text2);font-size:12px">🔥 Calorías objetivo</span><span style="font-family:Space Mono,monospace;font-size:12px;color:var(--accent)">'+(plan?plan.kcal:'—')+' kcal</span></div>'+
    '<div style="display:flex;justify-content:space-between"><span style="color:var(--text2);font-size:12px">🍗 Proteína</span><span style="font-family:Space Mono,monospace;font-size:12px;color:var(--green)">'+(plan?plan.prot:'—')+'g</span></div>'+
    '<div style="display:flex;justify-content:space-between"><span style="color:var(--text2);font-size:12px">🍚 Carbos</span><span style="font-family:Space Mono,monospace;font-size:12px;color:var(--accent)">'+(plan?plan.carb:'—')+'g</span></div>'+
    '<div style="display:flex;justify-content:space-between"><span style="color:var(--text2);font-size:12px">🥑 Grasas</span><span style="font-family:Space Mono,monospace;font-size:12px;color:var(--yellow)">'+(plan?plan.fat:'—')+'g</span></div>'+
    '<div style="display:flex;justify-content:space-between"><span style="color:var(--text2);font-size:12px">💪 Días de rutina</span><span style="font-family:Space Mono,monospace;font-size:12px;color:var(--text)">'+_wizardDays.length+' días · '+exCount+' ejercicios</span></div>'+
    '<div style="display:flex;justify-content:space-between"><span style="color:var(--text2);font-size:12px">💊 Suplementos</span><span style="font-family:Space Mono,monospace;font-size:12px;color:var(--text)">'+suppCount+'</span></div>'+
    '</div>';
}

function _finishSetup() {
  var plan = _wizardPlan || calcNutritionPlan();

  // If AI routine was used, training+cycle were already saved by applyAIRoutine()
  // Preserve them — do NOT overwrite with the empty _wizardDays
var savedTraining = null, savedCycle = null, savedSportNames = {};
  if (_sp3Mode === 'manual' && _savedManualCycle) {
    savedCycle = _savedManualCycle;
    savedSportNames = _savedManualSportNames || {};
    savedTraining = _savedManualTraining;
  } else if (_sp3Mode === 'ai' && state.config && state.config.training && state.config.training.length > 0) {
    savedTraining = state.config.training;
    savedCycle = state.config.cycle || null;
    savedSportNames = state.config.sportNames || {};
  }
  var manualTraining = _wizardDays.map(function(d){
    return { name:d.name, exercises:d.exercises.filter(function(e){return e.name && e.name.trim();}) };
  });

  var cfg = {
    name: document.getElementById('cfgName').value.trim(),
    goal: _wizardGoal || 'cut',
    theme: _wizardTheme,
    age: parseFloat(document.getElementById('cfgAge').value),
    weight: parseFloat(document.getElementById('cfgWeight').value),
    height: parseFloat(document.getElementById('cfgHeight').value),
    kcal: plan ? plan.kcal : 2400,
tdee: plan ? plan.tdee : 2400,
    prot: plan ? plan.prot : 190,
    carb: plan ? plan.carb : 240,
    fat:  plan ? plan.fat  : 70,
training: savedTraining || manualTraining,
    cycle: savedCycle || _wizardCycle,
    sportNames: savedSportNames || {},
    supps: _wizardSupps.filter(function(s){return s.name.trim();})
  };
  state.config = cfg;
  state.setupDone = true;
  if (!state.installDate) state.installDate = TODAY; // fecha de primera instalación
  if (!state[TODAY]) state[TODAY] = {foods:[],supps:{},sleep:{},kcal:{burned:0,active:0},trainDay:_getTodayTrainDayCfg(cfg)};
  else if (cfg && cfg.cycle) state[TODAY].trainDay = _getTodayTrainDayCfg(cfg);
  if (!state.metricsHistory) state.metricsHistory = [];
  if (!state.kcalHistory) state.kcalHistory = [];
  if (!state.exerciseHistory) state.exerciseHistory = {};
  saveState(state);
  _launchApp();
}

function _getTodayTrainDayCfg(cfg) {
  if (!cfg) return 0;
  // If cycle configured, use it
  if (cfg.cycle) {
    var keys = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var key = keys[new Date().getDay()];
var dayIdx = cfg.cycle[key];
if (dayIdx === 'rest' || dayIdx === undefined || dayIdx === null || dayIdx === -1 || dayIdx === '-1' || dayIdx === 'sport') {
      return 0;
    }
    return parseInt(dayIdx) + 1;
  }
  // No cycle or today not assigned — default to day 1 if training exists
  if (cfg.training && cfg.training.length > 0) return 1;
  return 0;
}

function _launchApp() {
  if (state.config && state.config.theme) applyTheme(state.config.theme);
  document.getElementById('setupOverlay').style.display = 'none';
  document.getElementById('mainApp').style.display = 'flex';

  if (typeof checkAndStartTutorial === 'function') setTimeout(function(){ checkAndStartTutorial('home'); }, 800);
  // Esperar a que todos los módulos estén disponibles
  function _tryInit(attempts) {
    if (typeof renderTraining === 'function' && typeof renderHome === 'function') {
      init();
    } else if (attempts > 0) {
      setTimeout(function(){ _tryInit(attempts - 1); }, 30);
    } else {
      init(); // forzar igual
    }
  }
  _tryInit(20);
}

function resetSetup() {
  // Marcar reset pendiente ANTES de borrar nada (sobrevive al reload)
  localStorage.setItem('fittrack_force_setup', '1');
  localStorage.removeItem(STORE_KEY);
  localStorage.removeItem('fittrack');
  localStorage.removeItem('fittrack_v2');
  try {
    var req = indexedDB.deleteDatabase(IDB_NAME);
    req.onsuccess = function() { location.reload(); };
    req.onerror   = function() { location.reload(); };
    req.onblocked = function() { location.reload(); };
    setTimeout(function() { location.reload(); }, 800);
  } catch(_) {
    location.reload();
  }
}

// ══════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════
// MANUAL WIZARD — pasos extra (actividades + calendario)
// Reutiliza _airSchedule, _airActivities, _airActivityDays, _airWantsCombine
// ══════════════════════════════════════════════════════════════════
var _manualWizStep = 1; // 1=actividades, 2=calendario

function _renderManualWizStep() {
  var container = document.getElementById('sp4-content');
  if (!container) return;

  if (_manualWizStep === 1) {
    // Paso 1: actividades (mismo HTML que _airRenderActivityStep pero en container)
    _airActivities = _airActivities || [];
    _airActivityDays = _airActivityDays || {};
    _airWantsCombine = _airWantsCombine || false;
    container.innerHTML = '<div id="manualActStep"></div>'
      + '<div style="display:flex;gap:8px;margin-top:16px">'
      + '<button onclick="_manualWizBack()" class="btn btn-ghost" style="flex:0 0 auto">← Atrás</button>'
      + '<button onclick="_manualWizNext()" class="btn btn-primary" style="flex:1">Continuar →</button>'
      + '</div>';
    _renderManualActivityStep();
  } else {
    // Paso 2: calendario con chips arrastrables
    _manualBuildSchedule();
    container.innerHTML = '<div id="manualSchedContainer"></div>'
      + '<div style="display:flex;gap:8px;margin-top:16px">'
      + '<button onclick="_manualWizBack()" class="btn btn-ghost" style="flex:0 0 auto">← Atrás</button>'
      + '<button onclick="setupNext()" class="btn btn-primary" style="flex:1">Continuar →</button>'
      + '</div>';
    _renderManualSchedule();
  }
}

function _manualWizNext() {
  _manualWizStep = 2;
  _manualBuildSchedule();
  _renderManualWizStep();
}

function _manualWizBack() {
  if (_manualWizStep === 2) {
    _manualWizStep = 1;
    _renderManualWizStep();
  } else {
    sp3BackToChoose();
  }
}

function _renderManualActivityStep() {
  var el = document.getElementById('manualActStep');
  if (!el) return;

  var categories = [
    { label: 'Cardio', items: [
      { name:'Correr', emoji:'🏃' }, { name:'Bici', emoji:'🚴' }, { name:'Caminata', emoji:'🚶' },
      { name:'HIIT', emoji:'🔥' }, { name:'Natación', emoji:'🏊' }, { name:'Pilates', emoji:'🧘' }
    ]},
    { label: 'Deportes', items: [
      { name:'Fútbol', emoji:'⚽' }, { name:'Tenis', emoji:'🎾' }, { name:'Pádel', emoji:'🏓' }, { name:'Otro', emoji:'🏅' }
    ]}
  ];

  function _daysBtn(name) {
    var cur = _airActivityDays[name] || 1;
    return '<div style="display:flex;align-items:center;gap:4px;margin-top:6px">'
      + '<span style="font-size:10px;color:var(--text3);margin-right:2px">días/semana:</span>'
      + [1,2,3,4].map(function(n) {
          var active = cur === n;
          return '<button onclick="event.stopPropagation();_manualSetActDays(\''+name+'\','+n+')" '
            + 'style="padding:3px 8px;border-radius:6px;border:1.5px solid '+(active?'var(--accent)':'var(--border)')+';'
            + 'background:'+(active?'rgba(77,138,255,0.15)':'var(--bg4)')+';font-size:11px;font-weight:700;'
            + 'color:'+(active?'var(--accent)':'var(--text3)')+';cursor:pointer">'+n+'x</button>';
        }).join('')
      + '</div>';
  }

  function _actCard(s) {
    var isOn = _airActivities.indexOf(s.name) !== -1;
    return '<div onclick="_manualToggleAct(\''+s.name+'\')" '
      + 'style="padding:11px 14px;border-radius:12px;margin-bottom:6px;cursor:pointer;'
      + 'border:1.5px solid '+(isOn?'var(--accent)':'var(--border)')+';'
      + 'background:'+(isOn?'rgba(77,138,255,0.1)':'var(--bg3)')+'">'
      + '<div style="display:flex;align-items:center;gap:12px">'
        + '<div style="font-size:22px">'+s.emoji+'</div>'
        + '<div style="font-size:13px;font-weight:600;color:var(--text);flex:1">'+s.name+'</div>'
        + (isOn ? '<div style="font-size:16px;color:var(--accent)">✓</div>' : '')
      + '</div>'
      + (isOn ? _daysBtn(s.name) : '')
      + '</div>';
  }

  var catsHtml = categories.map(function(cat) {
    return '<div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:0.5px;text-transform:uppercase;margin:14px 0 8px">'+cat.label+'</div>'
      + cat.items.map(_actCard).join('');
  }).join('');

  if (_airWantsCombine) {
    el.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding:8px 12px;background:rgba(77,138,255,0.08);border:1px solid rgba(77,138,255,0.2);border-radius:10px">'
      + '<span style="font-size:16px">✅</span>'
      + '<span style="font-size:12px;font-weight:600;color:var(--accent)">Combinando gym con actividades</span>'
      + '<button onclick="_manualSetActMode(false)" style="margin-left:auto;background:none;border:none;font-size:11px;color:var(--text3);cursor:pointer;text-decoration:underline">Solo gym</button>'
      + '</div>' + catsHtml;
    return;
  }

  el.innerHTML = '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px">¿Querés sumar actividades a tu semana de gym?</div>'
    + '<div style="font-size:11px;color:var(--text3);margin-bottom:14px">Podés combinar gym con deportes, cardio u otras actividades.</div>'
    + '<div style="display:flex;gap:8px;margin-bottom:16px">'
    + '<button onclick="_manualSetActMode(false)" style="flex:1;padding:12px;border-radius:12px;border:1.5px solid var(--accent);background:rgba(77,138,255,0.1);cursor:pointer;font-size:13px;font-weight:700;color:var(--accent)">Solo gym</button>'
    + '<button onclick="_manualSetActMode(true)" style="flex:1;padding:12px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg3);cursor:pointer;font-size:13px;font-weight:700;color:var(--text2)">Sí, sumar actividades</button>'
    + '</div>';
}

function _manualSetActMode(wants) {
  _airWantsCombine = wants;
  if (!wants) { _airActivities = []; _airActivityDays = {}; }
  _renderManualActivityStep();
}

function _manualToggleAct(name) {
  var idx = _airActivities.indexOf(name);
  if (idx !== -1) { _airActivities.splice(idx, 1); delete _airActivityDays[name]; }
  else { _airActivities.push(name); _airActivityDays[name] = 1; }
  _renderManualActivityStep();
}

function _manualSetActDays(name, n) {
  _airActivityDays[name] = n;
  _renderManualActivityStep();
}

function _manualBuildSchedule() {
  var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  allDows.forEach(function(d) { _airSchedule[d] = []; });
  // Usar los DOWs reales seleccionados por el usuario
  var hasDow = _wizardDays.some(function(d){ return !!d._dow; });
  if (hasDow) {
    _wizardDays.forEach(function(day, i) {
      if (day._dow) _airSchedule[day._dow] = ['train:' + i];
    });
  } else {
    // fallback para rutinas sin _dow
    var patterns = { 1:[0], 2:[0,3], 3:[0,2,4], 4:[0,1,3,4], 5:[0,1,2,4,5], 6:[0,1,2,3,4,5] };
    var gymDays = Math.min(6, Math.max(1, _wizardDays.length));
    var pattern = patterns[gymDays] || patterns[4];
    pattern.forEach(function(idx, i) {
      _airSchedule[allDows[idx]] = ['train:' + i];
    });
  }
  if (_airWantsCombine && _airActivities.length > 0) {
    _airActivities.forEach(function(name) {
      var n = _airActivityDays[name] || 1;
var placed = 0;
      // Primero días vacíos (descanso)
      allDows.forEach(function(d) {
        if (placed >= n) return;
        if (_airSchedule[d].length === 0) { _airSchedule[d].push('activity:' + name); placed++; }
      });
      if (placed < n) {
        allDows.forEach(function(d) {
          if (placed >= n) return;
          var slots = _airSchedule[d];
          if (slots.some(function(s){ return s.startsWith('train'); }) && slots.indexOf('activity:'+name) === -1 && slots.length < 3) {
            slots.push('activity:' + name); placed++;
          }
        });
      }
    });
  }
}

function _renderManualSchedule() {
  var el = document.getElementById('manualSchedContainer');
  if (!el) return;
  var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var dowFull = { Mon:'Lunes', Tue:'Martes', Wed:'Miércoles', Thu:'Jueves', Fri:'Viernes', Sat:'Sábado', Sun:'Domingo' };
  var ACT_EMOJI = Object.assign({ Correr:'🏃', Bici:'🚴', Caminata:'🚶', HIIT:'🔥', Natación:'🏊', Pilates:'🧘', Fútbol:'⚽', Tenis:'🎾', Pádel:'🏓', Otro:'🏅' }, window._airCustomEmojis || {});
  // (función usada por _renderManualWizStep, no duplicar con _renderManualCalUI)

  function _chipHtml(val, d) {
    var isGym = val.startsWith('train');
    var dayIdx = isGym ? parseInt(val.split(':')[1]) : -1;
    var actName = isGym ? '' : val.split(':')[1];
    var label = isGym ? ('🏋️ ' + (_wizardDays[dayIdx] ? _wizardDays[dayIdx].name : 'Gym')) : ((ACT_EMOJI[actName] || '⚡') + ' ' + actName);
    var color = isGym ? 'var(--accent)' : 'var(--green)';
    var bg    = isGym ? 'rgba(77,138,255,0.14)' : 'rgba(50,220,140,0.12)';
    var border= isGym ? 'rgba(77,138,255,0.45)' : 'rgba(50,220,140,0.38)';
    return '<div class="man-chip" draggable="true" data-dow="'+d+'" data-val="'+val+'" '
      + 'style="display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:20px;'
      + 'border:1.5px solid '+border+';background:'+bg+';cursor:grab;user-select:none;'
      + 'font-size:12px;font-weight:700;color:'+color+';white-space:nowrap">'+label+'</div>';
  }

  var rowsHtml = allDows.map(function(d) {
    var slots = _airSchedule[d] || [];
    var isRest = slots.length === 0;
    var chips = slots.map(function(v) { return _chipHtml(v, d); }).join('');
    return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);min-height:50px">'
      + '<div style="width:78px;flex-shrink:0;font-size:13px;font-weight:700;color:'+(isRest?'var(--text3)':'var(--text)')+'">'+dowFull[d]+'</div>'
      + '<div class="man-drop-zone" data-dow="'+d+'" '
        + 'style="display:flex;align-items:center;gap:6px;flex:1;flex-wrap:wrap;min-height:36px;padding:3px 6px;'
        + 'border-radius:10px;border:1.5px dashed '+(isRest?'var(--border)':'transparent')+';'
        + 'background:'+(isRest?'var(--bg4)':'transparent')+';transition:all 0.15s">'
        + (isRest ? '<span style="font-size:11px;color:var(--text3)">😴 Descanso</span>' : chips)
      + '</div>'
      + '</div>';
  }).join('');

  el.innerHTML = '<div style="font-size:11px;color:var(--text3);margin-bottom:12px">Arrastrá los chips para moverlos entre días. Días sin actividad = descanso.</div>'
    + '<div id="manSchedRows">'+rowsHtml+'</div>';

  // Drag & drop
  var dragVal = null, dragFromDow = null;
  el.querySelectorAll('.man-chip').forEach(function(chip) {
    chip.addEventListener('dragstart', function(e) {
      dragVal = chip.dataset.val; dragFromDow = chip.dataset.dow;
      chip.style.opacity = '0.35';
      e.dataTransfer.effectAllowed = 'move';
      el.querySelectorAll('.man-drop-zone').forEach(function(z) {
        if (z.dataset.dow !== dragFromDow) { z.style.borderColor='rgba(77,138,255,0.35)'; z.style.background='rgba(77,138,255,0.04)'; }
      });
    });
    chip.addEventListener('dragend', function() {
      chip.style.opacity = '';
      el.querySelectorAll('.man-drop-zone').forEach(function(z){ z.style.borderColor=''; z.style.background=''; });
      dragVal = null; dragFromDow = null;
      _renderManualSchedule();
    });
  });
  el.querySelectorAll('.man-drop-zone').forEach(function(zone) {
    zone.addEventListener('dragover', function(e) { e.preventDefault(); zone.style.background='rgba(77,138,255,0.10)'; zone.style.borderColor='var(--accent)'; zone.style.borderStyle='dashed'; });
    zone.addEventListener('dragleave', function() { zone.style.background=''; zone.style.borderColor=''; });
    zone.addEventListener('drop', function(e) {
      e.preventDefault(); zone.style.background=''; zone.style.borderColor='';
      var toDow = zone.dataset.dow;
      if (!dragFromDow || !dragVal || toDow === dragFromDow) return;
      var fromSlots = _airSchedule[dragFromDow] || [];
      var toSlots = (_airSchedule[toDow] || []).slice();
      if (toSlots.some(function(v){ return v === dragVal; })) { showToast('Ya está en ese día'); return; }
      if (dragVal.startsWith('train') && toSlots.some(function(v){ return v.startsWith('train'); })) { showToast('Ya hay Gym ese día'); return; }
      if (toSlots.length >= 3) { showToast('Máximo 3 actividades por día'); return; }
      _airSchedule[dragFromDow] = fromSlots.filter(function(v){ return v !== dragVal; });
      toSlots.push(dragVal);
      _airSchedule[toDow] = toSlots;
      _renderManualSchedule();
    });
  });
  // Touch
  (function() {
    var tChip=null, tClone=null, tFromDow=null;
    el.querySelectorAll('.man-chip').forEach(function(chip) {
      chip.addEventListener('touchstart', function() {
        tChip=chip; tFromDow=chip.dataset.dow;
        var r=chip.getBoundingClientRect();
        tClone=chip.cloneNode(true);
        tClone.style.cssText='position:fixed;pointer-events:none;z-index:9999;opacity:0.85;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;';
        document.body.appendChild(tClone);
        chip.style.opacity='0.3';
      },{passive:true});
    });
    document.addEventListener('touchmove', function(e) {
      if (!tClone) return; e.preventDefault();
      var t=e.touches[0];
      tClone.style.left=(t.clientX-tClone.offsetWidth/2)+'px';
      tClone.style.top=(t.clientY-20)+'px';
      el.querySelectorAll('.man-drop-zone').forEach(function(z){ z.style.background=''; z.style.borderColor=''; });
      tClone.style.display='none';
      var under=document.elementFromPoint(t.clientX,t.clientY);
      tClone.style.display='';
      if (under) { var zone=under.closest('.man-drop-zone'); if (zone && zone.dataset.dow!==tFromDow){ zone.style.background='rgba(77,138,255,0.10)'; zone.style.borderColor='var(--accent)'; } }
    },{passive:false});
    document.addEventListener('touchend', function(e) {
      if (!tChip||!tClone) return;
      var t=e.changedTouches[0];
      tClone.style.display='none';
      var under=document.elementFromPoint(t.clientX,t.clientY);
      tClone.style.display='';
      if (under) {
        var zone=under.closest('.man-drop-zone');
        if (zone && zone.dataset.dow!==tFromDow) {
          var toDow=zone.dataset.dow, val=tChip.dataset.val;
          var fromSlots=_airSchedule[tFromDow]||[];
          var toSlots=(_airSchedule[toDow]||[]).slice();
          if (!toSlots.some(function(v){return v===val;}) && !(val.startsWith('train')&&toSlots.some(function(v){return v.startsWith('train');})) && toSlots.length<3) {
            _airSchedule[tFromDow]=fromSlots.filter(function(v){return v!==val;});
            toSlots.push(val); _airSchedule[toDow]=toSlots;
          }
        }
      }
      tChip.style.opacity=''; tClone.remove(); tChip=null; tClone=null; tFromDow=null;
      el.querySelectorAll('.man-drop-zone').forEach(function(z){ z.style.background=''; z.style.borderColor=''; });
 _renderManualSchedule();
    });
  })();
}

