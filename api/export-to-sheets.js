const { google } = require('googleapis');

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sheet, rows } = req.body || {};
  if (!sheet || !Array.isArray(rows) || rows.length === 0) {
    return res.status(400).json({ error: 'missing sheet or rows' });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return res.status(500).json({ error: 'GOOGLE_SHEET_ID not set' });

  try {
    const sheets = google.sheets({ version: 'v4', auth: getAuth() });
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${sheet}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: rows },
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[Sheets export]', e.message);
    res.status(500).json({ error: e.message });
  }
};
