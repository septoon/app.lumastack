import test from 'node:test';
import assert from 'node:assert/strict';
import { samplePhoneFloat } from '../src/phoneMotion.js';

test('idle movement stays gentle on every axis and never turns the display sideways', () => {
  for (let time = 0; time < 120; time += 0.1) {
    const pose = samplePhoneFloat(time);
    assert.ok(Math.abs(pose.x) <= 0.04 && Math.abs(pose.y) <= 0.08 && Math.abs(pose.z) <= 0.03);
    assert.ok(Math.abs(pose.rotationX) <= 0.04 && Math.abs(pose.rotationY) <= 0.08 && Math.abs(pose.rotationZ) <= 0.03);
    const next = samplePhoneFloat(time + 1 / 60);
    assert.ok(Math.abs(next.y - pose.y) < 0.002);
    assert.ok(Math.abs(next.rotationY - pose.rotationY) < 0.002);
  }
});
test('floating changes over time and its compact version reduces amplitude', () => {
  assert.notDeepEqual(samplePhoneFloat(0), samplePhoneFloat(1));
  const desktop = samplePhoneFloat(3);
  const compact = samplePhoneFloat(3, true);
  for (const axis of Object.keys(desktop)) assert.ok(Math.abs(compact[axis]) < Math.abs(desktop[axis]));
});
