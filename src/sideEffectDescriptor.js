import { TAKE_EFFECT_LATEST } from './createMakeRxObservable'
import { arrayze } from 'rocketjump-core/utils'

export const makeSideEffectDescriptor = () => ({
  takeEffect: [TAKE_EFFECT_LATEST],
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
  if (config.callEffect) {
    newSideEffectDescriptor.callEffect = config.callEffect
  }
  if (config.takeEffect) {
    newSideEffectDescriptor.takeEffect = arrayze(config.takeEffect)
  }

  return newSideEffectDescriptor
}
