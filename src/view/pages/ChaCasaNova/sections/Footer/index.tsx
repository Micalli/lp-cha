import { EVENTO } from "@/app/config/constants";
import { Reveal } from "@/view/components/Reveal";

export function Footer() {
  return (
    <footer className="flex min-h-screen snap-start snap-always flex-col justify-center bg-olive-dark px-6 py-[54px] text-center">
      <Reveal>
        <div className="font-display text-[30px] tracking-[0.12em] text-cream-dim">
          {EVENTO.monograma}
        </div>
        <div className="mt-3.5 font-body text-[11px] uppercase tracking-[0.28em] text-[#A9A57F]">
          {EVENTO.dataExtenso} · {EVENTO.cidadeFooter}
        </div>
      </Reveal>
    </footer>
  );
}
