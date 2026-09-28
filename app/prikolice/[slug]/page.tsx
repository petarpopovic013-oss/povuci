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
import {
  absoluteUrl,
  compactText,
  getTrailerSeoDescription,
  serializeJsonLd,
} from "../../../src/lib/seo";

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
      title: "Prikolica nije pronađena",
      description: "Traženi model prikolice nije pronađen u našem katalogu.",
      robots: { index: false, follow: false },
    };
  }

  const hasPublishedPrice = trailer.price_rsd > 0;
  const priceText = hasPublishedPrice
    ? `${trailer.price_rsd.toLocaleString("sr-RS")} RSD`
    : "Cena na upit";

  const title = `${trailer.title} – Cena i specifikacije`;
  const socialTitle = `${trailer.title} | ${priceText} | Povuci.rs`;
  const description = getTrailerSeoDescription({
    title: trailer.title,
    brand: trailer.brand,
    priceRsd: trailer.price_rsd,
  });
  const canonical = absoluteUrl(`/prikolice/${trailer.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        "sr-Latn-RS": canonical,
      },
    },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      type: "website",
      locale: "sr_RS",
      siteName: "Povuci.rs",
      images: trailer.main_image_url
        ? [{ url: trailer.main_image_url, alt: trailer.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: trailer.main_image_url ? [trailer.main_image_url] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
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

  const productUrl = absoluteUrl(`/prikolice/${trailer.slug}`);
  const productId = `${productUrl}#product`;
  const breadcrumbId = `${productUrl}#breadcrumb`;
  const structuredDescription = compactText(
    trailer.description ||
      `${trailer.title} auto prikolica brenda ${trailer.brand} sa 24 meseca garancije.`
  );

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": productId,
    url: productUrl,
    name: trailer.title,
    ...(productImages.length > 0 && { image: productImages }),
    description: structuredDescription,
    sku: trailer.sku || trailer.slug,
    mpn: trailer.model || trailer.slug,
    brand: {
      "@type": "Brand",
      name: trailer.brand,
    },
    category: trailer.category?.name || "Auto Prikolice",
    mainEntityOfPage: {
      "@id": productUrl,
    },
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
      ...(trailer.is_braked !== undefined
        ? [
            {
              "@type": "PropertyValue",
              name: "Kočiona prikolica",
              value: trailer.is_braked ? "Da" : "Ne",
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
        "@id": `${productUrl}#offer`,
        url: productUrl,
        priceCurrency: "RSD",
        price: trailer.price_rsd,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: trailer.price_rsd,
          priceCurrency: "RSD",
          valueAddedTaxIncluded: trailer.vat_included,
        },
        seller: {
          "@type": "Organization",
          "@id": "https://povuci.rs/#organization",
          name: "DDM Company — Povuci.rs",
          url: "https://povuci.rs",
          telephone: "+381603001633",
        },
      },
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": breadcrumbId,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Početna",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Prikolice",
        item: absoluteUrl("/prikolice"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: trailer.brand === "Vesta" ? "Vesta Prikolice" : "Trigano Prikolice",
        item:
          trailer.brand === "Vesta" ? absoluteUrl("/vesta") : absoluteUrl("/trigano"),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: trailer.title,
        item: productUrl,
      },
    ],
  };
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": productUrl,
    url: productUrl,
    name: `${trailer.title} – Cena i specifikacije`,
    description: getTrailerSeoDescription({
      title: trailer.title,
      brand: trailer.brand,
      priceRsd: trailer.price_rsd,
    }),
    inLanguage: "sr-Latn",
    isPartOf: {
      "@id": "https://povuci.rs/#website",
    },
    breadcrumb: {
      "@id": breadcrumbId,
    },
    mainEntity: {
      "@id": productId,
    },
    ...(trailer.updated_at && { dateModified: trailer.updated_at }),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(webPageJsonLd) }}
      />
      <Header />
      <main>
        <TrailerDetail trailer={trailer} relatedTrailers={related} />
      </main>
      <Footer />
    </div>
  );
}
