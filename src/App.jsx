import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Journey from "./components/Journey";
import Showcase from "./components/Showcase";
import Tools from "./components/Tools";
import Installation from "./components/Installation";
import Automation from "./components/Automation";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import { useReducedMotion } from "./hooks/useReducedMotion";

export default function App() {
  const reducedMotion = useReducedMotion();
  const [toast, setToast] = useState("");
  const toastTimer = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("motion-reduced", reducedMotion);
    const frame = window.requestAnimationFrame(() => root.classList.add("is-ready"));
    return () => window.cancelAnimationFrame(frame);
  }, [reducedMotion]);

  useEffect(() => {
    const items = [...document.querySelectorAll(".reveal")];
    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10%", threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [reducedMotion]);

  const showToast = (message) => {
    window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  };

  return (
    <>
      <a className="skip-link" href="#content">Перейти к содержимому</a>
      <Header />
      <main id="content">
        <Hero reducedMotion={reducedMotion} />
        <Journey reducedMotion={reducedMotion} />
        <Showcase reducedMotion={reducedMotion} />
        <Tools />
        <Installation showToast={showToast} />
        <Automation />
        <FAQ showToast={showToast} />
      </main>
      <Footer />
      <div className={`toast${toast ? " is-visible" : ""}`} id="toast" role="status" aria-live="polite">
        {toast || "URL скопирован"}
      </div>
    </>
  );
}
