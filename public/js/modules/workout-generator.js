// ═══════════════════════════════════════════════════════════════════════════════
// WORKOUT ROUTINE GENERATOR — OVERHAULED ENGINE v2.0
// Evidence: Schoenfeld 2010/2016/2021 · Krieger 2010 · Israetel MEV/MAV/MRV
//           Grgic 2018/2019 · Ratamess 2009 · Helms 2014 · Colquhoun 2018
// ═══════════════════════════════════════════════════════════════════════════════

// ─── MUSCLE METADATA ─────────────────────────────────────────────────────────
const MUSCLE_META = [
  { id:'chest',      label:'Chest',       emoji:'🫁', group:'upper', role:'push'  },
  { id:'back',       label:'Back',        emoji:'🏋️', group:'upper', role:'pull'  },
  { id:'shoulders',  label:'Shoulders',   emoji:'🔷', group:'upper', role:'push'  },
  { id:'biceps',     label:'Biceps',      emoji:'💪', group:'upper', role:'pull'  },
  { id:'triceps',    label:'Triceps',     emoji:'〽️', group:'upper', role:'push'  },
  { id:'quads',      label:'Quads',       emoji:'🦵', group:'lower', role:'lower' },
  { id:'hamstrings', label:'Hamstrings',  emoji:'🔩', group:'lower', role:'lower' },
  { id:'glutes',     label:'Glutes',      emoji:'🍑', group:'lower', role:'lower' },
  { id:'calves',     label:'Calves',      emoji:'🦶', group:'lower', role:'lower' },
  { id:'abs',        label:'Abs / Core',  emoji:'⬡',  group:'core',  role:'core'  },
  { id:'traps',      label:'Traps',       emoji:'🏔️', group:'upper', role:'pull'  },
  { id:'forearms',   label:'Forearms',    emoji:'🦾', group:'upper', role:'pull'  },
];

// ─── WEEKLY VOLUME TARGETS (MEV/MAV/MRV) per muscle ─────────────────────────
// Source: Israetel & James (RP Hypertrophy), adjusted by goal
// MEV = Minimum Effective Volume | MAV = Maximum Adaptive Volume | MRV = Max Recoverable
const BASE_VOLUME = {
  chest:      { mev:8,  mav:16, mrv:22 },
  back:       { mev:10, mav:18, mrv:25 },
  shoulders:  { mev:6,  mav:16, mrv:22 },
  biceps:     { mev:6,  mav:14, mrv:20 },
  triceps:    { mev:6,  mav:14, mrv:20 },
  abs:        { mev:6,  mav:16, mrv:25 },
  forearms:   { mev:4,  mav:10, mrv:16 },
  glutes:     { mev:6,  mav:16, mrv:22 },
  quads:      { mev:8,  mav:16, mrv:22 },
  hamstrings: { mev:6,  mav:12, mrv:20 },
  calves:     { mev:6,  mav:16, mrv:24 },
  traps:      { mev:4,  mav:12, mrv:18 },
};

// Goal-based volume multiplier: hypertrophy stays at 1.0 (reference)
const VOLUME_GOAL_MULTIPLIER = {
  hypertrophy:   1.0,
  strength:      0.7,  // Lower total volume, higher intensity
  fat_loss:      0.85, // Maintain muscle with moderate volume
  general:       0.75,
};

// ─── SETS PER SESSION (Krieger 2010: 4-6 sets/muscle/session optimal) ────────
const SETS_PER_SESSION = {
  beginner:     { compound: 3, isolation: 2 },
  intermediate: { compound: 4, isolation: 3 },
  advanced:     { compound: 5, isolation: 4 },
};

// ─── REP ZONES (Schoenfeld 2017: 6-30 reps near failure all effective) ───────
// Morton 2016: 30-80% 1RM effective when taken to failure
const REP_ZONES = {
  strength:    { compound:'2-5',   isolation:'5-8',   desc:'Max strength. Heavy, low reps.' },
  hypertrophy: { compound:'6-10',  isolation:'10-15', desc:'Muscle growth. Moderate load.' },
  fat_loss:    { compound:'10-15', isolation:'15-20', desc:'Metabolic stress, circuit-style.' },
  general:     { compound:'8-12',  isolation:'12-15', desc:'General fitness balance.' },
};

// ─── REST TIMES (Schoenfeld 2016: 3min > 1min for hypertrophy/strength) ──────
const REST_TIMES = {
  compound_strength:     { seconds:210, label:'3.5 min' },
  compound_hypertrophy:  { seconds:150, label:'2.5 min' },
  compound_fat_loss:     { seconds:90,  label:'90 sec' },
  compound_general:      { seconds:120, label:'2 min'   },
  isolation_hypertrophy: { seconds:90,  label:'90 sec'  },
  isolation_strength:    { seconds:120, label:'2 min'   },
  isolation_fat_loss:    { seconds:60,  label:'60 sec'  },
  isolation_general:     { seconds:75,  label:'75 sec'  },
  core:                  { seconds:60,  label:'60 sec'  },
};

// ─── TIME ESTIMATION ──────────────────────────────────────────────────────────
// Execution time per set (seconds): includes setup + actual work
const SET_EXECUTION_TIME = {
  compound_strength:     90,  // Heavy compounds take longer
  compound_hypertrophy:  75,
  compound_fat_loss:     50,
  compound_general:      60,
  isolation_any:         40,
  core:                  35,
};

// ─── SPLIT TEMPLATES by days ──────────────────────────────────────────────────
// Maps day count + muscle selection context → optimal split structure
function selectOptimalSplit(days, pushMuscles, pullMuscles, lowerMuscles, coreMuscles) {
  var hasUpper = pushMuscles.length > 0 || pullMuscles.length > 0;
  var hasLower = lowerMuscles.length > 0;
  var hasCore  = coreMuscles.length > 0;

  // Pure lower body program
  if (!hasUpper && hasLower) {
    return buildLowerOnlySplit(days, lowerMuscles, coreMuscles);
  }

  // Pure upper body program
  if (hasUpper && !hasLower) {
    return buildUpperOnlySplit(days, pushMuscles, pullMuscles, coreMuscles);
  }

  // Full body programs
  switch (days) {
    case 2: return buildFullBodySplit(2, pushMuscles, pullMuscles, lowerMuscles, coreMuscles);
    case 3: return pushMuscles.length > 0 && pullMuscles.length > 0
                   ? buildPPLSplit(pushMuscles, pullMuscles, lowerMuscles, coreMuscles)
                   : buildFullBodySplit(3, pushMuscles, pullMuscles, lowerMuscles, coreMuscles);
    case 4: return buildUpperLowerSplit(pushMuscles, pullMuscles, lowerMuscles, coreMuscles);
    case 5: return buildPPLPlusSplit(pushMuscles, pullMuscles, lowerMuscles, coreMuscles);
    case 6: return buildPPLx2Split(pushMuscles, pullMuscles, lowerMuscles, coreMuscles);
    default: return buildFullBodySplit(Math.min(days, 3), pushMuscles, pullMuscles, lowerMuscles, coreMuscles);
  }
}

// Full Body — maximizes frequency, best for beginners
function buildFullBodySplit(days, P, U, L, C) {
  var all = _unique(P.concat(U).concat(L).concat(C));
  var result = [];
  var suffix = ['A','B','C'];
  for (var i = 0; i < days; i++) {
    result.push({ name: 'Full Body ' + suffix[i], muscles: all.slice() });
  }
  return result;
}

// PPL — Push/Pull/Legs, ideal for 3-6 days
function buildPPLSplit(P, U, L, C) {
  var push = _unique(P.concat(C));
  var pull = _unique(U.concat(C));
  var legs = _unique(L.concat(C));
  return [
    { name: 'Push — ' + _nameList(P),    muscles: push },
    { name: 'Pull — ' + _nameList(U),    muscles: pull },
    { name: 'Legs — ' + _nameList(L),    muscles: legs },
  ];
}

// Upper/Lower — 4 days, gold standard for hypertrophy (Schoenfeld 2017)
function buildUpperLowerSplit(P, U, L, C) {
  var upper = _unique(P.concat(U).concat(C));
  var lower = _unique(L.concat(C));
  var quadDom = L.filter(function(m) { return m === 'quads' || m === 'glutes'; });
  var hamDom  = L.filter(function(m) { return m === 'hamstrings' || m === 'glutes'; });
  return [
    { name: 'Upper A — Strength Focus',    muscles: upper.slice() },
    { name: 'Lower A — Quad Dominant',     muscles: _unique(quadDom.concat(C)).length ? _unique(quadDom.concat(C)) : lower.slice() },
    { name: 'Upper B — Volume Focus',      muscles: upper.slice() },
    { name: 'Lower B — Posterior Chain',   muscles: _unique(hamDom.concat(C)).length ? _unique(hamDom.concat(C)) : lower.slice() },
  ];
}

// PPL + Upper/Lower hybrid for 5 days
function buildPPLPlusSplit(P, U, L, C) {
  var upper = _unique(P.concat(U).concat(C));
  var quadDom = L.filter(function(m) { return m === 'quads' || m === 'glutes'; });
  var hamDom  = L.filter(function(m) { return m === 'hamstrings' || m === 'glutes'; });
  if (!quadDom.length) quadDom = L;
  if (!hamDom.length)  hamDom  = L;
  return [
    { name: 'Push A — ' + _nameList(P),   muscles: _unique(P.concat(C)) },
    { name: 'Pull A — ' + _nameList(U),   muscles: _unique(U.concat(C)) },
    { name: 'Legs A — Quad Focus',         muscles: _unique(quadDom.concat(C)) },
    { name: 'Upper X — Compound Strength', muscles: upper.slice() },
    { name: 'Legs B — Posterior Focus',    muscles: _unique(hamDom.concat(C)) },
  ];
}

// PPL x2 for 6 days — max volume, frequency 2x
function buildPPLx2Split(P, U, L, C) {
  var quadDom = L.filter(function(m) { return m === 'quads' || m === 'glutes'; });
  var hamDom  = L.filter(function(m) { return m === 'hamstrings' || m === 'glutes'; });
  if (!quadDom.length) quadDom = L;
  if (!hamDom.length)  hamDom  = L;
  return [
    { name: 'Push A — Chest Priority',    muscles: _unique(P.concat(C)) },
    { name: 'Pull A — Back Width',         muscles: _unique(U.concat(C)) },
    { name: 'Legs A — Quad + Glutes',      muscles: _unique(quadDom.concat(C)) },
    { name: 'Push B — Shoulder Priority', muscles: _unique(P.concat(C)) },
    { name: 'Pull B — Back Thickness',    muscles: _unique(U.concat(C)) },
    { name: 'Legs B — Hamstrings + Core', muscles: _unique(hamDom.concat(C)) },
  ];
}

// Lower-only programs
function buildLowerOnlySplit(days, L, C) {
  var qDom = L.filter(function(m) { return ['quads','glutes'].indexOf(m) >= 0; });
  var hDom = L.filter(function(m) { return ['hamstrings','glutes'].indexOf(m) >= 0; });
  var full = _unique(L.concat(C));
  if (!qDom.length) qDom = L;
  if (!hDom.length) hDom = L;
  if (days <= 2)  return [{ name:'Lower A — Full', muscles:full }, { name:'Lower B — Full', muscles:full.slice() }];
  if (days === 3) return [{ name:'Lower A — Quads', muscles:_unique(qDom.concat(C))}, {name:'Lower B — Hamstrings', muscles:_unique(hDom.concat(C))}, {name:'Lower C — Full',muscles:full}];
  return [
    { name:'Legs A — Quad Dominant',  muscles:_unique(qDom.concat(C)) },
    { name:'Legs B — Posterior Chain',muscles:_unique(hDom.concat(C)) },
    { name:'Legs C — Glute Focus',    muscles:_unique(L.filter(function(m){return m!=='calves';}).concat(C)) },
    { name:'Legs D — Volume + Core',  muscles:full },
  ].slice(0, days);
}

// Upper-only programs
function buildUpperOnlySplit(days, P, U, C) {
  var push = _unique(P.concat(C));
  var pull = _unique(U.concat(C));
  var all  = _unique(P.concat(U).concat(C));
  if (days <= 2) return [{ name:'Upper A', muscles:all }, { name:'Upper B', muscles:all.slice() }];
  if (days === 3) return [{ name:'Push', muscles:push}, {name:'Pull', muscles:pull}, {name:'Upper X', muscles:all}];
  return [
    { name:'Push A', muscles:push.slice() }, { name:'Pull A', muscles:pull.slice() },
    { name:'Push B', muscles:push.slice() }, { name:'Pull B', muscles:pull.slice() },
  ].slice(0, days);
}

// ─── MAIN GENERATOR FUNCTION ─────────────────────────────────────────────────
/**
 * Generates a full workout routine based on user parameters.
 * 
 * @param {Object} params
 *   age           {number}  - User age
 *   level         {string}  - 'beginner' | 'intermediate' | 'advanced'
 *   goal          {string}  - 'hypertrophy' | 'strength' | 'fat_loss' | 'general'
 *   days          {number}  - Training days per week (2-6)
 *   sessionTime   {number}  - Available minutes per session
 *   equipment     {string}  - 'gym' | 'home' | 'calisthenics'
 *   muscles       {Array}   - Array of muscle IDs to train
 *   priorities    {Array}   - Muscle IDs to prioritize (optional)
 *   injuries      {Array}   - Muscle IDs to avoid or reduce volume (optional)
 * 
 * @returns {Object} { days: [], weeklyVolume: {}, splitName: string }
 */
function generateRoutine(params) {
  var level       = params.level       || 'intermediate';
  var goal        = params.goal        || 'hypertrophy';
  var days        = params.days        || 4;
  var sessionTime = params.sessionTime || 60;
  var equipment   = params.equipment   || 'gym';
  var muscles     = params.muscles     || [];
  var priorities  = params.priorities  || [];
  var injuries    = params.injuries    || [];

  if (!muscles.length) return { days:[], weeklyVolume:{}, splitName:'No muscles selected' };

  // ── 1. Categorize muscles by role ────────────────────────────────────────
  var pushM  = muscles.filter(function(m) { return ['chest','shoulders','triceps'].indexOf(m) >= 0; });
  var pullM  = muscles.filter(function(m) { return ['back','biceps','traps','forearms'].indexOf(m) >= 0; });
  var lowerM = muscles.filter(function(m) { return ['quads','hamstrings','glutes','calves'].indexOf(m) >= 0; });
  var coreM  = muscles.filter(function(m) { return ['abs'].indexOf(m) >= 0; });

    // ── 2. Select optimal split ───────────────────────────────────────────────
  var splitDays = selectOptimalSplit(days, pushM, pullM, lowerM, coreM);

// Guarantee ≥2x frequency per muscle SOLO si el tiempo por sesión lo permite
  // Un músculo compound ocupa ~(75+150)*sets + 90 = ~315s por set config
  // Con sessionTime bajo (≤35min) no tiene sentido forzar frecuencia 2x
  var setsConfigTemp = SETS_PER_SESSION[level] || SETS_PER_SESSION.intermediate;
  var minTimePerMuscle = Math.round(((75 + 150) * setsConfigTemp.compound + 90) / 60); // ~5min
  var musclesPerSession = Math.max(1, Math.floor((sessionTime - 13) / minTimePerMuscle));

  if (days >= 3) {
    muscles.forEach(function(m) {
      var freq = splitDays.filter(function(d) { return d.muscles.indexOf(m) >= 0; }).length;
      if (freq < 2) {
        // Solo agregar si el día destino no está ya saturado por el tiempo
        var bestDay = splitDays.reduce(function(best, d, i) {
          if (d.muscles.indexOf(m) >= 0) return best;
          var dayMuscleCount = d.muscles.filter(function(x) { return muscles.indexOf(x) >= 0; }).length;
          // No agregar si el día ya tiene más músculos de los que caben en el tiempo
          if (dayMuscleCount >= musclesPerSession) return best;
          return (best === null || dayMuscleCount < best.count) ? { idx: i, count: dayMuscleCount } : best;
        }, null);
        if (bestDay !== null) splitDays[bestDay.idx].muscles = splitDays[bestDay.idx].muscles.concat([m]);
      }
    });
  }

  // ── 3. Calculate target volume per muscle ─────────────────────────────────
  var volMultiplier = VOLUME_GOAL_MULTIPLIER[goal] || 1.0;
  var volumeTargets = {};
  muscles.forEach(function(m) {
    var base = BASE_VOLUME[m] || { mev:6, mav:12, mrv:20 };
    var target = Math.round(base.mav * volMultiplier);
    // Priority muscles get +20% volume (up to MRV)
    if (priorities.indexOf(m) >= 0) target = Math.min(base.mrv, Math.round(target * 1.2));
    // Injured muscles get reduced to MEV only
    if (injuries.indexOf(m) >= 0) target = base.mev;
    volumeTargets[m] = { target: target, mev: base.mev, mav: base.mav, mrv: base.mrv };
  });

  // ── 4. Build exercise selections per muscle ───────────────────────────────
  var exercisePools = {};
  muscles.forEach(function(m) {
    var available = getExercisesForMuscle(m, equipment);
    var repRange  = REP_ZONES[goal] || REP_ZONES.hypertrophy;
    // Split into A/B rotation pools — ensures variety across sessions
    exercisePools[m] = {
      compounds: available.filter(function(e) { return e.type === 'compound'; }),
      isolations: available.filter(function(e) { return e.type === 'isolation'; }),
    };
  });

  // ── 5. Assign exercises to days with volume tracking ─────────────────────
  var weeklyVolume = {};
  muscles.forEach(function(m) { weeklyVolume[m] = 0; });

  // Track how many times each muscle has appeared in previous sessions
  // This drives exercise rotation (session A vs B vs C)
  var sessionCount = {};
  muscles.forEach(function(m) { sessionCount[m] = 0; });

  var setsConfig = SETS_PER_SESSION[level] || SETS_PER_SESSION.intermediate;
  var repZone    = REP_ZONES[goal] || REP_ZONES.hypertrophy;

  var builtDays = splitDays.map(function(dayTemplate, dayIdx) {
    var dayMuscles = dayTemplate.muscles.filter(function(m) {
      return muscles.indexOf(m) >= 0 && exercisePools[m];
    });
    if (!dayMuscles.length) return null;

    var exercises = [];
    var dayTimeUsed = 10; // base warm-up time in minutes

    // Separate into compound and isolation to ensure compound-first ordering
    var compoundExercises = [];
    var isolationExercises = [];

    dayMuscles.forEach(function(mId) {
      var pool    = exercisePools[mId];
      var sCount  = sessionCount[mId]; // 0=A, 1=B, 2=C, wraps
      var target  = volumeTargets[mId];

      // How many more sets needed this week?
      var setsRemaining = Math.max(0, target.target - weeklyVolume[mId]);
      // How many days remain (including this one) where this muscle appears?
      var futureAppearances = splitDays.slice(dayIdx).filter(function(d) {
        return d.muscles.indexOf(mId) >= 0;
      }).length;
      // Distribute sets evenly across remaining appearances
      var setsThisSession = Math.min(
        setsConfig.compound + setsConfig.isolation,
        futureAppearances > 0 ? Math.ceil(setsRemaining / futureAppearances) : setsConfig.compound
      );

      // Minimum: always do at least 1 compound set if available
      setsThisSession = Math.max(setsThisSession, 2);

      // Select exercises using rotation index
  var isIsoOnly = ['abs','calves','traps','forearms'].indexOf(mId) >= 0;
      if (isIsoOnly) {
        // Isolation-dominant muscles: 2 different isolation exercises
        var iso1 = pool.isolations[sCount % Math.max(1, pool.isolations.length)];
        var iso2 = pool.isolations[(sCount + 1) % Math.max(1, pool.isolations.length)];
        var isoSets = Math.ceil(setsThisSession / 2);
        if (iso1) {
          isolationExercises.push(buildExerciseEntry(iso1, mId, isoSets, goal, level));
          weeklyVolume[mId] += isoSets;
        }
        if (iso2 && iso2.name !== (iso1 && iso1.name)) {
          isolationExercises.push(buildExerciseEntry(iso2, mId, isoSets, goal, level));
          weeklyVolume[mId] += isoSets;
        }
      } else {
        // Compound + isolation
        var comp = pool.compounds[sCount % Math.max(1, pool.compounds.length)];
        var iso  = pool.isolations[sCount % Math.max(1, pool.isolations.length)];

        if (comp) {
          var compSets = setsConfig.compound;
          compoundExercises.push(buildExerciseEntry(comp, mId, compSets, goal, level));
          weeklyVolume[mId] += compSets;
        }
        if (iso && (comp ? setsThisSession > setsConfig.compound : true)) {
          var isoSets2 = setsConfig.isolation;
          isolationExercises.push(buildExerciseEntry(iso, mId, isoSets2, goal, level));
          weeklyVolume[mId] += isoSets2;
        }
      }

      sessionCount[mId]++;
    });

    // Compounds first, then isolations — science-backed ordering
    exercises = compoundExercises.concat(isolationExercises);

    // ── 6. Enforce session time budget ──────────────────────────────────────
    exercises = enforceTimeBudget(exercises, sessionTime, goal);

    // Estimate final time
    var estimatedTime = estimateSessionTime(exercises, goal);

    return {
      name:          dayTemplate.name,
      exercises:     exercises,
      estimatedTime: estimatedTime,
      musclesFocused:dayMuscles,
    };
  }).filter(Boolean);

  // ── 7. Validate final weekly volumes ──────────────────────────────────────
  // Recalculate actual volumes from built days
  var actualVolume = {};
  muscles.forEach(function(m) { actualVolume[m] = 0; });
  builtDays.forEach(function(day) {
    day.exercises.forEach(function(ex) {
      if (ex.muscle && actualVolume[ex.muscle] !== undefined) {
        actualVolume[ex.muscle] += ex.sets;
      }
    });
  });

  // Volume validation: flag muscles under MEV
  var volumeReport = {};
  muscles.forEach(function(m) {
    var vt = volumeTargets[m];
    var actual = actualVolume[m] || 0;
    volumeReport[m] = {
      actual:  actual,
      target:  vt.target,
      mev:     vt.mev,
      mav:     vt.mav,
      mrv:     vt.mrv,
      status:  actual < vt.mev ? 'sub_mev' : actual <= vt.mav ? 'optimal' : 'above_mav',
    };
  });

  var splitName = inferSplitName(splitDays, pushM, pullM, lowerM);

  return {
    days:          builtDays,
    weeklyVolume:  volumeReport,
    splitName:     splitName,
    goal:          goal,
    level:         level,
    equipment:     equipment,
  };
}

// ─── BUILD EXERCISE ENTRY ─────────────────────────────────────────────────────
// Creates a fully-specified exercise object for a routine day
function buildExerciseEntry(exerciseDef, muscleId, sets, goal, level) {
  var repZone = REP_ZONES[goal] || REP_ZONES.hypertrophy;
  var reps    = exerciseDef.type === 'compound' ? repZone.compound : repZone.isolation;

  // Get rep range from exercise's own repRange if available
  if (exerciseDef.repRange && exerciseDef.repRange[goal]) {
    reps = exerciseDef.repRange[goal];
  }

  // Handle special rep types (isometric, carries)
  if (reps === 'N/A') reps = repZone.isolation;

  // Determine rest time key
  var restKey = exerciseDef.type + '_' + goal;
  if (muscleId === 'abs' || muscleId === 'calves') restKey = 'core';
  var restEntry = REST_TIMES[restKey] || REST_TIMES['isolation_hypertrophy'];

  // RIR based on level and goal
  var rir = { beginner:3, intermediate:2, advanced:1 }[level] || 2;
  if (goal === 'strength') rir = Math.max(0, rir - 1);
  if (goal === 'fat_loss') rir = Math.min(4, rir + 1);

  return {
    name:   exerciseDef.name,
    muscle: muscleId,
    type:   exerciseDef.type,
    sets:   sets,
    reps:   reps,
    rest:   restEntry,
    rir:    rir,
    notes:  exerciseDef.notes || null,
    pattern: exerciseDef.pattern || null,
  };
}

// ─── TIME BUDGET ENFORCEMENT ──────────────────────────────────────────────────
// Prioriza compounds sobre isolations y respeta estrictamente el tiempo del usuario.
// Nunca supera maxMinutes (sin overage). Mínimo: 1 ejercicio si el tiempo no alcanza.
function enforceTimeBudget(exercises, maxMinutes, goal) {
  if (!exercises.length) return exercises;

  // Separar compounds e isolations — compounds tienen prioridad absoluta
  var compounds  = exercises.filter(function(ex) { return ex.type === 'compound'; });
  var isolations = exercises.filter(function(ex) { return ex.type !== 'compound'; });

  // Reconstruir lista: primero todos los compounds, luego isolations
  // Agregar de a uno hasta que no quepa más
  var result = [];
  var ordered = compounds.concat(isolations);

  for (var i = 0; i < ordered.length; i++) {
    var candidate = result.concat([ordered[i]]);
    if (estimateSessionTime(candidate, goal) <= maxMinutes) {
      result = candidate;
    }
    // Si el primer compound ya no cabe, igual lo incluimos (mínimo 1 ejercicio)
    if (result.length === 0 && i === ordered.length - 1) {
      result = [ordered[0]];
    }
  }

  return result.length ? result : [ordered[0]];
}

// ─── SESSION TIME ESTIMATOR ───────────────────────────────────────────────────
// Returns estimated session duration in minutes
// compound set: 75s exec + 150s rest = 225s | isolation set: 40s exec + 90s rest = 130s
// transition between exercises: 90s | warmup: 10min | cooldown: 3min
function estimateSessionTime(exercises, goal) {
  var WARMUP   = 10;
  var COOLDOWN = 3;
  var TRANSITION = 90;
  var totalSeconds = 0;

  exercises.forEach(function(ex) {
    var isCompound = ex.type === 'compound';
    var execTime   = isCompound ? 75 : 40;
    var restTime   = isCompound ? 150 : 90;
    // (exec + rest) * sets − rest after last set
    totalSeconds += (execTime + restTime) * ex.sets - restTime;
  });

  totalSeconds += exercises.length * TRANSITION;

  return WARMUP + COOLDOWN + Math.round(totalSeconds / 60);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function _unique(arr) {
  var seen = [];
  arr.forEach(function(m) { if (seen.indexOf(m) < 0) seen.push(m); });
  return seen;
}

function _nameList(mIds) {
  return (mIds || []).slice(0, 3).map(function(m) {
    var meta = MUSCLE_META.find(function(x) { return x.id === m; });
    return meta ? meta.label : m;
  }).join(' + ');
}

function inferSplitName(splitDays, P, U, L) {
  var n = splitDays.length;
  var hasUp = P.length > 0 || U.length > 0;
  var hasLo = L.length > 0;
  if (!hasUp && hasLo) return 'Lower Body ' + n + 'x/week';
  if (hasUp && !hasLo) return 'Upper Body ' + n + 'x/week';
  if (n <= 2) return 'Full Body 2x/week';
  if (n === 3) return (P.length && U.length) ? 'Push / Pull / Legs' : 'Full Body 3x/week';
  if (n === 4) return 'Upper / Lower 2x/week';
  if (n === 5) return 'PPL + Upper / Lower';
  if (n === 6) return 'PPL x2 (High Frequency)';
  return 'Custom Split';
}
