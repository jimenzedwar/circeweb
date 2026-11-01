import Link from "next/link";
import { salir } from "../acciones";
import { exigirAdmin } from "@/lib/admin";
import { MenuAdmin } from "@/components/admin/MenuAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Panel", robots: { index: false } };

const MENU = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/solicitudes", label: "Solicitudes" },
  { href: "/admin/catalogo", label: "Catálogo" },
  { href: "/admin/chatbot", label: "Chatbot" },
  { href: "/admin/testimonios", label: "Testimonios" },
  { href: "/admin/contenido", label: "Contenido del sitio" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { usuario } = await exigirAdmin();
  return (
    <div className="adm" style={{ minHeight: "100vh", display: "flex", flexWrap: "wrap", background: "var(--ink)", color: "var(--txt)" }}>
      <aside className="adm-side" style={{ flex: "1 1 240px", color: "#EDE4D7", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 22 }}>
        <div style={{ padding: "0 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24 }}>Circe <span style={{ fontStyle: "italic", color: "#B79A70" }}>Witch</span></span>
            <span style={{ font: "600 10px Manrope, sans-serif", letterSpacing: ".2em", textTransform: "uppercase", color: "#A8A096" }}>Panel</span>
          </div>
          <Link href="/" style={{ height: 36, display: "inline-flex", alignItems: "center", padding: "0 12px", border: "1px solid rgba(183,154,112,.4)", color: "#D9C9A8", textDecoration: "none", font: "600 12px Manrope, sans-serif", borderRadius: 999 }}>Ver sitio</Link>
        </div>
        <MenuAdmin items={MENU} />
        <form action={salir} className="cw-desk" style={{ marginTop: "auto", padding: "12px 10px 0", borderTop: "1px solid rgba(237,228,215,.1)", flexDirection: "column", gap: 6, fontSize: 12, color: "#A8A096" }}>
          <span style={{ color: "#EDE4D7", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{usuario.email}</span>
          <button style={{ alignSelf: "flex-start", background: "none", border: 0, padding: 0, color: "#A8A096", textDecoration: "underline", cursor: "pointer" }}>Cerrar sesión</button>
        </form>
      </aside>
      <main className="adm-main" style={{ flex: "999 1 640px", minWidth: 0, padding: "clamp(20px, 3vw, 32px) clamp(16px, 3vw, 36px) 48px", display: "flex", flexDirection: "column", gap: 22 }}>{children}</main>
    </div>
  );
}
