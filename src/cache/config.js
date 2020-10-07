const defaultCacheConfig = {
  cacheTime: 0,
  staleTime: 0,
}

export default function makeCacheConfig(rawConfig) {
  return {
    ...defaultCacheConfig,
    ...rawConfig,
  }
}
