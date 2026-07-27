import React, { useEffect, useState, useCallback } from "react";
import { Users, CalendarDays, BarChart3, DollarSign, Receipt, ShoppingBag, Download, LogOut, ShieldCheck, Pencil } from "lucide-react";
import { supabase } from "./lib/supabaseClient";
import { RED_DEEP, MUTED_ON_RED } from "./lib/format";
import { StripeDivider, LoadingScreen } from "./components/ui";
import { exportarExcel } from "./lib/excelExport";

import ElencoTab from "./tabs/Elenco";
import PartidasTab from "./tabs/Partidas";
import FinanceiroTab from "./tabs/Financeiro";
import GastosTab from "./tabs/Gastos";
import PedidosTab from "./tabs/Pedidos";
import EstatisticasTab from "./tabs/Estatisticas";
import UsuariosTab from "./tabs/Usuarios";

export default function MainApp({ session, profile }) {
  const isAdmin = profile.role === "admin";
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("elenco");
  const [nomeTime, setNomeTime] = useState("Meu Time F.C.");
  const [editingName, setEditingName] = useState(false);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profiles, setProfiles] = useState([]);

  const fetchAll = useCallback(async () => {
    const [t, p, m, s, g, o] = await Promise.all([
      supabase.from("team_settings").select("*").eq("id", 1).single(),
      supabase.from("players").select("*").order("numero", { ascending: true }),
      supabase.from("matches").select("*").order("data", { ascending: false }),
      supabase.from("sponsors").select("*").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("data", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    if (t.data) setNomeTime(t.data.nome_time);
    setPlayers(p.data || []);
    setMatches(m.data || []);
    setSponsors(s.data || []);
    setExpenses(g.data || []);
    setOrders(o.data || []);
    if (isAdmin) {
      const { data } = await supabase.from("profiles").select("*").order("email");
      setProfiles(data || []);
    }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) return <LoadingScreen />;

  async function saveNomeTime(v) {
    setNomeTime(v);
    await supabase.from("team_settings").update({ nome_time: v }).eq("id", 1);
  }

  async function addPlayer({ nome, numero, posicao, file }) {
    const { data, error } = await supabase.from("players").insert({ nome, numero, posicao }).select().single();
    if (error) return alert(error.message);
    if (file) await uploadFoto(data.id, file);
    fetchAll();
  }
  async function updatePlayer(id, { nome, numero, posicao, file }) {
    await supabase.from("players").update({ nome, numero, posicao }).eq("id", id);
    if (file) await uploadFoto(id, file);
    fetchAll();
  }
  async function uploadFoto(playerId, file) {
    const path = `${playerId}-${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage.from("player-photos").upload(path, file, { upsert: true });
    if (upErr) return alert(upErr.message);
    const { data } = supabase.storage.from("player-photos").getPublicUrl(path);
    await supabase.from("players").update({ foto_url: data.publicUrl }).eq("id", playerId);
  }
  async function removePlayer(id) {
    await supabase.from("players").delete().eq("id", id);
    fetchAll();
  }

  async function addMatch({ data: dataJogo, adversario, local }) {
    await supabase.from("matches").insert({ data: dataJogo || null, adversario, local, presencas: {}, gols: {}, cartoes_amarelos: {}, cartoes_vermelhos: {} });
    fetchAll();
  }
  async function removeMatch(id) {
    await supabase.from("matches").delete().eq("id", id);
    fetchAll();
  }
  async function updateMatchField(matchRow, field, playerId, value) {
    const next = { ...(matchRow[field] || {}), [playerId]: value };
    setMatches((prev) => prev.map((m) => (m.id === matchRow.id ? { ...m, [field]: next } : m)));
    await supabase.from("matches").update({ [field]: next }).eq("id", matchRow.id);
  }

  async function addSponsor(s) {
    await supabase.from("sponsors").insert(s);
    fetchAll();
  }
  async function updateSponsor(id, s) {
    await supabase.from("sponsors").update(s).eq("id", id);
    fetchAll();
  }
  async function removeSponsor(id) {
    await supabase.from("sponsors").delete().eq("id", id);
    fetchAll();
  }

  async function addExpense(g) {
    await supabase.from("expenses").insert(g);
    fetchAll();
  }
  async function removeExpense(id) {
    await supabase.from("expenses").delete().eq("id", id);
    fetchAll();
  }

  async function addOrder(o) {
    await supabase.from("orders").insert(o);
    fetchAll();
  }
  async function updateOrder(id, o) {
    await supabase.from("orders").update(o).eq("id", id);
    fetchAll();
  }
  async function removeOrder(id) {
    await supabase.from("orders").delete().eq("id", id);
    fetchAll();
  }

  async function setUserRole(id, role) {
    await supabase.from("profiles").update({ role }).eq("id", id);
    fetchAll();
  }

  const TABS = [
    { id: "elenco", label: "Elenco", icon: Users },
    { id: "partidas", label: "Partidas", icon: CalendarDays },
    { id: "financeiro", label: "Patrocínio", icon: DollarSign },
    { id: "gastos", label: "Gastos", icon: Receipt },
    { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
    { id: "stats", label: "Estatísticas", icon: BarChart3 },
    ...(isAdmin ? [{ id: "usuarios", label: "Usuários", icon: ShieldCheck }] : []),
  ];

  return (
    <div className="min-h-screen" style={{ background: RED_DEEP, fontFamily: "Work Sans, sans-serif" }}>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="text-xs tracking-widest uppercase" style={{ color: MUTED_ON_RED, letterSpacing: 3 }}>
              súmula digital · {isAdmin ? "admin" : "membro"}
            </div>
            {editingName && isAdmin ? (
              <input
                autoFocus
                defaultValue={nomeTime}
                onBlur={(e) => {
                  saveNomeTime(e.target.value || nomeTime);
                  setEditingName(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                className="bg-transparent border-b-2 outline-none w-full mt-1"
                style={{ fontFamily: "Anton", color: "#fff", fontSize: 26, borderColor: "#fff" }}
              />
            ) : (
              <button className="flex items-center gap-2 mt-1" onClick={() => isAdmin && setEditingName(true)}>
                <h1 className="truncate" style={{ fontFamily: "Anton", color: "#fff", fontSize: 26 }}>{nomeTime}</h1>
                {isAdmin && <Pencil size={14} color={MUTED_ON_RED} />}
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button onClick={() => exportarExcel({ nomeTime, players, matches, sponsors, expenses, orders })} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <Download size={16} color="#fff" />
            </button>
            <button onClick={() => supabase.auth.signOut()} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.12)" }}>
              <LogOut size={16} color="#fff" />
            </button>
          </div>
        </div>
      </div>

      <StripeDivider />

      <div className="flex overflow-x-auto gap-1 px-3 pt-3">
        {TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex flex-col items-center gap-1 pb-2 pt-1 px-2 shrink-0"
              style={{ minWidth: 68, borderBottom: active ? "3px solid #fff" : "3px solid transparent", color: active ? "#fff" : MUTED_ON_RED }}
            >
              <Icon size={17} />
              <span className="text-[10px] font-medium whitespace-nowrap">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-24 pt-4">
        {tab === "elenco" && (
          <ElencoTab players={players} isAdmin={isAdmin} onAdd={addPlayer} onUpdate={updatePlayer} onRemove={removePlayer} />
        )}
        {tab === "partidas" && (
          <PartidasTab matches={matches} players={players} isAdmin={isAdmin} onAdd={addMatch} onRemove={removeMatch} onSetField={updateMatchField} />
        )}
        {tab === "financeiro" && (
          <FinanceiroTab sponsors={sponsors} isAdmin={isAdmin} onAdd={addSponsor} onUpdate={updateSponsor} onRemove={removeSponsor} />
        )}
        {tab === "gastos" && (
          <GastosTab expenses={expenses} isAdmin={isAdmin} onAdd={addExpense} onRemove={removeExpense} />
        )}
        {tab === "pedidos" && (
          <PedidosTab orders={orders} players={players} isAdmin={isAdmin} onAdd={addOrder} onUpdate={updateOrder} onRemove={removeOrder} />
        )}
        {tab === "stats" && <EstatisticasTab players={players} matches={matches} />}
        {tab === "usuarios" && isAdmin && (
          <UsuariosTab profiles={profiles} currentUserId={session.user.id} onSetRole={setUserRole} />
        )}
      </div>
    </div>
  );
}
