import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ALL_TRAILERS } from "@/data/trailers";
import { getTrailerBySlug } from "@/lib/trailers";
import type { PovuciTrailer } from "@/types/trailer";
import { EditTrailerForm } from "./edit-form";
import { ArrowIcon, ExternalLinkIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

interface EditTrailerPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

export default async function EditTrailerPage({
  params,
  searchParams,
}: EditTrailerPageProps) {
  const { id } = await params;
  const { error } = await searchParams;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let trailer: PovuciTrailer | null = null;

  // 1. Try DB by UUID
  if (isUuid) {
    try {
      const { data } = await supabaseAdmin
        .from("povuci_trailers")
        .select("*, images:povuci_trailer_images(*), filter_categories:povuci_trailer_categories(category_id)")
        .eq("id", id)
        .maybeSingle();
      if (data) {
        trailer = data as PovuciTrailer;
      }
    } catch (err) {
      console.warn("DB fetch by id error:", err);
    }
  }

  // 2. Try DB by slug
  if (!trailer) {
    try {
      const { data } = await supabaseAdmin
        .from("povuci_trailers")
        .select("*, images:povuci_trailer_images(*), filter_categories:povuci_trailer_categories(category_id)")
        .eq("slug", id)
        .maybeSingle();
      if (data) {
        trailer = data as PovuciTrailer;
      }
    } catch (err) {
      console.warn("DB fetch by slug error:", err);
    }
  }

  // 3. Try unified getTrailerBySlug (handles DB + static catalog + manifest)
  if (!trailer) {
    trailer = await getTrailerBySlug(id);
  }

  // 4. Try matching ALL_TRAILERS by ID or slug
  if (!trailer) {
    const staticItem = ALL_TRAILERS.find((t) => t.id === id || t.slug === id);
    if (staticItem) {
      trailer = await getTrailerBySlug(staticItem.slug);
    }
  }

  if (!trailer) {
    notFound();
  }

  const { data: categories } = await supabaseAdmin
    .from("povuci_categories")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-header-title">Izmena Prikolice</h1>
          <p className="admin-header-desc">
            Uređivanje tehničkih podataka, cena i fotografija za model:{" "}
            <strong style={{ color: "#fff" }}>{trailer.title || trailer.model}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {trailer.slug && (
            <Link
              href={`/prikolice/${trailer.slug}`}
              target="_blank"
              className="admin-btn-secondary"
              style={{ fontSize: "13px" }}
            >
              Pogledaj na Sajtu
              <ExternalLinkIcon style={{ width: "14px", height: "14px" }} aria-hidden="true" />
            </Link>
          )}
          <Link href="/admin/prikolice" className="admin-btn-secondary" style={{ fontSize: "13px" }}>
            <ArrowIcon
              style={{ width: "14px", height: "14px", transform: "rotate(180deg)" }}
              aria-hidden="true"
            />
            Nazad na listu
          </Link>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      <EditTrailerForm trailer={trailer} categories={categories} />
    </div>
  );
}
