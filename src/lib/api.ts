import { NextResponse } from "next/server";
import type { z } from "zod";
import { supabaseConfigurado } from "./supabase/config";
import { clientePublico } from "./supabase/publico";

// Límite simple por IP (por instancia). Suficiente para frenar abusos básicos.
const ventanas = new Map<string, { n: number; hasta: number }>();
function permitido(clave: string, max: number) {
  const ahora = Date.now();
  const v = ventanas.get(clave);
  if (!v || v.hasta < ahora) {
    ventanas.set(clave, { n: 1, hasta: ahora + 60_000 });
    return true;
  }
  v.n += 1;
  return v.n <= max;
}

/** Inserta en una tabla pública (las políticas RLS solo permiten insertar). */
export async function insertarPublico<T extends z.ZodType>(req: Request, tabla: string, esquema: T, maxPorMinuto: number) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!permitido(`${tabla}:${ip}`, maxPorMinuto)) return NextResponse.json({ error: "Demasiadas solicitudes" }, { status: 429 });
  const cuerpo = await req.json().catch(() => null);
  const datos = esquema.safeParse(cuerpo);
  if (!datos.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  if (!supabaseConfigurado) return NextResponse.json({ ok: true, demo: true });
  const { error } = await clientePublico().from(tabla).insert(datos.data as object);
  if (error) {
    console.error(`[api/${tabla}]`, error.message);
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
