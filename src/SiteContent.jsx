import { createContext, useContext, useMemo } from 'react';
import { m, useReducedMotion } from 'motion/react';
import { linkVisible, sectionVisible, siteText, screenshotsFor } from './siteConfig';

export const SiteContext = createContext(null);
export function useSite() {
  const site = useContext(SiteContext);
  return useMemo(() => ({
    site,
    text: (id, fallback) => siteText(site, id, fallback),
    screenshots: platform => screenshotsFor(site, platform),
    sectionVisible: id => sectionVisible(site, id),
  }), [site]);
}
export function SiteLink({ href, children, ...props }) {
  const { site } = useSite();
  const reduced = useReducedMotion();
  const button = props.className?.split(" ").includes("button");
  if (!linkVisible(site, href, window.location.pathname)) return null;
  if (typeof children === 'string' && !children.trim()) return null;
  return <m.a href={href} data-motion-link="" whileHover={reduced ? undefined : button ? { y: -3, scale: 1.015 } : { opacity: 0.75 }} whileTap={reduced ? undefined : { scale: button ? 0.97 : 0.985 }} transition={{ type: "spring", stiffness: 420, damping: 28 }} {...props}>{children}</m.a>;
}
export function SiteSection({ id, children }) {
  const { sectionVisible: visible } = useSite();
  return visible(id) ? children : null;
}
