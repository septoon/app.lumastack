import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Iphone3D from "./Iphone3D";
import { FRONT_ROTATION_Y } from "./iphoneConfig";

gsap.registerPlugin(ScrollTrigger);

const SIDE_ROTATION_Y = Math.PI * 0.5;
const SIDE_HOLD_START = 0.46;
const SIDE_HOLD_END = 0.54;

const screens = [
  {
    key: "home",
    number: "01",
    title: "Главная",
    text: "Активные заявки, точки маршрута, пробег, одометр, заправка и отправка дневного отчёта.",
  },
  {
    key: "menu",
    number: "02",
    title: "Разделы",
    text: "Заявки, автомобиль, топливо, Wiki, зарплата, трудозатраты, инвентарь и сотрудники.",
  },
  {
    key: "analytics",
    number: "03",
    title: "Аналитика",
    text: "Выполненные заявки по дням и месяцам, типам работ, SLA и статусам.",
  },
  {
    key: "wiki",
    number: "04",
    title: "Wiki",
    text: "Поиск рабочих инструкций и статей, просмотр материала и копирование текста.",
  },
];

export default function Showcase({ reducedMotion }) {
  const layoutRef = useRef(null);
  const copyRef = useRef(null);
  const modelRef = useRef(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);

  useLayoutEffect(() => {
    if (!sceneReady || !modelRef.current) return undefined;
    const copy = copyRef.current;
    const model = modelRef.current;

    const update = (progress) => {
      const phase = Math.max(0, Math.min(3, progress * 3));
      const nextActive = Math.max(0, Math.min(3, Math.round(phase)));
      const transitionProgress = phase - Math.floor(phase);
      const sideTurnProgress = transitionProgress < SIDE_HOLD_START
        ? transitionProgress / SIDE_HOLD_START
        : transitionProgress <= SIDE_HOLD_END
          ? 1
          : (1 - transitionProgress) / (1 - SIDE_HOLD_END);
      const sideProgress = sideTurnProgress * sideTurnProgress * (3 - 2 * sideTurnProgress);
      const rotationY = FRONT_ROTATION_Y + sideProgress * SIDE_ROTATION_Y;
      const screenIndex = reducedMotion
        ? nextActive
        : Math.max(0, Math.min(3, Math.floor(phase + 0.5)));
      const modelScale = window.innerWidth <= 700
        ? 17.2
        : window.innerWidth <= 900
          ? 13.2
          : 12.65;

      model.setScreen(screenIndex);
      if (layoutRef.current) {
        layoutRef.current.dataset.rotationPhase = phase.toFixed(4);
        layoutRef.current.dataset.rotationY = String(
          reducedMotion ? FRONT_ROTATION_Y : rotationY,
        );
        layoutRef.current.dataset.screenIndex = String(screenIndex);
      }
      model.setPose({
        rotationX: reducedMotion ? -0.015 : -0.015 + Math.sin(phase * Math.PI) * 0.035,
        rotationY: reducedMotion ? FRONT_ROTATION_Y : rotationY,
        rotationZ: reducedMotion ? 0 : Math.sin(phase * Math.PI * 0.5) * 0.012,
        scale: modelScale,
        y: Math.sin(phase * Math.PI) * 0.018,
      });

      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }
    };

    update(0);
    const context = gsap.context(() => {
      const steps = [...copy.querySelectorAll(".showcase-step")];
      const firstStep = steps[0];
      const lastStep = steps.at(-1);
      ScrollTrigger.create({
        trigger: copy,
        start: () => `top+=${firstStep.offsetHeight / 2} center`,
        end: () => `bottom-=${lastStep.offsetHeight / 2} center`,
        scrub: reducedMotion ? false : 0.45,
        invalidateOnRefresh: true,
        onUpdate: ({ progress }) => update(progress),
        onRefresh: ({ progress }) => update(progress),
      });
    }, layoutRef);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", refresh, { passive: true });
    document.fonts?.ready.then(refresh);
    window.requestAnimationFrame(refresh);

    return () => {
      window.removeEventListener("orientationchange", refresh);
      context.revert();
    };
  }, [reducedMotion, sceneReady]);

  return (
    <section className="showcase section" id="screenshots" aria-labelledby="showcase-heading">
      <div className="container">
        <header className="section-intro section-intro-wide reveal">
          <p className="section-index">02 / Интерфейс</p>
          <h2 id="showcase-heading">Нужный раздел — по текущей задаче.</h2>
          <p>Главный экран ведёт рабочий день. Остальные разделы открываются из единого меню.</p>
        </header>

        <div ref={layoutRef} className="showcase-layout">
          <div className="showcase-stage showcase-3d-stage" aria-hidden="true">
            <div className="showcase-progress">
              {screens.map((screen, index) => <span className={index === active ? "is-active" : ""} key={screen.key} />)}
            </div>
            <Iphone3D
              ref={modelRef}
              mode="showcase"
              fallbackScreen={active}
              onReady={() => setSceneReady(true)}
            />
          </div>

          <div ref={copyRef} className="showcase-copy">
            {screens.map((screen, index) => (
              <article
                className={`showcase-step${index < active ? " is-before" : index === active ? " is-active" : " is-after"}`}
                data-showcase-step={screen.key}
                key={screen.key}
              >
                <span>{screen.number}</span>
                <h3>{screen.title}</h3>
                <p>{screen.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
