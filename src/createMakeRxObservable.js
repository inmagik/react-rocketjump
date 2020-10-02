import { of, from, concat, throwError, merge, isObservable } from 'rxjs'
import { map, catchError, filter } from 'rxjs/operators'
import { squashExportValue } from 'rocketjump-core'
import { SUCCESS, FAILURE, PENDING, RUN, CLEAN, CANCEL } from './actionTypes'
import { arrayze } from 'rocketjump-core/utils'
import { isPromise } from './helpers'
import RxEffects from './rxEffects'

const defaultEffectCaller = (call, ...args) => call(...args)

const makeRunTimeEffectCaller = (effectCaller, injectEffectCaller) => {
  const finalEffectCaller = squashExportValue(
    effectCaller,
    [injectEffectCaller].filter(Boolean)
  )
  // Use default effect caller
  if (!finalEffectCaller) {
    return defaultEffectCaller
  }

  // Use squashed effect caller
  return finalEffectCaller
}

const EffectActions = [CLEAN, RUN, CANCEL]
function filterStandarEffectActions(action, prefix) {
  return EffectActions.map((a) => prefix + a).indexOf(action.type) !== -1
}

export default function createMakeRxObservable(
  { effect: effectCall, effectCaller, takeEffect },
  prefix = ''
) {
  return function makeRxObservable(actionObservable, stateObservable) {
    // Make run time caller from effect action
    function getEffectCaller(action) {
      const effectArgs = action?.['@@RJ/EFFECT_ARGS']?.current
      return makeRunTimeEffectCaller(
        effectCaller, // Defined in rocketjump config
        effectArgs?.effectCaller // Run time effect caller
      )
    }

    // Generate a result Observable from a given action
    // a RUN action but this is not checked is up to you
    // pass the corret action
    // in plus emit the PENDING action before invoke the effect
    // action => Observable(<PENDING>, <SUCCESS>|<FAILURE>)
    function mapActionToObservable(action) {
      const { payload, meta, callbacks } = action
      const params = payload.params

      const effectCaller = getEffectCaller(action)
      const effectResult = effectCaller(effectCall, ...params)

      if (!(isPromise(effectResult) || isObservable(effectResult))) {
        return throwError(
          'The effect result is expect ' +
            `to be a Promise or an RxObservable but '${effectResult}' ` +
            `was given. Please check your effect and effectCaller logic.`
        )
      }

      return concat(
        of({ type: prefix + PENDING, meta }),
        from(effectResult).pipe(
          map((data) => ({
            type: prefix + SUCCESS,
            payload: { data, params },
            meta,
            // Callback runned from the subscribtion in the react hook
            successCallback: callbacks ? callbacks.onSuccess : undefined,
          })),
          catchError((error) => {
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

    // Custom take effect
    if (typeof effectType === 'function') {
      return effectType(actionObservable, stateObservable, {
        effect: effectCall,
        runSideEffectAction: mapActionToObservable,
        getEffectCaller,
      })
    } else {
      // Invalid effect type
      if (RxEffects[effectType] === undefined) {
        throw new Error(
          `[react-rocketjump] takeEffect: ${takeEffect} is an invalid effect.`
        )
      }

      const createEffect = RxEffects[effectType]

      // Apply the effect only to RUN, CLEAN and CANCEL + prefx
      return createEffect(
        // TODO: MAKE PREFIX MORE PREDICABLE MAKE CUSTOM SIDE SHIT
        // MORE INTEGRABLE .........
        actionObservable.pipe(
          filter((a) => filterStandarEffectActions(a, prefix))
        ),
        stateObservable,
        mapActionToObservable,
        effectTypeArgs,
        prefix
      )
    }
  }
}

// GioVa nel posto fa freddo brrrrrrrrrrrrr
export function mergeMakeRxObservables(baseCreator, ...creators) {
  return (actionObservable, stateObservable) => {
    const baseDispatchObservable = baseCreator(
      actionObservable,
      stateObservable
    )

    const dispatchObservables2Merge = creators.reduce(
      (dispatchObservables, rxCreator) => {
        const nextDispatchObservable = rxCreator(
          actionObservable,
          stateObservable
        )
        dispatchObservables.push(nextDispatchObservable)
        return dispatchObservables
      },
      [baseDispatchObservable]
    )

    return merge(...dispatchObservables2Merge)
  }
}
