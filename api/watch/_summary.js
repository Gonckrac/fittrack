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
  const saved = (day && day['trainSets_' + (idx + 1)]) || {};
  return {
    type: 'gym',
    day: idx + 1,
    name: r.name,
    done,
    exercises: (r.exercises || []).map((ex, i) => {
      const doneSets = (saved[i] || []).filter((s) => s && s.done).length;
      const prevAll = hist[ex.name] || [];
      // "Última" = la última sesión ANTERIOR a hoy (si hoy ya lo hiciste, no cuenta)
      const last = prevAll.find((h) => h.date !== date);
      let next = null;
      if (last && last.maxKg && ex.topRep) {
        next = (last.avgReps || 0) >= ex.topRep
          ? { kg: r1(+last.maxKg + 2.5), reps: ex.topRep, up: true }
          : { kg: r1(last.maxKg), reps: (last.avgReps || 0) + 1, up: false };
      }
      const log = last && Array.isArray(last.setsLog)
        ? last.setsLog.map((x) => [r1(parseFloat(String(x.kg).replace(',', '.')) || 0), parseInt(x.reps, 10) || 0]).filter((x) => x[0] || x[1])
        : null;
      return {
        name: ex.name,
        sets: ex.sets || 3,
        reps: ex.reps || '',
        topRep: ex.topRep || null,
        last: last ? { kg: r1(last.maxKg), reps: last.avgReps || null, date: last.date || null, log: log && log.length ? log : null } : null,
        next,
        doneSets,
        ss: ex.ssGroup ? { g: ex.ssGroup, p: ex.ssPart || 'a', rest: ex.ssRestSec || null } : null,
        rest: ex.restSec || null,
      };
    }),
  };
}

function metrics(state, date) {
  const h = (state.metricsHistory || []).filter((m) => m.weight).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  if (!h.length) return null;
  const last = h[h.length - 1];
  // Cambio semanal: solo si hay una medición de hace 5 a 14 días.
  // Si la anterior es más vieja, se informa aparte con su fecha (sincePct / sinceDate).
  const daysAgo = (d) => Math.round((new Date(date + 'T12:00:00Z') - new Date(d + 'T12:00:00Z')) / 86400000);
  const older = h.filter((m) => m.date < last.date);
  const weekRef = older.filter((m) => daysAgo(m.date) >= 5 && daysAgo(m.date) <= 14).pop();
  const prev = older[older.length - 1];
  return {
    date: last.date,
    weight: r1(last.weight),
    bf: last.bf != null ? r1(last.bf) : null,
    muscle: last.muscle != null ? r1(last.muscle) : null,
    weekPct: weekRef ? r1(((last.weight - weekRef.weight) / weekRef.weight) * 100) : null,
    sincePct: prev ? r1(((last.weight - prev.weight) / prev.weight) * 100) : null,
    sinceDate: prev ? prev.date : null,
  };
}

// Objetivo de agua igual que la web: 35 ml por kg, redondeado a 100 ml
function waterGoal(state) {
  const cfg = state.config || {};
  const h = (state.metricsHistory || []).filter((m) => m.weight);
  const last = h.length ? h.slice().sort((a, b) => (a.date < b.date ? -1 : 1))[h.length - 1].weight : null;
  const w = parseFloat(cfg.weight) || parseFloat(last) || 70;
  return Math.round((w * 35) / 100) * 100;
}

// ── Logros: datos positivos reales que el reloj muestra de vez en cuando ──
function addDays(date, n) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function fmtH(min) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h + ' h' + (m ? ' ' + (m < 10 ? '0' : '') + m : '');
}
function n1(x) {
  return String(r1(x)).replace('.', ',');
}

function wins(state, date) {
  const out = [];
  const daysAgo = (d) => Math.round((new Date(date + 'T12:00:00Z') - new Date(d + 'T12:00:00Z')) / 86400000);

  // Cuerpo: peso, grasa y músculo contra hace ~2 y ~4 semanas
  const h = (state.metricsHistory || []).filter((m) => m.weight).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  if (h.length >= 2) {
    const last = h[h.length - 1];
    if (daysAgo(last.date) <= 10) {
      [[10, 20], [21, 45]].forEach(([lo, hi]) => {
        const ref = h.filter((m) => m.date < last.date && daysAgo(m.date) >= lo && daysAgo(m.date) <= hi).pop();
        if (!ref) return;
        const days = daysAgo(ref.date) - daysAgo(last.date);
        const sub = 'en las últimas ' + Math.round(days / 7) + ' semanas';
        const dw = last.weight - ref.weight;
        if (dw <= -0.5) out.push({ id: 'peso' + hi + ':' + last.date, kind: 'body', title: 'Bajaste ' + n1(-dw) + ' kg', sub });
        if (last.bf != null && ref.bf != null && last.bf - ref.bf <= -0.5) {
          out.push({ id: 'grasa' + hi + ':' + last.date, kind: 'body', title: n1(ref.bf - last.bf) + ' % menos de grasa', sub });
        }
        if (last.muscle != null && ref.muscle != null && last.muscle - ref.muscle >= 0.3) {
          out.push({ id: 'musc' + hi + ':' + last.date, kind: 'body', title: '+' + n1(last.muscle - ref.muscle) + ' de músculo', sub });
        }
      });
    }
  }

  // Últimas 2 semanas: estudio y entrenos
  let studyMin = 0;
  let gymDays = 0;
  for (let i = 1; i <= 14; i++) {
    const d = state[addDays(date, -i)];
    if (!d) continue;
    (d.study || []).forEach((b) => (studyMin += +b.doneMin || 0));
    const trained = Object.keys(d).some((k) => k.startsWith('trainSets_') && Object.values(d[k] || {}).some((sets) => Array.isArray(sets) && sets.some((x) => x && x.done)));
    if (trained) gymDays++;
  }
  if (studyMin >= 300) out.push({ id: 'estudio:' + Math.floor(studyMin / 120), kind: 'study', title: 'Estudiaste ' + fmtH(studyMin), sub: 'en las últimas 2 semanas' });
  if (gymDays >= 4) out.push({ id: 'gym:' + gymDays + ':' + addDays(date, -1), kind: 'gym', title: 'Entrenaste ' + gymDays + ' veces', sub: 'en las últimas 2 semanas' });

  // Récords: la última sesión (de las últimas 2 semanas) superó todo lo anterior
  const hist = state.exerciseHistory || {};
  Object.keys(hist).forEach((name) => {
    const list = (hist[name] || []).filter((x) => x && x.maxKg);
    if (list.length < 2) return;
    const lastE = list[0];
    if (daysAgo(lastE.date) > 14) return;
    const best = Math.max.apply(null, list.slice(1).map((x) => +x.maxKg || 0));
    if (+lastE.maxKg > best) {
      out.push({ id: 'pr:' + name + ':' + lastE.maxKg, kind: 'pr', title: 'Récord en ' + name, sub: n1(lastE.maxKg) + ' kg' + (lastE.avgReps ? ' × ' + lastE.avgReps : '') });
    }
  });

  // Última semana: proteína, sueño y agua
  const tg = targets(state.config).prot;
  let protDays = 0;
  const sleeps = [];
  let waterDays = 0;
  const wg = waterGoal(state);
  for (let i = 1; i <= 7; i++) {
    const d = state[addDays(date, -i)];
    if (!d) continue;
    if (eaten(d).prot >= tg * 0.95) protDays++;
    const sl = d.sleep || {};
    const hrs = +(sl.hours || sl.manHours) || 0;
    if (hrs) sleeps.push(hrs);
    if ((d.water || 0) >= wg) waterDays++;
  }
  if (protDays >= 5) out.push({ id: 'prot:' + protDays + ':' + addDays(date, -1), kind: 'food', title: 'Proteína cumplida ' + protDays + ' de 7 días', sub: 'esta última semana' });
  if (sleeps.length >= 5) {
    const avg = sleeps.reduce((a, b) => a + b, 0) / sleeps.length;
    if (avg >= 7) out.push({ id: 'sueno:' + addDays(date, -1), kind: 'sleep', title: 'Dormiste ' + fmtH(avg * 60) + ' de promedio', sub: 'esta última semana' });
  }
  if (waterDays >= 4) out.push({ id: 'agua:' + waterDays + ':' + addDays(date, -1), kind: 'water', title: 'Llegaste al agua ' + waterDays + ' de 7 días', sub: 'esta última semana' });
  return out;
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
    water: { ml: day.water || 0, goal: waterGoal(state) },
    wins: wins(state, date),
    study: (day.study || []).map((b) => ({ label: b.label, doneMin: b.doneMin, plannedMin: b.plannedMin, status: b.status })),
  };
}

module.exports = { buildSummary };
