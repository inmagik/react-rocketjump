import { createRjObject, finalizeRjObject, mergeRjObject } from './rjObject'
import {
  ActionCreators,
  Computed,
  EffectFn,
  MakeRjConfig,
  MakeRjObject,
  Mutations,
  Reducer,
  ReducersMap,
  RjConfguredCaller,
  RjConfig,
  RjMergeableObject,
  RjObject,
  RjPlugin,
  RjStateRootShape,
  Selectors,
  // AllRjCurriedState,
  // MergePluginsSelectors,
} from './types'
import rjBuilder, { RjBuilder } from './rjBuilder'
import { RJ_CONFIGURED_EFFECT_CALLER } from './internals'
import standardMutations from './mutations/standard'

function rj(): RjBuilder<RjMergeableObject<Reducer<RjStateRootShape>>>

function rj<
  Plugins extends RjPlugin[],
  ConfigReducer extends Reducer | undefined,
  ConfigSelectors extends Selectors<
    // NOTE: Cause of this issue:
    // see: https://github.com/microsoft/TypeScript/issues/41396
    // we can't infer other values for same object in or case
    // infer composeReducer, reducer and combineReducers state
    // into selector input state, plugins works good
    // but infer the state of liter object Es:.
    // {
    //   composeReducer: (state, action) => ({
    //     ...state,
    //     extra: 999
    //   }),
    //   selectors: () => ({
    //     "root.extra" Can't be infereed (for now)
    //     mySelectors: state => state.root.extra,
    //   })
    // }
    // So for now to avoid sneaky bugs on types we fallback
    // to any we use new rj() Builder to infer perfect types
    // NOTE: pt2
    // i try to write some overload of rj() but i am not able to
    // reduce friction so maybe retry in future...
    any
    // ComposedState,
    // AllRjCurriedState<Plugins, ReducersMapCombine, ConfigReducer>
  >,
  ReducersMapCombine extends ReducersMap,
  ComposedState,
  ConfigComputed extends Computed<
    // For the same reason of above we infer any for now
    any
    // NOTE: Old implementation here for a time when we can fix
    // (or know a workaround from some ts folk)
    // see: https://github.com/microsoft/TypeScript/issues/41396
    // RjBaseSelectors &
    //   MergePluginsSelectors<Plugins> &
    //   // NOTE: this better then before but sometimes
    //   // when in selectors you don't type explicit input selectors
    //   // and input state this fucked Up... but i don't idea why
    //   ({} extends ConfigSelectors ? {} : ConfigSelectors)
  >,
  ConfigActionCreators extends ActionCreators,
  ConfigMutations extends Mutations
>(
  ...configAndPlugins: [
    ...Plugins,
    MakeRjConfig<
      Plugins,
      ConfigReducer,
      ConfigSelectors,
      ReducersMapCombine,
      ComposedState,
      ConfigActionCreators,
      ConfigComputed,
      ConfigMutations
    >
  ]
): MakeRjObject<
  Plugins,
  ConfigReducer,
  ConfigSelectors,
  ReducersMapCombine,
  ComposedState,
  ConfigActionCreators,
  ConfigComputed,
  ConfigMutations
>

function rj<Plugins extends RjPlugin[]>(
  ...effectAndPlugins: [...Plugins, EffectFn]
): MakeRjObject<
  Plugins,
  Reducer<unknown>,
  Selectors,
  ReducersMap,
  unknown,
  ActionCreators,
  Computed,
  Mutations
>

function rj<Plugins extends RjPlugin[]>(
  ...configOrEffectAndPlugins: [...Plugins, RjConfig | EffectFn]
): RjObject | RjBuilder<RjMergeableObject<Reducer<RjStateRootShape>>> {
  if (configOrEffectAndPlugins.length === 0) {
    return rjBuilder()
  }
  const [configOrEffect]:
    | RjConfig[]
    | EffectFn[] = configOrEffectAndPlugins.slice(-1) as RjConfig[] | EffectFn[]
  const config: RjConfig =
    typeof configOrEffect === 'function'
      ? { effect: configOrEffect }
      : configOrEffect
  const plugins: Plugins = configOrEffectAndPlugins.slice(0, -1) as Plugins
  const emptyRjObject = createRjObject()

  const withPluginsRjObject = plugins.reduce(
    (mergeRjObj, plugin) => plugin(mergeRjObj),
    emptyRjObject
  )

  const withConfigAndPluginsRjObject = mergeRjObject(
    config,
    withPluginsRjObject
  )
  return finalizeRjObject(config, withConfigAndPluginsRjObject)
}

type RjFn = typeof rj

interface RjWithHelpers extends RjFn {
  /**
   * @deprecated Use `'configured'` instead.
   *
   * Set your effectCaller a configured caller from `<ConfigureRj />`.
   */
  configured(): RjConfguredCaller

  /**
   * Standard factory RJ mutations for you!
   */
  mutation: typeof standardMutations
}

;(rj as RjWithHelpers).configured = () => {
  return RJ_CONFIGURED_EFFECT_CALLER
}
;(rj as RjWithHelpers).mutation = standardMutations

export default rj as RjWithHelpers
