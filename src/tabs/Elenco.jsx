import React, { useState, useRef } from "react";
import { Camera, Trash2 } from "lucide-react";
import { PAPER, INK, MUTED, MUTED_ON_RED, RED, RED_DEEP } from "../lib/format";
import { JerseyBadge, AddButton, ModalShell, Field, inputStyle, resizeImageFile } from "../components/ui";

export default function ElencoTab({ players, isAdmin, onAdd, onUpdate, onRemove }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  if (players.length === 0) {
    return (
      <div className="text-center pt-12">
        <p style={{ color: MUTED_ON_RED }} className="mb-4">Nenhum jogador no elenco ainda.</p>
        {isAdmin && <AddButton label="Adicionar jogador" onClick={() => setShowAdd(true)} />}
        {showAdd && <PlayerModal onClose={() => setShowAdd(false)} onSave={onAdd} />}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {players
          .slice()
          .sort((a, b) => Number(a.numero || 99) - Number(b.numero || 99))
          .map((p) => (
            <button
              key={p.id}
              onClick={() => isAdmin && setEditing(p)}
              className="rounded-2xl p-3 flex items-center gap-3 text-left"
              style={{ background: PAPER }}
            >
              <JerseyBadge numero={p.numero} foto={p.foto_url} size={44} />
              <div className="min-w-0">
                <div className="font-semibold truncate" style={{ color: INK }}>{p.nome}</div>
                <div className="text-xs truncate" style={{ color: MUTED }}>{p.posicao || "sem posição"}</div>
              </div>
            </button>
          ))}
      </div>
      {isAdmin && <div className="mt-4"><AddButton label="Adicionar jogador" onClick={() => setShowAdd(true)} /></div>}

      {showAdd && <PlayerModal onClose={() => setShowAdd(false)} onSave={onAdd} />}
      {editing && (
        <PlayerModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(p) => onUpdate(editing.id, p)}
          onDelete={() => onRemove(editing.id)}
        />
      )}
    </div>
  );
}

function PlayerModal({ initial, onClose, onSave, onDelete }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [numero, setNumero] = useState(initial?.numero || "");
  const [posicao, setPosicao] = useState(initial?.posicao || "");
  const [previewUrl, setPreviewUrl] = useState(initial?.foto_url || null);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  async function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const blob = await resizeImageFile(f);
    setFile(blob);
    setPreviewUrl(URL.createObjectURL(blob));
  }

  return (
    <ModalShell title={initial ? "Editar jogador" : "Novo jogador"} onClose={onClose}>
      <div className="flex justify-center mb-4">
        <button onClick={() => fileRef.current?.click()} className="relative">
          <JerseyBadge numero={numero} foto={previewUrl} size={84} />
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: RED, border: "2px solid #fff" }}>
            <Camera size={14} color="#fff" />
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      <Field label="Nome">
        <input className="w-full rounded-xl px-3 py-2" style={inputStyle} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do jogador" />
      </Field>
      <Field label="Número da camisa">
        <input className="w-full rounded-xl px-3 py-2" style={inputStyle} value={numero} onChange={(e) => setNumero(e.target.value.replace(/[^0-9]/g, ""))} placeholder="10" inputMode="numeric" />
      </Field>
      <Field label="Posição">
        <input className="w-full rounded-xl px-3 py-2" style={inputStyle} value={posicao} onChange={(e) => setPosicao(e.target.value)} placeholder="Atacante, zagueiro, goleiro..." />
      </Field>
      <div className="flex gap-2 mt-4">
        {initial && (
          
