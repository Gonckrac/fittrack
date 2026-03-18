// ── DEBUG ─────────────────────────────────────────────────────────
function dbLog(msg) {
  console.log(msg);
  const el = document.getElementById('dbLog');
  if (el) {
    el.textContent += new Date().toLocaleTimeString() + ' ' + msg + '\n';
    el.scrollTop = el.scrollHeight;
  }
}

async function dbCheckAll() {
  const el = document.getElementById('dbLog');
  if (el) el.textContent = '';
  dbLog('--- CHECK ---');
  dbLog('Notification: ' + (typeof Notification !== 'undefined' ? Notification.permission : 'NO'));
  dbLog('ServiceWorker: ' + ('serviceWorker' in navigator ? 'SI' : 'NO'));
  dbLog('PushManager: ' + ('PushManager' in window ? 'SI' : 'NO'));
  dbLog('_swReg: ' + (_swReg ? 'OK scope=' + _swReg.scope : 'NULL'));
  dbLog('_swReg.active: ' + (_swReg?.active ? 'OK url=' + _swReg.active.scriptURL?.split('/').pop() : 'NULL'));
  dbLog('_pushDeviceId: ' + (_pushDeviceId || 'NULL'));
  dbLog('_pushSubscription: ' + (_pushSubscription ? 'OK' : 'NULL'));
  dbLog('_audioUnlocked: ' + _audioUnlocked);

  // Listar todos los SW registrados
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    dbLog('SW registrados: ' + regs.length);
    regs.forEach((r, i) => dbLog('  SW' + i + ': ' + r.active?.scriptURL?.slice(-30)));
  }

  // Test backend
  try {
    const r = await fetch('https://fittrack-backend-mu.vercel.app/api/push?action=vapid-public-key');
    const d = await r.json();
    dbLog('Backend: OK key=' + (d.key ? d.key.slice(0,10)+'...' : 'NO KEY'));
  } catch(e) {
    dbLog('Backend ERROR: ' + e.message);
  }
}

async function dbTestNotif() {
  dbLog('Programando notif en 5s...');
  if (!_pushDeviceId) {
    dbLog('ERROR: no hay _pushDeviceId, intentando setup...');
    await _setupWebPush();
    dbLog('Después setup: deviceId=' + (_pushDeviceId || 'NULL'));
  }
  if (_pushDeviceId) {
    try {
      const r = await fetch('https://fittrack-backend-mu.vercel.app/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule', deviceId: _pushDeviceId, title: '⏱ Test', body: 'Si ves esto funciona!', delayMs: 5000 })
      });
      const d = await r.json();
      dbLog('Schedule resp: ' + JSON.stringify(d));
      dbLog('Bloqueá la pantalla ahora!');
    } catch(e) {
      dbLog('ERROR schedule: ' + e.message);
    }
  } else {
    dbLog('ERROR: sigue sin deviceId');
  }
}
