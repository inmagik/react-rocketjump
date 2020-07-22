import { bindActionCreators, isEffectAction } from 'rocketjump-core'
import { Subject, empty } from 'rxjs'
import { share } from 'rxjs/operators'
import { makeDispatchWithCallbacks } from './utils'

function dispatchToBucketsState(cacheStore, rjObject, action) {
  const { dispatchMatchParams } = action.meta ?? {}
  if (!dispatchMatchParams) {
    return
  }
  cacheStore.onEachBucket(rjObject, dispatchMatchParams, bucket =>
    bucket.dispatchToState(action)
  )
}

function makeActionsSubject(cacheStore, rjObject) {
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
    makeDispatchWithCallbacks(
      action => dispatchToBucketsState(cacheStore, rjObject, action),
      cacheStore
    )
  )
  cacheStore.actionsMap.set(ns, actionsSubject)
  return actionsSubject
}

export default function createMultiActions(
  cacheStore,
  rjObject,
  getMatchParams
) {
  const actionsSubject = makeActionsSubject(cacheStore, rjObject)

  function dispatch(action) {
    const multiMatchAction = {
      ...action,
      meta: {
        ...action.meta,
        dispatchMatchParams: getMatchParams(),
      },
    }
    if (isEffectAction(action)) {
      // Emit action to given observable theese perform side
      // effect and emit action dispatched above by subscription
      actionsSubject.next(multiMatchAction)
    } else {
      // Update the state \w given reducer
      dispatchToBucketsState(cacheStore, rjObject, multiMatchAction)
    }
  }

  return bindActionCreators(rjObject.actionCreators, dispatch)
}
