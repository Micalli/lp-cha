/**
 * Dados do evento centralizados — edite aqui para personalizar a LP.
 */
export const EVENTO = {
  noivo: "Bruno",
  noiva: "Hadassa",
  monograma: "H & B  ",
  titulo: "Chá de casa nova",
  // Alvo da contagem regressiva — Domingo, 25 de outubro de 2026, 12h
  data: new Date(2026, 9, 25, 12, 0, 0),
  dataCurta: "25 · 10 · 2026",
  diaSemana: "Domingo",
  dataExtenso: "25 de outubro de 2026",
  horario: "as 14 horas",

  local: {
    linha1: "Rua Ana Maria, 07",
    linha2: "Montanhão — SBC (Associação dos moradores da vila mariana)",
    mapsUrl:
      "https://maps.app.goo.gl/eGR4K7dnxZB19WMPA",
  },
  presentesUrl: "https://www.finalfeliz.de/brunohadassa",
  rsvpPrazo: "5 de outubro de 2026",
  cidadeFooter: "SBC",
} as const;

export const HISTORIA = {
  eyebrow: "Nossa história",
  titulo: "Um novo capítulo, um novo lar",
  paragrafos: [
    "Depois de tantos momentos construídos juntos, chegou a hora de abrir as portas da nossa casa. Cada canto foi pensado com amor, e queremos que ele seja preenchido também pelas pessoas que amamos.",
    "Será uma tarde simples e afetuosa, para brindar a essa nova fase e celebrar ao lado de quem faz parte da nossa vida. Contamos com você.",
  ],
  assinatura: "Com carinho, Hadassa & Bruno",
} as const;

export const GUEST_OPTIONS = [
  { value: "0", label: "Vou sozinho(a)" },
  { value: "1", label: "1 acompanhante" },
  { value: "2", label: "2 acompanhantes" },
  { value: "3", label: "3 acompanhantes" },
  { value: "4", label: "4 ou mais" },
] as const;
