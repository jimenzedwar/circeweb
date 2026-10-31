import type { Metadata } from "next";
import { Captura } from "@/components/Captura";
import { EnlaceWhatsapp } from "@/components/botones";
import { obtenerSitio } from "@/lib/datos";

export const metadata: Metadata = { title: "Testimonios", description: "Capturas reales de WhatsApp de clientas de Circe, publicadas con permiso." };

export default async function PaginaTestimonios() {
  const { testimonios, items } = await obtenerSitio();
  const porId = new Map(items.map((i) => [i.id, i]));
  return (
    <div className="scr" style={{ display: "flex", flexDirection: "column" }}>
      <header style={{ position: "relative", isolation: "isolate", overflow: "hidden", paddingTop: "var(--nav-h)" }}>
        <div className="aurora" aria-hidden="true" style={{ zIndex: -1, opacity: 0.7 }} />
        <div className="wrap" style={{ paddingTop: "clamp(40px, 7vw, 96px)", paddingBottom: "clamp(24px, 3vw, 40px)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 18 }}>
          <span className="tag">Testimonios</span>
          <h1 className="h2x grad" style={{ fontSize: "clamp(48px, 7vw, 104px)" }}>Historias que <span style={{ fontStyle: "italic" }}>hablan por mí</span>.</h1>
          <p className="lead" style={{ maxWidth: 600 }}>Capturas reales de WhatsApp, publicadas con permiso y con nombres y fotos ocultos.</p>
          <EnlaceWhatsapp texto="Hola Circe, quiero compartir mi experiencia contigo. Te doy permiso para publicarla en tu web." className="btn" origen="testimonios">Comparte tu experiencia</EnlaceWhatsapp>
        </div>
      </header>
      <div className="wrap" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(230px, calc(50% - 8px)), 1fr))", gap: 16 }}>
        {testimonios.length > 0 ? (
          testimonios.map((t) => <Captura key={t.id} t={t} servicio={(t.item_id && porId.get(t.item_id)?.nombre) || "Circe Witch"} />)
        ) : (
          <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "#A8A096" }}>Pronto verás aquí las experiencias de quienes confiaron en Circe.</p>
        )}
      </div>
    </div>
  );
}
