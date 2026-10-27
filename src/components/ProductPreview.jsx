import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSite } from "../SiteContent";
import { createScreenLoader, decodeScreen } from "../screenLoader";
import FlowBackdrop from "./FlowBackdrop";
import PlatformTabs from "./PlatformTabs";
import { pageVisible } from "../siteConfig";
import { useReducedMotion } from "../hooks/useReducedMotion";

const Iphone3D = lazy(() => import("./Iphone3D"));

export function DeviceScreen({ image, platform = image.platform || "ios", loading = "lazy" }) {
  const loader = useRef(null);
  const [loaded, setLoaded] = useState(null);
  useEffect(() => {
    const next = createScreenLoader(decodeScreen, (image, resource) => setLoaded({ image, ratio: resource.naturalWidth / resource.naturalHeight }));
    loader.current = next;
    return () => { next.dispose(); loader.current = null; };
  }, []);
  useEffect(() => {
    if (!image?.imageUrl) { setLoaded(null); loader.current?.select(null); return; }
    loader.current?.select(image);
  }, [JSON.stringify(image)]);
  const ratio = loaded?.ratio || 1179 / 2556;
  const wide = ratio > 0.7;
  const android = platform === "android";
  const screen = loaded ? <img className="device-screen-image" src={loaded.image.imageUrl}
    alt={loaded.image.altText || loaded.image.title || "Интерфейс приложения «Инженер»"}
    width="1179" height="2556" loading={loading} decoding="async"
    onError={() => setLoaded(null)} /> : <span className="device-screen-placeholder">Инженер</span>;
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
  const [visible, setVisible] = useState(null);
  const onScreenReady = useCallback(image => setVisible(image), []);
  const caption = reduced ? current : ((visible?.platform || "ios") === platform ? visible : null);
  const temporaryCaption = hero && /^Заглушка: временное изображение версии iOS\. Реальный скриншот Android появится позже\.$/.test(caption?.caption || '');
  if (!platform) return null;
  return (
    <div className={`product-preview preview-platform-${platform}${hero ? " is-hero-preview" : ""}`}>
      <FlowBackdrop />
      <div className="preview-caption">
        {fixedPlatform ? <span>{platform === "ios" ? copy("productpreview.355f5e748485", "iOS") : copy("productpreview.6d612a86bee4", "Android")}</span> : (
          <PlatformTabs options={platforms} value={platform} label={copy("productpreview.85960b6702a9", "Платформа в превью")} onChange={onPlatformChange || setPlatform} />
        )}
      </div>
      <div className="preview-device">
        <Suspense fallback={current ? <div className="phone-static-loading"><DeviceScreen image={current} platform={platform} loading={hero ? 'eager' : 'lazy'} /></div> : <div className="empty-screenshots">{copy("productpreview.d229dfd43fd5", "Скриншоты пока не добавлены")}</div>}>
          {reduced ? (current ? <div className="phone-static-loading"><DeviceScreen image={current} platform={platform} loading="eager" /></div> : <div className="empty-screenshots">{copy("productpreview.d229dfd43fd5", "Скриншоты пока не добавлены")}</div>) : <Iphone3D image={current} images={images} platform={platform} mode={hero ? 'hero' : 'showcase'} onScreenReady={onScreenReady} />}
        </Suspense>
      </div>
      <div className="managed-preview-copy" aria-live="polite">{caption?.isTitleVisible !== false && <strong>{caption?.title}</strong>}{!temporaryCaption && caption?.isCaptionVisible !== false && caption?.caption && <p>{caption.caption}</p>}</div>
      {images.length > 1 && <div className="screenshot-tabs" role="group" aria-label={copy("productpreview.0ceb7d367de1", "Скриншоты приложения")}>
        {images.map((image, index) => <button key={image.id} type="button" aria-pressed={current.id === image.id} aria-label={image.isTitleVisible !== false && image.title ? image.title : `Экран ${index + 1}`} onClick={() => setSelectedID(image.id)}><span /></button>)}
      </div>}
    </div>
  );
}
