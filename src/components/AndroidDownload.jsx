import { SiteLink, useSite } from "../SiteContent";
import { releaseTextID } from "../siteConfig";
import { formatDate, formatSize } from "../releases";
export function ReleaseStatus({ state }) {
  const { text: copy } = useSite();
  if (state.status === "ready") return null;
  return (
    <div className="release-status" role="status">
      <p>
        {state.status === "loading"
          ? copy("androiddownload.b06faf8a5739", "Проверяем доступность релиза…")
          : state.error}
      </p>
      {state.status === "error" && (
        <button className="text-link" type="button" onClick={state.retry}>{copy("androiddownload.dc7dbeb80969", "Проверить снова")}</button>
      )}
    </div>
  );
}
export default function AndroidDownload({ state }) {
  const { text: copy } = useSite();
  const r = state.release;
  return (
    <section className="download-panel" aria-labelledby="android-release-title">
      <div className="release-heading">
        <img src="/assets/app-icon.webp" width="64" height="64" alt="" />
        <div>
          <h2 id="android-release-title">{copy("androiddownload.15967bde3488", "Инженер для Android")}</h2>
          <p>{copy("androiddownload.5ad369b866b1", "Прямая установка APK")}</p>
        </div>
      </div>
      <ReleaseStatus state={state} />
      {state.status === "ready" && (
        <>
          <dl className="release-facts">
            <div>
              <dt>{copy("androiddownload.c39948923340", "Версия")}</dt>
              <dd>
                {r.versionName} <span>{"("}{r.versionCode}{")"}</span>
              </dd>
            </div>
            <div>
              <dt>{copy("androiddownload.572095d4a787", "Размер")}</dt>
              <dd>{formatSize(r.size)}</dd>
            </div>
            <div>
              <dt>{copy("androiddownload.382ded9c6877", "Опубликовано")}</dt>
              <dd>{formatDate(r.publishedAt)}</dd>
            </div>
            <div>
              <dt>{copy("androiddownload.79b5bfb4673a", "Совместимость")}</dt>
              <dd>{copy("androiddownload.8d8f588955d7", "Android SDK ")}{r.minSdk}{"+"}{r.minSdk === 26 ? copy("androiddownload.bfcee7f086b4", " (Android 8.0+)") : ""}
              </dd>
            </div>
          </dl>
          <SiteLink
            className="button button-primary button-large"
            href={r.downloadUrl}
            download
          >{copy("androiddownload.3e5bd8d625a6", "Скачать APK · ")}{formatSize(r.size)}
          </SiteLink>
          <details className="checksum">
            <summary>{copy("androiddownload.1d62012e3b8e", "Контрольная сумма SHA-256")}</summary>
            <code>{r.sha256}</code>
          </details>
          <h3>{copy("androiddownload.bc016a1cbc97", "Что изменилось")}</h3>
          <ul>
            {r.changelog.map((value, index) => ({ index, value: copy(releaseTextID("android", r, index), value) })).filter(note => note.value).map(note => <li key={note.index}>{note.value}</li>)}
          </ul>
        </>
      )}
    </section>
  );
}
