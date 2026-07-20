import { EVENTO, GUEST_OPTIONS } from "@/app/config/constants";
import { cn } from "@/app/utils/cn";
import { Reveal } from "@/view/components/Reveal";
import { useRsvpController } from "./useRsvpController";

const fieldLabel =
  "block font-body text-[12px] uppercase tracking-[0.2em] text-gold-dark";
const inputBase =
  "w-full font-body text-[18px] text-ink bg-white border border-[#C9C0A6] px-[18px] py-4";

export function Rsvp() {
  const {
    name,
    going,
    guests,
    submitted,
    isGoing,
    confirmTitle,
    confirmMsg,
    setName,
    setGuests,
    pickYes,
    pickNo,
    handleSubmit,
    resetForm,
  } = useRsvpController();

  const choiceBtn = (active: boolean, activeCls: string) =>
    cn(
      "flex-1 font-body text-[14px] uppercase tracking-[0.1em] px-3 py-4 border transition-all duration-150 cursor-pointer hover:border-gold",
      active ? activeCls : "bg-white text-ink-soft border-[#C9C0A6]",
    );

  return (
    <section className="flex min-h-screen snap-start snap-always flex-col justify-center bg-olive px-6 py-[clamp(40px,6vw,56px)]">
      <div className="mx-auto w-full max-w-[620px] text-center">
        <Reveal>
          <p className="mb-4 font-body text-xs uppercase tracking-[0.34em] text-cream-dim">
            Confirmação de presença
          </p>
          <h2 className="mb-3 font-display text-[clamp(28px,5vw,44px)] font-semibold text-cream-light">
            Você vem celebrar?
          </h2>
          <p className="mb-8 font-body text-[clamp(15px,2vw,17px)] leading-[1.7] text-[#D9D2B8]">
            Por favor, confirme até {EVENTO.rsvpPrazo}.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          {submitted ? (
            <div className="border border-goldline bg-cream-light px-[clamp(40px,6vw,72px)] py-[clamp(56px,9vw,84px)]">
              <div className="mb-4 font-display text-[clamp(30px,4vw,38px)] text-olive">
                {confirmTitle}
              </div>
              <p className="mx-auto max-w-[440px] font-body text-[18px] leading-[1.7] text-ink-soft">
                {confirmMsg}
              </p>
              <button
                onClick={resetForm}
                className="mt-7 cursor-pointer font-body text-xs uppercase tracking-[0.16em] text-gold-dark underline underline-offset-4"
              >
                Enviar outra resposta
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="border border-goldline bg-cream-light px-[clamp(40px,6vw,72px)] py-[clamp(36px,4vw,52px)] text-left"
            >
              {/* Nome */}
              <label className={cn(fieldLabel, "mb-2.5")}>Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
                className={cn(inputBase, "mb-6")}
              />

              {/* Presença */}
              <label className={cn(fieldLabel, "mb-3.5")}>
                Você vai comparecer?
              </label>
              <div className="mb-6 flex gap-3.5">
                <button
                  type="button"
                  onClick={pickYes}
                  className={choiceBtn(
                    going === "yes",
                    "bg-olive text-cream-light border-olive",
                  )}
                >
                  Sim, vou!
                </button>
                <button
                  type="button"
                  onClick={pickNo}
                  className={choiceBtn(
                    going === "no",
                    "bg-olive-dark text-cream-light border-olive-dark",
                  )}
                >
                  Não poderei
                </button>
              </div>

              {/* Acompanhantes */}
              {isGoing && (
                <div>
                  <label className={cn(fieldLabel, "mb-2.5")}>
                    Quantidade de acompanhantes
                  </label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className={cn(inputBase, "mb-6 appearance-none")}
                  >
                    {GUEST_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full cursor-pointer border border-olive bg-olive px-4 py-5 font-body text-[14px] uppercase tracking-[0.22em] text-cream-light transition-colors duration-150 hover:bg-olive-dark hover:border-olive-dark"
              >
                Confirmar presença
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
