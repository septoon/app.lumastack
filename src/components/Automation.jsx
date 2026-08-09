const pathSteps = [
  ["Откройте создание", <><b>Быстрые команды → Автоматизация → +</b>. Если появится выбор, нажмите <b>«Создать автоматизацию для себя»</b>.</>],
  ["Задайте время запуска", <>Выберите <b>«Время суток»</b>, укажите время и повтор <b>«Ежедневно»</b>.</>],
  ["Уберите запрос подтверждения", <>Выберите <b>«Выполнять немедленно»</b>. В старом интерфейсе отключите <b>«Спрашивать до запуска»</b>.</>],
  ["Добавьте действие", <>Нажмите <b>«Новая пустая автоматизация»</b> или <b>«Добавить действие»</b>, найдите приложение и выберите действие.</>],
  ["Сохраните и повторите", <>Нажмите <b>«Готово»</b>. В итоге в списке должно быть три записи.</>],
];

const schedule = [
  ["03:00", "LocalDevVPN", "Start LocalDevVPN", "Запускает VPN до обращения SideStore к службам устройства."],
  ["03:02", "SideStore", "Refresh All Apps", "Продлевает подпись SideStore и установленных через него приложений."],
  ["03:30", "LocalDevVPN", "Stop LocalDevVPN", "Выключает VPN после завершения обновления."],
];

export default function Automation() {
  return (
    <section className="automation section" id="automation" aria-labelledby="automation-heading">
      <div className="container">
        <header className="section-intro section-intro-wide reveal">
          <p className="section-index">После установки</p>
          <h2 id="automation-heading">Настройте автоматическое переподписание.</h2>
          <p>Создайте три отдельные личные автоматизации. Они включат LocalDevVPN, обновят подпись приложений через SideStore и затем выключат VPN.</p>
        </header>

        <ul className="requirements" aria-label="Что проверить перед настройкой автоматизации">
          {["SideStore авторизован", "Ручной Refresh работает", "LocalDevVPN подключается", "iPhone подключён к Wi‑Fi"].map((item) => <li key={item}>{item}</li>)}
        </ul>

        <div className="automation-layout">
          <div className="automation-path">
            <h3>Как создать автоматизацию</h3>
            <p>Повторите последовательность три раза, меняя только время и действие.</p>
            <ol>
              {pathSteps.map(([title, text], index) => (
                <li key={title}>
                  <span>{index + 1}</span>
                  <div><strong>{title}</strong><p>{text}</p></div>
                </li>
              ))}
            </ol>
          </div>

          <div className="automation-schedule" aria-label="Расписание переподписания">
            {schedule.map(([time, app, action, text]) => (
              <article key={time}>
                <time dateTime={time}>{time}</time>
                <div><span>{app}</span><strong>{action}</strong><p>{text}</p></div>
              </article>
            ))}
            <div className="warning">
              <strong>Три отдельные автоматизации</strong>
              <span>Не добавляйте <b>Stop LocalDevVPN</b> в одну цепочку с <b>Refresh All Apps</b>: преждевременное отключение VPN может оборвать переподписание.</span>
            </div>
          </div>
        </div>

        <details className="help-details">
          <summary>Как проверить и что делать, если автоматизация не сработала</summary>
          <div>
            <ul>
              <li>Выполните ручной Refresh в SideStore. В <strong>My Apps</strong> срок должен снова приблизиться к <strong>7 DAYS</strong>.</li>
              <li>Если действия нет в поиске, откройте LocalDevVPN и SideStore хотя бы один раз, затем заново откройте «Быстрые команды».</li>
              <li>При ошибке Wi‑Fi/VPN проверьте Wi‑Fi, LocalDevVPN, авторизацию SideStore и временно отключите DNS-блокировщик.</li>
              <li>После обновления или сброса iPhone pairing file может стать недействительным — замените его через iloader.</li>
            </ul>
            <p>
              Подробнее:{" "}
              <a className="text-link" href="https://support.apple.com/ru-ru/guide/shortcuts/apdfbdbd7123/ios" target="_blank" rel="noopener noreferrer">автоматизации в «Быстрых командах»</a>{" "}
              и{" "}
              <a className="text-link" href="https://docs.sidestore.io/docs/troubleshooting/common-issues" target="_blank" rel="noopener noreferrer">решение проблем SideStore</a>.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
