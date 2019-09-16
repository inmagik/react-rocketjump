import { RUN } from '../actionTypes'
import { makeLibraryAction } from '../actionCreators'
import { MUTATION_PREFIX } from './actionTypes'

// Make the action creater that trigger a mutation side effects
function makeActionCreator(name, mutation) {
  const actionCreator = (...params) =>
    makeLibraryAction(`${MUTATION_PREFIX}/${name}/${RUN}`, ...params).withMeta({
      params,
    })
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
