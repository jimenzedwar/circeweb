"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BotonSolicitar, EnlaceWhatsapp } from "./botones";
import { useSitio } from "./proveedor";

const ENLACES = [
  { href: "/#circe", label: "Conóceme" },
  { href: "/catalogo", label: "Servicios" },
  { href: "/catalogo?tipo=productos", label: "Productos" },
  { href: "/testimonios", label: "Testimonios" },
  { href: "/#faq", label: "Preguntas" },
];

export function Nav() {
  const { moneda, setMoneda, agendaLlena } = useSitio();
  const ruta = usePathname();
  const [menu, setMenu] = useState(false);


  const boton = (m: "usd" | "cop") => ({
    height: 30, minWidth: 46, padding: "0 10px", border: 0, borderRadius: 999, font: "700 11px Manrope, sans-serif", letterSpacing: ".08em", cursor: "pointer",
    transition: "background .3s, color .3s",
    background: moneda === m ? "#EDE4D7" : "transparent", color: moneda === m ? "#11100F" : "#CFC6B9",
  });

  return (
    <>
      <header className="navg" style={{ top: 0 }}>
        {agendaLlena && (
          <div role="status" style={{ minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px", background: "#B79A70", color: "#11100F", font: "600 12px/1.3 Manrope, sans-serif", textAlign: "center" }}>
            Agenda llena esta semana · Anótate y Circe te escribe cuando se libere un cupo
          </div>
        )}
        <nav className="wrap" aria-label="Principal" style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 500, color: "#EDE4D7", textDecoration: "none", whiteSpace: "nowrap" }}>
            Circe <span style={{ fontStyle: "italic", color: "#B79A70" }}>Witch</span>
          </Link>
          <div className="cw-desk" style={{ gap: "clamp(22px, 2.6vw, 40px)", alignItems: "center", fontSize: 15, fontWeight: 500 }}>
            {ENLACES.map((e) => (
              <Link key={e.href} href={e.href} className="navlink" aria-current={ruta === e.href ? "page" : undefined}>{e.label}</Link>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div role="group" aria-label="Moneda" style={{ display: "flex", padding: 3, background: "rgba(237,228,215,.06)", borderRadius: 999 }}>
              <button type="button" aria-pressed={moneda === "usd"} onClick={() => setMoneda("usd")} style={boton("usd")}>USD</button>
              <button type="button" aria-pressed={moneda === "cop"} onClick={() => setMoneda("cop")} style={boton("cop")}>COP</button>
            </div>
            <span className="cw-desk"><BotonSolicitar origen="menu" className="btn sm" /></span>
            <button type="button" className="cw-mob" aria-label="Abrir menú" aria-expanded={menu} onClick={() => setMenu(true)} style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: 0, color: "#EDE4D7", cursor: "pointer" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M4 9h16M4 15h16" /></svg>
            </button>
          </div>
        </nav>
      </header>

      {menu && (
        <div className="cw-mob scr" role="dialog" aria-modal="true" aria-label="Menú" style={{ position: "fixed", inset: 0, zIndex: 25, background: "rgba(12,11,10,.86)", WebkitBackdropFilter: "blur(28px)", backdropFilter: "blur(28px)", display: "flex", flexDirection: "column", padding: "10px 20px calc(28px + env(safe-area-inset-bottom))", overflowY: "auto" }}>
          <div style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26 }}>Circe <span style={{ fontStyle: "italic", color: "#B79A70" }}>Witch</span></span>
            <button type="button" aria-label="Cerrar menú" onClick={() => setMenu(false)} style={{ width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: 0, color: "#EDE4D7", cursor: "pointer" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <nav aria-label="Menú" style={{ marginTop: 24, display: "flex", flexDirection: "column" }}>
            <Link href="/" className="mlink" onClick={() => setMenu(false)}>Inicio</Link>
            {ENLACES.map((e) => (
              <Link key={e.href} href={e.href} className="mlink" onClick={() => setMenu(false)}>{e.label}</Link>
            ))}
          </nav>
          <div style={{ marginTop: "auto", paddingTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
            <BotonSolicitar origen="menu" className="btn">{agendaLlena ? "Anotarme en la lista de espera" : "Solicitar consulta"}</BotonSolicitar>
            <EnlaceWhatsapp texto="Hola Circe, quiero información sobre tus servicios." origen="menu">Escribir por WhatsApp</EnlaceWhatsapp>
          </div>
        </div>
      )}
    </>
  );
}
