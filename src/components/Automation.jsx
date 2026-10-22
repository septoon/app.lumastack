import { SiteLink, useSite } from "../SiteContent";
function pathSteps(copy) { return [
  [copy("automation.98272bb52bc8", "Откройте создание"), <><b>{copy("automation.e273e6eae2ee", "Быстрые команды → Автоматизация → +")}</b>{copy("automation.4fb4f39a5bd3", ". Если появится выбор, нажмите ")}<b>{copy("automation.fa7e7bff0b9c", "«Создать автоматизацию для себя»")}</b>{"."}</>],
  [copy("automation.47a2fd758476", "Задайте время запуска"), <>{copy("automation.2877d37e284d", "Выберите ")}<b>{copy("automation.2e526730c021", "«Время суток»")}</b>{copy("automation.c879ac4df172", ", укажите время и повтор ")}<b>{copy("automation.743ad81bce43", "«Ежедневно»")}</b>{"."}</>],
  [copy("automation.0e3020e1df70", "Уберите запрос подтверждения"), <>{copy("automation.2877d37e284d", "Выберите ")}<b>{copy("automation.88e7e7521603", "«Выполнять немедленно»")}</b>{copy("automation.313c6947fd09", ". В старом интерфейсе отключите ")}<b>{copy("automation.e81156776293", "«Спрашивать до запуска»")}</b>{"."}</>],
  [copy("automation.84acb2a7eb25", "Добавьте действие"), <>{copy("automation.52e560880c52", "Нажмите ")}<b>{copy("automation.e6f0e4bad42c", "«Новая пустая автоматизация»")}</b>{copy("automation.d8fc89173cfe", " или ")}<b>{copy("automation.7873ed330498", "«Добавить действие»")}</b>{copy("automation.8c52b9db9d44", ", найдите приложение и выберите действие.")}</>],
  [copy("automation.ce2c934c45cc", "Сохраните и повторите"), <>{copy("automation.52e560880c52", "Нажмите ")}<b>{copy("automation.b2f0bc4f5f38", "«Готово»")}</b>{copy("automation.1826dce4cc63", ". В итоге в списке должно быть три записи.")}</>],
]; }

function schedule(copy) { return [
  [copy("automation.20677a31b4a8", "03:00"), copy("automation.d8d6736fe704", "LocalDevVPN"), copy("automation.d5f71b796125", "Start LocalDevVPN"), copy("automation.aeaf770d6a5c", "Запускает VPN до обращения SideStore к службам устройства.")],
  [copy("automation.e89fed261d00", "03:02"), copy("automation.587a02a52965", "SideStore"), copy("automation.f9215ee1f759", "Refresh All Apps"), copy("automation.32934d038e82", "Продлевает подпись SideStore и установленных через него приложений.")],
  [copy("automation.92c5b0ebea8b", "03:30"), copy("automation.d8d6736fe704", "LocalDevVPN"), copy("automation.48a51d30e9ed", "Stop LocalDevVPN"), copy("automation.a0e98c233445", "Выключает VPN после завершения обновления.")],
]; }

export default function Automation() {
  const { text: copy } = useSite();
  return (
    <section className="automation section" id="automation" aria-labelledby="automation-heading">
      <div className="container">
        <header className="section-intro section-intro-wide reveal">
          <p className="section-index">{copy("automation.7f543ce2fc96", "После установки")}</p>
          <h2 id="automation-heading">{copy("automation.b1105686382e", "Настройте автоматическое переподписание.")}</h2>
          <p>{copy("automation.4903c7fa458f", "Создайте три отдельные личные автоматизации. Они включат LocalDevVPN, обновят подпись приложений через SideStore и затем выключат VPN.")}</p>
        </header>

        <ul className="requirements" aria-label={copy("automation.6a2f3d6ec467", "Что проверить перед настройкой автоматизации")}>
          {[copy("automation.71f777c7aec5", "SideStore авторизован"), copy("automation.68bd56fc6612", "Ручной Refresh работает"), copy("automation.d5d5ea396751", "LocalDevVPN подключается"), copy("automation.800d648a49c5", "iPhone подключён к Wi‑Fi")].map((item) => <li key={item}>{item}</li>)}
        </ul>

        <div className="automation-layout">
          <div className="automation-path">
            <h3>{copy("automation.936f71cab0a7", "Как создать автоматизацию")}</h3>
            <p>{copy("automation.51c7105f69a1", "Повторите последовательность три раза, меняя только время и действие.")}</p>
            <ol>
              {pathSteps(copy).map(([title, text], index) => (
                <li key={index}>
                  <span>{index + 1}</span>
                  <div><strong>{title}</strong><p>{text}</p></div>
                </li>
              ))}
            </ol>
          </div>

          <div className="automation-schedule" aria-label={copy("automation.1bd842ab8035", "Расписание переподписания")}>
            {schedule(copy).map(([time, app, action, text], index) => (
              <article key={index}>
                <time dateTime={time}>{time}</time>
                <div><span>{app}</span><strong>{action}</strong><p>{text}</p></div>
              </article>
            ))}
            <div className="warning">
              <strong>{copy("automation.8649a346830d", "Три отдельные автоматизации")}</strong>
              <span>{copy("automation.f931cf52da0e", "Не добавляйте ")}<b>{copy("automation.48a51d30e9ed", "Stop LocalDevVPN")}</b>{copy("automation.7f5fb5ded4f9", " в одну цепочку с ")}<b>{copy("automation.f9215ee1f759", "Refresh All Apps")}</b>{copy("automation.bbd09b02da40", ": преждевременное отключение VPN может оборвать переподписание.")}</span>
            </div>
          </div>
        </div>

        <details className="help-details">
          <summary>{copy("automation.f9b832718924", "Как проверить и что делать, если автоматизация не сработала")}</summary>
          <div>
            <ul>
              <li>{copy("automation.a6b2b62b488e", "Выполните ручной Refresh в SideStore. В ")}<strong>{copy("automation.ff7e51389550", "My Apps")}</strong>{copy("automation.7d4375830ef0", " срок должен снова приблизиться к ")}<strong>{copy("automation.24b6ab7fc4d7", "7 DAYS")}</strong>{"."}</li>
              <li>{copy("automation.8009155f524a", "Если действия нет в поиске, откройте LocalDevVPN и SideStore хотя бы один раз, затем заново откройте «Быстрые команды».")}</li>
              <li>{copy("automation.26fa93b6ae08", "При ошибке Wi‑Fi/VPN проверьте Wi‑Fi, LocalDevVPN, авторизацию SideStore и временно отключите DNS-блокировщик.")}</li>
              <li>{copy("automation.cea2c17a3580", "После обновления или сброса iPhone pairing file может стать недействительным — замените его через iloader.")}</li>
            </ul>
            <p>{copy("automation.079505fb637d", "Подробнее:")}{" "}
              <SiteLink className="text-link" href="https://support.apple.com/ru-ru/guide/shortcuts/apdfbdbd7123/ios" target="_blank" rel="noopener noreferrer">{copy("automation.0464c9e0ea7a", "автоматизации в «Быстрых командах»")}</SiteLink>{" "}{copy("automation.eead37caf818", "и")}{" "}
              <SiteLink className="text-link" href="https://docs.sidestore.io/docs/troubleshooting/common-issues" target="_blank" rel="noopener noreferrer">{copy("automation.8791fa221161", "решение проблем SideStore")}</SiteLink>{"."}</p>
          </div>
        </details>
      </div>
    </section>
  );
}
