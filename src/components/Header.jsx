import { useEffect, useRef, useState } from "react";

export const SIDESTORE_URL = "sidestore://source?url=https%3A%2F%2Fapp.lumastack.ru%2Fsource.json";
export const SOURCE_URL = "https://app.lumastack.ru/source.json";

export function Brand({ className = "" }) {
  return (
    <a className={`brand ${className}`.trim()} href="#top" aria-label="Инженер — в начало страницы">
      <img src="/assets/app-icon.webp" width="1024" height="1024" alt="" />
      <span>Инженер</span>
    </a>
  );
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const toggleRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 42);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isOpen);

    const onKeyDown = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointerDown = (event) => {
      if (isOpen && !navRef.current?.contains(event.target)) setIsOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 900) setIsOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      document.body.classList.remove("menu-open");
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen]);

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`} id="site-header">
      <nav ref={navRef} className="nav-shell" aria-label="Основная навигация">
        <Brand />

        <div className="nav-links" id="desktop-navigation">
          <a href="#features">Приложение</a>
          <a href="#screenshots">Интерфейс</a>
          <a className="nav-install-link" href="#installation">Установка</a>
        </div>

        <a className="button button-primary nav-cta" href={SIDESTORE_URL}>
          Добавить в SideStore
        </a>

        <a className="mobile-install-link" href="#installation">Установка</a>
        <button
          ref={toggleRef}
          className="menu-toggle"
          type="button"
          aria-label={isOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((value) => !value)}
        >
          <span />
          <span />
        </button>

        <div
          className="mobile-navigation"
          id="mobile-navigation"
          data-open={isOpen}
          aria-hidden={!isOpen}
          onClick={(event) => {
            if (event.target.closest("a")) setIsOpen(false);
          }}
        >
          <a href="#features">Приложение</a>
          <a href="#screenshots">Интерфейс</a>
          <a href="#installation">Установка</a>
          <a className="button button-primary" href={SIDESTORE_URL}>
            Добавить в SideStore
          </a>
        </div>
      </nav>
    </header>
  );
}
