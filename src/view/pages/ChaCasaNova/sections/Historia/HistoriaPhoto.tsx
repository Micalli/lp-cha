import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Foto do casal com interação GSAP:
 * - tilt 3D em perspectiva seguindo o cursor;
 * - parallax da imagem dentro da moldura (profundidade);
 * - ken-burns (zoom lento contínuo) quando ocioso.
 * Respeita prefers-reduced-motion.
 */
export function HistoriaPhoto({ src }: { src: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const image = imgRef.current;
    if (!frame || !image) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      // Ken-burns: zoom lento de vai e volta (mantém a imagem sempre > moldura)
      if (!reduce) {
        gsap.fromTo(
          image,
          { scale: 1.08 },
          {
            scale: 1.18,
            duration: 9,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          },
        );
      }

      if (reduce) return;

      // Tilt na moldura + parallax na imagem, suavizados
      const rotX = gsap.quickTo(frame, "rotationX", { duration: 0.6, ease: "power3" });
      const rotY = gsap.quickTo(frame, "rotationY", { duration: 0.6, ease: "power3" });
      const imgX = gsap.quickTo(image, "x", { duration: 0.7, ease: "power3" });
      const imgY = gsap.quickTo(image, "y", { duration: 0.7, ease: "power3" });

      const onMove = (e: MouseEvent) => {
        const r = frame.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        rotY(dx * 12);
        rotX(-dy * 12);
        imgX(dx * -18);
        imgY(dy * -18);
      };

      const reset = () => {
        rotX(0);
        rotY(0);
        imgX(0);
        imgY(0);
      };

      frame.addEventListener("mousemove", onMove);
      frame.addEventListener("mouseleave", reset);
      return () => {
        frame.removeEventListener("mousemove", onMove);
        frame.removeEventListener("mouseleave", reset);
      };
    }, frameRef);

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ perspective: 1000 }}>
      <div
        ref={frameRef}
        className="relative aspect-[4/5] border border-goldline bg-card p-3 shadow-[0_30px_60px_-32px_rgba(85,88,59,0.55)] [transform-style:preserve-3d]"
      >
        <div className="h-full w-full overflow-hidden">
          <img
            ref={imgRef}
            src={src}
            alt="Bruno e Hadassa"
            className="h-full w-full object-cover will-change-transform"
          />
        </div>
      </div>
    </div>
  );
}
