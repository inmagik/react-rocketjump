import mutationsActionCreators from './actionCreators'
import * as mutationsSelectors from './selectors'
import {
  makeMutationsReducer,
  mutationsHorRoot,
  optimisticMutationsHor,
  optimisticMutationsReducer,
} from './reducer'
import { makeExtraRxObservables } from './sideEffects'
import {
  ActionCreators,
  CreateEffectConfig,
  Mutations,
  ReducersMap,
  Reducer,
} from '../types'

export function createMutationsRjObjectEnhancer<M extends Mutations>(
  mutations: M
) {
  const reducersToCombine = {} as ReducersMap
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

  let enhanceReducer
  if (hasSomeOptimisticMutations) {
    enhanceReducer = optimisticMutationsHor
  }

  return {
    actionCreators: <A extends ActionCreators>(actionCreators: A) =>
      mutationsActionCreators(mutations, actionCreators),
    enhanceRootReducer: (reducer: Reducer, actionCreators: ActionCreators) =>
      mutationsHorRoot(mutations, reducer, actionCreators),
    enhanceReducer,
    reducersToCombine,
    selectors: mutationsSelectors,
    makeObservables: (sideEffect: CreateEffectConfig) =>
      makeExtraRxObservables(mutations, sideEffect),
  }
}
