/**
 * Chatbot de Circe sin IA: preguntas guardadas en la base de datos y búsqueda
 * por palabras. Si nada coincide, se ofrece WhatsApp con la pregunta.
 */
import { buscar, crearIndice, type ItemIndexado } from "./busqueda";
import { indiceItems } from "./catalogo";
import { precio, precioAlterno } from "./precios";
import type { Item, Moneda, Pregunta, Seccion } from "./tipos";

export interface ContextoChat {
  item?: string; // slug
  seccion?: string;
}

export type Respuesta =
  | { tipo: "respuesta"; pregunta: Pregunta; items: Item[] }
  | { tipo: "opciones"; preguntas: Pregunta[]; items: Item[] }
  | { tipo: "whatsapp"; items: Item[] };

const DIRECTO = 2.2;
const PESO = [0.85, 1, 1.25, 1.8];

function cercania(p: Pregunta, ctx: ContextoChat): number {
  let c = 0;
  for (const a of p.aplica_a) {
    if (a === "general") c = Math.max(c, 1);
    else if (ctx.seccion && a === `seccion:${ctx.seccion}`) c = Math.max(c, 2);
    else if (ctx.item && a === `servicio:${ctx.item}`) c = 3;
  }
  return c;
}

function delItem(i: Item, moneda: Moneda): Pregunta[] {
  const aplica_a = [`servicio:${i.slug}`];
  const base = { palabras_clave: [] as string[], aplica_a, acciones: [] };
  const lista: Pregunta[] = [];
  if (i.descripcion) lista.push({ ...base, id: `q-${i.slug}`, pregunta: `¿En qué consiste ${i.nombre}?`, respuesta: i.descripcion, palabras_clave: ["que es", "consiste", "sirve", "para que"], emocion: "mistica" });
  const alt = precioAlterno(i, moneda);
  lista.push({ ...base, id: `p-${i.slug}`, pregunta: `¿Cuánto cuesta ${i.nombre}?`, respuesta: `${i.nombre}: ${precio(i, moneda)}${alt ? ` (${alt})` : ""}.`, palabras_clave: ["precio", "costo", "valor", "cuanto", "cuesta"], emocion: "hablando" });
  if (i.incluye.length) lista.push({ ...base, id: `i-${i.slug}`, pregunta: `¿Qué incluye ${i.nombre}?`, respuesta: `${i.incluye_titulo || "Incluye"}: ${i.incluye.join(" · ")}.`, palabras_clave: ["incluye", "beneficios", "trae"], emocion: "hablando" });
  return lista;
}

export class MotorChat {
  private indiceItems: ItemIndexado<Item>[];
  constructor(private preguntas: Pregunta[], private items: Item[], secciones: Seccion[]) {
    this.indiceItems = indiceItems(items.filter((i) => i.tipo === "servicio"), secciones);
  }

  item(slug?: string) {
    return slug ? this.items.find((i) => i.slug === slug) : undefined;
  }

  private todas(ctx: ContextoChat, moneda: Moneda): Pregunta[] {
    const i = this.item(ctx.item);
    return i ? [...delItem(i, moneda), ...this.preguntas] : this.preguntas;
  }

  sugeridas(ctx: ContextoChat, moneda: Moneda, n = 6): Pregunta[] {
    return this.todas(ctx, moneda)
      .map((p, i) => ({ p, i, c: cercania(p, ctx) }))
      .filter((x) => x.c > 0)
      .sort((a, b) => b.c - a.c || a.i - b.i)
      .slice(0, n)
      .map((x) => x.p);
  }

  private puntuar(texto: string, ctx: ContextoChat, moneda: Moneda) {
    const indice = crearIndice(this.todas(ctx, moneda), (p) => [
      { texto: p.pregunta, peso: 3 },
      { texto: p.palabras_clave.join(" "), peso: 2.5 },
      { texto: p.respuesta, peso: 0.8 },
    ]);
    return buscar(indice, texto, 0.7)
      .map((r) => ({ p: r.item, s: r.puntaje * PESO[cercania(r.item, ctx)] }))
      .sort((a, b) => b.s - a.s);
  }

  filtrar(texto: string, ctx: ContextoChat, moneda: Moneda, n = 5): Pregunta[] {
    return this.puntuar(texto, ctx, moneda).slice(0, n).map((r) => r.p);
  }

  responder(texto: string, ctx: ContextoChat, moneda: Moneda): Respuesta {
    const r = this.puntuar(texto, ctx, moneda);
    const items = buscar(this.indiceItems, texto, 1.2).slice(0, 3).map((x) => x.item);
    if (r[0] && r[0].s >= DIRECTO && (!r[1] || r[1].s < r[0].s * 0.75)) return { tipo: "respuesta", pregunta: r[0].p, items };
    if (r.length) return { tipo: "opciones", preguntas: r.slice(0, 4).map((x) => x.p), items };
    return { tipo: "whatsapp", items };
  }
}
