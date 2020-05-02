import blamer from 'rocketjump-core/blamer.macro'
import { exportEffectCaller } from '../sideEffectDescriptor'
import {
  enhanceReducer,
  makeMutationsReducer,
  optimisticMutationsHor,
  optimisticMutationsReducer,
} from './reducer'
import { createMutationsSelectorsForComputed } from './computed'
import { extraMutationsSideEffects } from './sideEffects'
import { enhanceActionCreators } from './actionCreators'
import { enhanceMakeSelectors } from './selectors'

function checkMutationsConfig(rjConfig) {
  if (
    typeof rjConfig.mutations === 'object' &&
    rjConfig.mutations !== null &&
    typeof rjConfig.effect !== 'function'
  ) {
    blamer(
      '[rj-config-error] @mutations',
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

function enhanceMakeExportWithMutations(extendExport, rjConfig) {
  // Set mutations config
  if (rjConfig.mutations) {
    return {
      ...extendExport,
      mutations: makeMutationsExport(rjConfig.mutations),
    }
  }

  return extendExport
}

function enhanceReducerWithMutations(reducer, rjExport) {
  const { mutations, actionCreators } = rjExport
  if (mutations) {
    return enhanceReducer(mutations, reducer, actionCreators)
  }
  return reducer
}

function combineReducersWithMutations(rjExport) {
  const { mutations } = rjExport
  if (mutations) {
    let reducersToCombine

    const mutationsReducer = makeMutationsReducer(mutations)
    if (mutationsReducer) {
      reducersToCombine = reducersToCombine || {}
      reducersToCombine.mutations = mutationsReducer
    }

    const hasSomeOptimisticMutations = Object.keys(mutations).some(
      (name) => typeof mutations[name].optimisticResult === 'function'
    )
    if (hasSomeOptimisticMutations) {
      // Enable optimistic reducer...
      reducersToCombine = reducersToCombine || {}
      reducersToCombine.optimisticMutations = optimisticMutationsReducer
    }

    return reducersToCombine
  }
}

function mutationsSelectorsForComputed(rjExport) {
  const { mutations, computed } = rjExport
  if (computed && mutations) {
    return createMutationsSelectorsForComputed(computed, mutations)
  }
}

function enhanceFinalExportWithMutations(
  rjObject,
  { computed, mutations, sideEffect }
) {
  if (!mutations) {
    return rjObject
  }

  const { actionCreators, makeSelectors } = rjObject

  let reducer = rjObject.reducer
  const hasSomeOptimisticMutations = Object.keys(mutations).some(
    (name) => typeof mutations[name].optimisticResult === 'function'
  )
  if (hasSomeOptimisticMutations) {
    reducer = optimisticMutationsHor(reducer, mutations)
  }

  return {
    ...rjObject,
    reducer,
    makeSelectors: enhanceMakeSelectors(mutations, makeSelectors),
    actionCreators: enhanceActionCreators(mutations, actionCreators),
  }
}

const Mutations = {
  checkObjectConfig: checkMutationsConfig,
  makeExport: enhanceMakeExportWithMutations,
  enhanceReducer: enhanceReducerWithMutations,
  combineReducers: combineReducersWithMutations,
  selectorsForComputed: mutationsSelectorsForComputed,
  extraSideEffects: extraMutationsSideEffects,
  finalizeExport: enhanceFinalExportWithMutations,
}

export default Mutations
