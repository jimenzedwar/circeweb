/* eslint-disable @next/next/no-img-element */
import { cambiarTestimonio, crearTestimonio } from "../../acciones";
import { Encabezado } from "@/components/admin/Encabezado";
import { SubirImagen } from "@/components/admin/SubirImagen";
import { exigirAdmin } from "@/lib/admin";

export default async function TestimoniosAdmin({ searchParams }: { searchParams: Promise<{ item?: string; ok?: string }> }) {
  const p = await searchParams;
  const { db } = await exigirAdmin();
  const [{ data: lista }, { data: items }] = await Promise.all([
    db.from("testimonios").select("id, imagen_url, pais, fecha_texto, visible, item_id").order("creado", { ascending: false }),
    db.from("items").select("id, nombre").eq("tipo", "servicio").order("orden"),
  ]);
  const nombre = new Map((items ?? []).map((i) => [i.id, i.nombre]));
  return (
    <>
      <Encabezado titulo="Testimonios" sub="Sube capturas de WhatsApp y ánclalas al servicio del que hablan: aparecen en su página y en la de testimonios." />
      {p.ok && <div className="ok">Testimonio publicado.</div>}
      <form action={crearTestimonio} className="acard" style={{ padding: 20, display: "flex", flexWrap: "wrap", gap: 20, borderRadius: 16 }}>
        <div style={{ flex: "0 1 240px" }}><SubirImagen nombre="imagen_url" carpeta="testimonios" etiqueta="Captura de WhatsApp" vertical /></div>
        <div style={{ flex: "1 1 300px", minWidth: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", gap: 14, alignContent: "start" }}>
          <label className="afl" style={{ gridColumn: "1 / -1" }}>Servicio del que habla
            <select name="item_id" className="ain" defaultValue={p.item ?? ""}>
              <option value="">General (sin servicio)</option>
              {items?.map((i) => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </select>
          </label>
          <label className="afl">País<input name="pais" className="ain" placeholder="Ej. Colombia" /></label>
          <label className="afl">Fecha<input name="fecha_texto" className="ain" placeholder="Ej. octubre 2026" /></label>
          <label style={{ gridColumn: "1 / -1", display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}><input type="checkbox" name="permiso" required style={{ width: 18, height: 18, flex: "none" }} />Tengo permiso de la persona para publicarla</label>
          <label style={{ gridColumn: "1 / -1", display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14 }}><input type="checkbox" name="oculto" required style={{ width: 18, height: 18, flex: "none" }} />Ya oculté su nombre, número y foto de perfil</label>
          <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}><button className="abtn" style={{ background: "#581F30", borderColor: "#581F30", color: "#FBF8F3" }}>Publicar testimonio</button></div>
        </div>
      </form>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(180px, calc(50% - 6px)), 1fr))", gap: 12 }}>
        {lista?.map((t) => (
          <article key={t.id} className="acard" style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8, borderRadius: 16, opacity: t.visible ? 1 : 0.55 }}>
            <img src={t.imagen_url} alt="" style={{ aspectRatio: "9 / 14", width: "100%", objectFit: "cover", objectPosition: "top", borderRadius: 12 }} />
            <strong style={{ fontSize: 13 }}>{(t.item_id && nombre.get(t.item_id)) || "General"}</strong>
            <span style={{ fontSize: 12, color: "#5E574F" }}>{[t.pais, t.fecha_texto].filter(Boolean).join(" · ") || "—"}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <form action={cambiarTestimonio} style={{ flex: 1 }}><input type="hidden" name="id" value={t.id} /><input type="hidden" name="visible" value={String(!t.visible)} /><button className="abtn" style={{ width: "100%", minHeight: 34, fontSize: 12 }}>{t.visible ? "Ocultar" : "Mostrar"}</button></form>
              <form action={cambiarTestimonio} style={{ flex: 1 }}><input type="hidden" name="id" value={t.id} /><input type="hidden" name="accion" value="borrar" /><button className="abtn" style={{ width: "100%", minHeight: 34, fontSize: 12 }}>Borrar</button></form>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
