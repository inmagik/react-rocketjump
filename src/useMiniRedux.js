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
  // dispatchIntoReducer$ = makeObservable(EFFECT_ACTION$, ...)
  // the new observable dispatch the emitted actions into react useReducer state
  // dispatchIntoReducer$.subscribe(action => dispatch(action))
  const actionSubject = useConstant(() => new Subject())
  const action$ = useConstant(() => actionSubject.asObservable())

  // STATE$
  // emits state updates (used to build the $dispatchIntoReducer Observable)
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
      // In DEV call the debug emitter
      debugEmitter.onStateInitialized(initialState)
      // NOTE
      // First this mad shit happends only in DEV
      // Second the reason of this magic shit is because
      // call the reducer often than dispatch so logging the exact
      // sequence is impossible but sinch the purity nature of reducers
      // react call the reducer with the prev state and the exact sequence
      // and can do it based on the assumption of the purity of the reducer
      // so keeping an index in react state can helps us detect if the action
      // is alredy been dispatched and react simply re call the reducer to
      // have the state up date to render.
      // i am not to much secure of my toughts but if you back to point
      // one this stuff in only in DEV and don't change the other behaviur
      // of how the state bheave.
      // the original ideas was from Albi 1312.
      //
      // kepp a reference of current "dispatch index"
      // and the same value in reducer state
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
      // The reducer always update the state and remain a pure function
      const idx = prevState.idx + 1
      // if the new dispatch index is greater is a new action
      if (idx > state$.__dispatchIndex) {
        // Emit the debug hook
        debugEmitter.onActionDispatched(action, prevState.state, nextState)
        // keep the index at the last version
        state$.__dispatchIndex = idx
      }
      // Always update the state in the same way a pure function lol
      return { idx, state: nextState }
    }
    // in prod simply run the reducer and emit the state updates
    const nextState = reducer(prevState, action)
    emitStateUpdate(nextState)
    return nextState
  }

  const [stateAndIdx, dispatch] = useReducer(
    proxyReducer,
    undefined, // the first argument of reducer is undefined in the redux way
    initReducer
  )
  const state =
    process.env.NODE_ENV !== 'production'
      ? // Grab the piece of original state
        stateAndIdx.state
      : // No need in prod is directly the state
        stateAndIdx

  const extraConfig = useContext(ConfigureRjContext)
  const subscription = useConstant(() => {
    // Dispatch the action returned from observable
    return makeObservable(
      action$,
      state$,
      extraConfig ? extraConfig.effectCaller : undefined
    ).subscribe(action => {
      // Erase callbacks before dispatch on reducer
      let successCallback
      if (action.successCallback) {
        successCallback = action.successCallback
        delete action.successCallback
      }
      let failureCallback
      if (action.failureCallback) {
        failureCallback = action.failureCallback
        delete action.failureCallback
      }
      // Dispatch the cleaned action
      dispatch(action)
      // Run the callbacks if needed
      if (successCallback) {
        successCallback(action.payload.data)
      }
      if (failureCallback) {
        failureCallback(action.payload)
      }
    })
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
