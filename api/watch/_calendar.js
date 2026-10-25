// Puente al Apps Script "Mi Día Calendar" (lee y escribe tu Google Calendar).
// Variables en Vercel: CALENDAR_SCRIPT_URL y CALENDAR_SECRET.

const EXAM_RE = /(parcial|recuperatorio|final|examen|evaluaci|entrega|coloquio|\bTP\b|quiz)/i;

async function callCalendar(action, payload = {}, timeoutMs = 8000) {
  const url = process.env.CALENDAR_SCRIPT_URL;
  const secret = process.env.CALENDAR_SECRET;
  if (!url || !secret) throw new Error('CALENDAR_SCRIPT_URL o CALENDAR_SECRET sin configurar');
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, action, ...payload }),
      redirect: 'follow',
      signal: ctrl.signal,
    });
    const raw = await r.text();
    let j;
    try {
      j = JSON.parse(raw);
    } catch (e) {
      // Si Apps Script devuelve una página (login / permisos), lo decimos claro
      throw new Error('Apps Script no devolvió JSON (HTTP ' + r.status + '). ¿Acceso = "Cualquier persona"? ' + raw.slice(0, 80));
    }
    if (!j.ok) throw new Error(j.error || 'calendar error');
    return j;
  } finally {
    clearTimeout(t);
  }
}

// Saca emojis y espacios raros del título (el reloj no tiene emojis)
function cleanTitle(s) {
  return String(s || '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Parciales y entregas de los próximos días: [{ title, date, time, desc }]
async function upcomingExams(days = 60) {
  const j = await callCalendar('upcoming', { days });
  return (j.events || [])
    .filter((e) => EXAM_RE.test(e.title))
    .map((e) => {
      const [date, hm] = String(e.start).split('T');
      return { title: cleanTitle(e.title), date, time: e.allDay || hm === '00:00' ? null : hm, desc: e.desc || '' };
    })
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    .slice(0, 12);
}

async function createReminder(ev) {
  const d = ev.data || {};
  return callCalendar('remind', { id: ev.id, title: String(d.title || '').slice(0, 120), date: d.date, time: d.time || null });
}

module.exports = { upcomingExams, createReminder, cleanTitle };
