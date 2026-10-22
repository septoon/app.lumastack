import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
const template = await readFile("dist/index.html", "utf8");
const pages = {
  ios: [
    "Инженер для iPhone — установка через SideStore",
    "Установка приложения Инженер на iPhone, настройка SideStore и источник обновлений.",
  ],
  android: [
    "Инженер для Android — скачать APK",
    "Актуальный APK приложения Инженер: версия, размер, SHA-256 и инструкция установки.",
  ],
  changelog: [
    "Инженер — история обновлений",
    "История опубликованных версий Инженер для iOS и Android.",
  ],
  help: [
    "Инженер — помощь с установкой",
    "Ответы на вопросы об установке и обновлении Инженер, разрешениях Android и SideStore.",
  ],
};
for (const [path, [title, description]] of Object.entries(pages)) {
  let html = template
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/(name="description"\s+content=")[^"]*/, `$1${description}`)
    .replace(/(property="og:title" content=")[^"]*/, `$1${title}`)
    .replace(/(property="og:description"\s+content=")[^"]*/, `$1${description}`)
    .replace(/(name="twitter:title" content=")[^"]*/, `$1${title}`)
    .replace(
      /(name="twitter:description"\s+content=")[^"]*/,
      `$1${description}`,
    )
    .replace(
      /(property="og:url" content=")[^"]*/,
      `$1https://app.lumastack.ru/${path}`,
    )
    .replace(
      /(rel="canonical" href=")[^"]*/,
      `$1https://app.lumastack.ru/${path}`,
    );
  await mkdir(`dist/${path}`, { recursive: true });
  await writeFile(`dist/${path}/index.html`, html);
}

// Historical IPA archives and source.json belong to the independent iOS publisher.
for (const directory of ["assets", "models", "screens"]) {
  await cp(`public/${directory}`, `dist/${directory}`, { recursive: true });
}
