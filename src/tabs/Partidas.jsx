import React, { useState } from "react";
import { ChevronLeft, Trash2, Check } from "lucide-react";
import { PAPER, INK, MUTED, MUTED_ON_RED, RED, RED_DEEP } from "../lib/format";
import { JerseyBadge, Stepper, AddButton, ModalShell, Field, inputStyle } from "../components/ui";

export default function PartidasTab({ matches, players, isAdmin, onAdd, onRemove, onSetField }) {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const match = matches.find((m) => m.id === selectedId);

  if (match) {
    return (
      <MatchDetail
        match={match}
        players={players}
        isAdmin={isAdmin}
        onBack={() => setSelectedId(null)}
        onRemove={() => {
          onRemove(match.id);
          setSelectedId(null);
        }}
        onSet={(field, playerId, value) => onSetField(match, field, playerId, value)}
      />
    );
  }

  return (
    <div>
      {matches.length === 0 && <p style={{ color: MUTED_ON_RED }} className="mb-4 text-center pt-8">Nenhuma partida registrada ainda.</p>}
      <div className="flex flex-col gap-2">
        {matches.map((m) => {
          const presentes = Object.values(m.presencas || {}).filter(Boolean).length;
          const golsTotal = Object.values(m.gols || {}).reduce((a, b) => a + b, 0);
          return (
            <button key={m.id} onClick={() => setSelectedId(m.id)} className="rounded-2xl p-4 text-left" style={{ background: PAPER }}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold" style={{ color: INK }}>vs {m.adversario || "adversário"}</div>
                  <div className="text-xs" style={{ color: MUTED }}>{m.data || "sem data"} {m.local ? `· ${m.local}` : ""}</div>
                </div>
                <div className="text-right text-xs" style={{ color: MUTED }}>
                  <div>{presentes} presentes</div>
                  <div>{golsTotal} gols</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {isAdmin && <div className="mt-4"><AddButton label="Adicionar partida" onClick={() => setShowAdd(true)} /></div>}
      {showAdd && <MatchModal onClose={() => setShowAdd(false)} onSave={onAdd} />}
    </div>
  );
}

function MatchDetail({ match, players, isAdmin, onBack, onRemove, onSet }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={onBack} className="flex items-center gap-1" style={{ color: MUTED_ON_RED }}>
          <ChevronLeft size={18} /> voltar
        </button>
        {isAdmin && (
          <button onClick={onRemove} style={{ color: "#ffd1d1" }}>
            <Trash2 size={18} />
          </button>
        )}
      </div>
      <div className="rounded-2xl p-4 mb-4" style={{ background: PAPER }}>
        <div className="font-semibold text-lg" style={{ color: INK, fontFamily: "Anton" }}>vs {match.adversario || "adversário"}</div>
        <div className="text-xs" style={{ color: MUTED }}>{match.data || "sem data"} {match.local ? `· ${match.local}` : ""}</div>
      </div>
      {players.length === 0 ? (
        <p style={{ color: MUTED_ON_RED }}>Cadastre jogadores no elenco para registrar a partida.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {players.map((p) => {
            const presente = !!(match.presencas || {})[p.id];
            const gols = (match.gols || {})[p.id] || 0;
            const amarelos = (match.cartoes_amarelos || {})[p.id] || 0;
            const vermelhos = (match.cartoes_vermelhos || {})[p.id] || 0;
            return (
              <div key={p.id} className="rounded-2xl p-3" style={{ background: PAPER }}>
                <div className="flex items-center gap-2 mb-2">
                  <JerseyBadge numero={p.numero} foto={p.foto_url} size={34} />
                  <span className="font-medium flex-1 truncate" style={{ color: INK }}>{p.nome}</span>
                  <button
                    disabled={!isAdmin}
                    onClick={() => onSet("presencas", p.id, !presente)}
                    className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-60"
                    style={{ background: presente ? RED : "#e7e2d3", color: presente ? "#fff" : "#8a9c92" }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </button>
                </div>
                <div className="flex items-center justify-between px-1">
                  <StatMini label="gols"><Stepper disabled={!isAdmin} value={gols} onChange={(v) => onSet("gols", p.id, v)} color={RED_DEEP} /></StatMini>
                  <StatMini label="cartão amarelo"><Stepper disabled={!isAdmin} value={amarelos} onChange={(v) => onSet("cartoes_amarelos", p.id, v)} color="#b8860b" /></StatMini>
                  <StatMini label="cartão vermelho"><Stepper disabled={!isAdmin} value={vermelhos} onChange={(v) => onSet("cartoes_vermelhos", p.id, v)} color="#8f1c1c" /></StatMini>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatMini({ label, children }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {children}
      <span className="text-[9px] uppercase tracking-wide text-center" style={{ color: "#8a9c92" }}>{label}</span>
    </div>
  );
}

function MatchModal({ onClose, onSave }) {
  const [dataJogo, setDataJogo] = useState("");
  const [adversario, setAdversario] = useState("");
  const [local, setLocal] = useState("");
  return (
    <ModalShell title="Nova partida" onClose={onClose}>
      <Field label="Data"><input type="date" className="w-full rounded-xl px-3 py-2" style={inputStyle} value={dataJogo} onChange={(e) => setDataJogo(e.target.value)} /></Field>
      <Field label="Adversário"><input className="w-full rounded-xl px-3 py-2" style={inputStyle} value={adversario} onChange={(e) => setAdversario(e.target.value)} placeholder="Nome do time adversário" /></Field>
      <Field label="Local"><input className="w-full rounded-xl px-3 py-2" style={inputStyle} value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Campo do bairro, quadra..." /></Field>
      <button onClick={() => onSave({ data: dataJogo, adversario, local })} className="w-full py-3 rounded-xl font-semibold mt-2" style={{ background: RED_DEEP, color: "#fff" }}>
        Criar partida
      </button>
    </ModalShell>
  );
}
