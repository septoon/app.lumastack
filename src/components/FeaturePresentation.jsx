import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useSite } from "../SiteContent";
import FlowBackdrop from "./FlowBackdrop";
import { DeviceScreen } from "./ProductPreview";

export default function FeaturePresentation({ reducedMotion, platform = "ios" }) {
  const { text: copy, screenshots } = useSite();
  const root = useRef(null);
  const [active, setActive] = useState(0);
  const images = screenshots(platform);
  const steps = [
    [copy("app.9a7abebf0298", "Заявки и маршрут"), copy("app.1cd02d7980dd", "Откройте активные заявки, проверьте адреса и постройте маршрут в Яндекс.Картах."), images[0]],
    [copy("app.92d3172779f8", "Рабочие инструкции"), copy("app.c7e763c2819f", "Найдите нужную информацию в Wiki, пока работаете на объекте."), images.find(image => /wiki|вики/i.test(image.title)) || images[3] || images[0]],
    [copy("app.b901d703c038", "Результаты дня"), copy("app.8efde53732ab", "Соберите данные о пробеге, заправках и выполненной работе."), images.find(image => /аналитик/i.test(image.title)) || images[2] || images[0]],
  ];
  const imageKeys = platform + steps.map(step => step[2]?.id).join(",");

  useEffect(() => {
    if (reducedMotion || !images.length || !("IntersectionObserver" in window)) return;
    let alive = true;
    let media;
    const observer = new IntersectionObserver(async entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (!alive) return;
      gsap.registerPlugin(ScrollTrigger);
      media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        root.current.querySelectorAll(".chapter-copy").forEach(article => gsap.fromTo(article, { y: 36, opacity: 0.55 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: article, start: "top 88%", toggleActions: "play none none none" } }));
      });
      media.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
        const articles = root.current.querySelectorAll(".feature-chapter");
        articles.forEach((article, index) => ScrollTrigger.create({ trigger: article, start: "top 58%", end: "bottom 58%", onEnter: () => setActive(index), onEnterBack: () => setActive(index) }));
        gsap.fromTo(root.current.querySelector(".feature-device-depth"), { y: 40, rotation: -7, scale: 0.93 }, { y: -40, rotation: 6, scale: 1.04, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } });
        gsap.fromTo(root.current.querySelector(".feature-scroll-progress"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top center", end: "bottom center", scrub: true } });
      });
    }, { rootMargin: "250px" });
    observer.observe(root.current);
    return () => { alive = false; observer.disconnect(); media?.revert(); };
  }, [reducedMotion, imageKeys]);

  return <section className="container portal-section feature-presentation" id="features" aria-labelledby="features-heading">
    <div className="section-heading"><div><h2 id="features-heading">{copy("app.21580877fedc", "От заявки до отчёта")}</h2><p>{copy("app.b2a7338c8a17", "Всё, что нужно в течение смены, рядом.")}</p></div>{images.length > 0 && platform === "ios" && <span className="small-note">{copy("app.bf7a7b6c958e", "На изображениях — версия для iOS")}</span>}</div>
    <div className={`feature-scene${images.length ? "" : " without-images"}`} ref={root}>
      {images.length > 0 && <div className="feature-screen-sticky"><FlowBackdrop /><div className="feature-device-depth" aria-hidden="true"><AnimatePresence initial={false}><m.div className="feature-screen-layer" key={steps[active][2]?.id || "empty"} initial={{ opacity: 0, y: reducedMotion ? 0 : 28, scale: reducedMotion ? 1 : 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reducedMotion ? 0 : -28 }} transition={{ duration: reducedMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}>{steps[active][2] && <DeviceScreen image={steps[active][2]} platform={platform} />}</m.div></AnimatePresence></div>{platform === "android" && steps[active][2]?.isCaptionVisible !== false && <p className="feature-image-caption">{steps[active][2]?.caption}</p>}<div className="feature-progress-track" aria-hidden="true"><span className="feature-scroll-progress" /></div></div>}
      <div className="feature-chapters">{steps.map(([title, text, image], index) => <article className={`feature-chapter${active === index ? " is-current" : ""}`} key={index}>
        <div className="chapter-copy"><span className="chapter-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{text}</p></div>
        {image && <div className="chapter-mobile-visual"><div className="chapter-mobile-screen"><DeviceScreen image={image} platform={platform} /></div>{platform === "android" && image.isCaptionVisible !== false && image.caption && <p className="chapter-image-caption">{image.caption}</p>}</div>}
      </article>)}</div>
    </div>
    <div className="capability-list"><span>{copy("app.af6d4ea42203", "Автомобиль и топливо")}</span><span>{copy("app.081b7f707ebb", "Оборудование и серийные номера")}</span><span>{copy("app.f209fa398b11", "Выплаты и трудозатраты")}</span></div>
  </section>;
}
