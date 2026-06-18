var _tutorialActive=false,_tutorialStep=0,_tutorialSteps=[],_tutorialPage='';
var TUTORIAL_STEPS={
  'home':[
    {targetQuery:'.day-score-circle',title:'⭐ Tu Score del Día',text:'Este número va de 0 a 100 y resume qué tan bien estás cumpliendo tus objetivos hoy — comida, entreno, sueño y agua.'},
    {targetQuery:'.day-metrics',title:'🍽 Tus Métricas',text:'Estas tarjetas muestran tu progreso en tiempo real. Tocá cualquiera para ir directo a esa sección.'},
    {targetQuery:'.tabs',title:'🗂 Las Pestañas',text:'Desde acá navegás entre Nutrición, Entreno, Recuperación y Progreso. Cada una tiene su propio tutorial.'},
    {targetId:'dayPrediction',title:'🔮 Score Predictivo',text:'Basado en lo que ya registraste hoy, FitTrack predice cómo vas a cerrar el día. Te ayuda a ajustar comida o entreno antes de que sea tarde.'}
  ],
  'nutricion':[
    {targetId:'nutricionSubtabs',title:'🗂 Secciones de Nutrición',text:'Tenés tres vistas: Comida para registrar lo que comés, Balance Kcal para ver tu déficit o superávit, y Plan para ver tu menú semanal.'},
    {targetId:'page-macros',title:'🔢 Tus Macros del Día',text:'Acá ves tus proteínas, carbohidratos y grasas consumidas vs tu objetivo. Las barras se llenan a medida que cargás comidas.'},
    {targetQuery:'button[onclick="openAIChat()"]',title:'✨ Cargar con IA',text:'Describí lo que comiste en texto natural y la IA calcula los macros automáticamente. También podés cargar manual o escanear un código de barras.'},{targetQuery:'button[onclick="openFoodSuggest()"]',title:'🥗 Sugerencias',text:'FitTrack te sugiere comidas que se adaptan exactamente a tus macros restantes del día para que llegues a tu objetivo.'}
  ],
  'training':[
    {targetId:'page-training',title:'💪 Tu Semana de Entreno',text:'Acá ves tu rutina semanal con todos los días de la semana. Tocá cualquier día para ver o registrar tu entrenamiento.'},
    {targetId:'trainingWeekStrip',title:'📅 Calendario Semanal',text:'Estos botones muestran cada día de la semana. Los días completados se marcan automáticamente. Tocá cualquiera para ver el detalle.'},
    {targetId:'trainingActionsBar',title:'🤖 Generá tu Rutina con IA',text:'FitTrack puede generarte una rutina personalizada en segundos. Solo decile tu nivel, equipamiento disponible y objetivo.'}
  ],
  'recuperacion':[
    {targetId:'recuperacionSubtabs',title:'😴 Sueño, Suplementos y Agua',text:'Tenés tres secciones: Sueño para registrar tus horas de descanso, Suplementos para marcar lo que tomaste, y Agua para controlar tu hidratación diaria.'}
  ],
  'recuperacion-sueno':[
    {targetId:'recuperacionSubtabs',title:'😴 Las Secciones',text:'Tenés Sueño, Suplementos y Agua. Cada una tiene su propio registro — tocá cualquier pestaña para cambiar de sección.'},
    {targetId:'rec_manualSleepCard',title:'✏️ Registrá tu Sueño',text:'Si no tenés wearable, cargá tus horas de sueño manualmente acá. Si tenés Oura o Garmin conectado, se sincroniza automáticamente.'},
    {targetId:'rec_sleepWearableCard',title:'⌚ Conectá tu Wearable',text:'Con Oura o Fitbit conectado, FitTrack sincroniza automáticamente tus horas de sueño, eficiencia y HRV. Sin cargar nada manualmente.'}
  ],
  'recuperacion-suplementos':[
    {targetId:'suppStatusCard',title:'💊 Tus Suplementos',text:'Acá ves cuántos suplementos tomaste hoy. Tocá cada uno para marcarlo como tomado. Con el botón Editar podés agregar o quitar suplementos de tu lista.'}
  ],
  'recuperacion-agua':[
    {targetId:'rec_waterCard',title:'💧 Registrá tu Agua',text:'Sumá agua con un toque. Elegí vaso chico (150ml), vaso normal (250ml), vaso grande (350ml) o botella (500ml). FitTrack trackea tu progreso hacia el objetivo diario.'}
  ],
  'progreso-calendario':[
    {targetId:'cal_calStreakBadge',title:'🔥 Tu Racha',text:'Muestra cuántos días consecutivos cerraste con un score de 85% o más. Mantenerla activa es la mejor señal de consistencia real.'},
    {targetId:'cal_calGrid',title:'📅 Calendario Mensual',text:'Cada día se colorea según tu score: verde para días excelentes (≥85%), amarillo para regular (60–84%) y rojo para días bajos. Los días sin datos quedan en gris.'},
    {targetId:'cal_calMonthLabel',title:'◀ ▶ Navegá el historial',text:'Usá las flechas para moverte entre meses y ver tu consistencia en el tiempo. Cuanto más verde, mejor fue ese período.'}
  ],
  'nutricion-balance':[{targetId:'page-kcal',title:'🔥 Balance Calórico',text:'Acá ves cuántas calorías consumiste vs tu objetivo. El número grande muestra cuántas te faltan o te sobraron para llegar a tu meta.'},{targetId:'kcalWearableCardBalance',title:'⌚ Conectá tu Wearable',text:'Con un wearable como Oura o Garmin, FitTrack usa tu gasto calórico real del día en lugar de una estimación. La diferencia puede ser de 200-500 kcal.'}],
  'progreso':[
    {targetId:'subtab-prog-metricas',title:'📈 Tu Progreso',text:'Tenés dos vistas: Métricas para registrar tu peso y composición corporal, y Calendario para ver tu consistencia mes a mes.'},
    {targetId:'subtab-prog-calendario',title:'📅 Calendario',text:'Vista mensual de tu consistencia. Cada día se colorea según tu score — verde excelente, amarillo regular, rojo bajo. Tu racha de días seguidos aparece arriba.'},
    {targetId:'progreso_weightProgressCard',title:'⚖️ Tu Peso y Barra de Progreso',text:'Acá ves tu peso actual vs tu meta con una barra de progreso. Registrá tu peso cada mañana para trackear tu evolución.'},
    {targetId:'progreso_unifiedChartWrap',title:'📊 Gráfico de Evolución',text:'Este gráfico muestra tu tendencia de peso en el tiempo. Cuantos más datos registrés, más precisa es la curva.'}
  ]
};
var _pageToTutorialKey={'home':'home','nutricion':'nutricion','training':'training','recuperacion':'recuperacion','recuperacion-sueno':'recuperacion-sueno','recuperacion-suplementos':'recuperacion-suplementos','recuperacion-agua':'recuperacion-agua','progreso':'progreso','nutricion-balance':'nutricion-balance','progreso-calendario':'progreso-calendario'};

function initTutorialSystem(){
  var s=document.createElement('style');
  s.textContent='#tutorialOverlay{position:fixed;inset:0;z-index:9000;pointer-events:none}#tutorialHighlight{position:fixed;border-radius:14px;box-shadow:0 0 0 4px var(--accent),0 0 0 9999px rgba(0,0,0,0.78);transition:all 0.3s ease;pointer-events:none;z-index:9001}#tutorialCard{position:fixed;background:var(--bg3);border:1px solid var(--accent);border-radius:16px;padding:16px;max-width:320px;width:calc(100vw - 32px);left:50%;transform:translateX(-50%);pointer-events:all;z-index:9002;box-shadow:0 8px 32px rgba(0,0,0,0.5);animation:tutCardIn 0.25s ease}@keyframes tutCardIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}.tut-title{font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px}.tut-text{font-size:13px;color:var(--text2);line-height:1.5;margin-bottom:14px}.tut-footer{display:flex;align-items:center;justify-content:space-between;gap:8px}.tut-dots{display:flex;gap:5px;align-items:center}.tut-dot{width:6px;height:6px;border-radius:50%;background:var(--border);transition:all 0.2s}.tut-dot.active{background:var(--accent);width:18px;border-radius:3px}.tut-dot.done{background:var(--green)}.tut-btn-next{background:var(--accent);color:#fff;border:none;border-radius:10px;padding:8px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit}.tut-btn-skip{background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;font-family:inherit;text-decoration:underline;padding:4px}#tutProgressBar{position:fixed;top:0;left:0;right:0;height:3px;background:var(--bg4);z-index:9003;pointer-events:none}#tutProgressFill{height:100%;background:var(--accent);transition:width 0.3s ease;border-radius:0 2px 2px 0}';
  document.head.appendChild(s);
  var el=document.createElement('div');
  el.id='tutorialOverlay';
  el.style.display='none';
  el.innerHTML='<div id="tutProgressBar"><div id="tutProgressFill"></div></div><div id="tutorialHighlight"></div><div id="tutorialCard"><div class="tut-title" id="tutTitle"></div><div class="tut-text" id="tutText"></div><div class="tut-footer"><div class="tut-dots" id="tutDots"></div><div style="display:flex;gap:8px;align-items:center"><button class="tut-btn-skip" onclick="skipTutorial()">Saltar</button><button class="tut-btn-next" id="tutBtnNext" onclick="tutorialNext()">Siguiente →</button></div></div></div>';
  document.body.appendChild(el);
}

function _getEl(step){
  if(step.targetQuery) return document.querySelector(step.targetQuery);
  if(step.targetId) return document.getElementById(step.targetId);
  return null;
}

function _positionHighlight(el){
  var highlight=document.getElementById('tutorialHighlight');
  var card=document.getElementById('tutorialCard');
  if(!el){highlight.style.display='none';card.style.top='50%';card.style.bottom='auto';card.style.transform='translateX(-50%) translateY(-50%)';return;}
  var rect=el.getBoundingClientRect(),pad=6;
  highlight.style.display='block';
  highlight.style.top=(rect.top-pad)+'px';
  highlight.style.left=(rect.left-pad)+'px';
  highlight.style.width=(rect.width+pad*2)+'px';
  highlight.style.height=(rect.height+pad*2)+'px';
  var sb=window.innerHeight-rect.bottom,sa=rect.top;
  card.style.transform='translateX(-50%)';
  if(sb>=160||sb>sa){card.style.top=Math.min(rect.bottom+16,window.innerHeight-180)+'px';card.style.bottom='auto';}
  else{card.style.bottom=(window.innerHeight-rect.top+16)+'px';card.style.top='auto';}
}

function startTutorial(k){
  var steps=TUTORIAL_STEPS[k];
  if(!steps||!steps.length)return;
  _tutorialActive=true;_tutorialPage=k;_tutorialSteps=steps;_tutorialStep=0;
  document.getElementById('tutorialOverlay').style.display='block';
  var _sc=document.querySelector('.content');if(_sc){_sc.style.overflow='hidden';_sc.scrollTop=0;}
  _renderTutorialStep();
}

function _renderTutorialStep(retry){
  retry=retry||0;
  var step=_tutorialSteps[_tutorialStep];
  var el=_getEl(step);
  if(step.targetId && !el && retry<15){
    setTimeout(function(){_renderTutorialStep(retry+1);},150);
    return;
  }
  var total=_tutorialSteps.length;
  document.getElementById('tutTitle').textContent=step.title;
  document.getElementById('tutText').textContent=step.text;
  document.getElementById('tutBtnNext').textContent=_tutorialStep===total-1?'¡Listo! ✓':'Siguiente →';
  document.getElementById('tutDots').innerHTML=_tutorialSteps.map(function(_,i){return'<div class="tut-dot '+(i<_tutorialStep?'done':i===_tutorialStep?'active':'')+'"></div>';}).join('');
  document.getElementById('tutProgressFill').style.width=(((_tutorialStep+1)/total)*100)+'%';
  if(el){
    var _sc=document.querySelector('.content');
    var _stepId=(_tutorialSteps[_tutorialStep]||{}).targetId||'';
    var _needsScroll=_stepId.indexOf('progreso_')===0||_stepId==='dayPrediction'||_stepId==='kcalWearableCardBalance'||_stepId==='trainingWeekStrip'||_stepId==='trainingActionsBar'||_stepId==='rec_waterCard'||_stepId==='rec_sleepWearableCard';
    if(_sc&&_sc.contains(el)&&_needsScroll){
      var scRect=_sc.getBoundingClientRect();
      var elRect=el.getBoundingClientRect();
      var elOffsetInSc=(elRect.top-scRect.top)+_sc.scrollTop;
      var targetScroll=elOffsetInSc-(window.innerHeight*0.35);
      _sc.scrollTo({top:Math.max(0,targetScroll),behavior:'smooth'});
      setTimeout(function(){_positionHighlight(el);},350);
      return;
    }
  }
  _positionHighlight(el);
}

function tutorialNext(){
  if(_tutorialStep<_tutorialSteps.length-1){_tutorialStep++;_renderTutorialStep();}
  else{_closeTutorial(true);}
}
function skipTutorial(){var _sc=document.querySelector('.content');if(_sc)_sc.style.overflow='';_closeTutorial(false);}
function _closeTutorial(completed){
  _tutorialActive=false;
  document.getElementById('tutorialOverlay').style.display='none';
  var _sc=document.querySelector('.content');if(_sc)_sc.style.overflow='';
  if(completed){var seen=JSON.parse(localStorage.getItem('fittrack_tutorial_seen')||'{}');seen[_tutorialPage]=true;localStorage.setItem('fittrack_tutorial_seen',JSON.stringify(seen));
  }
}
function checkAndStartTutorial(pageKey){
  var key=_pageToTutorialKey[pageKey];if(!key)return;
  var seen=JSON.parse(localStorage.getItem('fittrack_tutorial_seen')||'{}');
  if(!seen[key]){setTimeout(function(){startTutorial(key);},600);}
}
function reopenTutorial(pageKey){startTutorial(_pageToTutorialKey[pageKey]||pageKey);}
document.addEventListener('DOMContentLoaded',function(){initTutorialSystem();});
