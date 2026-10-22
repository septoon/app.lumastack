import assert from 'node:assert/strict';
import test from 'node:test';
import { siteText, pageVisible, linkVisible, screenshotsFor } from '../src/siteConfig.js';

const site = { isEnabled: true, content: {
  pages: [{ id: 'android', path: '/android', isVisible: false }],
  sections: [{ id: 'home.features', isVisible: false }],
  texts: [{ id: 'hero.title', value: '<script>plain text</script>', isVisible: true }, { id: 'hero.note', value: 'secret', isVisible: false }]
}, screenshots: [
  { id: 'a', platform: 'android', isVisible: true, imageUrl: '/a', sortOrder: 2 },
  { id: 'b', platform: 'ios', isVisible: true, imageUrl: '/b', sortOrder: 0 },
  { id: 'c', platform: 'android', isVisible: false, imageUrl: '/c', sortOrder: 0 }
] };
test('hidden and empty text never falls back to the original copy', () => {
  assert.equal(siteText(site, 'hero.note', 'default'), '');
  assert.equal(siteText(site, 'hero.title', 'default'), '<script>plain text</script>');
  assert.equal(siteText(site, 'unknown', 'default'), 'default');
  assert.equal(siteText({ content: { texts: [{ id: 'empty', value: '', isVisible: true }] } }, 'empty', 'default'), '');
});
test('disabled pages and sections are excluded from direct routes and internal links', () => {
  assert.equal(pageVisible(site, '/android/'), false);
  assert.equal(pageVisible(site, '/ios'), true);
  assert.equal(linkVisible(site, '/android'), false);
  assert.equal(linkVisible(site, '/#features'), false);
  assert.equal(linkVisible(site, '#features', '/'), false);
  assert.equal(linkVisible(site, '/android/latest.json'), true);
  assert.equal(linkVisible(site, 'https://external.example/android'), true);
});
test('screenshots are separated by platform and hiding or deleting all leaves an empty list', () => {
  assert.deepEqual(screenshotsFor(site, 'android').map(x => x.id), ['a']);
  assert.deepEqual(screenshotsFor(site, 'ios').map(x => x.id), ['b']);
  assert.deepEqual(screenshotsFor({ ...site, screenshots: [] }, 'ios'), []);
});
