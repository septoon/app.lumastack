import { useState } from "react";
import { SiteContext, SiteSection, SiteLink, useSite } from "./SiteContent";
import { fetchSiteConfig, pageVisible, releaseTextID, siteText } from "./siteConfig";
import Header, { SIDESTORE_URL } from "./components/Header";
import Hero from "./components/Hero";
import ProductPreview from "./components/ProductPreview";
import { usePortalMotion } from "./hooks/usePortalMotion";
import AndroidDownload, { ReleaseStatus } from "./components/AndroidDownload";
import Installation from "./components/Installation";
import Automation from "./components/Automation";
import FAQ from "./components/FAQ";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { useRelease } from "./hooks/useReleases";
import { formatSize, formatDate, validateAndroidRelease } from "./releases";
import { useEffect } from "react";
function navigation(copy) { return [
  ["/ios", copy("app.695a84499d93", "iOS и SideStore")],
  ["/android", copy("app.276d35c116d8", "Android APK")],
  ["/changelog", copy("app.d7ebbab7cfa9", "История обновлений")],
  ["/help", copy("app.36f798a63c92", "Помощь")],
]; }
function Footer() {
  const { text: copy } = useSite();
  return (
    <footer className="portal-footer container">
      <div>
        <SiteLink className="brand" href="/">{copy("app.88d71676fa80", "Инженер")}</SiteLink>
        <p>{copy("app.59b7bb731c07", "Рабочий день под контролем.")}</p>
      </div>
      <nav aria-label={copy("app.b1bde02cc6d6", "Навигация в подвале")}>
        {navigation(copy).map(([url, text]) => (
          <SiteLink href={url} key={url}>
            {text}
          </SiteLink>
        ))}
        <SiteLink href="/source.json">{copy("app.e717b58a22e2", "Источник SideStore")}</SiteLink>
        <SiteLink href="/assets/device-credits.txt">{copy("app.253dfdd723c0", "Авторы графики")}</SiteLink>
      </nav>
    </footer>
  );
}
function PageIntro({ title, text }) {
  const { text: copy } = useSite();
  return (
    <div className="container page-intro">
      <SiteLink className="text-link" href="/">{copy("app.d328e53dc456", "Главная")}</SiteLink>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}
function IOSRelease({ state }) {
  const { text: copy } = useSite();
  const r = state.versions?.[0];
  return (
    <section className="download-panel">
      <div className="release-heading">
        <img src="/assets/app-icon.webp" width="64" height="64" alt="" />
        <div>
          <h2>{copy("app.2f7317707ea7", "Инженер для iOS")}</h2>
          <p>{copy("app.83b27fcb6d90", "Установка через SideStore")}</p>
        </div>
      </div>
      <ReleaseStatus state={state} />
      {state.status === "ready" && (
        <>
          <dl className="release-facts">
            <div>
              <dt>{copy("app.c39948923340", "Версия")}</dt>
              <dd>
                {r.version}{" ("}{r.buildVersion}{")"}</dd>
            </div>
            <div>
              <dt>{copy("app.572095d4a787", "Размер")}</dt>
              <dd>{formatSize(r.size)}</dd>
            </div>
            <div>
              <dt>{copy("app.79b5bfb4673a", "Совместимость")}</dt>
              <dd>{copy("app.4a29336a4961", "iOS ")}{r.minOSVersion}{"+"}</dd>
            </div>
          </dl>
          <SiteLink className="button button-primary" href={SIDESTORE_URL}>{copy("app.9cb5f087c2b8", "Добавить в SideStore")}</SiteLink>
          <p className="small-note">{copy("app.b86ef1346ca2", "Сначала установите SideStore по инструкции ниже.")}</p>
        </>
      )}
    </section>
  );
}
function Platforms({ android, ios }) {
  const { text: copy } = useSite();
  const {site} = useSite();
  const [selected, setSelected] = useState(() =>
    /android/i.test(navigator.userAgent)
      ? "android"
      : /iPhone|iPad|iPod/.test(navigator.userAgent)
        ? "ios"
        : "",
  );
  return (
    <section className="container portal-section" id="download">
      <div className="section-heading">
        <div>
          <h2>{copy("app.0c107994ef84", "Установите на своё устройство")}</h2>
          <p>{copy("app.939aca016a9f", "Один рабочий инструмент. Два способа установки.")}</p>
        </div>
        <div
          className="platform-switch"
          role="group"
          aria-label={copy("app.52d21f4ef2e0", "Ваша платформа")}
        >
          <button
            aria-pressed={selected === "ios"}
            onClick={() => setSelected("ios")}
          >{copy("app.355f5e748485", "iOS")}</button>
          <button
            aria-pressed={selected === "android"}
            onClick={() => setSelected("android")}
          >{copy("app.6d612a86bee4", "Android")}</button>
        </div>
      </div>
      <div className="platform-grid">
        {[
          ["ios", copy("app.38fdf519314e", "iPhone"), copy("app.517896f01ddc", "Через SideStore"), ios],
          ["android", copy("app.6d612a86bee4", "Android"), copy("app.1f674e4155c3", "APK без магазина приложений"), android],
        ].filter(([id]) => pageVisible(site, `/${id}`)).map(([id, title, description, state]) => (
          <article
            className={`platform-card ${selected === id ? "selected" : ""}`}
            key={id}
          >
            <div className="platform-title">
              <h3>{title}</h3>
              {selected === id && <span>{copy("app.9cf249e2a881", "Выбрано")}</span>}
            </div>
            <p>{description}</p>
            {state.status === "ready" ? (
              <p className="platform-version">
                {id === "ios"
                  ? state.versions[0].version
                  : state.release.versionName}
                <span>
                  {formatSize(
                    id === "ios" ? state.versions[0].size : state.release.size,
                  )}
                </span>
              </p>
            ) : (
              <ReleaseStatus state={state} />
            )}
            <SiteLink className="button button-secondary" href={`/${id}`}>
              {id === "ios" ? copy("app.7813a4bb264e", "Установка на iPhone") : copy("app.a53c123ec7d6", "Релиз и установка APK")}
            </SiteLink>
          </article>
        ))}
      </div>
    </section>
  );
}
function features(copy) { return [
  [
    copy("app.9a7abebf0298", "Заявки и маршрут"),
    copy("app.1cd02d7980dd", "Откройте активные заявки, проверьте адреса и постройте маршрут в Яндекс.Картах."),
    "/assets/screen-home.webp",
  ],
  [
    copy("app.92d3172779f8", "Рабочие инструкции"),
    copy("app.c7e763c2819f", "Найдите нужную информацию в Wiki, пока работаете на объекте."),
    "/assets/screen-wiki.webp",
  ],
  [
    copy("app.b901d703c038", "Результаты дня"),
    copy("app.8efde53732ab", "Соберите данные о пробеге, заправках и выполненной работе."),
    "/assets/screen-analytics.webp",
  ],
]; }
function Home({ android, ios, reducedMotion }) {
  const { text: copy } = useSite();
  const {site, screenshots} = useSite();
  const images = screenshots("ios");
  return (
    <>
      <SiteSection id="home.hero"><Hero /></SiteSection>
      <SiteSection id="home.download"><Platforms android={android} ios={ios} /></SiteSection>
      <SiteSection id="home.features"><section className="container portal-section" id="features">
        <div className="section-heading">
          <div>
            <h2>{copy("app.21580877fedc", "От заявки до отчёта")}</h2>
            <p>{copy("app.b2a7338c8a17", "Всё, что нужно в течение смены, рядом.")}</p>
          </div>
          {images.length > 0 && <span className="small-note">{copy("app.bf7a7b6c958e", "На изображениях — версия для iOS")}</span>}
        </div>
        <div className="feature-grid">
          {features(copy).map(([title, text, image], index) => (
            <article className="feature-story" key={index}>
              <h3>{title}</h3>
              <p>{text}</p>
              {images[index] && <div className="feature-image">
                <img
                  src={images[index].imageUrl}
                  alt={images[index].altText}
                  width="402"
                  height="874"
                  loading="lazy"
                />
              </div>}
            </article>
          ))}
        </div>
        <div className="capability-list">
          <span>{copy("app.af6d4ea42203", "Автомобиль и топливо")}</span>
          <span>{copy("app.081b7f707ebb", "Оборудование и серийные номера")}</span>
          <span>{copy("app.f209fa398b11", "Выплаты и трудозатраты")}</span>
        </div>
      </section></SiteSection>
      <SiteSection id="home.workflow"><section className="workflow-section">
        <div className="container">
          <h2>{copy("app.2d3f8d7cb1dc", "Приложение на каждом этапе работы")}</h2>
          <div className="workflow-grid">
            {[
              [
                copy("app.19fcc71d2bd0", "Перед выездом"),
                copy("app.308b77c886f5", "Посмотрите заявки и адреса. Подготовьте маршрут и оборудование."),
              ],
              [
                copy("app.c372882e64bf", "На объекте"),
                copy("app.6d55c1bb2678", "Откройте рабочую инструкцию, найдите серийный номер, уточните данные заявки."),
              ],
              [
                copy("app.deb1411b0c1f", "В конце дня"),
                copy("app.bfa80664d541", "Проверьте пробег и заправки, подготовьте дневной отчёт."),
              ],
            ].map(([title, text], index) => (
              <article key={index}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section></SiteSection>
      <SiteSection id="home.updates"><section className="container portal-section">
        <div className="section-heading">
          <h2>{copy("app.8b651b4d73e6", "Последние обновления")}</h2>
          <SiteLink className="text-link" href="/changelog">{copy("app.c690e3cbb55a", "Вся история")}</SiteLink>
        </div>
        <div className="updates-grid">
          {pageVisible(site, "/ios") && <Latest state={ios} platform="iOS" />}
          {pageVisible(site, "/android") && <Latest state={android} platform="Android" />}
        </div>
      </section></SiteSection>
      <SiteSection id="home.cta"><div className="container final-cta">
        <h2>{copy("app.315b7b16dd60", "Готово к вашему рабочему дню.")}</h2>
        <SiteLink href="#download" className="button button-primary">{copy("app.1b93f1659870", "Выбрать платформу")}</SiteLink>
        <SiteLink href="/help" className="text-link">{copy("app.32072150adca", "Помощь с установкой")}</SiteLink>
      </div></SiteSection>
    </>
  );
}
function Latest({ state, platform }) {
  const {text: copy} = useSite();
  const r = platform === "iOS" ? state.versions?.[0] : state.release;
  return (
    <article className="update-entry">
      <h3>
        {platform}
        {r ? ` ${r.version || r.versionName}` : ""}
      </h3>
      <ReleaseStatus state={state} />
      {r && (
        <>
          <time dateTime={r.date || r.publishedAt}>
            {formatDate(r.date || r.publishedAt)}
          </time>
          <p>{platform === "iOS" ? copy(releaseTextID("ios", r), r.localizedDescription || "") : r.changelog?.map((note, index) => copy(releaseTextID("android", r, index), note)).filter(Boolean).join(" ")}</p>
        </>
      )}
    </article>
  );
}
function AndroidSteps() {
  const { text: copy } = useSite();
  return (
    <section className="installation-guide">
      <h2>{copy("app.4d6dd7e7fb52", "Как установить и обновить")}</h2>
      <ol>
        <li>
          <h3>{copy("app.5732f9b4fb2f", "Скачайте APK")}</h3>
          <p>{copy("app.d147f78d86ca", "Дождитесь завершения загрузки и откройте файл на Android.")}</p>
        </li>
        <li>
          <h3>{copy("app.b293dae32300", "Разрешите установку из этого источника")}</h3>
          <p>{copy("app.ad5574924a28", "Если система попросит, разрешите браузеру установку приложений. После установки разрешение можно отключить.")}</p>
        </li>
        <li>
          <h3>{copy("app.013b4f5768e0", "Подтвердите установку")}</h3>
          <p>{copy("app.8093aa882387", "При обновлении устанавливайте поверх текущей версии. Удалять приложение не нужно — так сохраняются локальные данные.")}</p>
        </li>
      </ol>
      <p className="notice">{copy("app.b3b77fa63e51", "Для обновления нужна та же подпись приложения. Если система сообщает о конфликте пакета, не удаляйте текущую версию: проверьте источник APK и обратитесь к администратору.")}</p>
      <SiteLink className="text-link" href="/help">{copy("app.ade969043f43", "Ошибки установки и обновления")}</SiteLink>
    </section>
  );
}
function Changelog({ android, ios }) {
  const { text: copy } = useSite();
  const [history, setHistory] = useState(null);
  useEffect(() => {
    const c = new AbortController();
    fetch("/android/history.json", { cache: "no-store", signal: c.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then((rows) => {
        if (!Array.isArray(rows)) throw Error();
        setHistory(rows.map(validateAndroidRelease));
      })
      .catch(() => setHistory([]));
    return () => c.abort();
  }, []);
  const releases = [
    ...(ios.versions || []).map((r) => ({
      ...r,
      platform: "iOS",
      name: r.version,
      at: r.date,
      notes: [r.localizedDescription || copy("app.f6df1111643f", "Описание не указано.")],
    })),
    ...(history?.length
      ? history
      : android.release
        ? [android.release]
        : []
    ).map((r) => ({
      ...r,
      platform: "Android",
      name: r.versionName,
      at: r.publishedAt,
      notes: r.changelog,
    })),
  ].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return (
    <>
      <PageIntro
        title={copy("app.d7ebbab7cfa9", "История обновлений")}
        text={copy("app.42659231dbcd", "Версии и изменения из опубликованных каталогов iOS и Android.")}
      />
      <div className="container changelog">
        <ReleaseStatus state={ios} />
        <ReleaseStatus state={android} />
        {history?.length === 0 && android.release && (
          <p className="notice">{copy("app.9521d3457cfe", "Архив Android недоступен. Показана только текущая версия.")}</p>
        )}
        {releases.map((r) => (
          <article
            className="changelog-entry"
            key={`${r.platform}-${r.name}-${r.buildVersion || r.versionCode}`}
          >
            <time dateTime={r.at}>{formatDate(r.at)}</time>
            <div>
              <h2>
                {r.platform} {r.name}
              </h2>
              <ul>
                {r.notes.map((value, index) => ({ index, value: copy(releaseTextID(r.platform === "iOS" ? "ios" : "android", r, index), value) })).filter(note => note.value).map(note => <li key={note.index}>{note.value}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
function Portal({ site }) {
  const { text: copy } = useSite();
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const android = useRelease("android"),
    ios = useRelease("ios");
  const reducedMotion = useReducedMotion();
  usePortalMotion(reducedMotion, site);
  const [toast, setToast] = useState("");
  useEffect(() => {
    const page = site.content?.pages?.find(page => page.path === path);
    if (!page) return;
    document.title = page.seoTitle;
    for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) document.querySelector(selector)?.setAttribute("content", page.seoDescription);
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) document.querySelector(selector)?.setAttribute("content", page.seoTitle);
  }, [site, path]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);
  return (
    <>
      <SiteLink className="skip-link" href="#content">{copy("app.f35ba214e95d", "Перейти к содержимому")}</SiteLink>
      <SiteSection id="shared.header"><Header /></SiteSection>
      <main id="content">
        {!pageVisible(site, path) ? <PageIntro title={copy("app.77b0ea9ab638", "Страница временно недоступна")} text={copy("app.7b45c0ff8503", "Выберите другой раздел сайта.")} /> : path === "/" ? (
          <Home android={android} ios={ios} reducedMotion={reducedMotion} />
        ) : path === "/android" ? (
          <>
            <PageIntro
              title={copy("app.15967bde3488", "Инженер для Android")}
              text={copy("app.42a628986032", "Скачайте APK напрямую и подтвердите установку в системном окне Android.")}
            />
            <div className="container platform-detail">
              <SiteSection id="android.release"><AndroidDownload state={android} /></SiteSection>
              <SiteSection id="android.installation"><AndroidSteps /></SiteSection>
            </div>
            <SiteSection id="android.screenshots"><section
              className="container android-showcase"
              aria-labelledby="android-preview-heading"
            >
              <ProductPreview
                fixedPlatform="android"
              />
              <div>
                <h2 id="android-preview-heading">{copy("app.8d7706cc2f3a", "Интерфейс приложения для Android")}</h2>
                <p>{copy("app.5e8c3b8a8bd9", "Экраны приложения для телефона и планшета.")}</p>
                <SiteLink
                  className="button button-secondary"
                  href="#android-release-title"
                >{copy("app.5485bc972628", "К скачиванию APK")}</SiteLink>
              </div>
            </section></SiteSection>
          </>
        ) : path === "/ios" ? (
          <>
            <PageIntro
              title={copy("app.40dbfea03c84", "Инженер для iPhone")}
              text={copy("app.6e47b1b5943c", "Установите приложение через SideStore. Источник и обновления доступны по прежнему адресу.")}
            />
            <SiteSection id="ios.release"><div className="container ios-download">
              <IOSRelease state={ios} />
            </div></SiteSection>
            <SiteSection id="ios.screenshots"><div className="container ios-showcase"><ProductPreview fixedPlatform="ios" /></div></SiteSection>
            <SiteSection id="ios.installation"><Installation showToast={setToast} /></SiteSection>
            <SiteSection id="ios.automation"><Automation /></SiteSection>
          </>
        ) : path === "/changelog" ? (
          <SiteSection id="changelog.releases"><Changelog android={android} ios={ios} /></SiteSection>
        ) : path === "/help" ? (
          <>
            <PageIntro
              title={copy("app.36f798a63c92", "Помощь")}
              text={copy("app.32a7e78c976e", "Установка, обновления и решение частых проблем.")}
            />
            <SiteSection id="help.android"><div className="container help-content">
              <AndroidSteps />
              <h2>{copy("app.2a6bf4e529c3", "Обновление внутри Android")}</h2>
              <p>{copy("app.709015ef3e79", "В версиях со встроенной проверкой откройте Настройки → Проверить обновления. Приложение проверит файл и предложит системную установку. Если такого пункта ещё нет, скачайте APK со страницы Android.")}</p>
              {[
                [
                  copy("app.47f4d01314e6", "Загрузка не завершилась"),
                  copy("app.a5a9a409b33b", "Проверьте сеть и свободное место. Повторите загрузку; повреждённый файл устанавливать нельзя."),
                ],
                [
                  copy("app.4fc1ff588337", "Контрольная сумма или подпись не совпадает"),
                  copy("app.6ed30d7c029b", "Повторите загрузку из официального источника. Не удаляйте установленное приложение и не используйте файл с ошибкой проверки."),
                ],
                [
                  copy("app.128190cd9958", "Нет разрешения на установку"),
                  copy("app.b210edb47b91", "Разрешите установку для браузера либо для «Инженер» в системных настройках, затем вернитесь и повторите установку."),
                ],
                [
                  copy("app.945c1efb4a24", "Установка отменена"),
                  copy("app.9c01aeeccc39", "Приложение продолжит работать в текущей версии. Повторите установку, когда будете готовы."),
                ],
              ].map(([q, a], index) => (
                <details key={index}>
                  <summary>{q}</summary>
                  <p>{a}</p>
                </details>
              ))}
              <SiteLink className="button button-secondary" href="/ios">{copy("app.261c2d4e8410", "Инструкция для iOS")}</SiteLink>
            </div></SiteSection>
            <SiteSection id="help.faq"><FAQ showToast={setToast} /></SiteSection>
          </>
        ) : (
          <PageIntro
            title={copy("app.af9d33066ad6", "Страница не найдена")}
            text={copy("app.a7562ac3fcbd", "Выберите платформу или откройте главную страницу.")}
          />
        )}
      </main>
      <SiteSection id="shared.footer"><Footer /></SiteSection>
      <div className={`toast${toast ? " is-visible" : ""}`} role="status">
        {toast}
      </div>
    </>
  );
}

export default function App() {
  const { text: copy } = useSite();
  const [site, setSite] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    let request;
    const refresh = async () => {
      request?.abort();
      const controller = new AbortController();
      request = controller;
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const value = await fetchSiteConfig(controller.signal);
        if (active && request === controller) { setSite(current => JSON.stringify(current) === JSON.stringify(value) ? current : value); setFailed(false); }
      } catch {
        if (active && request === controller) setFailed(true);
      } finally { clearTimeout(timeout); }
    };
    refresh();
    const timer = setInterval(() => { if (!document.hidden) refresh(); }, 30000);
    const focus = () => { if (!document.hidden) refresh(); };
    document.addEventListener("visibilitychange", focus);
    return () => { active = false; request?.abort(); clearInterval(timer); document.removeEventListener("visibilitychange", focus); };
  }, [attempt]);
  if (!site) return <main className="container page-intro" role="status"><p>{failed ? copy("app.d1cb17b3620b", "Не удалось загрузить сайт.") : copy("app.db491ef5033f", "Загрузка…")}</p>{failed && <button className="button button-secondary" onClick={() => setAttempt(n => n + 1)}>{copy("app.5189135a6110", "Повторить")}</button>}</main>;
  if (!site.isEnabled) return <main className="container page-intro"><h1>{siteText(site, "app.0ef1cda5becc", "Сайт временно недоступен")}</h1><p>{site.unavailableMessage}</p></main>;
  return <SiteContext.Provider value={site}><Portal site={site} /></SiteContext.Provider>;
}
