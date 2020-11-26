import React, { useMemo, ComponentType } from 'react'
import bindActionCreators, {
  BoundActionCreatorsWithBuilder,
} from '../core/actions/bindActionCreators'
import { isObjectRj } from '../core/typeUtils'
import hoistStatics from 'hoist-non-react-statics'
import useConstant from './useConstant'
import useMiniRedux from './useMiniRedux'
import {
  ExtractRjObjectActions,
  ExtractRjObjectComputedState,
  ExtractRjObjectState,
  ExtractRjObjectSelectors,
  RjObject,
  RjBaseSelectors,
  Selectors,
  ActionCreators,
} from '../core/types'

interface InferableComponentEnhancerWithProps<TInjectedProps, NeedProps> {
  <P extends TInjectedProps & NeedProps>(
    component: ComponentType<P>
  ): ComponentType<Omit<P, keyof TInjectedProps> & NeedProps>
}

export type StateMapper<
  S = any,
  SE extends Selectors = RjBaseSelectors,
  D = any,
  P = any,
  O = any
> = (state: S, memoizedSelectors: SE, props: P, derivedState: D) => O

type ActionsMapper<A extends ActionCreators = ActionCreators, O = any> = (
  actions: A
) => O

const defaultMapActionsToProps: ActionsMapper = <A extends ActionCreators>(
  a: A
): A => a

function connectRj<NeedProps, R extends RjObject, O = unknown, A = unknown>(
  // The returned value of rj(..., EFFECT)
  rjObject: R,
  // A function to select state
  mapStateToProps?: StateMapper<
    ExtractRjObjectState<R>,
    ExtractRjObjectSelectors<R>,
    ExtractRjObjectComputedState<R>,
    any,
    O
  >,
  mapActionsToProps?: ActionsMapper<ExtractRjObjectActions<R>, A>
): InferableComponentEnhancerWithProps<
  (unknown extends O ? ExtractRjObjectComputedState<R> : O) &
    (unknown extends A
      ? BoundActionCreatorsWithBuilder<ExtractRjObjectActions<R>>
      : A extends ActionCreators
      ? BoundActionCreatorsWithBuilder<A>
      : {}),
  NeedProps
>

function connectRj(
  // The returned value of rj(..., EFFECT)
  rjObject: RjObject,
  mapStateToProps?: StateMapper,
  mapActionsToProps: ActionsMapper<
    ExtractRjObjectActions<RjObject>
  > = defaultMapActionsToProps
): InferableComponentEnhancerWithProps<any, any> {
  return function wrapWithConnect(WrappedComponent) {
    if (!isObjectRj(rjObject)) {
      throw new Error(
        '[react-rocketjump] You should provide a rj object to connectRj.'
      )
    }
    function ConnectFunction(props: any) {
      const {
        name,
        makeObservable,
        pipeActionStream,
        actionCreators,
        reducer,
        makeSelectors,
        computeState,
      } = rjObject

      const wrappedComponentName = WrappedComponent.name
      const rjDebugInfo = useMemo(
        () => ({
          name,
          wrappedComponentName,
        }),
        [wrappedComponentName, name]
      )

      const [state, dispatch] = useMiniRedux(
        reducer,
        makeObservable,
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
        return null
      })

      const stateDerivedProps = useMemo(() => {
        let derivedState = state
        if (typeof computeState === 'function') {
          derivedState = computeState(state, memoizedSelectors as Selectors)
        }
        if (typeof mapStateToProps === 'function') {
          derivedState = mapStateToProps(
            state,
            memoizedSelectors as RjBaseSelectors,
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

    const Connect = React.memo(ConnectFunction as ComponentType)
    return hoistStatics(Connect, WrappedComponent)
  }
}

export default connectRj
