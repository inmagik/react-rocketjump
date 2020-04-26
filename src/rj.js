import {
  forgeRocketJump,
  isPartialRj,
  isObjectRj,
  enhanceWithPlugins,
  createObjectFromPlugins,
  createListFromPlugins,
  createComputeState,
} from 'rocketjump-core'
import { exportEffectCaller } from './sideEffectDescriptor'
import { kompose, mapValues } from 'rocketjump-core/utils'
import combineReducers from './combineReducers'
import makeExport from './export'
import createMakeRxObservable, {
  mergeCreateMakeRxObservable,
} from './createMakeRxObservable'
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

  const recursionRjs = partialRjsOrConfigs.map((partialRjOrConfig) => {
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
  const rjExport = enhanceWithPlugins(
    plugIns,
    mergegAlongExport,
    'hackExportBeforeFinalize'
  )

  const {
    reducer: baseReducer,
    makeSelectors: baseMakeSelectors,
    actionCreators,
    sideEffect,
    computed,
  } = rjExport

  // Reducer ++ By PLUGINS
  const enhancedReducer = enhanceWithPlugins(
    plugIns,
    baseReducer,
    'enhanceReducer',
    [rjExport]
  )

  // Create an Object of reducers for combineReducers By PLUGINS
  const reducersByKey = createObjectFromPlugins(plugIns, 'combineReducers', [
    rjExport,
  ])

  // Create an Object of selectors for computeState
  const selectorsForComputed = createObjectFromPlugins(
    plugIns,
    'selectorsForComputed',
    [rjExport]
  )

  let reducer = enhancedReducer
  let makeSelectors = baseMakeSelectors

  // Create the compute state function by computed config,
  // when no computed config is given return null is responsibility
  // of useRj, connectRj, .. to check for null
  let computeState = createComputeState(computed, selectorsForComputed)

  if (Object.keys(reducersByKey).length > 0) {
    // Got extra state from plugIns!

    // Warn if plugins try to use [root] key
    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducersByKey.root === 'function') {
        console.warn(
          '[react-rocketjump] You specified a [root] key in yur combineReducers ' +
            'plugin config, but this a reserved keyword for the base rocketjump state ' +
            'and will be overwritten, please choose another key.'
        )
      }
    }

    // Combine the and add the base reducer as [root]
    reducer = combineReducers({
      ...reducersByKey,
      root: enhancedReducer,
    })

    // PATCH selectors to select from [root] path
    makeSelectors = kompose(baseMakeSelectors, (selectors) =>
      mapValues(selectors, (selector, key) => (state, ...args) =>
        selector(state.root, ...args)
      )
    )

    // When no computed but extra state create a fake
    // computeState to slice the root state
    if (computeState === null) {
      computeState = (state) => state.root
    }
  }

  const { effectPipeline, ...sideEffectConfig } = sideEffect

  // Append effectCaller to others callers
  // Apply this callers to ALL sideEffects even defined by plugins
  // maybe this behaviour can be costumized from outside
  const effectCallersToAppend = createListFromPlugins(
    plugIns,
    'appendEffectCallers',
    [rjExport]
  )

  // effectCaller++
  const enhanceEffectCaller = (baseCaller) =>
    effectCallersToAppend.reduce(
      (finalCaller, iterCaller) => exportEffectCaller(finalCaller, iterCaller),
      baseCaller
    )

  // Create the make rx observable function using merged side effect descriptor!
  const mainMakeRxObservable = createMakeRxObservable({
    ...sideEffectConfig,
    prefix: '',
    effectCaller: enhanceEffectCaller(sideEffectConfig.effectCaller),
  })

  // RX++
  const extraSideEffects = createListFromPlugins(plugIns, 'extraSideEffects', [
    rjExport,
  ])

  const extraMakeObs = extraSideEffects.map((sideEffectConfig) =>
    createMakeRxObservable({
      ...sideEffectConfig,
      effectCaller: enhanceEffectCaller(sideEffectConfig.effectCaller),
    })
  )

  const makeRxObservable = mergeCreateMakeRxObservable(
    mainMakeRxObservable,
    ...extraMakeObs
  )

  const pipeActionStream = (action$, state$) =>
    effectPipeline.reduce((action$, piper) => piper(action$, state$), action$)

  const rawRjObject = {
    reducer,
    makeSelectors,
    actionCreators,
    computeState,
    makeRxObservable,
    pipeActionStream,
  }

  // Finally the rocketjump runnable state is created!
  return enhanceWithPlugins(plugIns, rawRjObject, 'finalizeExport', [
    rjExport,
    finalConfig,
  ])
}

function hackRjObject(rjObject, plugIns) {
  return enhanceWithPlugins(plugIns, rjObject, 'hackRjObject')
}

export default forgeRocketJump({
  mark: Symbol('RJxReact'),
  enableGlobals: true,
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
