import * as XLSX from "xlsx";

export function exportarExcel({ nomeTime, players, matches, sponsors, expenses, orders }) {
  const wb = XLSX.utils.book_new();

  const wsElenco = XLSX.utils.json_to_sheet(
    players.map((p) => ({ Nome: p.nome, Numero: p.numero, Posição: p.posicao }))
  );
  XLSX.utils.book_append_sheet(wb, wsElenco, "Elenco");

  const wsPartidas = XLSX.utils.json_to_sheet(
    matches.map((m) => ({
      Data: m.data,
      Adversário: m.adversario,
      Local: m.local,
      Presentes: Object.values(m.presencas || {}).filter(Boolean).length,
      Gols: Object.values(m.gols || {}).reduce((a, b) => a + b, 0),
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsPartidas, "Partidas");

  const wsFinanceiro = XLSX.utils.json_to_sheet(
    sponsors.map((s) => ({
      Patrocinador: s.nome,
      "Valor contratado": s.valor_contratado,
      "Valor pago": s.valor_pago,
      "Valor a receber": (Number(s.valor_contratado) || 0) - (Number(s.valor_pago) || 0),
      Vencimento: s.data_vencimento,
    }))
  );
  XLSX.utils.book_append_sheet(wb, wsFinanceiro, "Financeiro");

  const wsGastos = XLSX.utils.json_to_sheet(
    expenses.map((g) => ({ Descrição: g.descricao, Categoria: g.categoria, Valor: g.valor, Data: g.data }))
  );
  XLSX.utils.book_append_sheet(wb, wsGastos, "Gastos");

  const wsPedidos = XLSX.utils.json_to_sheet(
    orders.map((o) => ({ Jogador: o.jogador, Tamanho: o.tamanho, Valor: o.valor, Status: o.status_pagamento, Data: o.data }))
  );
  XLSX.utils.book_append_sheet(wb, wsPedidos, "Pedidos");

  XLSX.writeFile(wb, `${(nomeTime || "time").replace(/\s+/g, "_")}-dados.xlsx`);
}
