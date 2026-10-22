import { SiteLink, useSite } from "../SiteContent";
import { CopySourceButton } from "./Installation";
import { SIDESTORE_URL, SOURCE_URL } from "./Header";

function questions(copy) { return [
  [copy("faq.9219bf1a7de1", "Как установить приложение на Android?"), copy("faq.c4b1ee1516bf", "Скачайте APK в разделе Android, откройте файл и разрешите браузеру установку неизвестных приложений, если система попросит.")],
  [copy("faq.df044a3267f7", "Какая версия Android требуется?"), copy("faq.c86349e53cc2", "Поддерживается Android 8.0 или новее. Интерфейс адаптирован для телефонов и планшетов в портретной ориентации.")],
  [copy("faq.86d93d10a1ac", "Нужно ли удалять Android-версию перед обновлением?"), copy("faq.c9a4f6ff1f8f", "Нет. Устанавливайте новый подписанный APK поверх текущей версии, чтобы сохранить локальные данные.")],
  [copy("faq.b5e01e6c6500", "Какая версия iOS требуется?"), copy("faq.af7479d795db", "«Инженер» поддерживается только на устройствах с iOS 26.2 или новее. На более ранних версиях установка или запуск невозможны.")],
  [copy("faq.864886c8b34f", "Кнопка не открывает SideStore"), copy("faq.22a9eb0cc24d", "Убедитесь, что SideStore уже установлен. Затем скопируйте адрес источника и добавьте его вручную в разделе Sources.")],
  [copy("faq.00605fa3675f", "Нужно ли удалять iOS-версию перед обновлением?"), copy("faq.3dcbb3277ad2", "Нет. Устанавливайте новую версию поверх текущей через SideStore, чтобы сохранить локальные данные приложения.")],
  [copy("faq.594b6cbd331d", "Почему приложение перестало открываться?"), copy("faq.60b9e00bed04", "Возможно, закончился срок действия подписи. Подключитесь к Wi‑Fi, включите LocalDevVPN и выполните Refresh в SideStore.")],
  [copy("faq.34f6e3083452", "Где появится новая версия?"), copy("faq.5d3aa777c591", "Обновление появится в SideStore внутри добавленного источника. При необходимости обновите список Sources вручную.")],
]; }

export default function FAQ({ showToast }) {
  const { text: copy } = useSite();
  return (
    <>
      <section className="final-install section" aria-labelledby="final-install-heading">
        <div className="container final-install-inner reveal">
          <img src="/assets/app-icon.webp" width="1024" height="1024" alt={copy("faq.9c82db56bc5e", "Иконка приложения «Инженер»")} />
          <div className="final-install-copy">
            <h2 id="final-install-heading">{copy("faq.97adbf93d8ec", "«Инженер» готов к установке.")}</h2>
            <p>{copy("faq.32b7f26810a2", "Добавьте источник в SideStore и установите приложение.")}</p>
            <div className="source-inline">
              <code>{SOURCE_URL}</code>
              <CopySourceButton showToast={showToast} />
            </div>
          </div>
          <SiteLink className="button button-primary button-large" href={SIDESTORE_URL}>{copy("faq.9cb5f087c2b8", "Добавить в SideStore")}</SiteLink>
        </div>
      </section>

      <section className="faq-section section" id="faq" aria-labelledby="faq-heading">
        <div className="container">
          <header className="section-intro reveal">
            <p className="section-index">{copy("faq.36f798a63c92", "Помощь")}</p>
            <h2 id="faq-heading">{copy("faq.bf9560c861ef", "Частые вопросы.")}</h2>
          </header>
          <div className="faq">
            {questions(copy).map(([question, answer], index) => (
              <details key={index}><summary>{question}</summary><div>{answer}</div></details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
