import { exportEffectCaller } from '../sideEffectDescriptor'
import combineReducers from '../combineReducers'
import {
  enhanceReducer,
  makeMutationsReducer,
  optimisticMutationsReducer,
  optimisticMutationsHor,
} from './reducer'
import { enancheComputeState } from './computed'
import { enhanceMakeObservable } from './sideEffects'
import { enhanceActionCreators } from './actionCreators'
import { enhanceMakeSelectors } from './selectors'

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

export function enhanceFinalExportWithMutations(
  rjObject,
  { computed, sideEffect }
) {
  const { mutations, ...rjEnhancedObject } = rjObject
  if (!mutations) {
    return rjEnhancedObject
  }

  const {
    makeRxObservable,
    actionCreators,
    reducer,
    computeState,
    makeSelectors,
  } = rjEnhancedObject

  const enhancedReducer = enhanceReducer(mutations, reducer, actionCreators)

  const reducersToCombine = {}
  const mutationsReducer = makeMutationsReducer(mutations)
  if (mutationsReducer) {
    reducersToCombine.mutations = mutationsReducer
  }

  const hasSomeOptimisticMutations = Object.keys(mutations).some(
    (name) => typeof mutations[name].optimisticResult === 'function'
  )
  if (hasSomeOptimisticMutations) {
    // Enable optimistic reducer...
    reducersToCombine.optimisticMutations = optimisticMutationsReducer
  }

  let hasMutationsState
  let withMutationsReducer
  if (Object.keys(reducersToCombine).length === 0) {
    hasMutationsState = false
    withMutationsReducer = enhancedReducer
  } else {
    hasMutationsState = true
    withMutationsReducer = combineReducers({
      root: enhancedReducer,
      ...reducersToCombine,
    })
  }

  if (hasSomeOptimisticMutations) {
    withMutationsReducer = optimisticMutationsHor(withMutationsReducer)
  }

  return {
    ...rjEnhancedObject,
    computeState: enancheComputeState(
      mutations,
      hasMutationsState,
      computeState,
      computed
    ),
    reducer: withMutationsReducer,
    makeSelectors: enhanceMakeSelectors(mutations, makeSelectors),
    actionCreators: enhanceActionCreators(mutations, actionCreators),
    makeRxObservable: enhanceMakeObservable(
      mutations,
      makeRxObservable,
      sideEffect.effectCaller
    ),
  }
}
