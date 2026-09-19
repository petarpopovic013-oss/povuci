import type { Metadata } from "next";
import Brands from "../src/components/Brands";
import FeaturedItems from "../src/components/FeaturedItems";
import Footer from "../src/components/Footer";
import Header from "../src/components/Header";
import Hero from "../src/components/Hero";
import TowbarModels from "../src/components/TowbarModels";
import { FACEBOOK_URL, INSTAGRAM_URL } from "../src/lib/business-info";
import { serializeJsonLd } from "../src/lib/seo";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://povuci.rs",
  },
};

// JSON-LD: Organization + LocalBusiness + WebSite (Sitelinks Search Box)
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "AutoPartsStore"],
  "@id": "https://povuci.rs/#organization",
  name: "DDM Company — Povuci.rs",
  alternateName: "Povuci.rs",
  url: "https://povuci.rs",
  logo: "https://povuci.rs/icon-512.png",
  image: "https://povuci.rs/povuci/vesta-light-23.webp",
  description:
    "Ovlašćeni distributer novih Vesta Trailers i Trigano auto prikolica u Srbiji. Fabričke cene, 24 meseca garancije i kompletna dokumentacija za brzu registraciju.",
  telephone: "+381603001633",
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+381603001633",
      contactType: "sales",
      areaServed: "RS",
      availableLanguage: ["sr"],
    },
    {
      "@type": "ContactPoint",
      telephone: "+381641334589",
      contactType: "sales",
      areaServed: "RS",
      availableLanguage: ["sr"],
    },
  ],
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
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "16:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "14:00",
    },
  ],
  sameAs: [INSTAGRAM_URL, FACEBOOK_URL],
  hasMap:
    "https://www.google.com/maps/search/?api=1&query=Dr+Svetislava+Kasapinovica+9,+21000+Novi+Sad",
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
};

export default function Home() {
  return (
    <div id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(websiteJsonLd) }}
      />
      <Header />
      <main>
        <Hero />
        <FeaturedItems />
        <Brands />
        <TowbarModels />
      </main>
      <Footer />
    </div>
  );
}
