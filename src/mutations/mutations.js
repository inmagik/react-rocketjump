import createMakeRxObservable from '../createMakeRxObservable'
import { makeLibraryAction } from '../actionCreators'
import { RUN, SUCCESS, INIT } from '../actionTypes'
import combineReducers from '../combineReducers'

const MUTATION_PREFIX = `@MUTATION`

// Make the action creater that trigger a mutation side effects
function makeActionCreator(name, mutation) {
  const actionCreator = (...params) =>
    makeLibraryAction(`${MUTATION_PREFIX}/${name}/${RUN}`, ...params).withMeta({
      params,
    })

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
function makeInjectMutationsStateInActions(hasMutationsState) {
  // Nothing 2 DO
  if (!hasMutationsState) return
  // Inject!
  return (actions, state) => {
    const actionsKeys = Object.keys(actions)
    for (let i = 0; i < actionsKeys.length; i++) {
      const name = actionsKeys[i]
      const action = actions[name]
      if (action.__rjMutation) {
        if (action.__rjMutation.hasState) {
          action.state = () => state.mutations[name]
        } else if (process.env.NODE_ENV !== 'production') {
          // In dev only print warn if U try to access state of a mutation
          // without state this help monkeys cathing mis config errors quickly
          action.state = () => {
            console.warn(
              `[react-rocketjump] @mutations WARNING you try to access the ` +
                `state of mutation [${name}] with no state, please declaring a ` +
                `reducer in the [${name}] mutation config.`
            )
          }
        }
      }
    }
    return actions
  }
}

// Add specials rj mutations action creators to base rj action creators
function enhanceActionCreators(mutations, actionCreators) {
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

// enhance the basic reducer \w updater of mutations to rj root reducer
function enhanceReducer(mutations, reducer, actionCreators) {
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

    if (typeof effect !== 'function') {
      throw new Error(
        '[react-rocketjump] @mutations you should provide at least ' +
          `an effect and an updater to mutation config [${name}].`
      )
    }

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

function enancheComputeState(hasMutationsState, computeState) {
  if (!hasMutationsState) {
    return computeState
  }
  if (!computeState) {
    return state => state.root
  }
  return (state, selectors) => computeState(state.root, selectors)
}

export function enhanceMakeExportWithMutations(rjConfig, extendExport) {
  // Default no mutations
  let mutations = null
  if (extendExport.mutations) {
    // Continue the export
    mutations = extendExport.mutations
  }
  if (rjConfig.mutations) {
    // Merge given mutations \w prev mutations
    mutations = { ...mutations, ...rjConfig.mutations }
  }

  return {
    ...extendExport,
    mutations,
  }
}

export function enhanceFinalExportWithMutations(rjObject) {
  const { mutations, ...rjEnhancedObject } = rjObject
  if (mutations === null) {
    return rjEnhancedObject
  }

  const {
    makeRxObservable,
    actionCreators,
    reducer,
    computeState,
  } = rjEnhancedObject

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
    ...rjEnhancedObject,
    injectStateInActions: makeInjectMutationsStateInActions(hasMutationsState),
    computeState: enancheComputeState(hasMutationsState, computeState),
    reducer: withMutationsReducer,
    actionCreators: enhanceActionCreators(mutations, actionCreators),
    makeRxObservable: enhanceMakeObservable(mutations, makeRxObservable),
  }
}
