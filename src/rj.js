import { forgeRocketJump, isPartialRj, isObjectRj } from 'rocketjump-core'
import makeExport from './export'
import createMakeRxObservable from './createMakeRxObservable'

function shouldRocketJump(partialRjsOrConfigs) {
  let hasEffectConfigured = false
  for (let partialRjOrConfig of partialRjsOrConfigs) {
    // Parital allowed
    if (isPartialRj(partialRjOrConfig)) {
      continue
    }
    // Rj Object not allowed
    if (isObjectRj(partialRjOrConfig)) {
      throw new Error(
        `[react-rocketjump] you can't pass an rj object as argument.`
      )
    }
    // Config object is allowed
    if (partialRjOrConfig !== null && typeof partialRjOrConfig === 'object') {
      if (typeof partialRjOrConfig.effect === 'function') {
        if (hasEffectConfigured) {
          throw new Error(
            '[react-rocketjump] effect should be defined only once, in the last argument.'
          )
        }
        hasEffectConfigured = true
      }
      continue
    }
    // A function effect
    if (typeof partialRjOrConfig === 'function') {
      if (hasEffectConfigured) {
        throw new Error(
          '[react-rocketjump] effect should be defined only once, in the last argument.'
        )
      }
      hasEffectConfigured = true
      continue
    }
    // Bad shit as config
    throw new Error(
      '[react-rocketjump] you can pass only config object or rj partial to rj constructor.'
    )
  }

  if (partialRjsOrConfigs.length === 0) {
    return false
  }
  const lastPartialOrConfig =
    partialRjsOrConfigs[partialRjsOrConfigs.length - 1]

  // Object \w effect configured
  if (
    lastPartialOrConfig !== null &&
    typeof lastPartialOrConfig === 'object' &&
    lastPartialOrConfig.effect
  ) {
    return true
  }

  // Is a function (and not a partial rj) rj(() => Promise.resolve(23))
  if (
    !isPartialRj(lastPartialOrConfig) &&
    typeof lastPartialOrConfig === 'function'
  ) {
    return true
  }

  // Not defined at last
  if (hasEffectConfigured) {
    throw new Error(
      '[react-rocketjump] effect should be defined only once, in the last argument.'
    )
  }

  return false
}

// Don't needed
function makeRunConfig(finalConfig) {
  return null
}

function makeRecursionRjs(
  partialRjsOrConfigs,
  // Ingore the extra config ...
  extraConfig,
  isLastRjInvocation
) {
  let hasEffectConfigured = false

  const recursionRjs = partialRjsOrConfigs.map(partialRjOrConfig => {
    if (typeof partialRjOrConfig === 'function') {
      // A Partial RJ
      if (isPartialRj(partialRjOrConfig)) {
        return partialRjOrConfig
      } else {
        // Use as EFFECT Call
        hasEffectConfigured = true
        return {
          effect: partialRjOrConfig,
        }
      }
    }
    hasEffectConfigured =
      hasEffectConfigured || typeof partialRjOrConfig.effect === 'function'
    return partialRjOrConfig
  })

  if (!hasEffectConfigured && isLastRjInvocation) {
    throw new Error(`[react-rocketjump] you can't invoke a partialRj.`)
  }

  return recursionRjs
}

function finalizeExport(finalExport, runConfig, finalConfig) {
  // ~~ END OF RECURSION CHAIN  ~~
  const { sideEffect, ...rjExport } = finalExport

  // Creat the make rx observable fn using merged side effect descriptor!
  const makeRxObservable = createMakeRxObservable(sideEffect)

  // Finally the rocketjump runnable state is created!
  /*
    {
      reducer: fn,
      actionCreators: {},
      makeSelectors: fn,
      makeRxObservable: fn,
    }
  */
  return {
    ...rjExport,
    makeRxObservable,
  }
}

export default forgeRocketJump({
  shouldRocketJump,
  makeRunConfig,
  makeRecursionRjs,
  makeExport,
  finalizeExport,
})