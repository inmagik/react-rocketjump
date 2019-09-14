export default function createComputeState(computed) {
  // No computed config provided
  if (!(typeof computed === 'object' && computed !== null)) {
    return null
  }
  // Pre calculate computed keys 2 speed up computeState function
  const computedKeys = Object.keys(computed)

  /**
    Compute state according 2 computed config merged by:

    rj({
      computed: {
        ...
        [key2Compute]: '<selectorName>',
        ...
      }
    })

    computed the arguments of this function has key/value inverted so:

    {
      ...
      [selecortName]: '<key2Compute>',
      ...
    }
  */
  return function computeState(state, selectors) {
    return computedKeys.reduce((computedState, selectorName) => {
      const keyName = computed[selectorName]
      const selector = selectors[selectorName]
      if (selector === undefined) {
        throw new Error(
          `[react-rocketjump] you specified a non existing selector [${selectorName}] ` +
            `check your computed config.`
        )
      }
      return {
        ...computedState,
        [keyName]: selector(state),
      }
    }, {})
  }
}
