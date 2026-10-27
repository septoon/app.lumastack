import { useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { useSite } from "../SiteContent";
import FlowBackdrop from "./FlowBackdrop";
import PlatformTabs from "./PlatformTabs";
import { pageVisible } from "../siteConfig";
import { useReducedMotion } from "../hooks/useReducedMotion";

export function DeviceScreen({ image, platform = image.platform || "ios", loading = "lazy" }) {
  const [ratio, setRatio] = useState(1179 / 2556);
  const wide = ratio > 0.7;
  const android = platform === "android";
  const screen = <img
    className="device-screen-image"
    src={image.imageUrl}
    alt={image.altText || image.title || "Интерфейс приложения «Инженер»"}
    width="1179" height="2556" loading={loading} decoding="async"
    onLoad={event => {
      const loaded = event.currentTarget;
      if (loaded.naturalHeight) setRatio(loaded.naturalWidth / loaded.naturalHeight);
    }}
  />;
  if (wide) return <div className="device-shell is-wide" style={{ "--screen-ratio": ratio }}>{screen}</div>;
  return (
    <div className={`device-shell realistic-device device-${android ? "pixel" : "iphone"}`}>
      <div className="real-device-screen">{screen}</div>
      <img
        className="real-device-frame"
        src={android ? "/assets/device-pixel-9-pro.webp" : "/assets/device-iphone-frame.webp"}
        width={android ? "1408" : "760"} height={android ? "2974" : "1300"}
        alt="" aria-hidden="true" loading={loading} decoding="async"
      />
      {android && <span className="real-device-camera" aria-hidden="true" />}
    </div>
  );
}

export default function ProductPreview({ fixedPlatform, hero = false, platform: controlledPlatform, onPlatformChange }) {
  const { text: copy, site, screenshots } = useSite();
  const reduced = useReducedMotion();
  const [selectedPlatform, setPlatform] = useState(() => fixedPlatform || (/android/i.test(navigator.userAgent) ? "android" : "ios"));
  const platforms = ["ios", "android"].filter(id => pageVisible(site, `/${id}`));
  const requestedPlatform = controlledPlatform ?? selectedPlatform;
  const platform = fixedPlatform || (platforms.includes(requestedPlatform) ? requestedPlatform : platforms[0]);
  const [selectedID, setSelectedID] = useState(null);
  const images = screenshots(platform);
  const current = images.find(image => image.id === selectedID) || images[0];
  if (!platform) return null;
  const instant = reduced;
  return (
    <div className={`product-preview preview-platform-${platform}${hero ? " is-hero-preview" : ""}`}>
      <FlowBackdrop />
      <div className="preview-caption">
        {fixedPlatform ? <span>{platform === "ios" ? copy("productpreview.355f5e748485", "iOS") : copy("productpreview.6d612a86bee4", "Android")}</span> : (
          <PlatformTabs options={platforms} value={platform} label={copy("productpreview.85960b6702a9", "Платформа в превью")} onChange={onPlatformChange || setPlatform} />
        )}
      </div>
      <div className="preview-device">
        <AnimatePresence initial={false}>
          <m.div key={current?.id || "empty"} className="preview-screen-layer" initial={{ opacity: instant ? 1 : 0, x: instant ? 0 : 28, scale: instant ? 1 : 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: instant ? 0 : -28, scale: instant ? 1 : 0.96 }} transition={{ duration: instant ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}>
            {current ? <DeviceScreen image={current} platform={platform} loading={hero ? "eager" : "lazy"} /> : <div className="empty-screenshots"><img src="/assets/app-icon.webp" width="64" height="64" alt="" /><p>{copy("productpreview.d229dfd43fd5", "Скриншоты пока не добавлены")}</p></div>}
          </m.div>
        </AnimatePresence>
      </div>
      <div className="managed-preview-copy" aria-live="polite">{current?.isTitleVisible !== false && <strong>{current?.title}</strong>}{current?.isCaptionVisible !== false && current?.caption && <p>{current.caption}</p>}</div>
      {images.length > 1 && <div className="screenshot-tabs" role="group" aria-label={copy("productpreview.0ceb7d367de1", "Скриншоты приложения")}>
        {images.map((image, index) => <button key={image.id} type="button" aria-pressed={current.id === image.id} aria-label={image.isTitleVisible !== false && image.title ? image.title : `Экран ${index + 1}`} onClick={() => setSelectedID(image.id)}><span /></button>)}
      </div>}
    </div>
  );
}
