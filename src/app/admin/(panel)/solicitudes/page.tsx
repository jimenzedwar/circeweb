import Link from "next/link";
import { cambiarEstadoSolicitud } from "../../acciones";
import { Encabezado } from "@/components/admin/Encabezado";
import { exigirAdmin } from "@/lib/admin";

export default async function Solicitudes({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const estado = (await searchParams).estado ?? "nueva";
  const { db } = await exigirAdmin();
  let q = db.from("solicitudes").select("*").order("creado", { ascending: false }).limit(200);
  if (estado !== "todas") q = q.eq("estado", estado);
  const { data } = await q;
  const filtro = (id: string, l: string) => (
    <Link href={`/admin/solicitudes?estado=${id}`} style={{ height: 36, padding: "0 14px", display: "inline-flex", alignItems: "center", borderRadius: 999, font: "600 13px Manrope, sans-serif", textDecoration: "none", border: `1px solid ${estado === id ? "#581F30" : "rgba(237,228,215,.18)"}`, background: estado === id ? "#581F30" : "transparent", color: estado === id ? "#FBF8F3" : "#EDE4D7" }}>{l}</Link>
  );
  return (
    <>
      <Encabezado titulo="Solicitudes" sub="Cada formulario enviado deja aquí una copia. La conversación sigue en WhatsApp." />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{filtro("nueva", "Nuevas")}{filtro("atendida", "Atendidas")}{filtro("todas", "Todas")}</div>
      {!data?.length && <div className="acard" style={{ padding: "40px 20px", textAlign: "center", color: "#A8A096", borderRadius: 16 }}>No hay solicitudes en esta vista.</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))", gap: 12 }}>
        {data?.map((r) => (
          <article key={r.id} className="acard" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 0 }}>
                <strong style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, lineHeight: 1.1 }}>{r.item_nombre}</strong>
                <span style={{ fontSize: 12, color: "#A8A096" }}>{new Date(r.creado).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" })} · {r.pais || "País sin indicar"} · desde {r.origen || "—"}</span>
              </div>
              <span style={{ flex: "none", padding: "4px 10px", borderRadius: 999, font: "700 11px Manrope, sans-serif", ...(r.estado === "atendida" ? { background: "rgba(80,170,120,.15)", color: "#9BD8B5" } : { background: "rgba(183,154,112,.16)", color: "#E9DCC4" }) }}>{r.estado === "atendida" ? "Atendida" : "Nueva"}</span>
            </div>
            {r.situaciones.length > 0 && <p style={{ margin: 0, fontSize: 14 }}><span style={{ color: "#A8A096" }}>Situación:</span> {r.situaciones.join(", ")}</p>}
            {r.resumen && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, whiteSpace: "pre-line" }}>{r.resumen}</p>}
            {r.nombre && <p style={{ margin: 0, fontSize: 13, color: "#A8A096" }}>{r.nombre}</p>}
            <form action={cambiarEstadoSolicitud} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              <input type="hidden" name="id" value={r.id} />
              <input type="hidden" name="estado" value={r.estado === "atendida" ? "nueva" : "atendida"} />
              <button className="abtn">{r.estado === "atendida" ? "Reabrir" : "Marcar atendida"}</button>
            </form>
          </article>
        ))}
      </div>
    </>
  );
}
