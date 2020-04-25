import blamer from 'rocketjump-core/blamer.macro'
import { CLEAN, CANCEL } from './actionTypes'
import { of, concat, empty, merge } from 'rxjs'
import {
  switchMap,
  mergeMap,
  exhaustMap,
  // concatMap,
  withLatestFrom,
  groupBy,
  takeUntil,
  filter,
} from 'rxjs/operators'

function takeUntilCancelAction(action$, prefix) {
  return takeUntil(
    action$.pipe(
      filter(
        action =>
          action.type === prefix + CLEAN || action.type === prefix + CANCEL
      )
    )
  )
}

export const TAKE_EFFECT_LATEST = 'latest'

function mapToLatest(action$, mapActionToObserable, prefix) {
  return switchMap(([action, extraSideEffectConfig]) => {
    // Switch Map take always the last task so cancel ecc are auto emitted
    if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
      return of(action)
    }
    return concat(
      of(action),
      mapActionToObserable(action, extraSideEffectConfig)
    ).pipe(takeUntilCancelAction(action$, prefix))
  })
}

function takeEffectLatest(
  action$,
  state$,
  extraSideEffectObs$,
  mapActionToObserable,
  effectTypeArgs,
  prefix
) {
  return action$.pipe(
    withLatestFrom(extraSideEffectObs$),
    mapToLatest(action$, mapActionToObserable, prefix)
  )
}

export const TAKE_EFFECT_EVERY = 'every'

function takeEffectEvery(
  action$,
  state$,
  extraSideEffectObs$,
  mapActionToObserable,
  effectTypeArgs,
  prefix
) {
  return action$.pipe(
    withLatestFrom(extraSideEffectObs$),
    mergeMap(([action, extraSideEffectConfig]) => {
      // Marge Map take every
      if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
        return of(action)
      }
      return concat(
        of(action),
        mapActionToObserable(action, extraSideEffectConfig).pipe(
          takeUntilCancelAction(action$, prefix)
        )
      )
    })
  )
}

// export const TAKE_EFFECT_QUEUE = 'queue'

function actionToExhaustObservableEffect(
  action$,
  extraSideEffectObs$,
  mapActionToObserable,
  prefix
) {
  return merge(
    action$.pipe(
      mergeMap(action => {
        if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
          return of(action)
        } else {
          return empty()
        }
      })
    ),
    action$.pipe(
      withLatestFrom(extraSideEffectObs$),
      exhaustMap(([action, extraSideEffectConfig]) => {
        if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
          return empty()
        }
        return concat(
          of(action),
          mapActionToObserable(action, extraSideEffectConfig)
        ).pipe(takeUntilCancelAction(action$, prefix))
      })
    )
  )
}

export const TAKE_EFFECT_EXHAUST = 'exhaust'

function takeEffectExhaust(
  action$,
  state$,
  extraSideEffectObs$,
  mapActionToObserable,
  effectTypeArgs,
  prefix
) {
  return actionToExhaustObservableEffect(
    action$,
    extraSideEffectObs$,
    mapActionToObserable,
    prefix
  )
}

export const TAKE_EFFECT_GROUP_BY = 'groupBy'

function takeEffectGroupBy(
  action$,
  state$,
  extraSideEffectObs$,
  mapActionToObserable,
  effectTypeArgs,
  prefix
) {
  const groupByFn = effectTypeArgs[0]
  if (typeof groupByFn !== 'function') {
    blamer(
      '[rj-config-error]',
      '[react-rj] when you choose the groupBy ' +
        'takeEffect you must provide a function to group by the effect.'
    )
  }
  return action$.pipe(
    groupBy(groupByFn),
    mergeMap($group =>
      $group.pipe(
        withLatestFrom(extraSideEffectObs$),
        mapToLatest($group, mapActionToObserable, prefix)
      )
    )
  )
}

export const TAKE_EFFECT_GROUP_BY_EXHAUST = 'groupByExhaust'

function takeEffectGroupByExhaust(
  action$,
  state$,
  extraSideEffectObs$,
  mapActionToObserable,
  effectTypeArgs,
  prefix
) {
  const groupByFn = effectTypeArgs[0]
  if (typeof groupByFn !== 'function') {
    blamer(
      '[rj-config-error]',
      '[react-rj] when you choose the groupByExhaust ' +
        'takeEffect you must provide a function to group by the effect.'
    )
  }
  return action$.pipe(
    groupBy(groupByFn),
    mergeMap($group =>
      actionToExhaustObservableEffect(
        $group,
        extraSideEffectObs$,
        mapActionToObserable,
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
