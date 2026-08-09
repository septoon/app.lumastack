import { Brand } from "./Header";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <Brand className="footer-brand" />
        <p>
          © {new Date().getFullYear()} «Инженер». Разработано студией{" "}
          <a href="https://lumastack.ru" target="_blank" rel="noopener noreferrer">Люмастек</a>.
        </p>
        <nav aria-label="Навигация в подвале">
          <a href="#features">Приложение</a>
          <a href="#installation">Установка</a>
          <a href="#automation">Автоматизация</a>
          <a href="#faq">Помощь</a>
        </nav>
      </div>
    </footer>
  );
}
