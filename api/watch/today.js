// GET /api/watch/today[?date=YYYY-MM-DD]
// Header: x-watch-token
// Devuelve el resumen del día para el reloj (plan de comidas, lo comido,
// suplementos, sueño, entreno, peso y estudio).
const { sb, authorized, loadState, todayAR } = require('./_lib');
const { buildSummary } = require('./_summary');
const { upcomingExams } = require('./_calendar');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!authorized(req)) return res.status(401).json({ error: 'unauthorized' });
  try {
    const date = (req.query && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date || '')) ? req.query.date : todayAR();
    const [state, exams] = await Promise.all([
      loadState(sb()),
      upcomingExams().catch((e) => {
        console.warn('[watch/today] calendar', e.message);
        return { error: e.message }; // sin Calendar configurado, el resto anda igual
      }),
    ]);
    const summary = buildSummary(state, date);
    if (Array.isArray(exams)) summary.exams = exams;
    else if (exams && exams.error) summary.calendarError = exams.error;
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ ok: true, summary });
  } catch (e) {
    console.error('[watch/today]', e.message);
    res.status(500).json({ error: e.message });
  }
};
