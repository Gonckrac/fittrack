// ─── ROUTINE EDITOR ──────────────────────────────────────────────
var _reCurrentDay = 0;
var _reDays = [];
var _reCycle = {};

function openRoutineEditor() {
  openRoutineEditorOnDay(0);
}
// Reset extras al abrir el editor
window._reSportExtras = {};
function openRoutineEditorOnDay(routineIdx) {
  var cfg = state.config || {};
  _reDays = JSON.parse(JSON.stringify(cfg.training || []));
  if (_reDays.length === 0) _reDays.push({name:'Día 1', exercises:[]});
  _reCycle = JSON.parse(JSON.stringify(cfg.cycle || {Mon:-1,Tue:-1,Wed:-1,Thu:-1,Fri:-1,Sat:-1,Sun:-1}));
  _reCurrentDay = (routineIdx >= 0 && routineIdx < _reDays.length) ? routineIdx : 0;
  var titleEl = document.getElementById('reModalDayName');
  if (titleEl) titleEl.textContent = _reDays[_reCurrentDay] ? _reDays[_reCurrentDay].name : 'Editar día';
  _reRenderDayOnly();
  document.getElementById('routineEditorModal').classList.add('open');
}

function reTab(tab) {
  document.getElementById('rePanelDays').style.display = tab==='days' ? '' : 'none';
  document.getElementById('rePanelCycle').style.display = tab==='cycle' ? '' : 'none';
  document.getElementById('retabDays').style.borderBottomColor = tab==='days' ? 'var(--accent)' : 'transparent';
  document.getElementById('retabDays').style.color = tab==='days' ? 'var(--accent)' : 'var(--text3)';
  document.getElementById('retabCycle').style.borderBottomColor = tab==='cycle' ? 'var(--accent)' : 'transparent';
  document.getElementById('retabCycle').style.color = tab==='cycle' ? 'var(--accent)' : 'var(--text3)';
  if (tab==='cycle') _reRenderCycle();
}

function _reRenderDayOnly() {
  var d = _reDays[_reCurrentDay];
  if (!d) return;
  var nameWrap = document.getElementById('reDayNameWrap');
  if (nameWrap) nameWrap.innerHTML = '<input class="inp" placeholder="Nombre del día" value="' + (d.name||'') + '" oninput="_reDays[_reCurrentDay].name=this.value;var t=document.getElementById(\'reModalDayName\');if(t)t.textContent=this.value" style="margin-bottom:0">';
  _reBuildExerciseListHtml();
}

// ─── LISTA DE EJERCICIOS (con soporte de superserie) ──────────────
// Recorre _reDays[_reCurrentDay].exercises y escribe #reExList directamente.
// Los ejercicios con ssGroup se agrupan en un bloque visual A+B con un
// único campo de descanso compartido (se guarda en la entrada 'a').
function _reBuildExerciseListHtml() {
  var d = _reDays[_reCurrentDay];
  var exercises = (d && d.exercises) || [];
  var exList = document.getElementById('reExList');
  if (!exList) return;
  if (!exercises.length) {
    exList.innerHTML = '<div style="color:var(--text3);font-size:12px;padding:12px 0;text-align:center">Sin ejercicios. Agregá uno ↓</div>';
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
      html += _reSupersetBlockHtml(aIdx, bIdx);
      return;
    }
    html += _reExerciseRowHtml(i);
  });
  exList.innerHTML = html;
}

function _reExerciseRowHtml(i) {
  var ex = _reDays[_reCurrentDay].exercises[i];
  return '<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">'
    +'<input class="inp" style="flex:2;margin-bottom:0;font-size:12px" placeholder="Ejercicio" value="'+(ex.name||'')+'" oninput="_reDays[_reCurrentDay].exercises['+i+'].name=this.value">'
    +'<input class="inp" style="width:44px;margin-bottom:0;font-size:13px;text-align:center;padding:8px 4px" placeholder="4" type="number" min="1" value="'+(ex.sets||3)+'" oninput="_reDays[_reCurrentDay].exercises['+i+'].sets=+this.value">'
    +'<input class="inp" style="width:60px;margin-bottom:0;font-size:12px;text-align:center" placeholder="8-12" value="'+(ex.reps||'8-12')+'" oninput="_reDays[_reCurrentDay].exercises['+i+'].reps=this.value">'
    +'<button onclick="_reRemoveExercise('+i+')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:16px;flex-shrink:0">✕</button>'
    +'</div>';
}

function _reSSExerciseRowHtml(i, letter) {
  var ex = _reDays[_reCurrentDay].exercises[i];
  return '<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">'
    +'<span style="font-size:11px;font-weight:700;color:var(--accent);width:14px;flex-shrink:0">'+letter+'</span>'
    +'<input class="inp" style="flex:2;margin-bottom:0;font-size:12px" placeholder="Ejercicio" value="'+(ex.name||'')+'" oninput="_reDays[_reCurrentDay].exercises['+i+'].name=this.value">'
    +'<input class="inp" style="width:44px;margin-bottom:0;font-size:13px;text-align:center;padding:8px 4px" placeholder="4" type="number" min="1" value="'+(ex.sets||3)+'" oninput="_reDays[_reCurrentDay].exercises['+i+'].sets=+this.value">'
    +'<input class="inp" style="width:60px;margin-bottom:0;font-size:12px;text-align:center" placeholder="8-12" value="'+(ex.reps||'8-12')+'" oninput="_reDays[_reCurrentDay].exercises['+i+'].reps=this.value">'
    +'</div>';
}

function _reSupersetBlockHtml(aIdx, bIdx) {
  var exA = _reDays[_reCurrentDay].exercises[aIdx];
  var restMin = (typeof exA.ssRestSec === 'number' && exA.ssRestSec > 0) ? (exA.ssRestSec/60) : '';
  return '<div style="border:1.5px solid var(--accent);border-radius:10px;padding:8px;margin-bottom:8px;background:rgba(77,138,255,0.05)">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
    +   '<span style="font-size:11px;font-weight:700;color:var(--accent)">⚡ Superserie</span>'
    +   '<button onclick="_reRemoveSuperset(\''+exA.ssGroup+'\')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:11px">✕ Quitar superserie</button>'
    + '</div>'
    + _reSSExerciseRowHtml(aIdx, 'A')
    + _reSSExerciseRowHtml(bIdx, 'B')
    + '<div style="display:flex;align-items:center;gap:6px;margin-top:2px">'
    +   '<span style="font-size:11px;color:var(--text3)">⏱ Descanso total del ciclo:</span>'
    +   '<input class="inp" style="width:56px;margin-bottom:0;font-size:12px;text-align:center" type="number" min="0" step="0.5" placeholder="ej: 3" value="'+restMin+'" oninput="_reSetSSRest(\''+exA.ssGroup+'\',this.value)">'
    +   '<span style="font-size:11px;color:var(--text3)">min</span>'
    + '</div>'
    + '</div>';
}

function _reSetSSRest(ssGroup, val) {
  var min = parseFloat(val);
  var secs = (isNaN(min) || min <= 0) ? null : Math.round(min*60);
  _reDays[_reCurrentDay].exercises.forEach(function(ex) {
    if (ex.ssGroup === ssGroup && ex.ssPart === 'a') ex.ssRestSec = secs;
  });
}

function _reRemoveExercise(i) {
  _reDays[_reCurrentDay].exercises.splice(i, 1);
  _reBuildExerciseListHtml();
}

function _reRemoveSuperset(ssGroup) {
  _reDays[_reCurrentDay].exercises = _reDays[_reCurrentDay].exercises.filter(function(e) { return e.ssGroup !== ssGroup; });
  _reBuildExerciseListHtml();
}

function reAddExercise() {
  if (!_reDays[_reCurrentDay].exercises) _reDays[_reCurrentDay].exercises = [];
  _reDays[_reCurrentDay].exercises.push({name:'',sets:3,reps:'8-12'});
  _reBuildExerciseListHtml();
}

function reAddSuperset() {
  if (!_reDays[_reCurrentDay].exercises) _reDays[_reCurrentDay].exercises = [];
  var ssGroup = 'ss_' + Date.now();
  _reDays[_reCurrentDay].exercises.push({name:'', sets:3, reps:'8-12', ssGroup:ssGroup, ssPart:'a', ssRestSec:null});
  _reDays[_reCurrentDay].exercises.push({name:'', sets:3, reps:'8-12', ssGroup:ssGroup, ssPart:'b'});
  _reBuildExerciseListHtml();
}

function _reRenderDays() {
  var tabsHtml = '';
  _reDays.forEach(function(d, i) {
    var active = i===_reCurrentDay;
    var tabLabel = d.isSport ? ((typeof _getSportEmoji==='function'?_getSportEmoji(d.sportName||d.name):'⚽') + ' ' + (d.sportName||d.name||'Deporte')) : d.name;
    tabsHtml += '<button style="padding:5px 12px;border-radius:20px;border:1px solid '+(active?'var(--accent)':'var(--border)')+';background:'+(active?'rgba(77,138,255,0.15)':'var(--bg3)')+';color:'+(active?'var(--accent)':'var(--text2)')+';font-size:11px;font-weight:700;cursor:pointer" onclick="_reCurrentDay='+i+';_reRenderDays()">'+tabLabel+'</button>';
  });
  document.getElementById('reDayTabs').innerHTML = tabsHtml;

  var d = _reDays[_reCurrentDay];
  var isSport = !!d.isSport;
  var sportEmojiFn = (typeof _getSportEmoji === 'function') ? _getSportEmoji : function(){ return '⚽'; };

  var toggleHtml = '<div style="display:flex;gap:6px;margin-bottom:10px">'
    + '<button onclick="_reDays[_reCurrentDay].isSport=false;if(!_reDays[_reCurrentDay].exercises)_reDays[_reCurrentDay].exercises=[];_reRenderDays()" style="flex:1;padding:6px;border-radius:8px;border:1.5px solid '+(isSport?'var(--border)':'var(--accent)')+';background:'+(isSport?'var(--bg3)':'rgba(77,138,255,0.12)')+';color:'+(isSport?'var(--text3)':'var(--accent)')+';font-size:11px;font-weight:700;cursor:pointer">🏋️ Entrenamiento</button>'
    + '<button onclick="_reDays[_reCurrentDay].isSport=true;_reDays[_reCurrentDay].exercises=[];_reRenderDays()" style="flex:1;padding:6px;border-radius:8px;border:1.5px solid '+(isSport?'var(--accent)':'var(--border)')+';background:'+(isSport?'rgba(77,200,120,0.12)':'var(--bg3)')+';color:'+(isSport?'var(--green)':'var(--text3)')+';font-size:11px;font-weight:700;cursor:pointer">⚽ Deporte</button>'
    + '</div>';

  if (isSport) {
    var sportName = d.sportName || '';
    var SE = (typeof SPORT_EMOJIS !== 'undefined') ? SPORT_EMOJIS : {};
    var chips = Object.keys(SE).map(function(sp){
      var active2 = sportName === sp;
      return '<button onclick="_reDays[_reCurrentDay].sportName=\''+sp+'\';_reDays[_reCurrentDay].name=\''+sp+'\';_reRenderDays()" style="padding:4px 10px;border-radius:20px;border:1px solid '+(active2?'var(--green)':'var(--border)')+';background:'+(active2?'rgba(77,200,120,0.15)':'var(--bg3)')+';color:'+(active2?'var(--green)':'var(--text2)')+';font-size:11px;cursor:pointer">'+SE[sp]+' '+sp+'</button>';
    }).join('');
    document.getElementById('reDayNameWrap').innerHTML = toggleHtml
      + '<input class="inp" placeholder="Nombre del deporte (ej: Tenis, Fútbol…)" value="'+sportName+'" style="margin-bottom:8px" oninput="_reDays[_reCurrentDay].sportName=this.value;_reDays[_reCurrentDay].name=this.value||\'Deporte\';_reRenderDays()">'
      + '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:6px">'+chips+'</div>';
    document.getElementById('reExList').innerHTML = '<div style="color:var(--text3);font-size:12px;text-align:center;padding:16px;border:1px dashed var(--border);border-radius:8px">'+sportEmojiFn(sportName)+' Día de deporte libre.<br>Se registra como actividad.</div>';
  } else {
    document.getElementById('reDayNameWrap').innerHTML = toggleHtml
      + '<input class="inp" placeholder="Nombre del día (ej: Push, Piernas…)" value="'+d.name+'" oninput="_reDays[_reCurrentDay].name=this.value;_reRenderDays()" style="margin-bottom:0">';
    _reBuildExerciseListHtml();
  }
}

// Almacena actividades extra por día: { Mon: ['Pilates','Natación'], ... }
if (!window._reSportExtras) window._reSportExtras = {};

function _reRenderCycle() {
  var dowKeys = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var dowLabels = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
  var opts = '<option value="-1">🛋 Descanso</option><option value="sport">⚽ Deporte/Actividad</option>';
  _reDays.forEach(function(d, i) { opts += '<option value="'+i+'">'+d.name+'</option>'; });

  // Inicializar extras desde sportNames guardados
  var curSportNames = (state.config && state.config.sportNames) || {};
  dowKeys.forEach(function(key) {
    if (window._reSportExtras[key] === undefined) {
      var saved = curSportNames[key] || '';
      window._reSportExtras[key] = saved ? saved.split('+').filter(Boolean) : [];
    }
  });

  var html = '';
  dowKeys.forEach(function(key, i) {
    html += '<div class="cycle-row"><div class="cycle-day-lbl">'+dowLabels[i]+'</div>'
      +'<select class="cycle-sel" id="reCyc-'+key+'" onchange="_reCycle[\''+key+'\']=this.value;_reRenderCycle()">'+opts+'</select>'
      +'<div id="reCycExtra-'+key+'" style="margin-top:4px"></div></div>';
  });
  document.getElementById('reCycleBuilder').innerHTML = html;

  dowKeys.forEach(function(key) {
    var sel = document.getElementById('reCyc-'+key);
    if (!sel) return;
    var curVal = (_reCycle[key] !== undefined && _reCycle[key] !== null) ? _reCycle[key] : -1;
    sel.value = curVal;
    var extraDiv = document.getElementById('reCycExtra-'+key);
    if (!extraDiv) return;
    var isGymDay = curVal !== -1 && curVal !== '-1' && String(curVal) !== 'sport';
    var isSportOnly = String(curVal) === 'sport';

    if (isSportOnly) {
      // Solo deporte: campo nombre principal
      extraDiv.innerHTML = _reRenderExtrasHtml(key, true);
    } else if (isGymDay) {
      // Día de gym: permitir agregar actividades extra
      extraDiv.innerHTML = _reRenderExtrasHtml(key, false);
    } else {
      extraDiv.innerHTML = '';
    }
  });
}

function _reRenderExtrasHtml(key, isMainSport) {
  var extras = window._reSportExtras[key] || [];
  var SE = (typeof SPORT_EMOJIS !== 'undefined') ? SPORT_EMOJIS : {};
  var title = isMainSport
    ? '<div style="font-size:10px;color:var(--text3);margin-bottom:4px">Actividades del día (podés agregar varias)</div>'
    : '<div style="font-size:10px;color:var(--text3);margin-bottom:4px">+ Actividades extra (opcional)</div>';
  var chips = extras.map(function(name, i) {
    var emoji = SE[name] || '🏅';
    return '<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:20px;background:rgba(77,200,120,0.12);border:1px solid rgba(77,200,120,0.35);font-size:11px;color:var(--green);margin:2px">'
      + emoji + ' ' + name
      + '<button onclick="window._reSportExtras[\''+key+'\'].splice('+i+',1);_reRenderCycle()" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:12px;line-height:1;padding:0 0 0 3px">✕</button>'
      + '</span>';
  }).join('');
  var sportChips = Object.keys(SE).map(function(sp) {
    return '<button onclick="_reAddSportExtra(\''+key+'\',\''+sp+'\')" style="padding:3px 8px;border-radius:20px;border:1px solid var(--border);background:var(--bg3);color:var(--text2);font-size:10px;cursor:pointer;margin:2px">'+SE[sp]+' '+sp+'</button>';
  }).join('');
  return title
    + (chips ? '<div style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:6px">'+chips+'</div>' : '')
    + '<div style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:4px">'+sportChips+'</div>'
    + '<input class="inp" id="reCycCustomSport-'+key+'" placeholder="Otro (nombre libre)" style="font-size:11px;margin-bottom:0" onkeydown="if(event.key===\'Enter\'){_reAddCustomSportExtra(\''+key+'\');}">'
    + '<button onclick="_reAddCustomSportExtra(\''+key+'\')" style="width:100%;padding:4px;border-radius:6px;border:1px dashed var(--border);background:none;color:var(--text2);font-size:10px;cursor:pointer;margin-top:3px">+ Agregar</button>';
}

function _reAddSportExtra(key, name) {
  if (!window._reSportExtras[key]) window._reSportExtras[key] = [];
  if (window._reSportExtras[key].indexOf(name) === -1) window._reSportExtras[key].push(name);
  _reRenderCycle();
}

function _reAddCustomSportExtra(key) {
  var inp = document.getElementById('reCycCustomSport-'+key);
  if (!inp) return;
  var name = inp.value.trim();
  if (!name) return;
  if (!window._reSportExtras[key]) window._reSportExtras[key] = [];
  if (window._reSportExtras[key].indexOf(name) === -1) window._reSportExtras[key].push(name);
  inp.value = '';
  _reRenderCycle();
}

function reAddDay() {
  _showNewDayWizard();
}

function _showNewDayWizard() {
  var SE = (typeof SPORT_EMOJIS !== 'undefined') ? SPORT_EMOJIS : {};
  var chips = Object.keys(SE).map(function(sp){
    return '<button onclick="_nwSelectSport(\''+sp+'\')" id="nwChip_'+sp+'" style="padding:4px 10px;border-radius:20px;border:1px solid var(--border);background:var(--bg3);color:var(--text2);font-size:11px;cursor:pointer">'+SE[sp]+' '+sp+'</button>';
  }).join('');

  var overlay = document.createElement('div');
  overlay.id = 'newDayWizard';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
  overlay.innerHTML = ''
    + '<div style="background:var(--bg2);border-radius:16px;padding:20px;width:100%;max-width:380px;max-height:80vh;overflow-y:auto">'
    +   '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
    +     '<span style="font-weight:700;font-size:15px">➕ Nuevo día</span>'
    +     '<button onclick="document.getElementById(\'newDayWizard\').remove()" style="background:none;border:none;color:var(--text3);font-size:20px;cursor:pointer;line-height:1">×</button>'
    +   '</div>'
    +   '<div style="display:flex;gap:6px;margin-bottom:14px">'
    +     '<button id="nwBtnGym" onclick="_nwSetType(\'gym\')" style="flex:1;padding:8px;border-radius:8px;border:1.5px solid var(--accent);background:rgba(77,138,255,0.12);color:var(--accent);font-size:12px;font-weight:700;cursor:pointer">🏋️ Entrenamiento</button>'
    +     '<button id="nwBtnSport" onclick="_nwSetType(\'sport\')" style="flex:1;padding:8px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg3);color:var(--text3);font-size:12px;font-weight:700;cursor:pointer">⚽ Deporte</button>'
    +   '</div>'
    +   '<div id="nwGymBody">'
    +     '<input id="nwName" class="inp" placeholder="Nombre del día (ej: Push, Piernas…)" style="margin-bottom:10px">'
    +     '<div id="nwExList"></div>'
    +     '<div style="display:flex;gap:6px;margin-top:4px">'
    +       '<button onclick="_nwAddEx()" style="flex:1;padding:8px;border-radius:8px;border:1px dashed var(--accent);background:none;color:var(--accent);font-size:12px;cursor:pointer">+ Ejercicio</button>'
    +       '<button onclick="_nwAddSuperset()" style="flex:1;padding:8px;border-radius:8px;border:1px dashed var(--green);background:none;color:var(--green);font-size:12px;cursor:pointer">⚡ + Superserie</button>'
    +     '</div>'
    +   '</div>'
    +   '<div id="nwSportBody" style="display:none">'
    +     '<input id="nwSportName" class="inp" placeholder="Nombre del deporte (ej: Tenis, Fútbol…)" style="margin-bottom:8px">'
    +     '<div style="display:flex;flex-wrap:wrap;gap:5px">'+chips+'</div>'
    +   '</div>'
    +   '<button onclick="_nwConfirm()" style="width:100%;padding:10px;border-radius:10px;background:var(--accent);color:#fff;font-weight:700;font-size:13px;border:none;cursor:pointer;margin-top:14px">✓ Agregar día</button>'
    + '</div>';

  document.body.appendChild(overlay);
  window._nwType = 'gym';
  window._nwExercises = [];
}

function _nwSetType(type) {
  window._nwType = type;
  var isGym = type === 'gym';
  var btnGym = document.getElementById('nwBtnGym');
  var btnSport = document.getElementById('nwBtnSport');
  var gymBody = document.getElementById('nwGymBody');
  var sportBody = document.getElementById('nwSportBody');
  if (!btnGym) return;
  btnGym.style.borderColor = isGym ? 'var(--accent)' : 'var(--border)';
  btnGym.style.background = isGym ? 'rgba(77,138,255,0.12)' : 'var(--bg3)';
  btnGym.style.color = isGym ? 'var(--accent)' : 'var(--text3)';
  btnSport.style.borderColor = !isGym ? 'var(--green)' : 'var(--border)';
  btnSport.style.background = !isGym ? 'rgba(77,200,120,0.12)' : 'var(--bg3)';
  btnSport.style.color = !isGym ? 'var(--green)' : 'var(--text3)';
  gymBody.style.display = isGym ? '' : 'none';
  sportBody.style.display = isGym ? 'none' : '';
}

function _nwSelectSport(sp) {
  var nameEl = document.getElementById('nwSportName');
  if (nameEl) nameEl.value = sp;
  var SE = (typeof SPORT_EMOJIS !== 'undefined') ? SPORT_EMOJIS : {};
  Object.keys(SE).forEach(function(s){
    var c = document.getElementById('nwChip_'+s);
    if (!c) return;
    var active = s === sp;
    c.style.borderColor = active ? 'var(--green)' : 'var(--border)';
    c.style.background = active ? 'rgba(77,200,120,0.15)' : 'var(--bg3)';
    c.style.color = active ? 'var(--green)' : 'var(--text2)';
  });
}

function _nwAddEx() {
  if (!window._nwExercises) window._nwExercises = [];
  window._nwExercises.push({name:'', sets:3, reps:'8-12'});
  _nwRenderExList();
}

function _nwAddSuperset() {
  if (!window._nwExercises) window._nwExercises = [];
  var ssGroup = 'ss_' + Date.now();
  window._nwExercises.push({name:'', sets:3, reps:'8-12', ssGroup:ssGroup, ssPart:'a', ssRestSec:null});
  window._nwExercises.push({name:'', sets:3, reps:'8-12', ssGroup:ssGroup, ssPart:'b'});
  _nwRenderExList();
}

// Misma lógica de agrupamiento que _reBuildExerciseListHtml(), pero sobre
// window._nwExercises (lista del wizard "+ Nuevo día") en vez de _reDays.
function _nwRenderExList() {
  var exercises = window._nwExercises || [];
  var el = document.getElementById('nwExList');
  if (!el) return;
  if (!exercises.length) {
    el.innerHTML = '<div style="color:var(--text3);font-size:12px;padding:8px 0;text-align:center">Sin ejercicios. Agregá uno ↑</div>';
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
      html += _nwSupersetBlockHtml(aIdx, bIdx);
      return;
    }
    html += _nwExerciseRowHtml(i);
  });
  el.innerHTML = html;
}

function _nwExerciseRowHtml(i) {
  var ex = window._nwExercises[i];
  return '<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">'
    +'<input class="inp" style="flex:2;margin-bottom:0;font-size:12px" placeholder="Ejercicio" value="'+(ex.name||'')+'" oninput="window._nwExercises['+i+'].name=this.value">'
    +'<input class="inp" style="width:44px;margin-bottom:0;font-size:12px;text-align:center" placeholder="4" type="number" min="1" value="'+(ex.sets||3)+'" oninput="window._nwExercises['+i+'].sets=+this.value">'
    +'<input class="inp" style="width:60px;margin-bottom:0;font-size:12px;text-align:center" placeholder="8-12" value="'+(ex.reps||'8-12')+'" oninput="window._nwExercises['+i+'].reps=this.value">'
    +'<button onclick="_nwRemoveExercise('+i+')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:16px;flex-shrink:0">✕</button>'
    +'</div>';
}

function _nwSSExerciseRowHtml(i, letter) {
  var ex = window._nwExercises[i];
  return '<div style="display:flex;gap:6px;margin-bottom:6px;align-items:center">'
    +'<span style="font-size:11px;font-weight:700;color:var(--accent);width:14px;flex-shrink:0">'+letter+'</span>'
    +'<input class="inp" style="flex:2;margin-bottom:0;font-size:12px" placeholder="Ejercicio" value="'+(ex.name||'')+'" oninput="window._nwExercises['+i+'].name=this.value">'
    +'<input class="inp" style="width:44px;margin-bottom:0;font-size:12px;text-align:center" placeholder="4" type="number" min="1" value="'+(ex.sets||3)+'" oninput="window._nwExercises['+i+'].sets=+this.value">'
    +'<input class="inp" style="width:60px;margin-bottom:0;font-size:12px;text-align:center" placeholder="8-12" value="'+(ex.reps||'8-12')+'" oninput="window._nwExercises['+i+'].reps=this.value">'
    +'</div>';
}

function _nwSupersetBlockHtml(aIdx, bIdx) {
  var exA = window._nwExercises[aIdx];
  var restMin = (typeof exA.ssRestSec === 'number' && exA.ssRestSec > 0) ? (exA.ssRestSec/60) : '';
  return '<div style="border:1.5px solid var(--accent);border-radius:10px;padding:8px;margin-bottom:8px;background:rgba(77,138,255,0.05)">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
    +   '<span style="font-size:11px;font-weight:700;color:var(--accent)">⚡ Superserie</span>'
    +   '<button onclick="_nwRemoveSuperset(\''+exA.ssGroup+'\')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:11px">✕ Quitar superserie</button>'
    + '</div>'
    + _nwSSExerciseRowHtml(aIdx, 'A')
    + _nwSSExerciseRowHtml(bIdx, 'B')
    + '<div style="display:flex;align-items:center;gap:6px;margin-top:2px">'
    +   '<span style="font-size:11px;color:var(--text3)">⏱ Descanso total del ciclo:</span>'
    +   '<input class="inp" style="width:56px;margin-bottom:0;font-size:12px;text-align:center" type="number" min="0" step="0.5" placeholder="ej: 3" value="'+restMin+'" oninput="_nwSetSSRest(\''+exA.ssGroup+'\',this.value)">'
    +   '<span style="font-size:11px;color:var(--text3)">min</span>'
    + '</div>'
    + '</div>';
}

function _nwSetSSRest(ssGroup, val) {
  var min = parseFloat(val);
  var secs = (isNaN(min) || min <= 0) ? null : Math.round(min*60);
  (window._nwExercises || []).forEach(function(ex) {
    if (ex.ssGroup === ssGroup && ex.ssPart === 'a') ex.ssRestSec = secs;
  });
}

function _nwRemoveExercise(i) {
  window._nwExercises.splice(i, 1);
  _nwRenderExList();
}

function _nwRemoveSuperset(ssGroup) {
  window._nwExercises = (window._nwExercises || []).filter(function(e) { return e.ssGroup !== ssGroup; });
  _nwRenderExList();
}

function _nwConfirm() {
  var isSport = window._nwType === 'sport';
  var nameEl = document.getElementById(isSport ? 'nwSportName' : 'nwName');
  var name = nameEl ? nameEl.value.trim() : '';
  if (!name) { showToast('⚠ Ingresá un nombre'); return; }
  var newDay;
  if (isSport) {
    newDay = { name: name, isSport: true, sportName: name, exercises: [] };
  } else {
    newDay = { name: name, exercises: (window._nwExercises||[]).filter(function(e){ return e.name && e.name.trim(); }) };
  }
_reDays.push(newDay);
  _reCurrentDay = _reDays.length - 1;
  document.getElementById('newDayWizard').remove();
  saveRoutineEditor();
}

function reRemoveDay() {
  if (_reDays.length<=1) { showToast('⚠ Necesitás al menos 1 día'); return; }
  _reDays.splice(_reCurrentDay, 1);
  _reCurrentDay = Math.max(0, _reCurrentDay-1);
  _reRenderDays();
}

function saveRoutineEditor() {
  if (!state.config) state.config = {};

  state.config.training = _reDays.map(function(d) {
    var obj = { name: d.name, exercises: (d.exercises||[]).filter(function(e){return e.name&&e.name.trim();}) };
    if (d.isSport) { obj.isSport = true; obj.sportName = d.sportName || d.name; }
    return obj;
  });

  state.config.cycle = _reCycle;

  var dowKeys = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var sportNames = {};
  dowKeys.forEach(function(key) {
    var val = _reCycle[key];
    var extras = (window._reSportExtras && window._reSportExtras[key]) || [];
    if (val === 'sport') {
      sportNames[key] = extras.join('+');
    } else if (val !== null && val !== undefined && val !== -1 && val !== '-1') {
      var dIdx = parseInt(val);
      var d = _reDays[dIdx];
      if (d && d.isSport) {
        sportNames[key] = extras.length ? extras.join('+') : (d.sportName || d.name || '');
      } else if (extras.length) {
        sportNames[key] = extras.join('+');
      }
    }
  });
  state.config.sportNames = sportNames;
  window._reSportExtras = {};

  saveState(state);
  closeModal('routineEditorModal');

  if (typeof renderTraining === 'function') renderTraining();
  if (typeof renderRoutineCards === 'function') renderRoutineCards();
  if (typeof renderWeekStrip === 'function') renderWeekStrip();
  if (typeof renderHome === 'function') renderHome();
  if (typeof updateHeader === 'function') updateHeader();

  showToast('✓ Rutina guardada');
}
