export const ANDROID_ORIGIN = "https://app.lumastack.ru";
export function validateAndroidRelease(r) {
  if (
    !r ||
    r.schemaVersion !== 1 ||
    r.applicationId !== "ru.lumastack.lumawork" ||
    typeof r.versionName !== "string" ||
    !/^\d+\.\d+\.\d+$/.test(r.versionName) ||
    !Number.isSafeInteger(r.versionCode) ||
    r.versionCode < 1 ||
    r.versionCode > 2100000000 ||
    !Number.isSafeInteger(r.size) ||
    r.size < 1 ||
    r.size > 536870912 ||
    typeof r.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(r.sha256) ||
    typeof r.signingCertificateSHA256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(r.signingCertificateSHA256) ||
    !Number.isInteger(r.minSdk) ||
    r.minSdk < 26 ||
    typeof r.publishedAt !== "string" ||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(r.publishedAt) ||
    !Number.isFinite(Date.parse(r.publishedAt)) ||
    Date.parse(r.publishedAt) > Date.now() + 300000 ||
    !Array.isArray(r.changelog) ||
    r.changelog.length < 1 ||
    r.changelog.length > 100 ||
    r.changelog.some(
      (x) => typeof x !== "string" || !x.trim() || x.length > 4000,
    )
  )
    throw new Error("Некорректные данные Android-релиза.");
  const url = new URL(r.downloadUrl);
  if (
    url.origin !== ANDROID_ORIGIN ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !/^\/android\/releases\/LumaWork-Android-[\d.]+-\d+\.apk$/.test(
      url.pathname,
    ) ||
    url.pathname !==
      `/android/releases/LumaWork-Android-${r.versionName}-${r.versionCode}.apk`
  )
    throw new Error("Недопустимый адрес APK.");
  return r;
}
export function iosVersions(source) {
  const app = source?.apps?.find(
    (a) => a.bundleIdentifier === "septon.LumaWork",
  );
  if (!app || !Array.isArray(app.versions))
    throw new Error("Источник iOS недоступен.");
  const versions = app.versions.filter(
    (v) =>
      typeof v.version === "string" &&
      Number.isFinite(Date.parse(v.date)) &&
      typeof v.downloadURL === "string" &&
      v.downloadURL.startsWith(`${ANDROID_ORIGIN}/releases/`) &&
      v.downloadURL.endsWith(".ipa"),
  );
  if (!versions.length) throw new Error("В источнике iOS пока нет релизов.");
  return versions;
}
export const formatSize = (bytes) =>
  `${(bytes / 1048576).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} МБ`;
export const formatDate = (date) =>
  new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Simferopol",
  });
