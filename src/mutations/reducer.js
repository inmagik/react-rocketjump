import blamer from 'rocketjump-core/blamer.macro'
import { SUCCESS, INIT, RUN, FAILURE } from '../actionTypes'
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
        blamer(
          '[rj-config-error] @mutations',
          `[react-rocketjump] @mutations you provide a non existing ` +
            `action creator [${mutation.updater}] as updater for mutation [${name}].`
        )
      }
      if (mutation.optimistic === true) {
        update = (state, action) =>
          reducer(state, actionCreator(...action.payload.params))
      } else {
        update = (state, action) =>
          reducer(state, actionCreator(action.payload.data))
      }
    } else if (typeof mutation.updater === 'function') {
      if (mutation.optimistic === true) {
        update = (state, action) =>
          mutation.updater(state, ...action.payload.params)
      } else {
        update = (state, action) => mutation.updater(state, action.payload.data)
      }
    } else {
      blamer(
        '[rj-config-error] @mutations',
        '[react-rocketjump] @mutations you should provide at least ' +
          `an effect and an updater to mutation config [${name}].`
      )
    }

    let type
    if (mutation.optimistic === true) {
      type = `${MUTATION_PREFIX}/${name}/${RUN}`
    } else {
      type = `${MUTATION_PREFIX}/${name}/${SUCCESS}`
    }

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
    const pieces = (action.type ?? '').split('/')
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

const DefaultOptState = {
  snapshot: null,
  actions: [],
}
export function optimisticMutationsReducer(state = DefaultOptState, action) {
  if (state.snapshot) {
    return {
      ...state,
      actions: state.actions.concat({ committed: true, action }),
    }
  }
  return state
}

function handleOptRun(reducer, state, action) {
  console.log('Run Baby Run')
  const {
    optimisticMutations: { actions, snapshot },
  } = state
  const nextActions = actions.concat({
    committed: false,
    action,
  })
  const nextSnapshot = snapshot ?? state.root
  const nextState = reducer(state, action)
  return {
    ...nextState,
    optimisticMutations: {
      snapshot: nextSnapshot,
      actions: nextActions,
    },
  }
}

function applyActionsOnSnapshot(snapshot, actions, reducer) {
  const state = { root: snapshot }
  return actions.reduce((snap, action) => reducer(snap, action), state).root
}

function getFirstNonCommittedIndex(actions) {
  for (let i = 0; i < actions.length; i++) {
    if (!actions[i].committed) {
      return i
    }
  }
  return null
}

function handleOptSuccess(reducer, state, action) {
  console.log('Success Bay')
  const {
    optimisticMutations: { actions, snapshot },
  } = state

  // Commit action
  let nextActions = actions.map((a) => {
    if (a.action?.meta?.optimisticMutation === action.meta.optimisticMutation) {
      return {
        ...a,
        committed: true,
      }
    } else {
      return a
    }
  })

  const firstNonCommitIndex = getFirstNonCommittedIndex(nextActions)

  let nextSnapshot
  if (firstNonCommitIndex === null) {
    // All commited!
    nextSnapshot = null
    nextActions = []
  } else {
    // Save a new snapshot appling actions unitl first non committed
    nextSnapshot = applyActionsOnSnapshot(
      snapshot,
      nextActions.slice(0, firstNonCommitIndex).map((a) => a.action),
      reducer
    )
    // Take only action from first non committed
    nextActions = nextActions.slice(firstNonCommitIndex)
  }

  const nextState = reducer(state, action)
  return {
    ...nextState,
    optimisticMutations: {
      snapshot: nextSnapshot,
      actions: nextActions,
    },
  }
}

function handleOptFailure(reducer, state, action) {
  const {
    optimisticMutations: { actions, snapshot },
  } = state

  // Remove failied RUN
  let nextActions = actions.filter((a) => {
    return !(
      a.action?.meta?.optimisticMutation === action.meta.optimisticMutation &&
      a.action.type.endsWith(`/${RUN}`)
    )
  })
  console.log('~~~FILTER', [...nextActions])

  // append new actions
  nextActions.push({
    committed: true,
    action,
  })
  console.log('~~~FILTER w FAILURE', [...nextActions])

  // 0 - 1 - 1 - 0 - 1
  // FILTER:
  // 1 - 1 - 0 - 1
  // or
  // 0 - 1 - 1 - 1

  // Rollbck to state without opt failed actions
  const roolBackRootState = applyActionsOnSnapshot(
    snapshot,
    nextActions.map((a) => a.action),
    reducer
  )

  const firstNonCommitIndex = getFirstNonCommittedIndex(nextActions)
  console.log('xxx', firstNonCommitIndex)
  let nextSnapshot
  if (firstNonCommitIndex === null) {
    console.log('ALL COMMITED!')
    // All committed!
    nextSnapshot = null
    nextActions = []
  } else {
    // 0 - 1
    // or
    // 0 - 1 - 1 - 1
    nextActions = nextActions.slice(firstNonCommitIndex)

    if (nextActions.length === 0) {
      // State reconcillied
      nextSnapshot = null
    } else if (firstNonCommitIndex === 0) {
      // No need to change old snap
      nextSnapshot = snapshot
    } else {
      // 0 - 1 - 1 - 1
      nextSnapshot = applyActionsOnSnapshot(
        snapshot,
        nextActions.slice(0, firstNonCommitIndex).map((a) => a.action),
        reducer
      )
    }
  }

  const nextState = reducer(state, action)
  return {
    ...nextState,
    root: roolBackRootState,
    optimisticMutations: {
      snapshot: nextSnapshot,
      actions: nextActions,
    },
  }
}

export function optimisticMutationsHor(reducer, mutations) {
  return (state, action) => {
    if (Number.isInteger(action?.meta?.optimisticMutation)) {
      // OPT ACTIONS

      // Split into mutations pieces
      const pieces = (action.type ?? '').split('/')
      if (pieces.length === 3 && pieces[0] === MUTATION_PREFIX) {
        const decoupleType = pieces[2]
        if (decoupleType === RUN) {
          return handleOptRun(reducer, state, action)
        }
        if (decoupleType === FAILURE) {
          return handleOptFailure(reducer, state, action)
        }
        if (decoupleType === SUCCESS) {
          return handleOptSuccess(reducer, state, action)
        }
      }
    }

    return reducer(state, action)
  }
}
