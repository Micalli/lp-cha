import { useState, type FormEvent } from "react";
import { Forminit } from "forminit";
import { EVENTO } from "@/app/config/constants";

type Status = "idle" | "loading" | "error";

interface State {
  name: string;
  guests: string;
  status: Status;
  submitted: boolean;
  submittedName: string;
}

const INITIAL: State = {
  name: "",
  guests: "0",
  status: "idle",
  submitted: false,
  submittedName: "",
};

// Instância única (form público → sem API key no client).
const forminit = new Forminit();
const FORM_ID = import.meta.env.VITE_FORMINIT_FORM_ID ?? "4sqhwvytphk";

/**
 * Controller do RSVP: estado do formulário e envio ao Forminit.
 * Quem confirma está sempre vindo — não há opção de "não".
 */
export function useRsvpController() {
  const [state, setState] = useState<State>(INITIAL);

  // Prazo encerrado → esconde o form e mostra aviso.
  const encerrado = Date.now() > EVENTO.rsvpPrazoData.getTime();

  const first = (state.submittedName || "").trim().split(" ")[0];
  const confirmTitle = state.submitted ? `Que alegria, ${first}!` : "";
  const confirmMsg = state.submitted
    ? "Sua presença está confirmada. Mal podemos esperar para celebrar com você no dia 08 de novembro."
    : "";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!state.name.trim() || state.status === "loading") return;

    setState((s) => ({ ...s, status: "loading" }));

    // Blocos enviados ao Forminit. Os `name` precisam bater com os blocos
    // configurados no form (4sqhwvytphk) — ajuste conforme o painel.
    const blocks = [
      { type: "text" as const, name: "nome", value: state.name },
      { type: "text" as const, name: "acompanhantes", value: state.guests },
    ];

    try {
      const { error } = await forminit.submit(FORM_ID, { blocks });
      if (error) {
        setState((s) => ({ ...s, status: "error" }));
        return;
      }
      setState((s) => ({
        ...s,
        status: "idle",
        submitted: true,
        submittedName: s.name,
      }));
    } catch {
      setState((s) => ({ ...s, status: "error" }));
    }
  }

  return {
    name: state.name,
    guests: state.guests,
    encerrado,
    submitted: state.submitted,
    isLoading: state.status === "loading",
    hasError: state.status === "error",
    confirmTitle,
    confirmMsg,
    setName: (name: string) => setState((s) => ({ ...s, name })),
    setGuests: (guests: string) => setState((s) => ({ ...s, guests })),
    handleSubmit,
    resetForm: () => setState(INITIAL),
  };
}
