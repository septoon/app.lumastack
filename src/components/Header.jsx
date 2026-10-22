import { SiteLink, useSite } from "../SiteContent";
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
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="portal-links"
          onClick={() => setOpen(!open)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <span className="menu-glyph" aria-hidden="true"><i /><i /></span>
          <span>{open ? copy("header.a7a4033657e8", "Закрыть") : copy("header.122f71765026", "Меню")}</span>
        </button>
        <nav
          id="portal-links"
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
        </nav>
        <SiteLink className="button button-primary header-download" href="/#download">{copy("header.b7cd6fae08d9", "Установить")}</SiteLink>
      </div>
    </header>
  );
}
