// util 4 compose hocs compose(hoc1, hoc2)(Component) hoc2(hoc1(Component))
export default function compose(...hocs) {
  return function (WrappedComponent) {
    return hocs.reduce((Component, hoc) => hoc(Component), WrappedComponent)
  }
}
