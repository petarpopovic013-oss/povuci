import type { Metadata } from "next";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import BrandCatalog from "../../src/components/BrandCatalog";
import { ALL_TRAILERS } from "../../src/data/trailers";

const triganoTrailers = ALL_TRAILERS.filter((t) => t.brand === "Trigano");

export const metadata: Metadata = {
  title: "Trigano Prikolice | Ovlašćeni Distributer Povuci.rs",
  description:
    "Kompletan asortiman TRIGANO prikolica: C, D, P serije, dvoosovinke, kiperi, nautički program i šlep prikolice po fabričkim cenama sa 24 meseca garancije.",
  alternates: {
    canonical: "https://povuci.rs/trigano",
  },
  openGraph: {
    title: "Trigano Prikolice | Ovlašćeni Distributer",
    description:
      "Kompletan asortiman TRIGANO prikolica po fabričkim cenama sa 24 meseca garancije i kompletnom dokumentacijom za registraciju.",
    url: "https://povuci.rs/trigano",
    images: [
      {
        url: "/povuci/trigano-2c250.jpg",
        width: 1200,
        height: 630,
        alt: "Trigano Auto Prikolice",
      },
    ],
  },
};

// JSON-LD: CollectionPage + ItemList (Trigano brand only)
const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Trigano — Kompletan Asortiman Prikolica",
  description:
    "Svi modeli TRIGANO auto prikolica: sandučarke, dvoosovinke, kiperi, nautičke i šlep prikolice po fabričkim cenama.",
  url: "https://povuci.rs/trigano",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: triganoTrailers.map((trailer, index) => ({
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
      name: "Trigano Prikolice",
      item: "https://povuci.rs/trigano",
    },
  ],
};

export default function TriganoPage() {
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
          brandFilter="Trigano"
          badgeText="TRIGANO • FABRIČKE CENE"
          pageTitle="TRIGANO AUTO PRIKOLICE"
          pageSubtitle="DDM Company je ovlašćeni predstavnik kompanije TRIGANO. Svi modeli se isporučuju sa kompletnom dokumentacijom za registraciju (COC i homologacija) i 24 meseca garancije."
        />
      </main>
      <Footer />
    </div>
  );
}
