/***
 *        W E L C O M E
 *             2
 *
 *  |   |   *~~~   |      |
 *  |   |   |      |      |
 *  *~~~*   *~~~   |      |
 *  |   |   |      |      |
 *  |   |   *~~~   *~~~   *~~~
 *
 ***/
import { Observable } from 'rxjs'
import {
  CANCEL,
  CLEAN,
  RUN,
  UPDATE_DATA,
  FAILURE,
  INIT,
  PENDING,
  SUCCESS,
} from './actions/actionTypes'
import { RJ_CONFIGURED_EFFECT_CALLER } from './internals'
import {
  TAKE_EFFECT_EVERY,
  TAKE_EFFECT_EXHAUST,
  TAKE_EFFECT_CONCAT_LATEST,
  TAKE_EFFECT_GROUP_BY,
  TAKE_EFFECT_GROUP_BY_CONCAT_LATEST,
  TAKE_EFFECT_GROUP_BY_EXHAUST,
  TAKE_EFFECT_LATEST,
} from './effect/takeEffects'

// RJ STATE
export interface RjStateRootShape<S = any> {
  pending: boolean
  error: any
  data: S
}
export interface RjStateShape<T = RjStateRootShape> {
  root: T
}

export interface RjStateShapeWithMutations<M = any> {
  root: any
  mutations: M
}

// RJ REDUCERS ACTIONS

// A Generic action
export interface Action<T extends string = string> {
  readonly type: T
  [extraProps: string]: any
}

export interface SuccessAction extends Action<typeof SUCCESS> {
  readonly payload: {
    params: any[]
    data: any
  }
  readonly meta?: any
}

export interface FailureAction extends Action<typeof FAILURE> {
  readonly payload: any
  readonly meta?: any
}

export type ActionMeta = Record<string, any>

interface RunnerAction<T extends string = string, M = ActionMeta>
  extends Action<T> {
  readonly payload: {
    params: any[]
  }
  readonly meta: M
}

// TODO: Temp solution cause in all code we use CANCEL, CLEAN refs only by 'type'
interface RelaxRunnerAction<T extends string = string, M = ActionMeta>
  extends Action<T> {
  readonly payload?: {
    params: any[]
  }
  readonly meta?: M
}

// TODO: For now we type check any Action with { type: string } shape
// in the future we MUST switch to handle only a subset of intersection
// .... And handle the merge in the rj recursion secnario
export type AllActions =
  | Action<typeof INIT>
  | SuccessAction
  | RunnerAction<typeof RUN>
  | RelaxRunnerAction<typeof CLEAN>
  | RelaxRunnerAction<typeof CANCEL>
  | Action<typeof PENDING>
  | SuccessAction
  | FailureAction
  | Action<typeof UPDATE_DATA>
  // TODO: Remove generic shape in the future
  | Action

// The Reducer
export interface Reducer<T = any, A extends Action = Action> {
  (state: T | undefined, action: A): T
}

export type ReducersMap<S = any> = {
  [k in keyof S]: Reducer<S[k]>
}

// Reducer ++
export type ReducerEnhancer<
  InputReducer extends Reducer = Reducer,
  OutputReducer extends Reducer = Reducer
> = (reducer: InputReducer) => OutputReducer

// The Selector
export type Selector<S = any, V = any> = (state: S) => V

// A Generic selectors bag
export type Selectors<S = any> = {
  [k: string]: Selector<S>
}

// Selectors starting P01nT
export interface RjStartSelectors extends Selectors {
  getRoot: <S>(state: RjStateShape<S>) => S
  getMutations: <M>(sate: RjStateShapeWithMutations<M>) => M
}

// The Rj Base Selectors Bag
export type RjBaseSelectors = {
  getRoot: <S = any>(state: RjStateShape<S>) => S
  getMutations: <M = any>(sate: RjStateShapeWithMutations<M>) => M
  getData: (state: RjStateShape) => any
  isPending: (state: RjStateShape) => boolean
  isLoading: (state: RjStateShape) => boolean
  getError: (state: RjStateShape) => any
}

// Selector ++
export type SelectorsEnhancer<
  InputSelectors extends RjBaseSelectors = RjBaseSelectors,
  OutputSelectors extends Selectors = Selectors
> = (selectors: InputSelectors) => OutputSelectors

export interface ComposableReducer<T = any, O = any> {
  (state: T, action: Action): O
}

// Action creators
export type GenericResultCallback<S = any> = (result: S) => void

export interface RjSucessAction extends SuccessAction {
  successCallback: GenericResultCallback
}

export interface RjFailureAction extends FailureAction {
  failureCallback: GenericResultCallback
}

export interface EffectCallbacks {
  onSuccess?: GenericResultCallback
  onFailure?: GenericResultCallback
}

export interface EffectAction<T extends string = string, M = ActionMeta>
  extends RunnerAction<T, M> {
  readonly callbacks: EffectCallbacks
}

export interface HackableEffectAction<T extends string = string, M = ActionMeta>
  extends EffectAction<T, M> {
  extend(
    this: HackableEffectAction<T>,
    extensions: {
      meta?: M
      callbacks?: EffectCallbacks
    }
  ): HackableEffectAction<T>
  withMeta(
    this: HackableEffectAction<T>,
    meta: ActionMeta | ((meta: ActionMeta) => ActionMeta)
  ): HackableEffectAction<T>
}

export type MutationMetaAction = ActionMeta & {
  params: any[]
  mutationID?: number
  mutationAutoCommit?: boolean
}

export interface MutationAction<T extends string = string>
  extends HackableEffectAction<T> {
  readonly meta: MutationMetaAction
}

export type DispatchFn = (action: Action | EffectAction) => void

export interface HookEffectAction extends EffectAction {
  __rjEffectRef?: {
    current?: {
      effectCaller: EffectCallerFn
    }
  }
}

// Action creator
export type ActionCreator = (...params: any[]) => Action

// Effect action creator
export type HackableEffectActionCreator = (
  ...params: unknown[]
) => HackableEffectAction

export type MutationActionCreator = (...params: unknown[]) => MutationAction

export type EffectActionCreator = (...params: unknown[]) => EffectAction

// Action creators bag
export type ActionCreators = {
  [k: string]: ActionCreator
}

export type MutationActionCreators = {
  [k: string]: MutationActionCreator
}

// The Rj Base Action Creators Bag
export type RjBaseActionCreators = {
  /**
   * Run your RokcetJump `effect` according to `takeEffect`,
   * update your state according to `reducer` configuration.
   */
  run: (...params: unknown[]) => HackableEffectAction<typeof RUN>
  /**
   * Stop your ongoing `effect` and clean your state according to
   * `reducer` configuration.
   */
  clean: (...params: unknown[]) => HackableEffectAction<typeof CLEAN>
  /**
   * Stop your ongoing `effect`.
   */
  cancel: (...params: unknown[]) => HackableEffectAction<typeof CANCEL>
  /**
   * Update your state `data` according to your `reducer` configuration.
   */
  updateData: <S>(data: S) => { type: typeof UPDATE_DATA; payload: S }
}

// Action Crestors ++
export type ActionCreatorsEnhancer<
  InputActionCreators extends RjBaseActionCreators = RjBaseActionCreators,
  OutputActionCreators extends ActionCreators = ActionCreators
> = (selectors: InputActionCreators) => OutputActionCreators

// Computed
export type Computed<RjSelectors = any, S = any> = {
  [k: string]: (string & keyof RjSelectors) | Selector<S>
}

// Effect function a function that return a Promimes or a funct... recursion *.*
export type EffectFn = (
  ...params: any[]
) => Promise<any> | Observable<any> | EffectFn

export type RjConfguredCaller = typeof RJ_CONFIGURED_EFFECT_CALLER

export type EffectCallerFn = (
  effect: EffectFn,
  ...params: any[]
) => Promise<any> | Observable<any> | EffectFn

export type RjEffectCaller = EffectCallerFn | RjConfguredCaller

export type GetEffectCallerFn = (action: EffectAction) => EffectCallerFn

type GroupByTakeEffect = [
  typeof TAKE_EFFECT_GROUP_BY,
  (actions: EffectAction) => any
]

type GroupByExhaustTakeEffect = [
  typeof TAKE_EFFECT_GROUP_BY_EXHAUST,
  (actions: EffectAction) => any
]

type GroupByConcatLatestTakeEffect = [
  typeof TAKE_EFFECT_GROUP_BY_CONCAT_LATEST,
  (actions: EffectAction) => any
]

export interface TakeEffectBag {
  effect: EffectFn
  getEffectCaller: GetEffectCallerFn
  prefix: string
}

export interface StateObservable<S = any> extends Observable<S> {
  value: S
}

export type TakeEffectHanlder = (
  actionsObservable: Observable<EffectAction>,
  stateObservable: StateObservable,
  effectBag: TakeEffectBag,
  ...extraArgs: any[]
) => Observable<Action>

export type RjEffectPipeliner = (
  actionsObservable: Observable<EffectAction>,
  stateObservable: StateObservable
) => Observable<EffectAction>

export type TakeEffects =
  | typeof TAKE_EFFECT_LATEST
  | typeof TAKE_EFFECT_EVERY
  | typeof TAKE_EFFECT_EXHAUST
  | typeof TAKE_EFFECT_CONCAT_LATEST
  | GroupByTakeEffect
  | GroupByExhaustTakeEffect
  | GroupByConcatLatestTakeEffect
  | TakeEffectHanlder

export interface CreateEffectConfig {
  effect: EffectFn
  takeEffect: TakeEffects
  effectCallers: RjEffectCaller[]
}

export type MakeRjObservable = (
  actionObservable: Observable<HookEffectAction>,
  stateObservable: StateObservable
) => Observable<Action | RjSucessAction | RjFailureAction>

/**
 * Rj Side Effect configurations
 */
export interface RjSideEffectConfig {
  /**
   * RocketJump config take effect a string that describe how to handle your side effect
   * some takeEffect need an extra groupBy params in theese case you have to pass:
   * `[takeEffect, (action: Action) => any]`
   * the second argument the groupBy function is used to group by your side effect.
   *
   * - `'latest'` Take latest effect, cancel previous effect
   * - `['groupBy', groupByFn]` Take latest effect but group by
   * - `'every'` Take every effect
   * - `'exhaust'` Take an effect, ignore effect until last effect complete.
   * - `['groupByExhaust', groupByFn]` Take exhaust effect but group by
   * - `concatLatest` Take an effect, if another effect arrive enqueue the latest
   * - `['groupByConcatLatest', groupByFn]` Take concat latest effect but group by
   */
  readonly takeEffect?: TakeEffects

  /**
   * Add a way to call given effect
   * You can use it to hook into generic effect.
   *
   * ```js
   * (effectFn, ...args) => effectFn(...args).then()
   * ```
   */
  readonly effectCaller?: RjEffectCaller

  readonly effectPipeline?: RjEffectPipeliner

  readonly addSideEffect?: TakeEffectHanlder
}

/**
 * The base rj interface to extends rj capabilities
 * both rjPlugin() and how loved rj() can rely on this
 */
export interface RjBaseConfig<
  InputReducer extends Reducer = Reducer,
  OutputReducer extends Reducer | undefined = Reducer,
  InputSelectors extends RjBaseSelectors = RjBaseSelectors,
  OutputSelectors extends Selectors = Selectors,
  ReducersMapCombine extends ReducersMap = ReducersMap,
  ComposedReducer extends ComposableReducer = ComposableReducer,
  InputActionCreators extends RjBaseActionCreators = RjBaseActionCreators,
  OutputActionCreators extends ActionCreators = ActionCreators
> extends RjSideEffectConfig {
  /**
   * Enhance the RocketJump root reducer.
   *
   * Expect a function called with current root reducer that return a new root
   * reducer, used as new root reducer.
   *
   * ```js
   * currentReducer => nextReducer
   * ```
   */
  readonly reducer?: OutputReducer extends Reducer
    ? ReducerEnhancer<InputReducer, OutputReducer>
    : undefined
  /**
   * Compose to RocketJump root reducer.
   *
   * Compose given root reducer with current root reducer.
   */
  readonly composeReducer?: ComposedReducer
  /**
   * Enhance the RocketJump selectors.
   *
   * Expect a function called with current selectors bag that return
   * new selectors bag, the result selector bag will merge with current.
   *
   * ```js
   * currentSelectors => ({
   *   myNewSelectors: state => selectState(state),
   * })
   * ```
   */
  readonly selectors?: SelectorsEnhancer<InputSelectors, OutputSelectors>
  /**
   * Add custom reducers to RocketJump reducer.
   *
   * Expect a map of reducers used as input for combineReducers
   * to create final RocketJump reducer.
   *
   * ```js
   * {
   *   customA: customReducerA,
   *   customB: customReducerB,
   * }
   * ```
   *
   */
  readonly combineReducers?: ReducersMapCombine
  /**
   * Enhance the RocketJump action creators.
   *
   * Expect a function called with current action creators that return
   * new action creators, the result action creators will merge with current.
   *
   * ```js
   * currentActionCreators => ({
   *   myNewActionCreator: () => ({ type: 'CUSTOM_TYPE' })
   * })
   * ```
   */
  readonly actions?: ActionCreatorsEnhancer<
    InputActionCreators,
    OutputActionCreators
  >
}

// The rj object merged around
export interface RjMergeableObject<
  OutputReducer extends Reducer = Reducer,
  OutputSelectors extends RjBaseSelectors = RjBaseSelectors,
  ReducersMapCombine extends ReducersMap = ReducersMap,
  OutputActionCreators extends RjBaseActionCreators = RjBaseActionCreators
> {
  /**
   * Current root reducer in recursion
   */
  readonly reducer: OutputReducer
  /**
   * Current make selectors (a function that returns a selectors bag) in recursion
   */
  readonly makeSelectors: (selectors: RjStartSelectors) => OutputSelectors
  /**
   * Current map of reducers in recursion used to finally create the combined reducer
   */
  readonly combineReducers: ReducersMapCombine
  /**
   * Current actions creators bag in recursion
   */
  readonly actionCreators: OutputActionCreators
  /**
   * Current take effect in recursion
   */
  readonly takeEffect: TakeEffects

  /**
   * Add a way to call given effect
   */
  readonly effectCallers: RjEffectCaller[]

  readonly effectPipelines: RjEffectPipeliner[]

  readonly addSideEffects: TakeEffectHanlder[]
}

// The rj plugin result
export type RjPlugin<
  OutputReducer extends Reducer = Reducer,
  OutputSelectors extends Selectors = Selectors,
  OutputReducersMap extends ReducersMap = ReducersMap,
  OutputActionCreators extends ActionCreators = ActionCreators
> = (
  mergeObj: RjMergeableObject
) => RjMergeableObject<
  Reducer<ReturnType<OutputReducer>>,
  RjBaseSelectors & OutputSelectors,
  OutputReducersMap,
  RjBaseActionCreators & OutputActionCreators
>

type MutationUpdater<S = any> = (state: S, result: any) => S

export type MutationReducer<
  S = any,
  A extends MutationAction = MutationAction
> = Reducer<S, A>

// Mutation config
export interface Mutation<
  R extends MutationReducer = MutationReducer,
  S = any,
  A = any
> {
  /**
   * The mutation effect
   */
  readonly effect: EffectFn
  /**
   * The updater function used to update your root state in
   * response to mutation effect SUCCESS.
   *
   */
  readonly updater?: MutationUpdater<S> | (string & keyof A)
  /**
   * The optional mutation reducer used to handle loading state or other meta
   * mutation info.
   * Will be available under state.mutations.[name] key
   */
  readonly reducer?: R

  readonly optimisticResult?: (...params: any[]) => any

  readonly optimisticUpdater?: MutationUpdater<S> | (string & keyof A)

  readonly takeEffect?: TakeEffects

  readonly effectCaller?: RjEffectCaller | boolean
}

// Bag of mutations
export interface Mutations<
  S = any,
  R extends MutationReducer = MutationReducer,
  A = any
> {
  [k: string]: Mutation<R, S, A>
}

export interface RjNameConfig {
  /**
   * Display name of RocketJump Object used in logger.
   */
  readonly name?: string
}

export interface RjRunnableEffectConfig {
  /**
   * Define your Rocketjump async Effect.
   *
   * Expect a function that return a Promise, an Observable, or function
   * that return a Promise, an Observable recursively... Cause the
   * effectCaller option can change the order of effect.
   */
  readonly effect: EffectFn
}

export interface RjFinalizeConfig<
  ConfigComputed extends Computed = Computed,
  ConfigMutations extends Mutations = Mutations
> extends RjRunnableEffectConfig,
    RjNameConfig {
  computed?: ConfigComputed
  /**
   * RJ Most Loved MUTATIONS
   * An object name indexed of your mutations configurations
   */
  mutations?: ConfigMutations
}

// The main rj config rj(~CONFIG~)
export interface RjConfig<
  InputReducer extends Reducer = Reducer,
  OutputReducer extends Reducer | undefined = Reducer,
  InputSelectors extends RjBaseSelectors = RjBaseSelectors,
  OutputSelectors extends Selectors = Selectors,
  OutputReducersMap extends ReducersMap = ReducersMap,
  ComposedReducer extends ComposableReducer = ComposableReducer,
  InputActionCreators extends RjBaseActionCreators = RjBaseActionCreators,
  OutputActionCreators extends ActionCreators = ActionCreators,
  ConfigComputed extends Computed = Computed,
  ConfigMutations extends Mutations = Mutations
> extends RjBaseConfig<
      InputReducer,
      OutputReducer,
      InputSelectors,
      OutputSelectors,
      OutputReducersMap,
      ComposedReducer,
      InputActionCreators,
      OutputActionCreators
    >,
    RjFinalizeConfig<ConfigComputed, ConfigMutations> {}

type ComputeRjState<S extends Selectors, C extends Computed<S>, State = any> = (
  state: State,
  selectors: S
) => {
  [k in keyof C]: C[k] extends string
    ? S[C[k]] extends Selector<any, infer U>
      ? U
      : any
    : C[k] extends Selector<any, infer U>
    ? U
    : never
}

// NOTE: A lot of time for final = any for this shit cause the
// RjObject type used in the wild for last overload is not related in fucking
// strictFunctionTypes: true
type ComputeStateFn<S = any, I = any, SE extends Selectors = any> = (
  state: I,
  selectors: SE
) => S

// The final rj object
export interface RjObject<
  OutputReducer extends Reducer = Reducer,
  OutputSelectors extends RjBaseSelectors = RjBaseSelectors,
  ConfigComputeState extends ComputeStateFn<
    any,
    any,
    OutputSelectors
  > = ComputeStateFn,
  OutputActionCreators extends RjBaseActionCreators = RjBaseActionCreators
> {
  /**
   * RJ Name
   */
  name?: string
  /**
   * The runnable rj object reducer
   */
  reducer: OutputReducer
  makeObservable: MakeRjObservable
  makeSelectors: () => OutputSelectors
  actionCreators: OutputActionCreators
  computeState: ConfigComputeState
  pipeActionStream: RjEffectPipeliner
}

export type RjObjectWithComputed<
  OutputReducer extends Reducer = Reducer,
  OutputSelectors extends RjBaseSelectors = RjBaseSelectors,
  ConfigComputed extends Computed = Computed,
  OutputActionCreators extends RjBaseActionCreators = RjBaseActionCreators
> = RjObject<
  OutputReducer,
  OutputSelectors,
  {} extends ConfigComputed
    ? ComputeStateFn<
        OutputReducer extends Reducer<infer State>
          ? State extends RjStateShape<infer R>
            ? R
            : any
          : any,
        OutputReducer extends Reducer<infer State> ? State : any,
        OutputSelectors
      >
    : ComputeRjState<
        OutputSelectors,
        ConfigComputed,
        OutputReducer extends Reducer<infer State> ? State : any
      >,
  OutputActionCreators
>

// SATAN TRICK TO CREATE An intersection (A & B & C) from union (A | B | C)
// https://github.com/microsoft/TypeScript/pull/39094#issuecomment-650154755
type Flatten<A, S = unknown> = A extends [infer H]
  ? S & H
  : A extends [infer H, infer T]
  ? [Flatten<T, S & H>]
  : S

type UnNest<T, Fallback = unknown> = T extends any[]
  ? {
      [K in keyof T]: T[K] extends [infer TT]
        ? TT extends any[]
          ? UnNest<TT>
          : TT
        : T[K]
    }[number]
  : Fallback

type ToConsList<A extends readonly any[]> = [] extends A
  ? unknown
  : ((...a: A) => any) extends (t: infer T, ...ts: infer TS) => any
  ? [T, ToConsList<TS>]
  : never

export type ToIntersection<A extends readonly any[]> = UnNest<
  Flatten<ToConsList<A>>
>

// Take a list of plugins and get an intersection of all selectors
export type MergePluginsSelectors<Plugins extends RjPlugin[]> = ToIntersection<
  {
    [k in keyof Plugins]: Plugins[k] extends RjPlugin<any, infer U> ? U : never
  }
>

// Take a list of plugins and get an intersection of all action creators
export type MergePluginsActionCreators<
  Plugins extends RjPlugin[]
> = ToIntersection<
  {
    [k in keyof Plugins]: Plugins[k] extends RjPlugin<any, any, any, infer U>
      ? U
      : never
  }
>

export type IntersectPluginsCombineReducers<
  Plugins extends RjPlugin[]
> = ToIntersection<
  {
    [k in keyof Plugins]: Plugins[k] extends RjPlugin<any, any, infer U>
      ? U
      : never
  }
>

type CombinedReducersOrEmpty<R> = R extends ReducersMap
  ? R
  : ReducersMap<unknown>

// Extract combine reducers from plugins
export type MergePluginsCombineReducers<
  Plugins extends RjPlugin[]
> = CombinedReducersOrEmpty<IntersectPluginsCombineReducers<Plugins>>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Last<T extends any[]> = T extends [...infer I, infer L] ? L : never

type LastPluginsReducer<Plugins extends RjPlugin[]> = Last<
  {
    [k in keyof Plugins]: Plugins[k] extends RjPlugin<infer U, any> ? U : never
  }
>

type ReducerOrDefault<T> = T extends Reducer ? T : Reducer<RjStateRootShape>

// Extract last valid reducer from plugins or default reducer
export type MergePluginsReducers<Plugins extends RjPlugin[]> = ReducerOrDefault<
  LastPluginsReducer<Plugins>
>

export type MakeCombinedState<ReducersToCombine extends ReducersMap> = {
  [k in keyof ReducersToCombine]: ReducersToCombine[k] extends Reducer<infer U>
    ? U
    : never
}

export type CombineReducers<ReducersToCombine extends ReducersMap> = Reducer<
  MakeCombinedState<ReducersToCombine>
>

export type ExtraPluginsAndReducerState<
  Plugins extends RjPlugin[],
  ConfigReducer extends Reducer | undefined
> = MergePluginsReducers<Plugins> extends Reducer<infer PluginState>
  ? undefined extends ConfigReducer
    ? PluginState
    : ConfigReducer extends Reducer<infer State>
    ? unknown extends State
      ? any
      : State
    : any
  : never

export type AllRjCurriedState<
  Plugins extends RjPlugin[],
  ReducersMapCombine extends ReducersMap,
  ConfigReducer extends Reducer | undefined
> = MakeCombinedState<
  MergeReducersMap<MergePluginsCombineReducers<Plugins>, ReducersMapCombine>
> & {
  root: ExtraPluginsAndReducerState<Plugins, ConfigReducer>
}

type ExtractCombinedState<S> = S extends ReducersMap<infer U> ? U : unknown

export type MergeReducersMap<
  A extends ReducersMap,
  B extends ReducersMap
> = unknown extends ExtractCombinedState<A>
  ? unknown extends ExtractCombinedState<B>
    ? ReducersMap<unknown>
    : B
  : unknown extends ExtractCombinedState<B>
  ? A
  : A & B

export type MakeFinalRjPluginReducer<
  PluginReducer extends Reducer | undefined,
  Plugins extends RjPlugin[]
> = PluginReducer extends Reducer<infer H>
  ? unknown extends H
    ? MergePluginsReducers<Plugins>
    : PluginReducer
  : never

// Pick only the mutations with reducer defined!
type ExtractMutationsReducersKeys<MyMutations extends Mutations> = {
  [K in keyof MyMutations]: MyMutations[K] extends Mutation<infer H>
    ? H extends MutationReducer
      ? K
      : never
    : never
}[keyof MyMutations]
type FiltersMutationsForReducer<MyMutions extends Mutations> = Pick<
  MyMutions,
  ExtractMutationsReducersKeys<MyMutions>
>

type ExtractMutationsReducersMap<MyMutations extends Mutations> = {
  [k in keyof MyMutations]: MyMutations[k] extends Mutation<infer H>
    ? H extends MutationReducer<infer S>
      ? // TODO: This a shit workaround ... Find a way to make all
        // reducers generics about Action ... But for now use this shit ...
        Reducer<S>
      : H extends Reducer
      ? H
      : never
    : never
}

type CombineMutationsReducerMerge<M extends Mutations> = {} extends M
  ? ReducersMap<{}>
  : {
      mutations: CombineReducers<ExtractMutationsReducersMap<M>>
    }

export type MakeMutationsReducersMap<
  MyMutations extends Mutations
> = CombineMutationsReducerMerge<FiltersMutationsForReducer<MyMutations>>

export type MakeFinalRjReducer<
  ConfigReducer extends Reducer | undefined,
  ReducersMapCombine extends ReducersMap,
  Plugins extends RjPlugin[],
  MyMutations extends Mutations
> = CombineReducers<
  MergeReducersMap<
    unknown extends Plugins
      ? ReducersMapCombine
      : MergeReducersMap<
          MergePluginsCombineReducers<Plugins>,
          ReducersMapCombine
        >,
    {
      root: ConfigReducer extends Reducer<infer H>
        ? unknown extends H
          ? MergePluginsReducers<Plugins>
          : ConfigReducer
        : never
    } & MakeMutationsReducersMap<MyMutations>
  >
>

type MergeMutationsActionCreatorsRaw<MyMutations> = {
  [k in keyof MyMutations]: MutationActionCreator
}

type ActionsBagOrNoop<A extends ActionCreators> = {} extends A ? {} : A

export type MergeMutationsActionCreators<MyMutations> = ActionsBagOrNoop<
  MergeMutationsActionCreatorsRaw<MyMutations>
>

// Make the rj({ ** CONFIG ** }) type form rj signature
// infer all types merged shit and so on
export type MakeRjConfig<
  Plugins extends RjPlugin[],
  ConfigReducer extends Reducer | undefined,
  ConfigSelectors extends Selectors,
  ReducersMapCombine extends ReducersMap,
  ComposedState,
  ConfigActionCreators extends ActionCreators,
  ConfigComputed extends Computed,
  ConfigMutations extends Mutations
> = RjConfig<
  MergePluginsReducers<Plugins>,
  ConfigReducer,
  RjBaseSelectors & MergePluginsSelectors<Plugins>,
  ConfigSelectors,
  ReducersMapCombine,
  ComposableReducer<
    ExtraPluginsAndReducerState<Plugins, ConfigReducer>,
    ComposedState
  >,
  RjBaseActionCreators & MergePluginsActionCreators<Plugins>,
  ConfigActionCreators,
  ConfigComputed,
  ConfigMutations
>

export type MakeRjObject<
  Plugins extends RjPlugin[],
  ConfigReducer extends Reducer | undefined,
  ConfigSelectors extends Selectors,
  ReducersMapCombine extends ReducersMap,
  ComposedState,
  ConfigActionCreators extends ActionCreators,
  ConfigComputed extends Computed,
  ConfigMutations extends Mutations
> = RjObjectWithComputed<
  MakeFinalRjReducer<
    unknown extends ComposedState ? ConfigReducer : Reducer<ComposedState>,
    ReducersMapCombine,
    Plugins,
    ConfigMutations
  >,
  RjBaseSelectors &
    // NOTE: Fuck off strictFunctionTypes
    (unknown extends Plugins ? {} : MergePluginsSelectors<Plugins>) &
    ({} extends ConfigSelectors ? {} : ConfigSelectors),
  ConfigComputed,
  RjBaseActionCreators &
    MergePluginsActionCreators<Plugins> &
    ({} extends ConfigActionCreators ? {} : ConfigActionCreators) &
    ({} extends ConfigMutations
      ? {}
      : MergeMutationsActionCreators<ConfigMutations>)
>

export type MakeRjPluginConifg<
  Plugins extends RjPlugin[],
  PluginReducer extends Reducer | undefined,
  PluginSelectors extends Selectors,
  ReducersMapCombine extends ReducersMap,
  ComposedState,
  PluginActionCreators extends ActionCreators
> = RjBaseConfig<
  MergePluginsReducers<Plugins>,
  PluginReducer,
  RjBaseSelectors & MergePluginsSelectors<Plugins>,
  PluginSelectors,
  ReducersMapCombine,
  ComposableReducer<
    ExtraPluginsAndReducerState<Plugins, PluginReducer>,
    ComposedState
  >,
  RjBaseActionCreators & MergePluginsActionCreators<Plugins>,
  PluginActionCreators
>

export type MakeRjPlugin<
  Plugins extends RjPlugin[] = RjPlugin[],
  PluginReducer extends Reducer | undefined = undefined,
  PluginSelectors extends Selectors = Selectors,
  ReducersMapCombine extends ReducersMap = ReducersMap,
  ComposedState = unknown,
  PluginActionCreators extends ActionCreators = ActionCreators
> = RjPlugin<
  MakeFinalRjPluginReducer<
    unknown extends ComposedState ? PluginReducer : Reducer<ComposedState>,
    Plugins
  >,
  MergePluginsSelectors<Plugins> &
    ({} extends PluginSelectors ? {} : PluginSelectors),
  MergeReducersMap<MergePluginsCombineReducers<Plugins>, ReducersMapCombine>,
  MergePluginsActionCreators<Plugins> &
    ({} extends PluginActionCreators ? {} : PluginActionCreators)
>

// Builder Extract RjMergeableObject shit H3lp3rZzZ

export type ExtractMergeObjReducer<
  R extends RjMergeableObject
> = R extends RjMergeableObject<infer ConfigReducer> ? ConfigReducer : never

export type ExtractMergeObjReducersMap<
  R extends RjMergeableObject
> = R extends RjMergeableObject<any, any, infer ReducersMapCombine>
  ? ReducersMapCombine
  : never

export type ExtractMergeObjRootState<
  R extends RjMergeableObject
> = ExtractMergeObjReducer<R> extends Reducer<infer S> ? S : never

export type ExtractMergeObjState<
  R extends RjMergeableObject
> = MakeCombinedState<ExtractMergeObjReducersMap<R>> & {
  root: ExtractMergeObjRootState<R>
}

export type ExtractMergeObjStateWithMutations<
  R extends RjMergeableObject,
  M extends Mutations
> = MakeCombinedState<ExtractMergeObjReducersMap<R>> & {
  root: ExtractMergeObjRootState<R>
} & MakeCombinedState<MakeMutationsReducersMap<M>>

export type ExtractMergeObjSelectors<
  R extends RjMergeableObject
> = R extends RjMergeableObject<any, infer ConfigSelectors>
  ? ConfigSelectors
  : never

export type ExtracConfigActionsCreators<
  R extends RjMergeableObject
> = R extends RjMergeableObject<any, any, any, infer ActionCreators>
  ? ActionCreators
  : never

export type ExtractRjObjectActions<O extends RjObject> = O extends RjObject<
  any,
  any,
  any,
  infer H
>
  ? H
  : never

export type ExtractRjObjectComputedState<
  O extends RjObject
> = O extends RjObject<any, any, infer C>
  ? C extends ComputeStateFn<infer S>
    ? S
    : never
  : never

export type ExtractRjObjectState<O extends RjObject> = O extends RjObject<
  infer R
>
  ? R extends Reducer<infer S>
    ? S
    : never
  : never

export type ExtractRjObjectSelectors<O extends RjObject> = O extends RjObject<
  any,
  infer SE
>
  ? SE
  : never
