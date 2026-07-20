import { Hero } from "./sections/Hero";
import { Countdown } from "./sections/Countdown";
import { Historia } from "./sections/Historia";
import { Detalhes } from "./sections/Detalhes";
import { Rsvp } from "./sections/Rsvp";
import { Footer } from "./sections/Footer";

/**
 * Página do Chá de Casa Nova — apenas compõe as seções em ordem.
 * Cada seção é um componente isolado (com seu próprio controller quando tem lógica).
 */
export function ChaCasaNova() {
  return (
    <main>
      <Hero />
      <Countdown />
      <Historia />
      <Detalhes />
      <Rsvp />
      <Footer />
    </main>
  );
}
