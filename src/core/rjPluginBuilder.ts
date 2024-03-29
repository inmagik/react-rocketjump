import craftRjPlugin from './craftRjPlugin'
import {
  AllRjCurriedState,
  RjBaseActionCreators,
  MakeRjPlugin,
  RjBaseConfig,
  RjPlugin,
  Reducer,
  ActionCreators,
  ReducersMap,
  Selectors,
  ReducerEnhancer,
  MergePluginsReducers,
  RjBaseSelectors,
  MergePluginsSelectors,
  SelectorsEnhancer,
  ComposableReducer,
  ExtraPluginsAndReducerState,
  ActionCreatorsEnhancer,
  MergePluginsActionCreators,
  RjSideEffectConfig,
  ExtractConfigReducer,
  ExtractConfigSelectors,
  ExtractConfigReducersMap,
  ExtractConfigComposeReducer,
  ExtractConfigActionCreators,
  ExtractConfigComposedState,
} from './types'

export interface RjPluginEndBuilder<
  PluginConfig extends RjBaseConfig = RjBaseConfig,
  Plugins extends RjPlugin[] = RjPlugin[]
> {
  build(): MakeRjPlugin<
    Plugins,
    ExtractConfigReducer<PluginConfig>,
    ExtractConfigSelectors<PluginConfig>,
    ExtractConfigReducersMap<PluginConfig>,
    ExtractConfigComposedState<PluginConfig>,
    ExtractConfigActionCreators<PluginConfig>
  >
}

export interface RjPluginEffectConfigBuilder<
  PluginConfig extends RjBaseConfig = RjBaseConfig,
  Plugins extends RjPlugin[] = RjPlugin[]
> extends RjPluginEndBuilder<PluginConfig, Plugins> {
  effect(
    effectConfig: RjSideEffectConfig
  ): RjPluginEndBuilder<
    RjBaseConfig<
      Reducer,
      ExtractConfigReducer<PluginConfig>,
      RjBaseSelectors,
      ExtractConfigSelectors<PluginConfig>,
      ExtractConfigReducersMap<PluginConfig>,
      ExtractConfigComposeReducer<PluginConfig>,
      RjBaseActionCreators,
      ExtractConfigActionCreators<PluginConfig>
    >,
    Plugins
  >
}
export interface RjPluginSelectorsConfigBuilder<
  PluginConfig extends RjBaseConfig = RjBaseConfig,
  Plugins extends RjPlugin[] = RjPlugin[]
> extends RjPluginEffectConfigBuilder<PluginConfig, Plugins> {
  selectors<
    PluginSelectors extends Selectors<
      AllRjCurriedState<
        Plugins,
        ExtractConfigReducersMap<PluginConfig>,
        ExtractConfigReducer<PluginConfig>,
        ExtractConfigComposedState<PluginConfig>
      >
    >
  >(
    selectors: SelectorsEnhancer<
      RjBaseSelectors & MergePluginsSelectors<Plugins>,
      PluginSelectors
    >
  ): RjPluginEffectConfigBuilder<
    RjBaseConfig<
      Reducer,
      ExtractConfigReducer<PluginConfig>,
      RjBaseSelectors,
      PluginSelectors,
      ExtractConfigReducersMap<PluginConfig>,
      ExtractConfigComposeReducer<PluginConfig>,
      RjBaseActionCreators,
      ExtractConfigActionCreators<PluginConfig>
    >,
    Plugins
  >

  selectors(selectors: SelectorsEnhancer): RjPluginEffectConfigBuilder
}

export interface RjPluginReducerActionsConfigBuilder<
  PluginConfig extends RjBaseConfig = RjBaseConfig,
  Plugins extends RjPlugin[] = RjPlugin[]
> extends RjPluginSelectorsConfigBuilder<PluginConfig, Plugins> {
  reducer<PluginReducer extends Reducer>(
    reducer: ReducerEnhancer<MergePluginsReducers<Plugins>, PluginReducer>
  ): RjPluginReducerActionsConfigBuilder<
    RjBaseConfig<
      Reducer,
      PluginReducer,
      RjBaseSelectors,
      ExtractConfigSelectors<PluginConfig>,
      ExtractConfigReducersMap<PluginConfig>,
      ExtractConfigComposeReducer<PluginConfig>,
      RjBaseActionCreators,
      ExtractConfigActionCreators<PluginConfig>
    >,
    Plugins
  >

  composeReducer<ComposedState>(
    composeReducer: ComposableReducer<
      ExtraPluginsAndReducerState<Plugins, ExtractConfigReducer<PluginConfig>>,
      ComposedState
    >
  ): RjPluginReducerActionsConfigBuilder<
    RjBaseConfig<
      Reducer,
      ExtractConfigReducer<PluginConfig>,
      RjBaseSelectors,
      ExtractConfigSelectors<PluginConfig>,
      ExtractConfigReducersMap<PluginConfig>,
      Reducer<ComposedState>,
      RjBaseActionCreators,
      ExtractConfigActionCreators<PluginConfig>
    >,
    Plugins
  >

  combineReducers<ReducersMapCombine extends ReducersMap>(
    combineReducers: ReducersMapCombine
  ): RjPluginReducerActionsConfigBuilder<
    RjBaseConfig<
      Reducer,
      ExtractConfigReducer<PluginConfig>,
      RjBaseSelectors,
      ExtractConfigSelectors<PluginConfig>,
      ReducersMapCombine,
      ExtractConfigComposeReducer<PluginConfig>,
      RjBaseActionCreators,
      ExtractConfigActionCreators<PluginConfig>
    >,
    Plugins
  >

  combineReducers(
    combineReducers: ReducersMap
  ): RjPluginReducerActionsConfigBuilder

  actions<PluginActionCreators extends ActionCreators>(
    actions: ActionCreatorsEnhancer<
      RjBaseActionCreators & MergePluginsActionCreators<Plugins>,
      PluginActionCreators
    >
  ): RjPluginReducerActionsConfigBuilder<
    RjBaseConfig<
      Reducer,
      ExtractConfigReducer<PluginConfig>,
      RjBaseSelectors,
      ExtractConfigSelectors<PluginConfig>,
      ExtractConfigReducersMap<PluginConfig>,
      ExtractConfigComposeReducer<PluginConfig>,
      RjBaseActionCreators,
      PluginActionCreators
    >,
    Plugins
  >

  actions(actions: ActionCreatorsEnhancer): RjPluginReducerActionsConfigBuilder
}

export interface RjPluginBuilder<
  PluginConfig extends RjBaseConfig = RjBaseConfig,
  Plugins extends RjPlugin[] = RjPlugin[]
> extends RjPluginReducerActionsConfigBuilder<PluginConfig, Plugins> {
  plugins<Plugins extends RjPlugin[]>(
    ...plugins: Plugins
  ): RjPluginReducerActionsConfigBuilder<PluginConfig, Plugins>

  plugins(...plugins: RjPlugin[]): RjPluginReducerActionsConfigBuilder
}

function rjPluginEndBuilder(
  config: RjBaseConfig,
  plugins: RjPlugin[]
): RjPluginEndBuilder {
  return {
    // Finally craft plugin
    build: () => craftRjPlugin(config, plugins),
  }
}

function rjPluginEffectConfigBuilder(
  config: RjBaseConfig,
  plugins: RjPlugin[]
): RjPluginEffectConfigBuilder {
  return {
    ...rjPluginEndBuilder(config, plugins),
    // ++ Side Effect
    effect: (sideEffect) =>
      rjPluginEndBuilder({ ...config, ...sideEffect }, plugins),
  }
}

function rjPluginSelecotrsConfigBuilder(
  config: RjBaseConfig,
  plugins: RjPlugin[]
): RjPluginSelectorsConfigBuilder {
  return {
    ...rjPluginEffectConfigBuilder(config, plugins),
    // ++ Selectors
    selectors: (selectors: SelectorsEnhancer) =>
      rjPluginEffectConfigBuilder({ ...config, selectors }, plugins),
  }
}

function rjPluginReducerAtionsConfigBuilder<
  PluginConfig extends RjBaseConfig = RjBaseConfig,
  Plugins extends RjPlugin[] = RjPlugin[]
>(
  config: PluginConfig,
  plugins: Plugins
): RjPluginReducerActionsConfigBuilder<RjBaseConfig, Plugins>

function rjPluginReducerAtionsConfigBuilder(
  config: RjBaseConfig,
  plugins: RjPlugin[]
): RjPluginReducerActionsConfigBuilder {
  return {
    ...rjPluginSelecotrsConfigBuilder(config, plugins),
    // ++ Actions
    actions: (actions: ActionCreatorsEnhancer) =>
      rjPluginReducerAtionsConfigBuilder({ ...config, actions }, plugins),
    // ++ Reducer
    reducer: (reducer) =>
      rjPluginReducerAtionsConfigBuilder({ ...config, reducer }, plugins),
    // ++ Compose Reducer
    composeReducer: (composeReducer) =>
      rjPluginReducerAtionsConfigBuilder(
        { ...config, composeReducer },
        plugins
      ),
    // ++ Combine Reducers
    combineReducers: (combineReducers: ReducersMap) =>
      rjPluginReducerAtionsConfigBuilder(
        { ...config, combineReducers },
        plugins
      ),
  }
}

export default function rjPluginBuilder(): RjPluginBuilder<{}, []> {
  return {
    ...rjPluginReducerAtionsConfigBuilder({}, []),
    plugins: (...plugins: RjPlugin[]) =>
      rjPluginReducerAtionsConfigBuilder({}, plugins),
  }
}
