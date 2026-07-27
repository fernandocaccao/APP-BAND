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

  // ---------- nome do time ----------
  async function saveNomeTime(v) {
    setNomeTime(v);
    await supabase.from("team_settings").update({ nome_time: v }).eq("id", 1);
  }

  // ---------- jogadores ----------
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

  // ---------- partidas ----------
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

  // ---------- patrocinadores ----------
  async function addSponsor(s) {
    await supabase.from("sponsors").insert(s);
    fetchAll();
  }
  async function upd
