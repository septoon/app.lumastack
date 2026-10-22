import { useState } from "react";
import { useSite } from "../SiteContent";
import { pageVisible } from "../siteConfig";

function AndroidPlaceholder() {
  const { text: copy } = useSite();
  return (
    <div className="android-device-wrap">
      <div className="android-phone">
        <img className="android-device-frame" src="/assets/device-pixel-9-pro.webp" width="1408" height="2974" alt="" />
        <div
          className="android-placeholder-screen"
          role="img"
          aria-label={copy("productpreview.d4e1667df17d", "Макет Google Pixel 9 Pro. Настоящие скриншоты приложения появятся позже.")}
        >
          <span className="android-camera" aria-hidden="true" />
          <div className="placeholder-brand">
            <img src="/assets/app-icon.webp" width="64" height="64" alt="" />
            <span>{copy("productpreview.88d71676fa80", "Инженер")}</span>
          </div>
          <div className="placeholder-lines" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="placeholder-caption">
            <span className="placeholder-symbol" aria-hidden="true">
              <svg viewBox="0 0 32 32">
                <rect x="5" y="5" width="22" height="22" rx="5" />
                <path d="m7 23 6-7 5 5 3-4 5 6" />
                <circle cx="21" cy="11" r="2" />
              </svg>
            </span>
            <strong>{copy("productpreview.c735d61c00c3", "Скриншоты скоро")}</strong>
            <span>{copy("productpreview.7a15d6d64e2c", "Здесь появятся реальные")}<br />{copy("productpreview.4c35c0580d4f", "экраны Android")}</span>
          </div>
          <span className="placeholder-label">{copy("productpreview.e554a17cf0ed", "Макет устройства")}</span>
        </div>
      </div>
    </div>
  );
}

export default function ProductPreview({ fixedPlatform }) {
  const { text: copy } = useSite();
  const {site, screenshots} = useSite();
  const [selectedPlatform, setPlatform] = useState(() => fixedPlatform || (/android/i.test(navigator.userAgent) ? "android" : "ios"));
  const platforms = ["ios", "android"].filter(id => pageVisible(site, `/${id}`));
  const platform = fixedPlatform || (platforms.includes(selectedPlatform) ? selectedPlatform : platforms[0]);
  const [selectedID, setSelectedID] = useState(null);
  const images = screenshots(platform);
  const current = images.find(image => image.id === selectedID) || images[0];
  if (!platform) return null;
  return (
    <div className={`product-preview preview-platform-${platform}`}>
      <div className="preview-caption">
        <span>{copy("productpreview.88d71676fa80", "Инженер")}</span>
        {fixedPlatform ? <span>{platform === "ios" ? copy("productpreview.355f5e748485", "iOS") : copy("productpreview.6d612a86bee4", "Android")}</span> : (
          <div className="preview-tabs" role="group" aria-label={copy("productpreview.85960b6702a9", "Платформа в превью")}>
            {platforms.map(id => <button key={id} type="button" aria-pressed={platform === id} onClick={() => setPlatform(id)}>{id === "ios" ? copy("productpreview.355f5e748485", "iOS") : copy("productpreview.6d612a86bee4", "Android")}</button>)}
          </div>
        )}
      </div>
      <div className="preview-device">
        {current ? <img className="managed-preview-image" src={current.imageUrl} alt={current.altText} width="402" height="874" /> : platform === "android" ? <AndroidPlaceholder /> : <div className="empty-screenshots"><img src="/assets/app-icon.webp" width="64" height="64" alt="" /><p>{copy("productpreview.d229dfd43fd5", "Скриншоты пока не добавлены")}</p></div>}
      </div>
      {current && <div className="managed-preview-copy">{current.isTitleVisible !== false && <strong>{current.title}</strong>}{current.isCaptionVisible !== false && current.caption && <p>{current.caption}</p>}</div>}
      {images.length > 1 && <div className="preview-tabs screenshot-tabs" role="group" aria-label={copy("productpreview.0ceb7d367de1", "Скриншоты приложения")}>
        {images.map((image, index) => <button key={image.id} type="button" aria-pressed={current.id === image.id} aria-label={image.title || image.altText} onClick={() => setSelectedID(image.id)}>{index + 1}</button>)}
      </div>}
    </div>
  );
}
