import { cache } from "react";
import catalogoDemo from "@/data/catalogo.json";
import categoriasDemo from "@/data/categorias-productos.json";
import contenidoDemo from "@/data/contenido.json";
import preguntasDemo from "@/data/preguntas.json";
import seccionesDemo from "@/data/secciones.json";
import { supabaseConfigurado } from "./supabase/config";
import { clientePublico } from "./supabase/publico";
import type { Contenido, Item, Pregunta, Sitio } from "./tipos";

function demo(): Sitio {
  const items = (catalogoDemo as (Omit<Item, "id" | "imagen_url"> & { visible?: boolean })[])
    .filter((i) => i.visible !== false)
    .map((i) => ({ ...i, id: i.slug, imagen_url: null }));
  const preguntas = (preguntasDemo as unknown as (Omit<Pregunta, "id"> & { clave: string })[])
    .filter((p) => p.respuesta.trim() !== "")
    .map((p) => ({ ...p, id: p.clave }));
  return {
    secciones: seccionesDemo,
    categorias: categoriasDemo,
    items,
    preguntas,
    testimonios: [],
    contenido: contenidoDemo as Contenido,
    demo: true,
  };
}

/** Todo lo que necesita la parte pública, en una sola carga por petición. */
export const obtenerSitio = cache(async (): Promise<Sitio> => {
  if (!supabaseConfigurado) return demo();
  const db = clientePublico();
  const [secciones, categorias, items, preguntas, testimonios, contenido] = await Promise.all([
    db.from("secciones").select("id, nombre, corto, motivo, palabra, descripcion, sinonimos, orden").order("orden"),
    db.from("categorias_productos").select("id, nombre, orden").order("orden"),
    db.from("items").select("id, slug, tipo, seccion, nombre, nivel, motivo, precio_usd, precio_cop, precio_texto, descripcion, incluye_titulo, incluye, palabras_clave, imagen_url, destacado, orden").order("orden"),
    db.from("preguntas").select("id, pregunta, respuesta, palabras_clave, aplica_a, emocion, acciones").order("orden"),
    db.from("testimonios").select("id, item_id, imagen_url, pais, fecha_texto").order("orden").order("creado", { ascending: false }),
    db.from("contenido").select("clave, valor"),
  ]);
  const error = secciones.error || categorias.error || items.error || preguntas.error || testimonios.error || contenido.error;
  if (error) {
    console.error("[datos] Supabase no respondió, uso los datos de demostración:", error.message);
    return demo();
  }
  return {
    secciones: secciones.data,
    categorias: categorias.data,
    items: items.data as Item[],
    preguntas: preguntas.data as Pregunta[],
    testimonios: testimonios.data,
    contenido: { ...(contenidoDemo as Contenido), ...Object.fromEntries(contenido.data.map((c) => [c.clave, c.valor])) },
    demo: false,
  };
});
