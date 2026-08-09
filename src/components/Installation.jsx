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
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await copyText(SOURCE_URL);
      setCopied(true);
      showToast("URL источника скопирован");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast("Не удалось скопировать — выделите URL вручную");
    }
  };

  return <button type="button" data-copy-source onClick={copy}>{copied ? "Скопировано" : "Скопировать URL"}</button>;
}

function SourceBlock({ showToast }) {
  return (
    <>
      <div className="source-inline">
        <code>{SOURCE_URL}</code>
        <CopySourceButton showToast={showToast} />
      </div>
      <a className="button button-primary" href={SIDESTORE_URL}>Добавить в SideStore</a>
    </>
  );
}

const fullSteps = [
  {
    id: "full-step-1", storageId: "full-prepare", rail: "Подготовка", title: "Подготовьте iPhone и компьютер",
    text: <p>Установите <strong>LocalDevVPN</strong> на iPhone. На Mac установите iloader; на Windows — сначала iTunes, затем iloader. Подключите iPhone и компьютер к Wi‑Fi.</p>,
  },
  {
    id: "full-step-2", storageId: "full-connect", rail: "Подключение", title: "Подключите iPhone кабелем",
    text: <p>Разблокируйте iPhone, подключите его к компьютеру USB-кабелем, нажмите <strong>«Доверять»</strong> на iPhone и введите код-пароль. На Mac устройство должно появиться в Finder, на Windows — в iTunes.</p>,
  },
  {
    id: "full-step-3", storageId: "full-install-sidestore", rail: "SideStore", title: "Установите SideStore через iloader",
    text: <p>Откройте iloader, войдите в Apple Account, выберите подключённый iPhone и нажмите <strong>Install SideStore (Stable)</strong>. Дождитесь завершения установки и не отключайте кабель.</p>,
  },
  {
    id: "full-step-4", storageId: "full-trust", rail: "Доверие", title: "Разрешите запуск SideStore",
    text: <p>На iPhone откройте <strong>Настройки → Основные → VPN и управление устройством</strong>. Выберите профиль с вашим Apple Account, нажмите <strong>«Доверять» / «Разрешить и перезагрузить»</strong> и подтвердите действие код-паролем.</p>,
  },
  {
    id: "full-step-5", storageId: "full-developer-mode", rail: "Режим разработчика", title: "Включите режим разработчика",
    text: <p>Откройте <strong>Настройки → Конфиденциальность и безопасность → Режим разработчика</strong>, включите его и согласитесь на перезагрузку iPhone. После запуска подтвердите включение.</p>,
  },
  {
    id: "full-step-6", storageId: "full-finish-sidestore", rail: "Настройка", title: "Завершите настройку SideStore",
    text: <p>Откройте LocalDevVPN и нажмите <strong>Connect</strong>. Затем откройте SideStore, войдите в тот же Apple Account, перейдите в <strong>My Apps</strong> и нажмите счётчик <strong>7 DAYS</strong> рядом с SideStore. Запрос сертификата подтвердите кнопкой <strong>Yes</strong> или <strong>Refresh Now</strong>.</p>,
  },
  {
    id: "full-step-7", storageId: "full-add-source", rail: "Источник", title: "Добавьте источник приложения",
    text: <p>Откройте эту страницу на iPhone и нажмите <strong>«Добавить в SideStore»</strong>. Если ссылка не открылась, скопируйте адрес ниже и добавьте его вручную в разделе <strong>Sources</strong>.</p>,
    source: true,
  },
  {
    id: "full-step-8", storageId: "full-install-engineer", rail: "Приложение", title: "Установите «Инженер»",
    text: <p>В SideStore откройте добавленный источник, выберите «Инженер» и нажмите <strong>Free / Install</strong>. До завершения установки оставьте Wi‑Fi и LocalDevVPN включёнными.</p>,
  },
  {
    id: "full-step-9", storageId: "full-update", rail: "Обновления", title: "Обновляйте без компьютера",
    text: (
      <>
        <p>Для обновления подключитесь к Wi‑Fi, включите LocalDevVPN, обновите источник в <strong>Sources</strong> и нажмите <strong>Update</strong> у приложения. В <strong>My Apps</strong> периодически выполняйте <strong>Refresh</strong>, чтобы подпись не истекла. Mac или ПК для этого не нужен.</p>
        <p>Для автоматического обновления подписи настройте <a className="text-link" href="#automation">три автоматизации</a>.</p>
      </>
    ),
    warning: (
      <div className="warning"><strong>Ошибка 1006</strong><span>SideStore → Settings → Reset Pairing File. Затем подключите iPhone кабелем, в iloader удалите сохранённую пару, выполните Pair и выберите Manage Pairing File → Place рядом с SideStore.</span></div>
    ),
  },
];

const quickSteps = [
  {
    id: "quick-step-1", storageId: "quick-ready", rail: "Подготовка", title: "Подготовьте iPhone",
    text: <p>Подключитесь к Wi‑Fi, откройте <strong>LocalDevVPN</strong> и нажмите <strong>Connect</strong>. Не отключайте VPN до завершения установки.</p>,
  },
  {
    id: "quick-step-2", storageId: "quick-add-source", rail: "Источник", title: "Добавьте источник приложения",
    text: <p>Нажмите <strong>«Добавить в SideStore»</strong>. Если ссылка не открылась, скопируйте адрес и добавьте его вручную в разделе <strong>Sources</strong>.</p>,
    source: true,
  },
  {
    id: "quick-step-3", storageId: "quick-install-engineer", rail: "Приложение", title: "Установите «Инженер»",
    text: <p>Откройте добавленный источник, выберите «Инженер» и нажмите <strong>Free / Install</strong>. Оставьте Wi‑Fi и LocalDevVPN включёнными до завершения установки.</p>,
  },
];

function readCompletedSteps() {
  try {
    const value = JSON.parse(window.localStorage.getItem(COMPLETED_STEPS_KEY) || "[]");
    return new Set(Array.isArray(value) ? value.filter((item) => typeof item === "string") : []);
  } catch {
    return new Set();
  }
}

function InstallPanel({ mode, steps, completed, toggleStep, showToast, labelledBy, hidden }) {
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
      <ul className="requirements" aria-label="Что потребуется">
        {(mode === "full"
          ? ["iPhone с iOS 26.2+", "Код-пароль на iPhone", "Wi‑Fi", "USB-кабель", "Apple Account"]
          : ["iPhone с iOS 26.2+", "Wi‑Fi", "LocalDevVPN", "SideStore"]
        ).map((item) => <li key={item}>{item}</li>)}
      </ul>

      {mode === "full" && (
        <div className="prerequisites" aria-label="Программы для установки">
          <article>
            <div><span>iPhone</span><h3>LocalDevVPN</h3><p>Должен быть подключён при установке, обновлении и продлении подписи.</p></div>
            <a className="text-link" href="https://apps.apple.com/app/localdevvpn/id6755608044" target="_blank" rel="noopener noreferrer">Открыть в App Store</a>
          </article>
          <article>
            <div><span>macOS</span><h3>iloader для Mac</h3><p>Универсальный DMG для Apple Silicon и Intel. Установите iloader в «Программы».</p></div>
            <a className="text-link" href="https://github.com/nab138/iloader/releases/latest/download/iloader-darwin-universal.dmg" target="_blank" rel="noopener noreferrer">Скачать для macOS</a>
          </article>
          <article>
            <div><span>Windows</span><h3>iTunes и iloader</h3><p>Сначала iTunes, затем 64-битный iloader MSI. Windows 32-bit и Windows 10 ARM не поддерживаются.</p></div>
            <div className="prerequisite-actions">
              <a className="text-link" href="https://apps.microsoft.com/detail/9PB2MZ1ZMB1S" target="_blank" rel="noopener noreferrer">Скачать iTunes</a>
              <a className="text-link" href="https://github.com/nab138/iloader/releases/latest/download/iloader-windows-x64.msi" target="_blank" rel="noopener noreferrer">Скачать iloader MSI</a>
            </div>
          </article>
        </div>
      )}

      <div className="install-workspace">
        <aside className="install-rail" aria-label={mode === "full" ? "Шаги полной установки" : "Шаги быстрой установки"}>
          <div className="rail-progress">
            <span data-install-progress-text>Выполнено: {completedCount} из {steps.length}</span>
            <div aria-hidden="true"><i data-install-progress-bar style={{ width: `${percentage}%` }} /></div>
          </div>
          <ol>
            {steps.map((step, index) => (
              <li key={step.id}>
                <a className={activeRail === step.id ? "is-active" : ""} href={`#${step.id}`} data-rail-step={step.id}>
                  <span>{index + 1}</span>{step.rail}
                </a>
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
                  <div><span>Шаг {index + 1} из {steps.length}</span><h3>{step.title}</h3></div>
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
  const [mode, setMode] = useState("full");
  const [completed, setCompleted] = useState(readCompletedSteps);
  const tabsRef = useRef([]);
  const note = mode === "full"
    ? "Понадобятся iPhone, USB-кабель и Mac или Windows-компьютер."
    : "SideStore должен быть уже установлен, авторизован и готов к обновлению приложений.";

  const toggleStep = (id) => {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      try { window.localStorage.setItem(COMPLETED_STEPS_KEY, JSON.stringify([...next])); } catch { /* current page stays functional */ }
      return next;
    });
  };

  const tabs = useMemo(() => [
    { mode: "quick", label: "SideStore уже установлен" },
    { mode: "full", label: "Устанавливаю впервые" },
  ], []);

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
          <p className="section-index">Установка</p>
          <h2 id="installation-heading">Установите «Инженер» через SideStore.</h2>
          <p>Если SideStore уже настроен, достаточно добавить источник и установить приложение. Для первой установки понадобится компьютер.</p>
        </header>

        <div className="install-switch" role="tablist" aria-label="Сценарий установки">
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

        <InstallPanel mode="full" steps={fullSteps} completed={completed} toggleStep={toggleStep} showToast={showToast} labelledBy="full-install-tab" hidden={mode !== "full"} />
        <InstallPanel mode="quick" steps={quickSteps} completed={completed} toggleStep={toggleStep} showToast={showToast} labelledBy="quick-install-tab" hidden={mode !== "quick"} />

        <div className="official-guide">
          <span>Нужна справка по SideStore?</span>
          <a className="text-link" href="https://docs.sidestore.io/docs/installation/install" target="_blank" rel="noopener noreferrer">Официальная инструкция SideStore</a>
        </div>
      </div>
    </section>
  );
}
