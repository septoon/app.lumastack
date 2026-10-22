import { useLayoutEffect } from "react";

const ENTRANCE_TARGETS =
  ".platform-card, .feature-story, .workflow-grid article, .update-entry, .download-panel, .installation-guide, .help-content > details, .install-step, .automation-schedule > article, .android-showcase";

export function usePortalMotion(reducedMotion, site) {
  useLayoutEffect(() => {
    if (reducedMotion || !("IntersectionObserver" in window)) return;
    const items = [...document.querySelectorAll(ENTRANCE_TARGETS)];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("motion-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.06 },
    );
    for (const item of items) {
      // Never hide a focused element or an inactive installation tab panel.
      if (item.closest("[hidden]")) continue;
      item.classList.add("motion-enter");
      observer.observe(item);
    }
    const showFocused = (event) => {
      const item = event.target.closest(".motion-enter");
      if (item) {
        item.classList.add("motion-visible");
        observer.unobserve(item);
      }
    };
    document.addEventListener("focusin", showFocused);
    return () => {
      observer.disconnect();
      document.removeEventListener("focusin", showFocused);
      items.forEach((item) =>
        item.classList.remove("motion-enter", "motion-visible"),
      );
    };
  }, [reducedMotion, site]);
}
