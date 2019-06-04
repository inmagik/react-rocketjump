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

function takeUntilCancelAction($source) {
  return takeUntil(
    $source.pipe(
      filter(action => action.type === CLEAN || action.type === CANCEL)
    )
  )
}

export const TAKE_EFFECT_LATEST = 'latest'

function mapToLatest($source, mapActionToObserable) {
  return switchMap(action => {
    // Switch Map take always the last task so cancel ecc are auto emitted
    if (action.type === CANCEL || action.type === CLEAN) {
      return of(action)
    }
    return concat(of(action), mapActionToObserable(action)).pipe(
      takeUntilCancelAction($source)
    )
  })
}

export function takeEffectLatest($source, mapActionToObserable) {
  return $source.pipe(mapToLatest($source, mapActionToObserable))
}

export const TAKE_EFFECT_EVERY = 'every'

export function takeEffectEvery($source, mapActionToObserable) {
  return $source.pipe(
    mergeMap(action => {
      // Marge Map take every
      if (action.type === CANCEL || action.type === CLEAN) {
        return of(action)
      }
      return concat(
        of(action),
        mapActionToObserable(action).pipe(takeUntilCancelAction($source))
      )
    })
  )
}

// export const TAKE_EFFECT_QUEUE = 'queue'

export const TAKE_EFFECT_EXHAUST = 'exhaust'

export function takeEffectExhaust($source, mapActionToObserable) {
  return merge(
    $source.pipe(
      mergeMap(action => {
        if (action.type === CANCEL || action.type === CLEAN) {
          return of(action)
        } else {
          return empty()
        }
      })
    ),
    $source.pipe(
      exhaustMap(action => {
        if (action.type === CANCEL || action.type === CLEAN) {
          return empty()
        }
        return concat(of(action), mapActionToObserable(action)).pipe(
          takeUntilCancelAction($source)
        )
      })
    )
  )
}

export const TAKE_EFFECT_GROUP_BY = 'groupBy'

export function takeEffectGroupBy(
  $source,
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
  return $source.pipe(
    groupBy(groupByFn),
    mergeMap($group => $group.pipe(mapToLatest($group, mapActionToObserable)))
  )
}
