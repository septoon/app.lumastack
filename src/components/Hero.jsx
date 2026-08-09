import { useCallback, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Iphone3D from "./Iphone3D";
import { FRONT_ROTATION_Y } from "./iphoneConfig";

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ reducedMotion }) {
  const heroRef = useRef(null);
  const modelRef = useRef(null);
  const calloutRefs = useRef({});
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneUnavailable, setSceneUnavailable] = useState(false);
  const [viewportMode, setViewportMode] = useState(() => {
    if (window.innerHeight <= 740) return "short";
    if (window.innerWidth <= 700) return "mobile";
    if (window.innerWidth <= 900) return "tablet";
    return "desktop";
  });

  useLayoutEffect(() => {
    const update = () => {
      const next = window.innerHeight <= 740
        ? "short"
        : window.innerWidth <= 700
          ? "mobile"
          : window.innerWidth <= 900
            ? "tablet"
            : "desktop";
      setViewportMode(next);
    };
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  const handleAnchorsChange = useCallback((positions) => {
    Object.entries(positions).forEach(([id, position]) => {
      const callout = calloutRefs.current[id];
      if (!callout) return;
      callout.style.setProperty("--anchor-x", `${position.x.toFixed(2)}px`);
      callout.style.setProperty("--anchor-y", `${position.y.toFixed(2)}px`);
      callout.style.setProperty("--anchor-visible", position.visible ? "1" : "0");
    });
  }, []);

  const handleSceneReady = useCallback(() => {
    setSceneUnavailable(false);
    setSceneReady(true);
  }, []);

  const handleSceneUnavailable = useCallback(() => {
    setSceneUnavailable(true);
  }, []);

  useLayoutEffect(() => {
    if (!sceneReady || !modelRef.current) return undefined;

    const hero = heroRef.current;
    const caption = hero.querySelector(".hero-caption");
    const mobile = window.innerWidth <= 700;
    const tablet = window.innerWidth <= 1080;
    const initialPose = {
      rotationX: mobile ? 0.72 : tablet ? 0.8 : 0.86,
      rotationY: FRONT_ROTATION_Y - (mobile ? 0 : 0.02),
      rotationZ: mobile ? 0 : -0.015,
      scale: mobile ? 15 : tablet ? 11.7 : 20,
      x: 0,
      y: mobile ? -0.38 : tablet ? -0.22 : -0.925,
      z: 0,
    };
    const finalPose = {
      rotationX: mobile ? -0.8 : tablet ? -0.88 : -0.94,
      rotationY: FRONT_ROTATION_Y + (mobile ? 0.16 : tablet ? 0.2 : 0.22),
      rotationZ: mobile ? 0.12 : tablet ? 0.15 : 0.18,
      scale: mobile ? 10.2 : tablet ? 10.8 : 11,
      x: mobile ? 0 : tablet ? 0.03 : 0.05,
      y: 0,
      z: 0,
    };
    const pose = { ...(reducedMotion ? finalPose : initialPose) };
    const renderPose = () => modelRef.current?.setPose(pose);
    renderPose();

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(".hero-callout", { autoAlpha: 1 });
        return;
      }

      gsap.set(caption, { autoAlpha: 1, y: 0 });

      const callouts = gsap.utils.toArray(".hero-callout", hero);
      gsap.fromTo(
        callouts,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.55, stagger: 0.08, ease: "power2.out" },
      );

      gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.65,
          invalidateOnRefresh: true,
          onUpdate: ({ progress }) => {
            const captionProgress = Math.min(1, progress / 0.2);
            gsap.set(caption, {
              autoAlpha: 1 - captionProgress,
              y: -180 * captionProgress,
            });
          },
        },
      })
        .to(pose, {
          ...finalPose,
          ease: "none",
          onUpdate: renderPose,
          duration: 1,
        }, 0);
    }, hero);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("orientationchange", refresh, { passive: true });
    return () => {
      window.removeEventListener("orientationchange", refresh);
      context.revert();
    };
  }, [reducedMotion, sceneReady, viewportMode]);

  return (
    <section
      ref={heroRef}
      className={`hero hero-cinematic ${sceneUnavailable ? "is-3d-unavailable" : ""}`.trim()}
      id="top"
      aria-labelledby="hero-heading"
    >
      <div className="hero-inner">
        <h1 className="sr-only" id="hero-heading">Инженер</h1>

        <div className="hero-visual hero-3d-stage" id="hero-visual">
          <div className="hero-light" aria-hidden="true" />
          <Iphone3D
            ref={modelRef}
            mode="hero"
            fallbackScreen={0}
            onAnchorsChange={handleAnchorsChange}
            onReady={handleSceneReady}
            onUnavailable={handleSceneUnavailable}
          />

          <div
            ref={(node) => { calloutRefs.current.requests = node; }}
            className="hero-callout hero-callout-requests"
          >
            <span className="hero-callout-marker" aria-hidden="true" />
            <span className="hero-callout-label">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M8 4h8M9 2h6v4H9zM6 5h12v16H6zM9 11h6M9 15h4" />
              </svg>
              <span>Заявки на сегодня</span>
            </span>
          </div>
          <div
            ref={(node) => { calloutRefs.current.route = node; }}
            className="hero-callout hero-callout-route"
          >
            <span className="hero-callout-marker" aria-hidden="true" />
            <span className="hero-callout-label">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M5 19 9 5l6 14 4-14M4 19h16" />
              </svg>
              <span>Маршрут в Яндекс.Картах</span>
            </span>
          </div>
          <div
            ref={(node) => { calloutRefs.current.report = node; }}
            className="hero-callout hero-callout-report"
          >
            <span className="hero-callout-marker" aria-hidden="true" />
            <span className="hero-callout-label">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M7 3h8l3 3v15H7zM15 3v4h4M10 12h5M10 16h5" />
              </svg>
              <span>Дневной отчёт</span>
            </span>
          </div>
        </div>

        <p className="hero-caption">
          Активные заявки, маршрут по адресам, пробег, заправки, рабочие инструкции и дневной отчёт — в одном приложении.
        </p>
      </div>
    </section>
  );
}
