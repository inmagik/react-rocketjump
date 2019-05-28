import { TAKE_EFFECT_LATEST } from './createMakeRxObservable'
import { arrayze } from 'rocketjump-core/utils'

export const makeSideEffectDescriptor = () => ({
  takeEffect: [TAKE_EFFECT_LATEST],
  effectPipeline: [],
})

// Simply return the last defined effect and take effect
export const addConfigToSideEffectDescritor = (
  sideEffectDescriptor,
  config
) => {
  let newSideEffectDescriptor = { ...sideEffectDescriptor }

  if (config.effect) {
    newSideEffectDescriptor.effect = config.effect
  }
  if (config.effectCaller) {
    newSideEffectDescriptor.effectCaller = config.effectCaller
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
