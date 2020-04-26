import { get } from 'rocketjump-core/utils'

const COMPUTED_MUTATION_PREFIX = '@mutation'

export function createMutationsSelectorsForComputed(computed, mutations) {
  const computedKeys = Object.keys(computed)
  const mutationsSelectors = computedKeys
    .filter((k) => k.indexOf(COMPUTED_MUTATION_PREFIX) === 0)
    .reduce((selectors, key) => {
      const path = key.substr(
        key.indexOf(COMPUTED_MUTATION_PREFIX) +
          COMPUTED_MUTATION_PREFIX.length +
          1
      )
      const firstDot = path.indexOf('.')
      const mutationName = firstDot === -1 ? path : path.substr(0, firstDot)

      // Catch bad computed config before run rj
      if (mutations[mutationName] === undefined) {
        throw new Error(
          `[react-rocketjump] you specified a non existing mutation [${mutationName}] ` +
            `in your computed config.`
        )
      } else if (mutations[mutationName].reducer === undefined) {
        throw new Error(
          `[react-rocketjump] you specified a mutation [${mutationName}] ` +
            `with no state in your computed config.`
        )
      }

      return {
        ...selectors,
        [key]: (state) => get(state, `mutations.${path}`),
      }
    }, {})
  return mutationsSelectors
}
