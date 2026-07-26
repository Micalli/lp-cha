import { useEffect, useId, useRef } from "react";
import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";
import { CustomWiggle } from "gsap/CustomWiggle";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(DrawSVGPlugin, CustomEase, CustomWiggle, MotionPathPlugin);

/*
  FOLHAGEM DO HERO — "brisa em cadeia de ossos".
  Cada galho é uma cadeia de elos <g> aninhados: a rotação de cada elo se soma
  à do pai, então a base quase não sai do lugar e a ponta chiba — e um atraso
  de fase por elo transforma o balanço numa ONDA que corre da base para a ponta
  (em vez de uma rotação rígida do galho inteiro).

  INVARIANTE CRÍTICA: todo <g> que o GSAP rotaciona NÃO tem atributo transform
  (a pose de repouso mora num wrapper estático). Só assim `svgOrigin:"0 0"`
  pivota exatamente na articulação, em qualquer profundidade — e sem custo de
  getBBox. Nunca animar um nó que já traga transform="..." no JSX.

  Orçamento: ~400 folhas / ~1300 nós SVG, dos quais ~150 têm tween próprio;
  as outras ~250 folhas se movem de graça, por herança da cadeia.
*/

// ---------------------------------------------------------------- utilidades

/** Pseudoaleatório determinístico — estável entre renders e no StrictMode. */
function rnd(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Leitura de data-* à prova de NaN (um NaN no matrix apaga o elemento). */
function num(el: Element, key: string, fallback = 0): number {
  const v = Number((el as SVGElement).dataset[key]);
  return Number.isFinite(v) ? v : fallback;
}

// Eases autorais.
// 'breeze': ida rápida e acomodação longa, terminando onde começou — assim o
// tween fecha o ciclo sozinho e faz loop sem yoyo.
CustomEase.create("breeze", "M0,0 C0.14,0.28 0.2,1 0.42,1 0.66,1 0.79,0.09 1,0");
// 'gustIn': ataque quase instantâneo da rajada, com micro-overshoot.
CustomEase.create("gustIn", "M0,0 C0.06,0.52 0.14,0.92 0.3,0.97 0.5,1.03 0.72,1 1,1");
// 'petiole': a folha vira de perfil, SEGURA ~65% do ciclo e volta.
CustomEase.create(
  "petiole",
  "M0,0 C0.05,0 0.1,1 0.2,1 0.5,1 0.66,1 0.76,1 0.85,1 0.9,0 1,0",
);
// Tremular orgânico (não senoidal). Wiggle volta ao valor inicial => loop limpo.
CustomWiggle.create("leafFlutter", { wiggles: 3, type: "easeInOut" });

// ------------------------------------------------------------------ geometria

/*
  Três silhuetas de folha, TODAS simétricas em x com base em (0,0) e ponta em -y.
  A simetria é obrigatória: uma folha assimétrica desloca o pivô e desgruda do
  ramo. Largura cai da base para a ponta, como em galho real.
*/
const LEAF_VARIANTS = [
  // ovada (larga, basal)
  "M0 0 C 10 -8 10 -20 0 -27 C -10 -20 -10 -8 0 0 Z",
  // amendoada (média)
  "M0 0 C 8 -9 8 -23 0 -31 C -8 -23 -8 -9 0 0 Z",
  // lanceolada (estreita, apical)
  "M0 0 C 6 -12 6 -26 0 -36 C -6 -26 -6 -12 0 0 Z",
];

interface LeafProps {
  /** posição na curva do elo */
  x: number;
  y: number;
  /** posição relativa no galho inteiro (0 = base, 1 = ponta) */
  gt: number;
  side: 1 | -1;
  seed: number;
  full: boolean;
  /** recebe tween de tremular */
  flutter: boolean;
  /** recebe tween de torção (vira de perfil) */
  torsion: boolean;
}

/**
 * Folha em 3 camadas: wrapper ESTÁTICO (pose) > .leaf (o GSAP anima este) >
 * lâmina com a escala embutida. Assim `svgOrigin:"0 0"` no .leaf cai exatamente
 * no pecíolo, que é onde uma folha real dobra.
 */
function Leaf({ x, y, gt, side, seed, full, flutter, torsion }: LeafProps) {
  const scale = 0.55 + (1 - gt) * 0.8 + (rnd(seed) - 0.5) * 0.16;
  const jitter = (rnd(seed + 7.1) - 0.5) * 12;
  const rot = (side > 0 ? -34 - 8 * gt : -146 + 8 * gt) + jitter;
  // massa mais densa na base, mais leve na ponta — dá interior à silhueta
  const fillOpacity = Math.min(
    1,
    Math.max(0.5, 0.72 + (1 - gt) * 0.28 + (rnd(seed + 3.3) - 0.5) * 0.2),
  );
  const variant =
    LEAF_VARIANTS[gt < 0.34 ? 0 : gt > 0.72 ? 2 : 1] ?? LEAF_VARIANTS[1];
  // nervura só nas folhas grandes da camada da frente: abaixo disso o traço
  // some no antialias e vira custo puro
  const midrib = full && scale >= 1.15;

  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rot.toFixed(1)})`}>
      <g
        className="leaf"
        {...(flutter ? { "data-f": "1" } : {})}
        {...(torsion ? { "data-t": "1" } : {})}
      >
        <g transform={`scale(${scale.toFixed(3)})`}>
          <path d={variant} fill="currentColor" fillOpacity={fillOpacity.toFixed(2)} />
          {midrib && (
            <path
              d="M0 -3 L0 -22"
              fill="none"
              stroke="var(--color-cream-light)"
              strokeWidth={1.7}
              strokeOpacity={0.5}
              strokeLinecap="round"
            />
          )}
        </g>
      </g>
    </g>
  );
}

/** Distribui folhas ao longo da curva de um elo. */
function leavesOfLink(
  len: number,
  count: number,
  seg: number,
  links: number,
  seed: number,
  full: boolean,
  flutterRatio: number,
) {
  const sag = len * 0.018;
  return Array.from({ length: count }, (_, i) => {
    const t = 0.12 + (0.8 * i) / Math.max(1, count - 1);
    const mt = 1 - t;
    const x = 2 * mt * t * (len * 0.5) + t * t * len;
    const y = 2 * mt * t * sag;
    // posição no galho inteiro, não só no elo
    const gt = (seg + t) / links;
    const s = seed + i * 1.37;
    const r = rnd(s + 11.7);
    return (
      <Leaf
        key={i}
        x={x}
        y={y}
        gt={gt}
        side={i % 2 === 0 ? 1 : -1}
        seed={s}
        full={full}
        flutter={r < flutterRatio}
        torsion={r >= flutterRatio && r < flutterRatio * 1.45}
      />
    );
  });
}

interface TwigProps {
  at: number;
  len: number;
  side: 1 | -1;
  seed: number;
  full: boolean;
  gt: number;
  flutterRatio: number;
}

/** Ramo secundário: tem o próprio período de balanço, então discorda do pai. */
function Twig({ at, len, side, seed, full, gt, flutterRatio }: TwigProps) {
  const angle = side * (28 + rnd(seed) * 16);
  const n = full ? 4 : 3;
  return (
    <g transform={`translate(${at.toFixed(2)} 0) rotate(${angle.toFixed(1)})`}>
      <g className="twig">
        <path
          className="stem"
          d={`M0 0 Q ${(len * 0.5).toFixed(1)} ${(len * 0.04).toFixed(1)} ${len.toFixed(1)} 0`}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {Array.from({ length: n }, (_, i) => {
          const t = 0.24 + (0.62 * i) / Math.max(1, n - 1);
          const x = t * len;
          const y = t * (1 - t) * 2 * (len * 0.04);
          return (
            <Leaf
              key={i}
              x={x}
              y={y}
              gt={Math.min(0.95, gt + 0.1)}
              side={i % 2 === 0 ? 1 : -1}
              seed={seed + i * 2.11}
              full={full}
              flutter={rnd(seed + i * 5.3) < flutterRatio * 1.6}
              torsion={false}
            />
          );
        })}
        <Leaf
          x={len}
          y={0}
          gt={0.95}
          side={1}
          seed={seed + 40}
          full={full}
          flutter={rnd(seed + 61.3) < flutterRatio * 2.5}
          torsion={false}
        />
      </g>
    </g>
  );
}

interface LinkProps {
  seg: number;
  links: number;
  widths: number[];
  total: number;
  leafCounts: number[];
  stroke: number;
  seed: number;
  full: boolean;
  gradId: string;
  flutterRatio: number;
}

/**
 * Um elo da cadeia. Aninha o próximo elo na sua ponta, então as rotações se
 * compõem: base firme, ponta solta (movimento secundário de graça).
 */
function Link(props: LinkProps): React.ReactElement {
  const { seg, links, widths, total, leafCounts, stroke, seed, full, gradId, flutterRatio } = props;
  const len = total * (widths[seg] ?? 0.25);
  // a pose de repouso recria a curvatura original do galho; vive no wrapper
  // ESTÁTICO, deixando o .seg livre de transform (exigência do svgOrigin)
  const rest = seg === 0 ? -8 : 4.6;
  const isTip = seg === links - 1;
  const sw = stroke * (1 - 0.15 * seg);

  const body = (
    <>
      <path
        className="stem"
        d={`M0 0 Q ${(len * 0.5).toFixed(1)} ${(len * 0.018).toFixed(1)} ${len.toFixed(1)} 0`}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={sw.toFixed(2)}
        strokeLinecap="round"
      />
      {leavesOfLink(len, leafCounts[seg] ?? 4, seg, links, seed + seg * 13.7, full, flutterRatio)}
      {/* ramos secundários nos elos do meio */}
      {full && (seg === 1 || seg === 2) && (
        <Twig
          at={len * 0.55}
          len={total * 0.2}
          side={seg === 1 ? 1 : -1}
          seed={seed + seg * 31.4}
          full={full}
          gt={(seg + 0.55) / links}
          flutterRatio={flutterRatio}
        />
      )}
      {!full && seg === 1 && (
        <Twig
          at={len * 0.5}
          len={total * 0.16}
          side={1}
          seed={seed + 19.2}
          full={false}
          gt={0.7}
          flutterRatio={flutterRatio}
        />
      )}
      {/* botões dourados na ponta — únicos toques fora do oliva */}
      {full && isTip && (
        <g>
          <circle cx={len * 0.82} cy={-3.4} r={2.4} fill="var(--color-goldline)" />
          <circle cx={len * 0.9} cy={2.6} r={1.9} fill="var(--color-goldline)" />
          <circle cx={len * 0.97} cy={-1.4} r={1.6} fill="var(--color-goldline)" />
        </g>
      )}
      {/* próximo elo, articulado na ponta deste */}
      {!isTip && (
        <g transform={`translate(${len.toFixed(2)} 0)`}>
          <Link {...props} seg={seg + 1} />
        </g>
      )}
    </>
  );

  return (
    <g transform={`rotate(${rest})`}>
      <g className="seg" data-i={seg}>
        <g className="gust" data-i={seg}>
          {/* banda rápida extra só na ponta, onde uma ondulação é legível */}
          {isTip && full ? <g className="tipflex">{body}</g> : body}
        </g>
      </g>
    </g>
  );
}

interface BranchSpec {
  angle: number;
  length: number;
  stroke: number;
  leaves: number[];
}

// Camada da frente: 4 elos por galho, leque de 5 galhos.
const FRONT: BranchSpec[] = [
  { angle: 8, length: 920, stroke: 2.8, leaves: [6, 6, 5, 4] },
  { angle: 24, length: 800, stroke: 3.2, leaves: [6, 5, 5, 4] },
  { angle: 40, length: 700, stroke: 3.0, leaves: [5, 5, 4, 3] },
  { angle: 57, length: 600, stroke: 2.6, leaves: [5, 4, 4, 3] },
  { angle: 74, length: 470, stroke: 2.2, leaves: [4, 4, 3, 3] },
];

// Camada de fundo (opacidade 0.28, menor): 2 elos, menos folha, sem botão.
const BACK: BranchSpec[] = [
  { angle: 12, length: 820, stroke: 2.6, leaves: [8, 6] },
  { angle: 32, length: 700, stroke: 2.8, leaves: [7, 6] },
  { angle: 52, length: 580, stroke: 2.4, leaves: [6, 5] },
  { angle: 72, length: 450, stroke: 2.0, leaves: [5, 4] },
];

const WIDTHS_FULL = [0.34, 0.27, 0.22, 0.17];
const WIDTHS_LITE = [0.58, 0.42];

interface ClusterProps {
  className?: string;
  full: boolean;
  /** handedness: espelhos CSS invertem o sinal da rotação na tela */
  dir: 1 | -1;
  /** multiplicadores de amplitude e período (paralaxe temporal) */
  amp: number;
  per: number;
  seed: number;
  flutterRatio: number;
}

function FoliageCluster({
  className,
  full,
  dir,
  amp,
  per,
  seed,
  flutterRatio,
}: ClusterProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `stemFade-${uid}`;
  const specs = full ? FRONT : BACK;
  const widths = full ? WIDTHS_FULL : WIDTHS_LITE;

  return (
    <svg
      viewBox="-40 -60 1000 660"
      className={className}
      fill="none"
      style={{ overflow: "visible" }}
      data-cluster=""
      data-detail={full ? "full" : "lite"}
      data-dir={dir}
      data-amp={amp}
      data-per={per}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* a ponta fina do galho se dissolve no creme em vez de terminar cortada */}
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="0.12" stopColor="currentColor" stopOpacity="1" />
          <stop offset="0.86" stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {specs.map((b, i) => (
        <g key={i} transform={`rotate(${b.angle})`}>
          {/* .sprig recebe a inclinação macro da rajada (sem transform próprio) */}
          <g className="sprig" data-b={i}>
            <Link
              seg={0}
              links={widths.length}
              widths={widths}
              total={b.length}
              leafCounts={b.leaves}
              stroke={b.stroke}
              seed={seed + i * 97.3}
              full={full}
              gradId={gradId}
              flutterRatio={flutterRatio}
            />
          </g>
        </g>
      ))}
    </svg>
  );
}

// caminho do rebento à deriva — confinado à margem esquerda, nunca cruza o texto
const DRIFT_PATH =
  "M0,0 C40,60 -30,150 60,230 130,300 40,380 90,470";

/**
 * Folhagem decorativa do Hero. Camadas de profundidade com galhos longos
 * entrando pelos cantos (a origem do leque fica FORA da tela).
 */
export function HeroFoliage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const backDriftRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const frontDriftRef = useRef<HTMLDivElement>(null);
  const drifterRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const host = root?.parentElement;
    if (!root || !host) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Sem movimento: a folhagem já nasce no estado de repouso (nenhum
      // drawSVG aplicado, nenhum tween infinito criado).
      return;
    }

    // aparelho modesto → menos tweens, mesma estrutura
    const cores =
      typeof navigator !== "undefined" ? (navigator.hardwareConcurrency ?? 8) : 8;
    const lowPower = cores <= 4;

    let ctx: gsap.Context | undefined;
    let io: IntersectionObserver | undefined;
    // o valor de retorno de um callback de timeline é descartado, então a
    // remoção do listener precisa morar aqui fora para o unmount alcançá-la
    let detachPointer: (() => void) | undefined;
    let detachScroll: (() => void) | undefined;

    // Construir depois do primeiro paint: o setup faz leituras de layout e não
    // deve atrasar o FCP.
    const raf = requestAnimationFrame(() => {
      ctx = gsap.context(() => {
        const R = gsap.utils.random;
        /** tweens ambientes cujo timeScale o "barramento de vento" modula */
        const ambient: gsap.core.Tween[] = [];

        /* ---------- ENTRADA: os galhos se desenham, as folhas abrem atrás ---------- */
        const intro = gsap.timeline();
        const clusters = gsap.utils.toArray<SVGSVGElement>("[data-cluster]", root);

        clusters.forEach((svg) => {
          const branches = gsap.utils.toArray<SVGGElement>(".sprig", svg);
          branches.forEach((br, bi) => {
            // o galho raso (índice 0) lidera e é o mais lento: aponta o olhar
            // para o centro, onde estão os nomes
            const lead = bi === 0;
            const stems = gsap.utils.toArray<SVGPathElement>(".stem", br);
            // ordem do DOM == base -> ponta (a cadeia é aninhada)
            intro.fromTo(
              stems,
              // 0.4% em vez de 0%: com strokeLinecap round, zero pinta um ponto
              { drawSVG: "0% 0.4%" },
              {
                drawSVG: "0% 100%",
                duration: lead ? 0.78 : 0.6,
                ease: "power2.out",
                stagger: 0.07,
              },
              bi * 0.09,
            );
            intro.from(
              gsap.utils.toArray<SVGGElement>(".leaf", br),
              {
                // nunca exatamente 0: a matriz fica singular e o GSAP perde a
                // rotação decomposta do elemento
                scale: 0.001,
                opacity: 0,
                svgOrigin: "0 0",
                duration: 0.7,
                ease: "back.out(2)",
                // 'start' (não 'random'): o abrir persegue o traço que cresce,
                // então lê como CRESCIMENTO em vez de brilho aleatório
                stagger: { each: 0.022, from: "start" },
              },
              bi * 0.09 + 0.16,
            );
          });
        });

        /* ---------- AMBIENTE ---------- */
        // Um tween POR ELEMENTO. Fundamental: com `stagger`, o GSAP move
        // repeat/yoyo para o pai, e o conjunto inteiro passa a pulsar em bloco
        // e voltar de ré — era esse o defeito do balanço anterior.
        const startAmbient = () => {
          // compartilhado entre o IntersectionObserver e o ticker do vento
          let heroVisible = true;

          clusters.forEach((svg) => {
            const dir = num(svg, "dir", 1);
            const ampK = num(svg, "amp", 1);
            const perK = num(svg, "per", 1);
            const full = svg.dataset.detail === "full";

            gsap.utils.toArray<SVGGElement>(".sprig", svg).forEach((br) => {
              // fase própria de cada galho; os elos herdam e atrasam
              const branchPhase = R(0, 1);

              gsap.utils.toArray<SVGGElement>(".seg", br).forEach((el) => {
                const i = num(el, "i");
                const links = full ? 4 : 2;
                const t = links > 1 ? i / (links - 1) : 0;
                // amplitude cresce para a ponta; a composição da cadeia
                // multiplica o efeito
                const rot = dir * ampK * (0.42 + 1.9 * Math.pow(t, 1.5));
                // lenho grosso oscila devagar, lenho fino rápido
                const dur = (5.6 - 1.7 * t) * perK + R(-0.4, 0.4);
                const tw = gsap.to(el, {
                  rotation: rot,
                  svgOrigin: "0 0",
                  duration: dur,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1,
                });
                const cycle = dur * 2;
                // atraso de 0.19s por articulação => a onda CORRE para a ponta
                const phase =
                  ((branchPhase * cycle - 0.19 * i) % cycle + cycle) % cycle;
                tw.totalTime(phase);
                ambient.push(tw);
              });

              // ondulação rápida da ponta e balanço dos ramos secundários:
              // só na camada da frente (no fundo, a 0.28, é custo invisível)
              if (full && !lowPower) {
                gsap.utils
                  .toArray<SVGGElement>(".tipflex, .twig", br)
                  .forEach((el) => {
                    const isTwig = el.classList.contains("twig");
                    const dur = isTwig ? R(2.2, 3.4) : R(1.3, 2);
                    const tw = gsap.to(el, {
                      rotation: dir * (isTwig ? R(2.4, 4.2) : R(1.1, 1.7)),
                      svgOrigin: "0 0",
                      duration: dur,
                      // 'breeze' fecha o ciclo sozinho: loop sem yoyo
                      ease: "breeze",
                      repeat: -1,
                    });
                    tw.totalTime(R(0, dur));
                    ambient.push(tw);
                  });
              }
            });

            if (!full) return;

            // tremular individual: o pecíolo é o pivô (svgOrigin 0 0 no .leaf)
            const flutter = gsap.utils.toArray<SVGGElement>("[data-f]", svg);
            const fSet = lowPower
              ? flutter.filter((_, i) => i % 3 === 0)
              : flutter;
            fSet.forEach((el, i) => {
              const dur = R(1.9, 3.4);
              // wiggle termina onde começou => o '+=' nunca acumula deriva
              const tw = gsap.to(el, {
                rotation: `+=${R(4, 9) * (i % 2 ? -1 : 1)}`,
                svgOrigin: "0 0",
                duration: dur,
                ease: "leafFlutter",
                repeat: -1,
              });
              tw.totalTime(R(0, dur));
              ambient.push(tw);
            });

            // torção: a folha vira de perfil e SEGURA — o escurecer é ganho
            // pela geometria, não por um falso piscar de opacidade
            if (!lowPower) {
              gsap.utils.toArray<SVGGElement>("[data-t]", svg).forEach((el) => {
                const dur = R(3.6, 6.2);
                const tw = gsap.to(el, {
                  scaleX: R(0.5, 0.74),
                  svgOrigin: "0 0",
                  duration: dur,
                  ease: "petiole",
                  repeat: -1,
                });
                tw.totalTime(R(0, dur));
                ambient.push(tw);
              });
            }
          });

          /* ---------- RAJADA: uma timeline que se repete ---------- */
          // (nunca delayedCall recursivo: escaparia do gsap.context e vazaria)
          // Tudo aqui é PLANO e NUMÉRICO — um tween por elemento, com posição e
          // duração calculadas em JS. Nada de stagger nem de delay/duration como
          // função: essas formas fazem o GSAP montar timelines aninhadas e o
          // conjunto trava em estados intermediários.
          const gust = gsap.timeline({
            repeat: -1,
            repeatDelay: 10,
            delay: 5, // a primeira rajada não atropela a entrada
            onRepeat: () => {
              // Varia só o timeScale: cada rajada sopra com força e cadência
              // diferentes (o ciclo total oscila ~8s..13s).
              // NÃO mexer em repeatDelay() aqui — mutar o repeatDelay dentro do
              // onRepeat trava o playhead do GSAP em progress 1.
              gust.timeScale(R(0.8, 1.3));
            },
          });

          clusters.forEach((svg) => {
            const dir = num(svg, "dir", 1);
            const full = svg.dataset.detail === "full";
            const k = full ? 1 : 0.6;
            const links = full ? 4 : 2;

            // ATAQUE + SOLTURA da inclinação macro; o passo por galho faz a
            // frente da rajada atravessar visivelmente o leque
            gsap.utils.toArray<SVGGElement>(".sprig", svg).forEach((el, bi) => {
              const at = bi * 0.055;
              const amp = dir * k * R(0.8, 1.3);
              gust.to(
                el,
                { rotation: amp, svgOrigin: "0 0", duration: 0.7, ease: "gustIn" },
                at,
              );
              gust.to(
                el,
                {
                  rotation: 0,
                  svgOrigin: "0 0",
                  duration: 3,
                  ease: "elastic.out(1, 0.42)",
                },
                1.15 + at,
              );
            });

            // AÇOITE da cadeia: propaga base -> ponta, e a ponta chiba mais.
            // Na soltura a ponta acomoda por ÚLTIMO (follow-through).
            gsap.utils.toArray<SVGGElement>(".gust", svg).forEach((el) => {
              const i = num(el, "i");
              const t = links > 1 ? i / (links - 1) : 0;
              const amp = dir * k * (1 + 3.2 * t);
              gust.to(
                el,
                { rotation: amp, svgOrigin: "0 0", duration: 0.62, ease: "gustIn" },
                0.09 * i,
              );
              gust.to(
                el,
                {
                  rotation: 0,
                  svgOrigin: "0 0",
                  duration: 2.2 + 0.5 * i,
                  ease: "elastic.out(1, 0.36)",
                },
                1.05 + 0.09 * i,
              );
            });
          });

          /* ---------- BARRAMENTO DE VENTO ---------- */
          // Três escalares INDEPENDENTES — rajada, ponteiro e rolagem — e o
          // PRODUTO deles vira o timeScale do ambiente. Vento real não move só
          // mais longe: move mais RÁPIDO.
          // Objetos separados de propósito: cada fonte tem o seu próprio tween,
          // então um `overwrite` de uma nunca mata a tween da outra.
          const wg = { v: 1 };
          const wp = { v: 1 };
          const ws = { v: 1 };
          let applied = 1;
          const applyWind = () => {
            // teto no PRODUTO: rajada e rolagem rápida ao mesmo tempo chegariam
            // a ~3.6x, o que lê como agitação, não como brisa
            const s = Math.min(2.2, wg.v * wp.v * ws.v);
            // trocar timeScale recacheia o tween; com ~155 tweens no ambiente,
            // só vale mexer quando o valor muda de verdade
            if (Math.abs(s - applied) < 0.01) return;
            applied = s;
            for (const a of ambient) a.timeScale(s);
          };
          gust.to(wg, { v: 1.9, duration: 0.55, ease: "power2.out", onUpdate: applyWind }, 0);
          gust.to(wg, { v: 1, duration: 3.6, ease: "power1.inOut", onUpdate: applyWind }, 0.9);

          /* ---------- A ROLAGEM AGITA O AR (o canal do celular) ---------- */
          // No toque não existe pointermove sem contato, então a paralaxe e a
          // velocidade de ponteiro ficam mudas. Rolar, porém, É o gesto do
          // celular: a velocidade da rolagem entra no barramento e a folhagem
          // esvoaça mais forte enquanto a pessoa percorre o convite.
          // Vale no desktop também (roda do mouse / animação do scroll-snap).
          let lastY = window.scrollY;
          let pending = 0;
          let smooth = 1;

          // O listener só ACUMULA deslocamento — nenhuma animação aqui dentro.
          // Disparar trabalho por evento de scroll é receita de travada.
          const onScroll = () => {
            pending += Math.abs(window.scrollY - lastY);
            lastY = window.scrollY;
          };
          window.addEventListener("scroll", onScroll, { passive: true });

          // Quem consome é o ticker, sincronizado com o frame.
          const tickWind = () => {
            if (pending === 0 && smooth === 1) return; // em repouso: custo zero
            // normalizado pela altura da tela: independe do tamanho do aparelho
            const target = heroVisible
              ? 1 + Math.min(0.9, (pending / window.innerHeight) * 18)
              : 1;
            pending = 0;
            // sobe rápido, desce macio
            smooth += (target - smooth) * 0.12;
            if (Math.abs(smooth - 1) < 0.004) smooth = 1; // repouso exato
            ws.v = smooth;
            applyWind();
          };
          gsap.ticker.add(tickWind);

          detachScroll = () => {
            window.removeEventListener("scroll", onScroll);
            // gsap.ticker NÃO é rastreado pelo gsap.context: remover na mão,
            // ou o callback sobrevive ao unmount para sempre
            gsap.ticker.remove(tickWind);
          };

          /* ---------- DERIVA AUTÔNOMA DAS CAMADAS ---------- */
          // Períodos primos entre si; garante vida mesmo sem ponteiro (toque).
          const drift = (el: HTMLDivElement | null, ax: number, ay: number, px: number, py: number) => {
            if (!el) return;
            gsap.to(el, { x: ax, duration: px, ease: "sine.inOut", yoyo: true, repeat: -1 }).totalTime(R(0, px * 2));
            gsap.to(el, { y: ay, duration: py, ease: "sine.inOut", yoyo: true, repeat: -1 }).totalTime(R(0, py * 2));
          };
          drift(frontDriftRef.current, 9, 7, 23, 31);
          drift(backDriftRef.current, -5, 4, 29, 37);

          /* ---------- REBENTO À DERIVA (raro, na margem) ---------- */
          if (drifterRef.current && !lowPower) {
            const dl = gsap.timeline({ repeat: -1, repeatDelay: 34, repeatRefresh: true });
            dl.set(drifterRef.current, { opacity: 0 })
              .to(drifterRef.current, {
                motionPath: { path: DRIFT_PATH, autoRotate: false },
                duration: 9.5,
                ease: "none",
              })
              .to(drifterRef.current, { rotation: "+=300", duration: 9.5, ease: "sine.inOut" }, 0)
              .to(drifterRef.current, { opacity: 0.32, duration: 1.6 }, 0)
              .to(drifterRef.current, { opacity: 0, duration: 2.4 }, 7.1);
          }

          /* ---------- PARALAXE DE PONTEIRO ---------- */
          // Nós separados da deriva: dois tweens nunca disputam o mesmo x/y.
          const qx = frontRef.current && gsap.quickTo(frontRef.current, "x", { duration: 0.6, ease: "power3" });
          const qy = frontRef.current && gsap.quickTo(frontRef.current, "y", { duration: 0.6, ease: "power3" });
          const qr = frontRef.current && gsap.quickTo(frontRef.current, "rotation", { duration: 0.9, ease: "power3" });
          const bx = backRef.current && gsap.quickTo(backRef.current, "x", { duration: 0.9, ease: "power3" });
          const by = backRef.current && gsap.quickTo(backRef.current, "y", { duration: 0.9, ease: "power3" });

          let px = 0;
          let py = 0;
          const onMove = (e: PointerEvent) => {
            const r = host.getBoundingClientRect();
            const dx = (e.clientX - r.left) / r.width - 0.5;
            const dy = (e.clientY - r.top) / r.height - 0.5;
            qx && qx(dx * 42);
            qy && qy(dy * 42);
            qr && qr(dx * 0.76);
            bx && bx(dx * 20);
            by && by(dy * 20);
            // a velocidade do ponteiro também agita o ar
            const v = Math.min(1, Math.hypot(dx - px, dy - py) * 34);
            px = dx;
            py = dy;
            if (v > 0.35) {
              gsap.to(wp, {
                v: 1 + v * 0.7,
                duration: 0.4,
                overwrite: true,
                onUpdate: applyWind,
                onComplete: () => {
                  gsap.to(wp, { v: 1, duration: 2.2, onUpdate: applyWind });
                },
              });
            }
          };
          host.addEventListener("pointermove", onMove);
          detachPointer = () => host.removeEventListener("pointermove", onMove);

          /* ---------- PAUSA FORA DA TELA ---------- */
          // IntersectionObserver, NÃO ScrollTrigger: ScrollTrigger grava
          // scroll-behavior inline no <html>, o que anularia a regra de
          // prefers-reduced-motion do index.css e brigaria com o scroll-snap.
          io = new IntersectionObserver(
            ([entry]) => {
              const active = entry?.isIntersecting ?? true;
              heroVisible = active;
              for (const a of ambient) active ? a.resume() : a.pause();
              active ? gust.resume() : gust.pause();
            },
            { threshold: 0 },
          );
          io.observe(host);
        };

        // ambiente entra pela cauda da entrada — sem beat morto e sem que os
        // dois conjuntos disputem a mesma propriedade da mesma folha
        intro.call(startAmbient, undefined, Math.max(0, intro.duration() - 1.1));
      }, rootRef);
    });

    return () => {
      cancelAnimationFrame(raf);
      detachPointer?.();
      detachScroll?.();
      io?.disconnect();
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 overflow-hidden text-olive"
    >
      {/* CAMADA DE FUNDO — menor, mais fraca, balanço mais lento e estreito */}
      <div ref={backRef} className="absolute inset-0 opacity-[0.28] [will-change:transform]">
        <div ref={backDriftRef} className="absolute inset-0">
          {/* os espelhos CSS moram em divs dedicadas: o GSAP nunca as toca
              (uma rotação absoluta do GSAP aqui desfaria o espelho) */}
          <div className="absolute right-[-70px] top-[-70px] -scale-x-100">
            <FoliageCluster
              className="w-[clamp(320px,44vw,700px)]"
              full={false}
              dir={-1}
              amp={0.6}
              per={1.35}
              seed={17.3}
              flutterRatio={0}
            />
          </div>
          <div className="absolute bottom-[-70px] left-[-70px] -scale-y-100">
            <FoliageCluster
              className="w-[clamp(320px,44vw,700px)]"
              full={false}
              dir={-1}
              amp={0.6}
              per={1.35}
              seed={53.9}
              flutterRatio={0}
            />
          </div>
        </div>
      </div>

      {/* CAMADA DA FRENTE — maior, protagonista */}
      <div ref={frontRef} className="absolute inset-0 opacity-[0.45] [will-change:transform]">
        <div ref={frontDriftRef} className="absolute inset-0">
          <div className="absolute left-[-80px] top-[-80px]">
            <FoliageCluster
              className="w-[clamp(440px,60vw,960px)]"
              full
              dir={1}
              amp={1}
              per={1}
              seed={5.1}
              flutterRatio={0.16}
            />
          </div>
          <div className="absolute bottom-[-80px] right-[-80px] rotate-180">
            <FoliageCluster
              className="w-[clamp(440px,60vw,960px)]"
              full
              dir={1}
              amp={1}
              per={1}
              seed={71.7}
              flutterRatio={0.16}
            />
          </div>
          {/* rebento à deriva: confinado à margem, opacidade baixa */}
          <svg
            className="absolute left-[6%] top-[6%] h-[46%] w-[16%]"
            viewBox="0 0 160 500"
            fill="none"
            style={{ overflow: "visible" }}
            aria-hidden
          >
            <path
              ref={drifterRef}
              d={LEAF_VARIANTS[1]}
              fill="currentColor"
              opacity={0}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
