-- Bandeja de eventos del reloj (Amazfit Bip Max) y del atajo de la balanza.
-- Correr UNA vez en Supabase → SQL Editor → New query → Run.

create table if not exists public.fittrack_inbox (
  event_id   text primary key,          -- id único que genera el reloj (evita duplicados)
  sync_key   text not null,             -- mismo código de sincronización de FitTrack
  type       text not null,             -- food, supp, sleep, metrics, study, wake…
  payload    jsonb not null,            -- el evento completo
  created_at timestamptz not null default now()
);

create index if not exists fittrack_inbox_key_created
  on public.fittrack_inbox (sync_key, created_at);

-- Mismo criterio que fittrack_state: la app web (clave anon) lee por sync_key
-- y el servidor inserta. Solo lectura e inserción: nadie puede editar ni borrar.
alter table public.fittrack_inbox enable row level security;

drop policy if exists "inbox read" on public.fittrack_inbox;
create policy "inbox read" on public.fittrack_inbox
  for select to anon using (true);

drop policy if exists "inbox insert" on public.fittrack_inbox;
create policy "inbox insert" on public.fittrack_inbox
  for insert to anon with check (true);
