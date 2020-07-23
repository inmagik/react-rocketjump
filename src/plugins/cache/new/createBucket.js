import { BehaviorSubject, Subject, of, empty } from 'rxjs'
import { switchMap, delay, share } from 'rxjs/operators'
import { isEffectAction, bindActionCreators } from 'rocketjump-core'
import { INIT, RUN } from '../../../actionTypes'
import { makeDispatchWithCallbacks } from './utils'
import createMountedInstance from './createMountedInstance'

// Create an RJ Bukcet

let cacheRunIdCounter = 0
function makeUniqueCacheRunId() {
  return cacheRunIdCounter++
}

// A bucket is
export default function createBucket(cacheStore, rjObject, params, key) {
  const {
    makeRxObservable,
    makeSelectors,
    computeState,
    reducer,
    actionCreators,
    cache: cacheOptions,
  } = rjObject

  const bucket = {
    // Bucket info
    // Related rj object
    rjObject,
    // Bucket params
    params,
    // Key generated from params
    key,
    // Memo-selectors of rj object
    selectors: makeSelectors(),
    // Handle the ongoing run id grubbed from action.metac.acheRunId
    ongoingRun: null,
    // Set of mounted instances
    instances: new Set(),
    // ...Suspense...
    // Last run was suspened on this bucket?
    wasSuspended: false,
    // Handle current promise
    currentPromise: null,
  }

  // State
  bucket.state = reducer(undefined, { type: INIT })
  bucket.memoizedState =
    typeof computeState === 'function'
      ? computeState(bucket.state, bucket.selectors)
      : bucket.state
  const stateSubject = new BehaviorSubject(bucket.state)
  bucket.stateObservable = stateSubject.asObservable()

  // Dispatch an action
  // Calculate the new state via rj object reducer
  // set the new state on current bucket emit new state
  // on rj bucket observable
  bucket.dispatchToState = action => {
    const nextState = reducer(bucket.state, action)
    bucket.state = nextState
    bucket.memoizedState =
      typeof computeState === 'function'
        ? computeState(bucket.state, bucket.selectors)
        : bucket.state
    stateSubject.next(nextState)
  }

  // Garbage Collector
  // schedule a GC in cache time if another GC job is scheduled
  // the GC cancel last job and re-start waiting cache time
  // in this way the GC is guarantee to be called in cache time
  // for LAST gc scheduled
  const gcSubject = new Subject()
  const gcObservable = gcSubject.asObservable().pipe(
    switchMap(action => {
      if (action.type === 'gc') {
        return of(action).pipe(delay(cacheOptions.cacheTime))
      }
      return empty()
    })
  )
  gcObservable.subscribe(action => {
    // Delete actual bucket from parent buckets map only
    // When no instances attached 2 bucket
    if (bucket.instances.size === 0) {
      cacheStore.buckets.delete(key)
    }
  })
  bucket.scheduleGC = () => {
    gcSubject.next({ type: 'gc' })
  }

  // Action + Side Effects
  const actionsSubject = new Subject()
  const actionObserable = actionsSubject.asObservable()

  const effectObservable = makeRxObservable(
    actionObserable,
    bucket.stateObservable
  )[0].pipe(share())
  effectObservable.subscribe(makeDispatchWithCallbacks(bucket.dispatchToState))

  // Dispatch on state or trigger a side effect on rj object rx side effects
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

  // Rj Actions BAG !
  bucket.actions = bindActionCreators(actionCreators, bucket.dispatch)

  // RUN BUCKET!
  // Dispatch an good old RJ RUN action with current params
  bucket.run = () => {
    const cacheRunId = makeUniqueCacheRunId()
    bucket.actions.run
      .withMeta({
        cacheRunId,
      })
      .run(...bucket.params)
    bucket.currentPromise = bucket.actions.run
      .onSuccess(() => {
        bucket.currentPromise = null
      })
      .onFailure(() => {
        bucket.currentPromise = null
      })
      .asPromise(...params)
    return cacheRunId
  }

  // Rj Memo actions \w current bucket run...
  bucket.memoizedActions = { ...bucket.actions, reRun: bucket.run }

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
    bucket.run()
    return bucket.currentPromise
  }

  bucket.subscribe = (cb, config) => {
    const mountedInstance = createMountedInstance(bucket, cb)
    bucket.instances.add(mountedInstance)
    mountedInstance.refreshInstance(config)
    return () => mountedInstance.clear()
  }

  return bucket
}
