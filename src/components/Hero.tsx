"use client";

import { useState, type TransitionEvent } from "react";
import { ChevronIcon, GearIcon } from "./icons";
import styles from "./Hero.module.css";

type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  primaryAction: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

const slides: Slide[] = [
  {
    image: "/images/hero1.webp",
    eyebrow: "OVLAŠĆENI DISTRIBUTER VESTA I TRIGANO",
    title: "SVE VRSTE AUTO PRIKOLICA NA JEDNOM MESTU",
    accent: "AUTO PRIKOLICA",
    description:
      "DDM Company nudi kompletan asortiman novih auto prikolica po fabričkim cenama. Garancija 24 meseca, izdavanje COC dokumentacije i homologacije za brzu registraciju.",
    primaryAction: { label: "POGLEDAJ KATALOG", href: "/prikolice" },
    secondaryAction: { label: "POZOVITE NAS", href: "tel:+381603001633" },
  },
  {
    image: "/images/hero2.webp",
    eyebrow: "VOZITE SA B KATEGORIJOM",
    title: "LAKE TERETNE I DVOOSOVINSKE PRIKOLICE",
    accent: "B KATEGORIJOM",
    description:
      "Atestirane prikolice do 750kg bruto mase sa Knott torzionim osovinama i vodootpornim protivklizajućim šperom. Jednoosovinske i stabilne dvoosovinke na stanju.",
    primaryAction: { label: "LAKE PRIKOLICE", href: "/prikolice" },
    secondaryAction: { label: "DVOOSOVINKE", href: "/prikolice" },
  },
  {
    image: "/images/hero3.webp",
    eyebrow: "PROFESIONALNI TRANSPORT",
    title: "PLATO, ŠLEP I NAUTIČKI PROGRAM",
    accent: "ŠLEP I NAUTIKA",
    description:
      "Šlep prikolice za prevoz automobila, univerzalne platforme i prikolice sa rolerima ili skijama za siguran prevoz čamaca i glisera.",
    primaryAction: { label: "NAUTIKA & ŠLEP", href: "/prikolice" },
  },
];

const trackSlides = [slides[slides.length - 1], ...slides, slides[0]];

function SlideTitle({ title, accent }: Pick<Slide, "title" | "accent">) {
  if (!accent) return title;

  const start = title.indexOf(accent);
  if (start < 0) return title;

  return (
    <>
      {title.slice(0, start)}
      <span>{accent}</span>
      {title.slice(start + accent.length)}
    </>
  );
}

export default function Hero() {
  const [trackIndex, setTrackIndex] = useState(1);
  const [animated, setAnimated] = useState(true);

  const activeIndex = (trackIndex - 1 + slides.length) % slides.length;

  function move(direction: number) {
    if (!animated) return;
    setTrackIndex((current) => current + direction);
  }

  function goTo(index: number) {
    if (!animated) return;
    setTrackIndex(index + 1);
  }

  function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.propertyName !== "transform") return;

    if (trackIndex === 0) {
      setAnimated(false);
      setTrackIndex(slides.length);
    } else if (trackIndex === slides.length + 1) {
      setAnimated(false);
      setTrackIndex(1);
    }
  }

  return (
    <section className={styles.hero} aria-roledescription="carousel" aria-label="Istaknute prikolice">
      <div
        className={`${styles.track} ${animated ? styles.animated : ""}`}
        style={{ transform: `translate3d(-${trackIndex * 100}%, 0, 0)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {trackSlides.map((slide, index) => (
          <article
            className={styles.slide}
            style={{ backgroundImage: `url(${slide.image})` }}
            aria-hidden={index !== trackIndex}
            key={`${slide.image}-${index}`}
          >
            <div className={styles.overlay} />
            <div className={styles.content}>
              <div className={styles.iconTile} aria-hidden="true">
                <GearIcon />
              </div>
              <p className={styles.eyebrow}>{slide.eyebrow}</p>
              {index === 1 ? (
                <h1 className={styles.title}>
                  <SlideTitle title={slide.title} accent={slide.accent} />
                </h1>
              ) : (
                <h2 className={styles.title}>
                  <SlideTitle title={slide.title} accent={slide.accent} />
                </h2>
              )}
              <p className={styles.description}>{slide.description}</p>
              <div className={styles.actions}>
                <a
                  className={`${styles.button} ${styles.primary}`}
                  href={slide.primaryAction.href}
                  tabIndex={index === trackIndex ? 0 : -1}
                >
                  {slide.primaryAction.label}
                </a>
                {slide.secondaryAction ? (
                  <a
                    className={`${styles.button} ${styles.secondary}`}
                    href={slide.secondaryAction.href}
                    tabIndex={index === trackIndex ? 0 : -1}
                  >
                    {slide.secondaryAction.label}
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>

      <button
        className={`${styles.arrow} ${styles.previous}`}
        type="button"
        onClick={() => move(-1)}
        aria-label="Prethodni slajd"
      >
        <ChevronIcon />
      </button>
      <button
        className={`${styles.arrow} ${styles.next}`}
        type="button"
        onClick={() => move(1)}
        aria-label="Sledeći slajd"
      >
        <ChevronIcon />
      </button>

      <div className={styles.dots} role="group" aria-label="Izbor slajda">
        {slides.map((slide, index) => (
          <button
            className={styles.dot}
            type="button"
            aria-label={`Prikaži slajd ${index + 1}: ${slide.title}`}
            aria-current={activeIndex === index ? "true" : undefined}
            onClick={() => goTo(index)}
            key={slide.image}
          />
        ))}
      </div>
    </section>
  );
}
