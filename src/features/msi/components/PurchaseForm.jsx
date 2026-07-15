import { styles } from "../styles";
import { formatCurrency } from "../utils/format";

export function PurchaseForm({
  form,
  error,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
}) {
  const estimatedInstallment =
    parseFloat(form.amount) > 0 && parseInt(form.months, 10) > 0
      ? formatCurrency(parseFloat(form.amount) / parseInt(form.months, 10))
      : "—";

  return (
    <section style={styles.form}>
      <h2 style={styles.formTitle}>
        {isEditing ? "Editar compra" : "Nueva compra"}
      </h2>
      <div style={styles.formGrid}>
        <label style={styles.field}>
          <span style={styles.fieldLabel}>Nombre</span>
          <input
            className="msi-input"
            style={styles.input}
            placeholder="Ej. Refrigerador"
            value={form.name}
            onChange={(event) => onChange({ ...form, name: event.target.value })}
          />
        </label>
        <label style={styles.field}>
          <span style={styles.fieldLabel}>Monto total</span>
          <input
            className="msi-input"
            style={styles.input}
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(event) =>
              onChange({ ...form, amount: event.target.value })
            }
          />
        </label>
        <label style={styles.field}>
          <span style={styles.fieldLabel}>Meses sin intereses</span>
          <input
            className="msi-input"
            style={styles.input}
            type="number"
            min="1"
            placeholder="Ej. 12"
            value={form.months}
            onChange={(event) =>
              onChange({ ...form, months: event.target.value })
            }
          />
        </label>
        <label style={styles.field}>
          <span style={styles.fieldLabel}>Mensualidad estimada</span>
          <input
            style={{
              ...styles.input,
              background: "#e9eef7",
              color: "#5a6a90",
              cursor: "not-allowed",
            }}
            readOnly
            tabIndex={-1}
            value={estimatedInstallment}
          />
        </label>
        <label style={styles.field}>
          <span style={styles.fieldLabel}>Fecha de compra</span>
          <input
            className="msi-input"
            style={styles.input}
            type="date"
            value={form.date}
            onChange={(event) => onChange({ ...form, date: event.target.value })}
          />
        </label>
      </div>
      {error && <p style={styles.error}>{error}</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={onSubmit} style={styles.primaryButton}>
          {isEditing ? "Guardar cambios" : "Agregar compra"}
        </button>
        <button onClick={onCancel} style={styles.secondaryButton}>
          Cancelar
        </button>
      </div>
    </section>
  );
}
