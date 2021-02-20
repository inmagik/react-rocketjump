import defaultActionCreators from './actions/defaultActionCreators'
import defaultMakeSelectors from './defaultMakeSelectors'
import createMakeObservable, {
  mergeMakeObservables,
} from './effect/createMakeObservable'
import { TAKE_EFFECT_LATEST } from './effect/takeEffects'
import makeComputeState from './makeComputeState'
import { createMutationsRjObjectEnhancer } from './mutations'
import * as mutationsSelectors from './mutations/selectors'
import combineReducers from './reducer/combineReducers'
import composeReducers from './reducer/composeReducers'
import rootReducer from './reducer/rootReducer'
import {
  Reducer,
  RjBaseConfig,
  RjBaseSelectors,
  RjEffectPipeliner,
  RjFinalizeConfig,
  RjMergeableObject,
  RjObject,
  RjStartSelectors,
  RjStateRootShape,
  SelectorsEnhancer,
} from './types'
import { RJ_OBJECT } from './internals'

export function createRjObject(): RjMergeableObject<Reducer<RjStateRootShape>> {
  return {
    reducer: rootReducer,
    combineReducers: {},
    makeSelectors: defaultMakeSelectors,
    actionCreators: defaultActionCreators,
    takeEffect: TAKE_EFFECT_LATEST,
    effectCallers: [],
    effectPipelines: [],
    addSideEffects: [],
  }
}

export function mergeRjObject(
  config: RjBaseConfig,
  mergeObj: RjMergeableObject
): RjMergeableObject {
  // Start with reducer
  let reducer: Reducer
  if (config.reducer) {
    reducer = config.reducer(mergeObj.reducer)
  } else {
    reducer = mergeObj.reducer
  }
  // Kompose reducer
  if (config.composeReducer) {
    reducer = composeReducers(reducer, config.composeReducer)
  }

  const combineReducers = {
    ...mergeObj.combineReducers,
    ...config.combineReducers,
  }

  let makeSelectors: (s: RjStartSelectors) => RjBaseSelectors
  if (config.selectors) {
    // Kompose next make selectors
    makeSelectors = (selectors: RjStartSelectors) => {
      const nextSelectors = mergeObj.makeSelectors(selectors)
      const configSelectors = (config.selectors as SelectorsEnhancer)(
        nextSelectors
      )
      return {
        ...nextSelectors,
        ...configSelectors,
      }
    }
  } else {
    makeSelectors = mergeObj.makeSelectors
  }

  const actionCreators = config.actions
    ? {
        ...mergeObj.actionCreators,
        ...config.actions(mergeObj.actionCreators),
      }
    : mergeObj.actionCreators

  // Override take from config when given
  const takeEffect = config.takeEffect ?? mergeObj.takeEffect

  const effectCallers = config.effectCaller
    ? // Merge next caller
      mergeObj.effectCallers.concat(config.effectCaller)
    : // Keep prev caller
      mergeObj.effectCallers

  const effectPipelines = config.effectPipeline
    ? // Merge next caller
      mergeObj.effectPipelines.concat(config.effectPipeline)
    : // Keep prev caller
      mergeObj.effectPipelines

  const addSideEffects = config.addSideEffect
    ? // Merge next side effects
      mergeObj.addSideEffects.concat(config.addSideEffect)
    : // Keep prev side effects
      mergeObj.addSideEffects

  return {
    reducer,
    makeSelectors,
    combineReducers,
    actionCreators,
    takeEffect,
    effectCallers,
    effectPipelines,
    addSideEffects,
  }
}

export function finalizeRjObject(
  config: RjFinalizeConfig,
  mergeObj: RjMergeableObject
): RjObject {
  // Hello,
  // we are at the of recursion

  // This are taken from the rj() objet creator or rj.effect() with builder
  const { effect, mutations, name } = config
  // These are all the option merged along the rj plugin chain
  // rj(rjPlugin()) merged according to mergeRjObject
  const {
    reducer: configRootReducer,
    combineReducers: combineReducersMap,
    makeSelectors: baseMakeSelectors,
    actionCreators: configActionCreators,
    takeEffect,
    effectCallers,
    effectPipelines,
    addSideEffects,
  } = mergeObj

  // Mutations
  // Init the mutations enhancher with mutations config
  // this add features to final rj object export reducer, action ecc
  const withMutations = mutations
    ? createMutationsRjObjectEnhancer(mutations)
    : null

  // REDUCER
  // Rj Root Reducer
  const rjRootReducer =
    withMutations?.enhanceRootReducer?.(
      configRootReducer,
      configActionCreators
    ) ?? configRootReducer

  // Rj Reducers with others map and mutations map + other future vendors maps

  if (process.env.NODE_ENV !== 'production') {
    if (combineReducersMap.root) {
      console.warn(
        `[react-rocketjump] You try to override the [root] key that is a reserverd key ` +
          'please use reducer or composeReducer config option to override root reducer.'
      )
    }
    Object.keys(withMutations?.reducersToCombine ?? {}).forEach(
      (mutationKey) => {
        if (combineReducersMap[mutationKey]) {
          console.warn(
            `[react-rocketjump] You try to override a mutation reserved key [${mutationKey}] ` +
              'this has no effect.'
          )
        }
      }
    )
  }

  const rjReducer = combineReducers({
    ...combineReducersMap,
    ...withMutations?.reducersToCombine,
    root: rjRootReducer,
  })

  // ++Mutations Future other enchanchers EHehehe
  const reducer = withMutations?.enhanceReducer?.(rjReducer) ?? rjReducer

  // Selectors
  const getRoot = (state: any) => state.root
  const makeSelectors = () =>
    // Init the make selectors chain with the root + extra reducers
    // for now mutations ...future hook into with other selectors
    baseMakeSelectors({ getRoot, ...mutationsSelectors })

  // Action Creators
  const actionCreators =
    withMutations?.actionCreators(configActionCreators) ?? configActionCreators

  // Computed
  const computeState = makeComputeState(config.computed)

  // Side Effect
  const createEffectConfig = {
    effect,
    takeEffect,
    effectCallers,
  }
  let makeObservable = createMakeObservable(createEffectConfig)
  const extraMakeObservables = (
    withMutations?.makeObservables(createEffectConfig) ?? []
  ).concat(
    addSideEffects.map((addTakeEffect) =>
      createMakeObservable({
        ...createEffectConfig,
        takeEffect: addTakeEffect,
      })
    )
  )

  if (extraMakeObservables.length) {
    makeObservable = mergeMakeObservables(
      makeObservable,
      ...extraMakeObservables
    )
  }

  const pipeActionStream: RjEffectPipeliner = (actions, state) =>
    effectPipelines.reduce((actions, piper) => piper(actions, state), actions)

  const rjObject = {
    // Optional Rj Name =)
    name,
    reducer,
    makeSelectors,
    actionCreators,
    computeState,
    makeObservable,
    pipeActionStream,
  }
  Object.defineProperty(rjObject, '__rjtype', { value: RJ_OBJECT })
  return rjObject
}
