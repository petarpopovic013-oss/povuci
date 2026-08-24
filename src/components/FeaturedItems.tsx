"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "../types/autoshop";
import styles from "./FeaturedItems.module.css";

const products: Product[] = [
  {
    name: "Vesta Light 23",
    brand: "Vesta",
    price: "118.480 RSD",
    image: "/povuci/vesta-light-23.webp",
    slug: "vesta-light-23",
  },
  {
    name: "Trigano 2C250 Dvoosovinka",
    brand: "Trigano",
    price: "162.500 RSD",
    image: "/povuci/trigano-2c250.jpg",
    slug: "trigano-2c250",
  },
  {
    name: "Trigano C200 Sandučarka",
    brand: "Trigano",
    price: "119.000 RSD",
    image: "/povuci/trigano-c200.jpg",
    slug: "trigano-c200",
  },
  {
    name: "Vesta Plato 3117 2.0 2t",
    brand: "Vesta",
    price: "269.890 RSD",
    image: "/povuci/vesta-plato-3117.webp",
    slug: "vesta-plato-3117-2-0-2t",
  },
  {
    name: "Vesta Marine 750 Čamac",
    brand: "Vesta",
    price: "158.500 RSD",
    image: "/povuci/vesta-marine-750.webp",
    slug: "vesta-marine-750",
  },
  {
    name: "Trigano ŠLEP 2700 Auto-voz",
    brand: "Trigano",
    price: "360.000 RSD",
    image: "/povuci/trigano-slep-2700.jpg",
    slug: "trigano-lep-2700",
  },
];

function itemsVisibleAt(width: number) {
  if (width <= 480) return 1;
  if (width <= 600) return 2;
  if (width <= 991) return 3;
  return 4;
}

function ProductCard({ product }: { product: Product }) {
  const detailUrl = product.slug ? `/prikolice/${product.slug}` : "/prikolice";

  return (
    <article className={styles.product}>
      <div className={styles.productImage}>
        <Image
          src={product.image}
          alt={product.name}
          width={270}
          height={326}
          sizes="(max-width: 480px) calc(100vw - 30px), (max-width: 600px) 50vw, (max-width: 991px) 33vw, 263px"
        />
        <div className={styles.productOverlay}>
          <div className={styles.productActions}>
            <a href="tel:+381603001633">Pozovite</a>
            <Link href={detailUrl}>Detalji</Link>
          </div>
        </div>
      </div>
      <div className={styles.productBio}>
        <Link className={styles.brand} href={detailUrl}>
          {product.brand}
        </Link>
        <h3>
          <Link href={detailUrl}>{product.name}</Link>
        </h3>
        <p className={styles.price}>{product.price}</p>
      </div>
    </article>
  );
}

export default function FeaturedItems() {
  const [visible, setVisible] = useState(4);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const updateVisible = () => {
      const nextVisible = itemsVisibleAt(window.innerWidth);
      setVisible(nextVisible);
      setPage((current) =>
        Math.min(current, Math.ceil(products.length / nextVisible) - 1)
      );
    };

    updateVisible();
    window.addEventListener("resize", updateVisible);
    return () => window.removeEventListener("resize", updateVisible);
  }, []);

  const groups = useMemo(() => {
    const numberOfGroups = Math.ceil(products.length / visible);
    return Array.from({ length: numberOfGroups }, (_, groupIndex) =>
      Array.from({ length: visible }, (_, itemIndex) =>
        products[(groupIndex * visible + itemIndex) % products.length]
      )
    );
  }, [visible]);

  return (
    <section id="featuredItems" className={styles.section}>
      <div className="site-container">
        {/* 50/50 Brand Selector Split: TRIGANO vs VESTA */}
        <div className={`${styles.brandSplitGrid} reveal`}>
          {/* Trigano 50% Card */}
          <Link href="/trigano" className={styles.brandCard}>
            <Image
              src="/povuci/trigano-2c250.jpg"
              alt="Trigano Auto Prikolice"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.brandCardBg}
            />
            <div className={styles.brandOverlay} />
            <div className={styles.brandContent}>
              <span className={styles.brandEyebrow}>OVLAŠĆENI DISTRIBUTER</span>
              <h2 className={styles.brandTitle}>TRIGANO PRIKOLICE</h2>
              <p className={styles.brandSubtitle}>
                Kompletan asortiman: sandučarke, dvoosovinke, kiperi i šlep program po fabričkim cenama.
              </p>
              <span className={styles.brandButton}>
                Pogledaj Trigano Ponudu ➔
              </span>
            </div>
          </Link>

          {/* Vesta 50% Card */}
          <Link href="/vesta" className={styles.brandCard}>
            <Image
              src="/povuci/vesta-light-23.webp"
              alt="Vesta Trailers Prikolice"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.brandCardBg}
            />
            <div className={styles.brandOverlay} />
            <div className={styles.brandContent}>
              <span className={styles.brandEyebrow}>OVLAŠĆENI DISTRIBUTER</span>
              <h2 className={styles.brandTitle}>VESTA TRAILERS</h2>
              <p className={styles.brandSubtitle}>
                Vrhunske toplocinkovane lake, teretne, plato, nautičke i cargo prikolice.
              </p>
              <span className={styles.brandButton}>
                Pogledaj Vesta Ponudu ➔
              </span>
            </div>
          </Link>
        </div>

        {/* Carousel: Najtraženiji Modeli */}
        <div className="section-heading reveal">
          <p className="section-heading__eyebrow">NAŠA PONUDA</p>
          <h2>Najtraženiji Modeli</h2>
        </div>

        <div
          className={`${styles.carousel} reveal`}
          aria-roledescription="carousel"
          aria-label="Najtraženiji modeli prikolica"
        >
          <div className={styles.viewport}>
            <div
              className={styles.track}
              style={{ transform: `translate3d(-${page * 100}%, 0, 0)` }}
            >
              {groups.map((group, groupIndex) => (
                <div
                  className={styles.group}
                  key={`${visible}-${groupIndex}`}
                  aria-hidden={page !== groupIndex}
                >
                  {group.map((product, itemIndex) => (
                    <div
                      className={styles.productSlot}
                      key={`${groupIndex}-${itemIndex}-${product.name}`}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div
            className="carousel-dots"
            role="group"
            aria-label="Izaberite grupu prikolica"
          >
            {groups.map((_, index) => (
              <button
                type="button"
                className="carousel-dot"
                aria-label={`Prikaži grupu prikolica ${index + 1}`}
                aria-current={page === index}
                onClick={() => setPage(index)}
                key={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
