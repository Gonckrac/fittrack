// ═══════════════════════════════════════════════════════════════════
// MEAL PLAN v3 — Wizard día a día: alergias → plan → ajustar → lista
// ═══════════════════════════════════════════════════════════════════

var MEAL_SLOTS  = ['breakfast','lunch','snack','dinner'];
var SLOT_LABELS = { breakfast:'🌅 Desayuno', lunch:'☀️ Almuerzo', snack:'🍎 Merienda', dinner:'🌙 Cena' };
var DAY_NAMES   = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
var SLOT_DIST   = { breakfast:0.25, lunch:0.35, snack:0.10, dinner:0.30 };

// Tags de alergia → tags en la DB
var ALLERGY_TAGS = {
  gluten:   ['gluten'],
  lacteos:  ['lacteos'],
  huevo:    ['huevo'],
  pescado:  ['pescado','omega3'],
  mariscos: ['mariscos'],
  soja:     ['soja'],
  nueces:   ['nueces','mani'],
};

// Ingredientes → IDs de comidas que los contienen
var MEAL_RECIPE = {
  'bk_oat_prot':    [['Avena arrollada',80,'Secos'],['Banana',120,'Frutas y verduras'],['Mantequilla de maní',32,'Varios'],['Proteína whey',35,'Suplementos'],['Leche descremada',200,'Lácteos y huevos']],
  'bk_egg_toast':   [['Huevo entero',150,'Lácteos y huevos'],['Pan integral',60,'Panadería'],['Palta',80,'Frutas y verduras'],['Tomate',80,'Frutas y verduras']],
  'bk_greek_fruit': [['Yogur griego 0%',200,'Lácteos y huevos'],['Granola',50,'Secos'],['Arándanos',100,'Frutas y verduras'],['Miel',10,'Varios']],
  'bk_omelet':      [['Huevo entero',200,'Lácteos y huevos'],['Mozzarella descremada',50,'Lácteos y huevos'],['Morrón',100,'Frutas y verduras'],['Champiñones',80,'Frutas y verduras'],['Espinaca',50,'Frutas y verduras']],
  'bk_protein_sm':  [['Proteína whey',70,'Suplementos'],['Banana',120,'Frutas y verduras'],['Avena arrollada',80,'Secos'],['Leche descremada',300,'Lácteos y huevos']],
  'bk_overnight':   [['Avena arrollada',80,'Secos'],['Semillas de chía',15,'Secos'],['Yogur griego 0%',150,'Lácteos y huevos'],['Arándanos',80,'Frutas y verduras'],['Miel',10,'Varios']],
  'bk_smoked_sal':  [['Salmón ahumado',80,'Pescados y mariscos'],['Pan de centeno',60,'Panadería'],['Palta',60,'Frutas y verduras'],['Queso crema light',30,'Lácteos y huevos']],
  'bk_quinoa_egg':  [['Quinoa',80,'Secos'],['Huevo entero',100,'Lácteos y huevos'],['Espinaca',60,'Frutas y verduras'],['Aceite de oliva',10,'Varios']],
  'bk_pancakes':    [['Avena arrollada',80,'Secos'],['Huevo entero',100,'Lácteos y huevos'],['Proteína whey',35,'Suplementos'],['Frutillas',100,'Frutas y verduras'],['Leche descremada',100,'Lácteos y huevos']],
  'bk_massgain':    [['Leche entera',400,'Lácteos y huevos'],['Banana',240,'Frutas y verduras'],['Mantequilla de maní',64,'Varios'],['Avena arrollada',80,'Secos']],
  'ln_ck_rice':     [['Pechuga de pollo',250,'Carnes'],['Arroz blanco',180,'Secos'],['Lechuga',80,'Frutas y verduras'],['Tomate',100,'Frutas y verduras'],['Aceite de oliva',10,'Varios']],
  'ln_salmon_sp':   [['Salmón atlántico',220,'Pescados y mariscos'],['Batata',130,'Frutas y verduras'],['Brócoli',150,'Frutas y verduras'],['Aceite de oliva',10,'Varios']],
  'ln_pasta_beef':  [['Pasta integral',200,'Secos'],['Carne picada magra',150,'Carnes'],['Tomates perita',200,'Frutas y verduras'],['Cebolla',80,'Frutas y verduras'],['Aceite de oliva',10,'Varios']],
  'ln_lentil_stew': [['Lentejas',200,'Secos'],['Carne vacuna',150,'Carnes'],['Zanahoria',100,'Frutas y verduras'],['Cebolla',80,'Frutas y verduras'],['Papa',100,'Frutas y verduras']],
  'ln_steak_quin':  [['Bife de lomo',200,'Carnes'],['Quinoa',185,'Secos'],['Zapallito',150,'Frutas y verduras'],['Morrón',100,'Frutas y verduras'],['Aceite de oliva',10,'Varios']],
  'ln_burger':      [['Carne picada magra',200,'Carnes'],['Batata',200,'Frutas y verduras'],['Pan de hamburguesa',60,'Panadería'],['Lechuga',40,'Frutas y verduras'],['Tomate',60,'Frutas y verduras']],
  'ln_ck_chpea':    [['Pechuga de pollo',200,'Carnes'],['Garbanzos cocidos',200,'Secos'],['Arroz blanco',130,'Secos'],['Cebolla',60,'Frutas y verduras'],['Aceite de oliva',10,'Varios']],
  'ln_tuna_bowl':   [['Atún al natural',200,'Enlatados'],['Quinoa',185,'Secos'],['Palta',100,'Frutas y verduras'],['Tomates cherry',100,'Frutas y verduras'],['Aceite de oliva',10,'Varios']],
  'ln_ck_wrap':     [['Pechuga de pollo',150,'Carnes'],['Tortilla integral',70,'Panadería'],['Palta',80,'Frutas y verduras'],['Lechuga',40,'Frutas y verduras'],['Tomate',60,'Frutas y verduras']],
  'ln_shrimp_rice': [['Langostinos',200,'Pescados y mariscos'],['Arroz integral',180,'Secos'],['Brócoli',150,'Frutas y verduras'],['Ajo',10,'Frutas y verduras'],['Aceite de oliva',15,'Varios']],
  'sn_prot_shake':  [['Proteína whey',70,'Suplementos'],['Banana',120,'Frutas y verduras'],['Leche descremada',300,'Lácteos y huevos']],
  'sn_greek_nuts':  [['Yogur griego 0%',250,'Lácteos y huevos'],['Nueces',30,'Secos'],['Miel',15,'Varios']],
  'sn_tuna_bread':  [['Atún al natural',100,'Enlatados'],['Pan integral',60,'Panadería'],['Palta',60,'Frutas y verduras']],
  'sn_trail_mix':   [['Mix de frutos secos',30,'Secos'],['Chocolate negro 80%',25,'Varios'],['Arándanos secos',20,'Secos']],
  'sn_cottage_fr':  [['Cottage cheese',150,'Lácteos y huevos'],['Frutillas',100,'Frutas y verduras'],['Miel',10,'Varios']],
  'sn_boiled_eggs': [['Huevo entero',150,'Lácteos y huevos'],['Pan integral',60,'Panadería'],['Mantequilla de maní',32,'Varios']],
  'sn_mass_shake':  [['Leche entera',400,'Lácteos y huevos'],['Banana',120,'Frutas y verduras'],['Proteína whey',35,'Suplementos'],['Avena arrollada',60,'Secos']],
  'sn_rice_tuna':   [['Galletitas de arroz',40,'Secos'],['Atún al natural',100,'Enlatados'],['Queso crema light',40,'Lácteos y huevos']],
  'dn_salmon_cauf': [['Salmón atlántico',220,'Pescados y mariscos'],['Coliflor',200,'Frutas y verduras'],['Espárragos',150,'Frutas y verduras'],['Aceite de oliva',10,'Varios']],
  'dn_ck_broc':     [['Pechuga de pollo',250,'Carnes'],['Arroz integral',180,'Secos'],['Brócoli',150,'Frutas y verduras'],['Aceite de oliva',10,'Varios']],
  'dn_beef_quin':   [['Carne vacuna',200,'Carnes'],['Quinoa',185,'Secos'],['Rúcula',60,'Frutas y verduras'],['Tomates cherry',80,'Frutas y verduras'],['Aceite de oliva',10,'Varios']],
  'dn_lentil_rice': [['Lentejas rojas',200,'Secos'],['Arroz integral',180,'Secos'],['Leche de coco',100,'Enlatados'],['Especias de curry',5,'Varios'],['Cebolla',80,'Frutas y verduras']],
  'dn_turkey_sp':   [['Carne picada de pavo',200,'Carnes'],['Calabaza',300,'Frutas y verduras'],['Ajo',10,'Frutas y verduras'],['Aceite de oliva',10,'Varios']],
  'dn_cod_veg':     [['Merluza',250,'Pescados y mariscos'],['Zanahoria',100,'Frutas y verduras'],['Zapallito',150,'Frutas y verduras'],['Arroz blanco',130,'Secos']],
  'dn_pasta_ck':    [['Pasta integral',200,'Secos'],['Pechuga de pollo',150,'Carnes'],['Pesto',30,'Varios'],['Tomates cherry',100,'Frutas y verduras']],
  'dn_egg_potato':  [['Huevo entero',200,'Lácteos y huevos'],['Papa',200,'Frutas y verduras'],['Cebolla',100,'Frutas y verduras'],['Aceite de oliva',15,'Varios']],
  'dn_curry_ck':    [['Pechuga de pollo',200,'Carnes'],['Leche de coco',150,'Enlatados'],['Arroz basmati',180,'Secos'],['Cebolla',80,'Frutas y verduras'],['Especias de curry',5,'Varios']],
  'dn_chicken_soup':[['Pechuga de pollo',200,'Carnes'],['Fideos',80,'Secos'],['Zanahoria',100,'Frutas y verduras'],['Cebolla',80,'Frutas y verduras'],['Apio',50,'Frutas y verduras']],
  'dn_whites_bat':  [['Clara de huevo',200,'Lácteos y huevos'],['Batata',200,'Frutas y verduras'],['Espinaca',100,'Frutas y verduras'],['Aceite de oliva',10,'Varios']],
  'dn_tofu_wok':    [['Tofu firme',200,'Varios'],['Arroz integral',180,'Secos'],['Edamame',100,'Frutas y verduras'],['Salsa de soja',15,'Varios'],['Ajo',10,'Frutas y verduras']],
};

// ─── HELPER: obtener ingredientes de una comida (nueva DB o MEAL_RECIPE legacy) ──
function _getMealIngredients(mealId) {
  // Primero buscar en nueva DB (tiene campo ingredients)
  var meal = _getAllMeals().find(function(m) { return m.id === mealId; });
  if (meal && meal.ingredients && meal.ingredients.length) {
    return meal.ingredients.map(function(i) {
      // Asignar categoría automática por nombre
      var cat = _guessFoodCategory(i.name);
      return [i.name, i.grams, cat];
    });
  }
  // Fallback: MEAL_RECIPE legacy
  return MEAL_RECIPE[mealId] || [];
}

// ─── HELPER: obtener preparación de una comida ────────────────────
function _getMealPrep(mealId) {
  var meal = _getAllMeals().find(function(m) { return m.id === mealId; });
  if (meal && meal.prepSteps && meal.prepSteps.length) {
    return meal.prepSteps.join(' ');
  }
  return MEAL_PREP[mealId] || '';
}

// ─── HELPER: adivinar categoría de lista de compras por nombre ────
function _guessFoodCategory(name) {
  var n = name.toLowerCase();
  if (/pollo|bife|carne|milanesa|cerdo|bondiola|costeleta|pechuga|muslo|suprema|lomo|pavo/.test(n)) return 'Carnes';
  if (/merluza|salmón|atún|langostino|pescado|filete/.test(n)) return 'Pescados y mariscos';
  if (/huevo|leche|yogur|queso|ricota|manteca|crema|cottage/.test(n)) return 'Lácteos y huevos';
  if (/proteína|whey|caseína/.test(n)) return 'Suplementos';
  if (/pan|tostada|medialuna|galletita|factura/.test(n)) return 'Panadería';
  if (/arroz|avena|fideos|pasta|lenteja|garbanzo|quinoa|fideo|tallarín|cereal|granola/.test(n)) return 'Secos';
  if (/lata|enlatado|atún al natural|leche de coco/.test(n)) return 'Enlatados';
  if (/aceite|miel|sal|pimienta|condimento|salsa|maní|mantequilla de maní|cacao|chocolate|dulce/.test(n)) return 'Varios';
  return 'Frutas y verduras';
}

// ─── STATE DEL WIZARD ────────────────────────────────────────────
var _wz = {
  step: 'idle',
  dayIdx: 0,
  allergies: [],
  excluded: [],
  unavailable: [],
  prepTime: 'any',   // 'quick' | 'medium' | 'any'
  variety: 'balanced', // 'varied' | 'balanced' | 'mealprep'
  plan: null,
};

// ─── ENTRY POINT ────────────────────────────────────────────────
function renderMealPlan() {
  var container = document.getElementById('mealPlanContent');
  if (!container) return;
  // Solo renderizar si la página Nutrición y el sub-tab Plan están activos
  var pageNutricion = document.getElementById('page-nutricion');
  if (!pageNutricion || !pageNutricion.classList.contains('active')) return;
  var subPlan = document.getElementById('sub-nutricion-plan');
  if (!subPlan || !subPlan.classList.contains('active')) return;

  try {
    var plan = loadMealPlan();
    if (!plan) {
 container.innerHTML =
  '<div style="padding:24px 0;text-align:center">' +
    '<div style="font-size:48px;margin-bottom:16px">🥗</div>' +
    '<div style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:8px">Tu plan semanal de comidas</div>' +
    '<div style="font-size:13px;color:var(--text3);line-height:1.6;margin-bottom:24px;padding:0 16px">' +
      'Generamos un menú completo de 7 días adaptado a tus macros, objetivo y preferencias.<br>Al final te damos la lista de compras exacta.' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:28px;text-align:left;padding:0 8px">' +
      '<div style="background:var(--bg3);border-radius:14px;padding:14px;display:flex;gap:10px;align-items:flex-start">' +
        '<span style="font-size:20px">🎯</span>' +
        '<div><div style="font-size:12px;font-weight:700;color:var(--text)">Adaptado a tus macros</div><div style="font-size:11px;color:var(--text3);margin-top:2px">Calculado según tu objetivo</div></div>' +
      '</div>' +
      '<div style="background:var(--bg3);border-radius:14px;padding:14px;display:flex;gap:10px;align-items:flex-start">' +
        '<span style="font-size:20px">🛒</span>' +
        '<div><div style="font-size:12px;font-weight:700;color:var(--text)">Lista de compras</div><div style="font-size:11px;color:var(--text3);margin-top:2px">Ingredientes exactos por día</div></div>' +
      '</div>' +
      '<div style="background:var(--bg3);border-radius:14px;padding:14px;display:flex;gap:10px;align-items:flex-start">' +
        '<span style="font-size:20px">⚡</span>' +
        '<div><div style="font-size:12px;font-weight:700;color:var(--text)">Rápido de armar</div><div style="font-size:11px;color:var(--text3);margin-top:2px">Listo en menos de 2 minutos</div></div>' +
      '</div>' +
      '<div style="background:var(--bg3);border-radius:14px;padding:14px;display:flex;gap:10px;align-items:flex-start">' +
        '<span style="font-size:20px">🔄</span>' +
        '<div><div style="font-size:12px;font-weight:700;color:var(--text)">Ajustable</div><div style="font-size:11px;color:var(--text3);margin-top:2px">Cambiá lo que no te gusta</div></div>' +
      '</div>' +
    '</div>' +
    '<button onclick="startMealPlanWizard()" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px">Armar mi plan →</button>' +
  '</div>';
    } else {
      _renderPlanFinal(plan);
    }
  } catch(e) {
    var c = document.getElementById('mealPlanContent');
    if (c) c.innerHTML =
      '<div style="text-align:center;padding:40px 20px">' +
        '<div style="font-size:36px;margin-bottom:12px">⚠️</div>' +
        '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:8px">Error al cargar el plan</div>' +
        '<div style="font-size:12px;color:var(--text3);margin-bottom:20px">' + (e && e.message ? e.message : 'Error desconocido') + '</div>' +
        '<button class="btn btn-ghost" onclick="renderMealPlan()" style="width:100%">Reintentar</button>' +
      '</div>';
  }
}

// ─── WIZARD: PANTALLA DE ALERGIAS ────────────────────────────────
function startMealPlanWizard() { startPlanWizard(); }
function startPlanWizard() {  _wz.allergies   = (state.mealPlanPrefs && state.mealPlanPrefs.allergies)   || [];
  _wz.excluded    = (state.mealPlanPrefs && state.mealPlanPrefs.excluded)    || [];
  _wz.unavailable = (state.mealPlanPrefs && state.mealPlanPrefs.unavailable) || [];
  _wz.prepTime    = (state.mealPlanPrefs && state.mealPlanPrefs.prepTime)    || 'any';
  _wz.variety     = (state.mealPlanPrefs && state.mealPlanPrefs.variety)     || 'balanced';
  _openSheet(_buildAllergyScreen());
}

function _buildAllergyScreen() {
  var opts = [
    {k:'gluten',   e:'🌾', l:'Gluten'},
    {k:'lacteos',  e:'🥛', l:'Lácteos'},
    {k:'huevo',    e:'🥚', l:'Huevo'},
    {k:'pescado',  e:'🐟', l:'Pescado'},
    {k:'mariscos', e:'🦐', l:'Mariscos'},
    {k:'soja',     e:'🫘', l:'Soja'},
    {k:'nueces',   e:'🥜', l:'Nueces / Maní'},
  ];
  var chips = opts.map(function(o) {
    var sel = _wz.allergies.indexOf(o.k) >= 0;
    return '<button id="alg_'+o.k+'" onclick="_toggleAllergy(\''+o.k+'\',this)" style="'+
      'display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:20px;margin:4px;'+
      'border:1.5px solid '+(sel?'var(--red)':'var(--border)')+';'+
      'background:'+(sel?'rgba(255,107,77,0.10)':'var(--bg3)')+';'+
      'color:'+(sel?'var(--red)':'var(--text2)')+';cursor:pointer;font-size:13px">'+
      o.e+' '+o.l+'</button>';
  }).join('');

  return '<div style="padding:0 20px 28px">' +
    '<div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px">¿Tenés alguna restricción?</div>' +
    '<div style="font-size:13px;color:var(--text3);margin-bottom:20px">Tocá las que aplican. El plan las va a evitar.</div>' +
    '<div style="display:flex;flex-wrap:wrap;margin:-4px;margin-bottom:24px">'+chips+'</div>' +
    '<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">' +
      '<span style="font-size:12px;color:var(--text3)">¿Ninguna restricción?</span>' +
      '<button onclick="_noAllergies()" style="background:none;border:none;color:var(--accent);font-size:12px;cursor:pointer;text-decoration:underline">Salteá este paso →</button>' +
    '</div>' +
    '</div>' +
    '<div style="padding:0 20px 32px">' +
      '<button onclick="_allergyNext()" class="btn btn-primary" style="width:100%">Siguiente — ver el plan →</button>' +
    '</div>';
}

function _toggleAllergy(key, btn) {
  var idx = _wz.allergies.indexOf(key);
  if (idx >= 0) {
    _wz.allergies.splice(idx, 1);
    btn.style.border = '1.5px solid var(--border)';
    btn.style.background = 'var(--bg3)';
    btn.style.color = 'var(--text2)';
  } else {
    _wz.allergies.push(key);
    btn.style.border = '1.5px solid var(--red)';
    btn.style.background = 'rgba(255,107,77,0.10)';
    btn.style.color = 'var(--red)';
  }
}

function _noAllergies() { _wz.allergies = []; _allergyNext(); }

function _allergyNext() {
  _closeSheet();
  _openPrepTimeScreen();
}

function _openPrepTimeScreen() {
  var cur = _wz.prepTime || 'any';
  var opts = [
    {k:'quick', e:'⚡', l:'Rápido', h:'Menos de 15 min por comida'},
    {k:'medium',e:'🍳', l:'Normal', h:'Entre 15 y 30 min'},
    {k:'any',   e:'👨‍🍳', l:'No importa', h:'Cualquier tiempo de preparación'},
  ];
  var btns = opts.map(function(o){
    var sel = cur === o.k;
    return '<button onclick="_setPrepTime(this.dataset.k)" data-k="'+o.k+'" id="pt_'+o.k+'" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;border:1.5px solid '+(sel?'var(--accent)':'var(--border)')+';background:'+(sel?'rgba(77,138,255,0.10)':'var(--bg3)')+';cursor:pointer;width:100%;text-align:left;margin-bottom:8px">'+
      '<span style="font-size:22px">'+o.e+'</span>'+
      '<div><div style="font-size:13px;font-weight:600;color:'+(sel?'var(--accent)':'var(--text)')+'">'+o.l+'</div>'+
      '<div style="font-size:11px;color:var(--text3)">'+o.h+'</div></div>'+
      (sel?'<span style="margin-left:auto;color:var(--accent)">✓</span>':'')+
    '</button>';
  }).join('');

  _openSheet(
    '<div style="padding:0 20px;flex:1;overflow-y:auto">'+
      '<div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px">¿Cuánto tiempo tenés para cocinar?</div>'+
      '<div style="font-size:13px;color:var(--text3);margin-bottom:20px">Filtramos las comidas según el tiempo de preparación.</div>'+
      btns+
    '</div>'+
    '<div style="padding:16px 20px 32px;flex-shrink:0;display:flex;gap:8px">'+
      '<button onclick="_prepTimeBack()" class="btn btn-ghost" style="flex:1">← Atrás</button>'+
      '<button onclick="_prepTimeNext()" class="btn btn-primary" style="flex:2">Siguiente — ver el plan →</button>'+
    '</div>'
  );
}

function _setPrepTime(key) {
  _wz.prepTime = key;
  _openPrepTimeScreen();
}
function _prepTimeBack() { _closeSheet(); _openSheet(_buildAllergyScreen()); }
function _prepTimeNext() {
  _closeSheet();
  _openVarietyScreen();
}
// ─── WIZARD: VARIEDAD ────────────────────────────────────────────
function _openVarietyScreen() {
  var cur = _wz.variety || 'balanced';
  var opts = [
    { k:'varied',   e:'🌈', l:'Variado',    h:'Cada comida aparece una sola vez en la semana' },
    { k:'balanced', e:'⚖️', l:'Balanceado', h:'Algunas comidas se repiten — buena variedad sin complicarte' },
    { k:'mealprep', e:'📦', l:'Meal prep',  h:'Repetís más comidas — cocinás menos veces y en cantidad' },
  ];
  var btns = opts.map(function(o) {
    var sel = cur === o.k;
    return '<button onclick="_setVariety(\'' + o.k + '\')" style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;border:1.5px solid ' + (sel ? 'var(--accent)' : 'var(--border)') + ';background:' + (sel ? 'rgba(77,138,255,0.10)' : 'var(--bg3)') + ';cursor:pointer;width:100%;text-align:left;margin-bottom:8px">' +
      '<span style="font-size:22px">' + o.e + '</span>' +
      '<div><div style="font-size:13px;font-weight:600;color:' + (sel ? 'var(--accent)' : 'var(--text)') + '">' + o.l + '</div>' +
      '<div style="font-size:11px;color:var(--text3)">' + o.h + '</div></div>' +
      (sel ? '<span style="margin-left:auto;color:var(--accent)">✓</span>' : '') +
    '</button>';
  }).join('');

  _openSheet(
    '<div style="padding:0 20px;flex:1;overflow-y:auto">' +
      '<div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px">¿Cuánto querés variar?</div>' +
      '<div style="font-size:13px;color:var(--text3);margin-bottom:20px">Esto define cuánto se repiten las comidas en tu semana.</div>' +
      btns +
    '</div>' +
    '<div style="padding:16px 20px 32px;flex-shrink:0;display:flex;gap:8px">' +
      '<button onclick="_varietyBack()" class="btn btn-ghost" style="flex:1">← Atrás</button>' +
      '<button onclick="_varietyNext()" class="btn btn-primary" style="flex:2">Generar plan →</button>' +
    '</div>'
  );
}

function _setVariety(key) {
  _wz.variety = key;
  _openVarietyScreen();
}

function _varietyBack() {
  _closeSheet();
  _openPrepTimeScreen();
}

function _varietyNext() {
  _closeSheet();
  var targets = getDynamicTargets();
  var goal = (state.config && state.config.goal) || 'cut';
  var freqFoodNames = Object.keys(state.freqFoods || {}).slice(0, 20);
  _wz.plan = _generatePlan(targets, goal, freqFoodNames);
  _wz.dayIdx = 0;
  _openDayReview(0);
}

// ─── WIZARD: REVISIÓN DÍA A DÍA ──────────────────────────────────
// ─── WIZARD: REVISIÓN DÍA A DÍA ──────────────────────────────────
function _openDayReview(dayIdx) {
  _wz.dayIdx = dayIdx;
  var plan = _wz.plan;
  var day  = plan[dayIdx];
  var targets = getDynamicTargets();
  var totals = _calcDayTotals(day.meals);
  var isLast = dayIdx === 6;

  var mealsHtml = MEAL_SLOTS.map(function(slot) {
    var meal = day.meals[slot]; if (!meal) return '';
var ing = _getMealIngredients(meal.id);
    var ingHtml = ing.length ?
      '<div style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--bg4)">' +
        ing.map(function(i){ return '<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0"><span style="color:var(--text2)">'+i[0]+'</span><span style="color:var(--text3);font-weight:600">'+i[1]+'g</span></div>'; }).join('') +
      '</div>' : '';

    return '<div id="meal_'+dayIdx+'_'+slot+'" style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:10px">' +


      '<div style="display:flex;align-items:flex-start;gap:10px">' +
        '<div style="font-size:11px;color:var(--text3);min-width:72px;padding-top:2px;flex-shrink:0">'+SLOT_LABELS[slot]+'</div>' +
        '<div style="flex:1;cursor:pointer" onclick="_toggleMealDetail(\'det_'+dayIdx+'_'+slot+'\')">' +
          '<div style="font-size:13px;font-weight:600;color:var(--text)">'+meal.name+' <span style="font-size:10px;color:var(--text3)">▾</span></div>' +
          '<div style="font-size:10px;color:var(--text3);margin-top:2px">'+meal.kcal+' kcal · '+meal.protein+'g P · '+meal.carbs+'g C · '+meal.fats+'g G</div>' +
          '<div id="det_'+dayIdx+'_'+slot+'" style="display:none">'+ingHtml+'</div>' +
        '</div>' +
        '<button onclick="_openMealActions('+dayIdx+',\''+slot+'\')" style="font-size:18px;background:none;border:none;cursor:pointer;color:var(--text3);padding:0 4px;flex-shrink:0">⋯</button>' +
      '</div>' +
    '</div>';
  }).join('');

  var macroBar = _renderMacroBar(totals, targets);
  var progress = '<div style="display:flex;gap:3px;margin-bottom:4px">' +
    DAY_NAMES.map(function(_, i){
      var done = i < dayIdx, cur = i === dayIdx;
      return '<div style="flex:1;height:3px;border-radius:2px;background:'+(done?'var(--green)':cur?'var(--accent)':'var(--bg4)')+'"></div>';
    }).join('') + '</div>' +
    '<div style="font-size:10px;color:var(--text3);text-align:right">'+DAY_NAMES[dayIdx]+' — '+(dayIdx+1)+' de 7</div>';

  var navBtns = '<div style="display:flex;gap:8px;padding:16px 20px 32px;flex-shrink:0">' +
    (dayIdx > 0 ? '<button onclick="_dayNav('+(dayIdx-1)+')" class="btn btn-ghost" style="flex:1">← '+DAY_NAMES[dayIdx-1]+'</button>' : '<div style="flex:1"></div>') +
    '<button onclick="'+(isLast ? '_finishWizard()' : '_dayNav('+(dayIdx+1)+')')+'" class="btn btn-primary" style="flex:2">'+(isLast ? '✅ Confirmar plan' : DAY_NAMES[dayIdx+1]+' →')+'</button>' +
    '</div>';

  var content =
    '<div style="padding:0 20px;flex:1;overflow-y:auto">' +
      progress +
      '<div style="display:flex;align-items:baseline;justify-content:space-between;margin:12px 0 16px">' +
        '<div style="font-size:20px;font-weight:800;color:var(--text)">'+DAY_NAMES[dayIdx]+'</div>' +
        '<div style="font-size:12px;color:var(--text3)">'+totals.kcal+' kcal</div>' +
      '</div>' +
      mealsHtml +
      macroBar +
    '</div>' + navBtns;

  _openSheet(content);
}

function _toggleMealDetail(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function _toggleDayCollapse(bodyId, arrowId) {
  var body  = document.getElementById(bodyId);
  var arrow = document.getElementById(arrowId);
  if (!body) return;
  var isOpen = body.style.display !== 'none';
  body.style.display  = isOpen ? 'none' : 'block';
  if (arrow) arrow.textContent = isOpen ? '▶' : '▾';
}

function _dayNav(idx) {
  _closeSheet();
  setTimeout(function(){ _openDayReview(idx); }, 50);
}

// ─── ACCIONES SOBRE UNA COMIDA ────────────────────────────────────
function _openMealActions(dayIdx, slot) {
  var meal = _wz.plan[dayIdx].meals[slot];
  var menu = document.createElement('div');
  menu.id = 'mealActionsMenu';
  menu.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:flex-end;justify-content:center';
  menu.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px">' +
      '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
      '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">'+meal.name+'</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:20px">'+SLOT_LABELS[slot]+'</div>' +
      _actionBtn('🔄  Cambiar por algo similar', 'var(--accent)', '_showSwapOptions('+dayIdx+',\''+slot+'\')') +
_actionBtn('😕  No me gusta — excluir ingredientes', 'var(--yellow)', '_openDislikeIngredients('+dayIdx+',\''+slot+'\')') +
      _actionBtn('🚫  No lo consigo', 'var(--red)', '_excludeAndReplace('+dayIdx+',\''+slot+'\',\'unavailable\')') +
      '<button onclick="document.getElementById(\'mealActionsMenu\').remove()" class="btn btn-ghost" style="width:100%;margin-top:8px;font-size:13px">Cancelar</button>' +
    '</div>';
  menu.addEventListener('click', function(e){ if(e.target===menu) menu.remove(); });
  document.body.appendChild(menu);
}

function _actionBtn(label, color, fn) {
  return '<button onclick="'+fn+'" style="width:100%;text-align:left;padding:13px 16px;border-radius:12px;border:1px solid var(--border);background:var(--bg3);cursor:pointer;font-size:13px;color:'+color+';margin-bottom:8px">'+label+'</button>';
}

function _openDislikeIngredients(dayIdx, slot) {
  document.getElementById('mealActionsMenu').remove();
  var meal = _wz.plan[dayIdx].meals[slot];
var ing = _getMealIngredients(meal.id);
  // Ingredientes seleccionados (ninguno por defecto)  // Ingredientes seleccionados (ninguno por defecto)
  var selected = {};

  var chips = ing.map(function(i) {
    var key = i[0].toLowerCase();
    return '<button id="ing_chip_' + key.replace(/[^a-z0-9]/g,'_') + '" ' +
      'onclick="_toggleIngChip(this,\'' + key + '\')" ' +
      'style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:20px;margin:4px;' +
      'border:1.5px solid var(--border);background:var(--bg3);color:var(--text2);cursor:pointer;font-size:13px">' +
      i[0] +
    '</button>';
  }).join('');

  var sheet = document.createElement('div');
  sheet.id = 'dislikeIngSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10001;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px">' +
      '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px">' + meal.name + '</div>' +
      '<div style="font-size:12px;color:var(--text3);margin-bottom:16px">¿Qué ingredientes no querés que aparezcan más?</div>' +
      '<div style="display:flex;flex-wrap:wrap;margin:-4px;margin-bottom:20px">' + chips + '</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:8px">' +
        '<button onclick="_confirmDislikeIngredients(' + dayIdx + ',\'' + slot + '\')" class="btn btn-primary" style="flex:2">Excluir seleccionados →</button>' +
        '<button onclick="document.getElementById(\'dislikeIngSheet\').remove();_excludeAndReplace(' + dayIdx + ',\'' + slot + '\',\'dislike\')" class="btn btn-ghost" style="flex:1;font-size:11px;color:var(--text3)">Excluir plato entero</button>' +
      '</div>' +
      '<button onclick="document.getElementById(\'dislikeIngSheet\').remove()" class="btn btn-ghost" style="width:100%;font-size:12px">Cancelar</button>' +
    '</div>';
  sheet.addEventListener('click', function(e){ if(e.target===sheet) sheet.remove(); });
  document.body.appendChild(sheet);

  // Guardar referencia a los seleccionados en el sheet
  sheet._selected = selected;
}

window._toggleIngChip = function(btn, key) {
  var sheet = document.getElementById('dislikeIngSheet');
  if (!sheet) return;
  if (!sheet._selected) sheet._selected = {};
  var isSelected = sheet._selected[key];
  if (isSelected) {
    delete sheet._selected[key];
    btn.style.border = '1.5px solid var(--border)';
    btn.style.background = 'var(--bg3)';
    btn.style.color = 'var(--text2)';
  } else {
    sheet._selected[key] = true;
    btn.style.border = '1.5px solid var(--red)';
    btn.style.background = 'rgba(255,107,77,0.10)';
    btn.style.color = 'var(--red)';
  }
};

window._confirmDislikeIngredients = function(dayIdx, slot) {
  var sheet = document.getElementById('dislikeIngSheet');
  var selected = sheet && sheet._selected ? sheet._selected : {};
  var keys = Object.keys(selected);
  if (keys.length === 0) {
    showToast('⚠ Seleccioná al menos un ingrediente');
    return;
  }
  sheet.remove();
  // Agregar ingredientes seleccionados a unavailable
  var refMeal = _wz.plan[dayIdx].meals[slot];
var refIng = _getMealIngredients(refMeal.id);  keys.forEach(function(key) {
    var original = refIng.find(function(i){ return i[0].toLowerCase() === key; });
    var name = original ? original[0] : key;
    if (_wz.unavailable.indexOf(name) < 0) _wz.unavailable.push(name);
  });

  // Barrer TODOS los días del plan y reemplazar cualquier plato que contenga los ingredientes excluidos
  var replaced = 0;
  _wz.plan.forEach(function(dayPlan, dIdx) {
    MEAL_SLOTS.forEach(function(s) {
      var m = dayPlan.meals[s];
      if (!m) return;
  var rec = _getMealIngredients(m.id);
      var hasExcluded = rec.some(function(i) {
        return _wz.unavailable.some(function(u) {
          return i[0].toLowerCase().indexOf(u.toLowerCase()) >= 0;
        });
      });
      if (hasExcluded) {
        var repl = _getBestReplacement(m, s, _wz.plan);
        if (repl) {
          _wz.plan[dIdx].meals[s] = repl;
          replaced++;
        }
      }
    });
  });

  if (replaced > 0) {
    showToast('✅ Ingrediente excluido de ' + replaced + ' comida' + (replaced > 1 ? 's' : '') + ' en la semana');
  } else {
    showToast('✅ Ingrediente excluido');
  }
  _openDayReview(dayIdx);
};

function _excludeAndReplace(dayIdx, slot, reason) {
  var existing = document.getElementById('mealActionsMenu');
  if (existing) existing.remove();
  var meal = _wz.plan[dayIdx].meals[slot];
  if (reason === 'dislike') {
    if (_wz.excluded.indexOf(meal.id) < 0) _wz.excluded.push(meal.id);
  } else {
var ing = _getMealIngredients(meal.id);
    ing.forEach(function(i){ if (_wz.unavailable.indexOf(i[0]) < 0) _wz.unavailable.push(i[0]); });
  }
  var replacement = _getBestReplacement(meal, slot, _wz.plan);
  if (replacement) {
    _wz.plan[dayIdx].meals[slot] = replacement;
    _openDayReview(dayIdx);
showToast('✅ Cambiado por: ' + replacement.name);
  } else {
    showToast('⚠ No encontré alternativa elegible');
    _openDayReview(dayIdx);
  }
}

function _showSwapOptions(dayIdx, slot) {
  document.getElementById('mealActionsMenu').remove();
  var current = _wz.plan[dayIdx].meals[slot];
  var options = _getSwapOptions(current, slot, _getPlanUsedIds(_wz.plan));

  var html = options.map(function(m) {
    var dK=m.kcal-current.kcal, sK=dK>0?'+':'';
    var dP=m.protein-current.protein, sP=dP>0?'+':'';
    return '<div onclick="_applySwap('+dayIdx+',\''+slot+'\',\''+m.id+'\')" style="padding:12px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;cursor:pointer;background:var(--bg3)">' +
      '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px">'+m.name+'</div>' +
      '<div style="font-size:11px;color:var(--text3)">'+m.kcal+' kcal <span style="color:'+(Math.abs(dK)<60?'var(--green)':'var(--text3)')+'">'+sK+dK+'</span>'+
      ' · '+m.protein+'g P <span style="color:'+(Math.abs(dP)<6?'var(--green)':'var(--text3)')+'">'+sP+dP+'g</span></div>' +
    '</div>';
  }).join('');

  var sheet = document.createElement('div');
  sheet.id = 'swapSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px;max-height:75vh;overflow-y:auto">' +
      '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px">Alternativas para '+SLOT_LABELS[slot]+'</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:16px">Ahora: '+current.name+'</div>' +
      html +
      '<button onclick="document.getElementById(\'swapSheet\').remove();_openDayReview('+dayIdx+')" class="btn btn-ghost" style="width:100%;margin-top:4px">Cancelar</button>' +
    '</div>';
  sheet.addEventListener('click', function(e){ if(e.target===sheet){ sheet.remove(); _openDayReview(dayIdx); } });
document.body.appendChild(sheet);
}

function _applySwap(dayIdx, slot, mealId) {
  var s = document.getElementById('swapSheet'); if(s) s.remove();
var newMeal = _getAllMeals().find(function(m){ return m.id===mealId; });
  if (newMeal) { _wz.plan[dayIdx].meals[slot] = newMeal; showToast('✅ ' + newMeal.name); }
  _openDayReview(dayIdx);
}

// ─── FINALIZAR WIZARD ────────────────────────────────────────────
function _finishWizard() {
  _closeSheet();
  saveMealPlan(_wz.plan);
state.mealPlanPrefs = {
    allergies:   _wz.allergies,
    excluded:    _wz.excluded,
    unavailable: _wz.unavailable,
    prepTime:    _wz.prepTime,
    variety:     _wz.variety,
  };
  saveState(state);
  showToast('🗓 Plan guardado');
  // Asegurar que estamos en el sub-tab Plan antes de renderizar
  var planBtn = document.getElementById('subtab-plan');
  if (typeof switchSubtab === 'function') {
    switchSubtab('nutricion', 'plan', planBtn);
  } else {
    _renderPlanFinal(_wz.plan);
  }
}
function _formatPlanDate(dateStr) {
  if (!dateStr) return '—';
  try {
    var d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' });
  } catch(e) { return dateStr; }
}

// ─── RENDER PLAN FINAL (vista guardada) ──────────────────────────
function _renderPlanFinal(plan) {
  var container = document.getElementById('mealPlanContent');
  if (!container) return;
  var subPlan = document.getElementById('sub-nutricion-plan');
  if (!subPlan || !subPlan.classList.contains('active')) return;
  var targets = getDynamicTargets();
  var goal = (state.config&&state.config.goal)||'cut';
  var GOAL_LABELS = { cut_aggressive:'Bajando agresivo', cut:'Déficit', maintain:'Mantenimiento', lean_bulk:'Lean Bulk', bulk:'Volumen' };
  var todayIdx = new Date().getDay()===0 ? 6 : new Date().getDay()-1;

 var daysHtml = plan.map(function(dayPlan, i) {
    var isToday = i===todayIdx;
    var totals = _calcDayTotals(dayPlan.meals);
    var b = isToday ? 'border:1.5px solid var(--accent);background:rgba(77,138,255,0.04)' : 'border:1px solid var(--border);background:var(--bg3)';
    // El día actual empieza expandido; los demás colapsados
    var expanded = isToday;
    var bodyDisplay = expanded ? 'block' : 'none';
    var arrow = expanded ? '▾' : '▶';

    var mealsHtml = MEAL_SLOTS.map(function(slot) {
      var meal = dayPlan.meals[slot]; if(!meal) return '';
 var ing = _getMealIngredients(meal.id);
      var ingHtml = ing.length ?
        '<div id="pf_'+i+'_'+slot+'" style="display:none;margin-top:8px;padding-top:8px;border-top:1px dashed var(--bg4)">' +
          ing.map(function(r){ return '<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0"><span style="color:var(--text2)">'+r[0]+'</span><span style="color:var(--text3);font-weight:600">'+r[1]+'g</span></div>'; }).join('') +
        '</div>' : '';
   var isToday2 = i===todayIdx;
   var macroLine = '<div style="font-size:10px;color:var(--text3);margin-top:2px">' +
        meal.kcal + ' kcal · ' +
        '<span style="color:#3b82f6">' + meal.protein + 'g P</span> · ' +
        '<span style="color:#f59e0b">' + meal.carbs + 'g C</span> · ' +
        '<span style="color:#ef4444">' + meal.fats + 'g G</span>' +
        '</div>';
      return '<div style="display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid var(--bg4)">' +
        '<div style="font-size:11px;color:var(--text3);min-width:76px;padding-top:2px;flex-shrink:0">'+SLOT_LABELS[slot]+'</div>' +
        '<div style="flex:1;min-width:0;cursor:pointer" onclick="_toggleMealDetail(\'pf_'+i+'_'+slot+'\')">' +
          '<div style="font-size:12px;font-weight:600;color:var(--text);line-height:1.3">'+meal.name+' <span style="font-size:10px;color:var(--text3)">▾</span></div>' +
          macroLine +
          ingHtml +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;align-items:flex-end">' +
'<button onclick="usePlanSlot('+i+',\''+slot+'\')" title="Registrar en el log de hoy" style="font-size:11px;background:none;border:none;cursor:pointer;color:'+(isToday2?'var(--accent)':'var(--text3)')+';padding:2px 4px;line-height:1;font-weight:'+(isToday2?'700':'400')+'">✓ Log</button>' +          '<button onclick="openSwapMeal('+i+',\''+slot+'\')" title="Cambiar" style="font-size:11px;background:none;border:none;cursor:pointer;color:var(--text3);padding:2px 4px;line-height:1">↔ Cambiar</button>' +
        '</div>' +
      '</div>';
    }).join('');

    return '<div style="'+b+';border-radius:14px;margin-bottom:10px;overflow:hidden">' +
      // ── Header clicable ──────────────────────────────────────────
      '<div onclick="_toggleDayCollapse(\'daybody_'+i+'\',\'dayarrow_'+i+'\')" style="display:flex;align-items:center;justify-content:space-between;padding:14px;cursor:pointer;user-select:none">' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span id="dayarrow_'+i+'" style="font-size:12px;color:var(--text3);transition:transform 0.2s">'+arrow+'</span>' +
          '<span style="font-size:14px;font-weight:700;color:'+(isToday?'var(--accent)':'var(--text)')+'">'+DAY_NAMES[i]+'</span>' +
          (isToday?'<span style="font-size:10px;font-weight:700;background:var(--accent);color:#fff;border-radius:6px;padding:1px 7px">HOY</span>':'') +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:6px">' +
          '<span style="font-size:11px;color:var(--text3)">'+totals.kcal+' kcal</span>' +
          (isToday?'<button onclick="event.stopPropagation();confirmUsePlanDay('+i+')" style="font-size:11px;font-weight:700;background:var(--accent);color:#fff;border:none;border-radius:8px;padding:4px 12px;cursor:pointer">Usar hoy →</button>':'') +
        '</div>' +
      '</div>' +
      // ── Cuerpo colapsable ────────────────────────────────────────
      '<div id="daybody_'+i+'" style="display:'+bodyDisplay+';padding:0 14px 14px">' +
        mealsHtml +
        _renderMacroBar(totals, targets) +
      '</div>' +
    '</div>';
  }).join('');

  // Resumen semanal
  var weekTotals = plan.reduce(function(acc, d) {
    var t = _calcDayTotals(d.meals);
    acc.kcal += t.kcal; acc.prot += t.prot; acc.carb += t.carb; acc.fat += t.fat;
    return acc;
  }, { kcal:0, prot:0, carb:0, fat:0 });
  var avgKcal = Math.round(weekTotals.kcal / 7);
  var avgProt = Math.round(weekTotals.prot / 7);
  var kcalOk = Math.abs(avgKcal - targets.kcal) / targets.kcal < 0.10;
  var protOk = Math.abs(avgProt - targets.prot) / targets.prot < 0.10;
  var planOk = kcalOk && protOk;

  var summaryHtml =
    '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:14px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
        '<div style="font-size:12px;font-weight:700;color:var(--text)">Resumen semanal</div>' +
        '<span style="font-size:10px;font-weight:700;background:' + (planOk ? 'var(--green)' : 'var(--yellow)') + ';color:#fff;border-radius:6px;padding:2px 8px">' +
          (planOk ? '✓ En objetivo' : '~ Aprox. objetivo') +
        '</span>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;text-align:center">' +
        '<div><div style="font-size:14px;font-weight:700;color:var(--text)">' + avgKcal + '</div><div style="font-size:10px;color:var(--text3)">kcal/día</div>' +
          '<div style="font-size:10px;color:' + (kcalOk?'var(--green)':'var(--yellow)') + '">' + (kcalOk?'✓':'±') + ' obj ' + targets.kcal + '</div></div>' +
        '<div><div style="font-size:14px;font-weight:700;color:#3b82f6">' + avgProt + 'g</div><div style="font-size:10px;color:var(--text3)">prot/día</div>' +
          '<div style="font-size:10px;color:' + (protOk?'var(--green)':'var(--yellow)') + '">' + (protOk?'✓':'±') + ' obj ' + targets.prot + 'g</div></div>' +
        '<div><div style="font-size:14px;font-weight:700;color:#f59e0b">' + Math.round(weekTotals.carb/7) + 'g</div><div style="font-size:10px;color:var(--text3)">carbos/día</div></div>' +
        '<div><div style="font-size:14px;font-weight:700;color:#ef4444">' + Math.round(weekTotals.fat/7) + 'g</div><div style="font-size:10px;color:var(--text3)">grasas/día</div></div>' +
      '</div>' +
    '</div>';

  container.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
      '<div><div style="font-size:12px;color:var(--text3)">Objetivo: <strong style="color:var(--text2)">'+(GOAL_LABELS[goal]||goal)+'</strong></div>' +
'</div>' +      '<div style="display:flex;gap:6px">' +
'<button onclick="downloadPlanPDF()" style="font-size:11px;color:var(--text2);background:var(--bg4);border:1px solid var(--border);border-radius:8px;padding:5px 10px;cursor:pointer">📄 PDF</button>' +
        '<button onclick="openShoppingList()" style="font-size:11px;color:var(--text2);background:var(--bg4);border:1px solid var(--border);border-radius:8px;padding:5px 10px;cursor:pointer">🛒 Compras</button>' +        '<button onclick="startPlanWizard()" style="font-size:11px;color:var(--accent);background:var(--bg4);border:1px solid var(--border);border-radius:8px;padding:5px 10px;cursor:pointer">🔄 Nuevo plan</button>' +
      '</div>' +
    '</div>' + summaryHtml + daysHtml;
}

// ─── SWAP DESDE PLAN FINAL ────────────────────────────────────────
function openSwapMeal(dayIdx, slot) {
  var plan = loadMealPlan();
  if (!plan||!plan[dayIdx]) return;
  var current = plan[dayIdx].meals[slot];
  var options = _getSwapOptions(current, slot, _getPlanUsedIds(plan));
  var existing = document.getElementById('swapMealSheet'); if(existing) existing.remove();

  var html = options.map(function(m){
    var dK=m.kcal-current.kcal, sK=dK>0?'+':'', dP=m.protein-current.protein, sP=dP>0?'+':'';
    return '<div onclick="swapMeal('+dayIdx+',\''+slot+'\',\''+m.id+'\')" style="padding:12px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;cursor:pointer;background:var(--bg3)">' +
      '<div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px">'+m.name+'</div>' +
      '<div style="font-size:11px;color:var(--text3)">'+m.kcal+' kcal <span style="color:'+(Math.abs(dK)<60?'var(--green)':'var(--text3)')+'">'+sK+dK+'</span> · '+m.protein+'g P <span style="color:'+(Math.abs(dP)<6?'var(--green)':'var(--text3)')+'">'+sP+dP+'g</span></div>'+
    '</div>';
  }).join('');

  var sheet = document.createElement('div');
  sheet.id = 'swapMealSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML = '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px;max-height:80vh;overflow-y:auto">' +
    '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div>' +
    '<div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px">Cambiar '+SLOT_LABELS[slot]+'</div>' +
    '<div style="font-size:11px;color:var(--text3);margin-bottom:16px">'+current.name+'</div>' +
    html +
    '<button onclick="document.getElementById(\'swapMealSheet\').remove()" class="btn btn-ghost" style="width:100%;margin-top:8px">Cancelar</button>' +
    '</div>';
  sheet.addEventListener('click', function(e){ if(e.target===sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

function swapMeal(dayIdx, slot, mealId) {
  var plan = loadMealPlan();
  if (!plan||!plan[dayIdx]) return;
var newMeal = _getAllMeals().find(function(m){ return m.id===mealId; });
  if (!newMeal) { showToast('⚠ No se encontró la comida. Generá un nuevo plan.'); return; }
  plan[dayIdx].meals[slot] = newMeal;
  saveMealPlan(plan);
  var s = document.getElementById('swapMealSheet'); if(s) s.remove();
  _renderPlanFinal(plan);
  showToast('✅ ' + newMeal.name);
}

// ─── USAR HOY ────────────────────────────────────────────────────
function usePlanDay(dayIndex) {
  var plan = loadMealPlan();
  if (!plan||!plan[dayIndex]) return;
  var slotMap = { breakfast:'Desayuno', lunch:'Almuerzo', snack:'Merienda', dinner:'Cena' };
  if (!state[TODAY].foods) state[TODAY].foods = [];
  var added = 0;
  MEAL_SLOTS.forEach(function(slot){
    var meal = plan[dayIndex].meals[slot]; if(!meal) return;
    state[TODAY].foods.push({ id:'plan_'+meal.id+'_'+Date.now()+'_'+slot,
      name:meal.name, kcal:meal.kcal, prot:meal.protein, carb:meal.carbs,
      fat:meal.fats, fiber:meal.fiber||0, g:meal.servingG||1, meal:slotMap[slot], fromPlan:true });
    added++;
  });
  saveState(state); renderHome();
  if (typeof renderMeals==='function') renderMeals();
  showToast('✅ '+added+' comidas cargadas para hoy');
  var s = document.getElementById('mealPlanUseDaySheet'); if(s) s.remove();
  // Navigate to Comida sub-tab so user sees the loaded foods immediately
  var comidaBtn = document.getElementById('subtab-comida');
  if (typeof switchSubtab === 'function') switchSubtab('nutricion', 'comida', comidaBtn);
}
function usePlanSlot(dayIndex, slot) {
  var plan = loadMealPlan();
  if (!plan||!plan[dayIndex]) return;
  var meal = plan[dayIndex].meals[slot]; if (!meal) return;
  var slotMap = { breakfast:'Desayuno', lunch:'Almuerzo', snack:'Merienda', dinner:'Cena' };
  if (!state[TODAY].foods) state[TODAY].foods = [];
  state[TODAY].foods.push({ id:'plan_'+meal.id+'_'+Date.now()+'_'+slot,
    name:meal.name, kcal:meal.kcal, prot:meal.protein, carb:meal.carbs,
    fat:meal.fats, fiber:meal.fiber||0, g:meal.servingG||1, meal:slotMap[slot], fromPlan:true });
  saveState(state); renderHome();
  if (typeof renderMeals==='function') renderMeals();
  showToast('✅ '+meal.name+' cargado');
}

function replacePlanDay(dayIndex) {  // Borrar todas las comidas del día y cargar el plan limpio
  state[TODAY].foods = (state[TODAY].foods || []).filter(function(f) { return false; });
  usePlanDay(dayIndex);
}

function confirmUsePlanDay(dayIndex) {
  var manualFoods = ((state[TODAY]&&state[TODAY].foods)||[]).filter(function(f){ return !f.fromPlan; });
  if (manualFoods.length > 0) {
    var sheet = document.createElement('div');
    sheet.id = 'mealPlanUseDaySheet';
    sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
sheet.innerHTML = '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:24px 20px 32px;width:100%;max-width:480px">' +
      '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 20px"></div>' +
      '<div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px">¿Agregar comidas del plan?</div>' +
      '<div style="font-size:13px;color:var(--text2);margin-bottom:20px">Ya tenés '+manualFoods.length+' comida'+(manualFoods.length>1?'s':'')+' cargada'+(manualFoods.length>1?'s':'')+' hoy.</div>' +
      '<button onclick="usePlanDay('+dayIndex+')" class="btn btn-primary" style="width:100%;margin-bottom:8px">➕ Agregar al día</button>' +
      '<button onclick="replacePlanDay('+dayIndex+')" class="btn btn-ghost" style="width:100%;margin-bottom:8px;border-color:var(--accent);color:var(--accent)">🔄 Reemplazar todo</button>' +
      '<button onclick="document.getElementById(\'mealPlanUseDaySheet\').remove()" class="btn btn-ghost" style="width:100%">Cancelar</button>' +
      '</div>';
    sheet.addEventListener('click', function(e){ if(e.target===sheet) sheet.remove(); });
    document.body.appendChild(sheet);
  } else { usePlanDay(dayIndex); }
}

// ─── LISTA DE COMPRAS CON CANTIDADES EXACTAS ─────────────────────
function openShoppingList() {
  var plan = loadMealPlan();
  if (!plan) { showToast('Primero generá un plan semanal'); return; }
  var existing = document.getElementById('shoppingListSheet'); if(existing){ existing.remove(); return; }

  var totals = {};
  plan.forEach(function(d){
    MEAL_SLOTS.forEach(function(slot){
      var meal = d.meals[slot]; if(!meal) return;
var recipe = _getMealIngredients(meal.id); if(!recipe || !recipe.length) return;
      recipe.forEach(function(ing){
        var key = ing[0].toLowerCase();
        if (!totals[key]) totals[key] = { name:ing[0], cat:ing[2], grams:0 };
        totals[key].grams += ing[1];
      });
    });
  });

  var byCategory = {};
  Object.values(totals).forEach(function(item){
    if (!byCategory[item.cat]) byCategory[item.cat] = [];
    byCategory[item.cat].push(item);
  });
  Object.keys(byCategory).forEach(function(cat){ byCategory[cat].sort(function(a,b){ return a.name.localeCompare(b.name); }); });

  var catOrder = ['Carnes','Pescados y mariscos','Lácteos y huevos','Frutas y verduras','Secos','Enlatados','Panadería','Suplementos','Varios'];
  function fmt(g){ return g>=1000 ? (g/1000).toFixed(1).replace('.0','')+' kg' : g+'g'; }

var savedChecked = _getShopChecked();
  var listHtml = catOrder.filter(function(c){ return byCategory[c]; }).map(function(cat){    return '<div style="margin-bottom:16px">' +
      '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">'+cat+'</div>' +
      byCategory[cat].map(function(item){
        var uid='si_'+item.name.replace(/[^a-z0-9]/gi,'_');
     var isChecked = !!savedChecked[uid];
        var checkStyle = isChecked ? 'background:var(--green);border-color:var(--green);color:#fff' : 'border:2px solid var(--border)';
        var nameStyle  = isChecked ? 'text-decoration:line-through;opacity:0.4' : '';
        return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bg4)">' +
          '<div id="'+uid+'" data-checked="'+(isChecked?'1':'0')+'" onclick="toggleShopItem(this)" style="width:18px;height:18px;border-radius:4px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;'+checkStyle+'">'+(isChecked?'✓':'')+'</div>' +
          '<span style="flex:1;font-size:13px;color:var(--text);'+nameStyle+'">'+item.name+'</span>' +
          '<span style="font-size:12px;font-weight:700;color:var(--accent)">'+fmt(item.grams)+'</span>' +
        '</div>';
      }).join('')+'</div>';
  }).join('');

  var sheet = document.createElement('div');
  sheet.id = 'shoppingListSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML = '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px 20px 32px;width:100%;max-width:480px;max-height:88vh;display:flex;flex-direction:column">' +
    '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px;flex-shrink:0"></div>' +
'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;flex-shrink:0">' +
      '<div style="font-size:15px;font-weight:700;color:var(--text)">🛒 Lista de compras</div>' +
      '<button onclick="_shareShoppingList()" style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:5px 12px;font-size:12px;color:var(--accent);font-weight:600;cursor:pointer">📤 Compartir</button>' +
    '</div>' +
    '<div style="font-size:11px;color:var(--text3);margin-bottom:8px;flex-shrink:0">7 días · tocá para tachar</div>' +
    '<div style="overflow-y:auto;flex:1;padding-top:8px">'+listHtml+'</div>' +
    '<button onclick="document.getElementById(\'shoppingListSheet\').remove()" class="btn btn-primary" style="width:100%;margin-top:16px;flex-shrink:0">Listo</button>' +


    '</div>';
  sheet.addEventListener('click', function(e){ if(e.target===sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

function _getShopChecked() {
  try { return JSON.parse(localStorage.getItem('fittrack_shop_checked') || '{}'); } catch(e) { return {}; }
}
function _setShopChecked(uid, val) {
  var checked = _getShopChecked();
  if (val) checked[uid] = true; else delete checked[uid];
  localStorage.setItem('fittrack_shop_checked', JSON.stringify(checked));
}
function _applyShopItem(el, checked) {
  var sp = el.parentElement && el.parentElement.querySelector('span');
  if (checked) {
    el.setAttribute('data-checked','1'); el.style.background='var(--green)'; el.style.borderColor='var(--green)'; el.textContent='✓'; el.style.color='#fff';
    if (sp) { sp.style.textDecoration='line-through'; sp.style.opacity='0.4'; }
  } else {
    el.setAttribute('data-checked','0'); el.style.background=''; el.style.borderColor='var(--border)'; el.textContent=''; el.style.color='';
    if (sp) { sp.style.textDecoration=''; sp.style.opacity='1'; }
  }
}
function _shareShoppingList() {
  var plan = loadMealPlan();
  if (!plan) return;
  var totals = {};
  plan.forEach(function(d) {
    MEAL_SLOTS.forEach(function(slot) {
      var meal = d.meals[slot]; if (!meal) return;
var recipe = _getMealIngredients(meal.id); if (!recipe || !recipe.length) return;
      recipe.forEach(function(ing) {
        var key = ing[0].toLowerCase();
        if (!totals[key]) totals[key] = { name: ing[0], cat: ing[2], grams: 0 };
        totals[key].grams += ing[1];
      });
    });
  });
  var catOrder = ['Carnes','Pescados y mariscos','Lácteos y huevos','Frutas y verduras','Secos','Enlatados','Panadería','Suplementos','Varios'];
  var byCategory = {};
  Object.values(totals).forEach(function(item) {
    if (!byCategory[item.cat]) byCategory[item.cat] = [];
    byCategory[item.cat].push(item);
  });
  function fmt(g) { return g >= 1000 ? (g/1000).toFixed(1).replace('.0','') + ' kg' : g + 'g'; }
  var text = '🛒 Lista de compras FitTrack — 7 días\n\n';
  catOrder.filter(function(c) { return byCategory[c]; }).forEach(function(cat) {
    text += '── ' + cat.toUpperCase() + ' ──\n';
    byCategory[cat].sort(function(a,b){ return a.name.localeCompare(b.name); }).forEach(function(item) {
      text += '• ' + item.name + ' — ' + fmt(item.grams) + '\n';
    });
    text += '\n';
  });
  text += 'Generado con FitTrack';
  if (navigator.share) {
    navigator.share({ title: 'Lista de compras', text: text }).catch(function(){});
  } else {
    navigator.clipboard.writeText(text).then(function() {
      showToast('📋 Lista copiada al portapapeles');
    }).catch(function() {
      showToast('⚠ No se pudo copiar');
    });
  }
}

function toggleShopItem(el) {
  var uid = el.id;
  var checked = el.getAttribute('data-checked') !== '1';
  _applyShopItem(el, checked);
  _setShopChecked(uid, checked);
}

// ─── SHEET HELPERS ────────────────────────────────────────────────
function _openSheet(content) {
  var existing = document.getElementById('planWizardSheet'); if(existing) existing.remove();
  var sheet = document.createElement('div');
  sheet.id = 'planWizardSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML = '<div style="background:var(--bg2);border-radius:20px 20px 0 0;width:100%;max-width:480px;max-height:92vh;display:flex;flex-direction:column;overflow:hidden">' +
    '<div style="padding:16px 20px 0;flex-shrink:0"><div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 16px"></div></div>' +
    content +
    '</div>';
  document.body.appendChild(sheet);
}
function _closeSheet() { var s=document.getElementById('planWizardSheet'); if(s) s.remove(); }

// ─── ALGORITMO ───────────────────────────────────────────────────
function _getAllMeals() {
  return ALL_FOODS_V3 || [];
}
function _filterMeals() {
  var meals = _getAllMeals();
  var allergies   = _wz.allergies   || [];
  var excluded    = _wz.excluded    || [];
  var unavailable = _wz.unavailable || [];
  var prepTime    = _wz.prepTime    || 'any';
  return meals.filter(function(m) {
    if (excluded.indexOf(m.id) >= 0) return false;
    if (allergies.length) {
      var mTags = m.tags || [];
      if (allergies.some(function(a){ return (ALLERGY_TAGS[a]||[a]).some(function(t){ return mTags.indexOf(t)>=0; }); })) return false;
    }
    if (unavailable.length) {
      var rec = MEAL_RECIPE[m.id];
      if (rec && rec.some(function(i){ return unavailable.some(function(u){ return i[0].toLowerCase().indexOf(u.toLowerCase())>=0; }); })) return false;
    }
    // Tiempo de preparación
    if (prepTime === 'quick'  && (m.prepTime || 99) > 15) return false;
    if (prepTime === 'medium' && (m.prepTime || 99) > 30) return false;
    return true;
  });
}

// Recolecta todos los ingredientes ya usados en el plan parcial
function _getPlanIngredients(plan) {
  var used = {};
  (plan || []).forEach(function(d) {
    MEAL_SLOTS.forEach(function(slot) {
      var meal = d.meals[slot]; if (!meal) return;
      var rec = MEAL_RECIPE[meal.id] || [];
      rec.forEach(function(i){ used[i[0].toLowerCase()] = true; });
    });
  });
  return used;
}


// ═══════════════════════════════════════════════════════════════════
// GENERADOR DE PLAN SEMANAL v4 — Tolerancia ±5% en todos los macros
// Reemplaza _generatePlan() en meal-plan.js
// ═══════════════════════════════════════════════════════════════════

// ─── CONSTANTES ───────────────────────────────────────────────────
var SLOT_DIST_V4 = {
  breakfast: 0.25,
  lunch:     0.35,
  snack:     0.10,
  dinner:    0.30,
};

var MACRO_TOLERANCE = 0.05;

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────
function _generatePlan(targets, goal, freqFoodNames) {
  _recalcMealMacros();
  var eligible = _filterMeals();
  if (eligible.length < 8) eligible = FOOD_DB_V2.complete_meals || [];
  var freqSet = {};
  (freqFoodNames || []).forEach(function(n) { freqSet[n.toLowerCase()] = true; });
  var usedIds = {};
  // Trackers semanales para variado
  var weekProtein = {};  // proteinSource → count por slot
  var weekCategory = {}; // 'slot:category' → count
  var plan = [];
  for (var d = 0; d < 7; d++) {
    var dayResult = _generateDay(targets, eligible, usedIds, freqSet, d, weekProtein, weekCategory);
    dayResult.meals && Object.keys(dayResult.meals).forEach(function(slot) {
      var m = dayResult.meals[slot];
      if (!m) return;
      usedIds[m.id] = (usedIds[m.id] || 0) + 1;
      // Actualizar trackers semanales
      var pKey = slot + ':' + (m.proteinSource || 'none');
      weekProtein[pKey] = (weekProtein[pKey] || 0) + 1;
      var cKey = slot + ':' + (m.category || 'other');
      weekCategory[cKey] = (weekCategory[cKey] || 0) + 1;
    });
    plan.push({ day: d, meals: dayResult.meals });
  }
  return plan;
}

// ─── RECALCULAR MACROS DESDE INGREDIENTES REALES ─────────────────
function _recalcMealMacros() {
  var meals = FOOD_DB_V2.complete_meals || [];
  meals.forEach(function(meal) {
    var recipe = MEAL_RECIPE[meal.id];
    if (!recipe || !recipe.length) return; // sin receta = mantener hardcoded

    var totals = { prot: 0, carb: 0, fat: 0 };
    recipe.forEach(function(ing) {
      var name = ing[0];
      var grams = ing[1];
      // Buscar en FOOD_CATALOG (macros por 100g)
      var catalog = FOOD_CATALOG.find(function(f) {
        return f.name.toLowerCase() === name.toLowerCase();
      });
      if (!catalog) {
        // Fallback: buscar por contains
        catalog = FOOD_CATALOG.find(function(f) {
          return name.toLowerCase().indexOf(f.name.toLowerCase()) >= 0 ||
                 f.name.toLowerCase().indexOf(name.toLowerCase()) >= 0;
        });
      }
      if (catalog) {
        totals.prot += (catalog.prot * grams / 100);
        totals.carb += (catalog.carb * grams / 100);
        totals.fat  += (catalog.fat  * grams / 100);
      }
    });

    var kcal = Math.round(totals.prot * 4 + totals.carb * 4 + totals.fat * 9);
    // Solo actualizar si el cálculo real es razonable (>100 kcal)
    if (kcal > 100) {
      meal.kcal    = kcal;
      meal.protein = Math.round(totals.prot);
      meal.carbs   = Math.round(totals.carb);
      meal.fats    = Math.round(totals.fat);
    }
  });
}
// ─── GENERADOR DE UN DÍA ─────────────────────────────────────────
// ─── GENERADOR DE UN DÍA ─────────────────────────────────────────
function _generateDay(targets, eligible, usedIds, freqSet, dayIndex, weekProtein, weekCategory) {
  weekProtein = weekProtein || {};
  weekCategory = weekCategory || {};  var MAX_ATTEMPTS = 20; // más intentos = más chances de cumplir ±5%
  var bestDay = null;
  var bestError = Infinity;

  for (var attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    var candidate = _tryBuildDay(targets, eligible, usedIds, freqSet, attempt, weekProtein, weekCategory);
    var error = _calcDayError(candidate.meals, targets);

    if (error < bestError) {
      bestError = error;
      bestDay = candidate;
    }

    if (error <= MACRO_TOLERANCE) break;
  }

  // Siempre escalar al target — garantiza ±5% hard
  // Escalar siempre — preservar id original para que _getMealIngredients funcione
  var scaled = _scaleDayToTargets(bestDay, targets);
  var SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];
  SLOTS.forEach(function(slot) {
    if (scaled.meals[slot] && bestDay.meals[slot]) {
      scaled.meals[slot].id = bestDay.meals[slot].id;
    }
  });
  return scaled;
}

// ─── LÍMITES SEMANALES POR VARIEDAD ──────────────────────────────
function _getWeeklyLimits(slot) {
  var variety = _wz.variety || 'balanced';
  if (variety === 'varied') {
    return { maxProtein: 5, maxCategory: 3 };
  } else if (variety === 'mealprep') {
    return { maxProtein: 7, maxCategory: 7 };
  } else {
    return { maxProtein: 6, maxCategory: 4 };
  }
}

// ─── INTENTO DE CONSTRUCCIÓN DE UN DÍA ───────────────────────────
function _tryBuildDay(targets, eligible, usedIds, freqSet, attempt, weekProtein, weekCategory) {
  var meals = {};
  var SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];
  var usedThisDay = {};

  SLOTS.forEach(function(slot) {
    var slotTarget = {
      kcal:    Math.round(targets.kcal    * SLOT_DIST_V4[slot]),
      protein: Math.round(targets.prot    * SLOT_DIST_V4[slot]),
      carbs:   Math.round(targets.carb    * SLOT_DIST_V4[slot]),
      fats:    Math.round(targets.fat     * SLOT_DIST_V4[slot]),
    };
  var limits = _getWeeklyLimits(slot);
    var cands = eligible.filter(function(m) {
      if (m.mealType.indexOf(slot) < 0) return false;
      if (usedThisDay[m.id]) return false;
      var maxRep = _wz.variety === 'varied' ? 1 : _wz.variety === 'mealprep' ? 4 : 2;
      if ((usedIds[m.id] || 0) >= maxRep) return false;
      // Límite semanal de proteinSource por slot
      var pKey = slot + ':' + (m.proteinSource || 'none');
      if ((weekProtein[pKey] || 0) >= limits.maxProtein) return false;
      // Límite semanal de categoría por slot
      var cKey = slot + ':' + (m.category || 'other');
      if ((weekCategory[cKey] || 0) >= limits.maxCategory) return false;
      return true;
    });

if (!cands.length) {
      cands = _getAllMeals().filter(function(m) { return m.mealType.indexOf(slot) >= 0; });
    }
    if (!cands.length) {
      cands = (FOOD_DB_V2.complete_meals || []).filter(function(m) { return m.mealType.indexOf(slot) >= 0; });
    }

    // Scoring: prioriza macros exactos, penaliza repetición, bonifica favoritos
    var scored = cands.map(function(m) {
         var score = _macroScore(m, slotTarget);
      score += (usedIds[m.id] || 0) * 0.30;              // penalidad repetición
      if (freqSet[m.name.toLowerCase()]) score -= 0.10;  // bonus favorito
      if (m.proteinSource === 'pescado') score -= 0.15;  // bonus pescado para que aparezca más
      // En intentos tardíos → más variedad (shuffle parcial)
      if (attempt >= 6) score += Math.random() * 0.20;
      return { meal: m, score: score };
    });

    scored.sort(function(a, b) { return a.score - b.score; });

    // Primeros intentos: tomar el mejor. Intentos medios: pool de 3. Tardíos: pool de 5.
    var poolSize = attempt < 4 ? 1 : attempt < 8 ? 3 : 5;
    poolSize = Math.min(poolSize, scored.length);
    var chosen = scored[Math.floor(Math.random() * poolSize)].meal;
    meals[slot] = chosen;
    usedThisDay[chosen.id] = true; // marcar como usada en este día
  });

  return { meals: meals };
}

// ─── SCORE DE ERROR MACRO (menor = mejor) ────────────────────────
function _macroScore(meal, target) {
  var dK = Math.abs(meal.kcal    - target.kcal)    / Math.max(target.kcal,    1);
  var dP = Math.abs(meal.protein - target.protein) / Math.max(target.protein, 1);
  var dC = Math.abs(meal.carbs   - target.carbs)   / Math.max(target.carbs,   1);
  var dF = Math.abs(meal.fats    - target.fats)    / Math.max(target.fats,    1);
  // Proteína pesa doble: es el macro más crítico en fitness
  return (dK + dP * 2 + dC + dF) / 5;
}

// ─── ERROR DEL DÍA COMPLETO (máximo error entre los 4 macros) ────
// NOTA: targets usa keys {kcal, prot, carb, fat} (getDynamicTargets)
//       meals usa keys {kcal, protein, carbs, fats} (FOOD_DB_V2)
function _calcDayError(meals, targets) {
  var totals = { kcal: 0, prot: 0, carb: 0, fat: 0 };
  var SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];
  SLOTS.forEach(function(slot) {
    var m = meals[slot];
    if (!m) return;
    totals.kcal += m.kcal    || 0;
    totals.prot += m.protein || 0; // key de FOOD_DB_V2
    totals.carb += m.carbs   || 0;
    totals.fat  += m.fats    || 0;
  });
  // targets.prot / targets.carb / targets.fat (keys de getDynamicTargets)
  var eK = Math.abs(totals.kcal - targets.kcal) / Math.max(targets.kcal, 1);
  var eP = Math.abs(totals.prot - targets.prot) / Math.max(targets.prot, 1);
  var eC = Math.abs(totals.carb - targets.carb) / Math.max(targets.carb, 1);
  var eF = Math.abs(totals.fat  - targets.fat)  / Math.max(targets.fat,  1);
  return Math.max(eK, eP * 2, eC, eF); // proteína pesa doble en el error
}

// ─── ESCALADO DE PORCIONES GARANTIZADO ───────────────────────────
// Escala independientemente cada slot para que el día completo
// cumpla exactamente ±5% en kcal Y proteína.
// Estrategia: ajusta kcal via scale global, luego compensa proteína
// moviendo la distribución de slots sin romper el total calórico.
function _scaleDayToTargets(day, targets) {
  var meals = day.meals;
  var SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];

  // Paso 1: calcular totales actuales (usando keys correctas de FOOD_DB_V2)
  var totals = { kcal: 0, prot: 0, carb: 0, fat: 0 };
  SLOTS.forEach(function(slot) {
    var m = meals[slot]; if (!m) return;
    totals.kcal += m.kcal    || 0;
    totals.prot += m.protein || 0;
    totals.carb += m.carbs   || 0;
    totals.fat  += m.fats    || 0;
  });

  if (totals.kcal === 0) return day;

  // Paso 2: factor de escala ponderado — kcal 50%, prot 50%
  // Proteína es el macro más crítico en fitness; darle igual peso que kcal
  var scaleKcal = targets.kcal / Math.max(totals.kcal, 1);
  var scaleProt = targets.prot / Math.max(totals.prot, 1);
  var scale = scaleKcal * 0.5 + scaleProt * 0.5;

  // Limitar a ±40% — porciones más flexibles para alcanzar targets altos de proteína
  scale = Math.max(0.6, Math.min(1.4, scale));

  var scaledMeals = {};
  SLOTS.forEach(function(slot) {
    var m = meals[slot]; if (!m) return;
    scaledMeals[slot] = {
      id:          m.id,
      name:        m.name,
      mealType:    m.mealType,
      tags:        m.tags,
      prepTime:    m.prepTime,
      simplicity:  m.simplicity,
      kcal:        Math.round((m.kcal    || 0) * scale),
      protein:     Math.round((m.protein || 0) * scale),
      carbs:       Math.round((m.carbs   || 0) * scale),
      fats:        Math.round((m.fats    || 0) * scale),
      _scaled:     scale !== 1,
      _scaleFactor:Math.round(scale * 100),
    };
  });

  return { meals: scaledMeals };
}

// ─── VALIDADOR DE PLAN (para usar en UI) ─────────────────────────
// Devuelve un reporte día por día con cumplimiento de macros
function validatePlan(plan, targets) {
  if (!plan || !targets) return null;

  return plan.map(function(day, i) {
    var totals = { kcal: 0, prot: 0, carb: 0, fat: 0 };
    var SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];
    SLOTS.forEach(function(slot) {
      var m = day.meals[slot];
      if (!m) return;
      totals.kcal += m.kcal;
      totals.prot += m.protein;
      totals.carb += m.carbs;
      totals.fat  += m.fats;
    });

    var errK = (totals.kcal - targets.kcal) / targets.kcal * 100;
    var errP = (totals.prot - targets.prot) / targets.prot * 100;
    var errC = (totals.carb - targets.carb) / targets.carb * 100;
    var errF = (totals.fat  - targets.fat)  / targets.fat  * 100;
    var maxErr = Math.max(Math.abs(errK), Math.abs(errP), Math.abs(errC), Math.abs(errF));

    return {
      day:     i,
      totals:  totals,
      errors:  { kcal: errK, prot: errP, carb: errC, fat: errF },
      maxError:maxErr,
      ok:      maxErr <= 5,
    };
  });
}

function _getBestReplacement(currentMeal, slot, plan) {
  var eligible = _filterMeals();
  var usedIds = _getPlanUsedIds(plan);
  var cands = eligible.filter(function(m){ return m.id!==currentMeal.id && m.mealType.indexOf(slot)>=0 && (usedIds[m.id]||0)<2; });
  if (!cands.length) return null;
  var scored = cands.map(function(m){ var dP=Math.abs(m.protein-currentMeal.protein)/Math.max(currentMeal.protein,1); var dK=Math.abs(m.kcal-currentMeal.kcal)/Math.max(currentMeal.kcal,1); return { meal:m, score:(dK+dP*2)/3 }; });
  scored.sort(function(a,b){ return a.score-b.score; });
  return scored[0].meal;
}

function _getSwapOptions(currentMeal, slot, usedIds) {
  var prefs = state.mealPlanPrefs || {};
var eligible = _getAllMeals().filter(function(m){    if (m.id===currentMeal.id) return false;
    if (m.mealType.indexOf(slot)<0) return false;
    var allergies = _wz.allergies.length ? _wz.allergies : (prefs.allergies||[]);
    if (allergies.length) { var t=m.tags||[]; if(allergies.some(function(a){ return (ALLERGY_TAGS[a]||[a]).some(function(at){ return t.indexOf(at)>=0; }); })) return false; }
    return true;
  });
  var scored = eligible.map(function(m){ var dK=Math.abs(m.kcal-currentMeal.kcal)/Math.max(currentMeal.kcal,1), dP=Math.abs(m.protein-currentMeal.protein)/Math.max(currentMeal.protein,1); return { meal:m, score:(dK+dP*2)/3+(usedIds[m.id]||0)*0.15 }; });
  scored.sort(function(a,b){ return a.score-b.score; });
  return scored.slice(0,5).map(function(s){ return s.meal; });
}

// ─── UTILS ───────────────────────────────────────────────────────
// ─── PDF EXPORT ──────────────────────────────────────────────────
var MEAL_PREP = {
  'bk_oat_prot':    'Cocinar avena con leche. Agregar banana en rodajas, mantequilla de maní y proteína. Mezclar bien.',
  'bk_egg_toast':   'Cocinar huevos al gusto. Tostar el pan. Armar tostadas con palta en rodajas, huevo y tomate.',
  'bk_greek_fruit': 'Colocar yogur en un bowl. Agregar granola, arándanos y miel encima. Servir frío.',
  'bk_omelet':      'Batir huevos. Saltear morrón, champiñones y espinaca. Volcar huevos, agregar mozzarella y doblar.',
  'bk_protein_sm':  'Licuar todos los ingredientes hasta obtener una mezcla homogénea. Servir frío.',
  'bk_overnight':   'Mezclar avena, chía y yogur. Refrigerar toda la noche. Servir con arándanos y miel.',
  'bk_smoked_sal':  'Tostar el pan. Untar queso crema, agregar palta y salmón ahumado encima.',
  'bk_quinoa_egg':  'Cocinar quinoa. Saltear espinaca con aceite. Agregar huevo revuelto y mezclar con quinoa.',
  'bk_pancakes':    'Procesar avena, huevo, proteína y leche. Cocinar en sartén antiadherente. Servir con frutillas.',
  'bk_massgain':    'Licuar leche, banana, mantequilla de maní y avena hasta obtener un batido espeso.',
  'ln_ck_rice':     'Cocinar arroz. Grillar pechuga con sal y pimienta. Servir con ensalada de lechuga y tomate.',
  'ln_salmon_sp':   'Hornear salmón 15 min a 200°C. Cocinar batata y brócoli al vapor. Condimentar con aceite.',
  'ln_pasta_beef':  'Cocinar pasta al dente. Dorar carne picada con cebolla y tomate. Mezclar y servir.',
  'ln_lentil_stew': 'Hervir lentejas. Dorar carne con zanahoria, cebolla y papa. Unir y cocinar 20 min.',
  'ln_steak_quin':  'Cocinar quinoa. Grillar bife a gusto. Saltear zapallito y morrón. Servir junto.',
  'ln_burger':      'Formar hamburguesa con carne picada y grillar. Hornear batata en bastones. Armar con pan y ensalada.',
  'ln_ck_chpea':    'Grillar pollo. Cocinar arroz. Saltear garbanzos con cebolla y aceite. Servir todo junto.',
  'ln_tuna_bowl':   'Cocinar quinoa. Escurrir atún. Armar bowl con palta, tomates cherry y aceite.',
  'ln_ck_wrap':     'Grillar pollo en tiras. Calentar tortilla. Armar wrap con pollo, palta, lechuga y tomate.',
  'ln_shrimp_rice': 'Saltear langostinos con ajo y aceite. Cocinar arroz integral. Saltear brócoli. Servir junto.',
  'sn_prot_shake':  'Licuar proteína, banana y leche. Servir frío inmediatamente.',
  'sn_greek_nuts':  'Colocar yogur en un bowl. Agregar nueces picadas y miel. Servir frío.',
  'sn_tuna_bread':  'Tostar pan. Escurrir atún. Armar tostadas con atún y palta.',
  'sn_trail_mix':   'Mezclar frutos secos, chocolate picado y arándanos secos en un bowl.',
  'sn_cottage_fr':  'Colocar cottage en un bowl. Agregar frutillas cortadas y miel.',
  'sn_boiled_eggs': 'Hervir huevos 10 min. Tostar pan. Untar mantequilla de maní. Servir junto.',
  'sn_mass_shake':  'Licuar todos los ingredientes hasta obtener un batido denso. Servir frío.',
  'sn_rice_tuna':   'Escurrir atún. Untar queso crema en galletitas. Colocar atún encima.',
  'dn_salmon_cauf': 'Hornear salmón 15 min a 200°C. Cocinar coliflor y espárragos al vapor con aceite.',
  'dn_ck_broc':     'Grillar pechuga de pollo. Cocinar arroz integral. Cocinar brócoli al vapor con aceite.',
  'dn_beef_quin':   'Cocinar quinoa. Grillar carne. Armar bowl con rúcula, tomates cherry y aceite.',
  'dn_lentil_rice': 'Cocinar lentejas con leche de coco, curry y cebolla 25 min. Cocinar arroz por separado.',
  'dn_turkey_sp':   'Dorar carne de pavo con ajo. Incorporar calabaza en cubos y cocinar 20 min.',
  'dn_cod_veg':     'Hornear merluza 15 min. Cocinar zanahoria, zapallito y arroz blanco al vapor.',
  'dn_pasta_ck':    'Cocinar pasta. Grillar pollo en tiras. Mezclar con pesto y tomates cherry.',
  'dn_egg_potato':  'Cocinar papa en cubos. Saltear cebolla. Agregar huevos batidos y cocinar revuelto.',
  'dn_curry_ck':    'Dorar pollo con cebolla. Agregar leche de coco y curry. Cocinar 20 min. Servir con arroz.',
  'dn_chicken_soup':'Hervir pollo con zanahoria, cebolla y apio 30 min. Agregar fideos y cocinar 10 min más.',
  'dn_whites_bat':  'Cocinar batata al horno. Saltear espinaca. Cocinar claras revueltas con aceite.',
  'dn_tofu_wok':    'Saltear tofu en cubos. Agregar edamame, ajo y salsa de soja. Servir con arroz integral.',
};

function downloadPlanPDF() {
  var plan = loadMealPlan();
  if (!plan) { showToast('No hay plan guardado'); return; }

  var html = '<html><head><meta charset="utf-8"><title>Plan Semanal FitTrack</title><style>' +
    'body{font-family:Arial,sans-serif;color:#1a1a1a;padding:24px;max-width:800px;margin:0 auto}' +
    'h1{font-size:22px;margin-bottom:4px}' +
    '.subtitle{font-size:12px;color:#666;margin-bottom:28px}' +
    '.day{margin-bottom:28px;page-break-inside:avoid}' +
    '.day-title{font-size:16px;font-weight:700;border-bottom:2px solid #222;padding-bottom:4px;margin-bottom:12px}' +
    '.meal{margin-bottom:14px;padding:10px 12px;border:1px solid #ddd;border-radius:8px}' +
    '.meal-header{font-size:13px;font-weight:700;margin-bottom:2px}' +
    '.meal-slot{font-size:11px;color:#888;margin-bottom:6px}' +
    '.meal-macros{font-size:11px;color:#555;margin-bottom:8px}' +
    '.ing-title{font-size:11px;font-weight:700;color:#333;margin-bottom:4px}' +
    '.ing-row{display:flex;justify-content:space-between;font-size:11px;padding:2px 0;border-bottom:1px solid #f0f0f0}' +
    '.prep-title{font-size:11px;font-weight:700;color:#333;margin-top:8px;margin-bottom:3px}' +
    '.prep{font-size:11px;color:#444;line-height:1.5}' +
    '@media print{body{padding:12px}.day{page-break-inside:avoid}}' +
  '</style></head><body>';

  html += '<h1>🥗 Plan Semanal de Comidas</h1>';
  html += '<div class="subtitle">Generado con FitTrack · ' + new Date().toLocaleDateString('es-AR') + '</div>';

  var slotLabelsClean = { breakfast:'Desayuno', lunch:'Almuerzo', snack:'Merienda', dinner:'Cena' };

  plan.forEach(function(dayPlan, i) {
    html += '<div class="day"><div class="day-title">' + DAY_NAMES[i] + '</div>';
    MEAL_SLOTS.forEach(function(slot) {
      var meal = dayPlan.meals[slot]; if (!meal) return;
var ing = _getMealIngredients(meal.id);
      var prep = _getMealPrep(meal.id);
      html += '<div class="meal">';
      html += '<div class="meal-slot">' + slotLabelsClean[slot] + '</div>';
      html += '<div class="meal-header">' + meal.name + '</div>';
      html += '<div class="meal-macros">' + meal.kcal + ' kcal · ' + meal.protein + 'g proteína · ' + meal.carbs + 'g carbos · ' + meal.fats + 'g grasas</div>';
      if (ing.length) {
        html += '<div class="ing-title">Ingredientes</div>';
        ing.forEach(function(r) {
          html += '<div class="ing-row"><span>' + r[0] + '</span><span>' + r[1] + 'g</span></div>';
        });
      }
      if (prep) {
        html += '<div class="prep-title">Preparación</div>';
        html += '<div class="prep">' + prep + '</div>';
      }
      html += '</div>';
    });
    html += '</div>';
  });

  html += '</body></html>';

  var blob = new Blob([html], { type: 'text/html' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'plan-semanal-fittrack.html';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('📄 Plan descargado');
}

// ─── UTILS ───────────────────────────────────────────────────────
function saveMealPlan(plan) { if(!state.mealPlan) state.mealPlan={}; state.mealPlan.plan=plan; state.mealPlan.generatedAt=TODAY; saveState(state); }
function loadMealPlan() { return (state.mealPlan&&state.mealPlan.plan) ? state.mealPlan.plan : null; }
function _getPlanUsedIds(plan) { var u={}; (plan||[]).forEach(function(d){ MEAL_SLOTS.forEach(function(s){ var m=d.meals[s]; if(m) u[m.id]=(u[m.id]||0)+1; }); }); return u; }
function _calcDayTotals(meals) { var t={kcal:0,protein:0,carbs:0,fats:0}; MEAL_SLOTS.forEach(function(s){ var m=meals[s]; if(!m) return; t.kcal+=m.kcal; t.protein+=m.protein; t.carbs+=m.carbs; t.fats+=m.fats; }); return {kcal:Math.round(t.kcal),prot:Math.round(t.protein),carb:Math.round(t.carbs),fat:Math.round(t.fats)}; }
function generateAndRenderPlan() { startPlanWizard(); } // alias para compatibilidad

function _renderMacroBar(totals, targets) {
  return '<div style="display:flex;gap:6px;margin-top:10px">' +
    [['P',totals.prot,targets.prot,'#3b82f6'],['C',totals.carb,targets.carb,'#f59e0b'],['G',totals.fat,targets.fat,'#ef4444']].map(function(b){
      var pct=Math.min(100,Math.round(b[1]/Math.max(b[2],1)*100)), diff=b[1]-b[2], sign=diff>0?'+':'';
      return '<div style="flex:1"><div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);margin-bottom:2px"><span>'+b[0]+' '+b[1]+'g</span><span style="color:'+(Math.abs(diff)<b[2]*0.1?'var(--green)':'var(--text3)')+'">'+sign+diff+'g</span></div><div style="height:4px;background:var(--bg4);border-radius:2px"><div style="height:4px;width:'+pct+'%;background:'+b[3]+';border-radius:2px"></div></div></div>';
    }).join('')+'</div>';
}