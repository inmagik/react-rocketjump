import createMakeRxObservable from './createMakeRxObservable'
import { makeLibraryAction } from './actionCreators'
import { RUN, SUCCESS, INIT } from './actionTypes'
import combineReducers from './combineReducers'

const MUTATION_PREFIX = `@RJ~MUTATION`

// Make the action creater that trigger a mutation side effects
function makeActionCreator(name, mutation) {
  const actionCreator = (...params) =>
    makeLibraryAction(`${MUTATION_PREFIX}/${name}/${RUN}`, ...params)

  // Muation has state only when reducer is specified on it
  const hasState = typeof mutation.reducer === 'function'
  // Attach a special property to get the original mutation name
  // and index the realted state
  Object.defineProperty(actionCreator, '__rjMutation', {
    value: { name, hasState },
  })
  return actionCreator
}

// Inject the special state() function on mutations action creators
export function injectMutationsStateInActions(actions, state) {
  const actionsKeys = Object.keys(actions)
  for (let i = 0; i < actionsKeys.length; i++) {
    const name = actionsKeys[i]
    const action = actions[name]
    if (action.__rjMutation && action.__rjMutation.hasState) {
      action.state = () => state[name]
    }
  }
  return actions
}

// Add specials rj mutations action creators to base rj action creators
function enhanceActionCreators(mutations, actionCreators) {
  return Object.keys(mutations).reduce((actionCreators, name) => {
    // TODO: Add DEV warn 4 overrid prev exist actions ....
    const mutation = mutations[name]
    const actionCreator = makeActionCreator(name, mutation)
    return {
      ...actionCreators,
      [name]: actionCreator,
    }
  }, actionCreators)
}

// enhance the basic reducer \w updater of mutations to rj root reducer
function enhanceReducer(mutations, reducer, actionCreators) {
  const handleMutationReducers = Object.keys(mutations).reduce((all, name) => {
    const mutation = mutations[name]

    let update

    if (typeof mutation.updater === 'string') {
      // TODO: Better checks ...
      const actionCreator = actionCreators[mutation.updater]
      update = (state, action) =>
        reducer(state, actionCreator(action.payload.data))
    } else {
      update = (state, action) => mutation.updater(state, action.payload.data)
    }

    const type = `${MUTATION_PREFIX}/${name}/${SUCCESS}`
    return {
      ...all,
      [type]: update,
    }
  }, {})

  return (prevState, action) => {
    if (handleMutationReducers[action.type]) {
      return handleMutationReducers[action.type](prevState, action)
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
    const pieces = action.type.split('/')
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

// Mutations reducer or null if no mutations has a reducer
function makeMutationsReducer(mutations) {
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

function enhanceMakeObservable(mutations, makeObservable) {
  const makeMutationsObsList = Object.keys(mutations).map(name => {
    const { effect, takeEffect } = mutations[name]
    const prefix = `${MUTATION_PREFIX}/${name}/`

    return createMakeRxObservable(
      {
        effect,
        takeEffect: takeEffect || 'every',
        effectPipeline: [],
      },
      prefix
    )
  })

  return (action$, ...params) => {
    let o$ = makeObservable(action$, ...params)
    o$ = makeMutationsObsList.reduce((o$, makeMutationObs) => {
      return makeMutationObs(o$, ...params)
    }, o$)
    return o$
  }
}

export function enhanceExportWithMutations(rjObject, mutations) {
  if (mutations === null) {
    return { ...rjObject, hasMutationsState: false }
  }

  const { makeRxObservable, actionCreators, reducer } = rjObject

  const enhancedReducer = enhanceReducer(mutations, reducer, actionCreators)
  const mutationsReducer = makeMutationsReducer(mutations)

  let hasMutationsState
  let withMutationsReducer
  if (mutationsReducer === null) {
    hasMutationsState = false
    withMutationsReducer = enhancedReducer
  } else {
    hasMutationsState = true
    withMutationsReducer = combineReducers({
      root: enhancedReducer,
      mutations: mutationsReducer,
    })
  }

  return {
    ...rjObject,
    hasMutationsState,
    reducer: withMutationsReducer,
    actionCreators: enhanceActionCreators(mutations, actionCreators),
    makeRxObservable: enhanceMakeObservable(mutations, makeRxObservable),
  }
}
