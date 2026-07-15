import { styles } from "../styles";

export function TabNav({ tab, onTabChange, activeCount, historyCount }) {
  return (
    <nav style={styles.tabs}>
      <button
        onClick={() => onTabChange("current")}
        style={{
          ...styles.tab,
          ...(tab === "current" ? styles.tabActive : {}),
        }}
      >
        Compras actuales ({activeCount})
      </button>
      <button
        onClick={() => onTabChange("history")}
        style={{
          ...styles.tab,
          ...(tab === "history" ? styles.tabActive : {}),
        }}
      >
        Historial ({historyCount})
      </button>
      <button
        onClick={() => onTabChange("projection")}
        style={{
          ...styles.tab,
          ...(tab === "projection" ? styles.tabActive : {}),
        }}
      >
        Proyección
      </button>
    </nav>
  );
}
