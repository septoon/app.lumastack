import BlurText from "./BlurText";
import { m } from "motion/react";
import { SiteLink, useSite } from "../SiteContent";
import ProductPreview from "./ProductPreview";
import { useReducedMotion } from "../hooks/useReducedMotion";

export default function Hero({ platform, onPlatformChange, showFeatures = true }) {
  const { text: copy } = useSite();
  const reduced = useReducedMotion();
  return (
    <section className="product-hero container" id="top" aria-labelledby="hero-heading">
      <m.div className="product-copy" initial={{ opacity: 0.6, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}>
        <h1 id="hero-heading"><BlurText text={copy("hero.fefe1b0f6ae2", "Все рабочие инструменты")} highlight="Все" /><br /><BlurText text={copy("hero.8c934c998648", "В одном приложении.")} delay={0.15} highlight="В одном" /></h1>
        <p className="product-description">{copy("hero.c29b835a5506", "Заявки, маршрут, оборудование и рабочие инструкции. От первого адреса до дневного отчёта — на iOS и Android.")}</p>
        <div className="product-actions">
          <SiteLink className="button button-primary button-large" href="/ios">{copy("app.7813a4bb264e", "Установка на iPhone")}<PlatformIcon platform="ios" /></SiteLink>
          <SiteLink className="button button-secondary button-large" href="/android">{copy("app.276d35c116d8", "Android APK")}<PlatformIcon platform="android" /></SiteLink>
        </div>
        {showFeatures && <SiteLink className="hero-explore text-link" href="#features">{copy("hero.04afc09e60bd", "Возможности")}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6" /></svg></SiteLink>}
      </m.div>
      <div className="hero-product-stage">
        <ProductPreview hero platform={platform} onPlatformChange={onPlatformChange} />
      </div>
    </section>
  );
}

export function PlatformIcon({ platform }) {
  return <svg className="platform-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{platform === "ios" ? <><rect x="6.5" y="2" width="11" height="20" rx="3" /><path d="M10 5h4m-3 14h2" /></> : <><path d="M5 11h14v7H5zM5 9a7 7 0 0 1 14 0M7 3 5 1m12 2 2-2M2 12v5m20-5v5M8 18v4m8-4v4" /><path d="M9 6h.01M15 6h.01" /></>}</svg>;
}
