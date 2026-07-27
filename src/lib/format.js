export const RED_DEEP = "#7A0E13";
export const RED = "#C81E2A";
export const PAPER = "#FFFFFF";
export const PAPER_ALT = "#F6ECEA";
export const INK = "#2b2320";
export const MUTED = "#9c7f7c";
export const MUTED_ON_RED = "#e7b3b5";

export const CATEGORIAS_GASTO = [
  "Arbitragem",
  "Uniformes",
  "Campo/Aluguel",
  "Transporte",
  "Alimentação",
  "Material esportivo",
  "Outros",
];

export const TAMANHOS = ["PP", "P", "M", "G", "GG", "XG"];
export const STATUS_PAGAMENTO = ["Pago", "Parcial", "Pendente"];

export function fmtMoney(v) {
  const n = Number(v) || 0;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
