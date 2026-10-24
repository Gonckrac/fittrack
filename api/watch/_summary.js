// Arma el resumen compacto del día que baja el reloj.
// Pensado para ocupar poco: solo lo que el reloj muestra o usa para avisos.

const SLOT_LABEL = { breakfast: 'Desayuno', lunch: 'Almuerzo', snack: 'Merienda', dinner: 'Cena' };
const DOW_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function r1(n) {
  return Math.round((+n || 0) * 10) / 10;
}

function kcalOf(p, c, f) {
  return Math.round((+p || 0) * 4 + (+c || 0) * 4 + (+f || 0) * 9);
}

function targets(cfg) {
  if (cfg && cfg.kcal) {
    return { prot: cfg.prot || 190, carb: cfg.carb || 240, fat: cfg.fat || 70, kcal: cfg.kcal || 2400 };
  }
  return { prot: 190, carb: 240, fat: 70, kcal: 2400 };
}

function dowOf(date) {
  // date = 'YYYY-MM-DD' (hora argentina); mediodía UTC evita corrimientos
  return new Date(date + 'T12:00:00Z').getUTCDay();
}

function eaten(day) {
  const foods = (day && Array.isArray(day.foods)) ? day.foods : [];
  const t = foods.reduce(
    (a, f) => ({ prot: a.prot + (+f.prot || 0), carb: a.carb + (+f.carb || 0), fat: a.fat + (+f.fat || 0) }),
    { prot: 0, carb: 0, fat: 0 },
  );
  return { prot: r1(t.prot), carb: r1(t.carb), fat: r1(t.fat), kcal: kcalOf(t.prot, t.carb, t.fat), count: foods.length };
}

function mealPlanToday(state, date, day) {
  const plan = state.mealPlan && state.mealPlan.plan;
  if (!Array.isArray(plan)) return [];
  const dow = dowOf(date);
  const idx = dow === 0 ? 6 : dow - 1; // el plan arranca en lunes
  const p = plan[idx];
  if (!p || !p.meals) return [];
  const loggedNames = ((day && day.foods) || []).map((f) => String(f.name || '').toLowerCase());
  return Object.keys(SLOT_LABEL)
    .filter((slot) => p.meals[slot])
    .map((slot) => {
      const m = p.meals[slot];
      return {
        slot,
        meal: SLOT_LABEL[slot],
        name: m.name,
        prot: r1(m.protein),
        carb: r1(m.carbs),
        fat: r1(m.fats),
        kcal: Math.round(m.kcal || kcalOf(m.protein, m.carbs, m.fats)),
        logged: loggedNames.indexOf(String(m.name || '').toLowerCase()) !== -1,
      };
    });
}

function quickFoods(state) {
  const presets = (state.foodPresets || []).map((p) => ({ name: p.name, prot: r1(p.prot), carb: r1(p.carb), fat: r1(p.fat) }));
  const freq = Object.values(state.freqFoods || {})
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 10)
    .map((f) => ({ name: f.name, prot: r1(f.prot), carb: r1(f.carb), fat: r1(f.fat) }));
  const seen = {};
  return presets.concat(freq).filter((f) => {
    const k = String(f.name).toLowerCase();
    if (!f.name || seen[k]) return false;
    seen[k] = true;
    return true;
  }).slice(0, 14);
}

function supps(state, day) {
  const list = (state.config && state.config.supps) || [];
  const taken = (day && day.supps) || {};
  return list.map((s, i) => {
    const id = s.id || 'cfg_supp_' + i;
    return { id, name: s.name, dose: s.dose || '', slot: s.time || 'morning', taken: !!taken[id] };
  });
}

function training(state, date, day) {
  const cfg = state.config || {};
  const routines = cfg.training || [];
  let idx = null;
  if (cfg.cycle) {
    const v = cfg.cycle[DOW_KEYS[dowOf(date)]];
    if (v === 'sport') return { type: 'sport' };
    if (v !== undefined && v !== null && v !== 'rest' && v !== -1 && v !== '-1') idx = parseInt(v, 10);
  }
  if (idx === null || isNaN(idx) || !routines[idx]) return { type: 'rest' };
  const r = routines[idx];
  const hist = state.exerciseHistory || {};
  const done = day ? Object.keys(day).some((k) => k.startsWith('trainSets_')) : false;
  return {
    type: 'gym',
    day: idx + 1,
    name: r.name,
    done,
    exercises: (r.exercises || []).map((ex) => {
      const last = (hist[ex.name] || [])[0];
      let next = null;
      if (last && last.maxKg && ex.topRep) {
        next = (last.avgReps || 0) >= ex.topRep
          ? { kg: r1(+last.maxKg + 2.5), reps: ex.topRep, up: true }
          : { kg: r1(last.maxKg), reps: (last.avgReps || 0) + 1, up: false };
      }
      return {
        name: ex.name,
        sets: ex.sets || 3,
        reps: ex.reps || '',
        topRep: ex.topRep || null,
        last: last ? { kg: r1(last.maxKg), reps: last.avgReps || null } : null,
        next,
      };
    }),
  };
}

function metrics(state, date) {
  const h = (state.metricsHistory || []).filter((m) => m.weight).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  if (!h.length) return null;
  const last = h[h.length - 1];
  // Cambio contra la medición más cercana a 7 días antes
  const ref = new Date(date + 'T12:00:00Z');
  ref.setUTCDate(ref.getUTCDate() - 7);
  const refStr = ref.toISOString().slice(0, 10);
  const prev = h.filter((m) => m.date <= refStr).pop();
  return {
    date: last.date,
    weight: r1(last.weight),
    bf: last.bf != null ? r1(last.bf) : null,
    muscle: last.muscle != null ? r1(last.muscle) : null,
    weekPct: prev ? r1(((last.weight - prev.weight) / prev.weight) * 100) : null,
  };
}

function buildSummary(state, date) {
  const day = state[date] || {};
  const s = day.sleep || {};
  return {
    date,
    ts: state._ts || null,
    targets: targets(state.config),
    eaten: eaten(day),
    plan: mealPlanToday(state, date, day),
    quick: quickFoods(state),
    supps: supps(state, day),
    sleep: s.hours || s.manHours
      ? { hours: s.hours || s.manHours, deep: s.deep || s.manDeep || null, score: s.readiness || null, bedtime: s.bedtime || null, src: s.src || null }
      : null,
    training: training(state, date, day),
    metrics: metrics(state, date),
    study: (day.study || []).map((b) => ({ label: b.label, doneMin: b.doneMin, plannedMin: b.plannedMin, status: b.status })),
  };
}

module.exports = { buildSummary };
