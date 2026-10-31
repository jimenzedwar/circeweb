"use client";
import type { CSSProperties } from "react";
import { precio, precioAlterno } from "@/lib/precios";
import type { Item } from "@/lib/tipos";
import { useSitio } from "./proveedor";

/** Precio que cambia con el selector USD / COP. */
export function PrecioItem({ item, className, style }: { item: Item; className?: string; style?: CSSProperties }) {
  const { moneda } = useSitio();
  return <span className={className} style={style}>{precio(item, moneda)}</span>;
}

export function PrecioAlterno({ item, className, style }: { item: Item; className?: string; style?: CSSProperties }) {
  const { moneda } = useSitio();
  const t = precioAlterno(item, moneda);
  return t ? <span className={className} style={style}>{t}</span> : null;
}
