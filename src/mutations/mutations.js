import { exportEffectCaller } from '../sideEffectDescriptor'
import {
  enhanceReducer,
  makeMutationsReducer,
  optimisticMutationsReducer,
  optimisticMutationsHor,
} from './reducer'
import { enhanceComputeState } from './computed'
import { makeExtraRxObservables } from './sideEffects'
import { enhanceActionCreators } from './actionCreators'
import { makeMutationsSelectors } from './selectors'

export function checkMutationsConfig(rjConfig) {
  if (
    typeof rjConfig.mutations === 'object' &&
    rjConfig.mutations !== null &&
    typeof rjConfig.effect !== 'function'
  ) {
    throw new Error(
      '[react-rocketjump] @mutations must be defined along with effect, ' +
        'please check your config.'
    )
  }
}

function makeMutationExport(mutation) {
  if (mutation.effectCaller) {
    return {
      ...mutation,
      effectCaller: exportEffectCaller(undefined, mutation.effectCaller),
    }
  }
  return mutation
}

function makeMutationsExport(mutations) {
  return Object.keys(mutations).reduce(
    (mutationsExport, name) => ({
      ...mutationsExport,
      [name]: makeMutationExport(mutations[name]),
    }),
    {}
  )
}

export function enhanceMakeExportWithMutations(rjConfig, extendExport) {
  // Set mutations config
  if (rjConfig.mutations) {
    return {
      ...extendExport,
      mutations: makeMutationsExport(rjConfig.mutations),
    }
  }

  return extendExport
}

export function createMutationsFinalExportEnhancer(mutations) {
  if (!mutations) {
    return {}
  }

  const reducersToCombine = {}
  let hasMutationsState = false
  const mutationsReducer = makeMutationsReducer(mutations)
  if (mutationsReducer) {
    reducersToCombine.mutations = mutationsReducer
    hasMutationsState = true
  }

  const hasSomeOptimisticMutations = Object.keys(mutations).some(
    (name) => typeof mutations[name].optimisticResult === 'function'
  )
  if (hasSomeOptimisticMutations) {
    // Enable optimistic reducer...
    reducersToCombine.optimisticMutations = optimisticMutationsReducer
  }

  let enhanceCombinedReducer
  if (hasSomeOptimisticMutations) {
    enhanceCombinedReducer = optimisticMutationsHor
  }

  return {
    enhanceActionCreators: (actionCreators) =>
      enhanceActionCreators(mutations, actionCreators),
    enhanceRootReducer: (reducer, ...args) =>
      enhanceReducer(mutations, reducer, ...args),
    enhanceCombinedReducer,
    reducersToCombine,
    enhanceComputeState: (computeState, computed) =>
      enhanceComputeState(mutations, hasMutationsState, computeState, computed),
    extraSelectors: makeMutationsSelectors(),
    makeExtraRxObservables: (sideEffect) =>
      makeExtraRxObservables(mutations, sideEffect.effectCaller),
  }
}
