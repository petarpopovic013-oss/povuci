import type { Metadata } from "next";
import Brands from "../src/components/Brands";
import FeaturedItems from "../src/components/FeaturedItems";
import Footer from "../src/components/Footer";
import Header from "../src/components/Header";
import Hero from "../src/components/Hero";
import NewItems from "../src/components/NewItems";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://povuci.rs",
  },
};

// JSON-LD: Organization + LocalBusiness + WebSite (Sitelinks Search Box)
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "@id": "https://povuci.rs/#organization",
  name: "DDM Company — Povuci.rs",
  alternateName: "Povuci.rs",
  url: "https://povuci.rs",
  logo: "https://povuci.rs/icon-512.png",
  image: "https://povuci.rs/povuci/vesta-light-23.webp",
  description:
    "Ovlašćeni distributer novih Vesta Trailers i Trigano auto prikolica u Srbiji. Fabričke cene, 24 meseca garancije i kompletna dokumentacija za brzu registraciju.",
  telephone: "+381603001633",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Dr Svetislava Kasapinovića 9",
    addressLocality: "Novi Sad",
    postalCode: "21000",
    addressCountry: "RS",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 45.2671,
    longitude: 19.8335,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:00",
    },
  ],
  sameAs: ["https://www.instagram.com/ddmcompany.ns/"],
  priceRange: "$$",
  currenciesAccepted: "RSD",
  paymentAccepted: "Cash, Credit Card, Bank Transfer",
  areaServed: {
    "@type": "Country",
    name: "Serbia",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Auto Prikolice Katalog",
    itemListElement: [
      {
        "@type": "OfferCatalog",
        name: "Vesta Trailers Prikolice",
        url: "https://povuci.rs/vesta",
      },
      {
        "@type": "OfferCatalog",
        name: "Trigano Prikolice",
        url: "https://povuci.rs/trigano",
      },
    ],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://povuci.rs/#website",
  url: "https://povuci.rs",
  name: "Povuci.rs",
  description:
    "Prodaja novih Vesta i Trigano auto prikolica po fabričkim cenama sa garancijom 24 meseca.",
  publisher: {
    "@id": "https://povuci.rs/#organization",
  },
  inLanguage: "sr",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://povuci.rs/prikolice?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  return (
    <div id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <Header />
      <main>
        <Hero />
        <FeaturedItems />
        <Brands />
        <NewItems />
      </main>
      <Footer />
    </div>
  );
}
