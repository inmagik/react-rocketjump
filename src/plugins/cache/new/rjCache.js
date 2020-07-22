import { rj } from '../../../index'

function stableReplacer(key, value) {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return Object.keys(value)
      .sort()
      .reduce((acc, k) => {
        acc[k] = value[k]
        return acc
      }, {})
  }
  return value
}

const defaultKeyMaker = ns => params =>
  `${ns}/` + JSON.stringify(params, stableReplacer)

const defaultCacheConfig = {
  cacheTime: 0,
}

const rjCache = config => {
  if (!config.ns) {
    throw new Error('RjCache requires the ns property to be set')
  }
  const { ns, cacheTime } = {
    ...defaultCacheConfig,
    ...config,
  }

  return rj({
    takeEffect: 'exhaust',
    cache: rjObject => ({
      ns,
      cacheTime,
      makeKey: defaultKeyMaker(ns),
    }),
  })
}

export default rjCache
