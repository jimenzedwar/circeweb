/* eslint-disable @next/next/no-img-element */
import type { Testimonio } from "@/lib/tipos";

/** Captura de WhatsApp en marco de teléfono. Sin imagen, muestra un espacio de ejemplo. */
export function Captura({ t, servicio }: { t?: Testimonio; servicio: string }) {
  return (
    <figure className="shot" style={{ margin: 0 }}>
      {t?.imagen_url ? (
        <img src={t.imagen_url} alt={`Captura de WhatsApp de una clienta sobre ${servicio}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      ) : (
        <>
          <div className="bar"><span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,.16)" }} /><span>[Nombre oculto]</span></div>
          <div aria-hidden="true" style={{ padding: "14px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div className="bub in"><div className="ph2" style={{ width: 150 }} /><div className="ph2" style={{ width: 104, marginTop: 6 }} /></div>
            <div className="bub out"><div className="ph2" style={{ width: 116 }} /></div>
            <div className="bub in"><div className="ph2" style={{ width: 160 }} /><div className="ph2" style={{ width: 138, marginTop: 6 }} /><div className="ph2" style={{ width: 84, marginTop: 6 }} /></div>
            <div className="bub out"><div className="ph2" style={{ width: 72 }} /></div>
          </div>
        </>
      )}
      <figcaption style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "48px 16px 16px", background: "linear-gradient(180deg, transparent, rgba(7,6,6,.94))", display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="tag" style={{ fontSize: 10 }}>{servicio}</span>
        <span style={{ fontSize: 12, color: "#A8A096" }}>Captura de WhatsApp{t ? ` · ${[t.pais, t.fecha_texto].filter(Boolean).join(" · ")}` : " · [País · fecha]"}</span>
      </figcaption>
    </figure>
  );
}
