alter table public.povuci_trailers
  add column if not exists cargo_space_dimensions text,
  add column if not exists external_dimensions text,
  add column if not exists tilt_type text;

alter table public.povuci_trailers
  alter column axles_count drop not null,
  alter column axles_count drop default,
  alter column warranty_months drop default;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'povuci_trailers_tilt_type_check'
      and conrelid = 'public.povuci_trailers'::regclass
  ) then
    alter table public.povuci_trailers
      add constraint povuci_trailers_tilt_type_check
      check (tilt_type is null or tilt_type in ('mechanical', 'hydraulic'));
  end if;
end
$$;

create function pg_temp.format_trailer_dimensions(raw_value text)
returns text
language sql
immutable
as $$
  select case
    when nullif(btrim(raw_value), '') is null then null
    else regexp_replace(
      regexp_replace(
        regexp_replace(
          btrim(raw_value),
          '[[:space:]]*[xX][[:space:]]*',
          ' × ',
          'g'
        ),
        '[[:space:]]*(mm|cm)[[:space:]]*$',
        '',
        'i'
      ),
      '([0-9])-([0-9])',
      '\1–\2',
      'g'
    ) || ' mm'
  end;
$$;

create function pg_temp.format_trailer_text(raw_value text)
returns text
language sql
immutable
as $$
  select case
    when nullif(btrim(raw_value), '') is null then null
    else upper(left(btrim(raw_value), 1)) || substring(btrim(raw_value) from 2)
  end;
$$;

with parsed as (
  select
    id,
    slug,
    brand,
    model,
    description,
    coalesce(
      substring(description from '(?im)^(?:Dimenzije tovarnog prostora(?: \(mm\))?|Unutrašnje dimenzije|Dimenzije platforme|Dimenzije utovarnog prostora|Dimenzije prihvata plovila):[[:space:]]*([^\r\n]+)'),
      case
        when slug = 'vesta-plato-2617'
          then substring(description from '(?i)tovarni prostor[[:space:]]+([0-9]+[[:space:]]*x[[:space:]]*[0-9]+[[:space:]]*mm)')
        else null
      end
    ) as cargo_raw,
    substring(description from '(?im)^(?:Gabaritne dimenzije(?: \(mm\))?|Spoljašnje dimenzije):[[:space:]]*([^\r\n]+)') as external_raw,
    substring(description from '(?im)^(?:Ukupna masa|Bruto masa \(kg\))[[:space:]]*:?[ [:space:]]*([0-9]+(?:[.,][0-9]+)?)') as gross_raw,
    substring(description from '(?im)^(?:Težina prikolice|Masa prazne prikolice \(kg\))[[:space:]]*:?[ [:space:]]*([0-9]+(?:[.,][0-9]+)?)') as curb_raw,
    substring(description from '(?im)^(?:Točkovi|Čelična felna[^:]*):[[:space:]]*([^\r\n]+)') as wheels_raw,
    substring(description from '(?im)^(?:Pod prikolice|Ispuna poda):[[:space:]]*([^\r\n]+)') as floor_raw,
    coalesce(
      substring(description from '(?im)^Šasija:[[:space:]]*([^\r\n]+)'),
      substring(description from '(?i);[[:space:]]*šasija:[[:space:]]*([^;\r\n]+)'),
      case
        when description ~* 'stranice prikolice i šasija:[[:space:]]*toplocinkovane'
          then 'toplocinkovana'
        else null
      end
    ) as chassis_raw,
    coalesce(
      substring(description from '(?im)^(?:Vešanje|Osovine):[[:space:]]*([^\r\n]+)'),
      substring(description from '(?im)^(Troosovinska|Dvoosovinska|Jednoosovinska)[^\r\n]*')
    ) as axle_raw
  from public.povuci_trailers
), normalized as (
  select
    id,
    slug,
    description,
    case slug
      when 'trigano-39750' then '3610 × 1850 × 110 mm'
      when 'trigano-650-za-skuter' then '3700–4450 mm'
      when 'trigano-p265' then '2660 × 1520 × 390 mm'
      when 'trigano-tp-2p265' then '2660 × 1520 × 390 mm'
      when 'trigano-za-amac-750' then '4670–6000 × 1810 mm'
      when 'trigano-za-amac-sa-rolerima-750' then '4670–6000 × 1810 mm'
      when 'vesta-cargo-30-1-3t' then '3003 × 1514 × 370 mm'
      when 'vesta-cargo-4120-3-5t-14c' then '4050 × 2020 × 400 mm'
      when 'vesta-light-30' then '3000 × 1520 × 370 mm'
      when 'vesta-light-30-da' then '3000 × 1520 × 370 mm'
      when 'vesta-light-30-wda' then '3000 × 1520 × 370 mm'
      when 'vesta-marine-750' then '5500 × 1850 mm'
      when 'vesta-marine-750-sa-skijama' then '5500 × 1850 mm'
      when 'vesta-moto-750-3' then '1970–2180 × 1450 mm'
      when 'vesta-plato-4120-2500kg' then '4060 × 2010 mm'
      when 'vesta-plato-4120-2700kg' then '4060 × 2010 mm'
      when 'vesta-transporter-45g-3-5t' then '4500 × 2050 mm'
      else pg_temp.format_trailer_dimensions(cargo_raw)
    end as cargo_space_dimensions,
    case slug
      when 'trigano-39750' then '5400 × 2370 mm'
      when 'trigano-p170' then '2770 × 1680 mm'
      when 'trigano-p265' then '3790 × 2010 mm'
      when 'trigano-tp-2p265' then '3790 × 2010 mm'
      when 'trigano-za-amac-750' then '4300 × 1810 mm'
      when 'trigano-za-amac-sa-rolerima-750' then '4300 × 1810 mm'
      when 'vesta-cargo-30-1-3t' then '4417 × 2030 × 900 mm'
      when 'vesta-cargo-4120-3-5t-14c' then '5425 × 2097 × 1158 mm'
      when 'vesta-light-30' then '4370 × 2030 × 900 mm'
      when 'vesta-light-30-da' then '4370 × 2030 × 900 mm'
      when 'vesta-light-30-wda' then '4370 × 2030 × 900 mm'
      when 'vesta-plato-3117-2-0-2t' then '4462 × 1730 × 1014 mm'
      when 'vesta-transporter-45g-3-5t' then '6190 × 2080 × 1030 mm'
      else pg_temp.format_trailer_dimensions(external_raw)
    end as external_dimensions,
    coalesce(
      nullif(replace(gross_raw, ',', '.'), '')::numeric,
      case when slug = 'vesta-plato-2617' then 1300 else null end
    ) as gross_weight_kg,
    coalesce(
      nullif(replace(curb_raw, ',', '.'), '')::numeric,
      case when slug = 'vesta-plato-2617' then 277 else null end
    ) as curb_weight_kg,
    case
      when axle_raw ~* '(troosovinska|tri[^\r\n]*osovine)' then 3
      when axle_raw ~* '(dvoosovinska|dve[^\r\n]*osovine|x[[:space:]]*2)' then 2
      when axle_raw ~* '(jednoosovinska|jedna[^\r\n]*osovina|torziona osovina|nosivost osovine)' then 1
      when slug = 'vesta-plato-2617' then 1
      else null
    end as axles_count,
    case
      when slug in ('trigano-tp34352-kiper', 'trigano-tp39560-kiper', 'trigano-tp39600-kiper')
        then 'hydraulic'
      when slug in ('trigano-2c250', 'trigano-tp32650-platforma')
        then 'mechanical'
      when slug in (
        'trigano-2p233', 'trigano-2d250', 'trigano-2c300',
        'trigano-2s250', 'trigano-p265', 'trigano-tp-2p265'
      ) then null
      when description ~* '(?m)^Prikolica ima mogućnost kipovanja'
        then 'mechanical'
      else null
    end as tilt_type,
    case
      when wheels_raw is null then null
      else regexp_replace(
        regexp_replace(
          regexp_replace(btrim(wheels_raw), '/[[:space:]]+([0-9])', '/\1', 'g'),
          '/[[:space:]]+R',
          ' R',
          'gi'
        ),
        '/R', ' R', 'gi'
      )
    end as wheel_specs,
    pg_temp.format_trailer_text(floor_raw) as floor_type,
    pg_temp.format_trailer_text(chassis_raw) as chassis,
    case when description ~* 'Garancija[^\r\n]*24[[:space:]]*mesec' then 24 else null end as warranty_months,
    case
      when slug in (
        'trigano-2p233', 'trigano-2d250', 'trigano-2c300',
        'trigano-2s250', 'trigano-p265', 'trigano-tp-2p265'
      ) then regexp_replace(description, '(?im)^.*kipovanj.*(?:\r?\n)?', '', 'g')
      else description
    end as cleaned_description
  from parsed
)
update public.povuci_trailers as trailer
set
  cargo_space_dimensions = normalized.cargo_space_dimensions,
  external_dimensions = normalized.external_dimensions,
  gross_weight_kg = normalized.gross_weight_kg,
  curb_weight_kg = normalized.curb_weight_kg,
  axles_count = normalized.axles_count,
  tilt_type = normalized.tilt_type,
  has_tilt = normalized.tilt_type is not null,
  wheel_specs = normalized.wheel_specs,
  floor_type = normalized.floor_type,
  chassis = normalized.chassis,
  warranty_months = normalized.warranty_months,
  description = normalized.cleaned_description,
  updated_at = now()
from normalized
where trailer.id = normalized.id;

update public.povuci_trailers
set
  internal_length_mm = case
    when cargo_space_dimensions ~ '^[0-9]+ × ' then split_part(cargo_space_dimensions, ' × ', 1)::numeric
    else null
  end,
  internal_width_mm = case
    when cargo_space_dimensions ~ '^[0-9]+ × [0-9]+' then
      replace(split_part(cargo_space_dimensions, ' × ', 2), ' mm', '')::numeric
    else null
  end,
  internal_height_mm = case
    when cargo_space_dimensions ~ '^[0-9]+ × [0-9]+ × [0-9]+' then
      replace(split_part(cargo_space_dimensions, ' × ', 3), ' mm', '')::numeric
    else null
  end,
  external_length_mm = case
    when external_dimensions ~ '^[0-9]+ × ' then split_part(external_dimensions, ' × ', 1)::numeric
    else null
  end,
  external_width_mm = case
    when external_dimensions ~ '^[0-9]+ × [0-9]+' then
      replace(split_part(external_dimensions, ' × ', 2), ' mm', '')::numeric
    else null
  end,
  external_height_mm = case
    when external_dimensions ~ '^[0-9]+ × [0-9]+ × [0-9]+' then
      replace(split_part(external_dimensions, ' × ', 3), ' mm', '')::numeric
    else null
  end;
