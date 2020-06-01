import { useRef, useMemo, useEffect, useContext } from 'react'
import { bindActionCreators, deps } from 'rocketjump-core'
import { rj, makeAction } from '../../index'
import { of, from, ReplaySubject } from 'rxjs'
import { map, filter, tap } from 'rxjs/operators'
import { LRUCache, FIFOCache } from './providers'
import { InMemoryStore } from './stores'
import { RUN, SUCCESS } from '../../actionTypes'
import { getRunValuesFromDeps } from 'rocketjump-core'
import ConfigureRjContext from '../../ConfigureRjContext'
import useRj from '../../useRj'
import useRunRj from '../../useRunRj'

const defaultKey = (...args) => JSON.stringify(args)

class MapProxyStore {
  constructor() {
    this.map = new Map()
  }

  getItem(key) {
    return this.map.get(key)
  }

  setItem(key, value) {
    this.map.set(key, value)
  }

  removeItem(key) {
    this.map.delete(key)
  }
}

const rjCache = config => {
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
  const store = new (config.store || InMemoryStore)()
  const provider = new (config.provider || LRUCache)(ns, size, store)
  const promisesPoll = new Map()
  const errorsPool = new FIFOCache(ns, size, new MapProxyStore())

  const key = config.key || defaultKey
  return rj({
    cache: rjObject => ({
      ns,
      key,
      provider,
      sideEffect: createCacheSideEffect(rjObject),
      promisesPoll,
      errorsPool,
    }),
    actions: () => ({
      resetCache: () => makeAction('$reset-cache'),
    }),
    effectCaller: (effectFn, cacheConfig, ...args) => {
      if (!cacheConfig.cacheEnabled) {
        return from(effectFn(...args))
      }
      const k = key(...args)
      if (provider.has(k)) {
        return of(provider.get(k))
      } else {
        return from(effectFn(...args)).pipe(
          map(result => {
            const k = key(...args)
            provider.set(k, result)
            return result
          })
        )
      }
    },
    effectPipeline: action$ =>
      action$.pipe(
        tap(action => {
          if (action.type === '$reset-cache') {
            provider.clear()
          }
        }),
        filter(action => {
          if (action.type === '$reset-cache') {
            return false
          }
          if (action.type === RUN && action.meta.skipCachedRun === true) {
            return false
          }
          return true
        }),
        map(action => {
          if (action.type === RUN) {
            // Cache enabled unless cacheEnabled meta is defined
            const cacheEnabled = action.meta.cache ?? true
            const cacheConfig = { cacheEnabled: cacheEnabled }
            const { payload, meta, callbacks } = action
            const { params } = payload

            if (!cacheConfig.cacheEnabled) {
              // Prepend cache config to params
              return {
                ...action,
                payload: {
                  ...payload,
                  params: [cacheConfig].concat(params),
                },
              }
            }

            const k = key(...params)
            if (provider.has(k)) {
              const cachedData = provider.get(k)
              return {
                type: SUCCESS,
                meta: {
                  ...meta,
                  cached: true,
                },
                payload: {
                  params,
                  data: cachedData,
                },
                successCallback: callbacks ? callbacks.onSuccess : undefined,
              }
            } else {
              // Prepend cache config to params
              return {
                ...action,
                payload: {
                  ...payload,
                  params: [cacheConfig].concat(params),
                },
              }
            }
          }
          return action
        })
      ),
  })
}

function createCacheSideEffect(rjObject) {
  const { makeRxObservable } = rjObject

  const actionsSubject = new ReplaySubject()
  const actionObserable = actionsSubject.asObservable()

  const [dispatchObservable] = makeRxObservable(
    actionObserable,
    of({}),
    undefined,
    'every'
  )

  dispatchObservable.subscribe(action => {
    let successCallback
    if (action.successCallback) {
      successCallback = action.successCallback
      delete action.successCallback
    }
    let failureCallback
    if (action.failureCallback) {
      failureCallback = action.failureCallback
      delete action.failureCallback
    }

    const { cache } = rjObject
    const { cacheKey: key } = action.meta
    if (key && action.meta.cache && action.type === SUCCESS) {
      cache.provider.set(key, action.payload.data)
    }

    if (successCallback) {
      successCallback(action.payload.data)
    }
    if (failureCallback) {
      failureCallback(action.payload)
    }
  })

  return {
    actionsSubject,
    dispatchObservable,
  }
}

function useRjCacheData(rjObject, params = [], config = {}) {
  if (!rjObject.cache) {
    throw new Error('You should add rjCache() plugin to your rj config.')
  }
  const { actionCreators, cache } = rjObject

  const { suspense, cache: cacheEnabled } = {
    suspense: true,
    cache: true,
    ...config,
  }

  const key = useMemo(() => {
    return cache.key(...params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...params, cache])

  // Extra shit from <ConfigureRj />
  const extraConfig = useContext(ConfigureRjContext)
  const effectCaller = extraConfig === null ? null : extraConfig.effectCaller

  const actions = useMemo(() => {
    const dispatch = action => {
      const nextAction = { ...action }
      nextAction.payload = {
        ...action.payload,
        params: [{ cacheEnabled }].concat(action.payload.params),
      }
      nextAction.meta = {
        cacheKey: key,
        ...(action.meta || {}),
      }
      if (effectCaller) {
        nextAction.effectCaller = effectCaller
      }
      cache.sideEffect.actionsSubject.next(nextAction)
    }
    return bindActionCreators(actionCreators, dispatch)
  }, [
    actionCreators,
    key,
    cache.sideEffect.actionsSubject,
    effectCaller,
    cacheEnabled,
  ])

  if (!cacheEnabled) {
    return null
  }

  if (suspense && cache.errorsPool.has(key)) {
    const error = cache.errorsPool.get(key)
    error.clearRjError = () => cache.errorsPool.delete(key)
    throw error
  }

  if (!cache.provider.has(key)) {
    if (!suspense) {
      return null
    }
    if (cache.promisesPoll.has(key)) {
      throw cache.promisesPoll.get(key)
    }
    const promise = actions.run
      .onSuccess(() => {
        cache.promisesPoll.delete(key)
      })
      .onFailure(error => {
        cache.promisesPoll.delete(key)
        cache.errorsPool.set(key, error)
      })
      .asPromise(...params)
    cache.promisesPoll.set(key, promise)
    throw promise
  }

  const data = cache.provider.get(key)
  return data
}

export function useRjCache(rjObject, params = [], config = {}) {
  const { selectState } = config
  const cachedData = useRjCacheData(rjObject, params, config)
  return useRj(
    rjObject,
    selectState,
    cachedData
      ? {
          data: cachedData,
        }
      : null
  )
}

export function useRunRjCache(rjObject, paramsWithDeps = [], config = {}) {
  const {
    selectState,
    cleanOnNewEffect,
    suspense,
    cache,
    suspendOnNewEffect,
  } = {
    cleanOnNewEffect: false,
    suspendOnNewEffect: false,
    suspense: true,
    cache: true,
    ...config,
  }

  const isFirstReactCommit = useRef(true)
  const runParams = getRunValuesFromDeps(paramsWithDeps)

  // Get initial cache data or suspend
  const cacheDataConfig = { cache }
  if (!suspense) {
    // Nerver use suspense
    cacheDataConfig.suspense = false
  } else if (suspendOnNewEffect) {
    // Alaways use suspense
    cacheDataConfig.suspense = true
  } else {
    // Suspen on first react commit
    // (when Y component is rendered first time on the screen)
    cacheDataConfig.suspense = isFirstReactCommit.current
  }

  const cachedData = useRjCacheData(rjObject, runParams, cacheDataConfig)

  let runArgs
  if (isFirstReactCommit.current && cachedData !== null) {
    // On first commit and when cache data is filled avoid first run
    runArgs = paramsWithDeps.concat(
      deps.withAlwaysMeta({ skipCachedRun: true, cache })
    )
  } else {
    runArgs = paramsWithDeps.concat(
      deps.withAlwaysMeta({ skipCachedRun: false, cache })
    )
  }

  useEffect(() => {
    isFirstReactCommit.current = false
  }, [])

  // Call useRunRj as usual, init them with data from cache
  return useRunRj(
    rjObject,
    runArgs,
    cleanOnNewEffect,
    selectState,
    cachedData
      ? {
          data: cachedData,
        }
      : null
  )
}

export default rjCache

export * from './stores'
export * from './providers'
