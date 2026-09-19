import type { Metadata } from "next";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import BrandCatalog from "../../src/components/BrandCatalog";
import { getCatalogTrailers } from "../../src/lib/trailers";
import { serializeJsonLd } from "../../src/lib/seo";

export const metadata: Metadata = {
  title: "Sve Auto Prikolice | Vesta i Trigano Katalog",
  description:
    "Kompletan katalog auto prikolica Vesta Trailers i Trigano: lake, cargo, plato, šlep, nautika, moto i kiper prikolice sa fabričkim cenama i garancijom.",
  alternates: {
    canonical: "https://povuci.rs/prikolice",
  },
  openGraph: {
    title: "Sve Auto Prikolice | Vesta & Trigano Katalog",
    description:
      "Pregledajte kompletnu ponudu novih auto prikolica brendova Vesta Trailers i Trigano po fabričkim cenama.",
    url: "https://povuci.rs/prikolice",
    images: [
      {
        url: "/povuci/vesta-light-23.webp",
        width: 622,
        height: 359,
        alt: "Katalog auto prikolica Povuci.rs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sve Auto Prikolice | Vesta i Trigano Katalog",
    description:
      "Kompletan katalog novih Vesta i Trigano auto prikolica po fabričkim cenama.",
    images: ["/povuci/vesta-light-23.webp"],
  },
};

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
      name: "Sve Prikolice",
      item: "https://povuci.rs/prikolice",
    },
  ],
};

export default async function PrikolicePage() {
  const trailers = await getCatalogTrailers();
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Kompletan Katalog Auto Prikolica — Povuci.rs",
    description:
      "Katalog novih auto prikolica Vesta Trailers i Trigano po fabričkim cenama sa 24 meseca garancije.",
    url: "https://povuci.rs/prikolice",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: trailers.length,
      itemListElement: trailers.map((trailer, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://povuci.rs/prikolice/${trailer.slug}`,
        name: trailer.title,
      })),
    },
  };

  return (
    <div id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <Header />
      <main style={{ paddingTop: "20px" }}>
        <BrandCatalog
          trailers={trailers}
          badgeText={`SVE AUTO PRIKOLICE • ${trailers.length} MODELA`}
          pageTitle="KOMPLETAN KATALOG PRIKOLICA"
          pageSubtitle="Pregledajte sve dostupne modele VESTA Trailers i TRIGANO prikolica. Jedan model može pripadati u više namenskih filtera, a katalog možete pretražiti i po nazivu modela."
        />
      </main>
      <Footer />
    </div>
  );
}
