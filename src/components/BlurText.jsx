import { m } from "motion/react";
import { useReducedMotion } from "../hooks/useReducedMotion";

// React Bits BlurText, reduced to a single word-reveal effect.
// License: MIT + Commons Clause; public/assets/react-bits-license.txt. Source: https://github.com/DavidHDev/react-bits/tree/main/src/content/TextAnimations/BlurText
export default function BlurText({ text, delay = 0 }) {
  const reduced = useReducedMotion();
  return <span className="blur-text"><span className="sr-only">{text}</span><span aria-hidden="true">{text.split(" ").map((word, index) => <m.span className="blur-word" key={index}
    initial={reduced ? false : { opacity: 0.35, y: 20, filter: "blur(5px)" }}
    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : delay + index * 0.055, ease: [0.22, 1, 0.36, 1] }}
  >{word}{"\u00a0"}</m.span>)}</span></span>;
}
