// Per-renderer resources: never evict the display currently attached to a mesh.
export function createResourcePool(load, limit = 6) {
  const cache = new Map();
  let pinned = new Set();
  let disposed = false;
  function trim(preparing) {
    for (const [key, entry] of cache) {
      if (cache.size <= limit) break;
      if (pinned.has(key) || key === preparing) continue;
      entry.controller.abort();
      entry.value?.dispose();
      cache.delete(key);
    }
  }
  return {
    prepare(key) {
      if (disposed) return Promise.reject(new Error('Resource pool disposed'));
      if (cache.has(key)) {
        const entry = cache.get(key);
        cache.delete(key);
        cache.set(key, entry);
        return entry.promise;
      }
      const entry = { controller: new AbortController() };
      cache.set(key, entry);
      let loading;
      try { loading = Promise.resolve(load(key, entry.controller.signal)); }
      catch (error) { loading = Promise.reject(error); }
      entry.promise = loading.then(value => {
        if (disposed || entry.controller.signal.aborted) { value.dispose(); throw new Error('Resource pool disposed'); }
        entry.value = value;
        trim(key);
        return value;
      }).catch(error => { if (cache.get(key) === entry) cache.delete(key); throw error; });
      trim(key);
      return entry.promise;
    },
    pin(...keys) { pinned = new Set(keys); trim(); },
    trim,
    dispose() {
      disposed = true;
      cache.forEach(entry => { entry.controller.abort(); entry.value?.dispose(); });
      cache.clear();
    },
  };
}

export function containRect(width, height, targetWidth, targetHeight) {
  if (![width, height, targetWidth, targetHeight].every(n => Number.isFinite(n) && n > 0)) throw new Error('Invalid image dimensions');
  const scale = Math.min(targetWidth / width, targetHeight / height);
  const w = width * scale;
  const h = height * scale;
  return { x: (targetWidth - w) / 2, y: (targetHeight - h) / 2, width: w, height: h };
}
