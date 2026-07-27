import React, { useState } from "react";
import { supabase } from "./lib/supabaseClient";
import { RED_DEEP, RED, MUTED } from "./lib/format";
import { StripeDivider } from "./components/ui";

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(traduzErro(error.message));
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(traduzErro(error.message));
      else setInfo("Conta criada! Se a confirmação por e-mail estiver ativa no seu projeto Supabase, verifique sua caixa de entrada antes de entrar.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen" style={{ background: RED_DEEP, fontFamily: "Work Sans, sans-serif" }}>
      <div className="px-6 pt-10 pb-6">
        <div className="text-xs tracking-widest uppercase" style={{ color: "#e7b3b5", letterSpacing: 3 }}>
          súmula digital
        </div>
        <h1 style={{ fontFamily: "Anton", color: "#fff", fontSize: 30 }} className="mt-1">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>
      </div>
      <StripeDivider />
      <form onSubmit={handleSubmit} className="px-6 pt-8">
        <div className="rounded-2xl p-5" style={{ background: "#fff" }}>
          <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>
            E-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl px-3 py-2 mb-3"
            style={{ border: "1px solid #e0d3d1" }}
            placeholder="voce@email.com"
          />
          <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>
            Senha
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl px-3 py-2 mb-4"
            style={{ border: "1px solid #e0d3d1" }}
            placeholder="mínimo 6 caracteres"
          />
          {error && <p className="text-xs mb-3" style={{ color: "#c0392b" }}>{error}</p>}
          {info && <p className="text-xs mb-3" style={{ color: "#2f7a3d" }}>{info}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold"
            style={{ background: RED_DEEP, color: "#fff" }}
          >
            {loading ? "aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError("");
            setInfo("");
          }}
          className="w-full text-center mt-4 text-sm"
          style={{ color: "#e7b3b5" }}
        >
          {mode === "login" ? "Não tem conta? Criar uma agora" : "Já tem conta? Entrar"}
        </button>
        <p className="text-center text-xs mt-6" style={{ color: "#c98e90" }}>
          Novas contas entram como <b>Membro</b> (só visualização). Um Admin precisa promovê-lo na aba Usuários.
        </p>
      </form>
    </div>
  );
}

function traduzErro(msg) {
  if (msg.includes("Invalid login credentials")) return "E-mail ou senha inválidos.";
  if (msg.includes("User already registered")) return "Já existe uma conta com esse e-mail.";
  if (msg.includes("Password should be")) return "A senha deve ter pelo menos 6 caracteres.";
  return msg;
}
