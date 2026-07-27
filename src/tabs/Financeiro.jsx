import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { PAPER, INK, MUTED, MUTED_ON_RED, RED_DEEP, fmtMoney } from "../lib/format";
import { AddButton, SummaryCard, ModalShell, Field, inputStyle } from "../components/ui";

export default function FinanceiroTab({ sponsors, isAdmin, onAdd, onUpdate, onRemove }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);

  const totalContratado = sponsors.reduce((s, x) => s + (Number(x.valor_contratado) || 0), 0);
  const totalPago = sponsors.reduce((s, x) => s + (Number(x.valor_pago) || 0), 0);
  const totalAReceber = totalContratado - totalPago;
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <SummaryCard label="Contratado" value={fmtMoney(totalContratado)} />
        <SummaryCard label="Pago" value={fmtMoney(totalPago)} />
        <SummaryCard label="A receber" value={fmtMoney(totalAReceber)} highlight />
      </div>
      {sponsors.length === 0 && <p style={{ color: MUTED_ON_RED }} className="mb-4 text-center pt-4">Nenhum patrocinador cadastrado.</p>}
      <div className="flex flex-col gap-2">
        {sponsors.map((s) => {
          const aReceber = (Number(s.valor_contratado) || 0) - (Number(s.valor_pago) || 0);
          const vencido = s.data_vencimento && s.data_vencimento < hoje && aReceber > 0;
          return (
            <button key={s.id} onClick={() => isAdmin && setEditing(s)} className="rounded-2xl p-4 text-left" style={{ background: PAPER }}>
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <div className="font-semibold truncate" style={{ color: INK }}>{s.nome}</div>
                  <div className="text-xs" style={{ color: MUTED }}>Contratado: {fmtMoney(s.valor_contratado)} · Pago: {fmtMoney(s.valor_pago)}</div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="font-semibold text-sm" style={{ color: RED_DEEP }}>{fmtMoney(aReceber)}</div>
                  <div className="text-[10px] uppercase" style={{ color: vencido ? "#c0392b" : MUTED }}>
                    {s.data_vencimento ? (vencido ? `vencido em ${s.data_vencimento}` : `vence ${s.data_vencimento}`) : "sem vencimento"}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {isAdmin && <div className="mt-4"><AddButton label="Adicionar patrocinador" onClick={() => setShowAdd(true)} /></div>}

      {showAdd && <SponsorModal onClose={() => setShowAdd(false)} onSave={onAdd} />}
      {editing && (
        <SponsorModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(s) => onUpdate(editing.id, s)}
          onDelete={() => onRemove(editing.id)}
        />
      )}
    </div>
  );
}

function SponsorModal({ initial, onClose, onSave, onDelete }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [valorContratado, setValorContratado] = useState(initial?.valor_contratado ?? "");
  const [valorPago, setValorPago] = useState(initial?.valor_pago ?? "");
  const [dataVencimento, setDataVencimento] = useState(initial?.data_vencimento || "");

  return (
    <ModalShell title={initial ? "Editar patrocinador" : "Novo patrocinador"} onClose={onClose}>
      <Field label="Nome do patrocinador">
        <input className="w-full rounded-xl px-3 py-2" style={inputStyle} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Mercadinho do Zé" />
      </Field>
      <Field label="Valor contratado (R$)">
        <input className="w-full rounded-xl px-3 py-2" style={inputStyle} value={valorContratado} onChange={(e) => setValorContratado(e.target.value.replace(/[^0-9.,]/g, ""))} placeholder="0,00" inputMode="decimal" />
      </Field>
      <Field label="Valor pago (R$)">
        <input className="w-full rounded-xl px-3 py-2" style={inputStyle} value={valorPago} onChange={(e) => setValorPago(e.target.value.replace(/[^0-9.,]/g, ""))} placeholder="0,00" inputMode="decimal" />
      </Field>
      <Field label="Data de vencimento">
        <input type="date" className="w-full rounded-xl px-3 py-2" style={inputStyle} value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} />
      </Field>
      <div className="flex gap-2 mt-2">
        {initial && (
          <button onClick={onDelete} className="px-4 py-3 rounded-xl font-medium" style={{ background: "#f1dede", color: "#a8342a" }}>
            <Trash2 size={18} />
          </button>
        )}
        <button
          onClick={() =>
            nome.trim() &&
            onSave({
              nome: nome.trim(),
              valor_contratado: Number(String(valorContratado).replace(",", ".")) || 0,
              valor_pago: Number(String(valorPago).replace(",", ".")) || 0,
              data_vencimento: dataVencimento || null,
            })
          }
          className="flex-1 py-3 rounded-xl font-semibold"
          style={{ background: RED_DEEP, color: "#fff" }}
        >
          Salv
