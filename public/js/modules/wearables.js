// ─── WEARABLES OAUTH ─────────────────────────────────────────────
var WEARABLE_CONFIG = {
  oura: {
    name: 'Oura Ring',
    emoji: '💍',
    clientId: 'TU_OURA_CLIENT_ID',
    authUrl: 'https://cloud.ouraring.com/oauth/authorize',
    tokenUrl: 'https://api.ouraring.com/oauth/token',
    scope: 'personal daily heartrate workout tag session spo2 ring_configuration',
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
    clientId: 'TU_FITBIT_CLIENT_ID',
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

function connectWearable(provider) {
  var cfg = WEARABLE_CONFIG[provider];
  if (!cfg) return;
  var redirectUri = encodeURIComponent(window.location.origin + '/oauth-callback.html');
  var url = cfg.authUrl +
    '?response_type=code' +
    '&client_id=' + cfg.clientId +
    '&redirect_uri=' + redirectUri +
    '&scope=' + encodeURIComponent(cfg.scope) +
    '&state=' + provider;
  var popup = window.open(url, 'wearable_oauth', 'width=500,height=700,left=100,top=100');
  var timer = setInterval(function() {
    try {
      if (popup && popup.location && popup.location.href.indexOf('oauth-callback') >= 0) {
        clearInterval(timer);
        var params = new URL(popup.location.href).searchParams;
        var code = params.get('code');
        popup.close();
        if (code) _exchangeWearableCode(provider, code);
      }
    } catch(e) {}
    if (!popup || popup.closed) clearInterval(timer);
  }, 500);
}

function disconnectWearable(provider) {
  if (!state.wearables) return;
  delete state.wearables[provider];
  saveState(state);
  renderWearablesCard();
  showToast(WEARABLE_CONFIG[provider].name + ' desconectado');
}

async function _exchangeWearableCode(provider, code) {
  try {
    var res = await fetch('https://fittrack-backend-one.vercel.app/api/wearable-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: provider, code: code, redirectUri: window.location.origin + '/oauth-callback.html' })
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
    showToast('✓ ' + WEARABLE_CONFIG[provider].name + ' conectado');
    if (provider === 'oura') syncOura();
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
      '<div style="font-size:10px;margin-top:2px;color:' + (connected ? cfg.color : 'var(--text3)') + '">' + (connected ? 'Conectado ✓' : 'Toca para conectar') + '</div></div>' +
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
        '<button class="btn btn-primary" style="flex:1" onclick="' + (provider === 'oura' ? 'syncOura()' : 'showToast(\'Sync disponible próximamente\')') + ';document.getElementById(\'wearableDetailSheet\').remove()">↻ Sincronizar ahora</button>' +
        '<button class="btn btn-ghost" style="flex:0 0 auto;color:var(--red)" onclick="disconnectWearable(\'' + provider + '\');document.getElementById(\'wearableDetailSheet\').remove()">Desconectar</button>' +
      '</div>' +
    '</div>';
  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);
}

window.connectWearable    = connectWearable;
window.disconnectWearable = disconnectWearable;
window.openWearableDetail = openWearableDetail;
window.renderWearablesCard = renderWearablesCard;