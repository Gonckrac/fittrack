// ─── AI ROUTINE GENERATOR v3.0 ───────────────────────────────────────────────
// Basado en: Schoenfeld (2010, 2016, 2021), Krieger (2010), Helms et al. (2014),
// Israetel et al. (Renaissance Periodization), Grgic et al. (2018, 2019),
// Ratamess 2009, Morton 2016, Colquhoun 2018
// ─────────────────────────────────────────────────────────────────────────────

const BM_MUSCLES = [
  { id: 'chest',      label: 'Pecho',           emoji: '🫁', group: 'upper', role: 'push'  },
  { id: 'back',       label: 'Espalda',          emoji: '🏋️', group: 'upper', role: 'pull'  },
  { id: 'shoulders',  label: 'Hombros',          emoji: '🔷', group: 'upper', role: 'push'  },
  { id: 'biceps',     label: 'Bíceps',           emoji: '💪', group: 'upper', role: 'pull'  },
  { id: 'triceps',    label: 'Tríceps',          emoji: '〽️', group: 'upper', role: 'push'  },
  { id: 'abs',        label: 'Abdominales',      emoji: '⬡',  group: 'core',  role: 'core'  },
  { id: 'forearms',   label: 'Antebrazos',       emoji: '🦾', group: 'upper', role: 'pull'  },
  { id: 'glutes',     label: 'Glúteos',          emoji: '🍑', group: 'lower', role: 'lower' },
  { id: 'quads',      label: 'Cuádriceps',       emoji: '🦵', group: 'lower', role: 'lower' },
  { id: 'hamstrings', label: 'Isquiotibiales',   emoji: '🔩', group: 'lower', role: 'lower' },
  { id: 'calves',     label: 'Pantorrillas',     emoji: '🦶', group: 'lower', role: 'lower' },
  { id: 'traps',      label: 'Trapecios',        emoji: '🏔️', group: 'upper', role: 'pull'  },
];

// MEV=Minimum Effective Volume | MAV=Maximum Adaptive Volume | MRV=Max Recoverable Volume
const VOLUME_TARGETS = {
  chest:      { mev: 8,  mav: 16, mrv: 22 },
  back:       { mev: 10, mav: 18, mrv: 25 },
  shoulders:  { mev: 6,  mav: 16, mrv: 22 },
  biceps:     { mev: 6,  mav: 14, mrv: 20 },
  triceps:    { mev: 6,  mav: 14, mrv: 20 },
  abs:        { mev: 6,  mav: 16, mrv: 25 },
  forearms:   { mev: 4,  mav: 10, mrv: 16 },
  glutes:     { mev: 6,  mav: 16, mrv: 22 },
  quads:      { mev: 8,  mav: 16, mrv: 22 },
  hamstrings: { mev: 6,  mav: 12, mrv: 20 },
  calves:     { mev: 6,  mav: 16, mrv: 24 },
  traps:      { mev: 4,  mav: 12, mrv: 18 },
};

const REP_ZONES = {
  strength:    { compound: '3-5',   isolation: '6-8',   desc: 'Fuerza máxima' },
  hypertrophy: { compound: '6-10',  isolation: '10-15', desc: 'Hipertrofia' },
  endurance:   { compound: '10-15', isolation: '15-25', desc: 'Resistencia muscular' },
};

const REST_TIMES = {
  compound_strength:    { seconds: 180, label: '3 min' },
  compound_hypertrophy: { seconds: 150, label: '2.5 min' },
  compound_endurance:   { seconds: 90,  label: '90 seg' },
  isolation_hypertrophy:{ seconds: 90,  label: '90 seg' },
  isolation_strength:   { seconds: 120, label: '2 min'  },
  isolation_endurance:  { seconds: 60,  label: '60 seg' },
  core:                 { seconds: 60,  label: '60 seg' },
};

// Tiempo de ejecución por set en segundos (setup + trabajo real)
const SET_EXEC_TIME = {
  compound_strength:    90,
  compound_hypertrophy: 75,
  compound_endurance:   55,
  isolation_hypertrophy:45,
  isolation_strength:   50,
  isolation_endurance:  40,
  core:                 35,
};

// ─────────────────────────────────────────────────────────────────────────────
// Fix #4: Volumen semanal adaptado a nivel + edad del usuario
// Fix #6: Capacidad de sesión realista basada en tiempo disponible
// ─────────────────────────────────────────────────────────────────────────────

// Volumen semanal objetivo por músculo según nivel (series totales)
// Beginner: 6-10 | Intermediate: 10-16 | Advanced: 12-20
const WEEKLY_VOLUME_BY_LEVEL = {
  beginner:     { min: 6,  max: 10, setsPerSession: { compound: 2, isolation: 2 } },
  intermediate: { min: 10, max: 16, setsPerSession: { compound: 3, isolation: 3 } },
  advanced:     { min: 12, max: 20, setsPerSession: { compound: 4, isolation: 3 } },
};

// Factor de reducción de volumen por edad (por encima de 35 años)
function _airAgeVolumeFactor(age) {
  if (!age || age <= 35) return 1.0;
  if (age <= 45) return 0.85;
  if (age <= 55) return 0.72;
  if (age <= 65) return 0.60;
  return 0.50;
}

// Obtener edad del usuario desde el setup
function _airGetUserAge() {
  var ageEl = document.getElementById('cfgAge');
  return ageEl ? parseInt(ageEl.value) || 0 : 0;
}

// Fix #6: Calcular cuántos ejercicios caben REALMENTE en el tiempo disponible
// En vez de usar sets fijos, escalamos para llenar el tiempo
function _airGetAdaptedSetsConfig() {
  var base = WEEKLY_VOLUME_BY_LEVEL[_airLevel] || WEEKLY_VOLUME_BY_LEVEL.intermediate;
  var age = _airGetUserAge();
  var ageFactor = _airAgeVolumeFactor(age);

  // Sets por ejercicio ajustados a edad
  var compSets = Math.max(2, Math.round(base.setsPerSession.compound * ageFactor));
  var isoSets  = Math.max(2, Math.round(base.setsPerSession.isolation * ageFactor));

  return { compound: compSets, isolation: isoSets };
}

// Calcular cuántos ejercicios (compound+isolation pares) caben en timeMinutes
function _airCalcMaxExercisesForTime(timeMinutes) {
  var restKey = 'compound_' + _airGoal;
  var isoKey  = 'isolation_' + _airGoal;
  var compExec = SET_EXEC_TIME[restKey] || 75;
  var isoExec  = SET_EXEC_TIME[isoKey]  || 45;
  var compRest = REST_TIMES[restKey] ? REST_TIMES[restKey].seconds : 150;
  var isoRest  = REST_TIMES[isoKey]  ? REST_TIMES[isoKey].seconds  : 90;
  var setsConfig = _airGetAdaptedSetsConfig();
  var WARMUP = 8, COOLDOWN = 3, TRANSITION = 0.75; // min por ejercicio

  // Tiempo por par compound+isolation
  var compTimeMins = ((compExec + compRest) * setsConfig.compound - compRest) / 60;
  var isoTimeMins  = ((isoExec  + isoRest)  * setsConfig.isolation  - isoRest)  / 60;
  var pairTime = compTimeMins + isoTimeMins + TRANSITION * 2;

  var budget = timeMinutes - WARMUP - COOLDOWN;
  var maxPairs = Math.max(1, Math.floor(budget / pairTime));
  return maxPairs; // cada par = 1 músculo bien trabajado
}

// ── EXERCISE DATABASE ─────────────────────────────────────────────────────────
const EXERCISE_DB = {
  gym: {
    chest: [
      { name: 'Press de banca plano con barra',    type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1, notes: 'Gold-standard para pecho esternal' },
      { name: 'Press inclinado con mancuernas',    type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2, notes: 'Activa la porción clavicular del pectoral' },
      { name: 'Press en máquina (Chest Press)',    type: 'compound',  rest: 'compound_hypertrophy', rir: 1, priority: 3 },
      { name: 'Aperturas cable bajo (crossover)',  type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 4, notes: 'Máximo estiramiento del pectoral' },
      { name: 'Aperturas en máquina (pec deck)',   type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 5 },
      { name: 'Fondos en paralelas (pecho)',       type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 6 },
      { name: 'Press banca declinado con barra',   type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 7 },
      { name: 'Aperturas inclinadas con cable',    type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 8 },
    ],
    back: [
      { name: 'Dominadas agarre pronado',          type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1, notes: 'Máximo reclutamiento del dorsal ancho' },
      { name: 'Remo con barra (Barbell Row)',       type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Jalón al pecho en polea alta',      type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Remo mancuerna unilateral',         type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 4 },
      { name: 'Remo en máquina sentado',           type: 'compound',  rest: 'compound_hypertrophy', rir: 1, priority: 5 },
      { name: 'Peso muerto convencional',          type: 'compound',  rest: 'compound_strength',    rir: 3, priority: 6, notes: 'Máximo reclutamiento neuromuscular' },
      { name: 'Face pull con cuerda',              type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 7, notes: 'Salud del manguito rotador' },
      { name: 'Pullover con polea alta',           type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 8 },
    ],
    shoulders: [
      { name: 'Press militar con barra (parado)',  type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Press Arnold con mancuernas',       type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Elevaciones laterales mancuerna',   type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 3, notes: 'Clave para deltoides medio' },
      { name: 'Elevaciones laterales en cable',    type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 4 },
      { name: 'Pájaros (rear delt fly)',           type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 5 },
      { name: 'Face pull con cuerda',              type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 6 },
      { name: 'Upright row agarre ancho',          type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 7 },
    ],
    biceps: [
      { name: 'Curl con barra recta',              type: 'isolation', rest: 'isolation_hypertrophy', rir: 2, priority: 1 },
      { name: 'Curl con mancuernas alternado',     type: 'isolation', rest: 'isolation_hypertrophy', rir: 2, priority: 2 },
      { name: 'Curl martillo (hammer curl)',        type: 'isolation', rest: 'isolation_hypertrophy', rir: 2, priority: 3 },
      { name: 'Curl en polea baja (cable curl)',   type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 4 },
      { name: 'Curl en banco inclinado',           type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 5 },
      { name: 'Curl spider (banco predicador)',    type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 6 },
    ],
    triceps: [
      { name: 'Press francés con barra EZ',        type: 'isolation', rest: 'isolation_hypertrophy', rir: 2, priority: 1, notes: 'Elongación máxima de la cabeza larga' },
      { name: 'Extensión tríceps en polea alta',   type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 2 },
      { name: 'Extensión overhead con cable',      type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 3 },
      { name: 'Fondos en paralelas (tríceps)',     type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 4 },
      { name: 'Press cerrado (close grip bench)',  type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 5 },
      { name: 'Skull crusher con mancuernas',      type: 'isolation', rest: 'isolation_hypertrophy', rir: 2, priority: 6 },
    ],
    abs: [
      { name: 'Crunch en polea (cable crunch)',    type: 'isolation', rest: 'core', rir: 1, priority: 1, notes: 'Resistencia progresiva = hipertrofia abdominal' },
      { name: 'Elevación de piernas colgado',      type: 'isolation', rest: 'core', rir: 2, priority: 2 },
      { name: 'Ab wheel (rueda abdominal)',         type: 'isolation', rest: 'core', rir: 2, priority: 3 },
      { name: 'Dragon flag (negativa)',             type: 'isolation', rest: 'core', rir: 2, priority: 4 },
      { name: 'Russian twist con disco',           type: 'isolation', rest: 'core', rir: 1, priority: 5 },
      { name: 'Crunch inverso en banco',           type: 'isolation', rest: 'core', rir: 1, priority: 6 },
    ],
    forearms: [
      { name: 'Curl de muñeca con barra',          type: 'isolation', rest: 'isolation_endurance', rir: 1, priority: 1 },
      { name: 'Reverse curl con barra EZ',         type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 2 },
      { name: 'Farmer carry (marcha del granjero)', type: 'compound', rest: 'isolation_hypertrophy', rir: 0, priority: 3 },
      { name: 'Extensión de muñeca',               type: 'isolation', rest: 'isolation_endurance', rir: 1, priority: 4 },
    ],
    glutes: [
      { name: 'Hip thrust con barra',              type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1, notes: 'Máxima activación EMG de glúteo mayor' },
      { name: 'Sentadilla trasera libre',          type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Peso muerto rumano (RDL)',           type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Bulgarian split squat',             type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 4 },
      { name: 'Patada glúteo en polea baja',       type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 5 },
      { name: 'Abducción de cadera en máquina',    type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 6 },
    ],
    quads: [
      { name: 'Sentadilla libre con barra',        type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Prensa de piernas 45°',             type: 'compound',  rest: 'compound_hypertrophy', rir: 1, priority: 2 },
      { name: 'Extensión cuádriceps en máquina',   type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 3 },
      { name: 'Hack squat en máquina',             type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 4 },
      { name: 'Lunge caminando con mancuernas',    type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 5 },
    ],
    hamstrings: [
      { name: 'Curl femoral acostado en máquina',  type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 1, notes: 'Mayor señal hipertrófica en posición elongada' },
      { name: 'Peso muerto rumano (RDL)',           type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Curl nórdico (Nordic hamstring)',   type: 'isolation', rest: 'compound_hypertrophy', rir: 3, priority: 3 },
      { name: 'Curl femoral sentado en máquina',   type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 4 },
      { name: 'Good morning con barra',            type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 5 },
    ],
    calves: [
      { name: 'Elevación de talones de pie (barra)',type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 1 },
      { name: 'Elevación de talones sentado',      type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 2 },
      { name: 'Elevación en prensa de piernas',    type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 3 },
    ],
    traps: [
      { name: 'Encogimientos con barra',           type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 1 },
      { name: 'Encogimientos con mancuernas',      type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 2 },
      { name: 'Face pull con cuerda',              type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 3 },
    ],
  },
  home: {
    chest: [
      { name: 'Flexiones archer (unilateral)',     type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Flexiones con pies elevados',       type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Press con mancuernas en suelo',     type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Flexiones diamante',                type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 4 },
      { name: 'Aperturas con mancuernas en suelo', type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 5 },
    ],
    back: [
      { name: 'Remo mancuerna unilateral',         type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Peso muerto con mancuernas',        type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Remo invertido (bajo mesa)',        type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Pullover con mancuerna',            type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 4 },
      { name: 'Superman (extensión espalda)',       type: 'isolation', rest: 'core', rir: 1, priority: 5 },
    ],
    shoulders: [
      { name: 'Press militar con mancuernas',      type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Elevaciones laterales mancuerna',   type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 2 },
      { name: 'Pájaros con mancuernas',            type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 3 },
      { name: 'Pike push-up',                      type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 4 },
      { name: 'Press Arnold con mancuernas',       type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 5 },
    ],
    biceps: [
      { name: 'Curl con mancuernas alternado',     type: 'isolation', rest: 'isolation_hypertrophy', rir: 2, priority: 1 },
      { name: 'Curl martillo con mancuernas',      type: 'isolation', rest: 'isolation_hypertrophy', rir: 2, priority: 2 },
      { name: 'Curl concentrado con mancuerna',    type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 3 },
      { name: 'Curl en banco inclinado',           type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 4 },
    ],
    triceps: [
      { name: 'Extensión tríceps overhead mancuerna', type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 1 },
      { name: 'Fondos en silla',                   type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Press cerrado en suelo',            type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Kickback con banda elástica',       type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 4 },
    ],
    abs: [
      { name: 'Crunch bicicleta',                  type: 'isolation', rest: 'core', rir: 1, priority: 1 },
      { name: 'Plancha con variaciones',           type: 'isolation', rest: 'core', rir: 0, priority: 2 },
      { name: 'Elevación de piernas en suelo',     type: 'isolation', rest: 'core', rir: 1, priority: 3 },
      { name: 'Russian twist con mancuerna',       type: 'isolation', rest: 'core', rir: 1, priority: 4 },
      { name: 'Mountain climbers',                 type: 'isolation', rest: 'core', rir: 1, priority: 5 },
    ],
    forearms: [
      { name: 'Curl de muñeca con mancuerna',      type: 'isolation', rest: 'isolation_endurance', rir: 1, priority: 1 },
      { name: 'Farmer carry con mancuernas',       type: 'compound',  rest: 'isolation_hypertrophy', rir: 0, priority: 2 },
      { name: 'Agarre isométrico con mancuerna',   type: 'isolation', rest: 'isolation_endurance', rir: 0, priority: 3 },
    ],
    glutes: [
      { name: 'Hip thrust con mancuerna',          type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Bulgarian split squat',             type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Sentadilla sumo con mancuerna',     type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Patada de glúteo con banda',        type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 4 },
    ],
    quads: [
      { name: 'Sentadilla con mancuernas',         type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Bulgarian split squat',             type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Lunge caminando con mancuernas',    type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Step-up con mancuernas',            type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 4 },
    ],
    hamstrings: [
      { name: 'Peso muerto rumano con mancuernas', type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Puente de glúteos en suelo',        type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Single leg deadlift con mancuerna', type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Good morning con mancuerna',        type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 4 },
    ],
    calves: [
      { name: 'Elevación de talones de pie',       type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 1 },
      { name: 'Elevación en escalón',              type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 2 },
      { name: 'Elevación unilateral',              type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 3 },
    ],
    traps: [
      { name: 'Encogimientos con mancuernas',      type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 1 },
    ],
  },
  calistenia: {
    chest: [
      { name: 'Flexiones archer (unilateral)',     type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Fondos en paralelas (pecho)',       type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Pseudo planche push-up',            type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Flexiones declinadas pies altos',   type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 4 },
      { name: 'Flexiones diamante',                type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 5 },
    ],
    back: [
      { name: 'Dominadas agarre pronado',          type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Australian pull-up (remo bajo)',    type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Dominadas agarre neutro',           type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Muscle-up negativo',                type: 'compound',  rest: 'compound_hypertrophy', rir: 3, priority: 4 },
      { name: 'Superman en suelo',                 type: 'isolation', rest: 'core', rir: 1, priority: 5 },
    ],
    shoulders: [
      { name: 'Handstand push-up asistido',        type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Pike push-up',                      type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Flexiones Y (Y push-up)',           type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 3 },
      { name: 'Band pull-apart',                   type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 4 },
    ],
    biceps: [
      { name: 'Chin-up (agarre supino)',           type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Australian chin-up supino',         type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Archer chin-up',                    type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Curl con toalla en barra',          type: 'isolation', rest: 'isolation_hypertrophy', rir: 2, priority: 4 },
    ],
    triceps: [
      { name: 'Fondos en paralelas',               type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Extensión de tríceps en suelo',     type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 2 },
      { name: 'Fondos en silla o escalón',         type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Flexiones diamante',                type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 4 },
    ],
    abs: [
      { name: 'L-sit en barras o suelo',           type: 'isolation', rest: 'core', rir: 0, priority: 1 },
      { name: 'Dragon flag (negativa)',             type: 'isolation', rest: 'core', rir: 2, priority: 2 },
      { name: 'Elevación de piernas colgado',      type: 'isolation', rest: 'core', rir: 2, priority: 3 },
      { name: 'Plancha con elevación de brazo',    type: 'isolation', rest: 'core', rir: 1, priority: 4 },
      { name: 'Crunch bicicleta',                  type: 'isolation', rest: 'core', rir: 1, priority: 5 },
    ],
    forearms: [
      { name: 'Dead hang en barra',                type: 'isolation', rest: 'isolation_endurance', rir: 0, priority: 1 },
      { name: 'Towel hang (toalla en barra)',      type: 'isolation', rest: 'isolation_endurance', rir: 0, priority: 2 },
      { name: 'Fingertip push-ups',                type: 'isolation', rest: 'isolation_endurance', rir: 1, priority: 3 },
    ],
    glutes: [
      { name: 'Hip thrust con peso corporal',      type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Bulgarian split squat',             type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Sentadilla profunda',               type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Patada de glúteo en cuadrupedia',   type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 4 },
    ],
    quads: [
      { name: 'Sentadilla pistol asistida',        type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 1 },
      { name: 'Bulgarian split squat',             type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Sentadilla con pausa',              type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
      { name: 'Lunge caminando',                   type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 4 },
    ],
    hamstrings: [
      { name: 'Nordic hamstring curl',             type: 'isolation', rest: 'compound_hypertrophy', rir: 3, priority: 1 },
      { name: 'Puente glúteo unilateral',          type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 2 },
      { name: 'Good morning sin peso',             type: 'compound',  rest: 'compound_hypertrophy', rir: 2, priority: 3 },
    ],
    calves: [
      { name: 'Elevación de talones de pie',       type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 1 },
      { name: 'Elevación unilateral en escalón',   type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 2 },
    ],
    traps: [
      { name: 'Encogimientos con banda',           type: 'isolation', rest: 'isolation_hypertrophy', rir: 1, priority: 1 },
    ],
  }
};

// ── WIZARD STATE ──────────────────────────────────────────────────────────────
var _airWizStep = 1;
var _airEquip = 'gym';
var _airLevel = 'intermediate';
var _airGoal = 'hypertrophy';
var _airDays = 4;
var _airTime = 60;
var _airSelected = new Set();
var _airFocusOption = null;       // enfoque elegido en step 5
var _airSchedule = {};
var _airGeneratedRoutine = null;
var _airVolumeMap = {};
var _airTimeWarningDismissed = false;
var _airActivities = [];
var _airActivityDays = {}; // { 'Correr': 2, 'Fútbol': 1 } — días/semana por actividad
var _airWantsCombine = false;
var _airScheduleOrder = []; // orden editable de días activos
const _AIR_STEPS = 8;
const _AIR_STEP_INFO = [
  { title: '¿Dónde entrenás?',             hint: 'El equipamiento disponible determina los ejercicios de tu rutina.' },
  { title: 'Nivel y objetivo',             hint: 'Tu nivel y meta ajustan series, reps y descansos.' },
  { title: 'Tu disponibilidad',            hint: 'Días de gym por semana y tiempo máximo por sesión. Las actividades extra las configurás en el siguiente paso.' },
{ title: 'Músculos a trabajar',          hint: 'Seleccioná todos los grupos musculares que querés incluir.' },
  { title: 'Enfoque de tu rutina',         hint: 'Elegí cómo distribuir tus días según tus prioridades.' },
  { title: '¿Sumás actividades a tu semana?', hint: 'Gym ya está incluido. Acá podés agregar deportes, cardio u otras actividades y elegir cuántos días por semana.' },
  { title: 'Calendario semanal',           hint: 'Confirmá qué días de la semana entrenás.' },
  { title: 'Tu rutina personalizada',      hint: 'Generado respetando tus prioridades, tiempo y músculos elegidos.' },
];
function _airIsTerra() {
  return document.body.classList.contains('layout-terra') || document.documentElement.classList.contains('layout-terra');
}
function _airColors() {
  if (_airIsTerra()) return {
    accentBg:   'rgba(200,168,75,0.1)',
    accentBg2:  'rgba(200,168,75,0.06)',
    accentBg3:  'rgba(200,168,75,0.04)',
    accentBord: 'rgba(200,168,75,0.2)',
    accentBord2:'rgba(200,168,75,0.35)',
    gymChipBg:  'rgba(200,168,75,0.14)',
    gymChipBord:'rgba(200,168,75,0.45)',
    cardBg:     'rgba(200,168,75,0.04)',
    cardBord:   'rgba(200,168,75,0.18)',
  };
  return {
    accentBg:   'rgba(77,138,255,0.1)',
    accentBg2:  'rgba(77,138,255,0.08)',
    accentBg3:  'rgba(77,138,255,0.04)',
    accentBord: 'rgba(77,138,255,0.2)',
    accentBord2:'rgba(77,138,255,0.35)',
    gymChipBg:  'rgba(77,138,255,0.14)',
    gymChipBord:'rgba(77,138,255,0.45)',
    cardBg:     'var(--bg3)',
    cardBord:   'var(--border)',
  };
}

function _airIsTerra() {
  return document.body.classList.contains('layout-terra') || document.documentElement.classList.contains('layout-terra');
}
function _airTerraColor(type) {
  var map = {
    accent: '#c8a84b', accent_bg: 'rgba(200,168,75,0.1)', accent_bg2: 'rgba(200,168,75,0.08)',
    accent_border: 'rgba(200,168,75,0.2)', accent_border2: 'rgba(200,168,75,0.18)',
    bg3: 'rgba(200,168,75,0.04)', bg4: 'rgba(200,168,75,0.03)',
    border: 'rgba(200,168,75,0.18)', text: '#e8e0cc', text2: '#a09878', text3: '#5a5438',
    green: '#6a9e5a', green_bg: 'rgba(106,158,90,0.1)', green_border: 'rgba(106,158,90,0.25)'
  };
  return map[type] || 'var(--' + type + ')';
}
function _airC(cssVar, terraKey) {
  return _airIsTerra() ? _airTerraColor(terraKey || cssVar) : 'var(--' + cssVar + ')';
}
function _airBg(rgba77, terraKey) {
  return _airIsTerra() ? _airTerraColor(terraKey) : rgba77;
}

function openAIRoutine() {
  _airWizStep = 1;
  _airEquip = 'gym';
  _airLevel = 'intermediate';
  _airGoal = 'hypertrophy';
  _airDays = 4;
  _airTime = 60;
  _airSelected = new Set();
  _airFocusOption = null;
  _airSchedule = {};
  _airGeneratedRoutine = null;
  _airVolumeMap = {};
  _airTimeWarningDismissed = false;
  _airActivities = [];
  _airActivityDays = {};
  _airWantsCombine = false;
  _airScheduleOrder = [];
  _airRenderWiz();
  document.getElementById('aiRoutineModal').classList.add('open');
}

function _airRenderWiz() {
  for (var i = 1; i <= _AIR_STEPS; i++) {
    var el = document.getElementById('airStep' + i);
    if (el) el.classList.toggle('active', i === _airWizStep);
  }
  var info = _AIR_STEP_INFO[_airWizStep - 1];
  var t = document.getElementById('airModalTitle');
  if (t) t.childNodes[0].textContent = '🧬 ' + info.title + ' ';
  var s = document.getElementById('airStepSubtitle');
  if (s) s.textContent = info.hint;

  // Progress dots
  var prog = '';
  for (var j = 1; j <= _AIR_STEPS; j++) {
    prog += '<div class="wiz-dot' + (j <= _airWizStep ? ' done' : '') + '"></div>';
  }
  var pd = document.getElementById('airProgress');
  if (pd) pd.innerHTML = prog;

  var bk = document.getElementById('airBtnBack');
  var nx = document.getElementById('airBtnNext');
  if (bk) bk.style.display = _airWizStep > 1 ? '' : 'none';
  if (nx) {
    if (_airWizStep === _AIR_STEPS) nx.textContent = '✅ Aplicar rutina';
    else if (_airWizStep === _AIR_STEPS - 1) nx.textContent = '⚡ Generar rutina';
    else nx.textContent = 'Continuar →';
  }

if (_airWizStep === 4) _airRenderBodyMap();
  if (_airWizStep === 5) _airRenderFocusOptions();
  if (_airWizStep === 6) _airRenderActivityStep();
if (_airWizStep === 7) {
    // Leer días de gym del botón activo en el DOM (por si el usuario navegó atrás)
    var _activeDayBtn = document.querySelector('.air-days-btn.active');
    if (_activeDayBtn) _airDays = parseInt(_activeDayBtn.dataset.d) || _airDays;
    _airBuildSchedule(); _airRenderSchedule();
  }  if (_airWizStep === 8) { _airBuildRoutine(); _airRenderResult(); }
}

function airWizNav(dir) {
  if (dir === 1) {
if (_airWizStep === 4 && _airSelected.size === 0) {
      showToast('⚠ Seleccioná al menos un músculo');
      return;
    }
    if (_airWizStep === 5 && !_airFocusOption) {
      showToast('⚠ Elegí un enfoque para tu rutina');
      return;
    }
    if (_airWizStep === _AIR_STEPS) {
      applyAIRoutine();
      return;
    }
  }
  _airWizStep = Math.max(1, Math.min(_AIR_STEPS, _airWizStep + dir));
  _airRenderWiz();
}

// ── STEP 4: ACTIVIDADES ───────────────────────────────────────────────────────
function _airRenderActivityStep() {
  var el = document.getElementById('airStep6');
  if (!el) return;

  var categories = [
    {
      label: 'Cardio',
      items: [
        { name: 'Correr',   emoji: '🏃' },
        { name: 'Bici',     emoji: '🚴' },
        { name: 'Caminata', emoji: '🚶' },
        { name: 'HIIT',     emoji: '🔥' },
        { name: 'Natación', emoji: '🏊' },
        { name: 'Pilates',  emoji: '🧘' }
      ]
    },
    {
      label: 'Deportes',
      items: [
        { name: 'Fútbol',   emoji: '⚽' },
        { name: 'Tenis',    emoji: '🎾' },
        { name: 'Pádel',    emoji: '🏓' },
        { name: 'Otro',     emoji: '🏅' }
      ]
    }
  ];

  // Botones de selección de días por actividad (1–4)
  function _daysSelector(name) {
    var cur = _airActivityDays[name] || 1;
    var btns = [1,2,3,4].map(function(n) {
      var active = cur === n;
      return '<button onclick="event.stopPropagation();_airSetActivityDays(\'' + name + '\',' + n + ')" '
        + 'style="padding:3px 8px;border-radius:6px;border:1.5px solid ' + (active ? 'var(--accent)' : 'var(--border)') + ';'
        + 'background:' + (active ? 'rgba(77,138,255,0.15)' : 'var(--bg4)') + ';'
        + 'font-size:11px;font-weight:700;color:' + (active ? 'var(--accent)' : 'var(--text3)') + ';cursor:pointer">'
        + n + 'x</button>';
    }).join('');
    return '<div style="display:flex;align-items:center;gap:4px;margin-top:6px">'
      + '<span style="font-size:10px;color:var(--text3);margin-right:2px">días/semana:</span>'
      + btns + '</div>';
  }

function _actCard(s) {
    var isOn = _airActivities.indexOf(s.name) !== -1;
    return '<div onclick="_airToggleActivity(\'' + s.name + '\')" '
      + 'style="display:flex;flex-direction:column;padding:12px 14px;border-radius:12px;cursor:pointer;margin-bottom:6px;'
      + 'border:1.5px solid ' + (isOn ? 'var(--accent)' : 'var(--border)') + ';'
      + 'background:' + (isOn ? 'rgba(77,138,255,0.08)' : 'var(--bg3)') + '">'
      + '<div style="display:flex;align-items:center;gap:12px">'
        + '<div style="font-size:22px;line-height:1">' + s.emoji + '</div>'
        + '<div style="font-size:13px;font-weight:600;color:var(--text);flex:1">' + s.name + '</div>'
        + (isOn ? '<div style="font-size:16px;color:var(--accent)">✓</div>' : '')
      + '</div>'
      + (isOn ? _daysSelector(s.name) : '')
      + '</div>';
  }

  var catsHtml = categories.map(function(cat) {
    return '<div style="font-size:10px;font-weight:700;color:var(--text3);letter-spacing:0.5px;text-transform:uppercase;margin:14px 0 8px">'
      + cat.label + '</div>'
      + cat.items.map(_actCard).join('');
  }).join('');

// Si ya eligió combinar, mostrar solo la lista (sin los botones)
 var _c = _airColors();
if (_airWantsCombine) {
    el.innerHTML = '<div style="padding:4px 0 8px">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding:8px 12px;background:' + _airBg('rgba(77,138,255,0.08)', 'accent_bg2') + ';border:1px solid ' + _airBg('rgba(77,138,255,0.2)', 'accent_border') + ';border-radius:10px">'
        + '<span style="font-size:16px">✅</span>'
        + '<span style="font-size:12px;font-weight:600;color:var(--accent)">Combinando gym con actividades</span>'
+ '<button onclick="_airSetActivityMode(false)" style="flex:1;padding:12px;border-radius:12px;border:1.5px solid ' + _airC('accent') + ';background:' + _airBg('rgba(77,138,255,0.1)', 'accent_bg') + ';cursor:pointer;font-size:13px;font-weight:700;color:' + _airC('accent') + '">Solo gym</button>'      + '</div>'
      + catsHtml
      + '</div>';
    return;
  }

  el.innerHTML =
    '<div style="padding:4px 0 8px">'
    + '<div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:12px">¿Querés sumar actividades a tu semana de gym?</div>'
    + '<div style="font-size:11px;color:var(--text3);margin-bottom:14px">Podés combinar gym con deportes, cardio u otras actividades. La rutina los va a distribuir en días separados.</div>'
    + '<div style="display:flex;gap:8px;margin-bottom:16px">'
+ '<button onclick="_airSetActivityMode(false)" style="flex:1;padding:12px;border-radius:12px;border:1.5px solid var(--accent);background:' + _c.accentBg + ';cursor:pointer;font-size:13px;font-weight:700;color:var(--accent)">Solo gym</button>'    + '<button onclick="_airSetActivityMode(true)" style="flex:1;padding:12px;border-radius:12px;border:1.5px solid var(--border);background:var(--bg3);cursor:pointer;font-size:13px;font-weight:700;color:var(--text2)">Sí, sumar actividades</button>'
    + '</div>'
    + '</div>';
}

function _airSetActivityMode(wantsCombine) {
  _airWantsCombine = wantsCombine;
  if (!wantsCombine) {
    _airActivities = [];
    _airActivityDays = {};
  }
  _airRenderActivityStep();
}

function _airSetActivityDays(name, n) {
  _airActivityDays[name] = n;
  _airRenderActivityStep();
}

function _airToggleActivity(name) {
  // "Otro" abre panel de nombre custom antes de agregar
  if (name === 'Otro' && _airActivities.indexOf('Otro') === -1) {
    _airShowOtroPanel();
    return;
  }
  var idx = _airActivities.indexOf(name);
  if (idx !== -1) {
    _airActivities.splice(idx, 1);
    delete _airActivityDays[name];
  } else {
    _airActivities.push(name);
    _airActivityDays[name] = 1;
    if (!state.user) state.user = {};
    if (!state.user.activities) state.user.activities = [];
    var alreadySaved = state.user.activities.some(function(a){ return a.name === name; });
    if (!alreadySaved) {
      var detail = { Correr:{km:true,duration:true}, Bici:{km:true,duration:true}, Caminata:{km:true,duration:true} };
      var type = ['Fútbol','Tenis','Pádel','Otro'].indexOf(name) !== -1 ? 'sport' : 'cardio';
      state.user.activities.push({ name: name, type: type, detail: detail[name] || {} });
      saveState(state);
    }
  }
  _airRenderActivityStep();
}

function _airShowOtroPanel() {
  var el = document.getElementById('airStep6');
  if (!el) return;
  // Insertar panel inline encima de la lista
  var existing = document.getElementById('airOtroPanel');
  if (existing) { existing.remove(); return; }
  var panel = document.createElement('div');
  panel.id = 'airOtroPanel';
  panel.style.cssText = 'background:var(--bg3);border:1.5px solid var(--accent);border-radius:12px;padding:14px;margin-bottom:14px;';
  panel.innerHTML =
    '<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:10px">¿Qué actividad es?</div>'
    + '<div style="display:flex;gap:8px;margin-bottom:10px">'
      + '<input id="airOtroEmoji" type="text" maxlength="2" placeholder="🏅" '
        + 'style="width:52px;text-align:center;font-size:22px;padding:6px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg4);color:var(--text);flex-shrink:0">'
      + '<input id="airOtroName" type="text" maxlength="20" placeholder="Ej: Yoga, Boxeo, Esquí..." '
        + 'style="flex:1;padding:8px 10px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg4);color:var(--text);font-size:13px">'
    + '</div>'
    + '<div style="font-size:10px;color:var(--text3);margin-bottom:10px">Solo podés escribir emojis en el primer campo.</div>'
    + '<div style="display:flex;gap:8px">'
      + '<button onclick="_airConfirmOtro()" style="flex:1;padding:9px;border-radius:9px;background:var(--accent);border:none;color:#fff;font-size:13px;font-weight:700;cursor:pointer">Agregar</button>'
      + '<button onclick="document.getElementById(\'airOtroPanel\').remove()" style="padding:9px 14px;border-radius:9px;background:var(--bg4);border:1px solid var(--border);color:var(--text3);font-size:13px;cursor:pointer">Cancelar</button>'
    + '</div>';

  // Insertar al inicio del contenido
  el.insertBefore(panel, el.firstChild);
  document.getElementById('airOtroName').focus();

  // Validar que el campo emoji solo acepte emojis
  document.getElementById('airOtroEmoji').addEventListener('input', function() {
    var val = this.value;
    // Filtrar: solo caracteres que sean emoji (no letras ni números)
    var filtered = Array.from(val).filter(function(ch) {
      var cp = ch.codePointAt(0);
      return cp > 0x2000; // todo lo que está por encima del ASCII extendido
    }).join('');
    if (filtered !== val) this.value = filtered;
  });
}

function _airConfirmOtro() {
  var nameEl  = document.getElementById('airOtroName');
  var emojiEl = document.getElementById('airOtroEmoji');
  if (!nameEl || !emojiEl) return;
  var customName  = nameEl.value.trim();
  var customEmoji = emojiEl.value.trim() || '🏅';
  if (!customName) { nameEl.style.borderColor = 'var(--red)'; return; }

  // Registrar la actividad custom con su nombre y emoji
  var ACT_EMOJI_MAP = document.getElementById('airStep6').__emojiMap || {};
  ACT_EMOJI_MAP[customName] = customEmoji;
  document.getElementById('airStep6').__emojiMap = ACT_EMOJI_MAP;

  // Guardar el emoji custom para que _airRenderSchedule lo use
  if (!window._airCustomEmojis) window._airCustomEmojis = {};
  window._airCustomEmojis[customName] = customEmoji;

  // Reemplazar 'Otro' en la lista de categorías por el nombre custom
  // Agregar como actividad
  _airActivities.push(customName);
  _airActivityDays[customName] = 1;

  if (!state.user) state.user = {};
  if (!state.user.activities) state.user.activities = [];
  if (!state.user.activities.some(function(a){ return a.name === customName; })) {
    state.user.activities.push({ name: customName, type: 'sport', emoji: customEmoji });
    saveState(state);
  }

  var panel = document.getElementById('airOtroPanel');
  if (panel) panel.remove();
  _airRenderActivityStep();
}
// ── STEP PICKERS ──────────────────────────────────────────────────────────────
function airPickEquip(btn) {
  document.querySelectorAll('.air-equip-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  _airEquip = btn.dataset.eq;
}

function airPickDays(btn) {
  document.querySelectorAll('.air-days-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  _airDays = parseInt(btn.dataset.d);
  // Reset focus option when days change
  _airFocusOption = null;
  _airCheckTimeWarning();
}

function airPickTime(btn) {
  document.querySelectorAll('.air-time-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  _airTime = parseInt(btn.dataset.t);
  _airCheckTimeWarning();
}

function airSetLevel(btn) {
  document.querySelectorAll('.air-level').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  _airLevel = btn.dataset.level;
}

function airSetGoal(btn) {
  document.querySelectorAll('.air-goal').forEach(function(b) {
    b.classList.remove('active');
    b.style.borderColor = _airC('border');
    b.style.background = _airC('bg3');
  });
  btn.classList.add('active');
  var goalBg = _airIsTerra()
    ? { strength:'rgba(200,122,48,0.1)', hypertrophy:'rgba(200,168,75,0.08)', endurance:'rgba(106,158,90,0.08)' }
    : { strength:'rgba(255,107,77,0.1)', hypertrophy:'rgba(77,138,255,0.08)', endurance:'rgba(77,255,180,0.08)' };
  var goalBorder = { strength:'var(--red)', hypertrophy:'var(--accent)', endurance:'var(--green)' };
  btn.style.borderColor = goalBorder[btn.dataset.goal] || _airC('accent');
  btn.style.background = goalBg[btn.dataset.goal] || _airBg('rgba(77,138,255,0.08)', 'accent_bg2');
  _airGoal = btn.dataset.goal;
}

function bmToggle(id) {
  if (_airSelected.has(id)) _airSelected.delete(id);
  else _airSelected.add(id);
  _airFocusOption = null; // Reset focus when muscles change
  _airRenderBodyMap();
}

function _airRenderBodyMap() {
  var cl = document.getElementById('bmCheckList');
  if (cl) cl.innerHTML = BM_MUSCLES.map(function(m) {
    return '<button class="bm-check' + (_airSelected.has(m.id) ? ' active' : '') + '" onclick="bmToggle(\'' + m.id + '\')">' + m.emoji + ' ' + m.label + '</button>';
  }).join('');
  BM_MUSCLES.forEach(function(m) {
    var el = document.getElementById('bm-' + m.id);
    if (el) { el.style.fill = _airSelected.has(m.id) ? 'var(--accent)' : ''; el.style.opacity = _airSelected.has(m.id) ? '1' : ''; }
    document.querySelectorAll('.bm-mirror[data-zone="' + m.id + '"]').forEach(function(el2) {
      el2.style.fill = _airSelected.has(m.id) ? 'var(--accent)' : '';
      el2.style.opacity = _airSelected.has(m.id) ? '1' : '';
    });
  });
}

// ── STEP 5: FOCUS OPTIONS ─────────────────────────────────────────────────────
// Genera opciones de enfoque dinámicas basadas en los músculos elegidos y los días disponibles
function _airGetFocusOptions() {
  var muscles = [..._airSelected];
  var pushM  = muscles.filter(function(m) { return ['chest','shoulders','triceps'].indexOf(m) >= 0; });
  var pullM  = muscles.filter(function(m) { return ['back','biceps','traps','forearms'].indexOf(m) >= 0; });
  var lowerM = muscles.filter(function(m) { return ['quads','hamstrings','glutes','calves'].indexOf(m) >= 0; });
  var hasUp  = pushM.length > 0 || pullM.length > 0;
  var hasLo  = lowerM.length > 0;

  var options = [];

  if (hasUp && hasLo) {
    // Calcular cuántos días necesita cada parte
    var upperNeeds = Math.ceil(_airDays / 2);
    var lowerNeeds = _airDays - upperNeeds;

    // Opción equilibrada
    options.push({
      id: 'balanced',
      icon: '⚖️',
      title: 'Equilibrado',
      desc: 'Distribuís tus días de forma pareja entre upper y lower body.',
      tags: [upperNeeds + ' día' + (upperNeeds > 1 ? 's' : '') + ' upper', lowerNeeds + ' día' + (lowerNeeds > 1 ? 's' : '') + ' lower'],
      upperDays: upperNeeds,
      lowerDays: lowerNeeds,
      color: 'var(--accent)',
      bg: 'rgba(77,138,255,0.08)',
    });

    // Opción prioridad lower (si hay >= 3 días)
    if (_airDays >= 3) {
      var loPriLower = Math.ceil(_airDays * 0.6);
      var loPriUpper = _airDays - loPriLower;
      options.push({
        id: 'lower_priority',
        icon: '🦵',
        title: 'Prioridad piernas',
        desc: 'Más días dedicados a piernas y glúteos. Ideal si ese es tu grupo rezagado.',
        tags: [loPriLower + ' días lower', loPriUpper + ' día' + (loPriUpper > 1 ? 's' : '') + ' upper'],
        upperDays: loPriUpper,
        lowerDays: loPriLower,
        color: 'var(--green)',
        bg: 'rgba(77,255,180,0.08)',
      });
    }

    // Opción prioridad upper (si hay >= 3 días)
    if (_airDays >= 3) {
      var upPriUpper = Math.ceil(_airDays * 0.6);
      var upPriLower = _airDays - upPriUpper;
      options.push({
        id: 'upper_priority',
        icon: '💪',
        title: 'Prioridad upper body',
        desc: 'Más días para pecho, espalda y brazos. Ideal para desarrollar el tren superior.',
        tags: [upPriUpper + ' días upper', upPriLower + ' día' + (upPriLower > 1 ? 's' : '') + ' lower'],
        upperDays: upPriUpper,
        lowerDays: upPriLower,
        color: 'var(--red)',
        bg: 'rgba(255,107,77,0.08)',
      });
    }
  } else if (!hasUp && hasLo) {
    // Solo piernas
    var qDom = lowerM.filter(function(m) { return ['quads','glutes'].indexOf(m) >= 0; });
    var hDom = lowerM.filter(function(m) { return ['hamstrings','glutes'].indexOf(m) >= 0; });

    options.push({
      id: 'lower_balanced',
      icon: '⚖️',
      title: 'Piernas equilibrado',
      desc: 'Todos tus músculos de pierna con la misma prioridad.',
      tags: ['Cuádriceps + Isquios + Glúteos'],
      color: 'var(--accent)',
      bg: 'rgba(77,138,255,0.08)',
    });
    if (qDom.length > 0) {
      options.push({
        id: 'quad_priority',
        icon: '🦵',
        title: 'Prioridad cuádriceps',
        desc: 'Más volumen y días dedicados a cuádriceps y movimientos dominantes de rodilla.',
        tags: ['Cuáds primero', 'Isquios secundario'],
        color: 'var(--green)',
        bg: 'rgba(77,255,180,0.08)',
      });
    }
    if (hDom.length > 0) {
      options.push({
        id: 'posterior_priority',
        icon: '🍑',
        title: 'Prioridad posterior',
        desc: 'Más volumen en isquiotibiales y glúteos. Ideal para atletismo o estética posterior.',
        tags: ['Glúteos + Isquios primero'],
        color: 'var(--yellow)',
        bg: 'rgba(255,212,77,0.08)',
      });
    }
  } else if (hasUp && !hasLo) {
    // Solo upper
    options.push({
      id: 'upper_balanced',
      icon: '⚖️',
      title: 'Upper equilibrado',
      desc: 'Push y pull con el mismo volumen y frecuencia.',
      tags: ['Push + Pull parejo'],
      color: 'var(--accent)',
      bg: 'rgba(77,138,255,0.08)',
    });
    if (pushM.length > 0 && pullM.length > 0) {
      options.push({
        id: 'push_priority',
        icon: '💥',
        title: 'Prioridad push (pecho/hombros)',
        desc: 'Más días y volumen para los músculos de empuje.',
        tags: ['Más días push', 'Pull mantenimiento'],
        color: 'var(--red)',
        bg: 'rgba(255,107,77,0.08)',
      });
      options.push({
        id: 'pull_priority',
        icon: '🔙',
        title: 'Prioridad pull (espalda/bíceps)',
        desc: 'Más días y volumen para los músculos de tracción.',
        tags: ['Más días pull', 'Push mantenimiento'],
        color: 'var(--green)',
        bg: 'rgba(77,255,180,0.08)',
      });
    }
  }

  // Fallback
  if (options.length === 0) {
    options.push({
      id: 'default',
      icon: '✅',
      title: 'Rutina estándar',
      desc: 'Distribución óptima basada en los músculos que elegiste.',
      tags: ['Distribución automática'],
      color: 'var(--accent)',
      bg: 'rgba(77,138,255,0.08)',
    });
  }

  return options;
}

function _airRenderFocusOptions() {
  var container = document.getElementById('airFocusOptions');
  if (!container) return;

  // Verificar si el tiempo puede generar una advertencia
  var warningHtml = _airGetTimeWarningHtml();

  var options = _airGetFocusOptions();
  if (!_airFocusOption && options.length > 0) {
    _airFocusOption = options[0].id; // Pre-seleccionar la primera
  }

  container.innerHTML = warningHtml + options.map(function(opt) {
    var isActive = _airFocusOption === opt.id;
    return '<div onclick="airPickFocus(\'' + opt.id + '\')" style="' +
      'cursor:pointer;border-radius:12px;padding:14px;margin-bottom:8px;' +
      'border:2px solid ' + (isActive ? opt.color : 'var(--border)') + ';' +
      'background:' + (isActive ? opt.bg : 'var(--bg3)') + ';' +
      'transition:all 0.2s">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">' +
        '<span style="font-size:22px">' + opt.icon + '</span>' +
        '<div>' +
          '<div style="font-weight:700;font-size:13px;color:' + (isActive ? opt.color : 'var(--text)') + '">' + opt.title + '</div>' +
          '<div style="font-size:11px;color:var(--text3);margin-top:1px">' + opt.desc + '</div>' +
        '</div>' +
        (isActive ? '<div style="margin-left:auto;color:' + opt.color + ';font-size:18px">✓</div>' : '') +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:5px">' +
        opt.tags.map(function(tag) {
          return '<span style="background:' + (isActive ? opt.bg : 'var(--bg4)') + ';color:' + (isActive ? opt.color : 'var(--text2)') + ';' +
            'border-radius:20px;padding:2px 9px;font-size:10px;font-weight:600;border:1px solid ' + (isActive ? opt.color : 'transparent') + '">' + tag + '</span>';
        }).join('') +
      '</div>' +
    '</div>';
  }).join('');
}

function airPickFocus(id) {
  _airFocusOption = id;
  _airRenderFocusOptions();
}

// ── TIME WARNING LOGIC ────────────────────────────────────────────────────────
// Fix #3: advertencia suave, no bloqueante
function _airGetTimeWarningHtml() {
  var muscles = [..._airSelected];
  if (muscles.length === 0) return '';

  var setsConfig = _airGetAdaptedSetsConfig();
  var musclesPerDay = Math.ceil(muscles.length / _airDays);
  var timePerMuscle = _airEstimateTimePerMuscle(setsConfig);
  var estimatedMinPerDay = 8 + (musclesPerDay * timePerMuscle);

  if (estimatedMinPerDay <= _airTime) return '';

  // Solo advertencia suave — el usuario puede continuar igual
  return '<div style="background:rgba(255,212,77,0.06);border:1px solid rgba(255,212,77,0.25);border-radius:8px;padding:10px 12px;margin-bottom:12px;display:flex;gap:8px;align-items:flex-start">' +
    '<span style="font-size:14px;flex-shrink:0">⚠️</span>' +
    '<div style="font-size:11px;color:var(--text2);line-height:1.5">' +
      'La cantidad de músculos elegidos con <strong>' + _airTime + ' min/sesión</strong> puede reducir la efectividad de la rutina. ' +
      'La rutina se ajustará automáticamente al tiempo disponible.' +
    '</div>' +
  '</div>';
}

function airFixTime(action, value) {
  if (action === 'days') {
    _airDays = Math.min(6, value);
    // Actualizar botón activo de días
    document.querySelectorAll('.air-days-btn').forEach(function(b) {
      b.classList.toggle('active', parseInt(b.dataset.d) === _airDays);
    });
    _airFocusOption = null;
    _airRenderFocusOptions();
    showToast('✅ Días actualizados a ' + _airDays);
  } else if (action === 'time') {
    _airTime = Math.min(120, value);
    // Actualizar botón activo de tiempo
    document.querySelectorAll('.air-time-btn').forEach(function(b) {
      b.classList.toggle('active', parseInt(b.dataset.t) === _airTime);
    });
    _airRenderFocusOptions();
    showToast('✅ Tiempo actualizado a ' + _airTime + ' min');
  } else if (action === 'muscles') {
    _airWizStep = 4;
    _airRenderWiz();
  } else if (action === 'continue') {
    _airTimeWarningDismissed = true;
    _airRenderFocusOptions();
  }
}

function _airEstimateTimePerMuscle(setsConfig) {
  // Usar config adaptada si no se pasa una explícita
  var sc = setsConfig || _airGetAdaptedSetsConfig();
  var restKey = 'compound_' + _airGoal;
  var isoKey = 'isolation_' + _airGoal;
  var compRest = REST_TIMES[restKey] ? REST_TIMES[restKey].seconds : 150;
  var isoRest = REST_TIMES[isoKey] ? REST_TIMES[isoKey].seconds : 90;
  var compExec = SET_EXEC_TIME[restKey] || 75;
  var isoExec = SET_EXEC_TIME[isoKey] || 45;
  var compSets = sc.compound;
  var isoSets = sc.isolation;

  var totalSecs = ((compExec + compRest) * compSets - compRest)
                + ((isoExec + isoRest) * isoSets - isoRest)
                + 45;
  return Math.round(totalSecs / 60);
}

function _airCheckTimeWarning() {
  var w = document.getElementById('airTimeHint');
  if (!w) return;
  var timePerMuscle = _airEstimateTimePerMuscle();
  var musclesFit = Math.max(1, Math.floor((_airTime - 8) / timePerMuscle));
  w.textContent = '💡 Con ' + _airTime + ' min podés cubrir bien ~' + musclesFit + ' grupos musculares por sesión.';
}

// ── SCHEDULE BUILDER ──────────────────────────────────────────────────────────
// Fix #5: distribución óptima que maximiza recuperación entre sesiones
// 4 días → Lun/Mar/Jue/Vie (no 4 consecutivos)
// 3 días → Lun/Mie/Vie
// _airSchedule = { Mon: ['train','activity:Correr'], Tue: [], ... }
// Array de hasta 4 items por día. Vacío = descanso.

function _airBuildSchedule() {
  var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  allDows.forEach(function(d) { _airSchedule[d] = []; });

  var patterns = { 2:[0,3], 3:[0,2,4], 4:[0,1,3,4], 5:[0,1,2,4,5], 6:[0,1,2,3,4,5] };
  var gymDays = Math.min(6, Math.max(1, _airDays));
  var pattern = patterns[gymDays] || patterns[4];

  pattern.forEach(function(idx) { _airSchedule[allDows[idx]] = ['train']; });

  if (_airWantsCombine && _airActivities.length > 0) {
    _airActivities.forEach(function(name) {
      var n = _airActivityDays[name] || 1;
      var placed = 0;
      // Pass 1: días libres
      allDows.forEach(function(d) {
        if (placed >= n) return;
        if (_airSchedule[d].length === 0) { _airSchedule[d].push('activity:' + name); placed++; }
      });
      // Pass 2: combinado con gym
      if (placed < n) {
        allDows.forEach(function(d) {
          if (placed >= n) return;
          var slots = _airSchedule[d];
          if (slots.indexOf('train') !== -1 && slots.indexOf('activity:' + name) === -1 && slots.length < 3) {
            slots.push('activity:' + name); placed++;
          }
        });
      }
    });
  }
  _airScheduleOrder = [];
}

function _airRenderSchedule() {
  var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var dowFull = { Mon:'Lunes', Tue:'Martes', Wed:'Miércoles', Thu:'Jueves', Fri:'Viernes', Sat:'Sábado', Sun:'Domingo' };
var ACT_EMOJI = Object.assign({ Correr:'🏃', Bici:'🚴', Caminata:'🚶', HIIT:'🔥', Natación:'🏊', Pilates:'🧘', Fútbol:'⚽', Tenis:'🎾', Pádel:'🏓', Otro:'🏅' }, window._airCustomEmojis || {});
function _chipHtml(val, d) {
    var isGym = val === 'train';
    var actName = isGym ? '' : val.split(':')[1];
    var emoji = isGym ? '🏋️' : (ACT_EMOJI[actName] || '⚡');
    var label = isGym ? 'Gym' : actName;
    var color = isGym ? 'var(--accent)' : 'var(--green)';
    var _c = _airColors();
    var bg    = isGym ? _c.gymChipBg  : 'rgba(50,220,140,0.12)';
    var border= isGym ? _c.gymChipBord : 'rgba(50,220,140,0.38)';
    return '<div class="air-chip" draggable="true" data-dow="' + d + '" data-val="' + val + '" '
      + 'style="display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:20px;'
      + 'border:1.5px solid ' + border + ';background:' + bg + ';cursor:grab;user-select:none;'
      + 'font-size:12px;font-weight:700;color:' + color + ';white-space:nowrap;transition:opacity 0.15s,transform 0.1s">'
      + '<span style="font-size:14px;line-height:1">' + emoji + '</span>' + label
      + '</div>';
  }

  var rowsHtml = allDows.map(function(d) {
    var slots = _airSchedule[d] || [];
    var isRest = slots.length === 0;
    var chips = slots.map(function(v) { return _chipHtml(v, d); }).join('');
    return '<div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);min-height:50px">'
      + '<div style="width:78px;flex-shrink:0;font-size:13px;font-weight:700;color:' + (isRest ? 'var(--text3)' : 'var(--text)') + '">' + dowFull[d] + '</div>'
      + '<div class="air-drop-zone" data-dow="' + d + '" '
        + 'style="display:flex;align-items:center;gap:6px;flex:1;flex-wrap:wrap;min-height:36px;padding:3px 6px;'
        + 'border-radius:10px;border:1.5px dashed ' + (isRest ? 'var(--border)' : 'transparent') + ';'
        + 'background:' + (isRest ? 'var(--bg4)' : 'transparent') + ';transition:all 0.15s">'
        + (isRest ? '<span style="font-size:11px;color:var(--text3)">😴 Descanso</span>' : chips)
      + '</div>'
    + '</div>';
  }).join('');

  var el = document.getElementById('airStep7');
  if (!el) return;
  el.innerHTML = '<div style="font-size:11px;color:var(--text3);margin-bottom:12px">'
    + 'Arrastrá los chips para moverlos entre días. Días sin actividad = descanso.</div>'
    + '<div id="airSchedRows">' + rowsHtml + '</div>';

  var dragVal = null, dragFromDow = null;

  el.querySelectorAll('.air-chip').forEach(function(chip) {
    chip.addEventListener('dragstart', function(e) {
      dragVal = chip.dataset.val;
      dragFromDow = chip.dataset.dow;
      chip.style.opacity = '0.35';
      chip.style.transform = 'scale(0.95)';
      e.dataTransfer.effectAllowed = 'move';
      el.querySelectorAll('.air-drop-zone').forEach(function(z) {
        if (z.dataset.dow !== dragFromDow) {
          z.style.borderColor = 'rgba(77,138,255,0.35)';
          z.style.background = 'rgba(77,138,255,0.04)';
        }
      });
    });
    chip.addEventListener('dragend', function() {
      chip.style.opacity = '';
      chip.style.transform = '';
      el.querySelectorAll('.air-drop-zone').forEach(function(z) { z.style.borderColor = ''; z.style.background = ''; });
      dragVal = null; dragFromDow = null;
      _airRenderSchedule();
    });
  });

  el.querySelectorAll('.air-drop-zone').forEach(function(zone) {
    zone.addEventListener('dragover', function(e) {
      e.preventDefault();
      zone.style.background = 'rgba(77,138,255,0.10)';
      zone.style.borderColor = 'var(--accent)';
      zone.style.borderStyle = 'dashed';
    });
    zone.addEventListener('dragleave', function() {
      zone.style.background = '';
      zone.style.borderColor = '';
    });
    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      zone.style.background = ''; zone.style.borderColor = '';
      var toDow = zone.dataset.dow;
      if (!dragFromDow || !dragVal || toDow === dragFromDow) return;
      var fromSlots = _airSchedule[dragFromDow] || [];
      var toSlots   = (_airSchedule[toDow] || []).slice();
      if (toSlots.indexOf(dragVal) !== -1) { showToast('Ya está en ese día'); return; }
      if (dragVal === 'train' && toSlots.indexOf('train') !== -1) { showToast('Ya hay Gym ese día'); return; }
      if (toSlots.length >= 3) { showToast('Máximo 3 actividades por día'); return; }
      _airSchedule[dragFromDow] = fromSlots.filter(function(v){ return v !== dragVal; });
      toSlots.push(dragVal);
      _airSchedule[toDow] = toSlots;
    });
  });

  // Touch support para mobile
  (function() {
    var tChip = null, tClone = null, tFromDow = null;
    el.querySelectorAll('.air-chip').forEach(function(chip) {
      chip.addEventListener('touchstart', function() {
        tChip = chip; tFromDow = chip.dataset.dow;
        var r = chip.getBoundingClientRect();
        tClone = chip.cloneNode(true);
        tClone.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;opacity:0.85;left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;';
        document.body.appendChild(tClone);
        chip.style.opacity = '0.3';
      }, {passive:true});
    });
    document.addEventListener('touchmove', function(e) {
      if (!tClone) return;
      e.preventDefault();
      var t = e.touches[0];
      tClone.style.left = (t.clientX - tClone.offsetWidth/2) + 'px';
      tClone.style.top  = (t.clientY - 20) + 'px';
      el.querySelectorAll('.air-drop-zone').forEach(function(z) { z.style.background=''; z.style.borderColor=''; });
      tClone.style.display = 'none';
      var under = document.elementFromPoint(t.clientX, t.clientY);
      tClone.style.display = '';
      if (under) {
        var zone = under.closest('.air-drop-zone');
        if (zone && zone.dataset.dow !== tFromDow) { zone.style.background='rgba(77,138,255,0.10)'; zone.style.borderColor='var(--accent)'; }
      }
    }, {passive:false});
    document.addEventListener('touchend', function(e) {
      if (!tChip || !tClone) return;
      var t = e.changedTouches[0];
      tClone.style.display = 'none';
      var under = document.elementFromPoint(t.clientX, t.clientY);
      tClone.style.display = '';
      if (under) {
        var zone = under.closest('.air-drop-zone');
        if (zone && zone.dataset.dow !== tFromDow) {
          var toDow = zone.dataset.dow;
          var val = tChip.dataset.val;
          var fromSlots = _airSchedule[tFromDow] || [];
          var toSlots = (_airSchedule[toDow] || []).slice();
          if (toSlots.indexOf(val) === -1 && !(val === 'train' && toSlots.indexOf('train') !== -1) && toSlots.length < 3) {
            _airSchedule[tFromDow] = fromSlots.filter(function(v){ return v !== val; });
            toSlots.push(val);
            _airSchedule[toDow] = toSlots;
          }
        }
      }
      tChip.style.opacity = ''; tClone.remove();
      tChip = null; tClone = null; tFromDow = null;
      el.querySelectorAll('.air-drop-zone').forEach(function(z){ z.style.background=''; z.style.borderColor=''; });
      _airRenderSchedule();
    });
  })();
}

function _airRedistributeAfterRemoval() {}
function airSwapSched(posA, posB) {}
function airToggleSched(d) {}


// ── CORE ROUTINE ENGINE ───────────────────────────────────────────────────────
function _airBuildRoutine() {
  var muscles = [..._airSelected];
  var db = EXERCISE_DB[_airEquip] || EXERCISE_DB.gym;
  var repZone = REP_ZONES[_airGoal] || REP_ZONES.hypertrophy;
  // Fix #4: sets adaptados a nivel + edad del usuario
  var setsConfig = _airGetAdaptedSetsConfig();
  var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
var trainDows = allDows.filter(function(d) { return (_airSchedule[d] || []).indexOf('train') !== -1; });
  var effectiveDays = trainDows.length > 0 ? trainDows.length : _airDays;

  // Clasificar músculos
  var pushM  = muscles.filter(function(m) { return ['chest','shoulders','triceps'].indexOf(m) >= 0; });
  var pullM  = muscles.filter(function(m) { return ['back','biceps','traps','forearms'].indexOf(m) >= 0; });
  var lowerM = muscles.filter(function(m) { return ['quads','hamstrings','glutes','calves'].indexOf(m) >= 0; });
  var coreM  = muscles.filter(function(m) { return m === 'abs'; });
  var hasUp  = pushM.length > 0 || pullM.length > 0;
  var hasLo  = lowerM.length > 0;

  // Fix #7: elegir split óptimo según días y músculos disponibles
  var daySlots = _airBuildOptimalSplit(pushM, pullM, lowerM, coreM, hasUp, hasLo, effectiveDays);

  var timePerDay = _airTime;

  // Fix #6: cuántos músculos caben REALMENTE en el tiempo disponible
  var maxMusclesPerDay = _airCalcMaxExercisesForTime(timePerDay);

  var exPool = {};
  muscles.forEach(function(mId) {
    var mdb = (db[mId] || []).slice().sort(function(a,b) { return a.priority - b.priority; });
    exPool[mId] = {
      compounds:  mdb.filter(function(e) { return e.type === 'compound'; }),
      isolations: mdb.filter(function(e) { return e.type === 'isolation'; }),
    };
  });

  var muscleUseCount = {};
  muscles.forEach(function(m) { muscleUseCount[m] = 0; });
  _airVolumeMap = {};
  muscles.forEach(function(m) { _airVolumeMap[m] = 0; });

  _airGeneratedRoutine = daySlots.map(function(slot, i) {
    var dayMuscles = slot.muscles.filter(function(m) {
      return muscles.indexOf(m) >= 0 && db[m] && db[m].length > 0;
    });
    // Fix #6: limitar músculos por sesión según tiempo real disponible
    dayMuscles = dayMuscles.slice(0, maxMusclesPerDay);
    if (dayMuscles.length === 0) return null;

    var candidateCompounds = [];
    var candidateIso = [];

    dayMuscles.forEach(function(mId) {
      var pool = exPool[mId];
      if (!pool) return;
      var useCount = muscleUseCount[mId];
      var comp = pool.compounds[useCount % Math.max(1, pool.compounds.length)];
      var iso  = pool.isolations[useCount % Math.max(1, pool.isolations.length)];

      if (comp) {
        candidateCompounds.push({
          name: comp.name, sets: setsConfig.compound, reps: repZone.compound,
          rest: REST_TIMES[comp.rest] || REST_TIMES.compound_hypertrophy,
          type: comp.type, muscle: mId, rir: comp.rir, notes: comp.notes || null,
        });
      }
      if (iso) {
        candidateIso.push({
          name: iso.name, sets: setsConfig.isolation, reps: repZone.isolation,
          rest: REST_TIMES[iso.rest] || REST_TIMES.isolation_hypertrophy,
          type: iso.type, muscle: mId, rir: iso.rir, notes: iso.notes || null,
        });
      }
    });

    var allCandidates = candidateCompounds.concat(candidateIso);
    var selected = _airEnforceTimeBudget(allCandidates, timePerDay);

    var musclesInDay = {};
    selected.forEach(function(ex) {
      if (ex.muscle) {
        if (!musclesInDay[ex.muscle]) { musclesInDay[ex.muscle] = true; muscleUseCount[ex.muscle]++; }
        _airVolumeMap[ex.muscle] = (_airVolumeMap[ex.muscle] || 0) + ex.sets;
      }
    });

    var estimatedTime = _airEstimateSessionTime(selected);

    return {
      name: slot.name,
      exercises: selected,
      dow: trainDows[i] || null,
      estimatedTime: Math.round(estimatedTime),
      musclesPlanned: dayMuscles.length,
      musclesCovered: Object.keys(musclesInDay).length,
    };
  }).filter(function(d) { return d && d.exercises.length > 0; });
}

// ── TIME BUDGET ENFORCEMENT ───────────────────────────────────────────────────
function _airEnforceTimeBudget(exercises, maxMinutes) {
  if (!exercises.length) return exercises;
  var result = exercises.slice();
  var timeEst = _airEstimateSessionTime(result);
  while (timeEst > maxMinutes && result.length > 1) {
    result = result.slice(0, result.length - 1);
    timeEst = _airEstimateSessionTime(result);
  }
  return result;
}

// ── SESSION TIME ESTIMATOR ────────────────────────────────────────────────────
function _airEstimateSessionTime(exercises) {
  if (!exercises.length) return 0;
  var WARMUP = 8;
  var COOLDOWN = 3;
  var totalSeconds = 0;
  exercises.forEach(function(ex) {
    var execKey = ex.type + '_' + _airGoal;
    var execTime = SET_EXEC_TIME[execKey] || SET_EXEC_TIME['isolation_any'] || 45;
    var restTime = ex.rest ? ex.rest.seconds : 90;
    totalSeconds += (execTime + restTime) * ex.sets - restTime;
  });
  totalSeconds += exercises.length * 45; // transiciones
  return WARMUP + COOLDOWN + Math.round(totalSeconds / 60);
}

// ── OPTIMAL SPLIT BUILDER (Fix #7) ───────────────────────────────────────────
// Selecciona el split más balanceado según días disponibles y músculos elegidos
// 2 días: Full Body A/B
// 3 días: Push / Pull / Legs  (o Upper/Lower/Upper si no hay piernas)
// 4 días: Push / Pull / Legs / Upper  (PPL+Upper, más balanceado que Push Push)
// 5 días: Push / Pull / Legs / Upper / Lower
// 6 días: Push / Pull / Legs / Push / Pull / Legs
function _airBuildOptimalSplit(pushM, pullM, lowerM, coreM, hasUp, hasLo, days) {
  var focus = _airFocusOption || 'balanced';
  var slots = [];

  function mkSlot(type, label, mList) {
    var ms = _unique(mList.concat(type === 'lower' || type === 'full' ? coreM : []));
    if (ms.length === 0) return null;
    return { name: label, muscles: ms };
  }

  // Solo piernas
  if (!hasUp && hasLo) {
    for (var i = 0; i < days; i++) {
      var isA = i % 2 === 0;
      var qDom = lowerM.filter(function(m) { return ['quads','glutes'].indexOf(m) >= 0; });
      var hDom = lowerM.filter(function(m) { return ['hamstrings','glutes'].indexOf(m) >= 0; });
      if (!qDom.length) qDom = lowerM;
      if (!hDom.length) hDom = lowerM;
      var s = mkSlot('lower',
        isA ? 'Piernas — Cuádriceps + Glúteos' : 'Piernas — Posterior + Isquios',
        isA ? qDom : hDom);
      if (s) slots.push(s);
    }
    return slots;
  }

  // Solo upper
  if (hasUp && !hasLo) {
    if (days <= 2) {
      for (var u2 = 0; u2 < days; u2++) {
        var ms2 = _unique(pushM.concat(pullM).concat(coreM));
        slots.push({ name: 'Upper Body ' + String.fromCharCode(65+u2), muscles: ms2 });
      }
    } else {
      // Push/Pull alternados
      for (var up = 0; up < days; up++) {
        var isPush = up % 2 === 0;
        if (focus === 'pull_priority') isPush = !isPush;
        var s3 = mkSlot('upper',
          isPush ? 'Push — Pecho + Hombros + Tríceps' : 'Pull — Espalda + Bíceps',
          isPush ? pushM : pullM);
        if (s3) slots.push(s3);
      }
    }
    return slots;
  }

  // Upper + Lower disponibles — split según días y enfoque
  // balanced → Upper/Lower alternado puro (simétrico, mejor recuperación)
  // push/pull priority → separar push y pull en días distintos
  var template;

  if (focus === 'lower_priority') {
    var lp = { 2:['lower','upper'], 3:['lower','lower','upper'], 4:['lower','upper','lower','upper'], 5:['lower','upper','lower','lower','upper'], 6:['lower','upper','lower','upper','lower','upper'] };
    template = lp[days] || lp[4];
  } else if (focus === 'upper_priority') {
    var up = { 2:['upper','lower'], 3:['push','pull','lower'], 4:['push','pull','upper','lower'], 5:['push','pull','upper','lower','upper'], 6:['push','pull','upper','lower','push','pull'] };
    template = up[days] || up[4];
  } else if (focus === 'push_priority') {
    var pp = { 2:['push','pull'], 3:['push','pull','lower'], 4:['push','pull','push','lower'], 5:['push','pull','push','lower','pull'], 6:['push','pull','lower','push','pull','lower'] };
    template = pp[days] || pp[4];
  } else if (focus === 'pull_priority') {
    var pullp = { 2:['pull','push'], 3:['pull','push','lower'], 4:['pull','push','pull','lower'], 5:['pull','push','pull','lower','push'], 6:['pull','push','lower','pull','push','lower'] };
    template = pullp[days] || pullp[4];
  } else {
    // balanced: Upper/Lower perfectamente alternado
    var bal = { 2:['upper','lower'], 3:['upper','lower','upper'], 4:['upper','lower','upper','lower'], 5:['upper','lower','upper','lower','upper'], 6:['upper','lower','upper','lower','upper','lower'] };
    template = bal[days] || bal[4];
  }

  var pushIdx = 0, pullIdx = 0, lowerIdxA = 0;

  template.forEach(function(type) {
    var s;
    if (type === 'full') {
      s = mkSlot('full', 'Full Body', _unique(pushM.concat(pullM).concat(lowerM).concat(coreM)));
    } else if (type === 'push') {
      var suffix = pushIdx > 0 ? ' ' + String.fromCharCode(65 + pushIdx) : '';
      s = mkSlot('upper', 'Push — Pecho + Hombros + Tríceps' + suffix, pushM);
      pushIdx++;
    } else if (type === 'pull') {
      var pullSuffix = pullIdx > 0 ? ' ' + String.fromCharCode(65 + pullIdx) : '';
      s = mkSlot('upper', 'Pull — Espalda + Bíceps' + pullSuffix, pullM);
      pullIdx++;
    } else if (type === 'upper') {
      s = mkSlot('upper', 'Upper — Pecho + Espalda + Hombros', _unique(pushM.concat(pullM)));
    } else if (type === 'lower') {
      var isQdom = lowerIdxA % 2 === 0;
      var qDomL = lowerM.filter(function(m) { return ['quads','glutes'].indexOf(m) >= 0; });
      var hDomL = lowerM.filter(function(m) { return ['hamstrings','glutes'].indexOf(m) >= 0; });
      if (!qDomL.length) qDomL = lowerM;
      if (!hDomL.length) hDomL = lowerM;
      s = mkSlot('lower',
        isQdom ? 'Piernas — Cuádriceps + Glúteos' : 'Piernas — Posterior + Isquios',
        isQdom ? qDomL : hDomL);
      lowerIdxA++;
    }
    if (s) slots.push(s);
  });

  if (slots.length === 0) {
    var allM = _unique(pushM.concat(pullM).concat(lowerM).concat(coreM));
    for (var fb = 0; fb < days; fb++) {
      slots.push({ name: 'Full Body ' + String.fromCharCode(65+fb), muscles: allM });
    }
  }

  return slots.filter(function(s) { return s.muscles.length > 0; });
}

// Mantener _airBuildSlotsFromFocus como alias para compatibilidad
function _airBuildSlotsFromFocus(pushM, pullM, lowerM, coreM, hasUp, hasLo, days) {
  return _airBuildOptimalSplit(pushM, pullM, lowerM, coreM, hasUp, hasLo, days);
}

function _airMuscleNames(mIds) {
  return (mIds || []).slice(0, 3).map(function(m) {
    var info = BM_MUSCLES.find(function(x) { return x.id === m; });
    return info ? info.label : m;
  }).join(' + ');
}

function _unique(arr) {
  var seen = [];
  arr.forEach(function(m) { if (seen.indexOf(m) < 0) seen.push(m); });
  return seen;
}

// ── RENDER RESULT ─────────────────────────────────────────────────────────────
function _airRenderResult() {
  if (!_airGeneratedRoutine || _airGeneratedRoutine.length === 0) return;
  var dowFull = { Mon:'Lunes', Tue:'Martes', Wed:'Miércoles', Thu:'Jueves', Fri:'Viernes', Sat:'Sábado', Sun:'Domingo' };

  // Días de rutina — limpio, solo nombre del día, ejercicios, series y reps
  var html = _airGeneratedRoutine.map(function(d) {
    return '<div class="air-day-card" style="margin-bottom:12px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
        '<div style="font-size:13px;font-weight:700">💪 ' + d.name + '</div>' +
        (d.dow ? '<div style="font-size:10px;color:var(--accent);font-weight:700">' + dowFull[d.dow] + '</div>' : '') +
      '</div>' +
      d.exercises.map(function(ex) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--border)">' +
          '<span style="font-size:12px;color:var(--text)">' + ex.name + '</span>' +
          '<span style="color:var(--accent);font-size:12px;font-weight:700;white-space:nowrap;margin-left:10px">' + ex.sets + '×' + ex.reps + '</span>' +
        '</div>';
      }).join('') +
    '</div>';
  }).join('');

  // Cartel de personal trainer
var _cr = _airColors();
html += '<div style="margin-top:16px;border-radius:12px;border:1px solid ' + _airBg('rgba(77,138,255,0.25)', 'accent_border') + ';background:' + _airBg('rgba(77,138,255,0.06)', 'bg3') + ';padding:14px;display:flex;gap:12px;align-items:flex-start">' +
    '<div style="font-size:22px;flex-shrink:0">🤝</div>' +
    '<div>' +
      '<div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px">¿Querés algo más personalizado?</div>' +
      '<div style="font-size:11px;color:var(--text2);line-height:1.5">Esta rutina es un punto de partida basado en principios científicos. Para un plan 100% adaptado a tu cuerpo, historial y objetivos, te recomendamos trabajar con un <strong>entrenador personal certificado</strong>.</div>' +
    '</div>' +
  '</div>';

  var rc = document.getElementById('airResultContent');
  if (rc) rc.innerHTML = html;
}

// ── APPLY ROUTINE ─────────────────────────────────────────────────────────────
function applyAIRoutine() {
  if (!_airGeneratedRoutine || _airGeneratedRoutine.length === 0) {
    showToast('⚠ La rutina no pudo generarse. Revisá los pasos anteriores.');
    console.error('[applyAIRoutine] _airGeneratedRoutine vacío:', _airGeneratedRoutine);
    return;
  }
  if (!state) { showToast('⚠ Error: no hay estado disponible'); return; }
  if (!state.config) state.config = {};

  // Construir lista de días nuevos (solo los que tienen ejercicios — elimina placeholders vacíos)
  var newDays = _airGeneratedRoutine
    .filter(function(d) { return d.exercises && d.exercises.length > 0; })
    .map(function(d) {
      return {
        name: d.name,
        exercises: d.exercises.map(function(ex) { return { name: ex.name, sets: ex.sets, reps: ex.reps, muscle: ex.muscle || '' }; })
      };
    });

  if (newDays.length === 0) {
    showToast('⚠ La rutina generada no tiene ejercicios válidos.');
    console.error('[applyAIRoutine] newDays vacío tras filtrar', _airGeneratedRoutine);
    return;
  }

  // REEMPLAZAR completamente — no mergear con placeholders anteriores
  state.config.training = newDays;

  // Reconstruir ciclo semanal desde cero
  state.config.cycle = {};
  var allDows = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
var trainDows = allDows.filter(function(d) { return (_airSchedule[d] || []).indexOf('train') !== -1; });
  // Marcar descanso en todos los días primero
// Marcar descanso en todos los días primero
allDows.forEach(function(d) { state.config.cycle[d] = -1; });

  // Asignar días gym
  trainDows.forEach(function(dow, i) {
    if (i < newDays.length) state.config.cycle[dow] = i;
  });

  // Asignar días de actividad al ciclo y guardar nombre
  if (!state.config.sportNames) state.config.sportNames = {};
allDows.forEach(function(dow) {
    var slots = _airSchedule[dow] || [];
    var acts = slots.filter(function(s){ return s && s.startsWith('activity:'); });
    if (acts.length > 0) {
      var actNames = acts.map(function(a){ return a.split(':')[1]; });
      if (state.config.cycle[dow] === -1) {
        // Día solo de deporte
        state.config.cycle[dow] = 'sport';
        state.config.sportNames[dow] = actNames[0];
        // Actividades extra del mismo día
        actNames.slice(1).forEach(function(name, idx) {
          var extraDow = dow + '_extra' + idx;
          state.config.cycle[extraDow] = 'sport';
          state.config.sportNames[extraDow] = name;
        });
      } else {
        // Día gym + deporte: crear entradas extra para cada actividad
        actNames.forEach(function(name, idx) {
          var extraDow = dow + '_sport' + idx;
          state.config.cycle[extraDow] = 'sport';
          state.config.sportNames[extraDow] = name;
        });
      }
    }
  });
  saveState(state);
  closeModal('aiRoutineModal');
  renderTraining();
  showToast('✅ Rutina aplicada. ¡A entrenar!');
  if (typeof sp3AiDone === 'function' &&
      document.getElementById('setupOverlay') &&
      document.getElementById('setupOverlay').style.display !== 'none') {
    sp3AiDone();
  }
}
