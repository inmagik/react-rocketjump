import { useMemo } from 'react'
import { isObjectRj } from 'rocketjump-core'
import { useConstant } from './hooks'
import useMiniRedux from './useMiniRedux'
import bindActionCreators from './bindActionCreators'

export default function useRj(
  // The returned value of rj(..., EFFECT)
  rjObject,
  selectState
) {
  if (!isObjectRj(rjObject)) {
    throw new Error(
      '[react-rocketjump] You should provide a rj object to useRj.'
    )
  }
  const {
    makeRxObservable,
    actionCreators,
    reducer,
    makeSelectors,
    computeState,
  } = rjObject

  const rjDebugInfo = rjObject.__rjconfig
  const [state, dispatch] = useMiniRedux(reducer, makeRxObservable, rjDebugInfo)

  const memoizedSelectors = useConstant(() => {
    if (
      typeof selectState === 'function' ||
      typeof computeState === 'function'
    ) {
      return makeSelectors()
    }
  })

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

  const boundActionCreators = useMemo(() => {
    return bindActionCreators(actionCreators, dispatch)
  }, [actionCreators, dispatch])

  // Memoize return value now can saftley used in React Context.Provider
  return useMemo(() => [derivedState, boundActionCreators], [
    derivedState,
    boundActionCreators,
  ])
}
