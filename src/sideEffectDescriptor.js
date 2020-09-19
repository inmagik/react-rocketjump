import { makeExportValue } from 'rocketjump-core'
import { TAKE_EFFECT_LATEST } from './rxEffects'
import { arrayze } from 'rocketjump-core/utils'
import { RJ_CONFIG_PLACEHOLDER } from './internals'

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

export const exportEffectCaller = makeExportValue({
  defaultValue: undefined,
  isLazy: (v) => v === RJ_CONFIG_PLACEHOLDER,
  shouldCompose: (v) => !!v,
  compose: (prevCaller, caller) => {
    if (prevCaller) {
      return composeEffectCallers(prevCaller, caller)
    } else {
      return caller
    }
  },
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
  newSideEffectDescriptor.effectCaller = exportEffectCaller(
    sideEffectDescriptor.effectCaller,
    config.effectCaller
  )
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
