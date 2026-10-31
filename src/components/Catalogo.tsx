"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { buscarItems, indiceItems } from "@/lib/catalogo";
import { precio } from "@/lib/precios";
import { BotonChat, BotonSolicitar, EnlaceWhatsapp } from "./botones";
import { Motivo } from "./Motivo";
import { useSitio } from "./proveedor";

interface Props {
  inicial: { q?: string; seccion?: string; tipo?: string };
}

const chip = (on: boolean) =>
  on
    ? { background: "#EDE4D7", color: "#11100F", border: "1px solid #EDE4D7" }
    : { background: "rgba(237,228,215,.05)", color: "#EDE4D7", border: "1px solid rgba(237,228,215,.14)" };

function guardarUrl(p: Record<string, string>) {
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(p)) {
    if (v) url.searchParams.set(k, v);
    else url.searchParams.delete(k);
  }
  window.history.replaceState(window.history.state, "", url);
}

export function Catalogo({ inicial }: Props) {
  const { sitio, moneda, registrar } = useSitio();
  const [tipo, setTipo] = useState<"servicio" | "producto">(inicial.tipo === "productos" ? "producto" : "servicio");
  const [q, setQ] = useState(inicial.q ?? "");
  const [cat, setCat] = useState(inicial.seccion ?? "todos");
  const [nivel, setNivel] = useState("todos");
  const consulta = useDeferredValue(q);

  const esServ = tipo === "servicio";
  const base = useMemo(() => sitio.items.filter((i) => i.tipo === tipo), [sitio.items, tipo]);
  const indice = useMemo(() => indiceItems(base, sitio.secciones), [base, sitio.secciones]);
  const grupos = esServ ? sitio.secciones : sitio.categorias;
  const grupoActual = grupos.find((g) => g.id === cat);
  const seccionActual = esServ ? sitio.secciones.find((s) => s.id === cat) : undefined;

  const filtrados = useMemo(() => {
    let lista = esServ && consulta.trim().length >= 2 ? buscarItems(indice, consulta) : base;
    lista = lista.filter((i) => cat === "todos" || i.seccion === cat);
    return lista;
  }, [esServ, consulta, indice, base, cat]);
  const niveles = esServ ? Array.from(new Set(filtrados.map((i) => i.nivel).filter(Boolean))) : [];
  const visibles = nivel === "todos" ? filtrados : filtrados.filter((i) => i.nivel === nivel);

  const elegirTipo = (t: "servicio" | "producto") => {
    setTipo(t); setCat("todos"); setNivel("todos");
    guardarUrl({ tipo: t === "producto" ? "productos" : "", seccion: "", q: t === "producto" ? "" : q });
  };
  const elegirCat = (id: string) => {
    setCat(id); setNivel("todos");
    guardarUrl({ seccion: id === "todos" ? "" : id });
    if (id !== "todos" && esServ) registrar("clic_seccion", { origen: "catalogo", seccion: id });
  };

  const titulo = esServ ? (seccionActual?.nombre ?? "Todos los servicios") : (grupoActual?.nombre ?? "Objetos con intención");
  const sub = esServ
    ? (seccionActual?.descripcion ?? "Rituales sencillos, supremos y personalizados, con precio en dólares o pesos colombianos.")
    : "Pócimas, pulseras, amuletos y cuarzos preparados por Circe.";
  const hayQ = esServ && consulta.trim().length >= 2;
  const segmento = (on: boolean) => ({ height: 40, padding: "0 20px", border: 0, borderRadius: 999, font: "600 13px Manrope, sans-serif", cursor: "pointer", background: on ? "#EDE4D7" : "transparent", color: on ? "#11100F" : "#CFC6B9" });

  return (
    <div className="scr" style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "relative", isolation: "isolate", paddingTop: "var(--nav-h)", overflow: "hidden" }}>
        <div className="aurora" aria-hidden="true" style={{ zIndex: -1, opacity: 0.7 }} />
        <div className="wrap" style={{ paddingTop: "clamp(40px, 7vw, 96px)", paddingBottom: "clamp(24px, 3vw, 40px)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 }}>
          <div role="tablist" aria-label="Tipo" style={{ display: "flex", padding: 4, background: "rgba(237,228,215,.06)", borderRadius: 999 }}>
            <button type="button" role="tab" aria-selected={esServ} onClick={() => elegirTipo("servicio")} style={segmento(esServ)}>Servicios</button>
            <button type="button" role="tab" aria-selected={!esServ} onClick={() => elegirTipo("producto")} style={segmento(!esServ)}>Productos</button>
          </div>
          <h1 className="h2x grad" style={{ fontSize: "clamp(48px, 7vw, 104px)" }}>{titulo}</h1>
          <p className="lead" style={{ maxWidth: 620 }}>{sub}</p>
          {esServ && (
            <form role="search" style={{ position: "relative", width: "min(640px, 100%)", marginTop: 8 }} onSubmit={(e) => { e.preventDefault(); registrar("busqueda", { origen: "catalogo" }); }}>
              <label htmlFor="cq" className="sr">Buscar en el catálogo</label>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D9C9A8" strokeWidth="1.6" aria-hidden="true" style={{ position: "absolute", left: 22, top: "50%", marginTop: -10 }}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
              <input id="cq" className="srch" type="search" value={q} autoComplete="off" placeholder="¿Qué necesitas? Ej.: que regrese, dinero, mal de ojo…"
                onChange={(e) => { const v = e.target.value.slice(0, 120); setQ(v); guardarUrl({ q: v.trim() }); }} />
            </form>
          )}
        </div>
      </header>

      <div className="wrap" style={{ flex: 1, paddingBottom: 40, display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ position: "sticky", top: "var(--nav-h)", zIndex: 5, marginInline: "calc(-1 * clamp(20px, 5vw, 64px))", padding: "10px clamp(20px, 5vw, 64px)", background: "rgba(12,11,10,.72)", WebkitBackdropFilter: "blur(20px)", backdropFilter: "blur(20px)", display: "flex", alignItems: "center", gap: 12 }}>
          <div className="chips" style={{ flex: 1, minWidth: 0, display: "flex", gap: 8, overflowX: "auto" }}>
            {[{ id: "todos", nombre: "Todos" }, ...grupos].map((g) => (
              <button key={g.id} type="button" className="chip" aria-pressed={cat === g.id} onClick={() => elegirCat(g.id)} style={chip(cat === g.id)}>{g.nombre}</button>
            ))}
          </div>
          {niveles.length > 1 && (
            <>
              <label htmlFor="cn" className="sr">Nivel</label>
              <select id="cn" value={nivel} onChange={(e) => setNivel(e.target.value)} style={{ flex: "none", height: 44, padding: "0 14px", background: "rgba(237,228,215,.06)", border: "1px solid rgba(237,228,215,.14)", borderRadius: 999, color: "#EDE4D7", font: "600 13px Manrope, sans-serif" }}>
                <option value="todos">Todos los niveles</option>
                {niveles.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </>
          )}
        </div>
        <span style={{ fontSize: 13, color: "#A8A096" }} aria-live="polite">
          {visibles.length} {visibles.length === 1 ? "resultado" : "resultados"}{hayQ ? ` para «${consulta.trim()}»` : ""} · Precios en {moneda === "cop" ? "pesos colombianos" : "dólares"}
        </span>

        {visibles.length === 0 ? (
          <div className="tile still" style={{ padding: "56px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
            <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontStyle: "italic" }}>No encontré trabajos con esas palabras.</p>
            <p style={{ margin: 0, fontSize: 15, color: "#A8A096" }}>Cuéntame tu caso y te digo qué ritual te conviene.</p>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
              <BotonChat ctx={seccionActual ? { seccion: seccionActual.id } : {}} className="btng sm">Preguntarle a Circe</BotonChat>
              <EnlaceWhatsapp texto={`Hola Circe, busco algo para: ${q}`} className="btn sm" origen="catalogo">Escribir por WhatsApp</EnlaceWhatsapp>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(250px, calc(50% - 6px)), 1fr))", gap: "clamp(10px, 1.6vw, 18px)" }}>
            {visibles.map((s) => (
              <div key={s.id} className="tile" style={{ display: "flex", flexDirection: "column", borderRadius: 24 }}>
                {esServ && <Link href={`/servicio/${s.slug}`} className="cover" aria-label={s.nombre} />}
                <div className="art" style={{ aspectRatio: "1 / 1" }}>
                  <div className="glow" />
                  {s.imagen_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imagen_url} alt="" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <Motivo nombre={s.motivo} grosor={1.4} style={{ width: "54%" }} />
                  )}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, padding: "0 clamp(14px, 1.6vw, 20px) clamp(14px, 1.6vw, 20px)" }}>
                  <span className="tag" style={{ fontSize: 10 }}>{s.nivel}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(20px, 1.9vw, 26px)", lineHeight: 1.05 }}>{s.nombre}</span>
                  <span className="clampd" style={{ fontSize: 13, lineHeight: 1.5, color: "#A8A096" }}>{s.descripcion}</span>
                  <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span className="price" style={{ fontSize: 14, color: "#D9C9A8" }}>{precio(s, moneda)}</span>
                    <BotonSolicitar item={s} origen="catalogo" className="btn sm above" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
