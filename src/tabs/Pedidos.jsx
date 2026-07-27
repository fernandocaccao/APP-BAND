import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { PAPER, INK, MUTED, MUTED_ON_RED, RED_DEEP, TAMANHOS, STATUS_PAGAMENTO, fmtMoney } from "../lib/format";
import { AddButton, SummaryCard, ModalShell, Field, inputStyle } from "../components/ui";

function statusColor(status) {
  if (status === "Pago") return "#2f7a3d";
  if (status === "Parcial") return "#b8860b";
  return "#c0392b";
}

export default function PedidosTab({ orders, players, isAdmin, onAdd, onUpdate, onRemove }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const totalValor = orders.reduce((s, o) => s + (Number(o.valor) || 0), 0);
  const pendentes = orders.filter((o) => o.status_pagamento !== "Pago").length;

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <SummaryCard label="Total em pedidos" value={fmtMoney(totalValor)} />
        <SummaryCard label="Pendentes" value={String(pendentes)} />
      </div>
      {orders.length === 0 && <p style={{ color: MUTED_ON_RED }} className="mb-4 text-center pt-2">Nenhum pedido registrado.</p>}
      <div className="flex flex-col gap-2">
        {orders.map((o) => (
          <button key={o.id} onClick={() => isAdmin && setEditing(o)} className="rounded-2xl p-3 flex items-center justify-between text-left" style={{ background: PAPER }}>
            <div className="min-w-0">
              <div className="font-medium truncate" style={{ color: INK }}>{o.jogador || "sem nome"}</div>
              <div className="text-xs" style={{ color: MUTED }}>Tamanho {o.tamanho} · {o.data || "sem data"}</div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="font-semibold text-sm" style={{ color: RED_DEEP }}>{fmtMoney(o.valor)}</div>
              <div className="text-[10px] font-semibold uppercase" style={{ color: statusColor(o.status_pagamento) }}>{o.status_pagamento}</div>
            </div>
          </button>
        ))}
      </div>
      {isAdmin && <div className="mt-4"><AddButton label="Novo pedido de uniforme" onClick={() => setShowAdd(true)} /></div>}

      {showAdd && <OrderModal players={players} onClose={() => setShowAdd(false)} onSave={onAdd} />}
      {editing && (
        <OrderModal
          initial={editing}
          players={players}
          onClose={() => setEditing(null)}
          onSave={(o) => onUpdate(editing.id, o)}
          onDelete={() => onRemove(editing.id)}
        />
      )}
    </div>
  );
}

function OrderModal({ initial, players, onClose, onSave, onDelete }) {
  const [jogador, setJogador] = useState(initial?.jogador || "");
  const [tamanho, setTamanho] = useState(initial?.tamanho || TAMANHOS[2]);
  const [valor, setValor] = useState(initial?.valor ?? "");
  const [statusPagamento, setStatusPagamento] = useState(initial?.status_pagamento || STATUS_PAGAMENTO[2]);
  const [data, setDataPedido] = useState(initial?.data || "");

  return (
    <ModalShell title={initial ? "Editar pedido" : "Novo pedido de uniforme"} onClose={onClose}>
      <Field label="Jogador">
        
