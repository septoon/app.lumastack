import { useId } from "react";
import { m } from "motion/react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSite } from "../SiteContent";

export default function PlatformTabs({ options, value, onChange, label }) {
  const { text: copy } = useSite();
  const reduced = useReducedMotion();
  const indicator = useId();
  return <div className="preview-tabs" role="group" aria-label={label}>
    {options.map(id => <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)}>
      {value === id && <m.span className="tab-indicator" layoutId={indicator} transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }} />}
      <span>{id === "ios" ? copy("productpreview.355f5e748485", "iOS") : copy("productpreview.6d612a86bee4", "Android")}</span>
    </button>)}
  </div>;
}
