"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ALL_TRAILERS } from "../data/trailers";
import { CheckIcon } from "./icons";
import styles from "./BrandCatalog.module.css";

interface BrandCatalogProps {
  brandFilter?: "Vesta" | "Trigano";
  pageTitle: string;
  pageSubtitle: string;
  badgeText: string;
}

export default function BrandCatalog({
  brandFilter,
  pageTitle,
  pageSubtitle,
  badgeText,
}: BrandCatalogProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [onlyB, setOnlyB] = useState<boolean>(false);

  const brandTrailers = useMemo(() => {
    return brandFilter
      ? ALL_TRAILERS.filter((t) => t.brand === brandFilter)
      : ALL_TRAILERS;
  }, [brandFilter]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    brandTrailers.forEach((t) => {
      map.set(t.categoryId, t.categoryName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [brandTrailers]);

  const filteredTrailers = useMemo(() => {
    return brandTrailers.filter((trailer) => {
      const matchSearch =
        search.trim() === "" ||
        trailer.title.toLowerCase().includes(search.toLowerCase()) ||
        trailer.model.toLowerCase().includes(search.toLowerCase());

      const matchCat =
        selectedCategory === "all" || trailer.categoryId === selectedCategory;

      const matchB = !onlyB || trailer.isBCategory;

      return matchSearch && matchCat && matchB;
    });
  }, [brandTrailers, search, selectedCategory, onlyB]);

  return (
    <section className={styles.catalogSection}>
      <div className="site-container">
        <div className={styles.header}>
          <span className={styles.brandBadge}>{badgeText}</span>
          <h1 className={styles.title}>{pageTitle}</h1>
          <p className={styles.description}>{pageSubtitle}</p>
        </div>

        <div className={styles.filterBar}>
          <div className={styles.filterRow}>
            <input
              type="text"
              placeholder="Pretraži modele (npr. Light 23, 2C250, Marine)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />

            <div className={styles.categoryButtons}>
              <button
                type="button"
                className={`${styles.catBtn} ${selectedCategory === "all" ? styles.catBtnActive : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                Sve ({brandTrailers.length})
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`${styles.catBtn} ${selectedCategory === c.id ? styles.catBtnActive : ""}`}
                  onClick={() => setSelectedCategory(c.id)}
                >
                  {c.name}
                </button>
              ))}
              <button
                type="button"
                className={`${styles.catBtn} ${onlyB ? styles.catBtnActive : ""}`}
                onClick={() => setOnlyB((prev) => !prev)}
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                {onlyB && (
                  <CheckIcon style={{ width: "13px", height: "13px", marginRight: "6px" }} aria-hidden="true" />
                )}
                {onlyB ? "Samo B kategorija" : "B kategorija (do 750kg)"}
              </button>
            </div>
          </div>
        </div>

        {filteredTrailers.length === 0 ? (
          <div className={styles.empty}>
            <h3>Nijedna prikolica ne odgovara kriterijumu pretrage.</h3>
            <p>Pokušajte sa resetovanjem filtera ili pretrage.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredTrailers.map((trailer) => (
              <article className={styles.card} key={trailer.id}>
                {trailer.mainImageUrl ? (
                  <Link href={`/prikolice/${trailer.slug}`} className={styles.cardImageWrap}>
                    <Image
                      src={trailer.mainImageUrl}
                      alt={trailer.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className={styles.cardImg}
                    />
                  </Link>
                ) : (
                  <Link
                    href={`/prikolice/${trailer.slug}`}
                    className={styles.cardImageWrap}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: "12px" }}
                  >
                    <span>Bez fotografije</span>
                  </Link>
                )}

                <div className={styles.cardHeader}>
                  <span className={styles.categoryTag}>{trailer.categoryName}</span>
                  {trailer.isBCategory && (
                    <span className={styles.bCatBadge}>B kategorija</span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.modelTitle}>
                    <Link href={`/prikolice/${trailer.slug}`}>{trailer.title}</Link>
                  </h3>

                  <div className={styles.specsList}>
                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Ukupna masa:</span>
                      <span className={styles.specValue}>{trailer.grossWeightKg} kg</span>
                    </div>

                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Nosivost:</span>
                      <span className={styles.specValue}>
                        {trailer.payloadCapacityKg ? `${trailer.payloadCapacityKg} kg` : "Po specifikaciji"}
                      </span>
                    </div>

                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Osovine:</span>
                      <span className={styles.specValue}>
                        {trailer.axlesCount === 2 ? "Dve osovine" : "Jedna osovina"}
                      </span>
                    </div>

                    <div className={styles.specItem}>
                      <span className={styles.specLabel}>Kipovanje:</span>
                      <span className={styles.specValue}>
                        {trailer.hasTilt ? "Da (Kiper)" : "Standardno"}
                      </span>
                    </div>

                    {trailer.dimensions && (
                      <div className={styles.specItem} style={{ gridColumn: "span 2" }}>
                        <span className={styles.specLabel}>Dimenzije tovarnog prostora:</span>
                        <span className={styles.specValue}>{trailer.dimensions}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.priceBlock}>
                    <span className={styles.priceLabel}>Cena:</span>
                    <span className={styles.priceValue}>
                      {trailer.priceRsd > 0
                        ? `${trailer.priceRsd.toLocaleString("sr-RS")} RSD`
                        : "Pozovite za cenu"}
                    </span>
                  </div>

                  <div className={styles.actions}>
                    <Link
                      href={`/prikolice/${trailer.slug}`}
                      className={styles.detailBtn}
                      aria-label={`Pogledaj detalje za model ${trailer.model}`}
                    >
                      Detalji
                    </Link>
                    <a
                      href="tel:+381641334589"
                      className={styles.callBtn}
                      aria-label={`Pozovite za model ${trailer.model}`}
                    >
                      Pozovi
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
