import { SiteLink, useSite } from "../SiteContent";
import { useEffect, useMemo, useRef, useState } from "react";
import { SIDESTORE_URL, SOURCE_URL } from "./Header";

const COMPLETED_STEPS_KEY = "engineer-install-steps";

async function copyText(value) {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error("copy failed");
}

export function CopySourceButton({ showToast }) {
  const { text: copy } = useSite();
  const [copied, setCopied] = useState(false);

  const copySource = async () => {
    try {
      await copyText(SOURCE_URL);
      setCopied(true);
      showToast(copy("installation.5109c917566d", "URL источника скопирован"));
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast(copy("installation.a2fe4e1c37c8", "Не удалось скопировать — выделите URL вручную"));
    }
  };

  return <button type="button" data-copy-source onClick={copySource}>{copied ? copy("installation.d2d08c715ee6", "Скопировано") : copy("installation.b5821b606f3a", "Скопировать URL")}</button>;
}

function SourceBlock({ showToast }) {
  const { text: copy } = useSite();
  return (
    <>
      <div className="source-inline">
        <code>{SOURCE_URL}</code>
        <CopySourceButton showToast={showToast} />
      </div>
      <SiteLink className="button button-primary" href={SIDESTORE_URL}>{copy("installation.9cb5f087c2b8", "Добавить в SideStore")}</SiteLink>
    </>
  );
}

function fullSteps(copy) { return [
  {
    id: "full-step-1", storageId: "full-prepare", rail: copy("installation.5ea5c68f20d4", "Подготовка"), title: copy("installation.e72cbba0e01f", "Подготовьте iPhone и компьютер"),
    text: <p>{copy("installation.6e5778af5d3f", "Установите ")}<strong>{copy("installation.d8d6736fe704", "LocalDevVPN")}</strong>{copy("installation.fb4f276a3a2a", " на iPhone. На Mac установите iloader; на Windows — сначала iTunes, затем iloader. Подключите iPhone и компьютер к Wi‑Fi.")}</p>,
  },
  {
    id: "full-step-2", storageId: "full-connect", rail: copy("installation.ab71afb97f2e", "Подключение"), title: copy("installation.b53dc73e770d", "Подключите iPhone кабелем"),
    text: <p>{copy("installation.bc1ec3e392db", "Разблокируйте iPhone, подключите его к компьютеру USB-кабелем, нажмите ")}<strong>{copy("installation.143fd3bb9875", "«Доверять»")}</strong>{copy("installation.6f08eb745298", " на iPhone и введите код-пароль. На Mac устройство должно появиться в Finder, на Windows — в iTunes.")}</p>,
  },
  {
    id: "full-step-3", storageId: "full-install-sidestore", rail: copy("installation.587a02a52965", "SideStore"), title: copy("installation.3884f40baa85", "Установите SideStore через iloader"),
    text: <p>{copy("installation.cef2279e8f63", "Откройте iloader, войдите в Apple Account, выберите подключённый iPhone и нажмите ")}<strong>{copy("installation.a98da0a9febd", "Install SideStore (Stable)")}</strong>{copy("installation.cdaa615062b1", ". Дождитесь завершения установки и не отключайте кабель.")}</p>,
  },
  {
    id: "full-step-4", storageId: "full-trust", rail: copy("installation.95eb6208f486", "Доверие"), title: copy("installation.20c847e0b7fc", "Разрешите запуск SideStore"),
    text: <p>{copy("installation.e471086182e0", "На iPhone откройте ")}<strong>{copy("installation.def239289163", "Настройки → Основные → VPN и управление устройством")}</strong>{copy("installation.b26de92af556", ". Выберите профиль с вашим Apple Account, нажмите ")}<strong>{copy("installation.0b52a9f6d3c3", "«Доверять» / «Разрешить и перезагрузить»")}</strong>{copy("installation.214457d9bc8e", " и подтвердите действие код-паролем.")}</p>,
  },
  {
    id: "full-step-5", storageId: "full-developer-mode", rail: copy("installation.eea204cb2afe", "Режим разработчика"), title: copy("installation.2e85c9669010", "Включите режим разработчика"),
    text: <p>{copy("installation.fa36e3acdaa0", "Откройте ")}<strong>{copy("installation.a741f3b1d04b", "Настройки → Конфиденциальность и безопасность → Режим разработчика")}</strong>{copy("installation.7f05ff78c6d8", ", включите его и согласитесь на перезагрузку iPhone. После запуска подтвердите включение.")}</p>,
  },
  {
    id: "full-step-6", storageId: "full-finish-sidestore", rail: copy("installation.7c50e466fc25", "Настройка"), title: copy("installation.8b12d4a08190", "Завершите настройку SideStore"),
    text: <p>{copy("installation.2f353bed2ca0", "Откройте LocalDevVPN и нажмите ")}<strong>{copy("installation.1a2303ede074", "Connect")}</strong>{copy("installation.96e0700ef0ff", ". Затем откройте SideStore, войдите в тот же Apple Account, перейдите в ")}<strong>{copy("installation.ff7e51389550", "My Apps")}</strong>{copy("installation.30bafde2e1f7", " и нажмите счётчик ")}<strong>{copy("installation.24b6ab7fc4d7", "7 DAYS")}</strong>{copy("installation.8985499c83d0", " рядом с SideStore. Запрос сертификата подтвердите кнопкой ")}<strong>{copy("installation.85a39ab345d6", "Yes")}</strong>{copy("installation.d8fc89173cfe", " или ")}<strong>{copy("installation.c7b4a057f059", "Refresh Now")}</strong>{"."}</p>,
  },
  {
    id: "full-step-7", storageId: "full-add-source", rail: copy("installation.56e46960c104", "Источник"), title: copy("installation.ee5507c91219", "Добавьте источник приложения"),
    text: <p>{copy("installation.fdbee65b45e7", "Откройте эту страницу на iPhone и нажмите ")}<strong>{copy("installation.189dde643ae4", "«Добавить в SideStore»")}</strong>{copy("installation.458c3dc49dcd", ". Если ссылка не открылась, скопируйте адрес ниже и добавьте его вручную в разделе ")}<strong>{copy("installation.caf85b0888d7", "Sources")}</strong>{"."}</p>,
    source: true,
  },
  {
    id: "full-step-8", storageId: "full-install-engineer", rail: copy("installation.26b855cc1660", "Приложение"), title: copy("installation.8a01ba223ebd", "Установите «Инженер»"),
    text: <p>{copy("installation.038e0f48b602", "В SideStore откройте добавленный источник, выберите «Инженер» и нажмите ")}<strong>{copy("installation.e720efa79df7", "Free / Install")}</strong>{copy("installation.3cd62abe7db7", ". До завершения установки оставьте Wi‑Fi и LocalDevVPN включёнными.")}</p>,
  },
  {
    id: "full-step-9", storageId: "full-update", rail: copy("installation.455471db0cfb", "Обновления"), title: copy("installation.b99783d1e0a3", "Обновляйте без компьютера"),
    text: (
      <>
        <p>{copy("installation.f8f4d59291a4", "Для обновления подключитесь к Wi‑Fi, включите LocalDevVPN, обновите источник в ")}<strong>{copy("installation.caf85b0888d7", "Sources")}</strong>{copy("installation.8a5268bced2f", " и нажмите ")}<strong>{copy("installation.c1c1009d3f37", "Update")}</strong>{copy("installation.ce8bf77072df", " у приложения. В ")}<strong>{copy("installation.ff7e51389550", "My Apps")}</strong>{copy("installation.bdfc96ac2004", " периодически выполняйте ")}<strong>{copy("installation.0e9161011702", "Refresh")}</strong>{copy("installation.cd945f437c80", ", чтобы подпись не истекла. Mac или ПК для этого не нужен.")}</p>
        <p>{copy("installation.22a8994df6f7", "Для автоматического обновления подписи настройте ")}<SiteLink className="text-link" href="#automation">{copy("installation.cb9c8b842aa0", "три автоматизации")}</SiteLink>{"."}</p>
      </>
    ),
    warning: (
      <div className="warning"><strong>{copy("installation.2ce386e77f86", "Ошибка 1006")}</strong><span>{copy("installation.8f79e0683d34", "SideStore → Settings → Reset Pairing File. Затем подключите iPhone кабелем, в iloader удалите сохранённую пару, выполните Pair и выберите Manage Pairing File → Place рядом с SideStore.")}</span></div>
    ),
  },
]; }

function quickSteps(copy) { return [
  {
    id: "quick-step-1", storageId: "quick-ready", rail: copy("installation.5ea5c68f20d4", "Подготовка"), title: copy("installation.53a11b35433b", "Подготовьте iPhone"),
    text: <p>{copy("installation.52a5f1eeb34b", "Подключитесь к Wi‑Fi, откройте ")}<strong>{copy("installation.d8d6736fe704", "LocalDevVPN")}</strong>{copy("installation.8a5268bced2f", " и нажмите ")}<strong>{copy("installation.1a2303ede074", "Connect")}</strong>{copy("installation.e7e6ab41d1e9", ". Не отключайте VPN до завершения установки.")}</p>,
  },
  {
    id: "quick-step-2", storageId: "quick-add-source", rail: copy("installation.56e46960c104", "Источник"), title: copy("installation.ee5507c91219", "Добавьте источник приложения"),
    text: <p>{copy("installation.52e560880c52", "Нажмите ")}<strong>{copy("installation.189dde643ae4", "«Добавить в SideStore»")}</strong>{copy("installation.f057301d4d28", ". Если ссылка не открылась, скопируйте адрес и добавьте его вручную в разделе ")}<strong>{copy("installation.caf85b0888d7", "Sources")}</strong>{"."}</p>,
    source: true,
  },
  {
    id: "quick-step-3", storageId: "quick-install-engineer", rail: copy("installation.26b855cc1660", "Приложение"), title: copy("installation.8a01ba223ebd", "Установите «Инженер»"),
    text: <p>{copy("installation.1c4bd9ea785d", "Откройте добавленный источник, выберите «Инженер» и нажмите ")}<strong>{copy("installation.e720efa79df7", "Free / Install")}</strong>{copy("installation.df69e70f52a6", ". Оставьте Wi‑Fi и LocalDevVPN включёнными до завершения установки.")}</p>,
  },
]; }

function readCompletedSteps() {
  try {
    const value = JSON.parse(window.localStorage.getItem(COMPLETED_STEPS_KEY) || "[]");
    return new Set(Array.isArray(value) ? value.filter((item) => typeof item === "string") : []);
  } catch {
    return new Set();
  }
}

function InstallPanel({ mode, steps, completed, toggleStep, showToast, labelledBy, hidden }) {
  const { text: copy } = useSite();
  const panelRef = useRef(null);
  const [activeRail, setActiveRail] = useState(steps[0].id);
  const completedCount = steps.filter((step) => completed.has(step.storageId)).length;
  const percentage = steps.length ? completedCount / steps.length * 100 : 0;

  useEffect(() => {
    const elements = [...panelRef.current.querySelectorAll(".install-step[id]")];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting && !entry.target.closest("[hidden]"))
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveRail(visible.target.id);
    }, { rootMargin: "-24% 0px -54%", threshold: [0.05, 0.2, 0.45] });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={panelRef}
      className="install-panel"
      id={`${mode}-install-panel`}
      role="tabpanel"
      aria-labelledby={labelledBy}
      data-install-panel={mode}
      hidden={hidden}
    >
      <ul className="requirements" aria-label={copy("installation.d3738082d130", "Что потребуется")}>
        {(mode === "full"
          ? [copy("installation.7f896156a7b2", "iPhone с iOS 26.2+"), copy("installation.9b221cef63bc", "Код-пароль на iPhone"), copy("installation.651d9a6c2fa8", "Wi‑Fi"), copy("installation.c17bf5fa4fab", "USB-кабель"), copy("installation.4808b90e46ad", "Apple Account")]
          : [copy("installation.7f896156a7b2", "iPhone с iOS 26.2+"), copy("installation.651d9a6c2fa8", "Wi‑Fi"), copy("installation.d8d6736fe704", "LocalDevVPN"), copy("installation.587a02a52965", "SideStore")]
        ).map((item) => <li key={item}>{item}</li>)}
      </ul>

      {mode === "full" && (
        <div className="prerequisites" aria-label={copy("installation.2e5ebf457d0c", "Программы для установки")}>
          <article>
            <div><span>{copy("installation.38fdf519314e", "iPhone")}</span><h3>{copy("installation.d8d6736fe704", "LocalDevVPN")}</h3><p>{copy("installation.a976314e0819", "Должен быть подключён при установке, обновлении и продлении подписи.")}</p></div>
            <SiteLink className="text-link" href="https://apps.apple.com/app/localdevvpn/id6755608044" target="_blank" rel="noopener noreferrer">{copy("installation.b10def11b29f", "Открыть в App Store")}</SiteLink>
          </article>
          <article>
            <div><span>{copy("installation.aed6b7aa2a05", "macOS")}</span><h3>{copy("installation.ec960de1c8b4", "iloader для Mac")}</h3><p>{copy("installation.29e0ae6c941b", "Универсальный DMG для Apple Silicon и Intel. Установите iloader в «Программы».")}</p></div>
            <SiteLink className="text-link" href="https://github.com/nab138/iloader/releases/latest/download/iloader-darwin-universal.dmg" target="_blank" rel="noopener noreferrer">{copy("installation.e2305c2d6090", "Скачать для macOS")}</SiteLink>
          </article>
          <article>
            <div><span>{copy("installation.d598026a9cbc", "Windows")}</span><h3>{copy("installation.12630424d728", "iTunes и iloader")}</h3><p>{copy("installation.02d61d788fa4", "Сначала iTunes, затем 64-битный iloader MSI. Windows 32-bit и Windows 10 ARM не поддерживаются.")}</p></div>
            <div className="prerequisite-actions">
              <SiteLink className="text-link" href="https://apps.microsoft.com/detail/9PB2MZ1ZMB1S" target="_blank" rel="noopener noreferrer">{copy("installation.d796f1646b2e", "Скачать iTunes")}</SiteLink>
              <SiteLink className="text-link" href="https://github.com/nab138/iloader/releases/latest/download/iloader-windows-x64.msi" target="_blank" rel="noopener noreferrer">{copy("installation.802dd6c44b2b", "Скачать iloader MSI")}</SiteLink>
            </div>
          </article>
        </div>
      )}

      <div className="install-workspace">
        <aside className="install-rail" aria-label={mode === "full" ? copy("installation.ebc8eef7c94e", "Шаги полной установки") : copy("installation.b157177cafdf", "Шаги быстрой установки")}>
          <div className="rail-progress">
            <span data-install-progress-text>{copy("installation.e5d9795f56e8", "Выполнено: ")}{completedCount}{copy("installation.e029cc4b39ce", " из ")}{steps.length}</span>
            <div aria-hidden="true"><i data-install-progress-bar style={{ width: `${percentage}%` }} /></div>
          </div>
          <ol>
            {steps.map((step, index) => (
              <li key={step.id}>
                <SiteLink className={activeRail === step.id ? "is-active" : ""} href={`#${step.id}`} data-rail-step={step.id}>
                  <span>{index + 1}</span>{step.rail}
                </SiteLink>
              </li>
            ))}
          </ol>
        </aside>

        <div className="install-steps">
          {steps.map((step, index) => {
            const isComplete = completed.has(step.storageId);
            return (
              <article className={`install-step${isComplete ? " is-complete" : ""}`} id={step.id} data-step-id={step.storageId} key={step.id}>
                <header>
                  <button
                    className="step-check"
                    type="button"
                    aria-pressed={isComplete}
                    aria-label={`Отметить шаг ${index + 1} выполненным`}
                    onClick={() => toggleStep(step.storageId)}
                  >{index + 1}</button>
                  <div><span>{copy("installation.cf19863c3e8b", "Шаг ")}{index + 1}{copy("installation.e029cc4b39ce", " из ")}{steps.length}</span><h3>{step.title}</h3></div>
                </header>
                {step.text}
                {step.source && <SourceBlock showToast={showToast} />}
                {step.warning}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Installation({ showToast }) {
  const { text: copy } = useSite();
  const [mode, setMode] = useState("full");
  const [completed, setCompleted] = useState(readCompletedSteps);
  const tabsRef = useRef([]);
  const note = mode === "full"
    ? copy("installation.042edfa0545b", "Понадобятся iPhone, USB-кабель и Mac или Windows-компьютер.")
    : copy("installation.4790d7614923", "SideStore должен быть уже установлен, авторизован и готов к обновлению приложений.");

  const toggleStep = (id) => {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { window.localStorage.setItem(COMPLETED_STEPS_KEY, JSON.stringify([...next])); } catch { /* current page stays functional */ }
      return next;
    });
  };

  const tabs = useMemo(() => [
    { mode: "quick", label: copy("installation.2e870a6d0035", "SideStore уже установлен") },
    { mode: "full", label: copy("installation.108ec33b6207", "Устанавливаю впервые") },
  ], [copy]);

  const onTabKeyDown = (event, index) => {
    let nextIndex = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    setMode(tabs[nextIndex].mode);
    tabsRef.current[nextIndex]?.focus();
  };

  return (
    <section className="installation section" id="installation" aria-labelledby="installation-heading">
      <div className="container">
        <header className="section-intro section-intro-wide reveal">
          <p className="section-index">{copy("installation.a95642d636d1", "Установка")}</p>
          <h2 id="installation-heading">{copy("installation.b1e29aa702f1", "Установите «Инженер» через SideStore.")}</h2>
          <p>{copy("installation.852845c76bb0", "Если SideStore уже настроен, достаточно добавить источник и установить приложение. Для первой установки понадобится компьютер.")}</p>
        </header>

        <div className="install-switch" role="tablist" aria-label={copy("installation.4b003ef83f39", "Сценарий установки")}>
          {tabs.map((tab, index) => (
            <button
              ref={(element) => { tabsRef.current[index] = element; }}
              key={tab.mode}
              type="button"
              role="tab"
              aria-selected={mode === tab.mode}
              aria-controls={`${tab.mode}-install-panel`}
              id={`${tab.mode}-install-tab`}
              tabIndex={mode === tab.mode ? 0 : -1}
              data-install-mode={tab.mode}
              onClick={() => setMode(tab.mode)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >{tab.label}</button>
          ))}
        </div>

        <p className="install-mode-note" id="install-mode-note" aria-live="polite">{note}</p>

        <InstallPanel mode="full" steps={fullSteps(copy)} completed={completed} toggleStep={toggleStep} showToast={showToast} labelledBy="full-install-tab" hidden={mode !== "full"} />
        <InstallPanel mode="quick" steps={quickSteps(copy)} completed={completed} toggleStep={toggleStep} showToast={showToast} labelledBy="quick-install-tab" hidden={mode !== "quick"} />

        <div className="official-guide">
          <span>{copy("installation.daa83910b436", "Нужна справка по SideStore?")}</span>
          <SiteLink className="text-link" href="https://docs.sidestore.io/docs/installation/install" target="_blank" rel="noopener noreferrer">{copy("installation.da415b98c19e", "Официальная инструкция SideStore")}</SiteLink>
        </div>
      </div>
    </section>
  );
}
