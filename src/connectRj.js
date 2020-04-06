import React, { useMemo } from 'react'
import { isObjectRj, bindActionCreators } from 'rocketjump-core'
import hoistStatics from 'hoist-non-react-statics'
import { useConstant } from './hooks'
import useMiniRedux from './useMiniRedux'

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
        '[react-rocketjump] You should provide a rj object to connectRj.'
      )
    }
    function ConnectFunction(props) {
      const {
        makeRxObservable,
        pipeActionStream,
        actionCreators,
        reducer,
        makeSelectors,
        computeState,
      } = rjObject

      const wrappedComponentName = WrappedComponent.name
      const rjDebugInfo = useMemo(
        () => ({
          ...rjObject.__rjconfig,
          wrappedComponentName,
        }),
        [wrappedComponentName]
      )

      const [state, dispatch] = useMiniRedux(
        reducer,
        makeRxObservable,
        pipeActionStream,
        rjDebugInfo
      )

      const memoizedSelectors = useConstant(() => {
        if (
          typeof mapStateToProps === 'function' ||
          typeof computeState === 'function'
        ) {
          return makeSelectors()
        }
      })

      const stateDerivedProps = useMemo(() => {
        let derivedState = state
        if (typeof computeState === 'function') {
          derivedState = computeState(state, memoizedSelectors)
        }
        if (typeof mapStateToProps === 'function') {
          derivedState = mapStateToProps(
            state,
            memoizedSelectors,
            props,
            derivedState
          )
        }
        return derivedState
      }, [state, memoizedSelectors, computeState, props])

      const boundActionCreators = useMemo(() => {
        return bindActionCreators(mapActionsToProps(actionCreators), dispatch)
      }, [dispatch, actionCreators])

      return (
        <WrappedComponent
          {...boundActionCreators}
          {...stateDerivedProps}
          {...props}
        />
      )
    }

    const wrappedComponentName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component'

    const displayName = `connectRj(${wrappedComponentName})`
    ConnectFunction.displayName = displayName

    const Connect = React.memo(ConnectFunction)
    return hoistStatics(Connect, WrappedComponent)
  }
}
