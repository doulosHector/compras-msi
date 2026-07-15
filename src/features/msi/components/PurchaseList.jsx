import { formatCurrency } from "../utils/format";
import { PurchaseCard } from "./PurchaseCard";

export function PurchaseList({
  tab,
  list,
  baseListLength,
  search,
  searchText,
  showForm,
  onEdit,
  onDelete,
}) {
  if (tab === "projection") return null;

  const searchInstallmentTotal = searchText
    ? list.reduce((sum, purchase) => sum + purchase.installment, 0)
    : 0;

  return (
    <>
      {list.length === 0 && !showForm && (
        <p style={{ color: "#6b7a99", marginTop: 24, fontStyle: "italic" }}>
          {baseListLength > 0 && searchText
            ? `No hay compras que coincidan con “${search.trim()}”.`
            : tab === "current"
              ? "Aún no hay compras activas. Registra la primera para empezar a llevar el control."
              : "Todavía no hay compras completadas en el historial."}
        </p>
      )}

      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {list.map((purchase) => (
          <PurchaseCard
            key={purchase.id}
            purchase={purchase}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {searchText && list.length > 0 && (
        <p
          style={{
            marginTop: 12,
            marginBottom: 0,
            textAlign: "right",
            fontSize: 13,
            color: "#5a6a90",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          Suma de mensualidades: {formatCurrency(searchInstallmentTotal)}
        </p>
      )}
    </>
  );
}
