import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { bindActionCreators } from 'rocketjump-core'
import { isEffectAction } from 'rocketjump-core'
import { rj } from '../../index'
import { RUN, SUCCESS, INIT, HYDRATE, FAILURE } from '../../actionTypes'
import { ReplaySubject, of, BehaviorSubject, Subject, empty } from 'rxjs'
import {
  distinctUntilChanged,
  skip,
  publish,
  share,
  bufferTime,
  map,
  filter,
  switchMap,
  delay,
} from 'rxjs/operators'
import { makeSideEffectDescriptor } from '../../sideEffectDescriptor'

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

export const rjCache = config => {
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

let cacheRunIdCounter = 0
function makeUniqueCacheRunId() {
  return cacheRunIdCounter++
}

function createMountedInstance(bucket, cb) {
  const mountedInstance = {}

  const stateSub = bucket.stateSubject
    .asObservable()
    .pipe(skip(1), distinctUntilChanged())
    .subscribe(cb)

  let cacheRunId = null

  mountedInstance.refreshInstance = () => {
    if (bucket.instances.size === 1) {
      if (!bucket.wasSuspended) {
        cacheRunId = makeUniqueCacheRunId()
        bucket.actions.run
          .withMeta({
            cacheRunId,
          })
          .run(...bucket.params)
      } else {
        bucket.wasSuspended = false
      }
    }
  }

  // const effectSub = bucket.effectObservable.subscribe(action => {
  //   let successCallback
  //   if (action.successCallback) {
  //     successCallback = action.successCallback
  //     delete action.successCallback
  //   }
  //   let failureCallback
  //   if (action.failureCallback) {
  //     failureCallback = action.failureCallback
  //     delete action.failureCallback
  //   }

  //   bucket.dispatchToState(action)

  //   if (successCallback) {
  //     successCallback(action.payload.data)
  //   }
  //   if (failureCallback) {
  //     failureCallback(action.payload)
  //   }
  // })

  mountedInstance.clear = () => {
    // console.log('Goodbye instance', mountedInstance)
    // effectSub.unsubscribe()
    stateSub.unsubscribe()
    bucket.instances.delete(mountedInstance)
    if (bucket.instances.size === 0) {
      // If bucket ongoing run is from current rj instance cancel them ...
      if (cacheRunId !== null && bucket.ongoingRun === cacheRunId) {
        bucket.actions.cancel()
      }
      // console.log('GoodBye space cowboy')
      bucket.gcSubject.next({ type: 'gc' })
    }
  }

  return mountedInstance
}

function makeDispatchSubscription(dispatchFn) {
  return action => {
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

    dispatchFn(action)

    if (successCallback) {
      successCallback(action.payload.data)
    }
    if (failureCallback) {
      failureCallback(action.payload)
    }
  }
}

function createBucket(cacheStore, rjObject, params, key) {
  const {
    makeRxObservable,
    makeSelectors,
    computeState,
    reducer,
    actionCreators,
    cache: cacheOptions,
  } = rjObject

  const bucket = {
    rjObject,
    params,
    key,
    state: reducer(undefined, { type: INIT }),
    wasSuspended: false,
    currentPromise: null,
    selectors: makeSelectors(),
    instances: new Set(),
  }

  // State
  bucket.memoizedState =
    typeof computeState === 'function'
      ? computeState(bucket.state, bucket.selectors)
      : bucket.state
  bucket.stateSubject = new BehaviorSubject(bucket.state)
  bucket.dispatchToState = action => {
    const nextState = reducer(bucket.state, action)
    bucket.state = nextState
    bucket.memoizedState =
      typeof computeState === 'function'
        ? computeState(bucket.state, bucket.selectors)
        : bucket.state
    bucket.stateSubject.next(nextState)
  }

  // Garbage Collector
  bucket.gcSubject = new Subject()
  bucket.gcObservable = bucket.gcSubject.asObservable().pipe(
    switchMap(action => {
      if (action.type === 'gc') {
        return of(action).pipe(delay(action.time ?? cacheOptions.cacheTime))
      }
      return empty()
    })
  )
  bucket.gcObservable.subscribe(action => {
    // Delete actual bucket from parent buckets map
    if (bucket.instances.size === 0) {
      cacheStore.buckets.delete(key)
    }
  })

  // Action + Side Effects

  const actionsSubject = new Subject()
  const actionObserable = actionsSubject.asObservable()

  const stateObservable = bucket.stateSubject.asObservable()
  const effectObservable = makeRxObservable(
    actionObserable,
    stateObservable
  )[0].pipe(share())
  effectObservable.subscribe(makeDispatchSubscription(bucket.dispatchToState))

  bucket.dispatch = action => {
    if (isEffectAction(action)) {
      if (action.type === RUN) {
        bucket.ongoingRun = action.meta.cacheRunId ?? null
      }
      // Emit action to given observable theese perform side
      // effect and emit action dispatched above by subscription
      actionsSubject.next(action)
    } else {
      // Update the state \w given reducer
      bucket.dispatchToState(action)
    }
  }

  bucket.actions = bindActionCreators(actionCreators, bucket.dispatch)

  // Suspense
  bucket.suspensePromise = () => {
    if (bucket.currentPromise) {
      return bucket.currentPromise
    }
    bucket.wasSuspended = true
    // FIXME: It's not safe to schedule a GC very lowe time
    // between render and commit react phase
    // GC is necessary to avoid leak when render is called but the commit
    // phase not so at least for this seconds Y cache expires
    // BUT FOR NOW WE ACCEPT THIS .... lol
    // .. cause the cause of this leak is not so comune but you
    // can still split multiple cahce witha <Provider />
    // in large apps....
    bucket.currentPromise = bucket.actions.run
      .onSuccess(() => {
        bucket.currentPromise = null
      })
      .onFailure(() => {
        bucket.currentPromise = null
      })
      .asPromise(...params)
    return bucket.currentPromise
  }

  bucket.subscribe = cb => {
    const mountedInstance = createMountedInstance(bucket, cb)
    bucket.instances.add(mountedInstance)
    mountedInstance.refreshInstance()
    return () => mountedInstance.clear()
  }

  return bucket
}

// TODO: IMPROVE!!!!!!
function isPartialParamMatching(rjObject, params, matchParams) {
  const { makeKey } = rjObject.cache
  return makeKey(params.slice(0, matchParams.length)) === makeKey(matchParams)
}

function createCacheStore() {
  const cacheStore = {
    // Lazy observable map of actions subjects ..
    actionsMap: new Map(),
    // Map of living buckets
    buckets: new Map(),
  }

  // TODO: Implement better match tequinique........

  function dispatchToBucketsState(rjObject, action) {
    // TODO: Add an option to skip buckets \w no instances attacched .....
    // if (isEffectAction(action)) {
    // return
    // }
    // TODO: Find a better name ....
    const { dispatchMatchPredicate } = action.meta ?? {}
    if (!dispatchMatchPredicate) {
      return
    }
    cacheStore.buckets.forEach(bucket => {
      // TODO: Improve matching ....
      if (
        bucket.rjObject.ns === rjObject.ns &&
        dispatchMatchPredicate(bucket.params)
      ) {
        bucket.dispatchToState(action)
      }
    })
  }

  function makeActionsSubject(rjObject) {
    const {
      cache: { ns },
      makeRxObservable,
    } = rjObject

    if (cacheStore.actionsMap.has(ns)) {
      return cacheStore.actionsMap.get(ns)
    }

    const actionsSubject = new Subject()
    const actionObserable = actionsSubject.asObservable()

    // TODO: Improve obs....
    const effectObservable = makeRxObservable(actionObserable, empty())[0].pipe(
      share()
    )
    effectObservable.subscribe(
      makeDispatchSubscription(action =>
        dispatchToBucketsState(rjObject, action)
      )
    )
    cacheStore.actionsMap.set(ns, actionsSubject)
    return actionsSubject
  }

  cacheStore.invalidate = (rjObject, matchParams = []) => {
    cacheStore.buckets.forEach(bucket => {
      if (
        bucket.rjObject.ns === rjObject.ns &&
        isPartialParamMatching(rjObject, bucket.params, matchParams)
      ) {
        // TODO: Write better...
        if (bucket.instances.size === 0) {
          cacheStore.buckets.delete(bucket.key)
        } else {
          bucket.actions.run(...bucket.params)
        }
      }
    })
  }

  cacheStore.makeActions = (rjObject, dispatchMatchPredicate) => {
    const actionsSubject = makeActionsSubject(rjObject)

    function dispatch(action) {
      const multiMatchAction = {
        ...action,
        meta: {
          ...action.meta,
          dispatchMatchPredicate,
        },
      }
      if (isEffectAction(action)) {
        // Emit action to given observable theese perform side
        // effect and emit action dispatched above by subscription
        actionsSubject.next(multiMatchAction)
      } else {
        // Update the state \w given reducer
        dispatchToBucketsState(rjObject, multiMatchAction)
      }
    }

    return bindActionCreators(rjObject.actionCreators, dispatch)
  }

  cacheStore.getBucket = (rjObject, params) => {
    const key = rjObject.cache.makeKey(params)
    if (cacheStore.buckets.has(key)) {
      return cacheStore.buckets.get(key)
    }
    const bucket = createBucket(cacheStore, rjObject, params, key)
    cacheStore.buckets.set(key, bucket)
    return bucket
  }

  return cacheStore
}

// TODO:
// - Stale time
// - Check bug canceled bucket + refetch
// - Option to always refetch on mount + bug swap last rj....
// - Suspense + Error
// - Always calculate promise ....
// - Prefetch RJ
// - effectCaller
// - Override cache time + stale time on instance ...
// - Provider .....
// - refactoring

// TODO: BaD NAME
export const bigCacheStore = createCacheStore()

console.log(bigCacheStore)

function useRerender() {
  const [, forceUpdate] = useState(0)
  return useCallback(() => forceUpdate(c => c + 1), [])
}

// TODO: handle params
export function useRjActions(rjObject, matchParams = []) {
  const matchParamsRef = useRef(matchParams)

  useEffect(() => {
    matchParamsRef.current = matchParams
  })

  const dispatchMatchPredicate = useCallback(
    params => isPartialParamMatching(rjObject, params, matchParamsRef.current),
    [rjObject]
  )

  return useMemo(() => {
    return bigCacheStore.makeActions(rjObject, dispatchMatchPredicate)
  }, [rjObject, dispatchMatchPredicate])
}

export function useRj(rjObject, params = [], config = {}) {
  const bucket = bigCacheStore.getBucket(rjObject, params)

  if (config.suspense) {
    // TODO: Use selectors
    if (bucket.state.root.data === null) {
      throw bucket.suspensePromise()
    }
  }

  // TODO: SWHITCH TO USE MUTABLE SOURCE
  const rerender = useRerender()
  useEffect(() => {
    const unsub = bucket.subscribe(rerender)
    return unsub
  }, [bucket, rerender])

  return [bucket.memoizedState, bucket.actions]
}

export function useLastRj(rjObject, params = [], config = {}) {
  const bucket = bigCacheStore.getBucket(rjObject, params)

  const prevBucket = useRef(bucket)
  const subA = useRef(null)
  const subB = useRef(null)

  const rerender = useRerender()
  useEffect(() => {
    if (subA.current === null) {
      // Init first subscription from bucket
      subA.current = bucket.subscribe(rerender)
    } else {
      if (bucket !== prevBucket.current) {
        // Bucket has changed

        // New bucket has data
        if (bucket.state.root.data !== null) {
          console.log('SUB A 4', bucket.key)
          prevBucket.current = bucket
          // Clear prev A subscription
          subA.current()
          // Create new sub
          subA.current = bucket.subscribe(rerender)

          // NOTE: In the future an opt can be swap A B when the bucket
          // is the same ....
          if (subB.current) {
            subB.current()
            subB.current = null
          }
        } else {
          console.log('SUB B 4', bucket.key)
          if (subB.current) {
            subB.current()
          }
          subB.current = bucket.subscribe(rerender)
        }
      }
    }
  }, [bucket, rerender, bucket.state.root.data])

  // Clear pending subscription on unmount
  useEffect(() => {
    return () => {
      if (subA.current) {
        subA.current()
      }
      if (subB.current) {
        subB.current()
      }
    }
  }, [])

  // console.log(
  //   'CURRENT',
  //   bucket.key,
  //   bucket.state.root.data !== null,
  //   bucket.state.root
  // )
  // console.log(
  //   'PREV',
  //   prevBucket.current.key,
  //   prevBucket.current.state.root.data !== null,
  //   prevBucket.current.state.root
  // )

  let resolvedBucket, currentBucket
  if (bucket.state.root.data !== null) {
    resolvedBucket = bucket
    currentBucket = bucket
  } else {
    resolvedBucket = prevBucket.current
    currentBucket = bucket
  }

  const memoResolvedState = resolvedBucket.memoizedState
  const actionsForResolvedState = resolvedBucket.actions

  const memoCurrentState = currentBucket.memoizedState
  const actionsForCurrentState = currentBucket.actions

  return [
    memoResolvedState,
    memoCurrentState,
    actionsForResolvedState,
    actionsForCurrentState,
  ]
}
