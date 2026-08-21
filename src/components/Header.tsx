"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronIcon, LocationIcon, MenuIcon, PhoneIcon } from "./icons";
import styles from "./Header.module.css";

type NavigationItem = {
  label: string;
  href: string;
  items?: { name: string; href: string }[];
};

const navigation: NavigationItem[] = [
  { label: "POČETNA", href: "/" },
  {
    label: "PRIKOLICE",
    href: "/prikolice",
    items: [
      { name: "Vesta Prikolice", href: "/vesta" },
      { name: "Trigano Prikolice", href: "/trigano" },
      { name: "Sve Prikolice (Katalog)", href: "/prikolice" },
    ],
  },
  {
    label: "AUTO KUKE",
    href: "/#auto-kuke",
  },
  {
    label: "KONTAKT",
    href: "/kontakt",
  },
];

function UtilityBar() {
  return (
    <div className={styles.utilityBar}>
      <div className={styles.utilityContainer}>
        <div className={styles.contactLinks}>
          <a href="tel:+381641334589" className={styles.topbarContactItem} aria-label="Pozovite nas: 064 / 133 - 4589">
            <PhoneIcon className={styles.topbarIcon} aria-hidden="true" />
            <span className={styles.contactText}>
              <strong>064 / 133 - 4589</strong>
            </span>
          </a>
        </div>

        <div className={styles.accountLinks}>
          <Link href="/prikolice" className={styles.topbarLink}>
            Katalog Prikolica
          </Link>
          <span className={styles.topbarDivider} aria-hidden="true">•</span>
          <Link href="/vesta" className={styles.topbarLink}>
            Vesta Prikolice
          </Link>
          <span className={styles.topbarDivider} aria-hidden="true">•</span>
          <Link href="/trigano" className={styles.topbarLink}>
            Trigano Prikolice
          </Link>
          <span className={styles.topbarDivider} aria-hidden="true">•</span>
          <Link href="/kontakt" className={styles.topbarLink}>
            Kontakt & Lokacija
          </Link>
          <span className={styles.topbarDivider} aria-hidden="true">•</span>
          <span className={styles.languageBadge}>
            <LocationIcon style={{ width: "12px", height: "12px", color: "#d22e2e" }} aria-hidden="true" />
            Novi Sad, Srbija
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY >= 50);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    const closeAtDesktop = () => {
      if (window.innerWidth >= 992) setMenuOpen(false);
    };
    window.addEventListener("resize", closeAtDesktop);
    return () => window.removeEventListener("resize", closeAtDesktop);
  }, []);

  return (
    <header className={styles.header}>
      <UtilityBar />
      <div className={styles.navigationSpace} aria-hidden="true" />
      <div className={`${styles.navigation} ${scrolled ? styles.navigationScrolled : ""}`}>
        <div className={styles.navigationContainer}>
          <Link className={styles.logo} href="/" aria-label="Povuci.rs početna">
            <div className={styles.brandBadge}>
              <span className={styles.brandTitle}>
                POVUCI<span className={styles.brandDot}>.RS</span>
              </span>
              <span className={styles.brandSubtitle}>AUTO PRIKOLICE</span>
            </div>
          </Link>

          <nav className={styles.desktopNav} aria-label="Glavna navigacija">
            <ul className={styles.menu}>
              {navigation.map((item, index) => (
                <li key={item.label} className={`${styles.menuItem} ${index === 0 ? styles.active : ""}`}>
                  <Link href={item.href}>{item.label}</Link>
                  {item.items && (
                    <ul className={styles.dropdown}>
                      {item.items.map((dropdownItem) => (
                        <li key={dropdownItem.name}>
                          <Link href={dropdownItem.href}>
                            {dropdownItem.name}
                            <ChevronIcon aria-hidden="true" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            <a className={styles.ctaHeaderBtn} href="tel:+381641334589" aria-label="Pozovite nas">
              Pozovi 064/133-4589
            </a>
          </nav>

          <button
            className={styles.mobileToggle}
            type="button"
            aria-label={menuOpen ? "Zatvori navigaciju" : "Otvori navigaciju"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon aria-hidden="true" />
          </button>
        </div>

        <nav
          id="mobile-navigation"
          className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ""}`}
          aria-label="Mobilna navigacija"
        >
          <ul>
            {navigation.map((item, index) => (
              <li key={item.label}>
                <Link
                  className={index === 0 ? styles.mobileActive : ""}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
                {item.items && (
                  <div style={{ paddingLeft: "20px", background: "#151414" }}>
                    {item.items.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        onClick={() => setMenuOpen(false)}
                        style={{ fontSize: "11px", color: "#888", display: "block", padding: "8px 20px" }}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
            <li className={styles.mobileTools}>
              <a href="tel:+381641334589" onClick={() => setMenuOpen(false)}>
                POZIV: 064 / 133 - 4589
              </a>
              <Link href="/prikolice" onClick={() => setMenuOpen(false)}>
                KATALOG PRIKOLICA
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

