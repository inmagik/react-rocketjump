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
function filterEffectActions(action, prefix) {
  return EffectActions.map((a) => prefix + a).indexOf(action.type) !== -1
}
function filterNonEffectActions(action, prefix) {
  return EffectActions.map((a) => prefix + a).indexOf(action.type) === -1
}

export default function createMakeRxObservable(
  { effect: effectCall, effectCaller, takeEffect },
  prefix = ''
) {
  return function makeRxObservable(
    actionObservable,
    stateObservable,
    prevObservable // <---- The observable to merge along
  ) {
    // Generate a result Observable from a given action
    // a RUN action but this is not checked is up to you
    // pass the corret action
    // in plus emit the PENDING action before invoke the effect
    // action => Observable(<PENDING>, <SUCCESS>|<FAILURE>)
    function mapActionToObserable(action) {
      const { payload, meta, callbacks } = action
      const params = payload.params

      const effectArgs = action?.['@@RJ/EFFECT_ARGS']?.current
      const finalEffectCaller = makeRunTimeEffectCaller(
        effectCaller, // Defined in rocketjump config
        effectArgs?.effectCaller // Run time effect caller
      )

      const effectResult = finalEffectCaller(effectCall, ...params)

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

    // The prev observable to merge if no used the actionObservable
    const mergeObservable$ = prevObservable ? prevObservable : actionObservable

    let dispatchObservable
    // Custom take effect
    if (typeof effectType === 'function') {
      // TODO: Maybe in future check the return value of
      // custom take effect and print some warning to help
      // developers to better debugging better rj configuration
      dispatchObservable = effectType(
        actionObservable,
        mergeObservable$,
        stateObservable,
        mapActionToObserable,
        prefix
      )
    } else {
      // Invalid effect type
      if (RxEffects[effectType] === undefined) {
        throw new Error(
          `[react-rocketjump] takeEffect: ${takeEffect} is an invalid effect.`
        )
      }

      const createEffect = RxEffects[effectType]

      // Apply the effect only to RUN, CLEAN and CANCEL + prefx
      // if an action different from theese is emitted simply emit/dispatch them
      dispatchObservable = merge(
        createEffect(
          actionObservable.pipe(filter((a) => filterEffectActions(a, prefix))),
          stateObservable,
          mapActionToObserable,
          effectTypeArgs,
          prefix
        ),
        mergeObservable$.pipe(filter((a) => filterNonEffectActions(a, prefix)))
      )
    }

    return dispatchObservable
  }
}

// GioVa nel posto fa freddo brrrrrrrrrrrrr
export function mergeCreateMakeRxObservable(baseCreator, ...creators) {
  return (actionObservable, stateObservable) => {
    const baseDispatchObservable = baseCreator(
      actionObservable,
      stateObservable
    )

    const mergedDispatchObservable = creators.reduce(
      (dispatchObservable, rxCreator) => {
        const nextDispatchObservable = rxCreator(
          actionObservable,
          stateObservable,
          dispatchObservable
        )
        return nextDispatchObservable
      },
      baseDispatchObservable
    )

    return mergedDispatchObservable
  }
}
