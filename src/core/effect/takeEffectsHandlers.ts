import { concat, EMPTY, Observable, of, merge } from 'rxjs'
import {
  exhaustMap,
  expand,
  filter,
  groupBy,
  mergeMap,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators'
import { CANCEL, CLEAN, RUN } from '../actions/actionTypes'
import actionMap from './actionMap'
import {
  Action,
  EffectAction,
  EffectFn,
  GetEffectCallerFn,
  TakeEffectBag,
  StateObservable,
} from '../types'

const EffectActions = [CLEAN, RUN, CANCEL]
function makeFilterStandarEffectActions(prefix: string) {
  return (action: EffectAction) =>
    EffectActions.map((a) => prefix + a).indexOf(action.type) !== -1
}

function takeUntilCancelAction(
  actionObservable: Observable<EffectAction>,
  prefix: string
) {
  return takeUntil<Action>(
    actionObservable.pipe(
      filter(
        (action) =>
          action.type === prefix + CLEAN || action.type === prefix + CANCEL
      )
    )
  )
}

function mapToLatest(
  actionObservable: Observable<EffectAction>,
  effect: EffectFn,
  getEffectCaller: GetEffectCallerFn,
  prefix: string
) {
  return switchMap((action: EffectAction) => {
    // Switch Map take always the last task so cancel ecc are auto emitted
    if (action.type === prefix + CANCEL || action.type === prefix + CLEAN) {
      return of(action)
    }
    return concat(
      of(action),
      actionMap(action, effect, getEffectCaller, prefix)
    ).pipe(takeUntilCancelAction(actionObservable, prefix))
  })
}

export function takeEffectLatest(
  allActionObservable: Observable<EffectAction>,
  stateObservable: StateObservable,
  { effect, getEffectCaller, prefix }: TakeEffectBag
) {
  const actionObservable = allActionObservable.pipe(
    filter(makeFilterStandarEffectActions(prefix))
  )
  return actionObservable.pipe(
    mapToLatest(actionObservable, effect, getEffectCaller, prefix)
  )
}

export function takeEffectEvery(
  allActionObservable: Observable<EffectAction>,
  stateObservable: StateObservable,
  { effect, getEffectCaller, prefix }: TakeEffectBag
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
        actionMap(action, effect, getEffectCaller, prefix).pipe(
          takeUntilCancelAction(actionObservable, prefix)
        )
      )
    })
  )
}

function actionToExhaustObservableEffect(
  actionObservable: Observable<EffectAction>,
  effect: EffectFn,
  getEffectCaller: GetEffectCallerFn,
  prefix: string
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
          actionMap(action, effect, getEffectCaller, prefix)
        ).pipe(takeUntilCancelAction(actionObservable, prefix))
      })
    )
  )
}

export function takeEffectExhaust(
  allActionObservable: Observable<EffectAction>,
  stateObservable: StateObservable,
  { effect, getEffectCaller, prefix }: TakeEffectBag
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

function actionToConcatLatestObservableEffect(
  actionObservable: Observable<EffectAction>,
  effect: EffectFn,
  getEffectCaller: GetEffectCallerFn,
  prefix: string
) {
  let pending = false
  let queued: EffectAction | undefined
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
        actionMap(action, effect, getEffectCaller, prefix).pipe(
          expand(() => {
            if (!queued) {
              return EMPTY
            }
            const nextAction = queued
            queued = undefined
            const projected = concat(
              of(nextAction),
              actionMap(nextAction, effect, getEffectCaller, prefix)
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

export function takeEffectConcatLatest(
  allActionObservable: Observable<EffectAction>,
  stateObservable: StateObservable,
  { effect, getEffectCaller, prefix }: TakeEffectBag
) {
  const actionObservable = allActionObservable.pipe(
    filter(makeFilterStandarEffectActions(prefix))
  )
  return actionToConcatLatestObservableEffect(
    actionObservable,
    effect,
    getEffectCaller,
    prefix
  )
}

export function takeEffectGroupBy(
  allActionObservable: Observable<EffectAction>,
  stateObservable: StateObservable,
  { effect, getEffectCaller, prefix }: TakeEffectBag,
  groupByFn?: (action: EffectAction) => any
) {
  const actionObservable = allActionObservable.pipe(
    filter(makeFilterStandarEffectActions(prefix))
  )
  if (typeof groupByFn !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        '[react-rj] when you choose the groupBy ' +
          'takeEffect you must provide a function to group by the effect.'
      )
    } else {
      throw new Error('[react-rj] bad config groupBy.')
    }
  }
  return actionObservable.pipe(
    groupBy(groupByFn),
    mergeMap((groupedObservable) =>
      groupedObservable.pipe(
        mapToLatest(groupedObservable, effect, getEffectCaller, prefix)
      )
    )
  )
}

export function takeEffectGroupByExhaust(
  allActionObservable: Observable<EffectAction>,
  stateObservable: StateObservable,
  { effect, getEffectCaller, prefix }: TakeEffectBag,
  groupByFn?: (action: EffectAction) => any
) {
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

export function takeEffectGroupByConcatLatest(
  allActionObservable: Observable<EffectAction>,
  stateObservable: StateObservable,
  { effect, getEffectCaller, prefix }: TakeEffectBag,
  groupByFn?: (action: EffectAction) => any
) {
  if (typeof groupByFn !== 'function') {
    throw new Error(
      '[react-rj] when you choose the groupByConcatLatest ' +
        'takeEffect you must provide a function to group by the effect.'
    )
  }
  const actionObservable = allActionObservable.pipe(
    filter(makeFilterStandarEffectActions(prefix))
  )
  return actionObservable.pipe(
    groupBy(groupByFn),
    mergeMap((groupedObservable) =>
      actionToConcatLatestObservableEffect(
        groupedObservable,
        effect,
        getEffectCaller,
        prefix
      )
    )
  )
}
