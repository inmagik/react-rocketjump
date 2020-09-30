import createMakeRxObservable from '../createMakeRxObservable'
import { makeMutationType } from './actionTypes'

export function makeExtraRxObservables(mutations, parentEffectCaller) {
  const makeMutationsObsList = Object.keys(mutations).map((name) => {
    const { effect, takeEffect, effectCaller } = mutations[name]
    const prefix = makeMutationType(name)

    if (typeof effect !== 'function') {
      throw new Error(
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

    return createMakeRxObservable(
      {
        effect,
        takeEffect: takeEffect || 'every',
        effectCaller: mutationEffectCaller,
      },
      prefix
    )
  })

  return makeMutationsObsList
}
