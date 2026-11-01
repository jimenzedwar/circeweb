import Link from "next/link";
import { borrarPreguntaServicio, guardarItem, guardarPreguntaServicio } from "../../acciones";
import { Encabezado } from "@/components/admin/Encabezado";
import { SubirImagen } from "@/components/admin/SubirImagen";
import motivos from "@/data/motivos.json";
import { exigirAdmin } from "@/lib/admin";

export default async function CatalogoAdmin({ searchParams }: { searchParams: Promise<{ id?: string; nuevo?: string; q?: string; ok?: string }> }) {
  const p = await searchParams;
  const { db } = await exigirAdmin();
  const [{ data: items }, { data: secciones }, { data: categorias }, { count: capturas }] = await Promise.all([
    db.from("items").select("id, nombre, tipo, seccion, nivel, precio_usd, precio_texto, visible, destacado").order("tipo").order("orden"),
    db.from("secciones").select("id, nombre").order("orden"),
    db.from("categorias_productos").select("id, nombre").order("orden"),
    p.id ? db.from("testimonios").select("id", { count: "exact", head: true }).eq("item_id", p.id) : Promise.resolve({ count: 0 }),
  ]);
  const q = (p.q ?? "").toLowerCase();
  const lista = (items ?? []).filter((i) => !q || i.nombre.toLowerCase().includes(q));
  const { data: actual } = p.id ? await db.from("items").select("*").eq("id", p.id).maybeSingle() : { data: null };
  const { data: preguntasServicio } = actual?.tipo === "servicio" ? await db.from("preguntas").select("id, pregunta, respuesta, visible").contains("aplica_a", [`servicio:${actual.slug}`]).order("orden") : { data: null };
  const editando = actual ?? (p.nuevo ? { id: "", nombre: "", tipo: p.nuevo === "producto" ? "producto" : "servicio", seccion: "", nivel: "", motivo: "luna", precio_usd: null, precio_cop: null, precio_texto: "", descripcion: "", incluye_titulo: "", incluye: [], palabras_clave: [], imagen_url: "", destacado: false, visible: true, orden: 999 } : null);
  const grupos = editando?.tipo === "producto" ? categorias ?? [] : secciones ?? [];
  const nombreGrupo = new Map([...(secciones ?? []), ...(categorias ?? [])].map((s) => [s.id, s.nombre]));

  return (
    <>
      <Encabezado titulo="Catálogo" sub="Servicios y productos. Lo que guardas aquí se ve en la web en pocos segundos.">
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/admin/catalogo?nuevo=servicio" className="abtn aprim">+ Servicio</Link>
          <Link href="/admin/catalogo?nuevo=producto" className="abtn">+ Producto</Link>
        </div>
      </Encabezado>
      {p.ok && <div className="ok">{p.ok === "preguntas" ? "Preguntas guardadas." : "Cambios guardados."}</div>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
        <section className="acard" aria-label="Lista" style={{ flex: "1 1 320px", minWidth: 0, borderRadius: 16, overflow: "hidden" }}>
          <form style={{ padding: "12px 14px" }}>
            <label htmlFor="bq" className="sr">Buscar</label>
            <input id="bq" name="q" defaultValue={p.q} className="ain" placeholder="Buscar servicio o producto…" />
          </form>
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {lista.map((i) => (
              <Link key={i.id} href={`/admin/catalogo?id=${i.id}${p.q ? `&q=${encodeURIComponent(p.q)}` : ""}`} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", padding: "12px 14px", borderTop: "1px solid rgba(237,228,215,.08)", textDecoration: "none", color: "#EDE4D7", background: i.id === p.id ? "rgba(183,154,112,.1)" : "transparent", boxShadow: i.id === p.id ? "inset 3px 0 0 #B79A70" : "none", opacity: i.visible ? 1 : 0.5 }}>
                <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  <strong style={{ fontWeight: 600 }}>{i.destacado ? "★ " : ""}{i.nombre}</strong>
                  <span style={{ fontSize: 12, color: "#A8A096" }}>{i.tipo === "producto" ? "Producto · " : ""}{nombreGrupo.get(i.seccion) ?? i.seccion}{i.nivel ? ` · ${i.nivel}` : ""}{i.visible ? "" : " · oculto"}</span>
                </span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{i.precio_texto || (i.precio_usd ? `${i.precio_usd} USD` : "—")}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="acard" aria-label="Editor" style={{ flex: "2 1 440px", minWidth: 0, padding: 20, display: "flex", flexDirection: "column", gap: 14, borderRadius: 16 }}>
          {!editando ? (
            <p style={{ margin: 0, color: "#A8A096" }}>Elige un servicio o producto de la lista para editarlo.</p>
          ) : (
            <form key={editando.id || "nuevo"} action={guardarItem} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 14 }}>
              <h2 className="ah2" style={{ gridColumn: "1 / -1" }}>{editando.id ? "Editar" : "Nuevo"} {editando.tipo === "producto" ? "producto" : "servicio"}</h2>
              <input type="hidden" name="id" value={editando.id} />
              <input type="hidden" name="tipo" value={editando.tipo} />
              <label className="afl" style={{ gridColumn: "1 / -1" }}>Nombre<input name="nombre" required className="ain" defaultValue={editando.nombre} /></label>
              <label className="afl">{editando.tipo === "producto" ? "Categoría" : "Sección"}
                <select name="seccion" required className="ain" defaultValue={editando.seccion}>
                  <option value="">Elegir…</option>
                  {grupos.map((g) => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
              </label>
              <label className="afl">Nivel<input name="nivel" className="ain" defaultValue={editando.nivel} placeholder="Sencillo, Supremo, VIP…" list="niveles" /></label>
              <datalist id="niveles">{["Sencillo", "Supremo", "VIP", "Amarre", "Lectura"].map((n) => <option key={n} value={n} />)}</datalist>
              <label className="afl">Precio USD<input name="precio_usd" inputMode="numeric" className="ain" defaultValue={editando.precio_usd ?? ""} /></label>
              <label className="afl">Precio COP<input name="precio_cop" inputMode="numeric" className="ain" defaultValue={editando.precio_cop ?? ""} placeholder="Ej. 180000" /></label>
              <label className="afl" style={{ gridColumn: "1 / -1" }}>Texto de precio (opcional)<input name="precio_texto" className="ain" defaultValue={editando.precio_texto ?? ""} placeholder="Reemplaza los precios, ej. «Desde 300 USD»" /></label>
              <label className="afl" style={{ gridColumn: "1 / -1" }}>Descripción<textarea name="descripcion" rows={6} className="ain" defaultValue={editando.descripcion} style={{ height: "auto", padding: "10px 12px", lineHeight: 1.5 }} /></label>
              <label className="afl">Título de la lista<input name="incluye_titulo" className="ain" defaultValue={editando.incluye_titulo ?? ""} placeholder="Incluye" /></label>
              <label className="afl">Ilustración (si no hay foto)
                <select name="motivo" className="ain" defaultValue={editando.motivo}>{Object.keys(motivos).map((m) => <option key={m} value={m}>{m}</option>)}</select>
              </label>
              <label className="afl" style={{ gridColumn: "1 / -1" }}>Incluye (uno por línea)<textarea name="incluye" rows={4} className="ain" defaultValue={editando.incluye.join("\n")} style={{ height: "auto", padding: "10px 12px", lineHeight: 1.5 }} /></label>
              <label className="afl" style={{ gridColumn: "1 / -1" }}>Palabras clave para la búsqueda<input name="palabras_clave" className="ain" defaultValue={editando.palabras_clave.join(", ")} placeholder="Separadas por coma: ex, que regrese, volver" /></label>
              <div style={{ gridColumn: "1 / -1" }}><SubirImagen nombre="imagen_url" valor={editando.imagen_url ?? ""} carpeta="items" etiqueta="Foto (opcional)" /></div>
              <label className="afl">Orden<input name="orden" inputMode="numeric" className="ain" defaultValue={editando.orden} /></label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "flex-end", fontSize: 14 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="checkbox" name="visible" defaultChecked={editando.visible} style={{ width: 18, height: 18 }} />Visible en la web</label>
                <label style={{ display: "flex", alignItems: "center", gap: 10 }}><input type="checkbox" name="destacado" defaultChecked={editando.destacado} style={{ width: 18, height: 18 }} />En «Lo que más me piden»</label>
              </div>
              {editando.id && editando.tipo === "servicio" && (
                <div style={{ gridColumn: "1 / -1", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "12px 14px", border: "1px solid rgba(237,228,215,.12)", background: "rgba(12,11,10,.45)", borderRadius: 10, fontSize: 13, color: "#A8A096" }}>
                  <span>{capturas ?? 0} capturas de WhatsApp ancladas a este servicio</span>
                  <Link href={`/admin/testimonios?item=${editando.id}`} className="abtn">Subir captura</Link>
                </div>
              )}
              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid rgba(237,228,215,.08)" }}>
                <button className="abtn aprim">Guardar cambios</button>
              </div>
            </form>
          )}
          {actual?.tipo === "servicio" && (
            <section id="preguntas" aria-label="Preguntas de este servicio" style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10, paddingTop: 20, borderTop: "1px solid rgba(237,228,215,.08)", scrollMarginTop: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <h2 className="ah2">Preguntas de este servicio</h2>
                <span style={{ fontSize: 12, color: "#A8A096" }}>Salen en la página del servicio y el chat las usa cuando alguien pregunta por él.</span>
              </div>
              {preguntasServicio?.map((q) => (
                <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14, border: "1px solid rgba(237,228,215,.1)", borderRadius: 14, background: "rgba(12,11,10,.35)", opacity: q.visible ? 1 : 0.6 }}>
                  <form action={guardarPreguntaServicio} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input type="hidden" name="id" value={q.id} />
                    <input type="hidden" name="item_id" value={actual.id} />
                    <input type="hidden" name="slug" value={actual.slug} />
                    <label className="afl">Pregunta<input name="pregunta" required minLength={3} className="ain" defaultValue={q.pregunta} /></label>
                    <label className="afl">Respuesta<textarea name="respuesta" rows={3} className="ain" defaultValue={q.respuesta} /></label>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}><input type="checkbox" name="visible" defaultChecked={q.visible} style={{ width: 16, height: 16 }} />Visible</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="abtn" formAction={borrarPreguntaServicio} formNoValidate style={{ minHeight: 34, fontSize: 12 }}>Borrar</button>
                        <button className="abtn aprim" style={{ minHeight: 34, fontSize: 12 }}>Guardar</button>
                      </div>
                    </div>
                  </form>
                </div>
              ))}
              {!preguntasServicio?.length && <p style={{ margin: 0, fontSize: 13, color: "#8F877D" }}>Este servicio todavía no tiene preguntas propias.</p>}
              <details className="acard" style={{ padding: 14, borderRadius: 14, background: "transparent", borderStyle: "dashed" }}>
                <summary style={{ cursor: "pointer", font: "600 13px Manrope, sans-serif", color: "#D9C9A8" }}>+ Agregar pregunta</summary>
                <form action={guardarPreguntaServicio} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                  <input type="hidden" name="id" value="" />
                  <input type="hidden" name="item_id" value={actual.id} />
                  <input type="hidden" name="slug" value={actual.slug} />
                  <label className="afl">Pregunta<input name="pregunta" required minLength={3} className="ain" placeholder="Ej. ¿Cuánto tarda en hacer efecto?" /></label>
                  <label className="afl">Respuesta<textarea name="respuesta" rows={3} className="ain" /></label>
                  <input type="hidden" name="visible" value="on" />
                  <button className="abtn aprim" style={{ alignSelf: "flex-end" }}>Agregar</button>
                </form>
              </details>
            </section>
          )}
        </section>
      </div>
    </>
  );
}
