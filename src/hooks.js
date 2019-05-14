import { useRef, useEffect, useReducer, useContext } from 'react'
import { Subject } from 'rxjs'
import { isPartialRj } from 'rocketjump-core'
import ConfigureRjContext from './ConfigureRjContext'

// Thanks 2 ma man @Andarist
// https://github.com/Andarist/use-constant
export function useConstant(fn) {
  const ref = useRef()

  if (!ref.current) {
    ref.current = { v: fn() }
  }

  return ref.current.v
}

export function useRxSubject(makeObservable, callback) {
  const subject = useConstant(() => new Subject())

  // Dispatch the action returned from observable
  const subscription = useConstant(() => {
    return makeObservable(subject.asObservable()).subscribe(callback)
  })

  // On unmount unsub
  useEffect(() => {
    return () => subscription.unsubscribe()
  }, [subscription])

  return subject
}

// Simply emulate a redux reducer
export function useReduxReducer(reducer) {
  function initReducer(initialArg) {
    return reducer(initialArg, { type: '@@INIT' })
  }
  const [state, dispatch] = useReducer(reducer, undefined, initReducer)
  return [state, dispatch]
}

export function useCreateRjState(rjStateOrPartial) {
  const extraConfig = useContext(ConfigureRjContext)
  // NOTE: use useMemo if U want to change rjRunnableState
  // from <ConfigureRj> after da first mount
  // but i think this can only lead 2 stupid bugs...
  // but think about it...
  const rjRunnableState = useConstant(() => {
    if (isPartialRj(rjStateOrPartial)) {
      return rjStateOrPartial(extraConfig)
    } else {
      return rjStateOrPartial
    }
  })
  return rjRunnableState
}
