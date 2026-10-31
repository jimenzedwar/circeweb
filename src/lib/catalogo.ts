import reglas from "@/data/reglas.json";
import { buscar, crearIndice, type ItemIndexado } from "./busqueda";
import type { Item, Seccion } from "./tipos";

export function indiceItems(items: Item[], secciones: Seccion[]): ItemIndexado<Item>[] {
  const porId = new Map(secciones.map((s) => [s.id, s]));
  return crearIndice(items, (i) => {
    const s = porId.get(i.seccion);
    return [
      { texto: i.nombre, peso: 3 },
      { texto: i.palabras_clave.join(" "), peso: 2.5 },
      { texto: s ? `${s.nombre} ${s.sinonimos.join(" ")}` : "", peso: 1.4 },
      { texto: i.nivel, peso: 1.2 },
      { texto: i.descripcion, peso: 1 },
      { texto: i.incluye.join(" "), peso: 1 },
    ];
  });
}

export const buscarItems = (indice: ItemIndexado<Item>[], q: string, minimo?: number) => buscar(indice, q, minimo).map((r) => r.item);

/** Versiones del mismo trabajo para compararlas (ej. Retorno y Retorno completo). */
export function versiones(item: Item, items: Item[]): Item[] {
  const par = (reglas.pares as string[][]).find((p) => p.includes(item.nombre));
  if (!par) return [];
  const lista = par.map((n) => items.find((i) => i.nombre === n)).filter((i): i is Item => Boolean(i));
  return lista.length > 1 ? lista : [];
}

/** Vela que potencia cada tipo de trabajo, como lo recomiendan los catálogos. */
export function velaSugerida(item: Item, items: Item[]): Item | null {
  const nombre = (reglas.velaPara as Record<string, string>)[item.seccion];
  if (!nombre || nombre === item.nombre) return null;
  return items.find((i) => i.nombre === nombre) ?? null;
}

export const situacionesPara = (seccion: string | undefined): string[] =>
  [...((reglas.situaciones as Record<string, string[]>)[seccion ?? ""] ?? []), ...reglas.situaciones.general];

export const PAISES: string[] = reglas.paises;
