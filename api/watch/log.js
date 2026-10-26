// POST /api/watch/log
// Header: x-watch-token
// Body: { events: [ { id, type, date?, at?, data } ] }
//
// 1) Guarda cada evento en la bandeja (fittrack_inbox) — fuente de verdad.
// 2) Lo aplica al state de FitTrack al toque, para que el export al Sheet y
//    los briefings lo vean aunque no abras la app.
// Si la app web después pisa el state con datos viejos, al abrir re-aplica
// desde la bandeja lo que falte (ver public/js/utils/watch-inbox.js).
const { sb, authorized, loadState, saveState, storeInbox, applyWatchEvents, todayAR } = require('./_lib');
const { buildSummary } = require('./_summary');
const { upcomingExams, createReminder } = require('./_calendar');
const { sportsFor } = require('./_sports');

const MAX_EVENTS = 100;

// Copia a la hoja de Google (igual que hace la app web) lo que llegó del reloj.
async function exportToSheets(events, state) {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.SHEETS_SECRET;
  if (!url || !secret) return;
  const gym = events
    .filter((e) => e.type === 'gym_ex' && e.data && e.data.name && Array.isArray(e.data.sets))
    .map((e) => {
      const kg = e.data.sets.map((s) => parseFloat(s.kg)).filter((v) => v > 0);
      const reps = e.data.sets.map((s) => parseFloat(s.reps)).filter((v) => v > 0);
      const avg = reps.length ? Math.round(reps.reduce((a, b) => a + b, 0) / reps.length) : '';
      return [e.date, e.data.name, e.data.sets.length, avg, kg.length ? Math.max(...kg) : ''];
    });
  const supps = (state.config && state.config.supps) || [];
  const sup = events
    .filter((e) => e.type === 'supp' && e.data && e.data.taken !== false)
    .map((e) => {
      const i = supps.findIndex((s, k) => (s.id || 'cfg_supp_' + k) === e.data.id);
      const s = supps[i];
      return s ? [e.date, s.name, s.dose || '', s.time || ''] : null;
    })
    .filter(Boolean);
  const post = (sheet, rows) =>
    rows.length
      ? fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret, sheet, rows }),
          redirect: 'follow',
        }).catch((err) => console.warn('[watch/log] sheets', sheet, err.message))
      : null;
  await Promise.all([post('Gym', gym), post('Suplementos', sup)]);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!authorized(req)) return res.status(401).json({ error: 'unauthorized' });

  const body = req.body || {};
  // El atajo del iPhone puede mandar un solo evento suelto
  let events = body.events !== undefined ? body.events : body.type ? [body] : [];
  if (!Array.isArray(events)) return res.status(400).json({ error: 'events debe ser una lista' });

  events = events
    .filter((ev) => ev && ev.id && ev.type)
    .slice(0, MAX_EVENTS)
    .map((ev) => ({
      id: String(ev.id).slice(0, 80),
      type: String(ev.type),
      date: /^\d{4}-\d{2}-\d{2}$/.test(ev.date || '') ? ev.date : todayAR(),
      at: +ev.at || Date.now(),
      data: ev.data || {},
    }));

  if (!events.length) return res.status(400).json({ error: 'sin eventos válidos' });

  try {
    const client = sb();
    // Recordatorios → Google Calendar. Si falla, NO se confirma al reloj (lo reintenta).
    const failed = {};
    await Promise.all(
      events
        .filter((e) => e.type === 'remind')
        .map((e) =>
          createReminder(e).catch((err) => {
            console.warn('[watch/log] remind', err.message);
            failed[e.id] = err.message;
          }),
        ),
    );
    events = events.filter((e) => !failed[e.id]);
    if (!events.length) return res.status(200).json({ ok: true, received: 0, applied: 0, ids: [], failed });
    await storeInbox(client, events);
    const state = await loadState(client);
    const before = Object.assign({}, state._watchApplied || {});
    const applied = applyWatchEvents(state, events);
    if (applied) {
      await saveState(client, state);
      // Solo exportamos lo que se aplicó por primera vez (no duplicar filas)
      await exportToSheets(events.filter((e) => !before[e.id]), state);
    }
    const summary = buildSummary(state, todayAR());
    const [exams, sports] = await Promise.all([upcomingExams().catch(() => null), sportsFor(todayAR()).catch(() => null)]);
    if (exams) summary.exams = exams;
    if (sports) summary.sports = sports;
    res.status(200).json({
      ok: true,
      received: events.length,
      applied,
      ids: events.map((e) => e.id), // el reloj saca estos de su cola
      failed,
      summary,
    });
  } catch (e) {
    console.error('[watch/log]', e.message);
    res.status(500).json({ error: e.message });
  }
};
