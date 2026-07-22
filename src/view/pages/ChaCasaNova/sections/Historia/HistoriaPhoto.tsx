import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Foto do casal com GSAP:
 * - revelação por máscara (clip-path) disparada por ScrollTrigger ao entrar;
 * - tilt 3D em perspectiva seguindo o cursor;
 * - parallax da imagem dentro da moldura;
 * - ken-burns (zoom lento contínuo) quando ocioso.
 * Respeita prefers-reduced-motion.
 */
export function HistoriaPhoto({ src }: { src: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const mask = maskRef.current;
    const image = imgRef.current;
    if (!frame || !mask || !image) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(mask, { clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }

      // Revelação por máscara: a imagem "abre" da esquerda p/ direita quando
      // a seção entra na viewport (dispara uma vez).
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: frame,
          start: "top 82%",
          once: true,
        },
      });
      tl.fromTo(
        mask,
        { clipPath: "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.out" },
      )
        // leve empurrão de zoom que se acomoda no início do ken-burns
        .fromTo(
          image,
          { scale: 1.2 },
          { scale: 1.08, duration: 1.1, ease: "power2.out" },
          0,
        );

      // Ken-burns: zoom lento de vai e volta, começando após a revelação.
      gsap.to(image, {
        scale: 1.18,
        duration: 9,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1.1,
      });

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
        <div
          ref={maskRef}
          className="h-full w-full overflow-hidden"
          style={{ clipPath: "inset(0% 100% 0% 0%)" }}
        >
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
