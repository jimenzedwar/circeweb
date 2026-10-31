"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ContextoChat } from "@/lib/chat";
import type { Item, Moneda, Sitio } from "@/lib/tipos";

export type TipoEvento = "visita" | "clic_solicitar" | "clic_seccion" | "busqueda" | "chat_abierto" | "whatsapp";

interface PedidoSolicitud {
  tipo: "servicio" | "producto" | "consulta";
  item?: Item;
  origen: string;
}

interface Valor {
  sitio: Sitio;
  moneda: Moneda;
  setMoneda: (m: Moneda) => void;
  solicitud: PedidoSolicitud | null;
  pedir: (p: PedidoSolicitud) => void;
  cerrarSolicitud: () => void;
  chat: { abierto: boolean; ctx: ContextoChat; n: number };
  abrirChat: (ctx?: ContextoChat) => void;
  cerrarChat: () => void;
  registrar: (tipo: TipoEvento, datos?: { origen?: string; seccion?: string; item_id?: string }) => void;
  agendaLlena: boolean;
}

const Contexto = createContext<Valor | null>(null);

export function useSitio() {
  const v = useContext(Contexto);
  if (!v) throw new Error("useSitio fuera de <Proveedor>");
  return v;
}

export function Proveedor({ sitio, children }: { sitio: Sitio; children: ReactNode }) {
  const [moneda, setMonedaEstado] = useState<Moneda>("usd");
  const [solicitud, setSolicitud] = useState<PedidoSolicitud | null>(null);
  const [chat, setChat] = useState<{ abierto: boolean; ctx: ContextoChat; n: number }>({ abierto: false, ctx: {}, n: 0 });

  useEffect(() => {
    try {
      const m = localStorage.getItem("moneda");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- la preferencia vive en el navegador
      if (m === "cop" || m === "usd") setMonedaEstado(m);
    } catch {}
  }, []);

  const setMoneda = useCallback((m: Moneda) => {
    setMonedaEstado(m);
    try {
      localStorage.setItem("moneda", m);
    } catch {}
  }, []);

  const registrar = useCallback<Valor["registrar"]>((tipo, datos) => {
    if (sitio.demo) return;
    const item_id = datos?.item_id && /^[0-9a-f-]{36}$/.test(datos.item_id) ? datos.item_id : undefined;
    fetch("/api/evento", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tipo, origen: datos?.origen ?? "", seccion: datos?.seccion, item_id }),
      keepalive: true,
    }).catch(() => {});
  }, [sitio.demo]);

  const valor = useMemo<Valor>(() => ({
    sitio,
    moneda,
    setMoneda,
    solicitud,
    pedir: (p) => {
      setSolicitud(p);
      registrar("clic_solicitar", { origen: p.origen, seccion: p.item?.seccion, item_id: p.item?.id });
    },
    cerrarSolicitud: () => setSolicitud(null),
    chat,
    abrirChat: (ctx = {}) => {
      setChat((c) => ({ abierto: true, ctx, n: c.n + 1 }));
      registrar("chat_abierto", { seccion: ctx.seccion });
    },
    cerrarChat: () => setChat((c) => ({ ...c, abierto: false })),
    registrar,
    agendaLlena: sitio.contenido.agenda_llena === "true",
  }), [sitio, moneda, setMoneda, solicitud, chat, registrar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
