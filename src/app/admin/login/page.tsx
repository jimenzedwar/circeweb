"use client";

import Link from "next/link";
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
    setError("");
    if (!supabaseConfigurado) {
      return setError("El panel todavía no está conectado a la base de datos. Agrega las claves de Supabase en .env.local y reinicia el servidor.");
    }
    setCargando(true);
    try {
      const { error } = await clienteNavegador().auth.signInWithPassword({ email: correo.trim(), password: clave });
      if (error) return setError("Correo o contraseña incorrectos.");
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("No se pudo conectar. Revisa tu internet e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={entrar} className="tile still scr login-card">
      <div className="glow" aria-hidden="true" style={{ opacity: 0.55 }} />
      <div className="above" style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <header style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
          <span className="tag">Panel privado</span>
          <h1 className="dsp" style={{ fontSize: "clamp(44px, 9vw, 58px)" }}>
            <span className="grad">Circe </span>
            <span className="grad" style={{ fontStyle: "italic" }}>Witch</span>
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--mut)" }}>Entra para administrar tu sitio</p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label className="login-fl">
            Correo
            <input className="login-in" type="email" required autoComplete="email" placeholder="tu@correo.com" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          </label>
          <label className="login-fl">
            Contraseña
            <input className="login-in" type="password" required autoComplete="current-password" placeholder="••••••••" value={clave} onChange={(e) => setClave(e.target.value)} />
          </label>
        </div>

        {error && (
          <p role="alert" className="login-err">
            {error}
          </p>
        )}

        <button className="btn" type="submit" disabled={cargando} style={{ width: "100%", opacity: cargando ? 0.7 : 1 }}>
          {cargando ? "Entrando…" : "Entrar"}
        </button>

        <Link href="/" className="lnk" style={{ alignSelf: "center", fontSize: 14 }}>
          Volver al sitio
        </Link>
      </div>
    </form>
  );
}

export default function Login() {
  return (
    <main style={{ position: "relative", minHeight: "100dvh", display: "grid", placeItems: "center", padding: "32px 16px", isolation: "isolate", overflow: "hidden", background: "var(--ink)", color: "var(--txt)" }}>
      <div className="aurora" aria-hidden="true" style={{ zIndex: -2 }} />
      <div className="stars cw-twinkle" aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.5, zIndex: -2 }} />
      <Suspense>
        <Formulario />
      </Suspense>
    </main>
  );
}
