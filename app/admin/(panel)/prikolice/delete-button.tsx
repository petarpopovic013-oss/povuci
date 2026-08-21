"use client";

import { useTransition } from "react";
import { TrashIcon } from "@/components/icons";
import { deleteTrailerAction } from "../../actions";

export function DeleteTrailerButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Da li ste sigurni da želite da obrišete prikolicu:\n\n"${title}"?\n\nOva akcija će takođe ukloniti povezane slike iz Supabase Storage-a.`
    );

    if (confirmed) {
      startTransition(async () => {
        await deleteTrailerAction(id);
      });
    }
  };

  return (
    <button
      type="button"
      className="admin-btn-danger"
      onClick={handleDelete}
      disabled={isPending}
      style={{
        opacity: isPending ? 0.6 : 1,
        cursor: isPending ? "not-allowed" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      <TrashIcon style={{ width: "13px", height: "13px" }} aria-hidden="true" />
      <span>{isPending ? "Brisanje..." : "Obriši"}</span>
    </button>
  );
}
