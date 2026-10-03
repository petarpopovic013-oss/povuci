"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronIcon, CloseIcon } from "./icons";
import styles from "./ImageLightbox.module.css";

export interface LightboxImage {
  id: string;
  src: string;
  alt: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  activeIndex: number;
  isOpen: boolean;
  title: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export default function ImageLightbox({
  images,
  activeIndex,
  isOpen,
  title,
  onIndexChange,
  onClose,
}: ImageLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])",
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || images.length < 2) return;

    const handleArrowKeys = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onIndexChange(activeIndex > 0 ? activeIndex - 1 : images.length - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onIndexChange(activeIndex < images.length - 1 ? activeIndex + 1 : 0);
      }
    };

    window.addEventListener("keydown", handleArrowKeys);
    return () => window.removeEventListener("keydown", handleArrowKeys);
  }, [activeIndex, images.length, isOpen, onIndexChange]);

  if (!isOpen || images.length === 0 || typeof document === "undefined") {
    return null;
  }

  const currentImage = images[activeIndex] || images[0];
  const showPrevious = () => {
    onIndexChange(activeIndex > 0 ? activeIndex - 1 : images.length - 1);
  };
  const showNext = () => {
    onIndexChange(activeIndex < images.length - 1 ? activeIndex + 1 : 0);
  };

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={`Uvećane fotografije: ${title}`}
      >
        <div className={styles.topBar}>
          <div className={styles.headingWrap}>
            <strong className={styles.title}>{title}</strong>
            <span className={styles.counter} aria-live="polite">
              Fotografija {activeIndex + 1} od {images.length}
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Zatvori uvećanu fotografiju"
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </div>

        <div className={styles.imageStage}>
          <Image
            src={currentImage.src}
            alt={currentImage.alt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className={styles.image}
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.navigationButton} ${styles.previousButton}`}
                onClick={showPrevious}
                aria-label="Prethodna fotografija"
              >
                <ChevronIcon aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${styles.navigationButton} ${styles.nextButton}`}
                onClick={showNext}
                aria-label="Sledeća fotografija"
              >
                <ChevronIcon aria-hidden="true" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className={styles.thumbnailRail} aria-label="Izbor fotografije">
            {images.map((image, index) => (
              <button
                type="button"
                className={`${styles.thumbnailButton} ${
                  index === activeIndex ? styles.thumbnailButtonActive : ""
                }`}
                onClick={() => onIndexChange(index)}
                aria-label={`Prikaži fotografiju ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                key={image.id}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="84px"
                  className={styles.thumbnailImage}
                />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>,
    document.body,
  );
}
