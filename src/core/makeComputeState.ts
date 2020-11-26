import {
  Computed,
  RjBaseSelectors,
  RjStateShape,
  Selector,
  Selectors,
} from './types'

export default function makeComputeState(
  computed?: Computed
): <S>(state: RjStateShape<S>, selectors: Selectors & RjBaseSelectors) => any {
  if (!computed) {
    return function computeState(state, selectors) {
      return selectors.getRoot(state)
    }
  }

  const computedKeys = Object.keys(computed)

  return function computeState(state, selectors) {
    const nextState = {} as Record<string, any>
    for (let i = 0; i < computedKeys.length; i++) {
      const key = computedKeys[i]
      const selectorKeyOrFn = computed[key]

      // Grab selector from selectors or use selector itself
      let selector: Selector
      if (typeof selectorKeyOrFn === 'string') {
        selector = selectors[selectorKeyOrFn]
        if (selector === undefined) {
          if (process.env.NODE_ENV !== 'production') {
            throw new Error(
              `[react-rocketjump] you specified a non existing selector [${selectorKeyOrFn}] ` +
                `check your computed config.`
            )
          } else {
            throw new Error('[react-rocketjump] @computed error.')
          }
        }
      } else {
        selector = selectorKeyOrFn
      }

      nextState[key] = selector(state)
    }
    return nextState
  }
}
