import { useEffect } from "react";

const REVEAL_TARGETS = [
  ".section-heading h2", ".section-heading > div > p", ".page-intro h1", ".page-intro > p",
  ".platform-card .platform-title", ".platform-card > p", ".download-panel .release-heading",
  ".release-facts > div", ".update-entry", ".final-cta h2", ".portal-footer > div",
  ".installation-guide > h2", ".installation-guide > ol > li", ".help-content > h2",
  ".install-step", ".prerequisites > article", ".automation-schedule > article", ".faq > details",
].join(",");

export function usePortalMotion(reducedMotion, site) {
  useEffect(() => {
    document.documentElement.classList.toggle("motion-reduced", reducedMotion);
    if (reducedMotion) return;
    let alive = true;
    const observers = [];
    const animations = new Map();
    const originalStyles = new Map();
    const remember = element => {
      if (!originalStyles.has(element)) originalStyles.set(element, Object.fromEntries(["opacity", "transform", "scale", "height", "overflow"].map(property => [property, element.style.getPropertyValue(property)])));
    };
    const cancel = (element, key) => {
      const slots = animations.get(element);
      slots?.get(key)?.cancel();
      slots?.delete(key);
      if (slots && !slots.size) animations.delete(element);
    };
    const disposers = [];
    const accordions = new Map();

    Promise.all([import("motion/mini"), import("motion")]).then(([{ animate }, { inView, spring }]) => {
      if (!alive) return;
      const run = (element, values, options = {}) => {
        remember(element);
        const key = Object.keys(values).sort().join("|");
        cancel(element, key);
        const animation = animate(element, values, options);
        const slots = animations.get(element) || new Map();
        slots.set(key, animation);
        animations.set(element, slots);
        animation.then(() => {
          if (slots.get(key) !== animation) return;
          slots.delete(key);
          if (!slots.size) animations.delete(element);
        });
        return animation;
      };
      document.querySelectorAll(REVEAL_TARGETS).forEach((element, index) => {
        observers.push(inView(element, () => {
          run(element, { opacity: [0.45, 1], transform: ["translateY(18px)", "translateY(0px)"] }, {
            duration: 0.65, delay: index % 3 * 0.045, ease: [0.22, 1, 0.36, 1],
          });
        }, { amount: 0.15 }));
      });

      // Delegate legacy buttons without competing with React Motion controls.
      let pressed;
      const buttonAt = event => event.target.closest?.("button:not([data-motion-button]):not(:disabled)");
      const press = event => {
        const button = buttonAt(event);
        if (!button) return;
        pressed = button;
        run(button, { scale: 0.96 }, { duration: 0.12 });
      };
      const release = () => {
        if (!pressed) return;
        run(pressed, { scale: 1 }, { type: spring, stiffness: 420, damping: 25 });
        pressed = null;
      };
      const hover = event => {
        const button = buttonAt(event);
        if (event.pointerType !== "mouse" || !button || button.contains(event.relatedTarget)) return;
        run(button, { opacity: 0.8 }, { duration: 0.16 });
      };
      const leave = event => {
        const button = buttonAt(event);
        if (!button || button.contains(event.relatedTarget)) return;
        run(button, { opacity: 1 }, { duration: 0.16 });
      };
      const toggleDetails = event => {
        const summary = event.target.closest?.("summary");
        const details = summary?.parentElement;
        if (!details || details.tagName !== "DETAILS") return;
        event.preventDefault();
        const previous = accordions.get(details);
        const from = details.getBoundingClientRect().height;
        const opening = previous ? !previous.opening : !details.open;
        remember(details);
        cancel(details, "height");
        details.open = true;
        details.style.height = "auto";
        const style = getComputedStyle(details);
        const closed = summary.offsetHeight + [style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth].reduce((sum, value) => sum + parseFloat(value || 0), 0);
        const to = opening ? details.getBoundingClientRect().height : closed;
        details.style.height = `${from}px`;
        details.style.overflow = "hidden";
        const animation = run(details, { height: [`${from}px`, `${to}px`] }, {
          duration: 0.24, ease: [0.22, 1, 0.36, 1],
          onComplete: () => {
            details.open = opening;
            details.style.height = "";
            details.style.overflow = "";
            accordions.delete(details);
          },
        });
        accordions.set(details, { animation, opening });
      };
      for (const [name, handler] of [["pointerdown", press], ["pointerup", release], ["pointercancel", release], ["pointerover", hover], ["pointerout", leave], ["click", toggleDetails]]) {
        document.addEventListener(name, handler);
        disposers.push(() => document.removeEventListener(name, handler));
      }
    }).catch(() => { /* Native controls and visible content remain usable if motion cannot load. */ });

    return () => {
      alive = false;
      observers.forEach(stop => stop());
      disposers.forEach(dispose => dispose());
      animations.forEach(slots => slots.forEach(animation => animation.cancel()));
      animations.clear();
      originalStyles.forEach((styles, element) => {
        Object.entries(styles).forEach(([property, value]) => value ? element.style.setProperty(property, value) : element.style.removeProperty(property));
      });
      accordions.forEach((value, details) => { details.open = value.opening; details.style.height = ""; details.style.overflow = ""; });
      document.documentElement.classList.remove("motion-reduced");
    };
  }, [reducedMotion, site]);
}
