import { CopySourceButton } from "./Installation";
import { SIDESTORE_URL, SOURCE_URL } from "./Header";

const questions = [
  ["Какая версия iOS требуется?", "«Инженер» поддерживается только на устройствах с iOS 26.2 или новее. На более ранних версиях установка или запуск невозможны."],
  ["Кнопка не открывает SideStore", "Убедитесь, что SideStore уже установлен. Затем скопируйте адрес источника и добавьте его вручную в разделе Sources."],
  ["Нужно ли удалять старую версию перед обновлением?", "Нет. Устанавливайте новую версию поверх текущей через SideStore, чтобы сохранить локальные данные приложения."],
  ["Почему приложение перестало открываться?", "Возможно, закончился срок действия подписи. Подключитесь к Wi‑Fi, включите LocalDevVPN и выполните Refresh в SideStore."],
  ["Где появится новая версия?", "Обновление появится в SideStore внутри добавленного источника. При необходимости обновите список Sources вручную."],
];

export default function FAQ({ showToast }) {
  return (
    <>
      <section className="final-install section" aria-labelledby="final-install-heading">
        <div className="container final-install-inner reveal">
          <img src="/assets/app-icon.webp" width="1024" height="1024" alt="Иконка приложения «Инженер»" />
          <div className="final-install-copy">
            <h2 id="final-install-heading">«Инженер» готов к установке.</h2>
            <p>Добавьте источник в SideStore и установите приложение.</p>
            <div className="source-inline">
              <code>{SOURCE_URL}</code>
              <CopySourceButton showToast={showToast} />
            </div>
          </div>
          <a className="button button-primary button-large" href={SIDESTORE_URL}>Добавить в SideStore</a>
        </div>
      </section>

      <section className="faq-section section" id="faq" aria-labelledby="faq-heading">
        <div className="container">
          <header className="section-intro reveal">
            <p className="section-index">Помощь</p>
            <h2 id="faq-heading">Частые вопросы.</h2>
          </header>
          <div className="faq">
            {questions.map(([question, answer]) => (
              <details key={question}><summary>{question}</summary><div>{answer}</div></details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
