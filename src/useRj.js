import { useMemo } from 'react'
import { isObjectRj } from 'rocketjump-core'
import { useRxSubject, useReduxReducer, useConstant } from './hooks'
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

  const [state, dispatch] = useReduxReducer(reducer)

  const subject = useRxSubject(makeRxObservable, dispatch)

  const memoizedSelectors = useConstant(() => {
    if (selectState !== undefined && selectState !== null) {
      return makeSelectors()
    }
  })

  const derivedState = useMemo(() => {
    if (selectState === undefined || selectState === null) {
      return state
    }
    return selectState(state, memoizedSelectors)
  }, [state, memoizedSelectors, selectState])

  const boundActionCreators = useMemo(() => {
    return bindActionCreators(mapActions(actionCreators), dispatch, subject)
  }, [subject, actionCreators, dispatch, mapActions])

  return [derivedState, boundActionCreators]
}
