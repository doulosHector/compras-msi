import { styles } from "../styles";
import { formatCurrency, formatDate } from "../utils/format";

export function PurchaseCard({ purchase, onEdit, onDelete }) {
  return (
    <article
      style={{
        ...styles.purchaseCard,
        opacity: purchase.completed ? 0.65 : 1,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <h3 style={styles.purchaseName}>{purchase.name}</h3>
          {purchase.completed && (
            <span style={styles.completedBadge}>Completada</span>
          )}
          {!purchase.completed && purchase.paid === 0 && (
            <span style={styles.newBadge}>Inicia el próximo corte</span>
          )}
        </div>
        <p style={styles.detail}>
          {formatCurrency(purchase.amount)} a {purchase.months} meses · comprado
          el {formatDate(new Date(purchase.date + "T00:00:00"))}
        </p>
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressBar,
              width: `${purchase.percentage}%`,
              background: purchase.completed ? "#8fa3c8" : "#3d6bce",
            }}
          />
        </div>
        <p style={{ ...styles.detail, marginTop: 6 }}>
          {purchase.completed
            ? "Pagada por completo (100%)"
            : `Mensualidad ${purchase.paid} de ${purchase.months} · ${purchase.percentage}%`}
        </p>
      </div>
      <div style={styles.rightSide}>
        <div style={styles.installment}>
          {formatCurrency(purchase.installment)}
        </div>
        <div
          style={{
            ...styles.fieldLabel,
            textAlign: "right",
            opacity: 0.7,
          }}
        >
          al mes
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            marginTop: 10,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => onEdit(purchase)}
            style={styles.miniButton}
            title="Editar"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(purchase.id)}
            style={styles.miniButton}
            title="Eliminar"
          >
            🗑
          </button>
        </div>
      </div>
    </article>
  );
}
