import { rjPlugin, makeEffectAction } from '../..'
import { of, from } from 'rxjs'
import { map, filter, tap } from 'rxjs/operators'
import { CacheProvider, LRUCache } from './providers'
import { CacheStore, SessionStorageStore } from './stores'

type KeyMaker = (...args: any[]) => string
const defaultKey = (...args: any[]) => JSON.stringify(args)

interface CacheStoreConstructor {
  new (): CacheStore
}

interface CacheProviderConstructor {
  new (namespace: string, size: number, store: CacheStore): CacheProvider
}

interface RjPluginCacheConfig {
  ns: string
  size: number
  store?: CacheStoreConstructor
  provider?: CacheProviderConstructor
  key?: KeyMaker
}

const rjCache = (config: RjPluginCacheConfig) => {
  if (!config.ns) {
    throw new Error('RjCache requires the ns property to be set')
  }
  if (config.ns.includes('$')) {
    throw new Error('RjCache ns cannot contain the $ symbol')
  }
  if (!config.size) {
    throw new Error('RjCache needs a cache size to be defined')
  }
  const ns = config.ns
  const size = config.size
  const store = new (config.store || SessionStorageStore)()
  const provider = new (config.provider || LRUCache)(ns, size, store)
  const key = config.key || defaultKey
  return rjPlugin({
    actions: () => ({
      resetCache: () => makeEffectAction('$reset-cache'),
    }),
    effectCaller: (effectFn, ...args) => {
      const k = key(...args)
      if (provider.has(k)) {
        return of(provider.get(k))
      } else {
        return from(effectFn(...args)).pipe(
          map((result) => {
            provider.set(k, result)
            return result
          })
        )
      }
    },
    effectPipeline: (action$) =>
      action$.pipe(
        tap((action) => {
          if (action.type === '$reset-cache') {
            provider.clear()
          }
        }),
        filter((action) => action.type !== '$reset-cache')
      ),
  })
}

export default rjCache

export * from './stores'
export * from './providers'
