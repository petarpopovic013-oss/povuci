import type { Metadata } from "next";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import ContactPage from "../../src/components/ContactPage";
import { FACEBOOK_URL, INSTAGRAM_URL } from "../../src/lib/business-info";
import { serializeJsonLd } from "../../src/lib/seo";

export const metadata: Metadata = {
  title: "Kontakt i Lokacija | DDM Company",
  description:
    "Kontaktirajte DDM Company za Vesta i Trigano auto prikolice. Dr Svetislava Kasapinovića 9, Novi Sad. Telefon 060 300 1633. Radno vreme i lokacija.",
  alternates: {
    canonical: "https://povuci.rs/kontakt",
    languages: {
      "sr-Latn-RS": "https://povuci.rs/kontakt",
    },
  },
  openGraph: {
    type: "website",
    locale: "sr_RS",
    siteName: "Povuci.rs",
    title: "Kontakt & Lokacija | DDM Company",
    description:
      "Posetite nas ili pozovite: 060 300 1633. Dr Svetislava Kasapinovića 9, 21000 Novi Sad. Ovlašćena prodaja Vesta i Trigano prikolica.",
    url: "https://povuci.rs/kontakt",
    images: [
      {
        url: "/povuci/vesta-light-23.webp",
        width: 622,
        height: 359,
        alt: "DDM Company - Kontakt lokacija Novi Sad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontakt i Lokacija | DDM Company",
    description:
      "Kontakt, radno vreme i lokacija prodajnog mesta Povuci.rs u Novom Sadu.",
    images: ["/povuci/vesta-light-23.webp"],
  },
};

// JSON-LD: LocalBusiness for Contact page
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoPartsStore",
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
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
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
    "https://www.google.com/maps/search/?api=1&query=DDM+Company+Novi+Sad",
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <Header />
      <main>
        <ContactPage />
      </main>
      <Footer />
    </div>
  );
}
