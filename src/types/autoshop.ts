export interface Product {
  name: string;
  brand: string;
  price: string;
  image: string;
  slug?: string;
}

export interface HeroSlide {
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  image: string;
  actions?: { label: string; variant?: "red" | "white" }[];
  icon?: boolean;
}

export interface PromoCategory {
  title: string;
  subtitle: string;
  image: string;
}

export interface FooterGroup {
  title: string;
  links: string[];
}
