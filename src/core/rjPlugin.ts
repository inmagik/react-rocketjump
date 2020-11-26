import { mergeRjObject } from './rjObject'
import {
  ActionCreators,
  MakeRjPlugin,
  MakeRjPluginConifg,
  Reducer,
  ReducersMap,
  RjBaseConfig,
  RjMergeableObject,
  RjPlugin,
  Selectors,
} from './types'
import { RJ_PLUGIN } from './internals'

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
): RjPlugin {
  const [config]: RjBaseConfig[] = configAndPlugins.slice(-1) as RjBaseConfig[]
  const plugins: Plugins = configAndPlugins.slice(0, -1) as Plugins

  const plugIn = (givenObj: RjMergeableObject) => {
    const wihtCurriedPluginObj = plugins.reduce(
      (mergeObj, plugin) => plugin(mergeObj),
      givenObj
    )
    return mergeRjObject(config, wihtCurriedPluginObj)
  }
  Object.defineProperty(plugIn, '__rjtype', { value: RJ_PLUGIN })
  return plugIn
}

export default rjPlugin
