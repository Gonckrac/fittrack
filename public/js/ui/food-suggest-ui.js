// ═══════════════════════════════════════════════════════════════════════════════
// FOOD SUGGESTION UI v2.0
// Drop-in replacement for food-suggest.js
// Integrates with: meal-engine.js + food-db.js
// ═══════════════════════════════════════════════════════════════════════════════

// ─── PREFERENCE OPTIONS ───────────────────────────────────────────────────────
const FS_ALLERGY_OPTS = [
  { id:'gluten',    label:'Gluten',        emoji:'🌾' },
  { id:'lacteos',   label:'Dairy',         emoji:'🥛' },
  { id:'huevo',     label:'Eggs',          emoji:'🥚' },
  { id:'pescado',   label:'Fish',          emoji:'🐟' },
  { id:'mani',      label:'Peanuts',       emoji:'🥜' },
  { id:'nueces',    label:'Tree Nuts',     emoji:'🌰' },
  { id:'soja',      label:'Soy/Tofu',      emoji:'🫘' },
  { id:'maiz',      label:'Corn',          emoji:'🌽' },
  { id:'mariscos',  label:'Shellfish',     emoji:'🦐' },
  { id:'cerdo',     label:'Pork',          emoji:'🐷' },
  { id:'azucar',    label:'Added Sugar',   emoji:'🍬' },
  { id:'alcohol',   label:'Alcohol',       emoji:'🍷' },
];
const FS_DISLIKE_OPTS = [
  { id:'batata',      label:'Sweet Potato', emoji:'🍠' },
  { id:'palta',       label:'Avocado',      emoji:'🥑' },
  { id:'papa',        label:'Potato',       emoji:'🥔' },
  { id:'banana',      label:'Banana',       emoji:'🍌' },
  { id:'pavo',        label:'Turkey',       emoji:'🦃' },
  { id:'pollo',       label:'Chicken',      emoji:'🍗' },
  { id:'pescado',     label:'Fish',         emoji:'🐟' },
  { id:'vegano',      label:'Vegan only',   emoji:'🥦' },
  { id:'carne',       label:'Red Meat',     emoji:'🥩' },
  { id:'cebolla',     label:'Onion/Garlic', emoji:'🧅' },
  { id:'brócoli',     label:'Broccoli',     emoji:'🥦' },
  { id:'espinaca',    label:'Spinach',      emoji:'🌿' },
  { id:'tofu',        label:'Tofu',         emoji:'🫘' },
  { id:'picante',     label:'Spicy',        emoji:'🌶️' },
  { id:'champignones',label:'Mushrooms',    emoji:'🍄' },
];

// ─── STATE ────────────────────────────────────────────────────────────────────
// ─── STATE ────────────────────────────────────────────────────────────────────
var _fsStagedIds   = new Set();  // indices of staged suggestions
var _fsStagedItems = [];         // packed strings pending batch-add
var _fsMeal      = 'all';var _fsAllergies = new Set();
var _fsDislikes  = new Set();
var _fsPrefsOpen = false;
var _fsOpenIdx   = null;
var _fsMealCount = 4; // Expected total meals today

// ─── OPEN / INIT ─────────────────────────────────────────────────────────────
function openFoodSuggest() {
  _fsMeal    = 'all';
  _fsOpenIdx = null;
  var prefs  = (state.config && state.config.foodPrefs) || {};
  _fsAllergies = new Set(prefs.allergies || []);
  _fsDislikes  = new Set(prefs.dislikes  || []);
  _fsPrefsOpen = false;
  document.getElementById('fsPrefsPanel').style.display = 'none';
  document.querySelectorAll('.fs-filter').forEach(function(b) {
    b.classList.toggle('active', b.dataset.meal === 'all');
  });
  _renderFsPrefs();
  _renderFoodSuggest();
  document.getElementById('foodSuggestModal').classList.add('open');
}

function fsSwitchMeal(meal, btn) {
  _fsMeal    = meal;
  _fsOpenIdx = null;
  document.querySelectorAll('.fs-filter').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  _renderFoodSuggest();
}

function fsTogglePrefs() {
  _fsPrefsOpen = !_fsPrefsOpen;
  document.getElementById('fsPrefsPanel').style.display = _fsPrefsOpen ? '' : 'none';
}

function fsToggleAllergy(id) {
  if (_fsAllergies.has(id)) _fsAllergies.delete(id); else _fsAllergies.add(id);
  _saveFsPrefs();
  _renderFsPrefs();
  _fsOpenIdx = null;
  _renderFoodSuggest();
}

function fsToggleDislike(id) {
  if (_fsDislikes.has(id)) _fsDislikes.delete(id); else _fsDislikes.add(id);
  _saveFsPrefs();
  _renderFsPrefs();
  _fsOpenIdx = null;
  _renderFoodSuggest();
}

function _saveFsPrefs() {
  if (!state.config) state.config = {};
  state.config.foodPrefs = { allergies: [..._fsAllergies], dislikes: [..._fsDislikes] };
  saveState(state);
}

function _renderFsPrefs() {
  var total = _fsAllergies.size + _fsDislikes.size;
  var btn = document.getElementById('fsPrefsBtn');
  if (btn) btn.innerHTML = '⚙ Preferences' + (total > 0 ? ' (' + total + ')' : '');
  var al = FS_ALLERGY_OPTS.map(function(o) {
    return '<button onclick="fsToggleAllergy(\'' + o.id + '\')" class="fs-pref-btn' +
      (_fsAllergies.has(o.id) ? ' active-allergy' : '') + '">' + o.emoji + ' ' + o.label + '</button>';
  }).join('');
  var dl = FS_DISLIKE_OPTS.map(function(o) {
    return '<button onclick="fsToggleDislike(\'' + o.id + '\')" class="fs-pref-btn' +
      (_fsDislikes.has(o.id) ? ' active-dislike' : '') + '">' + o.emoji + ' ' + o.label + '</button>';
  }).join('');
  var panel = document.getElementById('fsPrefsPanel');
  if (panel) panel.innerHTML =
    '<div style="font-size:10px;font-weight:700;color:var(--red);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">🚫 Allergies / Intolerances</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px">' + al + '</div>' +
    '<div style="font-size:10px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">😶 Don\'t Like</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:5px">' + dl + '</div>';
}

function fsTapCard(i) {
  _fsOpenIdx = (_fsOpenIdx === i) ? null : i;
  _renderFoodSuggest();
}

// ─── MAIN RENDER ─────────────────────────────────────────────────────────────
function _renderFoodSuggest() {
  // Get current targets and consumed foods from app state
  var targets  = getDynamicTargets();
  var todayFoods = (state[TODAY] && state[TODAY].foods) || [];

  // Normalize target fields — the new engine uses protein/carbs/fats keys
  var normalizedTargets = {
    kcal:    targets.kcal    || 2000,
    protein: targets.prot    || 150,
    carbs:   targets.carb    || 200,
    fats:    targets.fat     || 60,
  };

  // Normalize eaten foods to protein/carbs/fats keys
  var normalizedEaten = todayFoods.map(function(f) {
    return {
      kcal:    +(f.kcal   || ((f.prot||0)*4 + (f.carb||0)*4 + (f.fat||0)*9)),
      protein: +(f.prot   || f.protein || f.p || 0),
      carbs:   +(f.carb   || f.carbs   || f.c || 0),
      fats:    +(f.fat    || f.fats    || f.f || 0),
    };
  });

  // ── Run the meal suggestion engine ──────────────────────────────────────
  var engineResult = getMealSuggestions({
    dailyTargets: normalizedTargets,
    eaten:        normalizedEaten,
    mealSlot:     _fsMeal,
    allergies:    [..._fsAllergies],
    dislikes:     [..._fsDislikes],
    mealCount:    _fsMealCount,
  });

  var rem  = engineResult.remaining;
  var cons = engineResult.consumed;
  var budget = engineResult.slotBudget;

  // ── Render remaining macro pills ─────────────────────────────────────────
  var ms = document.getElementById('fsMacroStatus');
  if (ms) ms.innerHTML =
    '<div style="background:rgba(77,255,180,0.1);border:1px solid var(--green);border-radius:8px;padding:6px;text-align:center">' +
      '<div style="font-size:15px;font-weight:700;color:var(--green);font-family:\'Space Mono\',monospace">' + Math.round(rem.protein) + 'g</div>' +
      '<div style="font-size:9px;color:var(--text3);text-transform:uppercase">Protein left</div>' +
    '</div>' +
    '<div style="background:rgba(77,138,255,0.1);border:1px solid var(--accent);border-radius:8px;padding:6px;text-align:center">' +
      '<div style="font-size:15px;font-weight:700;color:var(--accent);font-family:\'Space Mono\',monospace">' + Math.round(rem.carbs) + 'g</div>' +
      '<div style="font-size:9px;color:var(--text3);text-transform:uppercase">Carbs left</div>' +
    '</div>' +
    '<div style="background:rgba(255,212,77,0.1);border:1px solid var(--yellow);border-radius:8px;padding:6px;text-align:center">' +
      '<div style="font-size:15px;font-weight:700;color:var(--yellow);font-family:\'Space Mono\',monospace">' + Math.round(rem.fats) + 'g</div>' +
      '<div style="font-size:9px;color:var(--text3);text-transform:uppercase">Fats left</div>' +
    '</div>' +
    '<div style="background:rgba(255,107,77,0.1);border:1px solid var(--red);border-radius:8px;padding:6px;text-align:center">' +
      '<div style="font-size:15px;font-weight:700;color:var(--red);font-family:\'Space Mono\',monospace">' + Math.round(rem.kcal) + '</div>' +
      '<div style="font-size:9px;color:var(--text3);text-transform:uppercase">Kcal left</div>' +
    '</div>';

  // ── Context banner ────────────────────────────────────────────────────────
  var sugg = document.getElementById('fsSuggestions');
  if (!sugg) return;

  var bannerHtml = '';
  var goalLabels = {
    cut_aggressive:'aggressive cut', cut:'cut', maintain:'maintain',
    lean_bulk:'lean bulk', bulk:'bulk'
  };
  var userGoalLabel = (state.config && state.config.goal) ? (goalLabels[state.config.goal] || 'your goal') : 'your goal';
  var slotLabel  = _fsMeal !== 'all' ? _fsMeal + ' (~' + Math.round(budget.kcal) + ' kcal)' : 'next meal (~' + Math.round(budget.kcal) + ' kcal)';

  if (engineResult.targetsComplete) {
    bannerHtml = '<div style="background:rgba(77,255,180,0.08);border:1px solid rgba(77,255,180,0.25);border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:11px;color:var(--green)">' +
      '✅ Daily calorie goal reached (' + normalizedTargets.kcal + ' kcal). Great work!' +
    '</div>';
  } else if (rem.kcal > 100) {
    bannerHtml = '<div style="background:rgba(77,138,255,0.08);border:1px solid rgba(77,138,255,0.25);border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:11px;color:var(--text2);line-height:1.7">' +
      '🎯 Goal: <strong>' + userGoalLabel + '</strong> · ' +
      '<strong style="color:var(--accent)">' + normalizedTargets.kcal + ' kcal/day</strong> · ' +
      normalizedTargets.protein + 'g P · ' + normalizedTargets.carbs + 'g C · ' + normalizedTargets.fats + 'g F<br>' +
      '📊 Ate today: <strong>' + Math.round(cons.kcal) + ' kcal</strong> · ' +
        Math.round(cons.protein) + 'g P · ' + Math.round(cons.carbs) + 'g C · ' + Math.round(cons.fats) + 'g F<br>' +
      '🍽 Suggestions calibrated for ' + slotLabel + ' based on remaining macros.' +
    '</div>';
  }

  // ── Render suggestion cards ───────────────────────────────────────────────
  var suggestions = engineResult.suggestions;
  if (!suggestions.length) {
    sugg.innerHTML = bannerHtml + '<div style="color:var(--text3);text-align:center;padding:24px">No results match your current preferences.</div>';
    return;
  }

  var mealEmoji = { breakfast:'🌅', lunch:'☀️', snack:'🍎', dinner:'🌙', post_workout:'⚡' };

  sugg.innerHTML = bannerHtml + suggestions.map(function(food, i) {
    var open = (_fsOpenIdx === i);

    // Scale macros to serving size if applicable
    var kcal    = food.kcal    || 0;
    var protein = food.protein || food.p || 0;
    var carbs   = food.carbs   || food.c || 0;
    var fats    = food.fats    || food.f || 0;
    if (food.servingG && food.category !== 'complete') {
      var scale = food.servingG / 100;
      kcal    = Math.round(kcal    * scale);
      protein = Math.round(protein * scale);
      carbs   = Math.round(carbs   * scale);
      fats    = Math.round(fats    * scale);
    }

    var mealTypeLabel = (food.mealType && food.mealType[0]) || 'any';
    var mealEm = mealEmoji[mealTypeLabel] || '🍽';
    var servingNote = food.servingG ? ' (per ' + food.servingG + 'g serving)' : '';

    // Macro deviation indicators
    var protDiff = budget.protein > 0 ? Math.round(protein - budget.protein) : 0;
    var protColor = Math.abs(protDiff) < budget.protein * 0.2 ? 'var(--green)' : 'var(--text3)';

    return '<div class="fs-card" style="' + (open ? 'border-color:var(--accent);' : '') + '">' +
      '<div onclick="fsTapCard(' + i + ')" style="display:flex;justify-content:space-between;align-items:flex-start;cursor:pointer">' +
        '<div style="flex:1">' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">' +
            '<span style="font-size:10px;color:var(--text3)">' + mealEm + ' ' + (food.category === 'complete' ? mealTypeLabel.charAt(0).toUpperCase() + mealTypeLabel.slice(1) : food.category) + servingNote + '</span>' +
          '</div>' +
          '<div class="fs-card-name">' + food.name + '</div>' +
          '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:4px">' +
            '<span class="fs-macro-pill" style="background:rgba(77,255,180,0.12);color:' + protColor + '">P ' + protein + 'g</span>' +
            '<span class="fs-macro-pill" style="background:rgba(77,138,255,0.12);color:var(--accent)">C ' + carbs + 'g</span>' +
            '<span class="fs-macro-pill" style="background:rgba(255,212,77,0.12);color:var(--yellow)">F ' + fats + 'g</span>' +
            '<span class="fs-macro-pill" style="background:rgba(255,107,77,0.12);color:var(--red)">' + kcal + ' kcal</span>' +
          '</div>' +
        '</div>' +
        '<div style="margin-left:8px;color:var(--text3);font-size:16px;flex-shrink:0;padding-top:2px">' + (open ? '▴' : '▾') + '</div>' +
      '</div>' +
      (open ? _renderFoodDetail(food, protein, carbs, fats, kcal, i) : '') +
    '</div>';
  }).join('');
}

function _renderFoodDetail(food, protein, carbs, fats, kcal, i) {
  var recipeSafe = (food.recipe || '').replace(/\n/g, '<br>');
  var ingHtml = food.ing
    ? food.ing.split('|').map(function(x) { return x.trim(); }).filter(Boolean).map(function(x) { return '• ' + x; }).join('<br>')
    : '';

  return '<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px">' +
    (food.tip ? '<div style="font-size:11px;color:var(--accent);margin-bottom:6px">💡 ' + food.tip + '</div>' : '') +
    (ingHtml ? (
      '<div style="font-size:10px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:5px">🧂 Ingredients:</div>' +
      '<div style="background:var(--bg4);border-radius:8px;padding:8px;margin-bottom:8px;font-size:11px;color:var(--text2);line-height:1.8">' + ingHtml + '</div>'
    ) : '') +
    (recipeSafe ? (
      '<div style="font-size:11px;font-weight:700;color:var(--text2);margin-bottom:5px">📋 Quick prep:</div>' +
      '<div style="font-size:11px;color:var(--text2);line-height:1.8">' + recipeSafe + '</div>'
    ) : '') +
'<button class="btn btn-primary" style="width:100%;margin-top:10px;font-size:12px" ' +
      'onclick="fsAddFood(\'' + (food.id || food.name.replace(/'/g,"\\'")).replace(/ /g,'_') + '_PACKED_' +
      food.name.replace(/'/g,"\\'") + '_P' + protein + '_C' + carbs + '_F' + fats + '_K' + kcal + '_M' + (food.mealType && food.mealType[0] || 'any') + '_END\')">' +
      '+ Add to my day' +
    '</button>' +
    '<button class="btn btn-ghost" style="width:100%;margin-top:6px;font-size:12px" ' +
      'onclick="_fsStageSuggestion(' + i + ',\'' + (food.id || food.name.replace(/'/g,"\\'")).replace(/ /g,'_') + '_PACKED_' +
      food.name.replace(/'/g,"\\'") + '_P' + protein + '_C' + carbs + '_F' + fats + '_K' + kcal + '_M' + (food.mealType && food.mealType[0] || 'any') + '_END\')">' +
      (_fsStagedIds && _fsStagedIds.has(i) ? '✓ Staged' : '+ Stage') +
    '</button>' +
  '</div>';
}

function _fsStageSuggestion(idx, packed) {
  if (_fsStagedIds.has(idx)) { _fsStagedIds.delete(idx); _fsStagedItems = _fsStagedItems.filter(function(p){ return p !== packed; }); }
  else { _fsStagedIds.add(idx); _fsStagedItems.push(packed); }
  _renderFoodSuggest();
}

function _confirmAllSuggested() {
  if (!_fsStagedItems.length) { showToast('No hay ítems staged'); return; }
  _fsStagedItems.forEach(function(packed) { fsAddFood(packed, true); });
  _fsStagedIds.clear();
  _fsStagedItems = [];
  showToast('✓ ' + _fsStagedItems.length + ' alimentos agregados');
}

function fsAddFood(packed, batch) {  var m = packed.match(/_PACKED_(.+)_P(\d+)_C(\d+)_F(\d+)_K(\d+)_M([^_]+)_END$/);
  if (!m) { showToast('Error adding food'); return; }
  var name = m[1], p = +m[2], c = +m[3], f = +m[4], kcal = +m[5], meal = m[6];
  if (!state[TODAY].foods) state[TODAY].foods = [];
  state[TODAY].foods.push({ name:name, meal:meal, prot:p, carb:c, fat:f, p:p, c:c, f:f, kcal:kcal });
saveState(state);
  if (!batch) {
    renderMeals();
    renderHome();
    closeModal('foodSuggestModal');
    showToast('✓ ' + name + ' added');
  }
}
