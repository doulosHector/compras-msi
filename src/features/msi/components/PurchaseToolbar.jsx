import { styles } from "../styles";

export function PurchaseToolbar({
  tab,
  showForm,
  purchaseCount,
  oldestFirst,
  search,
  onOpenNew,
  onOpenImport,
  onToggleSort,
  onSearchChange,
}) {
  if (tab === "projection") return null;

  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          {!showForm && tab === "current" && (
            <>
              <button onClick={onOpenNew} style={styles.primaryButton}>
                + Registrar compra
              </button>
              {purchaseCount === 0 && (
                <button onClick={onOpenImport} style={styles.secondaryButton}>
                  Importar CSV
                </button>
              )}
            </>
          )}
        </div>
        <button
          onClick={onToggleSort}
          style={{
            ...styles.secondaryButton,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
          title={
            oldestFirst
              ? "Cambiar a más nuevas primero"
              : "Cambiar a más antiguas primero"
          }
        >
          {oldestFirst ? "Más nuevas primero" : "Más antiguas primero"}
          <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1 }}>
            {oldestFirst ? "↓" : "↑"}
          </span>
        </button>
      </div>
      <input
        className="msi-input"
        style={{
          ...styles.input,
          width: "100%",
          boxSizing: "border-box",
          marginTop: 12,
        }}
        type="search"
        placeholder="Buscar por nombre de compra…"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        aria-label="Buscar compra por nombre"
      />
    </div>
  );
}
