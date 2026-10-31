import Link from "next/link";
import { Barras, Encabezado } from "@/components/admin/Encabezado";
import { exigirAdmin } from "@/lib/admin";

const ORIGENES: Record<string, string> = {
  buscador: "Buscador del inicio", chips: "Opciones del inicio", catalogo: "Catálogo", servicio: "Página de servicio", barra_movil: "Barra del teléfono",
  destacados: "Lo más pedido", comparar: "Comparar versiones", vela: "Vela sugerida", productos: "Productos", menu: "Menú superior", contacto: "Cierre del inicio",
};

interface Stats {
  visitas: number; clics_solicitar: number; solicitudes: number; sin_respuesta: number;
  origenes: { etiqueta: string; n: number }[]; top: { etiqueta: string; n: number }[];
  secciones: { etiqueta: string; n: number }[]; dias: { dia: string; n: number }[];
}

export default async function Resumen({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  const dias = (await searchParams).dias === "30" ? 30 : 7;
  const { db } = await exigirAdmin();
  const [{ data, error }, { data: secciones }, { data: ultimas }] = await Promise.all([
    db.rpc("estadisticas", { dias }),
    db.from("secciones").select("id, nombre"),
    db.from("solicitudes").select("id, item_nombre, situaciones, pais, creado, estado").order("creado", { ascending: false }).limit(5),
  ]);
  if (error) return <p className="acard" style={{ padding: 20 }}>No se pudieron cargar las estadísticas: {error.message}</p>;
  const s = data as Stats;
  const nombreSec = new Map((secciones ?? []).map((x) => [x.id, x.nombre]));
  const maxDia = Math.max(1, ...s.dias.map((d) => d.n));
  const rango = (n: number) => ({ height: 36, padding: "0 14px", display: "inline-flex", alignItems: "center", borderRadius: 999, font: "600 13px Manrope, sans-serif", textDecoration: "none", border: `1px solid ${dias === n ? "#581F30" : "#CFC3B2"}`, background: dias === n ? "#581F30" : "#FBF8F3", color: dias === n ? "#FBF8F3" : "#11100F" });

  return (
    <>
      <Encabezado titulo="Hola, Circe" sub={`Así se movió tu web en los últimos ${dias} días.`}>
        <div style={{ display: "flex", gap: 6 }}><Link href="/admin?dias=7" style={rango(7)}>7 días</Link><Link href="/admin?dias=30" style={rango(30)}>30 días</Link></div>
      </Encabezado>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(170px, 100%), 1fr))", gap: 12 }}>
        {[["Visitas", s.visitas], ["Clics en «Solicitar»", s.clics_solicitar], ["Solicitudes enviadas", s.solicitudes], ["Preguntas sin respuesta", s.sin_respuesta]].map(([l, v]) => (
          <div key={l} className="acard" style={{ padding: "18px 18px 16px", display: "flex", flexDirection: "column", gap: 8, borderRadius: 16 }}>
            <span style={{ font: "700 10px Manrope, sans-serif", letterSpacing: ".14em", textTransform: "uppercase", color: "#5E574F" }}>{l}</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, lineHeight: 1, fontWeight: 600 }}>{Number(v).toLocaleString("es-CO")}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(380px, 100%), 1fr))", gap: 16 }}>
        <Barras titulo="¿Dónde hacen clic?" sub="Clics en «Solicitar» según el lugar de la web" color="#581F30" filas={s.origenes.map((o) => ({ etiqueta: ORIGENES[o.etiqueta] ?? o.etiqueta, n: o.n }))} />
        <Barras titulo="Servicios más solicitados" sub="Solicitudes enviadas por WhatsApp" color="#B79A70" filas={s.top} />
        <section className="acard" aria-label="Solicitudes por día" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, borderRadius: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><h2 className="ah2">Solicitudes por día</h2><span style={{ fontSize: 12, color: "#5E574F" }}>Hoy está resaltado</span></div>
          <div style={{ height: 160, display: "flex", alignItems: "flex-end", gap: 3, borderBottom: "1px solid #CFC3B2" }}>
            {s.dias.map((d, i) => (
              <span key={d.dia} title={`${d.dia}: ${d.n}`} style={{ flex: 1, minWidth: 0, height: `${Math.max(2, Math.round((d.n / maxDia) * 100))}%`, background: i === s.dias.length - 1 ? "#581F30" : "#C9AE86", borderRadius: "2px 2px 0 0" }} />
            ))}
          </div>
        </section>
        <Barras titulo="Clics por sección" sub="Qué caminos abren más" color="#7A3A4C" filas={s.secciones.map((x) => ({ etiqueta: nombreSec.get(x.etiqueta) ?? x.etiqueta, n: x.n }))} />
      </div>
      <section className="acard" style={{ borderRadius: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}><h2 className="ah2">Últimas solicitudes</h2><Link href="/admin/solicitudes" className="abtn">Ver todas</Link></div>
        {(ultimas ?? []).map((r) => (
          <div key={r.id} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(160px, 100%), 1fr))", gap: "4px 16px", padding: "12px 20px", borderTop: "1px solid #E6DCCD", fontSize: 13 }}>
            <strong style={{ fontSize: 14 }}>{r.item_nombre}</strong><span style={{ color: "#5E574F" }}>{r.situaciones.join(" · ") || "—"}</span>
            <span style={{ color: "#5E574F" }}>{r.pais || "—"} · {new Date(r.creado).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })}</span>
          </div>
        ))}
      </section>
    </>
  );
}
