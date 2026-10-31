import type { CSSProperties } from "react";
import { Chatbot } from "@/components/Chatbot";
import { Nav } from "@/components/Nav";
import { Pie } from "@/components/Pie";
import { Proveedor } from "@/components/proveedor";
import { Solicitud } from "@/components/Solicitud";
import { Visita } from "@/components/Visita";
import { obtenerSitio } from "@/lib/datos";

export const revalidate = 300;

export default async function SitioLayout({ children }: { children: React.ReactNode }) {
  const sitio = await obtenerSitio();
  const agenda = sitio.contenido.agenda_llena === "true";
  return (
    <Proveedor sitio={sitio}>
      <div id="top" style={{ "--nav-h": agenda ? "112px" : "72px", position: "relative", minHeight: "100vh", overflowX: "clip" } as CSSProperties}>
        <Nav />
        <main>{children}</main>
        <Pie contenido={sitio.contenido} />
        <Chatbot />
        <Solicitud />
        <Visita />
      </div>
    </Proveedor>
  );
}
