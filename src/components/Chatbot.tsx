"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { MotorChat } from "@/lib/chat";
import { enlaceWhatsapp, precio } from "@/lib/precios";
import type { AccionPregunta, Emocion, Item, Pregunta } from "@/lib/tipos";
import { CirceAvatar } from "./AvatarCirce";
import { useSitio } from "./proveedor";

interface Mensaje {
  id: number;
  de: "bot" | "yo";
  texto: string;
  opciones?: Pregunta[];
  items?: Item[];
  acciones?: AccionPregunta[];
}

const borde = "rgba(183,154,112,.35)";

export function Chatbot() {
  const { sitio, moneda, chat, abrirChat, cerrarChat, registrar } = useSitio();
  const motor = useMemo(() => new MotorChat(sitio.preguntas, sitio.items, sitio.secciones), [sitio]);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [emocion, setEmocion] = useState<Emocion>("feliz");
  const [pensando, setPensando] = useState(false);
  const [ctx, setCtx] = useState(chat.ctx);
  const id = useRef(0);
  const lista = useRef<HTMLDivElement>(null);
  const entrada = useRef<HTMLInputElement>(null);
  const wa = sitio.contenido.whatsapp;
  const ruta = usePathname();
  const slugRuta = ruta.startsWith("/servicio/") ? decodeURIComponent(ruta.split("/")[2] ?? "") : "";

  // Cada vez que se abre el chat (desde un servicio, el hero, etc.) se saluda con el contexto.
  useEffect(() => {
    if (!chat.abierto) return;
    const item = motor.item(chat.ctx.item);
    const saludo = item ? `¿Tienes dudas sobre «${item.nombre}»? Elige una pregunta o escríbeme la tuya.` : sitio.contenido.chat_bienvenida;
    /* eslint-disable react-hooks/set-state-in-effect -- sincroniza el chat con quien lo abrió */
    setCtx(chat.ctx);
    setEmocion(item ? "sorprendida" : "feliz");
    setMensajes((m) => (m.at(-1)?.texto === saludo ? m : [...m, { id: ++id.current, de: "bot", texto: saludo }]));
    /* eslint-enable react-hooks/set-state-in-effect */
    const t = setTimeout(() => entrada.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [chat.n, chat.abierto, chat.ctx, motor, sitio.contenido.chat_bienvenida]);

  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: "smooth" });
  }, [mensajes, pensando]);

  useEffect(() => {
    if (!chat.abierto) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && cerrarChat();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [chat.abierto, cerrarChat]);

  const item = motor.item(ctx.item);
  const escrito = texto.trim().length >= 2;
  const sugeridas = escrito ? motor.filtrar(texto, ctx, moneda) : motor.sugeridas(ctx, moneda);
  const mensajeWa = (t: string) => `Hola Circe, tengo una pregunta${item ? ` sobre «${item.nombre}»` : ""}: ${t}`;

  const elegir = (p: Pregunta) => {
    setTexto("");
    setEmocion(p.emocion || "hablando");
    setMensajes((m) => [...m, { id: ++id.current, de: "yo", texto: p.pregunta }, { id: ++id.current, de: "bot", texto: p.respuesta, acciones: p.acciones }]);
  };

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    const t = texto.trim();
    if (!t || pensando) return;
    setTexto("");
    setMensajes((m) => [...m, { id: ++id.current, de: "yo", texto: t }]);
    setPensando(true);
    setEmocion("pensando");
    setTimeout(() => {
      const r = motor.responder(t, ctx, moneda);
      const aWa: AccionPregunta = { tipo: "whatsapp", etiqueta: "Enviar mi pregunta por WhatsApp", mensaje: mensajeWa(t) };
      let m: Omit<Mensaje, "id">;
      if (r.tipo === "respuesta") {
        m = { de: "bot", texto: r.pregunta.respuesta, acciones: r.pregunta.acciones, items: r.items };
        setEmocion(r.pregunta.emocion || "hablando");
      } else if (r.tipo === "opciones") {
        m = { de: "bot", texto: "Creo que te refieres a alguna de estas. Si no es ninguna, envíame tu pregunta por WhatsApp.", opciones: r.preguntas, items: r.items, acciones: [aWa] };
        setEmocion("guino");
      } else {
        m = { de: "bot", texto: r.items.length ? `${sitio.contenido.chat_sin_respuesta} Mientras tanto, estos trabajos podrían interesarte:` : sitio.contenido.chat_sin_respuesta, items: r.items, acciones: [aWa] };
        setEmocion("apenada");
        if (!sitio.demo) {
          fetch("/api/pregunta", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ texto: t, contexto: ctx.item ?? ctx.seccion ?? "" }), keepalive: true }).catch(() => {});
        }
      }
      setPensando(false);
      setMensajes((x) => [...x, { ...m, id: ++id.current }]);
    }, 600);
  };

  if (!chat.abierto) {
    return (
      <div style={{ position: "fixed", right: 16, bottom: "calc(16px + env(safe-area-inset-bottom))", zIndex: 30, display: "flex", alignItems: "flex-end", gap: 10 }}>
        <span className="cw-desk cw-rise" style={{ alignItems: "center", padding: "10px 14px", background: "#EDE4D7", color: "#11100F", font: "600 13px Manrope, sans-serif", borderRadius: "14px 14px 2px 14px", boxShadow: "0 10px 30px rgba(0,0,0,.5)" }}>¿Dudas? Pregúntame</span>
        <button type="button" onClick={() => { const i = motor.item(slugRuta); abrirChat(i ? { item: i.slug, seccion: i.seccion } : {}); }} aria-label="Abrir chat con Circe" className="cw-bob" style={{ width: 68, height: 68, padding: 0, borderRadius: "50%", border: "1px solid #B79A70", background: "radial-gradient(circle at 50% 35%, #6E2A3E 0%, #2a141b 70%)", boxShadow: "0 12px 34px rgba(0,0,0,.6), 0 0 0 4px rgba(183,154,112,.15)", cursor: "pointer", overflow: "hidden" }}>
          <CirceAvatar tamano={68} />
        </button>
      </div>
    );
  }

  return (
    <section role="dialog" aria-label="Chat con Circe" className="chatbox cw-rise" style={{ position: "fixed", zIndex: 30, display: "flex", flexDirection: "column", background: "#120E0F", border: "1px solid rgba(183,154,112,.5)", boxShadow: "0 30px 80px -10px rgba(0,0,0,.9)", color: "#EDE4D7" }}>
      <header style={{ flex: "none", display: "flex", alignItems: "center", gap: 12, padding: "12px 12px 12px 14px", background: "radial-gradient(80% 140% at 20% 0%, #6E2A3E 0%, #2a141b 70%)", borderBottom: "1px solid rgba(183,154,112,.4)" }}>
        <div className="cw-bob" style={{ flex: "none", width: 80, height: 80, borderRadius: "50%", border: "1px solid #B79A70", background: "radial-gradient(circle at 50% 40%, #3a1a25 0%, #1a0f13 75%)", overflow: "hidden" }}>
          <CirceAvatar emocion={emocion} tamano={80} />
        </div>
        <strong style={{ flex: 1, fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500 }}>Circe</strong>
        <a href={enlaceWhatsapp(wa, `Hola Circe, quiero hablar contigo${item ? ` sobre «${item.nombre}»` : ""}.`)} target="_blank" rel="noopener" onClick={() => registrar("whatsapp", { origen: "chat" })} aria-label="Hablar con Circe por WhatsApp" style={{ alignSelf: "flex-start", width: 44, height: 44, display: "grid", placeItems: "center", color: "#EDE4D7", border: "1px solid rgba(183,154,112,.5)", borderRadius: "50%" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" /></svg>
        </a>
        <button type="button" onClick={cerrarChat} aria-label="Cerrar chat" style={{ alignSelf: "flex-start", width: 44, height: 44, display: "grid", placeItems: "center", background: "none", border: 0, color: "#EDE4D7", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>

      {item && (
        <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 14px", background: "rgba(88,31,48,.35)", borderBottom: "1px solid rgba(183,154,112,.25)", fontSize: 12 }}>
          <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#CFC6B9" }}>Hablando de: <strong style={{ color: "#D9C9A8" }}>{item.nombre}</strong> · {precio(item, moneda)}</span>
          <button type="button" onClick={() => setCtx({})} style={{ flex: "none", minHeight: 32, padding: "0 8px", background: "none", border: 0, color: "#A8A096", font: "600 11px Manrope, sans-serif", letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer" }}>Quitar</button>
        </div>
      )}

      <div ref={lista} aria-live="polite" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
        {mensajes.map((m) => (
          <div key={m.id} style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: m.de === "yo" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "88%", padding: "11px 14px", fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-line", ...(m.de === "yo" ? { background: "#581F30", borderRadius: "16px 4px 16px 16px" } : { background: "#24201D", border: "1px solid rgba(183,154,112,.25)", borderRadius: "4px 16px 16px 16px" }) }}>{m.texto}</div>
            {m.opciones?.map((o) => (
              <button key={o.id} type="button" onClick={() => elegir(o)} style={{ maxWidth: "92%", minHeight: 40, padding: "8px 12px", background: "transparent", border: `1px solid ${borde}`, borderRadius: 12, color: "#D9C9A8", font: "500 13px/1.35 Manrope, sans-serif", textAlign: "left", cursor: "pointer" }}>{o.pregunta}</button>
            ))}
            {m.items?.map((i) => (
              <Link key={i.id} href={`/servicio/${i.slug}`} onClick={() => window.innerWidth < 600 && cerrarChat()} style={{ width: "92%", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 12px", background: "#15110F", border: `1px solid ${borde}`, borderRadius: 12, color: "#EDE4D7", textDecoration: "none", font: "600 13px Manrope, sans-serif" }}>
                <span>{i.nombre}</span><span style={{ flex: "none", color: "#D9C9A8" }}>{precio(i, moneda)}</span>
              </Link>
            ))}
            {m.acciones && m.acciones.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {m.acciones.map((a, k) =>
                  a.tipo === "whatsapp" ? (
                    <a key={k} href={enlaceWhatsapp(wa, a.mensaje)} target="_blank" rel="noopener" className="cact" onClick={() => registrar("whatsapp", { origen: "chat" })} style={{ background: "#1F6B4A", borderColor: "#2E8A62", color: "#F2FFF8" }}>{a.etiqueta}</a>
                  ) : (
                    <Link key={k} href={a.seccion ? `/catalogo?seccion=${a.seccion}` : "/catalogo"} className="cact">{a.etiqueta}</Link>
                  ),
                )}
              </div>
            )}
          </div>
        ))}
        {pensando && (
          <div aria-label="Circe está escribiendo" style={{ alignSelf: "flex-start", padding: "12px 14px", background: "#24201D", borderRadius: "4px 16px 16px 16px", display: "flex", gap: 5 }}>
            <span className="tdot" /><span className="tdot" style={{ animationDelay: ".15s" }} /><span className="tdot" style={{ animationDelay: ".3s" }} />
          </div>
        )}
      </div>

      <div style={{ flex: "none", borderTop: "1px solid rgba(183,154,112,.2)", padding: "8px 12px 0" }}>
        <p style={{ margin: "0 0 6px", padding: "0 2px", font: "600 10px Manrope, sans-serif", letterSpacing: ".18em", textTransform: "uppercase", color: "#A8A096" }}>
          {escrito ? (sugeridas.length ? "Coincidencias" : "Sin coincidencias: envíala y te ayudo") : item ? `Sobre ${item.nombre}` : "Preguntas frecuentes"}
        </p>
        {sugeridas.length > 0 && (
          <div style={{ maxHeight: 132, overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {sugeridas.map((p) => <button key={p.id} type="button" className="sugg" onClick={() => elegir(p)}>{p.pregunta}</button>)}
          </div>
        )}
      </div>
      <form onSubmit={enviar} style={{ flex: "none", display: "flex", gap: 8, padding: "10px 12px calc(12px + env(safe-area-inset-bottom))" }}>
        <label htmlFor="ci" className="sr">Escribe tu pregunta</label>
        <input ref={entrada} id="ci" value={texto} onChange={(e) => setTexto(e.target.value.slice(0, 200))} autoComplete="off" placeholder="Escribe tu pregunta…" style={{ flex: 1, minWidth: 0, height: 46, padding: "0 16px", background: "#0C0B0A", border: "1px solid rgba(183,154,112,.4)", borderRadius: 999, color: "#EDE4D7", font: "400 16px Manrope, sans-serif" }} />
        <button type="submit" aria-label="Enviar pregunta" disabled={!texto.trim()} style={{ flex: "none", width: 46, height: 46, display: "grid", placeItems: "center", background: "#581F30", border: "1px solid #B79A70", borderRadius: "50%", color: "#EDE4D7", cursor: "pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </form>
    </section>
  );
}
