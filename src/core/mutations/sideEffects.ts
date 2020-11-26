import createMakeObservable from '../effect/createMakeObservable'
import { CreateEffectConfig, Mutations, RjEffectCaller } from '../types'
import { makeMutationType } from './actionTypes'

export function makeExtraRxObservables(
  mutations: Mutations,
  { effectCallers }: CreateEffectConfig
) {
  const makeMutationsObsList = Object.keys(mutations).map((name) => {
    const { effect, takeEffect, effectCaller } = mutations[name]
    const prefix = makeMutationType(name)

    if (typeof effect !== 'function') {
      throw new Error(
        '[react-rocketjump] @mutations you should provide at least ' +
          `an effect and an updater to mutation config [${name}].`
      )
    }

    let mutationEffectCallers: RjEffectCaller[] = []
    if (typeof effectCaller === 'function') {
      // If defined used the mutation effect caller (ONLY)
      mutationEffectCallers = [effectCaller]
    } else if (effectCaller === false) {
      // Explict false no effect caller (empty list)
      mutationEffectCallers = []
    } else {
      mutationEffectCallers = effectCallers
    }

    return createMakeObservable(
      {
        effect,
        takeEffect: takeEffect || 'every',
        effectCallers: mutationEffectCallers,
      },
      prefix
    )
  })

  return makeMutationsObsList
}
