import { redirect } from "next/navigation";
import { supabaseConfigurado } from "./supabase/config";
import { clienteServidor } from "./supabase/servidor";

/** Verifica en la base de datos que quien entra es administradora (el proxy solo revisa la sesión). */
export async function exigirAdmin() {
  if (!supabaseConfigurado) redirect("/admin/login");
  const db = await clienteServidor();
  const { data } = await db.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const { data: fila } = await db.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!fila) redirect("/admin/login?error=permiso");
  return { db, usuario: data.user };
}
