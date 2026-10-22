import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAndroidRelease, iosVersions } from "../src/releases.js";
const valid = {
  schemaVersion: 1,
  applicationId: "ru.lumastack.lumawork",
  versionName: "0.1.1",
  versionCode: 2,
  downloadUrl:
    "https://app.lumastack.ru/android/releases/LumaWork-Android-0.1.1-2.apk",
  sha256: "a".repeat(64),
  signingCertificateSHA256: "b".repeat(64),
  size: 1234,
  publishedAt: "2026-10-16T12:00:00Z",
  changelog: ["Исправления"],
  minSdk: 26,
};
test("valid Android release", () =>
  assert.equal(validateAndroidRelease(valid), valid));
for (const [label, patch] of Object.entries({
  foreignPackage: { applicationId: "evil" },
  foreignURL: { downloadUrl: "https://evil.test/file.apk" },
  http: { downloadUrl: valid.downloadUrl.replace("https:", "http:") },
  wrongVersionURL: { versionCode: 3 },
  stringCode: { versionCode: "2" },
  zeroSize: { size: 0 },
  stringSize: { size: "1234" },
  badHash: { sha256: "no" },
  noCert: { signingCertificateSHA256: null },
  future: { publishedAt: "2099-01-01T00:00:00Z" },
  noNotes: { changelog: [] },
  htmlNotes: { changelog: [null] },
}))
  test(`reject ${label}`, () =>
    assert.throws(() => validateAndroidRelease({ ...valid, ...patch })));
test("iOS isolates LumaWork from other source apps", () =>
  assert.equal(
    iosVersions({
      apps: [
        { bundleIdentifier: "other", versions: [] },
        {
          bundleIdentifier: "septon.LumaWork",
          versions: [
            {
              version: "1",
              date: "2026-10-16",
              downloadURL: "https://app.lumastack.ru/releases/a.ipa",
            },
          ],
        },
      ],
    }).length,
    1,
  ));
test("incomplete iOS source fails explicitly", () =>
  assert.throws(() => iosVersions({ apps: [] })));
