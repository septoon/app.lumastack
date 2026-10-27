import { useEffect, useRef, useState } from "react";
import { m, useInView } from "motion/react";
import { useReducedMotion } from "../hooks/useReducedMotion";

export default function FlowBackdrop() {
  const root = useRef(null);
  const inView = useInView(root, { margin: "80px" });
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const moving = inView && visible && !reduced;
  const loop = duration => ({ duration, repeat: moving ? Infinity : 0, ease: "easeInOut" });
  return <div ref={root} className="flow-backdrop" aria-hidden="true">
    <m.div className="flow-cloud cloud-lilac" animate={moving ? { x: [-22, 30, -22], y: [12, -26, 12], scale: [1, 1.18, 1], rotate: [-15, 20, -15] } : { x: 0, y: 0, scale: 1, rotate: 0 }} transition={loop(11)} />
    <m.div className="flow-cloud cloud-blue" animate={moving ? { x: [26, -30, 26], y: [-15, 30, -15], scale: [1.1, 0.88, 1.1] } : { x: 0, y: 0, scale: 1 }} transition={loop(14)} />
    <m.div className="flow-cloud cloud-rose" animate={moving ? { x: [-15, 25, -15], y: [20, -20, 20], opacity: [0.4, 0.75, 0.4] } : { x: 0, y: 0, opacity: 0.4 }} transition={loop(9)} />
    <svg className="flow-contours" viewBox="0 0 500 600" preserveAspectRatio="none">
      {["M-40 440C80 520 120 170 270 200S390 460 560 180", "M-60 480C100 580 130 210 280 240S430 510 560 230", "M-40 390C100 450 100 140 260 160S420 400 540 130"].map((path, index) => <m.path key={path} d={path} fill="none" stroke="currentColor" strokeWidth="1" initial={false} animate={moving ? { pathLength: [0.35, 0.85, 0.35], pathOffset: [0, 0.2, 0], opacity: [0.15, 0.5, 0.15] } : { pathLength: 1, pathOffset: 0, opacity: 0.18 }} transition={{ ...loop(8 + index * 2), delay: index * 0.4 }} />)}
    </svg>
  </div>;
}
