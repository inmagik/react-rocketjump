import { ComponentType } from 'react'

interface ComponentEnhancer<I, O> {
  (component: ComponentType<I>): ComponentType<O>
}

// util 4 compose hocs compose(hoc1, hoc2)(Component) hoc2(hoc1(Component))
function compose<I, O>(
  ...hocs: ComponentEnhancer<any, any>[]
): ComponentEnhancer<I, O>

function compose(
  ...hocs: ComponentEnhancer<any, any>[]
): ComponentEnhancer<any, any> {
  return function (WrappedComponent) {
    return hocs.reduce((Component, hoc) => hoc(Component), WrappedComponent)
  }
}

export default compose