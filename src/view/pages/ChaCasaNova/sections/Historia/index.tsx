import { HISTORIA } from "@/app/config/constants";
import { Eyebrow } from "@/view/components/Eyebrow";
import { Reveal, RevealStagger, RevealItem } from "@/view/components/Reveal";
import img from "../../../../imgs/wedding.jpeg";

export function Historia() {
  return (
    <section className="flex min-h-screen snap-start snap-always flex-col justify-center bg-cream px-6 py-[clamp(64px,10vw,110px)]">
      <div className="mx-auto grid max-w-[980px] grid-cols-1 items-center gap-[clamp(32px,6vw,64px)] md:grid-cols-2">
        {/* Foto emoldurada */}
        <Reveal direction="right">
          <div className="relative aspect-[4/5] border border-goldline bg-card p-3">
            <div className="flex h-full w-full items-center justify-center">
              {/* Substitua por <img src="/casal.jpg" ... /> */}
            <img src={img} className="p-2"  />
            </div>
          </div>
        </Reveal>

        {/* Texto — entra elemento a elemento */}
        <RevealStagger>
          <RevealItem>
            <Eyebrow className="mb-4 block">{HISTORIA.eyebrow}</Eyebrow>
          </RevealItem>
          <RevealItem>
            <h2 className="mb-6 font-display text-[clamp(28px,4.5vw,40px)] font-semibold leading-[1.15] text-olive-dark">
              {HISTORIA.titulo}
            </h2>
          </RevealItem>
          {HISTORIA.paragrafos.map((p, i) => (
            <RevealItem key={i}>
              <p className="mb-4 font-body text-[clamp(16px,2vw,18px)] leading-[1.8] text-ink-soft [text-wrap:pretty]">
                {p}
              </p>
            </RevealItem>
          ))}
          <RevealItem>
            <p className="mt-6 font-display text-[clamp(20px,3vw,26px)] italic text-olive">
              {HISTORIA.assinatura}
            </p>
          </RevealItem>
        </RevealStagger>
      </div>
    </section>
  );
}
