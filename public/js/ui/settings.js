function applyTextScale(size) {
  var zoom = size === 'muy-grande' ? 1.4 : size === 'grande' ? 1.2 : 1.0;
  var app = document.getElementById('mainApp');
  if (app) app.style.zoom = zoom;
  localStorage.setItem('fittrack_textscale', size);
  document.querySelectorAll('.text-size-btn').forEach(function(b) {
    var active = b.dataset.size === size;
    b.style.borderColor = active ? 'var(--accent)' : 'var(--border)';
    b.style.color = active ? 'var(--accent)' : 'var(--text2)';
  });
  showToast('Tamaño de texto actualizado ✓');
}


// ─── NOTIFICATIONS ───────────────────────────────────────────────
// ─── NOTIFICATION COPY ───────────────────────────────────────────
var _NF_COPY = {
  meals: [
    '🍽 Hora de comer, {name}! Registrá lo que comés y seguí tu objetivo.',
    '🥗 {name}, ¿ya anotaste tu comida? Cada registro cuenta.',
    '🍱 ¡Momento de comer, {name}! Tu cuerpo te lo agradece.',
    '🔥 {name}, mantené el plan — registrá tu comida ahora.',
    '🍴 {name}, no te olvides de cargar tu comida en FitTrack.',
    '🫙 {name}, cada comida registrada es un paso más cerca de tu meta.',
    '🥙 ¡{name}, tu cuerpo pide combustible! ¿Ya cargaste tu comida?',
    '🍀 {name}, registrar lo que comés es el 50% del trabajo. ¡Vamos!',
    '📊 {name}, sin registro no hay progreso — cargá tu comida ahora.',
    '🌮 ¡{name}, momento de comer y anotar! Tu yo del futuro te lo agradece.',
    '🥦 {name}, ¿comiste algo rico y nutritivo? ¡Contáselo a FitTrack!',
    '🍳 {name}, las comidas sin registrar no cuentan para tu objetivo. ¡Dale!',
    '🧠 {name}, tu cerebro necesita energía — y FitTrack necesita el registro.',
    '⏰ {name}, si no lo registrás, es como si no hubieras comido. ¡Anotá!'
  ],
  training: [
    '💪 ¡Hoy toca entrenar, {name}! Abrí FitTrack y dale con todo.',
    '🏋️ {name}, tu sesión de hoy te está esperando. ¡Vamos!',
    '⚡ {name}, los resultados se construyen hoy. ¡A entrenar!',
    '🎯 {name}, día de entrenamiento. Cada rep te acerca a tu objetivo.',
    '🚀 ¡Arrancá fuerte, {name}! Tu rutina de hoy está lista.',
    '🔥 {name}, el hierro no se va a levantar solo. ¡A moverlo!',
    '🦾 {name}, en unos minutos vas a agradecer haber ido. ¡Arrancá!',
    '🏆 {name}, los campeones no esperan motivación — actúan igual.',
    '😤 {name}, la versión más fuerte de vos te está esperando en el gym.',
    '⏳ {name}, en 1 hora esto ya fue. Empezá ahora.',
    '🧬 {name}, cada sesión reprograma tu cuerpo. ¡No rompas la racha!',
    '📈 {name}, consistencia > intensidad. Hoy sumás un día más.',
    '🎽 {name}, el outfit ya está listo, el plan también. Solo faltás vos.',
    '💥 {name}, ¿sentiste ese pique? Es la señal de que es hora de entrenar.',
    '🛑 {name}, no lo pienses más — ponete los auriculares y entrá al gym.'
  ],
  water: [
    '💧 {name}, ¿tomaste agua? La hidratación es clave para tu rendimiento.',
    '🌊 Momento de hidratarte, {name}. Tu cuerpo lo necesita.',
    '💦 {name}, recordatorio de agua — seguí sumando vasos hoy.',
    '🥤 {name}, hidratate ahora. Un cuerpo hidratado rinde más.',
    '💧 {name}, ¿cuánta agua llevás hoy? Registralo en FitTrack.',
    '🧊 {name}, el agua fría no se toma sola. ¡Dale un sorbo!',
    '🫧 {name}, tu rendimiento cae un 10% con solo 2% de deshidratación. ¡Tomá agua!',
    '🌿 {name}, el agua es el suplemento más barato y efectivo. ¡Aprovechalo!',
    '⚗️ {name}, músculos hidratados = músculos que crecen. ¡A hidratar!',
    '🐟 {name}, hasta los peces toman agua. ¡Vos también!',
    '🏊 {name}, no hace falta meterte a la pileta, alcanza con tomar agua.',
    '🌡️ {name}, si esperás tener sed ya estás deshidratado. Tomá agua ahora.',
    '💎 {name}, la piel, los músculos y el cerebro te piden agua. ¡No los decepciones!'
  ],
  supps_morning: [
    '☀️ Buenos días, {name}! Hora de tus suplementos de la mañana.',
    '🌅 {name}, empezá el día completo — tomá tus suplementos.',
    '💊 {name}, suplementos de la mañana. ¡Que tengas un gran día!',
    '🌄 {name}, primer check del día: suplementos. ¡Ya podés tacharlo!',
    '🍊 {name}, los suplementos de la mañana son tu armadura para el día.',
    '⚡ {name}, cargá las pilas desde temprano — empezá con tus suplementos.',
    '🧬 {name}, consistencia matutina = resultados reales. ¡Tomá tus supls!',
    '🏁 {name}, el día arranca bien cuando arranca con suplementos. ¡Vamos!'
  ],
  supps_noon: [
    '🌞 {name}, no te olvides de tus suplementos del mediodía.',
    '💊 Mediodía, {name}! Momento de tus suplementos.',
    '⏰ {name}, pausá un momento — tus suplementos del mediodía te esperan.',
    '🕛 {name}, mitad del día, mitad de los suplementos. ¡No te los saltes!',
    '🍱 {name}, mientras almorzás, no olvides tus supls del mediodía.',
    '🔔 {name}, alarma de suplementos: ¡es ahora o nunca!',
    '💡 {name}, los mejores resultados vienen de la consistencia. ¡Tomá tus supls!'
  ],
  supps_night: [
    '🌙 {name}, antes de dormir: ¿suplementos nocturnos listos?',
    '✨ {name}, cerrá el día completo con tus suplementos de la noche.',
    '💊 Noche, {name}! Últimos suplementos del día — ¡lo hiciste genial!',
    '🌃 {name}, mientras dormís tu cuerpo se recupera. Ayudalo con los supls.',
    '😴 {name}, los suplementos nocturnos trabajan mientras soñás. ¡Tomálos!',
    '🌟 {name}, último check del día: suplementos de la noche. ¡Ya casi terminás!',
    '🛌 {name}, antes de meterte en la cama — ¿ya tomaste tus supls nocturnos?',
    '🦉 {name}, la noche es de recuperación. Los suplementos la potencian. ¡Vamos!'
  ]
};

function _nfText(key) {
  var name = (state.config && state.config.name) ? state.config.name.split(' ')[0] : 'campeón';
  var arr  = _NF_COPY[key] || ['FitTrack'];
  var msg  = arr[Math.floor(Math.random() * arr.length)];
  return msg.replace(/{name}/g, name);
}

function _initNotifications() {
  // iOS Safari PWA: no soporta la Web Notifications API de forma estándar
  // Android Chrome/Edge sí. Fallback gracioso en ambos casos.
  if (!('serviceWorker' in navigator)) return;
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  _scheduleNotifications();
}

function _fireNotification(title, body) {
  var opts = { body: body, icon: '/icons/icon-192.png', badge: '/icons/icon-96.png', vibrate: [100,50,100] };
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(function(sw) {
      sw.showNotification(title, opts);
    }).catch(function() {
      if ('Notification' in window && Notification.permission === 'granted') new Notification(title, opts);
    });
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, opts);
  }
}

function _scheduleNotifications() {
  // Smart training notification (corre cada minuto)
  if (typeof shouldSendTrainingNotification === 'function' && shouldSendTrainingNotification()) {
    sendTrainingNotification();
  }  var n = state.notifications;
  if (!n) return;
  var now = new Date();
  var hh  = now.getHours();
  var mm  = now.getMinutes();
  if (mm !== 0) return;
  var day = now.getDay();
var nowStr = (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;

  // MEALS — por comida individual con horario propio
  if (n.meals && n.meals.enabled) {
    var _mealKeys = { breakfast:'meals', lunch:'meals', snack:'meals', dinner:'meals' };
    ['breakfast','lunch','snack','dinner'].forEach(function(k) {
      var obj = n.meals[k];
      if (!obj || !obj.enabled) return;
      var t = obj.time || '';
      var p = t.split(':');
      if (parseInt(p[0]) === hh && parseInt(p[1]||0) === mm) {
        _fireNotification('🍽 FitTrack', _nfText('meals'));
      }
    });
  }

  // TRAINING — solo modo manual (smart lo maneja shouldSendTrainingNotification)
  if (n.training && n.training.enabled && n.training.mode === 'manual' && Array.isArray(n.training.days)) {
    var trainHour = n.training.hour || 18;
    if (n.training.days.indexOf(day) !== -1 && hh === trainHour && mm === 0) {
      _fireNotification('💪 FitTrack', _nfText('training'));
    }
  }

  // WATER
  if (n.water && n.water.enabled) {
    var interval = n.water.intervalHours || 2;
    var startH   = n.water.startHour !== undefined ? n.water.startHour : 8;
    var endH     = n.water.endHour   !== undefined ? n.water.endHour   : 22;
    if (hh >= startH && hh <= endH && mm === 0 && (hh - startH) % interval === 0) _fireNotification('💧 FitTrack', _nfText('water'));
  }

  // SUPPS — por bloque con horario propio, una vez por día
  if (n.supps && n.supps.enabled) {
    var _suppMap = { morning: 'supps_morning', noon: 'supps_noon', night: 'supps_night' };
    ['morning','noon','night'].forEach(function(k) {
      var obj = n.supps[k];
      if (!obj || !obj.enabled) return;
      var sentKey = '_suppSent_' + k + '_' + TODAY;
      if (state[sentKey]) return;
      var p = (obj.time || '').split(':');
      if (parseInt(p[0]) === hh && parseInt(p[1]||0) === mm) {
        _fireNotification('💊 FitTrack', _nfText(_suppMap[k]));
        state[sentKey] = true;
        saveState(state);
      }
    });
  }
}

setInterval(_scheduleNotifications, 60 * 1000);

// ─── SMART TRAINING NOTIFICATIONS ────────────────────────────────

function getUserTrainingPattern() {
  var cfg = state.config;
  if (!cfg || !cfg.cycle || !cfg.training) return {};
  var pattern = {};
  var dowKeys = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var sportEmojis = { Correr:'🏃', Bici:'🚴', Caminata:'🚶', HIIT:'🔥', Natación:'🏊', Pilates:'🧘', Fútbol:'⚽', Tenis:'🎾', Pádel:'🏓', Otro:'🏅' };

  dowKeys.forEach(function(dow) {
    var val = cfg.cycle[dow];
    if (!val || val === -1 || val === '-1') return;
    var entry = { dow: dow, type: null, name: null, emoji: null };
    if (val === 'sport') {
      entry.type  = 'sport';
      entry.name  = (cfg.sportNames && cfg.sportNames[dow]) || 'Deporte';
      entry.emoji = sportEmojis[entry.name] || '🏅';
    } else {
      var idx = parseInt(val);
      var d   = cfg.training[idx];
      if (!d) return;
      entry.type  = 'gym';
      entry.name  = d.name;
      entry.emoji = '💪';
    }
    pattern[dow] = entry;
  });
  return pattern;
}

function getExpectedTrainingTime(dow, activityName) {
  // Buscar en el historial timestamps de sesiones para este día + actividad
  var sessions = [];

  // Historial de gym: trainSets guardados con fecha
  Object.keys(state).forEach(function(dateKey) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
    var dayData = state[dateKey];
    if (!dayData) return;

    var d = new Date(dateKey + 'T12:00:00');
    var dayDow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    if (dayDow !== dow) return;

    // Para gym: ver si hay trainSets con timestamp de inicio
    if (dayData.trainingStartedAt) {
      var t = new Date(dayData.trainingStartedAt);
      sessions.push(t.getHours() * 60 + t.getMinutes());
    }

    // Para sport: ver si hay sportData con timestamp
    if (activityName && dayData['sportDone_' + activityName] && dayData['sportTimestamp_' + activityName]) {
      var t2 = new Date(dayData['sportTimestamp_' + activityName]);
      sessions.push(t2.getHours() * 60 + t2.getMinutes());
    }
  });

  if (sessions.length < 2) return null; // insuficiente historial

  // Usar últimas 5 sesiones, ignorar outliers simples (desviación > 90 min)
  sessions = sessions.slice(-5);
  var avg = sessions.reduce(function(a, b){ return a + b; }, 0) / sessions.length;
  var filtered = sessions.filter(function(s){ return Math.abs(s - avg) <= 90; });
  if (filtered.length < 2) return null;
  var mean = Math.round(filtered.reduce(function(a,b){ return a+b; }, 0) / filtered.length);
  return mean; // minutos desde medianoche
}

function _computeLearnedTimes() {
  if (!state.learnedTimes) state.learnedTimes = {};
  var sessions = {};
  Object.keys(state).forEach(function(dateKey) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return;
    var dayData = state[dateKey];
    if (!dayData || !dayData.trainingStartedAt) return;
    var d   = new Date(dateKey + 'T12:00:00');
    var dow = d.getDay();
    if (!sessions[dow]) sessions[dow] = [];
    var t = new Date(dayData.trainingStartedAt);
    sessions[dow].push(t.getHours() * 60 + t.getMinutes());
  });
  Object.keys(sessions).forEach(function(dow) {
    var arr = sessions[dow].slice(-8);
    var avg = arr.reduce(function(a,b){ return a+b; }, 0) / arr.length;
    var filtered = arr.filter(function(v){ return Math.abs(v - avg) <= 90; });
    if (filtered.length < 2) return;
    var mean = Math.round(filtered.reduce(function(a,b){ return a+b; }, 0) / filtered.length);
    state.learnedTimes[dow] = _nfMinToTime(mean);
  });
  saveState(state);
}

function shouldSendTrainingNotification() {
  var n = state.notifications;
  if (!n || !n.training || !n.training.enabled) return false;

  var now = new Date();
  var dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][now.getDay()];
  var nowMin = now.getHours() * 60 + now.getMinutes();

  // Ya se envió hoy
  if (state[TODAY] && state[TODAY]._trainNotifSentAt) return false;

  // Ya entrenó hoy
  var alreadyTrained = state[TODAY] && (
    state[TODAY].trainingStarted ||
    Object.keys(state[TODAY]).some(function(k){ return k.startsWith('trainSets_') || k.startsWith('sportDone_'); })
  );
  if (alreadyTrained) return false;

  var pattern = getUserTrainingPattern();
  if (!pattern[dow]) return false; // no es día de entrenamiento

  var activity = pattern[dow];
  var expectedMin = getExpectedTrainingTime(dow, activity.name);

var offset = (n.training.trainingReminder && n.training.trainingReminder.offsetMinutes) || 20;
  var triggerMin;
  if (expectedMin !== null) {
    triggerMin = expectedMin - offset;
  } else if (n.training.mode === 'smart' && state.learnedTimes && state.learnedTimes[now.getDay()]) {
    triggerMin = _nfTimeToMin(state.learnedTimes[now.getDay()]) - offset;
  } else {
    // Fallback manual: usar trainingSplit del día
    var split = state.trainingSplit || [];
    var splitEntry = split.find(function(e){ return e.day === now.getDay(); });
    var fallbackTime = splitEntry ? splitEntry.time : null;
    triggerMin = fallbackTime ? (_nfTimeToMin(fallbackTime) - offset) : (18 * 60 - offset);
  }

  // Disparar si estamos en la ventana [triggerMin, triggerMin+2]
  return nowMin >= triggerMin && nowMin <= triggerMin + 2;
}

function sendTrainingNotification() {
  var dow = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
  var pattern = getUserTrainingPattern();
  var activity = pattern[dow];
  if (!activity) return;

  var name = (state.config && state.config.name) ? state.config.name.split(' ')[0] : 'campeón';
  var texts = {
    gym: [
      activity.emoji + ' ¡Hoy toca ' + activity.name + ', ' + name + '! Tu sesión te está esperando.',
      '💪 ' + name + ', en unos minutos empieza ' + activity.name + '. ¡Preparate!',
      activity.emoji + ' ' + name + ', tu cuerpo ya sabe lo que viene — ' + activity.name + ' 🔥'
    ],
    sport: [
      activity.emoji + ' ¡' + name + ', hoy toca ' + activity.name + '! A darlo todo.',
      activity.emoji + ' ' + name + ', se acerca la hora de ' + activity.name + '. ¡Vamos!',
      '🎯 ' + name + ', ' + activity.name + ' en unos minutos — ¡no faltes!'
    ]
  };
  var arr = texts[activity.type] || texts.gym;
  var msg = arr[Math.floor(Math.random() * arr.length)];

  _fireNotification(activity.emoji + ' FitTrack', msg);

  // Marcar como enviada hoy
  if (!state[TODAY]) state[TODAY] = {};
  state[TODAY]._trainNotifSentAt = Date.now();
  saveState(state);
}
function openNotificationsPanel() {
  var existing = document.getElementById('notifPanel');
  if (existing) { existing.remove(); return; }
  var n = state.notifications;
  var name = (state.config && state.config.name) ? state.config.name.split(' ')[0] : '';

  // Migrar state si usa estructura vieja
  if (!n.meals.breakfast) {
    n.meals.breakfast  = { enabled: true,  time: '08:00' };
    n.meals.lunch      = { enabled: true,  time: '13:00' };
    n.meals.snack      = { enabled: false, time: '17:00' };
    n.meals.dinner     = { enabled: true,  time: '20:30' };
  }
  if (!n.supps.morning || typeof n.supps.morning !== 'object') {
    n.supps.morning = { enabled: typeof n.supps.morning === 'boolean' ? n.supps.morning : true,  time: '08:00' };
    n.supps.noon    = { enabled: typeof n.supps.noon    === 'boolean' ? n.supps.noon    : true,  time: '13:00' };
    n.supps.night   = { enabled: typeof n.supps.night   === 'boolean' ? n.supps.night   : true,  time: '21:00' };
  }
if (n.training.mode === undefined) n.training.mode = 'smart';
state.trainingSplit = _buildSplitFromConfig();
  if (!state.learnedTimes)  state.learnedTimes  = {};
  var tr = n.training.trainingReminder || {
    enabled: n.training.enabled !== undefined ? n.training.enabled : true,
    mode:    n.training.mode || 'smart',
    offsetMinutes: 20
  };
  n.training.trainingReminder = tr;
  var supported  = ('serviceWorker' in navigator);
  var permState  = ('Notification' in window) ? Notification.permission : 'unsupported';
  var permBanner = '';
  if (!supported) {
    permBanner = '<div style="background:#ff4d4d22;border:1px solid #ff4d4d55;border-radius:10px;padding:10px 12px;font-size:12px;color:#ff7a7a;margin-bottom:16px">⚠️ Tu navegador no soporta notificaciones push. Probá desde Chrome en Android.</div>';
  } else if (permState === 'denied') {
    permBanner = '<div style="background:#ff4d4d22;border:1px solid #ff4d4d55;border-radius:10px;padding:10px 12px;font-size:12px;color:#ff7a7a;margin-bottom:16px">🔕 Notificaciones bloqueadas. Habilitálas desde Configuración del sitio.</div>';
  } else if (permState === 'default') {
    permBanner = '<div onclick="_nfRequestPermission()" style="background:var(--accent)22;border:1px solid var(--accent)55;border-radius:10px;padding:10px 12px;font-size:12px;color:var(--accent);margin-bottom:16px;cursor:pointer">🔔 Tocá aquí para habilitar las notificaciones.</div>';
  }

  var DAY_LABELS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  var isManualTrain = n.training.mode === 'manual';

  var panel = document.createElement('div');
  panel.id  = 'notifPanel';
  panel.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end;justify-content:center';

  panel.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:24px 20px 32px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto">' +
      '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 20px"></div>' +
      '<div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px">🔔 Notificaciones</div>' +
      (name ? '<div style="font-size:12px;color:var(--text3);margin-bottom:16px">Configurá tus recordatorios, ' + name + '</div>' : '<div style="margin-bottom:16px"></div>') +
      permBanner +

      // ── MEALS ──
      '<div style="margin-bottom:12px;padding:14px;background:var(--bg3);border-radius:14px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
          '<div><div style="font-weight:700;color:var(--text);font-size:14px">🍽 Comidas</div>' +
          '<div style="font-size:11px;color:var(--text3);margin-top:2px">Recordatorios para registrar lo que comés</div></div>' +
          _nfToggleHTML('nfMealsEnabled', n.meals.enabled) +
        '</div>' +
        '<div id="nfMealsBody" style="display:' + (n.meals.enabled?'block':'none') + '">' +
          '<div style="display:flex;flex-direction:column;gap:8px">' +
            _nfMealRow('breakfast', n.meals.breakfast, '☀️ Desayuno') +
            _nfMealRow('lunch',     n.meals.lunch,     '🍽 Almuerzo') +
            _nfMealRow('snack',     n.meals.snack,     '🍎 Merienda') +
            _nfMealRow('dinner',    n.meals.dinner,    '🌙 Cena') +
          '</div>' +
        '</div>' +
      '</div>' +

      // ── TRAINING ──
      '<div style="margin-bottom:12px;padding:14px;background:var(--bg3);border-radius:14px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
          '<div><div style="font-weight:700;color:var(--text);font-size:14px">💪 Entrenamiento</div>' +
          '<div style="font-size:11px;color:var(--text3);margin-top:2px">Recordatorio antes de tu sesión</div></div>' +
          _nfToggleHTML('nfTrainEnabled', n.training.enabled) +
        '</div>' +
      '<div id="nfTrainBody" style="display:' + (n.training.enabled?'block':'none') + '">' +
          '<div style="display:flex;gap:8px;margin-bottom:14px">' +
            '<button onclick="_nfSetTrainMode(\'smart\')" id="nfTrainModeSmart" class="btn ' + (!isManualTrain?'btn-primary':'btn-ghost') + '" style="flex:1;font-size:12px">🧠 Inteligente<br><span style="font-size:10px;opacity:.7">Aprende tu horario</span></button>' +
            '<button onclick="_nfSetTrainMode(\'manual\')" id="nfTrainModeManual" class="btn ' + (isManualTrain?'btn-primary':'btn-ghost') + '" style="flex:1;font-size:12px">⏰ Manual<br><span style="font-size:10px;opacity:.7">Basado en tu split</span></button>' +
          '</div>' +
          '<div id="nfTrainSmartInfo" style="display:' + (!isManualTrain?'block':'none') + ';margin-bottom:10px">' +
            _nfSmartContextHTML() +
          '</div>' +
          '<div id="nfTrainManualSplit" style="display:' + (isManualTrain?'block':'none') + ';margin-bottom:10px">' +
            _nfSplitRowsHTML() +
          '</div>' +
      '</div>' +
      '</div>' +

      // ── WATER ──
      '<div style="margin-bottom:12px;padding:14px;background:var(--bg3);border-radius:14px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
          '<div><div style="font-weight:700;color:var(--text);font-size:14px">💧 Agua</div>' +
          '<div style="font-size:11px;color:var(--text3);margin-top:2px">Recordatorios de hidratación periódicos</div></div>' +
          _nfToggleHTML('nfWaterEnabled', n.water.enabled) +
        '</div>' +
        '<div id="nfWaterBody" style="display:' + (n.water.enabled?'block':'none') + '">' +
          '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
            '<span style="font-size:12px;color:var(--text2)">Cada</span>' +
            '<input id="nfWaterInterval" type="number" min="1" max="8" value="' + (n.water.intervalHours||2) + '" style="width:55px;padding:6px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);text-align:center;font-size:13px" onchange="_nfSave()">' +
            '<span style="font-size:12px;color:var(--text2)">hs · desde</span>' +
            '<input id="nfWaterStart" type="number" min="4" max="22" value="' + (n.water.startHour!==undefined?n.water.startHour:8) + '" style="width:55px;padding:6px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);text-align:center;font-size:13px" onchange="_nfSave()">' +
            '<span style="font-size:12px;color:var(--text2)">hasta</span>' +
            '<input id="nfWaterEnd" type="number" min="6" max="23" value="' + (n.water.endHour!==undefined?n.water.endHour:22) + '" style="width:55px;padding:6px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);text-align:center;font-size:13px" onchange="_nfSave()">' +
            '<span style="font-size:12px;color:var(--text2)">hs</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // ── SUPPS ──
      '<div style="margin-bottom:20px;padding:14px;background:var(--bg3);border-radius:14px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
          '<div><div style="font-weight:700;color:var(--text);font-size:14px">💊 Suplementos</div>' +
          '<div style="font-size:11px;color:var(--text3);margin-top:2px">Recordatorios para no olvidar ninguno</div></div>' +
          _nfToggleHTML('nfSuppsEnabled', n.supps.enabled) +
        '</div>' +
'<div id="nfSuppsBody" style="display:' + (n.supps.enabled?'block':'none') + '">' +
          '<div style="display:flex;flex-direction:column;gap:8px">' +
            _nfSuppTimeRow('morning', n.supps.morning, '☀️ Mañana') +
            _nfSuppTimeRow('noon',    n.supps.noon,    '🌞 Mediodía') +
            _nfSuppTimeRow('night',   n.supps.night,   '🌙 Noche') +
          '</div>' +
          '<div style="font-size:11px;color:var(--text3);margin-top:8px">Cuando Suplementos está activo se envían los tres recordatorios según el horario configurado.</div>' +
        '</div>' +
      '</div>' +

      '<button onclick="document.getElementById(\'notifPanel\').remove()" class="btn btn-ghost" style="width:100%">Cerrar</button>' +
    '</div>';

  panel.addEventListener('click', function(e) { if (e.target === panel) panel.remove(); });
  document.body.appendChild(panel);

// binds manejados por _nfToggleTap — no se necesitan listeners adicionales
}

function _nfMinToTime(min) {
  var h = Math.floor(min / 60), m = min % 60;
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
}

function _nfTimeToMin(t) {
  if (!t) return 0;
  var p = t.split(':');
  return parseInt(p[0]) * 60 + parseInt(p[1] || 0);
}

function _nfMealRow(key, obj, label) {
  var en = obj && obj.enabled;
  var t  = (obj && obj.time) || '08:00';
  var rowId = 'nfMealRow_' + key;
  return '<div id="' + rowId + '" style="display:flex;justify-content:space-between;align-items:center;padding:9px 10px;background:var(--bg2);border-radius:10px;opacity:' + (en?'1':'0.45') + '">' +
    '<div style="display:flex;align-items:center;gap:10px;flex:1">' +
      '<input type="checkbox" id="nfMeal_' + key + '" ' + (en?'checked':'') + ' ' +
        'onchange="_nfRowToggle(\'nfMealRow_' + key + '\',this.checked);_nfSave()" ' +
        'style="width:16px;height:16px;accent-color:var(--accent);flex-shrink:0">' +
      '<span style="font-size:13px;color:var(--text)">' + label + '</span>' +
    '</div>' +
    '<input type="time" id="nfMealTime_' + key + '" value="' + t + '" ' +
      'style="padding:5px 8px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px" ' +
      'onchange="_nfSave()">' +
  '</div>';
}

function _nfSuppRowV2(key, obj, label) {
  var en = obj && obj.enabled;
  var t  = (obj && obj.time) || '08:00';
  var rowId = 'nfSuppRow_' + key;
  return '<div id="' + rowId + '" style="display:flex;justify-content:space-between;align-items:center;padding:9px 10px;background:var(--bg2);border-radius:10px;opacity:' + (en?'1':'0.45') + '">' +
    '<div style="display:flex;align-items:center;gap:10px;flex:1">' +
      '<input type="checkbox" id="nfSupp_' + key + '" ' + (en?'checked':'') + ' ' +
        'onchange="_nfRowToggle(\'nfSuppRow_' + key + '\',this.checked);_nfSave()" ' +
        'style="width:16px;height:16px;accent-color:var(--accent);flex-shrink:0">' +
      '<span style="font-size:13px;color:var(--text)">' + label + '</span>' +
    '</div>' +
    '<input type="time" id="nfSuppTime_' + key + '" value="' + t + '" ' +
      'style="padding:5px 8px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px" ' +
      'onchange="_nfSave()">' +
  '</div>';
}

function _nfRowToggle(rowId, checked) {
  var row = document.getElementById(rowId);
  if (row) row.style.opacity = checked ? '1' : '0.45';
}

function _nfSuppTimeRow(key, obj, label) {
  var t = (obj && obj.time) || '08:00';
  return '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 10px;background:var(--bg2);border-radius:10px">' +
    '<span style="font-size:13px;color:var(--text)">' + label + '</span>' +
    '<input type="time" id="nfSuppTime_' + key + '" value="' + t + '" ' +
      'style="padding:5px 8px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px" ' +
      'onchange="_nfSave()">' +
  '</div>';
}

function _nfToggleHTML(id, checked) {
  var trackId = id + 'Track';
  var thumbId = id + 'Thumb';
  return '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;flex-shrink:0">' +
    '<div style="position:relative;width:44px;height:24px" onclick="_nfToggleTap(\'' + id + '\')">' +
      '<input type="checkbox" id="' + id + '" ' + (checked?'checked':'') + ' ' +
        'style="opacity:0;width:0;height:0;position:absolute;pointer-events:none">' +
      '<div id="' + trackId + '" style="position:absolute;inset:0;border-radius:12px;cursor:pointer;transition:background .2s;background:' + (checked?'var(--accent)':'var(--border)') + '">' +
        '<div id="' + thumbId + '" style="position:absolute;top:3px;left:' + (checked?'23px':'3px') + ';width:18px;height:18px;border-radius:50%;background:#fff;transition:left .2s"></div>' +
      '</div>' +
    '</div>' +
  '</label>';
}

function _nfToggleTap(id) {
  var cb = document.getElementById(id);
  if (!cb) return;
  cb.checked = !cb.checked;
  // Actualizar visual del track y thumb
  var track = document.getElementById(id + 'Track');
  var thumb = document.getElementById(id + 'Thumb');
  if (track) track.style.background = cb.checked ? 'var(--accent)' : 'var(--border)';
  if (thumb) thumb.style.left = cb.checked ? '23px' : '3px';
  // Mostrar/ocultar body asociado
  var bodyMap = { nfMealsEnabled:'nfMealsBody', nfTrainEnabled:'nfTrainBody', nfWaterEnabled:'nfWaterBody', nfSuppsEnabled:'nfSuppsBody' };
  var bodyId = bodyMap[id];
  if (bodyId) {
    var body = document.getElementById(bodyId);
    if (body) body.style.display = cb.checked ? 'block' : 'none';
  }
  _nfSave();
}
function _nfRequestPermission() {
  if (!('Notification' in window)) return;
  Notification.requestPermission().then(function(p) {
    if (p === 'granted') { showToast('✅ Notificaciones habilitadas'); openNotificationsPanel(); }
    else showToast('⚠️ Permiso denegado');
  });
}

function _nfSetTrainMode(mode) {
  state.notifications.training.mode = mode;
  if (state.notifications.training.trainingReminder) state.notifications.training.trainingReminder.mode = mode;
  document.getElementById('nfTrainModeSmart').className  = 'btn ' + (mode==='smart'  ? 'btn-primary' : 'btn-ghost');
  document.getElementById('nfTrainModeManual').className = 'btn ' + (mode==='manual' ? 'btn-primary' : 'btn-ghost');
  var smartInfo  = document.getElementById('nfTrainSmartInfo');
  var manualSplit = document.getElementById('nfTrainManualSplit');
  if (smartInfo)   smartInfo.style.display   = mode === 'smart'  ? 'block' : 'none';
  if (manualSplit) manualSplit.style.display  = mode === 'manual' ? 'block' : 'none';
  _nfSave();
}

function _nfUpdateSplitTime(dayIdx, val) {
  if (!state.trainingSplit) state.trainingSplit = [];
  var entry = state.trainingSplit.find(function(e){ return e.day === dayIdx; });
  if (entry) entry.time = val;
  saveState(state);
}

function _nfSplitRowsHTML() {
  var split = _buildSplitFromConfig();
  state.trainingSplit = split;
  if (!split.length) {
    return '<div style="font-size:12px;color:var(--text3);padding:8px 0">No hay días de entrenamiento configurados. Configurá tu rutina primero.</div>';
  }
  var DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  return '<div style="display:flex;flex-direction:column;gap:6px">' +
    split.map(function(entry) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 10px;background:var(--bg2);border-radius:10px">' +
        '<span style="font-size:13px;color:var(--text);font-weight:600">' + entry.name +
          '<span style="font-size:11px;color:var(--text3);font-weight:400;margin-left:6px">(' + (DAY_NAMES[entry.day] || '') + ')</span>' +
        '</span>' +
        '<input type="time" value="' + (entry.time || '18:00') + '" ' +
          'style="padding:5px 8px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px" ' +
          'onchange="_nfUpdateSplitTime(' + entry.day + ',this.value)">' +
      '</div>';
    }).join('') +
  '</div>';
}

function _nfSmartContextHTML() {
  var learnedTimes = state.learnedTimes || {};
  var split = state.trainingSplit || _buildSplitFromConfig();
  var DAY_NAMES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  if (!Object.keys(learnedTimes).length) {
    return '<div style="font-size:12px;color:var(--text3);background:var(--bg2);border-radius:10px;padding:10px 12px">' +
      '📊 Aún estamos aprendiendo tu rutina. Entrenará más sesiones para detectar tu horario habitual.</div>';
  }
  var rows = split.map(function(entry) {
    var t = learnedTimes[entry.day];
    if (!t) return '';
    return '<div style="display:flex;justify-content:space-between;font-size:12px;padding:5px 0;border-bottom:1px solid var(--border)">' +
      '<span style="color:var(--text2)">📅 ' + DAY_NAMES[entry.day] + ' — ' + entry.name + '</span>' +
      '<span style="color:var(--accent);font-weight:700">~' + t + '</span>' +
    '</div>';
  }).filter(Boolean).join('');
  return rows
    ? '<div style="background:var(--bg2);border-radius:10px;padding:10px 12px">' +
        '<div style="font-size:11px;color:var(--text3);margin-bottom:6px;font-weight:600">HORARIOS DETECTADOS</div>' +
        rows + '</div>'
    : '<div style="font-size:12px;color:var(--text3);background:var(--bg2);border-radius:10px;padding:10px 12px">📊 Aún estamos aprendiendo tu rutina.</div>';
}

function _nfSave() {
  var n = state.notifications;

  // Meals
  n.meals.enabled = document.getElementById('nfMealsEnabled').checked;
  ['breakfast','lunch','snack','dinner'].forEach(function(k) {
    var cb = document.getElementById('nfMeal_' + k);
    var ti = document.getElementById('nfMealTime_' + k);
    if (!n.meals[k]) n.meals[k] = { enabled: false, time: '08:00' };
    if (cb) n.meals[k].enabled = cb.checked;
    if (ti) n.meals[k].time    = ti.value;
  });

// Training
  n.training.enabled = document.getElementById('nfTrainEnabled').checked;
  if (n.training.trainingReminder) n.training.trainingReminder.enabled = n.training.enabled;

  // Water (sin cambios)
  n.water.enabled = document.getElementById('nfWaterEnabled').checked;
  var wInt = document.getElementById('nfWaterInterval');
  var wStart = document.getElementById('nfWaterStart');
  var wEnd   = document.getElementById('nfWaterEnd');
  if (wInt)   n.water.intervalHours = parseInt(wInt.value) || 2;
  if (wStart) n.water.startHour     = parseInt(wStart.value);
  if (wEnd)   n.water.endHour       = parseInt(wEnd.value);

  // Supps
// Supps — enabled por bloque = mismo que el toggle principal
  var suppsCb = document.getElementById('nfSuppsEnabled');
  n.supps.enabled = suppsCb ? suppsCb.checked : n.supps.enabled;
  ['morning','noon','night'].forEach(function(k) {
    var ti = document.getElementById('nfSuppTime_' + k);
    if (typeof n.supps[k] !== 'object') n.supps[k] = { enabled: true, time: '08:00' };
    n.supps[k].enabled = n.supps.enabled;
    if (ti) n.supps[k].time = ti.value;
  });

  saveState(state);
  showToast('🔔 Notificaciones guardadas ✓');
}

function openSettings() {  var cfg = state.config || {};
  document.getElementById('settingName').value = cfg.name || '';
document.getElementById('settingKcal').value = cfg.kcal || '';
  document.getElementById('settingProt').value = cfg.prot || '';
  document.getElementById('settingCarb').value = cfg.carb || '';
  document.getElementById('settingFat').value = cfg.fat || '';
  ['settingKcal','settingProt','settingCarb','settingFat'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.setAttribute('inputmode','decimal');
  });
  var m = document.getElementById('settingsModal');
  if (!m) return;
  m.removeAttribute('style');
  m.classList.add('open');
  document.querySelectorAll('.text-size-btn, .text-size-section').forEach(function(el) {
    el.style.display = 'none';
  });
}
function closeModal(id) {
  var m = document.getElementById(id);
  if (!m) return;
  m.removeAttribute('style');
  m.classList.remove('open');
}

function changeTheme(theme) {
  document.querySelectorAll('.settings-palette').forEach(function(c) { c.style.borderColor = 'transparent'; });
  event.currentTarget.style.borderColor = 'white';
  if (state.config) state.config.theme = theme;
  applyTheme(theme);
  saveState(state);
}

function changeLayout(layout) {
  applyLayout(layout);
}

function saveSettings() {
  if (!state.config) state.config = {};
  var name = document.getElementById('settingName').value.trim();
  var kcal = parseFloat(document.getElementById('settingKcal').value);
  if (!name || !kcal) { showToast('⚠ Completá los campos'); return; }
  state.config.name = name;
  state.config.kcal = kcal;
  state.config.prot = parseFloat(document.getElementById('settingProt').value) || state.config.prot;
  state.config.carb = parseFloat(document.getElementById('settingCarb').value) || state.config.carb;
  state.config.fat  = parseFloat(document.getElementById('settingFat').value)  || state.config.fat;
  saveState(state);
closeModal('settingsModal');
  updateHeader();
setTimeout(renderMeals, 0);
  setTimeout(renderHome, 0);
  setTimeout(renderTraining, 0);
  setTimeout(renderWeekStrip, 0);
  showToast('Configuración guardada ✓');
}

function openResetConfirm() {
  closeModal('settingsModal');
  var m = document.getElementById('resetConfirmModal');
  if (m) { m.style.display = 'flex'; }
}

function closeResetConfirm() {
  var m = document.getElementById('resetConfirmModal');
  if (m) { m.style.display = 'none'; }
}

// ─── CAMBIAR OBJETIVO ────────────────────────────────────────────

function openChangeGoalSheet() {
  var existing = document.getElementById('changeGoalSheet');
  if (existing) existing.remove();

  var cfg = state.config || {};
  var currentGoal = cfg.goal || 'cut';

  // Mapeo interno → etiqueta visible de 3 opciones simplificadas
  var GOAL_DISPLAY = {
    cut_aggressive: 'déficit',
    cut:            'déficit',
    maintain:       'mantenimiento',
    lean_bulk:      'superávit',
    bulk:           'superávit'
  };
  var activeDisplay = GOAL_DISPLAY[currentGoal] || 'déficit';

  var options = [
    { key: 'cut',      label: '📉 Déficit',        desc: 'Perder grasa. Calorías por debajo de tu TDEE.' },
    { key: 'maintain', label: '⚖️ Mantenimiento',   desc: 'Mantener peso. Calorías igual a tu TDEE.' },
    { key: 'lean_bulk',label: '📈 Superávit',       desc: 'Ganar músculo. Calorías por encima de tu TDEE.' }
  ];

  var rows = options.map(function(o) {
    var isActive = (GOAL_DISPLAY[currentGoal] === GOAL_DISPLAY[o.key]);
    return '<div onclick="_selectGoalOption(\'' + o.key + '\')" id="goalOpt-' + o.key + '" ' +
      'style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:12px;cursor:pointer;margin-bottom:8px;' +
      'border:2px solid ' + (isActive ? 'var(--accent)' : 'var(--border)') + ';' +
      'background:' + (isActive ? 'var(--bg3)' : 'var(--bg2)') + '">' +
      '<div style="flex:1">' +
        '<div style="font-size:14px;font-weight:700;color:var(--text)">' + o.label + '</div>' +
        '<div style="font-size:11px;color:var(--text3);margin-top:2px">' + o.desc + '</div>' +
      '</div>' +
      (isActive ? '<div style="color:var(--accent);font-size:18px">✓</div>' : '') +
    '</div>';
  }).join('');

  var sheet = document.createElement('div');
  sheet.id = 'changeGoalSheet';
  sheet.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:flex-end;justify-content:center';
  sheet.innerHTML =
    '<div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:24px 20px 32px;width:100%;max-width:480px;margin:0 auto">' +
      '<div style="width:36px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 20px"></div>' +
      '<div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:4px">🎯 Cambiar objetivo</div>' +
      '<div style="font-size:12px;color:var(--text3);margin-bottom:20px">Se recalcularán tus calorías, macros y plan de comidas. Tus datos registrados no se borran.</div>' +
      '<div id="goalOptionsList">' + rows + '</div>' +
      '<div id="goalPreviewBox" style="display:none;background:var(--bg3);border-radius:12px;padding:14px;margin-bottom:16px;font-size:12px;color:var(--text2)"></div>' +
      '<div style="display:flex;gap:8px;margin-top:8px">' +
        '<button onclick="_applyGoalChange()" class="btn btn-primary" style="flex:1">Aplicar cambio</button>' +
        '<button onclick="document.getElementById(\'changeGoalSheet\').remove()" class="btn btn-ghost" style="flex:0 0 auto">Cancelar</button>' +
      '</div>' +
    '</div>';

  sheet.addEventListener('click', function(e) { if (e.target === sheet) sheet.remove(); });
  document.body.appendChild(sheet);

  // Guardar selección activa en el sheet para uso posterior
  sheet._selectedGoal = currentGoal;
}

function _selectGoalOption(goalKey) {
  var sheet = document.getElementById('changeGoalSheet');
  if (!sheet) return;
  sheet._selectedGoal = goalKey;

  // Actualizar estilos de las opciones
  var options = ['cut', 'maintain', 'lean_bulk'];
  options.forEach(function(k) {
    var el = document.getElementById('goalOpt-' + k);
    if (!el) return;
    var isActive = (k === goalKey);
    el.style.borderColor = isActive ? 'var(--accent)' : 'var(--border)';
    el.style.background   = isActive ? 'var(--bg3)'   : 'var(--bg2)';
    // Actualizar checkmark
    var check = el.querySelector('[data-check]');
    var lastChild = el.lastElementChild;
    // Limpiar checkmark anterior
    if (lastChild && lastChild.textContent === '✓') lastChild.remove();
    if (isActive) {
      var chk = document.createElement('div');
      chk.style.cssText = 'color:var(--accent);font-size:18px';
      chk.textContent = '✓';
      el.appendChild(chk);
    }
  });

  // Mostrar preview del nuevo plan calculado
  var preview = _calcGoalPreview(goalKey);
  var box = document.getElementById('goalPreviewBox');
  if (box && preview) {
    box.style.display = 'block';
    box.innerHTML =
      '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px">Vista previa del nuevo plan</div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>🔥 Calorías objetivo</span><span style="color:var(--accent);font-weight:700">' + preview.kcal + ' kcal</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>🍗 Proteína</span><span style="color:#3b82f6;font-weight:700">' + preview.prot + 'g</span></div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>🍚 Carbos</span><span style="color:#f59e0b;font-weight:700">' + preview.carb + 'g</span></div>' +
      '<div style="display:flex;justify-content:space-between"><span>🥑 Grasas</span><span style="color:#ef4444;font-weight:700">' + preview.fat + 'g</span></div>';
  }
}

// Recalcula macros usando state.config (no depende del DOM del wizard)
function _calcGoalPreview(goalKey) {
  var cfg = state.config;
  if (!cfg || !cfg.weight || !cfg.height || !cfg.age) return null;

  var weight = cfg.weight;
  var height = cfg.height;
  var age    = cfg.age;
  var tdee   = cfg.tdee || Math.round((10*weight + 6.25*height - 5*age + 5) * 1.55);

  var goalMult, protMult;
  if      (goalKey === 'cut_aggressive') { goalMult = 0.75; protMult = 2.4; }
  else if (goalKey === 'cut')            { goalMult = 0.85; protMult = 2.2; }
  else if (goalKey === 'maintain')       { goalMult = 1.00; protMult = 1.8; }
  else if (goalKey === 'lean_bulk')      { goalMult = 1.10; protMult = 2.0; }
  else if (goalKey === 'bulk')           { goalMult = 1.20; protMult = 1.8; }
  else                                   { goalMult = 0.85; protMult = 2.2; }

  var kcal    = Math.round(tdee * goalMult);
  var prot    = Math.round(weight * protMult);
  var fat     = Math.round((kcal * 0.25) / 9);
  var carbKcal = kcal - (prot * 4) - (fat * 9);
  var carb    = Math.round(Math.max(carbKcal, 0) / 4);

  return { kcal: kcal, prot: prot, carb: carb, fat: fat };
}

function _applyGoalChange() {
  var sheet = document.getElementById('changeGoalSheet');
  if (!sheet) return;
  var goalKey = sheet._selectedGoal;
  if (!goalKey) { showToast('⚠ Seleccioná un objetivo'); return; }

  var preview = _calcGoalPreview(goalKey);
  if (!preview) {
    showToast('⚠ Faltan datos de perfil (peso, altura, edad)');
    sheet.remove();
    return;
  }

  // Actualizar SOLO los campos de objetivo — sin tocar training, cycle, supps, foods, metrics, etc.
  state.config.goal = goalKey;
  state.config.kcal = preview.kcal;
  state.config.prot = preview.prot;
  state.config.carb = preview.carb;
  state.config.fat  = preview.fat;

  // Limpiar plan semanal para forzar regeneración con los nuevos objetivos
  if (state.mealPlan) {
    state.mealPlan.plan = null;
    state.mealPlan.generatedAt = null;
  }

  saveState(state);
  sheet.remove();

  // Re-renderizar vistas afectadas
if (typeof updateHeader    === 'function') updateHeader();
  if (typeof renderMeals     === 'function') renderMeals();
  if (typeof renderHome      === 'function') renderHome();
  if (typeof renderMacros    === 'function') renderMacros();
  if (typeof renderMealPlan  === 'function') renderMealPlan();
  if (typeof renderTraining  === 'function') renderTraining();
  if (typeof renderWeekStrip === 'function') renderWeekStrip();

  var GOAL_LABELS = { cut: 'Déficit', cut_aggressive: 'Déficit agresivo', maintain: 'Mantenimiento', lean_bulk: 'Superávit', bulk: 'Superávit' };
  showToast('🎯 Objetivo cambiado a ' + (GOAL_LABELS[goalKey] || goalKey) + ' ✓');
}
// ─── BACKUP / RESTORE ────────────────────────────────────────────
function backupData() {
  try {
    var data = JSON.stringify(state, null, 2);
    var date = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    var filename = 'fittrack-backup-' + date + '.json';
    var blob = new Blob([data], { type: 'application/json' });
    var url  = URL.createObjectURL(blob);

    // Intentar share nativo primero (iOS)
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share) {
      // Guardar archivo temporal y compartir
      var reader = new FileReader();
      reader.onload = function() {
        window.Capacitor.Plugins.Share.share({
          title: 'Backup FitTrack',
          text: 'Mis datos de FitTrack — ' + date,
          url: url,
          dialogTitle: 'Guardar backup'
        }).catch(function() {
          _fallbackDownload(url, filename);
        });
      };
      reader.readAsDataURL(blob);
    } else if (navigator.share) {
      // Web share API
      var file = new File([data], filename, { type: 'application/json' });
      navigator.share({ files: [file], title: 'Backup FitTrack' }).catch(function() {
        _fallbackDownload(url, filename);
      });
    } else {
      _fallbackDownload(url, filename);
    }
    showToast('💾 Preparando backup...');
  } catch(e) {
    showToast('⚠ Error al crear backup');
    console.error('Backup error:', e);
  }
}

function _fallbackDownload(url, filename) {
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('💾 Backup descargado');
}

function restoreData() {
  // Crear input file oculto
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
  document.body.appendChild(input);

  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var parsed = JSON.parse(ev.target.result);
        // Validar que sea un backup de FitTrack
        if (!parsed.config && !parsed.setupDone) {
          showToast('⚠ El archivo no es un backup válido de FitTrack');
          return;
        }
        // Confirmar antes de restaurar
        var sheet = document.createElement('div');
        sheet.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;padding:24px';
        sheet.innerHTML =
          '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:28px 24px;max-width:320px;width:100%;text-align:center">' +
            '<div style="font-size:36px;margin-bottom:12px">📂</div>' +
            '<div style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:8px">Restaurar backup</div>' +
            '<div style="font-size:13px;color:var(--text2);line-height:1.5;margin-bottom:24px">Se van a reemplazar todos tus datos actuales con los del backup. Esta acción no se puede deshacer.</div>' +
            '<div style="display:flex;gap:10px">' +
              '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="flex:1;padding:12px;border-radius:12px;border:1px solid var(--border);background:var(--bg3);color:var(--text);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">Cancelar</button>' +
              '<button id="_restoreConfirmBtn" style="flex:1;padding:12px;border-radius:12px;border:none;background:var(--accent);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit">Restaurar</button>' +
            '</div>' +
          '</div>';
        document.body.appendChild(sheet);

        document.getElementById('_restoreConfirmBtn').onclick = function() {
          sheet.remove();
          // Restaurar datos
          Object.assign(state, parsed);
          saveState(state);
          showToast('✅ Datos restaurados correctamente');
          setTimeout(function() { location.reload(); }, 1200);
        };

      } catch(err) {
        showToast('⚠ No se pudo leer el archivo');
        console.error('Restore error:', err);
      }
    };
    reader.readAsText(file);
    document.body.removeChild(input);
  };

  input.click();
}
