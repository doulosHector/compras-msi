import { styles } from "../styles";

export function ImportCsvModal({ error, onClose, onImport }) {
  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(event) => event.stopPropagation()}>
        <h2 style={styles.formTitle}>Importar compras desde CSV</h2>
        <p style={{ ...styles.detail, fontSize: 14 }}>
          Sube un archivo .csv separado por comas, con encabezados en la primera
          fila. Las columnas requeridas son:
        </p>
        <ul
          style={{
            ...styles.detail,
            fontSize: 14,
            paddingLeft: 20,
            lineHeight: 1.7,
          }}
        >
          <li>
            <strong>nombre</strong> — descripción de la compra
          </li>
          <li>
            <strong>monto</strong> — monto total (ej. 12500.50)
          </li>
          <li>
            <strong>meses</strong> — meses sin intereses (ej. 12)
          </li>
          <li>
            <strong>fecha</strong> — fecha de compra en formato AAAA-MM-DD
          </li>
        </ul>
        <p style={{ ...styles.detail, fontSize: 13, fontStyle: "italic" }}>
          Ejemplo: nombre,monto,meses,fecha ⏎
          Refrigerador,12500,12,2026-05-10
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) =>
            event.target.files?.[0] && onImport(event.target.files[0])
          }
          style={{ marginTop: 8, fontSize: 14 }}
        />
        {error && <p style={styles.error}>{error}</p>}
        <div style={{ marginTop: 16 }}>
          <button onClick={onClose} style={styles.secondaryButton}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
