// Partidos de los equipos de Gonza (fútbol y NBA) desde el scoreboard público de ESPN.
// Se cachea unos minutos en memoria para no pegarle a ESPN en cada sincronización.

const SOCCER_LEAGUES = [
  'arg.1', 'arg.copa', 'conmebol.libertadores', 'conmebol.sudamericana',
  'eng.1', 'eng.fa', 'eng.league_cup', 'esp.1', 'esp.copa_del_rey', 'esp.super_cup',
  'fra.1', 'fra.coupe_de_france', 'ger.1', 'ger.dfb_pokal',
  'uefa.champions', 'uefa.europa', 'fifa.cwc',
];

// Nombre en ESPN → nombre corto para el reloj
const SOCCER_TEAMS = {
  'River Plate': 'River',
  'Boca Juniors': 'Boca',
  'Arsenal': 'Arsenal',
  'Chelsea': 'Chelsea',
  'Manchester City': 'City',
  'Barcelona': 'Barcelona',
  'Real Madrid': 'Real Madrid',
  'Paris Saint-Germain': 'PSG',
  'Bayern Munich': 'Bayern',
};
const NBA_TEAMS = {
  'Philadelphia 76ers': '76ers',
  'Los Angeles Lakers': 'Lakers',
  'Miami Heat': 'Heat',
};

const LEAGUE_NAME = {
  'arg.1': 'Liga Profesional', 'arg.copa': 'Copa Argentina', 'conmebol.libertadores': 'Libertadores',
  'conmebol.sudamericana': 'Sudamericana', 'eng.1': 'Premier League', 'eng.fa': 'FA Cup', 'eng.league_cup': 'Copa de la Liga',
  'esp.1': 'LaLiga', 'esp.copa_del_rey': 'Copa del Rey', 'esp.super_cup': 'Supercopa', 'fra.1': 'Ligue 1',
  'fra.coupe_de_france': 'Copa de Francia', 'ger.1': 'Bundesliga', 'ger.dfb_pokal': 'Copa de Alemania',
  'uefa.champions': 'Champions', 'uefa.europa': 'Europa League', 'fifa.cwc': 'Mundial de Clubes', nba: 'NBA',
};

const CACHE_MS = 8 * 60 * 1000;
let cache = { key: '', at: 0, data: null };

function ymdCompact(date) {
  return date.replace(/-/g, '');
}
function addDays(date, n) {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
// Fecha argentina (YYYY-MM-DD) de un instante
function arDate(ms) {
  return new Date(ms - 3 * 3600000).toISOString().slice(0, 10);
}

async function getJSON(url, ms = 3500) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function shortName(team, sport) {
  const map = sport === 'nba' ? NBA_TEAMS : SOCCER_TEAMS;
  if (map[team.displayName]) return map[team.displayName];
  return sport === 'nba' ? team.name || team.shortDisplayName : team.shortDisplayName || team.displayName;
}

function parseEvents(json, sport, league) {
  const out = [];
  const mine = sport === 'nba' ? NBA_TEAMS : SOCCER_TEAMS;
  ((json && json.events) || []).forEach((ev) => {
    const comp = (ev.competitions || [])[0];
    if (!comp) return;
    const cs = comp.competitors || [];
    const home = cs.find((c) => c.homeAway === 'home');
    const away = cs.find((c) => c.homeAway === 'away');
    if (!home || !away) return;
    const isMine = mine[home.team.displayName] || mine[away.team.displayName];
    if (!isMine) return;
    const st = (ev.status && ev.status.type) || {};
    const start = Date.parse(ev.date);
    const tv = [];
    (comp.broadcasts || []).forEach((b) => (b.names || []).forEach((n) => tv.indexOf(n) === -1 && tv.push(n)));
    out.push({
      id: sport + ':' + ev.id,
      sport,
      league: LEAGUE_NAME[league] || league,
      start,
      date: arDate(start),
      home: shortName(home.team, sport),
      away: shortName(away.team, sport),
      mine: mine[home.team.displayName] ? 'home' : 'away',
      state: st.state || 'pre', // pre | in | post
      detail: st.shortDetail || '',
      score: st.state === 'pre' ? null : { home: parseInt(home.score, 10) || 0, away: parseInt(away.score, 10) || 0 },
      tv: tv.slice(0, 2),
    });
  });
  return out;
}

// Partidos de hoy y mañana (fecha argentina), ordenados por hora
async function sportsFor(date) {
  const key = date;
  if (cache.key === key && Date.now() - cache.at < CACHE_MS && cache.data) return cache.data;
  const range = ymdCompact(addDays(date, -1)) + '-' + ymdCompact(addDays(date, 1));
  const reqs = SOCCER_LEAGUES.map((lg) =>
    getJSON('https://site.api.espn.com/apis/site/v2/sports/soccer/' + lg + '/scoreboard?dates=' + range).then((j) => parseEvents(j, 'futbol', lg)),
  );
  reqs.push(getJSON('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=' + range).then((j) => parseEvents(j, 'nba', 'nba')));
  const lists = await Promise.all(reqs.map((p) => p.catch(() => [])));
  const seen = {};
  const tomorrow = addDays(date, 1);
  const all = []
    .concat(...lists)
    .filter((g) => (g.date === date || g.date === tomorrow) && !seen[g.id] && (seen[g.id] = true))
    .sort((a, b) => a.start - b.start);
  cache = { key, at: Date.now(), data: all };
  return all;
}

module.exports = { sportsFor };
