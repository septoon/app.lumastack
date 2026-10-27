import test from 'node:test';
import assert from 'node:assert/strict';
import { createResourcePool, containRect } from '../src/phoneResources.js';

const tick = () => new Promise(resolve => setImmediate(resolve));
test('preparation is shared and the currently displayed resource survives bounded eviction', async () => {
  const disposed = [];
  const pool = createResourcePool(async url => ({ url, dispose: () => disposed.push(url) }), 2);
  const first = pool.prepare('a');
  assert.equal(first, pool.prepare('a'));
  await first;
  pool.pin('a');
  await pool.prepare('b');
  await pool.prepare('c');
  assert.deepEqual(disposed, ['b']);
  pool.dispose();
  assert.deepEqual(disposed.sort(), ['a', 'b', 'c']);
});
test('late preparation is disposed after unmount and failures can be retried', async () => {
  let resolve;
  let disposed = 0;
  const pool = createResourcePool(() => new Promise(done => { resolve = done; }));
  const pending = pool.prepare('slow');
  pool.dispose();
  resolve({ dispose: () => disposed++ });
  await assert.rejects(pending, /disposed/);
  assert.equal(disposed, 1);
  let attempt = 0;
  const retry = createResourcePool(async () => { if (!attempt++) throw Error('offline'); return { dispose() {} }; });
  await assert.rejects(retry.prepare('x'), /offline/);
  await retry.prepare('x');
  assert.equal(attempt, 2);
  retry.dispose();
});
test('portrait, landscape and tablet screenshots fit entirely without stretching or cropping', () => {
  assert.deepEqual(containRect(100, 200, 200, 400), { x: 0, y: 0, width: 200, height: 400 });
  assert.deepEqual(containRect(400, 200, 200, 400), { x: 0, y: 150, width: 200, height: 100 });
  assert.deepEqual(containRect(100, 400, 200, 400), { x: 50, y: 0, width: 100, height: 400 });
  assert.throws(() => containRect(0, 1, 1, 1), /dimensions/);
});
test('a disposed pool cannot start a new request', async () => {
  const pool = createResourcePool(async () => { throw Error('must not load'); });
  pool.dispose();
  await assert.rejects(pool.prepare('x'), /disposed/);
  await tick();
});

test('disposal aborts pending image work before it can upload into a dead renderer', async () => {
  let signal;
  const pool = createResourcePool((url, inputSignal) => {
    signal = inputSignal;
    return new Promise((resolve, reject) => inputSignal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
  });
  const pending = pool.prepare('screen');
  pool.dispose();
  assert.equal(signal.aborted, true);
  await assert.rejects(pending, /aborted/);
});
