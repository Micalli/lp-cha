import { useState, type FormEvent } from "react";

type Going = "yes" | "no" | null;

interface State {
  name: string;
  going: Going;
  guests: string;
  submitted: boolean;
  submittedName: string;
  submittedGoing: Going;
}

const INITIAL: State = {
  name: "",
  going: null,
  guests: "0",
  submitted: false,
  submittedName: "",
  submittedGoing: null,
};

/**
 * Controller do RSVP: estado do formulário, seleção sim/não e submit.
 * (Aqui você plugaria o serviço real — e-mail, planilha, API...)
 */
export function useRsvpController() {
  const [state, setState] = useState<State>(INITIAL);

  const isGoing = state.going === "yes";
  const first = (state.submittedName || "").trim().split(" ")[0];

  const confirmTitle = !state.submitted
    ? ""
    : state.submittedGoing === "yes"
      ? `Que alegria, ${first}!`
      : `Sentiremos sua falta, ${first}.`;

  const confirmMsg = !state.submitted
    ? ""
    : state.submittedGoing === "yes"
      ? "Sua presença está confirmada. Mal podemos esperar para celebrar com você no dia 25 de outubro."
      : "Obrigado por avisar. Você estará em nossos pensamentos nesse dia tão especial.";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (state.going === null) return;
    setState((s) => ({
      ...s,
      submitted: true,
      submittedName: s.name,
      submittedGoing: s.going,
    }));
    // TODO: integrar com o serviço real de confirmação.
  }

  return {
    name: state.name,
    going: state.going,
    guests: state.guests,
    submitted: state.submitted,
    isGoing,
    confirmTitle,
    confirmMsg,
    setName: (name: string) => setState((s) => ({ ...s, name })),
    setGuests: (guests: string) => setState((s) => ({ ...s, guests })),
    pickYes: () => setState((s) => ({ ...s, going: "yes" })),
    pickNo: () => setState((s) => ({ ...s, going: "no" })),
    handleSubmit,
    resetForm: () => setState(INITIAL),
  };
}
