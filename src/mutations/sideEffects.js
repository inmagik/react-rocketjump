import blamer from 'rocketjump-core/blamer.macro'
import { MUTATION_PREFIX } from './actionTypes'

export function extraMutationsSideEffects({ mutations, sideEffect }) {
  // No extra side effects
  if (!mutations) {
    return null
  }
  const parentEffectCaller = sideEffect.effectCaller

  return Object.keys(mutations).map(name => {
    const { effect, takeEffect, effectCaller } = mutations[name]
    const prefix = `${MUTATION_PREFIX}/${name}/`

    if (typeof effect !== 'function') {
      blamer(
        '[rj-config-error] @mutations',
        '[react-rocketjump] @mutations you should provide at least ' +
          `an effect and an updater to mutation config [${name}].`
      )
    }

    let mutationEffectCaller
    if (effectCaller) {
      // If defined used the mutation effect caller
      mutationEffectCaller = effectCaller
    } else if (effectCaller !== false && parentEffectCaller) {
      // If parent conf has effect caller us it unless is explicit set to false
      mutationEffectCaller = parentEffectCaller
    }

    return {
      effect,
      takeEffect: takeEffect || 'every',
      effectCaller: mutationEffectCaller,
      prefix,
    }
  })
}
