"use client";

import Link from "next/link";
import {
  InstagramIcon,
  LocationIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "./icons";
import styles from "./ContactPage.module.css";

export default function ContactPage() {
  return (
    <div className={styles.contactSection}>
      <div className="site-container">
        {/* Breadcrumbs */}
        <nav className={styles.breadcrumbs} aria-label="Navigacija">
          <Link href="/">Početna</Link>
          <span>/</span>
          <span style={{ color: "#d22e2e", fontWeight: "600" }}>Kontakt</span>
        </nav>

        {/* Section Header */}
        <div className={`${styles.headerBlock} reveal`}>
          <span className={styles.eyebrow}>DDM COMPANY • OVLAŠĆENI DISTRIBUTER</span>
          <h1 className={styles.title}>KONTAKT & LOKACIJA</h1>
          <p className={styles.subtitle}>
            Ovlašćena prodaja Vesta i Trigano auto prikolica po fabričkim cenama.
            Izdavanje COC dokumentacije i računa za brzu registraciju.
          </p>
        </div>

        {/* Top 2 Action Cards: Telefon & Instagram */}
        <div className={`${styles.topCardsGrid} reveal`}>
          {/* Card 1: Telefon */}
          <div className={styles.card}>
            <div className={styles.iconWrapper}>
              <PhoneIcon />
            </div>
            <h2 className={styles.cardTitle}>Pozovite Nas Direktno</h2>
            <div className={styles.cardHighlight}>
              060 / 300 - 1633<br/>
              <span style={{fontSize: "0.6em", color: "#666"}}>064 / 133 - 4589</span>
            </div>
            <p className={styles.cardDesc}>
              Dostupni smo svakog radnog dana i subotom za sve informacije o modelima, fabričkim cenama i preuzimanju prikolica.
            </p>
            <div className={styles.cardActions}>
              <a href="tel:+381603001633" className={styles.cardBtnPrimary}>
                <PhoneIcon style={{ width: "16px", height: "16px" }} />
                <span>POZOVI: 060 300 1633</span>
              </a>
              <a href="tel:+381641334589" className={styles.cardBtnPrimary} style={{background: "#333", color: "white", marginTop: "8px"}}>
                <PhoneIcon style={{ width: "16px", height: "16px" }} />
                <span>POZOVI: 064 133 4589</span>
              </a>
              <div className={styles.socialRow} style={{marginTop: "8px"}}>
                <a
                  href="https://wa.me/381603001633"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappBtn}
                >
                  <WhatsAppIcon style={{ width: "15px", height: "15px" }} />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="viber://chat?number=%2B381603001633"
                  className={styles.viberBtn}
                >
                  <span>Viber</span>
                </a>
              </div>
            </div>
          </div>

          {/* Card 2: Instagram */}
          <div className={styles.card}>
            <div className={`${styles.iconWrapper} ${styles.instagramIconWrapper}`}>
              <InstagramIcon />
            </div>
            <h2 className={styles.cardTitle}>Instagram Profil</h2>
            <div className={styles.cardHighlight} style={{ color: "#bc1888" }}>
              @ddmcompany.ns
            </div>
            <p className={styles.cardDesc}>
              Zapratite naš zvanični Instagram profil za najnovije isporuke, video snimke detalja prikolica i aktuelne popuste.
            </p>
            <div className={styles.cardActions}>
              <a
                href="https://www.instagram.com/ddmcompany.ns/"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.cardBtnPrimary} ${styles.cardBtnInstagram}`}
              >
                <InstagramIcon style={{ width: "18px", height: "18px" }} />
                <span>ZAPRATI NA INSTAGRAMU</span>
              </a>
            </div>
          </div>
        </div>

        {/* Google Maps Section */}
        <div className={`${styles.mapSectionCard} reveal`}>
          <div className={styles.mapHeader}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <LocationIcon style={{ width: "20px", height: "20px", color: "#d22e2e" }} />
                <h2 className={styles.mapTitle}>Dr Svetislava Kasapinovića 9, Novi Sad</h2>
              </div>
              <p className={styles.mapSubtitle}>
                Naša lokacija i prodajno mesto za jednostavno preuzimanje prikolica i kompletne dokumentacije.
              </p>
            </div>

            <a
              href="https://www.google.com/maps/search/?api=1&query=Dr+Svetislava+Kasapinovica+9,+21000+Novi+Sad"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.openMapsBtn}
            >
              <span>Otvori u Google Maps ↗</span>
            </a>
          </div>

          <div className={styles.mapFrameWrapper}>
            <iframe
              title="Google Mapa Lokacija - Dr Svetislava Kasapinovića 9, Novi Sad"
              src="https://maps.google.com/maps?q=Dr+Svetislava+Kasapinovica+9,+Novi+Sad,+Serbia&t=&z=16&ie=UTF8&iwloc=&output=embed"
              className={styles.mapFrame}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className={styles.mapFooterGrid}>
            <div className={styles.mapFooterItem}>
              <strong>Adresa:</strong>
              <span>Dr Svetislava Kasapinovića 9, 21000 Novi Sad</span>
            </div>
            <div className={styles.mapFooterItem}>
              <strong>Radno Vreme:</strong>
              <span>Ponedeljak – Subota: 08:00 – 18:00 h</span>
            </div>
            <div className={styles.mapFooterItem}>
              <strong>Glavni Telefon:</strong>
              <span><a href="tel:+381603001633" style={{ color: "#d22e2e", fontWeight: "bold", textDecoration: "none" }}>060 / 300 - 1633</a></span>
            </div>
            <div className={styles.mapFooterItem}>
              <strong>Drugi Telefon:</strong>
              <span><a href="tel:+381641334589" style={{ color: "#d22e2e", fontWeight: "bold", textDecoration: "none" }}>064 / 133 - 4589</a></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
