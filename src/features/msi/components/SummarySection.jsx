import { styles } from "../styles";
import { formatCurrency } from "../utils/format";

export function SummarySection({ monthlyTotal, remainingTotal }) {
  return (
    <section style={styles.summaryCard}>
      <div style={styles.summaryItem}>
        <div style={styles.label}>Pago mensual actual</div>
        <div style={styles.bigFigure}>{formatCurrency(monthlyTotal)}</div>
      </div>
      <div style={styles.verticalDivider} />
      <div style={styles.summaryItem}>
        <div style={styles.label}>Deuda restante total</div>
        <div style={styles.bigFigure}>{formatCurrency(remainingTotal)}</div>
      </div>
    </section>
  );
}
