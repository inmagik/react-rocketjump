import { createRjObject, finalizeRjObject, mergeRjObject } from './rjObject'
import {
  Reducer,
  ReducerEnhancer,
  RjMergeableObject,
  RjBaseSelectors,
  Selectors,
  SelectorsEnhancer,
  RjPlugin,
  MergePluginsSelectors,
  MergePluginsReducers,
  MergePluginsCombineReducers,
  MergePluginsActionCreators,
  RjBaseActionCreators,
  ComposableReducer,
  ReducersMap,
  ActionCreatorsEnhancer,
  ActionCreators,
  CombineReducers,
  Computed,
  ExtractMergeObjSelectors,
  ExtractMergeObjReducersMap,
  ExtractMergeObjReducer,
  ExtracConfigActionsCreators,
  ExtractMergeObjRootState,
  RjRunnableEffectConfig,
  RjNameConfig,
  RjSideEffectConfig,
  RjStateRootShape,
  Mutations,
  MakeMutationsReducersMap,
  MergeMutationsActionCreators,
  ExtractMergeObjStateWithMutations,
  RjObjectWithComputed,
} from './types'

export interface RjBuilderFinalConfig
  extends RjRunnableEffectConfig,
    RjNameConfig,
    RjSideEffectConfig {}

export interface RjEffectBuilder<
  RJ extends RjMergeableObject = RjMergeableObject,
  ConfigComputed extends Computed = Computed,
  ConfigMutations extends Mutations = Mutations
> {
  effect(
    config: RjBuilderFinalConfig
  ): RjObjectWithComputed<
    CombineReducers<
      ExtractMergeObjReducersMap<RJ> & {
        root: ExtractMergeObjReducer<RJ>
      } & MakeMutationsReducersMap<ConfigMutations>
    >,
    ExtractMergeObjSelectors<RJ>,
    ConfigComputed,
    ExtracConfigActionsCreators<RJ> &
      MergeMutationsActionCreators<ConfigMutations>
  >
}

function rjEffectBuilder(
  mergeObj: RjMergeableObject,
  computed?: Computed,
  mutations?: Mutations
): RjEffectBuilder {
  return {
    effect: (config) => {
      const { name, effect, ...sideEffectConfig } = config
      const mergeObjWithEffect = mergeRjObject(sideEffectConfig, mergeObj)
      return finalizeRjObject(
        { name, effect, computed, mutations },
        mergeObjWithEffect
      )
    },
  }
}

export interface RjComputedBuilder<
  RJ extends RjMergeableObject = RjMergeableObject,
  ConfigMutations extends Mutations = Mutations
> extends RjEffectBuilder<RJ> {
  computed<
    ConfigComputed extends Computed<
      ExtractMergeObjSelectors<RJ>,
      ExtractMergeObjStateWithMutations<RJ, ConfigMutations>
    >
  >(
    computed: ConfigComputed
  ): RjEffectBuilder<RJ, ConfigComputed, ConfigMutations>

  computed<ConfigComputed extends Computed<ExtractMergeObjSelectors<RJ>>>(
    computed: ConfigComputed
  ): RjEffectBuilder
}

function rjComputedBuilder(
  mergeObj: RjMergeableObject,
  mutations?: Mutations
): RjComputedBuilder {
  return {
    ...rjEffectBuilder(mergeObj, undefined, mutations),
    computed: (computed: Computed) =>
      rjEffectBuilder(mergeObj, computed, mutations),
  }
}

export interface RjSelectorsBuilder<
  RJ extends RjMergeableObject = RjMergeableObject,
  ConfigMutations extends Mutations = Mutations
> extends RjComputedBuilder<RJ, ConfigMutations> {
  selectors<
    ConfigSelectors extends Selectors<
      ExtractMergeObjStateWithMutations<RJ, ConfigMutations>
    >
  >(
    selectors: SelectorsEnhancer<ExtractMergeObjSelectors<RJ>, ConfigSelectors>
  ): RjSelectorsBuilder<
    RjMergeableObject<
      ExtractMergeObjReducer<RJ>,
      ExtractMergeObjSelectors<RJ> & ConfigSelectors,
      ExtractMergeObjReducersMap<RJ>,
      ExtracConfigActionsCreators<RJ>
    >,
    ConfigMutations
  >
}

export function rjSelectorsBuilder(
  mergeObj: RjMergeableObject,
  mutations?: Mutations
): RjSelectorsBuilder {
  return {
    ...rjComputedBuilder(mergeObj, mutations),
    selectors: (selectors) =>
      rjSelectorsBuilder(mergeRjObject({ selectors }, mergeObj), mutations),
  }
}

export interface RjMutationsBuilder<
  RJ extends RjMergeableObject = RjMergeableObject
> extends RjSelectorsBuilder<RJ> {
  mutations<
    ConfigMutations extends Mutations<
      ExtractMergeObjRootState<RJ>,
      Reducer,
      ExtracConfigActionsCreators<RJ>
    >
  >(
    mutations: ConfigMutations
  ): RjSelectorsBuilder<RJ, ConfigMutations>

  mutations<
    ConfigMutations extends Mutations<
      ExtractMergeObjRootState<RJ>,
      Reducer,
      ExtracConfigActionsCreators<RJ>
    >
  >(
    mutations: ConfigMutations
  ): RjSelectorsBuilder
}

function rjMutationsBuilder(mergeObj: RjMergeableObject): RjMutationsBuilder {
  return {
    ...rjSelectorsBuilder(mergeObj),
    mutations: (mutations: Mutations) =>
      rjSelectorsBuilder(mergeObj, mutations),
  }
}

export interface RjConfBuilder<RJ extends RjMergeableObject = RjMergeableObject>
  extends RjMutationsBuilder<RJ> {
  reducer<ConfigReducer extends Reducer>(
    reducer: ReducerEnhancer<ExtractMergeObjReducer<RJ>, ConfigReducer>
  ): RjConfBuilder<
    RjMergeableObject<
      ConfigReducer,
      ExtractMergeObjSelectors<RJ>,
      ExtractMergeObjReducersMap<RJ>,
      ExtracConfigActionsCreators<RJ>
    >
  >

  composeReducer<ComposedState>(
    combineReducers: ComposableReducer<
      ExtractMergeObjRootState<RJ>,
      ComposedState
    >
  ): RjConfBuilder<
    RjMergeableObject<
      Reducer<ComposedState>,
      ExtractMergeObjSelectors<RJ>,
      ExtractMergeObjReducersMap<RJ>,
      ExtracConfigActionsCreators<RJ>
    >
  >

  combineReducers<ReducersMapCombine extends ReducersMap>(
    combineReducers: ReducersMapCombine
  ): RjConfBuilder<
    RjMergeableObject<
      ExtractMergeObjReducer<RJ>,
      ExtractMergeObjSelectors<RJ>,
      ExtractMergeObjReducersMap<RJ> & ReducersMapCombine,
      ExtracConfigActionsCreators<RJ>
    >
  >

  actions<ConfigActionCreators extends ActionCreators>(
    actions: ActionCreatorsEnhancer<
      ExtracConfigActionsCreators<RJ>,
      ConfigActionCreators
    >
  ): RjConfBuilder<
    RjMergeableObject<
      ExtractMergeObjReducer<RJ>,
      ExtractMergeObjSelectors<RJ>,
      ExtractMergeObjReducersMap<RJ>,
      ExtracConfigActionsCreators<RJ> & ConfigActionCreators
    >
  >
}

export function rjConfigBuilder(mergeObj: RjMergeableObject): RjConfBuilder {
  return {
    ...rjMutationsBuilder(mergeObj),
    reducer: (reducer) => rjConfigBuilder(mergeRjObject({ reducer }, mergeObj)),
    composeReducer: (composeReducer) =>
      rjConfigBuilder(mergeRjObject({ composeReducer }, mergeObj)),
    combineReducers: (combineReducers) =>
      rjConfigBuilder(mergeRjObject({ combineReducers }, mergeObj)),
    actions: (actions) => rjConfigBuilder(mergeRjObject({ actions }, mergeObj)),
  }
}

export interface RjBuilder<RJ extends RjMergeableObject = RjMergeableObject>
  extends RjConfBuilder<RJ> {
  /**
   * Add plugins to your rj configuration
   *
   */
  plugins<Plugins extends RjPlugin[]>(
    ...plugins: Plugins
  ): RjConfBuilder<
    RjMergeableObject<
      MergePluginsReducers<Plugins>,
      MergePluginsSelectors<Plugins> & RjBaseSelectors,
      MergePluginsCombineReducers<Plugins>,
      MergePluginsActionCreators<Plugins> & RjBaseActionCreators
    >
  >
}

function rjBuilder(): RjBuilder<RjMergeableObject<Reducer<RjStateRootShape>>> {
  const mergeObj = createRjObject()
  return {
    ...rjConfigBuilder(mergeObj),
    plugins: (...pluginsList) => {
      const withPluginsMergeObj = pluginsList.reduce(
        (mergeRjObj, plugin) => plugin(mergeRjObj),
        mergeObj
      )
      return rjConfigBuilder(withPluginsMergeObj)
    },
  }
}

export default rjBuilder
