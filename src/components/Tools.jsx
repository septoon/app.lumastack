const tools = [
  {
    number: "A",
    title: "Автомобиль и обслуживание",
    text: "Несколько автомобилей, основной автомобиль, пробег, работы, запчасти и расходы по обслуживанию.",
    path: "M20 43h80l-9-21H39L20 43Zm11 0a9 9 0 1 0 18 0m39 0a9 9 0 1 0 18 0M43 22l8-10h28l12 10",
  },
  {
    number: "B",
    title: "Топливо",
    text: "Заправки, фактический расход, норма, остаток или перерасход, компенсации и задолженность по месяцам.",
    path: "M34 58V8h37v50M28 58h50M43 18h19v13H43zM71 20h8l8 8v20c0 8 11 8 11 0V23",
  },
  {
    number: "C",
    title: "Выплаты, трудозатраты и инвентарь",
    text: "Периоды выплат, расчётные листки, время работы и дороги, оборудование инженера по моделям и серийным номерам.",
    path: "M17 15h86v38H17zM29 26h26M29 35h17M74 23v22M83 23v22M92 23v22",
  },
];

export default function Tools() {
  return (
    <>
      <section className="tools section" aria-labelledby="tools-heading">
        <div className="container">
          <header className="section-intro reveal">
            <p className="section-index">03 / Дополнительные разделы</p>
            <h2 id="tools-heading">Учёт вне маршрута.</h2>
            <p>Данные по автомобилю, топливу, выплатам и оборудованию доступны в отдельных разделах.</p>
          </header>
          <div className="tool-bands">
            {tools.map((tool, index) => (
              <article className={`tool-band reveal${index === 1 ? " tool-band-offset" : ""}`} key={tool.number}>
                <span className="tool-number">{tool.number}</span>
                <div><h3>{tool.title}</h3><p>{tool.text}</p></div>
                <svg aria-hidden="true" viewBox="0 0 120 64"><path d={tool.path} /></svg>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="install-transition section" aria-labelledby="install-transition-heading">
        <div className="container install-transition-inner reveal">
          <img src="/assets/app-icon.webp" width="1024" height="1024" alt="" />
          <div>
            <p className="section-index">04 / Установка</p>
            <h2 id="install-transition-heading">Готовы установить?</h2>
            <p>Выберите свой сценарий и пройдите шаги по порядку.</p>
          </div>
          <a className="button button-primary button-large" href="#installation">
            Перейти к установке
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6" /></svg>
          </a>
        </div>
      </section>
    </>
  );
}
