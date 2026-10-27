import { useRef } from "react";

// Adapted from React Bits SpotlightCard (MIT + Commons Clause): https://github.com/DavidHDev/react-bits
// License notice: public/assets/react-bits-license.txt.
// Event-only variant: no global listeners, animation loops, proximity or noise.
export default function SpotlightCard({ children, className = "" }) {
  const light = useRef(null);
  const move = event => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    light.current.style.transform = `translate(${event.clientX - rect.left - 160}px, ${event.clientY - rect.top - 160}px)`;
  };
  return <article className={`spotlight-card ${className}`} onPointerMove={move}>
    <span ref={light} className="spotlight-light" aria-hidden="true" />
    {children}
  </article>;
}
