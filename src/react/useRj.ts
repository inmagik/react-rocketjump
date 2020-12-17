import { useMemo, useDebugValue } from 'react'
import { isObjectRj } from '../core/typeUtils'
import useConstant from './useConstant'
import useMiniRedux from './useMiniRedux'
import bindActionCreators, {
  BoundActionCreatorsWithBuilder,
} from '../core/actions/bindActionCreators'
import {
  ExtractRjObjectActions,
  ExtractRjObjectComputedState,
  ExtractRjObjectState,
  ExtractRjObjectSelectors,
  RjObject,
} from '../core/types'
import { StateSelector } from './types'

function useRj<R extends RjObject>(
  // The returned value of rj(..., EFFECT)
  rjObject: R
): [
  ExtractRjObjectComputedState<R>,
  BoundActionCreatorsWithBuilder<ExtractRjObjectActions<R>>
]

function useRj<R extends RjObject, O>(
  // The returned value of rj(..., EFFECT)
  rjObject: R,
  // A function to select state
  selectState?: StateSelector<
    ExtractRjObjectState<R>,
    ExtractRjObjectSelectors<R>,
    ExtractRjObjectComputedState<R>,
    O
  >
): [
  unknown extends O ? ExtractRjObjectComputedState<R> : O,
  BoundActionCreatorsWithBuilder<ExtractRjObjectActions<R>>
]

function useRj(
  // The returned value of rj(..., EFFECT)
  rjObject: RjObject,
  // A function to select state
  selectState?: StateSelector
) {
  if (!isObjectRj(rjObject)) {
    throw new Error(
      '[react-rocketjump] You should provide a rj object to useRj.'
    )
  }
  const {
    name,
    makeObservable,
    pipeActionStream,
    actionCreators,
    reducer,
    makeSelectors,
    computeState,
  } = rjObject

  useDebugValue(name ? `rj(${name})` : 'Rocks')

  // Rj optinal name as debug info
  const rjDebugInfo = useConstant(() => ({ name }))
  const [state, dispatch] = useMiniRedux(
    reducer,
    makeObservable,
    pipeActionStream,
    rjDebugInfo
  )

  // Bind actions \w dispatch
  const boundActionCreators = useConstant(() =>
    bindActionCreators(actionCreators, dispatch)
  )

  // Create per-rj-instance memoized selectors
  const memoizedSelectors = useConstant(() => makeSelectors())

  // Derive the state
  const derivedState = useMemo(() => {
    let derivedState = computeState(state, memoizedSelectors)
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

export default useRj
