import invariant from './invariant'
import { useMemo, useDebugValue } from 'react'
import { bindActionCreators } from 'rocketjump-core'
import { isObjectRj } from './types'
import { useConstant } from './hooks'
import useMiniRedux from './useMiniRedux'

export default function useRj(
  // The returned value of rj(..., EFFECT)
  rjObject,
  // A function|undefined to select state
  // (state, memoizedSelectors, derivedState) => newDerivedState
  selectState
) {
  invariant(isObjectRj(rjObject), 'You should provide a rj object to useRj.')
  const {
    makeRxObservable,
    pipeActionStream,
    actionCreators,
    reducer,
    makeSelectors,
    computeState,
    routine,
  } = rjObject

  useDebugValue(
    rjObject.__rjconfig.name ? `rj(${rjObject.__rjconfig.name})` : 'Rocks'
  )

  // The last config or rj recursion rj({},rj(),..,{},{<THIS>})
  // used as debug hints
  const rjDebugInfo = rjObject.__rjconfig
  const [state, dispatch] = useMiniRedux(
    reducer,
    makeRxObservable,
    pipeActionStream,
    rjDebugInfo
  )

  // Bind actions \w dispatch
  const boundActionCreators = useConstant(() => {
    return bindActionCreators(actionCreators, dispatch)
  }, [actionCreators, dispatch])

  // Create per-rj-instance memoized selectors
  const memoizedSelectors = useConstant(() => {
    if (
      typeof selectState === 'function' ||
      typeof computeState === 'function' ||
      typeof routine === 'function'
    ) {
      return makeSelectors()
    }
  })

  // Derive the state
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

  // Memoize return value now can saftley used in React Context.Provider
  return useMemo(() => [derivedState, boundActionCreators], [
    derivedState,
    boundActionCreators,
  ])
}
