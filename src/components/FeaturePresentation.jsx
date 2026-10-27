import { lazy, Suspense } from "react";
import { useSite } from "../SiteContent";
import FlowBackdrop from "./FlowBackdrop";
import { DeviceScreen } from "./ProductPreview";

const Iphone3D = lazy(() => import('./Iphone3D'));
const PhoneCanvas = lazy(() => import('./PhoneCanvas'));

export default function FeaturePresentation({ reducedMotion, platform = "ios" }) {
  const { text: copy, screenshots } = useSite();
  const images = screenshots(platform);
  const steps = [
    [copy("app.9a7abebf0298", "Заявки и маршрут"), copy("app.1cd02d7980dd", "Откройте активные заявки, проверьте адреса и постройте маршрут в Яндекс.Картах."), images[0]],
    [copy("app.92d3172779f8", "Рабочие инструкции"), copy("app.c7e763c2819f", "Найдите нужную информацию в Wiki, пока работаете на объекте."), images.find(image => /wiki|вики/i.test(image.title)) || images[3] || images[0]],
    [copy("app.b901d703c038", "Результаты дня"), copy("app.8efde53732ab", "Соберите данные о пробеге, заправках и выполненной работе."), images.find(image => /аналитик/i.test(image.title)) || images[2] || images[0]],
  ];
  const chapters = interactive => <div className={`feature-chapter-list${images.length ? '' : ' without-images'}`}>
    {steps.map(([title, text, image], index) => <article className={`feature-chapter feature-chapter-row${image ? ' has-image' : ''}`} key={index}>
      <div className="chapter-copy"><span className="chapter-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{text}</p></div>
      {image && <div className="chapter-device">
        <FlowBackdrop />
        <div className="chapter-phone-stage">
          {interactive ? <Suspense fallback={<div className="phone-static-loading"><DeviceScreen image={image} platform={platform} /></div>}>
            <Iphone3D platform={platform} image={image} images={[image]} mode="chapter" />
          </Suspense> : <div className="phone-static-loading"><DeviceScreen image={image} platform={platform} /></div>}
        </div>
        <div className="chapter-device-caption">
          {image.isTitleVisible !== false && image.title && <strong>{image.title}</strong>}
          {image.isCaptionVisible !== false && image.caption && <p>{image.caption}</p>}
        </div>
      </div>}
    </article>)}
  </div>;

  return <section className="container portal-section feature-presentation" id="features" aria-labelledby="features-heading">
    <div className="section-heading"><div><h2 id="features-heading">{copy("app.21580877fedc", "От заявки до отчёта")}</h2><p>{copy("app.b2a7338c8a17", "Всё, что нужно в течение смены, рядом.")}</p></div>{images.length > 0 && platform === "ios" && <span className="small-note">{copy("app.bf7a7b6c958e", "На изображениях — версия для iOS")}</span>}</div>
    {reducedMotion || !images.length ? chapters(false) : <Suspense fallback={chapters(false)}><PhoneCanvas>{chapters(true)}</PhoneCanvas></Suspense>}
    <div className="capability-list"><span>{copy("app.af6d4ea42203", "Автомобиль и топливо")}</span><span>{copy("app.081b7f707ebb", "Оборудование и серийные номера")}</span><span>{copy("app.f209fa398b11", "Выплаты и трудозатраты")}</span></div>
  </section>;
}
