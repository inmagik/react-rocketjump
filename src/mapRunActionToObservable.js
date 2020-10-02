import { of, from, concat, throwError, isObservable } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { SUCCESS, FAILURE, PENDING } from './actionTypes'
import { isPromise } from './helpers'

// Generate a result Observable from a given action
// a RUN action but this is not checked is up to you
// pass the corret action
// in plus emit the PENDING action before invoke the effect
// action => Observable(<PENDING>, <SUCCESS>|<FAILURE>)
export default function mapRunActionToObservable(
  action,
  effectCall,
  getEffectCaller,
  prefix
) {
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
