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

    // Suplemento: { id, taken: true|false }
    supp: function (state, ev) {
      var d = ensureDay(state, ev.date);
      var s = ev.data || {};
      if (!s.id) return;
      d.supps[s.id] = s.taken !== false;
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
      d.study.push({
        id: 'w_' + ev.id,
        label: s.label || 'Estudio',
        plannedMin: Math.round(s.plannedMin || 0),
        doneMin: Math.round(s.doneMin || 0),
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

    // Hora a la que apagó la alarma: { time: 'HH:MM', target: 'HH:MM' }
    wake: function (state, ev) {
      var d = ensureDay(state, ev.date);
      d.wake = { time: (ev.data || {}).time, target: (ev.data || {}).target || null, src: 'reloj' };
    },
  };

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
