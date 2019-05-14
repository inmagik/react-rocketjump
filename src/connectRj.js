import React, { useMemo } from 'react'
import hoistStatics from 'hoist-non-react-statics'
import bindActionCreators from './bindActionCreators'
import {
  useRxSubject,
  useReduxReducer,
  useConstant,
  useCreateRjState,
} from './hooks'

const defaultMapActionsToProps = a => a

export default function connectRj(
  // The returned value of rj()() or a partialRj rj()
  rjStateOrPartial,
  mapStateToProps,
  mapActionsToProps = defaultMapActionsToProps
) {
  return function wrapWithConnect(WrappedComponent) {
    function ConnectFunction(props) {
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
        if (mapStateToProps !== undefined && mapStateToProps !== null) {
          return makeSelectors()
        }
      })

      const stateDerivedProps = useMemo(() => {
        if (mapStateToProps === undefined || mapActionsToProps === null) {
          return state
        }
        return mapStateToProps(state, memoizedSelectors, props)
      }, [state, memoizedSelectors, props])

      const boundActionCreators = useMemo(() => {
        return bindActionCreators(
          mapActionsToProps(actionCreators),
          dispatch,
          subject
        )
      }, [subject, dispatch, actionCreators])

      return (
        <WrappedComponent
          {...boundActionCreators}
          {...stateDerivedProps}
          {...props}
        />
      )
    }

    const Connect = React.memo(ConnectFunction)

    const wrappedComponentName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component'

    const displayName = `connectRj(${wrappedComponentName})`
    Connect.displayName = displayName

    return hoistStatics(Connect, WrappedComponent)
  }
}
