import { z } from "zod";
import { insertarPublico } from "@/lib/api";

const Esquema = z.object({
  tipo: z.enum(["visita", "clic_solicitar", "clic_seccion", "busqueda", "chat_abierto", "whatsapp"]),
  origen: z.string().max(40).default(""),
  seccion: z.string().max(40).optional(),
  item_id: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  return insertarPublico(req, "eventos", Esquema, 60);
}
