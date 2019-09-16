import { SUCCESS, INIT } from '../actionTypes'
import { MUTATION_PREFIX } from './actionTypes'
import combineReducers from '../combineReducers'

// enhance the basic reducer \w updater of mutations to rj root reducer
export function enhanceReducer(mutations, reducer, actionCreators) {
  const handleMutationsReducers = Object.keys(mutations).reduce((all, name) => {
    const mutation = mutations[name]

    let update

    if (typeof mutation.updater === 'string') {
      const actionCreator = actionCreators[mutation.updater]
      if (typeof actionCreator !== 'function') {
        throw new Error(
          `[react-rocketjump] @mutations you provide a non existing ` +
            `action creator [${mutation.updater}] as updater for mutation [${name}].`
        )
      }
      update = (state, action) =>
        reducer(state, actionCreator(action.payload.data))
    } else if (typeof mutation.updater === 'function') {
      update = (state, action) => mutation.updater(state, action.payload.data)
    } else {
      throw new Error(
        '[react-rocketjump] @mutations you should provide at least ' +
          `an effect and an updater to mutation config [${name}].`
      )
    }

    const type = `${MUTATION_PREFIX}/${name}/${SUCCESS}`
    return {
      ...all,
      [type]: update,
    }
  }, {})

  return (prevState, action) => {
    if (handleMutationsReducers[action.type]) {
      return handleMutationsReducers[action.type](prevState, action)
    }
    return reducer(prevState, action)
  }
}

// Reducer for track the mutation state
function makeMutationReducer(mutation, name) {
  return (state, action) => {
    if (action.type === INIT) {
      return mutation.reducer(state, action)
    }
    const pieces = (action.type || '').split('/')
    if (pieces.length !== 3) {
      return state
    }
    if (pieces[0] === MUTATION_PREFIX && pieces[1] === name) {
      const decoupleType = pieces[2]
      return mutation.reducer(state, { ...action, type: decoupleType })
    }
    return state
  }
}

// Mutations reducer or null if no mutations has a reducer config option
export function makeMutationsReducer(mutations) {
  const mutationsReducers = Object.keys(mutations).reduce((all, name) => {
    const mutation = mutations[name]

    if (typeof mutation.reducer !== 'function') {
      return all
    }
    return {
      ...all,
      [name]: makeMutationReducer(mutation, name),
    }
  }, {})

  if (Object.keys(mutationsReducers).length === 0) {
    return null
  }

  return combineReducers(mutationsReducers)
}
