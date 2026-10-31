"use client";

import { useEffect, useState } from "react";
import { PAISES, situacionesPara } from "@/lib/catalogo";
import { enlaceWhatsapp, precio } from "@/lib/precios";
import { useSitio } from "./proveedor";

/** Formulario guiado en 3 pasos: situación → datos → revisar y enviar por WhatsApp. */
export function Solicitud() {
  const { sitio, solicitud, cerrarSolicitud, agendaLlena } = useSitio();
  const [paso, setPaso] = useState(1);
  const [sits, setSits] = useState<string[]>([]);
  const [resumen, setResumen] = useState("");
  const [nombre, setNombre] = useState("");
  const [pais, setPais] = useState("");

  useEffect(() => {
    if (!solicitud) return;
    /* eslint-disable react-hooks/set-state-in-effect -- reinicia el formulario al abrirlo */
    setPaso(1);
    setSits([]);
    setResumen("");
    /* eslint-enable react-hooks/set-state-in-effect */
    const k = (e: KeyboardEvent) => e.key === "Escape" && cerrarSolicitud();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [solicitud, cerrarSolicitud]);

  if (!solicitud) return null;
  const { item, tipo, origen } = solicitud;
  const esProd = tipo === "producto";
  const moneda = pais === "Colombia" ? "cop" : "usd";
  const p = item ? precio(item, moneda) : "";
  const lista = esProd ? [] : situacionesPara(item?.seccion);
  const listo1 = sits.length > 0 || resumen.trim().length >= 10;

  const encabezado = esProd
    ? `Hola Circe, me interesa el producto: ${item?.nombre} (${p})`
    : item
      ? `Hola Circe, quiero ${agendaLlena ? "anotarme en la lista de espera para" : "solicitar"}: ${item.nombre} (${p})`
      : "Hola Circe, quiero una consulta.";
  const mensaje = [
    encabezado,
    sits.length ? `Mi situación: ${sits.join(", ")}` : "",
    resumen.trim() ? `${esProd ? "Detalle" : "Mi caso"}: ${resumen.trim()}` : "",
    nombre.trim() ? `Mi nombre: ${nombre.trim()}` : "",
    pais ? `País: ${pais}` : "",
  ].filter(Boolean).join("\n");

  const guardar = () => {
    if (!sitio.demo) {
      fetch("/api/solicitud", {
        method: "POST",
        headers: { "content-type": "application/json" },
        keepalive: true,
        body: JSON.stringify({ item_id: item?.id, item_nombre: item?.nombre ?? "Consulta general", tipo, situaciones: sits, resumen: resumen.trim(), nombre: nombre.trim(), pais, origen }),
      }).catch(() => {});
    }
    cerrarSolicitud();
  };

  const barra = (n: number) => ({ flex: 1, height: 3, borderRadius: 2, background: paso >= n ? "#B79A70" : "rgba(183,154,112,.25)" });
  const chip = (on: boolean) => ({ minHeight: 40, padding: "0 14px", borderRadius: 999, font: "600 13px Manrope, sans-serif", cursor: "pointer", ...(on ? { background: "#EDE4D7", color: "#11100F", border: "1px solid #EDE4D7" } : { background: "transparent", color: "#EDE4D7", border: "1px solid rgba(237,228,215,.2)" }) });
  const campo = { padding: "14px 16px", background: "#0C0B0A", border: "1px solid rgba(183,154,112,.4)", borderRadius: 14, color: "#EDE4D7", font: "400 16px Manrope, sans-serif", width: "100%" } as const;

  return (
    <div className="mwrap" style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex", justifyContent: "center" }}>
      <button type="button" aria-label="Cerrar" onClick={cerrarSolicitud} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", background: "rgba(5,5,4,.6)", WebkitBackdropFilter: "blur(6px)", backdropFilter: "blur(6px)", border: 0, cursor: "pointer" }} />
      <div role="dialog" aria-modal="true" aria-labelledby="st" className="cw-rise mbox" style={{ position: "relative", width: "min(520px, 100%)", overflowY: "auto", padding: "24px 22px calc(20px + env(safe-area-inset-bottom))", background: "rgba(24,18,20,.94)", WebkitBackdropFilter: "blur(30px)", backdropFilter: "blur(30px)", border: "1px solid rgba(237,228,215,.1)", boxShadow: "0 40px 100px -20px rgba(0,0,0,.95)", display: "flex", flexDirection: "column", gap: 18 }}>
        <button type="button" aria-label="Cerrar formulario" onClick={cerrarSolicitud} style={{ position: "absolute", top: 10, right: 10, width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: 0, color: "#CFC6B9", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingRight: 40 }}>
          <span className="eyebrow">{esProd ? "Pedir producto" : agendaLlena ? "Lista de espera" : "Solicitar servicio"} · Paso {paso} de 3</span>
          <h2 id="st" style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 6vw, 34px)", lineHeight: 1, fontWeight: 400 }}>{item?.nombre ?? "Cuéntame tu caso"}</h2>
          {p && <span style={{ fontSize: 14, fontWeight: 700, color: "#D9C9A8" }}>{p}</span>}
          <div aria-hidden="true" style={{ display: "flex", gap: 6, marginTop: 6 }}><span style={barra(1)} /><span style={barra(2)} /><span style={barra(3)} /></div>
        </div>

        {paso === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {lista.length > 0 && (
              <fieldset style={{ margin: 0, padding: 0, border: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                <legend className="lbl" style={{ marginBottom: 10 }}>¿Qué está pasando? <span style={{ color: "#A8A096", fontWeight: 400 }}>(elige las que apliquen)</span></legend>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {lista.map((t) => {
                    const on = sits.includes(t);
                    return <button key={t} type="button" aria-pressed={on} style={chip(on)} onClick={() => setSits(on ? sits.filter((x) => x !== t) : [...sits, t])}>{t}</button>;
                  })}
                </div>
              </fieldset>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label htmlFor="sr" className="lbl">{esProd ? "¿Para quién es o qué intención buscas?" : "Cuéntame en pocas palabras"}</label>
              <textarea id="sr" rows={4} maxLength={400} value={resumen} onChange={(e) => setResumen(e.target.value)} placeholder="Lo esencial basta: qué está pasando y qué te gustaría lograr." style={{ ...campo, resize: "vertical", lineHeight: 1.5 }} />
              <span className="hlp" style={{ alignSelf: "flex-end" }}>{resumen.length} / 400</span>
            </div>
            <button type="button" className="btn" disabled={!listo1} onClick={() => setPaso(2)} style={!listo1 ? { opacity: 0.45, cursor: "not-allowed" } : undefined}>
              {listo1 ? "Continuar" : "Elige una opción o escribe unas palabras"}
            </button>
          </div>
        )}

        {paso === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label htmlFor="sn" className="lbl">Tu nombre <span style={{ color: "#A8A096", fontWeight: 400 }}>(opcional)</span></label>
              <input id="sn" className="fld" value={nombre} maxLength={60} onChange={(e) => setNombre(e.target.value)} autoComplete="given-name" placeholder="Cómo quieres que te llame" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label htmlFor="sp" className="lbl">¿Desde qué país me escribes?</label>
              <select id="sp" className="fld" value={pais} onChange={(e) => setPais(e.target.value)}>
                <option value="">Elige tu país</option>
                {PAISES.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
              <span className="hlp">Así te muestro el precio en la moneda correcta.</span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btng" onClick={() => setPaso(1)}>Atrás</button>
              <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setPaso(3)}>Revisar mensaje</button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span className="lbl">Así le llegará a Circe</span>
            <div style={{ padding: "14px 16px", background: "#0C0B0A", border: "1px solid rgba(183,154,112,.3)", borderRadius: "4px 18px 18px 18px", fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-line", color: "#CFC6B9" }}>{mensaje}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="btng" onClick={() => setPaso(2)}>Editar</button>
              <a href={enlaceWhatsapp(sitio.contenido.whatsapp, mensaje)} target="_blank" rel="noopener" onClick={guardar} className="btn" style={{ flex: 1, background: "linear-gradient(180deg, #23805A 0%, #1F6B4A 100%)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" /></svg>
                Enviar por WhatsApp
              </a>
            </div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, color: "#A8A096" }}>Guardamos una copia de tu solicitud (servicio, situación y país) para darte seguimiento. No la compartimos con nadie.</p>
          </div>
        )}
      </div>
    </div>
  );
}
