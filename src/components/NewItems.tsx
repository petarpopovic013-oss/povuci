"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ALL_TRAILERS } from "../data/trailers";
import styles from "./NewItems.module.css";

interface ProductItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
  categoryName: string;
  slug: string;
}

const products: ProductItem[] = ALL_TRAILERS.slice(0, 12).map((t) => ({
  id: t.id,
  name: t.title,
  brand: t.brand === "Vesta" ? "Vesta Trailers" : "Trigano",
  price: t.priceRsd > 0 ? `${t.priceRsd.toLocaleString("sr-RS")} RSD` : "Poziv za cenu",
  image: t.mainImageUrl || "/povuci/vesta-cargo-4120.webp",
  categoryName: t.categoryName,
  slug: t.slug,
}));

function getVisibleItems(width: number) {
  if (width <= 480) return 1;
  if (width <= 600) return 2;
  if (width <= 991) return 3;
  return 4;
}

function ProductCard({ product }: { product: ProductItem }) {
  const detailUrl = `/prikolice/${product.slug}`;

  return (
    <article className={styles.productCard}>
      <div className={styles.imageWrap}>
        <Image
          src={product.image}
          alt={product.name}
          width={270}
          height={326}
          sizes="(max-width: 480px) calc(100vw - 30px), (max-width: 600px) 50vw, (max-width: 991px) 33vw, 263px"
        />
        <div className={styles.overlay}>
          <div className={styles.actions}>
            <a href="tel:+381603001633">Pozovite</a>
            <Link href={detailUrl}>Detalji</Link>
          </div>
        </div>
      </div>

      <div className={styles.bio}>
        <Link className={styles.category} href={detailUrl}>
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

export default function NewItems() {
  const [visibleItems, setVisibleItems] = useState(4);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const syncWithViewport = () => {
      const nextVisibleItems = getVisibleItems(window.innerWidth);

      setVisibleItems((currentVisibleItems) => {
        if (currentVisibleItems !== nextVisibleItems) setActivePage(0);
        return nextVisibleItems;
      });
    };

    syncWithViewport();
    window.addEventListener("resize", syncWithViewport);
    return () => window.removeEventListener("resize", syncWithViewport);
  }, []);

  const pages = useMemo(() => {
    const pageCount = Math.ceil(products.length / visibleItems);

    return Array.from({ length: pageCount }, (_, pageIndex) =>
      Array.from(
        { length: visibleItems },
        (_, itemIndex) =>
          products[(pageIndex * visibleItems + itemIndex) % products.length],
      ),
    );
  }, [visibleItems]);

  return (
    <section className={styles.section} id="new-items">
      <div className="site-container">
        <div className="section-heading reveal">
          <p className="section-heading__eyebrow">NOVO U PONUDI</p>
          <h2>Izdvajamo Iz Ponude</h2>
        </div>

        <div
          className={`${styles.carousel} reveal`}
          aria-label="Novo u ponudi"
          aria-roledescription="carousel"
        >
          <div className={styles.viewport}>
            <div
              className={styles.track}
              style={{ transform: `translate3d(-${activePage * 100}%, 0, 0)` }}
            >
              {pages.map((page, pageIndex) => (
                <div
                  className={styles.page}
                  aria-hidden={pageIndex !== activePage}
                  key={`${visibleItems}-${pageIndex}`}
                >
                  {page.map((product, productIndex) => (
                    <div
                      className={styles.slot}
                      key={`${pageIndex}-${productIndex}-${product.name}`}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="carousel-dots" role="group" aria-label="Izaberite grupu prikolica">
            {pages.map((_, pageIndex) => (
              <button
                type="button"
                className="carousel-dot"
                aria-current={activePage === pageIndex}
                aria-label={`Prikaži grupu ${pageIndex + 1}`}
                onClick={() => setActivePage(pageIndex)}
                key={pageIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
