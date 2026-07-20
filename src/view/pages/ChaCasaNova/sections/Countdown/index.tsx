import { EVENTO } from "@/app/config/constants";
import { useCountdown } from "@/app/hooks/useCountdown";
import { RevealStagger, RevealItem } from "@/view/components/Reveal";

const pad = (n: number) => String(n).padStart(2, "0");

function Unidade({ value, label }: { value: string; label: string }) {
  return (
    <RevealItem className="min-w-[84px]">
      <div className="font-display text-[clamp(48px,10vw,76px)] font-semibold leading-none text-cream-light">
        {value}
      </div>
      <div className="mt-2.5 font-body text-xs uppercase tracking-[0.22em] text-label">
        {label}
      </div>
    </RevealItem>
  );
}

export function Countdown() {
  const { dias, horas, minutos, segundos } = useCountdown(EVENTO.data);

  return (
    <section className="flex min-h-screen snap-start snap-always flex-col justify-center bg-olive px-6 py-[72px] text-center">
      <p className="mb-10 font-body text-xs uppercase tracking-[0.36em] text-cream-dim">
        Contagem regressiva
      </p>
      <RevealStagger className="mx-auto flex max-w-[720px] flex-wrap justify-center gap-[clamp(18px,5vw,56px)]">
        <Unidade value={String(dias)} label={dias === 1 ? "dia" : "dias"} />
        <Unidade value={pad(horas)} label="horas" />
        <Unidade value={pad(minutos)} label="min" />
        <Unidade value={pad(segundos)} label="seg" />
      </RevealStagger>
    </section>
  );
}
