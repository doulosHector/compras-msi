import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { styles } from "../styles";
import { formatCurrency } from "../utils/format";

export function ProjectionChart({ data }) {
  return (
    <section style={styles.chartCard}>
      <h2 style={styles.formTitle}>
        Pago mensual proyectado (próximos 12 meses)
      </h2>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e4ebf8"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#6b7a99" }}
              tickLine={false}
              axisLine={{ stroke: "#dbe4f5" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7a99" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toLocaleString("es-MX")}`}
              width={70}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value), "Pago del mes"]}
              cursor={{ fill: "rgba(61,107,206,0.08)" }}
            />
            <Bar dataKey="total" fill="#3d6bce" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p style={{ ...styles.detail, marginTop: 10 }}>
        Cada barra es la suma de las mensualidades que corresponden al corte de
        ese mes.
      </p>
    </section>
  );
}
