import Link from "next/link";
import { borrarPregunta, descartarSinRespuesta, guardarPregunta } from "../../acciones";
import { Encabezado } from "@/components/admin/Encabezado";
import { exigirAdmin } from "@/lib/admin";

const EMOCIONES = [["hablando", "Te explica"], ["feliz", "Contenta"], ["mistica", "En calma"], ["sorprendida", "¡Atención!"], ["guino", "Guiño"], ["apenada", "Apenada"], ["pensando", "Pensando"]];

export default async function ChatbotAdmin({ searchParams }: { searchParams: Promise<{ id?: string; desde?: string; texto?: string; ok?: string }> }) {
  const p = await searchParams;
  const { db } = await exigirAdmin();
  const [{ data: preguntas }, { data: pendientes }, { data: secciones }, { data: items }] = await Promise.all([
    db.from("preguntas").select("id, pregunta, respuesta, aplica_a, visible").order("orden"),
    db.from("preguntas_sin_respuesta").select("id, texto, creado").eq("resuelta", false).order("creado", { ascending: false }).limit(30),
    db.from("secciones").select("id, nombre").order("orden"),
    db.from("items").select("slug, nombre").eq("tipo", "servicio").order("orden"),
  ]);
  const { data: actual } = p.id ? await db.from("preguntas").select("*").eq("id", p.id).maybeSingle() : { data: null };
  const editando = actual ?? (p.desde !== undefined ? { id: "", pregunta: p.texto ?? "", respuesta: "", palabras_clave: [], aplica_a: ["general"], emocion: "hablando", visible: true } : null);
  const donde = (a: string) => a === "general" ? "General" : a.startsWith("seccion:") ? `Sección · ${secciones?.find((s) => `seccion:${s.id}` === a)?.nombre ?? a}` : `Servicio · ${items?.find((s) => `servicio:${s.slug}` === a)?.nombre ?? a}`;

  return (
    <>
      <Encabezado titulo="Chatbot de Circe" sub="Las respuestas del chat. Las que tienen respuesta vacía no se muestran.">
        <Link href="/admin/chatbot?desde=" className="abtn aprim">+ Nueva respuesta</Link>
      </Encabezado>
      {p.ok && <div className="ok">Respuesta guardada.</div>}
      <section className="acard" aria-label="Preguntas sin respuesta" style={{ borderRadius: 16, overflow: "hidden", borderColor: "rgba(183,154,112,.45)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "14px 20px" }}><h2 className="ah2">Preguntas sin respuesta</h2><span style={{ fontSize: 12, color: "#A8A096" }}>Lo que la gente escribió y el chat no supo responder</span></div>
        {!pendientes?.length && <p style={{ margin: 0, padding: "0 20px 16px", fontSize: 13, color: "#8F877D" }}>Nada pendiente por ahora.</p>}
        {pendientes?.map((u) => (
          <div key={u.id} style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "8px 16px", padding: "12px 20px", borderTop: "1px solid rgba(237,228,215,.08)" }}>
            <span style={{ fontSize: 14, flex: "1 1 240px" }}>«{u.texto}» <span style={{ color: "#8F877D", fontSize: 12 }}>· {new Date(u.creado).toLocaleDateString("es-CO")}</span></span>
            <div style={{ display: "flex", gap: 8 }}>
              <Link href={`/admin/chatbot?desde=${u.id}&texto=${encodeURIComponent(u.texto)}`} className="abtn">Crear respuesta</Link>
              <form action={descartarSinRespuesta}><input type="hidden" name="id" value={u.id} /><button className="abtn">Descartar</button></form>
            </div>
          </div>
        ))}
      </section>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        <section className="acard" aria-label="Respuestas" style={{ flex: "1 1 320px", minWidth: 0, borderRadius: 16, overflow: "hidden", maxHeight: "75vh", overflowY: "auto" }}>
          {preguntas?.map((x) => (
            <Link key={x.id} href={`/admin/chatbot?id=${x.id}`} style={{ display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", borderTop: "1px solid rgba(237,228,215,.08)", textDecoration: "none", color: "#EDE4D7", background: x.id === p.id ? "rgba(183,154,112,.1)" : "transparent", boxShadow: x.id === p.id ? "inset 3px 0 0 #B79A70" : "none", opacity: x.visible && x.respuesta ? 1 : 0.55 }}>
              <strong style={{ fontWeight: 600 }}>{x.pregunta}</strong>
              <span style={{ fontSize: 12, color: "#A8A096" }}>{donde(x.aplica_a[0] ?? "general")}{x.respuesta ? "" : " · falta la respuesta"}</span>
            </Link>
          ))}
        </section>
        <section className="acard" aria-label="Editor" style={{ flex: "2 1 420px", minWidth: 0, padding: 20, borderRadius: 16 }}>
          {!editando ? (
            <p style={{ margin: 0, color: "#A8A096" }}>Elige una respuesta para editarla o crea una nueva.</p>
          ) : (
            <form key={editando.id || "nueva"} action={guardarPregunta} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 14 }}>
              <h2 className="ah2" style={{ gridColumn: "1 / -1" }}>{editando.id ? "Editar respuesta" : "Nueva respuesta"}</h2>
              <input type="hidden" name="id" value={editando.id} />
              <input type="hidden" name="sin_respuesta_id" value={p.desde ?? ""} />
              <label className="afl" style={{ gridColumn: "1 / -1" }}>Pregunta<input name="pregunta" required className="ain" defaultValue={editando.pregunta} /></label>
              <label className="afl" style={{ gridColumn: "1 / -1" }}>Respuesta de Circe<textarea name="respuesta" rows={5} className="ain" defaultValue={editando.respuesta} style={{ height: "auto", padding: "10px 12px", lineHeight: 1.5 }} /></label>
              <label className="afl" style={{ gridColumn: "1 / -1" }}>Palabras clave<input name="palabras_clave" className="ain" defaultValue={editando.palabras_clave.join(", ")} placeholder="Separadas por coma: garantia, si no funciona" /></label>
              <label className="afl">Aparece en
                <select name="aplica_a" className="ain" defaultValue={editando.aplica_a[0] ?? "general"}>
                  <option value="general">General (todas las páginas)</option>
                  <optgroup label="Sección">{secciones?.map((s) => <option key={s.id} value={`seccion:${s.id}`}>{s.nombre}</option>)}</optgroup>
                  <optgroup label="Servicio">{items?.map((s) => <option key={s.slug} value={`servicio:${s.slug}`}>{s.nombre}</option>)}</optgroup>
                </select>
              </label>
              <label className="afl">Cara de Circe
                <select name="emocion" className="ain" defaultValue={editando.emocion}>{EMOCIONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}><input type="checkbox" name="visible" defaultChecked={editando.visible} style={{ width: 18, height: 18 }} />Visible en el chat</label>
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 12, borderTop: "1px solid rgba(237,228,215,.08)" }}>
                <button className="abtn aprim">Guardar respuesta</button>
              </div>
            </form>
          )}
          {editando?.id && (
            <form action={borrarPregunta} style={{ marginTop: 10 }}><input type="hidden" name="id" value={editando.id} /><button className="abtn">Borrar respuesta</button></form>
          )}
        </section>
      </div>
    </>
  );
}
