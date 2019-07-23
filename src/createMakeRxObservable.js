import { of, from, concat, throwError } from 'rxjs'
import {
  map,
  // concatMap,
  catchError,
  tap,
} from 'rxjs/operators'
import { SUCCESS, FAILURE, PENDING } from './actionTypes'
import { arrayze } from 'rocketjump-core/utils'
import {
  // Latest
  TAKE_EFFECT_LATEST,
  takeEffectLatest,
  // Every
  TAKE_EFFECT_EVERY,
  takeEffectEvery,
  // Exhaust
  TAKE_EFFECT_EXHAUST,
  takeEffectExhaust,
  // Group By
  TAKE_EFFECT_GROUP_BY,
  takeEffectGroupBy,
  // Group By Exhaust
  TAKE_EFFECT_GROUP_BY_EXHAUST,
  takeEffectGroupByExhaust,
} from './rxEffects'

const defaultCallEffect = (call, ...args) => call(...args)

export default function createMakeRxObservable(
  {
    effect: effectCall,
    effectCaller: rjCallEffect,
    takeEffect,
    effectPipeline = [],
  },
  prefix = ''
) {
  return function makeRxObservable(
    originalAction$,
    state$,
    overrideCallEffect
  ) {
    // Override the effectCaller from rj using local one istead
    // ... when no effectCaller is provided
    let callEffect
    if (typeof rjCallEffect === 'function') {
      // Use call effect from rj config
      callEffect = rjCallEffect
    } else if (rjCallEffect === 'noop') {
      // Force callEffect to default NOOP
      callEffect = defaultCallEffect
    } else if (typeof overrideCallEffect === 'function') {
      // Use the local overrideCallEffect
      callEffect = overrideCallEffect
    } else {
      // default NOOP call effect
      callEffect = defaultCallEffect
    }

    // Generate a result Observable from a given action
    // a RUN action but this is not checked is up to you
    // pass the corret action
    // in plus emit the PENDING action before invoke the effect
    // action => Observable(<PENDING>, <SUCCESS>|<FAILURE>)
    function mapActionToObserable(action) {
      const { payload, meta, callbacks } = action
      const params = payload.params

      return concat(
        of({ type: prefix + PENDING, meta }),
        from(callEffect(effectCall, ...params)).pipe(
          map(data => ({
            type: prefix + SUCCESS,
            payload: { data, params },
            meta,
          })),
          catchError(error => {
            // Avoid headache
            if (
              error instanceof TypeError ||
              error instanceof RangeError ||
              error instanceof SyntaxError ||
              error instanceof ReferenceError
            ) {
              return throwError(error)
            }
            return of({ type: prefix + FAILURE, payload: error, meta })
          }),
          tap(action => {
            // NOTE: This code may look strange but this dragon
            // trick is usde only 2 go to next event loop and flush
            // all the update related to dispatch maybe in future
            // implement somenthing like onPreSuccess onPostSuccess
            // but for now i think the most common use cases is to
            // have all the state related to SUCCESS/FAILURE apllied
            Promise.resolve().then(() => {
              if (action.type === prefix + SUCCESS && callbacks.onSuccess) {
                callbacks.onSuccess(action.payload.data)
              }
              if (action.type === prefix + FAILURE && callbacks.onFailure) {
                callbacks.onFailure(action.payload)
              }
            })
          })
        )
      )
    }

    const [effectType, ...effectTypeArgs] = arrayze(takeEffect)

    const action$ = effectPipeline.reduce(
      (action$, piper) => piper(action$, state$),
      originalAction$
    )

    // Custom take effect
    if (typeof effectType === 'function') {
      // TODO: Maybe in future check the return value of
      // custom take effect and print some warning to help
      // developers to better debugging better rj configuration
      return effectType(action$, state$, mapActionToObserable, prefix)
    } else if (effectType === TAKE_EFFECT_LATEST) {
      return takeEffectLatest(action$, state$, mapActionToObserable, prefix)
    } else if (effectType === TAKE_EFFECT_EVERY) {
      return takeEffectEvery(action$, state$, mapActionToObserable, prefix)
      /*} else if (effectType === TAKE_EFFECT_QUEUE) {
      return takeEffectQueue(action$, state$, mapActionToObserable)*/
    } else if (effectType === TAKE_EFFECT_EXHAUST) {
      return takeEffectExhaust(action$, state$, mapActionToObserable, prefix)
    } else if (effectType === TAKE_EFFECT_GROUP_BY) {
      return takeEffectGroupBy(
        action$,
        state$,
        mapActionToObserable,
        effectTypeArgs,
        prefix
      )
    } else if (effectType === TAKE_EFFECT_GROUP_BY_EXHAUST) {
      return takeEffectGroupByExhaust(
        action$,
        state$,
        mapActionToObserable,
        effectTypeArgs,
        prefix
      )
    } else {
      throw new Error(
        `[react-rocketjump] takeEffect: ${takeEffect} is an invalid effect.`
      )
    }
  }
}
