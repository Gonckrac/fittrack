// ─── HYDRATION ────────────────────────────────────────────────────
function getWaterGoal() {
  const w = (state && state.config && state.config.weight) ? state.config.weight : 70;
  return Math.round(w * 35 / 100) * 100;
}
const WATER_GOAL = 3000; // legacy

function getWater() {
  return state[TODAY].water || 0;
}

function addWater(ml) {
  if (!state[TODAY].water) state[TODAY].water = 0;
  ml = Math.max(0, ml);
  state[TODAY].water = Math.min(getWaterGoal() + 500, state[TODAY].water + ml);
  saveState(state);
  renderWater(true);
  showToast('💧 +' + ml + 'ml');
}

function resetWater() {
  state[TODAY].water = 0;
  saveState(state);
  renderWater(false);
  if (typeof _syncRecuperacionWater === 'function') _syncRecuperacionWater();
}

function renderWater(animate) {
// Actualizar el objetivo mostrado en pantalla
var goalLabelEl = document.getElementById('waterGoalLabel');
if (goalLabelEl) goalLabelEl.textContent = '💧 OBJETIVO DIARIO: ' + getWaterGoal() + 'ML';
  const ml = getWater();
  const pct = Math.min(100, Math.round(ml / getWaterGoal() * 100));
  const glasses = Math.floor(ml / 250);
  const remaining = Math.max(0, getWaterGoal() - ml);

  // Update water page stats
  const pctW = document.getElementById('waterPctW');
  const mlW = document.getElementById('waterMlW');
  const mlNum = document.getElementById('waterMlNum');
  const glassesNum = document.getElementById('waterGlassesNum');
  const remainingNum = document.getElementById('waterRemainingNum');
  const goalBar = document.getElementById('waterGoalBar');
  const goalMsg = document.getElementById('waterGoalMsg');

  if (pctW) pctW.textContent = pct + '%';
  if (mlW) mlW.textContent = ml + 'ml';
  if (mlNum) mlNum.textContent = ml;
  if (glassesNum) glassesNum.textContent = glasses;
  if (remainingNum) remainingNum.textContent = remaining;
  if (goalBar) goalBar.style.width = pct + '%';
  if (goalMsg) {
    if (pct >= 100) goalMsg.textContent = '🏆 ¡Objetivo cumplido! Bien hidratado.';
    else if (pct >= 70) goalMsg.textContent = `💧 Vas bien — ${remaining}ml para el objetivo`;
    else goalMsg.textContent = `⚠ Tomá más agua — ${remaining}ml restantes`;
  }

  // Update home summary counter
  const dayWater = document.getElementById('dayWaterScore');
  const dayWaterStatus = document.getElementById('dayWaterStatus');
  if (dayWater) dayWater.textContent = pct + '%';
  if (dayWaterStatus) {
    dayWaterStatus.textContent = ml// replaced';
  }

  // Animate the SVG water fill (water page glass)
  const rect = document.getElementById('waterRectW');
  const wave = document.getElementById('wavePathW');
  if (!rect || !wave) return;

  const fillH = Math.round(pct / 100 * 132);
  const yPos = 136 - fillH;
  rect.setAttribute('y', yPos);
  rect.setAttribute('height', fillH);
  const wx = 8, ww = 64;
  wave.setAttribute('d', `M${wx},${yPos+6} Q${wx+16},${yPos-2} ${wx+32},${yPos+6} Q${wx+48},${yPos+14} ${wx+ww},${yPos+6} L${wx+ww},136 L${wx},136 Z`);

  if (pctW) {
    if (pct >= 100) pctW.style.color = 'var(--green)';
    else if (pct >= 60) pctW.style.color = 'var(--accent)';
    else pctW.style.color = 'var(--text)';
  }
}

// ─── GOAL BARS ────────────────────────────────────────────────────
function renderGoalBars() {
  const hist = state.metricsHistory || [];
  // hist[0] = most recent (unshift prepends), hist[last] = oldest
  const latest = hist.length > 0 ? hist[0] : null;
  const bf = latest?.bf ?? null;
  const musc = latest?.muscle ?? null;

  // BF goal: fixed start at 18% (user's actual starting point), target 12%
  const BF_START = 18;
  const BF_GOAL = 12;

  const bfBarEl = document.getElementById('goalBfBar');
  const bfCurrEl = document.getElementById('goalBfCurrent');
  const bfStatusEl = document.getElementById('goalBfStatus');

  if (bf !== null) {
    bfCurrEl.textContent = bf + '%';
    // Progress: how much of the journey from BF_START → BF_GOAL have we covered?
    const totalDelta = BF_START - BF_GOAL;
    const achieved = BF_START - bf;
    const pct = totalDelta > 0 ? Math.min(100, Math.max(0, Math.round(achieved / totalDelta * 100))) : 0;
    bfBarEl.style.width = pct + '%';
    const remaining = (bf - BF_GOAL).toFixed(1);
    if (bf <= BF_GOAL) {
      bfStatusEl.textContent = '🏆 ¡Objetivo alcanzado! Sos una máquina.';
      bfStatusEl.className = 'goal-status good';
    } else if (bf <= BF_GOAL + 2) {
      bfStatusEl.textContent = `⚡ A ${remaining}% del objetivo — casi lo tenés`;
      bfStatusEl.className = 'goal-status warn';
    } else {
      bfStatusEl.textContent = `📍 Te faltan ${remaining}% — ${pct}% del camino hecho`;
      bfStatusEl.className = 'goal-status far';
    }
  } else {
    bfCurrEl.textContent = '—';
    bfBarEl.style.width = '0%';
    bfStatusEl.textContent = 'Sin datos aún — registrá tu primera medición';
    bfStatusEl.className = 'goal-status far';
  }

  // Muscle goal: maintain or increase from first recorded value (oldest entry)
  const oldest = hist.length > 0 ? hist[hist.length - 1] : null;
  const MUSC_BASE = oldest?.muscle || 75;
  const muscBarEl = document.getElementById('goalMuscBar');
  const muscCurrEl = document.getElementById('goalMuscCurrent');
  const muscStatusEl = document.getElementById('goalMuscStatus');

  const muscLatest = latest?.muscle ?? null;
  if (muscLatest !== null) {
    const musc = muscLatest;
    muscCurrEl.textContent = musc + '%';
    // Progress bar: % relative to baseline, cap at 105%
    const pct = Math.min(100, Math.max(0, Math.round(musc / MUSC_BASE * 100)));
    muscBarEl.style.width = pct + '%';
    const diff = (musc - MUSC_BASE).toFixed(1);
    if (musc >= MUSC_BASE + 1) {
      muscStatusEl.textContent = `🔥 +${diff}% vs base — estás ganando músculo mientras bajás grasa`;
      muscStatusEl.className = 'goal-status good';
    } else if (musc >= MUSC_BASE - 0.5) {
      muscStatusEl.textContent = `✅ ${diff}% vs base — manteniendo bien la masa muscular`;
      muscStatusEl.className = 'goal-status good';
    } else {
      muscStatusEl.textContent = `⚠ ${diff}% vs base — revisá proteína e intensidad de entreno`;
      muscStatusEl.className = 'goal-status warn';
    }
  } else {
    muscCurrEl.textContent = '—';
    muscBarEl.style.width = '0%';
    muscStatusEl.textContent = 'Sin datos aún — registrá tu primera medición';
    muscStatusEl.className = 'goal-status far';
  }
}


