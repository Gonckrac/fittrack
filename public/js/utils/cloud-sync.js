// ─── CLOUD SYNC (Supabase) ────────────────────────────────────────
var _sb = null;
var _syncKey = null;
var _pushDebounce = null;
var CLOUD_ENABLED = false;

(function _initCloud() {
  try {
    if (typeof window.supabase === 'undefined') return;
    _sb = window.supabase.createClient(
      'https://ovgavnoifmlbgjfcdphj.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92Z2F2bm9pZm1sYmdqZmNkcGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NzM5MjAsImV4cCI6MjEwMzM0OTkyMH0.Ss606FL1Resb6hWxkfsKPyqqMdbqivLG5tKmhpwVM4Q'
    );
    _syncKey = localStorage.getItem('fittrack_syncKey');
    if (!_syncKey) {
      _syncKey = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'fk-' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
      localStorage.setItem('fittrack_syncKey', _syncKey);
    }
    CLOUD_ENABLED = true;
  } catch(e) {}
})();

function pushToCloud(s) {
  if (!CLOUD_ENABLED || !_sb || !_syncKey) return;
  clearTimeout(_pushDebounce);
  _pushDebounce = setTimeout(function() {
    _sb.from('fittrack_state')
      .upsert({ id: _syncKey, data: s, updated_at: new Date().toISOString() })
      .then(function(r) {
        if (r.error) console.warn('[FitTrack] Cloud push:', r.error.message);
      });
  }, 3000);
}

async function pullFromCloud() {
  if (!CLOUD_ENABLED || !_sb || !_syncKey) return null;
  try {
    var r = await _sb.from('fittrack_state').select('data').eq('id', _syncKey).single();
    if (r.error || !r.data) return null;
    return r.data.data;
  } catch(e) { return null; }
}

function getSyncKey() {
  return localStorage.getItem('fittrack_syncKey') || '—';
}

function applySyncKey(newKey) {
  newKey = (newKey || '').trim();
  if (!newKey) return;
  _syncKey = newKey;
  localStorage.setItem('fittrack_syncKey', newKey);
  CLOUD_ENABLED = true;
  pullFromCloud().then(function(cloudState) {
    if (!cloudState) { showToast('⚠ No se encontraron datos para ese código'); return; }
    if (!state._ts || (cloudState._ts && cloudState._ts > state._ts)) {
      Object.assign(state, cloudState);
      saveState(state);
      showToast('✅ Datos sincronizados — reiniciando...');
      setTimeout(function() { location.reload(); }, 1500);
    } else {
      showToast('⚠ Los datos locales ya son más nuevos');
    }
  });
}

function openSyncKeySheet() {
  var existing = document.getElementById('syncKeySheet');
  if (existing) existing.remove();
  var key = getSyncKey();
  var esc = typeof _escapeHtml === 'function' ? _escapeHtml : function(s) { return String(s); };
  var sheet = document.createElement('div');
  sheet.id = 'syncKeySheet';
  sheet.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.6);display:flex;align-items:flex-end';
  sheet.innerHTML = [
    '<div onclick="event.stopPropagation()" style="background:var(--bg2);border-radius:24px 24px 0 0;padding:28px 20px 40px;width:100%;max-width:500px;margin:0 auto">',
      '<div style="width:40px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 20px"></div>',
      '<div style="font-size:16px;font-weight:800;color:var(--text);margin-bottom:4px">☁ Sincronización en la nube</div>',
      '<div style="font-size:12px;color:var(--text3);margin-bottom:20px">Tu código único identifica tus datos. Copialo en otro dispositivo para sincronizar.</div>',
      '<div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Tu código</div>',
      '<div style="display:flex;gap:8px;margin-bottom:20px">',
        '<div style="flex:1;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;font-size:10px;color:var(--text);word-break:break-all;font-family:monospace">',
          esc(key),
        '</div>',
        '<button onclick="navigator.clipboard.writeText(getSyncKey()).then(function(){showToast(\'Código copiado ✓\')})" style="flex-shrink:0;padding:10px 14px;background:var(--accent);color:#fff;border:none;border-radius:10px;font-size:13px;cursor:pointer;font-weight:700">Copiar</button>',
      '</div>',
      '<div style="border-top:1px solid var(--border);padding-top:20px;margin-bottom:4px">',
        '<div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Usar código de otro dispositivo</div>',
        '<div style="display:flex;gap:8px">',
          '<input id="syncKeyInput" class="inp" placeholder="Pegá tu código acá" style="flex:1;font-size:12px;font-family:monospace">',
          '<button onclick="_applySyncKeyFromInput()" style="flex-shrink:0;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:10px;font-size:13px;cursor:pointer;font-weight:700">Aplicar</button>',
        '</div>',
        '<div style="font-size:11px;color:var(--red);margin-top:6px">⚠ Esto reemplazará tus datos locales con los de la nube.</div>',
      '</div>',
      '<button onclick="document.getElementById(\'syncKeySheet\').remove()" style="width:100%;margin-top:16px;padding:12px;border-radius:12px;border:none;background:var(--bg3);color:var(--text2);font-size:14px;font-weight:600;cursor:pointer">Cerrar</button>',
    '</div>'
  ].join('');
  sheet.onclick = function(e) { if (e.target === sheet) sheet.remove(); };
  document.body.appendChild(sheet);
}

function _applySyncKeyFromInput() {
  var k = (document.getElementById('syncKeyInput') || {}).value;
  if (!k || !k.trim()) { showToast('⚠ Ingresá un código'); return; }
  document.getElementById('syncKeySheet').remove();
  applySyncKey(k);
}
