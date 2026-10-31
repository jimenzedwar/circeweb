"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { buscarItems, indiceItems } from "@/lib/catalogo";
import { precio } from "@/lib/precios";
import { BotonChat, BotonSolicitar, EnlaceWhatsapp } from "./botones";
import { Intro } from "./Intro";
import { Motivo } from "./Motivo";
import { useSitio } from "./proveedor";

const INTENCIONES = ["amor", "amarres", "abundancia", "limpieza", "proteccion", "amorpropio"];
let yaAnimado = false;

export function Hero() {
  const { sitio, moneda, registrar } = useSitio();
  const router = useRouter();
  const c = sitio.contenido;
  const [q, setQ] = useState("");
  const [intencion, setIntencion] = useState("amor");
  const [primera] = useState(() => !yaAnimado);
  useEffect(() => {
    yaAnimado = true;
  }, []);

  const servicios = useMemo(() => sitio.items.filter((i) => i.tipo === "servicio"), [sitio.items]);
  const indice = useMemo(() => indiceItems(servicios, sitio.secciones), [servicios, sitio.secciones]);
  const chips = sitio.secciones.filter((s) => INTENCIONES.includes(s.id));
  const sec = sitio.secciones.find((s) => s.id === intencion) ?? sitio.secciones[0];
  const escrito = q.trim().length >= 2;
  const hallados = escrito ? buscarItems(indice, q) : [];
  const lista = (escrito ? hallados : servicios.filter((i) => i.seccion === sec?.id)).slice(0, 3);

  const verMas = () => {
    if (escrito) registrar("busqueda", { origen: "inicio" });
    router.push(escrito ? `/catalogo?q=${encodeURIComponent(q.trim())}` : `/catalogo?seccion=${sec?.id ?? ""}`);
  };

  return (
    <section className={`hero ${primera ? "first" : ""}`} style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", paddingTop: "var(--nav-h)", isolation: "isolate" }}>
      {primera && <Intro />}
      <div className="aurora" aria-hidden="true" style={{ zIndex: -2 }} />
      <div className="stars cw-twinkle" aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.6, zIndex: -2 }} />
      <div className="stage" aria-hidden="true" style={{ zIndex: -1 }}>
        <svg className="cw-spin" viewBox="0 0 400 480" fill="none" stroke="#B79A70" style={{ position: "absolute", left: "-12%", top: "-8%", width: "124%", height: "116%", opacity: 0.6 }}>
          <ellipse cx="200" cy="240" rx="196" ry="236" strokeWidth=".6" strokeDasharray="1 7" />
          <ellipse cx="200" cy="240" rx="180" ry="220" strokeWidth=".5" />
        </svg>
        <div className="ph" style={{ position: "absolute", inset: 0, borderRadius: "999px 999px 0 0", backgroundImage: c.retrato_url ? `url(${c.retrato_url})` : undefined, backgroundSize: "cover", backgroundPosition: "center top" }} />
      </div>

      <div className="wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 22, paddingTop: "clamp(40px, 8vh, 96px)", paddingBottom: 28 }}>
        <span className="fadeup d1 tag" style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "#D9C9A8" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#B79A70", boxShadow: "0 0 12px #D9C9A8" }} />
          {c.hero_saludo}
        </span>
        <h1 className="dsp" style={{ fontSize: "clamp(56px, 10vw, 148px)" }}>
          <span className="hl"><span className="grad">{c.hero_titulo_1}</span></span>
          <span className="hl"><span className="grad">{c.hero_titulo_2}</span></span>
          <span className="hl"><span className="grad" style={{ fontStyle: "italic", fontWeight: 400 }}>{c.hero_titulo_3}</span></span>
        </h1>
        <p className="lead fadeup d1" style={{ maxWidth: 560 }}>{c.hero_subtitulo}</p>

        <form role="search" className="fadeup d2" style={{ position: "relative", width: "min(640px, 100%)", marginTop: 8 }} onSubmit={(e) => { e.preventDefault(); verMas(); }}>
          <label htmlFor="hq" className="sr">Cuéntame qué está pasando</label>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D9C9A8" strokeWidth="1.6" aria-hidden="true" style={{ position: "absolute", left: 22, top: "50%", marginTop: -10 }}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input id="hq" className="srch" value={q} onChange={(e) => setQ(e.target.value.slice(0, 120))} autoComplete="off" placeholder="Ej. «quiero que regrese», «mi negocio no vende»" />
        </form>
        <div className="chips fadeup d3" role="radiogroup" aria-label="O elige lo que buscas" style={{ width: "100%", display: "flex", justifyContent: "safe center", gap: 8, overflowX: "auto", padding: "2px 4px 6px" }}>
          {chips.map((s) => {
            const activo = !escrito && intencion === s.id;
            return (
              <button key={s.id} type="button" role="radio" aria-checked={activo} className="chip" onClick={() => { setQ(""); setIntencion(s.id); registrar("clic_seccion", { origen: "chips", seccion: s.id }); }}
                style={activo ? { background: "#EDE4D7", color: "#11100F", border: "1px solid #EDE4D7" } : { background: "rgba(237,228,215,.05)", color: "#EDE4D7", border: "1px solid rgba(237,228,215,.14)" }}>
                <Motivo nombre={s.motivo} grosor={5} style={{ width: 16 }} />
                <span>{s.corto}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="wrap fadeup d3" style={{ paddingBottom: "clamp(40px, 7vh, 80px)", display: "flex", flexDirection: "column", gap: 14 }}>
        {lista.length > 0 ? (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "6px 20px" }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(22px, 2.2vw, 28px)", fontStyle: "italic" }}>
                {escrito ? "Lo que mejor encaja con lo que me cuentas" : `Para ti, que buscas ${sec?.palabra ?? ""}`}
              </span>
              <button type="button" onClick={verMas} className="lnk" style={{ fontSize: 14 }}>
                {escrito ? `Ver los ${hallados.length} resultados en el catálogo` : `Ver todo ${sec?.nombre.toLowerCase() ?? ""}`}
              </button>
            </div>
            <div className="snap" style={{ gridAutoColumns: "minmax(min(330px, 84vw), 1fr)", paddingBottom: 8 }}>
              {lista.map((s) => (
                <div key={s.id} className="tile" style={{ borderRadius: 24, display: "flex", alignItems: "center", gap: 16, padding: "14px 14px 14px 16px", background: "rgba(27,20,22,.72)", WebkitBackdropFilter: "blur(18px)", backdropFilter: "blur(18px)" }}>
                  <Link href={`/servicio/${s.slug}`} className="cover" aria-label={`Ver ${s.nombre}`} />
                  <span className="art" style={{ flex: "none", width: 68, height: 68, borderRadius: "50%", background: "radial-gradient(circle at 50% 40%, #4A1F2C 0%, #1A1214 75%)" }}>
                    <Motivo nombre={s.motivo} grosor={2.4} style={{ width: 46 }} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3, textAlign: "left" }}>
                    <span className="tag" style={{ fontSize: 10 }}>{sitio.secciones.find((x) => x.id === s.seccion)?.nombre}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, lineHeight: 1.05 }}>{s.nombre}</span>
                    <span className="price" style={{ fontSize: 14, color: "#D9C9A8" }}>{precio(s, moneda)}</span>
                  </span>
                  <BotonSolicitar item={s} origen={escrito ? "buscador" : "chips"} className="btn sm above" />
                </div>
              ))}
            </div>
          </>
        ) : escrito ? (
          <div className="tile still" style={{ borderRadius: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "14px 24px", padding: "20px 24px", background: "rgba(27,20,22,.72)" }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 23, fontStyle: "italic", textAlign: "left" }}>No encontré un trabajo con esas palabras, pero puedo ayudarte igual.</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <BotonChat className="btng sm">Preguntarle a Circe</BotonChat>
              <EnlaceWhatsapp texto={`Hola Circe, te cuento mi caso: ${q}`} className="btn sm" origen="buscador">Contarle mi caso</EnlaceWhatsapp>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
