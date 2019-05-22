import React, { useMemo } from 'react'
import { isObjectRj } from 'rocketjump-core'
import hoistStatics from 'hoist-non-react-statics'
import bindActionCreators from './bindActionCreators'
import { useRxSubject, useReduxReducer, useConstant } from './hooks'

const defaultMapActionsToProps = a => a

export default function connectRj(
  // The returned value of rj(..., EFFECT)
  rjObject,
  mapStateToProps,
  mapActionsToProps = defaultMapActionsToProps
) {
  return function wrapWithConnect(WrappedComponent) {
    if (!isObjectRj(rjObject)) {
      throw new Error(
        '[react-rocketjump] You should provide a rj object to useRj.'
      )
    }
    function ConnectFunction(props) {
      const {
        makeRxObservable,
        actionCreators,
        reducer,
        makeSelectors,
      } = rjObject

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
