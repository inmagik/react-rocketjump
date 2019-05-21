import { of, from, concat, empty, merge } from 'rxjs'
import {
  map,
  switchMap,
  mergeMap,
  exhaustMap,
  // concatMap,
  catchError,
  groupBy,
  tap,
  takeUntil,
  filter,
} from 'rxjs/operators'
import { SUCCESS, FAILURE, PENDING, CLEAN, CANCEL } from './actionTypes'

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

function takeEffectLatest($source, mapActionToObserable) {
  return $source.pipe(mapToLatest($source, mapActionToObserable))
}

export const TAKE_EFFECT_EVERY = 'every'

function takeEffectEvery($source, mapActionToObserable) {
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

function takeEffectExhaust($source, mapActionToObserable) {
  return merge(
    $source.pipe(
      mergeMap(action =>
        action.type === CANCEL || action.type === CLEAN ? of(action) : empty()
      )
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

function takeEffectGroupBy($source, mapActionToObserable, effectTypeArgs) {
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

const defaultCallEffect = (call, ...args) => call(...args)

export default function createMakeRxObservable({
  effect: effectCall,
  callEffect = defaultCallEffect,
  takeEffect,
}) {
  return function makeRxObservable($source) {
    // Generate a result Observable from a given action
    // a RUN action but this is not checked is up to you
    // pass the corret action
    // in plus emit the PENDING action before invoke the effect
    // action => Observable(<PENDING>, <SUCCESS>|<FAILURE>)
    function mapActionToObserable(action) {
      const { payload, meta, callbacks } = action
      const params = payload.params

      return concat(
        of({ type: PENDING, meta }),
        from(callEffect(effectCall, ...params)).pipe(
          map(data => ({ type: SUCCESS, payload: { data, params }, meta })),
          catchError(error => of({ type: FAILURE, payload: error, meta })),
          tap(action => {
            // NOTE: This code may look strange but this dragon
            // trick is usde only 2 go to next event loop and flush
            // all the update related to dispatch maybe in future
            // implement somenthing like onPreSuccess onPostSuccess
            // but for now i think the most common use cases is to
            // have all the state related to SUCCESS/FAILURE apllied
            Promise.resolve().then(() => {
              if (action.type === SUCCESS && callbacks.onSuccess) {
                callbacks.onSuccess(action.payload.data)
              }
              if (action.type === FAILURE && callbacks.onFailure) {
                callbacks.onFailure(action.payload)
              }
            })
          })
        )
      )
    }

    const [effectType, ...effectTypeArgs] = takeEffect

    // Custom take effect
    if (typeof effectType === 'function') {
      // TODO: Maybe in future check the return value of
      // custom take effect and print some warning to help
      // developers to better debugging better rj configuration
      return effectType($source, mapActionToObserable)
    } else if (effectType === TAKE_EFFECT_LATEST) {
      return takeEffectLatest($source, mapActionToObserable)
    } else if (effectType === TAKE_EFFECT_EVERY) {
      return takeEffectEvery($source, mapActionToObserable)
      /*} else if (effectType === TAKE_EFFECT_QUEUE) {
      return takeEffectQueue($source, mapActionToObserable)*/
    } else if (effectType === TAKE_EFFECT_EXHAUST) {
      return takeEffectExhaust($source, mapActionToObserable)
    } else if (effectType === TAKE_EFFECT_GROUP_BY) {
      return takeEffectGroupBy($source, mapActionToObserable, effectTypeArgs)
    } else {
      throw new Error(
        `[react-rj] takeEffect: ${takeEffect} is an invalid effect.`
      )
    }
  }
}
