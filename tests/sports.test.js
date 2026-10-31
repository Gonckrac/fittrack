// Partidos: el backend pide ESPN día por día (el rango AAAAMMDD-AAAAMMDD falla),
// filtra mis equipos por id o nombre, no da por terminado un partido suspendido.
// Las respuestas de ESPN son de prueba, con la misma forma que la API real.
const test = require('node:test');
const assert = require('node:assert/strict');
const { sportsFor, parseEvents } = require('../api/watch/_sports.js');

function ev(id, dateIso, home, away, state = 'pre', extra = {}) {
  return {
    id, date: dateIso,
    status: { type: { state, completed: state === 'post', shortDetail: '' } },
    competitions: [{
      competitors: [
        { homeAway: 'home', score: extra.hs || '0', team: home },
        { homeAway: 'away', score: extra.as || '0', team: away },
      ],
      broadcasts: [{ names: ['ESPN'] }],
    }],
    ...(extra.status ? { status: extra.status } : {}),
  };
}
const CHE = { id: '363', displayName: 'Chelsea', abbreviation: 'CHE', shortDisplayName: 'Chelsea' };
const MUN = { id: '360', displayName: 'Manchester United', abbreviation: 'MAN', shortDisplayName: 'Man United' };
const PHI = { id: '20', displayName: 'Philadelphia 76ers', abbreviation: 'PHI', name: '76ers' };
const CHA = { id: '30', displayName: 'Charlotte Hornets', abbreviation: 'CHA', name: 'Hornets' };

test('pide un día por vez (nunca un rango) y encuentra mis partidos', async () => {
  const urls = [];
  const fake = async (url) => {
    urls.push(url);
    if (/\?dates=\d{8}-\d{8}/.test(url)) return { error: 'HTTP 400' }; // como ESPN real
    if (url.includes('soccer/eng.1/') && url.endsWith('dates=20261031')) return { json: { events: [ev('401879248', '2026-10-31T12:30Z', CHE, MUN)] } };
    if (url.includes('basketball/nba/') && url.endsWith('dates=20261031')) return { json: { events: [ev('401', '2026-10-31T22:00Z', CHA, PHI)] } };
    return { json: { events: [] } };
  };
  const games = await sportsFor('2026-10-31', fake);
  assert.ok(urls.every((u) => !/dates=\d{8}-\d{8}/.test(u)), 'ninguna URL con rango');
  assert.equal(games.length, 2);
  assert.deepEqual(games.map((g) => [g.home, g.away, g.mine]), [['Chelsea', 'Man United', 'home'], ['Hornets', '76ers', 'away']]);
  assert.equal(games[0].date, '2026-10-31');
  assert.equal(new Date(games[0].start).toISOString(), '2026-10-31T12:30:00.000Z', 'hora exacta (09:30 en Argentina)');
  assert.equal(games.meta.count, 2);
  assert.equal(games.meta.failed.length, 0);
});

test('partido 00:30 de Argentina que ESPN pone el día anterior: entra igual', async () => {
  const fake = async (url) =>
    url.includes('nba') && url.endsWith('dates=20261031')
      ? { json: { events: [ev('402', '2026-11-01T03:30Z', PHI, CHA)] } } // 00:30 del 1/11 en AR
      : { json: { events: [] } };
  const games = await sportsFor('2026-11-01', fake);
  assert.equal(games.length, 1);
  assert.equal(games[0].date, '2026-11-01');
});

test('suspendido/postergado no cuenta como resultado final', () => {
  const out = parseEvents({ events: [ev('9', '2026-10-31T12:30Z', CHE, MUN, 'post', { status: { type: { state: 'post', completed: false, shortDetail: 'Postponed' } } })] }, 'futbol', 'eng.1');
  assert.equal(out[0].state, 'in');
});

test('resultado final confirmado con marcador', () => {
  const out = parseEvents({ events: [ev('9', '2026-10-31T12:30Z', CHE, MUN, 'post', { hs: '2', as: '1' })] }, 'futbol', 'eng.1');
  assert.equal(out[0].state, 'post');
  assert.deepEqual(out[0].score, { home: 2, away: 1 });
});

test('si ESPN falla, se informa en el diagnóstico (no se confunde con "no hay partidos")', async () => {
  const games = await sportsFor('2026-10-31', async () => ({ error: 'timeout' }));
  assert.equal(games.length, 0);
  assert.equal(games.meta.ok, 0);
  assert.ok(games.meta.failed.length > 0);
});
