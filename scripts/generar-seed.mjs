// Genera supabase/seed.sql a partir de los datos de src/data (los mismos del modo demo).
// Uso: npm run seed:sql
import { readFileSync, writeFileSync } from "node:fs";

const leer = (f) => JSON.parse(readFileSync(new URL(`../src/data/${f}`, import.meta.url), "utf8"));
const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => `array[${(a || []).map(q).join(", ")}]::text[]`;
const b = (v) => (v ? "true" : "false");

const secciones = leer("secciones.json");
const categorias = leer("categorias-productos.json");
const catalogo = leer("catalogo.json");
const preguntas = leer("preguntas.json");
const contenido = leer("contenido.json");

const l = ["-- Datos iniciales de Circe Witch (generado con `npm run seed:sql`).", "-- Se puede ejecutar varias veces: no pisa lo que ya editaste en el panel.", "begin;", ""];
for (const s of secciones)
  l.push(`insert into public.secciones (id, nombre, corto, motivo, palabra, descripcion, sinonimos, orden) values (${q(s.id)}, ${q(s.nombre)}, ${q(s.corto)}, ${q(s.motivo)}, ${q(s.palabra)}, ${q(s.descripcion)}, ${arr(s.sinonimos)}, ${s.orden}) on conflict (id) do nothing;`);
l.push("");
for (const c of categorias)
  l.push(`insert into public.categorias_productos (id, nombre, orden) values (${q(c.id)}, ${q(c.nombre)}, ${c.orden}) on conflict (id) do nothing;`);
l.push("");
for (const i of catalogo)
  l.push(`insert into public.items (slug, tipo, seccion, nombre, nivel, motivo, precio_usd, precio_cop, precio_texto, descripcion, incluye_titulo, incluye, palabras_clave, destacado, visible, orden) values (${q(i.slug)}, ${q(i.tipo)}, ${q(i.seccion)}, ${q(i.nombre)}, ${q(i.nivel)}, ${q(i.motivo)}, ${i.precio_usd ?? "null"}, ${i.precio_cop ?? "null"}, ${q(i.precio_texto)}, ${q(i.descripcion)}, ${q(i.incluye_titulo)}, ${arr(i.incluye)}, ${arr(i.palabras_clave)}, ${b(i.destacado)}, ${b(i.visible !== false)}, ${i.orden}) on conflict (slug) do nothing;`);
l.push("");
for (const p of preguntas)
  l.push(`insert into public.preguntas (clave, pregunta, respuesta, palabras_clave, aplica_a, emocion, acciones, orden) values (${q(p.clave)}, ${q(p.pregunta)}, ${q(p.respuesta)}, ${arr(p.palabras_clave)}, ${arr(p.aplica_a)}, ${q(p.emocion)}, ${q(JSON.stringify(p.acciones))}::jsonb, ${p.orden}) on conflict (clave) do nothing;`);
l.push("");
for (const [k, v] of Object.entries(contenido))
  l.push(`insert into public.contenido (clave, valor) values (${q(k)}, ${q(v)}) on conflict (clave) do nothing;`);
l.push("", "commit;", "");
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), l.join("\n"));
console.log(`seed.sql: ${secciones.length} secciones, ${catalogo.length} ítems, ${preguntas.length} preguntas`);
