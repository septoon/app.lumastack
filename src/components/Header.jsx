import { SiteLink, useSite } from "../SiteContent";
import { m } from "motion/react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useEffect, useRef, useState } from "react";
export const SIDESTORE_URL =
  "sidestore://source?url=https%3A%2F%2Fapp.lumastack.ru%2Fsource.json";
export const SOURCE_URL = "https://app.lumastack.ru/source.json";
export function Brand() {
  const { text: copy } = useSite();
  return (
    <SiteLink className="brand" href="/" aria-label={copy("header.8217da0e3f79", "Инженер — главная")}>
      <img src="/assets/app-icon.webp" width="40" height="40" alt="" />
      <span>{copy("header.88d71676fa80", "Инженер")}</span>
    </SiteLink>
  );
}
export default function Header() {
  const { text: copy } = useSite();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 900px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 900px)");
    const update = () => { setMobile(query.matches); if (!query.matches) setOpen(false); };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const headerRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event) => {
      if (!headerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return (
    <header ref={headerRef} className="portal-header">
      <div className="container portal-nav">
        <Brand />
        <m.button
          data-motion-button=""
          whileHover={reduced ? undefined : { scale: 1.05, backgroundColor: "#39344d" }}
          whileTap={reduced ? undefined : { scale: 0.9, rotate: open ? -4 : 4 }}
          animate={{ backgroundColor: open ? "#39344d" : "#242332", borderColor: open ? "#a9a1cc" : "#4b465e" }}
          transition={{ type: "spring", stiffness: 420, damping: 25 }}
          className="menu-button"
          type="button"
          aria-label={open ? copy("header.a7a4033657e8", "Закрыть") : copy("header.122f71765026", "Меню")}
          aria-expanded={open}
          aria-controls="portal-links"
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <svg className="menu-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <m.path initial={false} animate={{ d: open ? "M6 6L18 18" : "M4 8L20 8" }} transition={{ duration: reduced ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }} />
            <m.path initial={false} animate={{ d: open ? "M6 18L18 6" : "M8 16L20 16" }} transition={{ duration: reduced ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }} />
          </svg>
          <span>{open ? copy("header.a7a4033657e8", "Закрыть") : copy("header.122f71765026", "Меню")}</span>
        </m.button>
        <m.nav
          id="portal-links"
          initial={false}
          inert={mobile && !open ? true : undefined}
          aria-hidden={mobile && !open}
          animate={!mobile || open ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: reduced ? 0 : -12, scale: reduced ? 1 : 0.97 }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
          className={open ? "portal-links open" : "portal-links"}
          aria-label={copy("header.8fff0bba4454", "Основная навигация")}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              document.querySelector(".menu-button")?.focus();
            }
          }}
        >
          {[
            ["/", copy("header.26b855cc1660", "Приложение")],
            ["/ios", copy("header.355f5e748485", "iOS")],
            ["/android", copy("header.6d612a86bee4", "Android")],
            ["/changelog", copy("header.455471db0cfb", "Обновления")],
            ["/help", copy("header.36f798a63c92", "Помощь")],
          ].map(([url, label]) => (
            <SiteLink
              key={url}
              href={url}
              aria-current={path === url ? "page" : undefined}
            >
              {label}
            </SiteLink>
          ))}
        </m.nav>
        <SiteLink className="button button-primary header-download" href="/#download">{copy("header.b7cd6fae08d9", "Установить")}</SiteLink>
      </div>
    </header>
  );
}
