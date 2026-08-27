// ─── GOOGLE SHEETS SYNC (client → /api/export-to-sheets) ─────────
// Fire-and-forget: never throws, never blocks the main flow.
function _exportRowToSheets(sheetName, row) {
  try {
    fetch('/api/export-to-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sheet: sheetName, rows: [row] }),
    }).catch(function() {});
  } catch(e) {}
}
