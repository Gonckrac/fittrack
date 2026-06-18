// ─── OURA AUTO-SYNC ──────────────────────────────────────────────
const BACKEND = 'https://fittrack-backend-one.vercel.app/api/oura';

async function syncOura() {
  const syncBtn = document.getElementById('syncBtn');
  const syncStatus = document.getElementById('syncStatus');
  if (syncBtn) { syncBtn.textContent = '⟳ Sincronizando...'; syncBtn.disabled = true; }
  try {
    const res = await fetch(BACKEND);
    if (!res.ok) throw new Error('Error ' + res.status);
    const data = await res.json();
    if (!state[TODAY].sleep) state[TODAY].sleep = {};
    if (data.readiness?.score) state[TODAY].sleep.readiness = data.readiness.score;
    if (data.sleep?.total_hours) state[TODAY].sleep.hours = data.sleep.total_hours;
    if (data.sleep?.efficiency) state[TODAY].sleep.efficiency = data.sleep.efficiency;
    if (data.sleep?.deep_hours) state[TODAY].sleep.deep = data.sleep.deep_hours;
    if (data.sleep?.hrv_avg) state[TODAY].sleep.hrv = data.sleep.hrv_avg;
    if (data.sleep?.resting_hr) state[TODAY].sleep.restingHr = data.sleep.resting_hr;
    // Oura solo se usa para sueño — kcal y steps se ignoran
    state[TODAY].lastSync = new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'});
    saveState(state);
    renderSleep();
    renderKcal();
    renderHome();
    const st = document.getElementById('syncStatus');
    const ls = document.getElementById('lastSync');
    if (st) { st.textContent = '● Conectado'; st.style.color = 'var(--green)'; }
    if (ls) ls.textContent = 'Ultima sync: ' + state[TODAY].lastSync;
    showToast('Oura sincronizado ✓');
  } catch(err) {
    const st = document.getElementById('syncStatus');
    if (st) { st.textContent = '● Sin conexion'; st.style.color = 'var(--red)'; }
  } finally {
    if (syncBtn) { syncBtn.textContent = '↻ Sync Oura'; syncBtn.disabled = false; }
  }
}
