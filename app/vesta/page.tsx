import type { Metadata } from "next";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import BrandCatalog from "../../src/components/BrandCatalog";
import { ALL_TRAILERS } from "../../src/data/trailers";

const vestaTrailers = ALL_TRAILERS.filter((t) => t.brand === "Vesta");

export const metadata: Metadata = {
  title: "Vesta Prikolice | Ovlašćeni Distributer Povuci.rs",
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
        width: 1200,
        height: 630,
        alt: "Vesta Trailers Auto Prikolice",
      },
    ],
  },
};

// JSON-LD: CollectionPage + ItemList (Vesta brand only)
const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Vesta Trailers — Kompletan Asortiman Prikolica",
  description:
    "Svi modeli VESTA Trailers auto prikolica: Light, Cargo, Plato, Marine i Moto program po fabričkim cenama.",
  url: "https://povuci.rs/vesta",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: vestaTrailers.map((trailer, index) => ({
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
      name: "Vesta Prikolice",
      item: "https://povuci.rs/vesta",
    },
  ],
};

export default function VestaPage() {
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
