const { createClient } = require('@supabase/supabase-js');

async function postToAppsScript(sheetName, rows) {
  if (!rows.length) return;
  const url    = process.env.APPS_SCRIPT_URL;
  const secret = process.env.SHEETS_SECRET;
  if (!url || !secret) throw new Error('APPS_SCRIPT_URL or SHEETS_SECRET not set');

  const r = await fetch(url, {
    method:   'POST',
    headers:  { 'Content-Type': 'application/json' },
    body:     JSON.stringify({ secret, sheet: sheetName, rows }),
    redirect: 'follow',
  });
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    throw new Error(`Apps Script ${r.status}: ${text.slice(0, 200)}`);
  }
}

module.exports = async function handler(req, res) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const syncKey = process.env.FITTRACK_SYNC_KEY;
  if (!syncKey) return res.status(500).json({ error: 'FITTRACK_SYNC_KEY not set' });

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });

  try {
    const sb = createClient(
      process.env.SUPABASE_URL || 'https://ovgavnoifmlbgjfcdphj.supabase.co',
      process.env.SUPABASE_ANON_KEY
    );
    const { data, error } = await sb.from('fittrack_state').select('data').eq('id', syncKey).single();
    if (error || !data) return res.status(200).json({ ok: true, msg: 'no state in Supabase' });

    const state   = data.data;
    const written = [];

    // ── Composición Corporal ──────────────────────────────────────
    const todayMetrics = (state.metricsHistory || []).find(h => h.date === today);
    if (todayMetrics) {
      await postToAppsScript('Composición Corporal', [[
        todayMetrics.date,
        todayMetrics.weight  ?? '',
        todayMetrics.bf      ?? '',
        todayMetrics.muscle  ?? '',
      ]]);
      written.push('Composición Corporal');
    }

    // ── Registro Diario ───────────────────────────────────────────
    const todayState = state[today];
    if (todayState) {
      const hasSets  = Object.keys(todayState).some(k => k.startsWith('trainSets_'));
      const hasSport = Object.keys(todayState).some(k => k.startsWith('sportDone_'));
      const trained  = (hasSets || hasSport) ? 'Sí' : 'No';
      const foods    = Array.isArray(todayState.foods) ? todayState.foods : [];
      const atePlan  = foods.length >= 3 ? 'Sí' : 'No';

      let trainType = '';
      if (hasSport) {
        const sportKey = Object.keys(todayState).find(k => k.startsWith('sportDone_'));
        if (sportKey) trainType = todayState[sportKey] || 'Deporte';
      } else if (hasSets) {
        const cfg      = state.config;
        const trainDay = todayState.trainDay;
        if (cfg && cfg.training && trainDay > 0) {
          const routine = cfg.training[trainDay - 1];
          if (routine) trainType = routine.name;
        }
      }

      await postToAppsScript('Registro Diario', [[today, trained, atePlan, trainType, '']]);
      written.push('Registro Diario');
    }

    res.status(200).json({ ok: true, written });
  } catch (e) {
    console.error('[Cron snapshot]', e.message);
    res.status(500).json({ error: e.message });
  }
};
