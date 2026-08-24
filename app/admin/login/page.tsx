import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAdminSession } from "@/lib/admin/session";
import { loginAction } from "../actions";
import "../admin.css";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await hasAdminSession()) {
    redirect("/admin");
  }

  const { error } = await searchParams;

  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-brand-title">
            POVUCI<span>.RS</span>
          </div>
          <span className="admin-brand-sub">Admin Kontrolni Panel</span>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        <form action={loginAction} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="admin-form-group">
            <label className="admin-form-label" htmlFor="password">
              Administratorska Šifra
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              placeholder="Unesite šifru"
              className="admin-input"
            />
          </div>

          <button type="submit" className="admin-btn-primary" style={{ justifyContent: "center" }}>
            Prijavi se na panel →
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <Link href="/" style={{ color: "#959da8", fontSize: "13px", textDecoration: "none" }}>
            ← Nazad na početnu stranicu
          </Link>
        </div>
      </div>
    </main>
  );
}
