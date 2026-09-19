update public.povuci_categories
set
  name = case id
    when 'lake-teretne' then 'Lake auto prikolice do 750 kg'
    when 'cargo-teske' then 'Cargo i teški teret'
    when 'nautika-camci' then 'Nautika i čamci'
    when 'kiper' then 'Kiper (hidraulika)'
    when 'moto-atv' then 'Moto i ATV / UTV / Quad / Buggy'
    when 'plato-slep' then 'Plato i šlep prikolice'
    else name
  end,
  sort_order = case id
    when 'lake-teretne' then 1
    when 'cargo-teske' then 2
    when 'nautika-camci' then 3
    when 'kiper' then 4
    when 'moto-atv' then 5
    when 'plato-slep' then 6
    else sort_order
  end,
  is_active = id <> 'dvoosovinke',
  updated_at = now()
where id in (
  'lake-teretne',
  'cargo-teske',
  'nautika-camci',
  'kiper',
  'moto-atv',
  'plato-slep',
  'dvoosovinke'
);

create table if not exists public.povuci_trailer_categories (
  trailer_id uuid not null references public.povuci_trailers(id) on delete cascade,
  category_id text not null references public.povuci_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (trailer_id, category_id)
);

create index if not exists povuci_trailer_categories_category_id_idx
  on public.povuci_trailer_categories (category_id);

alter table public.povuci_trailer_categories enable row level security;
revoke all on table public.povuci_trailer_categories from anon, authenticated;

insert into public.povuci_trailers (
  brand,
  category_id,
  model,
  slug,
  title,
  source_url,
  status,
  is_b_category,
  is_braked,
  axles_count,
  has_tilt,
  has_support_wheel,
  has_winch,
  has_ramps,
  price_rsd,
  vat_included,
  warranty_months,
  gross_weight_kg,
  curb_weight_kg,
  payload_capacity_kg,
  internal_length_mm,
  internal_width_mm,
  loading_height_mm,
  suspension,
  wheel_specs,
  chassis,
  floor_type,
  tie_down_points,
  main_image_url,
  description
)
values (
  'Vesta',
  'plato-slep',
  'Plato 2617',
  'vesta-plato-2617',
  'Vesta Plato 2617',
  'https://vesta-trailers.com/sr/catalog/plato/plato-2617/',
  'available',
  false,
  true,
  1,
  false,
  true,
  false,
  true,
  207215,
  true,
  24,
  1300,
  277,
  1023,
  2630,
  1670,
  569,
  'Jedna KNOTT torziona osovina sa kočionim sistemom',
  '195/55 R10C',
  'Toplocinkovana čelična šasija',
  'Vodootporni protivklizajući laminirani šper',
  4,
  'https://vesta-trailers.com/wp-content/uploads/2026/07/vesta-trailers-plato-2617-5.jpg',
  'Vesta Plato 2617 je jednoosovinska kočiona plato prikolica bruto mase 1300 kg. Korisna nosivost je 1023 kg, a tovarni prostor 2630 x 1670 mm. Cena uključuje PDV; za konačnu ponudu kontaktirajte prodaju.'
)
on conflict (slug) do nothing;

insert into public.povuci_trailer_categories (trailer_id, category_id)
select id, 'lake-teretne'
from public.povuci_trailers
where slug in (
  'trigano-p150', 'trigano-p170', 'trigano-p202', 'trigano-p205',
  'trigano-p233', 'trigano-2p233', 'trigano-p265', 'trigano-tp-2p265',
  'trigano-c200', 'trigano-tp-40393-c250', 'trigano-2c250',
  'trigano-d200', 'trigano-d250', 'trigano-2d250', 'trigano-tp39550',
  'vesta-uno-20', 'vesta-light-15', 'vesta-light-17', 'vesta-light-20', 'vesta-light-20w',
  'vesta-light-23', 'vesta-light-23-da', 'vesta-light-23-wda',
  'vesta-light-25', 'vesta-light-25-da', 'vesta-light-26-h', 'vesta-light-26-hda',
  'vesta-light-30', 'vesta-light-30-da', 'vesta-light-30-hda'
)
on conflict do nothing;

insert into public.povuci_trailer_categories (trailer_id, category_id)
select id, 'cargo-teske'
from public.povuci_trailers
where lower(model) like 'cargo %'
   or lower(model) like 'craft %'
   or slug in ('trigano-2c300', 'trigano-tp39600-kiper', 'trigano-2s250')
on conflict do nothing;

insert into public.povuci_trailer_categories (trailer_id, category_id)
select id, 'nautika-camci'
from public.povuci_trailers
where category_id = 'nautika-camci'
on conflict do nothing;

insert into public.povuci_trailer_categories (trailer_id, category_id)
select id, 'kiper'
from public.povuci_trailers
where slug in (
  'trigano-tp39600-kiper',
  'trigano-tp39560-kiper',
  'trigano-tp34352-kiper'
)
on conflict do nothing;

insert into public.povuci_trailer_categories (trailer_id, category_id)
select id, 'moto-atv'
from public.povuci_trailers
where slug in (
  'vesta-moto-750-3', 'trigano-p304', 'vesta-plato-3015',
  'vesta-plato-3017', 'vesta-plato-2513', 'vesta-plato-3117-2-0-2t',
  'vesta-plato-2617', 'trigano-39750'
)
on conflict do nothing;

insert into public.povuci_trailer_categories (trailer_id, category_id)
select id, 'plato-slep'
from public.povuci_trailers
where lower(model) like '%plato%'
   or lower(model) like '%šlep%'
   or lower(model) like '%slep%'
on conflict do nothing;

update public.povuci_trailers as trailer
set category_id = categories.category_id
from (
  select distinct on (membership.trailer_id)
    membership.trailer_id,
    membership.category_id
  from public.povuci_trailer_categories as membership
  join public.povuci_categories as category on category.id = membership.category_id
  order by membership.trailer_id, category.sort_order, membership.category_id
) as categories
where trailer.id = categories.trailer_id;
