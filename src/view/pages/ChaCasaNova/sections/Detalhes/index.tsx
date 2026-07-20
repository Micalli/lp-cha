import { EVENTO } from "@/app/config/constants";
import { Eyebrow } from "@/view/components/Eyebrow";
import { LinkButton } from "@/view/components/Button";
import { Reveal, RevealStagger, RevealItem } from "@/view/components/Reveal";

export function Detalhes() {
  return (
    <section className="flex min-h-screen snap-start snap-always flex-col justify-center bg-detail px-6 py-[clamp(48px,7vw,80px)] text-center">
      <Reveal>
        <Eyebrow className="mb-4 block">O evento</Eyebrow>
        <h2 className="mb-8 font-display text-[clamp(28px,5vw,44px)] font-semibold text-olive-dark">
          Detalhes do dia
        </h2>
      </Reveal>

      {/* Cartões */}
      <RevealStagger className="mx-auto grid max-w-[900px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <RevealItem className="border border-border bg-card px-7 py-10 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_16px_40px_-16px_rgba(85,88,59,0.35)]">
          <Eyebrow className="mb-3.5 block text-[11px] tracking-[0.24em]">
            Data
          </Eyebrow>
          <div className="font-display text-[28px] leading-[1.3] text-olive-dark">
            {EVENTO.diaSemana}
          </div>
          <div className="font-display text-[22px] text-olive">
            {EVENTO.dataExtenso}
          </div>
        </RevealItem>

        <RevealItem className="border border-border bg-card px-7 py-10 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_16px_40px_-16px_rgba(85,88,59,0.35)]">
          <Eyebrow className="mb-3.5 block text-[11px] tracking-[0.24em]">
            Local
          </Eyebrow>
          <div className="font-display text-[24px] leading-[1.35] text-olive-dark">
            {EVENTO.local.linha1}
          </div>
          <div className="font-display text-[20px] text-olive">
            {EVENTO.local.linha2}
          </div>
        </RevealItem>

        <RevealItem className="flex flex-col justify-center gap-4 border border-border bg-card px-7 py-10 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_16px_40px_-16px_rgba(85,88,59,0.35)]">
          <Eyebrow className="text-[11px] tracking-[0.24em]">Como chegar</Eyebrow>
          <LinkButton
            href={EVENTO.local.mapsUrl}
            target="_blank"
            rel="noopener"
            className="mx-auto"
          >
            Abrir no mapa
          </LinkButton>
        </RevealItem>
      </RevealStagger>

      {/* Presentes */}
      <Reveal className="mx-auto mt-10 max-w-[640px] border border-border bg-card px-[clamp(36px,6vw,52px)] py-[clamp(32px,5vw,44px)] transition-all duration-300 hover:border-gold/60 hover:shadow-[0_16px_40px_-16px_rgba(85,88,59,0.35)]">
        <Eyebrow className="mb-3.5 block text-[11px] tracking-[0.24em]">
          Lista de presentes
        </Eyebrow>
        <p className="mb-7 font-display text-[clamp(20px,3vw,26px)] leading-[1.4] text-olive-dark [text-wrap:pretty]">
          Se desejar nos presentear, separamos uma listinha com carinho para o
          nosso novo lar.
        </p>
        <LinkButton
          href={EVENTO.presentesUrl}
          target="_blank"
          rel="noopener"
          variant="outline"
        >
          Ver lista de presentes
        </LinkButton>
      </Reveal>
    </section>
  );
}
