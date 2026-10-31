import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonChat, BotonSolicitar } from "@/components/botones";
import { Captura } from "@/components/Captura";
import { Motivo } from "@/components/Motivo";
import { PrecioItem, PrecioAlterno } from "@/components/PrecioItem";
import { MotorChat } from "@/lib/chat";
import { velaSugerida, versiones } from "@/lib/catalogo";
import { obtenerSitio } from "@/lib/datos";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { items } = await obtenerSitio();
  return items.filter((i) => i.tipo === "servicio").map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { items } = await obtenerSitio();
  const i = items.find((x) => x.slug === slug);
  if (!i) return {};
  const desc = (i.descripcion || `${i.nombre}, ritual de Circe Witch.`).slice(0, 160);
  return { title: i.nombre, description: desc, alternates: { canonical: `/servicio/${i.slug}` }, openGraph: { title: `${i.nombre} · Circe Witch`, description: desc } };
}

export default async function PaginaServicio({ params }: Props) {
  const { slug } = await params;
  const sitio = await obtenerSitio();
  const item = sitio.items.find((x) => x.slug === slug && x.tipo === "servicio");
  if (!item) notFound();
  const seccion = sitio.secciones.find((s) => s.id === item.seccion);
  const comparar = versiones(item, sitio.items);
  const vela = velaSugerida(item, sitio.items);
  const capturas = sitio.testimonios.filter((t) => t.item_id === item.id);
  const faqs = new MotorChat(sitio.preguntas, sitio.items, sitio.secciones).sugeridas({ item: item.slug, seccion: item.seccion }, "usd", 5);
  const relacionados = sitio.items.filter((x) => x.tipo === "servicio" && x.seccion === item.seccion && x.id !== item.id).slice(0, 6);
  const ctx = { item: item.slug, seccion: item.seccion };
  const titulo = (t: string, cursiva: string) => <h2 className="h2x grad" style={{ fontSize: "clamp(38px, 5vw, 68px)" }}>{t} <span style={{ fontStyle: "italic" }}>{cursiva}</span></h2>;

  return (
    <div className="scr" style={{ display: "flex", flexDirection: "column" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Service", name: item.nombre, description: item.descripcion, provider: { "@type": "Person", name: "Circe" }, ...(item.precio_usd ? { offers: { "@type": "Offer", price: item.precio_usd, priceCurrency: "USD" } } : {}) }) }} />
      <section style={{ position: "relative", isolation: "isolate", overflow: "hidden", paddingTop: "var(--nav-h)" }}>
        <div className="aurora" aria-hidden="true" style={{ zIndex: -1, opacity: 0.8 }} />
        <div className="wrap" style={{ paddingTop: "clamp(28px, 5vw, 64px)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
          <nav aria-label="Ruta" style={{ fontSize: 13, color: "#A8A096", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            <Link href="/catalogo" style={{ color: "#A8A096", textDecoration: "none" }}>Catálogo</Link><span aria-hidden="true">›</span>
            <Link href={`/catalogo?seccion=${item.seccion}`} style={{ color: "#A8A096", textDecoration: "none" }}>{seccion?.nombre}</Link>
          </nav>
          <span className="tag">{item.nivel}</span>
          <h1 className="h2x grad" style={{ fontSize: "clamp(52px, 8vw, 120px)", maxWidth: 1000 }}>{item.nombre}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "6px 14px" }}>
            <PrecioItem item={item} style={{ fontSize: "clamp(22px, 2.4vw, 30px)", fontWeight: 600 }} />
            <PrecioAlterno item={item} style={{ fontSize: 15, color: "#A8A096" }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 6 }}>
            <BotonSolicitar item={item} origen="servicio" className="btn" />
            <BotonChat ctx={ctx}>Preguntas sobre este servicio</BotonChat>
          </div>
          <div className="art fadeup" style={{ width: "min(420px, 74vw)", aspectRatio: "1 / 1", marginTop: 8 }}>
            <svg className="cw-spin" viewBox="0 0 400 400" fill="none" stroke="#B79A70" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.45 }}><circle cx="200" cy="200" r="196" strokeWidth=".6" strokeDasharray="1 7" /><circle cx="200" cy="200" r="170" strokeWidth=".5" /></svg>
            <div className="glow" />
            {item.imagen_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imagen_url} alt={item.nombre} style={{ position: "relative", width: "70%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "50%" }} />
            ) : (
              <Motivo nombre={item.motivo} grosor={1.2} style={{ width: "52%" }} />
            )}
          </div>
        </div>
      </section>

      <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: "clamp(80px, 10vw, 136px)" }}>
        <section aria-label="Descripción" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))", gap: 16 }}>
          <div className="tile still rv" style={{ padding: "clamp(26px, 3vw, 40px)", display: "flex", flexDirection: "column", gap: 14 }}>
            <span className="tag">El ritual</span>
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.7, color: "#DCD3C7", whiteSpace: "pre-line" }}>{item.descripcion || "Escríbele a Circe para conocer los detalles de este trabajo."}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {item.incluye.length > 0 && (
              <div className="tile still rv" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
                <span className="tag">{item.incluye_titulo || "Incluye"}</span>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, fontSize: 15, lineHeight: 1.45 }}>
                  {item.incluye.map((t) => (
                    <li key={t} style={{ display: "flex", gap: 10 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9C9A8" strokeWidth="1.8" aria-hidden="true" style={{ flex: "none", marginTop: 1 }}><path d="M5 12.5l4.5 4.5L19 7" /></svg>{t}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="tile still rv" style={{ padding: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(150px, 100%), 1fr))", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><span className="dsp grad" style={{ fontSize: 40 }}>3 meses</span><span style={{ fontSize: 14, lineHeight: 1.5, color: "#A8A096" }}>de garantía con vela de refuerzo y seguimiento.</span></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}><span className="dsp grad" style={{ fontSize: 40 }}>Discreción</span><span style={{ fontSize: 14, lineHeight: 1.5, color: "#A8A096" }}>Tu identidad y tu caso no se comparten.</span></div>
            </div>
          </div>
        </section>

        <section style={{ display: "flex", flexDirection: "column" }}>
          <div className="shead rv"><span className="tag">Testimonios</span>{titulo("Lo que dicen de", item.nombre)}</div>
          {capturas.length > 0 ? (
            <div className="snap rv" style={{ gridAutoColumns: "min(260px, 68vw)", justifyContent: "safe center" }}>
              {capturas.map((t) => <Captura key={t.id} t={t} servicio={item.nombre} />)}
            </div>
          ) : (
            <div className="tile still rv" style={{ maxWidth: 640, width: "100%", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
              <p style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontStyle: "italic" }}>Aún no hay testimonios de este servicio.</p>
              <a href={`https://wa.me/${sitio.contenido.whatsapp}?text=${encodeURIComponent(`Hola Circe, hice el trabajo «${item.nombre}» y quiero compartir mi experiencia.`)}`} target="_blank" rel="noopener" className="lnk">¿Lo hiciste? Comparte tu experiencia</a>
            </div>
          )}
        </section>

        {comparar.length > 0 && (
          <section style={{ display: "flex", flexDirection: "column" }}>
            <div className="shead rv"><span className="tag">Compara versiones</span>{titulo("¿Cuál es", "para ti?")}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 16, maxWidth: 980, width: "100%", margin: "0 auto" }}>
              {comparar.map((c) => (
                <div key={c.id} className={`tile still rv${c.id === item.id ? " cur" : ""}`} style={{ padding: 28, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
                  <span className="tag">{c.nivel}</span>
                  <div className="art" style={{ width: 120, height: 140 }}><Motivo nombre={c.motivo} grosor={1.4} style={{ width: "100%" }} /></div>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, lineHeight: 1.05 }}>{c.nombre}</span>
                  <PrecioItem item={c} style={{ fontSize: 20, fontWeight: 600 }} />
                  <span className="clamp3" style={{ fontSize: 14, lineHeight: 1.55, color: "#A8A096" }}>{c.descripcion}</span>
                  <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                    <BotonSolicitar item={c} origen="comparar" />
                    {c.id === item.id ? <span style={{ minHeight: 40, display: "inline-flex", alignItems: "center", fontSize: 13, color: "#D9C9A8" }}>Estás viendo este</span> : <Link href={`/servicio/${c.slug}`} className="btng sm">Ver detalle</Link>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {vela && (
          <section aria-label="Potencia tu trabajo" className="tile rv" style={{ padding: "clamp(24px, 3vw, 40px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px 36px", background: "linear-gradient(120deg, #3A1522 0%, #1B1416 65%)" }}>
            <div className="art" style={{ flex: "none", width: 110, height: 130 }}><Motivo nombre={vela.motivo} grosor={1.6} style={{ width: "100%" }} /></div>
            <div style={{ flex: "1 1 300px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              <span className="tag">Potencia tu trabajo</span>
              <Link href={`/servicio/${vela.slug}`} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(28px, 3vw, 38px)", color: "#EDE4D7", textDecoration: "none" }}>{vela.nombre}</Link>
              <span style={{ fontSize: 15, lineHeight: 1.6, color: "#CFC6B9" }}>Acelera el trabajo o revitaliza su energía cuando pierde intensidad. Es requisito para la garantía.</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
              <PrecioItem item={vela} className="price" style={{ fontSize: 18 }} />
              <BotonSolicitar item={vela} origen="vela" className="btnl sm">Solicitar la vela</BotonSolicitar>
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section style={{ display: "flex", flexDirection: "column" }}>
            <div className="shead rv"><span className="tag">Preguntas frecuentes</span>{titulo("Antes de", "pedirlo")}<BotonChat ctx={ctx} className="lnk">Preguntarle algo más a Circe</BotonChat></div>
            <div className="tile still rv" style={{ width: "100%", maxWidth: 860, margin: "0 auto", padding: "8px clamp(20px, 3vw, 40px)", display: "flex", flexDirection: "column" }}>
              {faqs.filter((f) => !f.id.startsWith("p-")).map((f) => (
                <details key={f.id} className="faq"><summary>{f.pregunta} <span aria-hidden="true">+</span></summary><p>{f.respuesta}</p></details>
              ))}
            </div>
          </section>
        )}

        {relacionados.length > 0 && (
          <section style={{ display: "flex", flexDirection: "column" }}>
            <div className="shead rv"><span className="tag">{seccion?.nombre}</span>{titulo("También te puede", "servir")}<Link href={`/catalogo?seccion=${item.seccion}`} className="lnk">Ver toda la sección</Link></div>
            <div className="snap rv" style={{ gridAutoColumns: "minmax(min(250px, 70vw), 1fr)" }}>
              {relacionados.map((r) => (
                <div key={r.id} className="tile" style={{ display: "flex", flexDirection: "column", borderRadius: 24 }}>
                  <Link href={`/servicio/${r.slug}`} className="cover" aria-label={r.nombre} />
                  <div className="art" style={{ aspectRatio: "1 / 1" }}><div className="glow" /><Motivo nombre={r.motivo} grosor={1.4} style={{ width: "54%" }} /></div>
                  <div style={{ padding: "0 18px 18px", display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, lineHeight: 1.05 }}>{r.nombre}</span>
                    <PrecioItem item={r} className="price" style={{ fontSize: 14, color: "#D9C9A8" }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="cw-mob" style={{ position: "sticky", bottom: 0, zIndex: 5, marginTop: 40, padding: "12px 92px calc(12px + env(safe-area-inset-bottom)) 16px", background: "rgba(12,11,10,.75)", WebkitBackdropFilter: "blur(20px)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(237,228,215,.08)" }}>
        <BotonSolicitar item={item} origen="barra_movil" className="btn" style={{ width: "100%" }} />
      </div>
    </div>
  );
}
