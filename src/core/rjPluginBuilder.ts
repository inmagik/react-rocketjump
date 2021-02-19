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
> = Config extends RjBaseConfig<any, any, any, any, any, any, infer H>
  ? H
  : never

type ExtractConfigComposedState<
  Config extends RjBaseConfig
> = ExtractConfigComposeReducer<Config> extends Reducer<infer S> ? S : unknown

interface RjPluginBuilder<
  PluginConfig extends RjBaseConfig = RjBaseConfig,
  Plugins extends RjPlugin[] = RjPlugin[]
> {
  plugins<Plugins extends RjPlugin[]>(
    ...plugins: Plugins
  ): RjPluginBuilder<PluginConfig, Plugins>

  plugins(...plugins: RjPlugin[]): RjPluginBuilder

  reducer<PluginReducer extends Reducer>(
    reducer: ReducerEnhancer<MergePluginsReducers<Plugins>, PluginReducer>
  ): RjPluginBuilder<
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
  ): RjPluginBuilder<
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
  ): RjPluginBuilder<
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
  ): RjPluginBuilder<
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

  build(): MakeRjPlugin<
    Plugins,
    ExtractConfigReducer<PluginConfig>,
    ExtractConfigSelectors<PluginConfig>,
    ExtractConfigReducersMap<PluginConfig>,
    ExtractConfigComposedState<PluginConfig>
  >
}

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

function rjPluginBuilder(): RjPluginBuilder<{}, []> {
  throw new Error()
  // const config: RjBaseConfig = {}
  // const plugins: RjPlugin[] = []
  // return rjConfgiPluginBuilder(config, plugins)
}

const p1 = rjPlugin({
  reducer: (r) => () => 99,
  combineReducers: {
    gang: () => new Date(),
  },
})

const p2 = rjPlugin({
  reducer: (r) => () => ['X'],
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
  // .composeReducer((state) => {
  //   return 23
  // })
  .combineReducers({
    albi: () => ({ name: 'Albi' }),
  })
  // xyz.combineReducers
  .selectors((se) => ({
    draghi: (state) => state.fumello.blink(),
    bu: (state) => {
      state.root.getFullYear()
    },
    xx23: (state) => state.gang.getMinutes(),
  }))
  .build()

// declare function babu<C extends RjBaseConfig>(c: C): RjPluginBuilder<C>

// let c = babu2().plugin()

// let y = babu({
//   // reducer: r => (state: number[] | undefined, action) => [22]
//   // reducer: ()
// }).plugin()

// let z = rjPlugin({
//   reducer: (r) => (state: number | undefined, action) => 22,
// })

const { reducer } = rj()
  .plugins(xyz)
  .selectors((se) => ({
    draghi2: (state) => se.draghi(state),
    // bu: (state) => state.root.getHours(),
    // xx23: (state) => state.gang.getMinutes(),
  }))
  .computed({
    dho: 'draghi2',
  })
  .effect({
    effectCaller: 'configured',
    effect: () => Promise.resolve(99),
  })
// .effect(() => Promise.resolve(23))

const state = reducer(undefined, { type: 'X' })
state.root
// state.root.
// state.albi.state.gang.getFullYear()

// // state.
// // state.root.sort()
// // let x : RjPluginBuilder
