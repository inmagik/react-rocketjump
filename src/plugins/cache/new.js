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

function createMountedInstance(bucket, cb) {
  const mountedInstance = {}

  const stateSub = bucket.stateSubject
    .asObservable()
    .pipe(skip(1), distinctUntilChanged())
    .subscribe(cb)

  const effectSub = bucket.effectObservable.subscribe(action => {
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

    bucket.dispatchToState(action)

    if (successCallback) {
      successCallback(action.payload.data)
    }
    if (failureCallback) {
      failureCallback(action.payload)
    }
  })

  mountedInstance.clear = () => {
    // console.log('Goodbye instance', mountedInstance)
    effectSub.unsubscribe()
    stateSub.unsubscribe()
    bucket.instances.delete(mountedInstance)
    if (bucket.instances.size === 0) {
      // console.log('GoodBye space cowboy')
      bucket.gcSubject.next({ type: 'gc' })
    }
  }

  return mountedInstance
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
    currentSuspenseSub: null,
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
  bucket.stateObservable = bucket.stateSubject.asObservable()

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
  const gcSub = bucket.gcObservable.subscribe(action => {
    // Delete actual bucket from parent buckets map
    if (bucket.instances.size === 0) {
      console.log('GC', key, bucket)
      gcSub.unsubscribe()
      if (bucket.currentSuspenseSub) {
        bucket.currentSuspenseSub.unsubscribe()
      }
      cacheStore.buckets.delete(key)
    }
  })

  // Action + Side Effects

  const actionsSubject = new Subject()
  const actionObserable = actionsSubject.asObservable()

  bucket.effectObservable = makeRxObservable(
    actionObserable,
    bucket.stateObservable
  )[0].pipe(share())

  bucket.dispatch = action => {
    if (isEffectAction(action)) {
      if (action.type === RUN) {
        bucket.ongoingRun = action.meta.runId ?? null
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
    console.log('GO!')
    bucket.currentSuspenseSub = bucket.effectObservable.subscribe(action => {
      // TODO: MOVE
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

      bucket.dispatchToState(action)

      if (successCallback) {
        successCallback(action.payload.data)
      }
      if (failureCallback) {
        failureCallback(action.payload)
      }
    })

    // TODO: REMOVE THIS SHIT
    // FIXME: It's not safe to schedule a GC very lowe time
    // between render and commit react phase
    // so schedule a MIN of seconds between the GC
    // GC is necessary to avoid leak when render is called but the commit
    // phase not so at least for this seconds Y cache expires
    const EXTRA_GC_TIME_FOR_SUSPENSE = Math.max(
      3 * 1000,
      cacheOptions.cacheTime
    )
    bucket.currentPromise = bucket.actions.run
      .onSuccess(() => {
        bucket.currentPromise = null
        bucket.currentSuspenseSub.unsubscribe()
        bucket.gcSubject.next({ type: 'gc', time: EXTRA_GC_TIME_FOR_SUSPENSE })
      })
      .onFailure(() => {
        bucket.currentPromise = null
        // bucket.currentSuspenseSub.unsubscribe()
        bucket.gcSubject.next({ type: 'gc', time: EXTRA_GC_TIME_FOR_SUSPENSE })
      })
      .asPromise(...params)
    return bucket.currentPromise
  }

  bucket.subscribe = cb => {
    const mountedInstance = createMountedInstance(bucket, cb)
    bucket.instances.add(mountedInstance)

    if (bucket.instances.size === 1) {
      if (!bucket.wasSuspended) {
        console.log('RUN ON SUB FOR', key, params)
        bucket.actions.run(...params)
      } else {
        bucket.wasSuspended = false
      }
    }

    return () => mountedInstance.clear()
  }

  return bucket
}

function createCacheStore() {
  const cacheStore = {
    buckets: new Map(),
  }

  cacheStore.makeActions = (rjObject, matchKey = '') => {
    function dispatch(action) {
      // TODO: Add an option to skip buckets \w no instances attacched .....
      cacheStore.buckets.forEach(bucket => {
        // TODO: Improve matching ....
        // if (bucket.key.indexOf(matchKey) === 0) {
        bucket.dispatch(action)
        // }
      })
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

// TODO: BaD NAME
let bigCacheStore = createCacheStore()

console.log(bigCacheStore)

function useRerender() {
  const [, forceUpdate] = useState(0)
  return useCallback(() => forceUpdate(c => c + 1), [])
}

// TODO: handle params
export function useRjActions(rjObject, params = []) {
  return useMemo(() => {
    return bigCacheStore.makeActions(rjObject)
  }, [rjObject])
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
