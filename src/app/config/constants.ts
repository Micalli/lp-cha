/**
 * Dados do evento centralizados — edite aqui para personalizar a LP.
 */
export const EVENTO = {
  noivo: "Bruno",
  noiva: "Hadassa",
  monograma: "H & B  ",
  titulo: "Chá de panela",
  // Alvo da contagem regressiva — Domingo, 18 de outubro de 2026, 12h
  data: new Date(2026, 11, 8, 12, 0, 0),
  dataCurta: "08 · 11 · 2026",
  diaSemana: "Domingo",
  dataExtenso: "08 de novembro de 2026",
  horario: "às 14 horas",

  local: {
    linha1: "Rua Núncio Interlich, 69",
    linha2: "Centro — SBC (Espaço e buffet)",
    mapsUrl:
      "https://maps.app.goo.gl/w5k4uFYn1BACEtKM6",
  },
  presentesUrl: "https://www.finalfeliz.de/brunohadassa",
  rsvpPrazo: "10 de outubro de 2026",
  // Limite para confirmar (fim do dia). Após isso, o form é substituído
  // por um aviso de "confirmações encerradas". Mês é 0-indexado (9 = outubro).
  rsvpPrazoData: new Date(2026, 10, 10, 23, 59, 59),
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
