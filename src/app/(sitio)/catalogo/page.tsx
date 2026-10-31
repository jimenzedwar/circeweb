import type { Metadata } from "next";
import { Catalogo } from "@/components/Catalogo";

export const metadata: Metadata = {
  title: "Catálogo de rituales",
  description: "Rituales de amor, amarres, abundancia, limpiezas, protección, velas y productos de Circe, con precio en dólares o pesos colombianos.",
  alternates: { canonical: "/catalogo" },
};

const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function PaginaCatalogo({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const p = await searchParams;
  return <Catalogo key={`${uno(p.tipo)}|${uno(p.seccion)}|${uno(p.q)}`} inicial={{ q: uno(p.q)?.slice(0, 120), seccion: uno(p.seccion), tipo: uno(p.tipo) }} />;
}
