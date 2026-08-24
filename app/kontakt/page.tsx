import type { Metadata } from "next";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import ContactPage from "../../src/components/ContactPage";

export const metadata: Metadata = {
  title: "Kontakt & Lokacija | DDM Company - Povuci.rs",
  description:
    "Kontaktirajte DDM Company za kupovinu novih Vesta i Trigano auto prikolica. Adresa: Dr Svetislava Kasapinovića 9, 21000 Novi Sad. Telefon: 060 3001633, Instagram @ddmcompany.ns.",
  alternates: {
    canonical: "https://povuci.rs/kontakt",
  },
  openGraph: {
    title: "Kontakt & Lokacija | DDM Company",
    description:
      "Posetite nas ili pozovite: 060 300 1633. Dr Svetislava Kasapinovića 9, 21000 Novi Sad. Ovlašćena prodaja Vesta i Trigano prikolica.",
    url: "https://povuci.rs/kontakt",
    images: [
      {
        url: "/povuci/vesta-light-23.webp",
        width: 1200,
        height: 630,
        alt: "DDM Company - Kontakt lokacija Novi Sad",
      },
    ],
  },
};

// JSON-LD: LocalBusiness for Contact page
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://povuci.rs/#organization",
  name: "DDM Company — Povuci.rs",
  image: "https://povuci.rs/icon-512.png",
  url: "https://povuci.rs",
  telephone: "+381603001633",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Dr Svetislava Kasapinovića 9",
    addressLocality: "Novi Sad",
    postalCode: "21000",
    addressRegion: "Vojvodina",
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
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
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
      name: "Kontakt & Lokacija",
      item: "https://povuci.rs/kontakt",
    },
  ],
};

export default function KontaktRoute() {
  return (
    <div id="top">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main>
        <ContactPage />
      </main>
      <Footer />
    </div>
  );
}
