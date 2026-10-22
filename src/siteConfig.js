export const SITE_API_URL = 'https://api.work.lumastack.ru/api/v2/site';
export function releaseTextID(platform, release, index = 0) {
  const identity = `${release.version || release.versionName || release.name}.${release.buildVersion ?? release.versionCode ?? 0}`.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `release.${platform}.${identity}.note${platform === 'android' ? `.${index}` : ''}`;
}
const pageIDs = { '/': 'home', '/ios': 'ios', '/android': 'android', '/changelog': 'changelog', '/help': 'help' };
const anchors = { '/#download': 'home.download', '/#features': 'home.features', '/ios#installation': 'ios.installation', '/ios#automation': 'ios.automation', '/android#android-release-title': 'android.release' };

export function siteText(site, id, fallback = '') {
  const entry = site?.content?.texts?.find(item => item.id === id);
  return entry ? (entry.isVisible ? entry.value : '') : fallback;
}
export function pageVisible(site, path) {
  const id = pageIDs[path.replace(/\/$/, '') || '/'];
  return site?.isEnabled !== false && !site?.content?.pages?.some(item => item.id === id && !item.isVisible);
}
export function sectionVisible(site, id) {
  return !site?.content?.sections?.some(item => item.id === id && !item.isVisible);
}
export function linkVisible(site, href, currentPath = '/') {
  if (typeof href !== 'string' || (!href.startsWith('/') && !href.startsWith('#')) || href.startsWith('//')) return true;
  const [rawPath, anchor] = href.split('#');
  const path = (rawPath || currentPath).replace(/\/$/, '') || '/';
  if (!pageVisible(site, path)) return false;
  const section = anchors[`${path}#${anchor}`];
  return !section || sectionVisible(site, section);
}
export function screenshotsFor(site, platform) {
  return (site?.screenshots || []).filter(item => (item.platform || 'ios') === platform && item.isVisible !== false && item.imageUrl).sort((a, b) => a.sortOrder - b.sortOrder);
}
export async function fetchSiteConfig(signal) {
  const response = await fetch(SITE_API_URL, { signal, cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`site config: ${response.status}`);
  const payload = await response.json();
  if (!payload.settings || typeof payload.settings.isEnabled !== 'boolean') throw new Error('Invalid site settings');
  return { ...payload.settings, screenshots: Array.isArray(payload.screenshots) ? payload.screenshots : [] };
}
