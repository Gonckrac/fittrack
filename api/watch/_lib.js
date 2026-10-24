// Utilidades compartidas por los endpoints del reloj (api/watch/*).
// Los archivos que empiezan con "_" no se publican como endpoint en Vercel.
const { createClient } = require('@supabase/supabase-js');
const { applyWatchEvents, todayAR } = require('../../public/js/utils/watch-apply.js');

const SB_URL = process.env.SUPABASE_URL || 'https://ovgavnoifmlbgjfcdphj.supabase.co';

function sb() {
  return createClient(SB_URL, process.env.SUPABASE_ANON_KEY);
}

// El reloj (vía la app Zepp) y el atajo del iPhone mandan este token.
// Configurarlo en Vercel como WATCH_TOKEN (un texto largo y aleatorio).
function authorized(req) {
  const token = process.env.WATCH_TOKEN;
  if (!token) return false;
  const got = req.headers['x-watch-token'] || (req.query && req.query.token);
  return got === token;
}

function syncKey() {
  const k = process.env.FITTRACK_SYNC_KEY;
  if (!k) throw new Error('FITTRACK_SYNC_KEY not set');
  return k;
}

async function loadState(client) {
  const { data, error } = await client.from('fittrack_state').select('data').eq('id', syncKey()).single();
  if (error || !data) throw new Error('No se pudo leer el state: ' + (error && error.message));
  return data.data || {};
}

async function saveState(client, state) {
  state._ts = Date.now();
  const { error } = await client
    .from('fittrack_state')
    .upsert({ id: syncKey(), data: state, updated_at: new Date().toISOString() });
  if (error) throw new Error('No se pudo guardar el state: ' + error.message);
}

// Guarda los eventos en la bandeja (ignora duplicados por event_id).
async function storeInbox(client, events) {
  if (!events.length) return;
  const rows = events.map((ev) => ({
    event_id: ev.id,
    sync_key: syncKey(),
    type: ev.type,
    payload: ev,
  }));
  const { error } = await client.from('fittrack_inbox').upsert(rows, { onConflict: 'event_id', ignoreDuplicates: true });
  if (error) throw new Error('No se pudo guardar en la bandeja: ' + error.message);
}

module.exports = { sb, authorized, loadState, saveState, storeInbox, applyWatchEvents, todayAR };
