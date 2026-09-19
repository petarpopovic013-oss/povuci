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
import { serializeJsonLd } from "../../../src/lib/seo";

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

  const hasPublishedPrice = trailer.price_rsd > 0;
  const priceText = hasPublishedPrice
    ? `${trailer.price_rsd.toLocaleString("sr-RS")} RSD`
    : "Cena na upit";

  const title = `${trailer.title} | ${priceText}`;
  const description = hasPublishedPrice
    ? `${trailer.title} (${trailer.brand}) po fabričkoj ceni od ${priceText}. Garancija 24 meseca, homologacija i COC papiri za registraciju uključeni. Pozovite 060 300 1633.`
    : `${trailer.title} (${trailer.brand}) — cena na upit. Garancija 24 meseca, homologacija i COC papiri za registraciju uključeni. Pozovite 060 300 1633.`;

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
        ? [{ url: trailer.main_image_url, alt: trailer.title }]
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
  const productImages = (trailer.images || [])
    .map((image) => image.image_url)
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));

  if (productImages.length === 0 && trailer.main_image_url) {
    productImages.push(trailer.main_image_url);
  }

  // Enhanced Product JSON-LD with additional properties
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: trailer.title,
    ...(productImages.length > 0 && { image: productImages }),
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
    ...(trailer.price_rsd > 0 && {
      offers: {
        "@type": "Offer",
        url: `https://povuci.rs/prikolice/${trailer.slug}`,
        priceCurrency: "RSD",
        price: trailer.price_rsd,
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
          telephone: "+381603001633",
        },
      },
    }),
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <Header />
      <main>
        <TrailerDetail trailer={trailer} relatedTrailers={related} />
      </main>
      <Footer />
    </div>
  );
}
