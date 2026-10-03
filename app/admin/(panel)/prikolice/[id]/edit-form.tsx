"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertIcon, CheckIcon, SaveIcon, TrashIcon } from "@/components/icons";
import { TrailerCategoryCheckboxes } from "@/components/TrailerCategoryCheckboxes";
import type { PovuciTrailer } from "@/types/trailer";
import { deleteTrailerImageAction } from "../../../actions";

interface EditTrailerFormProps {
  trailer: PovuciTrailer;
  categories: { id: string; name: string }[] | null;
}

export function EditTrailerForm({ trailer, categories }: EditTrailerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [images, setImages] = useState(() =>
    [...(trailer.images || [])].sort(
      (a, b) => (a.sort_order || 0) - (b.sort_order || 0)
    )
  );

  async function handleDeleteImage(imageId: string, isMain: boolean) {
    const confirmed = window.confirm(
      isMain
        ? "Da li želite da obrišete glavnu fotografiju? Sledeća fotografija će automatski postati glavna."
        : "Da li želite da obrišete ovu fotografiju?"
    );

    if (!confirmed) return;

    setDeletingImageId(imageId);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteTrailerImageAction(trailer.id, imageId);

      if (!result.success) {
        throw new Error(result.error || "Fotografija nije mogla biti obrisana.");
      }

      setImages((currentImages) =>
        currentImages
          .filter((image) => image.id !== imageId)
          .map((image) => ({
            ...image,
            is_main: image.id === result.mainImageId,
          }))
      );
      setSuccess(result.message || "Fotografija je uspešno obrisana.");
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Fotografija nije mogla biti obrisana."
      );
    } finally {
      setDeletingImageId(null);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formElement = e.currentTarget;
      const formData = new FormData(formElement);

      const res = await fetch("/api/admin/trailers/update", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Došlo je do greške pri čuvanju izmena.");
      }

      setSuccess(data.message || "Izmene su uspešno sačuvane!");

      // Refresh router and redirect back to list
      setTimeout(() => {
        router.push("/admin/prikolice?success=" + encodeURIComponent(data.message || "Izmene sačuvane"));
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      console.error("Form submit error:", err);
      setError(err instanceof Error ? err.message : "Greška pri čuvanju podataka.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form-card">
      <input type="hidden" name="id" value={trailer.id} />

      {error && (
        <div
          className="admin-alert admin-alert-error"
          style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}
        >
          <AlertIcon style={{ width: "16px", height: "16px", flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          className="admin-alert admin-alert-success"
          style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}
        >
          <CheckIcon style={{ width: "16px", height: "16px", flexShrink: 0 }} />
          <span>{success}</span>
        </div>
      )}

      {/* 1. Osnovni podaci */}
      <h3 className="admin-form-section-title">1. Osnovne Informacije</h3>
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="brand">
            Brend / Proizvođač *
          </label>
          <select
            id="brand"
            name="brand"
            required
            defaultValue={trailer.brand === "Trigano" ? "Trigano" : "Vesta"}
            className="admin-select"
          >
            <option value="Vesta">Vesta Trailers</option>
            <option value="Trigano">Trigano</option>
          </select>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="model">
            Oznaka Modela * (npr. Light 23, 2C250)
          </label>
          <input
            id="model"
            name="model"
            type="text"
            required
            defaultValue={trailer.model || ""}
            placeholder="npr. Light 23"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="title">
            Puni Naziv Modela *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={trailer.title || ""}
            placeholder="npr. Vesta Light 23 auto-prikolica"
            className="admin-input"
          />
        </div>

        <TrailerCategoryCheckboxes
          categories={categories}
          selectedCategoryIds={(trailer.filter_categories || []).map(
            (category) => category.category_id
          )}
        />

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="price_rsd">
            Cena (RSD) *
          </label>
          <input
            id="price_rsd"
            name="price_rsd"
            type="number"
            step="0.01"
            required
            defaultValue={trailer.price_rsd || ""}
            placeholder="npr. 118480"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="price_eur">
            Cena u EUR (opciono)
          </label>
          <input
            id="price_eur"
            name="price_eur"
            type="number"
            step="0.01"
            defaultValue={trailer.price_eur || ""}
            placeholder="npr. 1010"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="old_price_rsd">
            Stara cena RSD (za popust/akciju)
          </label>
          <input
            id="old_price_rsd"
            name="old_price_rsd"
            type="number"
            step="0.01"
            defaultValue={trailer.old_price_rsd || ""}
            placeholder="npr. 130000"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="status">
            Status Dostupnosti
          </label>
          <select
            id="status"
            name="status"
            defaultValue={trailer.status || "available"}
            className="admin-select"
          >
            <option value="available">Dostupno na stanju</option>
            <option value="on_order">Poručuje se</option>
            <option value="out_of_stock">Trenutno rasprodato</option>
            <option value="inactive">Neaktivno (sakriveno)</option>
          </select>
        </div>
      </div>

      <h3 className="admin-form-section-title">2. Javne Karakteristike</h3>
      <p className="admin-header-desc">
        Prazna vrednost se neće prikazivati na sajtu. Polja su poređana kao na javnoj stranici.
      </p>
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="cargo_space_dimensions">Tovarni prostor</label>
          <input id="cargo_space_dimensions" name="cargo_space_dimensions" type="text" defaultValue={trailer.cargo_space_dimensions || ""} placeholder="npr. 2530 × 1340 × 550 mm" className="admin-input" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="external_dimensions">Spoljašnje dimenzije</label>
          <input id="external_dimensions" name="external_dimensions" type="text" defaultValue={trailer.external_dimensions || ""} placeholder="npr. 3720 × 1850 mm" className="admin-input" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="gross_weight_kg">Ukupna masa (kg)</label>
          <input id="gross_weight_kg" name="gross_weight_kg" type="number" step="0.1" defaultValue={trailer.gross_weight_kg ?? ""} placeholder="npr. 750" className="admin-input" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="curb_weight_kg">Masa prikolice (kg)</label>
          <input id="curb_weight_kg" name="curb_weight_kg" type="number" step="0.1" defaultValue={trailer.curb_weight_kg ?? ""} placeholder="npr. 168" className="admin-input" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="axles_count">Broj osovina</label>
          <select id="axles_count" name="axles_count" defaultValue={trailer.axles_count ?? ""} className="admin-select">
            <option value="">Nije navedeno</option>
            <option value="1">1 osovina</option>
            <option value="2">2 osovine</option>
            <option value="3">3 osovine</option>
          </select>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="tilt_type">Kip</label>
          <select id="tilt_type" name="tilt_type" defaultValue={trailer.tilt_type || ""} className="admin-select">
            <option value="">Bez kipa</option>
            <option value="mechanical">Mehanički</option>
            <option value="hydraulic">Hidraulični</option>
          </select>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="wheel_specs">Točkovi</label>
          <input id="wheel_specs" name="wheel_specs" type="text" defaultValue={trailer.wheel_specs || ""} placeholder="npr. 155/80 R13" className="admin-input" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="floor_type">Pod</label>
          <input id="floor_type" name="floor_type" type="text" defaultValue={trailer.floor_type || ""} placeholder="Ostavite prazno ako prikolica nema pod" className="admin-input" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="chassis">Konstrukcija šasije</label>
          <input id="chassis" name="chassis" type="text" defaultValue={trailer.chassis || ""} placeholder="npr. Toplocinkovana" className="admin-input" />
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="warranty_months">Garancija (meseci)</label>
          <input id="warranty_months" name="warranty_months" type="number" min="1" step="1" defaultValue={trailer.warranty_months ?? ""} placeholder="npr. 24" className="admin-input" />
        </div>
      </div>

      <h3 className="admin-form-section-title">3. Filteri i Oprema</h3>
      <div
        className="admin-form-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <div
          className="admin-form-group"
          style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}
        >
          <input
            id="is_b_category"
            name="is_b_category"
            type="checkbox"
            defaultChecked={trailer.is_b_category}
            style={{ width: "18px", height: "18px", accentColor: "#d22e2e" }}
          />
          <label
            className="admin-form-label"
            htmlFor="is_b_category"
            style={{ margin: 0, cursor: "pointer" }}
          >
            B kategorija (do 750kg bruto)
          </label>
        </div>

        <div
          className="admin-form-group"
          style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}
        >
          <input
            id="is_braked"
            name="is_braked"
            type="checkbox"
            defaultChecked={trailer.is_braked}
            style={{ width: "18px", height: "18px", accentColor: "#d22e2e" }}
          />
          <label
            className="admin-form-label"
            htmlFor="is_braked"
            style={{ margin: 0, cursor: "pointer" }}
          >
            Kočioni sistem (kočiona)
          </label>
        </div>

        <div
          className="admin-form-group"
          style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}
        >
          <input
            id="has_support_wheel"
            name="has_support_wheel"
            type="checkbox"
            defaultChecked={trailer.has_support_wheel}
            style={{ width: "18px", height: "18px", accentColor: "#d22e2e" }}
          />
          <label
            className="admin-form-label"
            htmlFor="has_support_wheel"
            style={{ margin: 0, cursor: "pointer" }}
          >
            Pomoćni točkić uključen
          </label>
        </div>

        <div
          className="admin-form-group"
          style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}
        >
          <input
            id="has_winch"
            name="has_winch"
            type="checkbox"
            defaultChecked={trailer.has_winch}
            style={{ width: "18px", height: "18px", accentColor: "#d22e2e" }}
          />
          <label
            className="admin-form-label"
            htmlFor="has_winch"
            style={{ margin: 0, cursor: "pointer" }}
          >
            Čekrk sa nosačem
          </label>
        </div>

        <div
          className="admin-form-group"
          style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}
        >
          <input
            id="has_ramps"
            name="has_ramps"
            type="checkbox"
            defaultChecked={trailer.has_ramps}
            style={{ width: "18px", height: "18px", accentColor: "#d22e2e" }}
          />
          <label
            className="admin-form-label"
            htmlFor="has_ramps"
            style={{ margin: 0, cursor: "pointer" }}
          >
            Navozne rampe / staze
          </label>
        </div>

        <div
          className="admin-form-group"
          style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}
        >
          <input
            id="is_featured"
            name="is_featured"
            type="checkbox"
            defaultChecked={trailer.is_featured}
            style={{ width: "18px", height: "18px", accentColor: "#d22e2e" }}
          />
          <label
            className="admin-form-label"
            htmlFor="is_featured"
            style={{ margin: 0, cursor: "pointer" }}
          >
            Istaknuto na početnoj strani
          </label>
        </div>
      </div>

      <h3 className="admin-form-section-title">4. Dodatni Tehnički Podaci</h3>
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="payload_capacity_kg">
            Korisna Nosivost po papirima (kg)
          </label>
          <input
            id="payload_capacity_kg"
            name="payload_capacity_kg"
            type="number"
            step="0.1"
            defaultValue={trailer.payload_capacity_kg || ""}
            placeholder="npr. 582"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="real_payload_capacity_kg">
            Stvarna nosivost konstrukcije (kg)
          </label>
          <input
            id="real_payload_capacity_kg"
            name="real_payload_capacity_kg"
            type="number"
            step="0.1"
            defaultValue={trailer.real_payload_capacity_kg || ""}
            placeholder="npr. 1000"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="loading_height_mm">
            Utovarna Visina (mm)
          </label>
          <input
            id="loading_height_mm"
            name="loading_height_mm"
            type="number"
            defaultValue={trailer.loading_height_mm || ""}
            placeholder="npr. 520"
            className="admin-input"
          />
        </div>
      </div>

      <h3 className="admin-form-section-title">5. Ostala Konstrukcija i Mehanika</h3>
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="suspension">
            Vešanje i Osovine
          </label>
          <input
            id="suspension"
            name="suspension"
            type="text"
            defaultValue={trailer.suspension || ""}
            placeholder="npr. Torziona osovina Knott / AL-KO"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="side_material">
            Materijal Stranica
          </label>
          <input
            id="side_material"
            name="side_material"
            type="text"
            defaultValue={trailer.side_material || ""}
            placeholder="npr. Pocinkovani lim / vodootporni šper"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="sides_opening">
            Otvaranje Stranica
          </label>
          <input
            id="sides_opening"
            name="sides_opening"
            type="text"
            defaultValue={trailer.sides_opening || ""}
            placeholder="npr. Prednja i zadnja se otvaraju i skidaju"
            className="admin-input"
          />
        </div>
      </div>

      <h3 className="admin-form-section-title">6. Fotografije Prikolice</h3>

      {images.length > 0 ? (
        <div className="admin-image-section">
          <div className="admin-image-section-label">
            Trenutne fotografije ({images.length}):
          </div>
          <div className="admin-image-grid">
            {images.map((img, idx) => (
              <div
                key={img.id || idx}
                className={`admin-image-card${img.is_main ? " is-main" : ""}`}
              >
                <div className="admin-image-preview">
                  <Image
                    src={img.image_url}
                    alt={`Slika ${idx + 1}`}
                    fill
                    sizes="(max-width: 600px) 45vw, 160px"
                    style={{ objectFit: "cover" }}
                  />
                  {img.is_main && <span className="admin-image-main-badge">GLAVNA</span>}
                </div>
                <button
                  type="button"
                  className="admin-image-delete-btn"
                  onClick={() => handleDeleteImage(img.id, img.is_main)}
                  disabled={loading || deletingImageId !== null}
                  aria-label={`Obriši fotografiju ${idx + 1}`}
                >
                  <TrashIcon aria-hidden="true" />
                  <span>{deletingImageId === img.id ? "Brisanje..." : "Obriši"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="admin-image-empty">Ova prikolica trenutno nema fotografije.</div>
      )}

      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="images">
          Dodaj Nove Fotografije (Opciono - automatska WebP optimizacija)
        </label>
        <input
          id="images"
          name="images"
          type="file"
          multiple
          accept="image/*"
          className="admin-input"
          style={{ padding: "8px" }}
        />
        <span style={{ fontSize: "12px", color: "#959da8", marginTop: "4px", display: "block" }}>
          Nove slike će biti automatski kompresovane u WebP format i dodate u galeriju prikolice.
        </span>
      </div>

      {/* 7. Opis */}
      <h3 className="admin-form-section-title" style={{ marginTop: "30px" }}>
        7. Detaljan Tekstualni Opis
      </h3>
      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="description">
          Tekst Oglasa i Specifikacije
        </label>
        <textarea
          id="description"
          name="description"
          rows={10}
          defaultValue={trailer.description || ""}
          placeholder="Unesite kompletan opis prikolice, spisak dodatne opreme i cene..."
          className="admin-textarea"
        />
      </div>

      <div
        style={{
          marginTop: "32px",
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Link href="/admin/prikolice" className="admin-btn-secondary">
          Odustani
        </Link>
        <button
          type="submit"
          disabled={loading || deletingImageId !== null}
          className="admin-btn-primary"
          style={{
            minWidth: "180px",
            opacity: loading || deletingImageId !== null ? 0.7 : 1,
            cursor: loading || deletingImageId !== null ? "wait" : "pointer",
          }}
        >
          <SaveIcon style={{ width: "16px", height: "16px" }} aria-hidden="true" />
          <span>{loading ? "Čuvanje izmena..." : "Sačuvaj Izmene"}</span>
        </button>
      </div>
    </form>
  );
}
