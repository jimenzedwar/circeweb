import Link from "next/link";
import { BotonChat, BotonSolicitar, EnlaceSeccion, EnlaceWhatsapp } from "@/components/botones";
import { Captura } from "@/components/Captura";
import { Hero } from "@/components/Hero";
import { Motivo, colorMotivo } from "@/components/Motivo";
import { PrecioItem } from "@/components/PrecioItem";
import { obtenerSitio } from "@/lib/datos";

export default async function Inicio() {
  const { secciones, items, testimonios, preguntas, contenido: c } = await obtenerSitio();
  const servicios = items.filter((i) => i.tipo === "servicio");
  const destacados = servicios.filter((i) => i.destacado).slice(0, 8);
  const productos = items.filter((i) => i.tipo === "producto").slice(0, 4);
  const porId = new Map(items.map((i) => [i.id, i]));
  const capturas = testimonios.slice(0, 8);
  const faqs = preguntas.filter((p) => p.aplica_a.includes("general")).slice(0, 7);

  return (
    <div className="scr" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Hero />

      {/* ============ QUIÉN ES CIRCE ============ */}
      <section id="circe" className="sec">
        <div className="wrap" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "48px clamp(40px, 7vw, 120px)" }}>
          <div className="rv" style={{ flex: "1 1 360px", minWidth: 0 }}>
            <div className="tile still" style={{ aspectRatio: "4 / 5", borderRadius: 36 }}>
              <div className="ph" style={{ position: "absolute", inset: 0, backgroundImage: c.circe_foto_url ? `url(${c.circe_foto_url})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
              <div aria-hidden="true" style={{ position: "absolute", inset: "auto 0 0 0", height: "40%", background: "linear-gradient(180deg, transparent, rgba(12,11,10,.85))" }} />
              <span style={{ position: "absolute", left: 24, bottom: 22, fontFamily: "'Cormorant Garamond', serif", fontSize: 34, fontStyle: "italic" }}>— Circe</span>
            </div>
          </div>
          <div className="rv" style={{ flex: "1 1 400px", minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
            <span className="tag">Conóceme</span>
            <h2 className="h2x grad">¿Quién es <span style={{ fontStyle: "italic" }}>Circe</span>?</h2>
            <p className="lead">{c.circe_frase}</p>
            {c.circe_bio && <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75, color: "#A8A096", whiteSpace: "pre-line" }}>{c.circe_bio}</p>}
            <dl style={{ margin: "8px 0 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(140px, 100%), 1fr))", gap: 12 }}>
              {c.circe_anios && <div style={{ display: "flex", flexDirection: "column-reverse", gap: 4 }}><dt style={{ fontSize: 12, color: "#A8A096" }}>de experiencia</dt><dd className="dsp grad" style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>{c.circe_anios} años</dd></div>}
              {c.circe_paises && <div style={{ display: "flex", flexDirection: "column-reverse", gap: 4 }}><dt style={{ fontSize: 12, color: "#A8A096" }}>atiende en</dt><dd className="dsp grad" style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>{c.circe_paises}</dd></div>}
              <div style={{ display: "flex", flexDirection: "column-reverse", gap: 4 }}><dt style={{ fontSize: 12, color: "#A8A096" }}>escribe primero</dt><dd className="dsp grad" style={{ fontSize: "clamp(32px, 4vw, 48px)" }}>Nunca</dd></div>
            </dl>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
              <BotonChat className="btnl">Pregúntale a Circe</BotonChat>
              <EnlaceWhatsapp texto="Hola Circe, quiero información sobre tus servicios." origen="conoceme">Escribirle por WhatsApp</EnlaceWhatsapp>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LO QUE MÁS ME PIDEN ============ */}
      {destacados.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="shead rv">
              <span className="tag">Los más pedidos</span>
              <h2 className="h2x grad">Lo que más <span style={{ fontStyle: "italic" }}>me piden</span>.</h2>
            </div>
            <div className="snap rv" style={{ gridAutoColumns: "minmax(min(290px, 78vw), 1fr)" }}>
              {destacados.map((s) => (
                <div key={s.id} className="tile" style={{ display: "flex", flexDirection: "column", padding: "22px 22px 24px", gap: 6, minHeight: 460 }}>
                  <Link href={`/servicio/${s.slug}`} className="cover" aria-label={`Ver ${s.nombre}`} />
                  <div className="glow" />
                  <span className="tag" style={{ position: "relative" }}>{secciones.find((x) => x.id === s.seccion)?.nombre}</span>
                  <span style={{ position: "relative", fontFamily: "'Cormorant Garamond', serif", fontSize: 34, lineHeight: 1, textWrap: "balance" }}>{s.nombre}</span>
                  <div className="art" style={{ flex: 1, minHeight: 220 }}><Motivo nombre={s.motivo} style={{ width: "62%" }} /></div>
                  <div className="above" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <PrecioItem item={s} className="price" />
                    <BotonSolicitar item={s} origen="destacados" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ CAMINOS ============ */}
      <section id="secciones" className="sec">
        <div className="wrap">
          <div className="shead rv">
            <span className="tag">Catálogo</span>
            <h2 className="h2x grad">Elige tu <span style={{ fontStyle: "italic" }}>camino</span>.</h2>
            <Link href="/catalogo" className="lnk">Ver todo el catálogo</Link>
          </div>
          <div className="bento" style={{ gridAutoFlow: "dense" }}>
            {secciones.map((s, i) => {
              const grande = i === 0 || i === 3;
              const lista = servicios.filter((x) => x.seccion === s.id);
              const usd = lista.map((x) => x.precio_usd).filter((v): v is number => Boolean(v));
              return (
                <div key={s.id} className={`tile rv${grande ? " big" : ""}`} style={{ minHeight: grande ? "clamp(280px, 34vw, 440px)" : 210, background: `radial-gradient(90% 80% at 85% 100%, ${colorMotivo(s.motivo)}30 0%, transparent 60%), linear-gradient(160deg, #1E1518 0%, #120E0F 100%)` }}>
                  <EnlaceSeccion seccion={s.id} origen="inicio" className="cover" ariaLabel={`Ver ${s.nombre}`} />
                  <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", gap: 6, padding: "clamp(18px, 2.2vw, 28px)" }}>
                    <span className="tag" style={{ fontSize: 10 }}>{lista.length} {lista.length === 1 ? "trabajo" : "trabajos"}</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: grande ? "clamp(34px, 4vw, 56px)" : "clamp(22px, 2.2vw, 28px)", lineHeight: 1, maxWidth: "80%" }}>{s.nombre}</span>
                    <span style={{ fontSize: 13, color: "#CFC6B9" }}>{usd.length ? `Desde ${Math.min(...usd)} USD` : "Precio a consultar"}</span>
                    <span className="lnk" style={{ marginTop: "auto", fontSize: 13 }}>Ver servicios</span>
                  </div>
                  <Motivo nombre={s.motivo} grosor={1.2} style={{ position: "absolute", right: grande ? "6%" : "-4%", bottom: grande ? "-2%" : "-10%", width: grande ? "46%" : "52%", pointerEvents: "none", filter: "drop-shadow(0 20px 30px rgba(0,0,0,.6))" }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ CÓMO FUNCIONA ============ */}
      <section id="proceso" className="sec">
        <div className="wrap">
          <div className="shead rv">
            <span className="tag">Cómo funciona</span>
            <h2 className="h2x grad">Cuatro pasos, <span style={{ fontStyle: "italic" }}>sin misterio</span>.</h2>
            <p className="lead">Circe nunca te escribe primero: tú das el primer paso.</p>
          </div>
          <ol className="snap rv" style={{ listStyle: "none", marginTop: 0, marginBottom: 0, gridAutoColumns: "minmax(min(260px, 76vw), 1fr)" }}>
            {[
              ["Elige tu servicio", "Explora el catálogo por sección o pregúntale a Circe en el chat."],
              ["Cuéntale tu caso", "Un resumen breve que llega directo a su WhatsApp."],
              ["Aparta tu cupo", "El trabajo se paga por adelantado. Los rituales de amor llevan lectura previa."],
              ["Ritual y seguimiento", "Le cuentas cómo avanza; con vela de refuerzo tienes garantía de tres meses."],
            ].map(([t, d], i) => (
              <li key={t} className="tile still" style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 14, minHeight: 260 }}>
                <span className="dsp grad" style={{ fontSize: 88 }}>{i + 1}</span>
                <strong style={{ fontSize: 19, fontWeight: 600 }}>{t}</strong>
                <span style={{ fontSize: 15, lineHeight: 1.55, color: "#A8A096" }}>{d}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ REGLAS CLARAS ============ */}
      <section id="garantia" className="sec">
        <div className="wrap">
          <div className="shead rv">
            <span className="tag">Reglas claras</span>
            <h2 className="h2x grad">Sin letra <span style={{ fontStyle: "italic" }}>pequeña</span>.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 16 }}>
            {[
              ["3 meses", "de garantía", "Si hiciste al menos una vela de refuerzo y me mantuviste al tanto del avance y no hay resultados, hago otro ritual por mi cuenta."],
              ["USD · COP", "Pago por adelantado", "Todo trabajo se paga al apartar tu cupo. Ves el precio en tu moneda antes de pedir."],
              ["Sin", "devoluciones", "Cada trabajo requiere materiales, tiempo y energía; una vez hecho el pago se pone en marcha."],
            ].map(([g, t, d]) => (
              <div key={t} className="tile still rv" style={{ padding: "30px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
                <span className="dsp grad" style={{ fontSize: 64 }}>{g}</span>
                <strong style={{ fontSize: 19, fontWeight: 600 }}>{t}</strong>
                <span style={{ fontSize: 15, lineHeight: 1.6, color: "#A8A096" }}>{d}</span>
              </div>
            ))}
          </div>
          <div className="tile still rv" style={{ marginTop: 16, padding: "clamp(24px, 3vw, 36px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px 32px", background: "linear-gradient(120deg, #3A1522 0%, #1B1416 60%)" }}>
            <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: 8 }}>
              <strong style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3vw, 38px)", fontWeight: 400 }}>Verifica que hablas conmigo.</strong>
              <span style={{ fontSize: 15, lineHeight: 1.6, color: "#CFC6B9" }}>Nunca escribo primero y solo atiendo desde un número: <strong style={{ color: "#EDE4D7", whiteSpace: "nowrap" }}>{c.whatsapp_visible}</strong>. Si alguien usa mi nombre para contactarte, repórtalo.</span>
            </div>
            <EnlaceWhatsapp texto="Hola Circe, quiero reportar un perfil falso que usa tu nombre." origen="estafas">Reportar perfil falso</EnlaceWhatsapp>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIOS ============ */}
      <section id="testimonios" className="sec">
        <div className="wrap">
          <div className="shead rv">
            <span className="tag">Testimonios</span>
            <h2 className="h2x grad">Historias que <span style={{ fontStyle: "italic" }}>hablan por mí</span>.</h2>
            <Link href="/testimonios" className="lnk">Ver todos los testimonios</Link>
          </div>
          <div className="snap rv" style={{ gridAutoColumns: "min(270px, 70vw)" }}>
            {capturas.length > 0
              ? capturas.map((t) => <Captura key={t.id} t={t} servicio={(t.item_id && porId.get(t.item_id)?.nombre) || "Circe Witch"} />)
              : destacados.slice(0, 4).map((s) => <Captura key={s.id} servicio={s.nombre} />)}
          </div>
        </div>
      </section>

      {/* ============ PRODUCTOS ============ */}
      {productos.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="shead rv">
              <span className="tag">Tienda esotérica</span>
              <h2 className="h2x grad">Objetos con <span style={{ fontStyle: "italic" }}>intención</span>.</h2>
              <Link href="/catalogo?tipo=productos" className="lnk">Ver todos los productos</Link>
            </div>
            <div className="snap rv" style={{ gridAutoColumns: "minmax(min(250px, 66vw), 1fr)" }}>
              {productos.map((p) => (
                <div key={p.id} className="tile" style={{ display: "flex", flexDirection: "column", gap: 6, padding: "18px 18px 20px" }}>
                  <div className="glow" />
                  <div className="art" style={{ aspectRatio: "1 / 1" }}><Motivo nombre={p.motivo} style={{ width: "58%" }} /></div>
                  <span style={{ position: "relative", fontFamily: "'Cormorant Garamond', serif", fontSize: 26, lineHeight: 1.05 }}>{p.nombre}</span>
                  <div style={{ position: "relative", marginTop: 8, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <PrecioItem item={p} className="price" />
                    <BotonSolicitar item={p} origen="productos" className="btng sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ PREGUNTAS ============ */}
      <section id="faq" className="sec">
        <div className="wrap">
          <div className="shead rv">
            <span className="tag">Preguntas frecuentes</span>
            <h2 className="h2x grad">Resuelvo <span style={{ fontStyle: "italic" }}>tus dudas</span>.</h2>
            <BotonChat className="lnk">Preguntarle algo más a Circe</BotonChat>
          </div>
          <div className="tile still rv" style={{ maxWidth: 860, margin: "0 auto", padding: "8px clamp(20px, 3vw, 40px)", display: "flex", flexDirection: "column" }}>
            {faqs.map((f, i) => (
              <details key={f.id} className="faq" open={i === 0}>
                <summary>{f.pregunta} <span aria-hidden="true">+</span></summary>
                <p>{f.respuesta}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CIERRE ============ */}
      <section id="contacto" className="sec" style={{ position: "relative", isolation: "isolate" }}>
        <div className="wrap">
          <div className="tile still rv" style={{ borderRadius: 40, padding: "clamp(64px, 10vw, 128px) 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, textAlign: "center", background: "radial-gradient(80% 90% at 50% 0%, #7A2E45 0%, #4A1A2A 45%, #24121A 100%)", boxShadow: "0 0 0 1px rgba(217,201,168,.25) inset, 0 50px 120px -40px rgba(122,46,69,.9)" }}>
            <div className="aurora" aria-hidden="true" style={{ mixBlendMode: "screen" }} />
            <div className="stars cw-twinkle" aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.5 }} />
            <span className="tag" style={{ position: "relative", color: "#D9C9A8" }}>Contacto</span>
            <h2 className="h2x grad" style={{ position: "relative" }}>Tu consulta<br /><span style={{ fontStyle: "italic" }}>comienza aquí.</span></h2>
            <p className="lead" style={{ position: "relative", maxWidth: 480, color: "#EDE4D7" }}>Respuesta en el día, siempre desde el WhatsApp oficial de Circe.</p>
            <div style={{ position: "relative", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 8 }}>
              <BotonSolicitar origen="contacto" className="btnl">Solicitar consulta</BotonSolicitar>
              <EnlaceWhatsapp texto="Hola Circe, quiero información sobre tus servicios." origen="contacto">Escribir por WhatsApp</EnlaceWhatsapp>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
