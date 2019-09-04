import { useEffect, useReducer, useContext } from 'react'
import { Subject, ReplaySubject } from 'rxjs'
import { useConstant } from './hooks'
import ConfigureRjContext from './ConfigureRjContext'
import { isEffectAction } from './actionCreators'

// A "mini" redux
// a reducer for handle state
// and the roboust rxjs to handle complex side effecs in a pure, declarative, fancy way!
export default function useMiniRedux(reducer, makeObservable) {
  // ACTION$ -> RX -> React Hook dispatch()
  const actionSubject = useConstant(() => new Subject())
  const action$ = useConstant(() => actionSubject.asObservable())

  // STATE$ reducer() -> nextState -> reducer(nextState)
  const stateSubject = useConstant(() => new ReplaySubject())
  const state$ = useConstant(() => stateSubject.asObservable())

  // Emit a state update to state$
  // ... keep a reference of current state
  function emitStateUpdate(nextState) {
    if (state$.value !== nextState) {
      state$.value = nextState
      stateSubject.next(nextState)
    }
  }

  // Proxy reducer to have always the state$ observable in sync
  // with the action dispatched
  function initReducer(initialArg) {
    const initialState = reducer(initialArg, { type: '@@INIT' })
    emitStateUpdate(initialState)
    return initialState
  }
  function proxyReducer(prevState, action) {
    const nextState = reducer(prevState, action)
    emitStateUpdate(nextState)
    return nextState
  }
  const [state, dispatch] = useReducer(proxyReducer, undefined, initReducer)

  const extraConfig = useContext(ConfigureRjContext)
  const dispatcher$ = useConstant(() => {
    // Dispatch the action returned from observable
    return makeObservable(
      action$,
      state$,
      extraConfig ? extraConfig.effectCaller : undefined
    )
  })
  const subscription = useConstant(() => dispatcher$.subscribe(dispatch))

  // On unmount unsub
  useEffect(() => {
    return () => subscription.unsubscribe()
  }, [subscription])

  const dispatchWithEffect = useConstant(() => action => {
    if (isEffectAction(action)) {
      // Emit action to given observable theese perform side
      // effect and emit action dispatched above by subscription
      actionSubject.next(action)
    } else {
      // Update the state \w given reducer
      // console.log('D', action)
      dispatch(action)
    }
  })

  return [state, dispatchWithEffect, dispatcher$]
}
