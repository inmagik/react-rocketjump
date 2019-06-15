import { TAKE_EFFECT_LATEST } from './rxEffects'
import { arrayze } from 'rocketjump-core/utils'

// Thanks ma teacher Virgy <3
const composeEffectCallers = (...callers) => (effectCall, ...args) => {
  function recursion(callers, ...args) {
    const [effectCaller, ...passCallers] = callers

    if (passCallers.length === 0) {
      return effectCaller(effectCall, ...args)
    }

    return effectCaller((...args) => recursion(passCallers, ...args), ...args)
  }
  return recursion(callers, ...args)
}

export const makeSideEffectDescriptor = () => ({
  takeEffect: [TAKE_EFFECT_LATEST],
  effectPipeline: [],
})

// Merge prev sideEffectDescriptor with given rj config return
// a new sideEffectDescriptor
export const addConfigToSideEffectDescritor = (
  sideEffectDescriptor,
  config
) => {
  const newSideEffectDescriptor = { ...sideEffectDescriptor }

  if (config.effect) {
    newSideEffectDescriptor.effect = config.effect
  }
  if (config.effectCaller) {
    if (sideEffectDescriptor.effectCaller) {
      newSideEffectDescriptor.effectCaller = composeEffectCallers(
        sideEffectDescriptor.effectCaller,
        config.effectCaller
      )
    } else {
      newSideEffectDescriptor.effectCaller = config.effectCaller
    }
  }
  if (config.takeEffect) {
    newSideEffectDescriptor.takeEffect = arrayze(config.takeEffect)
  }
  if (typeof config.effectPipeline === 'function') {
    newSideEffectDescriptor.effectPipeline = newSideEffectDescriptor.effectPipeline.concat(
      config.effectPipeline
    )
  }

  return newSideEffectDescriptor
}
