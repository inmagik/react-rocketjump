import { exportEffectCaller } from '../sideEffectDescriptor'
import { enhanceReducer, makeMutationsReducer } from './reducer'
import { createMutationsSelectorsForComputed } from './computed'
import { enhanceMakeObservable } from './sideEffects'
import { enhanceActionCreators } from './actionCreators'
import { enhanceMakeSelectors } from './selectors'

function checkMutationsConfig(rjConfig) {
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
    const mutationsReducer = makeMutationsReducer(mutations)
    if (mutationsReducer) {
      return {
        mutations: mutationsReducer,
      }
    }
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

  const { makeRxObservable, actionCreators, makeSelectors } = rjObject

  return {
    ...rjObject,
    makeSelectors: enhanceMakeSelectors(mutations, makeSelectors),
    actionCreators: enhanceActionCreators(mutations, actionCreators),
    makeRxObservable: enhanceMakeObservable(
      mutations,
      makeRxObservable,
      sideEffect.effectCaller
    ),
  }
}

const Mutations = {
  name: 'Mutations',
  checkObjectConfig: checkMutationsConfig,
  makeExport: enhanceMakeExportWithMutations,
  enhanceReducer: enhanceReducerWithMutations,
  combineReducers: combineReducersWithMutations,
  selectorsForComputed: mutationsSelectorsForComputed,
  finalizeExport: enhanceFinalExportWithMutations,
}

export default Mutations
