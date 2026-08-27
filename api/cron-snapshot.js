const { google }      = require('googleapis');
const { createClient } = require('@supabase/supabase-js');

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key   = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('Missing Google credentials env vars');
  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function appendRows(sheets, sheetId, sheetName, rows) {
  if (!rows.length) return;
  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  });
}

module.exports = async function handler(req, res) {
  // Verify Vercel cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const syncKey = process.env.FITTRACK_SYNC_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!syncKey) return res.status(500).json({ error: 'FITTRACK_SYNC_KEY not set' });
  if (!sheetId) return res.status(500).json({ error: 'GOOGLE_SHEET_ID not set' });

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' });

  try {
    // Read state from Supabase
    const sb = createClient(
      process.env.SUPABASE_URL || 'https://ovgavnoifmlbgjfcdphj.supabase.co',
      process.env.SUPABASE_ANON_KEY
    );
    const { data, error } = await sb.from('fittrack_state').select('data').eq('id', syncKey).single();
    if (error || !data) return res.status(200).json({ ok: true, msg: 'no state in Supabase' });

    const state   = data.data;
    const sheets  = google.sheets({ version: 'v4', auth: getAuth() });
    const written = [];

    // ── Composición Corporal ──────────────────────────────────────
    const todayMetrics = (state.metricsHistory || []).find(h => h.date === today);
    if (todayMetrics) {
      await appendRows(sheets, sheetId, 'Composición Corporal', [[
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
        const cfg = state.config;
        const trainDay = todayState.trainDay;
        if (cfg && cfg.training && trainDay > 0) {
          const routine = cfg.training[trainDay - 1];
          if (routine) trainType = routine.name;
        }
      }

      await appendRows(sheets, sheetId, 'Registro Diario', [[
        today, trained, atePlan, trainType, '',
      ]]);
      written.push('Registro Diario');
    }

    res.status(200).json({ ok: true, written });
  } catch (e) {
    console.error('[Cron snapshot]', e.message);
    res.status(500).json({ error: e.message });
  }
};
