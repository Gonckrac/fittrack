// ─── SUPPLEMENTS ──────────────────────────────────────────────────
function renderSupps() {
  const taken = state[TODAY].supps || {};
  const groups = {morning: document.getElementById('suppsMorning'), noon: document.getElementById('suppsNoon'), night: document.getElementById('suppsNight')};
  Object.values(groups).forEach(g => g.innerHTML = '');

  const allSupps = getDynamicSupps();
  const todaySupps = allSupps.filter(s => isSuppActiveToday(s));

  const hasSupps = allSupps.length > 0;
  const suppTab = document.getElementById('tabSupps');
if (suppTab) suppTab.style.display = ''; // siempre visible
const homeSuppCard = document.getElementById('homeSuppCard');
  const kcalCard = document.getElementById('dayKcalCard');
  if (kcalCard) kcalCard.style.display = 'none';
  if (!hasSupps) {
    if (homeSuppCard) homeSuppCard.style.display = 'none';
    var suppValEl = document.getElementById('daySuppScore');
    var suppStEl  = document.getElementById('daySuppStatus');
    if (suppValEl) { suppValEl.textContent = 'Ninguno'; suppValEl.style.color = 'var(--text3)'; suppValEl.style.fontSize = '10px'; }
    if (suppStEl)  { suppStEl.textContent = 'sin cargar'; suppStEl.style.color = 'var(--text3)'; }
  } else {
    if (homeSuppCard) homeSuppCard.style.display = '';
  }  // Secciones de horario — ocultar todo si no hay suplementos
  const sectionMorning = document.getElementById('suppsSectionMorning');
  const sectionNoon    = document.getElementById('suppsSectionNoon');
  const sectionNight   = document.getElementById('suppsSectionNight');
  const emptySupps     = document.getElementById('suppsEmpty');

if (!hasSupps) {
  if (sectionMorning) sectionMorning.style.display = 'none';
  if (sectionNoon)    sectionNoon.style.display    = 'none';
  if (sectionNight)   sectionNight.style.display   = 'none';
  if (emptySupps) {
    emptySupps.style.display = '';
    emptySupps.innerHTML =
      '<div style="text-align:center;padding:40px 20px">' +
        '<div style="font-size:40px;margin-bottom:12px">💊</div>' +
        '<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px">Todavía no agregaste suplementos</div>' +
        '<div style="font-size:12px;color:var(--text3);margin-bottom:20px;line-height:1.6">Podés trackear tus suplementos diarios y ver tu adherencia a lo largo del tiempo.</div>' +
        '<button class="btn btn-primary" onclick="openSuppSetup()" style="margin:0 auto">+ Agregar suplementos</button>'  +
      '</div>';
  }
  document.getElementById('suppDoneCount').textContent = '0';
  document.getElementById('suppTotal').textContent     = '0';
  document.getElementById('suppBar').style.width       = '0%';
  return;
}

  if (sectionMorning) sectionMorning.style.display = '';
  if (sectionNight)   sectionNight.style.display   = '';
  if (emptySupps)     emptySupps.style.display      = 'none';

  let doneCount = 0;
  todaySupps.forEach(s => {
    if (taken[s.id]) doneCount++;
    const div = document.createElement('div');
div.className = 'supp-item ' + (taken[s.id] ? 'taken' : '');
    div.onclick = (e) => { e.stopPropagation(); toggleSupp(s.id); };
    div.style.cursor = 'pointer';
    const badge = s.everOther ? '<span style="font-size:9px;color:var(--accent);background:rgba(77,138,255,0.15);border-radius:4px;padding:1px 5px;margin-left:4px">día por medio</span>' : '';
    div.innerHTML = `
      <div class="supp-check" style="pointer-events:none">${taken[s.id]?'✓':''}</div>
      <div class="supp-info" style="pointer-events:none">
        <div class="supp-name">${s.name}${badge}</div>
        <div class="supp-dose">${s.dose}</div>
      </div>
      <div class="supp-time" style="pointer-events:none">${s.time}</div>`;
    groups[s.group].appendChild(div);
  });

  // Ocultar secciones que no tienen suplementos
  if (sectionNoon) sectionNoon.style.display = groups.noon.children.length > 0 ? '' : 'none';
  if (sectionMorning) sectionMorning.style.display = groups.morning.children.length > 0 ? '' : 'none';
  if (sectionNight)   sectionNight.style.display   = groups.night.children.length > 0  ? '' : 'none';

  document.getElementById('suppDoneCount').textContent = doneCount;
  document.getElementById('suppTotal').textContent = todaySupps.length;
  document.getElementById('suppBar').style.width = todaySupps.length > 0 ? Math.round(doneCount/todaySupps.length*100) + '%' : '0%';
}

function toggleSupp(id) {
  haptic('light');
  if (!state[TODAY].supps) state[TODAY].supps = {};
  state[TODAY].supps[id] = !state[TODAY].supps[id];
  saveState(state);
  renderSupps();
  renderHome();
  if (state[TODAY].supps[id]) {
    var todaySupps = getDynamicSupps().filter(function(s) { return isSuppActiveToday(s); });
    var taken = state[TODAY].supps;
    var doneCount = todaySupps.filter(function(s) { return taken[s.id]; }).length;
    if (doneCount === todaySupps.length && todaySupps.length > 0) {
      celebrate('suppAll', true);
      showToast('🏆 ¡Todos los suplementos del día!', true);
    } else {
      showToast('✓ Suplemento marcado ✓');
      celebrate('supp');
    }
  }
}
// ─── SUPLEMENTOS — BOTTOM SHEET (reemplaza el hack del wizard) ──────
var _suppSheetList = [];

function openSuppSetup() {
  // Clonar lista actual de suplementos para edición sin afectar el state hasta Guardar
  _suppSheetList = (state.config && state.config.supps)
    ? state.config.supps.map(function(s){ return Object.assign({}, s); })
    : [];

  var existing = document.getElementById('suppSheet');
  if (existing) existing.remove();

  var sheet = document.createElement('div');
  sheet.id = 'suppSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:flex-end;justify-content:center';

  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px;margin:0 auto;max-height:88vh;overflow-y:auto">' +
      '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">' +
        '<div style="font-size:15px;font-weight:700;color:var(--text)">💊 Mis suplementos</div>' +
        '<button onclick="document.getElementById(\'suppSheet\').remove()" style="background:none;border:none;color:var(--text3);font-size:20px;cursor:pointer;padding:0">✕</button>' +
      '</div>' +
      '<div id="suppSheetList" style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px"></div>' +
      '<button onclick="addSuppSheetRow()" style="width:100%;padding:10px;border:1.5px dashed var(--border);border-radius:10px;background:none;color:var(--text3);font-size:13px;cursor:pointer;margin-bottom:16px">+ Agregar suplemento</button>' +
      '<button onclick="saveSuppSheet()" class="btn btn-primary" style="width:100%">Guardar cambios</button>' +
    '</div>';

  sheet.addEventListener('click', function(ev){ if(ev.target===sheet) sheet.remove(); });
  document.body.appendChild(sheet);
  _renderSuppSheet();
}

function _renderSuppSheet() {
  var c = document.getElementById('suppSheetList');
  if (!c) return;
  c.innerHTML = '';
  _suppSheetList.forEach(function(s, i) {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:6px;align-items:center;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 12px';
    row.innerHTML =
      '<div style="flex:1;display:flex;flex-direction:column;gap:6px">' +
        '<input class="inp" style="margin:0;font-size:13px" placeholder="Nombre del suplemento" value="' + (s.name||'') + '" oninput="_suppSheetList[' + i + '].name=this.value">' +
        '<div style="display:flex;gap:6px">' +
          '<input class="inp" style="margin:0;flex:1;font-size:12px" placeholder="Dosis (ej: 5g)" value="' + (s.dose||'') + '" oninput="_suppSheetList[' + i + '].dose=this.value">' +
          '<select class="inp" style="margin:0;flex:1;font-size:12px" onchange="_suppSheetList[' + i + '].time=this.value">' +
            '<option ' + (s.time==='morning'?'selected':'') + ' value="morning">☀️ Mañana</option>' +
            '<option ' + (s.time==='noon'?'selected':'') + ' value="noon">🌤 Mediodía</option>' +
            '<option ' + (s.time==='night'?'selected':'') + ' value="night">🌙 Noche</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<button onclick="_removeSuppSheetRow(' + i + ')" style="background:none;border:none;color:var(--red);font-size:18px;cursor:pointer;padding:4px;flex-shrink:0">✕</button>';
    c.appendChild(row);
  });
}

function addSuppSheetRow() {
  _suppSheetList.push({ id: 'supp_' + Date.now(), name: '', dose: '', time: 'morning' });
  _renderSuppSheet();
  // Hacer scroll al nuevo campo
  setTimeout(function(){
    var c = document.getElementById('suppSheetList');
    if (c) c.lastElementChild && c.lastElementChild.querySelector('input') && c.lastElementChild.querySelector('input').focus();
  }, 80);
}

function _removeSuppSheetRow(i) {
  _suppSheetList.splice(i, 1);
  _renderSuppSheet();
}

function saveSuppSheet() {
  var valid = _suppSheetList.filter(function(s){ return s.name && s.name.trim(); });
  // Asegurar que cada suplemento tenga un id único
  valid.forEach(function(s){
    if (!s.id) s.id = 'supp_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
  });
  if (!state.config) state.config = {};
  state.config.supps = valid;
  saveState(state);
  var sheet = document.getElementById('suppSheet');
  if (sheet) sheet.remove();
  renderSupps();
  renderHome();
  showToast('💊 Suplementos guardados ✓');
}