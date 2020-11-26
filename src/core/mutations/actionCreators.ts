import { makeEffectAction } from '../actions/effectAction'
import { RUN } from '../actions/actionTypes'
import { makeMutationType } from './actionTypes'
import {
  ActionCreators,
  MergeMutationsActionCreators,
  Mutation,
  MutationActionCreator,
  MutationMetaAction,
  Mutations,
} from '../types'

let mutationIDCounter = 0

// Make the action creater that trigger a mutation side effects
function makeActionCreator(
  name: string,
  mutation: Mutation
): MutationActionCreator {
  const isOptimistic = typeof mutation.optimisticResult === 'function'
  // Has auto commit when only optimisticUpdater is provided
  const hasAutoCommit =
    isOptimistic && mutation.optimisticUpdater && !mutation.updater

  const actionCreator: MutationActionCreator = (...params: any[]) => {
    const meta: MutationMetaAction = {
      params,
    }
    if (isOptimistic) {
      meta.mutationID = ++mutationIDCounter
      if (hasAutoCommit) {
        meta.mutationAutoCommit = true
      }
    }
    return makeEffectAction(makeMutationType(name, RUN), params, meta)
  }
  return actionCreator
}

// Add specials rj mutations action creators to base rj action creators
function mutationsActionCreators<A extends ActionCreators, M extends Mutations>(
  mutations: M,
  actionCreators: A
): A & MergeMutationsActionCreators<M>

function mutationsActionCreators(
  mutations: Mutations,
  actionCreators: ActionCreators
): ActionCreators {
  return Object.keys(mutations).reduce((enhancedActionCreators, name) => {
    const mutation = mutations[name]
    const actionCreator = makeActionCreator(name, mutation)
    if (process.env.NODE_ENV !== 'production' && actionCreators[name]) {
      console.warn(
        `[react-rocketjump] @mutations WARNING the mutation [${name}] ` +
          `override a pre existing action creator this can leading to ` +
          `unexpected behaviors.`
      )
    }
    return {
      ...enhancedActionCreators,
      [name]: actionCreator,
    }
  }, actionCreators)
}

export default mutationsActionCreators
