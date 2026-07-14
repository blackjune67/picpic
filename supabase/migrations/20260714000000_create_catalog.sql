create schema if not exists extensions;

create extension if not exists "pgcrypto" with schema extensions;

create table public.channels (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint channels_slug_key unique (slug),
  constraint channels_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint channels_name_check check (char_length(btrim(name)) between 1 and 120),
  constraint channels_status_check check (status in ('active', 'archived')),
  constraint channels_timestamps_check check (updated_at >= created_at)
);

create table public.series (
  id uuid primary key default extensions.gen_random_uuid(),
  channel_id uuid not null,
  slug text not null,
  title text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint series_channel_id_fkey foreign key (channel_id)
    references public.channels (id) on delete cascade,
  constraint series_channel_slug_key unique (channel_id, slug),
  constraint series_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint series_title_check check (char_length(btrim(title)) between 1 and 160),
  constraint series_status_check check (status in ('active', 'archived')),
  constraint series_timestamps_check check (updated_at >= created_at)
);

create table public.regions (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null,
  name text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint regions_slug_key unique (slug),
  constraint regions_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint regions_name_check check (char_length(btrim(name)) between 1 and 120),
  constraint regions_status_check check (status in ('active', 'archived')),
  constraint regions_timestamps_check check (updated_at >= created_at)
);

create table public.episodes (
  id uuid primary key default extensions.gen_random_uuid(),
  series_id uuid not null,
  slug text not null,
  title text not null,
  youtube_video_id text not null,
  published_at timestamptz,
  metadata_fetched_at timestamptz,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint episodes_series_id_fkey foreign key (series_id)
    references public.series (id) on delete cascade,
  constraint episodes_series_slug_key unique (series_id, slug),
  constraint episodes_youtube_video_id_key unique (youtube_video_id),
  constraint episodes_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint episodes_title_check check (char_length(btrim(title)) between 1 and 200),
  constraint episodes_youtube_video_id_format check (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  constraint episodes_status_check check (status in ('draft', 'published', 'unavailable', 'archived')),
  constraint episodes_published_at_check check (status <> 'published' or published_at is not null),
  constraint episodes_metadata_fetched_at_check check (
    metadata_fetched_at is null or metadata_fetched_at >= created_at
  ),
  constraint episodes_timestamps_check check (updated_at >= created_at)
);

create table public.restaurants (
  id uuid primary key default extensions.gen_random_uuid(),
  region_id uuid not null,
  slug text not null,
  name text not null,
  branch_name text,
  address text not null,
  editorial_note text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint restaurants_region_id_fkey foreign key (region_id)
    references public.regions (id) on delete restrict,
  constraint restaurants_slug_key unique (slug),
  constraint restaurants_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint restaurants_name_check check (char_length(btrim(name)) between 1 and 200),
  constraint restaurants_address_check check (char_length(btrim(address)) between 1 and 300),
  constraint restaurants_coordinates_check check (
    (latitude is null) = (longitude is null)
    and (latitude is null or latitude between -90 and 90)
    and (longitude is null or longitude between -180 and 180)
  ),
  constraint restaurants_status_check check (status in ('draft', 'verified', 'archived')),
  constraint restaurants_timestamps_check check (updated_at >= created_at)
);

create table public.appearances (
  id uuid primary key default extensions.gen_random_uuid(),
  episode_id uuid not null,
  restaurant_id uuid not null,
  appearance_order integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appearances_episode_id_fkey foreign key (episode_id)
    references public.episodes (id) on delete cascade,
  constraint appearances_restaurant_id_fkey foreign key (restaurant_id)
    references public.restaurants (id) on delete cascade,
  constraint appearances_episode_order_key unique (episode_id, appearance_order),
  constraint appearances_episode_restaurant_key unique (episode_id, restaurant_id),
  constraint appearances_episode_order_check check (appearance_order > 0),
  constraint appearances_status_check check (status in ('pending', 'verified', 'rejected')),
  constraint appearances_timestamps_check check (updated_at >= created_at)
);

create table public.external_places (
  id uuid primary key default extensions.gen_random_uuid(),
  restaurant_id uuid not null,
  provider text not null,
  external_id text not null,
  place_url text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  status text not null default 'pending',
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint external_places_restaurant_id_fkey foreign key (restaurant_id)
    references public.restaurants (id) on delete cascade,
  constraint external_places_provider_external_id_key unique (provider, external_id),
  constraint external_places_restaurant_provider_key unique (restaurant_id, provider),
  constraint external_places_provider_check check (provider ~ '^[a-z][a-z0-9_-]{1,31}$'),
  constraint external_places_external_id_check check (char_length(btrim(external_id)) between 1 and 200),
  constraint external_places_coordinates_check check (
    (latitude is null) = (longitude is null)
    and (latitude is null or latitude between -90 and 90)
    and (longitude is null or longitude between -180 and 180)
  ),
  constraint external_places_status_check check (status in ('pending', 'verified', 'rejected')),
  constraint external_places_verified_at_check check (
    status <> 'verified' or last_verified_at is not null
  ),
  constraint external_places_timestamps_check check (updated_at >= created_at)
);

create index series_channel_id_idx on public.series (channel_id);
create index episodes_series_id_idx on public.episodes (series_id);
create index episodes_published_at_idx on public.episodes (published_at desc nulls last);
create index restaurants_region_id_idx on public.restaurants (region_id);
create index appearances_episode_id_idx on public.appearances (episode_id, appearance_order);
create index appearances_restaurant_id_idx on public.appearances (restaurant_id);
create index external_places_restaurant_id_idx on public.external_places (restaurant_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_catalog
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

create trigger channels_set_updated_at
before update on public.channels
for each row execute function public.set_updated_at();

create trigger series_set_updated_at
before update on public.series
for each row execute function public.set_updated_at();

create trigger regions_set_updated_at
before update on public.regions
for each row execute function public.set_updated_at();

create trigger episodes_set_updated_at
before update on public.episodes
for each row execute function public.set_updated_at();

create trigger restaurants_set_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at();

create trigger appearances_set_updated_at
before update on public.appearances
for each row execute function public.set_updated_at();

create trigger external_places_set_updated_at
before update on public.external_places
for each row execute function public.set_updated_at();
