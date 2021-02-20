import {
  ActionCreators,
  MakeRjPlugin,
  MakeRjPluginConifg,
  Reducer,
  ReducersMap,
  RjBaseConfig,
  RjPlugin,
  Selectors,
} from './types'
import craftRjPlugin from './craftRjPlugin'
import rjPluginBuilder, { RjPluginBuilder } from './rjPluginBuilder'

function rjPlugin(): RjPluginBuilder<{}, []>

function rjPlugin<
  PluginReducer extends Reducer | undefined,
  ComposedState = unknown,
  ReducersMapCombine extends ReducersMap = ReducersMap,
  PluginActionCreators extends ActionCreators = ActionCreators,
  PluginSelectors extends Selectors<
    // NOTE: Missing infer actual composed state cause is always unknown ...
    // see: https://github.com/microsoft/TypeScript/issues/41396
    // ComposedState,
    // AllRjCurriedState<Plugins, ReducersMapCombine, PluginReducer>
    any
  > = Selectors,
  Plugins extends RjPlugin[] = RjPlugin[]
>(
  ...configAndPlugins: [
    ...Plugins,
    MakeRjPluginConifg<
      Plugins,
      PluginReducer,
      PluginSelectors,
      ReducersMapCombine,
      ComposedState,
      PluginActionCreators
    >
  ]
): MakeRjPlugin<
  Plugins,
  PluginReducer,
  PluginSelectors,
  ReducersMapCombine,
  ComposedState,
  PluginActionCreators
>

function rjPlugin<Plugins extends RjPlugin[]>(
  ...configAndPlugins: [...Plugins, RjBaseConfig]
): RjPlugin | RjPluginBuilder {
  if (configAndPlugins.length === 0) {
    return rjPluginBuilder()
  }

  const [config]: RjBaseConfig[] = configAndPlugins.slice(-1) as RjBaseConfig[]
  const plugins: Plugins = configAndPlugins.slice(0, -1) as Plugins
  return craftRjPlugin(config, plugins)
}

export default rjPlugin
