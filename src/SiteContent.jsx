import { createContext, useContext, useMemo } from 'react';
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
  if (!linkVisible(site, href, window.location.pathname)) return null;
  if (typeof children === 'string' && !children.trim()) return null;
  return <a href={href} {...props}>{children}</a>;
}
export function SiteSection({ id, children }) {
  const { sectionVisible: visible } = useSite();
  return visible(id) ? children : null;
}
