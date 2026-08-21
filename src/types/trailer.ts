export type TrailerBrand = 'Vesta' | 'Trigano';

export type TrailerStatus = 'available' | 'on_order' | 'out_of_stock' | 'inactive';

export interface PovuciCategory {
  id: string; // e.g. 'lake-teretne', 'dvoosovinke', 'plato-slep', 'nautika-camci', 'moto-atv', 'kiper', 'cargo-teske'
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PovuciTrailer {
  id: string;
  brand: TrailerBrand;
  category_id: string | null;
  category?: PovuciCategory;
  model: string;
  slug: string;
  title: string;
  subtitle: string | null;
  sku: string | null;
  kp_ad_id: string | null;
  source_url: string | null;
  status: TrailerStatus;
  is_featured: boolean;

  // Filter Flags
  is_b_category: boolean; // <= 750kg bruto
  is_braked: boolean; // Kočiona / Nekočiona
  axles_count: number; // 1, 2, 3
  has_tilt: boolean; // Kipovanje
  has_support_wheel: boolean; // Pomoćni točkić
  has_winch: boolean; // Čekrk
  has_ramps: boolean; // Navozne rampe

  // Pricing & Warranty
  price_rsd: number;
  price_eur: number | null;
  old_price_rsd: number | null;
  vat_included: boolean;
  warranty_months: number;

  // Mass & Capacity in kg
  gross_weight_kg: number | null; // Ukupna masa
  curb_weight_kg: number | null; // Sopstvena masa prikolice
  payload_capacity_kg: number | null; // Neto nosivost
  real_payload_capacity_kg: number | null; // Stvarna nosivost

  // Internal Dimensions in mm (Tovarni prostor)
  internal_length_mm: number | null;
  internal_width_mm: number | null;
  internal_height_mm: number | null;
  loading_height_mm: number | null;

  // External Dimensions in mm & Boat Specs
  external_length_mm: number | null;
  external_width_mm: number | null;
  external_height_mm: number | null;
  boat_length_max_m: number | null;

  // Construction & Mechanics
  suspension: string | null;
  wheel_specs: string | null;
  chassis: string | null;
  floor_type: string | null;
  side_material: string | null;
  sides_opening: string | null;
  tie_down_points: number | null;

  // Descriptions & Media
  main_image_url: string | null;
  description: string | null;
  homologation_info: string | null;
  attributes?: Record<string, unknown>;

  sort_order: number;
  created_at: string;
  updated_at: string;

  // Relations
  images?: PovuciTrailerImage[];
  options?: PovuciTrailerOption[];
}

export interface PovuciTrailerImage {
  id: string;
  trailer_id: string;
  image_url: string;
  storage_path: string | null;
  is_main: boolean;
  sort_order: number;
  alt_text: string | null;
  created_at: string;
}

export interface PovuciTrailerOption {
  id: string;
  trailer_id: string | null;
  name: string;
  price_rsd: number;
  category: string | null; // 'cerada', 'tockovi', 'rampe', 'stope', 'nadogradnja', 'ostalo'
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

export interface TrailerFilterParams {
  brand?: TrailerBrand[];
  category_id?: string[];
  is_b_category?: boolean;
  is_braked?: boolean;
  axles_count?: number[];
  has_tilt?: boolean;
  min_price?: number;
  max_price?: number;
  min_payload?: number;
  max_payload?: number;
  min_length?: number;
  max_length?: number;
  status?: TrailerStatus;
  search_query?: string;
}
