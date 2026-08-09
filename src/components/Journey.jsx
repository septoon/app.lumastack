import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "Заявки",
    text: "Активные, закрытые и складские заявки: сроки, статусы, детали объекта и история выполненных работ.",
    kind: "request",
  },
  {
    title: "Маршрут",
    text: "Добавляйте адреса, меняйте порядок точек, выбирайте старт и финиш, затем открывайте путь в Яндекс.Картах.",
    kind: "route",
  },
  {
    title: "На объекте",
    text: "В карточке доступны срок, адрес, клиент и оборудование. Рабочую инструкцию можно открыть рядом с данными заявки.",
    kind: "detail",
  },
  {
    title: "Пробег и топливо",
    text: "Фиксируйте пробег дня, одометр начала месяца и заправки. Отдельный раздел показывает расход и компенсацию ГСМ.",
    kind: "meter",
  },
  {
    title: "Отчёт и аналитика",
    text: "Отправляйте дневной отчёт и проверяйте историю выполненных заявок по периодам, типам работ и SLA.",
    kind: "analytics",
  },
  {
    title: "Wiki",
    text: "Ищите рабочие инструкции и статьи, открывайте материал и копируйте нужный фрагмент текста.",
    kind: "wiki",
  },
];

function Fragment({ kind }) {
  if (kind === "request") return (
    <div className="journey-fragment request-fragment" aria-hidden="true">
      <div className="fragment-toolbar"><span>Активные</span><i /></div>
      {[0, 1, 2].map((item) => <div className="request-row" key={item}><b /><span /><em /></div>)}
    </div>
  );
  if (kind === "route") return (
    <div className="journey-fragment route-fragment" aria-hidden="true">
      <span className="route-pin route-pin-a" /><span className="route-pin route-pin-b" />
      <span className="route-pin route-pin-c" />
      <svg viewBox="0 0 360 220"><path d="M50 45 C120 28 120 135 190 115 S270 75 315 170" /></svg>
      <div className="route-label">Открыть в картах</div>
    </div>
  );
  if (kind === "detail") return (
    <div className="journey-fragment detail-fragment" aria-hidden="true">
      {['Задача', 'Объект', 'Оборудование'].map((item) => <div key={item}><span>{item}</span><i /></div>)}
      <div className="detail-action">Рабочая инструкция</div>
    </div>
  );
  if (kind === "meter") return (
    <div className="journey-fragment meter-fragment" aria-hidden="true">
      <div className="meter-arc"><i /></div>
      <div className="meter-lines">
        <span>Пробег дня</span><b /><span>Одометр месяца</span><b /><span>Заправка</span><b />
      </div>
    </div>
  );
  if (kind === "analytics") return (
    <div className="journey-fragment analytics-fragment" aria-hidden="true">
      <div className="analytics-head"><span>Выполненные заявки</span><i /></div>
      <div className="analytics-bars">
        {[44, 62, 51, 78, 68, 86].map((bar) => <b key={bar} style={{ "--bar": `${bar}%` }} />)}
      </div>
      <div className="analytics-axis" />
    </div>
  );
  return (
    <div className="journey-fragment wiki-fragment" aria-hidden="true">
      <div className="wiki-search">
        <svg viewBox="0 0 24 24"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg>
        <span>Поиск по базе знаний</span>
      </div>
      {[0, 1, 2].map((item) => <div className="wiki-row" key={item}><b /><span /></div>)}
    </div>
  );
}

export default function Journey({ reducedMotion }) {
  const trackRef = useRef(null);
  const pathRef = useRef(null);
  const cursorRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const elements = [...trackRef.current.querySelectorAll("[data-journey-step]")];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(Number(visible.target.dataset.journeyStep) - 1);
    }, { rootMargin: "-30% 0px -42%", threshold: [0.1, 0.35, 0.65] });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (reducedMotion) return undefined;
    const track = trackRef.current;
    const progressPath = pathRef.current;
    const guidePath = track.querySelector(".journey-line-guide");
    const cursor = cursorRef.current;
    const length = guidePath.getTotalLength();
    progressPath.style.strokeDasharray = "1";
    progressPath.style.strokeDashoffset = "1";

    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: track,
        start: "top center",
        end: "bottom center",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => {
          progressPath.style.strokeDashoffset = String(1 - progress);
          const point = guidePath.getPointAtLength(length * progress);
          const svg = guidePath.ownerSVGElement;
          const x = (point.x / 120) * svg.clientWidth - 7;
          const y = (point.y / 1200) * svg.clientHeight - 7;
          cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        },
      });
    }, track);
    return () => context.revert();
  }, [reducedMotion]);

  return (
    <section className="journey section" id="features" aria-labelledby="journey-heading">
      <div className="container">
        <header className="section-intro reveal">
          <p className="section-index">01 / Рабочий день</p>
          <h2 id="journey-heading">От заявки до итогов дня.</h2>
          <p>Этапы связаны данными одной рабочей смены. Каждый раздел решает конкретную задачу инженера.</p>
        </header>

        <div ref={trackRef} className="journey-track">
          <svg className="journey-line" viewBox="0 0 120 1200" preserveAspectRatio="none" aria-hidden="true">
            <path className="journey-line-guide" d="M58 10 C20 105 98 170 57 270 S18 430 61 520 S100 675 58 780 S18 940 62 1030 S92 1120 58 1190" />
            <path ref={pathRef} className="journey-line-progress" pathLength="1" d="M58 10 C20 105 98 170 57 270 S18 430 61 520 S100 675 58 780 S18 940 62 1030 S92 1120 58 1190" />
          </svg>
          <span ref={cursorRef} className="journey-cursor" aria-hidden="true" />

          {steps.map((step, index) => (
            <article
              className={`journey-step reveal${index % 2 ? " journey-step-reverse" : ""}${index < active ? " is-past" : index === active ? " is-active" : " is-future"}`}
              data-journey-step={index + 1}
              key={step.title}
            >
              <div className="journey-copy">
                <span className={`journey-number${index === 4 ? " journey-number-amber" : ""}`}>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
              <Fragment kind={step.kind} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
