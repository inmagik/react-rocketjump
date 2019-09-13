import { get } from '../helpers'

function createWithMutationsComputeState(computed) {
  const computedKeys = Object.keys(computed)
  const mutationsSelectors = computedKeys
    .filter(k => k.indexOf('@mutation') === 0)
    .reduce((selectors, k) => {
      // TODO: Check in DEV
      const path = k.substr(k.indexOf('.') + 1)
      return {
        ...selectors,
        [k]: state => get(state, path),
      }
    }, {})

  return function computeState(state, selectors) {
    return computedKeys.reduce((computedState, selectorName) => {
      const keyName = computed[selectorName]
      if (mutationsSelectors[selectorName]) {
        const mutationSelector = mutationsSelectors[selectorName]
        return {
          ...computedState,
          [keyName]: mutationSelector(state.mutations),
        }
      }
      const selector = selectors[selectorName]
      return {
        ...computedState,
        [keyName]: selector(state.root),
      }
    }, {})
  }
}

export function enancheComputeState(hasMutationsState, computeState, computed) {
  if (!hasMutationsState) {
    return computeState
  }
  if (!computeState) {
    return state => state.root
  }
  const withMutationsComputeState = createWithMutationsComputeState(computed)
  return (state, selectors) => withMutationsComputeState(state, selectors)
}
