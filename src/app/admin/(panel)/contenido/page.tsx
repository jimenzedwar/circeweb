import { guardarContenido } from "../../acciones";
import { Encabezado } from "@/components/admin/Encabezado";
import { SubirImagen } from "@/components/admin/SubirImagen";
import contenidoBase from "@/data/contenido.json";
import { exigirAdmin } from "@/lib/admin";

const GRUPOS: { titulo: string; campos: [string, string, ("largo" | "corto")?][] }[] = [
  { titulo: "Contacto y redes", campos: [["whatsapp", "WhatsApp (solo números, con código de país)"], ["whatsapp_visible", "WhatsApp como se muestra"], ["correo", "Correo"], ["instagram", "Instagram (enlace)"], ["tiktok", "TikTok (enlace)"], ["facebook", "Facebook (enlace)"]] },
  { titulo: "Inicio", campos: [["hero_saludo", "Saludo"], ["hero_titulo_1", "Titular, línea 1"], ["hero_titulo_2", "Titular, línea 2"], ["hero_titulo_3", "Titular, línea 3 (cursiva)"], ["hero_subtitulo", "Subtítulo", "largo"]] },
  { titulo: "¿Quién es Circe?", campos: [["circe_frase", "Frase"], ["circe_bio", "Biografía", "largo"], ["circe_anios", "Años de experiencia"]] },
  { titulo: "Chat", campos: [["chat_bienvenida", "Mensaje de bienvenida", "largo"], ["chat_sin_respuesta", "Cuando no encuentra respuesta", "largo"]] },
];

export default async function ContenidoAdmin({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const { ok } = await searchParams;
  const { db } = await exigirAdmin();
  const { data } = await db.from("contenido").select("clave, valor");
  const c: Record<string, string> = { ...contenidoBase, ...Object.fromEntries((data ?? []).map((x) => [x.clave, x.valor])) };
  return (
    <form action={guardarContenido} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Encabezado titulo="Contenido del sitio" sub="Textos, contacto, fotos y avisos que se muestran en la web.">
        <button className="abtn aprim" style={{ height: 46, padding: "0 22px" }}>Guardar cambios</button>
      </Encabezado>
      {ok && <div className="ok">Contenido actualizado.</div>}
      <section className="acard" style={{ padding: 20, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px 24px", borderRadius: 16 }}>
        <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 4 }}><h2 className="ah2">Agenda llena</h2><span style={{ fontSize: 13, color: "#A8A096" }}>Muestra un aviso arriba y los botones invitan a la lista de espera.</span></div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, font: "600 14px Manrope, sans-serif" }}><input type="checkbox" name="c_agenda_llena" value="true" defaultChecked={c.agenda_llena === "true"} style={{ width: 20, height: 20 }} />Activar aviso</label>
      </section>
      <section className="acard" style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 16, borderRadius: 16 }}>
        <SubirImagen nombre="c_retrato_url" valor={c.retrato_url} carpeta="sitio" etiqueta="Retrato del inicio (vertical, fondo oscuro)" vertical />
        <SubirImagen nombre="c_circe_foto_url" valor={c.circe_foto_url} carpeta="sitio" etiqueta="Foto de «¿Quién es Circe?»" vertical />
      </section>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))", gap: 16, alignItems: "start" }}>
        {GRUPOS.map((g) => (
          <section key={g.titulo} className="acard" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14, borderRadius: 16 }}>
            <h2 className="ah2">{g.titulo}</h2>
            {g.campos.map(([k, l, tipo]) => (
              <label key={k} className="afl">{l}
                {tipo === "largo"
                  ? <textarea name={`c_${k}`} rows={3} className="ain" defaultValue={c[k] ?? ""} style={{ height: "auto", padding: "10px 12px", lineHeight: 1.5 }} />
                  : <input name={`c_${k}`} className="ain" defaultValue={c[k] ?? ""} />}
              </label>
            ))}
          </section>
        ))}
      </div>
    </form>
  );
}
