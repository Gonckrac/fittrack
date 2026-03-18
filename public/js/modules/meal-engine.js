// ═══════════════════════════════════════════════════════════════════════════════
// NUTRITION & MEAL SUGGESTION ENGINE v2.0
// Architecture: Dynamic remaining-macro scoring with meal-slot budgeting
// ═══════════════════════════════════════════════════════════════════════════════

// ─── MEAL SLOTS & TYPICAL DISTRIBUTION ───────────────────────────────────────
// Percentage of daily macros typically consumed per meal
// These are SOFT targets — the system adapts based on what's already eaten
const MEAL_DISTRIBUTION = {
  breakfast: { kcalPct:0.25, label:'Breakfast', emoji:'🌅', hour:[6,11]  },
  lunch:     { kcalPct:0.35, label:'Lunch',     emoji:'☀️',  hour:[11,15] },
  snack:     { kcalPct:0.15, label:'Snack',     emoji:'🍎', hour:[15,19] },
  dinner:    { kcalPct:0.25, label:'Dinner',    emoji:'🌙', hour:[19,24]  },
};

// ─── MACRO SCORING WEIGHTS ────────────────────────────────────────────────────
// Protein is the priority macro — especially important for body composition
// These weights control how much each macro deviation penalizes the score
const MACRO_WEIGHTS = {
  protein: 0.45,  // Highest priority — muscle retention/growth
  carbs:   0.25,  // Important but more flexible
  fats:    0.15,  // Least likely to cause issues if slightly off
  kcal:    0.15,  // Calorie match
};

// ─── CORE ALGORITHM ─────────────────────────────────────────────────────────
/**
 * Calculates remaining macros and returns ranked meal suggestions.
 * 
 * This is the CRITICAL improvement over v1:
 * Instead of dividing daily targets by 4 (fixed),
 * we calculate ACTUAL remaining macros after what was already eaten,
 * then score meals by how well they fit the remainder.
 * 
 * @param {Object} params
 *   dailyTargets  {Object}  - { kcal, protein, carbs, fats }
 *   eaten         {Array}   - Foods consumed today [{ kcal, protein, carbs, fats }]
 *   mealSlot      {string}  - 'breakfast'|'lunch'|'snack'|'dinner'|'all'
 *   allergies     {Array}   - Tag strings to exclude
 *   dislikes      {Array}   - Tag strings to exclude (softer)
 *   mealCount     {number}  - Expected total meals today (default: 4)
 * 
 * @returns {Object} { suggestions, remainingMacros, alreadyConsumed, budgetForSlot }
 */
function getMealSuggestions(params) {
  var targets   = params.dailyTargets;
  var eaten     = params.eaten        || [];
  var mealSlot  = params.mealSlot     || 'all';
  var allergies = params.allergies    || [];
  var dislikes  = params.dislikes     || [];
  var mealCount = params.mealCount    || 4;

  // ── Step 1: Calculate what has already been consumed ──────────────────────
  var consumed = sumFoods(eaten);

  // ── Step 2: Calculate remaining macros ────────────────────────────────────
  var remaining = {
    kcal:    Math.max(0, targets.kcal    - consumed.kcal),
    protein: Math.max(0, targets.protein - consumed.protein),
    carbs:   Math.max(0, targets.carbs   - consumed.carbs),
    fats:    Math.max(0, targets.fats    - consumed.fats),
  };

  // ── Step 3: Calculate budget for THIS specific meal slot ──────────────────
  // How many meals remain in the day (including this one)?
  var mealsRemaining = estimateMealsRemaining(mealSlot, mealCount);
  
  // Budget = remaining macros / meals remaining (but not less than 1)
  var slotBudget = {
    kcal:    mealsRemaining > 0 ? remaining.kcal    / mealsRemaining : remaining.kcal,
    protein: mealsRemaining > 0 ? remaining.protein / mealsRemaining : remaining.protein,
    carbs:   mealsRemaining > 0 ? remaining.carbs   / mealsRemaining : remaining.carbs,
    fats:    mealsRemaining > 0 ? remaining.fats    / mealsRemaining : remaining.fats,
  };

  // If targets already met, show small/zero-calorie options
  var targetsComplete = consumed.kcal >= targets.kcal * 0.97;

  // ── Step 4: Filter food pool ───────────────────────────────────────────────
  var allFoods = typeof ALL_FOODS !== 'undefined' ? ALL_FOODS : [];
  var filtered = allFoods.filter(function(food) {
    // Filter by allergies (hard exclude)
    var tags = food.tags || [];
    if (allergies.some(function(a) { return tags.indexOf(a) >= 0; })) return false;
    // Filter by dislikes (hard exclude — user preference is always respected)
    if (dislikes.some(function(d) { return tags.indexOf(d) >= 0; })) return false;
    // Filter by meal type if slot specified
    if (mealSlot !== 'all' && food.mealType) {
      if (food.mealType.indexOf(mealSlot) < 0 && food.mealType.indexOf('all') < 0) return false;
    }
    return true;
  });

  // ── Step 5: Score each food by macro fit ──────────────────────────────────
  var scored = filtered.map(function(food) {
    var score = scoreFoodForMacros(food, slotBudget, remaining, targetsComplete);
    return Object.assign({}, food, { _score: score, _budget: slotBudget });
  });

  // ── Step 6: Sort by score and return top suggestions ──────────────────────
  var suggestions = scored
    .sort(function(a, b) { return b._score - a._score; })
    .slice(0, 12);

  return {
    suggestions:    suggestions,
    consumed:       consumed,
    remaining:      remaining,
    slotBudget:     slotBudget,
    targetsComplete:targetsComplete,
    targets:        targets,
  };
}

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────
/**
 * Scores a food item based on how well it fits remaining macro targets.
 * 
 * Key principle: 
 * - We reward foods that MATCH the slot budget (not just "are they healthy")
 * - We penalize foods that would OVERSHOOT remaining targets
 * - Protein is weighted highest because it's the hardest macro to adjust
 */
function scoreFoodForMacros(food, slotBudget, remaining, targetsComplete) {
  // Handle complete meals (fixed macros) vs individual foods (per 100g, scaled)
  var kcal    = food.kcal    || 0;
  var protein = food.protein || food.p || 0;
  var carbs   = food.carbs   || food.c || 0;
  var fats    = food.fats    || food.f || 0;

  // Scale individual foods by their serving size if specified
  if (food.servingG && food.category !== 'complete') {
    var scale = food.servingG / 100;
    kcal    = Math.round(kcal    * scale);
    protein = Math.round(protein * scale);
    carbs   = Math.round(carbs   * scale);
    fats    = Math.round(fats    * scale);
  }

  var score = 0;

  // If targets already complete, heavily penalize high-calorie foods
  if (targetsComplete) {
    score -= kcal * 0.1;
    return score;
  }

  // ── CALORIE SCORE ─────────────────────────────────────────────────────────
  var kcalBudget = slotBudget.kcal;
  if (kcalBudget > 50) {
    var kcalDeviation = Math.abs(kcal - kcalBudget) / kcalBudget;
    score += MACRO_WEIGHTS.kcal * 100 * Math.max(0, 1 - kcalDeviation);
    // Hard penalty: exceeds remaining day's calories
    if (kcal > remaining.kcal * 1.1) score -= 25;
    // Moderate penalty: exceeds slot budget significantly
    if (kcal > kcalBudget * 1.5) score -= 15;
  }

  // ── PROTEIN SCORE (highest weight) ───────────────────────────────────────
  var protBudget = slotBudget.protein;
  if (protBudget > 0) {
    var protDeviation = Math.abs(protein - protBudget) / Math.max(1, protBudget);
    score += MACRO_WEIGHTS.protein * 100 * Math.max(0, 1 - protDeviation);
    // Bonus for HIGH protein relative to calories (protein density)
    if (kcal > 0) {
      var protDensity = (protein * 4) / kcal; // % of calories from protein
      if (protDensity > 0.35) score += 10;     // >35% protein calories = bonus
    }
    // Penalty if protein would overshoot daily target
    if (protein > remaining.protein * 1.2) score -= 10;
  } else if (remaining.protein <= 0) {
    // Daily protein met — reward low-protein options
    score += protein <= 5 ? 15 : 0;
  }

  // ── CARBS SCORE ───────────────────────────────────────────────────────────
  var carbsBudget = slotBudget.carbs;
  if (carbsBudget > 0) {
    var carbsDeviation = Math.abs(carbs - carbsBudget) / Math.max(1, carbsBudget);
    score += MACRO_WEIGHTS.carbs * 100 * Math.max(0, 1 - carbsDeviation);
    // Penalty for large carb overshoot (e.g. on low-carb diets)
    if (carbs > remaining.carbs * 1.3) score -= 20;
  } else if (remaining.carbs <= 0) {
    // Daily carbs met — reward low-carb options
    score += carbs <= 10 ? 10 : Math.max(0, 10 - carbs * 0.5);
  }

  // ── FATS SCORE ────────────────────────────────────────────────────────────
  var fatsBudget = slotBudget.fats;
  if (fatsBudget > 0) {
    var fatsDeviation = Math.abs(fats - fatsBudget) / Math.max(1, fatsBudget);
    score += MACRO_WEIGHTS.fats * 100 * Math.max(0, 1 - fatsDeviation);
    if (fats > remaining.fats * 1.4) score -= 12;
  }

  // ── TIME OF DAY BONUS ─────────────────────────────────────────────────────
  var hour = new Date().getHours();
  Object.entries(MEAL_DISTRIBUTION).forEach(function(entry) {
    var slot     = entry[0];
    var slotInfo = entry[1];
    var foodMealType = food.mealType || [];
    if (foodMealType.indexOf(slot) >= 0 && hour >= slotInfo.hour[0] && hour < slotInfo.hour[1]) {
      score += 8;
    }
  });

  // ── PREP TIME BONUS (convenience) ─────────────────────────────────────────
  if (food.prepTime !== undefined) {
    if (food.prepTime === 0) score += 5;
    else if (food.prepTime <= 5) score += 3;
  }

  return Math.round(score);
}

// ─── DYNAMIC MEAL COMPOSER ────────────────────────────────────────────────────
/**
 * Builds a complete meal from components (protein + carb + fat + veg).
 * Used when user wants to construct a meal rather than pick a preset.
 * 
 * Returns a scored combination that best fits remaining macros.
 */
function composeMeal(params) {
  var remaining = params.remaining;
  var allergies = params.allergies || [];
  var dislikes  = params.dislikes  || [];

  var allFoods = typeof ALL_FOODS !== 'undefined' ? ALL_FOODS : [];
  var getCategory = function(cat) {
    return allFoods.filter(function(f) {
      var tags = f.tags || [];
      if (allergies.some(function(a) { return tags.indexOf(a) >= 0; })) return false;
      if (dislikes.some(function(d) { return tags.indexOf(d) >= 0; })) return false;
      return f.category === cat;
    });
  };

  var proteins    = getCategory('protein');
  var carbs       = getCategory('carb');
  var fats_foods  = getCategory('fat');
  var vegetables  = getCategory('vegetable');

  // Score each component for macro fit, then pick best combination
  var bestProtein = proteins.sort(function(a, b) {
    var scoreA = scoreFoodForMacros(a, { protein: remaining.protein * 0.5, kcal: remaining.kcal * 0.4 }, remaining, false);
    var scoreB = scoreFoodForMacros(b, { protein: remaining.protein * 0.5, kcal: remaining.kcal * 0.4 }, remaining, false);
    return scoreB - scoreA;
  })[0];

  var bestCarb = carbs.sort(function(a, b) {
    var scoreA = scoreFoodForMacros(a, { carbs: remaining.carbs * 0.5, kcal: remaining.kcal * 0.3 }, remaining, false);
    var scoreB = scoreFoodForMacros(b, { carbs: remaining.carbs * 0.5, kcal: remaining.kcal * 0.3 }, remaining, false);
    return scoreB - scoreA;
  })[0];

  var bestFat = fats_foods.sort(function(a, b) {
    var scoreA = scoreFoodForMacros(a, { fats: remaining.fats * 0.5, kcal: remaining.kcal * 0.15 }, remaining, false);
    var scoreB = scoreFoodForMacros(b, { fats: remaining.fats * 0.5, kcal: remaining.kcal * 0.15 }, remaining, false);
    return scoreB - scoreA;
  })[0];

  var bestVeg = vegetables[0]; // Low-calorie, just pick most common

  var components = [bestProtein, bestCarb, bestFat, bestVeg].filter(Boolean);
  var totals = sumFoods(components.map(function(f) {
    var scale = (f.servingG || 100) / 100;
    return {
      kcal:    (f.kcal    || 0) * scale,
      protein: (f.protein || 0) * scale,
      carbs:   (f.carbs   || 0) * scale,
      fats:    (f.fats    || 0) * scale,
    };
  }));

  return {
    components: components,
    totals:     totals,
  };
}

// ─── DAILY MACRO DEFICIT REPORT ───────────────────────────────────────────────
/**
 * Returns a structured report of daily progress vs targets.
 * Used by the UI to show "what you still need today".
 */
function getDailyMacroReport(targets, eaten) {
  var consumed = sumFoods(eaten);
  var remaining = {
    kcal:    targets.kcal    - consumed.kcal,
    protein: targets.protein - consumed.protein,
    carbs:   targets.carbs   - consumed.carbs,
    fats:    targets.fats    - consumed.fats,
  };

  var pct = {
    kcal:    Math.min(100, Math.round((consumed.kcal    / targets.kcal)    * 100)),
    protein: Math.min(100, Math.round((consumed.protein / targets.protein) * 100)),
    carbs:   Math.min(100, Math.round((consumed.carbs   / targets.carbs)   * 100)),
    fats:    Math.min(100, Math.round((consumed.fats    / targets.fats)    * 100)),
  };

  var status = {
    kcal:    getStatus(pct.kcal),
    protein: getStatus(pct.protein),
    carbs:   getStatus(pct.carbs),
    fats:    getStatus(pct.fats),
  };

  return { consumed, remaining, pct, status, targets };
}

function getStatus(pct) {
  if (pct >= 95) return 'complete';
  if (pct >= 75) return 'good';
  if (pct >= 50) return 'moderate';
  return 'low';
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function sumFoods(foods) {
  return foods.reduce(function(acc, f) {
    acc.kcal    += +(f.kcal    || 0);
    acc.protein += +(f.protein || f.prot || f.p || 0);
    acc.carbs   += +(f.carbs   || f.carb || f.c || 0);
    acc.fats    += +(f.fats    || f.fat  || f.f || 0);
    return acc;
  }, { kcal:0, protein:0, carbs:0, fats:0 });
}

function estimateMealsRemaining(mealSlot, totalMeals) {
  var MEAL_ORDER = ['breakfast','lunch','snack','dinner'];
  var idx = MEAL_ORDER.indexOf(mealSlot);
  if (idx < 0) return totalMeals; // 'all' or unknown
  // Meals remaining = total - meals already expected to have passed
  return Math.max(1, totalMeals - idx);
}
