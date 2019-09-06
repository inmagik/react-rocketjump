import { useEffect, useReducer, useContext } from 'react'
import { Subject, ReplaySubject } from 'rxjs'
import { useConstant } from './hooks'
import ConfigureRjContext from './ConfigureRjContext'
import { isEffectAction } from './actionCreators'
import createRjDebugEmitter from './debugger/emitter'
import { INIT } from './actionTypes'

const NoMutationState = {}

// A "mini" redux
// a reducer for handle state
// and the roboust rxjs to handle complex side effecs in a pure, declarative, fancy way!
export default function useMiniRedux(
  reducer,
  makeObservable,
  // the rj has at least one mutations state?
  hasMutationsState,
  // debug information used as dev hints and other
  debugInfo
) {
  // Debug RJ \w classy (not in PROD)
  const debugEmitter = useConstant(() => createRjDebugEmitter(debugInfo))

  // Effect Action Observable
  // emits effect actions
  // pass through rj effect config for example { ...takeEffect: 'every' }
  // make new observable
  // $dispatchIntoReducer = makeObservable(EFFECT_ACTION$, ...)
  // the new observable dispatch the emitted actions into react useReducer state
  // $dispatchIntoReducer.subscribe(action => dispatch(action))
  const actionSubject = useConstant(() => new Subject())
  const action$ = useConstant(() => actionSubject.asObservable())

  // STATE$
  // emits state updates
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

  // Init the reducer in the REDUX way
  // pass special INIT actions and undefined to our reducer
  function initReducer(initialArg) {
    const initialState = reducer(initialArg, { type: INIT })
    // emit first state update
    emitStateUpdate(initialState)
    if (process.env.NODE_ENV !== 'production') {
      // when not in production keep a counter of dispatched actions
      debugEmitter.onStateInitialized(initialState)
      state$.__dispatchIndex = 0
      return { idx: 0, state: initialState }
    } else {
      return initialState
    }
  }

  // Proxy the original reducer
  // This is only a way to hook into the React updates
  // and grab state and action to
  // keep a reference of current state and emits state updates on observable
  // ... and call the Rj debug hooks using for example to have
  // a clear logging of state changes between times as the redux dev tools does
  function proxyReducer(prevState, action) {
    if (process.env.NODE_ENV !== 'production') {
      const nextState = reducer(prevState.state, action)
      emitStateUpdate(nextState)
      const idx = prevState.idx + 1
      if (idx > state$.__dispatchIndex) {
        debugEmitter.onActionDispatched(action, prevState.state, nextState)
        state$.__dispatchIndex = idx
      }
      return { idx, state: nextState }
    }
    const nextState = reducer(prevState, action)
    emitStateUpdate(nextState)
    return nextState
  }
  const [stateAndIdx, dispatch] = useReducer(
    proxyReducer,
    undefined,
    initReducer
  )
  const state =
    process.env.NODE_ENV !== 'production' ? stateAndIdx.state : stateAndIdx

  const extraConfig = useContext(ConfigureRjContext)
  const subscription = useConstant(() => {
    // Dispatch the action returned from observable
    return makeObservable(
      action$,
      state$,
      extraConfig ? extraConfig.effectCaller : undefined
    ).subscribe(dispatch)
  })

  // On unmount unsub
  useEffect(() => {
    return () => {
      subscription.unsubscribe()
      debugEmitter.onTeardown()
    }
  }, [subscription, debugEmitter])

  const dispatchWithEffect = useConstant(() => action => {
    if (isEffectAction(action)) {
      // Emit action to given observable theese perform side
      // effect and emit action dispatched above by subscription
      actionSubject.next(action)
    } else {
      // Update the state \w given reducer
      dispatch(action)
    }
  })

  const mainState = hasMutationsState ? state.root : state
  const mutationsState = hasMutationsState ? state.mutations : NoMutationState

  return [mainState, mutationsState, dispatchWithEffect]
}
