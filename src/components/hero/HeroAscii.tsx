/**
 * Layer 1 of the hero moment (design §5.1): the map as real monospaced text.
 * It is the README state, so it is text — never an image — but it says nothing
 * a screen reader needs, because the vector map that replaces it is labelled.
 */
import { heroAscii } from "./heroMap";

export function HeroAscii({ visible }: { visible: boolean }) {
  return (
    <pre aria-hidden="true" className="hero__ascii" data-visible={visible ? "true" : "false"}>
      {heroAscii}
    </pre>
  );
}
