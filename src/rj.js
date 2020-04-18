import {
  forgeRocketJump,
  isPartialRj,
  isObjectRj,
  createComputeState,
  enhanceWithPlugins,
} from 'rocketjump-core'
import makeExport from './export'
import createMakeRxObservable from './createMakeRxObservable'
import Mutations from './mutations/index'
import Routines from './routines'

function shouldRocketJump(partialRjsOrConfigs, plugIns) {
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
      for (let plugin of plugIns) {
        if (typeof plugin.checkObjectConfig === 'function') {
          plugin.checkObjectConfig(partialRjOrConfig)
        }
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

function finalizeExport(mergegAlongExport, _, finalConfig, plugIns) {
  // ~~ END OF RECURSION CHAIN  ~~

  // Hack export before finalize them
  // you can hook into them to for example change the priority of standard
  // rj recursion ...
  const startExport = enhanceWithPlugins(
    plugIns,
    mergegAlongExport,
    'hackExportBeforeFinalize'
  )
  const { sideEffect, computed, ...rjExport } = startExport

  const { effectPipeline, ...sideEffectConfig } = sideEffect

  // Create the make rx observable function using merged side effect descriptor!
  const makeRxObservable = createMakeRxObservable(sideEffectConfig)

  const pipeActionStream = (action$, state$) =>
    effectPipeline.reduce((action$, piper) => piper(action$, state$), action$)

  // Create the compute state function by computed config,
  // when no computed config is given return null is responsibility
  // of useRj, connectRj, .. to check for null
  const computeState = createComputeState(computed)

  const finalExport = {
    ...rjExport,
    computeState,
    makeRxObservable,
    pipeActionStream,
  }

  // Finally the rocketjump runnable state is created!
  /*
    {
      reducer: fn,
      computeState: fn|null
      actionCreators: {},
      makeSelectors: fn,
      makeRxObservable: fn,
      pipeActionStream: fn,
    }
  */
  return enhanceWithPlugins(plugIns, finalExport, 'finalizeExport', [
    startExport,
    finalConfig,
  ])
}

function hackRjObject(rjObject, plugIns) {
  return enhanceWithPlugins(plugIns, rjObject, 'hackRjObject')
}

export default forgeRocketJump({
  shouldRocketJump,
  makeRunConfig,
  makeRecursionRjs,
  makeExport,
  finalizeExport,
  hackRjObject,
  forgedPlugins: [
    // Core RJ and always loved Mutations!!!
    Mutations,
    // routine react hook 4 rj!
    Routines,
  ],
})
