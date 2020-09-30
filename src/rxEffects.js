import { CLEAN, CANCEL } from './actionTypes'
import { of, concat, empty, merge } from 'rxjs'
import {
  switchMap,
  mergeMap,
  exhaustMap,
  // concatMap,
  groupBy,
  takeUntil,
  filter,
} from 'rxjs/operators'

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

function mapToLatest(actionObservable, mapActionToObservable, prefix) {
  return switchMap((action) => {
    // Switch Map take always the last task so cancel ecc are auto emitted
    if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
      return of(action)
    }
    return concat(of(action), mapActionToObservable(action)).pipe(
      takeUntilCancelAction(actionObservable, prefix)
    )
  })
}

function takeEffectLatest(
  actionObservable,
  stateObservable,
  mapActionToObservable,
  effectTypeArgs,
  prefix
) {
  return actionObservable.pipe(
    mapToLatest(actionObservable, mapActionToObservable, prefix)
  )
}

export const TAKE_EFFECT_EVERY = 'every'

function takeEffectEvery(
  actionObservable,
  stateObservable,
  mapActionToObservable,
  effectTypeArgs,
  prefix
) {
  return actionObservable.pipe(
    mergeMap((action) => {
      // Marge Map take every
      if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
        return of(action)
      }
      return concat(
        of(action),
        mapActionToObservable(action).pipe(
          takeUntilCancelAction(actionObservable, prefix)
        )
      )
    })
  )
}

// export const TAKE_EFFECT_QUEUE = 'queue'

function actionToExhaustObservableEffect(
  actionObservable,
  mapActionToObservable,
  prefix
) {
  return merge(
    actionObservable.pipe(
      mergeMap((action) => {
        if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
          return of(action)
        } else {
          return empty()
        }
      })
    ),
    actionObservable.pipe(
      exhaustMap((action) => {
        if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
          return empty()
        }
        return concat(of(action), mapActionToObservable(action)).pipe(
          takeUntilCancelAction(actionObservable, prefix)
        )
      })
    )
  )
}

export const TAKE_EFFECT_EXHAUST = 'exhaust'

function takeEffectExhaust(
  actionObservable,
  stateObservable,
  mapActionToObservable,
  effectTypeArgs,
  prefix
) {
  return actionToExhaustObservableEffect(
    actionObservable,
    mapActionToObservable,
    prefix
  )
}

export const TAKE_EFFECT_GROUP_BY = 'groupBy'

function takeEffectGroupBy(
  actionObservable,
  stateObservable,
  mapActionToObservable,
  effectTypeArgs,
  prefix
) {
  const groupByFn = effectTypeArgs[0]
  if (typeof groupByFn !== 'function') {
    throw new Error(
      '[react-rj] when you choose the groupBy ' +
        'takeEffect you must provide a function to group by the effect.'
    )
  }
  return actionObservable.pipe(
    groupBy(groupByFn),
    mergeMap((groupedObservable) =>
      groupedObservable.pipe(
        mapToLatest(groupedObservable, mapActionToObservable, prefix)
      )
    )
  )
}

export const TAKE_EFFECT_GROUP_BY_EXHAUST = 'groupByExhaust'

function takeEffectGroupByExhaust(
  actionObservable,
  stateObservable,
  mapActionToObservable,
  effectTypeArgs,
  prefix
) {
  const groupByFn = effectTypeArgs[0]
  if (typeof groupByFn !== 'function') {
    throw new Error(
      '[react-rj] when you choose the groupByExhaust ' +
        'takeEffect you must provide a function to group by the effect.'
    )
  }
  return actionObservable.pipe(
    groupBy(groupByFn),
    mergeMap((groupedObservable) =>
      actionToExhaustObservableEffect(
        groupedObservable,
        mapActionToObservable,
        prefix
      )
    )
  )
}

const RxEffects = {
  [TAKE_EFFECT_LATEST]: takeEffectLatest,
  [TAKE_EFFECT_EVERY]: takeEffectEvery,
  [TAKE_EFFECT_EXHAUST]: takeEffectExhaust,
  [TAKE_EFFECT_GROUP_BY]: takeEffectGroupBy,
  [TAKE_EFFECT_GROUP_BY_EXHAUST]: takeEffectGroupByExhaust,
}

export default RxEffects
