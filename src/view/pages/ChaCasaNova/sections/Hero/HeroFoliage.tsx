import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/** Uma folha em forma de amêndoa, base em (0,0) e ponta para cima (-y). */
const LEAF_PATH = "M0 0 C 8 -9 8 -23 0 -31 C -8 -23 -8 -9 0 0 Z";

/**
 * Um galho longo: caule curvo (base em 0,0, seguindo +x) com folhas
 * alternadas dos dois lados e uma folha na ponta. As folhas começam um
 * pouco à frente da base (t0) para o caule "nascer" limpo do canto.
 */
function Branch({
  length,
  count,
  stroke = 3,
}: {
  length: number;
  count: number;
  stroke?: number;
}) {
  const ctrlX = 0.5 * length;
  const ctrlY = -0.06 * length;
  const endX = length;
  const endY = 0.05 * length;

  const T0 = 0.07;
  const T1 = 0.97;

  const leaves = Array.from({ length: count }, (_, i) => {
    const t = T0 + (T1 - T0) * (i / (count - 1));
    const mt = 1 - t;
    // ponto sobre a curva quadrática (0,0) -> (ctrlX,ctrlY) -> (endX,endY)
    const x = 2 * mt * t * ctrlX + t * t * endX;
    const y = 2 * mt * t * ctrlY + t * t * endY;
    const side = i % 2 === 0 ? 1 : -1;
    const scale = 0.55 + mt * 0.8;
    const rot = side > 0 ? -30 : -150;
    return { x, y, rot, scale };
  });

  return (
    <g>
      <path
        d={`M0 0 Q ${ctrlX} ${ctrlY} ${endX} ${endY}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {leaves.map((l, i) => (
        <path
          key={i}
          className="leaf"
          d={LEAF_PATH}
          fill="currentColor"
          transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.scale})`}
        />
      ))}
      <path
        className="leaf"
        d={LEAF_PATH}
        fill="currentColor"
        transform={`translate(${endX} ${endY}) rotate(-80) scale(0.8)`}
      />
    </g>
  );
}

/**
 * Cacho de galhos que se abrem em leque a partir de uma base (0,0) que fica
 * FORA da tela — por isso os galhos parecem entrar vindos de fora. Um ramo
 * raso e bem longo varre em direção ao centro.
 */
const BRANCHES = [
  { angle: 8, length: 920, count: 25, stroke: 2.6 },
  { angle: 24, length: 800, count: 21, stroke: 3.2 },
  { angle: 40, length: 700, count: 18, stroke: 3.2 },
  { angle: 57, length: 600, count: 15, stroke: 2.6 },
  { angle: 74, length: 470, count: 12, stroke: 2.2 },
];

function FoliageCluster({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-40 -60 1000 660"
      className={className}
      fill="none"
      style={{ overflow: "visible" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {BRANCHES.map((b, i) => (
        // wrapper segura o ângulo do leque; o .sprig interno é balançado pelo GSAP
        <g key={i} transform={`rotate(${b.angle})`}>
          <g className="sprig">
            <Branch length={b.length} count={b.count} stroke={b.stroke} />
          </g>
        </g>
      ))}
    </svg>
  );
}

/**
 * Folhagem decorativa do Hero — cachos de galhos longos na cor oliva,
 * ancorados em cada canto. Animações GSAP: as folhas "brotam" ao entrar,
 * os galhos balançam continuamente e as camadas seguem o mouse (parallax).
 */
export function HeroFoliage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = rootRef.current?.parentElement;
    if (!host) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      // Entrada: folhas brotando (spread total fixo, independente da quantidade)
      gsap.from(".leaf", {
        scale: 0,
        opacity: 0,
        transformOrigin: "50% 100%",
        duration: 0.9,
        ease: "back.out(1.7)",
        stagger: { amount: 1.4, from: "random" },
        delay: 0.2,
      });

      if (reduce) return;

      // Balanço contínuo de cada galho, em torno da base (0,0) no canto
      gsap.to(".sprig", {
        rotation: 2.6,
        svgOrigin: "0 0",
        duration: 3.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        stagger: { each: 0.35, from: "random" },
      });

      // Parallax pelo mouse (duas camadas, profundidades diferentes)
      const xBack = gsap.quickTo(backRef.current, "x", { duration: 0.9, ease: "power3" });
      const yBack = gsap.quickTo(backRef.current, "y", { duration: 0.9, ease: "power3" });
      const xFront = gsap.quickTo(frontRef.current, "x", { duration: 0.6, ease: "power3" });
      const yFront = gsap.quickTo(frontRef.current, "y", { duration: 0.6, ease: "power3" });

      const onMove = (e: MouseEvent) => {
        const r = host.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        xBack(dx * 16);
        yBack(dy * 16);
        xFront(dx * 34);
        yFront(dy * 34);
      };

      host.addEventListener("mousemove", onMove);
      return () => host.removeEventListener("mousemove", onMove);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 overflow-hidden text-olive"
    >
      {/* Camada de trás (menor, mais suave) — base fora da tela, na diagonal */}
      <div ref={backRef} className="absolute inset-0 opacity-[0.28]">
        <div className="absolute right-[-70px] top-[-70px] -scale-x-100">
          <FoliageCluster className="w-[clamp(320px,44vw,700px)]" />
        </div>
        <div className="absolute bottom-[-70px] left-[-70px] -scale-y-100">
          <FoliageCluster className="w-[clamp(320px,44vw,700px)]" />
        </div>
      </div>

      {/* Camada da frente (maior, protagonista) — base fora da tela, na diagonal */}
      <div ref={frontRef} className="absolute inset-0 opacity-[0.45]">
        <div className="absolute left-[-80px] top-[-80px]">
          <FoliageCluster className="w-[clamp(440px,60vw,960px)]" />
        </div>
        <div className="absolute bottom-[-80px] right-[-80px] rotate-180">
          <FoliageCluster className="w-[clamp(440px,60vw,960px)]" />
        </div>
      </div>
    </div>
  );
}
