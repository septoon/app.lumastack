import test from "node:test";
import assert from "node:assert/strict";
import { createScreenLoader } from "../src/screenLoader.js";

test("keeps the last ready screen when requests fail or finish out of order", async () => {
  const pending = new Map();
  const shown = [];
  const loader = createScreenLoader(url => new Promise((resolve, reject) => pending.set(url, { resolve, reject })), image => shown.push(image.id));
  loader.select({ id: "first", imageUrl: "first" });
  pending.get("first").resolve();
  await new Promise(resolve => setImmediate(resolve));
  loader.select({ id: "slow", imageUrl: "slow" });
  loader.select({ id: "latest", imageUrl: "latest" });
  pending.get("latest").reject(new Error("offline"));
  pending.get("slow").resolve();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(shown, ["first"]);
  loader.select({ id: "ready", imageUrl: "ready" });
  pending.get("ready").resolve();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(shown, ["first", "ready"]);
});

test('late transition callbacks cannot commit after a new selection or disposal', async () => {
  const commits = [];
  const delayed = [];
  const loader = createScreenLoader(async url => url, (image, resource, isCurrent) => {
    delayed.push(() => { if (isCurrent()) commits.push(resource); });
  });
  loader.select({ imageUrl: 'old' });
  await new Promise(resolve => setImmediate(resolve));
  loader.select({ imageUrl: 'new' });
  await new Promise(resolve => setImmediate(resolve));
  delayed[0](); delayed[1]();
  assert.deepEqual(commits, ['new']);
  loader.dispose();
  delayed[1]();
  assert.deepEqual(commits, ['new']);
});
