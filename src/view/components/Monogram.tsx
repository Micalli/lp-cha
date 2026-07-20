import { cn } from "@/app/utils/cn";

interface MonogramProps {
  className?: string;
}

/**
 * Brasão/monograma "B & H" — fallback vetorial elegante.
 * Para usar o brasão real, coloque `escudo.png` em /public e troque
 * este SVG por <img src="/escudo.png" ... />.
 */
export function Monogram({ className }: MonogramProps) {
  return (
    <svg
      viewBox="0 0 200 220"
      role="img"
      aria-label="Monograma Bruno e Hadassa"
      className={cn("h-auto w-[clamp(160px,26vw,240px)]", className)}
    >
      {/* Louros laterais */}
      <g
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="1.4"
        strokeLinecap="round"
      >
        <path d="M70 158 C40 150 30 120 34 92" />
        <path d="M130 158 C160 150 170 120 166 92" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={`l-${i}`}>
            <path d={`M${52 - i * 4} ${150 - i * 12} q -12 -4 -16 -14`} />
            <path d={`M${148 + i * 4} ${150 - i * 12} q 12 -4 16 -14`} />
          </g>
        ))}
      </g>

      {/* Anel */}
      <circle
        cx="100"
        cy="86"
        r="62"
        fill="var(--color-cream-light)"
        stroke="var(--color-goldline)"
        strokeWidth="1.2"
      />
      <circle
        cx="100"
        cy="86"
        r="55"
        fill="none"
        stroke="var(--color-goldline)"
        strokeWidth="0.6"
      />

      {/* Iniciais */}
      <text
        x="100"
        y="102"
        textAnchor="middle"
        fill="var(--color-olive-dark)"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600,
          fontSize: "58px",
          letterSpacing: "2px",
        }}
      >
        B
        <tspan
          fill="var(--color-gold)"
          style={{ fontStyle: "italic", fontSize: "34px" }}
          dx="2"
          dy="-2"
        >
          &amp;
        </tspan>
        <tspan dy="2">H</tspan>
      </text>
    </svg>
  );
}
