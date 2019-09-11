import { of, from, concat, throwError } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { squashExportValue } from 'rocketjump-core'
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

const defaultEffectCaller = (call, ...args) => call(...args)

export default function createMakeRxObservable(
  { effect: effectCall, effectCaller, takeEffect, effectPipeline },
  prefix = ''
) {
  return function makeRxObservable(
    originalAction$,
    state$,
    placeholderEffectCaller
  ) {
    // Place the placeholderEffectCaller from ConfigureRj
    // in the correct position of recursion chain
    let callEffect
    callEffect = squashExportValue(
      effectCaller,
      [placeholderEffectCaller].filter(Boolean)
    )
    // Use default effect caller
    if (!callEffect) {
      callEffect = defaultEffectCaller
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
            // Callback runned from the subscribtion in the react hook
            successCallback: callbacks ? callbacks.onSuccess : undefined,
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
            return of({
              type: prefix + FAILURE,
              payload: error,
              meta,
              // Callback runned from the subscribtion in the react hook
              failureCallback: callbacks ? callbacks.onFailure : undefined,
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
