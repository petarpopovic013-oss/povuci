interface TrailerCategoryCheckboxesProps {
  categories: { id: string; name: string }[] | null;
  selectedCategoryIds?: string[];
}

export function TrailerCategoryCheckboxes({
  categories,
  selectedCategoryIds = [],
}: TrailerCategoryCheckboxesProps) {
  return (
    <fieldset
      className="admin-form-group"
      style={{ gridColumn: "1 / -1", border: 0, padding: 0, margin: 0 }}
    >
      <legend className="admin-form-label">Filter kategorije *</legend>
      <p style={{ color: "#959da8", fontSize: "12px", margin: "0 0 12px" }}>
        Jedna prikolica može pripadati u više filtera. Označite sve namene koje joj
        odgovaraju.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "10px",
        }}
      >
        {categories?.map((category) => (
          <label
            key={category.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px",
              border: "1px solid #30363d",
              borderRadius: "6px",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            <input
              type="checkbox"
              name="category_ids"
              value={category.id}
              defaultChecked={selectedCategoryIds.includes(category.id)}
              style={{ width: "18px", height: "18px", accentColor: "#d22e2e" }}
            />
            <span>{category.name}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
