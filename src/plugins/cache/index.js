import {
  useRef,
  useMemo,
  useEffect,
  useCallback,
  useContext,
  useState,
} from 'react'
import { bindActionCreators, deps } from 'rocketjump-core'
import { rj, makeAction } from '../../index'
import { of, from, ReplaySubject } from 'rxjs'
import { map, filter, tap } from 'rxjs/operators'
import { LRUCache, FIFOCache } from './providers'
import { InMemoryStore } from './stores'
import { RUN, SUCCESS, INIT, HYDRATE, FAILURE } from '../../actionTypes'
import { getRunValuesFromDeps } from 'rocketjump-core'
import ConfigureRjContext from '../../ConfigureRjContext'
import { useConstant } from '../../hooks'
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

export function prefetchRj(rjObject, params = []) {
  const { cache } = rjObject
  const key = cache.key(...params)
  const promise = new Promise((resolve, reject) => {
    const action = {
      type: RUN,
      meta: {
        cacheKey: key,
      },
      payload: {
        params: [{ cacheEnabled: true }].concat(params),
      },
      callbacks: {
        onFailure: error => {
          cache.promisesPoll.delete(key)
          cache.errorsPool.set(key, error)
          reject(error)
        },
        onSuccess: data => {
          cache.promisesPoll.delete(key)
          resolve(data)
        },
      },
    }
    cache.sideEffect.actionsSubject.next(action)
  })
  cache.promisesPoll.set(key, promise)
  return promise
}

export function usePrefetchRj(rjObject) {
  const { cache } = rjObject

  // Extra shit from <ConfigureRj />
  const extraConfig = useContext(ConfigureRjContext)
  const effectCaller = extraConfig === null ? null : extraConfig.effectCaller

  const prefetch = useCallback(
    params => {
      const key = cache.key(...params)
      const promise = new Promise((resolve, reject) => {
        const action = {
          type: RUN,
          meta: {
            cacheKey: key,
          },
          payload: {
            params: [{ cacheEnabled: true }].concat(params),
          },
          callbacks: {
            onFailure: error => {
              cache.promisesPoll.delete(key)
              cache.errorsPool.set(key, error)
              reject(error)
            },
            onSuccess: data => {
              cache.promisesPoll.delete(key)
              resolve(data)
            },
          },
        }
        if (effectCaller) {
          action.effectCaller = effectCaller
        }
        cache.sideEffect.actionsSubject.next(action)
      })
      cache.promisesPoll.set(key, promise)
      return promise
    },
    [cache, effectCaller]
  )
  return prefetch
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
      if (effectCaller) {
        nextAction.effectCaller = effectCaller
      }
      cache.sideEffect.actionsSubject.next(nextAction)
    }
    return bindActionCreators(actionCreators, dispatch)
  }, [
    actionCreators,
    cache.sideEffect.actionsSubject,
    effectCaller,
    cacheEnabled,
  ])

  const prefetch = useCallback(
    params => {
      const prefetchKey = cache.key(...params)
      if (cache.promisesPoll.has(prefetchKey)) {
        return cache.promisesPoll.get(prefetchKey)
      }
      const promise = actions.run
        .withMeta({
          cacheKey: prefetchKey,
        })
        .onSuccess(() => {
          cache.promisesPoll.delete(prefetchKey)
        })
        .onFailure(error => {
          cache.promisesPoll.delete(prefetchKey)
          cache.errorsPool.set(prefetchKey, error)
        })
        .asPromise(...params)
      cache.promisesPoll.set(prefetchKey, promise)
      return promise
    },
    [actions.run, cache]
  )
  let error = null

  if (!cacheEnabled) {
    return [null, { prefetch }, { error, key }]
  }

  if (cache.errorsPool.has(key)) {
    error = cache.errorsPool.get(key)
    if (suspense) {
      error.clearError = () => cache.errorsPool.delete(key)
      throw error
    }
  }

  if (!cache.provider.has(key)) {
    if (!suspense) {
      return [null, { prefetch }, { error, key }]
    }
    if (cache.promisesPoll.has(key)) {
      throw cache.promisesPoll.get(key)
    }
    const promise = actions.run
      .withMeta({
        cacheKey: key,
      })
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
  return [data, { prefetch }, { error, key }]
}

export function useRjCacheState(rjObject, params = [], config = {}) {
  const { selectState, suspense } = { suspense: true, ...config }

  // Get initial cache data or suspend
  const cacheDataConfig = { cache: true, suspense: Boolean(suspense) }

  const [cachedData, { prefetch }, { error, key }] = useRjCacheData(
    rjObject,
    params,
    cacheDataConfig
  )

  const { reducer, makeSelectors, computeState, cache } = rjObject

  const [trigger, setTrigger] = useState([0, 0])
  const forceUpdate = useCallback(() => {
    setTrigger(a => [a[0], a[1] + 1])
  }, [])
  const refetch = useCallback(() => {
    setTrigger(a => [a[0] + 1, a[1]])
  }, [])
  const [fetchTrigger] = trigger

  const clearError = useCallback(() => {
    cache.errorsPool.delete(key)
    forceUpdate()
    refetch()
  }, [cache.errorsPool, key, forceUpdate, refetch])

  const actions = { prefetch, clearError }

  useEffect(() => {
    if (!suspense) {
      let canceled = false
      function handleUpdate() {
        if (!canceled) {
          forceUpdate()
        }
      }
      prefetch(params).then(handleUpdate, handleUpdate)
      return () => {
        canceled = true
      }
    }
    // TODO: REPLACE WITH A DEEP COMPARE .....
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...params, prefetch, suspense, fetchTrigger, forceUpdate])

  const stateShape = useMemo(() => reducer(undefined, { type: INIT }), [
    reducer,
  ])

  const state = useMemo(() => {
    let nextState = stateShape
    if (cachedData) {
      nextState = reducer(nextState, {
        type: HYDRATE,
        payload: {
          data: cachedData,
        },
      })
    }
    if (error) {
      nextState = reducer(nextState, {
        type: FAILURE,
        payload: error,
      })
    }
    return nextState
  }, [cachedData, reducer, stateShape, error])

  const memoizedSelectors = useConstant(() => {
    if (
      typeof selectState === 'function' ||
      typeof computeState === 'function'
    ) {
      return makeSelectors()
    }
  })

  // Derive the state
  const derivedState = useMemo(() => {
    let derivedState = state
    if (typeof computeState === 'function') {
      derivedState = computeState(state, memoizedSelectors)
    }
    if (typeof selectState === 'function') {
      derivedState = selectState(state, memoizedSelectors, derivedState)
    }
    return derivedState
  }, [state, memoizedSelectors, selectState, computeState])

  return [derivedState, actions]
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

  const [cachedData, { prefetch }] = useRjCacheData(
    rjObject,
    runParams,
    cacheDataConfig
  )

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
  const [state, actions] = useRunRj(
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

  // Same API of useRjCacheState
  // ... the vanilla rj alredy clear error on run...
  // simply grab curry actual run args
  const clearError = () => {
    actions.run(...runArgs)
  }

  return [state, { ...actions, prefetch, clearError }]
}

export default rjCache

export * from './stores'
export * from './providers'
