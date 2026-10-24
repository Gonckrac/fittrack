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

const MAX_EVENTS = 100;

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
    await storeInbox(client, events);
    const state = await loadState(client);
    const applied = applyWatchEvents(state, events);
    if (applied) await saveState(client, state);
    res.status(200).json({
      ok: true,
      received: events.length,
      applied,
      ids: events.map((e) => e.id), // el reloj saca estos de su cola
      summary: buildSummary(state, todayAR()),
    });
  } catch (e) {
    console.error('[watch/log]', e.message);
    res.status(500).json({ error: e.message });
  }
};
