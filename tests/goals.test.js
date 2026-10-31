// Objetivos y logros: se desbloquean SOLO con datos reales; sin evidencia no aparecen.
// El destacado del día es estable por fecha y no repite la misma regla 3 días seguidos.
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSummary } = require('../api/watch/_summary.js');
const { winsAsOf, goalsAsOf, featuredFor } = require('../api/watch/_goals.js');
const { applyWatchEvents } = require('../public/js/utils/watch-apply.js');

function base() {
  return {
    config: {
      prot: 152, kcal: 2600,
      supps: [{ id: 'creatina', name: 'Creatina', dose: '5 g', time: 'morning' }, { id: 'mag', name: 'Magnesio', dose: '160 mg', time: 'night' }],
      cycle: { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 },
      training: [{ name: 'Full', exercises: [{ name: 'Press', sets: 3, reps: '10', topRep: 10 }] }],
      studyPlan: { byDow: { 0: { min: 210, blocks: 1 }, 1: { min: 0, blocks: 0 }, 2: { min: 120, blocks: 1 }, 3: { min: 120, blocks: 1 }, 4: { min: 120, blocks: 1 }, 5: { min: 120, blocks: 2 }, 6: { min: 210, blocks: 1 } } },
    },
  };
}
function addDays(date, n) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const DATE = '2026-11-08'; // domingo
function day(st, d) {
  return (st[d] = st[d] || { foods: [], supps: {} });
}
function trainOn(st, d) {
  day(st, d).trainSets_1 = { 0: [{ kg: '60', reps: '10', done: true }] };
}
function feed(st, d, prot) {
  day(st, d).foods.push({ name: 'x', prot, carb: 0, fat: 0 });
}

test('sin registros no hay ningún logro (y la ausencia no cuenta como "no lo hiciste")', () => {
  const st = base();
  const s = buildSummary(st, DATE);
  assert.equal(s.goals.wins.length, 0);
  // Objetivos sí (lo que falta), pero ninguno inventa un dato que no está
  assert.ok(!s.goals.goals.some((g) => g.rule === 'g_prot'), 'sin comidas cargadas no dice "te faltan X g"');
});

test('7 días seguidos entrenando → logro; con un día sin registro → no', () => {
  const st = base();
  for (let i = 0; i < 7; i++) trainOn(st, addDays(DATE, -i));
  const s = buildSummary(st, DATE);
  assert.ok(s.goals.wins.some((w) => w.rule === 'train_streak' && /7 días seguidos/.test(w.title)));
  const st2 = base();
  for (let i = 0; i < 7; i++) if (i !== 3) trainOn(st2, addDays(DATE, -i));
  assert.ok(!buildSummary(st2, DATE).goals.wins.some((w) => w.rule === 'train_streak'));
});

test('proteína 5 días seguidos y "día redondo" solo con todos los datos', () => {
  const st = base();
  for (let i = 0; i < 5; i++) feed(st, addDays(DATE, -i), 160);
  let s = buildSummary(st, DATE);
  assert.ok(s.goals.wins.some((w) => w.rule === 'prot_streak'));
  assert.ok(!s.goals.wins.some((w) => w.rule === 'all_goals_today'), 'falta agua, suplementos y entreno');
  const d = day(st, DATE);
  d.water = 4000;
  d.supps = { creatina: true, mag: true };
  trainOn(st, DATE);
  s = buildSummary(st, DATE);
  assert.ok(s.goals.wins.some((w) => w.rule === 'all_goals_today'));
});

test('récord de repeticiones por serie, con datos reales del historial', () => {
  const st = base();
  st.exerciseHistory = {
    Press: [
      { date: addDays(DATE, -1), maxKg: 60, setsLog: [{ kg: '60', reps: '11' }, { kg: '60', reps: '9' }] },
      { date: addDays(DATE, -5), maxKg: 60, setsLog: [{ kg: '60', reps: '10' }, { kg: '60', reps: '9' }] },
      { date: addDays(DATE, -9), maxKg: 60, setsLog: [{ kg: '60', reps: '9' }] },
    ],
  };
  const s = buildSummary(st, DATE);
  const w = s.goals.wins.find((x) => x.rule === 'pr_reps');
  assert.ok(w, 'récord de reps');
  assert.match(w.sub, /60 kg × 11 \(antes 10\)/);
  assert.ok(!s.goals.wins.some((x) => x.rule === 'pr_weight'), 'el peso no subió: no hay récord de peso');
});

test('objetivos: entrenos que faltan en la semana y proteína solo si hay comidas', () => {
  const st = base();
  trainOn(st, '2026-11-02');
  trainOn(st, '2026-11-03');
  feed(st, DATE, 100);
  const s = buildSummary(st, DATE);
  const g = s.goals.goals.find((x) => x.rule === 'g_week_train');
  assert.match(g.title, /Te faltan 5 entrenos/);
  assert.deepEqual(g.progress, { cur: 2, target: 7 });
  assert.ok(s.goals.goals.some((x) => x.rule === 'g_prot' && /52 g/.test(x.title)));
});

test('destacado estable por fecha y sin repetir la misma regla 3 días seguidos', () => {
  const st = base();
  for (let i = 0; i < 20; i++) {
    const d = addDays(DATE, -i);
    trainOn(st, d);
    feed(st, d, 160);
    day(st, d).water = 4000;
    day(st, d).supps = { creatina: true, mag: true };
    day(st, d).study = [{ doneMin: 130, status: 'done', blockKey: 'study@15:45' }];
  }
  const s1 = buildSummary(st, DATE).goals.featured;
  const s2 = buildSummary(st, DATE).goals.featured;
  assert.deepEqual(s1.id, s2.id, 'abrir dos veces da lo mismo');
  const rules = [];
  for (let i = 0; i < 6; i++) rules.push(buildSummary(st, addDays(DATE, -i)).goals.featured.rule);
  for (let i = 0; i + 1 < rules.length; i++) assert.notEqual(rules[i], rules[i + 1], 'no repite de un día al otro: ' + rules.join(', '));
});

test('hay al menos 25 reglas de logros y objetivos', () => {
  const s = buildSummary(base(), DATE);
  assert.ok(s.goals.rules.wins + s.goals.rules.goals >= 25);
});

test('suplemento con hora real; una marca vieja no pisa una nueva', () => {
  const st = base();
  applyWatchEvents(st, [{ id: 'a', type: 'supp', date: DATE, at: 2000, data: { id: 'creatina', taken: true, at: 2000 } }]);
  applyWatchEvents(st, [{ id: 'b', type: 'supp', date: DATE, at: 1000, data: { id: 'creatina', taken: false, at: 1000 } }]);
  assert.equal(st[DATE].supps.creatina, true);
  const s = buildSummary(st, DATE);
  assert.equal(s.supps.find((x) => x.id === 'creatina').takenAt, 2000);
  assert.equal(s.supps.find((x) => x.id === 'creatina').dose, '5 g', 'dosis planificada sin tocar');
});

test('estudio con id: no se registra dos veces; cambios de horario vuelven en el resumen', () => {
  const st = base();
  const ev = (id) => ({ id, type: 'study', date: DATE, at: 1, data: { id: 'st1', label: 'Estudio', plannedMin: 60, doneMin: 43, status: 'partial', pomos: 1 } });
  applyWatchEvents(st, [ev('e1')]);
  applyWatchEvents(st, [ev('e2')]); // reintento con otro id de evento
  assert.equal(st[DATE].study.length, 1);
  assert.equal(st[DATE].study[0].doneMin, 43);
  applyWatchEvents(st, [{ id: 's1', type: 'schedule', date: DATE, at: 5, data: { date: DATE, key: 'study@09:30', t: '10:00', end: '13:00', min: 180, at: 5 } }]);
  const s = buildSummary(st, DATE);
  assert.equal(s.schedule[DATE]['study@09:30'].t, '10:00');
});
