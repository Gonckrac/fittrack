// Objetivos y logros REALES para el reloj y la esfera.
//
//   Logro    = algo que ya cumpliste y que está en los registros (con fecha).
//   Objetivo = una meta de hoy/esta semana que todavía no alcanzaste, con cuánto falta.
//
// Reglas:
//  - Solo se usan datos registrados. Que falte un registro NO prueba que algo no
//    pasó: una regla que necesita un dato que no está, simplemente no se evalúa.
//  - Todo se calcula "a la fecha" (asOf): sirve para recalcular días anteriores
//    y rotar el destacado sin guardar nada.
//  - El destacado del día se elige con una rotación reproducible por fecha (no
//    cambia cada vez que abrís la pantalla) y no repite la misma regla 3 días seguidos.
//
// computeGoals(state, date, h) con h = { eaten, targets, waterGoal, mealPlanToday }

const DOW_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function addDays(date, n) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function dow(date) {
  return new Date(date + 'T12:00:00Z').getUTCDay();
}
function weekStart(date) {
  return addDays(date, -((dow(date) + 6) % 7)); // lunes
}
function fmtH(min) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (!h) return m + ' min';
  return h + ' h' + (m ? ' ' + (m < 10 ? '0' : '') + m : '');
}
function n1(x) {
  return String(Math.round(x * 10) / 10).replace('.', ',');
}
function kg(v) {
  return parseFloat(String(v == null ? '' : v).replace(',', '.')) || 0;
}
// Hash simple y estable de un texto (para la rotación por fecha)
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ── Lectura de los registros ────────────────────────────────────
function makeReader(state, h) {
  const cfg = state.config || {};
  const target = h.targets(cfg).prot;
  const wGoal = h.waterGoal(state);
  const supps = cfg.supps || [];
  const day = (d) => state[d] || null;

  const trained = (d) => {
    const x = day(d);
    if (!x) return false;
    if (Array.isArray(x.workouts) && x.workouts.length) return true;
    return Object.keys(x).some((k) => k.indexOf('trainSets_') === 0 && Object.values(x[k] || {}).some((rows) => Array.isArray(rows) && rows.some((r) => r && r.done)));
  };
  const planned = (d) => {
    const c = cfg.cycle;
    if (!c) return false;
    const v = c[DOW_KEYS[dow(d)]];
    if (v === undefined || v === null || v === 'rest' || v === 'sport' || v === -1 || v === '-1') return false;
    const r = (cfg.training || [])[parseInt(v, 10)];
    return !!(r && r.exercises && r.exercises.length);
  };
  const studyMin = (d) => ((day(d) || {}).study || []).reduce((a, b) => a + (+b.doneMin || 0), 0);
  const pomos = (d) => {
    const l = ((day(d) || {}).study || []).filter((b) => b.pomos != null);
    return l.length ? l.reduce((a, b) => a + (+b.pomos || 0), 0) : null;
  };
  const studyDoneBlocks = (d) => {
    const seen = {};
    ((day(d) || {}).study || []).forEach((b) => {
      if (b.status === 'done') seen[b.blockKey || b.blockId || b.id] = true;
    });
    return Object.keys(seen).length;
  };
  const studyPlan = (d) => {
    const p = cfg.studyPlan && cfg.studyPlan.byDow && cfg.studyPlan.byDow[dow(d)];
    return p ? { min: +p.min || 0, blocks: +p.blocks || 0 } : null;
  };
  const foodsCount = (d) => (((day(d) || {}).foods) || []).length;
  const prot = (d) => (day(d) ? h.eaten(day(d)).prot : 0);
  const protMet = (d) => foodsCount(d) > 0 && prot(d) >= target * 0.95;
  const water = (d) => (day(d) || {}).water || 0;
  const waterMet = (d) => water(d) >= wGoal;
  const suppsTaken = (d) => {
    const t = (day(d) || {}).supps || {};
    return supps.filter((s, i) => t[s.id || 'cfg_supp_' + i]).length;
  };
  const suppsAll = (d) => supps.length > 0 && suppsTaken(d) === supps.length;
  const meals = (d) => {
    const x = day(d);
    if (!x || !h.mealPlanToday) return null;
    const p = h.mealPlanToday(state, d, x);
    return p.length ? { total: p.length, logged: p.filter((m) => m.logged).length } : null;
  };
  // Días seguidos (terminando en `end`) que cumplen f
  const streak = (end, f, max = 60) => {
    let n = 0;
    while (n < max && f(addDays(end, -n))) n++;
    return n;
  };
  return { cfg, target, wGoal, supps, day, trained, planned, studyMin, pomos, studyDoneBlocks, studyPlan, foodsCount, prot, protMet, water, waterMet, suppsTaken, suppsAll, meals, streak };
}

// Volumen y series de una sesión del historial
function sessionStats(e) {
  const log = (e && e.setsLog) || [];
  let vol = 0;
  let maxReps = 0;
  log.forEach((s) => {
    vol += kg(s.kg) * (parseInt(s.reps, 10) || 0);
    maxReps = Math.max(maxReps, parseInt(s.reps, 10) || 0);
  });
  return { vol, sets: log.length, maxReps };
}

// ── Logros ──────────────────────────────────────────────────────
// Cada uno: { id, rule, type:'win', cat, title, sub, prio, date }
function winsAsOf(state, date, h) {
  const R = makeReader(state, h);
  const out = [];
  const add = (rule, cat, prio, evDate, title, sub, idx) => out.push({ id: rule + ':' + (idx || evDate), rule, type: 'win', cat, prio, date: evDate, title, sub });
  const yday = addDays(date, -1);
  const ws = weekStart(date);

  // 1. Semana en curso perfecta (lo planificado hasta hoy, todo hecho)
  {
    let plan = 0;
    let done = 0;
    for (let d = ws; d <= date; d = addDays(d, 1)) {
      if (!R.planned(d)) continue;
      if (d === date && !R.trained(d)) continue; // hoy todavía tenés tiempo
      plan++;
      if (R.trained(d)) done++;
    }
    if (plan >= 2 && done === plan) add('train_week_perfect', 'gym', 70, date, 'Vas perfecto: ' + done + ' de ' + done, 'entrenos de esta semana', ws + ':' + done);
  }
  // 2. Semana pasada completa
  {
    const lws = addDays(ws, -7);
    let plan = 0;
    let done = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(lws, i);
      if (R.planned(d)) {
        plan++;
        if (R.trained(d)) done++;
      }
    }
    if (plan >= 3 && done === plan) add('train_lastweek_all', 'gym', 80, addDays(lws, 6), 'Completaste los ' + plan + ' entrenos', 'de la semana pasada', lws);
  }
  // 3. Días seguidos entrenando (≥ 7)
  {
    const end = R.trained(date) ? date : yday;
    const n = R.streak(end, R.trained);
    if (n >= 7) add('train_streak', 'gym', 85, end, 'Entrenaste ' + n + ' días seguidos', 'sin cortar la racha', end + ':' + n);
  }
  // 4. Mes anterior: todos los entrenos programados
  {
    const first = date.slice(0, 7) + '-01';
    const prevFirst = addDays(first, -1).slice(0, 7) + '-01';
    let plan = 0;
    let done = 0;
    for (let d = prevFirst; d < first; d = addDays(d, 1)) {
      if (R.planned(d)) {
        plan++;
        if (R.trained(d)) done++;
      }
    }
    if (plan >= 8 && done === plan) add('train_month_all', 'gym', 90, addDays(first, -1), 'Mes perfecto: ' + done + ' entrenos', 'todos los programados del mes pasado', prevFirst.slice(0, 7));
  }
  // 5-7. Récords por ejercicio (última sesión de los últimos 7 días contra todo lo anterior)
  const hist = state.exerciseHistory || {};
  Object.keys(hist).forEach((name) => {
    const list = (hist[name] || []).filter((e) => e && e.date && e.date <= date);
    if (list.length < 2) return;
    const last = list[0];
    if (last.date < addDays(date, -7)) return;
    const prev = list.slice(1);
    // peso
    const best = Math.max.apply(null, prev.map((x) => kg(x.maxKg)));
    if (kg(last.maxKg) > best && best > 0) add('pr_weight', 'gym', 75, last.date, 'Récord en ' + name, n1(kg(last.maxKg)) + ' kg' + (last.avgReps ? ' × ' + last.avgReps : ''), name + ':' + last.date);
    // repeticiones: una serie con más reps que cualquier serie anterior con ese peso o más
    (last.setsLog || []).forEach((s) => {
      const k = kg(s.kg);
      const r = parseInt(s.reps, 10) || 0;
      if (!r) return;
      let bestReps = 0;
      prev.forEach((e) => (e.setsLog || []).forEach((p) => kg(p.kg) >= k && (bestReps = Math.max(bestReps, parseInt(p.reps, 10) || 0))));
      if (bestReps && r > bestReps && !out.some((o) => o.rule === 'pr_reps' && o.id.indexOf(name + ':') !== -1)) {
        add('pr_reps', 'gym', 70, last.date, 'Récord de reps en ' + name, n1(k) + ' kg × ' + r + ' (antes ' + bestReps + ')', name + ':' + last.date);
      }
    });
    // volumen de la sesión
    const v = sessionStats(last).vol;
    const prevVols = prev.map((e) => sessionStats(e).vol).filter((x) => x > 0);
    if (v > 0 && prevVols.length >= 2 && v > Math.max.apply(null, prevVols)) add('pr_volume', 'gym', 65, last.date, 'Más volumen que nunca en ' + name, Math.round(v) + ' kg movidos', name + ':' + last.date);
  });
  // 8. Series acumuladas en 30 días (hitos de 50)
  {
    let sets = 0;
    Object.keys(hist).forEach((name) => (hist[name] || []).forEach((e) => {
      if (e && e.date && e.date <= date && e.date > addDays(date, -30)) sets += sessionStats(e).sets || +e.sets || 0;
    }));
    const mile = Math.floor(sets / 50) * 50;
    if (mile >= 100) add('sets_month', 'gym', 40, date, 'Llevás ' + mile + ' series', 'en los últimos 30 días', 'm' + mile);
  }
  // 9. 8 h de estudio en 3 días
  {
    const m = R.studyMin(date) + R.studyMin(yday) + R.studyMin(addDays(date, -2));
    if (m >= 480) add('study_3d', 'study', 70, date, 'Estudiaste ' + fmtH(m), 'en los últimos 3 días', date);
  }
  // 10. 20 h en la semana
  {
    let m = 0;
    for (let d = ws; d <= date; d = addDays(d, 1)) m += R.studyMin(d);
    if (m >= 1200) add('study_week20', 'study', 80, date, fmtH(m) + ' de estudio', 'esta semana', ws);
  }
  // 11. 5 días seguidos estudiando (≥ 30 min)
  {
    const ok = (d) => R.studyMin(d) >= 30;
    const end = ok(date) ? date : yday;
    const n = R.streak(end, ok);
    if (n >= 5) add('study_streak', 'study', 70, end, n + ' días seguidos estudiando', 'al menos 30 min por día', end + ':' + n);
  }
  // 12. Pomodoros de la semana (solo si están registrados)
  {
    let p = 0;
    let known = false;
    for (let d = ws; d <= date; d = addDays(d, 1)) {
      const x = R.pomos(d);
      if (x != null) {
        known = true;
        p += x;
      }
    }
    if (known && p >= 20) add('pomos_week', 'study', 55, date, p + ' pomodoros', 'terminados esta semana', ws + ':' + Math.floor(p / 10));
  }
  // 13. Todos los bloques de estudio planificados del día
  [date, yday].some((d) => {
    const plan = R.studyPlan(d);
    if (plan && plan.blocks > 0 && R.studyDoneBlocks(d) >= plan.blocks) {
      add('study_day_all', 'study', 60, d, 'Cumpliste todo el estudio', d === date ? 'de hoy' : 'de ayer', d);
      return true;
    }
    return false;
  });
  // 14. Proteína de hoy (o de ayer)
  if (R.protMet(date)) add('prot_day', 'food', 50, date, 'Proteína cumplida', Math.round(R.prot(date)) + ' de ' + R.target + ' g hoy', date);
  else if (R.protMet(yday)) add('prot_day', 'food', 45, yday, 'Ayer cumpliste la proteína', Math.round(R.prot(yday)) + ' de ' + R.target + ' g', yday);
  // 15. Proteína 5 días seguidos
  {
    const end = R.protMet(date) ? date : yday;
    const n = R.streak(end, R.protMet);
    if (n >= 5) add('prot_streak', 'food', 80, end, n + ' días seguidos con la proteína', 'objetivo de ' + R.target + ' g', end + ':' + n);
  }
  // 16. Agua: varios días en la última semana
  {
    let n = 0;
    for (let i = 0; i < 7; i++) if (R.waterMet(addDays(date, -i))) n++;
    if (n >= 4) add('water_week', 'water', 55, date, 'Llegaste al agua ' + n + ' de 7 días', 'objetivo de ' + (R.wGoal / 1000).toString().replace('.', ',') + ' l', date + ':' + n);
  }
  // 17. Todas las comidas del plan cargadas
  [date, yday].some((d) => {
    const m = R.meals(d);
    if (m && m.total >= 3 && m.logged === m.total) {
      add('meals_all', 'food', 50, d, 'Cargaste todas las comidas', d === date ? 'del plan de hoy' : 'del plan de ayer', d);
      return true;
    }
    return false;
  });
  // 18-20. Suplementos
  if (R.supps.length) {
    const end = R.suppsAll(date) ? date : yday;
    const n = R.streak(end, R.suppsAll);
    if (n >= 7) add('supps_7', 'supps', 80, end, n + ' días con todos los suplementos', 'adherencia completa', end + ':' + n);
    else if (n >= 3) add('supps_streak', 'supps', 55, end, 'Racha de ' + n + ' días', 'con todos los suplementos', end + ':' + n);
    if (R.suppsAll(date)) add('supps_today', 'supps', 45, date, 'Suplementos completos', R.supps.length + ' de ' + R.supps.length + ' hoy', date);
  }
  // 21. Todos los objetivos del día (con datos de cada uno)
  {
    const okTrain = R.planned(date) ? R.trained(date) : true;
    if (R.foodsCount(date) && R.protMet(date) && R.waterMet(date) && (!R.supps.length || R.suppsAll(date)) && okTrain) {
      add('all_goals_today', 'all', 85, date, 'Día redondo', 'proteína, agua, suplementos' + (R.planned(date) ? ' y entreno' : ''), date);
    }
  }
  // 22. Más constante que la semana pasada (mismos días de la semana)
  {
    const good = (d) => {
      let pts = 0;
      if (R.planned(d) && R.trained(d)) pts++;
      if (R.protMet(d)) pts++;
      if (R.studyMin(d) >= 30) pts++;
      return pts >= 2;
    };
    const n = (dow(date) + 6) % 7; // días transcurridos de la semana antes de hoy
    if (n >= 3) {
      let a = 0;
      let b = 0;
      for (let i = 0; i < n; i++) {
        if (good(addDays(ws, i))) a++;
        if (good(addDays(ws, i - 7))) b++;
      }
      if (a > b && a >= 2) add('consistency_up', 'all', 60, yday, 'Más constante que la semana pasada', a + ' días buenos contra ' + b, ws);
    }
  }
  // 23. Combo: entreno + estudio + proteína el mismo día
  [date, yday].some((d) => {
    if (R.trained(d) && R.studyMin(d) >= 60 && R.protMet(d)) {
      add('combo_day', 'all', 75, d, 'Entreno, estudio y proteína', d === date ? 'todo hoy' : 'todo ayer', d);
      return true;
    }
    return false;
  });
  // 24-26. Cuerpo (según tu objetivo de FitTrack)
  {
    const hm = (state.metricsHistory || []).filter((m) => m.weight && m.date <= date).slice().sort((a, b) => (a.date < b.date ? -1 : 1));
    const daysAgo = (d) => Math.round((new Date(date + 'T12:00:00Z') - new Date(d + 'T12:00:00Z')) / 86400000);
    if (hm.length >= 2) {
      const last = hm[hm.length - 1];
      if (daysAgo(last.date) <= 10) {
        const ref = hm.filter((m) => m.date < last.date && daysAgo(m.date) - daysAgo(last.date) >= 14 && daysAgo(m.date) - daysAgo(last.date) <= 45).pop();
        if (ref) {
          const weeks = Math.round((daysAgo(ref.date) - daysAgo(last.date)) / 7);
          const sub = 'en ' + weeks + ' semanas';
          if (last.bf != null && ref.bf != null && last.bf - ref.bf <= -0.5) add('body_fat', 'body', 70, last.date, n1(ref.bf - last.bf) + ' % menos de grasa', sub, last.date);
          if (last.muscle != null && ref.muscle != null && last.muscle - ref.muscle >= 0.3) add('body_muscle', 'body', 70, last.date, '+' + n1(last.muscle - ref.muscle) + ' % de músculo', sub, last.date);
          const g = R.cfg.goal || '';
          const dw = last.weight - ref.weight;
          const perWeek = dw / Math.max(1, weeks);
          const gain = g === 'lean_bulk' || g === 'bulk';
          if (gain && perWeek >= 0.1 && perWeek <= 0.6) add('body_weight', 'body', 60, last.date, 'Subiste ' + n1(dw) + ' kg', sub + ', a buen ritmo', last.date);
          if (!gain && g && dw <= -0.5) add('body_weight', 'body', 60, last.date, 'Bajaste ' + n1(-dw) + ' kg', sub, last.date);
        }
      }
    }
  }
  // 27. Sueño de la última semana
  {
    const hrs = [];
    for (let i = 0; i < 7; i++) {
      const s = (R.day(addDays(date, -i)) || {}).sleep || {};
      const x = +(s.hours || s.manHours) || 0;
      if (x) hrs.push(x);
    }
    if (hrs.length >= 5) {
      const avg = hrs.reduce((a, b) => a + b, 0) / hrs.length;
      if (avg >= 7) add('sleep_avg', 'sleep', 50, date, 'Dormiste ' + fmtH(avg * 60) + ' de promedio', 'esta última semana', date);
    }
  }
  return out;
}

// ── Objetivos de hoy / esta semana ─────────────────────────────
function goalsAsOf(state, date, h) {
  const R = makeReader(state, h);
  const out = [];
  const add = (rule, cat, prio, title, sub, progress) => out.push({ id: rule + ':' + date, rule, type: 'goal', cat, prio, date, title, sub, progress: progress || null });
  const ws = weekStart(date);
  const yday = addDays(date, -1);

  // G1. Entrenos que faltan esta semana
  {
    let plan = 0;
    let done = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(ws, i);
      if (!R.planned(d)) continue;
      plan++;
      if (d <= date && R.trained(d)) done++;
    }
    if (plan && done < plan) add('g_week_train', 'gym', 60, 'Te faltan ' + (plan - done) + ' entrenos', 'para completar la semana (' + done + ' de ' + plan + ')', { cur: done, target: plan });
  }
  // G2. Proteína de hoy (solo si ya cargaste algo: sin registros no se sabe)
  if (R.foodsCount(date) && !R.protMet(date)) {
    const left = Math.max(0, Math.round(R.target - R.prot(date)));
    add('g_prot', 'food', 55, 'Te faltan ' + left + ' g de proteína', 'llevás ' + Math.round(R.prot(date)) + ' de ' + R.target + ' g', { cur: Math.round(R.prot(date)), target: R.target });
  }
  // G3. Agua de hoy
  if (!R.waterMet(date)) {
    const left = R.wGoal - R.water(date);
    add('g_water', 'water', 40, 'Te faltan ' + (left >= 1000 ? n1(left / 1000) + ' l' : left + ' ml') + ' de agua', 'objetivo ' + n1(R.wGoal / 1000) + ' l', { cur: R.water(date), target: R.wGoal });
  }
  // G4. Suplementos de hoy
  if (R.supps.length && !R.suppsAll(date)) {
    const left = R.supps.length - R.suppsTaken(date);
    add('g_supps', 'supps', 45, left === 1 ? 'Te falta 1 suplemento' : 'Te faltan ' + left + ' suplementos', 'de hoy', { cur: R.suppsTaken(date), target: R.supps.length });
  }
  // G5. Estudio de la semana contra lo planificado
  {
    let plan = 0;
    let done = 0;
    let known = false;
    for (let i = 0; i < 7; i++) {
      const d = addDays(ws, i);
      const p = R.studyPlan(d);
      if (p) {
        known = true;
        plan += p.min;
      }
      if (d <= date) done += R.studyMin(d);
    }
    if (known && plan && done < plan) add('g_study_week', 'study', 50, 'Llevás ' + fmtH(done) + ' de ' + fmtH(plan), 'de estudio esta semana', { cur: done, target: plan });
  }
  // G6. Estudio de hoy
  {
    const p = R.studyPlan(date);
    if (p && p.min) {
      const done = R.studyMin(date);
      if (done < p.min) add('g_study_day', 'study', 50, 'Te faltan ' + fmtH(p.min - done) + ' de estudio', 'para cumplir hoy', { cur: done, target: p.min });
    }
  }
  // G7. Racha de entreno: hoy la estirás
  if (R.planned(date) && !R.trained(date)) {
    const n = R.streak(yday, R.trained);
    if (n >= 2) add('g_train_streak', 'gym', 65, 'Entrená hoy', 'y llegás a ' + (n + 1) + ' días seguidos', { cur: n, target: n + 1 });
  }
  // G8. Racha de proteína
  if (!R.protMet(date)) {
    const n = R.streak(yday, R.protMet);
    if (n >= 2) add('g_prot_streak', 'food', 60, 'Cumplí la proteína hoy', 'y van ' + (n + 1) + ' días seguidos', { cur: n, target: n + 1 });
  }
  // G9. Racha de suplementos
  if (R.supps.length && !R.suppsAll(date)) {
    const n = R.streak(yday, R.suppsAll);
    if (n >= 2) add('g_supps_streak', 'supps', 50, 'Tomá todos los suplementos', 'y la racha llega a ' + (n + 1) + ' días', { cur: n, target: n + 1 });
  }
  // G10. Comidas del plan sin cargar
  {
    const m = R.meals(date);
    if (m && m.logged < m.total) add('g_meals', 'food', 35, 'Cargá ' + (m.total - m.logged) + (m.total - m.logged === 1 ? ' comida' : ' comidas') + ' del plan', m.logged + ' de ' + m.total + ' cargadas hoy', { cur: m.logged, target: m.total });
  }
  // G11. Hoy podés subir peso (la última vez llegaste al tope de reps en todas las series)
  if (R.planned(date) && !R.trained(date)) {
    const v = R.cfg.cycle[DOW_KEYS[dow(date)]];
    const r = (R.cfg.training || [])[parseInt(v, 10)];
    const hist = state.exerciseHistory || {};
    ((r && r.exercises) || []).some((ex) => {
      const last = (hist[ex.name] || []).find((e) => e && e.date < date);
      if (!last || !ex.topRep || !(last.setsLog || []).length) return false;
      const all = last.setsLog.every((s) => (parseInt(s.reps, 10) || 0) >= ex.topRep);
      if (all) add('g_level_up', 'gym', 55, 'Hoy subí peso en ' + ex.name, 'la última vez hiciste ' + ex.topRep + ' en todas las series');
      return all;
    });
  }
  return out;
}

// ── Destacado del día ───────────────────────────────────────────
// Prioriza logros recientes (de hoy o ayer); si no hay, un objetivo en progreso.
function rawPick(state, date, h, exclude) {
  const wins = winsAsOf(state, date, h).filter((w) => w.date >= addDays(date, -1));
  const goals = goalsAsOf(state, date, h);
  const pool = (wins.length ? wins : goals).filter((x) => !exclude || exclude.indexOf(x.rule) === -1);
  const list = pool.length ? pool : wins.length ? wins : goals;
  if (!list.length) return null;
  list.sort((a, b) => b.prio - a.prio || (a.id < b.id ? -1 : 1));
  // Entre los 3 más importantes, uno fijo para la fecha
  const top = list.slice(0, Math.min(3, list.length));
  return top[hash(date) % top.length];
}

// Se recorre día por día desde un ancla fija (alineada por semana): cada día excluye
// las reglas que se destacaron de verdad los 3 días anteriores. Así todos los días de
// una semana ven la misma historia y no se repite la misma regla seguida.
function featuredFor(state, date, h) {
  const dayNum = Math.round(new Date(date + 'T12:00:00Z').getTime() / 86400000);
  const start = addDays(date, -((dayNum % 7) + 7));
  const shown = [];
  let pick = null;
  for (let d = start; d <= date; d = addDays(d, 1)) {
    pick = rawPick(state, d, h, shown.slice(-3));
    shown.push(pick ? pick.rule : null);
  }
  return pick;
}

function computeGoals(state, date, h) {
  const wins = winsAsOf(state, date, h).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.prio - a.prio));
  const goals = goalsAsOf(state, date, h).sort((a, b) => b.prio - a.prio);
  return {
    computedAt: Date.now(),
    date,
    featured: featuredFor(state, date, h),
    wins: wins.slice(0, 15),
    goals: goals.slice(0, 10),
    rules: { wins: 27, goals: 11 },
  };
}

module.exports = { computeGoals, winsAsOf, goalsAsOf, featuredFor, weekStart, addDays };
