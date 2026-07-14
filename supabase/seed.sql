insert into public.regions (id, slug, name, status, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', 'seoul', 'Seoul', 'active', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000002', 'busan', 'Busan', 'active', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00');

insert into public.channels (id, slug, name, status, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000101', 'ttg', 'TtG', 'active', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000102', 'future-kitchen', 'Future Kitchen', 'active', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00');

insert into public.series (id, channel_id, slug, title, status, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'ttg-main', 'TtG Main Series', 'active', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000102', 'future-main', 'Future Main Series', 'active', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00');

insert into public.episodes (id, series_id, slug, title, youtube_video_id, published_at, status, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', 'episode-001', 'Golden Noodle First Visit', 'dQw4w9WgXcQ', timestamptz '2026-06-01 00:00:00+00', 'published', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000202', 'episode-001', 'Golden Noodle Revisited', '9bZkp7q19f0', timestamptz '2026-06-15 00:00:00+00', 'published', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000201', 'episode-002', 'Market Table', 'M7lc1UVf-VE', timestamptz '2026-06-29 00:00:00+00', 'published', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00');

insert into public.restaurants (
  id, region_id, slug, name, branch_name, address, editorial_note, latitude, longitude, status, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', 'golden-noodle', 'Golden Noodle', 'Jongno Branch', '12 Example-ro, Jongno-gu, Seoul', 'A shared canonical restaurant across two channels.', 37.566500, 126.978000, 'verified', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000002', 'market-table', 'Market Table', null, '34 Example-gil, Busan', 'A second deterministic fixture restaurant.', 35.179600, 129.075600, 'verified', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00');

insert into public.appearances (id, episode_id, restaurant_id, appearance_order, status, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000401', 1, 'verified', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000401', 1, 'verified', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000402', 1, 'verified', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00');

insert into public.external_places (
  id, restaurant_id, provider, external_id, place_url, latitude, longitude, status, last_verified_at, created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000401', 'naver', 'picpic-golden-noodle', null, 37.566500, 126.978000, 'verified', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00'),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000402', 'naver', 'picpic-market-table', null, 35.179600, 129.075600, 'verified', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00', timestamptz '2026-07-14 00:00:00+00');
