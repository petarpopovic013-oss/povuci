import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const openSans = localFont({
  variable: "--font-open-sans",
  display: "swap",
  src: [
    { path: "./fonts/open-sans-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/open-sans-700.ttf", weight: "700", style: "normal" },
  ],
});

const raleway = localFont({
  variable: "--font-raleway",
  display: "swap",
  src: [
    { path: "./fonts/raleway-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/raleway-700.ttf", weight: "700", style: "normal" },
    { path: "./fonts/raleway-800.ttf", weight: "800", style: "normal" },
  ],
});

const ubuntu = localFont({
  variable: "--font-ubuntu",
  display: "swap",
  src: [
    { path: "./fonts/ubuntu-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/ubuntu-700.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://povuci.rs"),
  title: {
    default: "Povuci.rs | Prodaja Auto Prikolica | Vesta & Trigano",
    template: "%s | Povuci.rs",
  },
  description:
    "Zvanični distributer novih Vesta i Trigano auto prikolica u Srbiji. Fabričke cene, 24 meseca garancije i kompletna dokumentacija (COC, homologacija) za brzu registraciju.",
  keywords: [
    "auto prikolice",
    "prodaja prikolica srbija",
    "vesta prikolice",
    "trigano prikolice",
    "lake teretne prikolice",
    "dvoosovinke",
    "plato prikolice",
    "šlep prikolice",
    "prikolice za čamac",
    "ugradnja auto kuka",
    "nove prikolice",
    "prikolice novi sad",
    "prikolice cene",
    "prikolice sa garancijom",
    "COC dokumentacija prikolice",
    "homologacija prikolice",
    "prikolice za prevoz automobila",
    "kiperi prikolice",
    "nautičke prikolice",
    "prikolice B kategorija",
  ],
  authors: [{ name: "DDM Company" }],
  creator: "DDM Company",
  publisher: "Povuci.rs",
  alternates: {
    canonical: "https://povuci.rs",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "sr_RS",
    url: "https://povuci.rs",
    siteName: "Povuci.rs",
    title: "Povuci.rs | Prodaja Auto Prikolica | Vesta & Trigano",
    description:
      "Zvanični distributer novih Vesta i Trigano auto prikolica u Srbiji po fabričkim cenama sa 24 meseca garancije.",
    images: [
      {
        url: "/povuci/vesta-light-23.webp",
        width: 1200,
        height: 630,
        alt: "Povuci.rs Auto Prikolice",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Povuci.rs | Prodaja Auto Prikolica | Vesta & Trigano",
    description:
      "Zvanični distributer novih Vesta i Trigano auto prikolica u Srbiji po fabričkim cenama.",
    images: ["/povuci/vesta-light-23.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import ScrollReveal from "../src/components/ScrollReveal";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className={`${openSans.variable} ${raleway.variable} ${ubuntu.variable}`}>
      <body suppressHydrationWarning>
        <ScrollReveal />
        {children}
      </body>
    </html>
  );
}
