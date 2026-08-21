import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AlertIcon, CheckIcon, EditIcon, PlusIcon } from "@/components/icons";
import { DeleteTrailerButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function AdminPrikoliceListPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; search?: string; success?: string; error?: string }>;
}) {
  const params = await searchParams;
  const brandFilter = params.brand;
  const searchQuery = params.search?.toLowerCase();

  let query = supabaseAdmin
    .from("povuci_trailers")
    .select("id, brand, model, title, price_rsd, status, gross_weight_kg, payload_capacity_kg, internal_length_mm, internal_width_mm, is_b_category, axles_count, created_at")
    .order("created_at", { ascending: false });

  if (brandFilter) {
    query = query.eq("brand", brandFilter);
  }

  const { data: trailers } = await query;

  const filtered = trailers?.filter((t) => {
    if (!searchQuery) return true;
    return (
      t.title?.toLowerCase().includes(searchQuery) ||
      t.model?.toLowerCase().includes(searchQuery)
    );
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Upravljanje Prikolicama</h1>
          <p className="admin-header-desc">
            Pregled, pretraga i brisanje unetih modela prikolica u Supabase bazi.
          </p>
        </div>

        <Link href="/admin/prikolice/nova" className="admin-btn-primary">
          <PlusIcon style={{ width: "16px", height: "16px" }} aria-hidden="true" />
          <span>Dodaj Novu Prikolicu</span>
        </Link>
      </div>

      {params.success && (
        <div className="admin-alert admin-alert-success" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckIcon style={{ width: "16px", height: "16px", flexShrink: 0 }} aria-hidden="true" />
          <span>{params.success}</span>
        </div>
      )}
      {params.error && (
        <div className="admin-alert admin-alert-error" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <AlertIcon style={{ width: "16px", height: "16px", flexShrink: 0 }} aria-hidden="true" />
          <span>{params.error}</span>
        </div>
      )}

      <div className="admin-table-container">
        <div className="admin-table-header">
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              href="/admin/prikolice"
              className={!brandFilter ? "admin-btn-primary" : "admin-btn-secondary"}
              style={{ fontSize: "12px", padding: "8px 14px" }}
            >
              Sve ({trailers?.length || 0})
            </Link>
            <Link
              href="/admin/prikolice?brand=Vesta"
              className={brandFilter === "Vesta" ? "admin-btn-primary" : "admin-btn-secondary"}
              style={{ fontSize: "12px", padding: "8px 14px" }}
            >
              Vesta
            </Link>
            <Link
              href="/admin/prikolice?brand=Trigano"
              className={brandFilter === "Trigano" ? "admin-btn-primary" : "admin-btn-secondary"}
              style={{ fontSize: "12px", padding: "8px 14px" }}
            >
              Trigano
            </Link>
          </div>
        </div>

        {filtered && filtered.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Brend</th>
                <th>Model / Naziv</th>
                <th>Masa / Nosivost</th>
                <th>Dimenzije sanduka</th>
                <th>Osovine</th>
                <th>Cena (RSD)</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span className={t.brand === "Vesta" ? "admin-badge-vesta" : "admin-badge-trigano"}>
                      {t.brand}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: "700", color: "#fff" }}>{t.title}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>Model: {t.model}</div>
                  </td>
                  <td>
                    <div>{t.gross_weight_kg ? `${t.gross_weight_kg} kg` : "-"}</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
                      Nosivost: {t.payload_capacity_kg ? `${t.payload_capacity_kg} kg` : "-"}
                    </div>
                  </td>
                  <td>
                    {t.internal_length_mm && t.internal_width_mm
                      ? `${t.internal_length_mm} x ${t.internal_width_mm} mm`
                      : "-"}
                  </td>
                  <td>{t.axles_count === 2 ? "2 osovine" : "1 osovina"}</td>
                  <td style={{ color: "#ff5252", fontWeight: "700" }}>
                    {t.price_rsd ? `${t.price_rsd.toLocaleString("sr-RS")} RSD` : "Poziv"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <Link
                        href={`/admin/prikolice/${t.id}`}
                        className="admin-btn-secondary"
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <EditIcon style={{ width: "13px", height: "13px" }} aria-hidden="true" />
                        <span>Izmeni</span>
                      </Link>
                      <DeleteTrailerButton id={t.id} title={t.title || t.model} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#959da8" }}>
            <p style={{ margin: "0 0 16px" }}>Nema pronađenih prikolica u bazi.</p>
            <Link href="/admin/prikolice/nova" className="admin-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <PlusIcon style={{ width: "16px", height: "16px" }} aria-hidden="true" />
              <span>Dodaj novu prikolicu</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
