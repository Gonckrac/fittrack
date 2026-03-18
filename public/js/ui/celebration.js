// ─── CELEBRACIÓN GRANDE DE META ──────────────────────────────────
function celebrateGoalReached(opts) {
  // opts: { title, subtitle, detail, emoji }
  var existing = document.getElementById('bigGoalCelebration');
  if (existing) existing.remove();

  var userName = (state.config && state.config.name) ? state.config.name : '';
  var emoji    = opts.emoji || '🏆';
  var title    = opts.title || '¡Meta alcanzada!';
  var subtitle = opts.subtitle || '¡Lo lograste' + (userName ? ', ' + userName : '') + '!';
  var detail   = opts.detail || '';

  var overlay = document.createElement('div');
  overlay.id = 'bigGoalCelebration';
  overlay.style.cssText = [
    'position:fixed;inset:0;z-index:20000',
    'display:flex;align-items:center;justify-content:center',
    'background:rgba(0,0,0,0.82)',
    'animation:bgFadeIn 0.4s ease'
  ].join(';');

  overlay.innerHTML =
    '<style>' +
      '@keyframes bgFadeIn{from{opacity:0}to{opacity:1}}' +
      '@keyframes cardPop{0%{transform:scale(0.7) translateY(40px);opacity:0}60%{transform:scale(1.04) translateY(-6px)}100%{transform:scale(1) translateY(0);opacity:1}}' +
      '@keyframes emojiPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.18)}}' +
      '@keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}' +
      '#bigGoalCelebration .bgc-card{background:var(--bg2);border-radius:28px;padding:36px 28px 28px;max-width:340px;width:90%;text-align:center;animation:cardPop 0.55s cubic-bezier(.34,1.56,.64,1) both;position:relative;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.5)}' +
      '#bigGoalCelebration .bgc-emoji{font-size:64px;display:block;margin-bottom:12px;animation:emojiPulse 1.6s ease-in-out infinite}' +
      '#bigGoalCelebration .bgc-title{font-size:22px;font-weight:800;color:var(--text);margin-bottom:6px;line-height:1.2}' +
      '#bigGoalCelebration .bgc-subtitle{font-size:15px;font-weight:700;color:var(--accent);margin-bottom:10px}' +
      '#bigGoalCelebration .bgc-detail{font-size:12px;color:var(--text3);margin-bottom:24px;line-height:1.5}' +
      '#bigGoalCelebration .bgc-btn{background:var(--accent);color:#fff;border:none;border-radius:14px;padding:13px 32px;font-size:14px;font-weight:700;cursor:pointer;width:100%;transition:opacity 0.2s}' +
      '#bigGoalCelebration .bgc-btn:active{opacity:0.8}' +
      '#bigGoalCelebration .bgc-confetti-wrap{position:fixed;inset:0;pointer-events:none;z-index:20001}' +
    '</style>' +
    '<div class="bgc-confetti-wrap" id="bgcConfettiWrap"></div>' +
    '<div class="bgc-card">' +
      '<span class="bgc-emoji">' + emoji + '</span>' +
      '<div class="bgc-title">' + title + '</div>' +
      '<div class="bgc-subtitle">' + subtitle + '</div>' +
      (detail ? '<div class="bgc-detail">' + detail + '</div>' : '') +
      '<button class="bgc-btn" onclick="closeBigGoalCelebration()">¡Seguimos! 💪</button>' +
    '</div>';

  document.body.appendChild(overlay);
  _spawnBigConfetti();
}

function closeBigGoalCelebration() {
  var el = document.getElementById('bigGoalCelebration');
  if (el) {
    el.style.animation = 'bgFadeIn 0.3s ease reverse';
    setTimeout(function(){ if (el.parentNode) el.remove(); }, 280);
  }
}
window.closeBigGoalCelebration = closeBigGoalCelebration;

function _spawnBigConfetti() {
  var wrap = document.getElementById('bgcConfettiWrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  var colors = ['#4d8aff','#4dffb4','#ffd44d','#ff6b4d','#a78bfa','#f472b6','#06b6d4','#10b981','#f59e0b'];
  var shapes = ['4px','50%','2px'];
  for (var i = 0; i < 60; i++) {
    var p = document.createElement('div');
    var size = 6 + Math.random() * 8;
    var borderRadius = shapes[Math.floor(Math.random() * shapes.length)];
    p.style.cssText = [
      'position:fixed',
      'left:' + Math.random() * 100 + '%',
      'top:-20px',
      'width:' + size + 'px',
      'height:' + size + 'px',
      'border-radius:' + borderRadius,
      'background:' + colors[Math.floor(Math.random() * colors.length)],
      'animation:confettiFall ' + (1.4 + Math.random() * 1.8) + 's ' + (Math.random() * 0.8) + 's ease-in both',
      'pointer-events:none'
    ].join(';');
    wrap.appendChild(p);
  }
}

var CELEB_MSGS = {
  supp: [
    { emoji:'💊', title:'¡Ahí va!', msg:'Cada suplemento es un paso hacia la mejor versión de vos. ¡Sos constante!' },
    { emoji:'⭐', title:'¡Disciplina pura!', msg:'Acordarte de tus suplementos no es fácil. ¡Vos lo hacés!' },
    { emoji:'💪', title:'¡Tu cuerpo te lo agradece!', msg:'Estás cuidándote de adentro hacia afuera.' },
  ],
  suppAll: [
    { emoji:'🏆', title:'¡Todos los suplementos!', msg:'¡Los tomaste TODOS! Eso es dedicación de campeón/a.' },
    { emoji:'🎯', title:'¡Puntaje perfecto!', msg:'Suplementos 100% cumplidos. ¡Impresionante!' },
  ],
  food: [
    { emoji:'🥗', title:'¡Registrando tus comidas!', msg:'Llevar el registro es uno de los hábitos más poderosos. ¡Sos inteligente!' },
    { emoji:'✍️', title:'¡Conciencia alimentaria!', msg:'Cada comida registrada es una decisión consciente.' },
  ],
  weight: [
    { emoji:'⚖️', title:'¡Peso anotado!', msg:'Registrar el peso regularmente es de personas comprometidas. ¡Vos sos una de ellas!' },
    { emoji:'📊', title:'¡Siguiendo tu progreso!', msg:'Cada número que anotás es evidencia de tu viaje.' },
  ],
  weightLost: [
    { emoji:'🎉', title:'¡Bajaste de peso!', msg:'¡Eso no es magia, es trabajo tuyo! ¡La rompiste!' },
    { emoji:'🔥', title:'¡En racha!', msg:'¡Estás bajando! El esfuerzo se ve. ¡No pares!' },
  ],
};
var _celebQueue = [];
var _celebBusy = false;
function celebrate(type, force) {
  if (!force && Math.random() < 0.4) return;
  var msgs = CELEB_MSGS[type];
  if (!msgs || !msgs.length) return;
  var m = msgs[Math.floor(Math.random()*msgs.length)];
  _celebQueue.push(m);
  if (!_celebBusy) _nextCelebration();
}
function _nextCelebration() {
  if (!_celebQueue.length) { _celebBusy = false; return; }
  _celebBusy = true;
  var m = _celebQueue.shift();
  document.getElementById('celebEmoji').textContent = m.emoji;
  document.getElementById('celebTitle').textContent = m.title;
  document.getElementById('celebMsg').textContent = m.msg;
  _spawnConfetti();
  document.getElementById('celebrationModal').classList.add('show');
}
function closeCelebration() {
  document.getElementById('celebrationModal').classList.remove('show');
  setTimeout(_nextCelebration, 400);
}
function _spawnConfetti() {
  var wrap = document.getElementById('confettiWrap');
  wrap.innerHTML = '';
  var colors = ['#4d8aff','#4dffb4','#ffd44d','#ff6b4d','#a78bfa','#f472b6','#06b6d4'];
  for (var i = 0; i < 22; i++) {
    var p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = 'left:'+Math.random()*100+'%;background:'+colors[Math.floor(Math.random()*colors.length)]+';animation-delay:'+(Math.random()*0.5)+'s;animation-duration:'+(0.9+Math.random()*0.6)+'s;transform:rotate('+Math.floor(Math.random()*360)+'deg)';
    wrap.appendChild(p);
  }
}

// ─── MICRO-FEEDBACK TOAST (otras pestañas, NO en HOY) ────────────
// ─── MICRO-FEEDBACK: pools con 50+ variantes por tipo ────────────
var _FEEDBACK_POOLS = {

food: [
    { emoji:'🥩', title:'¡Proteína anotada!', msg:'Tu músculo ya está festejando.' },
    { emoji:'🍽', title:'¡Comida registrada!', msg:'El tracking es el primer paso al resultado.' },
    { emoji:'🥗', title:'¡Eso es consciencia!', msg:'Cada plato anotado es una decisión tuya.' },
    { emoji:'⚡', title:'¡Energía cargada!', msg:'Kcal adentro, rendimiento arriba.' },
    { emoji:'📊', title:'¡Los números mandan!', msg:'Lo que se mide, se mejora.' },
    { emoji:'🥚', title:'¡Aminoácidos en camino!', msg:'Cada gramo de proteína construye algo.' },
    { emoji:'🍌', title:'¡Carbos al tanque!', msg:'Combustible listo para lo que venga.' },
    { emoji:'🥑', title:'¡Grasas buenas!', msg:'Omega en juego, cerebro contento.' },
    { emoji:'🍳', title:'¡Plato anotado!', msg:'Nada pasa desapercibido por acá.' },
    { emoji:'🌾', title:'¡Fibra en el plan!', msg:'Intestino feliz, persona feliz.' },
    { emoji:'🥦', title:'¡Verde registrado!', msg:'El color en el plato siempre suma.' },
    { emoji:'💪', title:'¡Macro cerrado!', msg:'Un paso más hacia el objetivo.' },
    { emoji:'🍱', title:'¡Orden es progreso!', msg:'Comida controlada, mente tranquila.' },
    { emoji:'🔥', title:'¡Déficit en marcha!', msg:'Cada caloría contada es intención.' },
    { emoji:'📈', title:'¡Superávit activo!', msg:'Comer bien también es estrategia.' },
    { emoji:'🧀', title:'¡Proteína láctea!', msg:'Calcio y músculo en el mismo plato.' },
    { emoji:'🫘', title:'¡Legumbres anotadas!', msg:'Proteína vegetal que no falla.' },
    { emoji:'🍚', title:'¡Carbos controlados!', msg:'Energía para las horas que vienen.' },
    { emoji:'🥜', title:'¡Cada gramo suma!', msg:'Grasas buenas, decisión inteligente.' },
    { emoji:'🍊', title:'¡Vitaminas también cuentan!', msg:'Micronutrientes, los héroes silenciosos.' },
    { emoji:'🥛', title:'¡Bien completo!', msg:'Proteína + calcio en un solo movimiento.' },
    { emoji:'🍝', title:'¡Un plato menos de duda!', msg:'Registraste, ganaste claridad.' },
    { emoji:'✍️', title:'¡Conciencia total!', msg:'Sos de los pocos que realmente trackea.' },
    { emoji:'🌮', title:'¡Todo al log!', msg:'Si no está registrado, no existe. Vos lo sabés.' },
    { emoji:'🥣', title:'¡Desayuno cumplido!', msg:'El día arrancó con el pie derecho.' },
    { emoji:'🍜', title:'¡Cena registrada!', msg:'El día cerró limpio.' },
    { emoji:'🧃', title:'¡Energía disponible!', msg:'Listo para rendir.' },
    { emoji:'🍋', title:'¡Limpio y anotado!', msg:'Simple, directo, efectivo.' },
    { emoji:'🥕', title:'¡Color en el plato!', msg:'Variedad que el cuerpo agradece.' },
    { emoji:'🫒', title:'¡Grasas de calidad!', msg:'No todas las grasas son iguales, elegiste bien.' },
  ],
  training: [
    { emoji:'💪', title:'¡Serie completada!', msg:'Cada rep es un ladrillo en tu versión mejorada.' },
    { emoji:'🔥', title:'¡Sin parar!', msg:'La intensidad que pusiste hoy se nota mañana.' },
    { emoji:'⚡', title:'¡Fuerza activada!', msg:'El cuerpo recibió la señal. Ahora crece.' },
    { emoji:'🏆', title:'¡Eso es dedicación!', msg:'No mucha gente hace lo que vos estás haciendo.' },
    { emoji:'📈', title:'¡Progreso real!', msg:'Más peso, más reps, más vos.' },
    { emoji:'🦾', title:'¡Cuerpo adaptándose!', msg:'Cada serie lo hace más fuerte.' },
    { emoji:'🏋️', title:'¡Fuerza que se nota!', msg:'El músculo no miente.' },
    { emoji:'💥', title:'¡Límite empujado!', msg:'Ahí donde duele es donde crece.' },
    { emoji:'🎯', title:'¡Puntería en cada rep!', msg:'Técnica + esfuerzo = resultado.' },
    { emoji:'🧱', title:'¡Ladrillo a ladrillo!', msg:'Así se construye algo grande.' },
    { emoji:'🌊', title:'¡Marea imparable!', msg:'Una vez que arrancás, nada te para.' },
    { emoji:'🏅', title:'¡Récord en proceso!', msg:'El PR de hoy es el calentamiento del próximo.' },
    { emoji:'🧠', title:'¡Mente y músculo!', msg:'Los dos entrenaron hoy. Los dos crecen.' },
    { emoji:'🚀', title:'¡Modo bestia!', msg:'No había dudas de que lo ibas a hacer.' },
    { emoji:'💎', title:'¡Diamante a presión!', msg:'La presión crea diamantes. Seguí apretando.' },
    { emoji:'🏄', title:'¡Surfeando el esfuerzo!', msg:'Encontraste el ritmo. No lo sueltes.' },
    { emoji:'🦅', title:'¡Por encima de todo!', msg:'Vista al objetivo, alas desplegadas.' },
    { emoji:'🌋', title:'¡Erupción de potencia!', msg:'Lo que tenías adentro salió afuera.' },
    { emoji:'⚔️', title:'¡Batalla ganada!', msg:'Hoy ganó la disciplina.' },
    { emoji:'🎖️', title:'¡Medalla bien ganada!', msg:'No se regala. Se suda.' },
    { emoji:'🌅', title:'¡Mañana de campeones!', msg:'Arrancaste temprano. Ya ganaste.' },
    { emoji:'🦵', title:'¡Piernas que no mienten!', msg:'El trabajo de hoy camina con vos mañana.' },
    { emoji:'🥊', title:'¡Golpe al objetivo!', msg:'Directo y sin rodeos.' },
    { emoji:'🔋', title:'¡Batería recargada!', msg:'Paradójico pero real: el esfuerzo da energía.' },
    { emoji:'🧗', title:'¡Siempre para arriba!', msg:'Cada serie es un peldaño más.' },
    { emoji:'🐉', title:'¡Bestia desatada!', msg:'Hoy no hubo quien te pare.' },
    { emoji:'🎽', title:'¡Sudor que vale!', msg:'Lo que está en la remera es progreso líquido.' },
    { emoji:'🏁', title:'¡Meta en el horizonte!', msg:'Hoy te acercaste un paso más.' },
    { emoji:'🤸', title:'¡Movilidad y fuerza!', msg:'El cuerpo completo trabajando.' },
    { emoji:'💦', title:'¡Te lo ganaste!', msg:'Hidratate, lo merecés.' },
  ],
  habit: [
    { emoji:'💊', title:'¡Tomado!', msg:'Tu cuerpo recibe lo que le das. Dale lo mejor.' },
    { emoji:'⭐', title:'¡Constancia total!', msg:'Lo hacés aunque no tengas ganas. Eso es nivel otro.' },
    { emoji:'🎯', title:'¡Sin fallar!', msg:'El que no falla en los hábitos, no falla en la vida.' },
    { emoji:'🔑', title:'¡Clave del día!', msg:'Los hábitos pequeños hacen a las personas grandes.' },
    { emoji:'🌱', title:'¡Creciendo por dentro!', msg:'Lo que sembrás hoy, lo cosechás en semanas.' },
    { emoji:'🛡️', title:'¡Cuerpo blindado!', msg:'Cada hábito cumplido es una capa de protección.' },
    { emoji:'🔄', title:'¡Rutina sólida!', msg:'La consistencia es la herramienta más poderosa.' },
    { emoji:'⏰', title:'¡A tiempo!', msg:'El que llega antes que el olvido, gana.' },
    { emoji:'🌞', title:'¡Día activado!', msg:'Arrancar bien es la mitad del éxito.' },
    { emoji:'💫', title:'¡Hábito brillante!', msg:'No se ve en el espejo todavía, pero está pasando.' },
    { emoji:'🎗️', title:'¡Compromiso cumplido!', msg:'Le prometiste a tu versión futura. Cumpliste.' },
    { emoji:'🏅', title:'¡Otro día ganado!', msg:'Suma uno más a la racha.' },
    { emoji:'🌙', title:'¡Protocolo nocturno!', msg:'Cerrar el día bien es abrirlo mejor mañana.' },
    { emoji:'☀️', title:'¡Protocolo matutino!', msg:'Las mañanas de campeones se construyen así.' },
    { emoji:'🦁', title:'¡Disciplina de rey!', msg:'Los leones no explican su ambición.' },
    { emoji:'❤️', title:'¡Amor propio en acción!', msg:'Cuidarte no es egoísmo, es inteligencia.' },
    { emoji:'🌿', title:'¡Natural y constante!', msg:'Sin drama, sin excusas, sin pausas.' },
    { emoji:'🔋', title:'¡Cargado!', msg:'Le diste al cuerpo lo que necesitaba.' },
    { emoji:'🧩', title:'¡Pieza en su lugar!', msg:'Cada hábito es parte de un cuadro más grande.' },
    { emoji:'🎖️', title:'¡Medalla diaria!', msg:'Nadie la ve, pero vos sabés que la ganaste.' },
    { emoji:'🚀', title:'¡Lanzado al éxito!', msg:'No hay cohete que llegue sin combustible.' },
    { emoji:'💎', title:'¡Brilla por dentro!', msg:'Los cambios más importantes no se ven de afuera.' },
    { emoji:'🌊', title:'¡Flujo continuo!', msg:'Una ola no para. Vos tampoco.' },
    { emoji:'🎵', title:'¡Ritmo que no falla!', msg:'Cuando el hábito suena bien, el cuerpo baila.' },
    { emoji:'🧠', title:'¡Mente entrenada!', msg:'Acordarte de esto también es entrenamiento.' },
    { emoji:'🌈', title:'¡Salud con color!', msg:'Cada hábito pinta un día mejor.' },
    { emoji:'🦋', title:'¡Transformación activa!', msg:'No se ve de un día para el otro. Pero está pasando.' },
    { emoji:'🏄', title:'¡Surfeando la constancia!', msg:'No todas las olas son perfectas. Igual surfeás.' },
    { emoji:'⚡', title:'¡Energía activada!', msg:'Le dijiste sí al hábito. El hábito te dice gracias.' },
    { emoji:'🎪', title:'¡Show de disciplina!', msg:'Todos los días, sin público, sin aplausos. Solo vos.' },
  ],
};



// ─── Motor de selección secuencial anti-repetición ───────────────
// ─── Motor de selección secuencial anti-repetición ───────────────
// Usa una baraja shuffleada por tipo. Cuando se agota, se reshufflea.
// GARANTÍA: nunca repite hasta haber mostrado todos los del pool.
var _feedbackDeck = {};

function _drawFeedback(type) {
  var pool = _FEEDBACK_POOLS[type];
  if (!pool || !pool.length) return null;
  if (!_feedbackDeck[type] || _feedbackDeck[type].length === 0) {
    // Construir índices y shufflear
    var deck = [];
    for (var i = 0; i < pool.length; i++) deck.push(i);
    // Fisher-Yates
    for (var j = deck.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = deck[j]; deck[j] = deck[k]; deck[k] = tmp;
    }
    // Si hay un último mostrado, asegurarse que el primero de la nueva baraja no sea el mismo
    if (_feedbackDeck[type + '_last'] !== undefined && deck[0] === _feedbackDeck[type + '_last'] && deck.length > 1) {
      var swap = deck[0]; deck[0] = deck[1]; deck[1] = swap;
    }
    _feedbackDeck[type] = deck;
  }
  var idx = _feedbackDeck[type].shift();
  _feedbackDeck[type + '_last'] = idx;
  return pool[idx];
}
function showActionFeedback(type, pts) {
  // Nunca mostrar en tab HOY
  var homePage = document.getElementById('page-home');
  if (homePage && homePage.classList.contains('active')) return;

  var t = _FEEDBACK_POOLS[type] ? type : 'habit';
  var pair = _drawFeedback(t);
  if (!pair) return;

  // Extraer emoji del label (primer char si es emoji) y texto separado
// pair es ahora { emoji, title, msg }
  var emojiEl = document.getElementById('celebEmoji');
  var titleEl = document.getElementById('celebTitle');
  var msgEl   = document.getElementById('celebMsg');
  var modal   = document.getElementById('celebrationModal');
  if (!emojiEl || !titleEl || !msgEl || !modal) return;

  emojiEl.textContent = pair.emoji;
  titleEl.textContent = pair.title;
  msgEl.textContent   = pair.msg;

  // NO spawnear confetti para feedback de hábito — reservar para PRs y logros grandes
// Confetti ocasional: 30% de probabilidad
  if (Math.random() < 0.1) _spawnConfetti();
  modal.classList.add('show');
  // Auto-cerrar después de 1.8s
  if (modal._autoClose) clearTimeout(modal._autoClose);
  modal._autoClose = setTimeout(function() {
    modal.classList.remove('show');
    modal._autoClose = null;
  }, 1800);
}