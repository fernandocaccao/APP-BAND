import React from "react";
import { PAPER, PAPER_ALT, INK, MUTED, MUTED_ON_RED } from "../lib/format";
import { JerseyBadge } from "../components/ui";

export default function EstatisticasTab({ players, matches }) {
  if (players.length === 0) return <p style={{ color: MUTED_ON_RED }} className="text-center pt-8">Cadastre jogadores para ver estatísticas.</p>;

  const totalJogos = matches.length;
  const rows = players
    .map((p) => {
      const presencas = matches.filter((m) => (m.presencas || {})[p.id]).length;
      const gols = matches.reduce((s, m) => s + ((m.gols || {})[p.id] || 0), 0);
      const amarelos = matches.reduce((s, m) => s + ((m.cartoes_amarelos || {})[p.id] || 0), 0);
      const vermelhos = matches.reduce((s, m) => s + ((m.cartoes_vermelhos || {})[p.id] || 0), 0);
      const pct = totalJogos > 0 ? Math.round((presencas / totalJogos) * 100) : 0;
      return { ...p, presencas, gols, amarelos, vermelhos, pct };
    })
    .sort((a, b) => b.gols - a.gols);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: PAPER }}>
      <div className="grid grid-cols-6 text-[10px] uppercase font-semibold px-2 py-2" style={{ color: MUTED, background: PAPER_ALT }}>
        <div className="col-span-2">Jogador</div>
        <div className="text-center">Presença</div>
        <div className="text-center">Gols</div>
        <div className="text-center">CA</div>
        <div className="text-center">CV</div>
      </div>
      {rows.map((r) => (
        <div key={r.id} className="grid grid-cols-6 items-center px-2 py-2 text-sm border-t" style={{ borderColor: "#eee0dd" }}>
          <div className="col-span-2 flex items-center gap-2 truncate">
            <JerseyBadge numero={r.numero} foto={r.foto_url} size={26} />
            <span className="truncate" style={{ color: INK }}>{r.nome}</span>
          </div>
          <div className="text-center" style={{ color: MUTED }}>{r.pct}%</div>
          <div className="text-center font-semibold" style={{ color: INK }}>{r.gols}</div>
          <div className="text-center" style={{ color: "#b8860b" }}>{r.amarelos}</div>
          <div className="text-center" style={{ color: "#8f1c1c" }}>{r.vermelhos}</div>
        </div>
      ))}
    </div>
  );
}
