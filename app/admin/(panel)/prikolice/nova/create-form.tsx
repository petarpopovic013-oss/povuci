"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertIcon, CheckIcon, SaveIcon } from "@/components/icons";
import { TrailerCategoryCheckboxes } from "@/components/TrailerCategoryCheckboxes";

interface CreateTrailerFormProps {
  categories: { id: string; name: string }[] | null;
}

export function CreateTrailerForm({ categories }: CreateTrailerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formElement = e.currentTarget;
      const formData = new FormData(formElement);

      const res = await fetch("/api/admin/trailers/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Došlo je do greške pri dodavanju prikolice.");
      }

      setSuccess(data.message || "Prikolica je uspešno dodata!");

      setTimeout(() => {
        router.push("/admin/prikolice?success=" + encodeURIComponent(data.message || "Prikolica dodata"));
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
          <select id="brand" name="brand" required className="admin-select">
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
            placeholder="npr. Vesta Light 23 auto-prikolica"
            className="admin-input"
          />
        </div>

        <TrailerCategoryCheckboxes categories={categories} />

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
            placeholder="npr. 130000"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="status">
            Status Dostupnosti
          </label>
          <select id="status" name="status" defaultValue="available" className="admin-select">
            <option value="available">Dostupno na stanju</option>
            <option value="on_order">Poručuje se</option>
            <option value="out_of_stock">Trenutno rasprodato</option>
            <option value="inactive">Neaktivno (sakriveno)</option>
          </select>
        </div>
      </div>

      {/* 2. Osobine i filteri */}
      <h3 className="admin-form-section-title">2. Osobine i Karakteristike</h3>
      <div
        className="admin-form-grid"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="axles_count">
            Broj Osovina
          </label>
          <select id="axles_count" name="axles_count" defaultValue="1" className="admin-select">
            <option value="1">1 osovina (jednoosovinka)</option>
            <option value="2">2 osovine (dvoosovinka)</option>
            <option value="3">3 osovine (troosovinka)</option>
          </select>
        </div>

        <div
          className="admin-form-group"
          style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}
        >
          <input
            id="is_b_category"
            name="is_b_category"
            type="checkbox"
            defaultChecked
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
            id="has_tilt"
            name="has_tilt"
            type="checkbox"
            style={{ width: "18px", height: "18px", accentColor: "#d22e2e" }}
          />
          <label
            className="admin-form-label"
            htmlFor="has_tilt"
            style={{ margin: 0, cursor: "pointer" }}
          >
            Kipovanje tereta (kiper)
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
            defaultChecked
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

      {/* 3. Mase i Dimenzije */}
      <h3 className="admin-form-section-title">3. Mase i Dimenzije</h3>
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="gross_weight_kg">
            Ukupna (Bruto) Masa (kg)
          </label>
          <input
            id="gross_weight_kg"
            name="gross_weight_kg"
            type="number"
            step="0.1"
            defaultValue="750"
            placeholder="npr. 750"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="curb_weight_kg">
            Sopstvena Masa / Težina (kg)
          </label>
          <input
            id="curb_weight_kg"
            name="curb_weight_kg"
            type="number"
            step="0.1"
            placeholder="npr. 168"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="payload_capacity_kg">
            Korisna Nosivost po papirima (kg)
          </label>
          <input
            id="payload_capacity_kg"
            name="payload_capacity_kg"
            type="number"
            step="0.1"
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
            placeholder="npr. 1000"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="internal_length_mm">
            Unutrašnja Dužina sanduka (mm)
          </label>
          <input
            id="internal_length_mm"
            name="internal_length_mm"
            type="number"
            placeholder="npr. 2330"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="internal_width_mm">
            Unutrašnja Širina sanduka (mm)
          </label>
          <input
            id="internal_width_mm"
            name="internal_width_mm"
            type="number"
            placeholder="npr. 1320"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="internal_height_mm">
            Unutrašnja Visina stranica (mm)
          </label>
          <input
            id="internal_height_mm"
            name="internal_height_mm"
            type="number"
            placeholder="npr. 390"
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
            placeholder="npr. 520"
            className="admin-input"
          />
        </div>
      </div>

      {/* 4. Mehanika i Materijali */}
      <h3 className="admin-form-section-title">4. Konstrukcija i Mehanika</h3>
      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="chassis">
            Šasija
          </label>
          <input
            id="chassis"
            name="chassis"
            type="text"
            placeholder="npr. Toplocinkovana čelična šasija"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="suspension">
            Vešanje i Osovine
          </label>
          <input
            id="suspension"
            name="suspension"
            type="text"
            placeholder="npr. Torziona osovina Knott / AL-KO"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="wheel_specs">
            Točkovi i Gume
          </label>
          <input
            id="wheel_specs"
            name="wheel_specs"
            type="text"
            placeholder="npr. 155/80 R13 ili 165/70 R13"
            className="admin-input"
          />
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label" htmlFor="floor_type">
            Pod Prikolice
          </label>
          <input
            id="floor_type"
            name="floor_type"
            type="text"
            placeholder="npr. Vodootporni protivklizajući šper"
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
            placeholder="npr. Prednja i zadnja se otvaraju i skidaju"
            className="admin-input"
          />
        </div>
      </div>

      {/* 5. Fotografije */}
      <h3 className="admin-form-section-title">5. Fotografije Prikolice</h3>
      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="images">
          Izaberite Slike za Upload (Automatska WebP konverzija i optimizacija)
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
          Prva izabrana slika biće automatski postavljena kao glavna slika modela.
        </span>
      </div>

      {/* 6. Opis */}
      <h3 className="admin-form-section-title" style={{ marginTop: "30px" }}>
        6. Detaljan Tekstualni Opis
      </h3>
      <div className="admin-form-group">
        <label className="admin-form-label" htmlFor="description">
          Tekst Oglasa i Specifikacije
        </label>
        <textarea
          id="description"
          name="description"
          rows={10}
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
          disabled={loading}
          className="admin-btn-primary"
          style={{ minWidth: "180px", opacity: loading ? 0.7 : 1, cursor: loading ? "wait" : "pointer" }}
        >
          <SaveIcon style={{ width: "16px", height: "16px" }} aria-hidden="true" />
          <span>{loading ? "Čuvanje i optimizacija..." : "Sačuvaj Prikolicu"}</span>
        </button>
      </div>
    </form>
  );
}
