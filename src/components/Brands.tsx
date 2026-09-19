"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties, type TransitionEvent } from "react";

import styles from "./Brands.module.css";

const brands = [
  { src: "/car-logos/mercedes.svg", alt: "Mercedes-Benz" },
  { src: "/car-logos/bmw.svg", alt: "BMW" },
  { src: "/car-logos/audi.svg", alt: "Audi" },
  { src: "/car-logos/volkswagen.svg", alt: "Volkswagen" },
  { src: "/car-logos/hyundai.svg", alt: "Hyundai" },
  { src: "/car-logos/toyota.svg", alt: "Toyota" },
  { src: "/car-logos/skoda.svg", alt: "Škoda" },
  { src: "/car-logos/ford.svg", alt: "Ford" },
  { src: "/car-logos/renault.svg", alt: "Renault" },
  { src: "/car-logos/peugeot.svg", alt: "Peugeot" },
];

const description =
  "Vršimo profesionalnu ugradnju atestiranih euro auto kuka sa originalnom električnom instalacijom i modulom za sve marke i modele putničkih, SUV i dostavnih vozila. Svaka kuka poseduje EU homologaciju, prateće sertifikate i spremnu dokumentaciju za atest i tehnički pregled.";

function getVisibleCount() {
  if (typeof window === "undefined") return 5;
  if (window.innerWidth <= 480) return 2;
  if (window.innerWidth <= 768) return 3;
  if (window.innerWidth <= 1100) return 4;
  return 5;
}

export default function Brands() {
  const [visibleCount, setVisibleCount] = useState(5);
  const [trackIndex, setTrackIndex] = useState(5);
  const [animated, setAnimated] = useState(true);

  const carouselBrands = useMemo(
    () => [
      ...brands.slice(-visibleCount),
      ...brands,
      ...brands.slice(0, visibleCount),
    ],
    [visibleCount],
  );

  useEffect(() => {
    const updateVisibleCount = () => setVisibleCount(getVisibleCount());

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    const resetTimer = window.setTimeout(() => {
      setAnimated(false);
      setTrackIndex(visibleCount);
      window.requestAnimationFrame(() => setAnimated(true));
    }, 0);
    return () => window.clearTimeout(resetTimer);
  }, [visibleCount]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAnimated(true);
      setTrackIndex((current) => current + 1);
    }, 3000);

    return () => window.clearInterval(timer);
  }, []);

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.propertyName !== "transform") return;

    if (trackIndex >= brands.length + visibleCount) {
      setAnimated(false);
      setTrackIndex(visibleCount);
    }
  }

  const carouselStyle = {
    "--visible-brands": visibleCount,
    transform: `translate3d(-${(trackIndex * 100) / visibleCount}%, 0, 0)`,
  } as CSSProperties;

  return (
    <section className={styles.brands} id="auto-kuke" aria-labelledby="auto-kuke-title">
      <div className="site-container">
        <div className={`${styles.heading} section-heading reveal`}>
          <p className="section-heading__eyebrow">PROFESIONALNA UGRADNJA SA ATESTOM</p>
          <h2 id="auto-kuke-title">Ugradnja Auto Kuka</h2>

          <div className={styles.introduction}>
            <p className={styles.description}>{description}</p>
            <div className={styles.action}>
              <a className="auto-button" href="tel:+381603001633">
                Zakaži: 060/300-1633
              </a>
            </div>
          </div>
        </div>

        <div className={`${styles.vehicleCoverage} reveal`}>
          <strong>Ugradnja za sve tipove vozila</strong>
          <span>Putnička, SUV, 4x4 i dostavna vozila — bez obzira na marku i model.</span>
        </div>

        <div className={`${styles.rail} reveal`} aria-roledescription="carousel" aria-label="Marke vozila za ugradnju kuka">
          <div
            className={`${styles.track} ${animated ? styles.animated : ""}`}
            style={carouselStyle}
            onTransitionEnd={handleTransitionEnd}
          >
            {carouselBrands.map((brand, index) => (
              <div
                className={styles.logoCell}
                aria-hidden={index < visibleCount || index >= visibleCount + brands.length}
                key={`${brand.src}-${index}`}
              >
                <Image
                  src={brand.src}
                  alt={brand.alt}
                  width={110}
                  height={50}
                  priority={index < 8}
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
