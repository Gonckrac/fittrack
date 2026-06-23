// ─── WEARABLES OAUTH ─────────────────────────────────────────────
var WEARABLE_CONFIG = {
  oura: {
    name: 'Oura Ring',
    emoji: '💍',
    clientId: '466a8c8a-ab40-4985-8158-c32965717e89',
    authUrl: 'https://cloud.ouraring.com/oauth/authorize',
    tokenUrl: 'https://api.ouraring.com/oauth/token',
    scope: 'personal daily heartrate workout tag session spo2',
    color: 'var(--accent)',
  },
  garmin: {
    name: 'Garmin',
    emoji: '🏃',
    clientId: 'TU_GARMIN_CLIENT_ID',
    authUrl: 'https://connect.garmin.com/oauthConfirm',
    tokenUrl: 'https://connectapi.garmin.com/oauth-service/oauth/token',
    scope: '',
    color: '#00A4E4',
  },
  fitbit: {
    name: 'Fitbit',
    emoji: '🟦',
    clientId: '23V82Y',
    authUrl: 'https://www.fitbit.com/oauth2/authorize',
    tokenUrl: 'https://api.fitbit.com/oauth2/token',
    scope: 'activity heartrate sleep profile',
    color: '#00B0B9',
  },
};

function getWearableToken(provider) {
  return state.wearables && state.wearables[provider] && state.wearables[provider].accessToken;
}

function isWearableConnected(provider) {
  return !!getWearableToken(provider);
}

// Refresca el access_token usando el refresh_token guardado — evita tener que reconectar manualmente.
async function _refreshWearableToken(provider) {
  var w = state.wearables && state.wearables[provider];
  if (!w || !w.refreshToken) return false;
  try {
    var res = await fetch('https://fittrack-backend-one.vercel.app/api/wearable-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: provider, refreshToken: w.refreshToken })
    });
    var data = await res.json();
    if (!data.access_token) return false;
    state.wearables[provider] = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || w.refreshToken,
      expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : null,
      connectedAt: w.connectedAt,
    };
    saveState(state);
    return true;
  } catch(e) {
    return false;
  }
}

// Devuelve un access_token válido, refrescándolo primero si está vencido o por vencer.
async function ensureWearableToken(provider) {
  var w = state.wearables && state.wearables[provider];
  if (!w) return null;
  var nearExpiry = w.expiresAt && (w.expiresAt - Date.now() < 5 * 60 * 1000);
  if (nearExpiry) {
    var refreshed = await _refreshWearableToken(provider);
    if (!refreshed) return null;
  }
  return getWearableToken(provider);
}

function connectWearable(provider) {
  var cfg = WEARABLE_CONFIG[provider];
  if (!cfg) return;
  var REDIRECT = 'https://fittrack-backend-one.vercel.app/api/oauth-callback';
  var redirectUri = encodeURIComponent(REDIRECT);
  var url = cfg.authUrl +
    '?response_type=code' +
    '&client_id=' + cfg.clientId +
    '&redirect_uri=' + redirectUri +
    '&scope=' + encodeURIComponent(cfg.scope) +
    '&state=' + provider;

  // Guardar provider pendiente para el callback
  localStorage.setItem('fittrack_oauth_pending', provider);

  // Usar Capacitor Browser — soporta deep links en iOS
  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
    var Browser = window.Capacitor.Plugins.Browser;
    Browser.open({ url: url, presentationStyle: 'fullscreen' });
  } else {
    window.open(url, '_system');
  }
}

// Llamada desde oauth-callback cuando vuelve el código
function handleOAuthCallback(code, provider) {
  localStorage.removeItem('fittrack_oauth_pending');
  if (code && provider) {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
      window.Capacitor.Plugins.Browser.close();
    }
    showToast('🔗 Conectando ' + (WEARABLE_CONFIG[provider] ? WEARABLE_CONFIG[provider].name : provider) + '...');
    _exchangeWearableCode(provider, code);
  }
}

function disconnectWearable(provider) {
  if (!state.wearables) return;
  var cfg = WEARABLE_CONFIG[provider];

  // Cerrar sheet de detalle si está abierto
  var detailSheet = document.getElementById('wearableDetailSheet');
  if (detailSheet) detailSheet.remove();

  // Sheet de confirmación
  var existing = document.getElementById('disconnectConfirmSheet');
  if (existing) existing.remove();
  var sheet = document.createElement('div');
  sheet.id = 'disconnectConfirmSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:24px 20px 32px;width:100%;max-width:480px;margin:0 auto">' +
      '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 20px"></div>' +
      '<div style="font-size:32px;text-align:center;margin-bottom:12px">' + cfg.emoji + '</div>' +
      '<div style="font-size:16px;font-weight:700;color:var(--text);text-align:center;margin-bottom:8px">¿Desconectar ' + cfg.name + '?</div>' +
      '<div style="font-size:13px;color:var(--text2);text-align:center;line-height:1.6;margin-bottom:24px">' +
        'Se van a borrar los datos de sueño y pasos sincronizados. Vas a tener que volver a conectarlo para sincronizar.' +
      '</div>' +
      '<div style="display:flex;gap:8px">' +
        '<button onclick="document.getElementById(\'disconnectConfirmSheet\').remove()" class="btn btn-ghost" style="flex:1">Cancelar</button>' +
        '<button onclick="_confirmDisconnect(\'' + provider + '\')" class="btn" style="flex:1;background:var(--red);color:#fff;border:none;border-radius:12px;padding:12px;font-size:14px;font-weight:600;cursor:pointer">Desconectar</button>' +
      '</div>' +
    '</div>';
  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

function _confirmDisconnect(provider) {
  document.getElementById('disconnectConfirmSheet')?.remove();
  if (!state.wearables) return;

  // Borrar datos del wearable del día actual
  if (state[TODAY]) {
    if (state[TODAY].sleep) {
      delete state[TODAY].sleep.readiness;
      delete state[TODAY].sleep.hours;
      delete state[TODAY].sleep.efficiency;
      delete state[TODAY].sleep.deep;
      delete state[TODAY].sleep.hrv;
      delete state[TODAY].sleep.rhr;
    }
    delete state[TODAY].steps;
    delete state[TODAY].lastSync;
  }

  delete state.wearables[provider];
  saveState(state);
renderWearablesCard();
if (typeof renderSleep === 'function') renderSleep();
if (typeof renderHome  === 'function') renderHome();
if (typeof _syncRecuperacionSleep === 'function') _syncRecuperacionSleep();
showToast(WEARABLE_CONFIG[provider].name + ' desconectado');
}

async function _exchangeWearableCode(provider, code) {
  try {
    var res = await fetch('https://fittrack-backend-one.vercel.app/api/wearable-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: provider, code: code, redirectUri: 'https://fittrack-backend-one.vercel.app/api/oauth-callback' })
    });
    var data = await res.json();
    if (!data.access_token) throw new Error('Sin token');
    if (!state.wearables) state.wearables = {};
    state.wearables[provider] = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || null,
      expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : null,
      connectedAt: Date.now(),
    };
    saveState(state);
renderWearablesCard();
if (typeof renderHome === 'function') renderHome();
if (typeof _syncRecuperacionSleep === 'function') _syncRecuperacionSleep();
showToast('✓ ' + WEARABLE_CONFIG[provider].name + ' conectado');

if (provider === 'oura')   syncOura();
if (provider === 'fitbit') syncFitbit();
  } catch(e) {
    showToast('⚠ Error al conectar. Intentá de nuevo.');
  }
}

function renderWearablesCard() {
  var containers = document.querySelectorAll('.wearables-card-container');
  containers.forEach(function(el) { el.innerHTML = _buildWearablesCardHTML(); });
}

function _buildWearablesCardHTML() {
  var providers = ['oura', 'garmin', 'fitbit'];
  var appleNote = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;opacity:0.5"><span style="font-size:22px">🍎</span><div><div style="font-size:12px;font-weight:600;color:var(--text)">Apple Health</div><div style="font-size:10px;color:var(--text3);margin-top:2px">Solo App Store</div></div></div>';
  var cards = providers.map(function(p) {
    var cfg = WEARABLE_CONFIG[p];
    var connected = isWearableConnected(p);
    return '<div style="background:var(--bg2);border:1.5px solid ' + (connected ? cfg.color : 'var(--border)') + ';border-radius:10px;padding:12px;display:flex;align-items:center;gap:10px;cursor:pointer" onclick="' + (connected ? 'openWearableDetail(\'' + p + '\')' : 'connectWearable(\'' + p + '\')') + '">' +
      '<span style="font-size:22px">' + cfg.emoji + '</span>' +
      '<div style="flex:1"><div style="font-size:12px;font-weight:600;color:var(--text)">' + cfg.name + '</div>' +
      '<div style="font-size:10px;margin-top:2px;color:' + (connected ? cfg.color : 'var(--text3)') + '">' + (connected ? 'Conectado ✓' : (p === 'garmin' ? 'Próximamente' : 'Toca para conectar')) + '</div></div>' +
      (connected ? '<button onclick="event.stopPropagation();disconnectWearable(\'' + p + '\')" style="background:none;border:none;color:var(--text3);font-size:11px;cursor:pointer;padding:4px">✕</button>' : '') +
    '</div>';
  }).join('');
  return '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + cards + appleNote + '</div>';
}

function openWearableDetail(provider) {
  var cfg = WEARABLE_CONFIG[provider];
  var data = state.wearables && state.wearables[provider];
  var connectedDate = data && data.connectedAt ? new Date(data.connectedAt).toLocaleDateString('es-AR') : '—';
  var existing = document.getElementById('wearableDetailSheet');
  if (existing) existing.remove();
  var sheet = document.createElement('div');
  sheet.id = 'wearableDetailSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:480px;margin:0 auto">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">' +
        '<span style="font-size:32px">' + cfg.emoji + '</span>' +
        '<div><div style="font-size:15px;font-weight:700;color:var(--text)">' + cfg.name + '</div>' +
        '<div style="font-size:11px;color:var(--text3)">Conectado el ' + connectedDate + '</div></div>' +
      '</div>' +
      '<div style="background:var(--bg3);border-radius:12px;padding:12px;margin-bottom:16px;font-size:12px;color:var(--text2)">Los datos de sueño, frecuencia cardíaca y actividad se sincronizan automáticamente cada vez que abrís la app.</div>' +
      '<div style="display:flex;gap:8px">' +
'<button class="btn btn-primary" style="flex:1" onclick="' + (provider === 'oura' ? 'syncOura()' : provider === 'fitbit' ? 'syncFitbit()' : 'showToast(\'Sync disponible próximamente\')') + ';document.getElementById(\'wearableDetailSheet\').remove()">↻ Sincronizar ahora</button>' +        '<button class="btn btn-ghost" style="flex:0 0 auto;color:var(--red)" onclick="disconnectWearable(\'' + provider + '\');document.getElementById(\'wearableDetailSheet\').remove()">Desconectar</button>' +
      '</div>' +
    '</div>';
  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

async function syncOura() {
  if (!isWearableConnected('oura')) { showToast('⚠ Oura no conectado'); return; }
  var token = await ensureWearableToken('oura');
  if (!token) { showToast('⚠ Oura: la sesión venció, reconectá de nuevo'); return; }
  showToast('↻ Sincronizando Oura…');
  try {
    var res = await fetch('https://fittrack-backend-one.vercel.app/api/oura', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: token })
    });
    var data = await res.json();
    if (data.error) throw new Error(data.error);
    if (!state[TODAY]) state[TODAY] = {};
    if (!state[TODAY].sleep) state[TODAY].sleep = {};
    var sl = state[TODAY].sleep;
    sl.readiness  = data.readiness?.score       || sl.readiness;
    sl.hours      = data.sleep?.total_hours      || sl.hours;
    sl.efficiency = data.sleep?.efficiency       || sl.efficiency;
    sl.deep       = data.sleep?.deep_hours       || sl.deep;
    sl.hrv        = data.sleep?.hrv_avg          || sl.hrv;
    sl.rhr        = data.sleep?.resting_hr       || sl.rhr;
    // Guardar pasos de Oura si vienen
    if (data.activity?.steps) state[TODAY].steps = data.activity.steps;
    state[TODAY].lastSync = new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'});
    saveState(state);
if (typeof renderSleep === 'function') renderSleep();
    if (typeof renderKcal  === 'function') renderKcal();
    if (typeof renderHome  === 'function') renderHome();  // ← agregar
    var st = document.getElementById('syncStatus');
    var ls = document.getElementById('lastSync');
    if (st) { st.textContent = '● Conectado'; st.style.color = 'var(--green)'; }
    if (ls) ls.textContent = 'Última sync: ' + state[TODAY].lastSync;
    showToast('✓ Oura sincronizado');
  } catch(e) {
    var stErr = document.getElementById('syncStatus');
    if (stErr) { stErr.textContent = '● Error de sincronización'; stErr.style.color = 'var(--red)'; }
    showToast('⚠ Error al sincronizar: ' + e.message);
  }
}
async function syncFitbit() {
  if (!isWearableConnected('fitbit')) { showToast('⚠ Fitbit no conectado'); return; }
  var token = await ensureWearableToken('fitbit');
  if (!token) { showToast('⚠ Fitbit: la sesión venció, reconectá de nuevo'); return; }
  showToast('↻ Sincronizando Fitbit…');
  try {
    var res = await fetch('https://fittrack-backend-one.vercel.app/api/fitbit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: token })
    });
    var data = await res.json();
    if (data.error) throw new Error(data.error);
    if (!state[TODAY]) state[TODAY] = {};
    if (!state[TODAY].sleep) state[TODAY].sleep = {};
    var sl = state[TODAY].sleep;
    sl.hours      = data.sleep?.total_hours      || sl.hours;
    sl.efficiency = data.sleep?.efficiency       || sl.efficiency;
    sl.deep       = data.sleep?.deep_hours       || sl.deep;
    sl.hrv        = data.sleep?.hrv_avg          || sl.hrv;
    sl.rhr        = data.sleep?.resting_hr       || sl.rhr;
    if (data.activity?.steps) state[TODAY].steps = data.activity.steps;
    saveState(state);
    if (typeof renderSleep === 'function') renderSleep();
    if (typeof renderHome  === 'function') renderHome();
    if (typeof _syncRecuperacionSleep === 'function') _syncRecuperacionSleep();
    showToast('✓ Fitbit sincronizado');
  } catch(e) {
    showToast('⚠ Error al sincronizar: ' + e.message);
  }
}
window.syncFitbit = syncFitbit;
window.connectWearable     = connectWearable;
window.disconnectWearable  = disconnectWearable;
window.openWearableDetail  = openWearableDetail;
window.renderWearablesCard = renderWearablesCard;
window.syncOura            = syncOura;