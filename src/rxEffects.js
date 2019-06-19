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
function filterEffectActions(action) {
  return EffectActions.indexOf(action.type) !== -1
}
function filterNonEffectActions(action) {
  return EffectActions.indexOf(action.type) === -1
}

// Apply take effect only to RUN, CLEAN and CANCEL
// if an action different from theese is emitted simply emit/dispatch them
function chainOnlyOnEffectActions(action$, toObservableEffect) {
  const pubblishAction$ = action$.pipe(publish())
  pubblishAction$.connect()

  return merge(
    toObservableEffect(pubblishAction$.pipe(filter(filterEffectActions))),
    pubblishAction$.pipe(filter(filterNonEffectActions))
  )
}

function takeUntilCancelAction(action$) {
  return takeUntil(
    action$.pipe(
      filter(action => action.type === CLEAN || action.type === CANCEL)
    )
  )
}

export const TAKE_EFFECT_LATEST = 'latest'

function mapToLatest(action$, mapActionToObserable) {
  return switchMap(action => {
    // Switch Map take always the last task so cancel ecc are auto emitted
    if (action.type === CANCEL || action.type === CLEAN) {
      return of(action)
    }
    return concat(of(action), mapActionToObserable(action)).pipe(
      takeUntilCancelAction(action$)
    )
  })
}

export function takeEffectLatest(action$, state$, mapActionToObserable) {
  return chainOnlyOnEffectActions(action$, effectAction$ =>
    effectAction$.pipe(mapToLatest(effectAction$, mapActionToObserable))
  )
}

export const TAKE_EFFECT_EVERY = 'every'

export function takeEffectEvery(action$, state$, mapActionToObserable) {
  return chainOnlyOnEffectActions(action$, effectAction$ =>
    effectAction$.pipe(
      mergeMap(action => {
        // Marge Map take every
        if (action.type === CANCEL || action.type === CLEAN) {
          return of(action)
        }
        return concat(
          of(action),
          mapActionToObserable(action).pipe(
            takeUntilCancelAction(effectAction$)
          )
        )
      })
    )
  )
}

// export const TAKE_EFFECT_QUEUE = 'queue'

export const TAKE_EFFECT_EXHAUST = 'exhaust'

export function takeEffectExhaust(action$, state$, mapActionToObserable) {
  return chainOnlyOnEffectActions(action$, effectAction$ =>
    merge(
      effectAction$.pipe(
        mergeMap(action => {
          if (action.type === CANCEL || action.type === CLEAN) {
            return of(action)
          } else {
            return empty()
          }
        })
      ),
      effectAction$.pipe(
        exhaustMap(action => {
          if (action.type === CANCEL || action.type === CLEAN) {
            return empty()
          }
          return concat(of(action), mapActionToObserable(action)).pipe(
            takeUntilCancelAction(effectAction$)
          )
        })
      )
    )
  )
}

export const TAKE_EFFECT_GROUP_BY = 'groupBy'

export function takeEffectGroupBy(
  action$,
  state$,
  mapActionToObserable,
  effectTypeArgs
) {
  const groupByFn = effectTypeArgs[0]
  if (typeof groupByFn !== 'function') {
    throw new Error(
      '[react-rj] when you choose the groupBy ' +
        'takeEffect you must provide a function to group by the effect.'
    )
  }
  return chainOnlyOnEffectActions(action$, effectAction$ =>
    effectAction$.pipe(
      groupBy(groupByFn),
      mergeMap($group => $group.pipe(mapToLatest($group, mapActionToObserable)))
    )
  )
}
