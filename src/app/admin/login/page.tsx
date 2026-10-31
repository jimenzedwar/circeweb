"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { supabaseConfigurado } from "@/lib/supabase/config";
import { clienteNavegador } from "@/lib/supabase/navegador";

function Formulario() {
  const router = useRouter();
  const params = useSearchParams();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState(params.get("error") === "permiso" ? "Esta cuenta no tiene permiso de administradora." : "");
  const [cargando, setCargando] = useState(false);

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    const { error } = await clienteNavegador().auth.signInWithPassword({ email: correo, password: clave });
    setCargando(false);
    if (error) return setError("Correo o contraseña incorrectos.");
    router.replace("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={entrar} className="acard" style={{ width: "min(400px, 100%)", padding: 28, display: "flex", flexDirection: "column", gap: 16, borderRadius: 20 }}>
      <div>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32 }}>Circe <span style={{ fontStyle: "italic", color: "#8C6A3F" }}>Witch</span></div>
        <span style={{ fontSize: 13, color: "#5E574F" }}>Panel de administración</span>
      </div>
      {!supabaseConfigurado && <p style={{ margin: 0, fontSize: 13, color: "#8A2B3B" }}>Falta conectar Supabase (variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).</p>}
      {error && <p role="alert" style={{ margin: 0, fontSize: 13, color: "#8A2B3B" }}>{error}</p>}
      <label className="afl">Correo<input className="ain" type="email" required autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} /></label>
      <label className="afl">Contraseña<input className="ain" type="password" required autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} /></label>
      <button className="abtn" disabled={cargando || !supabaseConfigurado} style={{ height: 46, background: "#581F30", borderColor: "#581F30", color: "#FBF8F3" }}>{cargando ? "Entrando…" : "Entrar"}</button>
    </form>
  );
}

export default function Login() {
  return (
    <main className="adm" style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#F4EEE5", color: "#11100F" }}>
      <Suspense><Formulario /></Suspense>
    </main>
  );
}
