import Image, { type StaticImageData } from "next/image";

import eu3Image from "../../public/kuke/eu3-auto-kuka.jpeg";
import eu4Image from "../../public/kuke/eu4-auto-kuka.jpeg";
import eu5Image from "../../public/kuke/eu5-auto-kuka.jpeg";
import { CheckIcon, PhoneIcon } from "./icons";
import styles from "./TowbarModels.module.css";

interface TowbarModel {
  code: string;
  title: string;
  description: string;
  image: StaticImageData;
  imageAlt: string;
  benefits: string[];
}

const towbarModels: TowbarModel[] = [
  {
    code: "EU3",
    title: "Skidanje na dva šrafa",
    description:
      "Pouzdano i praktično rešenje kod kog se lula kuke skida jednostavnim odvrtanjem dva pričvrsna šrafa.",
    image: eu3Image,
    imageAlt: "EU3 tip auto kuke sa lulom koja se skida na dva šrafa",
    benefits: ["Jednostavna konstrukcija", "Sigurno mehaničko pričvršćivanje"],
  },
  {
    code: "EU4",
    title: "Skidanje patent-polugicom",
    description:
      "Brzoskidajući sistem omogućava da se lula oslobodi patent-polugicom, bez odvrtanja šrafova i dodatnog alata.",
    image: eu4Image,
    imageAlt: "EU4 tip auto kuke sa patent-polugicom",
    benefits: ["Brzo skidanje bez alata", "Pogodna za čestu upotrebu"],
  },
  {
    code: "EU5",
    title: "Skidanje i zaključavanje ključem",
    description:
      "Diskretan sistem sa zaštitom ključem. Kada se lula skine, prihvat kuke ostaje sakriven i ne narušava izgled vozila.",
    image: eu5Image,
    imageAlt: "EU5 tip auto kuke sa mehanizmom za zaključavanje ključem",
    benefits: ["Zaključavanje ključem", "Sakriven prihvat nakon skidanja"],
  },
];

export default function TowbarModels() {
  return (
    <section className={styles.section} aria-labelledby="towbar-models-title">
      <div className="site-container">
        <div className={`${styles.heading} section-heading reveal`}>
          <p className="section-heading__eyebrow">MODELI AUTO KUKA</p>
          <h2 id="towbar-models-title">Izaberite Sistem Koji Vam Odgovara</h2>
          <p className={styles.intro}>
            Nudimo tri proverena sistema auto kuka sa EU homologacijom. Preporučićemo
            odgovarajući tip prema modelu vozila i načinu korišćenja.
          </p>
        </div>

        <div className={styles.grid}>
          {towbarModels.map((model, index) => (
            <article className={`${styles.card} reveal`} key={model.code}>
              <div className={styles.imageWrap}>
                <Image
                  src={model.image}
                  alt={model.imageAlt}
                  fill
                  sizes="(max-width: 767px) calc(100vw - 30px), (max-width: 1100px) 50vw, 380px"
                  className={styles.image}
                  priority={index === 0}
                />
                <span className={styles.modelCode}>{model.code}</span>
              </div>

              <div className={styles.cardBody}>
                <p className={styles.typeLabel}>TIP AUTO KUKE</p>
                <h3>{model.title}</h3>
                <p className={styles.description}>{model.description}</p>
                <ul className={styles.benefits}>
                  {model.benefits.map((benefit) => (
                    <li key={benefit}>
                      <CheckIcon aria-hidden="true" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className={`${styles.contactBar} reveal`}>
          <div>
            <strong>Niste sigurni koji tip odgovara vašem vozilu?</strong>
            <span>Pošaljite nam marku, model i godište vozila — proverićemo kompatibilnost.</span>
          </div>
          <a href="tel:+381603001633">
            <PhoneIcon aria-hidden="true" />
            <span>Pozovite 060 / 300 - 1633</span>
          </a>
        </div>
      </div>
    </section>
  );
}
