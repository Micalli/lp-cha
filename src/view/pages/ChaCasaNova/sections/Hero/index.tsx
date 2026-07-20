import { motion } from "framer-motion";
import { EVENTO } from "@/app/config/constants";
import { HeroFoliage } from "./HeroFoliage";

const heroBackground =
  "radial-gradient(120% 90% at 50% 15%, #F7F2E6 0%, #EDE5D2 55%, #E4DAC2 100%)";

export function Hero() {
  return (
    <section
      className="relative flex min-h-screen snap-start snap-always items-center justify-center px-6 py-12"
      style={{ background: heroBackground }}
    >
      {/* Folhagem oliva animada (GSAP) */}
      <HeroFoliage />

      {/* Moldura dupla */}
      <div className="pointer-events-none absolute inset-[22px] border-[1.5px] border-goldline" />
      <div className="pointer-events-none absolute inset-[30px] border-[0.75px] border-goldline" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative max-w-[760px] text-center"
      >
        <p className="mb-10 font-body text-[13px] uppercase tracking-[0.42em] text-gold-dark">
          {EVENTO.titulo}
        </p>


        <h1 className="font-display text-[clamp(34px,7vw,62px)] font-semibold uppercase leading-[1.1] tracking-[0.14em] text-olive-dark">
          {EVENTO.noiva}
        </h1>
        <div className="my-1 font-display text-[clamp(22px,4vw,34px)] italic text-gold">
          &amp;
        </div>
        <h1 className="mb-7 font-display text-[clamp(34px,7vw,62px)] font-semibold uppercase leading-[1.1] tracking-[0.14em] text-olive-dark">
          {EVENTO.noivo}
        </h1>

        <p className="mx-auto mb-9 max-w-[460px] font-body text-[clamp(16px,2.2vw,19px)] leading-[1.7] text-ink-soft [text-wrap:pretty]">
          Com muito carinho, convidamos você para celebrar conosco o começo de um
          novo lar. Sua presença é o nosso maior presente.
        </p>

        <div className="inline-flex items-center gap-5 font-display text-olive-dark">
          <span className="h-px w-10 bg-goldline" />
          <span className="text-[clamp(20px,3vw,26px)] tracking-[0.08em]">
            {EVENTO.dataCurta}
          </span>
          <span className="h-px w-10 bg-goldline" />
        </div>

        <motion.p
          className="mt-11 font-body text-[11px] uppercase tracking-[0.3em] text-gold"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          role para saber mais
        </motion.p>
      </motion.div>
    </section>
  );
}
