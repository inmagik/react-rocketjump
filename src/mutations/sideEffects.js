import createMakeRxObservable from '../createMakeRxObservable'
import { MUTATION_PREFIX } from './actionTypes'

export function enhanceMakeObservable(
  mutations,
  makeObservable,
  parentEffectCaller
) {
  const makeMutationsObsList = Object.keys(mutations).map(name => {
    const { effect, takeEffect, effectCaller } = mutations[name]
    const prefix = `${MUTATION_PREFIX}/${name}/`

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
        // effectPipeline: [],
        effectCaller: mutationEffectCaller,
      },
      prefix
    )
  })

  return (action$, state$, effectCaller) => {
    let o$ = makeObservable(action$, state$, effectCaller)
    o$ = makeMutationsObsList.reduce((o$, makeMutationObs) => {
      return makeMutationObs(action$, state$, effectCaller, o$)
    }, o$)
    return o$
  }
}
