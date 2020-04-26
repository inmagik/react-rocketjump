import { useEffect, useReducer, useContext, useRef } from 'react'
import { ReplaySubject } from 'rxjs'
import { publish } from 'rxjs/operators'
import { isEffectAction } from 'rocketjump-core'
import { useConstant } from './hooks'
import ConfigureRjContext from './ConfigureRjContext'
import createRjDebugEmitter from './debugger/emitter'
import flags from './flags'
import { INIT } from './actionTypes'

// A "mini" redux
// a reducer for handle state
// and the roboust rxjs to handle complex side effecs in a pure, declarative, fancy way!
export default function useMiniRedux(
  reducer,
  makeObservable,
  pipeActionStream,
  // debug information used as dev hints and other
  debugInfo
) {
  // Debug rj() \w classy (not in PROD)
  const debugEmitter = useConstant(() => createRjDebugEmitter(debugInfo))

  // STATE$
  // emits state updates (used to build the $dispatch Observable)
  const [stateSubject, state$] = useConstant(() => {
    const subject = new ReplaySubject()
    return [subject, subject.asObservable()]
  })

  // Init the reducer in the REDUX way
  // pass special INIT actions and undefined to our reducer
  function initReducer(initialArg) {
    const initialState = reducer(initialArg, { type: INIT })
    if (process.env.NODE_ENV === 'production') {
      return initialState
    } else {
      if (!flags.debugger) {
        return initialState
      }
      // In DEV call the debug emitter
      debugEmitter.onStateInitialized(initialState)
      // NOTE
      // First this mad shit happends only in DEV
      // Second the reason of this magic shit is because
      // call the reducer often than dispatch so logging the exact
      // sequence is impossible but since the purity nature of reducers
      // react call the reducer with the prev state in the exact sequence
      // and can do it based on the assumption of the purity of the reducer
      // so keeping an index in react state can helps us detect if the action
      // is alredy been dispatched and react simply re call the reducer to
      // have the state up date to render.
      // i am not to much secure of my toughts but if you back to point
      // one this stuff in only in DEV and don't change the other behaviurs
      // of how the state bheave.
      // the original ideas was from mad man Albi 1312.
      //
      // kepp a reference of current "dispatch index"
      // and the same value in reducer state
      state$.__dispatchIndex = 0
      return { idx: 0, state: initialState }
    }
  }

  let proxyReducer
  if (process.env.NODE_ENV === 'production') {
    proxyReducer = reducer
  } else if (!flags.debugger) {
    proxyReducer = reducer
  } else {
    // Proxy the original reducer
    // This is only a way to hook into the React updates
    // and grab state and action to
    // keep a reference of current state and emits state updates on observable
    // ... and call the Rj debug hooks using for example to have
    // a clear logging of state changes between times as the redux dev tools does
    proxyReducer = (prevState, action) => {
      const nextState = reducer(prevState.state, action)
      // emitStateUpdate(nextState)
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
  }

  const [stateAndIdx, dispatch] = useReducer(
    proxyReducer,
    undefined, // the first argument of reducer is undefined in the redux way
    initReducer
  )
  let state
  if (process.env.NODE_ENV === 'production') {
    // No need in prod is directly the state
    state = stateAndIdx
  } else if (!flags.debugger) {
    // Force turn off debugger features
    state = stateAndIdx
  } else {
    // Grab the piece of original state
    state = stateAndIdx.state
  }

  // Emit a state update to state$ Observable
  // ... keep a reference of current state
  useEffect(() => {
    state$.value = state
    stateSubject.next(state)
  }, [state, state$, stateSubject])

  // Extra shit from <ConfigureRj />
  const extraConfig = useContext(ConfigureRjContext)

  const [
    actionSubject,
    action$,
    dispatch$,
    updateExtraSideEffectConfig,
  ] = useConstant(() => {
    // Why ReplaySubject?
    // in the old useMiniRedux implementation
    // subscription happened in the render phase
    // but as says ma men @bvaughn for the correct work
    // of upcoming async mode side effects are allowed 2 run
    // in the commit phase ...
    // Check this: https://github.com/facebook/react/tree/master/packages/use-subscription
    // thanks 2 ReplaySubject the action dispatched between the render and commit phase
    // are "re-played" and correct dispatched to our rx side effects or react reducer state
    const subject = new ReplaySubject()
    const actionObserable = subject.asObservable()

    // Apply the effect pipeline
    // useful to change the "normal" action stream
    // ES:. here you can debounce, filter or other
    // stuff before the action trigger Y effect
    const rjPipedActionObservable = pipeActionStream(actionObserable, state$)
      // this ensure that the side effects inside effectPipeline
      // Es: tap(() => { sideEffect() })
      // are excuted only once
      // in the older implementation this mechanism was in
      // createMakeRxObservable but this leads to a lot of bug and
      // mysterious behaviours now pubblish are excuted only once
      // in front of the original action observable
      .pipe(publish())

    // Create the dispatch observable
    const [dispatchObservable, updateExtraSideEffectConfig] = makeObservable(
      rjPipedActionObservable,
      state$,
      extraConfig ? extraConfig.effectCaller : undefined
    )

    return [
      subject,
      rjPipedActionObservable,
      dispatchObservable,
      updateExtraSideEffectConfig,
    ]
  })

  // Update extra side effect config
  const notUpdateOnFirstMount = useRef(true)
  useEffect(() => {
    // Not update on first useEffect call because in alredy updated ...
    if (notUpdateOnFirstMount.current) {
      notUpdateOnFirstMount.current = false
      return
    }
    // Update the effect caller at run time <3
    // Now <ConfigureRj effectCaller={() => {}} />
    // can be an anonymous without breaking anything
    updateExtraSideEffectConfig({
      effectCaller: extraConfig.effectCaller,
    })
  }, [extraConfig, updateExtraSideEffectConfig])

  // Subscription 2 dispatch$
  useEffect(() => {
    const subscription = dispatch$.subscribe(
      (action) => {
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
      },
      (error) => {
        // Detailed info about error ...
        let errorStr = 'An error was occured during your effect'
        if (debugInfo.name) {
          errorStr += ` located in rocketjump ${debugInfo.name}.`
        } else {
          errorStr += '.'
        }
        if (process.env.NODE_ENV !== 'production' && flags.debugger) {
          debugEmitter.onError(errorStr)
        } else {
          console.error(`[react-rocketjump] ${errorStr}`)
        }

        throw error
      }
    )
    // Ok now we are ready to handle shit from dispatch$ observable!
    action$.connect()

    return () => {
      subscription.unsubscribe()
      // Say good bye to debugger
      if (process.env.NODE_ENV !== 'production') {
        if (flags.debugger) {
          debugEmitter.onTeardown()
        }
      }
    }
  }, [action$, dispatch$, debugEmitter, debugInfo])

  // Dispatch to reducer or start an effect
  const dispatchWithEffect = useConstant(() => (action) => {
    if (isEffectAction(action)) {
      // Emit action to given observable theese perform side
      // effect and emit action dispatched above by subscription
      actionSubject.next(action)
    } else {
      // Update the state \w given reducer
      dispatch(action)
    }
  })

  return [state, dispatchWithEffect, action$]
}
