import { of, from, concat } from 'rxjs'
import {
  map,
  switchMap,
  mergeMap,
  exhaustMap,
  concatMap,
  catchError,
  groupBy,
  tap,
} from 'rxjs/operators'
import { SUCCESS, FAILURE, PENDING, CLEAN } from './actionTypes'

export const TAKE_EFFECT_LATEST = 'latest'
export const TAKE_EFFECT_EVERY = 'every'
export const TAKE_EFFECT_QUEUE = 'queue'
export const TAKE_EFFECT_EXHAUST = 'exhaust'
export const TAKE_EFFECT_GROUP_BY = 'groupBy'

const defaultCallEffect = (call, ...args) => call(...args)

export default function createMakeRxObservable({
  effect: effectCall,
  callEffect = defaultCallEffect,
  takeEffect,
}) {
  return function makeRxObservable($source) {
    const [effectType, ...effectTypeArgs] = takeEffect

    const mapActionToObserableEffect = action => {
      if (action.type === CLEAN) {
        return of(action)
      }
      const { payload, meta, callbacks } = action
      const params = payload.params

      return concat(
        of(action),
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

    // TODO
    // implement custom takeEffect

    if (effectType === TAKE_EFFECT_EVERY) {
      return $source.pipe(mergeMap(mapActionToObserableEffect))
    } else if (effectType === TAKE_EFFECT_LATEST) {
      return $source.pipe(switchMap(mapActionToObserableEffect))
    } else if (effectType === TAKE_EFFECT_QUEUE) {
      return $source.pipe(concatMap(mapActionToObserableEffect))
    } else if (effectType === TAKE_EFFECT_EXHAUST) {
      return $source.pipe(exhaustMap(mapActionToObserableEffect))
    } else if (effectType === TAKE_EFFECT_GROUP_BY) {
      const groupByFn = effectTypeArgs[0]
      if (typeof groupByFn !== 'function') {
        throw new Error(
          '[react-rj] when you choose the groupBy ' +
            'takeEffect you must provide a function to group by the effect.'
        )
      }
      return $source.pipe(
        groupBy(groupByFn),
        mergeMap(group => group.pipe(switchMap(mapActionToObserableEffect)))
      )
    } else {
      throw new Error(
        `[react-rj] takeEffect: ${takeEffect} is an invalid effect.`
      )
    }
  }
}
