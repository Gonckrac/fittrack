// Mi Día ⇄ Google Calendar
// Proyecto de Apps Script APARTE (no toca el de FitTrack Datos / Oura).
// Corre con tu cuenta, así que lee y escribe tu calendario sin permisos extra.
//
// Instalación:
//  1. script.google.com → Nuevo proyecto → pegá este archivo → nombre "Mi Día Calendar"
//  2. Cambiá SECRET por un texto largo (el mismo que CALENDAR_SECRET en Vercel)
//  3. Implementar → Nueva implementación → Tipo: Aplicación web
//     Ejecutar como: Yo · Quién tiene acceso: Cualquier persona
//  4. Autorizá el acceso al calendario y copiá la URL → CALENDAR_SCRIPT_URL en Vercel

var SECRET = 'REEMPLAZAR_CON_TU_SECRET';
var TZ = 'America/Argentina/Buenos_Aires';

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    if (!p.secret || p.secret !== SECRET) return out({ ok: false, error: 'unauthorized' });
    if (p.action === 'upcoming') return out({ ok: true, events: upcoming(p.days || 45) });
    if (p.action === 'remind') return out(remind(p));
    return out({ ok: false, error: 'acción desconocida' });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

// Eventos de los próximos `days` días del calendario principal
function upcoming(days) {
  var cal = CalendarApp.getDefaultCalendar();
  var now = new Date();
  var from = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // desde hoy 00:00
  var to = new Date(from.getTime() + days * 86400000);
  return cal.getEvents(from, to).map(function (ev) {
    return {
      title: ev.getTitle(),
      allDay: ev.isAllDayEvent(),
      start: Utilities.formatDate(ev.getStartTime(), TZ, "yyyy-MM-dd'T'HH:mm"),
      desc: (ev.getDescription() || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160),
    };
  });
}

// Recordatorio desde el reloj: evento de día completo (o con hora) en la fecha pedida.
// Idempotente: si el reloj lo manda dos veces, no se duplica (marca [midia:<id>]).
function remind(p) {
  if (!p.title || !p.date) return { ok: false, error: 'faltan title/date' };
  var cal = CalendarApp.getDefaultCalendar();
  var tag = '[midia:' + p.id + ']';
  var parts = p.date.split('-');
  var day = new Date(+parts[0], +parts[1] - 1, +parts[2]);
  var next = new Date(day.getTime() + 86400000);
  var existing = cal.getEvents(day, next).filter(function (ev) {
    return (ev.getDescription() || '').indexOf(tag) !== -1;
  });
  if (existing.length) return { ok: true, duplicate: true };
  var desc = 'Anotado desde el reloj (Mi Día). ' + tag;
  if (p.time) {
    var hm = p.time.split(':');
    var start = new Date(+parts[0], +parts[1] - 1, +parts[2], +hm[0], +hm[1]);
    cal.createEvent('📝 ' + p.title, start, new Date(start.getTime() + 30 * 60000), { description: desc });
  } else {
    cal.createAllDayEvent('📝 ' + p.title, day, { description: desc });
  }
  return { ok: true };
}

// Correlo desde el editor para autorizar y probar
function probar() {
  Logger.log(JSON.stringify(upcoming(30)).slice(0, 1000));
}
