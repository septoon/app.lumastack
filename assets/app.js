(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sourceURL = "https://app.lumastack.ru/source.json";
  const completedStepsKey = "engineer-install-steps";

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const ease = (value) => {
    const progress = clamp(value);
    return progress * progress * (3 - 2 * progress);
  };
  const segment = (value, from, to) => ease((value - from) / (to - from));

  let motionReduced = reducedMotion.matches;
  root.classList.toggle("motion-reduced", motionReduced);

  const markReady = () => root.classList.add("is-ready");
  const introHeroImage = document.querySelector(".phone-shot-hero img");
  if (introHeroImage?.decode) {
    Promise.race([
      introHeroImage.decode().catch(() => undefined),
      new Promise((resolve) => window.setTimeout(resolve, 500)),
    ]).then(markReady);
  } else {
    window.requestAnimationFrame(markReady);
  }

  const year = document.querySelector("#current-year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const revealItems = [...document.querySelectorAll(".reveal")];
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealQueue = [];
    const queuedReveals = new Set();
    const revealOrder = new Map(revealItems.map((item, index) => [item, index]));
    let revealInFlight = false;

    const drainRevealQueue = () => {
      if (revealInFlight || !revealQueue.length) {
        return;
      }

      revealInFlight = true;
      const item = revealQueue.shift();
      item.classList.add("is-visible");

      window.setTimeout(() => {
        revealInFlight = false;
        drainRevealQueue();
      }, 660);
    };

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || queuedReveals.has(entry.target)) {
            return;
          }

          queuedReveals.add(entry.target);
          revealQueue.push(entry.target);
          observer.unobserve(entry.target);
        });

        revealQueue.sort(
          (first, second) => revealOrder.get(first) - revealOrder.get(second),
        );
        drainRevealQueue();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  let updateHeaderState = () => {};
  const header = document.querySelector("#site-header");
  if (header) {
    updateHeaderState = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 42);
    };

    updateHeaderState();
  }

  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNavigation = document.querySelector("#mobile-navigation");
  if (menuToggle && mobileNavigation) {
    const setMenu = (isOpen, restoreFocus = false) => {
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
      mobileNavigation.dataset.open = String(isOpen);
      mobileNavigation.setAttribute("aria-hidden", String(!isOpen));
      body.classList.toggle("menu-open", isOpen);

      if (!isOpen && restoreFocus) {
        menuToggle.focus();
      }
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMenu(!isOpen);
    });

    mobileNavigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        setMenu(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false, true);
      }
    });

    document.addEventListener("click", (event) => {
      if (
        menuToggle.getAttribute("aria-expanded") === "true"
        && !event.target.closest(".nav-shell")
      ) {
        setMenu(false);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && menuToggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
      }
    });
  }

  const journeySteps = [...document.querySelectorAll("[data-journey-step]")];
  journeySteps.forEach((step, index) => {
    step.classList.toggle("is-active", index === 0);
    step.classList.toggle("is-future", index !== 0);
  });

  const showcaseSteps = [...document.querySelectorAll("[data-showcase-step]")];
  const showcaseMedia = [...document.querySelectorAll("[data-showcase-media]")];
  const showcaseProgress = [...document.querySelectorAll(".showcase-progress span")];
  const showcaseSection = document.querySelector(".showcase");
  let activeShowcaseIndex = -1;

  const activateShowcase = (key) => {
    const activeIndex = showcaseSteps.findIndex(
      (step) => step.dataset.showcaseStep === key,
    );

    if (activeIndex < 0 || activeIndex === activeShowcaseIndex) {
      return;
    }

    activeShowcaseIndex = activeIndex;

    showcaseSteps.forEach((step, index) => {
      step.classList.toggle("is-before", index < activeIndex);
      step.classList.toggle("is-active", index === activeIndex);
      step.classList.toggle("is-after", index > activeIndex);
    });

    showcaseMedia.forEach((media, index) => {
      media.classList.toggle("is-before", index < activeIndex);
      media.classList.toggle("is-active", index === activeIndex);
      media.classList.toggle("is-after", index > activeIndex);
    });

    showcaseProgress.forEach((marker, index) => {
      marker.classList.toggle("is-active", index === activeIndex);
    });
  };

  activateShowcase(showcaseSteps[0]?.dataset.showcaseStep);

  if (showcaseSection && "IntersectionObserver" in window) {
    const mediaPrewarmObserver = new IntersectionObserver(
      (entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        showcaseMedia.forEach((media) => {
          const image = media.querySelector("img");
          if (image) {
            image.loading = "eager";
            image.decode?.().catch(() => undefined);
          }
        });
        observer.disconnect();
      },
      { rootMargin: "120% 0px" },
    );

    mediaPrewarmObserver.observe(showcaseSection);
  }

  const heroVisual = document.querySelector("#hero-visual");
  const hero = document.querySelector(".hero");
  if (
    heroVisual
    && hero
    && window.matchMedia("(pointer: fine)").matches
    && !reducedMotion.matches
  ) {
    let parallaxFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pointerBounds = hero.getBoundingClientRect();

    const renderParallax = () => {
      const motionScale = motionReduced ? 0 : 1;
      heroVisual.style.setProperty("--px", `${pointerX * 10 * motionScale}px`);
      heroVisual.style.setProperty("--py", `${pointerY * 8 * motionScale}px`);
      parallaxFrame = 0;
    };

    const requestParallax = () => {
      if (!parallaxFrame) {
        parallaxFrame = window.requestAnimationFrame(renderParallax);
      }
    };

    hero.addEventListener(
      "pointerenter",
      () => {
        pointerBounds = hero.getBoundingClientRect();
      },
      { passive: true },
    );

    hero.addEventListener(
      "pointermove",
      (event) => {
        pointerX = (event.clientX - pointerBounds.left) / pointerBounds.width - 0.5;
        pointerY = (event.clientY - pointerBounds.top) / pointerBounds.height - 0.5;
        requestParallax();
      },
      { passive: true },
    );

    hero.addEventListener("pointerleave", () => {
      pointerX = 0;
      pointerY = 0;
      requestParallax();
    });
  }

  const heroCopy = hero?.querySelector(".hero-copy");
  const heroPhone = hero?.querySelector(".phone-shot-hero");
  const heroScreen = heroPhone?.querySelector("img");
  const heroLight = hero?.querySelector(".hero-light");
  const heroRoute = hero?.querySelector(".hero-route");
  const heroRoutePath = heroRoute?.querySelector("path");
  const heroNext = hero?.querySelector(".hero-next");
  const heroCallouts = {
    requests: hero?.querySelector(".hero-callout-requests"),
    route: hero?.querySelector(".hero-callout-route"),
    report: hero?.querySelector(".hero-callout-report"),
  };

  heroRoutePath?.setAttribute("pathLength", "1");

  const journeySection = document.querySelector(".journey");
  const journeyTrack = document.querySelector(".journey-track");
  const journeyLine = document.querySelector(".journey-line");
  const journeyPath = journeyLine?.querySelector("path");
  let journeyProgressPath = null;
  let journeyCursor = null;

  if (journeyLine && journeyPath && journeyTrack) {
    journeyProgressPath = journeyPath.cloneNode();
    journeyProgressPath.classList.add("journey-line-progress");
    journeyProgressPath.setAttribute("pathLength", "1");
    journeyLine.append(journeyProgressPath);

    journeyCursor = document.createElement("span");
    journeyCursor.className = "journey-cursor";
    journeyCursor.setAttribute("aria-hidden", "true");
    journeyTrack.append(journeyCursor);
  }

  const showcasePhone = document.querySelector(".showcase-phone");
  const showcaseSamples = showcaseSteps.map((step) => step.querySelector(".mobile-screen-sample"));

  const motionMetrics = {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    hero: { start: 0, range: 1, top: 0, height: 1 },
    journey: {
      top: 0,
      height: 1,
      centers: [],
      lineLeft: 0,
      lineWidth: 1,
      lineHeight: 1,
      pathLength: 1,
      viewBoxWidth: 120,
      viewBoxHeight: 1200,
    },
    showcase: { top: 0, height: 1, centers: [] },
  };

  const pageTop = (element) => {
    let top = 0;
    let node = element;

    while (node) {
      top += node.offsetTop || 0;
      node = node.offsetParent;
    }

    return top;
  };

  const interpolateIndex = (centers, position) => {
    if (centers.length < 2 || position <= centers[0]) {
      return 0;
    }

    for (let index = 0; index < centers.length - 1; index += 1) {
      if (position <= centers[index + 1]) {
        const distance = centers[index + 1] - centers[index] || 1;
        return index + clamp((position - centers[index]) / distance);
      }
    }

    return centers.length - 1;
  };

  let activeJourneyIndex = -1;
  let heroWasActive = false;
  let journeyWasActive = false;
  let showcaseWasActive = false;
  let motionFrame = 0;
  let motionNeedsMeasure = true;
  let latestScrollY = window.scrollY;
  let lastHeroProgress = Number.NaN;
  let lastJourneyProgress = Number.NaN;
  let lastShowcasePosition = Number.NaN;
  let heroMotionPhase = "";

  const measureMotionScenes = () => {
    motionMetrics.viewportWidth = window.innerWidth;
    motionMetrics.viewportHeight = window.innerHeight;

    const viewportHeight = motionMetrics.viewportHeight;

    if (hero && heroVisual) {
      const heroTop = pageTop(hero);
      const heroHeight = hero.offsetHeight;
      const stackedHero = motionMetrics.viewportWidth <= 900;
      const sceneStart = heroTop;
      const sceneEnd = heroTop + heroHeight - viewportHeight;

      motionMetrics.hero = {
        top: heroTop,
        height: heroHeight,
        start: sceneStart,
        range: Math.max(viewportHeight * 0.65, sceneEnd - sceneStart),
      };
    }

    if (journeySection && journeyTrack) {
      const trackRect = journeyTrack.getBoundingClientRect();
      const lineRect = journeyLine?.getBoundingClientRect();
      const viewBox = journeyLine?.viewBox?.baseVal;

      motionMetrics.journey = {
        top: pageTop(journeySection),
        height: journeySection.offsetHeight,
        centers: journeySteps.map((step) => pageTop(step) + step.offsetHeight / 2),
        lineLeft: lineRect ? lineRect.left - trackRect.left : 0,
        lineWidth: lineRect?.width || 1,
        lineHeight: lineRect?.height || journeyTrack.offsetHeight || 1,
        pathLength: journeyPath?.getTotalLength?.() || 1,
        viewBoxWidth: viewBox?.width || 120,
        viewBoxHeight: viewBox?.height || 1200,
      };
    }

    if (showcaseSection) {
      motionMetrics.showcase = {
        top: pageTop(showcaseSection),
        height: showcaseSection.offsetHeight,
        centers: showcaseSteps.map((step) => pageTop(step) + step.offsetHeight / 2),
      };
    }

    lastHeroProgress = Number.NaN;
    lastJourneyProgress = Number.NaN;
    lastShowcasePosition = Number.NaN;
    motionNeedsMeasure = false;
  };

  const setSceneActivity = (element, active, previous) => {
    if (element && active !== previous) {
      element.classList.toggle("is-motion-active", active);
    }
    return active;
  };

  const setCalloutState = (element, state) => {
    if (!element) {
      return;
    }

    element.style.transform = `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 120px) scale(${state.scale.toFixed(4)})`;
    element.style.opacity = state.opacity.toFixed(4);
    element.style.setProperty("--callout-crop-opacity", state.crop.toFixed(4));
    element.style.setProperty(
      "--callout-crop-scale",
      (0.88 + state.crop * 0.12).toFixed(4),
    );
    element.style.setProperty("--callout-line-scale", state.line.toFixed(4));
  };

  const stageVisibility = (progress, enterFrom, enterTo, exitFrom, exitTo) => {
    const entrance = segment(progress, enterFrom, enterTo);
    const exit = segment(progress, exitFrom, exitTo);
    return {
      entrance,
      exit,
      visibility: entrance * (1 - exit),
    };
  };

  const renderHeroScene = (scrollY) => {
    if (!hero || !heroVisual || !heroPhone || !heroCopy || !heroScreen) {
      return;
    }

    const { viewportWidth, viewportHeight } = motionMetrics;
    const { start, range } = motionMetrics.hero;
    const progress = motionReduced ? 0 : clamp((scrollY - start) / range);
    const zoom = segment(progress, 0, 0.14);
    const request = segment(progress, 0.12, 0.36);
    const route = segment(progress, 0.36, 0.62);
    const result = segment(progress, 0.62, 0.86);
    const gather = segment(progress, 0.86, 1);
    const requestStage = stageVisibility(progress, 0.08, 0.13, 0.33, 0.38);
    const routeStage = stageVisibility(progress, 0.34, 0.39, 0.59, 0.64);
    const reportStage = stageVisibility(progress, 0.6, 0.65, 0.84, 0.9);
    const focus = segment(progress, 0.06, 0.28);
    const stackedHero = viewportWidth <= 900;
    const mobileEntrance = stackedHero
      ? 1 - segment(progress, 0.02, 0.16)
      : 0;
    const copyFocus = stackedHero
      ? segment(progress, 0.03, 0.18)
      : focus;
    const mobileStageY = viewportHeight * 0.7 * mobileEntrance;
    const baseTranslate = stackedHero ? -50 : -44;
    const baseRotate = stackedHero ? 2 : 2.8;
    const maxShift = stackedHero ? 0 : Math.min(viewportWidth * 0.16, 260);
    const phoneX = -maxShift * focus * (1 - gather * 0.8);
    const phoneY = mobileStageY - 18 * request - 10 * route + 8 * result + 18 * gather;
    const phoneScale = 1 + 0.07 * zoom + 0.055 * request - 0.02 * route
      - 0.03 * result - 0.04 * gather;
    const rotateX = -1.1 * request + 1.25 * result;
    const rotateY = 2.2 * request - 3.2 * route + 1.1 * result;
    const rotateZ = baseRotate - 1.2 * request - 1.8 * route
      + 1.1 * result + 0.9 * gather;
    const screenScale = 1 + 0.085 * request + 0.045 * route
      - 0.075 * result - 0.04 * gather;
    const screenY = -22 * request - 36 * route + 28 * result;
    const resultOpacity = clamp(result * 0.96 + gather * 0.04);
    const copyOpacity = clamp(1 - copyFocus * (stackedHero ? 1 : 0.82));
    const copyX = -Math.min(viewportWidth * 0.055, 74) * copyFocus;
    const routeDraw = clamp(route * (1 - gather * 0.82));
    const sceneActive = scrollY > start - viewportHeight
      && scrollY < start + range + viewportHeight;

    heroWasActive = setSceneActivity(hero, sceneActive, heroWasActive);
    if (!sceneActive && Math.abs(progress - lastHeroProgress) < 0.0001) {
      return;
    }
    lastHeroProgress = progress;

    const nextHeroMotionPhase = progress < 0.38
      ? "request"
      : progress < 0.64
        ? "route"
        : progress < 0.9
          ? "report"
          : "gather";
    if (nextHeroMotionPhase !== heroMotionPhase) {
      heroMotionPhase = nextHeroMotionPhase;
      hero.dataset.motionPhase = nextHeroMotionPhase;
    }

    heroCopy.style.opacity = copyOpacity.toFixed(4);
    heroCopy.style.transform = `translate3d(${copyX.toFixed(2)}px, ${(-16 * copyFocus).toFixed(2)}px, 0) scale(${(1 - copyFocus * 0.024).toFixed(4)})`;

    heroPhone.style.transform = `translate(${baseTranslate}%, -49%) translate3d(${phoneX.toFixed(2)}px, ${phoneY.toFixed(2)}px, 70px) rotateX(${rotateX.toFixed(3)}deg) rotateY(${rotateY.toFixed(3)}deg) rotateZ(${rotateZ.toFixed(3)}deg) scale(${phoneScale.toFixed(4)})`;
    heroPhone.style.setProperty("--result-screen-opacity", resultOpacity.toFixed(4));
    heroPhone.style.setProperty("--result-screen-scale", (1.055 - resultOpacity * 0.055).toFixed(4));
    heroScreen.style.opacity = (1 - resultOpacity * 0.88).toFixed(4);
    heroScreen.style.transform = `translate3d(0, ${screenY.toFixed(2)}px, 0) scale(${screenScale.toFixed(4)})`;

    if (heroLight) {
      heroLight.style.opacity = clamp(0.46 + focus * 0.42 - gather * 0.26).toFixed(4);
      heroLight.style.transform = `translate3d(calc(-50% + ${(phoneX * 0.34).toFixed(2)}px), ${(mobileStageY * 0.72 - 12 * request + 10 * result).toFixed(2)}px, 0) scale(${(1 + focus * 0.12).toFixed(4)})`;
    }

    if (heroRoutePath) {
      heroRoutePath.style.strokeDashoffset = (1 - routeDraw).toFixed(4);
    }
    if (heroRoute) {
      heroRoute.style.opacity = clamp(0.08 + route * 0.58 + result * 0.18 - gather * 0.84).toFixed(4);
    }
    if (heroNext) {
      heroNext.style.opacity = (1 - segment(progress, 0.02, 0.1)).toFixed(4);
    }

    setCalloutState(heroCallouts.requests, {
      x: phoneX + 18 - 28 * requestStage.entrance + 52 * requestStage.exit,
      y: mobileStageY + 10 - 18 * requestStage.entrance + 16 * requestStage.exit,
      scale: 0.94 + 0.08 * requestStage.entrance - 0.08 * requestStage.exit,
      opacity: requestStage.visibility,
      crop: requestStage.visibility * request,
      line: requestStage.visibility,
    });

    setCalloutState(heroCallouts.route, {
      x: phoneX - 18 + 28 * routeStage.entrance - 52 * routeStage.exit,
      y: mobileStageY + 8 - 20 * routeStage.entrance + 14 * routeStage.exit,
      scale: 0.94 + 0.08 * routeStage.entrance - 0.08 * routeStage.exit,
      opacity: routeStage.visibility,
      crop: routeStage.visibility * route,
      line: routeStage.visibility,
    });

    setCalloutState(heroCallouts.report, {
      x: phoneX - 18 + 28 * reportStage.entrance + 52 * reportStage.exit,
      y: mobileStageY + 12 - 22 * reportStage.entrance - 18 * reportStage.exit,
      scale: 0.94 + 0.08 * reportStage.entrance - 0.08 * reportStage.exit,
      opacity: reportStage.visibility,
      crop: reportStage.visibility * result,
      line: reportStage.visibility,
    });
  };

  const renderJourneyScene = (scrollY) => {
    if (!journeySection || !journeyTrack || !journeySteps.length) {
      return;
    }

    const { viewportHeight } = motionMetrics;
    const metrics = motionMetrics.journey;
    const viewCenter = scrollY + viewportHeight * 0.52;
    const firstCenter = metrics.centers[0] || metrics.top;
    const lastCenter = metrics.centers.at(-1) || metrics.top + metrics.height;
    const progress = clamp((viewCenter - firstCenter) / Math.max(1, lastCenter - firstCenter));
    const sceneActive = scrollY > metrics.top - viewportHeight
      && scrollY < metrics.top + metrics.height;

    journeyWasActive = setSceneActivity(
      journeySection,
      sceneActive,
      journeyWasActive,
    );
    if (!sceneActive && Math.abs(progress - lastJourneyProgress) < 0.0001) {
      return;
    }
    lastJourneyProgress = progress;

    let nearestIndex = 0;
    let nearestDistance = Infinity;
    metrics.centers.forEach((center, index) => {
      const distance = Math.abs(center - viewCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    if (nearestIndex !== activeJourneyIndex) {
      activeJourneyIndex = nearestIndex;
      journeySteps.forEach((step, index) => {
        step.classList.toggle("is-past", index < nearestIndex);
        step.classList.toggle("is-active", index === nearestIndex);
        step.classList.toggle("is-future", index > nearestIndex);
      });
    }

    if (journeyProgressPath) {
      journeyProgressPath.style.strokeDashoffset = (1 - progress).toFixed(4);
    }

    if (journeyCursor && journeyPath) {
      const point = journeyPath.getPointAtLength(metrics.pathLength * progress);
      const x = metrics.lineLeft
        + (point.x / metrics.viewBoxWidth) * metrics.lineWidth - 7;
      const y = (point.y / metrics.viewBoxHeight) * metrics.lineHeight - 7;
      journeyCursor.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    }

    journeySteps.forEach((step, index) => {
      const center = metrics.centers[index] || viewCenter;
      const local = clamp(1 - Math.abs(center - viewCenter) / (viewportHeight * 0.72));
      const isPast = index < nearestIndex;
      const isActive = index === nearestIndex;
      const opacity = isActive
        ? 1
        : isPast
          ? 0.68 + local * 0.2
          : 0;
      const copy = step.querySelector(".journey-copy");
      const fragment = step.querySelector(".journey-fragment");
      const direction = index % 2 ? -1 : 1;

      if (copy) {
        copy.style.opacity = opacity.toFixed(4);
        copy.style.transform = `translate3d(0, ${((1 - local) * 16).toFixed(2)}px, 0)`;
      }
      if (fragment) {
        fragment.style.opacity = (
          isActive || isPast ? clamp(opacity + 0.06) : 0
        ).toFixed(4);
        fragment.style.transform = `perspective(1200px) translate3d(0, ${((1 - local) * 22 - local * 6).toFixed(2)}px, 0) rotateY(${(direction * (1 - local) * 1.4).toFixed(3)}deg) scale(${(0.965 + local * 0.035).toFixed(4)})`;
      }
    });
  };

  const renderShowcaseScene = (scrollY) => {
    if (!showcaseSection || !showcaseSteps.length || !showcaseMedia.length) {
      return;
    }

    const { viewportHeight } = motionMetrics;
    const metrics = motionMetrics.showcase;
    const viewCenter = scrollY + viewportHeight * 0.5;
    const floatIndex = interpolateIndex(metrics.centers, viewCenter);
    const nearestIndex = Math.round(floatIndex);
    const sceneActive = scrollY > metrics.top - viewportHeight
      && scrollY < metrics.top + metrics.height;

    showcaseWasActive = setSceneActivity(
      showcaseSection,
      sceneActive,
      showcaseWasActive,
    );
    if (!sceneActive && Math.abs(floatIndex - lastShowcasePosition) < 0.0001) {
      return;
    }
    lastShowcasePosition = floatIndex;
    activateShowcase(showcaseSteps[nearestIndex]?.dataset.showcaseStep);

    showcaseMedia.forEach((media, index) => {
      const delta = index - floatIndex;
      const distance = Math.abs(delta);
      const isFocused = index === nearestIndex;
      const visibility = isFocused ? 1 : 0;
      const x = delta * 82;
      const z = isFocused ? -distance * 90 : -240 - distance * 90;
      const rotateY = -delta * 8.5;
      const scale = 0.965 - distance * 0.035 + visibility * 0.035;
      const image = media.querySelector("img");

      media.style.opacity = visibility.toFixed(4);
      media.style.zIndex = isFocused ? "100" : "0";
      media.style.transform = `translate3d(${x.toFixed(2)}px, 0, ${z.toFixed(2)}px) rotateY(${rotateY.toFixed(3)}deg) scale(${scale.toFixed(4)})`;
      media.style.willChange = sceneActive && isFocused
        ? "transform"
        : "auto";

      if (image) {
        image.style.transform = `translate3d(${(-delta * 7).toFixed(2)}px, ${(distance * 5).toFixed(2)}px, 0) scale(${(1 + visibility * 0.055).toFixed(4)})`;
      }
    });

    const fractional = floatIndex - nearestIndex;
    if (showcasePhone) {
      showcasePhone.style.transform = `perspective(1500px) rotateX(${(Math.abs(fractional) * 1.1).toFixed(3)}deg) rotateY(${(-fractional * 3.2).toFixed(3)}deg) scale(${(1 + (1 - Math.abs(fractional)) * 0.012).toFixed(4)})`;
    }

    showcaseSteps.forEach((step, index) => {
      const focus = clamp(1 - Math.abs(index - floatIndex));
      const direction = index < floatIndex ? -1 : 1;
      const isFocused = index === nearestIndex;
      step.style.opacity = isFocused ? "1" : "0.16";
      step.style.transform = `translate3d(0, ${(direction * (1 - focus) * 16).toFixed(2)}px, 0)`;

      const sample = showcaseSamples[index];
      if (sample) {
        sample.style.opacity = isFocused ? "1" : "0.28";
        sample.style.transform = `perspective(1100px) translate3d(0, ${((1 - focus) * 18).toFixed(2)}px, 0) rotateX(${((1 - focus) * 2.2).toFixed(3)}deg) scale(${(0.975 + focus * 0.025).toFixed(4)})`;
      }
    });
  };

  const renderMotionScenes = () => {
    motionFrame = 0;

    if (motionNeedsMeasure) {
      measureMotionScenes();
    }

    updateHeaderState();
    renderHeroScene(latestScrollY);
    renderJourneyScene(latestScrollY);
    renderShowcaseScene(latestScrollY);
  };

  const requestMotionFrame = () => {
    latestScrollY = window.scrollY;
    if (!motionFrame) {
      motionFrame = window.requestAnimationFrame(renderMotionScenes);
    }
  };

  const scheduleMotionMeasure = () => {
    motionNeedsMeasure = true;
    requestMotionFrame();
  };

  window.addEventListener("scroll", requestMotionFrame, { passive: true });
  window.addEventListener("resize", scheduleMotionMeasure, { passive: true });
  window.addEventListener("orientationchange", scheduleMotionMeasure, { passive: true });
  window.addEventListener("pageshow", scheduleMotionMeasure);
  window.addEventListener("hashchange", () => {
    window.requestAnimationFrame(scheduleMotionMeasure);
  });
  window.addEventListener("load", scheduleMotionMeasure, { once: true });
  document.fonts?.ready.then(scheduleMotionMeasure);

  reducedMotion.addEventListener?.("change", (event) => {
    motionReduced = event.matches;
    root.classList.toggle("motion-reduced", motionReduced);
    if (motionReduced) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    }
    scheduleMotionMeasure();
  });

  scheduleMotionMeasure();

  const installTabs = [...document.querySelectorAll("[data-install-mode]")];
  const installPanels = [...document.querySelectorAll("[data-install-panel]")];
  const installModeNote = document.querySelector("#install-mode-note");
  const installNotes = {
    full: "Понадобятся iPhone, USB-кабель и Mac или Windows-компьютер.",
    quick: "SideStore должен быть уже установлен, авторизован и готов к обновлению приложений.",
  };

  const readCompletedSteps = () => {
    try {
      const value = JSON.parse(window.localStorage.getItem(completedStepsKey) || "[]");
      return new Set(Array.isArray(value) ? value.filter((item) => typeof item === "string") : []);
    } catch {
      return new Set();
    }
  };

  const completedSteps = readCompletedSteps();

  const persistCompletedSteps = () => {
    try {
      window.localStorage.setItem(completedStepsKey, JSON.stringify([...completedSteps]));
    } catch {
      // The checklist still works for the current page when storage is unavailable.
    }
  };

  const updatePanelProgress = (panel) => {
    const steps = [...panel.querySelectorAll("[data-step-id]")];
    const completed = steps.filter((step) => completedSteps.has(step.dataset.stepId)).length;
    const text = panel.querySelector("[data-install-progress-text]");
    const bar = panel.querySelector("[data-install-progress-bar]");

    if (text) {
      text.textContent = `Выполнено: ${completed} из ${steps.length}`;
    }

    if (bar) {
      const percentage = steps.length ? (completed / steps.length) * 100 : 0;
      bar.style.width = `${percentage}%`;
    }
  };

  installPanels.forEach((panel) => {
    panel.querySelectorAll("[data-step-id]").forEach((step) => {
      const id = step.dataset.stepId;
      const button = step.querySelector(".step-check");
      const isComplete = completedSteps.has(id);

      step.classList.toggle("is-complete", isComplete);
      button?.setAttribute("aria-pressed", String(isComplete));

      button?.addEventListener("click", () => {
        if (completedSteps.has(id)) {
          completedSteps.delete(id);
        } else {
          completedSteps.add(id);
        }

        const completed = completedSteps.has(id);
        step.classList.toggle("is-complete", completed);
        button.setAttribute("aria-pressed", String(completed));
        persistCompletedSteps();
        updatePanelProgress(panel);
      });
    });

    updatePanelProgress(panel);
  });

  const activateInstallMode = (mode, moveFocus = false) => {
    installTabs.forEach((tab) => {
      const selected = tab.dataset.installMode === mode;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;

      if (selected && moveFocus) {
        tab.focus();
      }
    });

    installPanels.forEach((panel) => {
      const selected = panel.dataset.installPanel === mode;
      panel.hidden = !selected;

      if (selected) {
        updatePanelProgress(panel);
        const railLinks = [...panel.querySelectorAll("[data-rail-step]")];
        railLinks.forEach((link, index) => link.classList.toggle("is-active", index === 0));
      }
    });

    if (installModeNote) {
      installModeNote.textContent = installNotes[mode] || "";
    }
  };

  installTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateInstallMode(tab.dataset.installMode));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        nextIndex = (index + 1) % installTabs.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        nextIndex = (index - 1 + installTabs.length) % installTabs.length;
      } else if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = installTabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      activateInstallMode(installTabs[nextIndex].dataset.installMode, true);
    });
  });

  if (installTabs.length) {
    const selected = installTabs.find((tab) => tab.getAttribute("aria-selected") === "true");
    activateInstallMode(selected?.dataset.installMode || "full");
  }

  const installSteps = [...document.querySelectorAll(".install-step[id]")];
  if (installSteps.length && "IntersectionObserver" in window) {
    const stepObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting && !entry.target.closest("[hidden]"))
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) {
          return;
        }

        const panel = visible.target.closest("[data-install-panel]");
        panel?.querySelectorAll("[data-rail-step]").forEach((link) => {
          link.classList.toggle("is-active", link.dataset.railStep === visible.target.id);
        });
      },
      { rootMargin: "-24% 0px -54% 0px", threshold: [0.05, 0.2, 0.45] },
    );

    installSteps.forEach((step) => stepObserver.observe(step));
  }

  const toast = document.querySelector("#toast");
  let toastTimer = 0;

  const showToast = (message) => {
    if (!toast) {
      return;
    }

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
  };

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();

    const copied = document.execCommand("copy");
    field.remove();

    if (!copied) {
      throw new Error("copy failed");
    }
  };

  document.querySelectorAll("[data-copy-source]").forEach((button) => {
    button.addEventListener("click", async () => {
      const initialLabel = button.textContent;

      try {
        await copyText(sourceURL);
        button.textContent = "Скопировано";
        showToast("URL источника скопирован");
      } catch {
        showToast("Не удалось скопировать — выделите URL вручную");
      }

      window.setTimeout(() => {
        button.textContent = initialLabel;
      }, 1800);
    });
  });
})();
