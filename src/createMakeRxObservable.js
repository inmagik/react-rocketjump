import {
  of,
  from,
  concat,
  throwError,
  merge,
  BehaviorSubject,
  isObservable,
} from 'rxjs'
import { map, catchError, filter } from 'rxjs/operators'
import { squashExportValue } from 'rocketjump-core'
import { SUCCESS, FAILURE, PENDING, RUN, CLEAN, CANCEL } from './actionTypes'
import { arrayze } from 'rocketjump-core/utils'
import { isPromise } from './helpers'
import RxEffects from './rxEffects'

const defaultEffectCaller = (call, ...args) => call(...args)

const makeRunTimeConfig = (effectCaller, extraConfig) => {
  const placeholderEffectCaller = extraConfig.effectCaller
  let callEffect
  callEffect = squashExportValue(
    effectCaller,
    [placeholderEffectCaller].filter(Boolean)
  )
  // Use default effect caller
  if (!callEffect) {
    callEffect = defaultEffectCaller
  }

  const runTimeExtraConfig = {
    callEffect,
  }
  return runTimeExtraConfig
}

// OOP is Just a Dream
class ExtraSideEffectSubject extends BehaviorSubject {
  constructor(value, effectCaller) {
    super(makeRunTimeConfig(effectCaller, value))
    this.effectCaller = effectCaller
  }

  next(extraConfig) {
    return super.next(makeRunTimeConfig(this.effectCaller, extraConfig))
  }
}

const EffectActions = [CLEAN, RUN, CANCEL]
function filterEffectActions(action, prefix) {
  return EffectActions.map(a => prefix + a).indexOf(action.type) !== -1
}
function filterNonEffectActions(action, prefix) {
  return EffectActions.map(a => prefix + a).indexOf(action.type) === -1
}

export default function createMakeRxObservable(
  { effect: effectCall, effectCaller, takeEffect },
  prefix = ''
) {
  return function makeRxObservable(
    action$,
    state$,
    placeholderEffectCaller,
    prevObservable$ // <---- The observable to merge along
  ) {
    // Extra side effect configuration subject
    // used to emit changes on extra conf from outside world
    const extraSideEffectSubject = new ExtraSideEffectSubject(
      {
        effectCaller: placeholderEffectCaller,
      },
      effectCaller
    )
    const extraSideEffectObs$ = extraSideEffectSubject.asObservable()

    // Generate a result Observable from a given action
    // a RUN action but this is not checked is up to you
    // pass the corret action
    // in plus emit the PENDING action before invoke the effect
    // action => Observable(<PENDING>, <SUCCESS>|<FAILURE>)
    function mapActionToObserable(action, { callEffect }) {
      const { payload, meta, callbacks } = action
      const params = payload.params

      const effectResult = callEffect(effectCall, ...params)

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

    // The prev observable to merge if no used the action$
    const mergeObservable$ = prevObservable$ ? prevObservable$ : action$

    let dispatchObservable
    // Custom take effect
    if (typeof effectType === 'function') {
      // TODO: Maybe in future check the return value of
      // custom take effect and print some warning to help
      // developers to better debugging better rj configuration
      dispatchObservable = effectType(
        action$,
        mergeObservable$,
        state$,
        extraSideEffectObs$,
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
          action$.pipe(filter(a => filterEffectActions(a, prefix))),
          state$,
          extraSideEffectObs$,
          mapActionToObserable,
          effectTypeArgs,
          prefix
        ),
        mergeObservable$.pipe(filter(a => filterNonEffectActions(a, prefix)))
      )
    }
    return [dispatchObservable, config => extraSideEffectSubject.next(config)]
  }
}

// GioVa nel posto fa freddo brrrrrrrrrrrrr
export function mergeCreateMakeRxObservable(...creators) {
  return (action$, state$, effectCaller) => {
    // TODO: Enable and test the following lines
    // when expose mergeCreateMakeRxObservable as library function
    // if (creators.length === 0) {
    //   throw new Error('You should provide at least one creator to merge.')
    // }
    const [firstCreator, ...otherCreators] = creators
    const [firstDispatch$, updateConfig] = firstCreator(
      action$,
      state$,
      effectCaller
    )

    const [dispatch$, configUpdaters] = otherCreators.reduce(
      ([dispatch$, updaters], rxCreator) => {
        const [nextDispatch$, updateConfig] = rxCreator(
          action$,
          state$,
          effectCaller,
          dispatch$
        )
        return [nextDispatch$, updaters.concat(updateConfig)]
      },
      [firstDispatch$, [updateConfig]]
    )

    return [
      dispatch$,
      config => configUpdaters.forEach(updateConfig => updateConfig(config)),
    ]
  }
}
