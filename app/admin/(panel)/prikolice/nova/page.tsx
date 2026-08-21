import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { CreateTrailerForm } from "./create-form";

export const dynamic = "force-dynamic";

export default async function NovaPrikolicaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { data: categories } = await supabaseAdmin
    .from("povuci_categories")
    .select("id, name")
    .order("sort_order", { ascending: true });

  const { error } = await searchParams;

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Dodaj Novu Prikolicu</h1>
          <p className="admin-header-desc">
            Unesite detaljne tehničke podatke i specifikacije prikolice za upis u bazu.
          </p>
        </div>

        <Link href="/admin/prikolice" className="admin-btn-secondary">
          ← Nazad na listu
        </Link>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <CreateTrailerForm categories={categories} />
    </div>
  );
}
