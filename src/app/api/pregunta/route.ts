import { z } from "zod";
import { insertarPublico } from "@/lib/api";

const Esquema = z.object({
  texto: z.string().trim().min(2).max(300),
  contexto: z.string().max(120).default(""),
});

export async function POST(req: Request) {
  return insertarPublico(req, "preguntas_sin_respuesta", Esquema, 10);
}
