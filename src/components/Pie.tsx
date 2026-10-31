import Link from "next/link";
import type { Contenido } from "@/lib/tipos";

export function Pie({ contenido }: { contenido: Contenido }) {
  const redes = [
    { href: contenido.instagram, label: "Instagram", d: <><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /></> },
    { href: contenido.tiktok, label: "TikTok", d: <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.8 2.3 4.5 5 4.8" /> },
    { href: contenido.facebook, label: "Facebook", d: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" /> },
  ].filter((r) => r.href);
  return (
    <footer style={{ marginTop: "clamp(96px, 12vw, 160px)", background: "#080706", borderTop: "1px solid rgba(237,228,215,.08)" }}>
      <div className="wrap" style={{ paddingTop: 48, paddingBottom: 110, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "32px 48px", fontSize: 14 }}>
        <div style={{ flex: "1 1 240px", display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 300 }}>Circe <span style={{ fontStyle: "italic", color: "#B79A70" }}>Witch</span></div>
          <div style={{ display: "flex", gap: 8 }}>
            {redes.map((r) => (
              <a key={r.label} href={r.href} target="_blank" rel="noopener" aria-label={r.label} className="soc">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">{r.d}</svg>
              </a>
            ))}
          </div>
          <span style={{ color: "#A8A096", lineHeight: 1.5 }}>Único WhatsApp oficial: {contenido.whatsapp_visible}. Servicio con fines de orientación personal.</span>
        </div>
        <nav aria-label="Pie de página" style={{ flex: "2 1 320px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px 24px" }}>
          <Link href="/catalogo" className="flink">Servicios</Link>
          <Link href="/catalogo?tipo=productos" className="flink">Productos</Link>
          <Link href="/testimonios" className="flink">Testimonios</Link>
          <Link href="/#faq" className="flink">Preguntas frecuentes</Link>
          <Link href="/#contacto" className="flink">Contacto</Link>
          <Link href="/admin" className="flink">Administración</Link>
        </nav>
      </div>
    </footer>
  );
}
