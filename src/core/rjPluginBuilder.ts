import rj from './rj'
import { mergeRjObject } from './rjObject'
import rjPlugin from './rjPlugin'
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
  MakeRjPluginConifg,
  RjMergeableObject,
  MergePluginsCombineReducers,
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
} from './types'

type ExtractConfigReducer<
  Config extends RjBaseConfig
> = Config extends RjBaseConfig<any, infer H> ? H : never

type ExtractConfigSelectors<
  Config extends RjBaseConfig
> = Config extends RjBaseConfig<any, any, any, infer H> ? H : never

type ExtractConfigReducersMap<
  Config extends RjBaseConfig
> = Config extends RjBaseConfig<any, any, any, any, infer H> ? H : never

type ExtractConfigComposeReducer<
  Config extends RjBaseConfig
> = Config extends RjBaseConfig<any, any, any, any, any, infer H> ? H : never

type ExtractConfigActionCreators<
  Config extends RjBaseConfig
> = Config extends RjBaseConfig<any, any, any, any, any, any, any, infer H>
  ? H
  : never

type ExtractConfigComposedState<
  Config extends RjBaseConfig
> = ExtractConfigComposeReducer<Config> extends Reducer<infer S> ? S : unknown

interface RjPluginEndBuilder<
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

interface RjPluginEffectConfigBuilder<
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
interface RjPluginSelectorsConfigBuilder<
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
}

interface RjPluginReducerActionsConfigBuilder<
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
    combineReducers: ComposableReducer<
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
}

interface RjPluginBuilder<
  PluginConfig extends RjBaseConfig = RjBaseConfig,
  Plugins extends RjPlugin[] = RjPlugin[]
> extends RjPluginReducerActionsConfigBuilder<PluginConfig, Plugins> {
  plugins<Plugins extends RjPlugin[]>(
    ...plugins: Plugins
  ): RjPluginReducerActionsConfigBuilder<PluginConfig, Plugins>

  plugins(...plugins: RjPlugin[]): RjPluginReducerActionsConfigBuilder
}

function rjPluginBuilder(): RjPluginBuilder<{}, []> {
  throw new Error()
}

// rjPluginBuilder()
//   // .reducer((r) => () => 99)
//   // .composeReducer(state => state.)
//   .combineReducers({
//     drago: () => [{ at: new Date() }],
//   })
//   .selectors((s) => ({}))
//   .effect({})
//   .build()

// .effect({})
// .build()

// .plugins()

// function rjConfgiPluginBuilder(
//   config: RjBaseConfig,
//   plugins: RjPlugin[]
// ): RjPluginBuilder {
//   return {
//     plugins: (...plugins: RjPlugin[]) => rjConfgiPluginBuilder(config, plugins),

//     build: () => {
//       const plugIn = (givenObj: RjMergeableObject) => {
//         const wihtCurriedPluginObj = plugins.reduce(
//           (mergeObj, plugin) => plugin(mergeObj),
//           givenObj
//         )
//         return mergeRjObject(config, wihtCurriedPluginObj)
//       }
//       // Object.defineProperty(plugIn, '__rjtype', { value: RJ_PLUGIN })
//       return plugIn
//     },
//   }
// }

// function rjPluginBuilder(): RjPluginBuilder<{}, []> {
//   throw new Error()
//   // const config: RjBaseConfig = {}
//   // const plugins: RjPlugin[] = []
//   // return rjConfgiPluginBuilder(config, plugins)
// }

const p1 = rjPlugin({
  actions: () => ({
    dollar: () => ({ type: '$' }),
  }),
  reducer: (r) => () => 99,
  combineReducers: {
    gang: () => new Date(),
  },
})

const p2 = rjPlugin({
  reducer: (r) => () => ['X'],
  // actions: (a) => ({
  //   dollar: () => ({ type: '$' })
  // }),
  combineReducers: {
    fumello: () => 'BASELINE',
  },
  // combineReducers: {
  //   gang: () => new Date(),
  // },
})

// const p26 = rjPlugin(
//   p2,
//   {
//     reducer: r => {

//     }
//   }
// )

const xyz = rjPluginBuilder()
  .plugins(p1, p2)
  .reducer((r) => () => new Date())
  .effect({
    takeEffect: 'latest',
  })

  .actions((a) => ({
    x: () => ({ type: 'Bugu' }),
  }))
  // .composeReducer((state) => {
  //   return 23
  // })
  // .combineReducers({
  //   albi: () => ({ name: 'Albi' }),
  // })
  // // xyz.combineReducers
  // .selectors((se) => ({
  //   draghi: (state) => state.fumello.blink(),
  //   bu: (state) => {
  //     state.root.getFullYear()
  //   },
  //   xx23: (state) => state.gang.getMinutes(),
  // }))
  .build()

// xyz.actions(null)

// xyz
// declare function babu<C extends RjBaseConfig>(c: C): RjPluginBuilder<C>

// let c = babu2().plugin()

// let y = babu({
//   // reducer: r => (state: number[] | undefined, action) => [22]
//   // reducer: ()
// }).plugin()

// let z = rjPlugin({
//   reducer: (r) => (state: number | undefined, action) => 22,
// })

const { reducer, actionCreators } = rj()
  .plugins(xyz)
  // .selectors((se) => ({
  //   draghi2: (state) => se.draghi(state),
  //   // bu: (state) => state.root.getHours(),
  //   // xx23: (state) => state.gang.getMinutes(),
  // }))
  // .computed({
  //   dho: 'draghi2',
  // })
  .actions((a) => ({}))
  .effect({
    effectCaller: 'configured',
    effect: () => Promise.resolve(99),
  })
// .effect(() => Promise.resolve(23))

const state = reducer(undefined, { type: 'X' })
// state.root.
// state.
// actionCreators.x().type
// state.root.
// state.albi.state.gang.getFullYear()

// // state.
// // state.root.sort()
// // let x : RjPluginBuilder
