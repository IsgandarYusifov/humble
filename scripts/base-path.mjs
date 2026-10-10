export function normalizeBasePath(value = '') {
  const base = value.replace(/\/+$/, '');
  if (base && !/^\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+$/.test(base)) throw new Error('HUMBLE_BASE_PATH must be a local path such as /humble.');
  return base;
}
