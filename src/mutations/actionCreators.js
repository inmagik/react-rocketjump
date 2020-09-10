import { makeLibraryAction } from 'rocketjump-core'
import { RUN } from '../actionTypes'
import { MUTATION_PREFIX } from './actionTypes'

let mutationIDCounter = 0

// Make the action creater that trigger a mutation side effects
function makeActionCreator(name, mutation) {
  const isOptimistic = typeof mutation.optimisticResult === 'function'
  // Has auto commit when only optimisticUpdater is provided
  const hasAutoCommit =
    isOptimistic && mutation.optimisticUpdater && !mutation.updater

  const actionCreator = (...params) => {
    const meta = {
      params,
    }
    if (isOptimistic) {
      meta.mutationID = ++mutationIDCounter
      if (hasAutoCommit) {
        meta.mutationAutoCommit = true
      }
    }
    return makeLibraryAction(
      `${MUTATION_PREFIX}/${name}/${RUN}`,
      ...params
    ).withMeta(meta)
  }
  return actionCreator
}

// Add specials rj mutations action creators to base rj action creators
export function enhanceActionCreators(mutations, actionCreators) {
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
