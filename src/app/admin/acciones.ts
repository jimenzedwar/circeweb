"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirAdmin } from "@/lib/admin";

const lineas = (v: FormDataEntryValue | null) => String(v ?? "").split("\n").map((x) => x.trim()).filter(Boolean);
const comas = (v: FormDataEntryValue | null) => String(v ?? "").split(",").map((x) => x.trim()).filter(Boolean);
const entero = (v: FormDataEntryValue | null) => {
  const n = parseInt(String(v ?? "").replace(/\D/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};
const texto = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const slugDe = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function publicar() {
  revalidatePath("/", "layout");
}

// ---------- Catálogo ----------
const ItemEsquema = z.object({
  nombre: z.string().min(2).max(200),
  tipo: z.enum(["servicio", "producto"]),
  seccion: z.string().min(1).max(40),
  nivel: z.string().max(30),
  motivo: z.string().max(30),
  precio_usd: z.number().int().min(0).nullable(),
  precio_cop: z.number().int().min(0).nullable(),
  precio_texto: z.string().max(80).nullable(),
  descripcion: z.string().max(4000),
  incluye_titulo: z.string().max(80).nullable(),
  incluye: z.array(z.string().max(300)).max(30),
  palabras_clave: z.array(z.string().max(60)).max(40),
  imagen_url: z.string().url().nullable(),
  destacado: z.boolean(),
  visible: z.boolean(),
  orden: z.number().int(),
});

export async function guardarItem(form: FormData) {
  const { db } = await exigirAdmin();
  const id = texto(form.get("id"));
  const datos = ItemEsquema.parse({
    nombre: texto(form.get("nombre")),
    tipo: texto(form.get("tipo")) || "servicio",
    seccion: texto(form.get("seccion")),
    nivel: texto(form.get("nivel")),
    motivo: texto(form.get("motivo")) || "luna",
    precio_usd: entero(form.get("precio_usd")),
    precio_cop: entero(form.get("precio_cop")),
    precio_texto: texto(form.get("precio_texto")) || null,
    descripcion: texto(form.get("descripcion")),
    incluye_titulo: texto(form.get("incluye_titulo")) || null,
    incluye: lineas(form.get("incluye")),
    palabras_clave: comas(form.get("palabras_clave")),
    imagen_url: texto(form.get("imagen_url")) || null,
    destacado: form.get("destacado") === "on",
    visible: form.get("visible") === "on",
    orden: entero(form.get("orden")) ?? 0,
  });
  if (id) {
    const { error } = await db.from("items").update(datos).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await db.from("items").insert({ ...datos, slug: `${slugDe(datos.nombre)}-${Date.now().toString(36).slice(-4)}` }).select("id").single();
    if (error) throw new Error(error.message);
    publicar();
    redirect(`/admin/catalogo?id=${data.id}&ok=1`);
  }
  publicar();
  redirect(`/admin/catalogo?id=${id}&ok=1`);
}

// ---------- Solicitudes ----------
export async function cambiarEstadoSolicitud(form: FormData) {
  const { db } = await exigirAdmin();
  const estado = texto(form.get("estado")) === "atendida" ? "atendida" : "nueva";
  await db.from("solicitudes").update({ estado }).eq("id", texto(form.get("id")));
  revalidatePath("/admin/solicitudes");
}

// ---------- Chatbot ----------
export async function guardarPregunta(form: FormData) {
  const { db } = await exigirAdmin();
  const id = texto(form.get("id"));
  const datos = {
    pregunta: z.string().min(3).max(300).parse(texto(form.get("pregunta"))),
    respuesta: z.string().max(2000).parse(texto(form.get("respuesta"))),
    palabras_clave: comas(form.get("palabras_clave")),
    aplica_a: [texto(form.get("aplica_a")) || "general"],
    emocion: z.enum(["feliz", "hablando", "pensando", "sorprendida", "apenada", "guino", "mistica"]).parse(texto(form.get("emocion")) || "hablando"),
    visible: form.get("visible") === "on",
  };
  const sinResp = entero(form.get("sin_respuesta_id"));
  let nuevoId = id;
  if (id) {
    const { error } = await db.from("preguntas").update(datos).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await db.from("preguntas").insert(datos).select("id").single();
    if (error) throw new Error(error.message);
    nuevoId = data.id;
  }
  if (sinResp) await db.from("preguntas_sin_respuesta").update({ resuelta: true }).eq("id", sinResp);
  publicar();
  redirect(`/admin/chatbot?id=${nuevoId}&ok=1`);
}

export async function borrarPregunta(form: FormData) {
  const { db } = await exigirAdmin();
  await db.from("preguntas").delete().eq("id", texto(form.get("id")));
  publicar();
  redirect("/admin/chatbot");
}

export async function descartarSinRespuesta(form: FormData) {
  const { db } = await exigirAdmin();
  await db.from("preguntas_sin_respuesta").update({ resuelta: true }).eq("id", entero(form.get("id")) ?? 0);
  revalidatePath("/admin/chatbot");
}

// ---------- Testimonios ----------
export async function crearTestimonio(form: FormData) {
  const { db } = await exigirAdmin();
  if (form.get("permiso") !== "on" || form.get("oculto") !== "on") throw new Error("Confirma el permiso y que ocultaste los datos personales.");
  const imagen_url = z.string().url().parse(texto(form.get("imagen_url")));
  const item_id = texto(form.get("item_id")) || null;
  const { error } = await db.from("testimonios").insert({ imagen_url, item_id, pais: texto(form.get("pais")).slice(0, 40), fecha_texto: texto(form.get("fecha_texto")).slice(0, 40) });
  if (error) throw new Error(error.message);
  publicar();
  redirect("/admin/testimonios?ok=1");
}

export async function cambiarTestimonio(form: FormData) {
  const { db } = await exigirAdmin();
  const id = texto(form.get("id"));
  if (form.get("accion") === "borrar") await db.from("testimonios").delete().eq("id", id);
  else await db.from("testimonios").update({ visible: form.get("visible") === "true" }).eq("id", id);
  publicar();
  revalidatePath("/admin/testimonios");
}

// ---------- Contenido ----------
export async function guardarContenido(form: FormData) {
  const { db } = await exigirAdmin();
  const filas = [...form.entries()]
    .filter(([k]) => k.startsWith("c_"))
    .map(([k, v]) => ({ clave: k.slice(2), valor: String(v).slice(0, 4000) }));
  if (!form.has("c_agenda_llena")) filas.push({ clave: "agenda_llena", valor: "false" });
  const { error } = await db.from("contenido").upsert(filas);
  if (error) throw new Error(error.message);
  publicar();
  redirect("/admin/contenido?ok=1");
}

export async function salir() {
  const { db } = await exigirAdmin();
  await db.auth.signOut();
  redirect("/admin/login");
}
