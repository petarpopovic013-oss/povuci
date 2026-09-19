import type { Metadata } from "next";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import BrandCatalog from "../../src/components/BrandCatalog";
import { getCatalogTrailers } from "../../src/lib/trailers";
import { serializeJsonLd } from "../../src/lib/seo";

export const metadata: Metadata = {
  title: "Vesta Prikolice | Ovlašćeni Distributer",
  description:
    "Kompletan asortiman VESTA prikolica: Light, Cargo, Plato, Marine čamci i Moto program po fabričkim cenama sa 24 meseca garancije. Ovlašćeni distributer DDM Company.",
  alternates: {
    canonical: "https://povuci.rs/vesta",
  },
  openGraph: {
    title: "Vesta Trailers Prikolice | Ovlašćeni Distributer",
    description:
      "Kompletan asortiman VESTA prikolica po fabričkim cenama sa 24 meseca garancije i kompletnom dokumentacijom za registraciju.",
    url: "https://povuci.rs/vesta",
    images: [
      {
        url: "/povuci/vesta-light-23.webp",
        width: 622,
        height: 359,
        alt: "Vesta Trailers Auto Prikolice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vesta Prikolice | Ovlašćeni Distributer",
    description:
      "Vesta auto prikolice po fabričkim cenama sa garancijom i kompletnom dokumentacijom.",
    images: ["/povuci/vesta-light-23.webp"],
  },
};

// JSON-LD: CollectionPage + ItemList (Vesta brand only)
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
      name: "Vesta Prikolice",
      item: "https://povuci.rs/vesta",
    },
  ],
};

export default async function VestaPage() {
  const trailers = await getCatalogTrailers();
  const currentVestaTrailers = trailers.filter((trailer) => trailer.brand === "Vesta");
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Vesta Trailers — Kompletan Asortiman Prikolica",
    description:
      "Svi modeli VESTA Trailers auto prikolica: Light, Cargo, Plato, Marine i Moto program po fabričkim cenama.",
    url: "https://povuci.rs/vesta",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: currentVestaTrailers.length,
      itemListElement: currentVestaTrailers.map((trailer, index) => ({
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
          brandFilter="Vesta"
          badgeText="VESTA TRAILERS • FABRIČKE CENE"
          pageTitle="VESTA AUTO PRIKOLICE"
          pageSubtitle="DDM Company je zvanični ovlašćeni predstavnik fabrike VESTA Trailers. Svi modeli se isporučuju sa kompletnom dokumentacijom za registraciju (COC i homologacija) i garancijom od 24 meseca."
        />
      </main>
      <Footer />
    </div>
  );
}
