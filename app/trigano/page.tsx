import type { Metadata } from "next";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import BrandCatalog from "../../src/components/BrandCatalog";
import { getCatalogTrailers } from "../../src/lib/trailers";
import { serializeJsonLd } from "../../src/lib/seo";

export const metadata: Metadata = {
  title: "Trigano Prikolice | Ovlašćeni Distributer",
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
        width: 550,
        height: 357,
        alt: "Trigano Auto Prikolice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trigano Prikolice | Ovlašćeni Distributer",
    description:
      "Trigano auto prikolice po fabričkim cenama sa garancijom i kompletnom dokumentacijom.",
    images: ["/povuci/trigano-2c250.jpg"],
  },
};

// JSON-LD: CollectionPage + ItemList (Trigano brand only)
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

export default async function TriganoPage() {
  const trailers = await getCatalogTrailers();
  const currentTriganoTrailers = trailers.filter(
    (trailer) => trailer.brand === "Trigano"
  );
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Trigano — Kompletan Asortiman Prikolica",
    description:
      "Svi modeli TRIGANO auto prikolica: sandučarke, dvoosovinke, kiperi, nautičke i šlep prikolice po fabričkim cenama.",
    url: "https://povuci.rs/trigano",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: currentTriganoTrailers.length,
      itemListElement: currentTriganoTrailers.map((trailer, index) => ({
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
