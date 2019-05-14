import { useMemo } from 'react'
import {
  useRxSubject,
  useReduxReducer,
  useConstant,
  useCreateRjState,
} from './hooks'
import bindActionCreators from './bindActionCreators'

const defaultMapActions = a => a

export default function useRj(
  // The returned value of rj()() or a partialRj rj()
  rjStateOrPartial,
  selectState,
  mapActions = defaultMapActions
) {
  const rjRunnableState = useCreateRjState(rjStateOrPartial)
  const {
    makeRxObservable,
    actionCreators,
    reducer,
    makeSelectors,
  } = rjRunnableState

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
