// node --test tests/  · Series del reloj en FitTrack: idempotencia, versiones,
// edición, borrado, superserie, por lado y el resumen que vuelve al reloj.
const test = require('node:test');
const assert = require('node:assert/strict');
const { applyWatchEvents } = require('../public/js/utils/watch-apply.js');
const { buildSummary } = require('../api/watch/_summary.js');

const DATE = '2026-11-02'; // lunes
function baseState() {
  return {
    config: {
      prot: 152,
      cycle: { Mon: 0 },
      training: [{
        name: 'Pecho', exercises: [
          { name: 'Press', sets: 3, reps: '10', topRep: 10, ssGroup: 'A', ssPart: 'a', ssRestSec: 180, restSec: 180 },
          { name: 'Tríceps', sets: 3, reps: '12', topRep: 12, ssGroup: 'A', ssPart: 'b', restSec: 90 },
          { name: 'Remo', sets: 2, reps: '12 por lado', topRep: 12, restSec: 180 },
        ],
      }],
    },
  };
}
let n = 0;
function setEv(exIdx, setIndex, kg, reps, rev = 1, extra = {}) {
  const side = extra.side || null;
  const setId = 'S1:' + exIdx + ':' + (side || '-') + ':' + setIndex;
  return {
    id: setId + '#' + rev, type: 'gym_set', date: DATE, at: 1000 + n++,
    data: { sessionId: 'S1', setId, day: 1, exIdx, name: ['Press', 'Tríceps', 'Remo'][exIdx], totalEx: 3, setIndex, side, kg, reps, rev, deleted: false, ...extra },
  };
}

test('guardar una serie y reintentar el mismo evento no duplica', () => {
  const st = baseState();
  const ev = setEv(0, 0, 60, 10);
  assert.equal(applyWatchEvents(st, [ev]), 1);
  assert.equal(applyWatchEvents(st, [ev]), 0, 'el reintento no aplica nada');
  const rows = st[DATE].trainSets_1[0];
  assert.equal(rows.length, 1);
  assert.deepEqual([rows[0].kg, rows[0].reps, rows[0].done], ['60', '10', true]);
  assert.equal(st.exerciseHistory.Press[0].sets, 1);
});

test('superserie: series de los dos ejercicios, en su lugar', () => {
  const st = baseState();
  applyWatchEvents(st, [setEv(0, 0, 60, 10), setEv(1, 0, 20, 12), setEv(0, 1, 60, 9), setEv(1, 1, 20, 11)]);
  const d = st[DATE].trainSets_1;
  assert.deepEqual(d[0].map((r) => r.reps), ['10', '9']);
  assert.deepEqual(d[1].map((r) => r.reps), ['12', '11']);
  assert.deepEqual(st.exerciseHistory.Press[0].setsLog.map((s) => s.reps), ['10', '9']);
});

test('corregir una serie: gana la versión más nueva aunque la vieja llegue después', () => {
  const st = baseState();
  applyWatchEvents(st, [setEv(0, 0, 60, 10, 2)]);
  applyWatchEvents(st, [setEv(0, 0, 57.5, 8, 1)]); // versión vieja, llega tarde
  const row = st[DATE].trainSets_1[0][0];
  assert.deepEqual([row.kg, row.reps], ['60', '10']);
  applyWatchEvents(st, [setEv(0, 0, 62.75, 9, 3)]);
  assert.deepEqual([st[DATE].trainSets_1[0][0].kg, st[DATE].trainSets_1[0][0].reps], ['62.75', '9']);
  assert.equal(st.exerciseHistory.Press[0].maxKg, 62.75, 'peso exacto con 2 decimales');
});

test('borrar una serie la saca de la app y del historial', () => {
  const st = baseState();
  applyWatchEvents(st, [setEv(0, 0, 60, 10), setEv(0, 1, 60, 9)]);
  applyWatchEvents(st, [setEv(0, 1, 60, 9, 2, { deleted: true })]);
  assert.equal(st[DATE].trainSets_1[0].length, 1);
  assert.equal(st.exerciseHistory.Press[0].sets, 1);
});

test('por lado: una fila por serie con los dos lados', () => {
  const st = baseState();
  applyWatchEvents(st, [setEv(2, 0, 30, 12, 1, { side: 'der' })]);
  let row = st[DATE].trainSets_1[2][0];
  assert.equal(row.done, false, 'falta el izquierdo');
  applyWatchEvents(st, [setEv(2, 0, 28, 11, 1, { side: 'izq' })]);
  row = st[DATE].trainSets_1[2][0];
  assert.equal(row.done, true);
  assert.deepEqual(row.sides, { der: { kg: 30, reps: 12 }, izq: { kg: 28, reps: 11 } });
});

test('el resumen manda la vez anterior serie por serie (sin promediar) y por lado', () => {
  const st = baseState();
  // Sesión anterior (otra fecha)
  const old = (e) => Object.assign(e, { date: '2026-10-26' });
  applyWatchEvents(st, [old(setEv(0, 0, 60, 10)), old(setEv(0, 1, 60, 9)), old(setEv(0, 2, 57.5, 8)),
    old(setEv(2, 0, 30, 12, 1, { side: 'der' })), old(setEv(2, 0, 28, 11, 1, { side: 'izq' }))]);
  const s = buildSummary(st, DATE);
  assert.deepEqual(s.training.exercises[0].last.log, [[60, 10], [60, 9], [57.5, 8]]);
  assert.deepEqual(s.training.exercises[2].last.log, [[30, 12, 'der'], [28, 11, 'izq']]);
  assert.equal(s.training.exercises[0].rest, 180, 'descanso en segundos');
});

test('un ejercicio repetido en la rutina usa la aparición de su posición', () => {
  const st = baseState();
  st.config.training[0].exercises.push({ name: 'Press', sets: 2, reps: '10', restSec: 120 });
  const ev = (exIdx, i, kg, reps) => {
    const e = setEv(exIdx, i, kg, reps);
    e.data.name = 'Press';
    e.data.totalEx = 4;
    e.date = '2026-10-26';
    return e;
  };
  applyWatchEvents(st, [ev(0, 0, 60, 10), ev(3, 0, 40, 15)]);
  const s = buildSummary(st, DATE);
  assert.deepEqual(s.training.exercises[0].last.log, [[60, 10]]);
  assert.deepEqual(s.training.exercises[3].last.log, [[40, 15]]);
});

test('fin del entrenamiento: queda la duración real una sola vez', () => {
  const st = baseState();
  const ev = { id: 'end:S1', type: 'gym_end', date: DATE, at: 5, data: { sessionId: 'S1', day: 1, durationMin: 47, sets: 12, volume: 4320 } };
  applyWatchEvents(st, [ev]);
  applyWatchEvents(st, [Object.assign({}, ev, { id: 'end:S1b' })]);
  assert.equal(st[DATE].workouts.length, 1);
  assert.equal(st[DATE].workouts[0].durationMin, 47);
});
