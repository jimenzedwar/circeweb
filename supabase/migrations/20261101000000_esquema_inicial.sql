-- =====================================================================
-- Circe Witch · esquema inicial
-- Catálogo, chatbot, testimonios, solicitudes, estadísticas y contenido.
-- Ejecutar una vez en el SQL Editor de Supabase (o con `supabase db push`).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- Administradoras ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  creado timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Catálogo ----------
create table if not exists public.secciones (
  id text primary key,
  nombre text not null,
  corto text not null default '',
  motivo text not null default 'luna',
  palabra text not null default '',
  descripcion text not null default '',
  sinonimos text[] not null default '{}',
  orden int not null default 0,
  visible boolean not null default true
);

create table if not exists public.categorias_productos (
  id text primary key,
  nombre text not null,
  orden int not null default 0
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  tipo text not null default 'servicio' check (tipo in ('servicio', 'producto')),
  seccion text not null,
  nombre text not null,
  nivel text not null default '',
  motivo text not null default 'luna',
  precio_usd int check (precio_usd is null or precio_usd >= 0),
  precio_cop int check (precio_cop is null or precio_cop >= 0),
  precio_texto text,
  descripcion text not null default '',
  incluye_titulo text,
  incluye text[] not null default '{}',
  palabras_clave text[] not null default '{}',
  imagen_url text,
  destacado boolean not null default false,
  visible boolean not null default true,
  orden int not null default 0,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index if not exists items_tipo_seccion_idx on public.items (tipo, seccion, orden);

-- ---------- Chatbot ----------
create table if not exists public.preguntas (
  id uuid primary key default gen_random_uuid(),
  clave text unique,
  pregunta text not null,
  respuesta text not null default '',
  palabras_clave text[] not null default '{}',
  -- 'general' | 'seccion:<id>' | 'servicio:<slug>'
  aplica_a text[] not null default '{general}',
  emocion text not null default 'hablando',
  acciones jsonb not null default '[]',
  visible boolean not null default true,
  orden int not null default 0,
  actualizado timestamptz not null default now()
);

create table if not exists public.preguntas_sin_respuesta (
  id bigint generated always as identity primary key,
  texto text not null check (char_length(texto) between 2 and 300),
  contexto text,
  resuelta boolean not null default false,
  creado timestamptz not null default now()
);

-- ---------- Testimonios (capturas de WhatsApp ancladas a un servicio) ----------
create table if not exists public.testimonios (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.items (id) on delete set null,
  imagen_url text not null,
  pais text not null default '',
  fecha_texto text not null default '',
  visible boolean not null default true,
  orden int not null default 0,
  creado timestamptz not null default now()
);
create index if not exists testimonios_item_idx on public.testimonios (item_id);

-- ---------- Solicitudes enviadas desde el formulario ----------
create table if not exists public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.items (id) on delete set null,
  item_nombre text not null default '' check (char_length(item_nombre) <= 200),
  tipo text not null default 'servicio' check (tipo in ('servicio', 'producto', 'consulta')),
  situaciones text[] not null default '{}',
  resumen text not null default '' check (char_length(resumen) <= 400),
  nombre text not null default '' check (char_length(nombre) <= 60),
  pais text not null default '' check (char_length(pais) <= 40),
  origen text not null default '' check (char_length(origen) <= 40),
  estado text not null default 'nueva' check (estado in ('nueva', 'atendida')),
  creado timestamptz not null default now()
);
create index if not exists solicitudes_creado_idx on public.solicitudes (creado desc);

-- ---------- Eventos para las gráficas del panel ----------
create table if not exists public.eventos (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('visita', 'clic_solicitar', 'clic_seccion', 'busqueda', 'chat_abierto', 'whatsapp')),
  origen text not null default '' check (char_length(origen) <= 40),
  seccion text check (seccion is null or char_length(seccion) <= 40),
  item_id uuid references public.items (id) on delete set null,
  creado timestamptz not null default now()
);
create index if not exists eventos_tipo_creado_idx on public.eventos (tipo, creado desc);

-- ---------- Contenido editable (clave → valor) ----------
create table if not exists public.contenido (
  clave text primary key,
  valor text not null default ''
);

-- ---------- updated_at ----------
create or replace function public.tocar_actualizado()
returns trigger language plpgsql as $$
begin
  new.actualizado = now();
  return new;
end;
$$;
drop trigger if exists items_actualizado on public.items;
create trigger items_actualizado before update on public.items for each row execute function public.tocar_actualizado();
drop trigger if exists preguntas_actualizado on public.preguntas;
create trigger preguntas_actualizado before update on public.preguntas for each row execute function public.tocar_actualizado();

-- =====================================================================
-- Seguridad por filas: el público solo lee lo visible y solo puede
-- insertar solicitudes, eventos y preguntas sin respuesta.
-- =====================================================================
alter table public.admins enable row level security;
alter table public.secciones enable row level security;
alter table public.categorias_productos enable row level security;
alter table public.items enable row level security;
alter table public.preguntas enable row level security;
alter table public.preguntas_sin_respuesta enable row level security;
alter table public.testimonios enable row level security;
alter table public.solicitudes enable row level security;
alter table public.eventos enable row level security;
alter table public.contenido enable row level security;

drop policy if exists "admins: ver la propia" on public.admins;
create policy "admins: ver la propia" on public.admins for select to authenticated using (user_id = auth.uid());

-- lectura pública
drop policy if exists "secciones: leer" on public.secciones;
create policy "secciones: leer" on public.secciones for select using (visible or public.is_admin());
drop policy if exists "categorias: leer" on public.categorias_productos;
create policy "categorias: leer" on public.categorias_productos for select using (true);
drop policy if exists "items: leer" on public.items;
create policy "items: leer" on public.items for select using (visible or public.is_admin());
drop policy if exists "preguntas: leer" on public.preguntas;
create policy "preguntas: leer" on public.preguntas for select using ((visible and respuesta <> '') or public.is_admin());
drop policy if exists "testimonios: leer" on public.testimonios;
create policy "testimonios: leer" on public.testimonios for select using (visible or public.is_admin());
drop policy if exists "contenido: leer" on public.contenido;
create policy "contenido: leer" on public.contenido for select using (true);

-- escritura de la administradora
drop policy if exists "secciones: admin" on public.secciones;
create policy "secciones: admin" on public.secciones for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "categorias: admin" on public.categorias_productos;
create policy "categorias: admin" on public.categorias_productos for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "items: admin" on public.items;
create policy "items: admin" on public.items for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "preguntas: admin" on public.preguntas;
create policy "preguntas: admin" on public.preguntas for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "testimonios: admin" on public.testimonios;
create policy "testimonios: admin" on public.testimonios for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "contenido: admin" on public.contenido;
create policy "contenido: admin" on public.contenido for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- formularios públicos (solo insertar)
drop policy if exists "solicitudes: crear" on public.solicitudes;
create policy "solicitudes: crear" on public.solicitudes for insert to anon, authenticated with check (estado = 'nueva');
drop policy if exists "solicitudes: admin" on public.solicitudes;
create policy "solicitudes: admin" on public.solicitudes for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "eventos: crear" on public.eventos;
create policy "eventos: crear" on public.eventos for insert to anon, authenticated with check (true);
drop policy if exists "eventos: admin" on public.eventos;
create policy "eventos: admin" on public.eventos for select to authenticated using (public.is_admin());
drop policy if exists "sin respuesta: crear" on public.preguntas_sin_respuesta;
create policy "sin respuesta: crear" on public.preguntas_sin_respuesta for insert to anon, authenticated with check (resuelta = false);
drop policy if exists "sin respuesta: admin" on public.preguntas_sin_respuesta;
create policy "sin respuesta: admin" on public.preguntas_sin_respuesta for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- Estadísticas del panel (solo administradoras)
-- =====================================================================
create or replace function public.estadisticas(dias int default 7)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  desde timestamptz := date_trunc('day', now()) - make_interval(days => greatest(dias, 1) - 1);
  r jsonb;
begin
  if not public.is_admin() then
    raise exception 'No autorizado';
  end if;
  select jsonb_build_object(
    'visitas', (select count(*) from eventos where tipo = 'visita' and creado >= desde),
    'clics_solicitar', (select count(*) from eventos where tipo = 'clic_solicitar' and creado >= desde),
    'solicitudes', (select count(*) from solicitudes where creado >= desde),
    'sin_respuesta', (select count(*) from preguntas_sin_respuesta where not resuelta and creado >= desde),
    'origenes', coalesce((select jsonb_agg(x order by x.n desc) from (
        select origen as etiqueta, count(*) as n from eventos
        where tipo = 'clic_solicitar' and creado >= desde group by origen) x), '[]'),
    'top', coalesce((select jsonb_agg(x order by x.n desc) from (
        select item_nombre as etiqueta, count(*) as n from solicitudes
        where creado >= desde and item_nombre <> '' group by item_nombre order by count(*) desc limit 8) x), '[]'),
    'secciones', coalesce((select jsonb_agg(x order by x.n desc) from (
        select coalesce(seccion, '') as etiqueta, count(*) as n from eventos
        where tipo = 'clic_seccion' and creado >= desde group by seccion) x), '[]'),
    'dias', (select jsonb_agg(jsonb_build_object('dia', to_char(d, 'YYYY-MM-DD'), 'n',
        (select count(*) from solicitudes s where s.creado >= d and s.creado < d + interval '1 day')) order by d)
        from generate_series(desde, date_trunc('day', now()), interval '1 day') d)
  ) into r;
  return r;
end;
$$;
revoke all on function public.estadisticas(int) from public, anon;
grant execute on function public.estadisticas(int) to authenticated;

-- =====================================================================
-- Imágenes (fotos de servicios, retrato de Circe y capturas)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media: leer" on storage.objects;
create policy "media: leer" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media: admin subir" on storage.objects;
create policy "media: admin subir" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media: admin cambiar" on storage.objects;
create policy "media: admin cambiar" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media: admin borrar" on storage.objects;
create policy "media: admin borrar" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
