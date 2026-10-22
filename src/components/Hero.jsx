import { SiteLink, useSite } from "../SiteContent";
import ProductPreview from "./ProductPreview";

export default function Hero() {
  const { text: copy } = useSite();
  return (
    <section
      className="product-hero container"
      id="top"
      aria-labelledby="hero-heading"
    >
      <div className="product-copy">
        <p className="product-context">{copy("hero.8a3506d9afae", "Рабочее приложение выездного инженера")}</p>
        <h1 id="hero-heading">{copy("hero.fefe1b0f6ae2", "Весь рабочий день.")}<br />{copy("hero.8c934c998648", "В одном приложении.")}</h1>
        <p className="product-description">{copy("hero.c29b835a5506", "Заявки, маршрут, оборудование и рабочие инструкции. От первого адреса до дневного отчёта — на iOS и Android.")}</p>
        <div className="product-actions">
          <SiteLink className="button button-primary button-large" href="#download">{copy("hero.1948dc7a9d0b", "Установить приложение")}</SiteLink>
          <SiteLink className="button button-secondary" href="#features">{copy("hero.04afc09e60bd", "Возможности")}</SiteLink>
        </div>
        <div className="hero-platforms">
          <span>{copy("hero.38fdf519314e", "iPhone")}</span>
          <span>{copy("hero.7a4cb5ffab26", "Android: телефон и планшет")}</span>
        </div>
      </div>
      <ProductPreview />
    </section>
  );
}
