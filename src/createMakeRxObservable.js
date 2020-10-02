import { merge } from 'rxjs'
import { squashExportValue } from 'rocketjump-core'
import { arrayze } from 'rocketjump-core/utils'
import RxEffects from './rxEffects'

const defaultEffectCaller = (call, ...args) => call(...args)

const makeRunTimeEffectCaller = (effectCaller, injectEffectCaller) => {
  const finalEffectCaller = squashExportValue(
    effectCaller,
    [injectEffectCaller].filter(Boolean)
  )
  // Use default effect caller
  if (!finalEffectCaller) {
    return defaultEffectCaller
  }

  // Use squashed effect caller
  return finalEffectCaller
}

export default function createMakeRxObservable(
  { effect: effectCall, effectCaller, takeEffect },
  prefix = ''
) {
  return function makeRxObservable(actionObservable, stateObservable) {
    // Make run time caller from effect action
    function getEffectCaller(action) {
      const effectArgs = action?.['@@RJ/EFFECT_ARGS']?.current
      return makeRunTimeEffectCaller(
        effectCaller, // Defined in rocketjump config
        effectArgs?.effectCaller // Run time effect caller
      )
    }

    const [effectType, ...effectTypeArgs] = arrayze(takeEffect)

    let handleTakeEffect
    if (typeof effectType === 'function') {
      // Custom take effect
      handleTakeEffect = effectType
    } else {
      // Check valid effectType
      if (RxEffects[effectType] === undefined) {
        throw new Error(
          `[react-rocketjump] takeEffect: ${takeEffect} is an invalid effect.`
        )
      }
      // Core rx effect by key latest, every ecc
      handleTakeEffect = RxEffects[effectType]
    }

    return handleTakeEffect(
      actionObservable,
      stateObservable,
      {
        effect: effectCall,
        getEffectCaller,
        prefix,
      },
      ...effectTypeArgs
    )
  }
}

// GioVa nel posto fa freddo brrrrrrrrrrrrr
export function mergeMakeRxObservables(baseCreator, ...creators) {
  return (actionObservable, stateObservable) => {
    const baseDispatchObservable = baseCreator(
      actionObservable,
      stateObservable
    )

    const dispatchObservables2Merge = creators.reduce(
      (dispatchObservables, rxCreator) => {
        const nextDispatchObservable = rxCreator(
          actionObservable,
          stateObservable
        )
        dispatchObservables.push(nextDispatchObservable)
        return dispatchObservables
      },
      [baseDispatchObservable]
    )

    return merge(...dispatchObservables2Merge)
  }
}
