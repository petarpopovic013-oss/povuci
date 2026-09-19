import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Povuci.rs — Auto Prikolice | Vesta & Trigano",
    short_name: "Povuci.rs",
    description:
      "Zvanični distributer novih Vesta i Trigano auto prikolica u Srbiji. Fabričke cene, 24 meseca garancije i kompletna dokumentacija za registraciju.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0b0d",
    theme_color: "#d22e2e",
    orientation: "portrait-primary",
    categories: ["shopping", "business"],
    lang: "sr-Latn",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "32x32",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
