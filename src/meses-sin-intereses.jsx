import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ---------- Almacenamiento (localStorage con respaldo en memoria) ----------
const memoria = {};
const almacen = {
  get(clave) {
    try {
      return localStorage.getItem(clave);
    } catch {
      return memoria[clave] ?? null;
    }
  },
  set(clave, valor) {
    try {
      localStorage.setItem(clave, valor);
    } catch {
      memoria[clave] = valor;
    }
  },
};

function leerDatosGuardados() {
  try {
    const crudo = almacen.get("msi-datos");
    if (crudo) {
      const datos = JSON.parse(crudo);
      return {
        compras: datos.compras || [],
        diaCorte: datos.diaCorte || 1,
      };
    }
  } catch {
    // Sin datos previos o datos corruptos
  }
  return { compras: [], diaCorte: 1 };
}

// ---------- Utilidades de fechas ----------
const hoy = () => new Date();

// Número de fechas de corte que han pasado desde la fecha de compra hasta hoy
function mesesPagados(fechaCompra, diaCorte) {
  const compra = new Date(fechaCompra + "T00:00:00");
  const ahora = hoy();
  let corte = new Date(compra.getFullYear(), compra.getMonth(), diaCorte);
  if (corte <= compra)
    corte = new Date(compra.getFullYear(), compra.getMonth() + 1, diaCorte);
  let n = 0;
  while (corte <= ahora) {
    n++;
    corte = new Date(corte.getFullYear(), corte.getMonth() + 1, diaCorte);
  }
  return n;
}

function proximoCorte(diaCorte) {
  const a = hoy();
  let c = new Date(a.getFullYear(), a.getMonth(), diaCorte);
  if (c <= a) c = new Date(a.getFullYear(), a.getMonth() + 1, diaCorte);
  return c;
}

const fmtMoneda = (n) =>
  n.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  });

const fmtFecha = (d) =>
  d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ---------- Componente principal ----------
export default function AppMSI() {
  const [compras, setCompras] = useState(() => leerDatosGuardados().compras);
  const [diaCorte, setDiaCorte] = useState(() => leerDatosGuardados().diaCorte);
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pestana, setPestana] = useState("actuales"); // "actuales" | "historial" | "proyeccion"
  const [mostrarImportar, setMostrarImportar] = useState(false);
  const [errorImportar, setErrorImportar] = useState("");
  const [ordenAntiguoPrimero, setOrdenAntiguoPrimero] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    monto: "",
    meses: "",
    fecha: "",
  });

  function guardar(nuevasCompras, nuevoDia) {
    almacen.set(
      "msi-datos",
      JSON.stringify({ compras: nuevasCompras, diaCorte: nuevoDia }),
    );
  }

  function actualizar(nuevasCompras, nuevoDia = diaCorte) {
    setCompras(nuevasCompras);
    setDiaCorte(nuevoDia);
    guardar(nuevasCompras, nuevoDia);
  }

  // ---------- Acciones ----------
  function limpiarForm() {
    setForm({
      nombre: "",
      monto: "",
      meses: "",
      fecha: new Date().toISOString().slice(0, 10),
    });
  }

  function abrirNueva() {
    limpiarForm();
    setEditando(null);
    setMostrarForm(true);
    setError("");
  }

  function abrirEdicion(c) {
    setForm({
      nombre: c.nombre,
      monto: String(c.monto),
      meses: String(c.meses),
      fecha: c.fecha,
    });
    setEditando(c.id);
    setMostrarForm(true);
    setError("");
  }

  function guardarCompra() {
    const monto = parseFloat(form.monto);
    const meses = parseInt(form.meses, 10);
    if (!form.nombre.trim())
      return setError("Escribe un nombre para la compra.");
    if (!monto || monto <= 0)
      return setError("El monto debe ser mayor a cero.");
    if (!meses || meses <= 0)
      return setError("El número de meses debe ser mayor a cero.");
    if (!form.fecha) return setError("Selecciona la fecha de compra.");
    setError("");

    if (editando) {
      actualizar(
        compras.map((c) =>
          c.id === editando
            ? {
                ...c,
                nombre: form.nombre.trim(),
                monto,
                meses,
                fecha: form.fecha,
              }
            : c,
        ),
      );
    } else {
      actualizar([
        ...compras,
        {
          id: Date.now().toString(36),
          nombre: form.nombre.trim(),
          monto,
          meses,
          fecha: form.fecha,
        },
      ]);
    }
    setMostrarForm(false);
  }

  function eliminar(id) {
    actualizar(compras.filter((c) => c.id !== id));
  }

  // ---------- Importar CSV ----------
  function importarCSV(archivo) {
    setErrorImportar("");
    const lector = new FileReader();
    lector.onload = () => {
      try {
        const lineas = String(lector.result)
          .split(/\r?\n/)
          .filter((l) => l.trim());
        if (lineas.length < 2)
          throw new Error("El archivo no tiene filas de datos.");
        const encabezados = lineas[0]
          .split(",")
          .map((h) => h.trim().toLowerCase());
        const idx = {
          nombre: encabezados.indexOf("nombre"),
          monto: encabezados.indexOf("monto"),
          meses: encabezados.indexOf("meses"),
          fecha: encabezados.indexOf("fecha"),
        };
        if (Object.values(idx).some((i) => i === -1))
          throw new Error(
            "Faltan columnas. Se requieren: nombre, monto, meses, fecha.",
          );
        const nuevas = [];
        for (let i = 1; i < lineas.length; i++) {
          const c = lineas[i].split(",").map((v) => v.trim());
          const nombre = c[idx.nombre];
          const monto = parseFloat(c[idx.monto]);
          const meses = parseInt(c[idx.meses], 10);
          const fecha = c[idx.fecha];
          if (
            !nombre ||
            !(monto > 0) ||
            !(meses > 0) ||
            !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
          )
            throw new Error(
              `Fila ${i + 1} inválida. Revisa el formato de cada columna.`,
            );
          nuevas.push({
            id: Date.now().toString(36) + i,
            nombre,
            monto,
            meses,
            fecha,
          });
        }
        actualizar(nuevas);
        setMostrarImportar(false);
      } catch (e) {
        setErrorImportar(e.message || "No se pudo leer el archivo.");
      }
    };
    lector.onerror = () => setErrorImportar("No se pudo leer el archivo.");
    lector.readAsText(archivo);
  }

  // ---------- Cálculos ----------
  const filas = compras.map((c) => {
    const cortesPasados = mesesPagados(c.fecha, diaCorte);
    const pagados = Math.min(cortesPasados, c.meses); // mensualidad actual (0 = aún no inicia)
    const mensualidad = c.monto / c.meses;
    const restantes = c.meses - pagados;
    const porcentaje = Math.round((pagados / c.meses) * 100);
    // Completada: un corte después de la última mensualidad
    const completada = cortesPasados > c.meses;
    return { ...c, pagados, mensualidad, restantes, porcentaje, completada };
  });

  const actuales = filas.filter((f) => !f.completada);
  const historial = filas.filter((f) => f.completada);
  // Solo cuentan para el pago mensual las compras que ya están en mensualidad 1 o más
  const cobrando = actuales.filter((f) => f.pagados >= 1);
  const totalMensual = cobrando.reduce((s, f) => s + f.mensualidad, 0);
  const totalRestante = actuales.reduce(
    (s, f) => s + f.mensualidad * f.restantes,
    0,
  );

  // Proyección: pago total por mes para los próximos 12 meses (desde el mes actual)
  const nombresMes = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  const ahora = hoy();
  const proyeccion = Array.from({ length: 12 }, (_, i) => {
    const corte = new Date(ahora.getFullYear(), ahora.getMonth() + i, diaCorte);
    let total = 0;
    for (const c of compras) {
      const compra = new Date(c.fecha + "T00:00:00");
      // Primer corte de esta compra
      let primer = new Date(compra.getFullYear(), compra.getMonth(), diaCorte);
      if (primer <= compra)
        primer = new Date(
          compra.getFullYear(),
          compra.getMonth() + 1,
          diaCorte,
        );
      // Número de mensualidad que corresponde a este corte
      const n =
        (corte.getFullYear() - primer.getFullYear()) * 12 +
        (corte.getMonth() - primer.getMonth()) +
        1;
      if (n >= 1 && n <= c.meses) total += c.monto / c.meses;
    }
    return {
      mes: `${nombresMes[corte.getMonth()]} ${String(corte.getFullYear()).slice(2)}`,
      total: Math.round(total * 100) / 100,
    };
  });

  const listaBase = pestana === "actuales" ? actuales : historial;
  const textoBusqueda = busqueda.trim().toLowerCase();
  const lista = [...listaBase]
    .filter(
      (c) =>
        !textoBusqueda || c.nombre.toLowerCase().includes(textoBusqueda),
    )
    .sort((a, b) => {
      const cmp = a.fecha.localeCompare(b.fecha) || a.id.localeCompare(b.id);
      return ordenAntiguoPrimero ? cmp : -cmp;
    });

  return (
    <div style={est.pagina}>
      <style>{`
        .msi-input:hover { border-color: #3d6bce; }
        .msi-input:focus { outline: none; border-color: #3d6bce; box-shadow: 0 0 0 3px rgba(61,107,206,0.18); }
      `}</style>
      <div style={est.contenedor}>
        {/* Encabezado */}
        <header style={{ marginBottom: 28 }}>
          <h1 style={est.titulo}>Compras a Meses sin intereses</h1>
          <p style={est.subtitulo}>
            Próximo corte: <strong>{fmtFecha(proximoCorte(diaCorte))}</strong>
            <span style={{ margin: "0 8px", color: "#a9b8d8" }}>·</span>
            Día de corte:
            <select
              value={diaCorte}
              onChange={(e) =>
                actualizar(compras, parseInt(e.target.value, 10))
              }
              style={est.selectCorte}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </p>
        </header>

        {/* Resumen */}
        <section style={est.tarjetaResumen}>
          <div style={est.itemResumen}>
            <div style={est.etiqueta}>Pago mensual actual</div>
            <div style={est.cifraGrande}>{fmtMoneda(totalMensual)}</div>
          </div>
          <div style={est.separadorV} />
          <div style={est.itemResumen}>
            <div style={est.etiqueta}>Deuda restante total</div>
            <div style={est.cifraGrande}>{fmtMoneda(totalRestante)}</div>
          </div>
        </section>

        {/* Pestañas */}
        <nav style={est.pestanas}>
          <button
            onClick={() => setPestana("actuales")}
            style={{
              ...est.pestana,
              ...(pestana === "actuales" ? est.pestanaActiva : {}),
            }}
          >
            Compras actuales ({actuales.length})
          </button>
          <button
            onClick={() => setPestana("historial")}
            style={{
              ...est.pestana,
              ...(pestana === "historial" ? est.pestanaActiva : {}),
            }}
          >
            Historial ({historial.length})
          </button>
          <button
            onClick={() => setPestana("proyeccion")}
            style={{
              ...est.pestana,
              ...(pestana === "proyeccion" ? est.pestanaActiva : {}),
            }}
          >
            Proyección
          </button>
        </nav>

        {/* Botones de acción y búsqueda */}
        {pestana !== "proyeccion" && (
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
                {!mostrarForm && pestana === "actuales" && (
                  <>
                    <button onClick={abrirNueva} style={est.botonPrimario}>
                      + Registrar compra
                    </button>
                    {compras.length === 0 && (
                      <button
                        onClick={() => {
                          setMostrarImportar(true);
                          setErrorImportar("");
                        }}
                        style={est.botonSecundario}
                      >
                        Importar CSV
                      </button>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => setOrdenAntiguoPrimero((o) => !o)}
                style={{
                  ...est.botonSecundario,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
                title={
                  ordenAntiguoPrimero
                    ? "Cambiar a más nuevas primero"
                    : "Cambiar a más antiguas primero"
                }
              >
                {ordenAntiguoPrimero
                  ? "Más nuevas primero"
                  : "Más antiguas primero"}
                <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1 }}>
                  {ordenAntiguoPrimero ? "↓" : "↑"}
                </span>
              </button>
            </div>
            <input
              className="msi-input"
              style={{
                ...est.input,
                width: "100%",
                boxSizing: "border-box",
                marginTop: 12,
              }}
              type="search"
              placeholder="Buscar por nombre de compra…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar compra por nombre"
            />
          </div>
        )}

        {/* Modal de importación */}
        {mostrarImportar && (
          <div style={est.fondoModal} onClick={() => setMostrarImportar(false)}>
            <div style={est.modal} onClick={(e) => e.stopPropagation()}>
              <h2 style={est.formTitulo}>Importar compras desde CSV</h2>
              <p style={{ ...est.detalle, fontSize: 14 }}>
                Sube un archivo .csv separado por comas, con encabezados en la
                primera fila. Las columnas requeridas son:
              </p>
              <ul
                style={{
                  ...est.detalle,
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
              <p style={{ ...est.detalle, fontSize: 13, fontStyle: "italic" }}>
                Ejemplo: nombre,monto,meses,fecha ⏎
                Refrigerador,12500,12,2026-05-10
              </p>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) =>
                  e.target.files?.[0] && importarCSV(e.target.files[0])
                }
                style={{ marginTop: 8, fontSize: 14 }}
              />
              {errorImportar && <p style={est.error}>{errorImportar}</p>}
              <div style={{ marginTop: 16 }}>
                <button
                  onClick={() => setMostrarImportar(false)}
                  style={est.botonSecundario}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        {mostrarForm && (
          <section style={est.formulario}>
            <h2 style={est.formTitulo}>
              {editando ? "Editar compra" : "Nueva compra"}
            </h2>
            <div style={est.formGrid}>
              <label style={est.campo}>
                <span style={est.etiquetaCampo}>Nombre</span>
                <input
                  className="msi-input"
                  style={est.input}
                  placeholder="Ej. Refrigerador"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </label>
              <label style={est.campo}>
                <span style={est.etiquetaCampo}>Monto total</span>
                <input
                  className="msi-input"
                  style={est.input}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                />
              </label>
              <label style={est.campo}>
                <span style={est.etiquetaCampo}>Meses sin intereses</span>
                <input
                  className="msi-input"
                  style={est.input}
                  type="number"
                  min="1"
                  placeholder="Ej. 12"
                  value={form.meses}
                  onChange={(e) => setForm({ ...form, meses: e.target.value })}
                />
              </label>
              <label style={est.campo}>
                <span style={est.etiquetaCampo}>Mensualidad estimada</span>
                <input
                  style={{
                    ...est.input,
                    background: "#e9eef7",
                    color: "#5a6a90",
                    cursor: "not-allowed",
                  }}
                  readOnly
                  tabIndex={-1}
                  value={
                    parseFloat(form.monto) > 0 && parseInt(form.meses, 10) > 0
                      ? fmtMoneda(
                          parseFloat(form.monto) / parseInt(form.meses, 10),
                        )
                      : "—"
                  }
                />
              </label>
              <label style={est.campo}>
                <span style={est.etiquetaCampo}>Fecha de compra</span>
                <input
                  className="msi-input"
                  style={est.input}
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                />
              </label>
            </div>
            {error && <p style={est.error}>{error}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={guardarCompra} style={est.botonPrimario}>
                {editando ? "Guardar cambios" : "Agregar compra"}
              </button>
              <button
                onClick={() => {
                  setMostrarForm(false);
                  setError("");
                }}
                style={est.botonSecundario}
              >
                Cancelar
              </button>
            </div>
          </section>
        )}

        {/* Proyección */}
        {pestana === "proyeccion" && (
          <section style={est.tarjetaGrafica}>
            <h2 style={est.formTitulo}>
              Pago mensual proyectado (próximos 12 meses)
            </h2>
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <BarChart
                  data={proyeccion}
                  margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e4ebf8"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 12, fill: "#6b7a99" }}
                    tickLine={false}
                    axisLine={{ stroke: "#dbe4f5" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7a99" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v.toLocaleString("es-MX")}`}
                    width={70}
                  />
                  <Tooltip
                    formatter={(v) => [fmtMoneda(v), "Pago del mes"]}
                    cursor={{ fill: "rgba(61,107,206,0.08)" }}
                  />
                  <Bar dataKey="total" fill="#3d6bce" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ ...est.detalle, marginTop: 10 }}>
              Cada barra es la suma de las mensualidades que corresponden al
              corte de ese mes.
            </p>
          </section>
        )}

        {/* Lista */}
        {pestana !== "proyeccion" && lista.length === 0 && !mostrarForm && (
          <p style={{ color: "#6b7a99", marginTop: 24, fontStyle: "italic" }}>
            {listaBase.length > 0 && textoBusqueda
              ? `No hay compras que coincidan con “${busqueda.trim()}”.`
              : pestana === "actuales"
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
          {pestana !== "proyeccion" &&
            lista.map((c) => (
              <article
                key={c.id}
                style={{
                  ...est.tarjetaCompra,
                  opacity: c.completada ? 0.65 : 1,
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
                    <h3 style={est.nombreCompra}>{c.nombre}</h3>
                    {c.completada && (
                      <span style={est.insigniaCompletada}>Completada</span>
                    )}
                    {!c.completada && c.pagados === 0 && (
                      <span style={est.insigniaNueva}>
                        Inicia el próximo corte
                      </span>
                    )}
                  </div>
                  <p style={est.detalle}>
                    {fmtMoneda(c.monto)} a {c.meses} meses · comprado el{" "}
                    {fmtFecha(new Date(c.fecha + "T00:00:00"))}
                  </p>
                  {/* Barra de progreso */}
                  <div style={est.barraFondo}>
                    <div
                      style={{
                        ...est.barraProgreso,
                        width: `${c.porcentaje}%`,
                        background: c.completada ? "#8fa3c8" : "#3d6bce",
                      }}
                    />
                  </div>
                  <p style={{ ...est.detalle, marginTop: 6 }}>
                    {c.completada
                      ? `Pagada por completo (100%)`
                      : `Mensualidad ${c.pagados} de ${c.meses} · ${c.porcentaje}%`}
                  </p>
                </div>
                <div style={est.ladoDerecho}>
                  <div style={est.mensualidad}>{fmtMoneda(c.mensualidad)}</div>
                  <div
                    style={{
                      ...est.etiquetaCampo,
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
                      onClick={() => abrirEdicion(c)}
                      style={est.botonMini}
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => eliminar(c.id)}
                      style={est.botonMini}
                      title="Eliminar"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Estilos (paleta azul eléctrico) ----------
const est = {
  pagina: {
    minHeight: "100vh",
    background: "#f2f5fc",
    padding: "32px 16px",
    fontFamily: "'Avenir Next', 'Segoe UI', system-ui, sans-serif",
    color: "#1c2540",
  },
  contenedor: { maxWidth: 720, margin: "0 auto" },
  titulo: {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 32,
    fontWeight: 600,
    margin: 0,
    letterSpacing: "-0.5px",
    lineHeight: 1.15,
    color: "#101a38",
  },
  subtitulo: { color: "#6b7a99", fontSize: 14, marginTop: 6 },
  selectCorte: {
    marginLeft: 6,
    padding: "2px 6px",
    borderRadius: 6,
    border: "1px solid #c3d0ec",
    background: "#fff",
    fontSize: 13,
    color: "#1c2540",
  },
  tarjetaResumen: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    background: "linear-gradient(135deg, #2a4a94 0%, #3d6bce 100%)",
    color: "#eef3ff",
    borderRadius: 14,
    padding: "24px 24px",
    marginBottom: 18,
    flexWrap: "wrap",
  },
  itemResumen: { textAlign: "center" },
  separadorV: {
    width: 1,
    alignSelf: "stretch",
    background: "rgba(238,243,255,0.25)",
  },
  etiqueta: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    opacity: 0.75,
    marginBottom: 4,
  },
  etiquetaCampo: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#5a6a90",
    marginBottom: 4,
  },
  cifraGrande: {
    fontSize: 24,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  pestanas: {
    display: "flex",
    gap: 6,
    marginBottom: 18,
    borderBottom: "2px solid #dbe4f5",
  },
  pestana: {
    background: "transparent",
    border: "none",
    padding: "10px 16px",
    fontSize: 14,
    fontWeight: 600,
    color: "#6b7a99",
    cursor: "pointer",
    borderBottom: "3px solid transparent",
    marginBottom: -2,
  },
  pestanaActiva: {
    color: "#3d6bce",
    borderBottom: "3px solid #3d6bce",
  },
  botonPrimario: {
    background: "#3d6bce",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 600,
  },
  botonSecundario: {
    background: "transparent",
    color: "#3a4a70",
    border: "1px solid #c3d0ec",
    borderRadius: 8,
    padding: "7px 14px",
    fontSize: 14,
    cursor: "pointer",
  },
  fondoModal: {
    position: "fixed",
    inset: 0,
    background: "rgba(16,26,56,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 14,
    padding: 24,
    maxWidth: 480,
    width: "100%",
    boxShadow: "0 20px 50px rgba(16,26,56,0.25)",
  },
  tarjetaGrafica: {
    background: "#fff",
    border: "1px solid #dbe4f5",
    borderRadius: 14,
    padding: 20,
  },
  formulario: {
    background: "#fff",
    border: "1px solid #dbe4f5",
    borderRadius: 14,
    padding: 20,
    marginTop: 4,
  },
  formTitulo: {
    fontFamily: "Georgia, serif",
    fontSize: 20,
    margin: "0 0 14px",
    color: "#101a38",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 14,
  },
  campo: { display: "flex", flexDirection: "column", gap: 4 },
  input: {
    padding: "9px 12px",
    borderRadius: 8,
    border: "1px solid #c3d0ec",
    fontSize: 15,
    background: "#f7f9fe",
    color: "#1c2540",
  },
  error: { color: "#c23a3a", fontSize: 14, marginTop: 10, marginBottom: 0 },
  tarjetaCompra: {
    display: "flex",
    gap: 16,
    background: "#fff",
    border: "1px solid #dbe4f5",
    borderRadius: 14,
    padding: "16px 18px",
  },
  nombreCompra: { fontSize: 17, fontWeight: 600, margin: 0 },
  insigniaCompletada: {
    fontSize: 11,
    background: "#e2e9f8",
    color: "#3a4a70",
    borderRadius: 999,
    padding: "2px 10px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  insigniaNueva: {
    fontSize: 11,
    background: "#e9f0fb",
    color: "#3d6bce",
    borderRadius: 999,
    padding: "2px 10px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  detalle: { fontSize: 13, color: "#6b7a99", margin: "4px 0 8px" },
  barraFondo: {
    height: 6,
    background: "#e4ebf8",
    borderRadius: 999,
    overflow: "hidden",
  },
  barraProgreso: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.4s ease",
  },
  ladoDerecho: { textAlign: "right", flexShrink: 0 },
  mensualidad: {
    fontSize: 19,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  botonMini: {
    background: "#f2f5fc",
    border: "1px solid #c3d0ec",
    borderRadius: 8,
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: 13,
  },
};
