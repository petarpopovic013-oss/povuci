import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";
import TrailerDetail from "../../../src/components/TrailerDetail";
import {
  getAllTrailerSlugs,
  getRelatedTrailers,
  getTrailerBySlug,
} from "../../../src/lib/trailers";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllTrailerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trailer = await getTrailerBySlug(slug);

  if (!trailer) {
    return {
      title: "Prikolica nije pronađena | Povuci.rs",
      description: "Traženi model prikolice nije pronađen u našem katalogu.",
    };
  }

  const priceText =
    trailer.price_rsd > 0
      ? `${trailer.price_rsd.toLocaleString("sr-RS")} RSD`
      : "Cena na upit";

  const title = `${trailer.title} | Fabrička Cena ${priceText} | Povuci.rs`;
  const description = `${trailer.title} (${trailer.brand}) po fabričkoj ceni od ${priceText}. Garancija 24 meseca, homologacija i COC papiri za registraciju uključeni. Pozovite 064 133 4589.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://povuci.rs/prikolice/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://povuci.rs/prikolice/${slug}`,
      type: "website",
      images: trailer.main_image_url
        ? [
            {
              url: trailer.main_image_url,
              width: 1200,
              height: 630,
              alt: trailer.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${trailer.title} | ${priceText}`,
      description,
      images: trailer.main_image_url ? [trailer.main_image_url] : [],
    },
  };
}

export default async function TrailerPage({ params }: PageProps) {
  const { slug } = await params;
  const trailer = await getTrailerBySlug(slug);

  if (!trailer) {
    notFound();
  }

  const related = await getRelatedTrailers(trailer, 3);

  // Enhanced Product JSON-LD with additional properties
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: trailer.title,
    image: trailer.images?.map((i) => i.image_url) || [trailer.main_image_url],
    description:
      trailer.description ||
      `${trailer.title} auto prikolica brenda ${trailer.brand} sa 24 meseca garancije.`,
    sku: trailer.slug,
    mpn: trailer.model || trailer.slug,
    brand: {
      "@type": "Brand",
      name: trailer.brand,
    },
    category: trailer.category?.name || "Auto Prikolice",
    ...(trailer.gross_weight_kg && {
      weight: {
        "@type": "QuantitativeValue",
        value: trailer.gross_weight_kg,
        unitCode: "KGM",
        name: "Bruto masa",
      },
    }),
    additionalProperty: [
      ...(trailer.axles_count
        ? [
            {
              "@type": "PropertyValue",
              name: "Broj osovina",
              value: trailer.axles_count,
            },
          ]
        : []),
      ...(trailer.is_b_category !== undefined
        ? [
            {
              "@type": "PropertyValue",
              name: "B kategorija vozačke dozvole",
              value: trailer.is_b_category ? "Da" : "Ne",
            },
          ]
        : []),
      ...(trailer.internal_length_mm && trailer.internal_width_mm
        ? [
            {
              "@type": "PropertyValue",
              name: "Dimenzije tovarnog prostora (mm)",
              value: `${trailer.internal_length_mm} x ${trailer.internal_width_mm}${trailer.internal_height_mm ? ` x ${trailer.internal_height_mm}` : ""}`,
            },
          ]
        : []),
      ...(trailer.payload_capacity_kg
        ? [
            {
              "@type": "PropertyValue",
              name: "Neto nosivost",
              value: `${trailer.payload_capacity_kg} kg`,
            },
          ]
        : []),
    ],
    offers: {
      "@type": "Offer",
      url: `https://povuci.rs/prikolice/${trailer.slug}`,
      priceCurrency: "RSD",
      price: trailer.price_rsd > 0 ? trailer.price_rsd : undefined,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      priceValidUntil: new Date(
        new Date().getFullYear(),
        11,
        31,
      ).toISOString().split("T")[0],
      seller: {
        "@type": "Organization",
        name: "DDM Company — Povuci.rs",
        url: "https://povuci.rs",
        telephone: "+381641334589",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "RS",
        },
      },
    },
  };

  // BreadcrumbList JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Početna",
        item: "https://povuci.rs",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Prikolice",
        item: "https://povuci.rs/prikolice",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: trailer.brand === "Vesta" ? "Vesta Prikolice" : "Trigano Prikolice",
        item:
          trailer.brand === "Vesta"
            ? "https://povuci.rs/vesta"
            : "https://povuci.rs/trigano",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: trailer.title,
        item: `https://povuci.rs/prikolice/${trailer.slug}`,
      },
    ],
  };

  return (
    <div id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main>
        <TrailerDetail trailer={trailer} relatedTrailers={related} />
      </main>
      <Footer />
    </div>
  );
}
