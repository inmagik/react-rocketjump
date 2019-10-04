import { CLEAN, CANCEL, RUN } from './actionTypes'
import { of, concat, empty, merge } from 'rxjs'
import {
  switchMap,
  publish,
  mergeMap,
  exhaustMap,
  // concatMap,
  groupBy,
  takeUntil,
  filter,
} from 'rxjs/operators'

const EffectActions = [CLEAN, RUN, CANCEL]
function filterEffectActions(action, prefix) {
  return EffectActions.map(a => prefix + a).indexOf(action.type) !== -1
}
function filterNonEffectActions(action, prefix) {
  return EffectActions.map(a => prefix + a).indexOf(action.type) === -1
}

// Apply take effect only to RUN, CLEAN and CANCEL
// if an action different from theese is emitted simply emit/dispatch them
function chainOnlyOnEffectActions(
  action$,
  mergeObservable$,
  toObservableEffect,
  prefix
) {
  // const pubblishAction$ = action$.pipe(publish())
  // pubblishAction$.connect()

  return merge(
    toObservableEffect(
      action$.pipe(filter(a => filterEffectActions(a, prefix)))
    ),
    mergeObservable$.pipe(filter(a => filterNonEffectActions(a, prefix)))
  )
}

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
  return switchMap(action => {
    // Switch Map take always the last task so cancel ecc are auto emitted
    if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
      return of(action)
    }
    return concat(of(action), mapActionToObserable(action)).pipe(
      takeUntilCancelAction(action$, prefix)
    )
  })
}

export function takeEffectLatest(
  action$,
  mergeObservable$,
  state$,
  mapActionToObserable,
  prefix
) {
  return chainOnlyOnEffectActions(
    action$,
    mergeObservable$,
    effectAction$ =>
      effectAction$.pipe(
        mapToLatest(effectAction$, mapActionToObserable, prefix)
      ),
    prefix
  )
}

export const TAKE_EFFECT_EVERY = 'every'

export function takeEffectEvery(
  action$,
  mergeObservable$,
  state$,
  mapActionToObserable,
  prefix
) {
  return chainOnlyOnEffectActions(
    action$,
    mergeObservable$,
    effectAction$ =>
      effectAction$.pipe(
        mergeMap(action => {
          // Marge Map take every
          if (
            action.type === prefix + CANCEL ||
            action.type === prefix + CLEAN
          ) {
            return of(action)
          }
          return concat(
            of(action),
            mapActionToObserable(action).pipe(
              takeUntilCancelAction(effectAction$, prefix)
            )
          )
        })
      ),
    prefix
  )
}

// export const TAKE_EFFECT_QUEUE = 'queue'

function actionToExhaustObservableEffect(
  action$,
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
      exhaustMap(action => {
        if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
          return empty()
        }
        return concat(of(action), mapActionToObserable(action)).pipe(
          takeUntilCancelAction(action$, prefix)
        )
      })
    )
  )
}

export const TAKE_EFFECT_EXHAUST = 'exhaust'

export function takeEffectExhaust(
  action$,
  mergeObservable$,
  state$,
  mapActionToObserable,
  prefix
) {
  return chainOnlyOnEffectActions(
    action$,
    mergeObservable$,
    effectAction$ =>
      actionToExhaustObservableEffect(
        effectAction$,
        mapActionToObserable,
        prefix
      ),
    prefix
  )
}

export const TAKE_EFFECT_GROUP_BY = 'groupBy'

export function takeEffectGroupBy(
  action$,
  mergeObservable$,
  state$,
  mapActionToObserable,
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
  return chainOnlyOnEffectActions(
    action$,
    mergeObservable$,
    effectAction$ =>
      effectAction$.pipe(
        groupBy(groupByFn),
        mergeMap($group =>
          $group.pipe(mapToLatest($group, mapActionToObserable, prefix))
        )
      ),
    prefix
  )
}

export const TAKE_EFFECT_GROUP_BY_EXHAUST = 'groupByExhaust'

export function takeEffectGroupByExhaust(
  action$,
  mergeObservable$,
  state$,
  mapActionToObserable,
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
  return chainOnlyOnEffectActions(
    action$,
    mergeObservable$,
    effectAction$ =>
      effectAction$.pipe(
        groupBy(groupByFn),
        mergeMap($group =>
          actionToExhaustObservableEffect($group, mapActionToObserable, prefix)
        )
      ),
    prefix
  )
}
