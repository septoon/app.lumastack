import { useEffect, useState } from "react";
import { m } from "motion/react";
import { useReducedMotion } from "../hooks/useReducedMotion";

export default function SiteLoader({ failed, retry, message, retryLabel }) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const moving = !reduced && visible && !failed;
  return <m.main className={`site-loader${failed ? " has-error" : ""}`} role={failed ? "alert" : "status"} aria-busy={!failed} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: reduced ? 1 : 1.025 }} transition={{ duration: 0.25 }}>
    <div className="loader-art" aria-hidden="true">
      <m.div className="loader-aura" animate={moving ? { scale: [0.9, 1.08, 0.9], opacity: [0.45, 0.8, 0.45] } : { scale: 1, opacity: 0.5 }} transition={{ duration: 3.5, repeat: moving ? Infinity : 0, ease: "easeInOut" }} />
      <m.svg className="loader-orbit orbit-outer" viewBox="0 0 200 200" animate={moving ? { rotate: [0, 360] } : { rotate: 0 }} transition={{ duration: 5, repeat: moving ? Infinity : 0, ease: "linear" }}>
        <circle className="loader-track" cx="100" cy="100" r="88" />
        <circle className="loader-arc" cx="100" cy="100" r="88" pathLength="100" strokeDasharray="20 80" />
        <circle cx="100" cy="12" r="4" fill="currentColor" stroke="none" />
      </m.svg>
      <m.svg className="loader-orbit orbit-inner" viewBox="0 0 200 200" animate={moving ? { rotate: [360, 0] } : { rotate: 0 }} transition={{ duration: 7, repeat: moving ? Infinity : 0, ease: "linear" }}>
        <circle className="loader-track" cx="100" cy="100" r="70" />
        <circle className="loader-arc" cx="100" cy="100" r="70" pathLength="100" strokeDasharray="12 88" />
      </m.svg>
      <m.div className="loader-core" animate={moving ? { scale: [0.96, 1.025, 0.96], y: [2, -2, 2] } : { scale: 1, y: 0 }} transition={{ duration: 3.5, repeat: moving ? Infinity : 0, ease: "easeInOut" }}><img src="/assets/app-icon.webp" width="72" height="72" alt="" /></m.div>
    </div>
    <p className="loader-brand">Инженер</p>
    <p className="loader-message">{message}</p>
    {failed ? <m.button className="button button-primary" onClick={retry} whileTap={reduced ? undefined : { scale: 0.97 }}>{retryLabel}</m.button> : <div className="loader-dots" aria-hidden="true">{[0, 1, 2].map(index => <m.span key={index} animate={moving ? { opacity: [0.3, 1, 0.3], y: [0, -3, 0] } : { opacity: 0.7, y: 0 }} transition={{ duration: 1.4, delay: index * 0.15, repeat: moving ? Infinity : 0 }} />)}</div>}
  </m.main>;
}
