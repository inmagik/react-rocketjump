import { useMemo, useDebugValue } from 'react'
import { isObjectRj } from 'rocketjump-core'
import { useConstant } from './hooks'
import { createUseMiniRedux } from './useMiniRedux'
import bindActionCreators from './bindActionCreators'

function useDeriveStateFromState(
  state,
  memoizedSelectors,
  selectState,
  computeState
) {
  const derivedState = useMemo(() => {
    let derivedState = state
    if (typeof computeState === 'function') {
      derivedState = computeState(state, memoizedSelectors)
    }
    if (typeof selectState === 'function') {
      derivedState = selectState(state, memoizedSelectors, derivedState)
    }
    return derivedState
  }, [state, memoizedSelectors, selectState, computeState])

  return derivedState
}

const defaultUseRjImpl = {
  useDeriveState: useDeriveStateFromState,
}

// You can override all useRj behaviours:
// useReducer: rjObject -> [state, dispatch]
// useStateObserver: state + rjObject -> state$
// useDeriveState: state + selectors -> finalState
export function createUseRj(customImpl = {}) {
  const { useDeriveState, ...customUseMinixReduxImpl } = {
    ...defaultUseRjImpl,
    ...customImpl,
  }
  const useMiniRedux = createUseMiniRedux(customUseMinixReduxImpl)

  return function useRj(
    // The returned value of rj(..., EFFECT)
    rjObject,
    // A function|undefined to select state
    // (state, memoizedSelectors, derivedState) => newDerivedState
    selectState
  ) {
    if (!isObjectRj(rjObject)) {
      throw new Error(
        '[react-rocketjump] You should provide a rj object to useRj.'
      )
    }
    const { actionCreators, makeSelectors, computeState } = rjObject

    useDebugValue(
      rjObject.__rjconfig.name ? `rj(${rjObject.__rjconfig.name})` : 'Rocks'
    )

    const [state, dispatch] = useMiniRedux(rjObject)

    // Bind actions \w dispatch
    const boundActionCreators = useConstant(() => {
      return bindActionCreators(actionCreators, dispatch)
    }, [actionCreators, dispatch])

    // Create per-rj-instance memoized selectors
    const memoizedSelectors = useConstant(() => {
      if (
        typeof selectState === 'function' ||
        typeof computeState === 'function'
      ) {
        return makeSelectors()
      }
    })

    // Derive the state
    const derivedState = useDeriveState(
      state,
      memoizedSelectors,
      selectState,
      computeState,
      rjObject
    )

    // Memoize return value now can saftley used in React Context.Provider
    return useMemo(() => [derivedState, boundActionCreators], [
      derivedState,
      boundActionCreators,
    ])
  }
}

const useRj = createUseRj()
export default useRj
