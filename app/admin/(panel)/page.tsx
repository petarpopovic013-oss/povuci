import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ArrowIcon, PlusIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { data: dbTrailers } = await supabaseAdmin
    .from("povuci_trailers")
    .select("id, brand, model, title, price_rsd, status, gross_weight_kg, is_b_category, created_at")
    .order("created_at", { ascending: false });

  const totalInDb = dbTrailers ? dbTrailers.length : 0;
  const vestaInDb = dbTrailers ? dbTrailers.filter((t) => t.brand === "Vesta").length : 0;
  const triganoInDb = dbTrailers ? dbTrailers.filter((t) => t.brand === "Trigano").length : 0;
  const bCatInDb = dbTrailers ? dbTrailers.filter((t) => t.is_b_category).length : 0;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Kontrolna Tabla</h1>
          <p className="admin-header-desc">
            Pregled stanja baze prikolica, statistika i brzo dodavanje novih modela.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link href="/admin/prikolice/nova" className="admin-btn-primary">
            <PlusIcon style={{ width: "16px", height: "16px" }} aria-hidden="true" />
            <span>Dodaj Novu Prikolicu</span>
          </Link>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-label">Ukupno u Supabase bazi</div>
          <div className="admin-stat-value">{totalInDb}</div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Vesta Modeli</div>
          <div className="admin-stat-value" style={{ color: "#3498db" }}>
            {vestaInDb}
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">Trigano Modeli</div>
          <div className="admin-stat-value" style={{ color: "#ff5252" }}>
            {triganoInDb}
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-label">B Kategorija (do 750kg)</div>
          <div className="admin-stat-value" style={{ color: "#2ecc71" }}>
            {bCatInDb}
          </div>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: "16px", color: "#fff" }}>
              Poslednje dodate prikolice u bazi
            </h3>
            <span style={{ fontSize: "12px", color: "#959da8" }}>
              {totalInDb === 0
                ? "Baza je trenutno prazna. Dodajte prvu prikolicu putem dugmeta iznad."
                : `Prikazano ${Math.min(10, totalInDb)} od ${totalInDb} prikolica`}
            </span>
          </div>

          <Link href="/admin/prikolice" className="admin-btn-secondary">
            Pogledaj sve prikolice
            <ArrowIcon style={{ width: "15px", height: "15px" }} aria-hidden="true" />
          </Link>
        </div>

        {totalInDb > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Brend</th>
                <th>Model / Naziv</th>
                <th>Masa</th>
                <th>Dozvola</th>
                <th>Cena (RSD)</th>
                <th>Status</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              {dbTrailers?.slice(0, 10).map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className={t.brand === "Vesta" ? "admin-badge-vesta" : "admin-badge-trigano"}>
                      {t.brand}
                    </span>
                  </td>
                  <td style={{ fontWeight: "600", color: "#fff" }}>{t.title || t.model}</td>
                  <td>{t.gross_weight_kg ? `${t.gross_weight_kg} kg` : "-"}</td>
                  <td>{t.is_b_category ? <span className="admin-badge-bcat">B kat</span> : "E kat"}</td>
                  <td style={{ color: "#ff5252", fontWeight: "700" }}>
                    {t.price_rsd ? `${t.price_rsd.toLocaleString("sr-RS")} RSD` : "Poziv"}
                  </td>
                  <td>
                    <span style={{ color: t.status === "available" ? "#2ecc71" : "#f1c40f", fontSize: "12px" }}>
                      {t.status === "available" ? "Dostupno" : "Po porudžbini"}
                    </span>
                  </td>
                  <td style={{ color: "#777", fontSize: "12px" }}>
                    {new Date(t.created_at).toLocaleDateString("sr-RS")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "#959da8" }}>
            <p style={{ margin: "0 0 16px" }}>U bazi još nema unetih prikolica.</p>
            <Link href="/admin/prikolice/nova" className="admin-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <PlusIcon style={{ width: "16px", height: "16px" }} aria-hidden="true" />
              <span>Dodaj prvu prikolicu u bazu</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
