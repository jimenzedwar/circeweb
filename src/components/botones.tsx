"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { ContextoChat } from "@/lib/chat";
import type { Item } from "@/lib/tipos";
import { useSitio } from "./proveedor";

export function BotonSolicitar({ item, origen, className = "btn sm", children, style }: { item?: Item; origen: string; className?: string; children?: ReactNode; style?: CSSProperties }) {
  const { pedir, agendaLlena } = useSitio();
  const tipo = item ? item.tipo : "consulta";
  const texto = children ?? (agendaLlena ? "Lista de espera" : tipo === "producto" ? "Lo quiero" : "Solicitar");
  return (
    <button type="button" className={className} style={style} onClick={() => pedir({ tipo, item, origen })} aria-label={item ? `${texto}: ${item.nombre}` : undefined}>
      {texto}
    </button>
  );
}

export function BotonChat({ ctx, className = "btng", children }: { ctx?: ContextoChat; className?: string; children: ReactNode }) {
  const { abrirChat } = useSitio();
  return (
    <button type="button" className={className} onClick={() => abrirChat(ctx)}>
      {children}
    </button>
  );
}

export function EnlaceSeccion({ seccion, origen, className, style, children, ariaLabel }: { seccion: string; origen: string; className?: string; style?: CSSProperties; children?: ReactNode; ariaLabel?: string }) {
  const { registrar } = useSitio();
  return (
    <Link href={`/catalogo?seccion=${seccion}`} className={className} style={style} aria-label={ariaLabel} onClick={() => registrar("clic_seccion", { origen, seccion })}>
      {children}
    </Link>
  );
}

export function EnlaceWhatsapp({ texto, className = "btng", children, origen = "" }: { texto: string; className?: string; children: ReactNode; origen?: string }) {
  const { sitio, registrar } = useSitio();
  const href = `https://wa.me/${sitio.contenido.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}`;
  return (
    <a href={href} target="_blank" rel="noopener" className={className} onClick={() => registrar("whatsapp", { origen })}>
      {children}
    </a>
  );
}
