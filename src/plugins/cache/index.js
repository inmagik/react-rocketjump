import blamer from 'rocketjump-core/blamer.macro'
import { rj, makeAction } from '../../index'
import { of, from } from 'rxjs'
import { map, filter, tap } from 'rxjs/operators'
import { LRUCache } from './providers'
import { SessionStorageStore } from './stores'

const defaultKey = (...args) => JSON.stringify(args)

const rjCache = (config) => {
  if (!config.ns) {
    blamer(
      '[rj-config-error] @rjCache',
      'RjCache requires the ns property to be set'
    )
  }
  if (config.ns.includes('$')) {
    blamer(
      '[rj-config-error] @rjCache',
      'RjCache ns cannot contain the $ symbol'
    )
  }
  if (!config.size) {
    blamer(
      '[rj-config-error] @rjCache',
      'RjCache needs a cache size to be defined'
    )
  }
  const ns = config.ns
  const size = config.size
  const store = new (config.store || SessionStorageStore)()
  const provider = new (config.provider || LRUCache)(ns, size, store)
  const key = config.key || defaultKey
  return rj({
    actions: () => ({
      resetCache: () => makeAction('$reset-cache'),
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
