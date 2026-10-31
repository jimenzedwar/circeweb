import type { CSSProperties } from "react";
import motivos from "@/data/motivos.json";

const MOTIVOS = motivos as Record<string, { trazo: string; relleno: string; color: string }>;

/** Ilustración lineal de la colección (viewBox 100 × 125). */
export function Motivo({ nombre, grosor = 1.3, style }: { nombre: string; grosor?: number; style?: CSSProperties }) {
  const m = MOTIVOS[nombre] ?? MOTIVOS.luna;
  return (
    <svg viewBox="0 0 100 125" aria-hidden="true" style={{ height: "auto", overflow: "visible", ...style }}>
      <path d={m.relleno} fill={m.color} opacity=".9" />
      <path d={m.trazo} fill="none" stroke="#D9C9A8" strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export const colorMotivo = (nombre: string) => (MOTIVOS[nombre] ?? MOTIVOS.luna).color;
