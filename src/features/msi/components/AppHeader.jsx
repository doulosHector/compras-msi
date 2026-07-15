import { styles } from "../styles";
import { formatDate } from "../utils/format";
import { nextBillingDate } from "../utils/dates";

export function AppHeader({ billingDay, onBillingDayChange }) {
  return (
    <header style={{ marginBottom: 28 }}>
      <h1 style={styles.title}>Compras a Meses sin intereses</h1>
      <p style={styles.subtitle}>
        Próximo corte: <strong>{formatDate(nextBillingDate(billingDay))}</strong>
        <span style={{ margin: "0 8px", color: "#a9b8d8" }}>·</span>
        Día de corte:
        <select
          value={billingDay}
          onChange={(event) =>
            onBillingDayChange(parseInt(event.target.value, 10))
          }
          style={styles.billingDaySelect}
        >
          {Array.from({ length: 28 }, (_, index) => index + 1).map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </p>
    </header>
  );
}
