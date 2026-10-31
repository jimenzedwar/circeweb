"use client";
/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { clienteNavegador } from "@/lib/supabase/navegador";

/** Sube una imagen al bucket "media" y guarda su URL pública en un campo oculto del formulario. */
export function SubirImagen({ nombre, valor = "", carpeta, etiqueta, vertical = false }: { nombre: string; valor?: string; carpeta: string; etiqueta: string; vertical?: boolean }) {
  const [url, setUrl] = useState(valor);
  const [estado, setEstado] = useState("");

  const subir = async (archivo: File) => {
    if (!archivo.type.startsWith("image/")) return setEstado("Elige una imagen (JPG, PNG o WebP).");
    if (archivo.size > 6 * 1024 * 1024) return setEstado("La imagen pesa más de 6 MB.");
    setEstado("Subiendo…");
    const ext = archivo.name.split(".").pop()?.toLowerCase() || "jpg";
    const ruta = `${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const db = clienteNavegador();
    const { error } = await db.storage.from("media").upload(ruta, archivo, { cacheControl: "31536000", contentType: archivo.type });
    if (error) return setEstado("No se pudo subir: " + error.message);
    setUrl(db.storage.from("media").getPublicUrl(ruta).data.publicUrl);
    setEstado("");
  };

  return (
    <div className="afl">
      {etiqueta}
      <input type="hidden" name={nombre} value={url} />
      <label style={{ position: "relative", minHeight: vertical ? 300 : 120, display: "grid", placeItems: "center", gap: 8, padding: 14, border: "1.5px dashed #CFC3B2", borderRadius: 16, background: "#FFFFFF", textAlign: "center", fontWeight: 400, fontSize: 13, color: "#5E574F", cursor: "pointer", overflow: "hidden" }}>
        {url ? <img src={url} alt="" style={{ maxHeight: vertical ? 300 : 160, borderRadius: 10, objectFit: "contain" }} /> : <span><strong style={{ color: "#11100F" }}>Subir imagen</strong><br />Arrastra o haz clic</span>}
        <input type="file" accept="image/*" className="sr" onChange={(e) => e.target.files?.[0] && subir(e.target.files[0])} />
      </label>
      {estado && <span style={{ fontWeight: 400, color: "#8A2B3B" }}>{estado}</span>}
      {url && <button type="button" className="abtn" style={{ alignSelf: "flex-start", minHeight: 32 }} onClick={() => setUrl("")}>Quitar imagen</button>}
    </div>
  );
}
