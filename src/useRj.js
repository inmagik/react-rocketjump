import { useMemo } from 'react'
import { isObjectRj } from 'rocketjump-core'
import { useConstant } from './hooks'
import useMiniRedux from './useMiniRedux'
import bindActionCreators from './bindActionCreators'

const defaultMapActions = a => a

export default function useRj(
  // The returned value of rj(..., EFFECT)
  rjObject,
  selectState,
  mapActions = defaultMapActions
) {
  if (!isObjectRj(rjObject)) {
    throw new Error(
      '[react-rocketjump] You should provide a rj object to useRj.'
    )
  }
  const { makeRxObservable, actionCreators, reducer, makeSelectors } = rjObject

  const [state, dispatch] = useMiniRedux(reducer, makeRxObservable)

  const memoizedSelectors = useConstant(() => {
    if (typeof selectState === 'function') {
      return makeSelectors()
    }
  })

  const derivedState = useMemo(() => {
    if (typeof selectState !== 'function') {
      return state
    }
    return selectState(state, memoizedSelectors)
  }, [state, memoizedSelectors, selectState])

  const boundActionCreators = useMemo(() => {
    return bindActionCreators(mapActions(actionCreators), dispatch)
  }, [actionCreators, dispatch, mapActions])

  return [derivedState, boundActionCreators]
}
