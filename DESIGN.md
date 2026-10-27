---
name: "Инженер"
description: "Soft graphite, lilac light and expressive product motion for a field engineer app."
colors:
  bg: "#111116"
  bg-soft: "#191a24"
  surface: "#1d1e2b"
  surface-strong: "#292b3d"
  surface-muted: "#252a34"
  text: "#f4f5f7"
  muted: "#a7adb9"
  muted-strong: "#c6ccd6"
  mint: "#c2c9ff"
  mint-bright: "#e0dcff"
  mint-deep: "#6688c5"
  amber: "#e7b97c"
  line: "#323640"
  line-strong: "#505867"
  action-ink: "#14243f"
  action-lilac: "#d9d2ff"
  action-blue: "#b1ccff"
typography:
  display:
    fontFamily: "Golos Text, sans-serif"
    fontSize: "clamp(48px, 5.25vw, 80px)"
    fontWeight: 600
    lineHeight: 1.045
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Golos Text, sans-serif"
    fontSize: "clamp(32px, 4.2vw, 58px)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Golos Text, sans-serif"
    fontSize: "16px"
    lineHeight: 1.65
  lead:
    fontFamily: "Golos Text, sans-serif"
    fontSize: "17px"
    lineHeight: 1.75
  button:
    fontFamily: "Golos Text, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.015em"
  label:
    fontFamily: "Golos Text, sans-serif"
    fontSize: "13px"
rounded:
  sm: "10px"
  md: "16px"
  lg: "24px"
  platform-card: "22px"
  device: "34px"
  menu: "15px"
  loader-core: "26px"
spacing:
  compact: "8px"
  control-gap: "10px"
  inline: "16px"
  gutter-mobile: "20px"
  grid: "24px"
  gutter-tablet: "32px"
  surface: "36px"
  gutter-desktop: "48px"
  section-mobile: "56px"
  section-tablet: "76px"
  section-desktop: "96px"
components:
  button-primary:
    textColor: "{colors.action-ink}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "13px 22px"
  button-secondary:
    backgroundColor: "#1c2028"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "13px 22px"
  platform-selector:
    backgroundColor: "#20232a"
    rounded: "{rounded.sm}"
    padding: "4px"
  screenshot-selector:
    textColor: "{colors.mint}"
    size: "44px"
  platform-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.platform-card}"
    padding: "36px"
  download-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "32px"
  menu-toggle:
    textColor: "{colors.text}"
    rounded: "{rounded.menu}"
    padding: "11px"
    size: "48px"
  disclosure:
    textColor: "{colors.text}"
    padding: "4px 0"
  navigation:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
---

# Design System: Инженер

## Overview

**Creative North Star: "The Luminous Fieldbook"**

A practical fieldbook with a softer, more expressive atmosphere: graphite surfaces, lilac and blue light, large Cyrillic headlines and authentic app screens. Gradients and rounded organic backdrops bring warmth to the product presentation; installation and help keep a compact, readable rhythm.

This document records the implemented public portal, read from source. It refreshes the provisional direction after the user's request for more library-based animation and a less strict design. It does not document obsolete, unmounted showcase experiments or claim visual signoff.

**Key Characteristics:**
- Soft graphite surfaces with lilac-to-blue gradients.
- Large self-hosted Cyrillic typography and real platform-specific app screens.
- Expressive scroll, hover, press, menu and loading motion with separate animation ownership.
- Readable task pages and an immediate reduced-motion path.

## Colors

### Primary

Soft Lilac (`mint`) carries selected controls, links, progress and focus. Its historical CSS variable name is retained even though the current hue is lilac. The primary action uses the `action-lilac` → `action-blue` gradient with `action-ink` text.

### Secondary

Pale Lilac (`mint-bright`) brightens text-link hover. Muted Blue (`mint-deep`) is retained in the CSS palette; do not infer that every palette token is an active component state.

### Tertiary

Warm Amber (`amber`) is retained in the palette. Installation notices use a separate muted brown background and warm text, rather than a saturated alert block.

### Neutral

Night Graphite (`bg`) is the canvas. Soft Graphite (`bg-soft`), Ink Violet (`surface`) and deeper raised surfaces provide tonal separation. `text`, `muted-strong` and `muted` establish reading hierarchy; `line` and `line-strong` divide content and outline controls. Borders remain subordinate to copy and screens.

## Typography

Self-hosted **Golos Text** (variable weights 400–800) is the shared display and body family, with sans-serif fallback. Heading tracking is tight; text wraps naturally rather than forcing uppercase or decorative labels. Release facts and step numbers use tabular numerals.

The frontmatter records desktop display, headline, body, lead, button and label roles. The hero switches to (56px) below (1100px), a smaller clamp below (900px), and `clamp(39px, 10.4vw, 64px)` with (1.08) line height below (640px); the narrowest breakpoint uses (36px). Large screens above (1600px) use an (86px) hero. Typical feature chapter titles vary from (44px) to (26px), then (22px) on narrow phones. Help and installation copy stays smaller than product headlines.

## Layout

The centered content width is capped at (1280px). Horizontal gutters are (48px), (32px) below (1100px), and (20px) below (640px). Public sections use the desktop/tablet/mobile spacing tokens. The header is sticky with observed heights of (80px), (72px), then (68px).

Desktop hero copy and preview form an asymmetric two-column composition; phones stack them. Features use a sticky screen beside three chapters above (900px), then inline chapter screenshots. Platform and update pairs collapse to one column at (640px); the three-step workflow also becomes a vertical sequence. At (360px), hero actions become one column. Installation layouts become single-column below (900px). Use existing responsive behavior rather than adding a new grid system.

## Elevation & Depth

Depth comes from tonal graphite layers, lilac/blue gradients, organic halos and a restrained device shadow. The menu uses the existing ambient shadow token; ordinary content panels depend on borders and color instead of stacked shadows. Exact shadows and motion settings live in the sidecar.

Motion is loaded through `LazyMotion` with `domMax`. Motion owns hero entry, adapted React Bits BlurText word reveals, the spring platform indicator, `useSpring` mouse tilt, screenshot transitions and once-per-view workflow reveals. A shared FlowBackdrop sits inside every product preview and the sticky feature screen: lilac, blue and rose gradient clouds move through transforms/opacity, while SVG contours animate path length and offset. Its loops run only near the viewport, while the document is visible and reduced motion is off. Shared Motion `inView` entrances cover headings, release facts, cards, updates and installation copy. Links receive spring hover/press feedback; delegated legacy buttons receive local feedback without competing with React Motion controls. The shared DOM hook uses native Motion mini animation with a spring generator. Native disclosures animate height with interruption handling; cleanup cancels animation and restores original styles and final open state, including reduced-motion changes. GSAP/ScrollTrigger is imported when the feature scene approaches the viewport: it reveals chapter copy and, above (900px), drives device depth, active chapter and vertical progress. Browser scrolling stays native. The adapted React Bits Spotlight surface moves only in response to local mouse events.

Reduced motion skips GSAP setup, removes blur/positional entrance effects, stops backdrop loops and tilt, hides Spotlight, disables CSS transitions and supplies inline feature screens in place of the sticky presentation. Keyboard controls retain focus and native activation semantics; platform and screenshot selection animate for both pointer and keyboard activation, except under reduced motion. Keep native button semantics and the (2px) lilac focus outline with (5px) offset; decorative layers remain hidden from assistive technology. BlurText includes a single accessible text copy.

**The Shared Target Rule.** Motion and GSAP must never animate the same DOM target; keep device depth on an outer wrapper and screen transitions on inner layers.

**The Accessible Motion Rule.** Animate meaningful interaction feedback while preserving native activation, visible focus and readable content; reduced motion disables decorative loops and positional effects.

The startup loader is indeterminate: the app icon sits inside two counter-rotating SVG orbits with a breathing aura and small moving dots. Loops run only during visible, non-error loading and stop when the document is hidden or reduced motion is requested. Loading text does not claim a percentage. Errors expose an alert and a native retry button. `AnimatePresence` sequences the loader exit and portal entrance; its initial animation must remain enabled so loading loops start on the first mount. Supported browsers progressively enhance full-page navigation with short root view transitions; native links remain the navigation mechanism.

## Shapes

Controls use the small radius, panels the medium radius, and platform cards their observed softer radius. Screen shells preserve the uploaded image aspect ratio; portrait frames are deeply rounded and wider images receive shallower corners. Organic elliptical gradients soften the hero and feature scene without replacing the actual product imagery. Do not force every surface into the same silhouette.

## Components

- **Primary and secondary buttons:** compact, legible actions with a (48px) default minimum height and (54px) large variant. Primary is a lilac/blue gradient; secondary is dark with a visible border. Motion-powered action links lift by (3px) and scale to (1.015) on hover, then (.97) on press. Non-action links fade gently on hover. Legacy buttons receive delegated hover/press feedback; CSS retains color and border response. Mobile hero actions are (52px) high.
- **Platform selector:** a dark inset group of native buttons with pressed states, (44px) minimum targets and a shared lilac indicator. Selection uses a shared spring indicator; reduced motion removes animated travel. This is a button group, not a tablist.
- **Device models:** iPhone 15 Pro Max uses the existing studio-rendered frame and matching display UV mask; Android uses official Google Pixel 9 Pro artwork. Live CMS screens remain separate from the physical device. Container-relative sizing preserves the artwork/screen aspect ratio on narrow layouts; wide tablet images keep their native proportions.
- **Attribution:** no separate device-credits link in footer navigation; a compact footer credit names the iPhone model author, links the source and CC BY 4.0 license, and identifies the adapted render.
- **Page introductions:** no redundant home link; the header brand returns home. Introduction padding is 40px/32px on larger screens and 28px/24px on phones, with no heading top margin. Android SHA-256 remains in publication metadata and validation, not in the visual download panel.
- **Page platform selection:** one selector in the hero owns the home page platform state. Product previews, feature chapter screenshots/device models and the selected installation card consume the same state. Features and downloads have no duplicate platform controls. Dedicated iOS/Android pages remain fixed to their platform.
- **Screenshot selector:** (44px) buttons contain short progress-like marks; the selected mark grows from (18px) to (28px). Screens transition over (280ms) in the hero preview and (320ms) in the feature scene. Titles/captions and missing-image states come from the managed content.
- **Platform cards:** outlined graphite surfaces with a selected lilac/blue wash and local Spotlight. They display current release state, version, size and an installation link. Padding reduces on smaller screens; the light layer must not intercept clicks.
- **Download panels:** quieter bordered surfaces for release metadata, notices, hashes and instructions. Keep long hashes wrap-safe and release states explicit.
- **Navigation:** sticky dark header and muted links with brighter current/hover states. At (900px) and below, the header installation action is hidden and the menu toggle aligns right; desktop retains the installation action. A (48px) rounded button morphs two asymmetric SVG strokes into a cross over (250ms); the dropdown uses a spring entrance. The closed mobile menu is inert. Outside press and Escape close it; Escape from the menu restores focus to the toggle.
- **Disclosures:** native summary/details rows divided by fine rules. Height opens and closes over (240ms), supports repeated interruption and restores native open state after motion. No new text-input or chip pattern is defined by this public portal.
- **Product backdrop:** reusable lilac/blue/rose clouds and fine animated contours behind product screens, replacing the earlier static phone halos and single hero orbit. Gradient fills remain static; Motion animates their layers. Clouds run over (11s), (14s) and (9s); contours run over (8s), (10s) and (12s). Decorative layers ignore pointer input and are hidden from assistive technology.
- **Startup loader:** centered (220px) orbit artwork around an (88px) gradient icon surface; supporting text stays compact. Decorative rings, dots and pulses are hidden from assistive technology; status, busy state, failure and retry remain semantic.

## Do's and Don'ts

### Do:
- Do reuse the graphite surfaces and lilac-to-blue gradients for related product surfaces.
- Do keep real app screens, aspect ratios, platform labels and empty states truthful.
- Do retain visible focus, native buttons, pressed states and readable content when motion is reduced.
- Do gate decorative loops by viewport or document visibility and loading state; keep pointer decoration local to mouse interactions.

### Don't:
- Don't return to an austere, rigid visual tone; the user requested a softer design with more library-based animation.
- Don't add animation ownership conflicts, scroll hijacking or content that requires an animation to become available.
- Don't present temporary iOS images as authentic Android screens.
- Don't claim screenshot QA, browser QA or visual signoff from this documentation pass.
