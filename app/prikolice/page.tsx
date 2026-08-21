import type { Metadata } from "next";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import BrandCatalog from "../../src/components/BrandCatalog";
import { ALL_TRAILERS } from "../../src/data/trailers";

export const metadata: Metadata = {
  title: "Sve Auto Prikolice | Vesta & Trigano Katalog | Povuci.rs",
  description:
    "Kompletan katalog od 68 modela auto prikolica Vesta Trailers i Trigano: lake teretne, dvoosovinke, plato, šlep, nautika i kiperi sa fabričkim cenama i garancijom.",
  alternates: {
    canonical: "https://povuci.rs/prikolice",
  },
  openGraph: {
    title: "Sve Auto Prikolice | Vesta & Trigano Katalog",
    description:
      "Pregledajte kompletnu ponudu od 68 modela novih auto prikolica brendova Vesta Trailers i Trigano po fabričkim cenama.",
    url: "https://povuci.rs/prikolice",
    images: [
      {
        url: "/povuci/vesta-light-23.webp",
        width: 1200,
        height: 630,
        alt: "Katalog auto prikolica Povuci.rs",
      },
    ],
  },
};

// JSON-LD: CollectionPage + ItemList with all 68 trailers
const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Kompletan Katalog Auto Prikolica — Povuci.rs",
  description:
    "Katalog od 68 modela novih auto prikolica Vesta Trailers i Trigano po fabričkim cenama sa 24 meseca garancije.",
  url: "https://povuci.rs/prikolice",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: ALL_TRAILERS.map((trailer, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://povuci.rs/prikolice/${trailer.slug}`,
      name: trailer.title,
    })),
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

export default function PrikolicePage() {
  return (
    <div id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main style={{ paddingTop: "20px" }}>
        <BrandCatalog
          badgeText="SVE AUTO PRIKOLICE • 68 MODELA"
          pageTitle="KOMPLETAN KATALOG PRIKOLICA"
          pageSubtitle="Pregledajte sve dostupne modele VESTA Trailers i TRIGANO prikolica. Filtrirajte po kategoriji, B kategoriji dozvole ili pretražite po modelu."
        />
      </main>
      <Footer />
    </div>
  );
}
