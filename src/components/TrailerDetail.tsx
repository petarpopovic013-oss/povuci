"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PovuciTrailer } from "../types/trailer";
import type { CatalogTrailer } from "../data/trailers";
import { getPovuciTrailerCharacteristicRows } from "../lib/trailer-characteristics";
import {
  PhoneIcon,
  WhatsAppIcon,
  CheckIcon,
  ShieldIcon,
  TruckIcon,
  TrailerIcon,
  ChevronIcon,
  SearchIcon,
} from "./icons";
import ImageLightbox from "./ImageLightbox";
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
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const openLightbox = useCallback(() => setIsLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setIsLightboxOpen(false), []);

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
  const lightboxImages = images.map((image, index) => ({
    id: image.id || `${trailer.id}-${index}`,
    src: image.image_url,
    alt: image.alt_text || `${trailer.title} fotografija ${index + 1}`,
  }));

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const characteristicRows = getPovuciTrailerCharacteristicRows(trailer);

  const whatsappMessage = encodeURIComponent(
    `Pozdrav, interesuje me prikolica ${trailer.title} (${
      trailer.price_rsd > 0
        ? `${trailer.price_rsd.toLocaleString("sr-RS")} RSD`
        : "cena na upit"
    }). Da li je dostupna na stanju?`
  );

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
                  <button
                    type="button"
                    className={styles.mainImageButton}
                    onClick={openLightbox}
                    aria-label={`Uvećaj fotografiju modela ${trailer.title}`}
                  >
                    <Image
                      src={currentImage.image_url}
                      alt={currentImage.alt_text || trailer.title}
                      fill
                      loading="eager"
                      fetchPriority="high"
                      sizes="(max-width: 900px) 100vw, 520px"
                      className={styles.mainImage}
                    />
                    <span className={styles.zoomHint} aria-hidden="true">
                      <SearchIcon />
                      <span>Uvećaj fotografiju</span>
                    </span>
                  </button>
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
                {characteristicRows.map((row) => (
                  <div className={styles.tableRow} key={row.key}>
                    <span className={styles.rowLabel}>{row.label}:</span>
                    <span className={styles.rowValue}>{row.value}</span>
                  </div>
                ))}
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

      <ImageLightbox
        images={lightboxImages}
        activeIndex={activeImageIndex}
        isOpen={isLightboxOpen}
        title={trailer.title}
        onIndexChange={setActiveImageIndex}
        onClose={closeLightbox}
      />

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
