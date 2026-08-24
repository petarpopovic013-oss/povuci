"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PovuciTrailer } from "../types/trailer";
import type { CatalogTrailer } from "../data/trailers";
import { parseTechSpecsFromDescription } from "../lib/trailer-utils";
import {
  PhoneIcon,
  WhatsAppIcon,
  CheckIcon,
  ShieldIcon,
  TruckIcon,
  TrailerIcon,
  ChevronIcon,
} from "./icons";
import styles from "./TrailerDetail.module.css";

interface TrailerDetailProps {
  trailer: PovuciTrailer;
  relatedTrailers: CatalogTrailer[];
}

export default function TrailerDetail({
  trailer,
  relatedTrailers,
}: TrailerDetailProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const images =
    trailer.images && trailer.images.length > 0
      ? trailer.images
      : trailer.main_image_url
      ? [
          {
            id: "main-1",
            trailer_id: trailer.id,
            image_url: trailer.main_image_url,
            storage_path: null,
            is_main: true,
            sort_order: 0,
            alt_text: trailer.title,
            created_at: "",
          },
        ]
      : [];

  const currentImage = images[activeImageIndex] || images[0];

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const parsedSpecs = parseTechSpecsFromDescription(trailer.description);

  const whatsappMessage = encodeURIComponent(
    `Pozdrav, interesuje me prikolica ${trailer.title} (${
      trailer.price_rsd > 0
        ? `${trailer.price_rsd.toLocaleString("sr-RS")} RSD`
        : "cena na upit"
    }). Da li je dostupna na stanju?`
  );

  const internalDimensions =
    parsedSpecs["Dimenzije tovarnog prostora (mm)"] ||
    parsedSpecs["Unutrašnje dimenzije"] ||
    (trailer.internal_length_mm
      ? `${trailer.internal_length_mm} x ${trailer.internal_width_mm} mm`
      : null);

  const externalDimensions =
    parsedSpecs["Gabaritne dimenzije (mm)"] ||
    parsedSpecs["Spoljašnje dimenzije"] ||
    null;

  const grossWeight =
    parsedSpecs["Bruto masa (kg)"] ||
    parsedSpecs["Ukupna masa"] ||
    (trailer.gross_weight_kg ? `${trailer.gross_weight_kg} kg` : "750 kg");

  const curbWeight =
    parsedSpecs["Masa prazne prikolice (kg)"] ||
    parsedSpecs["Težina prikolice"] ||
    (trailer.curb_weight_kg ? `${trailer.curb_weight_kg} kg` : null);

  const payload =
    parsedSpecs["Neto nosivost (kg)"] ||
    parsedSpecs["Nosivost"] ||
    (trailer.payload_capacity_kg ? `${trailer.payload_capacity_kg} kg` : null);

  const wheels =
    parsedSpecs["Točkovi"] ||
    parsedSpecs["Čelična felna R13 sa gumom"] ||
    "155/80 R13 ili 165/70 R13";

  const suspension =
    parsedSpecs["Osovine"] ||
    parsedSpecs["Vešanje"] ||
    trailer.suspension ||
    (trailer.axles_count === 2
      ? "Dve torzione osovine (Knott / AL-KO)"
      : "Jedna torziona osovina (Knott / AL-KO)");

  const chassis =
    parsedSpecs["Šasija"] || "Toplocinkovani čelik visoke otpornosti";

  const floor =
    parsedSpecs["Ispuna poda"] ||
    parsedSpecs["Pod prikolice"] ||
    "Vodootporni neklizajući šper";

  return (
    <div className={styles.wrapper}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbNav} aria-label="Navigacija">
        <div className="site-container">
          <ul className={styles.breadcrumbList}>
            <li className={styles.breadcrumbItem}>
              <Link href="/">Početna</Link>
            </li>
            <li className={styles.breadcrumbSeparator}>/</li>
            <li className={styles.breadcrumbItem}>
              <Link href="/prikolice">Katalog Prikolica</Link>
            </li>
            <li className={styles.breadcrumbSeparator}>/</li>
            <li className={styles.breadcrumbItem}>
              <Link
                href={
                  trailer.brand.toLowerCase() === "vesta"
                    ? "/vesta"
                    : "/trigano"
                }
              >
                {trailer.brand}
              </Link>
            </li>
            <li className={styles.breadcrumbSeparator}>/</li>
            <li
              className={`${styles.breadcrumbItem} ${styles.breadcrumbCurrent}`}
            >
              {trailer.model}
            </li>
          </ul>
        </div>
      </nav>

      <div className="site-container">
        {/* 50% / 50% Split Grid: Gallery on Left Half, Specs & CTA on Right Half */}
        <div className={styles.splitGrid}>
          {/* Left 50% Column (Gallery & Highlights) */}
          <div className={styles.leftColumn}>
            <div className={styles.galleryCard}>
              <div className={styles.mainImageWrap}>
                <div className={styles.badgeOverlay}>
                  <span className={styles.brandBadge}>{trailer.brand}</span>
                  {trailer.is_b_category && (
                    <span className={styles.bCategoryBadge}>
                      ✓ B kategorija (do 750kg)
                    </span>
                  )}
                </div>

                {/* Prev / Next Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className={styles.navArrowLeft}
                      onClick={handlePrevImage}
                      aria-label="Prethodna slika"
                    >
                      <ChevronIcon
                        style={{
                          width: "18px",
                          height: "18px",
                          transform: "rotate(180deg)",
                        }}
                      />
                    </button>
                    <button
                      type="button"
                      className={styles.navArrowRight}
                      onClick={handleNextImage}
                      aria-label="Sledeća slika"
                    >
                      <ChevronIcon style={{ width: "18px", height: "18px" }} />
                    </button>
                  </>
                )}

                {currentImage?.image_url ? (
                  <Image
                    src={currentImage.image_url}
                    alt={currentImage.alt_text || trailer.title}
                    fill
                    priority
                    sizes="(max-width: 900px) 100vw, 520px"
                    className={styles.mainImage}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      color: "#888",
                      fontSize: "13px",
                    }}
                  >
                    Fotografija modela uskoro
                  </div>
                )}

                {images.length > 1 && (
                  <div className={styles.imageCounter}>
                    {activeImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className={styles.thumbnailsList}>
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      type="button"
                      className={`${styles.thumbnailBtn} ${
                        activeImageIndex === idx
                          ? styles.thumbnailBtnActive
                          : ""
                      }`}
                      onClick={() => setActiveImageIndex(idx)}
                      aria-label={`Prikaži sliku ${idx + 1}`}
                    >
                      <Image
                        src={img.image_url}
                        alt={
                          img.alt_text || `${trailer.title} sličica ${idx + 1}`
                        }
                        fill
                        sizes="64px"
                        className={styles.thumbImg}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Left Column Trust Banner */}
            <div className={styles.trustBanner}>
              <div className={styles.trustBannerItem}>
                <CheckIcon style={{ width: "16px", height: "16px" }} />
                <span>Kompletni papiri za registraciju (COC + homologacija)</span>
              </div>
              <div className={styles.trustBannerItem}>
                <ShieldIcon style={{ width: "16px", height: "16px" }} />
                <span>Fabrička garancija 24 meseca na kompletnu konstrukciju</span>
              </div>
              <div className={styles.trustBannerItem}>
                <TruckIcon style={{ width: "16px", height: "16px" }} />
                <span>Preuzimanje na placu ili organizovana isporuka na adresu</span>
              </div>
            </div>
          </div>

          {/* Right 50% Column (Title, Price, CTA, and Full Technical Specifications) */}
          <div className={styles.rightColumn}>
            <div className={styles.headerRow}>
              <span className={styles.categoryEyebrow}>
                {trailer.category?.name || "Auto Prikolica"} • {trailer.brand}
              </span>
              <span className={styles.inStockBadge}>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#166534",
                  }}
                />
                Dostupno
              </span>
            </div>

            <h1 className={styles.title}>{trailer.title}</h1>

            {/* Price & CTA Box */}
            <div className={styles.priceAndCtaBox}>
              <div className={styles.priceRow}>
                <span className={styles.priceLabel}>Cena:</span>
                <div className={styles.priceAmounts}>
                  <span className={styles.priceRsd}>
                    {trailer.price_rsd > 0
                      ? `${trailer.price_rsd.toLocaleString("sr-RS")} RSD`
                      : "Pozovite za cenu"}
                  </span>
                  {trailer.price_rsd > 0 && (
                    <span className={styles.priceEur}>
                      (~{Math.round(trailer.price_rsd / 117.2).toLocaleString("sr-RS")} €)
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.vatNotice}>
                ✓ Izdavanje računa za firme i fizička lica
              </div>

              {/* CTA Buttons */}
              <div className={styles.ctaRow}>
                <a
                  href="tel:+381603001633"
                  className={styles.phoneCallBtn}
                  aria-label="Pozovite za više informacija"
                >
                  <PhoneIcon style={{ width: "18px", height: "18px" }} />
                  <span>POZOVI: 060 300 1633</span>
                </a>

                <a
                  href={`https://wa.me/381603001633?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappBtn}
                  aria-label="Pošaljite upit putem WhatsApp-a"
                >
                  <WhatsAppIcon style={{ width: "17px", height: "17px" }} />
                  <span>WhatsApp / Viber</span>
                </a>
              </div>
            </div>

            {/* Technical Specifications Table right in the right half */}
            <div className={styles.specsContainer}>
              <div className={styles.specsHeading}>
                <TrailerIcon style={{ width: "16px", height: "16px" }} />
                <span>Tehničke Specifikacije Modela</span>
              </div>

              <div className={styles.specsTable}>
                {internalDimensions && (
                  <div className={styles.tableRow}>
                    <span className={styles.rowLabel}>Tovarni prostor (unutrašnje):</span>
                    <span className={styles.rowValue}>{internalDimensions}</span>
                  </div>
                )}

                {externalDimensions && (
                  <div className={styles.tableRow}>
                    <span className={styles.rowLabel}>Spoljašnje gabaritne dimenzije:</span>
                    <span className={styles.rowValue}>{externalDimensions}</span>
                  </div>
                )}

                <div className={styles.tableRow}>
                  <span className={styles.rowLabel}>Ukupna (bruto) masa:</span>
                  <span className={styles.rowValue}>{grossWeight}</span>
                </div>

                {curbWeight && (
                  <div className={styles.tableRow}>
                    <span className={styles.rowLabel}>Masa prazne prikolice:</span>
                    <span className={styles.rowValue}>{curbWeight}</span>
                  </div>
                )}

                {payload && (
                  <div className={styles.tableRow}>
                    <span className={styles.rowLabel}>Korisna nosivost:</span>
                    <span className={styles.rowValue}>{payload}</span>
                  </div>
                )}

                <div className={styles.tableRow}>
                  <span className={styles.rowLabel}>Broj osovina & vešanje:</span>
                  <span className={styles.rowValue}>{suspension}</span>
                </div>

                <div className={styles.tableRow}>
                  <span className={styles.rowLabel}>Kipovanje tereta:</span>
                  <span className={styles.rowValue}>
                    {trailer.has_tilt ? "Da (Kiper mehanizam)" : "Standardno (fiksno)"}
                  </span>
                </div>

                <div className={styles.tableRow}>
                  <span className={styles.rowLabel}>Točkovi i gume:</span>
                  <span className={styles.rowValue}>{wheels}</span>
                </div>

                <div className={styles.tableRow}>
                  <span className={styles.rowLabel}>Konstrukcija šasije:</span>
                  <span className={styles.rowValue}>{chassis}</span>
                </div>

                <div className={styles.tableRow}>
                  <span className={styles.rowLabel}>Pod prikolice:</span>
                  <span className={styles.rowValue}>{floor}</span>
                </div>

                <div className={styles.tableRow}>
                  <span className={styles.rowLabel}>Dozvola za vožnju:</span>
                  <span className={styles.rowValue}>
                    {trailer.is_b_category
                      ? "B kategorija (nije potrebna E)"
                      : "Potrebna BE / CE kategorija"}
                  </span>
                </div>

                <div className={styles.tableRow}>
                  <span className={styles.rowLabel}>Pomoćni točkić:</span>
                  <span className={styles.rowValue}>Uključen uz prikolicu</span>
                </div>

                <div className={styles.tableRow}>
                  <span className={styles.rowLabel}>Garancija:</span>
                  <span className={styles.rowValue}>24 meseca (fabrička)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Optional Accessories with Exact Prices */}
        {trailer.options && trailer.options.length > 0 && (
          <section className={`${styles.sectionCard} reveal`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Dodatna Oprema i Opcije</h2>
            </div>
            <p style={{ color: "#64748b", marginBottom: "16px", fontSize: "13px" }}>
              Sva dodatna oprema može se naručiti i fabrički ugraditi uz prikolicu:
            </p>

            <div className={styles.optionsGrid}>
              {trailer.options.map((opt) => (
                <div className={styles.optionCard} key={opt.id || opt.name}>
                  <div className={styles.optionName}>{opt.name}</div>
                  <div className={styles.optionPrice}>
                    {opt.price_rsd > 0
                      ? `${opt.price_rsd.toLocaleString("sr-RS")} RSD`
                      : "Na upit"}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: Full Description & Registration info */}
        {trailer.description && (
          <section className={`${styles.sectionCard} reveal`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Opis Modela i Dokumentacija</h2>
            </div>

            <div className={styles.descriptionBox}>{trailer.description}</div>
          </section>
        )}

        {/* Section: Why choose us */}
        <section className={`${styles.sectionCard} reveal`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Zašto Izabrati DDM Company?</h2>
          </div>

          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <ShieldIcon style={{ width: "22px", height: "22px" }} />
              </div>
              <h3 className={styles.trustTitle}>24 Meseca Garancije</h3>
              <p className={styles.trustDesc}>
                Puna fabrička garancija na šasiju, osovine i elektroinstalacije.
              </p>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <CheckIcon style={{ width: "22px", height: "22px" }} />
              </div>
              <h3 className={styles.trustTitle}>Kompletni Papiri</h3>
              <p className={styles.trustDesc}>
                Homologacija, COC obrazac i račun – spremno za tehnički pregled i registraciju.
              </p>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <TrailerIcon style={{ width: "22px", height: "22px" }} />
              </div>
              <h3 className={styles.trustTitle}>Fabričke Cene</h3>
              <p className={styles.trustDesc}>
                Ovlašćeni distributer sa direktnim fabričkim cenama bez provizija posrednika.
              </p>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrap}>
                <TruckIcon style={{ width: "22px", height: "22px" }} />
              </div>
              <h3 className={styles.trustTitle}>Moguća Isporuka</h3>
              <p className={styles.trustDesc}>
                Preuzimanje na našem placu ili organizovana isporuka na vašu adresu.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Related Trailers */}
        {relatedTrailers.length > 0 && (
          <section className={`${styles.sectionCard} reveal`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Slični Modeli Prikolica</h2>
            </div>

            <div className={styles.relatedGrid}>
              {relatedTrailers.map((rel) => (
                <article className={styles.relatedCard} key={rel.id}>
                  <Link href={`/prikolice/${rel.slug}`} className={styles.relatedImgWrap}>
                    {rel.mainImageUrl ? (
                      <Image
                        src={rel.mainImageUrl}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "100%",
                          color: "#999",
                          fontSize: "12px",
                        }}
                      >
                        Bez fotografije
                      </div>
                    )}
                  </Link>
                  <div className={styles.relatedBody}>
                    <span className={styles.relatedCategory}>{rel.categoryName}</span>
                    <h3 className={styles.relatedTitle}>
                      <Link href={`/prikolice/${rel.slug}`}>{rel.title}</Link>
                    </h3>
                    <div className={styles.relatedPriceRow}>
                      <span className={styles.relatedPrice}>
                        {rel.priceRsd > 0
                          ? `${rel.priceRsd.toLocaleString("sr-RS")} RSD`
                          : "Na upit"}
                      </span>
                      <Link href={`/prikolice/${rel.slug}`} className={styles.relatedBtn}>
                        Pogledaj
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky Mobile CTA Bar */}
      <div className={styles.mobileStickyBar}>
        <div className={styles.mobileStickyInner}>
          <div className={styles.mobilePriceWrap}>
            <span className={styles.mobilePriceLabel}>Cena:</span>
            <span className={styles.mobilePrice}>
              {trailer.price_rsd > 0
                ? `${trailer.price_rsd.toLocaleString("sr-RS")} RSD`
                : "Na upit"}
            </span>
          </div>
          <a
            href="tel:+381603001633"
            className={styles.mobileCallBtn}
            aria-label="Pozovite nas"
          >
            <PhoneIcon style={{ width: "16px", height: "16px" }} />
            <span>Pozovi: 060 300 1633</span>
          </a>
        </div>
      </div>
    </div>
  );
}
