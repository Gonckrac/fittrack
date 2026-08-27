module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sheet, rows } = req.body || {};
  if (!sheet || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'missing sheet or rows' });
  }

  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  const secret        = process.env.SHEETS_SECRET;
  if (!appsScriptUrl || !secret) {
    return res.status(500).json({ error: 'APPS_SCRIPT_URL or SHEETS_SECRET not configured' });
  }

  try {
    const r = await fetch(appsScriptUrl, {
      method:   'POST',
      headers:  { 'Content-Type': 'application/json' },
      body:     JSON.stringify({ secret, sheet, rows }),
      redirect: 'follow',
    });
    const json = await r.json().catch(() => ({}));
    res.status(200).json(json);
  } catch (e) {
    console.error('[Sheets export]', e.message);
    res.status(500).json({ error: e.message });
  }
};
