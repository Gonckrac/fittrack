// ─── EVENTOS DEL RELOJ → STATE ───────────────────────────────────
// Lógica compartida entre el servidor (api/watch/*) y la app web.
// Cada evento que manda el reloj (comida, suplemento, sueño, peso, estudio,
// despertar) se aplica al state de FitTrack de forma IDEMPOTENTE: si el mismo
// evento llega dos veces, se aplica una sola. Así, si la app web pisa el state
// con datos viejos, al abrir vuelve a aplicar lo que falte desde la bandeja.
//
// Evento: { id: string único, type: string, date: 'YYYY-MM-DD', at: ms, data: {...} }

(function (root) {
  var MAX_APPLIED = 800; // ids recordados (más que suficiente para ~2 semanas)

  function todayAR() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });
  }

  function ensureDay(state, date) {
    if (!state[date]) {
      state[date] = { foods: [], supps: {}, sleep: {}, metrics: null, kcal: { burned: 0, active: 0 }, trainDay: 0 };
    }
    var d = state[date];
    if (!Array.isArray(d.foods)) d.foods = [];
    if (!d.supps) d.supps = {};
    if (!d.sleep) d.sleep = {};
    return d;
  }

  function num(v) {
    var n = parseFloat(v);
    return isNaN(n) ? 0 : Math.round(n * 10) / 10;
  }

  // Pesos: hasta 2 decimales exactos (11,25 · 12,75), acepta coma o punto
  function kg2(v) {
    var n = parseFloat(String(v == null ? '' : v).replace(',', '.'));
    return isNaN(n) || n < 0 ? 0 : Math.round(n * 100) / 100;
  }

  var HANDLERS = {
    // Comida: { name, meal: 'Desayuno'|'Almuerzo'|'Merienda'|'Cena'|'Extra', prot, carb, fat }
    food: function (state, ev) {
      var d = ensureDay(state, ev.date);
      var f = ev.data || {};
      d.foods.push({
        id: 'w_' + ev.id,
        name: f.name || 'Comida (reloj)',
        meal: f.meal || 'Extra',
        prot: num(f.prot),
        carb: num(f.carb),
        fat: num(f.fat),
        src: 'reloj',
      });
    },

    // Borrar una comida cargada desde el reloj: { foodEventId }
    food_undo: function (state, ev) {
      var d = ensureDay(state, ev.date);
      var target = 'w_' + (ev.data || {}).foodEventId;
      d.foods = d.foods.filter(function (f) { return f.id !== target; });
    },

    // Agua: { ml } (negativo = deshacer un vaso)
    water: function (state, ev) {
      var d = ensureDay(state, ev.date);
      var ml = parseFloat((ev.data || {}).ml) || 0;
      d.water = Math.max(0, Math.round((d.water || 0) + ml));
    },

    // Suplemento: { id, taken: true|false, at (ms, hora real en que lo marcaste) }
    // Si llega una marca más vieja que la última guardada, no la pisa.
    supp: function (state, ev) {
      var d = ensureDay(state, ev.date);
      var s = ev.data || {};
      if (!s.id) return;
      if (!d.suppsAt || typeof d.suppsAt !== 'object') d.suppsAt = {};
      var prev = d.suppsAt[s.id];
      var at = +s.at || ev.at || 0;
      if (prev && prev.at && at && prev.at > at) return;
      d.supps[s.id] = s.taken !== false;
      d.suppsAt[s.id] = { at: at, taken: s.taken !== false, src: 'reloj' };
    },

    // Plan de estudio semanal del horario del reloj (para los objetivos):
    // { v, byDow: { 0: { min, blocks }, ... } }
    study_plan: function (state, ev) {
      var p = ev.data || {};
      if (!p.byDow) return;
      if (!state.config || typeof state.config !== 'object') state.config = {};
      var prev = state.config.studyPlan;
      if (prev && (prev.at || 0) > (ev.at || 0)) return;
      state.config.studyPlan = { v: p.v || 1, byDow: p.byDow, at: ev.at };
    },

    // Cambio de horario de un bloque (mover/acortar un bloque de estudio desde el reloj):
    // { date, key: 'study@15:45', t, end, min, label, removed, at }
    schedule: function (state, ev) {
      var o = ev.data || {};
      var date = o.date || ev.date;
      if (!o.key || !date) return;
      if (!state.scheduleOverrides || typeof state.scheduleOverrides !== 'object') state.scheduleOverrides = {};
      var day = state.scheduleOverrides[date] || (state.scheduleOverrides[date] = {});
      var prev = day[o.key];
      if (prev && (prev.at || 0) > (o.at || 0)) return;
      day[o.key] = { t: o.t || null, end: o.end || null, min: o.min != null ? Math.round(+o.min) : null, label: o.label || null, removed: !!o.removed, at: o.at || ev.at };
      // Solo se guardan los últimos 30 días
      var keys = Object.keys(state.scheduleOverrides).sort();
      while (keys.length > 30) delete state.scheduleOverrides[keys.shift()];
    },

    // Sueño de la noche que TERMINA en ev.date:
    // { hours, deep, rem, light, awake (todo en horas), score (0-100),
    //   bedtime: 'HH:MM', wake: 'HH:MM', efficiency (%) }
    sleep: function (state, ev) {
      var d = ensureDay(state, ev.date);
      var s = ev.data || {};
      var cur = d.sleep || {};
      // No pisamos una carga manual
      if (cur.manHours && !cur.src) return;
      d.sleep = Object.assign({}, cur, {
        hours: num(s.hours),
        deep: s.deep != null ? num(s.deep) : cur.deep,
        rem: s.rem != null ? num(s.rem) : cur.rem,
        light: s.light != null ? num(s.light) : cur.light,
        efficiency: s.efficiency != null ? Math.round(s.efficiency) : cur.efficiency,
        readiness: s.score != null ? Math.round(s.score) : cur.readiness,
        bedtime: s.bedtime || cur.bedtime,
        wake: s.wake || cur.wake,
        src: 'reloj',
      });
    },

    // Peso / composición (balanza vía atajo del iPhone o reloj): { weight, bf, muscle }
    metrics: function (state, ev) {
      var m = ev.data || {};
      if (typeof m.weight === 'string') m.weight = m.weight.replace(',', '.').replace(/[^\d.]/g, '');
      if (!m.weight || !parseFloat(m.weight)) return;
      if (!Array.isArray(state.metricsHistory)) state.metricsHistory = [];
      var entry = { date: ev.date, weight: num(m.weight) };
      // Salud del iPhone a veces da porcentajes como fracción (0.18 = 18 %)
      var pct = function (v) { var n = parseFloat(String(v).replace(',', '.').replace('%', '')); return isNaN(n) ? null : n > 0 && n <= 1 ? num(n * 100) : num(n); };
      if (m.bf != null && m.bf !== '' && pct(m.bf) != null) entry.bf = pct(m.bf);
      if (m.muscle != null && m.muscle !== '' && pct(m.muscle) != null) entry.muscle = pct(m.muscle);
      state.metricsHistory = state.metricsHistory.filter(function (h) { return h.date !== ev.date; });
      state.metricsHistory.push(entry);
      state.metricsHistory.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    },

    // Bloque de estudio: { label, plannedMin, doneMin, start: 'HH:MM', status: 'done'|'partial'|'skipped' }
    study: function (state, ev) {
      var d = ensureDay(state, ev.date);
      if (!Array.isArray(d.study)) d.study = [];
      var s = ev.data || {};
      // Un bloque con id propio se registra una sola vez (aunque reabras la app o se reintente)
      if (s.id && d.study.some(function (x) { return x.blockId === s.id; })) return;
      d.study.push({
        blockId: s.id || null,
        blockKey: s.blockKey || null,
        id: 'w_' + ev.id,
        label: s.label || 'Estudio',
        plannedMin: Math.round(s.plannedMin || 0),
        doneMin: Math.round(s.doneMin || 0),
        pomos: s.pomos != null ? Math.round(+s.pomos || 0) : null,
        start: s.start || null,
        status: s.status || 'done',
      });
    },

    // Ejercicio terminado en el reloj:
    // { day (1-based, igual que trainDay), exIdx, name, totalEx, sets: [{kg, reps}] }
    // Queda igual que si lo tachabas en la app: trainSets_<day> + exerciseHistory.
    gym_ex: function (state, ev) {
      var g = ev.data || {};
      if (!g.day || g.exIdx == null || !Array.isArray(g.sets) || !g.sets.length) return;
      var d = ensureDay(state, ev.date);
      var key = 'trainSets_' + g.day;
      if (!d[key]) d[key] = {};
      var total = g.totalEx || 0;
      for (var i = 0; i < total; i++) if (!d[key][i]) d[key][i] = [];
      d[key][g.exIdx] = g.sets.map(function (s) {
        return { kg: s.kg != null ? String(s.kg) : '', reps: s.reps != null ? String(s.reps) : '', done: true };
      });
      d.trainingStarted = true;
      d.trainDay = g.day;

      if (!g.name) return;
      if (!state.exerciseHistory || typeof state.exerciseHistory !== 'object') state.exerciseHistory = {};
      var hist = state.exerciseHistory[g.name] || [];
      var kg = g.sets.map(function (s) { return parseFloat(s.kg); }).filter(function (v) { return !isNaN(v) && v > 0; });
      var reps = g.sets.map(function (s) { return parseFloat(s.reps); }).filter(function (v) { return !isNaN(v) && v > 0; });
      if (!kg.length) return;
      var maxKg = Math.max.apply(null, kg);
      var avgReps = reps.length ? Math.round(reps.reduce(function (a, b) { return a + b; }, 0) / reps.length) : null;
      var entry = {
        date: ev.date,
        maxKg: maxKg,
        avgReps: avgReps,
        oneRM: avgReps ? Math.round(maxKg * (1 + avgReps / 30)) : maxKg,
        sets: g.sets.length,
        setsLog: g.sets.map(function (s) { return { kg: String(s.kg || ''), reps: String(s.reps || '') }; }),
        src: 'reloj',
      };
      hist = hist.filter(function (h) { return h.date !== ev.date; }); // si lo rehace, queda lo último
      hist.unshift(entry);
      state.exerciseHistory[g.name] = hist.slice(0, 40);
    },

    // Rutina y plan de comidas que manda el reloj (una vez por versión):
    // { v, training: [rutinas], cycle: { Mon: 0, ... }, mealPlan: [7 días, lunes primero], presets: [...] }
    // Guarda lo anterior en config.programBackup. Si ya hay una versión igual o más
    // nueva (o la editaste en la app después), no pisa nada.
    program: function (state, ev) {
      var p = ev.data || {};
      if (!p.v || !Array.isArray(p.training) || !p.training.length) return;
      if (!state.config || typeof state.config !== 'object') state.config = {};
      var cfg = state.config;
      if ((cfg.programV || 0) >= p.v) return;
      cfg.programBackup = {
        at: ev.date,
        training: cfg.training || null,
        cycle: cfg.cycle || null,
        mealPlan: (state.mealPlan && state.mealPlan.plan) || null,
      };
      cfg.training = p.training;
      if (p.cycle) cfg.cycle = p.cycle;
      if (Array.isArray(p.mealPlan) && p.mealPlan.length === 7) {
        if (!state.mealPlan || typeof state.mealPlan !== 'object') state.mealPlan = {};
        state.mealPlan.plan = p.mealPlan;
        state.mealPlan.generatedAt = ev.date;
        state.mealPlan.source = 'recetario';
      }
      if (Array.isArray(p.presets)) {
        if (!Array.isArray(state.foodPresets)) state.foodPresets = [];
        p.presets.forEach(function (x) {
          state.foodPresets = state.foodPresets.filter(function (f) { return String(f.name).toLowerCase() !== String(x.name).toLowerCase(); });
          state.foodPresets.unshift(x);
        });
      }
      // El día de hoy pasa a la rutina nueva que le toca
      var dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(ev.date + 'T12:00:00Z').getUTCDay()];
      var idx = cfg.cycle && cfg.cycle[dow];
      var d = ensureDay(state, ev.date);
      var trained = Object.keys(d).some(function (k) { return k.indexOf('trainSets_') === 0; });
      if (!trained && typeof idx === 'number' && idx >= 0) d.trainDay = idx + 1;
      cfg.programV = p.v;
    },

    // Una serie hecha (o corregida, o borrada) en el reloj:
    // { sessionId, setId, day, exIdx, name, totalEx, setIndex, side: null|'der'|'izq',
    //   kg, reps, timed, completedAtMs, restSec, rev, deleted }
    // La serie tiene identidad estable (setId) y versión (rev): si llega dos veces,
    // o llega una versión vieja después de una nueva, no cambia nada.
    gym_set: function (state, ev) {
      var g = ev.data || {};
      if (!g.setId || !g.day || g.exIdx == null || g.setIndex == null) return;
      var d = ensureDay(state, ev.date);
      if (!d.watchSets || typeof d.watchSets !== 'object') d.watchSets = {};
      var prev = d.watchSets[g.setId];
      if (prev && (prev.rev || 0) >= (g.rev || 0)) return;
      d.watchSets[g.setId] = {
        day: g.day, exIdx: g.exIdx, name: g.name || (prev && prev.name) || '', setIndex: g.setIndex,
        side: g.side || null, kg: kg2(g.kg), reps: Math.round(+g.reps || 0), timed: !!g.timed,
        at: g.completedAtMs || ev.at, restSec: g.restSec || null, rev: g.rev || 1, deleted: !!g.deleted,
        sessionId: g.sessionId || null,
      };
      rebuildWatchExercise(state, d, ev.date, g.day, g.exIdx, g.totalEx);
    },

    // Fin del entrenamiento: { sessionId, day, name, startedAt, endedAt, durationMin, sets, volume }
    gym_end: function (state, ev) {
      var g = ev.data || {};
      if (!g.sessionId) return;
      var d = ensureDay(state, ev.date);
      if (!Array.isArray(d.workouts)) d.workouts = [];
      d.workouts = d.workouts.filter(function (w) { return w.sessionId !== g.sessionId; });
      d.workouts.push({
        sessionId: g.sessionId, day: g.day || null, name: g.name || '', startedAt: g.startedAt || null,
        endedAt: g.endedAt || null, durationMin: Math.round(+g.durationMin || 0), sets: +g.sets || 0,
        volume: +g.volume || 0, src: 'reloj',
      });
    },

    // Hora a la que apagó la alarma: { time: 'HH:MM', target: 'HH:MM' }
    wake: function (state, ev) {
      var d = ensureDay(state, ev.date);
      d.wake = { time: (ev.data || {}).time, target: (ev.data || {}).target || null, src: 'reloj' };
    },
  };

  // Reconstruye las filas de un ejercicio (trainSets_<day>[exIdx]) y su historial
  // del día a partir de las series del reloj. Las filas que cargaste en la app web
  // en posiciones que el reloj no tocó se respetan.
  function rebuildWatchExercise(state, d, date, day, exIdx, totalEx) {
    var key = 'trainSets_' + day;
    if (!d[key]) d[key] = {};
    for (var i = 0; i < (totalEx || 0); i++) if (!d[key][i]) d[key][i] = [];
    var mine = [];
    Object.keys(d.watchSets).forEach(function (id) {
      var s = d.watchSets[id];
      if (s.day === day && s.exIdx === exIdx) mine.push(s);
    });
    var rows = (d[key][exIdx] || []).slice();
    // Primero se limpian las filas que había puesto el reloj
    rows = rows.map(function (r) { return r && r.w ? { kg: '', reps: '', done: false } : r; });
    var byIdx = {};
    mine.forEach(function (s) {
      if (s.deleted) return;
      (byIdx[s.setIndex] = byIdx[s.setIndex] || {})[s.side || '-'] = s;
    });
    Object.keys(byIdx).forEach(function (k) {
      var idx = +k;
      var b = byIdx[k];
      var main = b['-'] || b.der || b.izq;
      var row = { kg: String(main.kg), reps: String(main.reps), done: true, w: 1 };
      if (b.der || b.izq) {
        row.sides = {};
        if (b.der) row.sides.der = { kg: b.der.kg, reps: b.der.reps };
        if (b.izq) row.sides.izq = { kg: b.izq.kg, reps: b.izq.reps };
        row.done = !!(b.der && b.izq);
      }
      while (rows.length <= idx) rows.push({ kg: '', reps: '', done: false });
      rows[idx] = row;
    });
    // Sin filas vacías colgando al final
    while (rows.length && !rows[rows.length - 1].done && rows[rows.length - 1].kg === '' && rows[rows.length - 1].reps === '') rows.pop();
    d[key][exIdx] = rows;
    d.trainingStarted = true;
    d.trainDay = day;

    // Historial del día del ejercicio (por nombre, como lo usa la app)
    var name = (mine[0] && mine[0].name) || '';
    if (!name) return;
    if (!state.exerciseHistory || typeof state.exerciseHistory !== 'object') state.exerciseHistory = {};
    var hist = (state.exerciseHistory[name] || []).filter(function (h) { return h.date !== date; });
    // Todas las apariciones del ejercicio ese día (puede estar dos veces en la rutina)
    var all = [];
    Object.keys(d.watchSets).forEach(function (id) {
      var s = d.watchSets[id];
      if (!s.deleted && s.name === name && s.day === day) all.push(s);
    });
    all.sort(function (a, b) { return a.exIdx - b.exIdx || a.setIndex - b.setIndex || (a.side === 'izq' ? 1 : 0) - (b.side === 'izq' ? 1 : 0); });
    if (all.length) {
      var kgs = all.map(function (s) { return s.kg; }).filter(function (v) { return v > 0; });
      var reps = all.map(function (s) { return s.reps; }).filter(function (v) { return v > 0; });
      var maxKg = kgs.length ? Math.max.apply(null, kgs) : 0;
      var avgReps = reps.length ? Math.round(reps.reduce(function (a, b) { return a + b; }, 0) / reps.length) : null;
      var byEx = {};
      all.forEach(function (s) {
        (byEx[s.exIdx] = byEx[s.exIdx] || []).push(s.side ? [s.kg, s.reps, s.side] : [s.kg, s.reps]);
      });
      hist.unshift({
        date: date,
        maxKg: maxKg,
        avgReps: avgReps,
        oneRM: avgReps ? Math.round(maxKg * (1 + avgReps / 30)) : maxKg,
        sets: all.length,
        setsLog: all.map(function (s) { var o = { kg: String(s.kg), reps: String(s.reps) }; if (s.side) o.side = s.side; return o; }),
        byIdx: byEx,
        src: 'reloj',
      });
    }
    state.exerciseHistory[name] = hist.slice(0, 40);
  }

  // Aplica una lista de eventos. Devuelve cuántos se aplicaron (0 = nada nuevo).
  function applyWatchEvents(state, events) {
    if (!state || !Array.isArray(events)) return 0;
    if (!state._watchApplied || typeof state._watchApplied !== 'object') state._watchApplied = {};
    var applied = 0;
    events
      .slice()
      .sort(function (a, b) { return (a.at || 0) - (b.at || 0); })
      .forEach(function (ev) {
        if (!ev || !ev.id || !ev.type || state._watchApplied[ev.id]) return;
        var h = HANDLERS[ev.type];
        if (!h) return;
        if (!ev.date) ev.date = todayAR();
        try {
          h(state, ev);
          state._watchApplied[ev.id] = ev.at || Date.now();
          applied++;
        } catch (e) {
          if (typeof console !== 'undefined') console.warn('[watch] evento inválido', ev.type, e && e.message);
        }
      });
    // Recortar la lista de ids aplicados (los más viejos primero)
    var ids = Object.keys(state._watchApplied);
    if (ids.length > MAX_APPLIED) {
      ids
        .sort(function (a, b) { return state._watchApplied[a] - state._watchApplied[b]; })
        .slice(0, ids.length - MAX_APPLIED)
        .forEach(function (id) { delete state._watchApplied[id]; });
    }
    return applied;
  }

  var api = { applyWatchEvents: applyWatchEvents, todayAR: todayAR, EVENT_TYPES: Object.keys(HANDLERS) };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.applyWatchEvents = applyWatchEvents;
})(typeof window !== 'undefined' ? window : this);
