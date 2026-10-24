// ─── BANDEJA DEL RELOJ ───────────────────────────────────────────
// Al abrir la app (y al volver a primer plano) trae los eventos que mandó el
// reloj en las últimas 3 semanas y aplica los que todavía no estén en el state.
// Es idempotente: lo ya aplicado se saltea (ver watch-apply.js).

async function applyWatchInbox() {
  if (typeof CLOUD_ENABLED === 'undefined' || !CLOUD_ENABLED || !_sb || !_syncKey) return 0;
  if (typeof applyWatchEvents !== 'function') return 0;
  try {
    var since = new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString();
    var r = await _sb
      .from('fittrack_inbox')
      .select('payload')
      .eq('sync_key', _syncKey)
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .limit(1000);
    if (r.error || !r.data) return 0;
    var events = r.data.map(function (row) { return row.payload; });
    var n = applyWatchEvents(state, events);
    if (n > 0) {
      saveState(state);
      console.log('[FitTrack] Reloj: ' + n + ' evento(s) aplicados');
    }
    return n;
  } catch (e) {
    console.warn('[FitTrack] Bandeja del reloj:', e && e.message);
    return 0;
  }
}

// Al volver a la app, aplicar lo nuevo y refrescar la pantalla
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState !== 'visible') return;
  applyWatchInbox().then(function (n) {
    if (n > 0 && typeof renderHome === 'function') {
      try { renderHome(); } catch (_) {}
    }
  });
});
