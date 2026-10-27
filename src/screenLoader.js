// Keep the visible image until its replacement has decoded successfully.
export function createScreenLoader(load, show, onError = () => {}) {
  const cache = new Map();
  let request = 0;
  function prepare(image) {
    if (!image?.imageUrl) return Promise.reject(new Error("Missing image URL"));
    if (!cache.has(image.imageUrl)) {
      const promise = load(image.imageUrl).catch(error => {
        cache.delete(image.imageUrl);
        throw error;
      });
      cache.set(image.imageUrl, promise);
    }
    return cache.get(image.imageUrl);
  }
  return {
    preload(image) { prepare(image).catch(() => {}); },
    select(image) {
      const current = ++request;
      if (!image) return;
      prepare(image).then(resource => { if (request === current) show(image, resource, () => request === current); }).catch(error => { if (request === current) onError(error); });
    },
    dispose() { request++; cache.clear(); },
  };
}

export function decodeScreen(url) {
  const image = new Image();
  image.decoding = "async";
  return new Promise((resolve, reject) => {
    image.onload = () => {
      if (image.decode) image.decode().then(() => resolve(image), reject);
      else resolve(image);
    };
    image.onerror = reject;
    image.src = url;
  });
}
