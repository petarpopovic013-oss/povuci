import Link from "next/link";
import {
  HeadsetIcon,
  InstagramIcon,
  LocationIcon,
  MoneyIcon,
  PhoneIcon,
  ShieldIcon,
  TruckIcon,
  WhatsAppIcon,
} from "./icons";
import styles from "./Footer.module.css";

const services = [
  {
    title: "Fabričke Cene",
    desc: "Direktna prodaja bez posredničkih marži uz račun i garanciju.",
    Icon: MoneyIcon,
  },
  {
    title: "24 Meseca Garancije",
    desc: "Puna garancija kvaliteta na sve modele Vesta i Trigano prikolica.",
    Icon: ShieldIcon,
  },
  {
    title: "Papiri Za Registraciju",
    desc: "Homologacija i COC sertifikati za brzu registraciju na tehničkom.",
    Icon: TruckIcon,
  },
  {
    title: "Stručna Podrška & Kuke",
    desc: "Saveti pri izboru prikolice i profesionalna ugradnja euro kuka.",
    Icon: HeadsetIcon,
  },
];

const navigationLinks = [
  { name: "Početna Strana", href: "/" },
  { name: "Katalog Prikolica (68 modela)", href: "/prikolice" },
  { name: "Vesta Trailers Prikolice", href: "/vesta" },
  { name: "Trigano Prikolice", href: "/trigano" },
  { name: "Ugradnja Auto Kuka", href: "/#auto-kuke" },
  { name: "Kontakt & Lokacija", href: "/kontakt" },
];

const categoryLinks = [
  { name: "Lake teretne do 750kg (B kat.)", href: "/prikolice" },
  { name: "Dvoosovinske prikolice", href: "/prikolice" },
  { name: "Plato i šlep prikolice", href: "/prikolice" },
  { name: "Nautički program i čamci", href: "/prikolice" },
  { name: "Kiper i sandučarke", href: "/prikolice" },
];

const ddmGroupLinks = [
  { name: "DDM Company", href: "https://ddmcompany.rs" },
  { name: "DDM Rent a Car", href: "https://ddmrentacar.rs" },
  { name: "Keeway Srbija", href: "https://keeway.rs" },
  { name: "Morbidelli", href: "https://morbidelli.rs" },
];

export default function Footer() {
  return (
    <footer className={styles.footer} id="kontakt">
      {/* 1. Prednosti kupovine */}
      <section className={styles.services} aria-label="Prednosti kupovine kod nas">
        <div className={`site-container ${styles.serviceGrid}`}>
          {services.map(({ title, desc, Icon }) => (
            <article className={styles.servicePanel} key={title}>
              <span className={styles.serviceIcon} aria-hidden="true">
                <Icon />
              </span>
              <h2>{title}</h2>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 2. Glavni widgeti */}
      <section className={styles.widgets} aria-label="Informacije i navigacija">
        <div className={`site-container ${styles.widgetGrid}`}>
          {/* Kolona 1: O Nama & Kontakt Info */}
          <div className={styles.aboutWidget}>
            <div className={styles.aboutBrandBadge}>
              <span className={styles.aboutBrandTitle}>
                POVUCI<span style={{ color: "#d22e2e" }}>.RS</span>
              </span>
              <span className={styles.aboutBrandSubtitle}>DDM COMPANY • NOVI SAD</span>
            </div>
            <p>
              Ovlašćeni distributer novih auto prikolica <strong>VESTA Trailers</strong> i <strong>TRIGANO</strong>. Fabričke cene, 24 meseca garancije i kompletna dokumentacija za registraciju.
            </p>
            
            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <LocationIcon className={styles.contactIcon} aria-hidden="true" />
                <span>Dr Svetislava Kasapinovića 9, 21000 Novi Sad</span>
              </div>
              <div className={styles.contactItem}>
                <PhoneIcon className={styles.contactIcon} aria-hidden="true" />
                <a href="tel:+381603001633" className={styles.phoneLink}>
                  060 / 300 - 1633
                </a>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.hoursDot} aria-hidden="true" />
                <span>Pon – Sub: 08:00 – 18:00 h</span>
              </div>
            </div>

            <div className={styles.socialButtons}>
              <a
                href="https://www.instagram.com/ddmcompany.ns/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.instagramBtn}
                aria-label="Zapratite nas na Instagramu"
              >
                <InstagramIcon style={{ width: "15px", height: "15px" }} />
                <span>Instagram</span>
              </a>
              <a
                href="https://wa.me/381603001633"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
                aria-label="Pišite nam na WhatsApp"
              >
                <WhatsAppIcon style={{ width: "14px", height: "14px" }} />
                <span>WhatsApp</span>
              </a>
              <a
                href="tel:+381603001633"
                className={styles.directCallBtn}
                aria-label="Pozovite nas direktno"
              >
                <PhoneIcon style={{ width: "13px", height: "13px" }} />
                <span>Poziv</span>
              </a>
            </div>
          </div>

          {/* Kolona 2: Navigacija */}
          <nav className={styles.linkWidget} aria-label="Glavna navigacija">
            <h2>Navigacija</h2>
            <ul>
              {navigationLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span aria-hidden="true">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kolona 3: Kategorije */}
          <nav className={styles.linkWidget} aria-label="Kategorije prikolica">
            <h2>Kategorije</h2>
            <ul>
              {categoryLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span aria-hidden="true">›</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Kolona 4: DDM Grupa */}
          <nav className={styles.linkWidget} aria-label="DDM Grupa mreža">
            <h2>DDM Grupa</h2>
            <ul>
              {ddmGroupLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <span aria-hidden="true">›</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* 3. Bottom Bar */}
      <div className={styles.footerBar}>
        <div className={`site-container ${styles.footerBarInner}`}>
          <p className={styles.copyright}>
            © 2026 POVUCI.RS — DDM Company Novi Sad. Sva prava zadržana.
          </p>

          <nav className={styles.legal} aria-label="Brzi linkovi">
            <Link href="/">Početna</Link>
            <Link href="/prikolice">Katalog</Link>
            <Link href="/vesta">Vesta</Link>
            <Link href="/trigano">Trigano</Link>
            <Link href="/#auto-kuke">Auto Kuke</Link>
            <Link href="/kontakt">Kontakt</Link>
          </nav>

          <p className={styles.distributorText}>
            Zvanični distributer: <strong>VESTA</strong> & <strong>TRIGANO</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
