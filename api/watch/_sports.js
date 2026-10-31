// Partidos de los equipos de Gonza (fútbol y NBA) desde el scoreboard público de ESPN.
//
// IMPORTANTE (bug encontrado el 31/10/2026): ESPN rechaza el rango de fechas
// `dates=AAAAMMDD-AAAAMMDD` (responde error) y antes eso se tomaba como "no hay
// partidos": el reloj nunca recibió ninguno. Ahora se pide un día por vez.
//
// ESPN agrupa los partidos por fecha de EE.UU.: un partido a las 00:30 de
// Argentina figura el día anterior. Por eso se piden ayer, hoy y mañana y después
// se filtra por fecha argentina (hoy y mañana).
//
// Se cachea unos minutos en memoria y se devuelve también un estado para el
// diagnóstico del reloj (cuántas ligas respondieron, errores, hora del fetch).

const SOCCER_LEAGUES = [
  'arg.1', 'arg.copa', 'conmebol.libertadores', 'conmebol.sudamericana',
  'eng.1', 'eng.fa', 'eng.league_cup', 'esp.1', 'esp.copa_del_rey', 'esp.super_cup',
  'fra.1', 'fra.coupe_de_france', 'ger.1', 'ger.dfb_pokal',
  'uefa.champions', 'uefa.europa', 'fifa.cwc',
];

// Equipos: por id de ESPN (lo más estable) o por nombre → nombre corto para el reloj
const SOCCER_TEAMS = {
  16: 'River', 5: 'Boca', 359: 'Arsenal', 363: 'Chelsea', 382: 'City',
  83: 'Barcelona', 86: 'Real Madrid', 160: 'PSG', 132: 'Bayern',
};
const SOCCER_NAMES = {
  'River Plate': 'River', 'Boca Juniors': 'Boca', 'Arsenal': 'Arsenal', 'Chelsea': 'Chelsea',
  'Manchester City': 'City', 'Barcelona': 'Barcelona', 'Real Madrid': 'Real Madrid',
  'Paris Saint-Germain': 'PSG', 'Bayern Munich': 'Bayern',
};
const NBA_TEAMS = { 20: '76ers', 13: 'Lakers', 14: 'Heat' };
const NBA_NAMES = { 'Philadelphia 76ers': '76ers', 'Los Angeles Lakers': 'Lakers', 'Miami Heat': 'Heat' };

const LEAGUE_NAME = {
  'arg.1': 'Liga Profesional', 'arg.copa': 'Copa Argentina', 'conmebol.libertadores': 'Libertadores',
  'conmebol.sudamericana': 'Sudamericana', 'eng.1': 'Premier League', 'eng.fa': 'FA Cup', 'eng.league_cup': 'Copa de la Liga',
  'esp.1': 'LaLiga', 'esp.copa_del_rey': 'Copa del Rey', 'esp.super_cup': 'Supercopa', 'fra.1': 'Ligue 1',
  'fra.coupe_de_france': 'Copa de Francia', 'ger.1': 'Bundesliga', 'ger.dfb_pokal': 'Copa de Alemania',
  'uefa.champions': 'Champions', 'uefa.europa': 'Europa League', 'fifa.cwc': 'Mundial de Clubes', nba: 'NBA',
};

const CACHE_MS = 8 * 60 * 1000;
let cache = { key: '', at: 0, data: null, meta: null };

function ymdCompact(date) {
  return date.replace(/-/g, '');
}
function addDays(date, n) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
// Fecha argentina (YYYY-MM-DD) de un instante (Argentina no tiene horario de verano: UTC-3)
function arDate(ms) {
  return new Date(ms - 3 * 3600000).toISOString().slice(0, 10);
}

async function getJSON(url, ms = 4000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) return { error: 'HTTP ' + r.status };
    return { json: await r.json() };
  } catch (e) {
    return { error: e && e.name === 'AbortError' ? 'timeout' : String((e && e.message) || e) };
  } finally {
    clearTimeout(t);
  }
}

function mineOf(team, sport) {
  if (!team) return null;
  const ids = sport === 'nba' ? NBA_TEAMS : SOCCER_TEAMS;
  const names = sport === 'nba' ? NBA_NAMES : SOCCER_NAMES;
  return ids[team.id] || names[team.displayName] || null;
}

function shortName(team, sport) {
  const mine = mineOf(team, sport);
  if (mine) return mine;
  return sport === 'nba' ? team.name || team.shortDisplayName : team.shortDisplayName || team.displayName;
}

function parseEvents(json, sport, league) {
  const out = [];
  ((json && json.events) || []).forEach((ev) => {
    const comp = (ev.competitions || [])[0];
    if (!comp) return;
    const cs = comp.competitors || [];
    const home = cs.find((c) => c.homeAway === 'home');
    const away = cs.find((c) => c.homeAway === 'away');
    if (!home || !away || !home.team || !away.team) return;
    const homeMine = mineOf(home.team, sport);
    const awayMine = mineOf(away.team, sport);
    if (!homeMine && !awayMine) return;
    const st = (ev.status && ev.status.type) || (comp.status && comp.status.type) || {};
    const start = Date.parse(ev.date);
    if (!start) return;
    const tv = [];
    (comp.broadcasts || []).forEach((b) => (b.names || []).forEach((n) => tv.indexOf(n) === -1 && tv.push(n)));
    // Terminado de verdad: estado "post" Y marcado como completo (no suspendido/postergado)
    const state = st.state || 'pre';
    const final = state === 'post' && st.completed !== false;
    out.push({
      id: sport + ':' + ev.id,
      sport,
      league: LEAGUE_NAME[league] || league,
      start,
      date: arDate(start),
      home: shortName(home.team, sport),
      away: shortName(away.team, sport),
      // escudos: el reloj los trae guardados como crest/s<id>.png (fútbol) o crest/n<abrev>.png (NBA)
      hc: sport === 'nba' ? 'n' + String(home.team.abbreviation || '').toLowerCase() : 's' + home.team.id,
      ac: sport === 'nba' ? 'n' + String(away.team.abbreviation || '').toLowerCase() : 's' + away.team.id,
      mine: homeMine ? 'home' : 'away',
      state: state === 'post' && !final ? 'in' : state, // pre | in | post (post solo si terminó)
      detail: st.shortDetail || '',
      score: state === 'pre' ? null : { home: parseInt(home.score, 10) || 0, away: parseInt(away.score, 10) || 0 },
      tv: tv.slice(0, 2),
    });
  });
  return out;
}

// Junta y ordena: sin repetidos, solo hoy y mañana (fecha argentina)
function mergeGames(lists, date) {
  const tomorrow = addDays(date, 1);
  const byId = {};
  [].concat(...lists).forEach((g) => {
    if (g.date !== date && g.date !== tomorrow) return;
    byId[g.id] = g; // el mismo partido puede venir de dos días de ESPN: queda uno
  });
  return Object.keys(byId).map((k) => byId[k]).sort((a, b) => a.start - b.start);
}

// Partidos de hoy y mañana (fecha argentina), ordenados por hora.
async function sportsFor(date, fetchJSON = getJSON) {
  const key = date;
  if (fetchJSON === getJSON && cache.key === key && Date.now() - cache.at < CACHE_MS && cache.data) return cache.data;
  const days = [addDays(date, -1), date, addDays(date, 1)].map(ymdCompact);
  const reqs = [];
  SOCCER_LEAGUES.forEach((lg) =>
    days.forEach((d) => reqs.push({ sport: 'futbol', lg, url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/' + lg + '/scoreboard?dates=' + d })),
  );
  days.forEach((d) => reqs.push({ sport: 'nba', lg: 'nba', url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=' + d }));
  const results = await Promise.all(reqs.map((r) => fetchJSON(r.url).catch((e) => ({ error: String(e) }))));
  const errors = {};
  let okCount = 0;
  const lists = results.map((res, i) => {
    if (!res || res.error || !res.json) {
      errors[reqs[i].lg] = (res && res.error) || 'sin respuesta';
      return [];
    }
    okCount++;
    return parseEvents(res.json, reqs[i].sport, reqs[i].lg);
  });
  const all = mergeGames(lists, date);
  // Estado para el diagnóstico del reloj (sin datos personales)
  all.meta = {
    fetchedAt: Date.now(),
    requests: reqs.length,
    ok: okCount,
    failed: Object.keys(errors).length ? Object.keys(errors).slice(0, 6).map((k) => k + ' ' + errors[k]) : [],
    count: all.length,
  };
  if (fetchJSON === getJSON) cache = { key, at: Date.now(), data: all };
  return all;
}

module.exports = { sportsFor, parseEvents, mergeGames, arDate };
