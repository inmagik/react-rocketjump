import React, { useMemo } from 'react'
import { isObjectRj } from 'rocketjump-core'
import hoistStatics from 'hoist-non-react-statics'
import bindActionCreators from './bindActionCreators'
import { useConstant } from './hooks'
import useMiniRedux from './useMiniRedux'
import { injectMutationsStateInActions } from './mutations'

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
        actionCreators,
        reducer,
        makeSelectors,
        computeState,
        hasMutationsState,
      } = rjObject

      const [state, mutationsState, dispatch] = useMiniRedux(
        reducer,
        makeRxObservable,
        hasMutationsState,
        rjObject.__rjconfig
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

      if (hasMutationsState) {
        injectMutationsStateInActions(boundActionCreators, mutationsState)
      }

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
