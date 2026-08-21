import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { DashboardIcon, ExternalLinkIcon, LogoutIcon, PlusIcon, TrailerIcon } from "@/components/icons";
import { logoutAction } from "../actions";
import "../admin.css";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link href="/admin" style={{ textDecoration: "none" }}>
            <div className="admin-brand-title">
              POVUCI<span>.RS</span>
            </div>
            <span className="admin-brand-sub">Admin Panel</span>
          </Link>
        </div>

        <nav className="admin-nav">
          <Link href="/admin" className="admin-nav-item">
            <DashboardIcon style={{ width: "16px", height: "16px", flexShrink: 0 }} aria-hidden="true" />
            <span>Kontrolna Tabla</span>
          </Link>
          <Link href="/admin/prikolice" className="admin-nav-item">
            <TrailerIcon style={{ width: "16px", height: "16px", flexShrink: 0 }} aria-hidden="true" />
            <span>Sve Prikolice</span>
          </Link>
          <Link href="/admin/prikolice/nova" className="admin-nav-item">
            <PlusIcon style={{ width: "16px", height: "16px", flexShrink: 0 }} aria-hidden="true" />
            <span>Dodaj Prikolicu</span>
          </Link>
          <Link href="/" target="_blank" className="admin-nav-item" style={{ marginTop: "auto" }}>
            <ExternalLinkIcon style={{ width: "16px", height: "16px", flexShrink: 0 }} aria-hidden="true" />
            <span>Pogledaj Sajt</span>
          </Link>
        </nav>

        <div className="admin-sidebar-footer">
          <form action={logoutAction}>
            <button type="submit" className="admin-logout-btn">
              <LogoutIcon style={{ width: "16px", height: "16px", flexShrink: 0 }} aria-hidden="true" />
              <span>Odjavi se</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
