import { z } from "zod";
import { insertarPublico } from "@/lib/api";

const Esquema = z.object({
  item_id: z.string().uuid().optional(),
  item_nombre: z.string().max(200).default(""),
  tipo: z.enum(["servicio", "producto", "consulta"]),
  situaciones: z.array(z.string().max(80)).max(12).default([]),
  resumen: z.string().max(400).default(""),
  nombre: z.string().max(60).default(""),
  pais: z.string().max(40).default(""),
  origen: z.string().max(40).default(""),
});

export async function POST(req: Request) {
  return insertarPublico(req, "solicitudes", Esquema, 6);
}
