import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { PAPER, PAPER_ALT, INK, MUTED, MUTED_ON_RED, RED, RED_DEEP, CATEGORIAS_GASTO, fmtMoney } from "../lib/format";
import { AddButton, ModalShell, Field, inputStyle } from "../components/ui";

export default function GastosTab({ expenses, isAdmin, onAdd, onRemove }) {
  const [showAdd, setShowAdd] = useState(false);
  const total = expenses.reduce((s, e) => s + (Number(e.valor) || 0), 0);
  const porCategoria = CATEGORIAS_GASTO.map((cat) => ({
    categoria: cat,
    valor: expenses.filter((e) => e.categoria === cat).reduce((s, e) => s + (Number(e.valor) || 0), 0),
  }))
    .filter((c) => c.valor > 0)
    .sort((a, b) => b.valor - a.valor);
  const maxValor = Math.max(1, ...porCategoria.map((c) => c.valor));

  return (
    <div>
      <div className="rounded-2xl p-4 mb-3" style={{ background: PAPER }}>
        <div className="text-[10px] uppercase tracking-wide" style={{ color: MUTED }}>Total gasto</div>
        <div style={{ fontFamily: "Anton", color: RED_DEEP, fontSize: 26 }}>{fmtMoney(total)}</div>
      </div>

      {porCategoria.length > 0 && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: PAPER }}>
          <div className="text-[10px] uppercase tracking-wide mb-2" style={{ color: MUTED }}>Por categoria</div>
          <div className="flex flex-col gap-2">
            {porCategoria.map((c) => (
              <div key={c.categoria}>
                <div className="flex justify-between text-xs mb-1" style={{ color: INK }}>
                  <span>{c.categoria}</span>
                  <span className="font-medium">{fmtMoney(c.valor)}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: PAPER_ALT }}>
                  <div className="h-2 rounded-full" style={{ width: `${(c.valor / maxValor) * 100}%`, background: RED }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {expenses.length === 0 ? (
        <p style={{ color: MUTED_ON_RED }} className="mb-4 text-center pt-2">Nenhum gasto lançado ainda.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {expenses.map((e) => (
            <div key={e.id} className="rounded-2xl p-3 flex items-center justify-between" style={{ background: PAPER }}>
              <div className="min-w-0">
                <div className="font-medium truncate" style={{ color: INK }}>{e.descricao}</div>
                <div className="text-xs" style={{ color: MUTED }}>{e.categoria} · {e.data || "sem data"}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="font-semibold text-sm" style={{ color: RED_DEEP }}>{fmtMoney(e.valor)}</span>
                {isAdmin && (
                  <button onClick={() => onRemove(e.id)}>
                    <Trash2 size={16} color="#c0392b" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {isAdmin && <div className="mt-4"><AddButton label="Lançar gasto" onClick={() => setShowAdd(true)} /></div>}
      {showAdd && <ExpenseModal onClose={() => setShowAdd(false)} onSave={onAdd} />}
    
