import { useEffect, useState } from "react";
import { validateAndroidRelease, iosVersions } from "../releases";
export function useRelease(platform) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ status: "loading" });
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setState({ status: "loading" });
    (async () => {
      const response = await fetch(
        platform === "android" ? "/android/latest.json" : "/source.json",
        { cache: "no-store", signal: controller.signal },
      );
      if (!response.ok)
        throw new Error(
          platform === "android" && response.status === 404
            ? "Android-релиз ещё не опубликован."
            : "Не удалось загрузить данные релиза.",
        );
      const data = await response.json();
      if (platform === "android") {
        validateAndroidRelease(data);
        const apk = await fetch(data.downloadUrl, {
          method: "HEAD",
          cache: "no-store",
          signal: controller.signal,
        });
        if (
          !apk.ok ||
          Number(apk.headers.get("content-length")) !== data.size ||
          /text\/html/.test(apk.headers.get("content-type") || "")
        )
          throw new Error("APK недоступен или загружен не полностью.");
        if (active && !controller.signal.aborted)
          setState({ status: "ready", release: data });
      } else if (active && !controller.signal.aborted)
        setState({ status: "ready", versions: iosVersions(data) });
    })()
      .catch((error) => {
        if (!active) return;
        setState({
          status: "error",
          error:
            error.name === "AbortError"
              ? "Сервер не ответил вовремя."
              : error instanceof SyntaxError
                ? "Сервер вернул некорректные данные релиза."
                : error instanceof TypeError
                  ? "Не удалось связаться с сервером релизов."
                  : error.message,
        });
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [platform, attempt]);
  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
