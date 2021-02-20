import {
  shouldRunDeps,
  getMetaFromDeps,
  getRunValuesFromDeps,
} from './deps/funcs'
import {
  ActionCreator,
  ActionCreators,
  DispatchFn,
  HackableEffectActionCreator,
  EffectAction,
  EffectCallbacks,
  ActionMeta,
  HackableEffectAction,
  GenericResultCallback,
  Action,
} from '../types'
import { isEffectAction } from './effectAction'

type MetaTransform = (meta: ActionMeta) => ActionMeta

type CurriedCallbacks = {
  onSuccess?: GenericResultCallback[]
  onFailure?: GenericResultCallback[]
}

function mergeCallbacks(
  curriedCallbacks: CurriedCallbacks,
  callbacks: EffectCallbacks
): EffectCallbacks {
  const mergedCallbacks = {} as EffectCallbacks
  if (curriedCallbacks.onSuccess) {
    const curriedOnSuccess = curriedCallbacks.onSuccess
    mergedCallbacks.onSuccess = (...args) => {
      curriedOnSuccess.concat(callbacks.onSuccess || []).forEach((cb) => {
        cb(...args)
      })
    }
  } else if (callbacks.onSuccess) {
    mergedCallbacks.onSuccess = callbacks.onSuccess
  }
  if (curriedCallbacks.onFailure) {
    const curriedOnFailure = curriedCallbacks.onFailure
    mergedCallbacks.onFailure = (...args) => {
      curriedOnFailure.concat(callbacks.onFailure || []).forEach((cb) => {
        cb(...args)
      })
    }
  } else if (callbacks.onFailure) {
    mergedCallbacks.onFailure = callbacks.onFailure
  }
  return mergedCallbacks
}

/**
 * Builder pattern implementation for action creators calls
 * Its only aim is to decouple the invocation and the definition of params needed by the invocation itself
 * It is also the only way to leverage the rocketjump capabilities with full power
 */
class Builder {
  private actionCreator: ActionCreator

  private dispatch: DispatchFn

  private callbacks: EffectCallbacks

  private metaTransforms: MetaTransform[]

  private curriedCallbacks: CurriedCallbacks

  private curriedArgs: any[]

  constructor(actionCreator: ActionCreator, dispatch: DispatchFn) {
    this.actionCreator = actionCreator
    this.dispatch = dispatch
    this.callbacks = {}
    this.metaTransforms = []
    // Curry my Builder
    this.curriedCallbacks = {}
    this.curriedArgs = []
  }

  withMeta(meta: ActionMeta | ((meta: ActionMeta) => ActionMeta)) {
    if (typeof meta === 'function') {
      this.metaTransforms.push(meta as MetaTransform)
    } else {
      this.metaTransforms.push((oldMeta) => ({
        ...oldMeta,
        ...meta,
      }))
    }
    return this
  }

  onSuccess(callback: GenericResultCallback) {
    this.callbacks.onSuccess = callback
    return this
  }

  onFailure(callback: GenericResultCallback) {
    this.callbacks.onFailure = callback
    return this
  }

  curry(...curryArgs: any[]) {
    const metaTransforms = [...this.metaTransforms]
    const callbacks = { ...this.callbacks }
    const curriedCallbacks = { ...this.curriedCallbacks }
    const nextArgs = this.curriedArgs.concat(curryArgs)

    const makeBuilder = (
      actionCreator: ActionCreator,
      dispatch: DispatchFn
    ) => {
      const builder = new Builder(actionCreator, dispatch)
      builder.metaTransforms = metaTransforms
      builder.callbacks = {}
      builder.curriedCallbacks = {
        onSuccess:
          curriedCallbacks.onSuccess || callbacks.onSuccess
            ? [...(curriedCallbacks.onSuccess || [])].concat(
                callbacks.onSuccess || []
              )
            : undefined,
        onFailure:
          curriedCallbacks.onFailure || callbacks.onFailure
            ? [...(curriedCallbacks.onFailure || [])].concat(
                callbacks.onFailure || []
              )
            : undefined,
      }
      builder.curriedArgs = nextArgs
      return builder
    }

    const frozenBobBuilder = makeBuilder(this.actionCreator, this.dispatch)
    const boundActionCreator = frozenBobBuilder.run.bind(frozenBobBuilder)

    return attachBuilder(
      boundActionCreator,
      this.actionCreator,
      this.dispatch,
      makeBuilder
    )
  }

  run(...argsWithDepsLocal: any[]) {
    const argsWithDeps = this.curriedArgs.concat(argsWithDepsLocal)
    // Deps can't be runned
    if (!shouldRunDeps(argsWithDeps)) {
      return
    }

    // Squash meta into values
    const args = getRunValuesFromDeps(argsWithDeps)
    let action = this.actionCreator(...args)

    if (isEffectAction(action)) {
      const callbacks = mergeCallbacks(this.curriedCallbacks, this.callbacks)
      action = action.extend({
        callbacks,
      })

      // Apply meta from deps
      const extraMetaFromDeps = getMetaFromDeps(
        argsWithDeps,
        null, // No prev args
        false // Not on "mount"
      )
      action = (action as HackableEffectAction).withMeta(extraMetaFromDeps)

      // Apply meta from Builder .withMeta().withMeta()
      action = this.metaTransforms.reduce((action, transform) => {
        return action.withMeta(transform)
      }, action as HackableEffectAction)

      // Remove *magic* stuff
      delete action.extend
      delete action.withMeta
    }
    this.dispatch(action)
    return action
  }

  asPromise(...argsLocal: any): Promise<any> {
    const args = this.curriedArgs.concat(argsLocal)
    const callbacks = mergeCallbacks(this.curriedCallbacks, this.callbacks)
    return new Promise((resolve, reject) => {
      let action = this.actionCreator(...args)
      if (isEffectAction(action)) {
        action = action.extend({
          callbacks: {
            onSuccess: (...args) => {
              if (callbacks.onSuccess) {
                callbacks.onSuccess(...args)
              }
              resolve(...args)
            },
            onFailure: (...args) => {
              if (callbacks.onFailure) {
                callbacks.onFailure(...args)
              }
              reject(...args)
            },
          },
        })
        action = this.metaTransforms.reduce((action, transform) => {
          return action.withMeta(transform)
        }, action as HackableEffectAction)
        delete action.extend
        delete action.withMeta
        this.dispatch(action)
      } else {
        this.dispatch(action)
        // NOTE: Non effect action has no sense to be called asPromise
        // undefined here is to let TS quiete
        resolve(undefined)
      }
    })
  }
}

/**
 * This function is used to attach a builder to an action creator
 * To attach a builder means to add some methods on the function object that reflect the builder class interface
 * in order to have a unique interface. This methods simply create a new builder and call the corresponding method
 * on the builder itself. This is necessary because directly attaching the builder logic to the action creator
 * would lead to some data being reused across advanced calls, and this is not intended to happen.
 *
 * The run method throws an exception just to give the user a nicer feedback on the error he/she would receive
 *  in case of bad invocation
 */

type BuilderMaker = (a: ActionCreator, d: DispatchFn) => Builder

interface BuilderContract {
  onSuccess(cb: GenericResultCallback): Builder

  onFailure(cb: GenericResultCallback): Builder

  withMeta(meta: ActionMeta | ((meta: ActionMeta) => ActionMeta)): Builder

  // TODO: Still has sense??????
  run(): never

  curry(...args: any): ActionCreatorWithBuilder

  asPromise(...args: any): Promise<any>
}

type MaybeActionCreator = (...params: unknown[]) => Action | undefined

type ActionCreatorWithBuilder = MaybeActionCreator & BuilderContract

function attachBuilder(
  boundActionCreator: MaybeActionCreator,
  actionCreator: ActionCreator,
  dispatch: DispatchFn,
  makeBuilder: BuilderMaker = (a, d) => new Builder(a, d)
): ActionCreatorWithBuilder {
  ;(boundActionCreator as ActionCreatorWithBuilder).onSuccess = (callback) => {
    return makeBuilder(actionCreator, dispatch).onSuccess(callback)
  }
  ;(boundActionCreator as ActionCreatorWithBuilder).onFailure = (callback) => {
    return makeBuilder(actionCreator, dispatch).onFailure(callback)
  }
  ;(boundActionCreator as ActionCreatorWithBuilder).withMeta = (meta) => {
    return makeBuilder(actionCreator, dispatch).withMeta(meta)
  }
  ;(boundActionCreator as ActionCreatorWithBuilder).curry = (...curryArgs) => {
    return makeBuilder(actionCreator, dispatch).curry(...curryArgs)
  }
  ;(boundActionCreator as ActionCreatorWithBuilder).run = () => {
    throw new Error(
      'In order to do a plain call without meta, onSuccess or onFailure, just invoke the action creator, use the run method only when you leverage the builder functionalities'
    )
  }
  ;(boundActionCreator as ActionCreatorWithBuilder).asPromise = (...args) => {
    return makeBuilder(actionCreator, dispatch).asPromise(...args)
  }
  return boundActionCreator as ActionCreatorWithBuilder
}

/**
 * Binds a single action creator to the dispatch dynamics, and returns a function able to dispatch
 *  the generated action when invoked
 *
 * An action creator provided by rocketjump will be dispatched in the context of rocketjump side effect model,
 *  while a standard plain action will be directly sent to the reducer
 *
 * Every action is attached a builder in order to allow for calling with more options
 *
 * By default, arguments passed directly to the function are sent in the `params` property of the action
 * If there is the need to attach some metadata or some callbacks to the action, the action must be dispatched
 *  using the builder. It is important to underline that the builder works only on rocketjump async actions
 *  (i.e. the predefined actions plus all the overrides obtained with the `actions` directive in configuration).
 *  If builder methods are invoked on plain actions, they'll simply have no effect.
 *
 * Hence, it is possible to dispatch an action in two ways, described by the following example (in which the action
 *  is called action)
 *
 * Basic call:
 * action(arg1, arg2, arg3, ...)
 *
 * Advanced call:
 * action
 *   .withMeta({ meta1: value1, meta2: value2 })
 *   .withMeta({ meta3 : value3 })
 *   .onSuccess(successHandler)
 *   .onFailure(failureHander)
 *   .run(arg1, arg2, arg3, ...)
 *
 * The basic call has no way to leverage `meta`, `onSuccess` or `onFailure` features provided by the library
 *
 * In the advanced call it is possible to call the three methods `withMeta`, `onSuccess` and `onFailure` in
 *  any order and even more than one time: the callbacks are overwritten, and meta transformation are stacked.
 *  It is mandatory that the last method of the call is the `run` method, which takes the
 *  arguments to be passed to the action creator. Apart from the `run` method, the advanced call must contain
 *  at least one other method among those documented here in order to be valid. In other words, the call
 *
 *  action.run(arg1, arg2, arg3)
 *
 *  is not valid in will raise an exception. It is in fact meaningless to dispatch an action in this way, since
 *  it would be semantically equivalent but more verbose with respect to the direct call action(arg1, arg2, arg3)
 *
 *  A note about meta transformations:
 *    the withMeta helper accepts either a plain object or a function. In case of function, that function will
 *    be invoked with the previous meta object as a parameter, and is expected to return the next meta object,
 *    which will overwrite the previous one. If instead it is given a plain object, its behaviour is equivalent
 *    of giving a function that spreads the object over the previous meta, and returns the result, such as
 *
 *    withMeta(obj) is equivalent to withMeta(oldMeta => ({ ...oldMeta, ...obj }))
 *
 */
function bindActionCreator(
  actionCreator: ActionCreator | HackableEffectActionCreator,
  dispatch: DispatchFn
): MaybeActionCreator {
  const out = (...argsWithDeps: any[]) => {
    // Deps can't be runned
    if (!shouldRunDeps(argsWithDeps)) {
      return
    }

    // Squash meta into values
    const args = getRunValuesFromDeps(argsWithDeps)
    let action = actionCreator(...args)

    if (isEffectAction(action)) {
      // Apply meta from deps
      const extraMetaFromDeps = getMetaFromDeps(
        argsWithDeps,
        null, // No prev args
        false // Not on "mount"
      )
      action = action.withMeta(extraMetaFromDeps)
      delete (action as EffectAction).extend
      delete (action as EffectAction).withMeta
    }
    dispatch(action)
    return action
  }

  return attachBuilder(out, actionCreator, dispatch)
}

// NOTE: Types are not quite right, cause for INFER all goodnes from
// actions creators we MIMIC action but with BuilderContract
// in reality we erase hack callbacks before sending to reducer ...
// and with Deps the callback can not be called ....
// But for now we are ok with this in future we try to improve this files
export type BoundActionCreatorsWithBuilder<A extends ActionCreators> = {
  [k in keyof A]: A[k] & BuilderContract
}

/**
 * This function is used to bind action creators to the dispatch dynamics
 * The user will be returned a function that, when invoked, will care of dispatching
 *  the corresponding action
 *
 * Both plain actions and rocketjump actions can be bound in this way
 */
function bindActionCreators<A extends ActionCreators>(
  actionCreators: A,
  dispatch: DispatchFn
): BoundActionCreatorsWithBuilder<A>

function bindActionCreators(
  actionCreators: ActionCreators,
  dispatch: DispatchFn
): ActionCreators {
  const boundActionCreators = {} as ActionCreators
  for (const key in actionCreators) {
    const actionCreator = actionCreators[key]
    boundActionCreators[key] = bindActionCreator(
      actionCreator,
      dispatch
    ) as ActionCreator
  }
  return boundActionCreators
}

export default bindActionCreators
