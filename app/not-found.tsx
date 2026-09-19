import Link from "next/link";
import Header from "../src/components/Header";
import Footer from "../src/components/Footer";
import { ArrowIcon } from "../src/components/icons";

export default function NotFound() {
  return (
    <div id="top" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: "600px" }}>
          <span style={{ fontSize: "72px", fontWeight: "800", color: "#d22e2e", lineHeight: 1 }}>
            404
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#1b1a1a", margin: "16px 0 12px" }}>
            Stranica nije pronađena
          </h1>
          <p style={{ color: "#777", fontSize: "15px", lineHeight: "1.6", marginBottom: "32px" }}>
            Stranica koju tražite možda je premeštena, obrisana ili je unet pogrešan link.
            Pogledajte naš kompletan katalog prikolica ili se vratite na početnu stranu.
          </p>

          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="auto-button" style={{ width: "auto", padding: "0 28px" }}>
              <ArrowIcon
                style={{ width: "16px", height: "16px", transform: "rotate(180deg)" }}
                aria-hidden="true"
              />
              Početna Strana
            </Link>
            <Link
              href="/prikolice"
              className="auto-button"
              style={{
                width: "auto",
                padding: "0 28px",
                background: "transparent",
                color: "#d22e2e",
              }}
            >
              Katalog Prikolica
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
