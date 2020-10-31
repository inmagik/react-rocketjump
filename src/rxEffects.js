import { CLEAN, CANCEL, RUN } from './actionTypes'
import { of, concat, merge, EMPTY, defer } from 'rxjs'
import {
  switchMap,
  mergeMap,
  exhaustMap,
  // concatMap,
  groupBy,
  takeUntil,
  filter,
  tap,
  expand,
} from 'rxjs/operators'
import mapRunActionToObservable from './mapRunActionToObservable'

const EffectActions = [CLEAN, RUN, CANCEL]
function makeFilterStandarEffectActions(prefix) {
  return (action) =>
    EffectActions.map((a) => prefix + a).indexOf(action.type) !== -1
}

function takeUntilCancelAction(actionObservable, prefix) {
  return takeUntil(
    actionObservable.pipe(
      filter(
        (action) =>
          action.type === prefix + CLEAN || action.type === prefix + CANCEL
      )
    )
  )
}

export const TAKE_EFFECT_LATEST = 'latest'

function mapToLatest(actionObservable, effect, getEffectCaller, prefix) {
  return switchMap((action) => {
    // Switch Map take always the last task so cancel ecc are auto emitted
    if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
      return of(action)
    }
    return concat(
      of(action),
      mapRunActionToObservable(action, effect, getEffectCaller, prefix)
    ).pipe(takeUntilCancelAction(actionObservable, prefix))
  })
}

function takeEffectLatest(
  allActionObservable,
  stateObservable,
  { effect, getEffectCaller, prefix }
) {
  const actionObservable = allActionObservable.pipe(
    filter(makeFilterStandarEffectActions(prefix))
  )
  return actionObservable.pipe(
    mapToLatest(actionObservable, effect, getEffectCaller, prefix)
  )
}

export const TAKE_EFFECT_EVERY = 'every'

function takeEffectEvery(
  allActionObservable,
  stateObservable,
  { effect, getEffectCaller, prefix }
) {
  const actionObservable = allActionObservable.pipe(
    filter(makeFilterStandarEffectActions(prefix))
  )
  return actionObservable.pipe(
    mergeMap((action) => {
      // Marge Map take every
      if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
        return of(action)
      }
      return concat(
        of(action),
        mapRunActionToObservable(action, effect, getEffectCaller, prefix).pipe(
          takeUntilCancelAction(actionObservable, prefix)
        )
      )
    })
  )
}

// export const TAKE_EFFECT_QUEUE = 'queue'

export const TAKE_EFFECT_EXPERIMENTAL_AUDIT = '__audit'

function takeEffectAudit(
  allActionObservable,
  stateObservable,
  { effect, getEffectCaller, prefix }
) {
  const actionObservable = allActionObservable.pipe(
    filter(makeFilterStandarEffectActions(prefix))
  )
  let pending = false
  let queued = undefined
  return actionObservable.pipe(
    mergeMap((action) => {
      if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
        queued = undefined
        pending = false
        return of(action)
      }
      if (pending) {
        queued = action
        return EMPTY
      }
      pending = true
      return concat(
        of(action),
        mapRunActionToObservable(action, effect, getEffectCaller, prefix).pipe(
          expand(() => {
            if (!queued) {
              return EMPTY
            }
            // console.log('Ex', queued)
            const nextAction = queued
            queued = undefined
            const projected = concat(
              of(nextAction),
              mapRunActionToObservable(
                nextAction,
                effect,
                getEffectCaller,
                prefix
              )
            )
            return projected
          })
        )
      ).pipe(
        takeUntilCancelAction(actionObservable, prefix),
        tap({
          complete: () => (pending = false),
        })
      )
    })
  )
}

function actionToExhaustObservableEffect(
  actionObservable,
  effect,
  getEffectCaller,
  prefix
) {
  return merge(
    actionObservable.pipe(
      mergeMap((action) => {
        if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
          return of(action)
        } else {
          return EMPTY
        }
      })
    ),
    actionObservable.pipe(
      exhaustMap((action) => {
        if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
          return EMPTY
        }
        return concat(
          of(action),
          mapRunActionToObservable(action, effect, getEffectCaller, prefix)
        ).pipe(takeUntilCancelAction(actionObservable, prefix))
      })
    )
  )
}

export const TAKE_EFFECT_EXHAUST = 'exhaust'

function takeEffectExhaust(
  allActionObservable,
  stateObservable,
  { effect, getEffectCaller, prefix }
) {
  const actionObservable = allActionObservable.pipe(
    filter(makeFilterStandarEffectActions(prefix))
  )
  return actionToExhaustObservableEffect(
    actionObservable,
    effect,
    getEffectCaller,
    prefix
  )
}

export const TAKE_EFFECT_GROUP_BY = 'groupBy'

function takeEffectGroupBy(
  allActionObservable,
  stateObservable,
  { effect, getEffectCaller, prefix },
  ...effectTypeArgs
) {
  const groupByFn = effectTypeArgs[0]
  if (typeof groupByFn !== 'function') {
    throw new Error(
      '[react-rj] when you choose the groupBy ' +
        'takeEffect you must provide a function to group by the effect.'
    )
  }
  const actionObservable = allActionObservable.pipe(
    filter(makeFilterStandarEffectActions(prefix))
  )
  return actionObservable.pipe(
    groupBy(groupByFn),
    mergeMap((groupedObservable) =>
      groupedObservable.pipe(
        mapToLatest(groupedObservable, effect, getEffectCaller, prefix)
      )
    )
  )
}

export const TAKE_EFFECT_GROUP_BY_EXHAUST = 'groupByExhaust'

function takeEffectGroupByExhaust(
  allActionObservable,
  stateObservable,
  { effect, getEffectCaller, prefix },
  ...effectTypeArgs
) {
  const groupByFn = effectTypeArgs[0]
  if (typeof groupByFn !== 'function') {
    throw new Error(
      '[react-rj] when you choose the groupByExhaust ' +
        'takeEffect you must provide a function to group by the effect.'
    )
  }
  const actionObservable = allActionObservable.pipe(
    filter(makeFilterStandarEffectActions(prefix))
  )
  return actionObservable.pipe(
    groupBy(groupByFn),
    mergeMap((groupedObservable) =>
      actionToExhaustObservableEffect(
        groupedObservable,
        effect,
        getEffectCaller,
        prefix
      )
    )
  )
}

const RxEffects = {
  [TAKE_EFFECT_LATEST]: takeEffectLatest,
  [TAKE_EFFECT_EVERY]: takeEffectEvery,
  [TAKE_EFFECT_EXHAUST]: takeEffectExhaust,
  [TAKE_EFFECT_EXPERIMENTAL_AUDIT]: takeEffectAudit,
  [TAKE_EFFECT_GROUP_BY]: takeEffectGroupBy,
  [TAKE_EFFECT_GROUP_BY_EXHAUST]: takeEffectGroupByExhaust,
}

export default RxEffects
