import { forgeRocketJump, isPartialRj } from 'rocketjump-core'
import { $TYPE_RJ_EXTREA_CONFIG } from './internals'
import makeExport from './export'
import createMakeRxObservable from './createMakeRxObservable'

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
  let hasEffectConfigured = !isLastRjInvocation
  let rjsOrConfigs = [...partialRjsOrConfigs]
  // Extends only from ConfigureRj
  if (
    extraConfig !== null &&
    typeof extraConfig === 'object' &&
    extraConfig.__rjtype === $TYPE_RJ_EXTREA_CONFIG
  ) {
    rjsOrConfigs.push(extraConfig)
  }
  rjsOrConfigs = rjsOrConfigs.map(config => {
    if (typeof config === 'function') {
      // A Partial RJ
      if (isPartialRj(config)) {
        return config
      } else {
        // Use as EFFECT Call
        hasEffectConfigured = true
        return {
          effect: config,
        }
      }
    }
    hasEffectConfigured =
      hasEffectConfigured || typeof config.effect === 'function'
    return config
  })

  if (!hasEffectConfigured) {
    throw new Error(`[react-rj] the effect option is mandatory.`)
  }

  return rjsOrConfigs
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

const reactRjImpl = {
  makeRunConfig,
  makeRecursionRjs,
  makeExport,
  finalizeExport,
}

const rj = forgeRocketJump(reactRjImpl)

function adjustConfig(c) {
  if (typeof c === 'function') {
    return c
  }
  return {
    effect: c.api,
    reducer: c.proxyReducer,
  }
}

// FIXME For complex rjs i think is bugged
// unstable shit use at your own risks ...
rj.__unstableFromReduxRj = reduxRj => {
  const proxyImpl = { ...reactRjImpl }

  proxyImpl.makeRecursionRjs = (partialRjsOrConfigs, ...args) => {
    const proxyRjs = partialRjsOrConfigs.map(adjustConfig)
    return reactRjImpl.makeRecursionRjs(proxyRjs, ...args)
  }

  return reduxRj(undefined, undefined, proxyImpl)
}

export default rj
